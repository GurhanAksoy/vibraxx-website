"use client";

import * as React from "react";

export type GamePhase =
  | "READY"
  | "START"
  | "QUESTION"
  | "CORRECT"
  | "WRONG"
  | "END";

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
}

export function useGameEngine() {
  const [phase, setPhase] = React.useState<GamePhase>("READY");
  const [timer, setTimer] = React.useState(15);
  const [score, setScore] = React.useState(0);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null);
  const [isMuted, setIsMuted] = React.useState(false);

  // 🧠 Örnek soru seti (ileride Supabase'den çekilecek)
  const questions: Question[] = [
    { id: 1, text: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], correctIndex: 2 },
    { id: 2, text: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correctIndex: 1 },
    { id: 3, text: "Who painted the Mona Lisa?", options: ["Van Gogh", "Da Vinci", "Picasso", "Rembrandt"], correctIndex: 1 },
  ];

  // ⏱️ Sayaç mantığı
  React.useEffect(() => {
    if (phase === "QUESTION" && timer > 0 && selectedAnswer === null) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setPhase("WRONG");
      setTimeout(nextQuestion, 1500);
    }
  }, [phase, timer, selectedAnswer]);

  const startGame = () => {
    setPhase("START");
    setTimeout(() => setPhase("QUESTION"), 1500);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);

    const isCorrect = index === questions[currentIndex].correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setPhase("CORRECT");
    } else {
      setPhase("WRONG");
    }

    setTimeout(() => nextQuestion(), 1500);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setTimer(15);
      setPhase("QUESTION");
    } else {
      setPhase("END");
    }
  };

  const toggleMute = () => setIsMuted((prev) => !prev);
  const resetGame = () => {
    setPhase("READY");
    setTimer(15);
    setScore(0);
    setCurrentIndex(0);
    setSelectedAnswer(null);
  };

  return {
    question: questions[currentIndex], // ✅ artık GamePlay bunu alabiliyor
    index: currentIndex,
    total: questions.length,
    score,
    timer,
    muted: isMuted,
    players: 1250, // placeholder
    round: 247, // örnek round numarası
    selected: selectedAnswer,
    handleSelect: handleAnswer,
    toggleMute,
    phase,
    correctCount: score,
    wrongCount: currentIndex - score,
    endRound: resetGame,
  };
}
