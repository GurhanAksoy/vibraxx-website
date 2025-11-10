"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase OAuth yönlendirmesini tamamla
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth error:", error);
        router.replace("/?error=auth_failed");
        return;
      }

      if (data.session) {
        console.log("✅ Giriş başarılı:", data.session.user);
        router.replace("/"); // veya "/dashboard" nereye yönlendirmek istiyorsan
      } else {
        console.log(⚠️ Henüz session yok, tekrar deneyelim...");
        // Supabase URL'de hash token varsa yakala
        await supabase.auth.getSessionFromUrl({ storeSession: true });
        const { data: newData } = await supabase.auth.getSession();
        if (newData.session) {
          router.replace("/");
        } else {
          router.replace("/?error=session_missing");
        }
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
