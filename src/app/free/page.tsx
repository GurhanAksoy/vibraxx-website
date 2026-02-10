"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Award,
  Volume2,
  VolumeX,
  AlertCircle,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// 🎖️ CANONICAL ARCHITECTURE - PHASE-DRIVEN QUIZ SYSTEM
// DATABASE = COMMANDER | FRONTEND = SOLDIER | PHASE = LAW
// ═══════════════════════════════════════════════════════════════════════════

// ============================================
// CONSTANTS
// ============================================
const TOTAL_QUESTIONS = 20;
const QUESTION_DURATION = 6;
const EXPLANATION_DURATION = 6;
const FINAL_SCORE_DURATION = 30;
const INITIAL_COUNTDOWN = 6;

type OptionId = "a" | "b" | "c" | "d";
type AnswerStatus = "none" | "correct" | "wrong";

// 🎯 CANONICAL PHASE MODEL (SINGLE SOURCE OF TRUTH)
type QuizPhase =
  | "INIT" // Security check + data fetch
  | "COUNTDOWN" // 6 → 1 countdown animation
  | "QUESTION" // Question display + tick sound
  | "EXPLANATION" // Answer reveal + explanation
  | "FINAL"; // Score summary

interface Question {
  id: number;
  category_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: OptionId;
  explanation: string;
}

