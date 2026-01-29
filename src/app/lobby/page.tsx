"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  Users,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowLeft,
  Trophy,
  Globe,
  Play,
  Flame,
  User,
  BarChart3,
  ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import Footer from "@/components/Footer";

// ============================================
// CANONICAL CONSTANTS
// ============================================
const BLOCK_REASONS = {
  NOT_AUTHENTICATED: "not_authenticated",
  NO_CREDITS: "no_credits",
  NOT_AGE_VERIFIED: "not_age_verified",
  ALREADY_JOINED: "already_joined",
} as const;

const PAGE_TYPE = "lobby" as const;
const URGENT_THRESHOLD = 30; // seconds

// ============================================
// TYPES
// ============================================
interface RoundInfo {
  round_id: bigint;
  status: "scheduled" | "live";
  scheduled_start: string;
  started_at: string | null;
}

interface UserLobbyState {
  live_credits: number;
  age_verified: boolean;
  already_joined: boolean;
}

interface RecentPlayer {
  user_id: string;
  full_name: string;
  joined_at: string;
}

interface CanonicalLobbyState {
  // Auth
  isAuthenticated: boolean;
  userId: string | null;

  // Round info
  roundId: bigint | null;
  roundStatus: "scheduled" | "live" | null;
  
  // Countdown
  secondsToStart: number;
  isUrgent: boolean;
  
  // User state
  liveCredits: number;
  ageVerified: boolean;
  userJoined: boolean;
  canJoin: boolean;
  joinBlockReason: string | null;
  
  // Participants
  participantsCount: number;
  spectatorsCount: number;
  totalRange: string;
  recentPlayers: RecentPlayer[];
  
  // Redirects
  shouldRedirectToQuiz: boolean;
}

// ============================================
// CANONICAL LOBBY STATE HOOK
// ============================================
function useCanonicalLobbyState() {
  const [state, setState] = useState<CanonicalLobbyState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadState = useCallback(async (): Promise<CanonicalLobbyState | null> => {
    try {
      // A) Get auth user
      const { data: { user } } = await supabase.auth.getUser();
      const isAuthenticated = !!user;
      const userId = user?.id || null;

      if (!isAuthenticated) {
        setHasError(true);
        return null;
      }

      // B) Get active round
      const { data: roundData, error: roundError } = await supabase
        .rpc("get_active_round")
        .single();

      if (roundError || !roundData) {
        console.error("[Lobby] No active round found");
        setHasError(true);
        return null;
      }

      const round = roundData as RoundInfo;
      const roundId = round.round_id;
      const roundStatus = round.status;

      // C) Get countdown
      const { data: countdown } = await supabase.rpc("get_round_countdown", {
        p_round_id: roundId,
      });

      const secondsToStart = Math.max(0, countdown || 0);
      const isUrgent = secondsToStart <= URGENT_THRESHOLD && secondsToStart > 0;

      // D) Get participants count
      const { data: participantsCount } = await supabase.rpc(
        "count_round_participants",
        {
          p_round_id: roundId,
          p_source: "live",
        }
      );

      // E) Get spectators count (presence)
      const { data: spectatorsCount } = await supabase.rpc("get_presence_count", {
        p_page_type: PAGE_TYPE,
        p_round_id: roundId,
      });

      // F) Calculate total range
      const totalActive = (participantsCount || 0) + (spectatorsCount || 0);
      const rangeMin = Math.floor(totalActive / 10) * 10;
      const rangeMax = rangeMin + 50;
      const totalRange = `${rangeMin}-${rangeMax}`;

      // G) Get recent players
      const { data: recentPlayers } = await supabase.rpc("get_recent_players", {
        p_round_id: roundId,
      });

      // H) Get user state
      const { data: userStateData } = await supabase
        .rpc("get_user_lobby_state", {
          p_round_id: roundId,
        })
        .single();

      const userState = userStateData as UserLobbyState | null;
      const liveCredits = userState?.live_credits || 0;
      const ageVerified = userState?.age_verified || false;
      const userJoined = userState?.already_joined || false;

      // I) Determine join permissions
      let canJoin = false;
      let joinBlockReason: string | null = null;

      if (userJoined) {
        joinBlockReason = BLOCK_REASONS.ALREADY_JOINED;
      } else if (!ageVerified) {
        joinBlockReason = BLOCK_REASONS.NOT_AGE_VERIFIED;
      } else if (liveCredits <= 0) {
        joinBlockReason = BLOCK_REASONS.NO_CREDITS;
      } else if (roundStatus === "live") {
        joinBlockReason = "round_already_started";
      } else {
        canJoin = true;
      }

      // J) Check if should redirect to quiz
      const shouldRedirectToQuiz = roundStatus === "live" && userJoined;

      const canonicalState: CanonicalLobbyState = {
        isAuthenticated,
        userId,
        roundId,
        roundStatus,
        secondsToStart,
        isUrgent,
        liveCredits,
        ageVerified,
        userJoined,
        canJoin,
        joinBlockReason,
        participantsCount: participantsCount || 0,
        spectatorsCount: spectatorsCount || 0,
        totalRange,
        recentPlayers: (recentPlayers || []) as RecentPlayer[],
        shouldRedirectToQuiz,
      };

      setState(canonicalState);
      setHasError(false);
      return canonicalState;
    } catch (err) {
      console.error("[CanonicalLobby] Error loading state:", err);
      setHasError(true);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 5000); // Canonical: 5 seconds
    return () => clearInterval(interval);
  }, [loadState]);

  return { state, isLoading, hasError, refresh: loadState };
}

