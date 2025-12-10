"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createOrUpdateProfile } from "@/lib/createProfile";

export default function LoginPage() {
  const router = useRouter();

  // Google login dönüşünde user varsa profili + active session'ı oluştur
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        await createOrUpdateProfile(session.user);

        router.replace("/"); // login başarı → ana sayfa
      }
    };

    loadUser();
  }, [router]);

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <img src="/images/vibraxx-logo.png" className="w-32 mb-6" alt="VibraXX" />

      <button
        onClick={loginWithGoogle}
        className="px-8 py-3 bg-gradient-to-r from-[#21F3F3] to-[#F321C1] rounded-xl font-bold text-black shadow-[0_0_30px_#21F3F3]"
      >
        Sign in with Google
      </button>
    </main>
  );
}
