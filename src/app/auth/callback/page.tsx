"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { createOrUpdateProfile } from "@/lib/createProfile";
import { detectCountry } from "@/lib/countryService";

// ✅ STANDARDIZED REDIRECT DELAYS
const REDIRECT_DELAYS = {
  SUCCESS: 1000,      // Happy path - fast redirect
  ERROR: 2500,        // Error cases - give user time to read
  NO_SESSION: 1500,   // Mild error - medium delay
};

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Signing you in...");
  const [subMessage, setSubMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // ============================================
        // STEP 1: CHECK FOR OAUTH ERROR PARAMETERS
        // ============================================
        const error = searchParams.get("error");
        const errorDesc = searchParams.get("error_description");

        if (error) {
          console.error("❌ Callback: OAuth error:", error, errorDesc);

          // ✅ SPECIFIC ERROR HANDLING
          let userMessage = "Sign-in failed";
          let userSubMessage = errorDesc || "An error occurred while signing you in.";

          if (error === "access_denied") {
            userMessage = "Sign-in cancelled";
            userSubMessage = "You chose not to continue. Redirecting...";
          } else if (error === "server_error") {
            userMessage = "Service temporarily unavailable";
            userSubMessage = "Google is experiencing issues. Please try again later.";
          } else if (error === "temporarily_unavailable") {
            userMessage = "Service busy";
            userSubMessage = "Too many requests. Please try again in a moment.";
          }

          setMessage(userMessage);
          setSubMessage(userSubMessage);
          setTimeout(() => router.replace("/"), REDIRECT_DELAYS.ERROR);
          return;
        }

        // ============================================
        // STEP 2: VALIDATE SESSION
        // ============================================
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("❌ Callback: Session error:", sessionError);
          setMessage("Session error");
          setSubMessage("Please try signing in again.");
          setTimeout(() => router.replace("/"), REDIRECT_DELAYS.ERROR);
          return;
        }

        const session = data.session;

        if (!session?.user) {
          console.warn("⚠️ Callback: No active session found");
          setMessage("No active session");
          setSubMessage("Redirecting you to home...");
          setTimeout(() => router.replace("/"), REDIRECT_DELAYS.NO_SESSION);
          return;
        }

        console.log("✅ Callback: Session validated for user:", session.user.id);

        // ============================================
        // STEP 2.5: AUTO-DETECT COUNTRY (NEW!)
        // ============================================
        console.log("🌍 Callback: Auto-detecting user country...");
        let userCountry = '🌍'; // Default
        
        try {
          const countryData = await detectCountry();
          userCountry = countryData.flag;
          console.log("✅ Callback: Country detected:", countryData.countryName, userCountry);
        } catch (error) {
          console.warn("⚠️ Callback: Country detection failed, using default", error);
        }

        // Add country to user metadata if not already present
        if (!session.user.user_metadata?.country) {
          console.log("📝 Callback: Adding country to user metadata...");
          await supabase.auth.updateUser({
            data: { country: userCountry }
          });
        }

        // ============================================
        // STEP 3: CREATE/UPDATE PROFILE (CENTRAL HANDLER)
        // ============================================
        console.log("📝 Callback: Creating/updating user profile...");
        await createOrUpdateProfile(session.user);
        console.log("✅ Callback: Profile created/updated");

        // ============================================
        // STEP 4: REGISTER ACTIVE SESSION (CRITICAL)
        // ============================================
        console.log("🔐 Callback: Registering active session...");
        await fetch("/api/session/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId: session.user.id,
            location: "HOME"
          })
        });
        console.log("✅ Callback: Active session registered");

        // ============================================
        // STEP 5: SUCCESS - REDIRECT TO HOME
        // ============================================
        setMessage("Welcome!");
        setSubMessage("Redirecting you to VibraXX...");
        setTimeout(() => {
          console.log("🚀 Callback: Redirecting to homepage");
          router.replace("/");
        }, REDIRECT_DELAYS.SUCCESS);

      } catch (err: any) {
        // ============================================
        // STEP 6: CATCH-ALL ERROR HANDLER
        // ============================================
        console.error("❌ Callback: Unexpected error:", err);
        console.error("Error details:", {
          message: err?.message,
          stack: err?.stack,
          name: err?.name,
        });

        // Optional: Sentry integration
        // if (typeof Sentry !== 'undefined') {
        //   Sentry.captureException(err, {
        //     tags: { context: 'oauth_callback' },
        //     extra: { searchParams: Object.fromEntries(searchParams) },
        //   });
        // }

        setMessage("Unexpected error");
        setSubMessage("Something went wrong. Redirecting you to home...");
        setTimeout(() => router.replace("/"), REDIRECT_DELAYS.ERROR);
      }
    };

    handleOAuthCallback();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white grid place-items-center">
      {/* Background Decorative Elements (matching login page) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" 
             style={{ animationDelay: "700ms" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Loading Spinner */}
        <svg
          className="animate-spin h-12 w-12 text-cyan-400"
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

        {/* Messages */}
        <p className="text-xl font-semibold text-center">{message}</p>
        {subMessage && (
          <p className="text-sm text-gray-400 text-center max-w-md px-4">
            {subMessage}
          </p>
        )}
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white grid place-items-center">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" 
                 style={{ animationDelay: "700ms" }} />
          </div>

          {/* Loading Content */}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <svg
              className="animate-spin h-12 w-12 text-cyan-400"
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
            <p className="text-xl font-semibold">Loading...</p>
            <p className="text-sm text-gray-400">Preparing your session</p>
          </div>
        </main>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
