"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
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
} from "lucide-react";

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// === CONFIGURATION ===
const TOTAL_QUESTIONS = 50;
const QUESTION_DURATION = 6; // seconds
const FINAL_SCORE_DURATION = 10; // seconds - 10 seconds for user to see results and choose action

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

  // 🔐 === SECURITY STATE ===
  const [isVerifying, setIsVerifying] = useState(true);
  const [securityPassed, setSecurityPassed] = useState(false);

  // === STATE ===
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(TOTAL_QUESTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION);
  const [selectedAnswer, setSelectedAnswer] = useState<OptionId | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const [showExplanation, setShowExplanation] = useState(false);

  const [showFinalScore, setShowFinalScore] = useState(false);
  const [finalCountdown, setFinalCountdown] = useState(FINAL_SCORE_DURATION);

  const [answers, setAnswers] = useState<AnswerStatus[]>([]);

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [userRounds, setUserRounds] = useState(0);

  // 🔥 NEW: Live sync state variables
  const [phase, setPhase] = useState<string>("READY");
  const [roundId, setRoundId] = useState<string | null>(null);
  const [questionStart, setQuestionStart] = useState<string | null>(null);

  // Stats only once guard
  const statsSavedRef = useRef(false);
  
  // ✅ FIXED: Timeout double-trigger protection
  const timeoutTriggeredRef = useRef(false);

  // === AUDIO REFS ===
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const whooshSoundRef = useRef<HTMLAudioElement | null>(null);
  const tickSoundRef = useRef<HTMLAudioElement | null>(null);

  const currentQ = questions[currentIndex];

  // 🔐 === SECURITY CHECK - MUST RUN FIRST ===
  useEffect(() => {
    const verifyAccess = async () => {
      try {
        console.log("🔐 Starting security verification...");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.log("❌ Quiz Security: Not authenticated");
          router.push("/");
          return;
        }

        console.log("✅ Quiz Security: User authenticated -", user.id);
        console.log("✅ Quiz Security: All checks passed!");

        setSecurityPassed(true);
        setIsVerifying(false);
      } catch (error) {
        console.error("❌ Security check failed:", error);
        router.push("/");
      }
    };

    verifyAccess();
  }, [router]);

  // === FETCH LIVE QUESTIONS FROM LIVE_ROUNDS ===
  useEffect(() => {
    if (!securityPassed) return;

    const fetchLiveQuestions = async () => {
      try {
        // Get latest live round
        const { data: round, error: roundError } = await supabase
          .from("live_rounds")
          .select("*")
          .order("scheduled_start", { ascending: false })
          .limit(1)
          .single();

        if (roundError || !round) {
          console.error("❌ No active round found:", roundError);
          setIsLoading(false);
          return;
        }

        console.log("✅ Active round found:", round.id);
        
        // ✅ FIXED: Robust round state initialization
        setRoundId(round.id);
        setPhase(round.phase || "READY");

        const safeIndex =
          typeof round.current_question_index === "number"
            ? Math.max(0, round.current_question_index)
            : 0;
        setCurrentIndex(safeIndex);
        
        // ✅ FIXED: Safe questionStart handling
        setQuestionStart(round.question_started_at || null);

        // Get questions for this round
        const { data: questionData, error: questionsError } = await supabase
          .from("live_round_questions")
          .select("position, questions(*)")
          .eq("round_id", round.id)
          .order("position");

        if (questionsError || !questionData) {
          console.error("❌ Error fetching questions:", questionsError);
          setIsLoading(false);
          return;
        }

        console.log(`✅ Loaded ${questionData.length} questions`);

        const formattedQuestions: Question[] = questionData.map((item: any) => ({
          id: item.questions.id,
          question: item.questions.question_text,
          options: [
            { id: "A", text: item.questions.option_a },
            { id: "B", text: item.questions.option_b },
            { id: "C", text: item.questions.option_c },
            { id: "D", text: item.questions.option_d },
          ],
          correctAnswer: item.questions.correct_answer as OptionId,
          explanation: item.questions.explanation,
        }));

        setQuestions(formattedQuestions);
        setTotalQuestions(formattedQuestions.length);

        // answers dizisini soru sayısına göre resetle
        setAnswers(Array(formattedQuestions.length).fill("none"));
      } catch (err) {
        console.error("❌ Error in fetchLiveQuestions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveQuestions();
  }, [securityPassed]);

  // === FETCH USER ROUNDS ===
  useEffect(() => {
    const fetchUserRounds = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        
        if (!user) {
          setUserRounds(0);
          return;
        }

        // ✅ FIXED: Correct column name 'remaining'
        const { data, error } = await supabase
          .from("user_rounds")
          .select("remaining")
          .eq("user_id", user.id)
          .single();

        // ✅ FIXED: Improved error handling
        if (error || !data) {
          console.error("Error fetching user rounds:", error);
          setUserRounds(0);
          return;
        }

        setUserRounds(data.remaining || 0);
      } catch (err) {
        console.error("Error fetching user rounds:", err);
        setUserRounds(0);
      }
    };

    fetchUserRounds();
  }, []);

  // === SAVE ANSWER TO SUPABASE ===
  const saveAnswer = async (
    questionId: number,
    answer: OptionId | null,
    isCorrectFlag: boolean
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("user_answers").insert({
        user_id: user.id,
        question_id: questionId,
        selected_answer: answer,
        is_correct: isCorrectFlag,
        time_taken: QUESTION_DURATION - timeLeft,
        answered_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error saving answer:", err);
    }
  };

  // === UPDATE USER STATS ===
  const updateUserStats = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const accuracy =
        totalQuestions > 0
          ? Math.round((correctCount / totalQuestions) * 100)
          : 0;
      const score = correctCount * 2;

      await supabase
        .from("user_stats")
        .upsert(
          {
            user_id: user.id,
            total_questions_answered: totalQuestions,
            correct_answers: correctCount,
            wrong_answers: wrongCount,
            accuracy_percentage: accuracy,
            max_streak: maxStreak,
            last_round_score: score,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

      await supabase.from("quiz_history").insert({
        user_id: user.id,
        score: score,
        correct_count: correctCount,
        wrong_count: wrongCount,
        accuracy: accuracy,
        max_streak: maxStreak,
        completed_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error updating user stats:", err);
    }
  };

  // ✅ FIXED: Stats save with better guard
  const saveStatsOnce = async () => {
    if (statsSavedRef.current) {
      console.log("📊 Stats already saved, skipping...");
      return;
    }
    
    console.log("📊 Saving stats...");
    statsSavedRef.current = true;
    await updateUserStats();
  };

  // ✅ FIXED: Correct RPC function name (deduct_user_round, not decrease_user_round)
  const deductUserRound = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.rpc("deduct_user_round", {
        p_user_id: user.id,
      });

      if (error) {
        console.error("Error deducting round:", error);
      } else {
        console.log("✅ Round deducted successfully");
      }
    } catch (err) {
      console.error("Error deducting round:", err);
    }
  };

  // === SOUND HELPERS ===
  const playSound = (
    audio: HTMLAudioElement | null,
    options?: { loop?: boolean }
  ) => {
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

  // 🔥 NEW: REALTIME ROUND STATE LISTENER
  useEffect(() => {
    if (!roundId) return;

    console.log("🔌 Subscribing to round-state channel for round:", roundId);

    const channel = supabase
      .channel("round-state")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "live_rounds",
          filter: `id=eq.${roundId}`,
        },
        (payload) => {
          const row = payload.new as any;
          console.log(
            "🔄 Round state updated:",
            row.phase,
            "Question:",
            row.current_question_index
          );

          // ✅ FIXED: Safe index handling
          const safeIndex =
            typeof row.current_question_index === "number"
              ? Math.max(0, row.current_question_index)
              : 0;

          setPhase(row.phase || "READY");
          setCurrentIndex(safeIndex);
          setQuestionStart(row.question_started_at || null);

          if (row.phase === "QUESTION") {
            console.log("▶️ Phase: QUESTION - Resetting UI state");
            setShowExplanation(false);
            setIsAnswerLocked(false);
            setSelectedAnswer(null);
            setTimeLeft(QUESTION_DURATION);
            timeoutTriggeredRef.current = false; // ✅ Reset timeout guard
          } else if (row.phase === "INTERMISSION") {
            console.log("⏸️ Phase: INTERMISSION - Showing explanation");
            setShowExplanation(true);
          } else if (row.phase === "FINISHED") {
            console.log("🏁 Phase: FINISHED - Showing final score");
            setShowFinalScore(true);
            saveStatsOnce();
          }
        }
      )
      .subscribe();

    return () => {
      console.log("🔌 Unsubscribing from round-state channel");
      supabase.removeChannel(channel);
    };
  }, [roundId]);

  // Start/stop tick by UI state
  useEffect(() => {
    if (
      phase === "QUESTION" &&
      !isAnswerLocked &&
      isSoundEnabled &&
      !showFinalScore &&
      !showExplanation &&
      timeLeft > 0
    ) {
      startTick();
    } else {
      stopTick();
    }
  }, [
    phase,
    isAnswerLocked,
    isSoundEnabled,
    showFinalScore,
    showExplanation,
    timeLeft,
  ]);

  // 🔥 NEW: SERVER-SYNCED TIMER (replaces local countdown)
  useEffect(() => {
    if (!questionStart || phase !== "QUESTION") {
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(questionStart).getTime();
      const diff = Math.floor((now - start) / 1000);
      const remaining = Math.max(0, QUESTION_DURATION - diff);

      setTimeLeft(remaining);

      // ✅ FIXED: Double-trigger protection
      if (remaining === 0 && !isAnswerLocked && !timeoutTriggeredRef.current) {
        console.log("⏱️ Time expired, auto-submitting...");
        timeoutTriggeredRef.current = true;
        handleTimeout();
      }
    }, 200);

    return () => clearInterval(timer);
  }, [questionStart, phase, isAnswerLocked]);

  // ✅ FIXED: Stabilized final score countdown
  useEffect(() => {
    if (!showFinalScore) return;

    console.log("🏁 Final score screen activated");
    stopTick();
    playSound(gameoverSoundRef.current);

    let remaining = FINAL_SCORE_DURATION;
    setFinalCountdown(remaining);

    const interval = setInterval(() => {
      remaining -= 1;
      setFinalCountdown(Math.max(0, remaining));
      
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    const timeout = setTimeout(() => {
      console.log("🏠 Auto-redirecting to home...");
      router.push("/");
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
    if (phase === "QUESTION" && timeLeft > 0) {
      startTick();
    }
  }, [isSoundEnabled, phase, timeLeft]);

  // Stop tick safety
  useEffect(() => {
    if (showFinalScore || showExplanation || timeLeft <= 0) {
      stopTick();
    }
  }, [showFinalScore, showExplanation, timeLeft]);

  // === HANDLERS ===
  const handleAnswerClick = (optionId: OptionId) => {
    if (isAnswerLocked || showExplanation || showFinalScore) return;
    if (!currentQ) return;

    console.log("✅ Answer selected:", optionId);
    playClick();
    setSelectedAnswer(optionId);
    setIsAnswerLocked(true);
    timeoutTriggeredRef.current = true; // ✅ Prevent timeout after manual answer

    const correctFlag = optionId === currentQ.correctAnswer;
    setIsCorrect(correctFlag);

    setAnswers((prev) => {
      const next = prev.length
        ? [...prev]
        : (Array(totalQuestions).fill("none") as AnswerStatus[]);
      if (currentIndex >= 0 && currentIndex < next.length) {
        next[currentIndex] = correctFlag ? "correct" : "wrong";
      }
      return next;
    });

    if (correctFlag) {
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

    saveAnswer(currentQ.id, optionId, correctFlag);
  };

  const handleTimeout = () => {
    if (isAnswerLocked || showExplanation || showFinalScore) return;
    if (!currentQ) return;

    console.log("⏱️ Timeout - no answer submitted");
    setIsAnswerLocked(true);
    setWrongCount((w) => w + 1);
    setStreak(0);

    setAnswers((prev) => {
      const next = prev.length
        ? [...prev]
        : (Array(totalQuestions).fill("none") as AnswerStatus[]);
      if (currentIndex >= 0 && currentIndex < next.length) {
        next[currentIndex] = "wrong";
      }
      return next;
    });

    saveAnswer(currentQ.id, null, false);
    playSound(wrongSoundRef.current);
  };

  const handleExitClick = () => {
    if (showFinalScore) return;
    playClick();
    setShowExitConfirm(true);
  };

  const handleExitConfirmYes = async () => {
    console.log("🚪 User confirmed exit");
    playClick();
    stopTick();
    setShowExitConfirm(false);
    await saveStatsOnce();
    setShowFinalScore(true);
  };

  const handleExitConfirmNo = () => {
    console.log("↩️ User cancelled exit");
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

  const accuracy =
    totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;
  const score = correctCount * 2;

  // 🔐 === SECURITY VERIFICATION SCREEN ===
  if (isVerifying) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          color: "white",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "4px solid rgba(139, 92, 246, 0.3)",
            borderTopColor: "#8b5cf6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p
          style={{
            color: "#a78bfa",
            fontSize: "16px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🔐 Verifying access...
        </p>
      </div>
    );
  }

  // === LOADING SCREEN ===
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            className="animate-pulse"
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              border: "4px solid rgba(139,92,246,0.3)",
              borderTopColor: "#a78bfa",
              animation: "spin 1s linear infinite",
            }}
          />
          <p
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#cbd5e1",
            }}
          >
            Loading questions...
          </p>
        </div>
      </div>
    );
  }

  // === NO QUESTIONS FALLBACK ===
  if (!currentQ) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          padding: "20px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <XCircle
            style={{
              width: "64px",
              height: "64px",
              color: "#ef4444",
              margin: "0 auto 20px",
            }}
          />
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 900,
              marginBottom: "12px",
            }}
          >
            No Questions Available
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "#94a3b8",
              marginBottom: "24px",
            }}
          >
            Unable to load quiz questions. Please try again later.
          </p>
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #7c3aed, #d946ef)",
              color: "white",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(2deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.98);
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-150%) skewX(-25deg);
          }
          100% {
            transform: translateX(250%) skewX(-25deg);
          }
        }

        @keyframes neonPulse {
          0%,
          100% {
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
          0%,
          100% {
            filter: drop-shadow(0 0 8px rgba(167, 139, 250, 0.8));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(217, 70, 239, 1));
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .neon-border {
          animation: neonPulse 3s ease-in-out infinite;
        }
        .glow-icon {
          animation: glow 2s ease-in-out infinite;
        }

        *:focus-visible {
          outline: 3px solid #a78bfa;
          outline-offset: 3px;
          border-radius: 8px;
        }

        @media (min-width: 769px) {
          .brand-text {
            display: block !important;
          }
        }

        @media (max-width: 768px) {
          .brand-text {
            display: block !important;
          }
          .header-wrap {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
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
        }

        @media (max-width: 640px) {
          .score-pills {
            flex-wrap: wrap;
            justify-content: center;
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
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)",
          backgroundSize: "400% 400%",
          animation: "shimmer 15s ease infinite",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
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
            background:
              "radial-gradient(circle, rgba(124,58,237,0.5) 0%, rgba(124,58,237,0.1) 40%, transparent 70%)",
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
            background:
              "radial-gradient(circle, rgba(217,70,239,0.4) 0%, rgba(217,70,239,0.1) 40%, transparent 70%)",
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
            background:
              "radial-gradient(circle, rgba(56,189,248,0.3) 0%, rgba(56,189,248,0.05) 40%, transparent 70%)",
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
          }}
        >
          <div
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              padding: "0 clamp(16px, 4vw, 24px)",
            }}
          >
            <div
              className="header-wrap"
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                alignItems: "center",
                minHeight: "clamp(70px, 15vw, 80px)",
                gap: "clamp(12px, 3vw, 16px)",
                padding: "clamp(8px, 2vw, 12px) 0",
              }}
            >
              {/* Logo & Brand */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(10px, 2.5vw, 12px)",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "clamp(62px, 13vw, 78px)",
                    height: "clamp(62px, 13vw, 78px)",
                    borderRadius: "50%",
                    padding: 2,
                    background:
                      "linear-gradient(135deg, #7c3aed, #d946ef)",
                    boxShadow: "0 0 20px rgba(124, 58, 237, 0.7)",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      backgroundColor: "#020817",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      src="/images/logo.png"
                      alt="VibraXX"
                      fill
                      sizes="78px"
                      style={{ objectFit: "contain", padding: "4px" }}
                      priority
                    />
                  </div>
                </div>

                <div
                  className="brand-text"
                  style={{
                    display: "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(10px, 2.2vw, 13px)",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      fontWeight: 900,
                      background:
                        "linear-gradient(90deg, #a78bfa, #d946ef, #22d3ee)",
                      backgroundSize: "200% auto",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      animation: "shimmer 3s linear infinite",
                    }}
                  >
                    LIVE QUIZ
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(9px, 2vw, 11px)",
                      color: "#94a3b8",
                      fontWeight: 600,
                    }}
                  >
                    Global Championship
                  </div>
                </div>
              </div>

              {/* Center: Question Progress */}
              <div
                className="header-center"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "clamp(4px, 1.5vw, 6px)",
                  justifySelf: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(14px, 3.5vw, 20px)",
                    fontWeight: 900,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    background:
                      "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: "shimmer 2s linear infinite",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  Q {currentIndex + 1}/{totalQuestions}
                </div>
                {streak > 1 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 8px",
                      borderRadius: "999px",
                      background:
                        "linear-gradient(90deg, rgba(239,68,68,0.2), rgba(249,115,22,0.2))",
                      border: "1px solid rgba(239,68,68,0.5)",
                    }}
                  >
                    <Flame
                      style={{
                        width: "12px",
                        height: "12px",
                        color: "#fb923c",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        color: "#fbbf24",
                      }}
                    >
                      {streak}
                    </span>
                  </div>
                )}
              </div>

              {/* Right: Stats & Controls */}
              <div
                className="header-right"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(6px, 2vw, 10px)",
                  flexShrink: 0,
                }}
              >
                <div
                  className="score-pills"
                  style={{ display: "flex", gap: "clamp(4px, 1.5vw, 6px)" }}
                >
                  <div
                    style={{
                      padding:
                        "clamp(4px, 1.5vw, 6px) clamp(8px, 2.5vw, 12px)",
                      borderRadius: "999px",
                      background:
                        "linear-gradient(135deg, rgba(22,163,74,0.15), rgba(21,128,61,0.15))",
                      border: "2px solid rgba(34,197,94,0.5)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      boxShadow: "0 0 15px rgba(34,197,94,0.3)",
                    }}
                  >
                    <CheckCircle
                      style={{
                        width: "clamp(12px, 3vw, 16px)",
                        height: "clamp(12px, 3vw, 16px)",
                        color: "#22c55e",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "clamp(11px, 2.5vw, 13px)",
                        fontWeight: 900,
                        color: "#22c55e",
                      }}
                    >
                      {correctCount}
                    </span>
                  </div>
                  <div
                    style={{
                      padding:
                        "clamp(4px, 1.5vw, 6px) clamp(8px, 2.5vw, 12px)",
                      borderRadius: "999px",
                      background:
                        "linear-gradient(135deg, rgba(220,38,38,0.15), rgba(185,28,28,0.15))",
                      border: "2px solid rgba(239,68,68,0.5)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      boxShadow: "0 0 15px rgba(239,68,68,0.3)",
                    }}
                  >
                    <XCircle
                      style={{
                        width: "clamp(12px, 3vw, 16px)",
                        height: "clamp(12px, 3vw, 16px)",
                        color: "#ef4444",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "clamp(11px, 2.5vw, 13px)",
                        fontWeight: 900,
                        color: "#ef4444",
                      }}
                    >
                      {wrongCount}
                    </span>
                  </div>
                </div>

                {/* Sound Toggle */}
                <button
                  onClick={handleSoundToggle}
                  className={isSoundEnabled ? "neon-border" : ""}
                  style={{
                    width: "clamp(36px, 10vw, 44px)",
                    height: "clamp(36px, 10vw, 44px)",
                    borderRadius: "12px",
                    border: "2px solid rgba(167,139,250,0.6)",
                    background: isSoundEnabled
                      ? "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.2))"
                      : "rgba(30,27,75,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition:
                      "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    flexShrink: 0,
                  }}
                >
                  {isSoundEnabled ? (
                    <Volume2
                      style={{
                        width: "clamp(16px, 4vw, 20px)",
                        height: "clamp(16px, 4vw, 20px)",
                        color: "#a78bfa",
                      }}
                    />
                  ) : (
                    <VolumeX
                      style={{
                        width: "clamp(16px, 4vw, 20px)",
                        height: "clamp(16px, 4vw, 20px)",
                        color: "#6b7280",
                      }}
                    />
                  )}
                </button>

                {!showFinalScore && (
                  <button
                    onClick={handleExitClick}
                    className="neon-border"
                    style={{
                      padding:
                        "clamp(8px, 2.5vw, 10px) clamp(12px, 4vw, 20px)",
                      borderRadius: "999px",
                      border: "2px solid rgba(239,68,68,0.6)",
                      background:
                        "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(185,28,28,0.2))",
                      color: "white",
                      fontSize: "clamp(10px, 2.5vw, 12px)",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      transition:
                        "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 0 30px rgba(239,68,68,0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <Zap
                      style={{
                        width: "clamp(12px, 3vw, 16px)",
                        height: "clamp(12px, 3vw, 16px)",
                      }}
                    />
                    <span>Exit</span>
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
            zIndex: 10,
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "clamp(20px, 5vw, 40px) clamp(16px, 4vw, 24px)",
          }}
        >
          {/* CIRCULAR TIMER */}
          {!showFinalScore && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "clamp(24px, 5vw, 32px)",
              }}
            >
              <div
                className="animate-pulse"
                style={{
                  position: "relative",
                  width: "clamp(100px, 20vw, 120px)",
                  height: "clamp(100px, 20vw, 120px)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: `4px solid ${getTimeColor()}`,
                    boxShadow: `0 0 30px ${getTimeColor()}, inset 0 0 20px ${getTimeColor()}`,
                    opacity: 0.8,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: "10px",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(15,23,42,1) 0%, rgba(6,8,20,1) 100%)",
                    border: "2px solid rgba(139,92,246,0.3)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
                  }}
                >
                  <Clock
                    style={{
                      width: "clamp(20px, 4vw, 28px)",
                      height: "clamp(20px, 4vw, 28px)",
                      color: getTimeColor(),
                      filter: `drop-shadow(0 0 8px ${getTimeColor()})`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "clamp(32px, 6vw, 42px)",
                      fontWeight: 900,
                      color: getTimeColor(),
                      textShadow: `0 0 20px ${getTimeColor()}`,
                      lineHeight: 1,
                    }}
                  >
                    {timeLeft}
                  </span>
                  <span
                    style={{
                      fontSize: "clamp(9px, 1.8vw, 11px)",
                      color: "#94a3b8",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    seconds
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* FINAL SCORE SCREEN */}
          {showFinalScore ? (
            <article
              className="animate-slide-up"
              style={{
                padding: "clamp(24px, 5vw, 32px)",
                borderRadius: "clamp(20px, 4vw, 24px)",
                border: "2px solid rgba(139,92,246,0.5)",
                background:
                  "linear-gradient(135deg, rgba(30,27,75,0.98) 0%, rgba(15,23,42,0.98) 100%)",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.4)",
                textAlign: "center",
                backdropFilter: "blur(20px)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  marginBottom: "clamp(16px, 3vw, 20px)",
                }}
              >
                <Trophy
                  style={{
                    width: "clamp(48px, 10vw, 64px)",
                    height: "clamp(48px, 10vw, 64px)",
                    color: "#fbbf24",
                    filter: "drop-shadow(0 0 20px #fbbf24)",
                  }}
                />
              </div>

              <h1
                style={{
                  fontSize: "clamp(20px, 4.5vw, 28px)",
                  fontWeight: 900,
                  marginBottom: "clamp(20px, 4vw, 28px)",
                  backgroundImage:
                    "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmer 3s linear infinite",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Round Complete!
              </h1>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "clamp(12px, 3vw, 16px)",
                  marginBottom: "clamp(20px, 4vw, 24px)",
                }}
              >
                <div
                  style={{
                    padding: "clamp(16px, 3.5vw, 20px)",
                    borderRadius: "clamp(14px, 3vw, 16px)",
                    background:
                      "linear-gradient(135deg, rgba(22,163,74,0.2), rgba(21,128,61,0.15))",
                    border: "2px solid rgba(34,197,94,0.5)",
                    boxShadow: "0 0 20px rgba(34,197,94,0.3)",
                  }}
                >
                  <CheckCircle
                    style={{
                      width: "clamp(28px, 6vw, 36px)",
                      height: "clamp(28px, 6vw, 36px)",
                      color: "#22c55e",
                      marginBottom: "clamp(6px, 1.5vw, 8px)",
                      filter: "drop-shadow(0 0 10px #22c55e)",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "clamp(32px, 7vw, 48px)",
                      fontWeight: 900,
                      color: "#22c55e",
                      lineHeight: 1,
                      marginBottom: "clamp(4px, 1vw, 6px)",
                      textShadow:
                        "0 0 15px rgba(34,197,94,0.6)",
                    }}
                  >
                    {correctCount}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(11px, 2.5vw, 13px)",
                      color: "#86efac",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Correct
                  </div>
                </div>

                <div
                  style={{
                    padding: "clamp(16px, 3.5vw, 20px)",
                    borderRadius: "clamp(14px, 3vw, 16px)",
                    background:
                      "linear-gradient(135deg, rgba(220,38,38,0.2), rgba(185,28,28,0.15))",
                    border: "2px solid rgba(239,68,68,0.5)",
                    boxShadow: "0 0 20px rgba(239,68,68,0.3)",
                  }}
                >
                  <XCircle
                    style={{
                      width: "clamp(28px, 6vw, 36px)",
                      height: "clamp(28px, 6vw, 36px)",
                      color: "#ef4444",
                      marginBottom: "clamp(6px, 1.5vw, 8px)",
                      filter: "drop-shadow(0 0 10px #ef4444)",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "clamp(32px, 7vw, 48px)",
                      fontWeight: 900,
                      color: "#ef4444",
                      lineHeight: 1,
                      marginBottom: "clamp(4px, 1vw, 6px)",
                      textShadow:
                        "0 0 15px rgba(239,68,68,0.6)",
                    }}
                  >
                    {wrongCount}
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(11px, 2.5vw, 13px)",
                      color: "#fca5a5",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Wrong
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding:
                    "clamp(12px, 2.5vw, 14px) clamp(16px, 3.5vw, 20px)",
                  borderRadius: "clamp(12px, 2.5vw, 14px)",
                  background: "rgba(124,58,237,0.15)",
                  border: "1px solid rgba(139,92,246,0.4)",
                  marginBottom: "clamp(20px, 4vw, 24px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
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
                    textShadow:
                      "0 0 10px rgba(167,139,250,0.6)",
                  }}
                >
                  {userRounds}
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

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(10px, 2.5vw, 12px)",
                  marginBottom: "clamp(16px, 3.5vw, 20px)",
                }}
              >
                <button
                  onClick={async () => {
                    playClick();
                    if (userRounds > 0) {
                      await deductUserRound();
                      router.push("/lobby");
                    } else {
                      router.push("/buy");
                    }
                  }}
                  style={{
                    width: "100%",
                    padding:
                      "clamp(12px, 3vw, 14px) clamp(20px, 4vw, 24px)",
                    borderRadius: "clamp(12px, 2.5vw, 14px)",
                    border: "none",
                    background:
                      userRounds > 0
                        ? "linear-gradient(135deg, #7c3aed, #d946ef)"
                        : "linear-gradient(135deg, #f59e0b, #fbbf24)",
                    color: "white",
                    fontSize:
                      "clamp(14px, 3.2vw, 16px)",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow:
                      userRounds > 0
                        ? "0 8px 25px rgba(139,92,246,0.4)"
                        : "0 8px 25px rgba(251,191,36,0.4)",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      userRounds > 0
                        ? "0 12px 35px rgba(139,92,246,0.6)"
                        : "0 12px 35px rgba(251,191,36,0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      userRounds > 0
                        ? "0 8px 25px rgba(139,92,246,0.4)"
                        : "0 8px 25px rgba(251,191,36,0.4)";
                  }}
                >
                  {userRounds > 0 ? (
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
                    padding:
                      "clamp(12px, 3vw, 14px) clamp(20px, 4vw, 24px)",
                    borderRadius: "clamp(12px, 2.5vw, 14px)",
                    border: "2px solid rgba(148,163,253,0.4)",
                    background: "rgba(15,23,42,0.6)",
                    color: "white",
                    fontSize:
                      "clamp(14px, 3.2vw, 16px)",
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
                    e.currentTarget.style.transform =
                      "translateY(-2px)";
                    e.currentTarget.style.borderColor =
                      "rgba(139,92,246,0.6)";
                    e.currentTarget.style.background =
                      "rgba(139,92,246,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor =
                      "rgba(148,163,253,0.4)";
                    e.currentTarget.style.background =
                      "rgba(15,23,42,0.6)";
                  }}
                >
                  <Star style={{ width: "18px", height: "18px" }} />
                  Exit Quiz
                </button>
              </div>

              <div
                style={{
                  padding:
                    "clamp(10px, 2vw, 12px) clamp(14px, 3vw, 16px)",
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
                      fontSize:
                        "clamp(13px, 3vw, 16px)",
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
              {!showExplanation ? (
                <article
                  className="animate-slide-up"
                  style={{
                    padding:
                      "clamp(24px, 5vw, 32px) clamp(20px, 4vw, 28px)",
                    borderRadius:
                      "clamp(24px, 5vw, 32px)",
                    border: "2px solid rgba(139,92,246,0.4)",
                    background:
                      "linear-gradient(135deg, rgba(30,27,75,0.95) 0%, rgba(15,23,42,0.95) 100%)",
                    boxShadow:
                      "0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(139,92,246,0.2)",
                    backdropFilter: "blur(20px)",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "16px",
                    }}
                  >
                    <Target
                      style={{
                        width: "24px",
                        height: "24px",
                        color: "#22d3ee",
                        filter:
                          "drop-shadow(0 0 8px #22d3ee)",
                      }}
                    />
                    <span
                      style={{
                        fontSize:
                          "clamp(11px, 2.3vw, 14px)",
                        color: "#22d3ee",
                        fontWeight: 800,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                      }}
                    >
                      Question {currentIndex + 1}
                    </span>
                  </div>

                  <h2
                    style={{
                      fontSize: "clamp(18px, 4vw, 24px)",
                      lineHeight: 1.5,
                      fontWeight: 700,
                      marginBottom: "24px",
                      color: "#f8fafc",
                    }}
                  >
                    {currentQ.question}
                  </h2>

                  <div
                    className="question-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "14px",
                    }}
                  >
                    {currentQ.options.map((opt) => {
                      const isSelected =
                        selectedAnswer === opt.id;
                      const isCorrectOpt =
                        opt.id === currentQ.correctAnswer;
                      const locked = isAnswerLocked;

                      let borderColor =
                        "rgba(139,92,246,0.5)";
                      let boxShadow =
                        "0 4px 20px rgba(0,0,0,0.3)";
                      let bg =
                        "linear-gradient(135deg, rgba(30,27,75,0.8), rgba(15,23,42,0.9))";

                      if (locked) {
                        if (isCorrectOpt) {
                          borderColor = "#22c55e";
                          boxShadow =
                            "0 0 25px rgba(34,197,94,0.6), 0 4px 20px rgba(0,0,0,0.3)";
                          bg =
                            "linear-gradient(135deg, rgba(22,163,74,0.3), rgba(21,128,61,0.2))";
                        } else if (
                          isSelected &&
                          !isCorrectOpt
                        ) {
                          borderColor = "#ef4444";
                          boxShadow =
                            "0 0 25px rgba(239,68,68,0.6), 0 4px 20px rgba(0,0,0,0.3)";
                          bg =
                            "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(185,28,28,0.2))";
                        } else {
                          borderColor =
                            "rgba(75,85,99,0.4)";
                          boxShadow =
                            "0 4px 15px rgba(0,0,0,0.2)";
                          bg =
                            "linear-gradient(135deg, rgba(30,27,75,0.5), rgba(15,23,42,0.6))";
                        }
                      } else if (isSelected) {
                        borderColor = "#d946ef";
                        boxShadow =
                          "0 0 25px rgba(217,70,239,0.6), 0 4px 20px rgba(0,0,0,0.3)";
                        bg =
                          "linear-gradient(135deg, rgba(147,51,234,0.3), rgba(126,34,206,0.2))";
                      }

                      return (
                        <button
                          key={opt.id}
                          onClick={() =>
                            handleAnswerClick(opt.id)
                          }
                          disabled={locked}
                          style={{
                            position: "relative",
                            padding:
                              "clamp(16px, 3vw, 20px) clamp(14px, 3vw, 18px)",
                            borderRadius:
                              "clamp(16px, 3vw, 20px)",
                            border: `3px solid ${borderColor}`,
                            background: bg,
                            color: "#f8fafc",
                            textAlign: "left",
                            cursor: locked
                              ? "default"
                              : "pointer",
                            boxShadow,
                            transition:
                              "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            overflow: "hidden",
                            opacity:
                              locked &&
                              !isSelected &&
                              !isCorrectOpt
                                ? 0.4
                                : 1,
                            transform:
                              isSelected && !locked
                                ? "scale(1.02)"
                                : "scale(1)",
                          }}
                          onMouseEnter={(e) => {
                            if (!locked) {
                              e.currentTarget.style.transform =
                                "translateY(-4px) scale(1.02)";
                              e.currentTarget.style.boxShadow =
                                "0 0 30px rgba(139,92,246,0.5), 0 8px 25px rgba(0,0,0,0.4)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!locked) {
                              e.currentTarget.style.transform =
                                "translateY(0) scale(1)";
                              e.currentTarget.style.boxShadow =
                                boxShadow;
                            }
                          }}
                        >
                          {!locked && (
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: "-100%",
                                width: "50%",
                                height: "100%",
                                background:
                                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                                animation:
                                  "shine 3s infinite",
                                pointerEvents: "none",
                              }}
                            />
                          )}

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              position: "relative",
                              zIndex: 2,
                            }}
                          >
                            <div
                              style={{
                                width:
                                  "clamp(36px, 7vw, 44px)",
                                height:
                                  "clamp(36px, 7vw, 44px)",
                                borderRadius: "12px",
                                border: `2px solid ${borderColor}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent:
                                  "center",
                                fontSize:
                                  "clamp(16px, 3vw, 20px)",
                                fontWeight: 900,
                                background:
                                  "rgba(15,23,42,0.9)",
                                boxShadow:
                                  "inset 0 2px 8px rgba(0,0,0,0.3)",
                                color:
                                  isCorrectOpt &&
                                  locked
                                    ? "#22c55e"
                                    : isSelected &&
                                      locked &&
                                      !isCorrectOpt
                                    ? "#ef4444"
                                    : "#a78bfa",
                                flexShrink: 0,
                              }}
                            >
                              {opt.id}
                            </div>

                            <div
                              style={{
                                fontSize:
                                  "clamp(14px, 3vw, 16px)",
                                fontWeight: 600,
                                color: "#f8fafc",
                                lineHeight: 1.4,
                              }}
                            >
                              {opt.text}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </article>
              ) : (
                <article
                  className="animate-slide-up"
                  style={{
                    padding:
                      "clamp(24px, 5vw, 32px) clamp(20px, 4vw, 28px)",
                    borderRadius:
                      "clamp(24px, 5vw, 32px)",
                    border: "2px solid rgba(56,189,248,0.5)",
                    background:
                      "linear-gradient(135deg, rgba(8,47,73,0.95), rgba(6,8,20,0.95))",
                    boxShadow:
                      "0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(56,189,248,0.3)",
                    backdropFilter: "blur(20px)",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle
                          style={{
                            width: "32px",
                            height: "32px",
                            color: "#22c55e",
                            filter:
                              "drop-shadow(0 0 10px #22c55e)",
                          }}
                        />
                        <span
                          style={{
                            fontSize:
                              "clamp(20px, 4vw, 26px)",
                            fontWeight: 900,
                            color: "#22c55e",
                            textShadow:
                              "0 0 10px rgba(34,197,94,0.5)",
                          }}
                        >
                          Correct Answer!
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle
                          style={{
                            width: "32px",
                            height: "32px",
                            color: "#ef4444",
                            filter:
                              "drop-shadow(0 0 10px #ef4444)",
                          }}
                        />
                        <span
                          style={{
                            fontSize:
                              "clamp(20px, 4vw, 26px)",
                            fontWeight: 900,
                            color: "#ef4444",
                            textShadow:
                              "0 0 10px rgba(239,68,68,0.5)",
                          }}
                        >
                          Incorrect
                        </span>
                      </>
                    )}
                  </div>

                  <div
                    style={{
                      padding: "14px 18px",
                      borderRadius: "16px",
                      background: "rgba(22,163,74,0.15)",
                      border:
                        "2px solid rgba(34,197,94,0.4)",
                      marginBottom: "16px",
                    }}
                  >
                    <span
                      style={{
                        fontSize:
                          "clamp(13px, 2.8vw, 15px)",
                        color: "#86efac",
                        fontWeight: 700,
                      }}
                    >
                      Correct Answer:{" "}
                      <span
                        style={{
                          color: "#22c55e",
                          fontWeight: 900,
                          fontSize:
                            "clamp(15px, 3.2vw, 18px)",
                        }}
                      >
                        {currentQ.correctAnswer}
                      </span>
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: "clamp(14px, 3vw, 16px)",
                      color: "#e0f2fe",
                      lineHeight: 1.7,
                      marginBottom: "20px",
                      fontWeight: 500,
                    }}
                  >
                    {currentQ.explanation}
                  </p>

                  <div
                    style={{
                      padding: "14px 20px",
                      borderRadius: "16px",
                      background: "rgba(15,23,42,0.9)",
                      border:
                        "1px solid rgba(56,189,248,0.3)",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize:
                          "clamp(12px, 2.5vw, 14px)",
                        color: "#94a3b8",
                        fontWeight: 600,
                      }}
                    >
                      {phase === "INTERMISSION"
                        ? "⏳ Waiting for next question..."
                        : "Next question starting..."}
                    </p>
                  </div>
                </article>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "clamp(4px, 1vw, 6px)",
                  padding: "0 16px",
                }}
              >
                {Array.from({ length: totalQuestions }).map(
                  (_, i) => {
                    const st = answers[i];
                    let bg =
                      "rgba(75,85,99,0.4)";
                    let shadow = "none";

                    if (i === currentIndex) {
                      bg = "#a78bfa";
                      shadow =
                        "0 0 10px rgba(167,139,250,0.8)";
                    } else if (st === "correct") {
                      bg = "#22c55e";
                      shadow =
                        "0 0 8px rgba(34,197,94,0.6)";
                    } else if (st === "wrong") {
                      bg = "#ef4444";
                      shadow =
                        "0 0 8px rgba(239,68,68,0.6)";
                    }

                    return (
                      <div
                        key={i}
                        style={{
                          width:
                            "clamp(6px, 1.5vw, 8px)",
                          height:
                            "clamp(6px, 1.5vw, 8px)",
                          borderRadius: "50%",
                          background: bg,
                          boxShadow: shadow,
                          transition: "all 0.3s ease",
                          transform:
                            i === currentIndex
                              ? "scale(1.3)"
                              : "scale(1)",
                        }}
                      />
                    );
                  }
                )}
              </div>
            </>
          )}

          {showExitConfirm && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.85)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
                padding: "20px",
              }}
            >
              <div
                className="animate-slide-up"
                style={{
                  width: "min(400px, 90vw)",
                  padding: "32px 28px",
                  borderRadius: "24px",
                  background:
                    "linear-gradient(135deg, rgba(30,27,75,0.98), rgba(15,23,42,0.98))",
                  border: "2px solid rgba(139,92,246,0.5)",
                  boxShadow:
                    "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(139,92,246,0.4)",
                  textAlign: "center",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.1))",
                    border:
                      "2px solid rgba(239,68,68,0.5)",
                    marginBottom: "20px",
                  }}
                >
                  <Zap
                    style={{
                      width: "32px",
                      height: "32px",
                      color: "#ef4444",
                      filter:
                        "drop-shadow(0 0 10px #ef4444)",
                    }}
                  />
                </div>

                <h3
                  style={{
                    fontSize: "clamp(18px, 4vw, 22px)",
                    fontWeight: 900,
                    color: "#f8fafc",
                    marginBottom: "12px",
                  }}
                >
                  Exit Quiz?
                </h3>

                <p
                  style={{
                    fontSize: "clamp(13px, 2.8vw, 15px)",
                    color: "#94a3b8",
                    marginBottom: "28px",
                    lineHeight: 1.6,
                  }}
                >
                  Your current progress will be saved and
                  you'll see your final score.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <button
                    onClick={handleExitConfirmNo}
                    style={{
                      flex: 1,
                      padding: "14px 20px",
                      borderRadius: "999px",
                      border:
                        "2px solid rgba(139,92,246,0.6)",
                      background:
                        "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.2))",
                      color: "#f8fafc",
                      fontWeight: 800,
                      fontSize:
                        "clamp(13px, 2.8vw, 15px)",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 0 25px rgba(139,92,246,0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "none";
                    }}
                  >
                    Continue Quiz
                  </button>

                  <button
                    onClick={handleExitConfirmYes}
                    style={{
                      flex: 1,
                      padding: "14px 20px",
                      borderRadius: "999px",
                      border:
                        "2px solid rgba(239,68,68,0.6)",
                      background:
                        "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(185,28,28,0.2))",
                      color: "#f8fafc",
                      fontWeight: 800,
                      fontSize:
                        "clamp(13px, 2.8vw, 15px)",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 0 25px rgba(239,68,68,0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "none";
                    }}
                  >
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
