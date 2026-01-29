"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const REDIRECT_DELAYS = {
  SUCCESS: 1000,
  ERROR: 2500,
};

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] = useState("Signing you in...");
  const [subMessage, setSubMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        /* ============================
           STEP 1 – OAuth Error Check
        ============================ */
        const error = searchParams.get("error");
        const errorDesc = searchParams.get("error_description");

        if (error) {
          setMessage("Sign-in failed");
          setSubMessage(errorDesc || "Authentication error.");
          setTimeout(() => router.replace("/"), REDIRECT_DELAYS.ERROR);
          return;
        }

        /* ============================
           STEP 2 – Validate Session
        ============================ */
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !data.session?.user) {
          setMessage("Session error");
          setSubMessage("Please sign in again.");
          setTimeout(() => router.replace("/"), REDIRECT_DELAYS.ERROR);
          return;
        }

        /* ============================
           STEP 3 – Canonical Profile
        ============================ */
        const { error: profileError } = await supabase.rpc("upsert_profile");

        if (profileError) {
          console.error("Profile RPC error:", profileError);
          setMessage("Profile error");
          setSubMessage("Could not initialize profile.");
          setTimeout(() => router.replace("/"), REDIRECT_DELAYS.ERROR);
          return;
        }

        /* ============================
           STEP 4 – Success Redirect
        ============================ */
        setMessage("Welcome to VibraXX!");
        setSubMessage("Redirecting...");

        setTimeout(() => router.replace("/"), REDIRECT_DELAYS.SUCCESS);
      } catch (err) {
        console.error("Auth callback error:", err);
        setMessage("Unexpected error");
        setSubMessage("Redirecting...");
        setTimeout(() => router.replace("/"), REDIRECT_DELAYS.ERROR);
      }
    };

    run();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white grid place-items-center">
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>

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
        <main className="min-h-screen grid place-items-center text-white bg-black">
          <p>Loading...</p>
        </main>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
