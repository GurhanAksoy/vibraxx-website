"use client";

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  Trophy,
  Zap,
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
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { playMenuMusic, stopMenuMusic } from "@/lib/audioManager";
import Footer from "@/components/Footer";

interface HomepageState {
  next_round_in_seconds: number;
  is_authenticated: boolean;
  live_credits: number;
  can_enter_live: boolean;
  live_block_reason: string | null;
  can_enter_free: boolean;
  free_block_reason: string | null;
  active_players: number;
  total_rounds: number;
  total_participants: number;
  weekly_champion_name: string;
  weekly_champion_score: number;
  monthly_champion_name: string;
  monthly_champion_score: number;
}

function useHomepageState() {
  const [state, setState] = useState<HomepageState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadState = useCallback(async (): Promise<HomepageState | null> => {
    try {
      const ageVerified = localStorage.getItem("vibraxx_age_verified") === "true";
      
      const { data, error } = await supabase.rpc('get_homepage_state', {
        p_age_verified: ageVerified
      });

      if (error) {
        console.error('[HomepageState] RPC error:', error);
        return null;
      }

      if (data) {
        const freshState = data as HomepageState;
        setState(freshState);
        return freshState;
      }
      return null;
    } catch (err) {
      console.error('[HomepageState] Error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 5000);
    return () => clearInterval(interval);
  }, [loadState]);

  return { state, isLoading, refresh: loadState };
}

function usePresence(pageType: string) {
  const sessionIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!sessionIdRef.current) {
      const stored = sessionStorage.getItem('presence_session_id');
      if (stored) {
        sessionIdRef.current = stored;
      } else {
        sessionIdRef.current = crypto.randomUUID();
        sessionStorage.setItem('presence_session_id', sessionIdRef.current);
      }
    }

    const sendHeartbeat = async () => {
      try {
        await supabase.rpc('update_presence', {
          p_session_id: sessionIdRef.current,
          p_page_type: pageType,
          p_round_id: null
        });
      } catch (err) {
        console.error('Presence heartbeat failed:', err);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
  }, [pageType]);
}

const StatCard = memo(({ icon: Icon, value, label }: any) => (
  <div className="vx-stat-card">
    <Icon style={{ width: 20, height: 20, color: "#6b7280", marginBottom: 8 }} />
    <div className="vx-stat-value">{value}</div>
    <div className="vx-stat-label">{label}</div>
  </div>
));
StatCard.displayName = "StatCard";

const ChampionCard = memo(({ champion }: any) => {
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
            lineHeight: 1.4,
          }}
        >
          {champion.period === "Weekly" && "Weekly rankings reset every Monday"}
          {champion.period === "Monthly" && "Monthly rankings reset at month end (UTC)"}
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
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 8,
          color: "#ffffff",
        }}
      >
        {champion.name}
      </div>

      <div
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: champion.color,
          lineHeight: 1,
        }}
      >
        {champion.score.toLocaleString()} pts
      </div>
    </div>
  );
});
ChampionCard.displayName = "ChampionCard";

const AgeVerificationModal = memo(({ onConfirm, onCancel }: any) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.85)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: "20px",
    }}
    onClick={onCancel}
  >
    <div
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        borderRadius: 24,
        padding: "32px",
        maxWidth: 480,
        width: "100%",
        border: "1px solid rgba(139, 92, 246, 0.3)",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 16px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #d946ef)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AlertCircle style={{ width: 32, height: 32, color: "white" }} />
        </div>
        <h3
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 12,
            color: "white",
          }}
        >
          Age Verification Required
        </h3>
        <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.6 }}>
          To participate in Live Quiz competitions with real prizes, you must be at least 18 years old.
        </p>
      </div>

      <div
        style={{
          background: "rgba(139, 92, 246, 0.1)",
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          border: "1px solid rgba(139, 92, 246, 0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "start", gap: 12, marginBottom: 12 }}>
          <CheckCircle style={{ width: 20, height: 20, color: "#a78bfa", flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 14, color: "#cbd5e1", margin: 0 }}>
            I confirm that I am <strong style={{ color: "white" }}>18 years or older</strong>
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
          <CheckCircle style={{ width: 20, height: 20, color: "#a78bfa", flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 14, color: "#cbd5e1", margin: 0 }}>
            I agree to participate responsibly in quiz competitions
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "14px 24px",
            borderRadius: 12,
            border: "1px solid rgba(148, 163, 253, 0.3)",
            background: "transparent",
            color: "#94a3b8",
            fontSize: 15,
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
            padding: "14px 24px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #7c3aed, #d946ef)",
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 8px 24px rgba(124, 58, 237, 0.4)",
          }}
        >
          I'm 18+ - Continue
        </button>
      </div>
    </div>
  </div>
));
AgeVerificationModal.displayName = "AgeVerificationModal";

