"use client";

import * as React from "react";
import { motion } from "framer-motion";

type ResultProps = {
  userName: string;
  userAvatar?: string;
  correct: number;
  wrong: number;
  total: number;
  accuracy: number;
  onFinish: () => void;
  showSeconds?: number;
};

export default function ResultCard(props: ResultProps) {
  const {
    userName,
    userAvatar,
    correct,
    wrong,
    total,
    accuracy,
    onFinish,
    showSeconds = 5,
  } = props;

  const [countdown, setCountdown] = React.useState(showSeconds);

  React.useEffect(() => {
    if (showSeconds <= 0) {
      onFinish();
      return;
    }

    setCountdown(showSeconds);
    let remaining = showSeconds;

    const id = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(id);
        onFinish();
      }
    }, 1000);

    return () => clearInterval(id);
  }, [showSeconds, onFinish]);

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-b from-black via-[#05010A] to-[#110015] flex flex-col items-center justify-center text-center text-white z-[9999] px-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        className="relative bg-[#0A0B0F]/95 border border-[#21F3F3]/40 rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-[0_0_40px_#21F3F3,0_0_60px_#F321C1]"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-r from-[#21F3F3] to-[#F321C1] blur-2xl opacity-30 rounded-full" />

        <h2 className="text-3xl font-bold mb-4 text-[#21F3F3] drop-shadow-[0_0_10px_#21F3F3] tracking-wide">
          Round Results
        </h2>

        {userAvatar && (
          <motion.img
            src={userAvatar}
            alt="Player Avatar"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-[#F321C1] mx-auto mb-4 object-cover shadow-[0_0_25px_#F321C1]"
            referrerPolicy="no-referrer"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.45, type: "spring" }}
          />
        )}

        <h3 className="text-lg sm:text-xl font-semibold mb-3 text-white">
          {userName}
        </h3>

        <div className="mt-2 space-y-2 text-sm sm:text-base text-white/90">
          <div>
            Correct:
            <span className="text-[#21F3F3] font-semibold text-lg ml-1">
              {correct}
            </span>
            <span className="text-sm ml-1">/ {total}</span>
          </div>
          <div>
            Wrong:
            <span className="text-red-400 font-semibold text-lg ml-1">
              {wrong}
            </span>
          </div>
          <div>
            Accuracy:
            <span className="text-[#F321C1] font-semibold text-lg ml-1">
              {accuracy}%
            </span>
          </div>
        </div>

        <motion.p
          className="mt-6 text-xs sm:text-sm text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          Redirecting in{" "}
          <span className="text-[#21F3F3] font-bold">{countdown}</span> seconds...
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