// ============================================
// PRESENCE HOOK
// ============================================
function usePresence(pageType: string, roundId: bigint | null) {
  const sessionIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!roundId) return;

    if (!sessionIdRef.current) {
      const stored = sessionStorage.getItem("presence_session_id");
      if (stored) {
        sessionIdRef.current = stored;
      } else {
        sessionIdRef.current = crypto.randomUUID();
        sessionStorage.setItem("presence_session_id", sessionIdRef.current);
      }
    }

    const sendHeartbeat = async () => {
      try {
        await supabase.rpc("update_presence", {
          p_session_id: sessionIdRef.current,
          p_page_type: pageType,
          p_round_id: roundId,
        });
      } catch (err) {
        console.error("Presence heartbeat failed:", err);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 20000); // Canonical: 20 seconds

    return () => clearInterval(interval);
  }, [pageType, roundId]);
}

// ============================================
// DETERMINISTIC AUDIO CONTROLLER
// ============================================
function useAudioController(isUrgent: boolean, shouldRedirect: boolean) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const beepRef = useRef<HTMLAudioElement | null>(null);
  const hasInteractedRef = useRef(false);
  const lastAlarmPlayedRef = useRef(false);
  const lastBeepPlayedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFirstInteraction = () => {
      if (hasInteractedRef.current) return;
      hasInteractedRef.current = true;

      if (!audioRef.current) {
        audioRef.current = new Audio("/audio/vibraxx.mp3");
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
      }

      if (!alarmRef.current) {
        alarmRef.current = new Audio("/audio/alarm.mp3");
        alarmRef.current.volume = 0.6;
      }

      if (!beepRef.current) {
        beepRef.current = new Audio("/audio/beep.mp3");
        beepRef.current.volume = 0.5;
      }

      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    };

    document.addEventListener("click", handleFirstInteraction, { once: true });
    return () => document.removeEventListener("click", handleFirstInteraction);
  }, []);

  useEffect(() => {
    if (!hasInteractedRef.current) return;

    if (isUrgent && !lastAlarmPlayedRef.current) {
      alarmRef.current?.play().catch(() => {});
      lastAlarmPlayedRef.current = true;
    } else if (!isUrgent) {
      lastAlarmPlayedRef.current = false;
    }
  }, [isUrgent]);

  useEffect(() => {
    if (!hasInteractedRef.current) return;

    if (shouldRedirect && !lastBeepPlayedRef.current) {
      beepRef.current?.play().catch(() => {});
      lastBeepPlayedRef.current = true;
    }
  }, [shouldRedirect]);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  return { isPlaying, toggleMusic };
}

// ============================================
// UI COMPONENTS
// ============================================
const PlayerCard = memo(
  ({ player, index }: { player: RecentPlayer; index: number }) => (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        background: "rgba(139, 92, 246, 0.05)",
        border: "1px solid rgba(139, 92, 246, 0.2)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        animation: `slideIn 0.3s ease-out ${index * 0.05}s backwards`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7c3aed, #d946ef)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {player.full_name.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#ffffff",
            marginBottom: 2,
          }}
        >
          {player.full_name}
        </div>
        <div style={{ fontSize: 11, color: "#6b7280" }}>
          Joined {new Date(player.joined_at).toLocaleTimeString()}
        </div>
      </div>
      <Trophy style={{ width: 18, height: 18, color: "#fbbf24" }} />
    </div>
  )
);
PlayerCard.displayName = "PlayerCard";

