"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/");
      } else {
        router.replace("/");
      }
    };
    checkSession();
  }, [router]);

  return (
    <main className="min-h-screen bg-black text-white grid place-items-center">
      <p>Signing you in...</p>
    </main>
  );
}


