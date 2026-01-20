"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Users,
  Clock,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useNextRound } from "@/hooks/useNextRound";

interface LobbyPlayer {
  user_id: string;
  full_name: string;
  avatar_url: string;
  total_score: number;
  streak: number;
  joined_at: string;
}

export default function LobbyPage() {
  const router = useRouter();

  // ✅ Use shared hook (Homepage ile AYNI round!)
  const { nextRound, timeUntilStart, formattedCountdown, lobbyStatus } = useNextRound();

  // Core State
  const [isPlaying, setIsPlaying] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userCredits, setUserCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  // Lobby Data
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);

  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const countdownBeepRef = useRef<HTMLAudioElement | null>(null);
  const hasInteractedRef = useRef(false);

  // Round change detection
  const lastRoundIdRef = useRef<number | null>(null);

  // === AUDIO INITIALIZATION ===
  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio("/sounds/vibraxx.mp3");
    audio.loop = true;
    audioRef.current = audio;

    alarmRef.current = new Audio("/sounds/alarm.mp3");
    countdownBeepRef.current = new Audio("/sounds/countdown.mp3");

    return () => {
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

  // 🔐 === AUTH CHECK & CREDITS ===
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);

      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        console.log("[Lobby] Not authenticated");
        router.push("/");
        return;
      }

      setUser(authUser);

      // ✅ NEW: user_credits.live_credits (ESKİ: get_my_round_credits RPC)
      const { data: creditsData, error: creditsError } = await supabase
        .from("user_credits")
        .select("live_credits")
        .eq("user_id", authUser.id)
        .single();

      if (creditsError) {
        console.error("[Lobby] Credits check error:", creditsError);
        router.push("/buy");
        return;
      }

      if (!creditsData || creditsData.live_credits <= 0) {
        console.log("[Lobby] No remaining credits");
        router.push("/buy");
        return;
      }

      setUserCredits(creditsData.live_credits);
      console.log("[Lobby] User credits:", creditsData.live_credits);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  // ✅ === ROUND CHANGE DETECTION ===
  useEffect(() => {
    if (nextRound?.id && lastRoundIdRef.current && lastRoundIdRef.current !== nextRound.id) {
      console.log("[Lobby] Round changed, resetting state");
      setHasJoined(false);
      setShowWarning(false);
      setIsRedirecting(false);
      setPlayers([]);
      setTotalPlayers(0);
    }
    lastRoundIdRef.current = nextRound?.id || null;
  }, [nextRound?.id]);

  // ✅ === LOBBY SESSION TRACKING (ROUND DÜŞMEZ) ===
  useEffect(() => {
    if (nextRound?.id && user && !hasJoined) {
      console.log("[Lobby] User in lobby, waiting for quiz start");
      supabase.rpc("upsert_user_session", { p_user_id: user.id });
      setHasJoined(true);
    }
  }, [nextRound?.id, user?.id, hasJoined]);

  // === FETCH LOBBY PLAYERS ===
  const fetchLobbyPlayers = useCallback(async () => {
    if (!nextRound?.id) return;

    try {
      const { data, error } = await supabase.rpc("get_lobby_participants", {
        p_round_id: nextRound.id,
      });

      if (error) {
        console.error("[Lobby] Fetch players error:", error);
        return;
      }

      if (data) {
        setPlayers(data);
      }
    } catch (err) {
      console.error("[Lobby] Fetch players error:", err);
    }
  }, [nextRound?.id]);

  // === FETCH TOTAL PARTICIPANTS ===
  const fetchTotalParticipants = useCallback(async () => {
    if (!nextRound?.id) return;

    try {
      const { data, error } = await supabase.rpc("get_round_participant_count", {
        p_round_id: nextRound.id,
      });

      if (error) {
        console.error("[Lobby] Fetch count error:", error);
        return;
      }

      if (typeof data === "number") {
        setTotalPlayers(data);
      }
    } catch (err) {
      console.error("[Lobby] Fetch total error:", err);
    }
  }, [nextRound?.id]);

  // === FETCH PLAYERS WHEN IN LOBBY ===
  useEffect(() => {
    if (!hasJoined || !nextRound?.id) return;

    const loadParticipants = async () => {
      await Promise.all([fetchLobbyPlayers(), fetchTotalParticipants()]);
    };

    loadParticipants();

    const playersInterval = setInterval(fetchLobbyPlayers, 5000);
    const countInterval = setInterval(fetchTotalParticipants, 5000);

    return () => {
      clearInterval(playersInterval);
      clearInterval(countInterval);
    };
  }, [hasJoined, nextRound?.id, fetchLobbyPlayers, fetchTotalParticipants]);

  // === AUTO START WHEN COUNTDOWN ENDS ===
  useEffect(() => {
    if (
      timeUntilStart <= 0 &&
      nextRound?.status === "scheduled" &&
      !isRedirecting &&
      hasJoined
    ) {
      handleStartGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeUntilStart, nextRound?.status, isRedirecting, hasJoined]);

  // === WARNING & SOUND EFFECTS ===
  useEffect(() => {
    if (timeUntilStart === 10) {
      setShowWarning(true);
      if (isPlaying && alarmRef.current) {
        alarmRef.current.currentTime = 0;
        alarmRef.current.play().catch(() => {});
      }
    }

    if (timeUntilStart <= 10 && timeUntilStart > 0) {
      if (isPlaying && countdownBeepRef.current) {
        countdownBeepRef.current.currentTime = 0;
        countdownBeepRef.current.play().catch(() => {});
      }
    }

    if (timeUntilStart > 10) {
      setShowWarning(false);
    }
  }, [timeUntilStart, isPlaying]);

  // ✅ === START GAME & JOIN ROUND (BURADA ROUND DÜŞER) ===
  const handleStartGame = async () => {
    if (isRedirecting) return;
    setIsRedirecting(true);

    console.log("[Lobby] Quiz starting, joining round now...");

    if (nextRound?.id && user) {
      try {
        const { data, error } = await supabase.rpc("join_round", {
          p_round_id: nextRound.id,
          p_user_id: user.id,
          p_round_type: "live",
        });

        if (error) {
          console.error("[Lobby] Join round error:", error);
          if ((error as any).message?.includes("no_credits")) {
            router.push("/buy");
            return;
          }
        }

        const result = data as { success: boolean; error?: string };

        if (!result?.success) {
          console.error("[Lobby] Join failed:", result?.error);
          if (result?.error === "no_credits") {
            router.push("/buy");
            return;
          }
        }

        console.log("[Lobby] Round joined successfully, credits deducted");
      } catch (err) {
        console.error("[Lobby] Join round error:", err);
      }
    }

    router.push("/quiz");
  };

  // === HANDLE BACK BUTTON ===
  const handleBack = async () => {
    console.log("[Lobby] User left lobby, round NOT deducted");
    router.push("/");
  };

  // === PROGRESS CALCULATION ===
  const progress = ((900 - Math.max(Math.min(timeUntilStart, 900), 0)) / 900) * 100;

  // === WARNING HELPERS ===
  const getWarningMessage = () => {
    if (timeUntilStart <= 3) return "🚀 QUIZ STARTING NOW!";
    if (timeUntilStart <= 5) return "⚡ GET READY!";
    if (timeUntilStart <= 10) return "⏰ FINAL COUNTDOWN!";
    return "Quiz Starting Soon";
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
                priority
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
        @keyframes pulse-ring {
          0% {
            transform: scale(0.95);
            opacity: 1;
          }
          50% {
            transform: scale(1);
            opacity: 0.7;
          }
          100% {
            transform: scale(0.95);
            opacity: 1;
          }
        }
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
        @keyframes neonPulse {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.6),
              0 0 40px rgba(139, 92, 246, 0.4),
              inset 0 0 20px rgba(139, 92, 246, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(217, 70, 239, 0.9),
              0 0 60px rgba(217, 70, 239, 0.6),
              inset 0 0 30px rgba(217, 70, 239, 0.3);
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
            transform: translateX(-10px) rotate(-2deg);
          }
          75% {
            transform: translateX(10px) rotate(2deg);
          }
        }
        @keyframes warningPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.9;
          }
        }
        @keyframes glowPulse {
          0%,
          100% {
            filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.6));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(251, 191, 36, 1));
          }
        }

        .animate-slide-in {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          overflow-x: hidden;
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
        {showWarning && timeUntilStart <= 10 && (
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
              {/* Left: Back Button */}
              <button
                onClick={handleBack}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(148, 163, 253, 0.3)",
                  background: "rgba(15, 23, 42, 0.8)",
                  color: "white",
                  fontSize: "clamp(13px, 2.5vw, 15px)",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s",
                  zIndex: 21,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(139, 92, 246, 0.2)";
                  e.currentTarget.style.transform = "translateX(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(15, 23, 42, 0.8)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <ArrowLeft style={{ width: 18, height: 18 }} />
                <span className="hide-on-small">Back</span>
              </button>

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

            {/* Center: Logo + GLOBAL ARENA Text */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                gap: "clamp(12px, 3vw, 16px)",
              }}
            >
              {/* Logo */}
              <div
                style={{
                  position: "relative",
                  width: "clamp(70px, 14vw, 90px)",
                  height: "clamp(70px, 14vw, 90px)",
                  borderRadius: "50%",
                  padding: 3,
                  background: "linear-gradient(135deg, #7c3aed, #d946ef)",
                  boxShadow:
                    "0 0 30px rgba(124, 58, 237, 0.7), 0 0 60px rgba(217, 70, 239, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <div
                  className="animate-glow"
                  style={{
                    position: "absolute",
                    inset: -5,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #a855f7, transparent)",
                    opacity: 0.5,
                    filter: "blur(10px)",
                    pointerEvents: "none",
                  }}
                />
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
                    zIndex: 10,
                  }}
                >
                  <Image
                    src="/images/logo.png"
                    alt="VibraXX"
                    fill
                    sizes="90px"
                    style={{ objectFit: "contain", padding: "5px" }}
                    priority
                  />
                </div>
              </div>

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
                    textShadow: "0 0 20px rgba(167, 139, 250, 0.5)",
                  }}
                >
                  GLOBAL ARENA
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
                priority
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
                  textShadow: "0 0 30px rgba(251, 191, 36, 0.4)",
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
                padding: "clamp(32px, 6vw, 56px)",
                borderRadius: "28px",
                border:
                  timeUntilStart <= 10
                    ? "3px solid #ef4444"
                    : "3px solid rgba(139, 92, 246, 0.6)",
                background:
                  timeUntilStart <= 10
                    ? "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))"
                    : "rgba(15, 23, 42, 0.85)",
                backdropFilter: "blur(25px)",
                textAlign: "center",
                animation:
                  showWarning && timeUntilStart <= 10
                    ? "redAlarm 0.8s ease-in-out infinite, shake 0.5s ease-in-out infinite"
                    : "none",
                boxShadow:
                  timeUntilStart <= 10
                    ? "0 0 60px rgba(239, 68, 68, 0.6)"
                    : "0 0 40px rgba(139, 92, 246, 0.4)",
              }}
            >
              {/* Status Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 24px",
                  borderRadius: "999px",
                  background:
                    timeUntilStart <= 10
                      ? "rgba(239, 68, 68, 0.25)"
                      : "rgba(34, 197, 94, 0.25)",
                  border:
                    timeUntilStart <= 10
                      ? "2px solid rgba(239, 68, 68, 0.6)"
                      : "2px solid rgba(34, 197, 94, 0.5)",
                  marginBottom: "clamp(20px, 4vw, 32px)",
                  boxShadow:
                    timeUntilStart <= 10
                      ? "0 0 25px rgba(239, 68, 68, 0.5)"
                      : "0 0 20px rgba(34, 197, 94, 0.4)",
                }}
              >
                <Shield
                  style={{
                    width: 20,
                    height: 20,
                    color:
                      timeUntilStart <= 10
                        ? "#ef4444"
                        : "#4ade80",
                  }}
                />
                <span
                  style={{
                    fontSize: "clamp(12px, 2.8vw, 14px)",
                    fontWeight: 800,
                    color:
                      timeUntilStart <= 10
                        ? "#fca5a5"
                        : "#4ade80",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {timeUntilStart <= 10
                    ? "🚨 STARTING NOW!"
                    : "✓ You're in the Lobby"}
                </span>
              </div>

              {/* Warning Message */}
              {showWarning && timeUntilStart <= 10 && (
                <div
                  style={{
                    padding: "20px 28px",
                    borderRadius: "20px",
                    background:
                      "linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.2))",
                    border: "3px solid #ef4444",
                    marginBottom: "clamp(20px, 4vw, 32px)",
                    animation: "neonPulse 0.6s ease-in-out infinite",
                    boxShadow: "0 0 40px rgba(239, 68, 68, 0.8)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "clamp(20px, 5vw, 32px)",
                      fontWeight: 900,
                      color: "#fca5a5",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
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
                    timeUntilStart <= 10
                      ? "#fca5a5"
                      : "white",
                }}
              >
                <Clock
                  style={{
                    width: "clamp(28px, 7vw, 36px)",
                    height: "clamp(28px, 7vw, 36px)",
                    color:
                      timeUntilStart <= 10
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
                    timeUntilStart <= 10
                      ? "linear-gradient(135deg, #ef4444, #dc2626)"
                      : "linear-gradient(135deg, #a78bfa, #f0abfc)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "clamp(24px, 5vw, 40px)",
                  fontFamily: "monospace",
                  textShadow:
                    timeUntilStart <= 10
                      ? "0 0 50px rgba(239, 68, 68, 0.8)"
                      : "0 0 50px rgba(167, 139, 250, 0.6)",
                  animation:
                    timeUntilStart <= 10
                      ? "warningPulse 0.4s ease-in-out infinite"
                      : "none",
                  letterSpacing: "0.05em",
                }}
              >
                {formattedCountdown}
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: "100%",
                  height: "14px",
                  borderRadius: "999px",
                  background: "rgba(30, 41, 59, 0.9)",
                  overflow: "hidden",
                  marginBottom: "clamp(24px, 5vw, 40px)",
                  border:
                    timeUntilStart <= 10
                      ? "2px solid rgba(239, 68, 68, 0.5)"
                      : "2px solid rgba(139, 92, 246, 0.4)",
                  boxShadow:
                    timeUntilStart <= 10
                      ? "0 0 20px rgba(239, 68, 68, 0.5), inset 0 0 10px rgba(239, 68, 68, 0.3)"
                      : "0 0 15px rgba(139, 92, 246, 0.4)",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background:
                      timeUntilStart <= 10
                        ? "linear-gradient(90deg, #ef4444, #dc2626)"
                        : "linear-gradient(90deg, #7c3aed, #d946ef)",
                    borderRadius: "999px",
                    transition: "width 1s linear",
                    boxShadow:
                      timeUntilStart <= 10
                        ? "0 0 25px rgba(239, 68, 68, 1)"
                        : "0 0 25px rgba(139, 92, 246, 0.9)",
                  }}
                />
              </div>

              {/* Info Message */}
              <p
                style={{
                  fontSize: "clamp(14px, 3.2vw, 17px)",
                  color:
                    timeUntilStart <= 10
                      ? "#fca5a5"
                      : "#cbd5e1",
                  marginBottom: "clamp(28px, 6vw, 40px)",
                  lineHeight: 1.7,
                  fontWeight: 600,
                }}
              >
                {timeUntilStart <= 10
                  ? "🔥 Get ready! You'll be automatically entered when the countdown ends!"
                  : "You're in. Get ready!"}
              </p>

              {/* Quiz Info Grid - 3 Cards Centered */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "clamp(14px, 3.5vw, 20px)",
                  maxWidth: "900px",
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    padding: "clamp(14px, 3.5vw, 20px)",
                    borderRadius: "16px",
                    background: "rgba(139, 92, 246, 0.15)",
                    border: "2px solid rgba(139, 92, 246, 0.3)",
                    boxShadow: "0 0 15px rgba(139, 92, 246, 0.2)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(11px, 2.3vw, 13px)",
                      color: "#94a3b8",
                      marginBottom: "6px",
                      fontWeight: 600,
                    }}
                  >
                    Format
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(16px, 3.5vw, 20px)",
                      fontWeight: 800,
                      color: "#c4b5fd",
                    }}
                  >
                    Multiple Choice
                  </div>
                </div>
                <div
                  style={{
                    padding: "clamp(14px, 3.5vw, 20px)",
                    borderRadius: "16px",
                    background: "rgba(236, 72, 153, 0.15)",
                    border: "2px solid rgba(236, 72, 153, 0.3)",
                    boxShadow: "0 0 15px rgba(236, 72, 153, 0.2)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(11px, 2.3vw, 13px)",
                      color: "#94a3b8",
                      marginBottom: "6px",
                      fontWeight: 600,
                    }}
                  >
                    Time Limit
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(16px, 3.5vw, 20px)",
                      fontWeight: 800,
                      color: "#f9a8d4",
                    }}
                  >
                    6 seconds
                  </div>
                </div>
                <div
                  style={{
                    padding: "clamp(14px, 3.5vw, 20px)",
                    borderRadius: "16px",
                    background: "rgba(34, 197, 94, 0.15)",
                    border: "2px solid rgba(34, 197, 94, 0.3)",
                    boxShadow: "0 0 15px rgba(34, 197, 94, 0.2)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(11px, 2.3vw, 13px)",
                      color: "#94a3b8",
                      marginBottom: "6px",
                      fontWeight: 600,
                    }}
                  >
                    Points
                  </div>
                  <div
                    style={{
                      fontSize: "clamp(16px, 3.5vw, 20px)",
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
                  padding: "clamp(14px, 3.5vw, 20px)",
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
                  💡 <strong style={{ color: "white" }}>Pro Tip:</strong> In a tie, the
                  fastest correct responder wins the monthly prize!
                </div>
              </div>
            </div>

            {/* Players Section - 25% Smaller */}
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
                  {Math.max(66, players.length)}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(9px, 1.9vw, 12px)",
                  maxHeight: "412px",
                  overflowY: "auto",
                  paddingRight: "8px",
                }}
              >
                {players.length > 0 ? (
                  players.map((player, idx) => (
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
                        e.currentTarget.style.transform = "translateX(8px)";
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
                                {player.streak}
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
                          🏆 {player.total_score.toLocaleString()} points
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

              {/* Total Players Info */}
              <div
                style={{
                  marginTop: "clamp(15px, 3.4vw, 21px)",
                  padding: "clamp(12px, 3vw, 16px)",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(217, 70, 239, 0.1))",
                  border: "2px solid rgba(139, 92, 246, 0.3)",
                  textAlign: "center",
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.25)",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(12px, 2.4vw, 14px)",
                    color: "#cbd5e1",
                    fontWeight: 600,
                  }}
                >
                  🌍{" "}
                  <strong style={{ color: "#c4b5fd", fontWeight: 800 }}>
                    {Math.max(66, totalPlayers).toLocaleString()}
                  </strong>{" "}
                  players in this round
                </div>
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
          .hide-on-small {
            display: none !important;
          }

          header > div {
            position: relative !important;
          }
        }

        @media (max-width: 899px) {
          .hide-mobile {
            display: none !important;
          }
        }

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.7);
          borderRadius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.7),
            rgba(217, 70, 239, 0.5)
          );
          borderRadius: 10px;
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
