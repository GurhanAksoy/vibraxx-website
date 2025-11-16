"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

type ResultProps = {
  userName: string;
  userAvatar: string;
  correctCount: number;
  wrongCount: number;
  total: number;
  accuracy: number;
  isChampion: boolean;
  championName?: string;
  championScore?: number;
  onFinish: () => void;
};

export default function ResultCard({
  userName,
  userAvatar,
  correctCount,
  wrongCount,
  total,
  accuracy,
  isChampion,
  championName,
  championScore,
  onFinish,
}: ResultProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    if (countdown === 0) {
      clearInterval(timer);
      onFinish();
    }
    return () => clearInterval(timer);
  }, [countdown, onFinish]);

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center text-center text-white z-[9999]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-[#0A0B0F]/90 border border-[#21F3F3]/40 rounded-2xl p-8 max-w-md shadow-[0_0_30px_#21F3F3,0_0_60px_#F321C1]">
        <h2 className="text-2xl font-bold mb-4 text-[#21F3F3]">Round Results</h2>
        <Image
          src={userAvatar}
          alt="Player Avatar"
          width={90}
          height={90}
          className="rounded-full border-2 border-[#F321C1] mx-auto mb-3 object-cover"
        />
        <h3 className="text-xl font-semibold">{userName}</h3>
        <p className="mt-3 text-white/80">
          Correct: <span className="text-[#21F3F3] font-semibold">{correctCount}</span> / {total}
          <br />
          Accuracy: <span className="text-[#F321C1] font-semibold">{accuracy}%</span>
        </p>

        {isChampion ? (
          <p className="mt-4 text-2xl text-[#FFD700] font-bold drop-shadow-[0_0_10px_#FFD700]">
            ğŸ† You are the Round Champion! ğŸ†
          </p>
        ) : (
          <p className="mt-4 text-lg text-[#21F3F3]">
            Round Champion: <strong>{championName}</strong> ({championScore} pts)
          </p>
        )}

        <p className="mt-6 text-sm text-white/70">
          Next round starts in <span className="text-[#21F3F3]">{countdown}</span> seconds...
        </p>
      </div>
    </motion.div>
  );
}


