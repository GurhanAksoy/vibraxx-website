"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "../gameplay/effects/transitions";

interface QuestionPanelProps {
  question: {
    id: number;
    text: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  };
  selected: number | null;
  onSelect: (index: number) => void;
  correctCount: number;
  wrongCount: number;
  currentIndex: number;
  total: number;
}

export default function QuestionPanel({
  question,
  selected,
  onSelect,
  correctCount,
  wrongCount,
  currentIndex,
  total,
}: QuestionPanelProps) {
  const [timeLeft, setTimeLeft] = React.useState(6);
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [feedback, setFeedback] = React.useState<"correct" | "wrong" | null>(
    null
  );

  // Timer sistemi
  React.useEffect(() => {
    if (selected !== null) return; // Cevap seçilince timer durur
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, selected]);

  // Süre bitince otomatik yanlış
  const handleTimeout = () => {
    setFeedback("wrong");
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      onSelect(-1); // -1 => zaman doldu
      setTimeLeft(6);
    }, 5000);
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    const isCorrect = idx === question.correctIndex;
    setFeedback(isCorrect ? "correct" : "wrong");
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      onSelect(idx);
      setTimeLeft(6);
    }, 5000);
  };

  // Timer bar rengi
  const getTimerColor = () => {
    if (timeLeft > 4) return "bg-green-500";
    if (timeLeft > 2) return "bg-yellow-400";
    return "bg-red-500";
  };

  if (showFeedback) {
    const correctAnswer = question.options[question.correctIndex];
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mt-8 p-8 rounded-2xl bg-black/40 border border-purple-500/30 text-center max-w-2xl mx-auto"
      >
        <h2
          className={`text-4xl font-bold mb-4 ${
            feedback === "correct"
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {feedback === "correct" ? "✅ Doğru!" : "❌ Yanlış!"}
        </h2>
        <p className="text-lg text-gray-300 mb-2">
          Doğru cevap: <span className="text-purple-300">{correctAnswer}</span>
        </p>
        {question.explanation && (
          <p className="text-gray-400 italic">{question.explanation}</p>
        )}
        <div className="mt-6 text-sm text-gray-500">
          ⏳ Yeni soru geliyor...
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="mt-6 sm:mt-8 space-y-6 w-full max-w-3xl mx-auto"
    >
      {/* 🧮 Üst Panel */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
        <div>
          ✅ <span className="text-green-400 font-semibold">{correctCount}</span> &nbsp;
          ❌ <span className="text-red-400 font-semibold">{wrongCount}</span>
        </div>
        <div>
          🏁 Round:{" "}
          <span className="text-purple-400 font-semibold">
            {currentIndex + 1}/{total}
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${getTimerColor()} transition-all duration-1000`}
          style={{ width: `${(timeLeft / 6) * 100}%` }}
        ></div>
      </div>

      {/* Soru Metni */}
      <h2 className="text-center text-2xl sm:text-3xl font-bold text-vibra-cyan drop-shadow-[0_0_10px_rgba(33,243,243,0.4)] leading-snug">
        {question.text}
      </h2>

      {/* Şıklar */}
      <div className="grid grid-cols-1 gap-4 w-full">
        {question.options.map((option, idx) => {
          const isSelected = selected === idx;
          const correctIndex = question.correctIndex;

          let className =
            "relative w-full block text-left font-semibold text-base sm:text-lg px-5 py-4 rounded-xl border-2 transition-all duration-300 select-none backdrop-blur-sm ";

          if (selected === null) {
            className +=
              "bg-vibra-surface/40 border-vibra-cyan/30 hover:border-vibra-magenta/60 hover:shadow-[0_0_18px_rgba(243,33,193,0.3)] active:scale-[0.98]";
          } else if (idx === correctIndex) {
            className +=
              "bg-green-600/70 border-green-400 shadow-[0_0_20px_rgba(0,255,128,0.5)]";
          } else if (isSelected && idx !== correctIndex) {
            className +=
              "bg-red-600/70 border-red-400 shadow-[0_0_20px_rgba(255,50,50,0.4)]";
          } else {
            className += "bg-slate-800/50 border-slate-700 opacity-60";
          }

          return (
            <motion.button
              key={idx}
              whileTap={{ scale: selected === null ? 0.97 : 1 }}
              onClick={() => handleAnswer(idx)}
              disabled={selected !== null}
              className={className}
            >
              <span className="inline-flex items-center justify-center w-8 h-8 mr-3 text-sm font-bold rounded-lg bg-vibra-cyan/10 border border-vibra-cyan/30 text-vibra-cyan">
                {["A", "B", "C", "D"][idx]}
              </span>
              {option}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
