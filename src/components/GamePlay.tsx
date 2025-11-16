"use client";

import React from "react";
import { motion } from "framer-motion";
import { useGameEngine } from "./gameplay/useGameEngine";
import QuestionPanel from "./gameplay/QuestionPanel";
import ScoreBar from "./gameplay/ScoreBar";
import RoundInfoCard from "./gameplay/RoundInfoCard";
import AudioController from "./gameplay/AudioController";
import { playSfx, SFX } from "./gameplay/effects/sounds";
import { fadeInUp } from "./gameplay/effects/transitions";
import { Trophy } from "lucide-react";

export default function GamePlay() {
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
  } = useGameEngine();

  React.useEffect(() => {
    if (phase === "START") playSfx(SFX.start);
    if (phase === "QUESTION") playSfx(SFX.tick);
    if (phase === "CORRECT") playSfx(SFX.correct);
    if (phase === "WRONG") playSfx(SFX.wrong);
    if (phase === "END") playSfx(SFX.gameover);
  }, [phase]);

  if (!question) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-gray-300">
        <Trophy className="w-12 h-12 text-purple-400 mb-4" />
        <p className="text-lg">Loading next round...</p>
      </div>
    );
  }

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
