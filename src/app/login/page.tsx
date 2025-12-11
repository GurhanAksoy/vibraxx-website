"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<string | null>(null);

  // ============================================
  // CHECK COOKIE CONSENT ON MOUNT
  // ============================================
  useEffect(() => {
    const storedConsent = localStorage.getItem("vibraxx_cookie_consent");
    setCookieConsent(storedConsent);

    // Show modal if consent not given
    if (!storedConsent) {
      setShowCookieConsent(true);
    }
  }, []);

  // ============================================
  // SESSION CHECK - REDIRECT ONLY (NO DATA OPS)
  // ============================================
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        setIsCheckingSession(true);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("❌ Login: Session check error:", sessionError);
          setIsCheckingSession(false);
          return;
        }

        // ✅ IF SESSION EXISTS: JUST REDIRECT
        // ❌ NO createOrUpdateProfile
        // ❌ NO updateActiveSession
        // Callback page handles all data operations
        if (session?.user) {
          console.log("✅ Login: Existing session found, redirecting to homepage");
          router.replace("/");
          return;
        }

        setIsCheckingSession(false);
      } catch (err) {
        console.error("❌ Login: Unexpected error during session check:", err);
        setIsCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [router]);

  // ============================================
  // COOKIE CONSENT HANDLERS
  // ============================================
  const handleAcceptCookies = () => {
    localStorage.setItem("vibraxx_cookie_consent", "accepted");
    setCookieConsent("accepted");
    setShowCookieConsent(false);
  };

  const handleRejectCookies = () => {
    localStorage.setItem("vibraxx_cookie_consent", "rejected");
    setCookieConsent("rejected");
    setShowCookieConsent(false);
  };

  // ============================================
  // GOOGLE OAUTH LOGIN HANDLER
  // ============================================
  const handleGoogleLogin = async () => {
    // ✅ BLOCK OAUTH IF COOKIES NOT ACCEPTED
    if (cookieConsent !== "accepted") {
      setErrorMessage("⚠️ You must accept cookies to sign in with Google.");
      setShowCookieConsent(true);
      return;
    }

    // Reset error state
    setErrorMessage(null);

    // Start loading state (disable button)
    setIsLoading(true);

    try {
      // Determine redirect URL (ENV-aware for multi-environment support)
      const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        : `${window.location.origin}/auth/callback`;

      console.log("🔐 Login: Initiating Google OAuth...");
      console.log("📍 Redirect URL:", redirectUrl);

      // Trigger Google OAuth popup
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          // Request additional user data from Google
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      // Handle OAuth errors
      if (error) {
        console.error("❌ Login: OAuth error:", error);

        // Specific handling for popup blocker
        if (error.message?.toLowerCase().includes("popup")) {
          setErrorMessage(
            "⚠️ Popup blocked! Please allow popups for this site and try again."
          );
          alert(
            "Popup Blocked!\n\nPlease enable popups in your browser settings and try again."
          );
        } else {
          setErrorMessage(
            `Authentication failed: ${error.message || "Unknown error"}`
          );
        }

        // Re-enable button on error
        setIsLoading(false);
        return;
      }

      // Success: OAuth redirect will happen automatically
      // No need to setIsLoading(false) because user will be redirected
      console.log("✅ Login: OAuth redirect initiated");
    } catch (err: any) {
      console.error("❌ Login: Unexpected error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ============================================ */}
      {/* COOKIE CONSENT MODAL (GDPR COMPLIANCE) */}
      {/* ============================================ */}
      {showCookieConsent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-purple-500/30 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-white">Cookie Consent Required</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              VibraXX uses cookies to authenticate your account via Google OAuth. 
              These cookies are essential for login functionality and cannot be disabled 
              if you wish to use the platform.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              By accepting, you agree to our use of authentication cookies. 
              For more information, see our{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Privacy Policy
              </a>
              {" "}and{" "}
              <a
                href="/cookies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Cookie Policy
              </a>
              .
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleAcceptCookies}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#21F3F3] to-[#F321C1] rounded-xl font-bold text-black hover:scale-105 transition-transform"
              >
                Accept & Continue
              </button>
              <button
                onClick={handleRejectCookies}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-white transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MAIN LOGIN PAGE */}
      {/* ============================================ */}
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white px-4">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" 
               style={{ animationDelay: "700ms" }} />
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 flex flex-col items-center max-w-md w-full">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/images/vibraxx-logo.png"
              alt="VibraXX Logo"
              width={128}
              height={128}
              priority
              className="drop-shadow-2xl"
            />
          </div>

          {/* Welcome Text */}
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-center bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Welcome to VibraXX
          </h1>
          <p className="text-gray-400 text-center mb-8 max-w-sm">
            The ultimate live quiz competition platform. Test your knowledge and
            win prizes!
          </p>

          {/* Age Requirement Warning (Legal Compliance) */}
          <div className="mb-6 px-4 py-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg text-center">
            <p className="text-yellow-400 text-sm font-semibold flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              You must be 18 or older to use VibraXX
            </p>
          </div>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="mb-6 w-full px-4 py-3 bg-red-900/30 border border-red-600/50 rounded-lg">
              <p className="text-red-400 text-sm text-center">{errorMessage}</p>
            </div>
          )}

          {/* Cookie Consent Rejected Warning */}
          {cookieConsent === "rejected" && (
            <div className="mb-6 w-full px-4 py-3 bg-orange-900/30 border border-orange-600/50 rounded-lg">
              <p className="text-orange-400 text-sm text-center">
                You must accept cookies to sign in. 
                <button
                  onClick={() => setShowCookieConsent(true)}
                  className="ml-2 underline font-semibold hover:text-orange-300"
                >
                  Change preference
                </button>
              </p>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading || isCheckingSession || cookieConsent === "rejected"}
            className={`
              w-full max-w-sm px-8 py-4 
              bg-gradient-to-r from-[#21F3F3] to-[#F321C1] 
              rounded-xl font-bold text-black text-lg
              shadow-[0_0_30px_rgba(33,243,243,0.5)]
              transition-all duration-300
              hover:shadow-[0_0_40px_rgba(243,33,193,0.7)]
              hover:scale-105
              active:scale-95
              flex items-center justify-center gap-3
              ${
                isLoading || isCheckingSession || cookieConsent === "rejected"
                  ? "opacity-50 cursor-not-allowed scale-100"
                  : "cursor-pointer"
              }
            `}
          >
            {isCheckingSession ? (
              <>
                {/* Checking Session Spinner */}
                <svg
                  className="animate-spin h-5 w-5 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Checking session...</span>
              </>
            ) : isLoading ? (
              <>
                {/* OAuth Loading Spinner */}
                <svg
                  className="animate-spin h-5 w-5 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Redirecting...</span>
              </>
            ) : (
              <>
                {/* Google Icon */}
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          {/* Terms & Privacy Policy Disclaimer (GDPR Compliance) */}
          <p className="text-xs text-gray-400 mt-6 max-w-sm text-center leading-relaxed">
            By signing in, you agree to our{" "}
            <a
              href="/terms"
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
            .
          </p>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Live quiz competitions every 15 minutes
            </p>
            <p className="text-purple-400 text-sm font-semibold mt-1">
              £1000 monthly prize pool
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-4 text-center text-gray-600 text-xs">
          <p>© 2025 VibraXX. Operated by Sermin Limited</p>
        </footer>
      </main>
    </>
  );
}
