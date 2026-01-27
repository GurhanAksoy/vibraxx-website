"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// ✅ KANONIK: Standardized delays
const REDIRECT_DELAYS = {
  SUCCESS: 1000,
  ERROR: 2500,
  NO_SESSION: 1500,
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
        // STEP 1: CHECK FOR OAUTH ERROR
        // ============================================
        const error = searchParams.get("error");
        const errorDesc = searchParams.get("error_description");

        if (error) {
          console.error("❌ OAuth error:", error, errorDesc);

          let userMessage = "Sign-in failed";
          let userSubMessage = errorDesc || "An error occurred.";

          if (error === "access_denied") {
            userMessage = "Sign-in cancelled";
            userSubMessage = "You chose not to continue.";
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

        if (sessionError || !data.session?.user) {
          console.error("❌ Session error:", sessionError);
          setMessage("Session error");
          setSubMessage("Please try signing in again.");
          setTimeout(() => router.replace("/"), REDIRECT_DELAYS.ERROR);
          return;
        }

        const user = data.session.user;
        console.log("✅ Session validated:", user.id);

        // ============================================
        // STEP 3: DETECT COUNTRY (OPTIONAL)
        // ============================================
        let countryCode = 'GB'; // Default
        
        try {
          const ipResponse = await fetch('https://api.country.is/');
          const ipData = await ipResponse.json();
          countryCode = ipData.country || 'GB';
          console.log("✅ Country detected:", countryCode);
        } catch (err) {
          console.warn("⚠️ Country detection failed, using GB");
        }

        // ============================================
        // STEP 4: UPSERT PROFILE (KANONIK RPC)
        // ============================================
        console.log("📝 Creating/updating profile...");
        
        const { error: profileError } = await supabase.rpc('upsert_profile', {
          p_user_id: user.id,
          p_full_name: user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.email?.split('@')[0] || 
                       'User',
          p_email: user.email!,
          p_country_code: countryCode
        });

        if (profileError) {
          console.error("❌ Profile creation failed:", profileError);
          setMessage("Profile error");
          setSubMessage("Could not create your profile. Please try again.");
          setTimeout(() => router.replace("/"), REDIRECT_DELAYS.ERROR);
          return;
        }

        console.log("✅ Profile created/updated");

        // ============================================
        // STEP 5: SUCCESS - REDIRECT
        // ============================================
        setMessage("Welcome!");
        setSubMessage("Redirecting to VibraXX...");
        
        setTimeout(() => {
          console.log("🚀 Redirecting to homepage");
          router.replace("/");
        }, REDIRECT_DELAYS.SUCCESS);

      } catch (err: any) {
        console.error("❌ Unexpected error:", err);
        setMessage("Unexpected error");
        setSubMessage("Something went wrong. Redirecting...");
        setTimeout(() => router.replace("/"), REDIRECT_DELAYS.ERROR);
      }
    };

    handleOAuthCallback();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white grid place-items-center">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" 
             style={{ animationDelay: "700ms" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Spinner */}
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
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" 
                 style={{ animationDelay: "700ms" }} />
          </div>
          
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
