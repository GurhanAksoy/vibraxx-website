"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Users,
  Clock,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Home,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

interface LobbyPlayer {
  user_id: string;
  full_name: string;
  avatar_url: string;
  total_score: number;
  streak: number;
}

// ============================================
// LOBBY STATE — get_lobby_state RPC shape
// ============================================
interface LobbyStateData {
  requires_auth: boolean;
  no_round: boolean;
  round_id: number;
  seconds_to_start: number;
  user_joined: boolean;
  join_block_reason: string | null;
  should_redirect_to_quiz: boolean;
  participants_count: number;
  recent_players: LobbyPlayer[];
}

export default function LobbyPage() {
  const router = useRouter();

  // ─── Canonical State (get_lobby_state) ───
  const [lobbyState, setLobbyState] = useState<LobbyStateData | null>(null);
  const [localSeconds, setLocalSeconds] = useState<number | null>(null);

  // ─── UI State ───
  const [isPlaying, setIsPlaying] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isRedirectingRef = useRef(false);

  // ─── Audio refs ───
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const countdownBeepRef = useRef<HTMLAudioElement | null>(null);
  const hasInteractedRef = useRef(false);
  const alarmFiredRef = useRef(false);
  const mountedRef = useRef(true);

  // ─── Round change detection ───
  const lastRoundIdRef = useRef<number | null>(null);

  // ─── Derived ───
  const isUrgent = localSeconds !== null && localSeconds <= 10 && localSeconds > 0;

  // === AUDIO INITIALIZATION ===
  useEffect(() => {
    mountedRef.current = true;
    if (typeof window === "undefined") return;

    const audio = new Audio("/sounds/vibraxx.mp3");
    audio.loop = true;
    audioRef.current = audio;

    alarmRef.current = new Audio("/sounds/alarm.mp3");
    countdownBeepRef.current = new Audio("/sounds/countdown.mp3");

    return () => {
      mountedRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (alarmRef.current) {
        alarmRef.current.pause();
        alarmRef.current = null;
      }
      if (countdownBeepRef.current) {
        countdownBeepRef.current.pause();
        countdownBeepRef.current = null;
      }
    };
  }, []);

  // === CLICK ANYWHERE TO PLAY MUSIC ===
  useEffect(() => {
    const handleFirstClick = () => {
      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true;
        setIsPlaying(true);
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      }
    };

    document.addEventListener("click", handleFirstClick, { once: true });

    return () => {
      document.removeEventListener("click", handleFirstClick);
    };
  }, []);

  // === PLAY / PAUSE CONTROL ===
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // ============================================
  // FETCH LOBBY STATE — tek source (canonical)
  // ============================================
  const fetchLobbyState = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_lobby_state");
      if (error || !data || !mountedRef.current) return;

      const state = data as LobbyStateData;

      // Auth guard → home
      if (state.requires_auth) {
        router.push("/");
        return;
      }

      // No round → home
      if (state.no_round) {
        router.push("/");
        return;
      }

      // No credits + not joined → buy
      if (state.join_block_reason === "no_credits" && !state.user_joined) {
        router.push("/buy");
        return;
      }

      // isNewRound → ref UPDATE'DEN ÖNCE hesaplana
      const isNewRound = lastRoundIdRef.current === null || lastRoundIdRef.current !== state.round_id;

      // Round changed → reset UI
      if (lastRoundIdRef.current !== null && lastRoundIdRef.current !== state.round_id) {
        setShowWarning(false);
        setIsRedirecting(false);
        isRedirectingRef.current = false;
        alarmFiredRef.current = false;
      }

      // Ref SONRA update
      lastRoundIdRef.current = state.round_id;

      setLobbyState(state);

      // localSeconds sadece ilk kez veya round değişince sıfırlanır
      // polling her 5s gelir ama localSeconds overwrite etmez
      if (isNewRound) {
        setLocalSeconds(state.seconds_to_start);
      }

      setIsLoading(false);

      // Round started + user joined → quiz
      if (state.should_redirect_to_quiz && !isRedirectingRef.current) {
        isRedirectingRef.current = true;
        setIsRedirecting(true);
        router.push("/quiz");
      }
    } catch (err) {
      console.error("[Lobby] RPC error:", err);
    }
  }, [router]);

  // ─── Initial fetch + polling every 5s ───
  useEffect(() => {
    fetchLobbyState();
    const interval = setInterval(fetchLobbyState, 5000);
    return () => clearInterval(interval);
  }, [fetchLobbyState]);

  // ============================================
  // LOCAL TICK (1s) — ana sayfa ile aynı pattern
  // Bağımsız interval, RPC gelince setLocalSeconds overwrite eder
  // ============================================
  useEffect(() => {
    const tick = setInterval(() => {
      if (!mountedRef.current) return;
      setLocalSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(tick);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // === WARNING & SOUND EFFECTS ===
  useEffect(() => {
    if (localSeconds === null) return;

    if (localSeconds === 10) {
      setShowWarning(true);
      if (isPlaying && alarmRef.current && !alarmFiredRef.current) {
        alarmFiredRef.current = true;
        alarmRef.current.currentTime = 0;
        alarmRef.current.play().catch(() => {});
      }
    }

    if (localSeconds <= 10 && localSeconds > 0) {
      if (isPlaying && countdownBeepRef.current) {
        countdownBeepRef.current.currentTime = 0;
        countdownBeepRef.current.play().catch(() => {});
      }
    }

    if (localSeconds > 10) {
      setShowWarning(false);
      alarmFiredRef.current = false;
    }
  }, [localSeconds, isPlaying]);

  // === AUTO-JOIN + REDIRECT — countdown 0 ===
  useEffect(() => {
    if (localSeconds !== 0 || isRedirecting || !lobbyState) return;

    const joinAndGo = async () => {
      setIsRedirecting(true);

      // Zaten joined ise sadece redirect — RPC çağırma
      if (!lobbyState.user_joined) {
        try {
          await supabase.rpc("join_live_round", { p_round_id: lobbyState.round_id });
        } catch (e) {
          console.error("[Lobby] join_live_round failed:", e);
        }
      }

      router.push("/quiz");
    };

    joinAndGo();
  }, [localSeconds, isRedirecting, lobbyState, router]);

  // === WARNING HELPERS ===
  const getWarningMessage = () => {
    if (localSeconds !== null && localSeconds <= 3) return "🚀 QUIZ STARTING NOW!";
    if (localSeconds !== null && localSeconds <= 5) return "⚡ GET READY!";
    if (localSeconds !== null && localSeconds <= 10) return "⏰ FINAL COUNTDOWN!";
    return "Quiz Starting Soon";
  };

  // === FORMAT MM:SS ===
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // === LOADING STATE ===
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 120,
              height: 120,
              margin: "0 auto 24px",
              position: "relative",
              borderRadius: "50%",
              padding: 4,
              background: "linear-gradient(135deg, #7c3aed, #d946ef)",
              boxShadow: "0 0 40px rgba(124, 58, 237, 0.7)",
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
                sizes="120px"
                style={{ objectFit: "contain", padding: "8px" }}
              />
            </div>
          </div>
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto 20px",
              border: "4px solid rgba(139, 92, 246, 0.3)",
              borderTop: "4px solid #a78bfa",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ fontSize: 18, color: "#94a3b8", fontWeight: 600 }}>
            Loading Premium Lobby...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
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
            transform: translateY(-20px);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes hero-shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes redAlarm {
          0%,
          100% {
            box-shadow: 0 0 40px rgba(239, 68, 68, 0.8),
              0 0 80px rgba(239, 68, 68, 0.6),
              inset 0 0 40px rgba(239, 68, 68, 0.3);
            border-color: rgba(239, 68, 68, 0.8);
          }
          50% {
            box-shadow: 0 0 60px rgba(220, 38, 38, 1),
              0 0 120px rgba(220, 38, 38, 0.8),
              inset 0 0 60px rgba(220, 38, 38, 0.5);
            border-color: rgba(220, 38, 38, 1);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0) rotate(0deg);
          }
          25% {
            transform: translateX(-4px) rotate(-1deg);
          }
          75% {
            transform: translateX(4px) rotate(1deg);
          }
        }
        @keyframes warningPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.03);
            opacity: 0.9;
          }
        }
        @keyframes redPulse {
          0%,
          100% {
            box-shadow: 0 0 40px rgba(239, 68, 68, 0.8),
              0 0 80px rgba(239, 68, 68, 0.5);
          }
          50% {
            box-shadow: 0 0 60px rgba(220, 38, 38, 1),
              0 0 100px rgba(220, 38, 38, 0.7);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html,
        body {
          overflow-x: hidden;
          width: 100%;
          max-width: 100vw;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
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
            top: "-150px",
            left: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent)",
            filter: "blur(90px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          className="animate-float"
          style={{
            position: "fixed",
            bottom: "-150px",
            right: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(217, 70, 239, 0.4), transparent)",
            filter: "blur(90px)",
            pointerEvents: "none",
            zIndex: 0,
            animationDelay: "2s",
          }}
        />

        {/* RED WARNING Overlay */}
        {showWarning && isUrgent && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: `radial-gradient(circle, rgba(239, 68, 68, 0.25), transparent)`,
              pointerEvents: "none",
              zIndex: 40,
              animation: "warningPulse 0.6s ease-in-out infinite",
            }}
          />
        )}

        {/* Top Header Bar */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              padding: "clamp(14px, 3.6vw, 19px) clamp(19px, 4.8vw, 38px)",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Left: Logo + Home Button */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  zIndex: 21,
                }}
              >
                {/* Logo */}
                <div
                  onClick={() => router.push("/")}
                  style={{
                    position: "relative",
                    width: "clamp(48px, 13vw, 72px)",
                    height: "clamp(48px, 13vw, 72px)",
                    borderRadius: "9999px",
                    padding: 4,
                    background: "radial-gradient(circle at 0 0,#7c3aed,#d946ef)",
                    boxShadow: "0 0 30px rgba(124,58,237,0.6)",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: -5,
                      borderRadius: "9999px",
                      background: "radial-gradient(circle,#a855f7,transparent)",
                      opacity: 0.4,
                      filter: "blur(10px)",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      borderRadius: "9999px",
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
                      sizes="72px"
                      style={{ objectFit: "contain", padding: "18%" }}
                      priority
                    />
                  </div>
                </div>

                {/* Home Button */}
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  style={{
                    width: "clamp(34px, 9vw, 38px)",
                    height: "clamp(34px, 9vw, 38px)",
                    borderRadius: "12px",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    background: "rgba(15, 23, 42, 0.85)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.25s",
                    boxShadow: "0 0 10px rgba(139, 92, 246, 0.15)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.2)";
                    e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.6)";
                    e.currentTarget.style.boxShadow = "0 0 18px rgba(139, 92, 246, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(15, 23, 42, 0.85)";
                    e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)";
                    e.currentTarget.style.boxShadow = "0 0 10px rgba(139, 92, 246, 0.15)";
                  }}
                >
                  <Home style={{ width: 17, height: 17, color: "#a78bfa" }} />
                </button>
              </div>

              {/* Right: Sound Toggle */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  padding: "11px",
                  borderRadius: "12px",
                  border: "1px solid rgba(148, 163, 253, 0.3)",
                  background: "rgba(15, 23, 42, 0.8)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s",
                  zIndex: 21,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(139, 92, 246, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(15, 23, 42, 0.8)";
                }}
              >
                {isPlaying ? (
                  <Volume2 style={{ width: 20, height: 20, color: "#a78bfa" }} />
                ) : (
                  <VolumeX style={{ width: 20, height: 20, color: "#6b7280" }} />
                )}
              </button>
            </div>

            {/* Center: GLOBAL ARENA — her zaman ortalı */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 20,
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              {/* GLOBAL ARENA Text */}
              <div>
                <div
                  style={{
                    fontSize: "clamp(16px, 3.5vw, 22px)",
                    fontWeight: 900,
                    backgroundImage: "linear-gradient(135deg, #a78bfa, #f0abfc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    lineHeight: 1.2,
                  }}
                >
                  GLOBAL ARENA
                </div>
                <div
                  style={{
                    fontSize: "clamp(9px, 1.8vw, 11px)",
                    color: "#64748b",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    textAlign: "center",
                    marginTop: 2,
                  }}
                >
                  LIVE LOBBY
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "clamp(24px, 5vw, 40px) clamp(16px, 4vw, 32px)",
          }}
        >
          {/* Sponsor Banner */}
          <div
            style={{
              marginBottom: "clamp(24px, 5vw, 36px)",
              padding: "clamp(16px, 3.5vw, 28px)",
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, rgba(251, 191, 36, 0.18), rgba(245, 158, 11, 0.12))",
              border: "2px solid rgba(251, 191, 36, 0.5)",
              backdropFilter: "blur(20px)",
              position: "relative",
              overflow: "hidden",
              boxShadow:
                "0 0 30px rgba(251, 191, 36, 0.3), inset 0 0 40px rgba(251, 191, 36, 0.06)",
              minHeight: "clamp(100px, 18vw, 160px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "50%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)",
                animation: "shimmer 3s infinite",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: "clamp(100px, 18vw, 160px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src="/images/sponsor.png"
                alt="Official Sponsor"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                style={{
                  objectFit: "contain",
                  padding: "clamp(12px, 3vw, 20px)",
                }}
                onError={(e) => {
                  const img = e.currentTarget;
                  const container = img.parentElement as HTMLDivElement;
                  if (container) {
                    container.style.display = "none";
                    const placeholder = container.nextElementSibling as HTMLDivElement;
                    if (placeholder) placeholder.style.display = "block";
                  }
                }}
              />
            </div>

            <div
              id="sponsor-placeholder"
              style={{
                position: "relative",
                zIndex: 10,
                textAlign: "center",
                display: "none",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  background: "rgba(251, 191, 36, 0.25)",
                  border: "1px solid rgba(251, 191, 36, 0.6)",
                  marginBottom: "10px",
                }}
              >
                <Sparkles style={{ width: 12, height: 12, color: "#fbbf24" }} />
                <span
                  style={{
                    fontSize: "clamp(9px, 1.8vw, 11px)",
                    fontWeight: 700,
                    color: "#fbbf24",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Sponsor Space Available
                </span>
              </div>

              <h2
                style={{
                  fontSize: "clamp(18px, 4.5vw, 32px)",
                  fontWeight: 900,
                  backgroundImage: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "8px",
                }}
              >
                Your Brand Here
              </h2>

              <p
                style={{
                  fontSize: "clamp(11px, 2.8vw, 14px)",
                  color: "#fcd34d",
                  fontWeight: 600,
                  marginBottom: "12px",
                  lineHeight: 1.4,
                }}
              >
                Reach 12,000+ active quiz players daily!
              </p>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(251, 191, 36, 0.3)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "clamp(9px, 2vw, 11px)",
                      color: "#cbd5e1",
                    }}
                  >
                    📊 <strong style={{ color: "#fbbf24" }}>12K+</strong> Players
                  </span>
                </div>
                <div
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(251, 191, 36, 0.3)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "clamp(9px, 2vw, 11px)",
                      color: "#cbd5e1",
                    }}
                  >
                    🎯 <strong style={{ color: "#fbbf24" }}>Premium</strong> Spot
                  </span>
                </div>
                <div
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(251, 191, 36, 0.3)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "clamp(9px, 2vw, 11px)",
                      color: "#cbd5e1",
                    }}
                  >
                    💰 <strong style={{ color: "#fbbf24" }}>High</strong> ROI
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Text — anasayfa ile uyumlu */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "clamp(28px, 5vw, 40px)",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(26px, 6vw, 42px)",
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: "-0.03em",
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  background: "linear-gradient(90deg, #7c3aed, #22d3ee, #f97316, #d946ef, #7c3aed)",
                  backgroundSize: "250% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "hero-shimmer 4s linear infinite",
                }}
              >
                Challenge yourself. Challenge the world.
              </span>
            </h1>
            <p
              style={{
                fontSize: "clamp(15px, 3.2vw, 17px)",
                color: "#94a3b8",
                maxWidth: 640,
                margin: "0 auto",
                lineHeight: 1.6,
                fontWeight: 500,
              }}
            >
              Join now to compete for skill-based rewards and global ranking
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "clamp(24px, 5vw, 40px)",
            }}
          >
            {/* Countdown Section */}
            <div
              style={{
                padding: "clamp(20px, 6vw, 56px)",
                borderRadius: "28px",
                border:
                  isUrgent
                    ? "3px solid #ef4444"
                    : "3px solid rgba(139, 92, 246, 0.6)",
                background:
                  isUrgent
                    ? "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))"
                    : "rgba(15, 23, 42, 0.85)",
                backdropFilter: "blur(25px)",
                textAlign: "center",
                animation:
                  showWarning && isUrgent
                    ? "redAlarm 0.8s ease-in-out infinite, shake 0.5s ease-in-out infinite"
                    : "none",
                boxShadow:
                  isUrgent
                    ? "0 0 60px rgba(239, 68, 68, 0.6)"
                    : "0 0 40px rgba(139, 92, 246, 0.4)",
              }}
            >
              {/* Status Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "clamp(8px, 2vw, 10px) clamp(12px, 3.5vw, 24px)",
                  borderRadius: "999px",
                  background:
                    isUrgent
                      ? "rgba(239, 68, 68, 0.25)"
                      : "rgba(34, 197, 94, 0.25)",
                  border:
                    isUrgent
                      ? "2px solid rgba(239, 68, 68, 0.6)"
                      : "2px solid rgba(34, 197, 94, 0.5)",
                  marginBottom: "clamp(20px, 4vw, 32px)",
                  boxShadow:
                    isUrgent
                      ? "0 0 25px rgba(239, 68, 68, 0.5)"
                      : "0 0 20px rgba(34, 197, 94, 0.4)",
                }}
              >
                <Shield
                  style={{
                    width: "clamp(16px, 4vw, 20px)",
                    height: "clamp(16px, 4vw, 20px)",
                    color:
                      isUrgent
                        ? "#ef4444"
                        : "#4ade80",
                  }}
                />
                <span
                  style={{
                    fontSize: "clamp(12px, 2.8vw, 14px)",
                    fontWeight: 800,
                    color:
                      isUrgent
                        ? "#fca5a5"
                        : "#4ade80",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {isUrgent
                    ? "🚨 STARTING NOW!"
                    : "✓ You're in the Lobby"}
                </span>
              </div>

              {/* Warning Message */}
              {showWarning && isUrgent && (
                <div
                  style={{
                    padding: "clamp(12px, 3vw, 20px) clamp(14px, 4vw, 28px)",
                    borderRadius: "20px",
                    background:
                      "linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.2))",
                    border: "3px solid #ef4444",
                    marginBottom: "clamp(20px, 4vw, 32px)",
                    animation: "redPulse 0.6s ease-in-out infinite",
                    boxShadow: "0 0 40px rgba(239, 68, 68, 0.8)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "clamp(20px, 5vw, 32px)",
                      fontWeight: 900,
                      color: "#fca5a5",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      textShadow: "0 0 30px #ef4444",
                      margin: 0,
                    }}
                  >
                    {getWarningMessage()}
                  </p>
                </div>
              )}

              {/* Countdown Title */}
              <h1
                style={{
                  fontSize: "clamp(22px, 5.5vw, 36px)",
                  fontWeight: 800,
                  marginBottom: "clamp(16px, 3vw, 24px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "14px",
                  flexWrap: "wrap",
                  color:
                    isUrgent
                      ? "#fca5a5"
                      : "white",
                }}
              >
                <Clock
                  style={{
                    width: "clamp(28px, 7vw, 36px)",
                    height: "clamp(28px, 7vw, 36px)",
                    color:
                      isUrgent
                        ? "#ef4444"
                        : "#a78bfa",
                  }}
                />
                Quiz Starting In
              </h1>

              {/* Countdown Timer */}
              <div
                style={{
                  fontSize: "clamp(56px, 18vw, 120px)",
                  fontWeight: 900,
                  backgroundImage:
                    isUrgent
                      ? "linear-gradient(135deg, #ef4444, #dc2626)"
                      : "linear-gradient(135deg, #a78bfa, #f0abfc)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "clamp(24px, 5vw, 40px)",
                  fontFamily: "monospace",
                  animation:
                    isUrgent
                      ? "warningPulse 0.4s ease-in-out infinite"
                      : "none",
                  letterSpacing: "0.05em",
                }}
              >
                {localSeconds !== null ? formatTime(localSeconds) : "--:--"}
              </div>

              {/* Info Message */}
              <p
                style={{
                  fontSize: "clamp(14px, 3.2vw, 17px)",
                  color:
                    isUrgent
                      ? "#fca5a5"
                      : "#cbd5e1",
                  marginBottom: "clamp(28px, 6vw, 40px)",
                  lineHeight: 1.7,
                  fontWeight: 600,
                }}
              >
                {isUrgent
                  ? "🔥 Get ready! You'll be automatically entered when the countdown ends!"
                  : "You're in. Get ready!"}
              </p>

              {/* Quiz Info Grid - 3 Cards Centered */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "clamp(8px, 2.5vw, 20px)",
                  maxWidth: "900px",
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    padding: "clamp(10px, 2.5vw, 20px)",
                    borderRadius: "16px",
                    background: "rgba(139, 92, 246, 0.15)",
                    border: "2px solid rgba(139, 92, 246, 0.3)",
                    boxShadow: "0 0 15px rgba(139, 92, 246, 0.2)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(9px, 2vw, 13px)",
                      color: "#94a3b8",
                      marginBottom: "4px",
                      fontWeight: 600,
                    }}
                  >
                    Format
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(11px, 2.8vw, 18px)",
                      fontWeight: 800,
                      color: "#c4b5fd",
                    }}
                  >
                    Multiple Choice
                  </div>
                </div>
                <div
                  style={{
                    padding: "clamp(10px, 2.5vw, 20px)",
                    borderRadius: "16px",
                    background: "rgba(236, 72, 153, 0.15)",
                    border: "2px solid rgba(236, 72, 153, 0.3)",
                    boxShadow: "0 0 15px rgba(236, 72, 153, 0.2)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(9px, 2vw, 13px)",
                      color: "#94a3b8",
                      marginBottom: "4px",
                      fontWeight: 600,
                    }}
                  >
                    Time Limit
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(11px, 2.8vw, 18px)",
                      fontWeight: 800,
                      color: "#f9a8d4",
                    }}
                  >
                    6 seconds
                  </div>
                </div>
                <div
                  style={{
                    padding: "clamp(10px, 2.5vw, 20px)",
                    borderRadius: "16px",
                    background: "rgba(34, 197, 94, 0.15)",
                    border: "2px solid rgba(34, 197, 94, 0.3)",
                    boxShadow: "0 0 15px rgba(34, 197, 94, 0.2)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(9px, 2vw, 13px)",
                      color: "#94a3b8",
                      marginBottom: "4px",
                      fontWeight: 600,
                    }}
                  >
                    Points
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(11px, 2.8vw, 18px)",
                      fontWeight: 800,
                      color: "#86efac",
                    }}
                  >
                    2 per correct
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: "clamp(20px, 4.5vw, 28px)",
                  padding: "clamp(10px, 2.5vw, 20px)",
                  borderRadius: "14px",
                  background: "rgba(59, 130, 246, 0.12)",
                  border: "2px solid rgba(59, 130, 246, 0.25)",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(13px, 3vw, 15px)",
                    color: "#bfdbfe",
                    fontWeight: 600,
                  }}
                >
                  💡 <strong style={{ color: "white" }}>Pro Tip:</strong> Speed matters. Answer fast and accurately to dominate the leaderboard.
                </div>
              </div>
            </div>

            {/* Players Section */}
            <div
              style={{
                padding: "clamp(21px, 4.5vw, 30px)",
                borderRadius: "28px",
                border: "2px solid rgba(255, 255, 255, 0.12)",
                background: "rgba(15, 23, 42, 0.7)",
                backdropFilter: "blur(25px)",
                boxShadow: "0 0 30px rgba(139, 92, 246, 0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "clamp(18px, 3.75vw, 24px)",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                <h3
                  style={{
                    fontSize: "clamp(17px, 3.4vw, 20px)",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <Users
                    style={{
                      width: "clamp(19px, 4.1vw, 24px)",
                      height: "clamp(19px, 4.1vw, 24px)",
                      color: "#c4b5fd",
                    }}
                  />
                  Players in Lobby
                </h3>
                <div
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    background: "rgba(139, 92, 246, 0.25)",
                    border: "2px solid rgba(139, 92, 246, 0.4)",
                    fontSize: "clamp(12px, 2.25vw, 14px)",
                    fontWeight: 800,
                    color: "#c4b5fd",
                    boxShadow: "0 0 15px rgba(139, 92, 246, 0.3)",
                  }}
                >
                  {lobbyState?.participants_count ?? 0}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(9px, 1.9vw, 12px)",
                  maxHeight: "min(412px, 38vh)",
                  overflowY: "auto",
                  paddingRight: "8px",
                }}
              >
                {lobbyState?.recent_players && lobbyState.recent_players.length > 0 ? (
                  lobbyState.recent_players.map((player, idx) => (
                    <div
                      key={player.user_id}
                      className="animate-slide-in"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "clamp(10px, 2.6vw, 13px)",
                        padding: "clamp(10px, 2.6vw, 15px)",
                        borderRadius: "18px",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        background: "rgba(255, 255, 255, 0.04)",
                        transition: "all 0.3s",
                        animationDelay: `${idx * 0.1}s`,
                        boxShadow: "0 0 15px rgba(0, 0, 0, 0.2)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)";
                        e.currentTarget.style.transform = "translateX(4px)";
                        e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                        e.currentTarget.style.transform = "translateX(0)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                      }}
                    >
                      <div
                        style={{
                          width: "clamp(33px, 8.25vw, 40px)",
                          height: "clamp(33px, 8.25vw, 40px)",
                          borderRadius: "50%",
                          border: "3px solid rgba(139, 92, 246, 0.6)",
                          overflow: "hidden",
                          flexShrink: 0,
                          position: "relative",
                          boxShadow: "0 0 15px rgba(139, 92, 246, 0.4)",
                        }}
                      >
                        <Image
                          src={player.avatar_url || "/images/logo.png"}
                          alt={player.full_name}
                          fill
                          sizes="40px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "5px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "clamp(13px, 2.6vw, 15px)",
                              fontWeight: 700,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {player.full_name || "Anonymous"}
                          </span>
                          {player.streak >= 10 && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "3px 10px",
                                borderRadius: "8px",
                                background: "rgba(239, 68, 68, 0.25)",
                                border: "1px solid rgba(239, 68, 68, 0.4)",
                                boxShadow: "0 0 10px rgba(239, 68, 68, 0.3)",
                              }}
                            >
                              <Flame style={{ width: 13, height: 13, color: "#fca5a5" }} />
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 800,
                                  color: "#fca5a5",
                                }}
                              >
                                {player.streak ?? 0}
                              </span>
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "clamp(10px, 2.1vw, 12px)",
                            color: "#94a3b8",
                            fontWeight: 600,
                          }}
                        >
                          🏆 {(player.total_score ?? 0).toLocaleString()} points
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      padding: "clamp(21px, 4.5vw, 30px)",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "clamp(12px, 2.4vw, 14px)",
                      fontWeight: 600,
                    }}
                  >
                    Waiting for players to join...
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          main > div:last-child {
            grid-template-columns: 1.3fr 1fr;
          }
        }

        @media (max-width: 640px) {
          header > div {
            position: relative !important;
          }
        }

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.7);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.7),
            rgba(217, 70, 239, 0.5)
          );
          border-radius: 10px;
          border: 2px solid rgba(15, 23, 42, 0.7);
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.9),
            rgba(217, 70, 239, 0.7)
          );
        }
      `}</style>
    </>
  );
}
