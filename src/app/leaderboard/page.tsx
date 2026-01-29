"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Crown,
  Trophy,
  Star,
  Target,
  Clock,
  Users,
  Gift,
  Sparkles,
  Volume2,
  VolumeX,
  ChevronRight,
  Home,
  User,
  BarChart3,
  ShoppingCart,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Footer from "@/components/Footer";

// ============================================
// CANONICAL CONSTANTS
// ============================================
const TIERS = {
  BRONZE: {
    min: 0,
    max: 500,
    name: "Bronze",
    icon: "🥉",
    color: "#cd7f32",
    gradient: "linear-gradient(135deg, #cd7f32, #b8651f)",
  },
  SILVER: {
    min: 500,
    max: 2000,
    name: "Silver",
    icon: "🥈",
    color: "#c0c0c0",
    gradient: "linear-gradient(135deg, #c0c0c0, #a8a8a8)",
  },
  GOLD: {
    min: 2000,
    max: 5000,
    name: "Gold",
    icon: "🥇",
    color: "#ffd700",
    gradient: "linear-gradient(135deg, #ffd700, #ffed4e)",
  },
  DIAMOND: {
    min: 5000,
    max: Infinity,
    name: "Diamond",
    icon: "💎",
    color: "#b9f2ff",
    gradient: "linear-gradient(135deg, #b9f2ff, #7dd3fc)",
  },
};

const PRIZE_UNLOCK_THRESHOLD = 3000;
const PAGE_TYPE = "leaderboard" as const;

// ============================================
// TYPES
// ============================================
interface CanonicalPlayer {
  user_id: string;
  rank: number;
  full_name: string;
  total_score: number;
  correct_answers: number;
  wrong_answers: number;
  rounds_played: number;
  accuracy: number;
}

interface LeaderboardStats {
  total_players: number;
  top_score: number;
  avg_accuracy: number;
  total_rounds_played: number;
  reset_at: string;
}

interface LeaderboardSnapshot {
  players: CanonicalPlayer[];
  stats: LeaderboardStats;
}

interface EnrichedPlayer extends CanonicalPlayer {
  tier: typeof TIERS[keyof typeof TIERS];
}

// ============================================
// PRESENCE HOOK
// ============================================
function usePresence(pageType: string) {
  const sessionIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") return;

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
          p_round_id: null,
        });
      } catch (err) {
        console.error("Presence heartbeat failed:", err);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 20000); // Canonical: 20 seconds

    return () => clearInterval(interval);
  }, [pageType]);
}

