"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // 1) Supabase session'ı burada otomatik olarak URL'den okur
      const { data } = await supabase.auth.getSession();

      // 2) Birkaç ms beklemek gerekebiliyor (Google dönüşü bazen geç yazılıyor)
      if (!data.session) {
        await new Promise((res) => setTimeout(res, 500));
      }

      const { data: finalCheck } = await supabase.auth.getSession();

      if (finalCheck.session) {
        router.replace("/");
      } else {
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
