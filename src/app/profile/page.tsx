"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import Footer from "@/components/Footer";
import {
  User,
  Mail,
  Trophy,
  Target,
  Flame,
  TrendingUp,
  Calendar,
  Award,
  Star,
  Crown,
  LogOut,
  Edit,
  Save,
  X,
  BarChart3,
  Clock,
  Zap,
  Shield,
  Gift,
  ChevronRight,
  Activity,
  Sparkles,
  ShoppingCart,
  Medal,
  Rocket,
  Brain,
  Volume2,
  VolumeX,
  Home,
  TrendingDown,
  CheckCircle,
} from "lucide-react";

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

const PAGE_TYPE = "profile" as const;

// ============================================
// CANONICAL TYPES
// ============================================
interface ProfileInfo {
  user_id: string;
  full_name: string;
  country_code: string | null;
  age_verified: boolean;
  created_at: string;
}

interface Credits {
  live_credits: number;
  free_quiz_used: boolean;
  free_quiz_last_used: string | null;
}

interface Stats {
  total_score: number;
  rounds_played: number;
  correct_answers: number;
  wrong_answers: number;
  total_questions: number;
  accuracy_percentage: number;
}

interface PersonalBests {
  highest_score: number;
  best_accuracy: number;
  perfect_rounds: number;
  total_rounds: number;
}

interface Rankings {
  weekly_rank: number | null;
  monthly_rank: number | null;
}

interface RoundHistory {
  round_id: number;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  joined_at: string;
  source: string;
}

interface ChartDataPoint {
  date: string;
  score: number;
}

interface CanonicalProfileSnapshot {
  profile: ProfileInfo;
  credits: Credits;
  lifetime_stats: Stats;
  today_stats: Stats;
  week_stats: Stats;
  month_stats: Stats;
  personal_bests: PersonalBests;
  rankings: Rankings;
  recent_history: RoundHistory[];
  chart_data: ChartDataPoint[];
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;  // String icon name from backend
  unlocked: boolean;
  progress: number;
  target: number;
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
    const interval = setInterval(sendHeartbeat, 30000); // 30 seconds (reduced spam)

    return () => clearInterval(interval);
  }, [pageType]);
}

// ============================================
// CANONICAL PROFILE HOOK
// ============================================
function useCanonicalProfile() {
  const [snapshot, setSnapshot] = useState<CanonicalProfileSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.rpc("get_profile_snapshot");

      if (error) {
        console.error("[Profile] RPC error:", error);
        setHasError(true);
        return;
      }

      if (data) {
        setSnapshot(data as CanonicalProfileSnapshot);
        setHasError(false);
      }
    } catch (err) {
      console.error("[Profile] Error:", err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    const interval = setInterval(loadProfile, 30000);
    return () => clearInterval(interval);
  }, [loadProfile]);

  return { snapshot, isLoading, hasError, refresh: loadProfile };
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