// ============================================
// MAIN COMPONENT
// ============================================
export default function LobbyPage() {
  const router = useRouter();
  const { state, isLoading, hasError, refresh } = useCanonicalLobbyState();
  usePresence(PAGE_TYPE, state?.roundId || null);

  const { isPlaying, toggleMusic } = useAudioController(
    state?.isUrgent || false,
    state?.shouldRedirectToQuiz || false
  );

  const [countdownSeconds, setCountdownSeconds] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (!state) return;
    setCountdownSeconds(state.secondsToStart);

    const interval = setInterval(() => {
      setCountdownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [state?.secondsToStart]);

  // Auto-redirect when quiz starts
  useEffect(() => {
    if (state?.shouldRedirectToQuiz) {
      setTimeout(() => router.push("/quiz"), 2000);
    }
  }, [state?.shouldRedirectToQuiz, router]);

  const handleJoinRound = useCallback(async () => {
    if (!state || !state.canJoin) return;

    try {
      const { data, error } = await supabase.rpc("join_live_round", {
        p_round_id: state.roundId,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        alert(result.error || "Failed to join round");
        return;
      }

      await refresh();
    } catch (err) {
      console.error("Join round error:", err);
      alert("Failed to join round. Please try again.");
    }
  }, [state, refresh]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/");
  }, [router]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#ffffff",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          Loading lobby...
        </div>
      </div>
    );
  }

  if (hasError || !state) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          padding: 20,
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#ef4444",
            marginBottom: 16,
          }}
        >
          No Active Round
        </div>
        <div style={{ fontSize: 16, color: "#94a3b8", marginBottom: 32 }}>
          Please wait for the next round to start.
        </div>
        <button
          onClick={() => router.push("/")}
          style={{
            padding: "12px 24px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #7c3aed, #d946ef)",
            color: "white",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Back to Home
        </button>
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

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #ffffff;
          overflow-x: hidden;
        }

        .vx-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .vx-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding: 16px 0;
        }

        .vx-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .vx-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .vx-hide-mobile {
          display: flex;
        }

        @media (max-width: 768px) {
          .vx-header-inner {
            flex-wrap: wrap;
          }

          .vx-header-right {
            width: 100%;
            justify-content: space-between;
          }

          .vx-hide-mobile {
            display: none;
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

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        @keyframes countdownPulse {
          0%,
          100% {
            box-shadow: 0 20px 60px rgba(239, 68, 68, 0.5);
          }
          50% {
            box-shadow: 0 20px 60px rgba(239, 68, 68, 0.8);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>

      <div style={{ minHeight: "100vh", position: "relative" }}>
        <header className="vx-header">
          <div className="vx-container">
            <div className="vx-header-inner">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={() => router.push("/")}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  aria-label="Back to home"
                >
                  <ArrowLeft style={{ width: 18, height: 18 }} />
                </button>

                <Image
                  src="/images/logo.png"
                  alt="VibraXX Logo"
                  width={40}
                  height={40}
                  style={{ borderRadius: 10 }}
                />

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "white",
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}
                  >
                    VibraXX
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "#6b7280",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Live Lobby
                  </div>
                </div>
              </div>

              <div className="vx-header-right">
                <button
                  onClick={toggleMusic}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: isPlaying ? "#22d3ee" : "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  aria-label={isPlaying ? "Mute music" : "Play music"}
                >
                  {isPlaying ? (
                    <Volume2 style={{ width: 18, height: 18 }} />
                  ) : (
                    <VolumeX style={{ width: 18, height: 18 }} />
                  )}
                </button>

                <div
                  className="vx-hide-mobile"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 10,
                    border: "1px solid rgba(251, 191, 36, 0.3)",
                    background: "rgba(251, 191, 36, 0.1)",
                    color: "#fbbf24",
                    fontSize: 13,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Sparkles style={{ width: 14, height: 14 }} />
                  {state.liveCredits} Rounds
                </div>

                <button
                  onClick={() => router.push("/profile")}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#94a3b8",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <User style={{ width: 16, height: 16 }} />
                  <span className="vx-hide-mobile">Profile</span>
                </button>

                <button
                  onClick={() => router.push("/leaderboard")}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#94a3b8",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <BarChart3 style={{ width: 16, height: 16 }} />
                  <span className="vx-hide-mobile">Leaderboard</span>
                </button>

                <button
                  onClick={() => router.push("/buy")}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg, #7c3aed, #d946ef)",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    boxShadow: "0 8px 16px rgba(124, 58, 237, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <ShoppingCart style={{ width: 16, height: 16 }} />
                  <span className="vx-hide-mobile">Buy</span>
                </button>

                <button
                  onClick={handleSignOut}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 10,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#94a3b8",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  className="vx-hide-mobile"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main style={{ padding: "48px 0", position: "relative", zIndex: 10 }}>
          <div className="vx-container">
            {/* Hero Section */}
            <div
              style={{
                textAlign: "center",
                marginBottom: 48,
                animation: "slideIn 0.6s ease-out",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 20px",
                  borderRadius: 9999,
                  border: "2px solid rgba(251, 191, 36, 0.4)",
                  background:
                    "linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))",
                  color: "#fbbf24",
                  fontSize: 12,
                  marginBottom: 20,
                  backdropFilter: "blur(10px)",
                  fontWeight: 700,
                  boxShadow:
                    "0 0 20px rgba(251, 191, 36, 0.3), inset 0 0 20px rgba(251, 191, 36, 0.1)",
                }}
              >
                <Globe style={{ width: 16, height: 16 }} />
                Global Live Arena
              </div>

              <h1
                style={{
                  fontSize: "clamp(32px, 7vw, 52px)",
                  fontWeight: 800,
                  lineHeight: 1.2,
                  marginBottom: 20,
                  letterSpacing: "-0.03em",
                  color: "white",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    background:
                      "linear-gradient(90deg, #7c3aed, #22d3ee, #f97316, #d946ef, #7c3aed)",
                    backgroundSize: "250% 100%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    animation: "shimmer 4s linear infinite",
                  }}
                >
                  Prepare for Battle
                </span>
              </h1>

              <p
                style={{
                  fontSize: "clamp(15px, 3.5vw, 18px)",
                  color: "#cbd5e1",
                  maxWidth: 600,
                  margin: "0 auto 16px",
                  lineHeight: 1.7,
                  fontWeight: 500,
                }}
              >
                Challenge yourself. Challenge the world.
              </p>

              <p
                style={{
                  fontSize: 14,
                  color: "#94a3b8",
                  maxWidth: 600,
                  margin: "0 auto",
                  lineHeight: 1.6,
                }}
              >
                {state.userJoined
                  ? "You're locked in! The quiz starts when the countdown ends."
                  : "Join now to compete for prizes and glory."}
              </p>
            </div>

            {/* Premium Countdown Panel */}
            <div
              style={{
                margin: "32px auto 48px",
                maxWidth: 520,
                padding: state.isUrgent ? "24px 32px 32px" : "32px",
                borderRadius: 24,
                background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
                border: state.isUrgent
                  ? "3px solid rgba(239, 68, 68, 0.6)"
                  : "2px solid rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(20px)",
                boxShadow: state.isUrgent
                  ? "0 20px 60px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3)"
                  : "0 12px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 2px 0 rgba(255, 255, 255, 0.08)",
                position: "relative",
                overflow: "hidden",
                animation: state.isUrgent
                  ? "countdownPulse 1s ease-in-out infinite"
                  : "slideIn 0.6s ease-out 0.2s backwards",
              }}
            >
              {state.isUrgent && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: "10px",
                    background: "rgba(239, 68, 68, 0.25)",
                    borderBottom: "1px solid rgba(239, 68, 68, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#ef4444",
                    animation: "pulse-glow 1s ease-in-out infinite",
                  }}
                >
                  <Flame style={{ width: 16, height: 16 }} />
                  QUIZ STARTING SOON!
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: "#6b7280",
                    textAlign: "center",
                  }}
                >
                  {state.userJoined ? "Quiz Starts In" : "Join Before"}
                </div>

                <div
                  style={{
                    fontSize: "clamp(56px, 15vw, 80px)",
                    fontWeight: 900,
                    background: state.isUrgent
                      ? "linear-gradient(135deg, #ef4444, #dc2626)"
                      : "linear-gradient(135deg, #7c3aed, #22d3ee)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textAlign: "center",
                    letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                    filter: state.isUrgent
                      ? "drop-shadow(0 0 20px rgba(239, 68, 68, 0.6))"
                      : "drop-shadow(0 0 20px rgba(124, 58, 237, 0.5))",
                  }}
                >
                  {formatTime(countdownSeconds)}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "#6b7280",
                    fontWeight: 500,
                  }}
                >
                  <Clock
                    style={{
                      width: 16,
                      height: 16,
                      color: state.isUrgent ? "#ef4444" : "#8b5cf6",
                    }}
                  />
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>
                    {state.spectatorsCount}
                  </span>
                  <span>watching live</span>
                </div>
              </div>
            </div>

            {/* Join Button or Status */}
            {!state.userJoined ? (
              <div
                style={{
                  marginBottom: 48,
                  textAlign: "center",
                  animation: "slideIn 0.6s ease-out 0.3s backwards",
                }}
              >
                <button
                  onClick={handleJoinRound}
                  disabled={!state.canJoin}
                  style={{
                    position: "relative",
                    padding: "18px 48px",
                    borderRadius: 14,
                    border: "none",
                    cursor: state.canJoin ? "pointer" : "not-allowed",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    fontWeight: 700,
                    fontSize: 18,
                    overflow: "hidden",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    opacity: state.canJoin ? 1 : 0.5,
                    boxShadow: state.canJoin
                      ? "0 20px 40px -16px rgba(139, 92, 246, 0.6)"
                      : "none",
                  }}
                  onMouseEnter={(e) =>
                    state.canJoin && (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to right, #7c3aed, #d946ef)",
                    }}
                  />
                  <Play
                    style={{
                      position: "relative",
                      zIndex: 10,
                      width: 20,
                      height: 20,
                      color: "white",
                    }}
                  />
                  <span style={{ position: "relative", zIndex: 10, color: "white" }}>
                    {state.joinBlockReason === BLOCK_REASONS.NO_CREDITS
                      ? "No Rounds Left"
                      : "Join Arena"}
                  </span>
                </button>
                {state.joinBlockReason === BLOCK_REASONS.NO_CREDITS && (
                  <div style={{ marginTop: 16, fontSize: 14, color: "#94a3b8" }}>
                    <button
                      onClick={() => router.push("/buy")}
                      style={{
                        color: "#fbbf24",
                        textDecoration: "underline",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      Buy more rounds
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  marginBottom: 48,
                  padding: "20px 32px",
                  borderRadius: 16,
                  background: "rgba(34, 197, 94, 0.15)",
                  border: "2px solid rgba(34, 197, 94, 0.4)",
                  textAlign: "center",
                  boxShadow: "0 8px 24px rgba(34, 197, 94, 0.2)",
                  animation: "slideIn 0.6s ease-out 0.3s backwards",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#22c55e",
                  }}
                >
                  <Trophy style={{ width: 22, height: 22 }} />
                  YOU'RE IN! GET READY...
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 20,
                marginBottom: 48,
                animation: "slideIn 0.6s ease-out 0.4s backwards",
              }}
            >
              <div
                style={{
                  padding: 24,
                  borderRadius: 16,
                  background:
                    "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  textAlign: "center",
                  transition: "all 0.3s",
                }}
              >
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: "white",
                    marginBottom: 8,
                  }}
                >
                  {state.participantsCount}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Joined
                </div>
              </div>
              <div
                style={{
                  padding: 24,
                  borderRadius: 16,
                  background:
                    "linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(34, 211, 238, 0.05))",
                  border: "1px solid rgba(34, 211, 238, 0.3)",
                  textAlign: "center",
                  transition: "all 0.3s",
                }}
              >
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: "white",
                    marginBottom: 8,
                  }}
                >
                  {state.spectatorsCount}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Watching
                </div>
              </div>
              <div
                style={{
                  padding: 24,
                  borderRadius: 16,
                  background:
                    "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  textAlign: "center",
                  transition: "all 0.3s",
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: "white",
                    marginBottom: 8,
                  }}
                >
                  {state.totalRange}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Active Range
                </div>
              </div>
            </div>

            {/* Recent Players */}
            <div
              style={{
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                borderRadius: 24,
                padding: 32,
                border: "1px solid rgba(139, 92, 246, 0.3)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                animation: "slideIn 0.6s ease-out 0.5s backwards",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <Users style={{ width: 24, height: 24, color: "#8b5cf6" }} />
                <h3 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "white" }}>
                  Recent Joins
                </h3>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  maxHeight: 400,
                  overflowY: "auto",
                }}
              >
                {state.recentPlayers.length === 0 ? (
                  <div
                    style={{
                      padding: 48,
                      textAlign: "center",
                      color: "#6b7280",
                      fontSize: 14,
                    }}
                  >
                    Waiting for players to join...
                  </div>
                ) : (
                  state.recentPlayers.map((player, idx) => (
                    <PlayerCard key={player.user_id} player={player} index={idx} />
                  ))
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
