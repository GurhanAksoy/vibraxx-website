"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user;
      setUser(u ?? null);
      if (u) {
        const { data: scores } = await supabase
          .from("round_scores")
          .select("*")
          .eq("user_id", u.id)
          .order("created_at", { ascending: false });
        setStats(scores ?? []);
      }
    };
    loadUser();
  }, []);

  if (!user)
    return (
      <main className="min-h-screen flex items-center justify-center text-white bg-black">
        <p>Loading user...</p>
      </main>
    );

  const totalRounds = stats.length;
  const totalCorrect = stats.reduce((sum, s) => sum + s.correct, 0);
  const totalWrong = stats.reduce((sum, s) => sum + s.wrong, 0);
  const avgAccuracy = stats.length
    ? Math.round(stats.reduce((sum, s) => sum + s.accuracy, 0) / stats.length)
    : 0;
  const totalPoints = stats.reduce((sum, s) => sum + s.total_score, 0);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center py-20 px-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold mb-6 text-[#21F3F3]"
      >
        Your Stats
      </motion.h1>

      <div className="bg-[#0A0B0F]/80 border border-[#21F3F3]/40 rounded-2xl p-6 w-full max-w-md shadow-[0_0_30px_#21F3F3,0_0_50px_#F321C1]">
        <p className="text-lg mb-2">ğŸ§© Total Rounds: {totalRounds}</p>
        <p className="text-green-400 mb-2">{'\u2705'} Total Correct: {totalCorrect}</p>
        <p className="text-red-400 mb-2">{'\u274C'} Total Wrong: {totalWrong}</p>
        <p className="text-cyan-300 mb-2">{'\uD83D\uDCCA'} Average Accuracy: {avgAccuracy}%</p>
        <p className="text-yellow-400 mb-2">ğŸ’° Total Points: {totalPoints}</p>
      </div>

      {stats.length === 0 ? (
        <p className="mt-6 text-white/70">You havenâ€™t completed any rounds yet.</p>
      ) : (
        <div className="mt-10 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-[#21F3F3]">Recent Rounds</h2>
          <ul className="space-y-3">
            {stats.slice(0, 5).map((s) => (
              <li
                key={s.id}
                className="bg-[#111]/70 border border-[#21F3F3]/20 rounded-xl p-3 flex justify-between"
              >
                <span>{new Date(s.created_at).toLocaleString()}</span>
                <span className="text-[#21F3F3] font-semibold">
                  {s.total_score} pts
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}


