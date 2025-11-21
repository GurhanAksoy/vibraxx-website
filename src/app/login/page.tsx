"use client";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createOrUpdateProfile } from "@/lib/createProfile";

export default function LoginPage() {
  const router = useRouter();

  // Login sonrası geri dönüşte user'ı yakala ve profile oluştur
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Profil oluştur veya güncelle
        await createOrUpdateProfile(session.user);

        // Yönlendirme
        router.push("/dashboard");
      }
    };

    checkUser();
  }, [router]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/login", 
        // kullanıcı login sonra yine login sayfasına dönsün → user'ı yakalayacağız
      },
    });
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <img src="/images/vibraxx-logo.png" className="w-32 mb-6" alt="VibraXX" />
      <button
        onClick={handleGoogleLogin}
        className="px-8 py-3 bg-gradient-to-r from-[#21F3F3] to-[#F321C1] rounded-xl font-bold text-black shadow-[0_0_30px_#21F3F3]"
      >
        Sign in with Google
      </button>
    </main>
  );
}
