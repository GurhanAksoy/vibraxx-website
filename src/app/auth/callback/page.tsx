"use client";

export const dynamic = "force-dynamic";
export const runtime = "edge";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { createOrUpdateProfile } from "@/lib/createProfile";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] = useState("Signing you in...");
  const [subMessage, setSubMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const error = searchParams.get("error");
        const errorDesc = searchParams.get("error_description");

        if (error) {
          console.error("OAuth error:", error, errorDesc);
          setMessage("Sign-in failed");
          setSubMessage(errorDesc || "An error occurred while signing you in.");
          setTimeout(() => router.replace("/"), 2500);
          return;
        }

        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setMessage("Session error");
          setSubMessage("Please try signing in again.");
          setTimeout(() => router.replace("/"), 2500);
          return;
        }

        const session = data.session;
        if (!session?.user) {
          setMessage("No active session");
          setSubMessage("Redirecting you to home...");
          setTimeout(() => router.replace("/"), 1500);
          return;
        }

        try {
          await createOrUpdateProfile(session.user);
        } catch (profileError) {}

        setMessage("Welcome!");
        setSubMessage("Redirecting you to VibraXX...");

        setTimeout(() => {
          router.replace("/");
        }, 1000);
      } catch (err) {
        console.error("Auth callback fatal error:", err);
        setMessage("Unexpected error");
        setSubMessage("Redirecting you to home...");
        setTimeout(() => router.replace("/"), 2000);
      }
    };

    run();
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-black text-white grid place-items-center">
      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-semibold">{message}</p>
        {subMessage && (
          <p className="text-sm text-gray-400 text-center max-w-md">
            {subMessage}
          </p>
        )}
      </div>
    </main>
  );
}