export default function FreeQuizPage() {
  const router = useRouter();

  // ============================================
  // 🎯 PHASE SYSTEM (CANONICAL STATE)
  // ============================================
  const [phase, setPhase] = useState<QuizPhase>("INIT");

  // ============================================
  // CORE STATE
  // ============================================
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<OptionId | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  // COUNTERS
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answers, setAnswers] = useState<AnswerStatus[]>(
    Array(TOTAL_QUESTIONS).fill("none")
  );

  // TIMERS (ONLY COUNT)
  const [countdownTime, setCountdownTime] = useState(INITIAL_COUNTDOWN);
  const [questionTime, setQuestionTime] = useState(QUESTION_DURATION);
  const [explanationTime, setExplanationTime] = useState(EXPLANATION_DURATION);
  const [finalTime, setFinalTime] = useState(FINAL_SCORE_DURATION);

  // UI STATE
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showAlreadyPlayedModal, setShowAlreadyPlayedModal] = useState(false);

  // ============================================
  // AUDIO REFS
  // ============================================
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const whooshSoundRef = useRef<HTMLAudioElement | null>(null);
  const tickSoundRef = useRef<HTMLAudioElement | null>(null);
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const entrySoundRef = useRef<HTMLAudioElement | null>(null);

  // CANONICAL: ensure entry plays ONCE
  const entryPlayedRef = useRef(false);

  // CANONICAL: ensure whoosh plays ONCE per transition into EXPLANATION
  const lastPhaseRef = useRef<QuizPhase>("INIT");

  const currentQ = questions[currentIndex];

  // ============================================
  // SEO & META TAGS
  // ============================================
  useEffect(() => {
    document.title = "Free Quiz Practice - VibraXX | Skill-Based Competition";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Practice your knowledge with our free weekly quiz. 20 questions, instant feedback, and detailed explanations. Perfect preparation for live competitions!"
      );
    }
  }, []);

  // ============================================
  // AUDIO HELPERS (SAFE)
  // ============================================
  const playSound = useCallback(
    (audio: HTMLAudioElement | null, options?: { loop?: boolean }) => {
      if (!isSoundEnabled || !audio) return;
      try {
        audio.loop = !!options?.loop;
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } catch {}
    },
    [isSoundEnabled]
  );

  const stopSound = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;
  }, []);

  const playClick = useCallback(() => {
    playSound(clickSoundRef.current);
  }, [playSound]);

  // ============================================
  // 🔐 INIT PHASE - SECURITY & DATA FETCH
  // ============================================
  useEffect(() => {
    if (phase !== "INIT") return;

    const verifyAndFetchFreeQuiz = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // ✅ CANONICAL: Check eligibility via RPC
        const { data: eligibility, error: eligibilityError } = await supabase.rpc(
          "check_free_quiz_eligibility",
          { p_user_id: user.id }
        );

        if (eligibilityError || !eligibility?.eligible) {
          setShowAlreadyPlayedModal(true);
          return;
        }

        // ✅ CANONICAL: Fetch questions
        const { data: fetchedQuestions, error: questionsError } = await supabase.rpc(
          "get_free_quiz_questions",
          { p_user_id: user.id }
        );

        if (questionsError || !fetchedQuestions || fetchedQuestions.length < TOTAL_QUESTIONS) {
          setShowAlreadyPlayedModal(true);
          return;
        }

        setQuestions(fetchedQuestions);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setIsCorrect(false);
        setCorrectCount(0);
        setWrongCount(0);
        setAnswers(Array(TOTAL_QUESTIONS).fill("none"));

        // RESET audio guards
        entryPlayedRef.current = false;
        lastPhaseRef.current = "INIT";

        // INIT → COUNTDOWN
        setPhase("COUNTDOWN");
      } catch {
        setShowAlreadyPlayedModal(true);
      }
    };

    verifyAndFetchFreeQuiz();
  }, [phase, router]);

  // ============================================
  // ⏰ COUNTDOWN PHASE TIMER (6 → 0)
  // ============================================
  useEffect(() => {
    if (phase !== "COUNTDOWN") return;

    setCountdownTime(INITIAL_COUNTDOWN);

    const interval = setInterval(() => {
      setCountdownTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const timeout = setTimeout(() => {
      setPhase("QUESTION");
    }, INITIAL_COUNTDOWN * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [phase]);

  // ============================================
  // 🎯 QUESTION PHASE TIMER (6 → 0)
  // IMPORTANT: Answer DOES NOT switch to EXPLANATION early.
  // It only LOCKS. EXPLANATION opens ONLY when timer ends.
  // ============================================
  useEffect(() => {
    if (phase !== "QUESTION") return;

    setQuestionTime(QUESTION_DURATION);

    const interval = setInterval(() => {
      setQuestionTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const timeout = setTimeout(() => {
      // If no answer selected → auto wrong
      if (selectedAnswer === null) {
        setWrongCount((w) => w + 1);
        setAnswers((prev) => {
          const copy = [...prev];
          copy[currentIndex] = "wrong";
          return copy;
        });
        setIsCorrect(false);
      }

      // QUESTION → EXPLANATION
      setPhase("EXPLANATION");
    }, QUESTION_DURATION * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [phase, currentIndex, selectedAnswer]);

  // ============================================
  // 📖 EXPLANATION PHASE TIMER (6s)
  // ============================================
  useEffect(() => {
    if (phase !== "EXPLANATION") return;

    setExplanationTime(EXPLANATION_DURATION);

    const interval = setInterval(() => {
      setExplanationTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const timeout = setTimeout(() => {
      if (currentIndex < TOTAL_QUESTIONS - 1) {
        setCurrentIndex((i) => i + 1);
        setSelectedAnswer(null);
        setIsCorrect(false);

        // EXPLANATION → QUESTION
        setPhase("QUESTION");
      } else {
        setPhase("FINAL");
      }
    }, EXPLANATION_DURATION * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [phase, currentIndex]);

  // ============================================
  // 🏁 FINAL PHASE TIMER & SUBMIT
  // ============================================
  useEffect(() => {
    if (phase !== "FINAL") return;

    stopSound(tickSoundRef.current);
    playSound(gameoverSoundRef.current);

    const submitResult = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        await supabase.rpc("submit_free_quiz_result", {
          p_user_id: user.id,
          p_correct_count: correctCount,
          p_wrong_count: wrongCount,
          p_total_questions: TOTAL_QUESTIONS,
        });
      } catch {}
    };

    submitResult();

    setFinalTime(FINAL_SCORE_DURATION);

    const interval = setInterval(() => {
      setFinalTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const timeout = setTimeout(() => {
      router.push("/");
    }, FINAL_SCORE_DURATION * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [phase, router, correctCount, wrongCount, playSound, stopSound]);

  // ============================================
  // 🔊 CANONICAL AUDIO ROUTER (PHASE-DRIVEN)
  // ============================================
  useEffect(() => {
    const prev = lastPhaseRef.current;
    const next = phase;
    lastPhaseRef.current = next;

    // Tick loop only in QUESTION
    if (next === "QUESTION") {
      playSound(tickSoundRef.current, { loop: true });

      // Entry only once, first QUESTION entry
      if (!entryPlayedRef.current) {
        entryPlayedRef.current = true;
        playSound(entrySoundRef.current);
      } else {
        // Start at every new question
        playSound(startSoundRef.current);
      }
    } else {
      stopSound(tickSoundRef.current);
    }

    // Whoosh only when entering EXPLANATION
    if (prev !== "EXPLANATION" && next === "EXPLANATION") {
      playSound(whooshSoundRef.current);
    }
  }, [phase, currentIndex, playSound, stopSound]);

  // ============================================
  // 🎯 ANSWER HANDLER (LOCK ONLY)
  // ============================================
  const handleAnswerClick = (optionId: OptionId) => {
    if (phase !== "QUESTION") return;
    if (!currentQ) return;
    if (selectedAnswer !== null) return; // already locked

    playClick();

    setSelectedAnswer(optionId);

    const correct = optionId === currentQ.correct_option;
    setIsCorrect(correct);

    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = correct ? "correct" : "wrong";
      return next;
    });

    if (correct) {
      setCorrectCount((c) => c + 1);
      playSound(correctSoundRef.current);
    } else {
      setWrongCount((w) => w + 1);
      playSound(wrongSoundRef.current);
    }

    // IMPORTANT: do NOT set phase here.
    // Explanation will open when 6s ends (timer).
  };

  // ============================================
  // SOUND TOGGLE
  // ============================================
  const handleSoundToggle = () => {
    if (isSoundEnabled) playClick();
    setIsSoundEnabled((prev) => !prev);
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const getTimeColor = () => {
    if (questionTime > 4) return "#22c55e";
    if (questionTime > 2) return "#eab308";
    return "#ef4444";
  };

  const accuracy =
    TOTAL_QUESTIONS > 0
      ? Math.round((correctCount / TOTAL_QUESTIONS) * 100)
      : 0;

  // ============================================
  // 📺 RENDER: ALREADY PLAYED MODAL
  // ============================================
  if (showAlreadyPlayedModal) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          className="animate-slide-up"
          style={{
            width: "min(460px, 95vw)",
            padding: "32px 28px",
            borderRadius: 28,
            background:
              "radial-gradient(circle at top, rgba(15,23,42,1), rgba(6,8,20,1))",
            border: "1px solid rgba(251,191,36,0.3)",
            boxShadow: "0 0 50px rgba(251,191,36,0.25)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              margin: "0 auto 24px",
              borderRadius: "50%",
              background: "rgba(251,191,36,0.15)",
              border: "2px solid rgba(251,191,36,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 30px rgba(251,191,36,0.3)",
            }}
          >
            <AlertCircle style={{ width: 44, height: 44, color: "#fbbf24" }} />
          </div>

          <h2
            style={{
              fontSize: 26,
              fontWeight: 900,
              marginBottom: 12,
              background: "linear-gradient(to right, #fbbf24, #f59e0b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.02em",
            }}
          >
            Already Played This Week! 🎮
          </h2>

          <p
            style={{
              fontSize: 15,
              color: "#cbd5e1",
              lineHeight: 1.7,
              marginBottom: 8,
            }}
          >
            You've completed your free quiz for this week.
          </p>

          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 28 }}>
            Come back next Monday for a new set of questions, or join our live
            competitions to keep playing! 🏆
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => {
                playClick();
                router.push("/");
              }}
              style={{
                flex: 1,
                minWidth: 140,
                maxWidth: 180,
                padding: "14px 24px",
                borderRadius: 9999,
                border: "none",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(124,58,237,0.5)",
                transition: "all 0.3s",
              }}
            >
              Go Home
            </button>

            <button
              onClick={() => {
                playClick();
                router.push("/lobby");
              }}
              style={{
                flex: 1,
                minWidth: 140,
                maxWidth: 180,
                padding: "14px 24px",
                borderRadius: 9999,
                border: "1px solid rgba(167,139,250,0.6)",
                background: "transparent",
                color: "#e5e7eb",
                fontSize: 14,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              Live Quiz
            </button>
          </div>
        </div>

        {/* Audio Elements */}
        <audio ref={correctSoundRef} src="/sounds/correct.mp3" />
        <audio ref={wrongSoundRef} src="/sounds/wrong.mp3" />
        <audio ref={clickSoundRef} src="/sounds/click.mp3" />
        <audio ref={gameoverSoundRef} src="/sounds/gameover.mp3" />
        <audio ref={whooshSoundRef} src="/sounds/whoosh.mp3" />
        <audio ref={tickSoundRef} src="/sounds/tick.mp3" />
        <audio ref={startSoundRef} src="/sounds/start.mp3" />
        <audio ref={entrySoundRef} src="/sounds/entry.mp3" />
      </div>
    );
  }

  // ============================================
  // 📺 RENDER: INIT PHASE (Loading)
  // ============================================
  if (phase === "INIT") {
    return (
      <>
        <style jsx global>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
        <div
          style={{
            minHeight: "100vh",
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              border: "4px solid rgba(124,58,237,0.3)",
              borderTop: "4px solid #7c3aed",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: 20,
            }}
          />
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#a78bfa",
              letterSpacing: "0.1em",
            }}
          >
            LOADING QUIZ...
          </div>
        </div>

        {/* Audio Elements */}
        <audio ref={correctSoundRef} src="/sounds/correct.mp3" />
        <audio ref={wrongSoundRef} src="/sounds/wrong.mp3" />
        <audio ref={clickSoundRef} src="/sounds/click.mp3" />
        <audio ref={gameoverSoundRef} src="/sounds/gameover.mp3" />
        <audio ref={whooshSoundRef} src="/sounds/whoosh.mp3" />
        <audio ref={tickSoundRef} src="/sounds/tick.mp3" />
        <audio ref={startSoundRef} src="/sounds/start.mp3" />
        <audio ref={entrySoundRef} src="/sounds/entry.mp3" />
      </>
    );
  }

  // ============================================
  // 📺 RENDER: COUNTDOWN PHASE
  // ============================================
  if (phase === "COUNTDOWN") {
    return (
      <>
        <style jsx global>{`
          @keyframes pulseGlow {
            0%,
            100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.05);
            }
          }
          @keyframes ripple {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
          .animate-pulse-glow {
            animation: pulseGlow 2s ease-in-out infinite;
          }
        `}</style>

        <div
          style={{
            minHeight: "100vh",
            maxHeight: "100vh",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #7c3aed 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            position: "relative",
          }}
        >
          {/* Animated Background Circles */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(124,58,237,0.3), transparent 70%)",
              animation: "ripple 3s ease-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(217,70,239,0.3), transparent 70%)",
              animation: "ripple 3s ease-out infinite 1s",
            }}
          />

          {/* Center Icon */}
          <div
            className="animate-pulse-glow"
            style={{
              width: "140px",
              height: "140px",
              marginBottom: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #d946ef)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 0 80px rgba(124,58,237,0.9), inset 0 0 40px rgba(255,255,255,0.2)",
              border: "4px solid rgba(255,255,255,0.3)",
              position: "relative",
              zIndex: 2,
            }}
          >
            <Trophy style={{ width: 70, height: 70, color: "white" }} />
          </div>

          {/* Countdown Number */}
          <div
            style={{
              fontSize: "clamp(80px, 20vw, 140px)",
              fontWeight: 900,
              background: "linear-gradient(135deg, #ffffff, #d946ef)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
              marginBottom: "30px",
              textShadow: "0 0 60px rgba(217,70,239,0.8)",
              position: "relative",
              zIndex: 2,
            }}
          >
            {countdownTime}
          </div>

          {/* Get Ready Text */}
          <div
            style={{
              fontSize: "clamp(20px, 4vw, 28px)",
              fontWeight: 700,
              color: "#e5e7eb",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              textAlign: "center",
              position: "relative",
              zIndex: 2,
            }}
          >
            Get Ready! 🎯
          </div>
        </div>

        {/* Audio Elements */}
        <audio ref={correctSoundRef} src="/sounds/correct.mp3" />
        <audio ref={wrongSoundRef} src="/sounds/wrong.mp3" />
        <audio ref={clickSoundRef} src="/sounds/click.mp3" />
        <audio ref={gameoverSoundRef} src="/sounds/gameover.mp3" />
        <audio ref={whooshSoundRef} src="/sounds/whoosh.mp3" />
        <audio ref={tickSoundRef} src="/sounds/tick.mp3" />
        <audio ref={startSoundRef} src="/sounds/start.mp3" />
        <audio ref={entrySoundRef} src="/sounds/entry.mp3" />
      </>
    );
  }

  // ============================================
  // 📺 RENDER: QUESTION, EXPLANATION, FINAL PHASES
  // ============================================
  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shine {
          from {
            left: -100%;
          }
          to {
            left: 200%;
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 1s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>

      {/* Audio Elements */}
      <audio ref={correctSoundRef} src="/sounds/correct.mp3" />
      <audio ref={wrongSoundRef} src="/sounds/wrong.mp3" />
      <audio ref={clickSoundRef} src="/sounds/click.mp3" />
      <audio ref={gameoverSoundRef} src="/sounds/gameover.mp3" />
      <audio ref={whooshSoundRef} src="/sounds/whoosh.mp3" />
      <audio ref={tickSoundRef} src="/sounds/tick.mp3" />
      <audio ref={startSoundRef} src="/sounds/start.mp3" />
      <audio ref={entrySoundRef} src="/sounds/entry.mp3" />

      <div
        style={{
          minHeight: "100vh",
          maxHeight: "100vh",
          overflow: "hidden",
          background: "linear-gradient(to bottom right, #0a1628, #064e3b, #0f172a)",
          color: "white",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Background Glows */}
        <div
          className="animate-float"
          style={{
            position: "fixed",
            top: "5%",
            left: "2%",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.4), transparent 70%)",
            filter: "blur(40px)",
            opacity: 0.5,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          className="animate-float"
          style={{
            position: "fixed",
            bottom: "5%",
            right: "3%",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(217,70,239,0.35), transparent 70%)",
            filter: "blur(45px)",
            opacity: 0.45,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* MAIN CONTENT */}
        <main
          style={{
            flex: 1,
            position: "relative",
            zIndex: 1,
            maxWidth: "900px",
            margin: "0 auto",
            padding: "clamp(16px, 3vw, 24px)",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* 🏁 FINAL SCORE SCREEN */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {phase === "FINAL" && (
            <div
              className="animate-slide-up"
              style={{
                padding: "clamp(24px, 4vw, 36px) clamp(20px, 3vw, 28px)",
                borderRadius: "clamp(20px, 3vw, 28px)",
                background:
                  "radial-gradient(circle at top, rgba(15,23,42,0.98), rgba(6,8,20,1))",
                border: "1px solid rgba(124,58,237,0.4)",
                boxShadow: "0 0 50px rgba(124,58,237,0.4)",
                textAlign: "center",
              }}
            >
              {/* Trophy Icon */}
              <div
                style={{
                  width: "clamp(80px, 15vw, 100px)",
                  height: "clamp(80px, 15vw, 100px)",
                  margin: "0 auto clamp(20px, 3vw, 28px)",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed, #d946ef)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 40px rgba(124,58,237,0.8)",
                  border: "3px solid rgba(255,255,255,0.2)",
                }}
              >
                <Trophy
                  style={{
                    width: "clamp(40px, 8vw, 50px)",
                    height: "clamp(40px, 8vw, 50px)",
                    color: "white",
                  }}
                />
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: "clamp(24px, 5vw, 32px)",
                  fontWeight: 900,
                  marginBottom: "clamp(12px, 2vw, 16px)",
                  background: "linear-gradient(to right, #a78bfa, #d946ef)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "0.05em",
                }}
              >
                Quiz Complete! 🎉
              </h1>

              {/* Stats Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "clamp(10px, 2vw, 14px)",
                  marginBottom: "clamp(20px, 3vw, 28px)",
                }}
              >
                {/* Correct */}
                <div
                  style={{
                    padding: "clamp(12px, 2.5vw, 16px)",
                    borderRadius: "clamp(12px, 2.5vw, 16px)",
                    background: "rgba(22,163,74,0.1)",
                    border: "1px solid rgba(34,197,94,0.4)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(24px, 5vw, 32px)",
                      fontWeight: 900,
                      color: "#22c55e",
                      marginBottom: "4px",
                    }}
                  >
                    {correctCount}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(10px, 2vw, 12px)",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Correct
                  </div>
                </div>

                {/* Wrong */}
                <div
                  style={{
                    padding: "clamp(12px, 2.5vw, 16px)",
                    borderRadius: "clamp(12px, 2.5vw, 16px)",
                    background: "rgba(127,29,29,0.1)",
                    border: "1px solid rgba(239,68,68,0.4)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(24px, 5vw, 32px)",
                      fontWeight: 900,
                      color: "#ef4444",
                      marginBottom: "4px",
                    }}
                  >
                    {wrongCount}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(10px, 2vw, 12px)",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Wrong
                  </div>
                </div>

                {/* Accuracy */}
                <div
                  style={{
                    padding: "clamp(12px, 2.5vw, 16px)",
                    borderRadius: "clamp(12px, 2.5vw, 16px)",
                    background: "rgba(124,58,237,0.1)",
                    border: "1px solid rgba(168,85,247,0.4)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(24px, 5vw, 32px)",
                      fontWeight: 900,
                      color: "#a78bfa",
                      marginBottom: "4px",
                    }}
                  >
                    {accuracy}%
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(10px, 2vw, 12px)",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Accuracy
                  </div>
                </div>
              </div>

              {/* Message */}
              <p
                style={{
                  fontSize: "clamp(14px, 2.5vw, 16px)",
                  color: "#cbd5e1",
                  lineHeight: 1.6,
                  marginBottom: "clamp(8px, 1.5vw, 12px)",
                }}
              >
                Great job! Come back next week for a new free quiz, or join our
                live competitions to keep playing! 🏆
              </p>

              {/* Countdown */}
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "clamp(11px, 2vw, 12px)",
                  color: "#9ca3af",
                }}
              >
                Returning to home in{" "}
                <span style={{ color: "#10b981", fontWeight: 800 }}>
                  {finalTime}
                </span>{" "}
                seconds...
              </div>

              {/* Home Button */}
              <button
                onClick={() => {
                  playClick();
                  router.push("/");
                }}
                style={{
                  marginTop: "clamp(20px, 3vw, 28px)",
                  padding: "clamp(12px, 2.5vw, 14px) clamp(24px, 4vw, 32px)",
                  borderRadius: 9999,
                  border: "none",
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  color: "white",
                  fontSize: "clamp(12px, 2.5vw, 14px)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  boxShadow: "0 0 20px rgba(124,58,237,0.6)",
                  transition: "all 0.3s",
                }}
              >
                Go Home Now
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* 📝 QUESTION PHASE */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {phase === "QUESTION" && currentQ && (
            <>
              {/* Timer & Sound Toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "clamp(12px, 2vw, 16px)",
                  gap: "12px",
                }}
              >
                {/* Timer */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)",
                    borderRadius: "clamp(12px, 2.5vw, 16px)",
                    background: "rgba(6,8,20,0.9)",
                    border: `2px solid ${getTimeColor()}`,
                    boxShadow: `0 0 20px ${getTimeColor()}40`,
                  }}
                >
                  <Clock
                    style={{
                      width: "clamp(18px, 3.5vw, 22px)",
                      height: "clamp(18px, 3.5vw, 22px)",
                      color: getTimeColor(),
                    }}
                  />
                  <span
                    style={{
                      fontSize: "clamp(24px, 5vw, 32px)",
                      fontWeight: 900,
                      color: getTimeColor(),
                    }}
                  >
                    {questionTime}s
                  </span>
                </div>

                {/* Sound Toggle */}
                <button
                  onClick={handleSoundToggle}
                  style={{
                    minWidth: "44px",
                    minHeight: "44px",
                    padding: "clamp(10px, 2vw, 12px)",
                    borderRadius: "clamp(10px, 2vw, 12px)",
                    border: "1px solid rgba(148,163,253,0.4)",
                    background: "rgba(6,8,20,0.9)",
                    color: "#a78bfa",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSoundEnabled ? (
                    <Volume2 style={{ width: 20, height: 20 }} />
                  ) : (
                    <VolumeX style={{ width: 20, height: 20 }} />
                  )}
                </button>
              </div>

              {/* Question Card */}
              <div
                className="animate-slide-up"
                style={{
                  marginBottom: "clamp(16px, 3vw, 20px)",
                  padding: "clamp(18px, 3vw, 24px)",
                  borderRadius: "clamp(20px, 3vw, 26px)",
                  border: "1px solid rgba(129,140,248,0.35)",
                  background:
                    "radial-gradient(circle at top, rgba(17,24,39,0.98), rgba(6,8,20,1))",
                  boxShadow: "0 0 32px rgba(79,70,229,0.3)",
                }}
              >
                {/* Question Number */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: "clamp(10px, 2vw, 12px)",
                  }}
                >
                  <Target
                    style={{
                      width: "clamp(16px, 3vw, 18px)",
                      height: "clamp(16px, 3vw, 18px)",
                      color: "#a78bfa",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "clamp(11px, 2vw, 12px)",
                      color: "#9ca3af",
                      fontWeight: 600,
                      letterSpacing: "0.16em",
                    }}
                  >
                    QUESTION {currentIndex + 1} / {TOTAL_QUESTIONS}
                  </span>
                </div>

                {/* Question Text */}
                <h2
                  style={{
                    fontSize: "clamp(16px, 3.5vw, 19px)",
                    lineHeight: 1.5,
                    fontWeight: 700,
                    marginBottom: "clamp(16px, 3vw, 18px)",
                    color: "#e5e7eb",
                  }}
                >
                  {currentQ.question_text}
                </h2>

                {/* Options Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(clamp(140px, 40vw, 200px), 1fr))",
                    gap: "clamp(10px, 2vw, 12px)",
                  }}
                >
                  {(["a", "b", "c", "d"] as OptionId[]).map((optId) => {
                    const optText = currentQ[
                      `option_${optId}` as keyof Question
                    ] as string;

                    const locked = selectedAnswer !== null;
                    const isSelected = selectedAnswer === optId;

                    let borderColor = "rgba(129,140,248,0.6)";
                    let boxShadow = "0 0 10px rgba(15,23,42,0.9)";
                    let bg =
                      "linear-gradient(135deg, rgba(9,9,18,0.98), rgba(15,23,42,0.98))";

                    if (isSelected) {
                      borderColor = "#d946ef";
                      boxShadow = "0 0 16px rgba(217,70,239,0.7)";
                      bg =
                        "linear-gradient(135deg, rgba(24,24,48,1), rgba(15,23,42,1))";
                    }

                    return (
                      <button
                        key={optId}
                        onClick={() => handleAnswerClick(optId)}
                        disabled={locked}
                        style={{
                          position: "relative",
                          padding: "clamp(12px, 2.5vw, 14px)",
                          borderRadius: "clamp(14px, 3vw, 18px)",
                          border: `2px solid ${borderColor}`,
                          background: bg,
                          color: "#e5e7eb",
                          textAlign: "left",
                          cursor: locked ? "default" : "pointer",
                          boxShadow,
                          transition: "all 0.22s",
                          overflow: "hidden",
                          opacity: locked && !isSelected ? 0.9 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!locked && window.innerWidth > 768) {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 0 18px rgba(217,70,239,0.7)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!locked && window.innerWidth > 768) {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = boxShadow;
                          }
                        }}
                      >
                        {/* Inner border */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "clamp(14px, 3vw, 18px)",
                            border: "1px solid rgba(129,140,248,0.16)",
                            pointerEvents: "none",
                          }}
                        />

                        {/* Shine effect */}
                        {!locked && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: "-100%",
                              width: "40%",
                              height: "100%",
                              background:
                                "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                              animation: "shine 2.4s infinite",
                              pointerEvents: "none",
                            }}
                          />
                        )}

                        {/* Content */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "clamp(8px, 2vw, 10px)",
                            position: "relative",
                            zIndex: 2,
                          }}
                        >
                          <div
                            style={{
                              width: "clamp(28px, 5vw, 32px)",
                              height: "clamp(28px, 5vw, 32px)",
                              borderRadius: "clamp(8px, 2vw, 10px)",
                              border: "1px solid rgba(148,163,253,0.4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "clamp(12px, 2.5vw, 14px)",
                              fontWeight: 800,
                              background: "rgba(10,16,30,1)",
                              boxShadow: "0 2px 8px rgba(15,23,42,0.9)",
                              color: "#a78bfa",
                              flexShrink: 0,
                            }}
                          >
                            {optId.toUpperCase()}
                          </div>
                          <div
                            style={{
                              fontSize: "clamp(12px, 2.5vw, 13px)",
                              fontWeight: 500,
                              color: "#e5e7eb",
                              lineHeight: 1.4,
                            }}
                          >
                            {optText}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress Dots */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "clamp(6px, 1.5vw, 8px)",
                  justifyContent: "center",
                }}
              >
                {answers.map((st, i) => {
                  let bg = "rgba(75,85,99,0.3)";
                  if (st === "correct") bg = "#22c55e";
                  else if (st === "wrong") bg = "#ef4444";
                  else if (i === currentIndex) bg = "#a855f7";

                  return (
                    <div
                      key={i}
                      style={{
                        width: "clamp(8px, 2vw, 10px)",
                        height: "clamp(8px, 2vw, 10px)",
                        borderRadius: "50%",
                        background: bg,
                        boxShadow:
                          st === "correct"
                            ? "0 0 6px rgba(34,197,94,0.8)"
                            : st === "wrong"
                            ? "0 0 6px rgba(239,68,68,0.8)"
                            : i === currentIndex
                            ? "0 0 6px rgba(168,85,247,0.9)"
                            : "none",
                        transition: "all 0.2s",
                      }}
                    />
                  );
                })}
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* 📖 EXPLANATION PHASE */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {phase === "EXPLANATION" && currentQ && (
            <>
              {/* Explanation Timer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "clamp(12px, 2vw, 16px)",
                }}
              >
                <div
                  style={{
                    padding: "clamp(8px, 1.5vw, 10px) clamp(16px, 3vw, 20px)",
                    borderRadius: "clamp(12px, 2.5vw, 16px)",
                    background: "rgba(6,8,20,0.9)",
                    border: "2px solid rgba(56,189,248,0.5)",
                    boxShadow: "0 0 20px rgba(56,189,248,0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Clock
                    style={{
                      width: "clamp(16px, 3vw, 18px)",
                      height: "clamp(16px, 3vw, 18px)",
                      color: "#38bdf8",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "clamp(14px, 3vw, 16px)",
                      fontWeight: 700,
                      color: "#38bdf8",
                    }}
                  >
                    Next in {explanationTime}s
                  </span>
                </div>
              </div>

              {/* Explanation Card */}
              <div
                className="animate-slide-up"
                style={{
                  marginBottom: "clamp(16px, 3vw, 20px)",
                  padding: "clamp(18px, 3vw, 22px)",
                  borderRadius: "clamp(20px, 3vw, 24px)",
                  border: "1px solid rgba(56,189,248,0.4)",
                  background:
                    "linear-gradient(135deg, rgba(8,47,73,0.96), rgba(6,8,20,1))",
                  boxShadow: "0 0 36px rgba(56,189,248,0.3)",
                }}
              >
                {/* Result Badge */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding:
                      "clamp(8px, 1.5vw, 10px) clamp(14px, 2.5vw, 18px)",
                    borderRadius: 9999,
                    background: isCorrect
                      ? "rgba(22,163,74,0.2)"
                      : "rgba(127,29,29,0.2)",
                    border: isCorrect ? "1px solid #22c55e" : "1px solid #ef4444",
                    marginBottom: "clamp(14px, 2.5vw, 18px)",
                  }}
                >
                  {isCorrect ? (
                    <CheckCircle
                      style={{
                        width: "clamp(16px, 3vw, 18px)",
                        height: "clamp(16px, 3vw, 18px)",
                        color: "#22c55e",
                      }}
                    />
                  ) : (
                    <XCircle
                      style={{
                        width: "clamp(16px, 3vw, 18px)",
                        height: "clamp(16px, 3vw, 18px)",
                        color: "#ef4444",
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: "clamp(12px, 2.5vw, 14px)",
                      fontWeight: 800,
                      color: isCorrect ? "#22c55e" : "#ef4444",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {isCorrect ? "Correct!" : "Wrong"}
                  </span>
                </div>

                {/* Correct Answer */}
                <div style={{ marginBottom: "clamp(12px, 2vw, 16px)" }}>
                  <div
                    style={{
                      fontSize: "clamp(11px, 2vw, 12px)",
                      color: "#94a3b8",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      marginBottom: "6px",
                    }}
                  >
                    CORRECT ANSWER
                  </div>
                  <div
                    style={{
                      padding: "clamp(10px, 2vw, 12px)",
                      borderRadius: "clamp(10px, 2vw, 12px)",
                      background: "rgba(22,163,74,0.1)",
                      border: "1px solid rgba(34,197,94,0.4)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "clamp(24px, 4vw, 28px)",
                        height: "clamp(24px, 4vw, 28px)",
                        borderRadius: "clamp(6px, 1.5vw, 8px)",
                        background: "#22c55e",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "clamp(11px, 2vw, 12px)",
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {currentQ.correct_option.toUpperCase()}
                    </div>
                    <div
                      style={{
                        fontSize: "clamp(13px, 2.5vw, 14px)",
                        fontWeight: 600,
                        color: "#e5e7eb",
                      }}
                    >
                      {
                        currentQ[
                          `option_${currentQ.correct_option}` as keyof Question
                        ] as string
                      }
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <div
                    style={{
                      fontSize: "clamp(11px, 2vw, 12px)",
                      color: "#94a3b8",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      marginBottom: "8px",
                    }}
                  >
                    EXPLANATION
                  </div>
                  <p
                    style={{
                      fontSize: "clamp(13px, 2.5vw, 14px)",
                      lineHeight: 1.6,
                      color: "#cbd5e1",
                    }}
                  >
                    {currentQ.explanation}
                  </p>
                </div>
              </div>

              {/* Progress Dots */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "clamp(6px, 1.5vw, 8px)",
                  justifyContent: "center",
                }}
              >
                {answers.map((st, i) => {
                  let bg = "rgba(75,85,99,0.3)";
                  if (st === "correct") bg = "#22c55e";
                  else if (st === "wrong") bg = "#ef4444";
                  else if (i === currentIndex) bg = "#38bdf8";

                  return (
                    <div
                      key={i}
                      style={{
                        width: "clamp(8px, 2vw, 10px)",
                        height: "clamp(8px, 2vw, 10px)",
                        borderRadius: "50%",
                        background: bg,
                        boxShadow:
                          st === "correct"
                            ? "0 0 6px rgba(34,197,94,0.8)"
                            : st === "wrong"
                            ? "0 0 6px rgba(239,68,68,0.8)"
                            : i === currentIndex
                            ? "0 0 6px rgba(56,189,248,0.8)"
                            : "none",
                        transition: "all 0.2s",
                      }}
                    />
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