const NoRoundsModal = memo(({ onBuyRounds, onCancel }: any) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.85)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: "20px",
    }}
    onClick={onCancel}
  >
    <div
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        borderRadius: 24,
        padding: "32px",
        maxWidth: 480,
        width: "100%",
        border: "1px solid rgba(251, 191, 36, 0.3)",
        boxShadow: "0 20px 60px rgba(251, 191, 36, 0.3)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 16px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShoppingCart style={{ width: 32, height: 32, color: "white" }} />
        </div>
        <h3
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 12,
            color: "white",
          }}
        >
          No Rounds Available
        </h3>
        <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.6 }}>
          You need to purchase rounds to enter the Live Quiz lobby and compete for the{" "}
          <strong style={{ color: "#fbbf24" }}>£1000 monthly prize</strong>!
        </p>
      </div>

      <div
        style={{
          background: "rgba(251, 191, 36, 0.1)",
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          border: "1px solid rgba(251, 191, 36, 0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "start", gap: 12, marginBottom: 12 }}>
          <Trophy style={{ width: 20, height: 20, color: "#fbbf24", flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 14, color: "#cbd5e1", margin: 0 }}>
            <strong style={{ color: "white" }}>Live competitions</strong> every 5 minutes
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
          <Crown style={{ width: 20, height: 20, color: "#fbbf24", flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 14, color: "#cbd5e1", margin: 0 }}>
            Compete for <strong style={{ color: "white" }}>real prizes</strong> and leaderboard glory
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "14px 24px",
            borderRadius: 12,
            border: "1px solid rgba(148, 163, 253, 0.3)",
            background: "transparent",
            color: "#94a3b8",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Maybe Later
        </button>
        <button
          onClick={onBuyRounds}
          style={{
            flex: 1,
            padding: "14px 24px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
            color: "white",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 8px 24px rgba(251, 191, 36, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <ShoppingCart style={{ width: 18, height: 18 }} />
          Buy Rounds Now
        </button>
      </div>
    </div>
  </div>
));
NoRoundsModal.displayName = "NoRoundsModal";

export default function HomePage() {
  const router = useRouter();

  const [isPlaying, setIsPlaying] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"live" | "free" | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showNoRoundsModal, setShowNoRoundsModal] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const mountedRef = useRef<boolean>(false);
  const resumeIntentHandledRef = useRef<boolean>(false);

  const { state, isLoading, refresh } = useHomepageState();
  usePresence('homepage');

  const countdownSeconds = state?.next_round_in_seconds ?? 0;

  const champions = useMemo(() => {
    if (!state) {
      return [
        {
          period: "Weekly",
          name: "TBA",
          score: 0,
          gradient: "linear-gradient(to bottom right, #8b5cf6, #d946ef)",
          color: "#c084fc",
          icon: Trophy,
        },
        {
          period: "Monthly",
          name: "TBA",
          score: 0,
          gradient: "linear-gradient(to bottom right, #3b82f6, #06b6d4)",
          color: "#22d3ee",
          icon: Crown,
        },
      ];
    }

    return [
      {
        period: "Weekly",
        name: state.weekly_champion_name,
        score: state.weekly_champion_score,
        gradient: "linear-gradient(to bottom right, #8b5cf6, #d946ef)",
        color: "#c084fc",
        icon: Trophy,
      },
      {
        period: "Monthly",
        name: state.monthly_champion_name,
        score: state.monthly_champion_score,
        gradient: "linear-gradient(to bottom right, #3b82f6, #06b6d4)",
        color: "#22d3ee",
        icon: Crown,
      },
    ];
  }, [state]);

  const statsCards = useMemo(() => {
    if (!state) {
      return [
        { icon: Globe, value: "0+", label: "Active Players" },
        { icon: Zap, value: "0+", label: "Rounds Played" },
        { icon: Trophy, value: "0+", label: "Competitors" },
      ];
    }

    return [
      { icon: Globe, value: `${state.active_players}+`, label: "Active Players" },
      { icon: Zap, value: `${state.total_rounds.toLocaleString()}+`, label: "Rounds Played" },
      { icon: Trophy, value: `${state.total_participants.toLocaleString()}+`, label: "Competitors" },
    ];
  }, [state]);

  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(() => setIsInitialLoad(false), 100);
    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      const orbs = document.querySelectorAll(".animate-float");
      orbs.forEach((orb, index) => {
        setTimeout(() => {
          if (!mountedRef.current) return;
          (orb as HTMLElement).style.opacity = index === 0 ? "0.28" : "0.22";
        }, 300 + index * 200);
      });
    }
  }, [isInitialLoad]);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);

      if (data.user && sessionStorage.getItem("pendingBuyRounds") === "true") {
        sessionStorage.removeItem("pendingBuyRounds");
        setTimeout(() => {
          if (!mountedRef.current) return;
          router.push("/buy");
        }, 300);
      }
    };
    loadUser();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);

      if (event === "SIGNED_IN" && session?.user) {
        if (sessionStorage.getItem("pendingBuyRounds") === "true") {
          sessionStorage.removeItem("pendingBuyRounds");
          setTimeout(() => {
            if (!mountedRef.current) return;
            router.push("/buy");
          }, 300);
        }
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user || resumeIntentHandledRef.current || !state) return;

    const intent = sessionStorage.getItem("postLoginIntent");
    if (intent !== "live" && intent !== "free") return;

    resumeIntentHandledRef.current = true;
    sessionStorage.removeItem("postLoginIntent");

    if (intent === "live") {
      if (state.live_block_reason === "not_age_verified") {
        setPendingAction("live");
        setShowAgeModal(true);
      } else if (state.live_block_reason === "no_credits") {
        setShowNoRoundsModal(true);
      } else if (state.can_enter_live) {
        router.push("/lobby");
      }
    } else if (intent === "free") {
      if (state.free_block_reason === "not_age_verified") {
        setPendingAction("free");
        setShowAgeModal(true);
      } else if (state.can_enter_free) {
        router.push("/free");
      }
    }
  }, [user, router, state]);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);

        const savedPref = localStorage.getItem("vibraxx_music");
        if (savedPref !== "false") {
          playMenuMusic();
          setIsPlaying(true);
          localStorage.setItem("vibraxx_music", "true");
        }
      }
    };

    document.addEventListener("click", handleFirstInteraction, { once: true });
    document.addEventListener("touchstart", handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [hasInteracted]);

  const toggleMusic = useCallback(() => {
    if (isPlaying) {
      stopMenuMusic();
      setIsPlaying(false);
      localStorage.setItem("vibraxx_music", "false");
    } else {
      playMenuMusic();
      setIsPlaying(true);
      localStorage.setItem("vibraxx_music", "true");
    }
  }, [isPlaying]);

  useEffect(() => {
    const musicPref = localStorage.getItem("vibraxx_music");
    if (musicPref === "true") {
      setIsPlaying(true);
    }
    return () => stopMenuMusic();
  }, []);

  const handleSignIn = useCallback(async () => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    resumeIntentHandledRef.current = false;
  }, []);

  const handleAgeVerification = useCallback(async () => {
    localStorage.setItem("vibraxx_age_verified", "true");

    const action = pendingAction;
    setPendingAction(null);
    setShowAgeModal(false);

    const freshState = await refresh();
    
    if (!freshState) return;

    if (action === "live") {
      if (freshState.can_enter_live) {
        router.push("/lobby");
      } else if (freshState.live_block_reason === "no_credits") {
        setShowNoRoundsModal(true);
      }
    } else if (action === "free") {
      if (freshState.can_enter_free) {
        router.push("/free");
      }
    }
  }, [pendingAction, router, refresh]);

  const handleStartLiveQuiz = useCallback(async () => {
    if (!state) return;

    if (state.live_block_reason === "not_authenticated") {
      sessionStorage.setItem("postLoginIntent", "live");
      await handleSignIn();
      return;
    }

    if (state.live_block_reason === "not_age_verified") {
      setPendingAction("live");
      setShowAgeModal(true);
      return;
    }

    if (state.live_block_reason === "no_credits") {
      setShowNoRoundsModal(true);
      return;
    }

    if (state.can_enter_live) {
      router.push("/lobby");
    }
  }, [state, handleSignIn, router]);

  const handleStartFreeQuiz = useCallback(async () => {
    if (!state) return;

    if (state.free_block_reason === "not_authenticated") {
      sessionStorage.setItem("postLoginIntent", "free");
      await handleSignIn();
      return;
    }

    if (state.free_block_reason === "not_age_verified") {
      setPendingAction("free");
      setShowAgeModal(true);
      return;
    }

    if (state.can_enter_free) {
      router.push("/free");
    }
  }, [state, handleSignIn, router]);

  const formatTime = useCallback((seconds: number) => {
    const safe = Math.max(0, Math.floor(seconds));
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  return (
    <>
      <style jsx global>{`
        :root {
          color-scheme: dark;
          background-color: #020817;
        }

        * {
          box-sizing: border-box;
        }

        body {
          background-color: #020817;
          margin: 0;
          padding: 0;
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

        @keyframes glow {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
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

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
          will-change: transform;
          animation-delay: 0.3s;
          animation-fill-mode: backwards;
        }

        .animate-glow {
          animation: glow 3s ease-in-out infinite;
          animation-delay: 0.5s;
          animation-fill-mode: backwards;
        }

        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
          animation-delay: 0.2s;
          animation-fill-mode: backwards;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
          animation-delay: 0.4s;
          animation-fill-mode: backwards;
        }

        .vx-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
        }

        @media (min-width: 640px) {
          .vx-container {
            padding: 0 24px;
          }
        }

        .vx-header-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          gap: 16px;
        }

        .vx-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .vx-hide-mobile {
          display: none;
        }

        @media (min-width: 768px) {
          .vx-header-inner {
            height: 80px;
            flex-wrap: nowrap;
          }
          .vx-header-right {
            gap: 12px;
          }
          .vx-hide-mobile {
            display: inline-flex;
          }
        }

        @media (max-width: 639px) {
          .vx-header-inner {
            justify-content: space-between;
            padding: 12px 0;
          }
          .vx-header-right {
            justify-content: flex-end;
          }
        }

        .vx-livebar {
          z-index: 40;
          border-bottom: 1px solid rgba(139, 92, 246, 0.3);
          border-top: 1px solid rgba(139, 92, 246, 0.2);
          backdrop-filter: blur(16px);
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(217, 70, 239, 0.15));
          font-size: 12px;
          animation: pulse-glow 3s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 0 rgba(139, 92, 246, 0);
          }
          50% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
          }
        }

        .vx-livebar-inner {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          align-items: center;
          padding: 8px 16px;
        }

        @media (min-width: 640px) {
          .vx-livebar-inner {
            font-size: 14px;
            padding: 10px 24px;
          }
        }

        .vx-hero {
          padding: 72px 16px 80px;
          text-align: center;
        }
        @media (min-width: 640px) {
          .vx-hero {
            padding: 96px 24px 96px;
          }
        }

        .vx-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 9999px;
          border: 2px solid rgba(251, 191, 36, 0.4);
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1));
          color: #fbbf24;
          font-size: 12px;
          margin-bottom: 12px;
          backdrop-filter: blur(10px);
          font-weight: 700;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.3), inset 0 0 20px rgba(251, 191, 36, 0.1);
          position: relative;
          overflow: hidden;
        }

        .vx-hero-badge::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: badge-shine 3s infinite;
        }

        @keyframes badge-shine {
          0% {
            left: -100%;
          }
          50%,
          100% {
            left: 100%;
          }
        }

        @media (min-width: 640px) {
          .vx-hero-badge {
            padding: 10px 24px;
            font-size: 14px;
            margin-bottom: 14px;
          }
        }

        .vx-hero-title {
          font-size: clamp(26px, 6vw, 42px);
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 18px;
          letter-spacing: -0.03em;
        }

        .vx-hero-neon {
          display: inline-block;
          background: linear-gradient(90deg, #7c3aed, #22d3ee, #f97316, #d946ef, #7c3aed);
          background-size: 250% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
          text-shadow: 0 0 14px rgba(124, 58, 237, 0.45);
        }

        .vx-hero-subtitle {
          font-size: 16px;
          color: #94a3b8;
          max-width: 640px;
          margin: 0 auto 32px;
          line-height: 1.6;
        }

        @media (min-width: 640px) {
          .vx-hero-subtitle {
            font-size: 18px;
            margin-bottom: 40px;
          }
        }

        .vx-countdown-panel {
          margin: 24px auto 28px;
          max-width: 380px;
          padding: 20px 26px;
          border-radius: 18px;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          border: 2px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 2px 0 rgba(255, 255, 255, 0.08);
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .vx-countdown-panel:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 2px 0 rgba(255, 255, 255, 0.12), 0 0 40px rgba(124, 58, 237, 0.3);
        }

        .vx-cta-wrap {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          justify-content: center;
          margin-bottom: 48px;
          width: 100%;
          max-width: 100%;
          padding: 0 16px;
        }

        @media (min-width: 640px) {
          .vx-cta-wrap {
            flex-direction: row;
            margin-bottom: 64px;
            padding: 0;
          }
        }

        .vx-cta-btn {
          position: relative;
          padding: 14px 28px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 700;
          font-size: 16px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          width: 100%;
          max-width: 320px;
        }

        .vx-cta-btn:hover {
          transform: translateY(-2px);
        }
        .vx-cta-btn:active {
          transform: translateY(0);
        }

        @media (min-width: 640px) {
          .vx-cta-btn {
            padding: 18px 34px;
            font-size: 18px;
            width: auto;
            min-width: 220px;
          }
        }

        .vx-cta-live {
          box-shadow: 0 20px 40px -16px rgba(139, 92, 246, 0.6);
        }
        .vx-cta-free {
          box-shadow: 0 20px 40px -16px rgba(34, 211, 238, 0.5);
        }

        .vx-stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 64px;
        }

        @media (min-width: 640px) {
          .vx-stats-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 24px;
            margin-bottom: 80px;
          }
        }

        .vx-stat-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
          backdrop-filter: blur(20px);
          min-height: 120px;
          padding: 1.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .vx-stat-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100px;
          right: -100px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        }

        .vx-stat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
        }

        @media (min-width: 640px) {
          .vx-stat-card {
            min-height: 140px;
            padding: 2rem;
          }
        }

        .vx-stat-value {
          font-size: 28px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 4px;
          letter-spacing: -0.02em;
        }

        @media (min-width: 640px) {
          .vx-stat-value {
            font-size: 32px;
          }
        }

        .vx-stat-label {
          font-size: 13px;
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media (min-width: 640px) {
          .vx-stat-label {
            font-size: 14px;
          }
        }

        .vx-champions-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 28px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 32px;
          text-align: center;
        }

        @media (min-width: 640px) {
          .vx-champions-title {
            font-size: 32px;
            margin-bottom: 40px;
          }
        }

        .vx-champions-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 80px;
        }

        @media (min-width: 640px) {
          .vx-champions-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 24px;
            margin-bottom: 96px;
          }
        }

        .vx-champ-card {
          position: relative;
          text-align: center;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
          backdrop-filter: blur(20px);
          padding: 32px 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .vx-champ-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
        }

        @media (min-width: 640px) {
          .vx-champ-card {
            padding: 40px 32px;
          }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#020817", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", opacity: isInitialLoad ? 0 : 1, transition: "opacity 0.6s ease-out" }}>
          <div className="animate-float" style={{ position: "absolute", top: "10%", left: "10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(80px)", opacity: 0 }} />
          <div className="animate-float" style={{ position: "absolute", top: "50%", right: "5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(217, 70, 239, 0.2) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(80px)", opacity: 0, animationDelay: "1s" }} />
          <div className="animate-float" style={{ position: "absolute", bottom: "10%", left: "50%", transform: "translateX(-50%)", width: 550, height: 550, background: "radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(80px)", opacity: 0, animationDelay: "2s" }} />
        </div>

        <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255, 255, 255, 0.05)", backdropFilter: "blur(16px)", background: "rgba(2, 8, 23, 0.8)" }}>
          <div className="vx-container">
            <div className="vx-header-inner">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #7c3aed, #d946ef)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(124, 58, 237, 0.4)" }}>
                  <Zap style={{ width: 24, height: 24, color: "white" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "white", letterSpacing: "-0.02em", lineHeight: 1 }}>VibraXX</div>
                  <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Global Quiz Arena</div>
                </div>
              </div>

              <div className="vx-header-right">
                <button onClick={toggleMusic} style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(255, 255, 255, 0.05)", color: isPlaying ? "#22d3ee" : "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }} aria-label={isPlaying ? "Mute music" : "Play music"}>
                  {isPlaying ? <Volume2 style={{ width: 18, height: 18 }} /> : <VolumeX style={{ width: 18, height: 18 }} />}
                </button>

                {user ? (
                  <>
                    <div className="vx-hide-mobile" style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(251, 191, 36, 0.3)", background: "rgba(251, 191, 36, 0.1)", color: "#fbbf24", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                      <Sparkles style={{ width: 14, height: 14 }} />
                      {state?.live_credits ?? 0} Rounds
                    </div>
                    <button onClick={() => router.push("/buy")} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #7c3aed, #d946ef)", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "transform 0.2s", boxShadow: "0 8px 16px rgba(124, 58, 237, 0.4)" }}>
                      Buy Rounds
                    </button>
                    <button onClick={handleSignOut} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(255, 255, 255, 0.05)", color: "#94a3b8", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button onClick={handleSignIn} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #7c3aed, #d946ef)", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "transform 0.2s", boxShadow: "0 8px 16px rgba(124, 58, 237, 0.4)" }}>
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="vx-livebar">
          <div className="vx-livebar-inner">
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#22c55e", fontWeight: 700 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s ease-in-out infinite" }} />
              LIVE NOW
            </div>
            <div style={{ color: "#94a3b8", fontWeight: 500 }}>Next round in {formatTime(countdownSeconds)}</div>
            <div style={{ color: "#94a3b8", fontWeight: 500 }}>•</div>
            <div style={{ color: "#fbbf24", fontWeight: 600 }}>£1000 Monthly Prize Pool</div>
          </div>
        </div>

        {showAgeModal && <AgeVerificationModal onConfirm={handleAgeVerification} onCancel={() => { setShowAgeModal(false); setPendingAction(null); }} />}
        {showNoRoundsModal && <NoRoundsModal onBuyRounds={() => { setShowNoRoundsModal(false); router.push("/buy"); }} onCancel={() => setShowNoRoundsModal(false)} />}

        <main style={{ position: "relative", zIndex: 10 }}>
          <div className="vx-container">
            <div className="vx-hero">
              <div className="vx-hero-badge">
                <Trophy style={{ width: 16, height: 16 }} />
                <span>Compete for Real Prizes</span>
              </div>

              <h1 className="vx-hero-title">
                Test Your Knowledge in the <span className="vx-hero-neon">Global Quiz Arena</span>
              </h1>

              <p className="vx-hero-subtitle">
                Join thousands of players worldwide. Answer 20 questions in 4 minutes. Climb the leaderboard. Win big.
              </p>

              <div className="vx-countdown-panel">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#6b7280", textAlign: "center" }}>
                    Next Round Starts In
                  </div>
                  <div style={{ fontSize: 48, fontWeight: 900, color: "#ffffff", textAlign: "center", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                    {formatTime(countdownSeconds)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#22c55e" }} />
                    <span style={{ color: "#ffffff", fontWeight: 600 }}>{state?.active_players ?? 0}</span>
                    <span>players ready</span>
                  </div>
                </div>
              </div>

              <div className="vx-cta-wrap">
                <button className="vx-cta-btn vx-cta-live" onClick={handleStartLiveQuiz} aria-label="Enter live arena with prizes">
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,#7c3aed,#d946ef)" }} />
                  <Play style={{ position: "relative", zIndex: 10, width: 20, height: 20 }} />
                  <span style={{ position: "relative", zIndex: 10 }}>Enter Live Arena</span>
                  <ArrowRight style={{ position: "relative", zIndex: 10, width: 20, height: 20 }} />
                </button>

                <button className="vx-cta-btn vx-cta-free" onClick={handleStartFreeQuiz} aria-label="Try free practice quiz">
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,#06b6d4,#22d3ee)" }} />
                  <Gift style={{ position: "relative", zIndex: 10, width: 20, height: 20 }} />
                  <span style={{ position: "relative", zIndex: 10 }}>Try Free Quiz</span>
                  <ArrowRight style={{ position: "relative", zIndex: 10, width: 20, height: 20 }} />
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

        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", background: "rgba(255, 255, 255, 0.01)", padding: "32px 0" }}>
          <div className="vx-container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, maxWidth: 1024, margin: "0 auto" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle style={{ width: 20, height: 20, color: "#22c55e" }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", textAlign: "center" }}>SSL Encrypted</div>
                <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center", fontWeight: 500 }}>Bank-level security</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShoppingCart style={{ width: 20, height: 20, color: "#8b5cf6" }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", textAlign: "center" }}>Stripe Verified</div>
                <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center", fontWeight: 500 }}>Secure payments</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(251, 191, 36, 0.1)", border: "1px solid rgba(251, 191, 36, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertCircle style={{ width: 20, height: 20, color: "#fbbf24" }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", textAlign: "center" }}>18+ Only</div>
                <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center", fontWeight: 500 }}>Age verified</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Globe style={{ width: 20, height: 20, color: "#06b6d4" }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", textAlign: "center" }}>Global Arena</div>
                <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center", fontWeight: 500 }}>Worldwide players</div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}