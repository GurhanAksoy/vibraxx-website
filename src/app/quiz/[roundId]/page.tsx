"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
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
const QUESTION_DURATION = 9; // seconds
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

export default function QuizGamePage() {
  const router = useRouter();
  const params = useParams();

  const roundId = params?.roundId as string | null;

  // 🔐 === SECURITY STATE ===
  const [securityPassed, setSecurityPassed] = useState(false);

  // === STATE ===
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION);
  const [explanationTimeLeft, setExplanationTimeLeft] = useState(QUESTION_DURATION);
  const [selectedAnswer, setSelectedAnswer] = useState<OptionId | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);

  // DB-driven scores
  const [totalScore, setTotalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // ✅ FIX 1: currentCorrectOption artık RPC beklenmeden UI'da hemen yansıyor
  // Bunun için ayrı "pendingCorrectOption" ref kullanıyoruz — RPC dönünce set ediyoruz
  const [currentCorrectOption, setCurrentCorrectOption] = useState<OptionId | null>(null);
  const [currentExplanation, setCurrentExplanation] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState(false);

  const [showExplanation, setShowExplanation] = useState(false);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [finalCountdown, setFinalCountdown] = useState(FINAL_SCORE_DURATION);

  const [answers, setAnswers] = useState<AnswerStatus[]>([]);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Final results from DB
  const [finalRank, setFinalRank] = useState<number | null>(null);
  const [finalTotalPlayers, setFinalTotalPlayers] = useState<number | null>(null);

  // Refs
  const timeoutTriggeredRef = useRef(false);
  const answerSubmittedRef = useRef<Set<number>>(new Set());
  const finalRedirectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAnswerLockedRef = useRef(false);
  const rpcCompletedRef = useRef(false);
  const isSoundEnabledRef = useRef(true); // ✅ FIX 3: stale closure önleme

  // === AUDIO REFS ===
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameoverSoundRef = useRef<HTMLAudioElement | null>(null);
  const whooshSoundRef = useRef<HTMLAudioElement | null>(null);
  const tickSoundRef = useRef<HTMLAudioElement | null>(null);
  const entrySoundRef = useRef<HTMLAudioElement | null>(null);
  const entryPlayedRef = useRef(false);

  const currentQ = questions[currentIndex] ?? null;

  // ✅ FIX 3: isSoundEnabled değişince ref'i de güncelle
  useEffect(() => {
    isSoundEnabledRef.current = isSoundEnabled;
  }, [isSoundEnabled]);

  // 🔐 === SECURITY CHECK ===
  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push("/");
          return;
        }
        setUser(user);
        setSecurityPassed(true);
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
  const loadFinalResults = useCallback(async () => {
    if (!roundId) return;
    const { data, error } = await supabase.rpc("get_round_result", {
      p_round_id: roundId,
    });
    if (!error && data) {
      setFinalRank(data.rank || null);
      setFinalTotalPlayers(data.total_players || null);
    }
  }, [roundId]);

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        if (!roundId) {
          router.push("/lobby");
          return;
        }
        if (!securityPassed) return;

        // STEP 1: Get questions
        const { data: questionsData, error: questionsError } = await supabase
          .rpc("get_round_questions", { p_round_id: roundId });

        if (questionsError || !questionsData || questionsData.length === 0) {
          console.error("❌ [QUIZ] Questions error:", questionsError);
          router.push("/lobby");
          return;
        }

        // STEP 2: Restore progress from DB
        const { data: progress, error: progressError } = await supabase
          .rpc("get_round_progress", { p_round_id: roundId });

        let normalizedAnswers = Array(questionsData.length).fill("none");

        if (!progressError && progress) {
          if (progress.answers_array && Array.isArray(progress.answers_array)) {
            const copyLength = Math.min(progress.answers_array.length, questionsData.length);
            for (let i = 0; i < copyLength; i++) {
              normalizedAnswers[i] = progress.answers_array[i] || "none";
            }
          }

          const answeredCount = (progress.answers_array || []).length;

          setCorrectCount(progress.correct_count || 0);
          setWrongCount(progress.wrong_count || 0);
          setTotalScore(progress.total_score || 0);

          if (answeredCount >= questionsData.length) {
            setAnswers(normalizedAnswers);
            setQuestions(questionsData);
            setIsLoading(false);
            await loadFinalResults();
            setShowFinalScore(true);
            return;
          }
        } else {
          setCorrectCount(0);
          setWrongCount(0);
          setTotalScore(0);
        }

        // ✅ SERVER CLOCK — client Date.now() kullanma, clock drift'i önle
        // server_now: DB'den gelen now() — HQ Trivia / Kahoot modeli
        let restoredTimeLeft = QUESTION_DURATION;
        let restoredExpTimeLeft = QUESTION_DURATION;
        let restoredShowExp = false;
        let restoredIndex = 0;

        // VibraXX Global Live Quiz — UTC0 canonical model
        // Lobby sayaci 0 olunca herkes ayni anda giris yapar → her zaman index=0
        // Refresh durumunda scheduled_start'tan UTC0 hesabi yapilir
        const answeredCountForTimer = (progress?.answers_array || []).length;

        if (answeredCountForTimer === 0) {
          // ✅ ILK GIRIS: Lobby sayaci garantisi — index 0, timeLeft 9
          restoredIndex = 0;
          restoredTimeLeft = QUESTION_DURATION;
          restoredShowExp = false;
        } else if (progress && progress.server_now) {
          // ✅ REFRESH: scheduled_start'tan UTC0 hesabi
          const nowMs = new Date(progress.server_now).getTime();
          const anchorStr = progress.scheduled_start || progress.round_started_at;
          if (anchorStr) {
            const startMs = new Date(anchorStr).getTime();
            const totalElapsed = Math.max(0, Math.floor((nowMs - startMs) / 1000));
            const TOTAL_ROUND_DURATION = questionsData.length * 18; // 270sn

            // Round bitmisse direkt final score
            if (totalElapsed >= TOTAL_ROUND_DURATION) {
              setAnswers(normalizedAnswers);
              setQuestions(questionsData);
              setIsLoading(false);
              await loadFinalResults();
              setShowFinalScore(true);
              return;
            }

            const questionIndex = Math.floor(totalElapsed / 18);
            restoredIndex = Math.max(0, Math.min(questionIndex, questionsData.length - 1));
            const cycleElapsed = totalElapsed % 18;
            if (cycleElapsed < QUESTION_DURATION) {
              restoredTimeLeft = Math.max(QUESTION_DURATION - cycleElapsed, 1);
              restoredShowExp = false;
            } else {
              restoredTimeLeft = 0;
              restoredExpTimeLeft = Math.max(18 - cycleElapsed, 1);
              restoredShowExp = true;
            }
          }
        }

        setCurrentIndex(restoredIndex);

        // ✅ FIX 3: entryPlayedRef sıfırla — her loadQuizData'da sadece 1 kez çalsın
        entryPlayedRef.current = false;

        setAnswers(normalizedAnswers);
        setQuestions(questionsData);
        setTimeLeft(restoredTimeLeft);
        setExplanationTimeLeft(restoredExpTimeLeft);
        setShowExplanation(restoredShowExp);
        setSelectedAnswer(null);
        setIsAnswerLocked(false);
        isAnswerLockedRef.current = false;
        setCurrentCorrectOption(null);
        setCurrentExplanation("");
        setIsCorrect(false);
        rpcCompletedRef.current = false;
        timeoutTriggeredRef.current = false;
        answerSubmittedRef.current = new Set();
        setIsLoading(false);

        // ✅ FIX 3: entry.mp3 — ref ile isSoundEnabled oku, audio hazır olunca çal
        const tryPlayEntry = () => {
          if (entryPlayedRef.current) return;
          if (!isSoundEnabledRef.current) return;
          const audio = entrySoundRef.current;
          if (!audio) return;
          entryPlayedRef.current = true;
          audio.currentTime = 0;
          audio.play().catch(() => {});
        };
        // Kısa timeout + canplaythrough fallback
        setTimeout(tryPlayEntry, 150);

      } catch (err) {
        console.error("❌ [QUIZ] Load error:", err);
        router.push("/lobby");
      }
    };

    loadQuizData();
  }, [securityPassed, roundId, router, loadFinalResults]);

  // === SOUND HELPERS ===
  const playSound = useCallback((
    audio: HTMLAudioElement | null,
    options?: { loop?: boolean }
  ) => {
    if (!isSoundEnabledRef.current || !audio) return;
    try {
      audio.loop = !!options?.loop;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {}
  }, []);

  const stopSound = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.loop = false;
    } catch {}
  }, []);

  const playClick = useCallback(() => playSound(clickSoundRef.current), [playSound]);
  const startTick = useCallback(() => playSound(tickSoundRef.current, { loop: true }), [playSound]);
  const stopTick = useCallback(() => stopSound(tickSoundRef.current), [stopSound]);

  // === FLASH FEEDBACK ===
  const flashScreen = useCallback((color: string) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: ${color};
      opacity: 0.15;
      pointer-events: none;
      z-index: 9999;
      animation: flashFade 200ms ease-out forwards;
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 220);
  }, []);

  // === TIMER STATE ===
  const questionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const explanationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advancingRef = useRef(false);

  // Yeni soru yüklenince sayaç başlat
  useEffect(() => {
    if (isLoading || showFinalScore || !currentQ) return;

    advancingRef.current = false;
    timeoutTriggeredRef.current = false;
    rpcCompletedRef.current = false;
    setTimeLeft(QUESTION_DURATION);
    setShowExplanation(false);
    setExplanationTimeLeft(QUESTION_DURATION);

    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    questionTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(questionTimerRef.current!);
          questionTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isLoading, showFinalScore]);

  // ✅ FIX 4: timeLeft 0 → explanation aç (timeout path garantili)
  useEffect(() => {
    if (timeLeft !== 0 || showFinalScore || isLoading || !currentQ) return;
    if (timeoutTriggeredRef.current) return;
    timeoutTriggeredRef.current = true;

    const openExplanation = () => {
      if (explanationTimerRef.current) clearInterval(explanationTimerRef.current);
      setShowExplanation(true);
      setExplanationTimeLeft(QUESTION_DURATION);
      playSound(whooshSoundRef.current);

      explanationTimerRef.current = setInterval(() => {
        setExplanationTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(explanationTimerRef.current!);
            explanationTimerRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    if (isAnswerLockedRef.current) {
      // Kullanıcı cevap verdi — RPC bitmesini bekle (max 3 sn)
      let waited = 0;
      const tryOpen = () => {
        if (rpcCompletedRef.current || waited >= 3000) {
          openExplanation();
        } else {
          waited += 100;
          setTimeout(tryOpen, 100);
        }
      };
      tryOpen();
    } else {
      // ✅ FIX 4: Timeout — handleTimeout çağır ve tamamlandığında explanation aç
      const runTimeout = async () => {
        await handleTimeout();
        openExplanation();
      };
      runTimeout();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, showFinalScore, isLoading]);

  // explanationTimeLeft 0 → sonraki soru
  useEffect(() => {
    if (explanationTimeLeft !== 0 || !showExplanation || showFinalScore) return;
    if (advancingRef.current) return;
    advancingRef.current = true;

    const advance = async () => {
      if (currentIndex < questions.length - 1) {
        playSound(whooshSoundRef.current);
        setSelectedAnswer(null);
        setIsAnswerLocked(false);
        isAnswerLockedRef.current = false;
        setCurrentCorrectOption(null);
        setCurrentExplanation("");
        setIsCorrect(false);
        setCurrentIndex((p) => p + 1);
      } else {
        await loadFinalResults();
        setShowFinalScore(true);
      }
    };
    advance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explanationTimeLeft, showExplanation, showFinalScore]);

  // Tick yönetimi
  useEffect(() => {
    if (isSoundEnabled && !showFinalScore && !showExplanation && timeLeft > 0 && !isLoading) {
      startTick();
    } else {
      stopTick();
    }
  }, [isSoundEnabled, showFinalScore, showExplanation, timeLeft, isLoading, startTick, stopTick]);

  useEffect(() => {
    if (showFinalScore || showExplanation || timeLeft <= 0) {
      stopTick();
    }
  }, [showFinalScore, showExplanation, timeLeft, stopTick]);

  // Final score countdown
  useEffect(() => {
    if (!showFinalScore) return;

    stopTick();
    playSound(gameoverSoundRef.current);

    let remaining = FINAL_SCORE_DURATION;
    setFinalCountdown(remaining);

    const interval = setInterval(() => {
      remaining -= 1;
      setFinalCountdown(Math.max(0, remaining));
      if (remaining <= 0) clearInterval(interval);
    }, 1000);

    finalRedirectRef.current = setTimeout(() => {
      router.push("/");
    }, FINAL_SCORE_DURATION * 1000);

    return () => {
      clearInterval(interval);
      if (finalRedirectRef.current) clearTimeout(finalRedirectRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFinalScore]);

  // === HANDLERS ===

  // ✅ FIX 1: Cevap seçilince hemen UI'ı kilitle + geçici mor göster,
  // RPC dönünce correct/wrong renklerini uygula
  const handleAnswerClick = async (optionId: OptionId) => {
    // ✅ ref ile kontrol — state stale closure'dan bağımsız
    if (isAnswerLockedRef.current || showExplanation || showFinalScore) return;
    if (!currentQ || !roundId) return;
    if (answerSubmittedRef.current.has(currentQ.question_id)) return;

    playClick();

    // Hemen kilitle — kullanıcıya anında feedback ver
    setSelectedAnswer(optionId);
    setIsAnswerLocked(true);
    isAnswerLockedRef.current = true;
    answerSubmittedRef.current.add(currentQ.question_id);

    try {
      const { data, error } = await supabase.rpc("submit_answer", {
        p_round_id: roundId,
        p_question_id: currentQ.question_id,
        p_selected_option: optionId,
      });

      if (error) {
        console.error("❌ Submit error:", error);
        // RPC hata → wrong olarak işle, ses çal
        playSound(wrongSoundRef.current);
        flashScreen('rgba(239, 68, 68, 1)');
        rpcCompletedRef.current = true;
        return;
      }

      if (data) {
        const correctFlag = data.is_correct || false;
        const correctOpt = (data.correct_option as OptionId) ?? null;

        // ✅ FIX 1: Doğru cevabı ve durumu set et → render tetiklenir → yeşil yanar
        setIsCorrect(correctFlag);
        setCurrentCorrectOption(correctOpt);
        setCurrentExplanation(data.explanation || "");
        setTotalScore(data.current_total_score || 0);
        setCorrectCount(data.correct_count || 0);
        setWrongCount(data.wrong_count || 0);

        if (correctFlag) {
          playSound(correctSoundRef.current);
          flashScreen('rgba(34, 197, 94, 1)');
        } else {
          playSound(wrongSoundRef.current);
          flashScreen('rgba(239, 68, 68, 1)');
        }

        setAnswers((prev) => {
          const next = prev.length ? [...prev] : Array(questions.length).fill("none");
          if (currentIndex >= 0 && currentIndex < next.length) {
            next[currentIndex] = correctFlag ? "correct" : "wrong";
          }
          return next;
        });
      }
    } catch (err) {
      console.error("❌ Answer submission error:", err);
      playSound(wrongSoundRef.current);
    }

    rpcCompletedRef.current = true;
  };

  // ✅ FIX 4: handleTimeout async döndürür — caller await edebilir
  const handleTimeout = async (): Promise<void> => {
    if (!currentQ || !roundId) return;
    if (answerSubmittedRef.current.has(currentQ.question_id)) return;

    setIsAnswerLocked(true);
    isAnswerLockedRef.current = true;
    answerSubmittedRef.current.add(currentQ.question_id);

    try {
      const { data, error } = await supabase.rpc("submit_answer", {
        p_round_id: roundId,
        p_question_id: currentQ.question_id,
        p_selected_option: null,
      });

      if (!error && data) {
        setIsCorrect(false);
        setCurrentCorrectOption((data.correct_option as OptionId) ?? null);
        setCurrentExplanation(data.explanation || "");
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
        flashScreen('rgba(239, 68, 68, 1)');
      }
    } catch (err) {
      console.error("❌ Timeout submit error:", err);
    }

    rpcCompletedRef.current = true;
  };

  const handleExitClick = () => {
    if (showFinalScore) return;
    playClick();
    setShowExitConfirm(true);
  };

  const handleExitConfirmYes = async () => {
    playClick();
    stopTick();
    setShowExitConfirm(false);
    if (!roundId) return;
    try {
      await supabase.rpc("finalize_user_round", { p_round_id: roundId });
      await loadFinalResults();
      setShowFinalScore(true);
    } catch (err) {
      console.error("❌ Exit error:", err);
      setShowFinalScore(true);
    }
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
    if (timeLeft > 6) return "#22c55e";
    if (timeLeft > 3) return "#eab308";
    return "#ef4444";
  };

  const answered = correctCount + wrongCount;
  const accuracy = answered > 0
    ? Math.round((correctCount / answered) * 100)
    : 0;

  // 🔐 === SECURITY SCREEN ===
  if (!securityPassed) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "20px", color: "white",
      }}>
        <div style={{
          width: "60px", height: "60px",
          border: "4px solid rgba(139, 92, 246, 0.3)",
          borderTopColor: "#8b5cf6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        <p style={{ color: "#a78bfa", fontSize: "16px", fontWeight: 600 }}>
          🔐 Verifying access...
        </p>
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // === LOADING SCREEN ===
  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "80px", height: "80px",
            margin: "0 auto 20px",
            borderRadius: "50%",
            border: "4px solid rgba(139,92,246,0.3)",
            borderTopColor: "#a78bfa",
            animation: "spin 1s linear infinite",
          }} />
          <p style={{ fontSize: "18px", fontWeight: 600, color: "#cbd5e1" }}>
            Loading questions...
          </p>
        </div>
        <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // === NO QUESTIONS FALLBACK ===
  if (!isLoading && questions.length === 0) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", padding: "20px",
      }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <XCircle style={{ width: "64px", height: "64px", color: "#ef4444", margin: "0 auto 20px" }} />
          <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "12px" }}>No Questions Available</h2>
          <p style={{ fontSize: "16px", color: "#94a3b8", marginBottom: "24px" }}>
            Unable to load quiz questions. Please try again later.
          </p>
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "12px 24px", borderRadius: "12px", border: "none",
              background: "linear-gradient(135deg, #7c3aed, #d946ef)",
              color: "white", fontSize: "16px", fontWeight: 700, cursor: "pointer",
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!isLoading && !showFinalScore && !currentQ) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", padding: "20px",
      }}>
        <div style={{ textAlign: "center", maxWidth: "420px" }}>
          <XCircle style={{ width: "64px", height: "64px", color: "#ef4444", margin: "0 auto 20px" }} />
          <h2 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "12px" }}>Quiz Sync Error</h2>
          <p style={{ fontSize: "16px", color: "#94a3b8", marginBottom: "24px" }}>
            Unable to restore active question safely.
          </p>
          <button
            onClick={() => router.push("/lobby")}
            style={{
              padding: "12px 24px", borderRadius: "12px", border: "none",
              background: "linear-gradient(135deg, #7c3aed, #d946ef)",
              color: "white", fontSize: "16px", fontWeight: 700, cursor: "pointer",
            }}
          >
            Back to Lobby
          </button>
        </div>
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
        @keyframes flashFade {
          0% { opacity: 0.15; }
          100% { opacity: 0; }
        }
        @keyframes shine {
          0% { transform: translateX(-150%) skewX(-25deg); }
          100% { transform: translateX(250%) skewX(-25deg); }
        }
        @keyframes neonPulse {
          0%, 100% {
            box-shadow: 0 0 15px rgba(139,92,246,0.6),
              0 0 30px rgba(139,92,246,0.4),
              inset 0 0 10px rgba(139,92,246,0.2);
          }
          50% {
            box-shadow: 0 0 25px rgba(217,70,239,0.9),
              0 0 50px rgba(217,70,239,0.6),
              inset 0 0 15px rgba(217,70,239,0.3);
          }
        }
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(167,139,250,0.8)); }
          50% { filter: drop-shadow(0 0 20px rgba(217,70,239,1)); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

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

        @media (min-width: 769px) {
          .brand-text { display: block !important; }
        }
        @media (max-width: 640px) {
          .score-pills { flex-wrap: wrap; justify-content: center; }
          .mobile-hide { display: none !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .stats-grid > div:last-child { grid-column: 1 / -1; }
        }
      `}</style>

      {/* Audio Elements */}
      <audio ref={correctSoundRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={wrongSoundRef} src="/sounds/wrong.mp3" preload="auto" />
      <audio ref={clickSoundRef} src="/sounds/click.mp3" preload="auto" />
      <audio ref={gameoverSoundRef} src="/sounds/gameover.mp3" preload="auto" />
      <audio ref={whooshSoundRef} src="/sounds/whoosh.mp3" preload="auto" />
      <audio ref={tickSoundRef} src="/sounds/tick.mp3" preload="auto" />
      <audio ref={entrySoundRef} src="/sounds/entry.mp3" preload="auto" />

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}>
        <main style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "clamp(12px, 3vw, 24px) clamp(12px, 3vw, 20px)",
        }}>

          {/* ═══ ROUND HEADER ═══ */}
          {!showFinalScore && (
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: "clamp(10px, 2.5vw, 16px)",
            }}>
              <span style={{
                fontSize: "11px", fontWeight: 800, letterSpacing: "0.12em",
                color: "#475569", textTransform: "uppercase",
              }}>
                Global Arena
              </span>
              <span style={{
                fontSize: "11px", fontWeight: 800, color: "#7c3aed",
                background: "rgba(124,58,237,0.15)", padding: "3px 10px",
                borderRadius: "20px", border: "1px solid rgba(124,58,237,0.3)",
              }}>
                {currentIndex + 1} / {questions.length}
              </span>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <button
                  onClick={handleSoundToggle}
                  style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: `1px solid ${isSoundEnabled ? "rgba(167,139,250,0.5)" : "rgba(107,114,128,0.3)"}`,
                    background: isSoundEnabled ? "rgba(124,58,237,0.25)" : "rgba(30,27,75,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {isSoundEnabled
                    ? <Volume2 style={{ width: "15px", height: "15px", color: "#a78bfa" }} />
                    : <VolumeX style={{ width: "15px", height: "15px", color: "#6b7280" }} />
                  }
                </button>
                <button
                  onClick={handleExitClick}
                  style={{
                    height: "32px", padding: "0 10px", borderRadius: "8px",
                    border: "1px solid rgba(239,68,68,0.45)",
                    background: "rgba(220,38,38,0.2)", color: "#fca5a5",
                    fontSize: "11px", fontWeight: 800, textTransform: "uppercase",
                    letterSpacing: "0.04em", display: "flex", alignItems: "center",
                    gap: "4px", cursor: "pointer",
                  }}
                >
                  <XCircle style={{ width: "13px", height: "13px" }} />Exit
                </button>
              </div>
            </div>
          )}

          {/* ═══ TIMER BAR ═══ */}
          {!showFinalScore && (
            <div style={{ marginBottom: "clamp(12px, 3vw, 20px)" }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: "8px", padding: "0 2px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Clock style={{
                    width: "14px", height: "14px", color: getTimeColor(),
                    filter: `drop-shadow(0 0 4px ${getTimeColor()})`,
                  }} />
                  <span style={{
                    fontSize: "11px", fontWeight: 700, color: "#64748b",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                  }}>
                    Time
                  </span>
                </div>
                <span style={{
                  fontSize: "clamp(28px, 7vw, 36px)", fontWeight: 900,
                  color: getTimeColor(), textShadow: `0 0 15px ${getTimeColor()}`,
                  lineHeight: 1,
                }}>
                  {timeLeft}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{
                    fontSize: "11px", fontWeight: 700, color: "#64748b",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                  }}>
                    Score
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 900, color: "#a78bfa" }}>
                    {totalScore}
                  </span>
                </div>
              </div>
              <div style={{
                height: "6px", borderRadius: "3px",
                background: "rgba(30,27,75,0.8)", overflow: "hidden",
                border: "1px solid rgba(139,92,246,0.2)",
              }}>
                <div style={{
                  height: "100%",
                  width: `${(timeLeft / QUESTION_DURATION) * 100}%`,
                  background: `linear-gradient(90deg, ${getTimeColor()}, ${getTimeColor()}aa)`,
                  boxShadow: `0 0 8px ${getTimeColor()}`,
                  transition: "width 1s linear, background 0.5s",
                  borderRadius: "3px",
                }} />
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* 🏆 FINAL SCORE CARD                                         */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {showFinalScore ? (
            <article
              className="animate-slide-up"
              style={{
                maxWidth: "min(420px, 94vw)",
                margin: "0 auto",
                padding: "20px 16px 24px",
                borderRadius: "24px",
                border: "1.5px solid rgba(251,191,36,0.35)",
                background: "linear-gradient(160deg, rgba(25,20,60,0.98) 0%, rgba(10,15,35,0.98) 100%)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(251,191,36,0.15)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Glow top accent */}
              <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: "180px", height: "2px",
                background: "linear-gradient(90deg, transparent, #fbbf24, transparent)",
              }} />

              {/* Trophy row */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "12px", marginBottom: "16px",
              }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 20px rgba(251,191,36,0.5)", flexShrink: 0,
                }}>
                  <Trophy style={{ width: "28px", height: "28px", color: "white" }} />
                </div>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: 900, color: "#fbbf24", lineHeight: 1.2 }}>
                    Round Complete!
                  </div>
                  {finalRank && finalTotalPlayers && (
                    <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, marginTop: "2px" }}>
                      Rank <span style={{ color: "#fbbf24", fontWeight: 800 }}>#{finalRank}</span>
                      {" / "}<span style={{ color: "#a78bfa" }}>{finalTotalPlayers}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats grid */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gap: "8px", marginBottom: "16px",
              }}>
                {/* Score */}
                <div style={{
                  gridColumn: "1 / -1",
                  padding: "14px 16px", borderRadius: "16px",
                  background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(168,85,247,0.15))",
                  border: "1.5px solid rgba(168,85,247,0.5)", marginBottom: "4px",
                }}>
                  <div style={{
                    fontSize: "11px", color: "#a78bfa", fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px",
                  }}>
                    Your Score
                  </div>
                  <div style={{
                    fontSize: "clamp(44px, 14vw, 64px)", fontWeight: 900, lineHeight: 1,
                    background: "linear-gradient(135deg, #a78bfa, #d946ef)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>
                    {totalScore}
                  </div>
                  <div style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: 600, marginTop: "2px" }}>
                    {accuracy}% Accuracy
                  </div>
                </div>

                {/* Correct */}
                <div style={{
                  padding: "12px 8px", borderRadius: "14px",
                  background: "rgba(22,163,74,0.12)",
                  border: "1.5px solid rgba(34,197,94,0.35)",
                }}>
                  <CheckCircle style={{ width: "22px", height: "22px", color: "#22c55e", marginBottom: "6px" }} />
                  <div style={{ fontSize: "clamp(28px, 9vw, 36px)", fontWeight: 900, color: "#22c55e", lineHeight: 1 }}>
                    {correctCount}
                  </div>
                  <div style={{
                    fontSize: "10px", color: "#86efac", fontWeight: 700,
                    letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "3px",
                  }}>
                    Correct
                  </div>
                </div>

                {/* Wrong */}
                <div style={{
                  padding: "12px 8px", borderRadius: "14px",
                  background: "rgba(220,38,38,0.12)",
                  border: "1.5px solid rgba(239,68,68,0.35)",
                }}>
                  <XCircle style={{ width: "22px", height: "22px", color: "#ef4444", marginBottom: "6px" }} />
                  <div style={{ fontSize: "clamp(28px, 9vw, 36px)", fontWeight: 900, color: "#ef4444", lineHeight: 1 }}>
                    {wrongCount}
                  </div>
                  <div style={{
                    fontSize: "10px", color: "#fca5a5", fontWeight: 700,
                    letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "3px",
                  }}>
                    Wrong
                  </div>
                </div>

                {/* Skipped */}
                <div style={{
                  padding: "12px 8px", borderRadius: "14px",
                  background: "rgba(100,116,139,0.12)",
                  border: "1.5px solid rgba(100,116,139,0.35)",
                }}>
                  <Target style={{ width: "22px", height: "22px", color: "#94a3b8", marginBottom: "6px" }} />
                  <div style={{ fontSize: "clamp(28px, 9vw, 36px)", fontWeight: 900, color: "#94a3b8", lineHeight: 1 }}>
                    {questions.length - correctCount - wrongCount}
                  </div>
                  <div style={{
                    fontSize: "10px", color: "#64748b", fontWeight: 700,
                    letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "3px",
                  }}>
                    Skipped
                  </div>
                </div>
              </div>

              {/* Share */}
              <div style={{ marginBottom: "14px" }}>
                <ShareButtons
                  scoreData={{
                    score: totalScore,
                    correct: correctCount,
                    wrong: wrongCount,
                    accuracy,
                    userName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Player',
                    userCountry: user?.user_metadata?.country || '🌍',
                    roundId: undefined,
                  }}
                  variant="full"
                />
              </div>

              {/* Countdown */}
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
                Returning home in <span style={{ color: "#22c55e", fontWeight: 700 }}>{finalCountdown}s</span>
              </div>

              <button
                onClick={() => {
                  if (finalRedirectRef.current) clearTimeout(finalRedirectRef.current);
                  router.push("/");
                }}
                style={{
                  width: "100%", padding: "13px 24px",
                  borderRadius: "12px", border: "none",
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  color: "white", fontSize: "14px", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.05em",
                  cursor: "pointer", boxShadow: "0 0 25px rgba(124,58,237,0.5)",
                }}
              >
                Go Home
              </button>
            </article>

          ) : (
            <>
              {/* ═══ SORU KARTI ═══ */}
              <div style={{
                transition: "all 0.4s ease",
                transform: showExplanation ? "scale(0.97)" : "scale(1)",
                opacity: showExplanation ? 0.35 : 1,
                marginBottom: showExplanation ? "12px" : "0",
              }}>
                <article
                  className="animate-slide-up"
                  style={{
                    padding: "clamp(24px, 5vw, 32px) clamp(20px, 4vw, 28px)",
                    borderRadius: "clamp(24px, 5vw, 32px)",
                    border: "2px solid rgba(139,92,246,0.4)",
                    background: "linear-gradient(135deg, rgba(30,27,75,0.95) 0%, rgba(15,23,42,0.95) 100%)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(139,92,246,0.2)",
                    backdropFilter: "blur(20px)",
                    marginBottom: "24px",
                  }}
                >
                  <div style={{
                    display: "flex", alignItems: "center",
                    gap: "10px", marginBottom: "16px",
                  }}>
                    <Target style={{
                      width: "24px", height: "24px", color: "#22d3ee",
                      filter: "drop-shadow(0 0 8px #22d3ee)",
                    }} />
                    <span style={{
                      fontSize: "clamp(11px, 2.3vw, 14px)", color: "#22d3ee",
                      fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase",
                    }}>
                      Question {currentIndex + 1}
                    </span>
                  </div>

                  <h2 style={{
                    fontSize: "clamp(18px, 4vw, 24px)", lineHeight: 1.5,
                    fontWeight: 700, marginBottom: "24px", color: "#f8fafc",
                  }}>
                    {currentQ?.question_text}
                  </h2>

                  {/* ✅ FIX 1: Option butonları — currentCorrectOption set edildikten sonra renkler doğru */}
                  <div
                    className="question-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "clamp(8px, 2vw, 12px)",
                    }}
                  >
                    {(["a", "b", "c", "d"] as OptionId[]).map((optId) => {
                      const optText = currentQ?.[`option_${optId}` as keyof Question] as string;
                      const isSelected = selectedAnswer === optId;
                      const locked = isAnswerLocked;
                      const correctKnown = currentCorrectOption !== null;

                      let borderColor = "rgba(139,92,246,0.5)";
                      let boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
                      let bg = "linear-gradient(135deg, rgba(30,27,75,0.8), rgba(15,23,42,0.9))";

                      if (locked && correctKnown) {
                        // ✅ Doğru cevap → yeşil (seçilmiş olsun olmasın)
                        if (optId === currentCorrectOption) {
                          borderColor = "#22c55e";
                          boxShadow = "0 0 25px rgba(34,197,94,0.6), 0 4px 20px rgba(0,0,0,0.3)";
                          bg = "linear-gradient(135deg, rgba(22,163,74,0.3), rgba(21,128,61,0.2))";
                        } else if (isSelected && optId !== currentCorrectOption) {
                          // ✅ Seçilen yanlış şık → kırmızı
                          borderColor = "#ef4444";
                          boxShadow = "0 0 25px rgba(239,68,68,0.6), 0 4px 20px rgba(0,0,0,0.3)";
                          bg = "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(185,28,28,0.2))";
                        } else {
                          // Diğer şıklar → soluk
                          borderColor = "rgba(75,85,99,0.4)";
                          boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
                          bg = "linear-gradient(135deg, rgba(30,27,75,0.5), rgba(15,23,42,0.6))";
                        }
                      } else if (locked && !correctKnown) {
                        // RPC henüz dönmedi — seçili şık mor ile bekler
                        if (isSelected) {
                          borderColor = "#d946ef";
                          boxShadow = "0 0 25px rgba(217,70,239,0.6), 0 4px 20px rgba(0,0,0,0.3)";
                          bg = "linear-gradient(135deg, rgba(147,51,234,0.3), rgba(126,34,206,0.2))";
                        } else {
                          borderColor = "rgba(75,85,99,0.4)";
                          boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
                          bg = "linear-gradient(135deg, rgba(30,27,75,0.5), rgba(15,23,42,0.6))";
                        }
                      } else if (isSelected) {
                        // Henüz lock yok ama hover seçilmiş
                        borderColor = "#d946ef";
                        boxShadow = "0 0 25px rgba(217,70,239,0.6), 0 4px 20px rgba(0,0,0,0.3)";
                        bg = "linear-gradient(135deg, rgba(147,51,234,0.3), rgba(126,34,206,0.2))";
                      }

                      const dimmed = locked && correctKnown && optId !== currentCorrectOption && optId !== selectedAnswer;

                      return (
                        <button
                          key={optId}
                          onClick={() => handleAnswerClick(optId)}
                          style={{
                            position: "relative",
                            padding: "clamp(10px, 2.5vw, 16px) clamp(10px, 2.5vw, 14px)",
                            borderRadius: "clamp(12px, 2.5vw, 16px)",
                            border: `3px solid ${borderColor}`,
                            background: bg,
                            color: "#f8fafc",
                            textAlign: "left",
                            cursor: locked ? "default" : "pointer",
                            // ✅ disabled yerine pointerEvents — React style update'i engellemiyor
                            pointerEvents: locked ? "none" : "auto",
                            boxShadow,
                            transition: "all 0.3s cubic-bezier(0.4, 0.2, 1)",
                            overflow: "hidden",
                            opacity: dimmed ? 0.55 : 1,
                            transform: isSelected && !locked ? "scale(1.02)" : "scale(1)",
                            WebkitTapHighlightColor: "transparent",
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
                          <div style={{
                            display: "flex", alignItems: "center", gap: "12px",
                            position: "relative", zIndex: 2,
                          }}>
                            <div style={{
                              width: "clamp(28px, 6vw, 36px)",
                              height: "clamp(28px, 6vw, 36px)",
                              borderRadius: "8px",
                              border: `2px solid ${borderColor}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "clamp(13px, 2.5vw, 16px)", fontWeight: 900,
                              background: "rgba(15,23,42,0.9)",
                              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)",
                              color: (locked && correctKnown)
                                ? (optId === currentCorrectOption ? "#22c55e" : optId === selectedAnswer ? "#ef4444" : "#6b7280")
                                : "#a78bfa",
                              flexShrink: 0,
                            }}>
                              {optId.toUpperCase()}
                            </div>
                            <div style={{
                              fontSize: "clamp(12px, 2.8vw, 15px)",
                              fontWeight: 600, color: "#f8fafc",
                              lineHeight: 1.35, wordBreak: "break-word",
                              overflowWrap: "anywhere",
                            }}>
                              {optText}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </article>
              </div>

              {/* ═══ EXPLANATION KARTI ═══ */}
              {showExplanation && (
                <article
                  className="animate-slide-up"
                  style={{
                    padding: "clamp(24px, 5vw, 32px) clamp(20px, 4vw, 28px)",
                    borderRadius: "clamp(24px, 5vw, 32px)",
                    border: "2px solid rgba(56,189,248,0.5)",
                    background: "linear-gradient(135deg, rgba(8,47,73,0.95), rgba(6,8,20,0.95))",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(56,189,248,0.3)",
                    backdropFilter: "blur(20px)",
                    marginBottom: "24px",
                  }}
                >
                  <div style={{
                    display: "flex", alignItems: "center",
                    gap: "12px", marginBottom: "16px", flexWrap: "wrap",
                  }}>
                    {isCorrect ? (
                      <>
                        <CheckCircle style={{
                          width: "32px", height: "32px", color: "#22c55e",
                          filter: "drop-shadow(0 0 10px #22c55e)",
                        }} />
                        <span style={{
                          fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 900,
                          color: "#22c55e", textShadow: "0 0 10px rgba(34,197,94,0.5)",
                        }}>
                          Correct Answer!
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle style={{
                          width: "32px", height: "32px", color: "#ef4444",
                          filter: "drop-shadow(0 0 10px #ef4444)",
                        }} />
                        <span style={{
                          fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 900,
                          color: "#ef4444", textShadow: "0 0 10px rgba(239,68,68,0.5)",
                        }}>
                          Incorrect
                        </span>
                      </>
                    )}
                  </div>

                  <div style={{
                    padding: "14px 18px", borderRadius: "16px",
                    background: "rgba(22,163,74,0.15)",
                    border: "2px solid rgba(34,197,94,0.4)",
                    marginBottom: "16px",
                  }}>
                    <span style={{
                      fontSize: "clamp(13px, 2.8vw, 15px)", color: "#86efac", fontWeight: 700,
                    }}>
                      Correct Answer:{" "}
                      <span style={{
                        color: "#22c55e", fontWeight: 900,
                        fontSize: "clamp(15px, 3.2vw, 18px)",
                      }}>
                        {currentCorrectOption?.toUpperCase() || "N/A"}
                      </span>
                    </span>
                  </div>

                  <p style={{
                    fontSize: "clamp(14px, 3vw, 16px)", color: "#e0f2fe",
                    lineHeight: 1.7, marginBottom: "20px", fontWeight: 500,
                  }}>
                    {currentExplanation || "No explanation available."}
                  </p>

                  {/* Explanation timer */}
                  <div style={{ marginTop: "16px" }}>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      marginBottom: "8px", padding: "0 2px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Clock style={{ width: "14px", height: "14px", color: "#38bdf8" }} />
                        <span style={{
                          fontSize: "11px", fontWeight: 700, color: "#64748b",
                          textTransform: "uppercase", letterSpacing: "0.1em",
                        }}>
                          Next
                        </span>
                      </div>
                      <span style={{
                        fontSize: "clamp(28px, 7vw, 36px)", fontWeight: 900,
                        color: "#38bdf8", textShadow: "0 0 15px #38bdf8", lineHeight: 1,
                      }}>
                        {explanationTimeLeft}
                      </span>
                      <span style={{
                        fontSize: "11px", fontWeight: 700, color: "#64748b",
                        textTransform: "uppercase", letterSpacing: "0.1em",
                      }}>
                        &nbsp;
                      </span>
                    </div>
                    <div style={{
                      height: "6px", borderRadius: "3px",
                      background: "rgba(30,27,75,0.8)", overflow: "hidden",
                      border: "1px solid rgba(56,189,248,0.2)",
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${(explanationTimeLeft / QUESTION_DURATION) * 100}%`,
                        background: "linear-gradient(90deg, #38bdf8, #38bdf8aa)",
                        boxShadow: "0 0 8px #38bdf8",
                        borderRadius: "3px",
                        transition: "width 1s linear",
                      }} />
                    </div>
                  </div>
                </article>
              )}

              {/* ═══ SORU NOKTALARI ═══ */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "clamp(4px, 1vw, 6px)",
                padding: "0 16px",
              }}>
                {Array.from({ length: questions.length }).map((_, i) => {
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

          {/* ═══ EXIT CONFIRM MODAL ═══ */}
          {showExitConfirm && (
            <div style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(8px)", display: "flex",
              alignItems: "center", justifyContent: "center", zIndex: 50,
              padding: "20px",
            }}>
              <div
                className="animate-slide-up"
                style={{
                  width: "min(400px, 90vw)", padding: "32px 28px",
                  borderRadius: "24px",
                  background: "linear-gradient(135deg, rgba(30,27,75,0.98), rgba(15,23,42,0.98))",
                  border: "2px solid rgba(139,92,246,0.5)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(139,92,246,0.4)",
                  textAlign: "center", backdropFilter: "blur(20px)",
                }}
              >
                <div style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.1))",
                  border: "2px solid rgba(239,68,68,0.5)", marginBottom: "20px",
                }}>
                  <Zap style={{ width: "32px", height: "32px", color: "#ef4444", filter: "drop-shadow(0 0 10px #ef4444)" }} />
                </div>

                <h3 style={{
                  fontSize: "clamp(18px, 4vw, 22px)", fontWeight: 900,
                  color: "#f8fafc", marginBottom: "12px",
                }}>
                  Exit Quiz?
                </h3>

                <p style={{
                  fontSize: "clamp(13px, 2.8vw, 15px)", color: "#94a3b8",
                  marginBottom: "28px", lineHeight: 1.6,
                }}>
                  Your current progress will be saved and you'll see your final score.
                </p>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={handleExitConfirmNo}
                    style={{
                      flex: 1, padding: "14px 20px", borderRadius: "999px",
                      border: "2px solid rgba(139,92,246,0.6)",
                      background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.2))",
                      color: "#f8fafc", fontWeight: 800,
                      fontSize: "clamp(13px, 2.8vw, 15px)", cursor: "pointer",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                      transition: "all 0.3s ease",
                      WebkitTapHighlightColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 0 25px rgba(139,92,246,0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    Continue Quiz
                  </button>

                  <button
                    onClick={handleExitConfirmYes}
                    style={{
                      flex: 1, padding: "14px 20px", borderRadius: "999px",
                      border: "2px solid rgba(239,68,68,0.6)",
                      background: "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(185,28,28,0.2))",
                      color: "#f8fafc", fontWeight: 800,
                      fontSize: "clamp(13px, 2.8vw, 15px)", cursor: "pointer",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                      transition: "all 0.3s ease",
                      WebkitTapHighlightColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 0 25px rgba(239,68,68,0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
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
