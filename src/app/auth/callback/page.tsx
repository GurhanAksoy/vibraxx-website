"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Google’dan gelen “code” parametresini session’a çevirir!
        await supabase.auth.exchangeCodeForSession(window.location.href);

        router.replace("/");
      } catch (error) {
        console.error("OAuth callback error:", error);
        router.replace("/");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <main className="min-h-screen bg-black text-white grid place-items-center">
      <p>Signing you in...</p>
    </main>
  );
}
