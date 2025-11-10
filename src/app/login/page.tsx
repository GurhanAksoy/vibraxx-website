"use client";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/dashboard", // GiriÅŸ sonrasÄ± yÃ¶nlendirme
      },
    });
    if (error) console.error("Login error:", error.message);
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


