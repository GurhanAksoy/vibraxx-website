"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function UserBar() {
  const [user, setUser] = useState<any>(null);

  // ğŸ§  Oturumu Ã§ek ve deÄŸiÅŸiklikleri dinle
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ğŸšª Ã‡Ä±kÄ±ÅŸ iÅŸlemi
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  };

  if (!user) return null;

  // ğŸ§¾ Fallback deÄŸerleri
  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Player";

  const avatar =
    user.user_metadata?.avatar_url || "/images/default-avatar.png";

  const email = user.email || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] sm:w-[85%] md:w-[70%] lg:w-[60%]
                 bg-[#0a0a0a]/80 border border-[#21F3F3] rounded-2xl px-4 py-3 sm:px-6 sm:py-4
                 flex justify-between items-center shadow-[0_0_25px_#21F3F3,0_0_40px_#F321C1]
                 backdrop-blur-md z-50"
    >
      {/* ğŸ‘¤ KullanÄ±cÄ± Bilgisi */}
      <div className="flex items-center gap-3 sm:gap-4">
        <img
          src={avatar}
          alt="Profile"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#21F3F3]
                     shadow-[0_0_10px_#21F3F3]"
        />
        <div className="flex flex-col">
          <span className="text-white font-semibold text-sm sm:text-base tracking-wide">
            {displayName}
          </span>
          <span className="text-xs text-white/60">{email}</span>
        </div>
      </div>

      {/* ğŸ”˜ Logout Butonu */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogout}
        className="flex items-center gap-2 bg-gradient-to-r from-[#F321C1] to-[#21F3F3]
                   px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-black font-bold text-sm
                   hover:shadow-[0_0_15px_#21F3F3,0_0_30px_#F321C1] transition-all"
      >
        <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
        Logout
      </motion.button>
    </motion.div>
  );
}


