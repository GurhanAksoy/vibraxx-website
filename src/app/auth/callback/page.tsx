"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // URL'deki query parametrelerini almak
      const params = new URLSearchParams(window.location.search);

      const code = params.get("code");  // 'code' parametresini almak
      const error = params.get("error"); // 'error' parametresini almak

      if (error) {
        console.error("OAuth Error:", error);
        router.replace("/"); // Hata varsa ana sayfaya yönlendir
        return;
      }

      if (code) {
        try {
          // Google OAuth kodunu Supabase'e gönderip token almak
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",  // Google sağlayıcısını belirtiyoruz
            // redirectTo parametresini Google Console'da yapılandırmalısınız
            // Burada bu parametreye gerek yok, callback URI'yi Supabase Console'dan ayarlıyoruz
          });

          if (error) {
            console.error("OAuth Error:", error.message);
            router.replace("/"); // Hata durumunda ana sayfaya yönlendir
            return;
          }

          if (data) {
            console.log("Google OAuth success:", data);
            router.replace("/"); // Giriş başarılı ise yönlendir
          }
        } catch (err) {
          console.error("Error during OAuth callback:", err);
          router.replace("/");
        }
      }
    };

    handleOAuthCallback();
  }, [router]);

  return (
    <main className="min-h-screen bg-black text-white grid place-items-center">
      <p>Signing you in...</p>
    </main>
  );
}
