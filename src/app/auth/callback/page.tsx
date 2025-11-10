"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Google'dan gelen kodu almak
      const { code, error } = new URLSearchParams(window.location.search);
      
      if (error) {
        console.error("OAuth Error:", error);
        router.replace("/");
        return;
      }

      if (code) {
        try {
          // Google OAuth kodunu Supabase'e gönderip token almak
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            redirectTo: `${window.location.origin}/auth/callback`,
            code,  // Google'dan alınan kod
          });

          if (error) {
            console.error("OAuth Error:", error.message);
            router.replace("/");
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
