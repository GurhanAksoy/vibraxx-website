"use client";

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import type { ComponentType, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Crown,
  Trophy,
  Play,
  ArrowRight,
  Volume2,
  VolumeX,
  Sparkles,
  Globe,
  Gift,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  User,
  BarChart3,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { playMenuMusic, stopMenuMusic } from "@/lib/audioManager";
import Footer from "@/components/Footer";

// ============================================
// CANONICAL CONSTANTS
// ============================================
const BLOCK_REASONS = {
  NOT_AUTHENTICATED: "not_authenticated",
  NO_CREDITS: "no_credits",
  NOT_AGE_VERIFIED: "not_age_verified",
  ALREADY_USED: "already_used_this_week",
} as const;

const PAGE_TYPE = "homepage" as const;

// ============================================
// CANONICAL TYPES
// ============================================
interface CanonicalHomepageState {
  isAuthenticated: boolean;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  liveCredits: number;
  ageVerified: boolean;
  nextRoundSeconds: number;
  activePlayers: number;
  totalRounds: number;
  totalParticipants: number;
  weeklyChampion: { name: string; score: number } | null;
  monthlyChampion: { name: string; score: number } | null;
  canEnterLive: boolean;
  liveBlockReason: string | null;
  canEnterFree: boolean;
  freeBlockReason: string | null;
}

interface StatCardProps {
  icon: ComponentType<{ style?: CSSProperties }>;
  value: string;
  label: string;
}

interface Champion {
  period: string;
  name: string;
  score: number;
  icon: ComponentType<{ style?: CSSProperties }>;
  color: string;
}

// ============================================
// CANONICAL DATA HOOKS
// ============================================
function useCanonicalHomepageState() {
  const [state, setState] = useState<CanonicalHomepageState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadState = useCallback(async (): Promise<CanonicalHomepageState | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      const userEmail = user?.email || null;
      const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || null;

      // 🔍 DEBUG - Window'a ekle
      if (typeof window !== 'undefined') {
        (window as any).__DEBUG_USER = {
          email: userEmail,
          name: userName,
          metadata: user?.user_metadata,
          full_user: user
        };
        console.log('[Homepage] User Info:', (window as any).__DEBUG_USER);
      }

      // ✅ CANONICAL: Sadece RPC - Frontend karar vermiyor
      const { data: homepage, error: homeErr } = await supabase.rpc(
        "get_homepage_state"
      );

      if (homeErr) throw homeErr;

      const canonicalState: CanonicalHomepageState = {
        isAuthenticated: homepage.is_authenticated,
        userId,
        userEmail,
        userName,
        liveCredits: homepage.live_credits,
        ageVerified: homepage.age_verified, // ✅ Backend'den geliyor
        nextRoundSeconds: homepage.next_round_in_seconds,
        activePlayers: homepage.active_players,
        totalRounds: homepage.total_rounds,
        totalParticipants: homepage.total_participants,
        weeklyChampion: homepage.weekly_champion_name
          ? {
              name: homepage.weekly_champion_name,
              score: homepage.weekly_champion_score ?? 0,
            }
          : null,
        monthlyChampion: homepage.monthly_champion_name
          ? {
              name: homepage.monthly_champion_name,
              score: homepage.monthly_champion_score ?? 0,
            }
          : null,
        canEnterLive: homepage.can_enter_live,
        liveBlockReason: homepage.live_block_reason,
        canEnterFree: homepage.can_enter_free,
        freeBlockReason: homepage.free_block_reason,
      };

      setState(canonicalState);
      return canonicalState;
    } catch (err) {
      console.error("[CanonicalHomepage] Error loading state:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 15000);
    return () => clearInterval(interval);
  }, [loadState]);

  return { state, isLoading, refresh: loadState };
}

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
    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
  }, [pageType]);
}

// ============================================
// UI COMPONENTS
// ============================================
const StatCard = memo(({ icon: Icon, value, label }: StatCardProps) => (
  <div className="vx-stat-card">
    <Icon style={{ width: 20, height: 20, color: "#6b7280", marginBottom: 8 }} />
    <div className="vx-stat-value">{value}</div>
    <div className="vx-stat-label">{label}</div>
  </div>
));
StatCard.displayName = "StatCard";

