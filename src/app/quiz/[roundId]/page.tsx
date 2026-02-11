"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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
} from "lucide-react";

// === CONFIGURATION ===
const QUESTION_DURATION = 6; // seconds
const FINAL_SCORE_DURATION = 15; // seconds

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

// ✅ KANONIK: Helper to get correct answer from backend
interface QuestionWithAnswer extends Question {
  correct_option?: OptionId;
  explanation?: string;
}

export default function QuizGamePage() {
  const router = useRouter();
  const params = useParams();
  
  // ✅ PROFESSIONAL: RoundId from URL (NO MAGIC!)
  const roundIdParam = params?.roundId ? parseInt(params.roundId as string) : null;
  const roundId = roundIdParam && Number.isFinite(roundIdParam) ? roundIdParam : null;

  // 🔐 === SECURITY STATE ===
  const [isVerifying, setIsVerifying] = useState(true);
  const [securityPassed, setSecurityPassed] = useState(false);

  // === STATE ===
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION);
  const [selectedAnswer, setSelectedAnswer] = useState<OptionId | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);

  // DB-driven scores (no local increment)
  const [totalScore, setTotalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // Current question feedback from submit_answer
  const [currentCorrectOption, setCurrentCorrectOption] = useState<OptionId | null>(null);
  const [currentExplanation, setCurrentExplanation] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState(false);

  const [showExplanation, setShowExplanation] = useState(false);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [finalCountdown, setFinalCountdown] = useState(FINAL_SCORE_DURATION);

  const [answers, setAnswers] = useState<AnswerStatus[]>([]);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Final results from DB
  const [finalRank, setFinalRank] = useState<number | null>(null);
  const [finalTotalPlayers, setFinalTotalPlayers] = useState<number | null>(null);
  
  // Timeout guard
  const timeoutTriggeredRef = useRef(false);
  const answerSubmittedRef = useRef<Set<number>>(new Set());

  // === AUDIO REFS ===
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const whooshSoundRef = useRef<HTMLAudioElement | null>(null);
  const tickSoundRef = useRef<HTMLAudioElement | null>(null);

  const currentQ = questions[currentIndex] ?? null;

  // 🔐 === SECURITY CHECK - MUST RUN FIRST ===
  useEffect(() => {
    const verifyAccess = async () => {
      try {
        console.log("🔐 Starting security verification...");

        // ✅ BROWSER ACCESS GUARD: Block direct URL access
        // Quiz can only be accessed from lobby redirect
        const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        if (navigationEntry && navigationEntry.type === "navigate") {
          const referrer = document.referrer;
          const isFromLobby = referrer && referrer.includes("/lobby");
          
          if (!isFromLobby && !referrer.includes("/quiz/")) {
            console.log("❌ Quiz Security: Direct browser access blocked");
            router.push("/lobby");
            return;
          }
        }

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

        setUser(user); // Set user for share buttons
        setSecurityPassed(true);
        setIsVerifying(false);
      } catch (error) {
        console.error("❌ Security check failed:", error);
        router.push("/");
      }
    };

    verifyAccess();
  }, [router]);

  // ============================================
  // 🔐 KANONIK: LOAD QUIZ DATA (DB = COMMANDER)
  // ============================================
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        // Check: roundId from URL must exist
        if (!roundId) {
          console.log("❌ [QUIZ] No roundId in URL");
          router.push("/lobby");
          return;
        }

        if (!securityPassed) return;

        console.log("📝 [QUIZ] Loading quiz for round:", roundId);

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.push("/lobby");
          return;
        }

        // ✅ STEP 1: Get questions (DB checks everything)
        const { data: questionsData, error: questionsError } = await supabase
          .rpc("get_round_questions", {
            p_round_id: roundId
          });

        if (questionsError || !questionsData || questionsData.length === 0) {
          console.error("❌ [QUIZ] Questions error:", questionsError);
          router.push("/lobby");
          return;
        }

        console.log(`✅ [QUIZ] Loaded ${questionsData.length} questions`);

        // ✅ STEP 2: Get round progress (comprehensive restore)
        const { data: progress, error: progressError } = await supabase
          .rpc("get_round_progress", {
            p_round_id: roundId
          });

        let normalizedAnswers = Array(questionsData.length).fill("none");

        if (!progressError && progress) {
          console.log(`✅ [QUIZ] Progress restored:`, progress);
          
          // Restore all state from DB
          setCurrentIndex(progress.current_index || 0);
          setCorrectCount(progress.correct_count || 0);
          setWrongCount(progress.wrong_count || 0);
          setTotalScore(progress.total_score || 0);
          
          // ✅ Normalize answers array (copy up to min length)
          if (progress.answers_array && Array.isArray(progress.answers_array)) {
            const copyLength = Math.min(progress.answers_array.length, questionsData.length);
            for (let i = 0; i < copyLength; i++) {
              normalizedAnswers[i] = progress.answers_array[i] || "none";
            }
          }
        } else {
          // Fresh start
          setCurrentIndex(0);
          setCorrectCount(0);
          setWrongCount(0);
          setTotalScore(0);
        }

        // Set normalized answers and questions
        setAnswers(normalizedAnswers);
        setQuestions(questionsData);
        setTimeLeft(QUESTION_DURATION);
        timeoutTriggeredRef.current = false;
        setIsLoading(false);

      } catch (err) {
        console.error("❌ [QUIZ] Load error:", err);
        router.push("/lobby");
      }
    };

    loadQuizData();
  }, [securityPassed, roundId, router]);

  // === SIMPLE QUESTION TIMER ===
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

  // === FLASH FEEDBACK (Screen Pulse) ===
  const flashScreen = (color: string) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: ${color};
      opacity: 0.15;
      pointer-events: none;
      z-index: 9999;
      animation: flashFade 200ms ease-out;
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 200);
  };

  // === SIMPLE QUESTION TIMER ===
  useEffect(() => {
    if (isLoading || showExplanation || showFinalScore || !currentQ) return;

    if (timeLeft > 0 && !isAnswerLocked) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswerLocked && !timeoutTriggeredRef.current) {
      // Time's up - auto submit
      console.log("⏱️ Time expired, auto-submitting...");
      timeoutTriggeredRef.current = true;
      handleTimeout();
    }
  }, [timeLeft, isLoading, showExplanation, showFinalScore, isAnswerLocked, currentQ]);

  // Start/stop tick by UI state
  useEffect(() => {
    if (
      !isAnswerLocked &&
      isSoundEnabled &&
      !showFinalScore &&
      !showExplanation &&
      timeLeft > 0 &&
      !isLoading
    ) {
      startTick();
    } else {
      stopTick();
    }
  }, [
    isAnswerLocked,
    isSoundEnabled,
    showFinalScore,
    showExplanation,
    timeLeft,
    isLoading,
  ]);

  // === EXPLANATION TIMER (5 seconds) ===
  useEffect(() => {
    if (showExplanation && !showFinalScore) {
      const timer = setTimeout(async () => {
        // Move to next question or finish quiz
        if (currentIndex < questions.length - 1) {
          playSound(whooshSoundRef.current);
          setCurrentIndex(currentIndex + 1);
          setTimeLeft(QUESTION_DURATION);
          timeoutTriggeredRef.current = false;
          setSelectedAnswer(null);
          setIsAnswerLocked(false);
          setShowExplanation(false);
          setCurrentCorrectOption(null);
          setCurrentExplanation("");
        } else {
          // Quiz finished - load results from DB
          await loadFinalResults();
          setShowFinalScore(true);
        }
      }, 5000); // 5 seconds explanation

      return () => clearTimeout(timer);
    }
  }, [showExplanation, showFinalScore, currentIndex, questions.length, roundId]);

  // === LOAD FINAL RESULTS FROM DB ===
  const loadFinalResults = async () => {
    if (!roundId) return;

    try {
      const { data, error } = await supabase.rpc("get_round_result", {
        p_round_id: roundId
      });

      if (!error && data) {
        console.log("✅ Final results loaded:", data);
        setTotalScore(data.total_score || 0);
        setCorrectCount(data.correct_count || 0);
        setWrongCount(data.wrong_count || 0);
        setFinalRank(data.rank || null);
        setFinalTotalPlayers(data.total_players || null);
      }
    } catch (err) {
      console.error("❌ Error loading final results:", err);
    }
  };


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
    if (timeLeft > 0 && !isLoading && !showExplanation) {
      startTick();
    }
  }, [isSoundEnabled, timeLeft, isLoading, showExplanation]);

  // Stop tick safety
  useEffect(() => {
    if (showFinalScore || showExplanation || timeLeft <= 0) {
      stopTick();
    }
  }, [showFinalScore, showExplanation, timeLeft]);

  // === HANDLERS ===
  const handleAnswerClick = async (optionId: OptionId) => {
    if (isAnswerLocked || showExplanation || showFinalScore) return;
    if (!currentQ || !roundId) return;
    if (answerSubmittedRef.current.has(currentQ.question_id)) return;

    console.log("✅ Answer selected:", optionId);
    playClick();
    setSelectedAnswer(optionId);
    setIsAnswerLocked(true);
    timeoutTriggeredRef.current = true;

    const answerTimeMs = (QUESTION_DURATION - timeLeft) * 1000;
    answerSubmittedRef.current.add(currentQ.question_id);

    try {
      // ✅ KANONIK: submit_answer RPC
      const { data, error } = await supabase.rpc("submit_answer", {
        p_round_id: roundId,
        p_question_id: currentQ.question_id,
        p_selected_option: optionId,
        p_answer_time_ms: answerTimeMs
      });

      if (error) {
        console.error("❌ Submit error:", error);
        return;
      }

      if (data) {
        const correctFlag = data.is_correct || false;
        setIsCorrect(correctFlag);
        
        // ✅ KANONIK: Save explanation data
        setCurrentCorrectOption(data.correct_option);
        setCurrentExplanation(data.explanation || "");

        // ✅ KANONIK: Update from DB (no local increment)
        setTotalScore(data.current_total_score || 0);
        setCorrectCount(data.correct_count || 0);
        setWrongCount(data.wrong_count || 0);

        // ✅ Check if round finished (from backend)
        if (data.round_finished) {
          console.log("🏁 Round finished by DB");
          await loadFinalResults();
          setShowFinalScore(true);
          return;
        }

        setAnswers((prev) => {
          const next = prev.length ? [...prev] : Array(questions.length).fill("none");
          if (currentIndex >= 0 && currentIndex < next.length) {
            next[currentIndex] = correctFlag ? "correct" : "wrong";
          }
          return next;
        });

        if (correctFlag) {
          playSound(correctSoundRef.current);
          flashScreen('rgba(34, 197, 94, 1)'); // Green flash
        } else {
          playSound(wrongSoundRef.current);
          flashScreen('rgba(239, 68, 68, 1)'); // Red flash
        }
      }
    } catch (err) {
      console.error("❌ Answer submission error:", err);
    }

    setShowExplanation(true);
  };

  const handleTimeout = async () => {
    if (isAnswerLocked || showExplanation || showFinalScore) return;
    if (!currentQ || !roundId) return;
    if (answerSubmittedRef.current.has(currentQ.question_id)) return;

    console.log("⏱️ Timeout - auto submitting");
    setIsAnswerLocked(true);
    answerSubmittedRef.current.add(currentQ.question_id);

    try {
      // ✅ KANONIK: submit_answer with null (timeout)
      const { data, error } = await supabase.rpc("submit_answer", {
        p_round_id: roundId,
        p_question_id: currentQ.question_id,
        p_selected_option: null,
        p_answer_time_ms: QUESTION_DURATION * 1000
      });

      if (!error && data) {
        // ✅ KANONIK: Save explanation data
        setCurrentCorrectOption(data.correct_option);
        setCurrentExplanation(data.explanation || "");
        
        // ✅ KANONIK: Update from DB
        setTotalScore(data.current_total_score || 0);
        setCorrectCount(data.correct_count || 0);
        setWrongCount(data.wrong_count || 0);

        setAnswers((prev) => {
          const next = prev.length ? [...prev] : Array(questions.length).fill("none");
          if (currentIndex >= 0 && currentIndex < next.length) {
            next[currentIndex] = "wrong";
          }
          return next;
        });

        playSound(wrongSoundRef.current);
        flashScreen('rgba(239, 68, 68, 1)'); // Red flash for timeout
      }
    } catch (err) {
      console.error("❌ Timeout submit error:", err);
    }

    setShowExplanation(true);
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

    if (!roundId) return;

    try {
      // ✅ KANONIK: Force finish round (auto-submit remaining)
      await supabase.rpc("force_finish_user_round", {
        p_round_id: roundId
      });

      // Load final results
      await loadFinalResults();
      setShowFinalScore(true);
    } catch (err) {
      console.error("❌ Exit error:", err);
      setShowFinalScore(true);
    }
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

  const accuracy = questions.length > 0
    ? Math.round((correctCount / questions.length) * 100)
    : 0;

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
 if (!isLoading && questions.length === 0) {
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

        @keyframes flashFade {
          0% {
            opacity: 0.15;
          }
          100% {
            opacity: 0;
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

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* MINIMAL CONTROLS: Sound + Exit (No Header/Footer) */}
        {/* ═══════════════════════════════════════════════════════════ */}

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
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* FLOATING CONTROLS - Top Right */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {!showFinalScore && (
            <div
              style={{
                position: "fixed",
                top: "clamp(16px, 4vw, 24px)",
                right: "clamp(16px, 4vw, 24px)",
                display: "flex",
                gap: "clamp(8px, 2vw, 12px)",
                zIndex: 50,
              }}
            >
              {/* Sound Toggle */}
              <button
                onClick={handleSoundToggle}
                style={{
                  minWidth: "44px",
                  minHeight: "44px",
                  padding: "clamp(10px, 2vw, 12px)",
                  borderRadius: "clamp(12px, 3vw, 14px)",
                  border: `2px solid ${isSoundEnabled ? "rgba(167,139,250,0.6)" : "rgba(107,114,128,0.4)"}`,
                  background: isSoundEnabled
                    ? "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(79,70,229,0.3))"
                    : "rgba(30,27,75,0.7)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: isSoundEnabled
                    ? "0 0 20px rgba(124,58,237,0.4)"
                    : "0 4px 12px rgba(0,0,0,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {isSoundEnabled ? (
                  <Volume2
                    style={{
                      width: "clamp(20px, 4vw, 24px)",
                      height: "clamp(20px, 4vw, 24px)",
                      color: "#a78bfa",
                    }}
                  />
                ) : (
                  <VolumeX
                    style={{
                      width: "clamp(20px, 4vw, 24px)",
                      height: "clamp(20px, 4vw, 24px)",
                      color: "#6b7280",
                    }}
                  />
                )}
              </button>

              {/* Exit Button */}
              <button
                onClick={handleExitClick}
                style={{
                  minWidth: "44px",
                  minHeight: "44px",
                  padding: "clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)",
                  borderRadius: "clamp(12px, 3vw, 14px)",
                  border: "2px solid rgba(239,68,68,0.5)",
                  background: "linear-gradient(135deg, rgba(220,38,38,0.4), rgba(185,28,28,0.3))",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  fontSize: "clamp(12px, 2.5vw, 14px)",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: "0 0 20px rgba(239,68,68,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(239,68,68,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(239,68,68,0.3)";
                }}
              >
                <XCircle
                  style={{
                    width: "clamp(16px, 3vw, 18px)",
                    height: "clamp(16px, 3vw, 18px)",
                  }}
                />
                <span>Exit</span>
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* 🎖️ ROUND HEADER - Global Arena Feel */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {!showFinalScore && (
            <div
              style={{
                textAlign: "center",
                marginBottom: "clamp(16px, 3vw, 20px)",
                fontSize: "clamp(11px, 2.5vw, 13px)",
                fontWeight: 900,
                letterSpacing: "0.15em",
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              Round {roundId} • Question {currentIndex + 1}/{questions.length}
            </div>
          )}

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
                    boxShadow: `0 0 20px ${getTimeColor()}, inset 0 0 15px ${getTimeColor()}`,
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

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* 🎖️ LIVE SCORE - Mini Display */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {!showFinalScore && (
            <div
              style={{
                textAlign: "center",
                marginTop: "clamp(-8px, -2vw, -4px)",
                marginBottom: "clamp(20px, 4vw, 28px)",
                fontSize: "clamp(12px, 2.8vw, 14px)",
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  color: "#64748b",
                  fontSize: "clamp(10px, 2.2vw, 11px)",
                  fontWeight: 600,
                  marginRight: "6px",
                  letterSpacing: "0.1em",
                }}
              >
                SCORE
              </span>
              <span
                style={{
                  color: "#a78bfa",
                  fontSize: "clamp(14px, 3.2vw, 16px)",
                  fontWeight: 900,
                }}
              >
                {totalScore}
              </span>
              <span
                style={{
                  color: "#64748b",
                  fontSize: "clamp(10px, 2.2vw, 11px)",
                  marginLeft: "3px",
                }}
              >
                pts
              </span>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* 🏆 ULTRA-PREMIUM FINAL SCORE CARD */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {showFinalScore ? (
            <article
              className="animate-slide-up"
              style={{
                maxWidth: "min(480px, 95vw)",
                margin: "0 auto",
                padding: "clamp(32px, 6vw, 40px) clamp(24px, 5vw, 32px)",
                borderRadius: "clamp(24px, 5vw, 32px)",
                border: "2px solid rgba(251,191,36,0.4)",
                background:
                  "radial-gradient(circle at top, rgba(30,27,75,1), rgba(15,23,42,1))",
                boxShadow:
                  "0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(251,191,36,0.2)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Trophy Icon */}
              <div
                style={{
                  width: "clamp(80px, 16vw, 100px)",
                  height: "clamp(80px, 16vw, 100px)",
                  margin: "0 auto clamp(20px, 4vw, 24px)",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    "0 0 30px rgba(251,191,36,0.4), inset 0 0 20px rgba(255,255,255,0.2)",
                  border: "3px solid rgba(255,255,255,0.3)",
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
                  fontSize: "clamp(24px, 5.5vw, 32px)",
                  fontWeight: 900,
                  marginBottom: "clamp(8px, 2vw, 12px)",
                  background: "linear-gradient(to right, #fbbf24, #f59e0b, #fbbf24)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "0.02em",
                }}
              >
                Round Complete! 🎉
              </h1>

              {/* Rank Display (if available) */}
              {finalRank && finalTotalPlayers && (
                <div
                  style={{
                    fontSize: "clamp(14px, 3vw, 16px)",
                    color: "#cbd5e1",
                    marginBottom: "clamp(20px, 4vw, 24px)",
                    fontWeight: 600,
                  }}
                >
                  Ranked <span style={{ color: "#fbbf24", fontWeight: 900 }}>#{finalRank}</span> of{" "}
                  <span style={{ color: "#a78bfa" }}>{finalTotalPlayers}</span> players
                </div>
              )}

              {/* Score Display - MEGA */}
              <div
                style={{
                  padding: "clamp(20px, 4vw, 28px)",
                  borderRadius: "clamp(20px, 4vw, 24px)",
                  background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(168,85,247,0.2))",
                  border: "2px solid rgba(168,85,247,0.5)",
                  boxShadow: "0 0 40px rgba(168,85,247,0.4)",
                  marginBottom: "clamp(24px, 5vw, 32px)",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    color: "#a78bfa",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "clamp(8px, 2vw, 12px)",
                  }}
                >
                  Your Score
                </div>
                <div
                  style={{
                    fontSize: "clamp(56px, 12vw, 80px)",
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #a78bfa, #d946ef)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1,
                    textShadow: "0 0 40px rgba(168,85,247,0.8)",
                  }}
                >
                  {totalScore}
                </div>
                <div
                  style={{
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    color: "#cbd5e1",
                    fontWeight: 600,
                    marginTop: "clamp(4px, 1vw, 6px)",
                  }}
                >
                  {accuracy}% Accuracy
                </div>
              </div>

              {/* Stats Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "clamp(12px, 3vw, 16px)",
                  marginBottom: "clamp(24px, 5vw, 32px)",
                }}
              >
                {/* Correct */}
                <div
                  style={{
                    padding: "clamp(16px, 3.5vw, 20px)",
                    borderRadius: "clamp(16px, 3vw, 20px)",
                    background: "rgba(22,163,74,0.15)",
                    border: "2px solid rgba(34,197,94,0.4)",
                    boxShadow: "0 0 20px rgba(34,197,94,0.2)",
                  }}
                >
                  <CheckCircle
                    style={{
                      width: "clamp(28px, 6vw, 36px)",
                      height: "clamp(28px, 6vw, 36px)",
                      color: "#22c55e",
                      marginBottom: "clamp(8px, 2vw, 12px)",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "clamp(36px, 8vw, 48px)",
                      fontWeight: 900,
                      color: "#22c55e",
                      lineHeight: 1,
                      marginBottom: "clamp(4px, 1vw, 6px)",
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

                {/* Wrong */}
                <div
                  style={{
                    padding: "clamp(16px, 3.5vw, 20px)",
                    borderRadius: "clamp(16px, 3vw, 20px)",
                    background: "rgba(220,38,38,0.15)",
                    border: "2px solid rgba(239,68,68,0.4)",
                    boxShadow: "0 0 20px rgba(239,68,68,0.2)",
                  }}
                >
                  <XCircle
                    style={{
                      width: "clamp(28px, 6vw, 36px)",
                      height: "clamp(28px, 6vw, 36px)",
                      color: "#ef4444",
                      marginBottom: "clamp(8px, 2vw, 12px)",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "clamp(36px, 8vw, 48px)",
                      fontWeight: 900,
                      color: "#ef4444",
                      lineHeight: 1,
                      marginBottom: "clamp(4px, 1vw, 6px)",
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

              {/* Share Buttons */}
              <div style={{ marginBottom: "clamp(20px, 4vw, 24px)" }}>
                <ShareButtons
                  scoreData={{
                    score: totalScore,
                    correct: correctCount,
                    wrong: wrongCount,
                    accuracy,
                    userName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Player',
                    userCountry: user?.user_metadata?.country || '🌍',
                    roundId: roundId ?? undefined,
                  }}
                  variant="full"
                />
              </div>

              {/* Auto-redirect countdown */}
              <div
                style={{
                  fontSize: "clamp(12px, 2.5vw, 14px)",
                  color: "#94a3b8",
                  marginBottom: "clamp(16px, 3vw, 20px)",
                }}
              >
                Returning home in{" "}
                <span style={{ color: "#22c55e", fontWeight: 700 }}>
                  {finalCountdown}s
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => router.push("/")}
                style={{
                  width: "100%",
                  padding: "clamp(14px, 3vw, 16px) clamp(24px, 5vw, 32px)",
                  borderRadius: "clamp(12px, 3vw, 16px)",
                  border: "none",
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  color: "white",
                  fontSize: "clamp(14px, 3vw, 16px)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  cursor: "pointer",
                  boxShadow: "0 0 30px rgba(124,58,237,0.6)",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 0 40px rgba(124,58,237,0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(124,58,237,0.6)";
                }}
              >
                Go Home Now
              </button>
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
                    {currentQ.question_text}
                  </h2>

                  <div
                    className="question-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "clamp(12px, 3vw, 16px)",
                    }}
                  >
                    {(["a", "b", "c", "d"] as OptionId[]).map((optId) => {
                      const optText = currentQ[`option_${optId}` as keyof Question] as string;
                      const isSelected = selectedAnswer === optId;
                      const locked = isAnswerLocked;

                      let borderColor = "rgba(139,92,246,0.5)";
                      let boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
                      let bg = "linear-gradient(135deg, rgba(30,27,75,0.8), rgba(15,23,42,0.9))";

                      if (locked) {
                        if (isSelected) {
                          borderColor = isCorrect ? "#22c55e" : "#ef4444";
                          boxShadow = isCorrect
                            ? "0 0 25px rgba(34,197,94,0.6), 0 4px 20px rgba(0,0,0,0.3)"
                            : "0 0 25px rgba(239,68,68,0.6), 0 4px 20px rgba(0,0,0,0.3)";
                          bg = isCorrect
                            ? "linear-gradient(135deg, rgba(22,163,74,0.3), rgba(21,128,61,0.2))"
                            : "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(185,28,28,0.2))";
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
                          key={optId}
                          onClick={() => handleAnswerClick(optId)}
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
                            transition: "all 0.3s cubic-bezier(0.4, 0.2, 1)",
                            overflow: "hidden",
                            opacity: locked && !isSelected ? 0.4 : 1,
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
                                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                                animation: "shine 3s infinite",
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
                                color: locked && isSelected
                                  ? (isCorrect ? "#22c55e" : "#ef4444")
                                  : "#a78bfa",
                                flexShrink: 0,
                              }}
                            >
                              {optId.toUpperCase()}
                            </div>

                            <div
                              style={{
                                fontSize: "clamp(14px, 3vw, 16px)",
                                fontWeight: 600,
                                color: "#f8fafc",
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
                        {currentCorrectOption?.toUpperCase() || "N/A"}
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
                    {currentExplanation || "No explanation available."}
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
                      Next question starting...
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
                {Array.from({ length: questions.length }).map(
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
