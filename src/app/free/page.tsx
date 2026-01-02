"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
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
} from "lucide-react";

const TOTAL_QUESTIONS = 50; // 🎮 FREE PRACTICE MODE
const QUESTION_DURATION = 6; // saniye
const EXPLANATION_DURATION = 5; // saniye
const FINAL_SCORE_DURATION = 5; // saniye

type OptionId = "A" | "B" | "C" | "D";
type AnswerStatus = "none" | "correct" | "wrong";

interface Question {
  id: number;
  question: string;
  options: { id: OptionId; text: string }[];
  correctAnswer: OptionId;
  explanation: string;
}

export default function FreeQuizPage() {
  const router = useRouter();

  // 🔐 SECURITY STATES
  const [isVerifying, setIsVerifying] = useState(true);
  const [securityPassed, setSecurityPassed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🎮 QUESTIONS STATE (will be loaded from database)
  const [questions, setQuestions] = useState<Question[]>([]);
  const [roundId, setRoundId] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION);
  const [selectedAnswer, setSelectedAnswer] = useState<OptionId | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationTimer, setExplanationTimer] =
    useState(EXPLANATION_DURATION);

  const [showFinalScore, setShowFinalScore] = useState(false);
  const [finalCountdown, setFinalCountdown] =
    useState(FINAL_SCORE_DURATION);

  const [answers, setAnswers] = useState<AnswerStatus[]>(
    Array(TOTAL_QUESTIONS).fill("none")
  );

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Ses ref'leri
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const whooshSoundRef = useRef<HTMLAudioElement | null>(null);
  const tickSoundRef = useRef<HTMLAudioElement | null>(null);

  const currentQ = questions[currentIndex];

  // 🔐 === SECURITY CHECK & FETCH FREE QUIZ ===
  useEffect(() => {
    const verifyAndFetchFreeQuiz = async () => {
      try {
        console.log("🔐 Free Quiz Security: Starting verification...");

        // CHECK 1: User authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.log("❌ Free Quiz Security: Not authenticated");
          router.push("/");
          return;
        }

        console.log("✅ Free Quiz Security: User authenticated -", user.id);

        // CHECK 2: Get today's free round
        const { data: freeRoundData, error: freeRoundError } = await supabase.rpc(
          "get_today_free_round"
        );

        if (freeRoundError) {
          console.error("❌ Free Quiz Error:", freeRoundError);
          alert("Error loading free quiz. Please try again.");
          router.push("/");
          return;
        }

        // CHECK 3: Has user already played today?
        if (freeRoundData.has_played) {
          console.log("❌ Free Quiz Security: Already played today");
          alert("You've already played your free quiz today! Come back tomorrow.");
          router.push("/");
          return;
        }

        console.log("✅ Free Quiz Security: Free quiz available!");
        setRoundId(freeRoundData.round_id);

        // FETCH QUESTIONS from the free round
        const questionIds = freeRoundData.questions as number[];
        console.log(`✅ Free round has ${questionIds.length} questions`);

        const { data: questionsData, error: questionsError } = await supabase.rpc(
          "get_question_details",
          { p_question_ids: questionIds }
        );

        if (questionsError || !questionsData) {
          console.error("❌ Error fetching questions:", questionsError);
          alert("Error loading quiz questions.");
          router.push("/");
          return;
        }

        console.log(`✅ Loaded ${questionsData.length} questions for free quiz`);

        // Format questions
        const formattedQuestions: Question[] = questionsData.map((q: any) => ({
          id: q.id,
          question: q.question_text,
          options: [
            { id: "A", text: q.option_a },
            { id: "B", text: q.option_b },
            { id: "C", text: q.option_c },
            { id: "D", text: q.option_d },
          ],
          correctAnswer: q.correct_answer as OptionId,
          explanation: q.explanation,
        }));

        setQuestions(formattedQuestions);
        setSecurityPassed(true);
        setIsVerifying(false);
        setIsLoading(false);

        console.log("✅ Free Quiz: Ready to play!");

      } catch (error) {
        console.error("❌ Free Quiz Security: Verification error", error);
        router.push("/");
      }
    };

    verifyAndFetchFreeQuiz();
  }, [router]);

  // Ses helper
  const playSound = (
    audio: HTMLAudioElement | null,
    options?: { loop?: boolean }
  ) => {
    if (!isSoundEnabled || !audio) return;
    try {
      audio.loop = !!options?.loop;
      audio.currentTime = 0;
      audio.play();
    } catch {
      // autoplay engeli vs.
    }
  };

  const stopSound = (audio: HTMLAudioElement | null) => {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;
  };

  const playClick = () => {
    playSound(clickSoundRef.current);
  };

  const startTick = () => {
    playSound(tickSoundRef.current, { loop: true });
  };

  const stopTick = () => {
    stopSound(tickSoundRef.current);
  };

  // İlk soru: tick başlat
  useEffect(() => {
    if (!securityPassed) return; // 🔐 Wait for security
    if (!showFinalScore && !showExplanation && timeLeft > 0) {
      startTick();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ana TIMER (6 → 0)
  useEffect(() => {
    if (showFinalScore || showExplanation) return;
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, showExplanation, showFinalScore]);

  // timeLeft 0 olduğunda → tick dur, gerekiyorsa yanlış say, explanation aç
  useEffect(() => {
    if (showFinalScore || showExplanation) return;
    if (timeLeft !== 0) return;

    // süre biter bitmez tick kes
    stopTick();

    // cevap seçilmemişse yanlış
    if (!isAnswerLocked) {
      setWrongCount((w) => w + 1);
      setAnswers((prev) => {
        const copy = [...prev];
        copy[currentIndex] = "wrong";
        return copy;
      });
      setIsCorrect(false);
    }

    setIsAnswerLocked(true);

    // whoosh + explanation aç
    playSound(whooshSoundRef.current);
    setShowExplanation(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, showExplanation, showFinalScore]);

  // EXPLANATION COUNTDOWN
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

  // FINAL SCORE COUNTDOWN
  useEffect(() => {
    if (!showFinalScore) return;

    stopTick();
    playSound(gameoverSoundRef.current);

    let remaining = FINAL_SCORE_DURATION;
    setFinalCountdown(remaining);

    const interval = setInterval(
      () =>
        setFinalCountdown((prev) => (prev > 0 ? prev - 1 : 0)),
      1000
    );

    const timeout = setTimeout(() => {
      clearInterval(interval);
      router.push("/");
    }, FINAL_SCORE_DURATION * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [showFinalScore, router]);

  // Ses toggle
  useEffect(() => {
    if (!isSoundEnabled) {
      stopTick();
      return;
    }
    if (!showFinalScore && !showExplanation && timeLeft > 0) {
      startTick();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSoundEnabled]);

  // Güvenlik: explanation veya finalde ya da süre 0'da tick kapalı
  useEffect(() => {
    if (showFinalScore || showExplanation || timeLeft <= 0) {
      stopTick();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFinalScore, showExplanation, timeLeft]);

  const handleAnswerClick = (optionId: OptionId) => {
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
      playSound(correctSoundRef.current);
    } else {
      setWrongCount((w) => w + 1);
      playSound(wrongSoundRef.current);
    }

    // Show explanation immediately
    setShowExplanation(true);
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
    setShowFinalScore(true); // erken çıkışta da final ekranı
  };

  const handleExitConfirmNo = () => {
    playClick();
    setShowExitConfirm(false);
  };

  const handleSoundToggle = () => {
    if (isSoundEnabled) {
      playClick();
    }
    setIsSoundEnabled((prev) => !prev);
  };

  const getTimeColor = () => {
    if (timeLeft > 4) return "#22c55e"; // ilk 2 sn
    if (timeLeft > 2) return "#eab308"; // orta 2 sn
    return "#ef4444"; // son 2 sn
  };

  const accuracy =
    TOTAL_QUESTIONS > 0
      ? Math.round((correctCount / TOTAL_QUESTIONS) * 100)
      : 0;

  // === LOADING / VERIFYING SCREEN ===
  if (isVerifying || isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="animate-pulse" style={{ textAlign: "center" }}>
          <div
            className="animate-spin"
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 24px",
              border: "4px solid rgba(139,92,246,0.3)",
              borderTopColor: "#8b5cf6",
              borderRadius: "50%",
            }}
          />
          <p
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#f8fafc",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {isVerifying ? "Verifying Access..." : "Loading Free Quiz..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
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
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        }
        @media (max-width: 768px) {
          .header-wrap {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            height: auto !important;
            padding: 10px 0 12px;
          }
          .header-center-text {
            justify-content: flex-start !important;
            width: 100%;
          }
          .header-right {
            width: 100%;
            justify-content: flex-end;
          }
          .question-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Global Sesler */}
      <audio ref={correctSoundRef} src="/sounds/correct.mp3" />
      <audio ref={wrongSoundRef} src="/sounds/wrong.mp3" />
      <audio ref={clickSoundRef} src="/sounds/click.mp3" />
      <audio ref={gameoverSoundRef} src="/sounds/gameover.mp3" />
      <audio ref={whooshSoundRef} src="/sounds/whoosh.mp3" />
      <audio ref={tickSoundRef} src="/sounds/tick.mp3" />

      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(to bottom right, #0a1628, #064e3b, #0f172a)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Arka plan glow */}
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

        {/* HEADER */}
        <header
          style={{
            position: "relative",
            zIndex: 10,
            borderBottom: "1px solid rgba(148,163,253,0.16)",
            backdropFilter: "blur(18px)",
            background: "rgba(6,8,20,0.94)",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 16px",
            }}
          >
            <div
              className="header-wrap"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "80px",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              {/* Logo */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "clamp(40px,6vw,52px)",
                    height: "clamp(40px,6vw,52px)",
                    borderRadius: "50%",
                    background: "#020817",
                    border:
                      "2px solid rgba(168,85,247,0.9)",
                    boxShadow:
                      "0 0 14px rgba(168,85,247,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src="/images/logo.png"
                    alt="Logo"
                    style={{
                      width: "80%",
                      height: "80%",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#a78bfa",
                    }}
                  >
                    Every question teaches you something new
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    Learn & Play Quiz
                  </div>
                </div>
              </div>

              {/* Orta: Soru sayaç */}
              <div
                className="header-center-text"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(14px,3vw,18px)",
                    fontWeight: 800,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    background:
                      "linear-gradient(to right,#a78bfa,#d946ef,#22d3ee,#f0abfc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  🎮 Practice {currentIndex + 1} /{" "}
                  {TOTAL_QUESTIONS}
                </div>
              </div>

              {/* Sağ: Skor + Ses + Exit */}
              <div
                className="header-right"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                {/* Doğru / Yanlış */}
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background:
                        "rgba(22,163,74,0.1)",
                      border:
                        "1px solid rgba(22,163,74,0.5)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11,
                    }}
                  >
                    <CheckCircle
                      style={{
                        width: 14,
                        height: 14,
                        color: "#22c55e",
                      }}
                    />
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#22c55e",
                      }}
                    >
                      {correctCount}
                    </span>
                  </div>
                  <div
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background:
                        "rgba(239,68,68,0.1)",
                      border:
                        "1px solid rgba(239,68,68,0.5)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11,
                    }}
                  >
                    <XCircle
                      style={{
                        width: 14,
                        height: 14,
                        color: "#ef4444",
                      }}
                    />
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#ef4444",
                      }}
                    >
                      {wrongCount}
                    </span>
                  </div>
                </div>

                {/* Ses Toggle */}
                <button
                  onClick={handleSoundToggle}
                  style={{
                    width:
                      "clamp(34px,6vw,40px)",
                    height:
                      "clamp(34px,6vw,40px)",
                    borderRadius: "14px",
                    border:
                      "1px solid rgba(167,139,250,0.7)",
                    background: isSoundEnabled
                      ? "rgba(129,140,248,0.18)"
                      : "rgba(15,23,42,0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: isSoundEnabled
                      ? "0 0 10px rgba(129,140,248,0.7)"
                      : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {isSoundEnabled ? (
                    <Volume2
                      style={{
                        width: 18,
                        height: 18,
                        color: "#a78bfa",
                      }}
                    />
                  ) : (
                    <VolumeX
                      style={{
                        width: 18,
                        height: 18,
                        color: "#6b7280",
                      }}
                    />
                  )}
                </button>

                {/* Exit */}
                {!showFinalScore && (
                  <button
                    onClick={handleExitClick}
                    style={{
                      padding:
                        "8px 16px",
                      borderRadius:
                        "9999px",
                      border:
                        "1px solid rgba(248,250,252,0.18)",
                      background:
                        "radial-gradient(circle at top, rgba(168,85,247,0.35), rgba(15,23,42,0.98))",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.14em",
                      display: "flex",
                      alignItems:
                        "center",
                      gap: 8,
                      cursor: "pointer",
                      boxShadow:
                        "0 0 16px rgba(168,85,247,0.7)",
                      transition:
                        "all 0.25s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 0 24px rgba(236,72,153,0.85)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 0 16px rgba(168,85,247,0.7)";
                    }}
                  >
                    <Zap
                      style={{
                        width: 14,
                        height: 14,
                        color: "#f9fafb",
                      }}
                    />
                    EXIT QUIZ
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main
          style={{
            position: "relative",
            zIndex: 5,
            maxWidth: "1200px",
            margin: "0 auto",
            padding:
              "24px 16px 32px",
          }}
        >
          {/* DAİRESEL SAYAÇ */}
          {!showFinalScore && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 86,
                  height: 86,
                }}
              >
                <div
                  style={{
                    position:
                      "absolute",
                    inset: 0,
                    borderRadius:
                      "50%",
                    border: `3px solid ${getTimeColor()}`,
                    boxShadow: `0 0 18px ${getTimeColor()}`,
                    opacity: 0.9,
                    animation:
                      "pulse 1.4s infinite",
                  }}
                />
                <div
                  style={{
                    position:
                      "absolute",
                    inset: 7,
                    borderRadius:
                      "50%",
                    background:
                      "rgba(6,8,20,0.98)",
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    gap: 2,
                  }}
                >
                  <Clock
                    style={{
                      width: 20,
                      height: 20,
                      color: getTimeColor(),
                    }}
                  />
                  <span
                    style={{
                      fontSize:
                        "24px",
                      fontWeight: 900,
                      color:
                        getTimeColor(),
                    }}
                  >
                    {timeLeft}
                  </span>
                </div>
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 10,
                  letterSpacing:
                    "0.14em",
                  textTransform:
                    "uppercase",
                  color: "#9ca3af",
                }}
              >
                
              </div>
            </div>
          )}

          {/* FINAL SCORE */}
          {showFinalScore ? (
            <div
              className="animate-slide-up"
              style={{
                marginTop: 24,
                padding:
                  "28px 20px 26px",
                borderRadius: 26,
                border:
                  "1px solid rgba(148,163,253,0.25)",
                background:
                  "radial-gradient(circle at top, rgba(15,23,42,1), rgba(6,8,20,1))",
                boxShadow:
                  "0 0 40px rgba(79,70,229,0.35)",
                textAlign:
                  "center",
              }}
            >
              <Trophy
                style={{
                  width: 64,
                  height: 64,
                  color: "#facc15",
                  marginBottom: 16,
                }}
              />
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  marginBottom: 8,
                  background:
                    "linear-gradient(to right,#a78bfa,#f0abfc)",
                  WebkitBackgroundClip:
                    "text",
                  WebkitTextFillColor:
                    "transparent",
                }}
              >
                Practice Summary 🎮
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "#9ca3af",
                  marginBottom: 22,
                }}
              >
                Free practice mode • Ready for the real competition?
              </p>

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(120px,1fr))",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    padding:
                      "16px 10px",
                    borderRadius: 18,
                    background:
                      "rgba(22,163,74,0.12)",
                    border:
                      "1px solid rgba(22,163,74,0.5)",
                  }}
                >
                  <CheckCircle
                    style={{
                      width: 24,
                      height: 24,
                      color: "#22c55e",
                      marginBottom: 6,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: "#22c55e",
                    }}
                  >
                    {correctCount}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                    }}
                  >
                    Correct
                  </div>
                </div>

                <div
                  style={{
                    padding:
                      "16px 10px",
                    borderRadius: 18,
                    background:
                      "rgba(239,68,68,0.12)",
                    border:
                      "1px solid rgba(239,68,68,0.5)",
                  }}
                >
                  <XCircle
                    style={{
                      width: 24,
                      height: 24,
                      color: "#ef4444",
                      marginBottom: 6,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: "#ef4444",
                    }}
                  >
                    {wrongCount}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                    }}
                  >
                    Wrong
                  </div>
                </div>

                <div
                  style={{
                    padding:
                      "16px 10px",
                    borderRadius: 18,
                    background:
                      "rgba(79,70,229,0.16)",
                    border:
                      "1px solid rgba(129,140,248,0.6)",
                  }}
                >
                  <Award
                    style={{
                      width: 24,
                      height: 24,
                      color: "#a78bfa",
                      marginBottom: 6,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: "#e5e7eb",
                    }}
                  >
                    {accuracy}%
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                    }}
                  >
                    Accuracy
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: "#9ca3af",
                }}
              >
                Returning to home in{" "}
                <span
                  style={{
                    color: "#10b981",
                    fontWeight: 800,
                  }}
                >
                  {finalCountdown}
                </span>{" "}
                seconds...
              </div>
            </div>
          ) : (
            <>
              {/* SORU KARTI */}
              {!showExplanation ? (
                <div
                  className="animate-slide-up"
                  style={{
                    marginTop: 8,
                    marginBottom: 16,
                    padding:
                      "24px 18px 24px",
                    borderRadius: 26,
                    border:
                      "1px solid rgba(129,140,248,0.35)",
                    background:
                      "radial-gradient(circle at top, rgba(17,24,39,0.98), rgba(6,8,20,1))",
                    boxShadow:
                      "0 0 32px rgba(79,70,229,0.3)",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <Target
                      style={{
                        width: 18,
                        height: 18,
                        color: "#a78bfa",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        fontWeight: 600,
                        letterSpacing:
                          "0.16em",
                      }}
                    >
                      QUESTION{" "}
                      {currentIndex + 1}
                    </span>
                  </div>

                  <h2
                    style={{
                      fontSize: 19,
                      lineHeight: 1.5,
                      fontWeight: 700,
                      marginBottom: 18,
                      color: "#e5e7eb",
                    }}
                  >
                    {currentQ.question}
                  </h2>

                  <div
                    className="question-grid"
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(2,minmax(0,1fr))",
                      gap: 12,
                    }}
                  >
                    {currentQ.options.map(
                      (opt) => {
                        const isSelected =
                          selectedAnswer ===
                          opt.id;
                        const isCorrectOpt =
                          opt.id ===
                          currentQ.correctAnswer;
                        const locked =
                          isAnswerLocked;

                        let borderColor =
                          "rgba(129,140,248,0.6)";
                        let boxShadow =
                          "0 0 10px rgba(15,23,42,0.9)";
                        let bg =
                          "linear-gradient(135deg, rgba(9,9,18,0.98), rgba(15,23,42,0.98))";

                        if (locked) {
                          if (
                            isCorrectOpt
                          ) {
                            borderColor =
                              "#22c55e";
                            boxShadow =
                              "0 0 16px rgba(34,197,94,0.7)";
                            bg =
                              "linear-gradient(135deg, rgba(22,163,74,0.16), rgba(6,8,20,1))";
                          } else if (
                            isSelected &&
                            !isCorrectOpt
                          ) {
                            borderColor =
                              "#ef4444";
                            boxShadow =
                              "0 0 16px rgba(239,68,68,0.7)";
                            bg =
                              "linear-gradient(135deg, rgba(127,29,29,0.2), rgba(6,8,20,1))";
                          } else {
                            borderColor =
                              "rgba(75,85,99,0.5)";
                            boxShadow =
                              "none";
                            bg =
                              "linear-gradient(135deg, rgba(9,9,18,0.9), rgba(15,23,42,0.96))";
                          }
                        } else if (
                          isSelected
                        ) {
                          borderColor =
                            "#d946ef";
                          boxShadow =
                            "0 0 16px rgba(217,70,239,0.7)";
                          bg =
                            "linear-gradient(135deg, rgba(24,24,48,1), rgba(15,23,42,1))";
                        }

                        return (
                          <button
                            key={
                              opt.id
                            }
                            onClick={() =>
                              handleAnswerClick(
                                opt.id
                              )
                            }
                            disabled={
                              locked
                            }
                            style={{
                              position:
                                "relative",
                              padding:
                                "14px 12px",
                              borderRadius: 18,
                              border: `2px solid ${borderColor}`,
                              background:
                                bg,
                              color:
                                "#e5e7eb",
                              textAlign:
                                "left",
                              cursor:
                                locked
                                  ? "default"
                                  : "pointer",
                              boxShadow,
                              transition:
                                "all 0.22s",
                              overflow:
                                "hidden",
                              opacity:
                                locked &&
                                !isSelected &&
                                !isCorrectOpt
                                  ? 0.45
                                  : 1,
                            }}
                            onMouseEnter={(
                              e
                            ) => {
                              if (
                                !locked &&
                                window
                                  .innerWidth >
                                  768
                              ) {
                                e.currentTarget.style.transform =
                                  "translateY(-2px)";
                                e.currentTarget.style.boxShadow =
                                  "0 0 18px rgba(217,70,239,0.7)";
                              }
                            }}
                            onMouseLeave={(
                              e
                            ) => {
                              if (
                                !locked &&
                                window
                                  .innerWidth >
                                  768
                              ) {
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                                e.currentTarget.style.boxShadow =
                                  boxShadow;
                              }
                            }}
                          >
                            <div
                              style={{
                                position:
                                  "absolute",
                                inset: 0,
                                borderRadius:
                                  18,
                                border:
                                  "1px solid rgba(129,140,248,0.16)",
                                pointerEvents:
                                  "none",
                              }}
                            />
                            {!locked && (
                              <div
                                style={{
                                  position:
                                    "absolute",
                                  top: 0,
                                  left:
                                    "-100%",
                                  width:
                                    "40%",
                                  height:
                                    "100%",
                                  background:
                                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                                  animation:
                                    "shine 2.4s infinite",
                                  pointerEvents:
                                    "none",
                                }}
                              />
                            )}

                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: 10,
                                position:
                                  "relative",
                                zIndex: 2,
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius:
                                    10,
                                  border:
                                    "1px solid rgba(148,163,253,0.4)",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  fontSize:
                                    14,
                                  fontWeight: 800,
                                  background:
                                    "rgba(10,16,30,1)",
                                  boxShadow:
                                    "0 2px 8px rgba(15,23,42,0.9)",
                                  color:
                                    isCorrectOpt &&
                                    locked
                                      ? "#22c55e"
                                      : isSelected &&
                                        locked &&
                                        !isCorrectOpt
                                      ? "#ef4444"
                                      : "#a78bfa",
                                }}
                              >
                                {
                                  opt.id
                                }
                              </div>
                              <div
                                style={{
                                  fontSize:
                                    13,
                                  fontWeight: 500,
                                  color:
                                    "#e5e7eb",
                                }}
                              >
                                {
                                  opt.text
                                }
                              </div>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              ) : (
                // EXPLANATION CARD
                <div
                  className="animate-slide-up"
                  style={{
                    marginTop: 12,
                    marginBottom: 12,
                    padding:
                      "22px 18px 20px",
                    borderRadius: 24,
                    border:
                      "1px solid rgba(56,189,248,0.4)",
                    background:
                      "linear-gradient(135deg, rgba(8,47,73,0.96), rgba(6,8,20,1))",
                    boxShadow:
                      "0 0 32px rgba(56,189,248,0.35)",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: 10,
                      marginBottom: 8,
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <Award
                      style={{
                        width: 24,
                        height: 24,
                        color: isCorrect
                          ? "#22c55e"
                          : "#ef4444",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: isCorrect
                          ? "#22c55e"
                          : "#ef4444",
                      }}
                    >
                      {isCorrect
                        ? "Correct"
                        : "Incorrect"}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: "#bfdbfe",
                      marginBottom: 6,
                      fontWeight: 500,
                    }}
                  >
                    Correct answer:{" "}
                    <span
                      style={{
                        color:
                          "#22c55e",
                        fontWeight: 800,
                      }}
                    >
                      {
                        currentQ.correctAnswer
                      }
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#e5e7eb",
                      lineHeight: 1.6,
                    }}
                  >
                    {
                      currentQ.explanation
                    }
                  </p>
                  <div
                    style={{
                      marginTop: 10,
                      padding:
                        "8px 10px",
                      borderRadius: 12,
                      background:
                        "rgba(15,23,42,0.9)",
                      textAlign:
                        "center",
                      fontSize: 11,
                      color: "#9ca3af",
                    }}
                  >
                    Next question in{" "}
                    <span
                      style={{
                        color:
                          "#38bdf8",
                        fontWeight: 800,
                      }}
                    >
                      {
                        explanationTimer
                      }
                    </span>{" "}
                    seconds...
                  </div>
                </div>
              )}

              {/* Progress Dots */}
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "center",
                  flexWrap:
                    "wrap",
                  gap: 4,
                  marginTop: 6,
                }}
              >
                {Array.from({
                  length:
                    TOTAL_QUESTIONS,
                }).map((_, i) => {
                  const st =
                    answers[i];
                  let bg =
                    "rgba(75,85,99,0.5)";
                  if (
                    i ===
                    currentIndex
                  ) {
                    bg =
                      "#a78bfa";
                  } else if (
                    st ===
                    "correct"
                  ) {
                    bg =
                      "#22c55e";
                  } else if (
                    st ===
                    "wrong"
                  ) {
                    bg =
                      "#ef4444";
                  }
                  return (
                    <div
                      key={
                        i
                      }
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius:
                          "9999px",
                        background:
                          bg,
                        boxShadow:
                          st ===
                          "correct"
                            ? "0 0 6px rgba(34,197,94,0.8)"
                            : st ===
                              "wrong"
                            ? "0 0 6px rgba(239,68,68,0.8)"
                            : i ===
                              currentIndex
                            ? "0 0 6px rgba(168,85,247,0.9)"
                            : "none",
                        transition:
                          "all 0.2s",
                      }}
                    />
                  );
                })}
              </div>
            </>
          )}

          {/* Exit Modal */}
          {showExitConfirm && (
            <div
              style={{
                position:
                  "fixed",
                inset: 0,
                background:
                  "rgba(0,0,0,0.75)",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                zIndex: 40,
              }}
            >
              <div
                className="animate-slide-up"
                style={{
                  width:
                    "min(320px,90vw)",
                  padding:
                    "22px 20px 18px",
                  borderRadius: 22,
                  background:
                    "rgba(6,8,20,0.98)",
                  border:
                    "1px solid rgba(148,163,253,0.4)",
                  boxShadow:
                    "0 0 26px rgba(15,23,42,1)",
                  textAlign:
                    "center",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#e5e7eb",
                    marginBottom: 16,
                  }}
                >
                  Are you sure?
                </div>
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "center",
                    gap: 10,
                  }}
                >
                  <button
                    onClick={
                      handleExitConfirmYes
                    }
                    style={{
                      flex: 1,
                      padding:
                        "10px 0",
                      borderRadius:
                        9999,
                      border:
                        "none",
                      background:
                        "linear-gradient(to right,#ef4444,#b91c1c)",
                      color:
                        "white",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor:
                        "pointer",
                      boxShadow:
                        "0 0 18px rgba(239,68,68,0.8)",
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.12em",
                    }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={
                      handleExitConfirmNo
                    }
                    style={{
                      flex: 1,
                      padding:
                        "10px 0",
                      borderRadius:
                        9999,
                      border:
                        "1px solid rgba(148,163,253,0.6)",
                      background:
                        "transparent",
                      color:
                        "#e5e7eb",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor:
                        "pointer",
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.12em",
                    }}
                  >
                    No
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
