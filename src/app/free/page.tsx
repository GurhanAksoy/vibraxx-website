"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Trophy,
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
// ═══════════════════════════════════════════════════════════════════════════
// DATABASE = COMMANDER | FRONTEND = SOLDIER | PHASE = LAW
// ═══════════════════════════════════════════════════════════════════════════

const TOTAL_QUESTIONS = 20;
const QUESTION_DURATION = 6;
const EXPLANATION_DURATION = 6;
const FINAL_SCORE_DURATION = 30;
const INITIAL_COUNTDOWN = 6;

type OptionId = "a" | "b" | "c" | "d";
type AnswerStatus = "none" | "correct" | "wrong";

type QuizPhase = "INIT" | "COUNTDOWN" | "QUESTION" | "EXPLANATION" | "FINAL";

interface Question {
  id: number;
  category_id: number;
  question_text: string;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  correct_option: OptionId;
  explanation: string;
}

type BootstrapStatus = "already_played" | "resume" | "new";

type BootstrapResponse = {
  status: BootstrapStatus;
  eligibility?: any;
  session?: {
    week_start_utc: string;
    phase: QuizPhase | string;
    current_index: number;
    answers: Record<string, any>;
    correct_count: number;
    wrong_count: number;
    question_ids: number[];
  };
  questions?: Question[];
};

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

  // TIMERS (UI doesn’t control phase; phase controls timer)
  const [countdownTime, setCountdownTime] = useState(INITIAL_COUNTDOWN);
  const [questionTime, setQuestionTime] = useState(QUESTION_DURATION);
  const [explanationTime, setExplanationTime] = useState(EXPLANATION_DURATION);
  const [finalTime, setFinalTime] = useState(FINAL_SCORE_DURATION);

  // UI STATE
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showAlreadyPlayedModal, setShowAlreadyPlayedModal] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);

  // Session / Security
  const [weekStartUtc, setWeekStartUtc] = useState<string | null>(null);
  const [bootstrapDone, setBootstrapDone] = useState(false);

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

  // ============================================
  // REFS for canonical safety (avoid stale closures)
  // ============================================
  const phaseRef = useRef<QuizPhase>("INIT");
  const currentIndexRef = useRef(0);
  const selectedAnswerRef = useRef<OptionId | null>(null);
  const correctCountRef = useRef(0);
  const wrongCountRef = useRef(0);
  const answersRef = useRef<AnswerStatus[]>(Array(TOTAL_QUESTIONS).fill("none"));

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    selectedAnswerRef.current = selectedAnswer;
  }, [selectedAnswer]);

  useEffect(() => {
    correctCountRef.current = correctCount;
  }, [correctCount]);

  useEffect(() => {
    wrongCountRef.current = wrongCount;
  }, [wrongCount]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

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
  // AUDIO HELPERS
  // ============================================
  const playSound = (audio: HTMLAudioElement | null) => {
    if (!isSoundEnabled || !audio) return;
    try {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {}
  };

  const stopSound = (audio: HTMLAudioElement | null) => {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.loop = false;
  };

  const playClick = () => playSound(clickSoundRef.current);

  // ============================================
  // CANONICAL: Persist progress to DB (soldier reports to commander)
  // ============================================
  const persistProgress = async (
    nextPhase: QuizPhase,
    nextIndex: number,
    nextAnswersObj: Record<string, any>,
    nextCorrect: number,
    nextWrong: number
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc("free_quiz_update_progress", {
        p_user_id: user.id,
        p_phase: nextPhase,
        p_current_index: nextIndex,
        p_answers: nextAnswersObj,
        p_correct_count: nextCorrect,
        p_wrong_count: nextWrong,
      });
    } catch {
      // silent fail: UX should not freeze
    }
  };

  // answers array -> jsonb object
  const buildAnswersJson = (base?: Record<string, any>) => {
    const obj = base ? { ...base } : {};
    return obj;
  };

  // ============================================
  // 🔐 INIT PHASE - BOOTSTRAP (single canonical call)
  // ============================================
  useEffect(() => {
    if (phase !== "INIT") return;

    const bootstrap = async () => {
      try {
        setSystemError(null);
        console.log("🔐 [FREE QUIZ] Bootstrap starting...");

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase.rpc("free_quiz_bootstrap", {
          p_user_id: user.id,
        });

        if (error) {
          console.error("❌ [FREE QUIZ] Bootstrap RPC error:", error);
          setSystemError(
            `Free quiz service currently can’t start. Please try again.\n\nBootstrap error: ${error.message}`
          );
          return;
        }

        const res = data as BootstrapResponse;
        console.log("✅ [FREE QUIZ] Bootstrap response:", res);

        if (res.status === "already_played") {
          setShowAlreadyPlayedModal(true);
          return;
        }

        const sess = res.session!;
        const qs = (res.questions || []) as any[];

        // Normalize questions array if Supabase returns {value:{...}}
        const normalized: Question[] = qs.map((x: any) => (x?.value ? x.value : x));

        if (!normalized || normalized.length < TOTAL_QUESTIONS) {
          setSystemError(
            "Free quiz service currently can’t start. Please try again.\n\nQuestions payload invalid or less than 20."
          );
          return;
        }

        setWeekStartUtc(sess.week_start_utc || null);
        setQuestions(normalized);

        // Resume state if needed
        const resumePhase = (sess.phase as QuizPhase) || "COUNTDOWN";
        const resumeIndex = Number(sess.current_index || 0);

        // hydrate answers/counters
        const hydratedAnswers = Array(TOTAL_QUESTIONS).fill("none") as AnswerStatus[];
        const answersObj = sess.answers || {};

        for (let i = 0; i < TOTAL_QUESTIONS; i++) {
          const a = answersObj[String(i)];
          if (a?.correct === true) hydratedAnswers[i] = "correct";
          else if (a?.correct === false && a?.selected) hydratedAnswers[i] = "wrong";
        }

        setAnswers(hydratedAnswers);
        setCorrectCount(Number(sess.correct_count || 0));
        setWrongCount(Number(sess.wrong_count || 0));
        setCurrentIndex(Math.min(Math.max(resumeIndex, 0), TOTAL_QUESTIONS - 1));

        // SelectedAnswer cannot be reliably resumed mid-question without storing exact selection.
        // Canonical rule: resume at phase boundary.
        // If session says QUESTION/EXPLANATION mid-way, we resume safely:
        // - QUESTION: start QUESTION fresh but same index
        // - EXPLANATION: show EXPLANATION (requires isCorrect), we recompute from answersObj if possible
        setSelectedAnswer(null);
        setIsCorrect(false);

        setBootstrapDone(true);

        // INIT → target phase
        if (resumePhase === "FINAL") setPhase("FINAL");
        else if (resumePhase === "EXPLANATION") setPhase("EXPLANATION");
        else if (resumePhase === "QUESTION") setPhase("QUESTION");
        else setPhase("COUNTDOWN");
      } catch (e: any) {
        console.error("❌ [FREE QUIZ] Bootstrap error:", e);
        setSystemError(
          "Free quiz service currently can’t start. Please try again.\n\nUnexpected error."
        );
      }
    };

    bootstrap();
  }, [phase, router]);

  // ============================================
  // ⏰ COUNTDOWN PHASE TIMER (single authority)
  // ============================================
  useEffect(() => {
    if (phase !== "COUNTDOWN") return;

    setCountdownTime(INITIAL_COUNTDOWN);

    const interval = setInterval(() => {
      setCountdownTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          // CANON: transition function controls audio timing
          // Start sound should hit as question appears
          playSound(entrySoundRef.current);
          playSound(startSoundRef.current);
          setPhase("QUESTION");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // ============================================
  // 🎯 QUESTION PHASE TIMER (NO dependency on selectedAnswer!)
  // ============================================
  useEffect(() => {
    if (phase !== "QUESTION") return;

    // when question begins: tick must start immediately after start sound
    // start sound already played at transition; here we only ensure tick loop
    setQuestionTime(QUESTION_DURATION);

    const interval = setInterval(() => {
      setQuestionTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          // TIMEOUT PATH
          if (selectedAnswerRef.current === null) {
            // mark wrong
            setWrongCount((w) => w + 1);
            setAnswers((prevArr) => {
              const copy = [...prevArr];
              copy[currentIndexRef.current] = "wrong";
              return copy;
            });
            setIsCorrect(false);

            // persist answer to DB (timeout = wrong)
            (async () => {
              try {
                const idx = currentIndexRef.current;
                const obj = buildAnswersJson();
                // use local computed based on refs
                const currentAnswersObj: Record<string, any> = {};
                // we don’t have full db answers json here; keep minimal, DB already stores previous.
                currentAnswersObj[String(idx)] = { selected: null, correct: false, timeout: true };
                await persistProgress(
                  "EXPLANATION",
                  idx,
                  currentAnswersObj,
                  correctCountRef.current,
                  wrongCountRef.current + 1
                );
              } catch {}
            })();
          }

          playSound(whooshSoundRef.current);
          setPhase("EXPLANATION");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // ============================================
  // 📖 EXPLANATION PHASE TIMER (single authority)
  // ============================================
  useEffect(() => {
    if (phase !== "EXPLANATION") return;

    setExplanationTime(EXPLANATION_DURATION);

    const interval = setInterval(() => {
      setExplanationTime((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    const timeout = setTimeout(() => {
      clearInterval(interval);

      if (currentIndexRef.current < TOTAL_QUESTIONS - 1) {
        const nextIndex = currentIndexRef.current + 1;

        // transition: EXPLANATION → QUESTION
        // audio must fire BEFORE phase flip
        playSound(startSoundRef.current);

        setCurrentIndex(nextIndex);
        setSelectedAnswer(null);
        setIsCorrect(false);
        setPhase("QUESTION");

        // persist progress
        (async () => {
          const obj = {}; // minimal delta (full answers is already stored progressively)
          await persistProgress(
            "QUESTION",
            nextIndex,
            obj,
            correctCountRef.current,
            wrongCountRef.current
          );
        })();
      } else {
        setPhase("FINAL");
      }
    }, EXPLANATION_DURATION * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [phase]);

  // ============================================
  // 🏁 FINAL PHASE TIMER & SUBMIT (canonical)
  // ============================================
  useEffect(() => {
    if (phase !== "FINAL") return;

    stopSound(tickSoundRef.current);
    playSound(gameoverSoundRef.current);

    const submit = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.rpc("free_quiz_finish_and_submit", {
          p_user_id: user.id,
          p_correct_count: correctCountRef.current,
          p_wrong_count: wrongCountRef.current,
          p_total_questions: TOTAL_QUESTIONS,
        });
      } catch (e: any) {
        // ignore: user still sees final
        console.error("❌ [FREE QUIZ] Submit error:", e?.message || e);
      }
    };

    submit();

    setFinalTime(FINAL_SCORE_DURATION);
    const interval = setInterval(() => {
      setFinalTime((prev) => (prev <= 1 ? 0 : prev - 1));
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
  // 🔊 TICK SOUND - PHASE DRIVEN ONLY
  // ============================================
  useEffect(() => {
    const tick = tickSoundRef.current;
    if (!tick) return;

    if (phase === "QUESTION" && isSoundEnabled) {
      tick.loop = true;
      tick.currentTime = 0;
      tick.play().catch(() => {});
    } else {
      tick.pause();
      tick.currentTime = 0;
      tick.loop = false;
    }
  }, [phase, isSoundEnabled]);

  // ============================================
  // 🎯 ANSWER HANDLER (canonical protocol)
  // ============================================
  const handleAnswerClick = (optionId: OptionId) => {
    // GUARD: Only in QUESTION phase
    if (phaseRef.current !== "QUESTION") return;
    if (selectedAnswerRef.current !== null) return;
    if (!currentQ) return;

    playClick();

    setSelectedAnswer(optionId);

    const correct = optionId === currentQ.correct_option;
    setIsCorrect(correct);

    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndexRef.current] = correct ? "correct" : "wrong";
      return next;
    });

    if (correct) {
      setCorrectCount((c) => c + 1);
      playSound(correctSoundRef.current);
    } else {
      setWrongCount((w) => w + 1);
      playSound(wrongSoundRef.current);
    }

    playSound(whooshSoundRef.current);

    // persist progress (delta)
    (async () => {
      const idx = currentIndexRef.current;
      const delta: Record<string, any> = {};
      delta[String(idx)] = { selected: optionId, correct };
      await persistProgress(
        "EXPLANATION",
        idx,
        delta,
        correct ? correctCountRef.current + 1 : correctCountRef.current,
        correct ? wrongCountRef.current : wrongCountRef.current + 1
      );
    })();

    // transition
    setPhase("EXPLANATION");
  };

  // ============================================
  // SOUND TOGGLE
  // ============================================
  const handleSoundToggle = () => {
    if (isSoundEnabled) playClick();
    setIsSoundEnabled((prev) => !prev);
  };

  // ============================================
  // QUIT (no header, but safe exit)
  // ============================================
  const handleQuit = async () => {
    try {
      playClick();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc("free_quiz_abort", { p_user_id: user.id });
      }
    } catch {}
    router.push("/");
  };

  // ============================================
  // UTILITY
  // ============================================
  const getTimeColor = () => {
    if (questionTime > 4) return "#22c55e";
    if (questionTime > 2) return "#eab308";
    return "#ef4444";
  };

  const accuracy =
    TOTAL_QUESTIONS > 0 ? Math.round((correctCount / TOTAL_QUESTIONS) * 100) : 0;

  // ============================================
  // 📺 RENDER: SYSTEM ERROR
  // ============================================
  if (systemError) {
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
            width: "min(520px, 95vw)",
            padding: "32px 28px",
            borderRadius: 28,
            background:
              "radial-gradient(circle at top, rgba(15,23,42,1), rgba(6,8,20,1))",
            border: "1px solid rgba(239,68,68,0.35)",
            boxShadow: "0 0 50px rgba(239,68,68,0.18)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              margin: "0 auto 24px",
              borderRadius: "50%",
              background: "rgba(239,68,68,0.12)",
              border: "2px solid rgba(239,68,68,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 30px rgba(239,68,68,0.18)",
            }}
          >
            <AlertCircle style={{ width: 44, height: 44, color: "#ef4444" }} />
          </div>

          <h2
            style={{
              fontSize: 22,
              fontWeight: 900,
              marginBottom: 10,
              color: "#fee2e2",
              letterSpacing: "0.02em",
            }}
          >
            System Error
          </h2>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              textAlign: "left",
              fontSize: 13,
              lineHeight: 1.6,
              color: "#cbd5e1",
              background: "rgba(0,0,0,0.25)",
              borderRadius: 14,
              padding: 14,
              border: "1px solid rgba(148,163,184,0.15)",
              marginBottom: 18,
            }}
          >
            {systemError}
          </pre>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => {
                setSystemError(null);
                setPhase("INIT");
              }}
              style={{
                padding: "12px 18px",
                borderRadius: 9999,
                border: "none",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                color: "white",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.08em",
                cursor: "pointer",
                boxShadow: "0 0 18px rgba(124,58,237,0.5)",
              }}
            >
              Retry
            </button>

            <button
              onClick={() => router.push("/")}
              style={{
                padding: "12px 18px",
                borderRadius: 9999,
                border: "1px solid rgba(148,163,184,0.35)",
                background: "transparent",
                color: "#e5e7eb",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.08em",
                cursor: "pointer",
              }}
            >
              Home
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
            >
              Live Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // 📺 RENDER: INIT (Loading)
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
      </>
    );
  }

  // ============================================
  // 📺 RENDER: COUNTDOWN
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

        {/* Quit (no header, but safe exit) */}
        <button
          onClick={handleQuit}
          style={{
            position: "fixed",
            top: 14,
            right: 14,
            zIndex: 50,
            width: 44,
            height: 44,
            borderRadius: 14,
            border: "1px solid rgba(148,163,184,0.35)",
            background: "rgba(6,8,20,0.6)",
            color: "#e5e7eb",
            cursor: "pointer",
            opacity: 0.8,
          }}
          title="Exit"
        >
          ✕
        </button>

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
  // RENDER: QUESTION / EXPLANATION / FINAL (your design preserved)
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

      {/* Quit (no header) */}
      <button
        onClick={handleQuit}
        style={{
          position: "fixed",
          top: 14,
          right: 14,
          zIndex: 50,
          width: 44,
          height: 44,
          borderRadius: 14,
          border: "1px solid rgba(148,163,184,0.35)",
          background: "rgba(6,8,20,0.6)",
          color: "#e5e7eb",
          cursor: "pointer",
          opacity: 0.8,
        }}
        title="Exit"
      >
        ✕
      </button>

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
                background:
                  "radial-gradient(circle at top, rgba(15,23,42,0.98), rgba(6,8,20,1))",
                border: "1px solid rgba(124,58,237,0.4)",
                boxShadow: "0 0 50px rgba(124,58,237,0.4)",
                textAlign: "center",
              }}
            >
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
                  gridTemplateColumns: "repeat(3, 1fr)",
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
                Great job! Come back next week for a new free quiz, or join our
                live competitions to keep playing! 🏆
              </p>

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
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(clamp(140px, 40vw, 200px), 1fr))",
                    gap: "clamp(10px, 2vw, 12px)",
                  }}
                >
                  {(["a", "b", "c", "d"] as OptionId[]).map((optId) => {
                    const optText = (currentQ as any)[`option_${optId}`] as
                      | string
                      | null;
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
                        disabled={selectedAnswer !== null}
                        style={{
                          position: "relative",
                          padding: "clamp(12px, 2.5vw, 14px)",
                          borderRadius: "clamp(14px, 3vw, 18px)",
                          border: `2px solid ${borderColor}`,
                          background: bg,
                          color: "#e5e7eb",
                          textAlign: "left",
                          cursor: selectedAnswer !== null ? "default" : "pointer",
                          boxShadow,
                          transition: "all 0.22s",
                          overflow: "hidden",
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

                        {selectedAnswer === null && (
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
                            {optText ?? ""}
                          </div>
                        </div>
                      </button>
                    );
                  })}
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
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "clamp(8px, 1.5vw, 10px) clamp(14px, 2.5vw, 18px)",
                    borderRadius: 9999,
                    background: isCorrect
                      ? "rgba(22,163,74,0.2)"
                      : "rgba(127,29,29,0.2)",
                    border: isCorrect
                      ? "1px solid #22c55e"
                      : "1px solid #ef4444",
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
                      {(currentQ as any)[`option_${currentQ.correct_option}`] ?? ""}
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
