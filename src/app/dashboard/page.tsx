"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

// 🔁 Artık tüm alt modüller alias ile geliyor:
import { useGameEngine } from "@/components/gameplay/useGameEngine";
import QuestionPanel from "@/components/gameplay/QuestionPanel";
import ScoreBar from "@/components/gameplay/ScoreBar";
import RoundInfoCard from "@/components/gameplay/RoundInfoCard";
import AudioController from "@/components/gameplay/AudioController";
import { playSfx, SFX } from "@/components/gameplay/effects/sounds";
import { fadeInUp } from "@/components/gameplay/effects/transitions";

export type Phase =
  | "READY"
  | "START"
  | "QUESTION"
  | "CORRECT"
  | "WRONG"
  | "END";

export interface RoundResult {
  userName: string;
  userAvatar?: string;
  correct: number;
  wrong: number;
  total: number;
  accuracy: number;
}

interface GamePlayProps {
  onRoundEnd?: (data: RoundResult) => void;
  onPhaseChange?: (phase: Phase) => void;
}

export default function GamePlay({ onRoundEnd, onPhaseChange }: GamePlayProps) {
  const {
    question,
    index,
    total,
    score,
    timer,
    muted,
    players,
    round,
    selected,
    handleSelect,
    toggleMute,
    phase,
    correctCount,
    wrongCount,
    endRound,
  } = useGameEngine();

  // 🔔 Faz değişimini dışarı bildir
  React.useEffect(() => {
    if (onPhaseChange) onPhaseChange(phase);
  }, [phase, onPhaseChange]);

  // 🔊 Ses efektleri
  React.useEffect(() => {
    switch (phase) {
      case "START":
        playSfx(SFX.start);
        break;
      case "QUESTION":
        playSfx(SFX.tick);
        break;
      case "CORRECT":
        playSfx(SFX.correct);
        break;
      case "WRONG":
        playSfx(SFX.wrong);
        break;
      case "END":
        playSfx(SFX.gameover);
        break;
    }
  }, [phase]);

  // 🏁 Oyun bitişinde sonucu bildir
  React.useEffect(() => {
    if (phase === "END" && onRoundEnd) {
      const result: RoundResult = {
        userName: "Player 1",
        correct: correctCount,
        wrong: wrongCount,
        total,
        accuracy: Math.round((correctCount / total) * 100),
      };
      onRoundEnd(result);
    }
  }, [phase, correctCount, wrongCount, total, onRoundEnd]);

  // ⏳ Henüz soru yüklenmemişse
  if (!question) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-gray-300">
        <Trophy className="w-12 h-12 text-purple-400 mb-4" />
        <p className="text-lg">Loading next round...</p>
      </div>
    );
  }

  // 🎮 Oyun alanı
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="relative max-w-5xl mx-auto px-6 py-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-purple-500/20 shadow-2xl"
    >
      {/* Üst Bilgi */}
      <RoundInfoCard round={round} players={players} />
      <AudioController muted={muted} toggle={toggleMute} />

      {/* Skor + Sayaç */}
      <ScoreBar score={score} index={index} total={total} timer={timer} />

      {/* Soru Paneli */}
      <QuestionPanel
        question={question}
        selected={selected}
        onSelect={handleSelect}
      />

      {/* Alt Bilgi */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mt-10 text-center text-gray-500 text-sm"
      >
        ⚡ Stay connected — disconnection = Game Over
      </motion.div>
    </motion.div>
  );
}
