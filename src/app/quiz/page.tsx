"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Award,
  Zap,
  Volume2,
  VolumeX,
  Flame,
  TrendingUp,
  Star,
  Sparkles,
} from "lucide-react";

// ❗ Tek satırlık supabase tanımı — EN ÜSTE ve İNDETSİZ
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// === CONFIGURATION ===
const TOTAL_QUESTIONS = 50;
const QUESTION_DURATION = 6; // seconds
const EXPLANATION_DURATION = 5; // seconds
const FINAL_SCORE_DURATION = 5; // seconds

type OptionId = "A" | "B" | "C" | "D";
type AnswerStatus = "none" | "correct" | "wrong";

interface Question {
  id: number;
  question: string;
  options: { id: OptionId; text: string }[];
  correctAnswer: OptionId;
  explanation: string;
}


export default function QuizGamePage() {
  const router = useRouter();

  // === STATE ===
  const [questions, setQuestions] = useState<Question[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION);
  const [selectedAnswer, setSelectedAnswer] = useState<OptionId | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationTimer, setExplanationTimer] = useState(EXPLANATION_DURATION);

  const [showFinalScore, setShowFinalScore] = useState(false);
  const [finalCountdown, setFinalCountdown] = useState(FINAL_SCORE_DURATION);

  const [answers, setAnswers] = useState<AnswerStatus[]>(Array(TOTAL_QUESTIONS).fill("none"));

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // === AUDIO REFS ===
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const whooshSoundRef = useRef<HTMLAudioElement | null>(null);
  const tickSoundRef = useRef<HTMLAudioElement | null>(null);

  const currentQ = questions[currentIndex] ?? null;

    // Fetch questions from Supabase

  useEffect(() => {
  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('active', true)
      .order('order_index', { ascending: true })
      .limit(TOTAL_QUESTIONS);

    if (!error && data) {
      const formattedQuestions: Question[] = data.map((q, idx) => ({
        id: q.id,
        question: `Q${idx + 1}: ${q.question_text}`,
        options: [
          { id: "A", text: q.option_a },
          { id: "B", text: q.option_b },
          { id: "C", text: q.option_c },
          { id: "D", text: q.option_d },
        ],
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
      }));

      setQuestions(formattedQuestions); // 🔥 ARTIK SET EDİYOR
    }
  };

  fetchQuestions();
}, []);

  
  // Update user stats after quiz
  const updateUserStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const score = correctCount * 2;
    
    await supabase.from('user_stats').upsert({
      user_id: user.id,
      total_questions: TOTAL_QUESTIONS,
      correct_answers: correctCount,
      wrong_answers: wrongCount,
      accuracy_percentage: accuracy,
      max_streak: maxStreak,
      last_round_score: score,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

    // Save to quiz_history
    await supabase.from('quiz_history').insert({
      user_id: user.id,
      score: score,
      correct_count: correctCount,
      wrong_count: wrongCount,
      accuracy: accuracy,
      max_streak: maxStreak,
      completed_at: new Date().toISOString()
    });
  };

  // === SOUND HELPERS ===
  const playSound = (audio: HTMLAudioElement | null, options?: { loop?: boolean }) => {
    if (!isSoundEnabled || !audio) return;
    try {
      audio.loop = !!options?.loop;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {}
  };

  const stopSound = (audio: HTMLAudioElement | null) => {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.loop = false;
    } catch {}
  };

  const playClick = () => playSound(clickSoundRef.current);
  const startTick = () => playSound(tickSoundRef.current, { loop: true });
  const stopTick = () => stopSound(tickSoundRef.current);

  // Start tick on mount
  useEffect(() => {
    if (!showFinalScore && !showExplanation && timeLeft > 0 && isSoundEnabled) {
      startTick();
    }
    return () => stopTick();
  }, []);

  // === MAIN TIMER ===
  useEffect(() => {
    if (showFinalScore || showExplanation || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, showExplanation, showFinalScore]);

  // Time's up handler
  useEffect(() => {
    if (showFinalScore || showExplanation || timeLeft !== 0) return;

    stopTick();

    if (!isAnswerLocked) {
      setWrongCount((w) => w + 1);
      setAnswers((prev) => {
        const copy = [...prev];
        copy[currentIndex] = "wrong";
        return copy;
      });
      setIsCorrect(false);
      setStreak(0);
    }

    setIsAnswerLocked(true);
    playSound(whooshSoundRef.current);
    setShowExplanation(true);
  }, [timeLeft, showExplanation, showFinalScore, isAnswerLocked, currentIndex]);

  // === EXPLANATION COUNTDOWN ===
  useEffect(() => {
    if (!showExplanation || showFinalScore) return;

    let remaining = EXPLANATION_DURATION;
    setExplanationTimer(remaining);

    const interval = setInterval(() => {
      remaining -= 1;
      setExplanationTimer(remaining);
    }, 1000);

    const timeout = setTimeout(() => {
      clearInterval(interval);

      if (currentIndex < TOTAL_QUESTIONS - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setTimeLeft(QUESTION_DURATION);
        setSelectedAnswer(null);
        setIsAnswerLocked(false);
        setIsCorrect(false);
        setShowExplanation(false);

        if (isSoundEnabled) {
          startTick();
        }
      } else {
        setShowFinalScore(true);
      }
    }, EXPLANATION_DURATION * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [showExplanation, currentIndex, showFinalScore, isSoundEnabled]);

  // === FINAL SCORE COUNTDOWN ===
useEffect(() => {
  if (!showFinalScore) return;

  stopTick();
  playSound(gameoverSoundRef.current);

  updateUserStats(); // 🔥 BURAYA EKLE — TEK SATIR

  let remaining = FINAL_SCORE_DURATION;
  setFinalCountdown(remaining);

  const interval = setInterval(() => {
    setFinalCountdown((prev) => Math.max(0, prev - 1));
  }, 1000);

  const timeout = setTimeout(() => {
    clearInterval(interval);
    router.push("/lobby");
  }, FINAL_SCORE_DURATION * 1000);

  return () => {
    clearInterval(interval);
    clearTimeout(timeout);
  };
}, [showFinalScore, router]);


  // Sound toggle effect
  useEffect(() => {
    if (!isSoundEnabled) {
      stopTick();
      return;
    }
    if (!showFinalScore && !showExplanation && timeLeft > 0) {
      startTick();
    }
  }, [isSoundEnabled]);

  // Stop tick safety
  useEffect(() => {
    if (showFinalScore || showExplanation || timeLeft <= 0) {
      stopTick();
    }
  }, [showFinalScore, showExplanation, timeLeft]);

// === SUPABASE: Save each answer ===
const saveAnswer = async (questionId: number, answer: OptionId, isCorrect: boolean) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('user_answers').insert({
    user_id: user.id,
    question_id: questionId,
    selected_answer: answer,
    is_correct: isCorrect,
    time_taken: QUESTION_DURATION - timeLeft,
    answered_at: new Date().toISOString()
  });
};


  // === HANDLERS ===
const handleAnswerClick = async (optionId: OptionId) => {
  if (isAnswerLocked || showExplanation || showFinalScore) return;

  playClick();
  setSelectedAnswer(optionId);
  setIsAnswerLocked(true);

  const correct = optionId === currentQ.correctAnswer;
  setIsCorrect(correct);

  setAnswers((prev) => {
    const next = [...prev];
    next[currentIndex] = correct ? "correct" : "wrong";
    return next;
  });

  if (correct) {
    setCorrectCount((c) => c + 1);
    const newStreak = streak + 1;
    setStreak(newStreak);
    setMaxStreak((max) => Math.max(max, newStreak));
    playSound(correctSoundRef.current);
  } else {
    setWrongCount((w) => w + 1);
    setStreak(0);
    playSound(wrongSoundRef.current);
  }

  // 🔥 SUPABASE: kullanıcının cevabını kaydet
  await saveAnswer(currentQ.id, optionId, correct);
  };
  
  const handleExitClick = () => {
    if (showFinalScore) return;
    playClick();
    setShowExitConfirm(true);
  };

  const handleExitConfirmYes = () => {
    playClick();
    stopTick();
    setShowExitConfirm(false);
    setShowFinalScore(true);
  };

  const handleExitConfirmNo = () => {
    playClick();
    setShowExitConfirm(false);
  };

  const handleSoundToggle = () => {
    if (isSoundEnabled) playClick();
    setIsSoundEnabled((prev) => !prev);
  };

  // === HELPERS ===
  const getTimeColor = () => {
    if (timeLeft > 4) return "#22c55e";
    if (timeLeft > 2) return "#eab308";
    return "#ef4444";
  };

  const accuracy = TOTAL_QUESTIONS > 0 ? Math.round((correctCount / TOTAL_QUESTIONS) * 100) : 0;
  const score = correctCount * 2;

  // Sorular yüklenmeden ekranı gösterme
if (!currentQ) {
  return (
    <div
      style={{
        color: "white",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "24px"
      }}
    >
      Loading questions...
    </div>
  );
}
  return (
    <>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.98); }
        }
        
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes shine {
          0% { transform: translateX(-150%) skewX(-25deg); }
          100% { transform: translateX(250%) skewX(-25deg); }
        }
        
        @keyframes neonPulse {
          0%, 100% { 
            box-shadow: 0 0 15px rgba(139, 92, 246, 0.6),
                        0 0 30px rgba(139, 92, 246, 0.4),
                        inset 0 0 10px rgba(139, 92, 246, 0.2);
          }
          50% { 
            box-shadow: 0 0 25px rgba(217, 70, 239, 0.9),
                        0 0 50px rgba(217, 70, 239, 0.6),
                        inset 0 0 15px rgba(217, 70, 239, 0.3);
          }
        }
        
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(167, 139, 250, 0.8)); }
          50% { filter: drop-shadow(0 0 20px rgba(217, 70, 239, 1)); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .neon-border { animation: neonPulse 3s ease-in-out infinite; }
        .glow-icon { animation: glow 2s ease-in-out infinite; }

        *:focus-visible {
          outline: 3px solid #a78bfa;
          outline-offset: 3px;
          border-radius: 8px;
        }

        @media (max-width: 768px) {
          .header-wrap {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
            padding: 12px 0 !important;
          }
          .header-center {
            order: -1;
          }
          .header-right {
            justify-content: space-between;
          }
          .question-grid {
            grid-template-columns: 1fr !important;
          }
          .mobile-hide {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .stats-grid > div:last-child {
            grid-column: 1 / -1;
          }
        }
      `}</style>

      {/* Audio Elements */}
      <audio ref={correctSoundRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={wrongSoundRef} src="/sounds/wrong.mp3" preload="auto" />
      <audio ref={clickSoundRef} src="/sounds/click.mp3" preload="auto" />
      <audio ref={gameoverSoundRef} src="/sounds/gameover.mp3" preload="auto" />
      <audio ref={whooshSoundRef} src="/sounds/whoosh.mp3" preload="auto" />
      <audio ref={tickSoundRef} src="/sounds/tick.mp3" preload="auto" />

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)",
          backgroundSize: "400% 400%",
          animation: "shimmer 15s ease infinite",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}>
        
        {/* Animated Background Orbs */}
        <div
          className="animate-float"
          style={{
            position: "fixed",
            top: "-10%",
            left: "-5%",
            width: "min(600px, 80vw)",
            height: "min(600px, 80vw)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.5) 0%, rgba(124,58,237,0.1) 40%, transparent 70%)",
            filter: "blur(80px)",
            opacity: 0.6,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          className="animate-float"
          style={{
            position: "fixed",
            bottom: "-10%",
            right: "-5%",
            width: "min(700px, 90vw)",
            height: "min(700px, 90vw)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(217,70,239,0.4) 0%, rgba(217,70,239,0.1) 40%, transparent 70%)",
            filter: "blur(100px)",
            opacity: 0.5,
            pointerEvents: "none",
            zIndex: 0,
            animationDelay: "2s",
          }}
        />
        <div
          className="animate-float"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(500px, 70vw)",
            height: "min(500px, 70vw)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56,189,248,0.3) 0%, rgba(56,189,248,0.05) 40%, transparent 70%)",
            filter: "blur(90px)",
            opacity: 0.4,
            pointerEvents: "none",
            zIndex: 0,
            animationDelay: "4s",
          }}
        />

        {/* HEADER */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            borderBottom: "2px solid rgba(139,92,246,0.2)",
            backdropFilter: "blur(20px) saturate(180%)",
            background: "rgba(15,23,42,0.85)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}>
          <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(16px, 4vw, 24px)" }}>
            <div
              className="header-wrap"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: "80px",
                gap: "16px",
                padding: "8px 0",
              }}>
              
              {/* Logo & Brand */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                <div
                  className="glow-icon"
                  style={{
                    width: "clamp(48px, 10vw, 64px)",
                    height: "clamp(48px, 10vw, 64px)",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1e1b4b, #0f172a)",
                    border: "3px solid rgba(168,85,247,0.8)",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}>
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "conic-gradient(from 0deg, rgba(168,85,247,0.3), rgba(217,70,239,0.3), rgba(168,85,247,0.3))",
                    animation: "spin 4s linear infinite",
                  }} />
                  <Sparkles style={{ width: "60%", height: "60%", color: "#a78bfa", position: "relative", zIndex: 1 }} />
                </div>
                <div>
                  <div style={{
                    fontSize: "clamp(10px, 2.2vw, 13px)",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontWeight: 900,
                    background: "linear-gradient(90deg, #a78bfa, #d946ef, #22d3ee)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: "shimmer 3s linear infinite",
                  }}>
                    VibraXX Live
                  </div>
                  <div style={{ fontSize: "clamp(9px, 2vw, 11px)", color: "#94a3b8", fontWeight: 600 }}>
                    Global Quiz Championship
                  </div>
                </div>
              </div>

              {/* Center: Question Progress */}
              <div className="header-center" style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                flex: 1,
                maxWidth: "300px",
              }}>
                <div style={{
                  fontSize: "clamp(14px, 3vw, 20px)",
                  fontWeight: 900,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "shimmer 2s linear infinite",
                  textAlign: "center",
                }}>
                  Question {currentIndex + 1}/{TOTAL_QUESTIONS}
                </div>
                {streak > 1 && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: "linear-gradient(90deg, rgba(239,68,68,0.2), rgba(249,115,22,0.2))",
                    border: "1px solid rgba(239,68,68,0.5)",
                  }}>
                    <Flame style={{ width: "14px", height: "14px", color: "#fb923c" }} />
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#fbbf24" }}>
                      {streak} Streak!
                    </span>
                  </div>
                )}
              </div>

              {/* Right: Stats & Controls */}
              <div className="header-right" style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexShrink: 0,
              }}>
                {/* Score Pills */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <div style={{
                    padding: "6px 12px",
                    borderRadius: "999px",
                    background: "linear-gradient(135deg, rgba(22,163,74,0.15), rgba(21,128,61,0.15))",
                    border: "2px solid rgba(34,197,94,0.5)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 0 15px rgba(34,197,94,0.3)",
                  }}>
                    <CheckCircle style={{ width: "16px", height: "16px", color: "#22c55e" }} />
                    <span style={{ fontSize: "13px", fontWeight: 900, color: "#22c55e" }}>{correctCount}</span>
                  </div>
                  <div style={{
                    padding: "6px 12px",
                    borderRadius: "999px",
                    background: "linear-gradient(135deg, rgba(220,38,38,0.15), rgba(185,28,28,0.15))",
                    border: "2px solid rgba(239,68,68,0.5)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 0 15px rgba(239,68,68,0.3)",
                  }}>
                    <XCircle style={{ width: "16px", height: "16px", color: "#ef4444" }} />
                    <span style={{ fontSize: "13px", fontWeight: 900, color: "#ef4444" }}>{wrongCount}</span>
                  </div>
                </div>

                {/* Sound Toggle */}
                <button
                  onClick={handleSoundToggle}
                  className={isSoundEnabled ? "neon-border" : ""}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    border: "2px solid rgba(167,139,250,0.6)",
                    background: isSoundEnabled 
                      ? "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.2))"
                      : "rgba(30,27,75,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}>
                  {isSoundEnabled ? (
                    <Volume2 style={{ width: "20px", height: "20px", color: "#a78bfa" }} />
                  ) : (
                    <VolumeX style={{ width: "20px", height: "20px", color: "#6b7280" }} />
                  )}
                </button>

                {/* Exit Button */}
                {!showFinalScore && (
                  <button
                    onClick={handleExitClick}
                    className="neon-border"
                    style={{
                      padding: "10px 20px",
                      borderRadius: "999px",
                      border: "2px solid rgba(239,68,68,0.6)",
                      background: "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(185,28,28,0.2))",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 0 30px rgba(239,68,68,0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}>
                    <Zap style={{ width: "16px", height: "16px" }} />
                    <span className="mobile-hide">Exit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "clamp(20px, 5vw, 40px) clamp(16px, 4vw, 24px)",
        }}>
          
          {/* CIRCULAR TIMER */}
          {!showFinalScore && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "clamp(24px, 5vw, 32px)",
            }}>
              <div className="animate-pulse" style={{
                position: "relative",
                width: "clamp(100px, 20vw, 120px)",
                height: "clamp(100px, 20vw, 120px)",
              }}>
                {/* Outer Ring */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: `4px solid ${getTimeColor()}`,
                  boxShadow: `0 0 30px ${getTimeColor()}, inset 0 0 20px ${getTimeColor()}`,
                  opacity: 0.8,
                }} />
                
                {/* Inner Circle */}
                <div style={{
                  position: "absolute",
                  inset: "10px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(15,23,42,1) 0%, rgba(6,8,20,1) 100%)",
                  border: "2px solid rgba(139,92,246,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
                }}>
                  <Clock style={{
                    width: "clamp(20px, 4vw, 28px)",
                    height: "clamp(20px, 4vw, 28px)",
                    color: getTimeColor(),
                    filter: `drop-shadow(0 0 8px ${getTimeColor()})`,
                  }} />
                  <span style={{
                    fontSize: "clamp(32px, 6vw, 42px)",
                    fontWeight: 900,
                    color: getTimeColor(),
                    textShadow: `0 0 20px ${getTimeColor()}`,
                    lineHeight: 1,
                  }}>
                    {timeLeft}
                  </span>
                  <span style={{
                    fontSize: "clamp(9px, 1.8vw, 11px)",
                    color: "#94a3b8",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}>
                    seconds
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* FINAL SCORE SCREEN */}
          {showFinalScore ? (
            <article className="animate-slide-up" style={{
              padding: "clamp(32px, 6vw, 48px) clamp(24px, 5vw, 32px)",
              borderRadius: "clamp(24px, 5vw, 32px)",
              border: "2px solid rgba(139,92,246,0.4)",
              background: "linear-gradient(135deg, rgba(30,27,75,0.95) 0%, rgba(15,23,42,0.95) 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.3)",
              textAlign: "center",
              backdropFilter: "blur(20px)",
            }}>
              
              {/* Trophy Icon */}
              <div className="glow-icon" style={{ display: "inline-block", marginBottom: "20px" }}>
                <Trophy style={{
                  width: "clamp(64px, 12vw, 80px)",
                  height: "clamp(64px, 12vw, 80px)",
                  color: "#fbbf24",
                  filter: "drop-shadow(0 0 20px #fbbf24)",
                }} />
              </div>

              <h1 style={{
                fontSize: "clamp(24px, 5vw, 32px)",
                fontWeight: 900,
                marginBottom: "12px",
                background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shimmer 3s linear infinite",
              }}>
                Quiz Complete!
              </h1>

              <p style={{
                fontSize: "clamp(13px, 2.8vw, 16px)",
                color: "#94a3b8",
                marginBottom: "32px",
                fontWeight: 500,
              }}>
                Your performance in this round
              </p>

              {/* Stats Grid */}
              <div className="stats-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                marginBottom: "24px",
              }}>
                {/* Correct */}
                <div style={{
                  padding: "20px 16px",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, rgba(22,163,74,0.2), rgba(21,128,61,0.1))",
                  border: "2px solid rgba(34,197,94,0.5)",
                  boxShadow: "0 0 20px rgba(34,197,94,0.2)",
                }}>
                  <CheckCircle style={{
                    width: "32px",
                    height: "32px",
                    color: "#22c55e",
                    marginBottom: "8px",
                    filter: "drop-shadow(0 0 10px #22c55e)",
                  }} />
                  <div style={{
                    fontSize: "clamp(28px, 5vw, 36px)",
                    fontWeight: 900,
                    color: "#22c55e",
                    lineHeight: 1,
                    marginBottom: "6px",
                  }}>
                    {correctCount}
                  </div>
                  <div style={{
                    fontSize: "clamp(11px, 2.2vw, 13px)",
                    color: "#86efac",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    Correct
                  </div>
                </div>

                {/* Wrong */}
                <div style={{
                  padding: "20px 16px",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, rgba(220,38,38,0.2), rgba(185,28,28,0.1))",
                  border: "2px solid rgba(239,68,68,0.5)",
                  boxShadow: "0 0 20px rgba(239,68,68,0.2)",
                }}>
                  <XCircle style={{
                    width: "32px",
                    height: "32px",
                    color: "#ef4444",
                    marginBottom: "8px",
                    filter: "drop-shadow(0 0 10px #ef4444)",
                  }} />
                  <div style={{
                    fontSize: "clamp(28px, 5vw, 36px)",
                    fontWeight: 900,
                    color: "#ef4444",
                    lineHeight: 1,
                    marginBottom: "6px",
                  }}>
                    {wrongCount}
                  </div>
                  <div style={{
                    fontSize: "clamp(11px, 2.2vw, 13px)",
                    color: "#fca5a5",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    Wrong
                  </div>
                </div>

                {/* Accuracy */}
                <div style={{
                  padding: "20px 16px",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.1))",
                  border: "2px solid rgba(139,92,246,0.5)",
                  boxShadow: "0 0 20px rgba(139,92,246,0.2)",
                }}>
                  <TrendingUp style={{
                    width: "32px",
                    height: "32px",
                    color: "#a78bfa",
                    marginBottom: "8px",
                    filter: "drop-shadow(0 0 10px #a78bfa)",
                  }} />
                  <div style={{
                    fontSize: "clamp(28px, 5vw, 36px)",
                    fontWeight: 900,
                    color: "#a78bfa",
                    lineHeight: 1,
                    marginBottom: "6px",
                  }}>
                    {accuracy}%
                  </div>
                  <div style={{
                    fontSize: "clamp(11px, 2.2vw, 13px)",
                    color: "#c4b5fd",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    Accuracy
                  </div>
                </div>
              </div>

              {/* Score & Streak */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}>
                <div style={{
                  padding: "12px 24px",
                  borderRadius: "999px",
                  background: "linear-gradient(90deg, rgba(251,191,36,0.2), rgba(245,158,11,0.2))",
                  border: "2px solid rgba(251,191,36,0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <Star style={{ width: "20px", height: "20px", color: "#fbbf24" }} />
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#fbbf24" }}>
                    Score: {score}
                  </span>
                </div>
                {maxStreak > 0 && (
                  <div style={{
                    padding: "12px 24px",
                    borderRadius: "999px",
                    background: "linear-gradient(90deg, rgba(249,115,22,0.2), rgba(234,88,12,0.2))",
                    border: "2px solid rgba(249,115,22,0.5)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    <Flame style={{ width: "20px", height: "20px", color: "#fb923c" }} />
                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#fb923c" }}>
                      Best Streak: {maxStreak}
                    </span>
                  </div>
                )}
              </div>

              {/* Redirect Message */}
              <div style={{
                padding: "16px",
                borderRadius: "16px",
                background: "rgba(15,23,42,0.8)",
                border: "1px solid rgba(139,92,246,0.3)",
              }}>
                <p style={{
                  fontSize: "clamp(12px, 2.5vw, 14px)",
                  color: "#94a3b8",
                  fontWeight: 600,
                }}>
                  Returning to lobby in{" "}
                  <span style={{
                    color: "#a78bfa",
                    fontWeight: 900,
                    fontSize: "clamp(14px, 3vw, 18px)",
                  }}>
                    {finalCountdown}
                  </span>
                  {" "}seconds...
                </p>
              </div>
            </article>
          ) : (
            <>
              {/* QUESTION OR EXPLANATION */}
              {!showExplanation ? (
                <article className="animate-slide-up" style={{
                  padding: "clamp(24px, 5vw, 32px) clamp(20px, 4vw, 28px)",
                  borderRadius: "clamp(24px, 5vw, 32px)",
                  border: "2px solid rgba(139,92,246,0.4)",
                  background: "linear-gradient(135deg, rgba(30,27,75,0.95) 0%, rgba(15,23,42,0.95) 100%)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(139,92,246,0.2)",
                  backdropFilter: "blur(20px)",
                  marginBottom: "24px",
                }}>
                  
                  {/* Question Header */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "16px",
                  }}>
                    <Target style={{
                      width: "24px",
                      height: "24px",
                      color: "#22d3ee",
                      filter: "drop-shadow(0 0 8px #22d3ee)",
                    }} />
                    <span style={{
                      fontSize: "clamp(11px, 2.3vw, 14px)",
                      color: "#22d3ee",
                      fontWeight: 800,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                    }}>
                      Question {currentIndex + 1}
                    </span>
                  </div>

                  {/* Question Text */}
                  <h2 style={{
                    fontSize: "clamp(18px, 4vw, 24px)",
                    lineHeight: 1.5,
                    fontWeight: 700,
                    marginBottom: "24px",
                    color: "#f8fafc",
                  }}>
                    {currentQ.question}
                  </h2>

                  {/* Options Grid */}
                  <div className="question-grid" style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "14px",
                  }}>
                    {currentQ.options.map((opt) => {
                      const isSelected = selectedAnswer === opt.id;
                      const isCorrectOpt = opt.id === currentQ.correctAnswer;
                      const locked = isAnswerLocked;

                      let borderColor = "rgba(139,92,246,0.5)";
                      let boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
                      let bg = "linear-gradient(135deg, rgba(30,27,75,0.8), rgba(15,23,42,0.9))";

                      if (locked) {
                        if (isCorrectOpt) {
                          borderColor = "#22c55e";
                          boxShadow = "0 0 25px rgba(34,197,94,0.6), 0 4px 20px rgba(0,0,0,0.3)";
                          bg = "linear-gradient(135deg, rgba(22,163,74,0.3), rgba(21,128,61,0.2))";
                        } else if (isSelected && !isCorrectOpt) {
                          borderColor = "#ef4444";
                          boxShadow = "0 0 25px rgba(239,68,68,0.6), 0 4px 20px rgba(0,0,0,0.3)";
                          bg = "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(185,28,28,0.2))";
                        } else {
                          borderColor = "rgba(75,85,99,0.4)";
                          boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
                          bg = "linear-gradient(135deg, rgba(30,27,75,0.5), rgba(15,23,42,0.6))";
                        }
                      } else if (isSelected) {
                        borderColor = "#d946ef";
                        boxShadow = "0 0 25px rgba(217,70,239,0.6), 0 4px 20px rgba(0,0,0,0.3)";
                        bg = "linear-gradient(135deg, rgba(147,51,234,0.3), rgba(126,34,206,0.2))";
                      }

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleAnswerClick(opt.id)}
                          disabled={locked}
                          style={{
                            position: "relative",
                            padding: "clamp(16px, 3vw, 20px) clamp(14px, 3vw, 18px)",
                            borderRadius: "clamp(16px, 3vw, 20px)",
                            border: `3px solid ${borderColor}`,
                            background: bg,
                            color: "#f8fafc",
                            textAlign: "left",
                            cursor: locked ? "default" : "pointer",
                            boxShadow,
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            overflow: "hidden",
                            opacity: locked && !isSelected && !isCorrectOpt ? 0.4 : 1,
                            transform: isSelected && !locked ? "scale(1.02)" : "scale(1)",
                          }}
                          onMouseEnter={(e) => {
                            if (!locked) {
                              e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                              e.currentTarget.style.boxShadow = "0 0 30px rgba(139,92,246,0.5), 0 8px 25px rgba(0,0,0,0.4)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!locked) {
                              e.currentTarget.style.transform = "translateY(0) scale(1)";
                              e.currentTarget.style.boxShadow = boxShadow;
                            }
                          }}>
                          
                          {/* Shine Effect */}
                          {!locked && (
                            <div style={{
                              position: "absolute",
                              top: 0,
                              left: "-100%",
                              width: "50%",
                              height: "100%",
                              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                              animation: "shine 3s infinite",
                              pointerEvents: "none",
                            }} />
                          )}

                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            position: "relative",
                            zIndex: 2,
                          }}>
                            {/* Option Letter */}
                            <div style={{
                              width: "clamp(36px, 7vw, 44px)",
                              height: "clamp(36px, 7vw, 44px)",
                              borderRadius: "12px",
                              border: `2px solid ${borderColor}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "clamp(16px, 3vw, 20px)",
                              fontWeight: 900,
                              background: "rgba(15,23,42,0.9)",
                              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)",
                              color: isCorrectOpt && locked
                                ? "#22c55e"
                                : isSelected && locked && !isCorrectOpt
                                ? "#ef4444"
                                : "#a78bfa",
                              flexShrink: 0,
                            }}>
                              {opt.id}
                            </div>
                            
                            {/* Option Text */}
                            <div style={{
                              fontSize: "clamp(14px, 3vw, 16px)",
                              fontWeight: 600,
                              color: "#f8fafc",
                              lineHeight: 1.4,
                            }}>
                              {opt.text}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </article>
              ) : (
                /* EXPLANATION SCREEN */
                <article className="animate-slide-up" style={{
                  padding: "clamp(24px, 5vw, 32px) clamp(20px, 4vw, 28px)",
                  borderRadius: "clamp(24px, 5vw, 32px)",
                  border: "2px solid rgba(56,189,248,0.5)",
                  background: "linear-gradient(135deg, rgba(8,47,73,0.95), rgba(6,8,20,0.95))",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(56,189,248,0.3)",
                  backdropFilter: "blur(20px)",
                  marginBottom: "24px",
                }}>
                  
                  {/* Result Header */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                  }}>
                    {isCorrect ? (
                      <>
                        <CheckCircle style={{
                          width: "32px",
                          height: "32px",
                          color: "#22c55e",
                          filter: "drop-shadow(0 0 10px #22c55e)",
                        }} />
                        <span style={{
                          fontSize: "clamp(20px, 4vw, 26px)",
                          fontWeight: 900,
                          color: "#22c55e",
                          textShadow: "0 0 10px rgba(34,197,94,0.5)",
                        }}>
                          Correct Answer!
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle style={{
                          width: "32px",
                          height: "32px",
                          color: "#ef4444",
                          filter: "drop-shadow(0 0 10px #ef4444)",
                        }} />
                        <span style={{
                          fontSize: "clamp(20px, 4vw, 26px)",
                          fontWeight: 900,
                          color: "#ef4444",
                          textShadow: "0 0 10px rgba(239,68,68,0.5)",
                        }}>
                          Incorrect
                        </span>
                      </>
                    )}
                  </div>

                  {/* Correct Answer Info */}
                  <div style={{
                    padding: "14px 18px",
                    borderRadius: "16px",
                    background: "rgba(22,163,74,0.15)",
                    border: "2px solid rgba(34,197,94,0.4)",
                    marginBottom: "16px",
                  }}>
                    <span style={{
                      fontSize: "clamp(13px, 2.8vw, 15px)",
                      color: "#86efac",
                      fontWeight: 700,
                    }}>
                      Correct Answer:{" "}
                      <span style={{
                        color: "#22c55e",
                        fontWeight: 900,
                        fontSize: "clamp(15px, 3.2vw, 18px)",
                      }}>
                        {currentQ.correctAnswer}
                      </span>
                    </span>
                  </div>

                  {/* Explanation */}
                  <p style={{
                    fontSize: "clamp(14px, 3vw, 16px)",
                    color: "#e0f2fe",
                    lineHeight: 1.7,
                    marginBottom: "20px",
                    fontWeight: 500,
                  }}>
                    {currentQ.explanation}
                  </p>

                  {/* Next Question Timer */}
                  <div style={{
                    padding: "14px 20px",
                    borderRadius: "16px",
                    background: "rgba(15,23,42,0.9)",
                    border: "1px solid rgba(56,189,248,0.3)",
                    textAlign: "center",
                  }}>
                    <p style={{
                      fontSize: "clamp(12px, 2.5vw, 14px)",
                      color: "#94a3b8",
                      fontWeight: 600,
                    }}>
                      Next question in{" "}
                      <span style={{
                        color: "#22d3ee",
                        fontWeight: 900,
                        fontSize: "clamp(14px, 3vw, 18px)",
                        textShadow: "0 0 10px rgba(34,211,238,0.5)",
                      }}>
                        {explanationTimer}
                      </span>
                      {" "}seconds...
                    </p>
                  </div>
                </article>
              )}

              {/* Progress Dots */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "clamp(4px, 1vw, 6px)",
                padding: "0 16px",
              }}>
                {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => {
                  const st = answers[i];
                  let bg = "rgba(75,85,99,0.4)";
                  let shadow = "none";
                  
                  if (i === currentIndex) {
                    bg = "#a78bfa";
                    shadow = "0 0 10px rgba(167,139,250,0.8)";
                  } else if (st === "correct") {
                    bg = "#22c55e";
                    shadow = "0 0 8px rgba(34,197,94,0.6)";
                  } else if (st === "wrong") {
                    bg = "#ef4444";
                    shadow = "0 0 8px rgba(239,68,68,0.6)";
                  }
                  
                  return (
                    <div
                      key={i}
                      style={{
                        width: "clamp(6px, 1.5vw, 8px)",
                        height: "clamp(6px, 1.5vw, 8px)",
                        borderRadius: "50%",
                        background: bg,
                        boxShadow: shadow,
                        transition: "all 0.3s ease",
                        transform: i === currentIndex ? "scale(1.3)" : "scale(1)",
                      }}
                    />
                  );
                })}
              </div>
            </>
          )}

          {/* EXIT CONFIRMATION MODAL */}
          {showExitConfirm && (
            <div style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "20px",
            }}>
              <div className="animate-slide-up" style={{
                width: "min(400px, 90vw)",
                padding: "32px 28px",
                borderRadius: "24px",
                background: "linear-gradient(135deg, rgba(30,27,75,0.98), rgba(15,23,42,0.98))",
                border: "2px solid rgba(139,92,246,0.5)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(139,92,246,0.4)",
                textAlign: "center",
                backdropFilter: "blur(20px)",
              }}>
                
                {/* Warning Icon */}
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.1))",
                  border: "2px solid rgba(239,68,68,0.5)",
                  marginBottom: "20px",
                }}>
                  <Zap style={{
                    width: "32px",
                    height: "32px",
                    color: "#ef4444",
                    filter: "drop-shadow(0 0 10px #ef4444)",
                  }} />
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: "clamp(18px, 4vw, 22px)",
                  fontWeight: 900,
                  color: "#f8fafc",
                  marginBottom: "12px",
                }}>
                  Exit Quiz?
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: "clamp(13px, 2.8vw, 15px)",
                  color: "#94a3b8",
                  marginBottom: "28px",
                  lineHeight: 1.6,
                }}>
                  Your current progress will be saved and you'll see your final score.
                </p>

                {/* Buttons */}
                <div style={{
                  display: "flex",
                  gap: "12px",
                }}>
                  <button
                    onClick={handleExitConfirmNo}
                    style={{
                      flex: 1,
                      padding: "14px 20px",
                      borderRadius: "999px",
                      border: "2px solid rgba(139,92,246,0.6)",
                      background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.2))",
                      color: "#f8fafc",
                      fontWeight: 800,
                      fontSize: "clamp(13px, 2.8vw, 15px)",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 0 25px rgba(139,92,246,0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}>
                    Continue Quiz
                  </button>
                  
                  <button
                    onClick={handleExitConfirmYes}
                    style={{
                      flex: 1,
                      padding: "14px 20px",
                      borderRadius: "999px",
                      border: "2px solid rgba(239,68,68,0.6)",
                      background: "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(185,28,28,0.2))",
                      color: "#f8fafc",
                      fontWeight: 800,
                      fontSize: "clamp(13px, 2.8vw, 15px)",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 0 25px rgba(239,68,68,0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}>
                    Yes, Exit
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}