// Icon mapping for achievement icons (backend returns string names)
const ACHIEVEMENT_ICONS: Record<string, any> = {
  Trophy,
  Star,
  Target,
  Calendar,
  Crown,
  Medal,
  Brain,
  Rocket,
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

// ============================================
// UI COMPONENTS
// ============================================
const StatCard = ({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
}) => (
  <div
    style={{
      padding: "clamp(16px, 3vw, 24px)",
      borderRadius: 16,
      background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8))",
      border: `1px solid ${color}40`,
      transition: "all 0.3s",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: `${color}20`,
          border: `1px solid ${color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon style={{ width: 20, height: 20, color }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
    <div style={{ fontSize: "clamp(28px, 6vw, 36px)", fontWeight: 900, color: "white", marginBottom: 4 }}>
      {value}
    </div>
    {subtitle && <div style={{ fontSize: 12, color: "#6b7280" }}>{subtitle}</div>}
  </div>
);

const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
  const Icon = ACHIEVEMENT_ICONS[achievement.icon] ?? Trophy;  // Nullish coalescing for safety
  const progress = achievement.progress || 0;
  const target = achievement.target || 1;
  const percentage = Math.min((progress / target) * 100, 100);

  return (
    <div
      style={{
        padding: "clamp(16px, 3vw, 20px)",
        borderRadius: 16,
        background: achievement.unlocked
          ? "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05))"
          : "linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.6))",
        border: achievement.unlocked
          ? "1px solid rgba(34, 197, 94, 0.3)"
          : "1px solid rgba(255, 255, 255, 0.05)",
        opacity: achievement.unlocked ? 1 : 0.7,
        transition: "all 0.3s",
      }}
    >
      <div style={{ display: "flex", alignItems: "start", gap: 12, marginBottom: 12 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: achievement.unlocked
              ? "linear-gradient(135deg, #22c55e, #10b981)"
              : "rgba(255, 255, 255, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon style={{ width: 24, height: 24, color: "white" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "clamp(14px, 3vw, 16px)",
              fontWeight: 700,
              color: "white",
              marginBottom: 4,
            }}
          >
            {achievement.title}
          </div>
          <div style={{ fontSize: "clamp(11px, 2.5vw, 13px)", color: "#94a3b8" }}>
            {achievement.description}
          </div>
        </div>
        {achievement.unlocked && (
          <CheckCircle style={{ width: 20, height: 20, color: "#22c55e", flexShrink: 0 }} />
        )}
      </div>

      {!achievement.unlocked && achievement.target && (
        <div>
          <div
            style={{
              width: "100%",
              height: 8,
              borderRadius: 999,
              background: "rgba(255, 255, 255, 0.05)",
              overflow: "hidden",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: "100%",
                background: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
                transition: "width 0.3s",
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", textAlign: "right" }}>
            {progress} / {target}
          </div>
        </div>
      )}
    </div>
  );
};

const EditProfileModal = ({
  currentName,
  currentCountry,
  onSave,
  onCancel,
  isSaving,
}: {
  currentName: string;
  currentCountry: string | null;
  onSave: (name: string, country: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}) => {
  const [name, setName] = useState(currentName);
  const [country, setCountry] = useState(currentCountry || "");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
        padding: 20,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          borderRadius: 24,
          padding: "clamp(24px, 5vw, 32px)",
          maxWidth: 500,
          width: "100%",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: "clamp(20px, 4vw, 24px)", fontWeight: 800, color: "white" }}>
            Edit Profile
          </h2>
          <button
            onClick={onCancel}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8, display: "block" }}>
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
            }}
            placeholder="Enter your name"
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8, display: "block" }}>
            Country
          </label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
            }}
            placeholder="Country code (e.g., GB)"
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px 24px",
              borderRadius: 12,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#94a3b8",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(name, country)}
            disabled={isSaving || !name.trim()}
            style={{
              flex: 1,
              padding: "12px 24px",
              borderRadius: 12,
              border: "none",
              background: isSaving
                ? "rgba(139, 92, 246, 0.5)"
                : "linear-gradient(135deg, #7c3aed, #d946ef)",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: !name.trim() ? 0.5 : 1,
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProfilePage() {
  const router = useRouter();
  const { snapshot, isLoading, hasError, refresh } = useCanonicalProfile();
  usePresence(PAGE_TYPE);

  // UI State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Music State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // SEO
  useEffect(() => {
    document.title = "My Profile - VibraXX";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "View your VibraXX profile, stats, rankings, and achievements."
      );
    }
  }, []);

  // Music Setup
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

  const handleSaveProfile = useCallback(
    async (name: string, country: string) => {
      setIsSaving(true);

      try {
        // Update name
        const { data: nameResult } = await supabase.rpc("update_profile_name", {
          p_full_name: name,
        });

        if (nameResult && !nameResult.success) {
          alert(nameResult.error || "Failed to update name");
          setIsSaving(false);
          return;
        }

        // Update country
        const { data: countryResult } = await supabase.rpc("update_profile_country", {
          p_country_code: country,
        });

        if (countryResult && !countryResult.success) {
          alert(countryResult.error || "Failed to update country");
          setIsSaving(false);
          return;
        }

        await refresh();
        setIsEditing(false);
      } catch (err) {
        console.error("Profile update error:", err);
        alert("Failed to update profile");
      } finally {
        setIsSaving(false);
      }
    },
    [refresh]
  );

  // Derived data
  const tier = useMemo(
    () => (snapshot ? getTierInfo(snapshot.lifetime_stats.total_score) : TIERS.BRONZE),
    [snapshot?.lifetime_stats.total_score]
  );

  // Achievements come from backend now
  const achievements = snapshot?.achievements || [];

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

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
        <div style={{ fontSize: 18, fontWeight: 600, color: "#ffffff", animation: "pulse 2s ease-in-out infinite" }}>
          Loading profile...
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
        <div style={{ fontSize: 24, fontWeight: 700, color: "#ef4444", marginBottom: 16 }}>
          Failed to Load Profile
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

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
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
                    My Profile
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
                  {snapshot.credits.live_credits} Rounds
                </div>

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

        {/* Main Content */}
        <main style={{ padding: "clamp(32px, 5vw, 48px) 0" }}>
          <div className="vx-container">
            {/* Profile Header */}
            <div
              style={{
                padding: "clamp(24px, 5vw, 32px)",
                borderRadius: 24,
                background: tier.gradient,
                marginBottom: 32,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  fontSize: "clamp(80px, 15vw, 120px)",
                  opacity: 0.1,
                }}
              >
                {tier.icon}
              </div>

              <div
                style={{
                  position: "relative",
                  zIndex: 10,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <h1
                        style={{
                          fontSize: "clamp(24px, 5vw, 36px)",
                          fontWeight: 900,
                          color: "white",
                        }}
                      >
                        {snapshot.profile.full_name}
                      </h1>
                      <span style={{ fontSize: "clamp(24px, 5vw, 32px)" }}>{tier.icon}</span>
                    </div>
                    <div style={{ fontSize: "clamp(12px, 2.5vw, 14px)", color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>
                      {tier.name} Tier • Member since {formatDate(snapshot.profile.created_at)}
                    </div>
                    {snapshot.profile.country_code && (
                      <div style={{ fontSize: "clamp(12px, 2.5vw, 14px)", color: "rgba(255,255,255,0.7)" }}>
                        📍 {snapshot.profile.country_code}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 12,
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      background: "rgba(255, 255, 255, 0.15)",
                      color: "white",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    <Edit style={{ width: 16, height: 16 }} />
                    <span className="vx-hide-mobile">Edit</span>
                  </button>
                </div>

                {/* Tier Progress */}
                {tier.name !== "Diamond" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                      <span>Progress to {Object.values(TIERS).find((t) => t.min > snapshot.lifetime_stats.total_score)?.name}</span>
                      <span>{snapshot.lifetime_stats.total_score.toLocaleString()} pts</span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 12,
                        borderRadius: 999,
                        background: "rgba(255, 255, 255, 0.2)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${(() => {
                            const range = tier.max - tier.min;
                            if (!isFinite(range)) return 100;  // Diamond tier protection
                            return Math.min(
                              ((snapshot.lifetime_stats.total_score - tier.min) / range) * 100,
                              100
                            );
                          })()}%`,
                          height: "100%",
                          background: "rgba(255, 255, 255, 0.5)",
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ marginBottom: 48 }}>
              <h2
                style={{
                  fontSize: "clamp(20px, 4vw, 24px)",
                  fontWeight: 800,
                  marginBottom: 24,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <BarChart3 style={{ width: 24, height: 24, color: "#8b5cf6" }} />
                Statistics
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 20,
                  marginBottom: 32,
                }}
              >
                <StatCard
                  icon={Trophy}
                  label="Total Score"
                  value={snapshot.lifetime_stats.total_score.toLocaleString()}
                  subtitle={`${snapshot.lifetime_stats.rounds_played} rounds played`}
                  color="#fbbf24"
                />
                <StatCard
                  icon={Target}
                  label="Accuracy"
                  value={`${Math.round(snapshot.lifetime_stats.accuracy_percentage)}%`}
                  subtitle={`${snapshot.lifetime_stats.correct_answers} correct`}
                  color="#22c55e"
                />
                <StatCard
                  icon={Star}
                  label="Best Score"
                  value={snapshot.personal_bests.highest_score}
                  subtitle={`${snapshot.personal_bests.perfect_rounds} perfect rounds`}
                  color="#a78bfa"
                />
                <StatCard
                  icon={Crown}
                  label="Weekly Rank"
                  value={snapshot.rankings.weekly_rank === 9999 ? "-" : snapshot.rankings.weekly_rank}
                  subtitle="Current ranking"
                  color="#06b6d4"
                />
              </div>

              {/* Period Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05))",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase" }}>
                    Today
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "white", marginBottom: 8 }}>
                    {snapshot.today_stats.total_score}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {snapshot.today_stats.rounds_played} rounds •{" "}
                    {Math.round(snapshot.today_stats.accuracy_percentage)}% acc
                  </div>
                </div>

                <div
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    background: "linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(6, 182, 212, 0.05))",
                    border: "1px solid rgba(34, 211, 238, 0.3)",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase" }}>
                    This Week
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "white", marginBottom: 8 }}>
                    {snapshot.week_stats.total_score}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {snapshot.week_stats.rounds_played} rounds •{" "}
                    {Math.round(snapshot.week_stats.accuracy_percentage)}% acc
                  </div>
                </div>

                <div
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    background: "linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))",
                    border: "1px solid rgba(251, 191, 36, 0.3)",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase" }}>
                    This Month
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "white", marginBottom: 8 }}>
                    {snapshot.month_stats.total_score}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {snapshot.month_stats.rounds_played} rounds •{" "}
                    {Math.round(snapshot.month_stats.accuracy_percentage)}% acc
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div style={{ marginBottom: 48 }}>
              <h2
                style={{
                  fontSize: "clamp(20px, 4vw, 24px)",
                  fontWeight: 800,
                  marginBottom: 24,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Award style={{ width: 24, height: 24, color: "#8b5cf6" }} />
                Achievements ({unlockedAchievements.length}/{achievements.length})
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                {unlockedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
                {lockedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>

            {/* Recent History */}
            {snapshot.recent_history.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <h2
                  style={{
                    fontSize: "clamp(20px, 4vw, 24px)",
                    fontWeight: 800,
                    marginBottom: 24,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Activity style={{ width: 24, height: 24, color: "#8b5cf6" }} />
                  Recent Activity
                </h2>

                <div
                  style={{
                    padding: "clamp(20px, 4vw, 32px)",
                    borderRadius: 24,
                    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {snapshot.recent_history.slice(0, 10).map((round, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: 16,
                          borderRadius: 12,
                          background: "rgba(139, 92, 246, 0.05)",
                          border: "1px solid rgba(139, 92, 246, 0.2)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              background:
                                round.score >= 80
                                  ? "rgba(34, 197, 94, 0.2)"
                                  : round.score >= 60
                                  ? "rgba(251, 191, 36, 0.2)"
                                  : "rgba(239, 68, 68, 0.2)",
                              border:
                                round.score >= 80
                                  ? "1px solid rgba(34, 197, 94, 0.4)"
                                  : round.score >= 60
                                  ? "1px solid rgba(251, 191, 36, 0.4)"
                                  : "1px solid rgba(239, 68, 68, 0.4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 18,
                            }}
                          >
                            {round.score >= 80 ? "🔥" : round.score >= 60 ? "⭐" : "📊"}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "white", marginBottom: 2 }}>
                              Round #{round.round_id}
                            </div>
                            <div style={{ fontSize: 11, color: "#6b7280" }}>
                              {formatRelativeTime(round.joined_at)}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: 20,
                              fontWeight: 900,
                              color:
                                round.score >= 80 ? "#22c55e" : round.score >= 60 ? "#fbbf24" : "#ef4444",
                              marginBottom: 2,
                            }}
                          >
                            {round.score}
                          </div>
                          <div style={{ fontSize: 11, color: "#6b7280" }}>
                            {round.correct_answers}/20
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Edit Profile Modal */}
        {isEditing && (
          <EditProfileModal
            currentName={snapshot.profile.full_name}
            currentCountry={snapshot.profile.country_code}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditing(false)}
            isSaving={isSaving}
          />
        )}

        <Footer />
      </div>
    </>
  );
}
