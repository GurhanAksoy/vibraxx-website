"use client";
import React from "react";
import { motion } from "framer-motion";

interface Props {
  score: number;
  index: number;
  total: number;
  timer: number;
}

export default function ScoreBar({ score, index, total, timer }: Props) {
  const progress = ((index + 1) / total) * 100;
  const color =
    timer > 10 ? "text-green-400" : timer > 5 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>Question {index + 1}/{total}</span>
        <span>Score: {score}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className={`text-center mt-3 text-4xl font-bold ${color}`}>{timer}</div>
    </div>
  );
}