const ChampionCard = memo(({ champion }: { champion: Champion }) => {
  const Icon = champion.icon;

  if (!champion.name || champion.name === "TBA" || champion.score === 0) {
    return (
      <div className="vx-champ-card">
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 16px",
            borderRadius: 16,
            background: `linear-gradient(135deg, ${champion.color}15, ${champion.color}08)`,
            border: `1px solid ${champion.color}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon style={{ width: 28, height: 28, color: champion.color }} />
        </div>

        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#6b7280",
            marginBottom: 8,
          }}
        >
          {champion.period} Champion
        </div>

        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 8,
            color: "#94a3b8",
            textAlign: "center",
          }}
        >
          To Be Announced
        </div>

        <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center" }}>
          Start competing to claim this spot
        </div>
      </div>
    );
  }

  return (
    <div className="vx-champ-card">
      <div
        style={{
          width: 64,
          height: 64,
          margin: "0 auto 16px",
          borderRadius: 16,
          background: `linear-gradient(135deg, ${champion.color}, ${champion.color}dd)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 8px 24px ${champion.color}40`,
          position: "relative",
        }}
      >
        <Icon style={{ width: 28, height: 28, color: "white" }} />
        <div
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#facc15",
            border: "2px solid #0f172a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Crown style={{ width: 10, height: 10, color: "#0f172a" }} />
        </div>
      </div>

      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "#6b7280",
          marginBottom: 8,
        }}
      >
        {champion.period} Champion
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 4,
          color: "#ffffff",
          textAlign: "center",
        }}
      >
        {champion.name}
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: champion.color,
          textAlign: "center",
        }}
      >
        {champion.score.toLocaleString()} pts
      </div>
    </div>
  );
});
ChampionCard.displayName = "ChampionCard";

const AgeVerificationModal = memo(
  ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
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
        padding: 16,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          borderRadius: 16,
          padding: 32,
          maxWidth: 400,
          width: "100%",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 24px",
            borderRadius: 16,
            background: "rgba(251, 191, 36, 0.1)",
            border: "1px solid rgba(251, 191, 36, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertCircle style={{ width: 32, height: 32, color: "#fbbf24" }} />
        </div>

        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Age Verification Required
        </h2>

        <p
          style={{
            fontSize: 14,
            color: "#94a3b8",
            textAlign: "center",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          You must be 18 years or older to participate in VibraXX quiz competitions. By
          continuing, you confirm that you meet this age requirement.
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px 24px",
              borderRadius: 10,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#94a3b8",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "12px 24px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #7c3aed, #d946ef)",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 8px 16px rgba(124, 58, 237, 0.4)",
            }}
          >
            I am 18+
          </button>
        </div>
      </div>
    </div>
  )
);
AgeVerificationModal.displayName = "AgeVerificationModal";

const NoRoundsModal = memo(
  ({ onBuyRounds, onCancel }: { onBuyRounds: () => void; onCancel: () => void }) => (
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
        padding: 16,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          borderRadius: 16,
          padding: 32,
          maxWidth: 400,
          width: "100%",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 24px",
            borderRadius: 16,
            background: "rgba(124, 58, 237, 0.1)",
            border: "1px solid rgba(124, 58, 237, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShoppingCart style={{ width: 32, height: 32, color: "#7c3aed" }} />
        </div>

        <h2
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          No Rounds Available
        </h2>

        <p
          style={{
            fontSize: 14,
            color: "#94a3b8",
            textAlign: "center",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          You don't have any quiz rounds available. Purchase a single round or a bundle to
          start competing for prizes!
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px 24px",
              borderRadius: 10,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#94a3b8",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onBuyRounds}
            style={{
              flex: 1,
              padding: "12px 24px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #7c3aed, #d946ef)",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 8px 16px rgba(124, 58, 237, 0.4)",
            }}
          >
            Buy Rounds
          </button>
        </div>
      </div>
    </div>
  )
);
NoRoundsModal.displayName = "NoRoundsModal";

// ============================================
// MAIN COMPONENT
// ============================================
export default function HomePage() {
  const router = useRouter();
  const { state, isLoading, refresh } = useCanonicalHomepageState();
  usePresence(PAGE_TYPE);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [showNoRoundsModal, setShowNoRoundsModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"live" | "free" | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const hasInteractedRef = useRef(false);

  // Cleanup music on unmount
  useEffect(() => {
    return () => {
      stopMenuMusic();
    };
  }, []);

  useEffect(() => {
    const initial = state?.nextRoundSeconds ?? 0;
    setCountdownSeconds(initial);

    const interval = setInterval(() => {
      setCountdownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [state?.nextRoundSeconds]);

  const handleFirstInteraction = useCallback(() => {
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      playMenuMusic();
      setIsPlaying(true);
    }
  }, []);

  useEffect(() => {
    const handleClick = () => handleFirstInteraction();
    document.addEventListener("click", handleClick, { once: true });
    return () => document.removeEventListener("click", handleClick);
  }, [handleFirstInteraction]);

  const toggleMusic = useCallback(() => {
    if (isPlaying) {
      stopMenuMusic();
      setIsPlaying(false);
    } else {
      playMenuMusic();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleSignIn = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    refresh();
  }, [refresh]);

  const handleAgeVerification = useCallback(async () => {
    if (!state?.userId) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ age_verified: true })
        .eq("user_id", state.userId);

      if (error) throw error;

      setShowAgeModal(false);
      await refresh();

      if (pendingAction === "live") {
        router.push("/lobby");
      } else if (pendingAction === "free") {
        router.push("/free-quiz");
      }
      setPendingAction(null);
    } catch (err) {
      console.error("Age verification failed:", err);
    }
  }, [state?.userId, pendingAction, refresh, router]);

  const handleStartLiveQuiz = useCallback(() => {
    if (!state) return;

    if (!state.isAuthenticated) {
      handleSignIn();
      return;
    }

    if (!state.ageVerified) {
      setPendingAction("live");
      setShowAgeModal(true);
      return;
    }

    if (!state.canEnterLive) {
      if (state.liveBlockReason === BLOCK_REASONS.NO_CREDITS) {
        setShowNoRoundsModal(true);
      }
      return;
    }

    router.push("/lobby");
  }, [state, handleSignIn, router]);

  const handleStartFreeQuiz = useCallback(() => {
    if (!state) return;

    if (!state.isAuthenticated) {
      handleSignIn();
      return;
    }

    if (!state.ageVerified) {
      setPendingAction("free");
      setShowAgeModal(true);
      return;
    }

    if (!state.canEnterFree) {
      if (state.freeBlockReason === BLOCK_REASONS.ALREADY_USED) {
        alert("You've already used your free quiz this week. Come back Monday!");
      }
      return;
    }

    router.push("/free-quiz");
  }, [state, handleSignIn, router]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const statsCards = useMemo(
    () => [
      {
        icon: Globe,
        value: state?.activePlayers?.toLocaleString() || "0",
        label: "Active Players",
      },
      {
        icon: Trophy,
        value: state?.totalRounds?.toLocaleString() || "0",
        label: "Rounds Played",
      },
      {
        icon: Sparkles,
        value: state?.totalParticipants?.toLocaleString() || "0",
        label: "Total Players",
      },
    ],
    [state]
  );

  const champions = useMemo(
    () => [
      {
        period: "Weekly",
        name: state?.weeklyChampion?.name || "TBA",
        score: state?.weeklyChampion?.score || 0,
        icon: Trophy,
        color: "#06b6d4",
      },
      {
        period: "Monthly",
        name: state?.monthlyChampion?.name || "TBA",
        score: state?.monthlyChampion?.score || 0,
        icon: Crown,
        color: "#facc15",
      },
    ],
    [state]
  );

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
          Loading VibraXX...
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        /* ========== CANONICAL GLOBAL RESET ========== */
        html {
          box-sizing: border-box;
          scroll-behavior: smooth;
          -webkit-text-size-adjust: 100%;
        }

        *, *::before, *::after {
          box-sizing: inherit;
        }

        body {
          margin: 0;
          padding: 0;
          min-height: 100%;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #ffffff;
          overflow-x: hidden;
        }

        h1, h2, h3, h4, h5, h6,
        p, figure, blockquote, dl, dd {
          margin: 0;
        }

        img, picture, video, canvas, svg {
          display: block;
          max-width: 100%;
        }

        input, button, textarea, select {
          font: inherit;
        }

        button {
          background: none;
          border: none;
          cursor: pointer;
        }

        a {
          text-decoration: none;
          color: inherit;
        }

        ul[role="list"], ol[role="list"] {
          list-style: none;
        }

        :focus-visible {
          outline: 2px solid #7c3aed;
          outline-offset: 2px;
        }

        /* ========== LAYOUT CONTAINERS ========== */
        .vx-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* ========== HEADER ========== */
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

        /* ========== LIVE BAR ========== */
        .vx-livebar {
          background: linear-gradient(90deg, rgba(34, 197, 94, 0.1), rgba(6, 182, 212, 0.1));
          border-bottom: 1px solid rgba(34, 197, 94, 0.2);
          padding: 12px 0;
        }

        .vx-livebar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          font-size: 13px;
        }

        /* ========== HERO SECTION ========== */
        .vx-hero {
          padding: 80px 0;
          text-align: center;
        }

        .vx-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 50px;
          font-size: 12px;
          font-weight: 700;
          color: #fbbf24;
          margin-bottom: 24px;
        }

        .vx-hero-title {
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }

        .vx-hero-neon {
          background: linear-gradient(135deg, #7c3aed, #d946ef);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .vx-hero-subtitle {
          font-size: clamp(16px, 2vw, 18px);
          color: #94a3b8;
          max-width: 600px;
          margin: 0 auto 48px;
          line-height: 1.6;
        }

        /* ========== COUNTDOWN ========== */
        .vx-countdown-panel {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.6));
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 32px;
          max-width: 400px;
          margin: 0 auto 48px;
          backdrop-filter: blur(12px);
        }

        /* ========== CTA BUTTONS ========== */
        .vx-cta-wrap {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 500px;
          margin: 0 auto 64px;
        }

        .vx-cta-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px 32px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
          overflow: hidden;
        }

        .vx-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(124, 58, 237, 0.5);
        }

        /* ========== STATS ========== */
        .vx-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          margin-bottom: 64px;
        }

        .vx-stat-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.6));
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          transition: all 0.3s;
        }

        .vx-stat-card:hover {
          border-color: rgba(124, 58, 237, 0.3);
          transform: translateY(-4px);
        }

        .vx-stat-value {
          font-size: 32px;
          font-weight: 900;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .vx-stat-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* ========== CHAMPIONS ========== */
        .vx-champions-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 32px;
        }

        .vx-champions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 64px;
        }

        .vx-champ-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8));
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          transition: all 0.3s;
        }

        .vx-champ-card:hover {
          border-color: rgba(124, 58, 237, 0.4);
          transform: translateY(-4px);
        }

        /* ========== RESPONSIVE ========== */
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

          .vx-livebar-inner {
            font-size: 11px;
            gap: 8px;
          }

          .vx-hero {
            padding: 48px 0;
          }

          .vx-cta-wrap {
            max-width: 100%;
          }

          .vx-stats-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .vx-champions-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ========== ANIMATIONS ========== */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>

      <div style={{ minHeight: "100vh", position: "relative" }}>
        <header className="vx-header">
          <div className="vx-container">
            <div className="vx-header-inner">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                    Global Quiz Arena
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

                {state?.isAuthenticated ? (
                  <>
                    {/* ✅ Kullanıcı Adı/Email - HER ZAMAN GÖRÜNÜR */}
                    <div
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "#94a3b8",
                        fontSize: 12,
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <User style={{ width: 12, height: 12 }} />
                      {state.userName || state.userEmail?.split('@')[0] || 'User'}
                    </div>

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
                      {state?.liveCredits ?? 0} Rounds
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
                  </>
                ) : (
                  <>
                    {/* ✅ SEÇENEK B: Leaderboard herkese açık */}
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
                      onClick={handleSignIn}
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
                      }}
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="vx-livebar">
          <div className="vx-livebar-inner">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#22c55e",
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22c55e",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
              LIVE NOW
            </div>
            <div style={{ color: "#94a3b8", fontWeight: 500 }}>
              Next round in {formatTime(countdownSeconds)}
            </div>
            <div style={{ color: "#94a3b8", fontWeight: 500 }}>•</div>
            <div style={{ color: "#fbbf24", fontWeight: 600 }}>
              £1000 Monthly Prize Pool
            </div>
          </div>
        </div>

        {showAgeModal && (
          <AgeVerificationModal
            onConfirm={handleAgeVerification}
            onCancel={() => {
              setShowAgeModal(false);
              setPendingAction(null);
            }}
          />
        )}
        {showNoRoundsModal && (
          <NoRoundsModal
            onBuyRounds={() => {
              setShowNoRoundsModal(false);
              router.push("/buy");
            }}
            onCancel={() => setShowNoRoundsModal(false)}
          />
        )}

        <main style={{ position: "relative", zIndex: 10 }}>
          <div className="vx-container">
            <div className="vx-hero">
              <div className="vx-hero-badge">
                <Trophy style={{ width: 16, height: 16 }} />
                <span>Compete for Real Prizes</span>
              </div>

              <h1 className="vx-hero-title">
                Test Your Knowledge in the{" "}
                <span className="vx-hero-neon">Global Quiz Arena</span>
              </h1>

              <p className="vx-hero-subtitle">
                Join thousands of players worldwide. Answer 20 questions in 4 minutes. Climb
                the leaderboard. Win big.
              </p>

              <div className="vx-countdown-panel">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                    Next Round Starts In
                  </div>
                  <div
                    style={{
                      fontSize: 48,
                      fontWeight: 900,
                      color: "#ffffff",
                      textAlign: "center",
                      letterSpacing: "-0.02em",
                      fontVariantNumeric: "tabular-nums",
                      lineHeight: 1,
                    }}
                  >
                    {formatTime(countdownSeconds)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "#6b7280",
                      fontWeight: 500,
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "#22c55e",
                      }}
                    />
                    <span style={{ color: "#ffffff", fontWeight: 600 }}>
                      {state?.activePlayers ?? 0}
                    </span>
                    <span>players ready</span>
                  </div>
                </div>
              </div>

              <div className="vx-cta-wrap">
                <button
                  className="vx-cta-btn vx-cta-live"
                  onClick={handleStartLiveQuiz}
                  aria-label="Enter live arena with prizes"
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to right, #7c3aed, #d946ef)",
                      pointerEvents: "none",
                    }}
                  />
                  <Play
                    style={{ position: "relative", zIndex: 10, width: 20, height: 20 }}
                  />
                  <span style={{ position: "relative", zIndex: 10 }}>
                    Enter Live Arena
                  </span>
                  <ArrowRight
                    style={{ position: "relative", zIndex: 10, width: 20, height: 20 }}
                  />
                </button>

                <button
                  className="vx-cta-btn vx-cta-free"
                  onClick={handleStartFreeQuiz}
                  aria-label="Try free practice quiz"
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to right, #06b6d4, #22d3ee)",
                      pointerEvents: "none",
                    }}
                  />
                  <Gift
                    style={{ position: "relative", zIndex: 10, width: 20, height: 20 }}
                  />
                  <span style={{ position: "relative", zIndex: 10 }}>Try Free Quiz</span>
                  <ArrowRight
                    style={{ position: "relative", zIndex: 10, width: 20, height: 20 }}
                  />
                </button>
              </div>

              <div className="vx-stats-grid">
                {statsCards.map((stat, i) => (
                  <StatCard key={i} {...stat} />
                ))}
              </div>

              <h2 className="vx-champions-title">
                <Crown style={{ width: 24, height: 24, color: "#facc15" }} />
                Top Champions
              </h2>

              <div className="vx-champions-grid">
                {champions.map((champion, i) => (
                  <ChampionCard key={i} champion={champion} />
                ))}
              </div>
            </div>
          </div>
        </main>

        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            background: "rgba(255, 255, 255, 0.01)",
            padding: "32px 0",
          }}
        >
          <div className="vx-container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 24,
                maxWidth: 1024,
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(34, 197, 94, 0.1)",
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle style={{ width: 20, height: 20, color: "#22c55e" }} />
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#ffffff",
                    textAlign: "center",
                  }}
                >
                  SSL Encrypted
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  Bank-level security
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(139, 92, 246, 0.1)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShoppingCart style={{ width: 20, height: 20, color: "#8b5cf6" }} />
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#ffffff",
                    textAlign: "center",
                  }}
                >
                  Stripe Verified
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  Secure payments
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(251, 191, 36, 0.1)",
                    border: "1px solid rgba(251, 191, 36, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AlertCircle style={{ width: 20, height: 20, color: "#fbbf24" }} />
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#ffffff",
                    textAlign: "center",
                  }}
                >
                  18+ Only
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  Age verified
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(6, 182, 212, 0.1)",
                    border: "1px solid rgba(6, 182, 212, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Globe style={{ width: 20, height: 20, color: "#06b6d4" }} />
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#ffffff",
                    textAlign: "center",
                  }}
                >
                  Global Arena
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  Worldwide players
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