// ============================================
// CANONICAL LEADERBOARD HOOK
// ============================================
function useCanonicalLeaderboard(scope: "weekly" | "monthly") {
  const [snapshot, setSnapshot] = useState<LeaderboardSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.rpc("get_leaderboard_snapshot", {
        p_scope: scope,
      });

      if (error) {
        console.error("[Leaderboard] RPC error:", error);
        setHasError(true);
        return;
      }

      if (data) {
        setSnapshot(data as LeaderboardSnapshot);
        setHasError(false);
      }
    } catch (err) {
      console.error("[Leaderboard] Error:", err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [loadLeaderboard]);

  return { snapshot, isLoading, hasError, refresh: loadLeaderboard };
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getTierInfo(totalScore: number): typeof TIERS[keyof typeof TIERS] {
  if (totalScore >= TIERS.DIAMOND.min) return TIERS.DIAMOND;
  if (totalScore >= TIERS.GOLD.min) return TIERS.GOLD;
  if (totalScore >= TIERS.SILVER.min) return TIERS.SILVER;
  return TIERS.BRONZE;
}

function calculateTimeRemaining(resetAt: string): {
  days: number;
  hours: number;
  minutes: number;
} {
  const now = Date.now();
  const target = new Date(resetAt).getTime();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function LeaderboardPage() {
  const router = useRouter();

  // Core State
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const { snapshot, isLoading, hasError } = useCanonicalLeaderboard(activeTab);
  usePresence(PAGE_TYPE);

  // Music State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Time countdown state
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0 });

  // SEO
  useEffect(() => {
    document.title = `${
      activeTab === "weekly" ? "Weekly" : "Monthly"
    } Leaderboard - VibraXX`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        `Compete for £1,000 monthly prize. View ${activeTab} VibraXX leaderboard rankings in UK's premier skill-based quiz competition.`
      );
    }
  }, [activeTab]);

  // Background Music Setup
  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio("/audio/vibraxx.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Auto-play on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
          setIsMusicPlaying(true);
        }
      }
    };

    document.addEventListener("click", handleFirstInteraction, { once: true });
    return () => document.removeEventListener("click", handleFirstInteraction);
  }, [hasInteracted]);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;

    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsMusicPlaying(true);
    }
  }, [isMusicPlaying]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/");
  }, [router]);

  // Time remaining countdown (based on backend reset_at)
  useEffect(() => {
    if (!snapshot?.stats.reset_at) return;

    const updateCountdown = () => {
      setTimeRemaining(calculateTimeRemaining(snapshot.stats.reset_at));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [snapshot?.stats.reset_at]);

  // Enrich players with tier info (UI-only decoration)
  const enrichedPlayers: EnrichedPlayer[] = useMemo(() => {
    if (!snapshot?.players) return [];

    return snapshot.players.map((player) => ({
      ...player,
      tier: getTierInfo(player.total_score),
    }));
  }, [snapshot?.players]);

  const top3 = enrichedPlayers.slice(0, 3);
  const restPlayers = enrichedPlayers.slice(3);

  // Prize unlock progress
  const prizeUnlockProgress = snapshot?.stats.total_rounds_played
    ? Math.min(
        Math.round((snapshot.stats.total_rounds_played / PRIZE_UNLOCK_THRESHOLD) * 100),
        100
      )
    : 0;

  const isPrizeUnlocked = (snapshot?.stats.total_rounds_played || 0) >= PRIZE_UNLOCK_THRESHOLD;

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
          Loading leaderboard...
        </div>
      </div>
    );
  }

  if (hasError || !snapshot) {
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
          Failed to Load Leaderboard
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
            display: none !important;
          }
        }

        .animate-slide-up {
          opacity: 0;
          animation: slideUp 0.6s ease-out forwards;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

        .mobile-hide {
          display: inline;
        }

        @media (max-width: 640px) {
          .mobile-hide {
            display: none;
          }
        }
      `}</style>

      <div style={{ minHeight: "100vh", position: "relative" }}>
        {/* Header */}
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
                  <Home style={{ width: 18, height: 18 }} />
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
                    Leaderboard
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
                    color: isMusicPlaying ? "#22d3ee" : "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  aria-label={isMusicPlaying ? "Mute music" : "Play music"}
                >
                  {isMusicPlaying ? (
                    <Volume2 style={{ width: 18, height: 18 }} />
                  ) : (
                    <VolumeX style={{ width: 18, height: 18 }} />
                  )}
                </button>

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

        {/* Main Content */}
        <main style={{ padding: "48px 0" }}>
          <div className="vx-container">
            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h1
                style={{
                  fontSize: "clamp(32px, 8vw, 56px)",
                  fontWeight: 900,
                  marginBottom: 16,
                  background: "linear-gradient(90deg, #7c3aed, #22d3ee, #7c3aed)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Global Leaderboard
              </h1>
              <p
                style={{
                  fontSize: "clamp(14px, 3vw, 18px)",
                  color: "#94a3b8",
                  maxWidth: 600,
                  margin: "0 auto",
                }}
              >
                Compete with players worldwide. Climb the ranks. Win prizes.
              </p>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                marginBottom: 32,
              }}
            >
              <button
                onClick={() => setActiveTab("weekly")}
                style={{
                  padding: "12px 32px",
                  borderRadius: 12,
                  border: "none",
                  background:
                    activeTab === "weekly"
                      ? "linear-gradient(135deg, #7c3aed, #d946ef)"
                      : "rgba(255, 255, 255, 0.05)",
                  color: "white",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Weekly
              </button>
              <button
                onClick={() => setActiveTab("monthly")}
                style={{
                  padding: "12px 32px",
                  borderRadius: 12,
                  border: "none",
                  background:
                    activeTab === "monthly"
                      ? "linear-gradient(135deg, #7c3aed, #d946ef)"
                      : "rgba(255, 255, 255, 0.05)",
                  color: "white",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Monthly
              </button>
            </div>

            {/* Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 20,
                marginBottom: 48,
              }}
            >
              <div
                style={{
                  padding: 24,
                  borderRadius: 16,
                  background: "rgba(139, 92, 246, 0.1)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  textAlign: "center",
                }}
              >
                <Users style={{ width: 32, height: 32, color: "#8b5cf6", margin: "0 auto 12px" }} />
                <div style={{ fontSize: 32, fontWeight: 900, color: "white", marginBottom: 4 }}>
                  {snapshot.stats.total_players.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase" }}>
                  Total Players
                </div>
              </div>

              <div
                style={{
                  padding: 24,
                  borderRadius: 16,
                  background: "rgba(34, 211, 238, 0.1)",
                  border: "1px solid rgba(34, 211, 238, 0.3)",
                  textAlign: "center",
                }}
              >
                <Trophy style={{ width: 32, height: 32, color: "#22d3ee", margin: "0 auto 12px" }} />
                <div style={{ fontSize: 32, fontWeight: 900, color: "white", marginBottom: 4 }}>
                  {snapshot.stats.top_score.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase" }}>
                  Top Score
                </div>
              </div>

              <div
                style={{
                  padding: 24,
                  borderRadius: 16,
                  background: "rgba(34, 197, 94, 0.1)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  textAlign: "center",
                }}
              >
                <Target style={{ width: 32, height: 32, color: "#22c55e", margin: "0 auto 12px" }} />
                <div style={{ fontSize: 32, fontWeight: 900, color: "white", marginBottom: 4 }}>
                  {Math.round(snapshot.stats.avg_accuracy)}%
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase" }}>
                  Avg Accuracy
                </div>
              </div>

              <div
                style={{
                  padding: 24,
                  borderRadius: 16,
                  background: "rgba(251, 191, 36, 0.1)",
                  border: "1px solid rgba(251, 191, 36, 0.3)",
                  textAlign: "center",
                }}
              >
                <Clock style={{ width: 32, height: 32, color: "#fbbf24", margin: "0 auto 12px" }} />
                <div style={{ fontSize: 20, fontWeight: 900, color: "white", marginBottom: 4 }}>
                  {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase" }}>
                  Until Reset
                </div>
              </div>
            </div>

            {/* Prize Unlock Progress (Monthly Only) */}
            {activeTab === "monthly" && (
              <div
                style={{
                  padding: 32,
                  borderRadius: 24,
                  background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                  border: `2px solid ${isPrizeUnlocked ? "#22c55e" : "#fbbf24"}`,
                  marginBottom: 48,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <Gift
                    style={{
                      width: 28,
                      height: 28,
                      color: isPrizeUnlocked ? "#22c55e" : "#fbbf24",
                    }}
                  />
                  <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
                    £1,000 Monthly Prize
                  </h3>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: 12,
                    borderRadius: 999,
                    background: "rgba(255, 255, 255, 0.1)",
                    overflow: "hidden",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: `${prizeUnlockProgress}%`,
                      height: "100%",
                      background: isPrizeUnlocked
                        ? "linear-gradient(90deg, #22c55e, #10b981)"
                        : "linear-gradient(90deg, #fbbf24, #f59e0b)",
                      transition: "width 0.3s",
                    }}
                  />
                </div>

                <div style={{ fontSize: 14, color: "#94a3b8" }}>
                  {isPrizeUnlocked ? (
                    <span style={{ color: "#22c55e", fontWeight: 600 }}>
                      ✓ Prize Unlocked! Winner announced at month end.
                    </span>
                  ) : (
                    <>
                      {snapshot.stats.total_rounds_played.toLocaleString()} /{" "}
                      {PRIZE_UNLOCK_THRESHOLD.toLocaleString()} rounds played
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Players List */}
            {enrichedPlayers.length === 0 ? (
              <div
                style={{
                  padding: 64,
                  textAlign: "center",
                  color: "#6b7280",
                  fontSize: 16,
                }}
              >
                No players yet. Be the first to compete!
              </div>
            ) : (
              <>
                {/* Top 3 Podium */}
                {top3.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: 20,
                      marginBottom: 48,
                    }}
                  >
                    {top3.map((player, idx) => (
                      <div
                        key={player.user_id}
                        style={{
                          padding: 32,
                          borderRadius: 24,
                          background: player.tier.gradient,
                          textAlign: "center",
                          position: "relative",
                          boxShadow: `0 12px 40px ${player.tier.color}40`,
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: -16,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 24,
                          }}
                        >
                          {player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : "🥉"}
                        </div>

                        <div style={{ marginTop: 24, marginBottom: 12 }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "white" }}>
                            {player.full_name}
                          </div>
                          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
                            Rank #{player.rank}
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: 36,
                            fontWeight: 900,
                            color: "white",
                            marginBottom: 8,
                          }}
                        >
                          {player.total_score.toLocaleString()}
                        </div>

                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                          {player.accuracy}% accuracy • {player.rounds_played} rounds
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rest of Players */}
                {restPlayers.length > 0 && (
                  <div
                    style={{
                      padding: 32,
                      borderRadius: 24,
                      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 24,
                        fontWeight: 900,
                        marginBottom: 24,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Sparkles style={{ width: 24, height: 24, color: "#a78bfa" }} />
                      Ranked Players
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {restPlayers.map((player, idx) => (
                        <div
                          key={player.user_id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            padding: 16,
                            borderRadius: 14,
                            background: "rgba(139, 92, 246, 0.05)",
                            border: "1px solid rgba(139, 92, 246, 0.2)",
                            transition: "all 0.3s",
                          }}
                        >
                          {/* Rank */}
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 10,
                              background:
                                player.rank <= 10
                                  ? "linear-gradient(135deg, #8b5cf6, #7c3aed)"
                                  : "rgba(139, 92, 246, 0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 16,
                              fontWeight: 900,
                              color: "white",
                              flexShrink: 0,
                            }}
                          >
                            #{player.rank}
                          </div>

                          {/* Player Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 4,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 16,
                                  fontWeight: 800,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {player.full_name}
                              </span>
                              <span style={{ fontSize: 16 }}>{player.tier.icon}</span>
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#64748b",
                                display: "flex",
                                gap: 10,
                              }}
                            >
                              <span style={{ color: "#22c55e" }}>
                                {player.accuracy}% acc
                              </span>
                              <span className="mobile-hide">•</span>
                              <span className="mobile-hide">
                                {player.rounds_played} rounds
                              </span>
                            </div>
                          </div>

                          {/* Score */}
                          <div
                            style={{
                              padding: "12px 20px",
                              borderRadius: 10,
                              background: "rgba(139, 92, 246, 0.15)",
                              border: "1px solid rgba(139, 92, 246, 0.3)",
                              textAlign: "right",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 22,
                                fontWeight: 900,
                                background: "linear-gradient(90deg, #a78bfa, #f0abfc)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                              }}
                            >
                              {player.total_score.toLocaleString()}
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>points</div>
                          </div>

                          <ChevronRight
                            className="mobile-hide"
                            style={{
                              width: 20,
                              height: 20,
                              color: "#64748b",
                              flexShrink: 0,
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
