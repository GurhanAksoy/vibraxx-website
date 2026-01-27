"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import ShareButtons from "@/components/ShareButtons";
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Zap,
  Volume2,
  VolumeX,
  Flame,
  Star,
  Award,
  Crown,
} from "lucide-react";

// ============================================
// KANONIK CONFIGURATION
// ============================================
const TOTAL_QUESTIONS = 20; // ✅ KANONIK: 20 soruluk round
const QUESTION_DURATION = 6; // seconds
const EXPLANATION_DURATION = 6; // seconds
const FINAL_SCORE_DURATION = 15; // ✅ 15 SECONDS for ultra premium score card!

type OptionId = "a" | "b" | "c" | "d";
type AnswerStatus = "none" | "correct" | "wrong";

interface Question {
  question_id: number;
  question_order: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

export default function LiveQuizPage() {
  const router = useRouter();

  // SECURITY STATE
  const [isVerifying, setIsVerifying] = useState(true);
  const [securityPassed, setSecurityPassed] = useState(false);

  // QUIZ STATE
  const [roundId, setRoundId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION);
  const [selectedAnswer, setSelectedAnswer] = useState<OptionId | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // EXPLANATION STATE
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationTimer, setExplanationTimer] = useState(EXPLANATION_DURATION);
  const [currentExplanation, setCurrentExplanation] = useState<string>("");
  const [currentCorrectOption, setCurrentCorrectOption] = useState<OptionId | null>(null);

  // FINAL SCORE STATE
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [finalCountdown, setFinalCountdown] = useState(FINAL_SCORE_DURATION);

  // ANSWERS STATE
  const [answers, setAnswers] = useState<AnswerStatus[]>(Array(TOTAL_QUESTIONS).fill("none"));
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  // USER STATE
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [userRank, setUserRank] = useState<number | null>(null);

  // PROTECTION FLAGS
  const timeoutTriggeredRef = useRef(false);
  const answerSubmittedRef = useRef<Set<number>>(new Set());

  // AUDIO REFS
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const whooshSoundRef = useRef<HTMLAudioElement | null>(null);
  const tickSoundRef = useRef<HTMLAudioElement | null>(null);

  const currentQ = questions[currentIndex] ?? null;

  // ============================================
  // 🎵 MS PERFECT AUDIO SYSTEM (useCallback)
  // ============================================
  const playSound = useCallback((
    audio: HTMLAudioElement | null,
    options?: { loop?: boolean; delayMs?: number }
  ) => {
    if (!isSoundEnabled || !audio) return;

    const delay = options?.delayMs || 0;

    setTimeout(() => {
      try {
        audio.loop = !!options?.loop;
        audio.currentTime = 0;
        audio.play();
      } catch (err) {
        console.warn("Audio play failed:", err);
      }
    }, delay);
  }, [isSoundEnabled]);

