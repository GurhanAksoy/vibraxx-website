"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        // Supabase URL'deki code parametresini okuyup session oluşturur
        await supabase.auth.exchangeCodeForSession(window.location.href);

        router.replace("/");
      } catch (e) {
        console.error("Callback error:", e);
        router.replace("/");
      }
    };

    run();
  }, []);

  return (
    <main className="min-h-screen grid place-items-center text-white">
      <p>Signing you in...</p>
    </main>
  );
}
