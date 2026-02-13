"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Clock,
  CheckCircle,
  XCircle,
  Target,
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

const FREE_QUIZ_STATE_KEY = "vibraxx_free_quiz_state";

type OptionId = "a" | "b" | "c" | "d";
type AnswerStatus = "none" | "correct" | "wrong";
type QuizPhase = "INIT" | "COUNTDOWN" | "QUESTION" | "EXPLANATION" | "FINAL";

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

type PersistedState = {
  phase: QuizPhase;
  sessionId: number;
  questions: Question[];
  currentIndex: number;
  questionTime: number;
  explanationTime: number;
  countdownTime: number;
  correctCount: number;
  wrongCount: number;
  answers: AnswerStatus[];
  selectedAnswer: OptionId | null;
  isCorrect: boolean;
  // refresh-safe timestamps
  questionStartedAt: number | null; // ms
  countdownStartedAt: number | null; // ms
  explanationStartedAt: number | null; // ms
  // audio guards
  entryPlayed: boolean;
  whooshPlayed: boolean;
  gameoverPlayed: boolean;
};

const defaultAnswers = Array(TOTAL_QUESTIONS).fill("none") as AnswerStatus[];

export default function FreeQuizPage() {
  const router = useRouter();

  // ============================================
  // CANONICAL STATE
  // ============================================
  const [phase, setPhase] = useState<QuizPhase>("INIT");
  const [sessionId, setSessionId] = useState<number | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState<OptionId | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answers, setAnswers] = useState<AnswerStatus[]>(defaultAnswers);

  const [countdownTime, setCountdownTime] = useState(INITIAL_COUNTDOWN);
  const [questionTime, setQuestionTime] = useState(QUESTION_DURATION);
  const [explanationTime, setExplanationTime] = useState(EXPLANATION_DURATION);
  const [finalTime, setFinalTime] = useState(FINAL_SCORE_DURATION);

  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showAlreadyPlayedModal, setShowAlreadyPlayedModal] = useState(false);

  // ============================================
  // REFS (GUARDS + TIMESTAMPS)
  // ============================================
  const bootstrapOnceRef = useRef(false);
  const advancingRef = useRef(false);

  const countdownStartedAtRef = useRef<number | null>(null);
  const questionStartedAtRef = useRef<number | null>(null);
  const explanationStartedAtRef = useRef<number | null>(null);

  const entryPlayedRef = useRef(false);
  const whooshPlayedRef = useRef(false);
  const gameoverPlayedRef = useRef(false);

  // lock visual (question end)
  const lockedRef = useRef(false);

  // ============================================
  // AUDIO REFS (ANAYASA)
  // ============================================
  const entryRef = useRef<HTMLAudioElement | null>(null);
  const countdownRef = useRef<HTMLAudioElement | null>(null);
  const tickRef = useRef<HTMLAudioElement | null>(null);
  const whooshRef = useRef<HTMLAudioElement | null>(null);
  const correctRef = useRef<HTMLAudioElement | null>(null);
  const wrongRef = useRef<HTMLAudioElement | null>(null);
  const gameoverRef = useRef<HTMLAudioElement | null>(null);

  const currentQ = questions[currentIndex];

  // ============================================
  // SEO
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
  // AUDIO HELPERS (NO DEAD CODE)
  // ============================================
  const stopAudio = (a: HTMLAudioElement | null) => {
    if (!a) return;
    a.pause();
    try {
      a.currentTime = 0;
    } catch {}
    a.loop = false;
  };

  const playOnce = (a: HTMLAudioElement | null, opts?: { volume?: number }) => {
    if (!isSoundEnabled || !a) return;
    try {
      a.loop = false;
      if (typeof opts?.volume === "number") a.volume = opts.volume;
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch {}
  };

  const playLoop = (a: HTMLAudioElement | null, opts?: { volume?: number }) => {
    if (!isSoundEnabled || !a) return;
    try {
      a.loop = true;
      if (typeof opts?.volume === "number") a.volume = opts.volume;
      // do not always reset currentTime here to avoid clicky restart
      a.play().catch(() => {});
    } catch {}
  };

  // ============================================
  // PERSIST (REFRESH SAFE)
  // ============================================
  const persist = () => {
    if (phase === "INIT" || !sessionId) return;

    const payload: PersistedState = {
      phase,
      sessionId,
      questions,
      currentIndex,
      questionTime,
      explanationTime,
      countdownTime,
      correctCount,
      wrongCount,
      answers,
      selectedAnswer,
      isCorrect,
      questionStartedAt: questionStartedAtRef.current,
      countdownStartedAt: countdownStartedAtRef.current,
      explanationStartedAt: explanationStartedAtRef.current,
      entryPlayed: entryPlayedRef.current,
      whooshPlayed: whooshPlayedRef.current,
      gameoverPlayed: gameoverPlayedRef.current,
    };

    localStorage.setItem(FREE_QUIZ_STATE_KEY, JSON.stringify(payload));
  };

  useEffect(() => {
    persist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    phase,
    sessionId,
    questions,
    currentIndex,
    questionTime,
    explanationTime,
    countdownTime,
    correctCount,
    wrongCount,
    answers,
    selectedAnswer,
    isCorrect,
  ]);

  // ============================================
  // 🔊 GLOBAL AUDIO UNLOCK (Mobile Autoplay Fix)
  // ============================================
  useEffect(() => {
    const unlock = () => {
      // Unlock ALL audio elements on first interaction
      [
        entryRef.current,
        countdownRef.current,
        tickRef.current,
        whooshRef.current,
        correctRef.current,
        wrongRef.current,
        gameoverRef.current,
      ].forEach(a => {
        if (!a) return;
        a.volume = 0;
        a.play().then(() => {
          a.pause();
          a.currentTime = 0;
          a.volume = 1;
        }).catch(() => {});
      });
    };

    window.addEventListener("pointerdown", unlock, { once: true });
  }, []);

// INIT: DB = COMMANDER (BOOTSTRAP ONLY)
// ============================================
useEffect(() => {
  if (phase !== "INIT") return;
  if (bootstrapOnceRef.current) return;
  bootstrapOnceRef.current = true;

  const run = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // 1️⃣ Check eligibility (DB = KOMUTAN)
      const { data: eligibilityData, error: eligibilityError } = await supabase.rpc(
        "check_free_quiz_eligibility"
      );

      if (eligibilityError || !eligibilityData) {
        setShowAlreadyPlayedModal(true);
        return;
      }

      // Already played this week
      if (!eligibilityData.can_play) {
        localStorage.removeItem(FREE_QUIZ_STATE_KEY);
        setShowAlreadyPlayedModal(true);
        return;
      }

      // 2️⃣ Check for persisted state (refresh recovery)
      const savedState = localStorage.getItem(FREE_QUIZ_STATE_KEY);
      if (savedState) {
        try {
          const parsed: PersistedState = JSON.parse(savedState);
          
          // Validate session still exists
          const { data: sessionCheck } = await supabase
            .from("free_quiz_sessions")
            .select("id")
            .eq("id", parsed.sessionId)
            .single();

          if (sessionCheck) {
            // Restore state
            setSessionId(parsed.sessionId);
            setQuestions(parsed.questions);
            setCurrentIndex(parsed.currentIndex);
            setCorrectCount(parsed.correctCount);
            setWrongCount(parsed.wrongCount);
            setAnswers(parsed.answers);
            setSelectedAnswer(parsed.selectedAnswer);
            setIsCorrect(parsed.isCorrect);

            countdownStartedAtRef.current = parsed.countdownStartedAt;
            questionStartedAtRef.current = parsed.questionStartedAt;
            explanationStartedAtRef.current = parsed.explanationStartedAt;
            entryPlayedRef.current = parsed.entryPlayed;
            whooshPlayedRef.current = parsed.whooshPlayed;
            gameoverPlayedRef.current = parsed.gameoverPlayed;

            setPhase(parsed.phase);
            return;
          }
        } catch {}
      }

      // 3️⃣ Start new quiz (DB creates session + selects questions)
      const { data: startData, error: startError } = await supabase.rpc(
        "start_free_quiz"
      );

      if (startError || !startData || startData.error) {
        setShowAlreadyPlayedModal(true);
        return;
      }

      // New session
      if (
        startData.session_id &&
        startData.questions &&
        startData.questions.length >= TOTAL_QUESTIONS
      ) {
        setSessionId(startData.session_id);
        setQuestions(startData.questions);
        setCountdownTime(INITIAL_COUNTDOWN);
        countdownStartedAtRef.current = Date.now();

        entryPlayedRef.current = false;
        whooshPlayedRef.current = false;
        gameoverPlayedRef.current = false;
        lockedRef.current = false;

        setPhase("COUNTDOWN");
        return;
      }

      // Any unexpected state → safe fallback
      setShowAlreadyPlayedModal(true);
    } catch {
      setShowAlreadyPlayedModal(true);
    }
  };

  run();
}, [phase, router]);


  // ============================================
  // COUNTDOWN TIMER + countdown.mp3 (LOOP)
  // ============================================
  useEffect(() => {
    if (phase !== "COUNTDOWN") return;

    if (!isSoundEnabled) {
      stopAudio(countdownRef.current);
      return;
    }

    const c = countdownRef.current;
    if (!c) return;

    // Simple and reliable
    c.loop = true;
    c.currentTime = 0;

    const start = () => {
      c.play().catch(() => {});
    };

    start();

    if (!countdownStartedAtRef.current) countdownStartedAtRef.current = Date.now();

    const interval = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - (countdownStartedAtRef.current || Date.now())) / 1000
      );
      const remaining = Math.max(0, INITIAL_COUNTDOWN - elapsed);
      setCountdownTime(remaining);

      if (remaining <= 0) {
        clearInterval(interval);

        stopAudio(countdownRef.current);

        setPhase("QUESTION");
      }
    }, 200);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isSoundEnabled]);

  // ============================================
  // QUESTION: tick loop + entry once at FIRST QUESTION START
  // ============================================
  useEffect(() => {
    if (phase !== "QUESTION") return;

    // 🎯 Entry plays ONCE when first question card opens
    if (!entryPlayedRef.current) {
      playOnce(entryRef.current);
      entryPlayedRef.current = true;
    }

    lockedRef.current = false;
    whooshPlayedRef.current = false; // next EXPLANATION should whoosh

    // refresh-safe question start
    if (!questionStartedAtRef.current) questionStartedAtRef.current = Date.now();

    // Stop countdown if any residue
    stopAudio(countdownRef.current);

    // ✅ tick.mp3 loops during question
    if (tickRef.current) {
      tickRef.current.loop = true;
      // keep it smooth
      if (tickRef.current.paused) {
        playLoop(tickRef.current);
      } else {
        // ensure loop flag
        tickRef.current.loop = true;
      }
    }

    // compute remaining time (refresh-safe)
    const computeRemaining = () => {
      const elapsed = Math.floor(
        (Date.now() - (questionStartedAtRef.current || Date.now())) / 1000
      );
      return Math.max(0, QUESTION_DURATION - elapsed);
    };

    setQuestionTime(computeRemaining());

    const interval = setInterval(() => {
      const remaining = computeRemaining();
      setQuestionTime(remaining);

      if (remaining <= 0) {
        clearInterval(interval);

        // lock & finalize
        if (advancingRef.current) return;
        advancingRef.current = true;

        lockedRef.current = true;
        stopAudio(tickRef.current); // stop tick immediately

        // Timeout => submit to DB as null answer
        if (selectedAnswer === null) {
          if (sessionId && currentQ) {
            try {
              const { data, error } = await supabase.rpc("submit_free_quiz_answer", {
                p_session_id: sessionId,
                p_question_id: currentQ.id,
                p_selected_option: null,
                p_answer_time_ms: QUESTION_DURATION * 1000,
              });

              if (!error && data) {
                setCorrectCount(data.correct_count || correctCount);
                setWrongCount(data.wrong_count || wrongCount);
              }
            } catch {}
          }

          setWrongCount((w) => w + 1);
          setAnswers((prev) => {
            const copy = [...prev];
            copy[currentIndex] = "wrong";
            return copy;
          });
          setIsCorrect(false);

          // feedback sound must play at end of question
          playOnce(wrongRef.current);
        } else {
          // already answered -> play correct/wrong now at question end
          playOnce(isCorrect ? correctRef.current : wrongRef.current);
        }

        // phase transition
        questionStartedAtRef.current = null;
        explanationStartedAtRef.current = Date.now();
        setPhase("EXPLANATION");

        setTimeout(() => {
          advancingRef.current = false;
        }, 80);
      }
    }, 120);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    phase,
    currentIndex,
    selectedAnswer,
    isCorrect,
    isSoundEnabled,
  ]);

  // ============================================
  // EXPLANATION: whoosh on card open + no tick + timer
  // ============================================
  useEffect(() => {
    if (phase !== "EXPLANATION") return;

    // stop tick always
    stopAudio(tickRef.current);
    stopAudio(countdownRef.current);

    // whoosh must play exactly when explanation opens (once)
    if (!whooshPlayedRef.current) {
      playOnce(whooshRef.current);
      whooshPlayedRef.current = true;
    }

    // IMPORTANT:
    // correct/wrong already played at QUESTION END.
    // Do not replay here. (avoid overlap)

    if (!explanationStartedAtRef.current) explanationStartedAtRef.current = Date.now();

    const computeRemaining = () => {
      const elapsed = Math.floor(
        (Date.now() - (explanationStartedAtRef.current || Date.now())) / 1000
      );
      return Math.max(0, EXPLANATION_DURATION - elapsed);
    };

    setExplanationTime(computeRemaining());

    const interval = setInterval(() => {
      const remaining = computeRemaining();
      setExplanationTime(remaining);

      if (remaining <= 0) {
        clearInterval(interval);

        if (advancingRef.current) return;
        advancingRef.current = true;

        if (currentIndex < TOTAL_QUESTIONS - 1) {
          setCurrentIndex((i) => i + 1);
          setSelectedAnswer(null);
          setIsCorrect(false);
          lockedRef.current = false;

          explanationStartedAtRef.current = null;
          questionStartedAtRef.current = Date.now();
          setPhase("QUESTION");
        } else {
          explanationStartedAtRef.current = null;
          setPhase("FINAL");
        }

        setTimeout(() => {
          advancingRef.current = false;
        }, 80);
      }
    }, 120);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIndex, isSoundEnabled]);

  // ============================================
  // FINAL: submit once + gameover once + countdown to home
  // ============================================
  useEffect(() => {
    if (phase !== "FINAL") return;

    // stop any looping
    stopAudio(countdownRef.current);
    stopAudio(tickRef.current);

    // play gameover once
    if (!gameoverPlayedRef.current) {
      playOnce(gameoverRef.current);
      gameoverPlayedRef.current = true;
    }

    // Clear persisted state - quiz finished (DB already has all answers)
    localStorage.removeItem(FREE_QUIZ_STATE_KEY);

    setFinalTime(FINAL_SCORE_DURATION);
    const interval = setInterval(() => {
      setFinalTime((p) => Math.max(0, p - 1));
    }, 1000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      router.push("/");
    }, FINAL_SCORE_DURATION * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [phase, router]);

  // ============================================
  // ANSWER HANDLER (DB = KOMUTAN)
  // ============================================
  const handleAnswerClick = async (optionId: OptionId) => {
    if (phase !== "QUESTION") return;
    if (selectedAnswer !== null) return;
    if (!sessionId || !currentQ) return;

    setSelectedAnswer(optionId);

    const answerTimeMs = Math.floor(
      QUESTION_DURATION * 1000 - questionTime * 1000
    );

    try {
      // Submit to DB (DB calculates everything)
      const { data, error } = await supabase.rpc("submit_free_quiz_answer", {
        p_session_id: sessionId,
        p_question_id: currentQ.id,
        p_selected_option: optionId,
        p_answer_time_ms: answerTimeMs,
      });

      if (error || !data) return;

      // DB is the source of truth
      const isCorrectFromDB = data.is_correct;

      setIsCorrect(isCorrectFromDB);

      setAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = isCorrectFromDB ? "correct" : "wrong";
        return next;
      });

      setCorrectCount(data.correct_count || correctCount);
      setWrongCount(data.wrong_count || wrongCount);
    } catch {}

    // NOTE:
    // feedback sound & lock happens at question end (ANAYASA)
  };

  // ============================================
  // UI HELPERS
  // ============================================
  const handleSoundToggle = () => {
    setIsSoundEnabled((prev) => !prev);
  };

  useEffect(() => {
    // when sound disabled -> stop loops immediately
    if (!isSoundEnabled) {
      stopAudio(countdownRef.current);
      stopAudio(tickRef.current);
    } else {
      // re-apply loops depending on phase
      if (phase === "COUNTDOWN") playLoop(countdownRef.current);
      if (phase === "QUESTION") playLoop(tickRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSoundEnabled]);

  const getTimeColor = () => {
    if (questionTime > 4) return "#22c55e";
    if (questionTime > 2) return "#eab308";
    return "#ef4444";
  };

  const accuracy = useMemo(() => {
    return TOTAL_QUESTIONS > 0 ? Math.round((correctCount / TOTAL_QUESTIONS) * 100) : 0;
  }, [correctCount]);

  // for end-of-question lock color
  const lockedBorderForOption = (optId: OptionId) => {
    if (!lockedRef.current) return null;
    const isOptionCorrect = currentQ && optId === currentQ.correct_option;
    const isChosen = selectedAnswer === optId;

    // If user chose wrong: chosen is red, correct is green
    if (selectedAnswer !== null) {
      if (isOptionCorrect) return { border: "#22c55e", glow: "rgba(34,197,94,0.65)" };
      if (isChosen && !isOptionCorrect) return { border: "#ef4444", glow: "rgba(239,68,68,0.65)" };
      return { border: "rgba(129,140,248,0.35)", glow: "rgba(15,23,42,0.9)" };
    }

    // Timeout: only correct should be green
    if (selectedAnswer === null) {
      if (isOptionCorrect) return { border: "#22c55e", glow: "rgba(34,197,94,0.65)" };
      return { border: "rgba(129,140,248,0.35)", glow: "rgba(15,23,42,0.9)" };
    }

    return null;
  };

  // ============================================
  // ALREADY PLAYED MODAL
  // ============================================
  if (showAlreadyPlayedModal) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
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
            background: "radial-gradient(circle at top, rgba(15,23,42,1), rgba(6,8,20,1))",
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
            Quiz Unavailable 🎮
          </h2>

          <p style={{ fontSize: 15, color: "#cbd5e1", lineHeight: 1.7, marginBottom: 8 }}>
            The free quiz is currently unavailable. This could be because you've already played this week or there's a temporary issue.
          </p>

          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 28 }}>
            Come back next Monday for a new set of questions, or join our live competitions to keep playing! 🏆
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/")}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 0 30px rgba(124,58,237,0.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(124,58,237,0.5)";
              }}
            >
              Go Home
            </button>

            <button
              onClick={() => router.push("/lobby")}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(124,58,237,0.1)";
                e.currentTarget.style.borderColor = "#a78bfa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(167,139,250,0.6)";
              }}
            >
              Live Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // 🎵 AUDIO LAYER - Mounted in ALL phases
  // ============================================
  const AudioLayer = (
    <>
      <audio ref={entryRef} src="/sounds/entry.mp3" preload="auto" />
      <audio ref={countdownRef} src="/sounds/countdown.mp3" preload="auto" />
      <audio ref={tickRef} src="/sounds/tick.mp3" preload="auto" />
      <audio ref={whooshRef} src="/sounds/whoosh.mp3" preload="auto" />
      <audio ref={correctRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={wrongRef} src="/sounds/wrong.mp3" preload="auto" />
      <audio ref={gameoverRef} src="/sounds/gameover.mp3" preload="auto" />
    </>
  );

  // ============================================
  // INIT (loading)
  // ============================================
  if (phase === "INIT") {
    return (
      <>
        {AudioLayer}
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
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
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
          <div style={{ fontSize: 18, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.1em" }}>
            LOADING QUIZ...
          </div>
        </div>
      </>
    );
  }

  // ============================================
  // COUNTDOWN
  // ============================================
  if (phase === "COUNTDOWN") {
    return (
      <>
        {AudioLayer}
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
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #7c3aed 100%)",
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
              background: "radial-gradient(circle, rgba(124,58,237,0.3), transparent 70%)",
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
              background: "radial-gradient(circle, rgba(217,70,239,0.3), transparent 70%)",
              animation: "ripple 3s ease-out infinite 1s",
            }}
          />

          {/* Center Logo (BLACK CIRCLE - ANAYASA) */}
          <div
            className="animate-pulse-glow"
            style={{
              width: "140px",
              height: "140px",
              marginBottom: "40px",
              borderRadius: "50%",
              background: "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 80px rgba(124,58,237,0.9), inset 0 0 40px rgba(255,255,255,0.08)",
              border: "4px solid rgba(255,255,255,0.18)",
              position: "relative",
              zIndex: 2,
            }}
          >
            <img
              src="/images/logo.png"
              alt="VibraXX"
              style={{
                width: 78,
                height: 78,
                objectFit: "contain",
                filter: "drop-shadow(0 0 10px rgba(255,255,255,0.15))",
              }}
            />
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
      </>
    );
  }

  // ============================================
  // QUESTION / EXPLANATION / FINAL
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

      {AudioLayer}

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
          {/* FINAL */}
          {phase === "FINAL" && (
            <div
              className="animate-slide-up"
              style={{
                padding: "clamp(24px, 4vw, 36px) clamp(20px, 3vw, 28px)",
                borderRadius: "clamp(20px, 3vw, 28px)",
                background: "radial-gradient(circle at top, rgba(15,23,42,0.98), rgba(6,8,20,1))",
                border: "1px solid rgba(124,58,237,0.4)",
                boxShadow: "0 0 50px rgba(124,58,237,0.4)",
                textAlign: "center",
              }}
            >
              {/* Logo (BLACK CIRCLE - ANAYASA) */}
              <div
                style={{
                  width: "clamp(80px, 15vw, 100px)",
                  height: "clamp(80px, 15vw, 100px)",
                  margin: "0 auto clamp(20px, 3vw, 28px)",
                  borderRadius: "50%",
                  background: "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 40px rgba(124,58,237,0.8)",
                  border: "3px solid rgba(255,255,255,0.18)",
                }}
              >
                <img
                  src="/images/logo.png"
                  alt="VibraXX"
                  style={{
                    width: "clamp(46px, 8vw, 56px)",
                    height: "clamp(46px, 8vw, 56px)",
                    objectFit: "contain",
                    filter: "drop-shadow(0 0 10px rgba(255,255,255,0.12))",
                  }}
                />
              </div>

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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "clamp(10px, 2vw, 14px)",
                  marginBottom: "clamp(20px, 3vw, 28px)",
                }}
              >
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

              <p
                style={{
                  fontSize: "clamp(14px, 2.5vw, 16px)",
                  color: "#cbd5e1",
                  lineHeight: 1.6,
                  marginBottom: "clamp(8px, 1.5vw, 12px)",
                }}
              >
                Great job! Come back next week for a new free quiz, or join our live competitions to keep playing! 🏆
              </p>

              <div style={{ marginTop: "4px", fontSize: "clamp(11px, 2vw, 12px)", color: "#9ca3af" }}>
                Returning to home in{" "}
                <span style={{ color: "#10b981", fontWeight: 800 }}>{finalTime}</span> seconds...
              </div>

              <button
                onClick={() => router.push("/")}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(124,58,237,0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(124,58,237,0.6)";
                }}
              >
                Go Home Now
              </button>
            </div>
          )}

          {/* QUESTION */}
          {phase === "QUESTION" && currentQ && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "clamp(12px, 2vw, 16px)",
                  gap: "12px",
                }}
              >
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
                  <span style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 900, color: getTimeColor() }}>
                    {questionTime}s
                  </span>
                </div>

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
                  {isSoundEnabled ? <Volume2 style={{ width: 20, height: 20 }} /> : <VolumeX style={{ width: 20, height: 20 }} />}
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem(FREE_QUIZ_STATE_KEY);
                    router.push("/");
                  }}
                  style={{
                    minWidth: "44px",
                    minHeight: "44px",
                    padding: "clamp(10px, 2vw, 12px)",
                    borderRadius: "clamp(10px, 2vw, 12px)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    background: "rgba(127,29,29,0.2)",
                    color: "#ef4444",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "clamp(18px, 3.5vw, 22px)",
                    fontWeight: 700,
                  }}
                >
                  ✕
                </button>
              </div>

              <div
                className="animate-slide-up"
                style={{
                  marginBottom: "clamp(16px, 3vw, 20px)",
                  padding: "clamp(18px, 3vw, 24px)",
                  borderRadius: "clamp(20px, 3vw, 26px)",
                  border: "1px solid rgba(129,140,248,0.35)",
                  background: "radial-gradient(circle at top, rgba(17,24,39,0.98), rgba(6,8,20,1))",
                  boxShadow: "0 0 32px rgba(79,70,229,0.3)",
                }}
              >
                {/* 🎖️ COCKPIT: Context header */}
                <div style={{ 
                  fontSize: "clamp(9px, 1.8vw, 10px)", 
                  color: "#64748b", 
                  fontWeight: 900, 
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: "clamp(6px, 1.5vw, 8px)",
                  textAlign: "center"
                }}>
                  Free Practice Mode
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "clamp(10px, 2vw, 12px)" }}>
                  <Target style={{ width: "clamp(16px, 3vw, 18px)", height: "clamp(16px, 3vw, 18px)", color: "#a78bfa" }} />
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

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "clamp(10px, 2vw, 12px)",
                  }}
                >
                  {(["a", "b", "c", "d"] as OptionId[]).map((optId) => {
                    const optText = currentQ[`option_${optId}` as keyof Question] as string;
                    const isSelected = selectedAnswer === optId;

                    // base styles unchanged
                    let borderColor = "rgba(129,140,248,0.6)";
                    let boxShadow = "0 0 10px rgba(15,23,42,0.9)";
                    let bg = "linear-gradient(135deg, rgba(9,9,18,0.98), rgba(15,23,42,0.98))";

                    if (isSelected) {
                      borderColor = "#d946ef";
                      boxShadow = "0 0 16px rgba(217,70,239,0.7)";
                      bg = "linear-gradient(135deg, rgba(24,24,48,1), rgba(15,23,42,1))";
                    }

                    // end-of-question lock coloring (ANAYASA)
                    const locked = lockedBorderForOption(optId);
                    if (locked) {
                      borderColor = locked.border;
                      boxShadow = `0 0 16px ${locked.glow}`;
                    }

                    return (
                      <button
                        key={optId}
                        onClick={() => handleAnswerClick(optId)}
                        disabled={selectedAnswer !== null || lockedRef.current}
                        style={{
                          position: "relative",
                          padding: "clamp(14px, 3vw, 18px)",
                          borderRadius: "clamp(14px, 3vw, 18px)",
                          border: `2px solid ${borderColor}`,
                          background: bg,
                          color: "#e5e7eb",
                          textAlign: "left",
                          cursor:
                            selectedAnswer !== null || lockedRef.current ? "default" : "pointer",
                          boxShadow,
                          transition: "all 0.22s",
                          overflow: "hidden",
                        }}
                        onMouseEnter={(e) => {
                          if ((selectedAnswer === null && !lockedRef.current) && window.innerWidth > 768) {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 0 18px rgba(217,70,239,0.7)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if ((selectedAnswer === null && !lockedRef.current) && window.innerWidth > 768) {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = boxShadow;
                          }
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "clamp(14px, 3vw, 18px)",
                            border: "1px solid rgba(129,140,248,0.16)",
                            pointerEvents: "none",
                          }}
                        />

                        {selectedAnswer === null && !lockedRef.current && (
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

          {/* EXPLANATION */}
          {phase === "EXPLANATION" && currentQ && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "clamp(12px, 2vw, 16px)",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1 }} />
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
                  <span style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 700, color: "#38bdf8" }}>
                    Next in {explanationTime}s
                  </span>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem(FREE_QUIZ_STATE_KEY);
                    router.push("/");
                  }}
                  style={{
                    minWidth: "44px",
                    minHeight: "44px",
                    padding: "clamp(10px, 2vw, 12px)",
                    borderRadius: "clamp(10px, 2vw, 12px)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    background: "rgba(127,29,29,0.2)",
                    color: "#ef4444",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "clamp(18px, 3.5vw, 22px)",
                    fontWeight: 700,
                  }}
                >
                  ✕
                </button>
              </div>

              <div
                className="animate-slide-up"
                style={{
                  marginBottom: "clamp(16px, 3vw, 20px)",
                  padding: "clamp(18px, 3vw, 22px)",
                  borderRadius: "clamp(20px, 3vw, 24px)",
                  border: "1px solid rgba(56,189,248,0.4)",
                  background: "linear-gradient(135deg, rgba(8,47,73,0.96), rgba(6,8,20,1))",
                  boxShadow: "0 0 36px rgba(56,189,248,0.3)",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "clamp(8px, 1.5vw, 10px) clamp(14px, 2.5vw, 18px)",
                    borderRadius: 9999,
                    background: isCorrect ? "rgba(22,163,74,0.2)" : "rgba(127,29,29,0.2)",
                    border: isCorrect ? "1px solid #22c55e" : "1px solid #ef4444",
                    marginBottom: "clamp(14px, 2.5vw, 18px)",
                  }}
                >
                  {isCorrect ? (
                    <CheckCircle style={{ width: "clamp(16px, 3vw, 18px)", height: "clamp(16px, 3vw, 18px)", color: "#22c55e" }} />
                  ) : (
                    <XCircle style={{ width: "clamp(16px, 3vw, 18px)", height: "clamp(16px, 3vw, 18px)", color: "#ef4444" }} />
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
                    <div style={{ fontSize: "clamp(13px, 2.5vw, 14px)", fontWeight: 600, color: "#e5e7eb" }}>
                      {currentQ[`option_${currentQ.correct_option}` as keyof Question] as string}
                    </div>
                  </div>
                </div>

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
                  <p style={{ fontSize: "clamp(13px, 2.5vw, 14px)", lineHeight: 1.6, color: "#cbd5e1" }}>
                    {currentQ.explanation}
                  </p>
                </div>
              </div>

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