  const stopSound = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;
  }, []);

  const playClick = useCallback(() => playSound(clickSoundRef.current), [playSound]);

  // ============================================
  // TIMEOUT SUBMIT (useCallback)
  // ============================================
  const handleTimeoutSubmit = useCallback(async () => {
    if (!roundId || !currentQ) return;
    if (answerSubmittedRef.current.has(currentQ.question_id)) return;

    answerSubmittedRef.current.add(currentQ.question_id);

    try {
      const { data, error } = await supabase.rpc('submit_answer', {
        p_round_id: roundId,
        p_question_id: currentQ.question_id,
        p_selected_option: 'a', // Default for timeout
        p_answer_time_ms: 6000
      });

      if (!error && data) {
        setCurrentCorrectOption(data.correct_option);
        setCurrentExplanation(data.explanation || "");
        setIsCorrect(false);
        setWrongCount((w) => w + 1);
        setAnswers((prev) => {
          const copy = [...prev];
          copy[currentIndex] = "wrong";
          return copy;
        });
      }
    } catch (err) {
      console.error("❌ Timeout submit error:", err);
    }
  }, [roundId, currentQ, currentIndex]);

  // ============================================
  // 🔐 KANONIK SECURITY CHECK
  // ============================================
  useEffect(() => {
    const verifyAccess = async () => {
      try {
        console.log("🔐 [LIVE QUIZ] Starting verification...");

        // CHECK 1: User authentication
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          console.log("❌ [LIVE QUIZ] Not authenticated");
          router.push("/");
          return;
        }

        console.log("✅ [LIVE QUIZ] User authenticated:", authUser.id);
        setUser(authUser);

        // CHECK 2: Get user credits
        const { data: credits, error: creditsError } = await supabase
          .from("user_credits")
          .select("live_credits")
          .eq("user_id", authUser.id)
          .single();

        if (creditsError || !credits) {
          console.error("❌ [LIVE QUIZ] Credits error:", creditsError);
          router.push("/");
          return;
        }

        setUserCredits(credits.live_credits);
        console.log("✅ [LIVE QUIZ] Credits:", credits.live_credits);

        // CHECK 3: Get current live round
        const { data: liveRound, error: roundError } = await supabase
          .from("rounds")
          .select("id, status, started_at")
          .eq("status", "live")
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (roundError || !liveRound) {
          console.error("❌ [LIVE QUIZ] No live round:", roundError);
          router.push("/lobby");
          return;
        }

        console.log("✅ [LIVE QUIZ] Live round found:", liveRound.id);
        setRoundId(liveRound.id);

        // CHECK 4: Verify participation
        const { data: participant, error: participantError } = await supabase
          .from("round_participants")
          .select("round_id, score")
          .eq("round_id", liveRound.id)
          .eq("user_id", authUser.id)
          .maybeSingle();

        if (participantError || !participant) {
          console.error("❌ [LIVE QUIZ] Not a participant:", participantError);
          router.push("/lobby");
          return;
        }

        console.log("✅ [LIVE QUIZ] Participant verified");

        // STEP 5: Get questions via KANONIK RPC
        console.log("📝 [LIVE QUIZ] Fetching questions...");

        const { data: questionsData, error: questionsError } = await supabase
          .rpc('get_round_questions', {
            p_round_id: liveRound.id
          });

        if (questionsError || !questionsData || questionsData.length === 0) {
          console.error("❌ [LIVE QUIZ] Questions error:", questionsError);
          router.push("/lobby");
          return;
        }

        console.log(`✅ [LIVE QUIZ] Loaded ${questionsData.length} questions`);
        setQuestions(questionsData);
        setIsVerifying(false);
        setIsLoading(false);
        setSecurityPassed(true);

      } catch (error: any) {
        console.error("❌ [LIVE QUIZ] Verification error:", error);
        router.push("/");
      }
    };

    verifyAccess();
  }, [router]);

  // ============================================
  // TICK SOUND SYNC
  // ============================================
  useEffect(() => {
    if (showFinalScore || showExplanation || timeLeft <= 0 || !currentQ) return;
    playSound(tickSoundRef.current, { delayMs: 50 });
  }, [timeLeft, showFinalScore, showExplanation, currentQ, playSound]);

  // ============================================
  // MAIN TIMER (6 → 0)
  // ============================================
  useEffect(() => {
    if (showFinalScore || showExplanation || !currentQ) return;
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, showExplanation, showFinalScore, currentQ]);

  // ============================================
  // TIMEOUT HANDLER (FIXED: Async await)
  // ============================================
  useEffect(() => {
    if (showFinalScore || showExplanation || !currentQ) return;
    if (timeLeft !== 0) return;
    if (timeoutTriggeredRef.current) return;

    const handleTimeout = async () => {
      timeoutTriggeredRef.current = true;

      // ✅ FIXED: Await async submission
      if (!isAnswerLocked && roundId && currentQ) {
        await handleTimeoutSubmit();
      }

      setIsAnswerLocked(true);
      playSound(whooshSoundRef.current, { delayMs: 100 });
      
      setTimeout(() => {
        setShowExplanation(true);
      }, 150);
    };

    handleTimeout();
  }, [timeLeft, showExplanation, showFinalScore, currentQ, isAnswerLocked, roundId, handleTimeoutSubmit, playSound]);

  // ============================================
  // EXPLANATION COUNTDOWN
  // ============================================
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
        // Next question
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setTimeLeft(QUESTION_DURATION);
        setSelectedAnswer(null);
        setIsAnswerLocked(false);
        setIsCorrect(false);
        setShowExplanation(false);
        setCurrentExplanation("");
        setCurrentCorrectOption(null);
        timeoutTriggeredRef.current = false;
      } else {
        // Quiz finished
        setShowFinalScore(true);
      }
    }, EXPLANATION_DURATION * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [showExplanation, currentIndex, showFinalScore]);

  // ============================================
  // FINAL SCORE COUNTDOWN (15 SECONDS!) (FIXED: Unmount protection)
  // ============================================
  useEffect(() => {
    if (!showFinalScore) return;

    let isMounted = true; // ✅ FIXED: Unmount protection

    stopSound(tickSoundRef.current);
    playSound(gameoverSoundRef.current);

    // Calculate final score
    const finalScore = correctCount * 5; // 5 points per correct (max 100)
    setTotalScore(finalScore);

    // Fetch user rank (with unmount protection)
    const fetchRank = async () => {
      if (!user?.id) return;
      try {
        const { data } = await supabase
          .from("leaderboard_weekly")
          .select("rank")
          .eq("user_id", user.id)
          .maybeSingle();
        
        // ✅ FIXED: Check if still mounted
        if (data && isMounted) {
          setUserRank(data.rank);
        }
      } catch (err) {
        console.warn("Rank fetch error:", err);
      }
    };
    fetchRank();

    let remaining = FINAL_SCORE_DURATION;
    setFinalCountdown(remaining);

    const interval = setInterval(() =>
      setFinalCountdown((prev) => (prev > 0 ? prev - 1 : 0)),
      1000
    );

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (isMounted) {
        router.push("/");
      }
    }, FINAL_SCORE_DURATION * 1000);

    return () => {
      isMounted = false; // ✅ FIXED: Cleanup
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [showFinalScore, router, correctCount, user, stopSound, playSound]);

  // ============================================
  // ANSWER HANDLER (KANONIK SUBMIT)
  // ============================================
  const handleAnswerClick = useCallback(async (optionId: OptionId) => {
    if (isAnswerLocked || showExplanation || showFinalScore || !currentQ || !roundId) return;
    if (answerSubmittedRef.current.has(currentQ.question_id)) return;

    playClick();
    setSelectedAnswer(optionId);
    setIsAnswerLocked(true);

    const answerTimeMs = (QUESTION_DURATION - timeLeft) * 1000;
    answerSubmittedRef.current.add(currentQ.question_id);

    try {
      const { data, error } = await supabase.rpc('submit_answer', {
        p_round_id: roundId,
        p_question_id: currentQ.question_id,
        p_selected_option: optionId,
        p_answer_time_ms: answerTimeMs
      });

      if (error) {
        console.error("❌ Submit answer error:", error);
        return;
      }

      if (data) {
        const correct = data.is_correct || false;
        setIsCorrect(correct);
        setCurrentCorrectOption(data.correct_option);
        setCurrentExplanation(data.explanation || "");

        setAnswers((prev) => {
          const next = [...prev];
          next[currentIndex] = correct ? "correct" : "wrong";
          return next;
        });

        if (correct) {
          setCorrectCount((c) => c + 1);
          playSound(correctSoundRef.current, { delayMs: 80 });
        } else {
          setWrongCount((w) => w + 1);
          playSound(wrongSoundRef.current, { delayMs: 80 });
        }
      }
    } catch (err) {
      console.error("❌ Answer submission error:", err);
    }
  }, [isAnswerLocked, showExplanation, showFinalScore, currentQ, roundId, timeLeft, currentIndex, playClick, playSound]);

  // ============================================
  // EXIT HANDLERS
  // ============================================
  const handleExitClick = useCallback(() => {
    if (showFinalScore) return;
    playClick();
    setShowExitConfirm(true);
  }, [showFinalScore, playClick]);

  const handleExitConfirmYes = useCallback(() => {
    playClick();
    stopSound(tickSoundRef.current);
    setShowExitConfirm(false);
    setShowFinalScore(true);
  }, [playClick, stopSound]);

  const handleExitConfirmNo = useCallback(() => {
    playClick();
    setShowExitConfirm(false);
  }, [playClick]);

  const handleSoundToggle = useCallback(() => {
    if (isSoundEnabled) playClick();
    setIsSoundEnabled((prev) => !prev);
  }, [isSoundEnabled, playClick]);

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const getTimeColor = useCallback(() => {
    if (timeLeft > 4) return "#22c55e";
    if (timeLeft > 2) return "#eab308";
    return "#ef4444";
  }, [timeLeft]);

  const accuracy = TOTAL_QUESTIONS > 0 ? Math.round((correctCount / TOTAL_QUESTIONS) * 100) : 0;

  // ============================================
  // LOADING SCREEN
  // ============================================
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
            {isVerifying ? "Verifying Access..." : "Loading Live Quiz..."}
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN QUIZ UI
  // ============================================
  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes rankBadgePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(251,191,36,0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(251,191,36,0.6); }
        }
        
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-pulse { animation: pulse 1s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.4s ease-out; }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-shimmer { animation: shimmer 3s linear infinite; }
        .animate-rank-badge { animation: rankBadgePulse 2s ease-in-out infinite; }
        
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
          .score-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
        
        @media (max-width: 640px) {
          .final-score-actions {
            flex-direction: column;
          }
        }
      `}</style>

      {/* Audio Elements */}
      <audio ref={correctSoundRef} src="/sounds/correct.mp3" />
      <audio ref={wrongSoundRef} src="/sounds/wrong.mp3" />
      <audio ref={clickSoundRef} src="/sounds/click.mp3" />
      <audio ref={gameoverSoundRef} src="/sounds/gameover.mp3" />
      <audio ref={whooshSoundRef} src="/sounds/whoosh.mp3" />
      <audio ref={tickSoundRef} src="/sounds/tick.mp3" />

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom right, #0a1628, #064e3b, #0f172a)",
          color: "white",
          position: "relative",
          overflow: "hidden",
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
            background: "radial-gradient(circle, rgba(124,58,237,0.4), transparent 70%)",
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
            background: "radial-gradient(circle, rgba(217,70,239,0.35), transparent 70%)",
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
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "clamp(40px,6vw,52px)",
                    height: "clamp(40px,6vw,52px)",
                    borderRadius: "50%",
                    background: "#020817",
                    border: "2px solid rgba(168,85,247,0.9)",
                    boxShadow: "0 0 14px rgba(168,85,247,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {/* ✅ FIXED: Next.js Image component */}
                  <Image
                    src="/images/logo.png"
                    alt="VibraXX Logo"
                    width={52}
                    height={52}
                    style={{ width: "80%", height: "80%", objectFit: "contain" }}
                    priority
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
                    Live Competition
                  </div>
                  <div style={{ fontSize: "13px", color: "#6b7280" }}>
                    Round #{roundId}
                  </div>
                </div>
              </div>

              {/* Center: Question Counter */}
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
                    background: "linear-gradient(to right,#a78bfa,#d946ef,#22d3ee,#f0abfc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  🔴 LIVE {currentIndex + 1} / {TOTAL_QUESTIONS}
                </div>
              </div>

              {/* Right: Score + Sound + Exit */}
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
                {/* Correct / Wrong */}
                <div style={{ display: "flex", gap: 6 }}>
                  <div
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "rgba(22,163,74,0.1)",
                      border: "1px solid rgba(22,163,74,0.5)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11,
                    }}
                  >
                    <CheckCircle style={{ width: 14, height: 14, color: "#22c55e" }} />
                    <span style={{ fontWeight: 700, color: "#22c55e" }}>{correctCount}</span>
                  </div>
                  <div
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.5)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11,
                    }}
                  >
                    <XCircle style={{ width: 14, height: 14, color: "#ef4444" }} />
                    <span style={{ fontWeight: 700, color: "#ef4444" }}>{wrongCount}</span>
                  </div>
                </div>

                {/* Sound Toggle */}
                <button
                  onClick={handleSoundToggle}
                  style={{
                    width: "clamp(34px,6vw,40px)",
                    height: "clamp(34px,6vw,40px)",
                    borderRadius: "14px",
                    border: "1px solid rgba(167,139,250,0.7)",
                    background: isSoundEnabled
                      ? "rgba(129,140,248,0.18)"
                      : "rgba(15,23,42,0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: isSoundEnabled ? "0 0 10px rgba(129,140,248,0.7)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {isSoundEnabled ? (
                    <Volume2 style={{ width: 18, height: 18, color: "#a78bfa" }} />
                  ) : (
                    <VolumeX style={{ width: 18, height: 18, color: "#6b7280" }} />
                  )}
                </button>

                {/* Exit Button */}
                {!showFinalScore && (
                  <button
                    onClick={handleExitClick}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      border: "1px solid rgba(248,250,252,0.18)",
                      background: "radial-gradient(circle at top, rgba(168,85,247,0.35), rgba(15,23,42,0.98))",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      boxShadow: "0 0 16px rgba(168,85,247,0.7)",
                      transition: "all 0.25s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 0 24px rgba(236,72,153,0.85)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 0 16px rgba(168,85,247,0.7)";
                    }}
                  >
                    <Zap style={{ width: 14, height: 14, color: "#f9fafb" }} />
                    EXIT
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main
          style={{
            position: "relative",
            zIndex: 5,
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "24px 16px 32px",
          }}
        >
          {/* CIRCULAR TIMER */}
          {!showFinalScore && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <div style={{ position: "relative", width: 86, height: 86 }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: `3px solid ${getTimeColor()}`,
                    boxShadow: `0 0 18px ${getTimeColor()}`,
                    opacity: 0.9,
                    animation: "pulse 1.4s infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 7,
                    borderRadius: "50%",
                    background: "rgba(6,8,20,0.98)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <Clock style={{ width: 20, height: 20, color: getTimeColor() }} />
                  <span style={{ fontSize: "24px", fontWeight: 900, color: getTimeColor() }}>
                    {timeLeft}
                  </span>
                </div>
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                }}
              >
                SECONDS LEFT
              </div>
            </div>
          )}

          {/* ULTRA PREMIUM FINAL SCORE CARD (15 SECONDS!) */}
          {showFinalScore ? (
            <article
              id="shareableScoreCard"
              className="animate-slide-up"
              style={{
                padding: "clamp(28px, 5vw, 36px)",
                borderRadius: "clamp(22px, 4vw, 28px)",
                border: "2px solid rgba(139,92,246,0.5)",
                background: "linear-gradient(135deg, rgba(30,27,75,0.98) 0%, rgba(15,23,42,0.98) 100%)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.4)",
                textAlign: "center",
                backdropFilter: "blur(20px)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Rank Badge (if available) */}
              {userRank && (
                <div
                  className="animate-rank-badge"
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    padding: "8px 16px",
                    borderRadius: "9999px",
                    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                    border: "2px solid rgba(251,191,36,0.6)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Crown style={{ width: 16, height: 16, color: "white" }} />
                  <span style={{ fontSize: "12px", fontWeight: 900, color: "white" }}>
                    #{userRank}
                  </span>
                </div>
              )}

              {/* Trophy Icon */}
              <div style={{ display: "inline-block", marginBottom: "clamp(18px, 3vw, 24px)" }}>
                <Trophy
                  style={{
                    width: "clamp(56px, 10vw, 72px)",
                    height: "clamp(56px, 10vw, 72px)",
                    color: "#fbbf24",
                    filter: "drop-shadow(0 0 20px #fbbf24)",
                  }}
                />
              </div>

              {/* Title */}
              <h1
                className="animate-shimmer"
                style={{
                  fontSize: "clamp(22px, 4.5vw, 32px)",
                  fontWeight: 900,
                  marginBottom: "clamp(12px, 2.5vw, 16px)",
                  backgroundImage: "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Round Complete!
              </h1>

              {/* Score Display */}
              <div
                style={{
                  padding: "clamp(16px, 3.5vw, 20px)",
                  borderRadius: "clamp(16px, 3vw, 20px)",
                  background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))",
                  border: "2px solid rgba(139,92,246,0.6)",
                  boxShadow: "0 0 30px rgba(139,92,246,0.4)",
                  marginBottom: "clamp(24px, 4vw, 32px)",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(48px, 10vw, 72px)",
                    fontWeight: 900,
                    background: "linear-gradient(to right, #a78bfa, #06b6d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1,
                    marginBottom: "8px",
                  }}
                >
                  {totalScore}
                </div>
                <div
                  style={{
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    color: "#cbd5e1",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Total Score
                </div>
              </div>

              {/* Stats Grid */}
              <div
                className="score-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "clamp(12px, 3vw, 16px)",
                  marginBottom: "clamp(24px, 4vw, 32px)",
                }}
              >
                {/* Correct */}
                <div
                  style={{
                    padding: "clamp(16px, 3.5vw, 20px)",
                    borderRadius: "clamp(14px, 3vw, 16px)",
                    background: "linear-gradient(135deg, rgba(22,163,74,0.2), rgba(21,128,61,0.15))",
                    border: "2px solid rgba(34,197,94,0.5)",
                    boxShadow: "0 0 20px rgba(34,197,94,0.3)",
                  }}
                >
                  <CheckCircle
                    style={{
                      width: "clamp(24px, 5vw, 32px)",
                      height: "clamp(24px, 5vw, 32px)",
                      color: "#22c55e",
                      marginBottom: "clamp(6px, 1.5vw, 8px)",
                      filter: "drop-shadow(0 0 10px #22c55e)",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "clamp(28px, 6vw, 40px)",
                      fontWeight: 900,
                      color: "#22c55e",
                      lineHeight: 1,
                      marginBottom: "clamp(4px, 1vw, 6px)",
                      textShadow: "0 0 15px rgba(34,197,94,0.6)",
                    }}
                  >
                    {correctCount}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(10px, 2vw, 12px)",
                      color: "#86efac",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Correct
                  </div>
                </div>

                {/* Wrong */}
                <div
                  style={{
                    padding: "clamp(16px, 3.5vw, 20px)",
                    borderRadius: "clamp(14px, 3vw, 16px)",
                    background: "linear-gradient(135deg, rgba(220,38,38,0.2), rgba(185,28,28,0.15))",
                    border: "2px solid rgba(239,68,68,0.5)",
                    boxShadow: "0 0 20px rgba(239,68,68,0.3)",
                  }}
                >
                  <XCircle
                    style={{
                      width: "clamp(24px, 5vw, 32px)",
                      height: "clamp(24px, 5vw, 32px)",
                      color: "#ef4444",
                      marginBottom: "clamp(6px, 1.5vw, 8px)",
                      filter: "drop-shadow(0 0 10px #ef4444)",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "clamp(28px, 6vw, 40px)",
                      fontWeight: 900,
                      color: "#ef4444",
                      lineHeight: 1,
                      marginBottom: "clamp(4px, 1vw, 6px)",
                      textShadow: "0 0 15px rgba(239,68,68,0.6)",
                    }}
                  >
                    {wrongCount}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(10px, 2vw, 12px)",
                      color: "#fca5a5",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Wrong
                  </div>
                </div>

                {/* Accuracy */}
                <div
                  style={{
                    padding: "clamp(16px, 3.5vw, 20px)",
                    borderRadius: "clamp(14px, 3vw, 16px)",
                    background: "linear-gradient(135deg, rgba(79,70,229,0.25), rgba(99,102,241,0.15))",
                    border: "2px solid rgba(129,140,248,0.6)",
                    boxShadow: "0 0 20px rgba(129,140,248,0.3)",
                  }}
                >
                  <Award
                    style={{
                      width: "clamp(24px, 5vw, 32px)",
                      height: "clamp(24px, 5vw, 32px)",
                      color: "#a78bfa",
                      marginBottom: "clamp(6px, 1.5vw, 8px)",
                      filter: "drop-shadow(0 0 10px #a78bfa)",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "clamp(28px, 6vw, 40px)",
                      fontWeight: 900,
                      color: "#e5e7eb",
                      lineHeight: 1,
                      marginBottom: "clamp(4px, 1vw, 6px)",
                      textShadow: "0 0 15px rgba(167,139,250,0.6)",
                    }}
                  >
                    {accuracy}%
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(10px, 2vw, 12px)",
                      color: "#c4b5fd",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Accuracy
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div style={{ marginTop: "clamp(24px, 4vw, 32px)", marginBottom: "clamp(24px, 4vw, 32px)", width: "100%" }}>
                <ShareButtons
                  scoreData={{
                    score: totalScore,
                    correct: correctCount,
                    wrong: wrongCount,
                    accuracy: accuracy,
                    userName: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Player",
                    userCountry: user?.user_metadata?.country || "🌍",
                    userId: user?.id,
                    roundId: roundId?.toString(),
                  }}
                  variant="full"
                />
              </div>

              {/* Credits Info */}
              <div
                style={{
                  padding: "clamp(12px, 2.5vw, 14px) clamp(16px, 3.5vw, 20px)",
                  borderRadius: "clamp(12px, 2.5vw, 14px)",
                  background: "rgba(124,58,237,0.15)",
                  border: "1px solid rgba(139,92,246,0.4)",
                  marginBottom: "clamp(20px, 4vw, 24px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "clamp(13px, 3vw, 15px)",
                    color: "#cbd5e1",
                    fontWeight: 600,
                  }}
                >
                  You have
                </span>
                <span
                  style={{
                    fontSize: "clamp(18px, 4vw, 22px)",
                    fontWeight: 900,
                    color: "#a78bfa",
                    textShadow: "0 0 10px rgba(167,139,250,0.6)",
                  }}
                >
                  {userCredits}
                </span>
                <span
                  style={{
                    fontSize: "clamp(13px, 3vw, 15px)",
                    color: "#cbd5e1",
                    fontWeight: 600,
                  }}
                >
                  rounds left
                </span>
              </div>

              {/* Action Buttons */}
              <div
                className="final-score-actions"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(10px, 2.5vw, 12px)",
                  marginBottom: "clamp(16px, 3.5vw, 20px)",
                }}
              >
                <button
                  onClick={() => {
                    playClick();
                    router.push(userCredits > 0 ? "/lobby" : "/buy");
                  }}
                  style={{
                    width: "100%",
                    padding: "clamp(12px, 3vw, 14px) clamp(20px, 4vw, 24px)",
                    borderRadius: "clamp(12px, 2.5vw, 14px)",
                    border: "none",
                    background:
                      userCredits > 0
                        ? "linear-gradient(135deg, #7c3aed, #d946ef)"
                        : "linear-gradient(135deg, #f59e0b, #fbbf24)",
                    color: "white",
                    fontSize: "clamp(14px, 3.2vw, 16px)",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow:
                      userCredits > 0
                        ? "0 8px 25px rgba(139,92,246,0.4)"
                        : "0 8px 25px rgba(251,191,36,0.4)",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      userCredits > 0
                        ? "0 12px 35px rgba(139,92,246,0.6)"
                        : "0 12px 35px rgba(251,191,36,0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      userCredits > 0
                        ? "0 8px 25px rgba(139,92,246,0.4)"
                        : "0 8px 25px rgba(251,191,36,0.4)";
                  }}
                >
                  {userCredits > 0 ? (
                    <>
                      <Zap style={{ width: "18px", height: "18px" }} />
                      New Round
                    </>
                  ) : (
                    <>
                      <Star style={{ width: "18px", height: "18px" }} />
                      Buy Rounds
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    playClick();
                    router.push("/");
                  }}
                  style={{
                    width: "100%",
                    padding: "clamp(12px, 3vw, 14px) clamp(20px, 4vw, 24px)",
                    borderRadius: "clamp(12px, 2.5vw, 14px)",
                    border: "2px solid rgba(148,163,253,0.4)",
                    background: "rgba(15,23,42,0.6)",
                    color: "white",
                    fontSize: "clamp(14px, 3.2vw, 16px)",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.borderColor = "rgba(139,92,246,0.6)";
                    e.currentTarget.style.background = "rgba(139,92,246,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "rgba(148,163,253,0.4)";
                    e.currentTarget.style.background = "rgba(15,23,42,0.6)";
                  }}
                >
                  <Star style={{ width: "18px", height: "18px" }} />
                  Exit Quiz
                </button>
              </div>

              {/* Countdown (15 seconds!) */}
              <div
                style={{
                  padding: "clamp(10px, 2vw, 12px) clamp(14px, 3vw, 16px)",
                  borderRadius: "clamp(10px, 2vw, 12px)",
                  background: "rgba(139,92,246,0.1)",
                  border: "1px solid rgba(139,92,246,0.3)",
                }}
              >
                <p
                  style={{
                    fontSize: "clamp(11px, 2.5vw, 13px)",
                    color: "#94a3b8",
                    fontWeight: 600,
                  }}
                >
                  Redirecting to home in{" "}
                  <span
                    style={{
                      color: "#a78bfa",
                      fontWeight: 900,
                      fontSize: "clamp(13px, 3vw, 16px)",
                    }}
                  >
                    {finalCountdown}
                  </span>
                  s
                </p>
              </div>
            </article>
          ) : (
            <>
              {/* QUESTION CARD */}
              {!showExplanation && currentQ ? (
                <div
                  className="animate-slide-up"
                  style={{
                    marginTop: 8,
                    marginBottom: 16,
                    padding: "24px 18px 24px",
                    borderRadius: 26,
                    border: "1px solid rgba(129,140,248,0.35)",
                    background: "radial-gradient(circle at top, rgba(17,24,39,0.98), rgba(6,8,20,1))",
                    boxShadow: "0 0 32px rgba(79,70,229,0.3)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <Target style={{ width: 18, height: 18, color: "#a78bfa" }} />
                    <span
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        fontWeight: 600,
                        letterSpacing: "0.16em",
                      }}
                    >
                      QUESTION {currentIndex + 1}
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
                    {currentQ.question_text}
                  </h2>

                  <div
                    className="question-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                      gap: 12,
                    }}
                  >
                    {(["a", "b", "c", "d"] as OptionId[]).map((optId) => {
                      const optText = currentQ[`option_${optId}` as keyof Question] as string;
                      const isSelected = selectedAnswer === optId;
                      const isCorrectOpt = currentCorrectOption && optId === currentCorrectOption;
                      const locked = isAnswerLocked;

                      let borderColor = "rgba(129,140,248,0.6)";
                      let boxShadow = "0 0 10px rgba(15,23,42,0.9)";
                      let bg = "linear-gradient(135deg, rgba(9,9,18,0.98), rgba(15,23,42,0.98))";

                      if (locked) {
                        if (isCorrectOpt) {
                          borderColor = "#22c55e";
                          boxShadow = "0 0 16px rgba(34,197,94,0.7)";
                          bg = "linear-gradient(135deg, rgba(22,163,74,0.16), rgba(6,8,20,1))";
                        } else if (isSelected && !isCorrectOpt) {
                          borderColor = "#ef4444";
                          boxShadow = "0 0 16px rgba(239,68,68,0.7)";
                          bg = "linear-gradient(135deg, rgba(127,29,29,0.2), rgba(6,8,20,1))";
                        } else {
                          borderColor = "rgba(75,85,99,0.5)";
                          boxShadow = "none";
                          bg = "linear-gradient(135deg, rgba(9,9,18,0.9), rgba(15,23,42,0.96))";
                        }
                      } else if (isSelected) {
                        borderColor = "#d946ef";
                        boxShadow = "0 0 16px rgba(217,70,239,0.7)";
                        bg = "linear-gradient(135deg, rgba(24,24,48,1), rgba(15,23,42,1))";
                      }

                      return (
                        <button
                          key={optId}
                          onClick={() => handleAnswerClick(optId)}
                          disabled={locked}
                          style={{
                            position: "relative",
                            padding: "14px 12px",
                            borderRadius: 18,
                            border: `2px solid ${borderColor}`,
                            background: bg,
                            color: "#e5e7eb",
                            textAlign: "left",
                            cursor: locked ? "default" : "pointer",
                            boxShadow,
                            transition: "all 0.22s",
                            overflow: "hidden",
                            opacity: locked && !isSelected && !isCorrectOpt ? 0.45 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (!locked && window.innerWidth > 768) {
                              e.currentTarget.style.transform = "translateY(-2px)";
                              e.currentTarget.style.boxShadow = "0 0 18px rgba(217,70,239,0.7)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!locked && window.innerWidth > 768) {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = boxShadow;
                            }
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              borderRadius: 18,
                              border: "1px solid rgba(129,140,248,0.16)",
                              pointerEvents: "none",
                            }}
                          />
                          {!locked && (
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: "-100%",
                                width: "40%",
                                height: "100%",
                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                                animation: "shine 2.4s infinite",
                                pointerEvents: "none",
                              }}
                            />
                          )}

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              position: "relative",
                              zIndex: 2,
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 10,
                                border: "1px solid rgba(148,163,253,0.4)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 14,
                                fontWeight: 800,
                                background: "rgba(10,16,30,1)",
                                boxShadow: "0 2px 8px rgba(15,23,42,0.9)",
                                color:
                                  isCorrectOpt && locked
                                    ? "#22c55e"
                                    : isSelected && locked && !isCorrectOpt
                                    ? "#ef4444"
                                    : "#a78bfa",
                              }}
                            >
                              {optId.toUpperCase()}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "#e5e7eb" }}>
                              {optText}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : showExplanation ? (
                // EXPLANATION CARD
                <div
                  className="animate-slide-up"
                  style={{
                    marginTop: 12,
                    marginBottom: 12,
                    padding: "22px 18px 20px",
                    borderRadius: 24,
                    border: "1px solid rgba(56,189,248,0.4)",
                    background: "linear-gradient(135deg, rgba(8,47,73,0.96), rgba(6,8,20,1))",
                    boxShadow: "0 0 32px rgba(56,189,248,0.35)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <Award
                      style={{
                        width: 24,
                        height: 24,
                        color: isCorrect ? "#22c55e" : "#ef4444",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: isCorrect ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {isCorrect ? "Correct!" : "Incorrect"}
                    </span>
                  </div>

                  {currentCorrectOption && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#bfdbfe",
                        marginBottom: 6,
                        fontWeight: 500,
                      }}
                    >
                      Correct answer:{" "}
                      <span style={{ color: "#22c55e", fontWeight: 800 }}>
                        {currentCorrectOption.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {currentExplanation && (
                    <p style={{ fontSize: 13, color: "#e5e7eb", lineHeight: 1.6 }}>
                      {currentExplanation}
                    </p>
                  )}
                  <div
                    style={{
                      marginTop: 10,
                      padding: "8px 10px",
                      borderRadius: 12,
                      background: "rgba(15,23,42,0.9)",
                      textAlign: "center",
                      fontSize: 11,
                      color: "#9ca3af",
                    }}
                  >
                    Next question in{" "}
                    <span style={{ color: "#38bdf8", fontWeight: 800 }}>{explanationTimer}</span> seconds...
                  </div>
                </div>
              ) : null}

              {/* Progress Dots */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: 4,
                  marginTop: 6,
                }}
              >
                {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => {
                  const st = answers[i];
                  let bg = "rgba(75,85,99,0.5)";
                  if (i === currentIndex) {
                    bg = "#a78bfa";
                  } else if (st === "correct") {
                    bg = "#22c55e";
                  } else if (st === "wrong") {
                    bg = "#ef4444";
                  }
                  return (
                    <div
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "9999px",
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

          {/* Exit Confirmation Modal */}
          {showExitConfirm && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.75)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 40,
              }}
            >
              <div
                className="animate-slide-up"
                style={{
                  width: "min(320px,90vw)",
                  padding: "22px 20px 18px",
                  borderRadius: 22,
                  background: "rgba(6,8,20,0.98)",
                  border: "1px solid rgba(148,163,253,0.4)",
                  boxShadow: "0 0 26px rgba(15,23,42,1)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800, color: "#e5e7eb", marginBottom: 16 }}>
                  Are you sure?
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                  <button
                    onClick={handleExitConfirmYes}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 9999,
                      border: "none",
                      background: "linear-gradient(to right,#ef4444,#b91c1c)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                      boxShadow: "0 0 18px rgba(239,68,68,0.8)",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                    }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={handleExitConfirmNo}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 9999,
                      border: "1px solid rgba(148,163,253,0.6)",
                      background: "transparent",
                      color: "#e5e7eb",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
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
