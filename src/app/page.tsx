"use client";

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import Image from "next/image";
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
  BookOpen,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { playMenuMusic, stopMenuMusic } from "@/lib/audioManager";

// ============================================
// PRESENCE HOOK (KANONİK)
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
        console.error("[Presence] Heartbeat failed:", err);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [pageType]);
}

// ============================================
// MEMOIZED COMPONENTS (TASARIM DOKUNULMAZ)
// ============================================
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
        <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: "white" }}>
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
        <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: "white" }}>
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

// ============================================
// HOMEPAGE - KANONİK
// ============================================
export default function HomePage() {
  // ── STATE ──────────────────────────────────
  const [user, setUser] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Modal state
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [showNoRoundsModal, setShowNoRoundsModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"live" | "free" | null>(null);

  // ── RPC DATA (tek karar merkezi) ───────────
  const [activePlayers, setActivePlayers] = useState(0);
  const [userRounds, setUserRounds] = useState(0);
  const [ageVerified, setAgeVerified] = useState(false);
  const [nextRoundStart, setNextRoundStart] = useState<number | null>(null);
  const [totalRounds, setTotalRounds] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [champions, setChampions] = useState<any[]>([]);

  // ── REFS ───────────────────────────────────
  const mountedRef = useRef(false);
  const resumeIntentHandledRef = useRef(false);

  // ── COUNTDOWN (local tick, source: RPC) ────
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (nextRoundStart === null) return;
    const now = Math.floor(Date.now() / 1000);
    setCountdownSeconds(Math.max(0, nextRoundStart - now));
  }, [nextRoundStart]);

  useEffect(() => {
    if (countdownSeconds === null || countdownSeconds <= 0) return;
    const tick = setInterval(() => {
      setCountdownSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(tick);
  }, [countdownSeconds]);

  // ── PRESENCE ───────────────────────────────
  usePresence("homepage");

  // ── FETCH HOMEPAGE STATE (tek RPC) ─────────
  const fetchHomepageState = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_homepage_state");
      if (error || !data) {
        console.error("[Homepage] RPC error:", error);
        return;
      }
      if (!mountedRef.current) return;

      // Backend'den gelen verileri state'e yaz
      if (data.active_players !== undefined) setActivePlayers(data.active_players);
      if (data.user_credits !== undefined) setUserRounds(data.user_credits);
      if (data.age_verified !== undefined) setAgeVerified(data.age_verified);
      if (data.next_round_start !== undefined && data.next_round_start !== null) {
        setNextRoundStart(Math.floor(new Date(data.next_round_start).getTime() / 1000));
      }
      if (data.total_rounds !== undefined) setTotalRounds(data.total_rounds);
      if (data.total_participants !== undefined) setTotalParticipants(data.total_participants);

      // Champions
      const icons = [Trophy, Crown];
      const colors = ["#c084fc", "#22d3ee"];
      const gradients = [
        "linear-gradient(to bottom right, #8b5cf6, #d946ef)",
        "linear-gradient(to bottom right, #3b82f6, #06b6d4)",
      ];
      setChampions([
        {
          period: "Weekly",
          name: data.weekly_champion_name || "TBA",
          score: data.weekly_champion_score || 0,
          gradient: gradients[0],
          color: colors[0],
          icon: icons[0],
        },
        {
          period: "Monthly",
          name: data.monthly_champion_name || "TBA",
          score: data.monthly_champion_score || 0,
          gradient: gradients[1],
          color: colors[1],
          icon: icons[1],
        },
      ]);
    } catch (err) {
      console.error("[Homepage] Fetch failed:", err);
    }
  }, []);

  // ── POLLING: tek interval, 15s ─────────────
  useEffect(() => {
    fetchHomepageState();
    const interval = setInterval(fetchHomepageState, 15000);
    return () => clearInterval(interval);
  }, [fetchHomepageState]);

  // ── AUTH ───────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(() => setIsInitialLoad(false), 100);

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);
    };
    loadUser();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      // User değiştiğinde homepage state yeniden çek
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        fetchHomepageState();
      }
    });

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, [fetchHomepageState]);

  // ── POST-LOGIN INTENT (sign in sonrası resume) ─
  useEffect(() => {
    if (!user || resumeIntentHandledRef.current) return;
    const intent = sessionStorage.getItem("postLoginIntent");
    if (intent !== "live" && intent !== "free") return;

    resumeIntentHandledRef.current = true;
    sessionStorage.removeItem("postLoginIntent");

    // RPC yeniden çek (yeni user için credits/age)
    fetchHomepageState().then(() => {
      if (!mountedRef.current) return;
      // Intent'i yeniden trigger: buton handler çağrılacak
      if (intent === "live") navigateLive();
      if (intent === "free") navigateFree();
    });
  }, [user, fetchHomepageState]);

  // ── MUSIC ──────────────────────────────────
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

  useEffect(() => {
    const pref = localStorage.getItem("vibraxx_music");
    if (pref === "true") setIsPlaying(true);
    return () => stopMenuMusic();
  }, []);

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

  // ── AUTH ACTIONS ───────────────────────────
  const handleSignIn = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRounds(0);
    resumeIntentHandledRef.current = false;
  }, []);

  // ── NAVIGATION HELPERS ─────────────────────
  // ⚠️ window.location.href kullanılır - router.push çalışmıyor (confirmed)
  const navigateLive = useCallback(() => {
    // Age check → backend'den geldi
    if (!ageVerified) {
      setPendingAction("live");
      setShowAgeModal(true);
      return;
    }
    // Credits check → backend'den geldi
    if (userRounds <= 0) {
      setShowNoRoundsModal(true);
      return;
    }
    window.location.href = "/lobby";
  }, [ageVerified, userRounds]);

  const navigateFree = useCallback(() => {
    if (!ageVerified) {
      setPendingAction("free");
      setShowAgeModal(true);
      return;
    }
    window.location.href = "/free";
  }, [ageVerified]);

  // ── CTA HANDLERS ───────────────────────────
  const handleEnterLive = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) {
        sessionStorage.setItem("postLoginIntent", "live");
        handleSignIn();
        return;
      }
      navigateLive();
    },
    [user, handleSignIn, navigateLive]
  );

  const handleEnterFree = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) {
        sessionStorage.setItem("postLoginIntent", "free");
        handleSignIn();
        return;
      }
      navigateFree();
    },
    [user, handleSignIn, navigateFree]
  );

  // ── AGE VERIFY CONFIRM ─────────────────────
  const handleAgeVerification = useCallback(async () => {
    // localStorage'a yaz (fallback - backend'de de set edilmeli)
    localStorage.setItem("vibraxx_age_verified", "true");
    setAgeVerified(true);

    const action = pendingAction;
    setPendingAction(null);
    setShowAgeModal(false);

    if (action === "live") {
      if (userRounds <= 0) {
        setShowNoRoundsModal(true);
        return;
      }
      window.location.href = "/lobby";
    }
    if (action === "free") {
      window.location.href = "/free";
    }
  }, [pendingAction, userRounds]);

  // ── FORMAT ─────────────────────────────────
  const formatTime = useCallback((seconds: number | null) => {
    if (seconds === null || typeof seconds !== "number" || Number.isNaN(seconds)) return "--:--";
    const safe = Math.max(0, seconds);
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  // ── MEMOIZED DATA ──────────────────────────
  const statsCards = useMemo(
    () => [
      { icon: Globe, value: `${activePlayers}+`, label: "Active Players" },
      { icon: Zap, value: `${totalRounds.toLocaleString()}+`, label: "Rounds Played" },
      { icon: Trophy, value: `${totalParticipants.toLocaleString()}+`, label: "Competitors" },
    ],
    [activePlayers, totalRounds, totalParticipants]
  );

  // ============================================
  // RENDER
  // ============================================
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
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
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

        .vx-header {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          background: rgba(15, 23, 42, 0.92);
        }

        .vx-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 8px 0;
          flex-wrap: wrap;
        }

        .vx-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* ── MOBİLE HIDE: sadece desktop ── */
        .vx-hide-mobile {
          display: none;
        }

        @media (min-width: 640px) {
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
          0%, 100% { box-shadow: 0 0 0 rgba(139, 92, 246, 0); }
          50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
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
        }

        .vx-hero-badge::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: 9999px;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.4), transparent);
          z-index: -1;
        }

        @media (min-width: 640px) {
          .vx-hero-badge {
            font-size: 14px;
            padding: 10px 24px;
          }
        }

        .vx-hero-title {
          font-size: 56px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 16px;
        }

        .vx-hero-neon {
          background: linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #ffffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .vx-hero-subtitle {
          font-size: 20px;
          color: #94a3b8;
          margin-bottom: 40px;
          font-weight: 500;
        }

        @media (min-width: 640px) {
          .vx-hero-subtitle {
            font-size: 22px;
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
          color: white;
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
            min-height: 150px;
            padding: 1.75rem;
          }
        }

        .vx-stat-label {
          color: #6b7280;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .vx-stat-value {
          font-weight: 800;
          font-size: 28px;
          color: #ffffff;
        }

        @media (min-width: 640px) {
          .vx-stat-value {
            font-size: 32px;
          }
        }

        .vx-champions-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        @media (min-width: 640px) {
          .vx-champions-title {
            font-size: 32px;
            margin-bottom: 32px;
          }
        }

        .vx-champions-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 56px;
        }

        @media (min-width: 768px) {
          .vx-champions-grid {
            grid-template-columns: repeat(2, minmax(0, 400px));
            justify-content: center;
            gap: 20px;
          }
        }

        .vx-champ-card {
          position: relative;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          backdrop-filter: blur(20px);
          text-align: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .vx-champ-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100px;
          right: -100px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        }

        .vx-champ-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        @media (min-width: 640px) {
          .vx-champ-card {
            padding: 28px;
          }
        }

        .vx-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(9, 9, 13, 0.96);
          backdrop-filter: blur(16px);
          padding: 32px 16px 24px;
          text-align: center;
          color: #64748b;
          font-size: 12px;
        }

        @media (min-width: 640px) {
          .vx-footer {
            font-size: 13px;
            padding: 40px 24px 28px;
          }
        }

        .vx-footer-links {
          margin: 16px 0 20px;
          display: flex;
          gap: 8px 20px;
          justify-content: center;
          flex-wrap: wrap;
          align-items: center;
        }

        .vx-footer-divider {
          width: 1px;
          height: 14px;
          background: rgba(255, 255, 255, 0.2);
        }

        .vx-footer-links a {
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.2s;
          font-size: 12px;
        }

        .vx-footer-links a:hover {
          color: #c4b5fd;
        }

        .vx-footer-legal {
          max-width: 800px;
          margin: 0 auto 16px;
          font-size: 11px;
          line-height: 1.6;
          color: #64748b;
        }

        .vx-footer-company {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 11px;
          color: #64748b;
        }

        @media (min-width: 640px) {
          .vx-footer-legal { font-size: 12px; }
          .vx-footer-company { font-size: 12px; }
        }

        /* ── MOBILE OVERRIDES ── */
        @media (max-width: 640px) {
          .vx-hero-title {
            font-size: 36px !important;
            line-height: 1.2 !important;
            padding: 0 8px;
          }
          .vx-hero-subtitle {
            font-size: 16px !important;
            padding: 0 12px;
          }
          .vx-cta-wrap {
            flex-direction: column !important;
            gap: 12px !important;
            width: 100%;
            padding: 0 4px;
          }
          .vx-cta-btn {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 14px !important;
          }
          .vx-livebar {
            padding: 10px 0 !important;
          }
          .vx-livebar-inner {
            font-size: 11px !important;
            gap: 6px !important;
            flex-wrap: wrap;
            justify-content: center;
          }
          .vx-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .vx-champions-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .vx-footer-links {
            flex-direction: column !important;
            gap: 8px !important;
            align-items: center !important;
          }
          .vx-footer-divider {
            display: none !important;
          }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#020817",
          color: "white",
          position: "relative",
          overflow: "hidden",
          opacity: isInitialLoad ? 0 : 1,
          transition: "opacity 0.3s ease-in",
        }}
      >
        {/* ── NEON ORBS (TASARIM DOKUNULMAZ) ── */}
        <div
          className="animate-float"
          style={{
            position: "fixed",
            top: "60px",
            left: "-40px",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background: "#7c3aed",
            opacity: 0,
            filter: "blur(70px)",
            zIndex: 0,
            pointerEvents: "none",
            animation: isInitialLoad ? "none" : undefined,
            transition: "opacity 0.8s ease-in 0.3s",
          }}
        />
        <div
          className="animate-float"
          style={{
            position: "fixed",
            bottom: "40px",
            right: "-40px",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background: "#d946ef",
            opacity: 0,
            filter: "blur(70px)",
            zIndex: 0,
            animationDelay: "2s",
            pointerEvents: "none",
            animation: isInitialLoad ? "none" : undefined,
            transition: "opacity 0.8s ease-in 0.5s",
          }}
        />

        {/* ── MODALS ── */}
        {showAgeModal && (
          <AgeVerificationModal
            onConfirm={handleAgeVerification}
            onCancel={() => { setShowAgeModal(false); setPendingAction(null); }}
          />
        )}

        {showNoRoundsModal && (
          <NoRoundsModal
            onBuyRounds={() => {
              setShowNoRoundsModal(false);
              if (!user) {
                sessionStorage.setItem("pendingBuyRounds", "true");
                handleSignIn();
                return;
              }
              window.location.href = "/buy";
            }}
            onCancel={() => setShowNoRoundsModal(false)}
          />
        )}

        {/* ── HEADER ── */}
        <header className="vx-header">
          <div className="vx-container">
            <div className="vx-header-inner">
              {/* Logo: 100→80 (%20 küçüt) */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <div
                  style={{
                    position: "relative",
                    width: 80,
                    height: 80,
                    borderRadius: "9999px",
                    padding: 4,
                    background: "radial-gradient(circle at 0 0,#7c3aed,#d946ef)",
                    boxShadow: "0 0 30px rgba(124,58,237,0.6)",
                    flexShrink: 0,
                  }}
                >
                  <div
                    className="animate-glow"
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src="/images/logo.png"
                      alt="VibraXX Logo"
                      fill
                      sizes="72px"
                      style={{ objectFit: "contain" }}
                      priority
                    />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#c4b5fd",
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Live Quiz Arena
                  </span>
                </div>
              </div>

              {/* Header Right */}
              <div className="vx-header-right">
                {/* Music Toggle */}
                <button
                  onClick={toggleMusic}
                  aria-label={isPlaying ? "Mute music" : "Play music"}
                  style={{
                    padding: 9,
                    borderRadius: 12,
                    border: "1px solid rgba(148,163,253,0.22)",
                    background: "rgba(2,6,23,0.9)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {isPlaying ? (
                    <Volume2 style={{ width: 18, height: 18, color: "#a78bfa" }} />
                  ) : (
                    <VolumeX style={{ width: 18, height: 18, color: "#6b7280" }} />
                  )}
                </button>

                {/* Buy Round - desktop only */}
                <button
                  onClick={() => { window.location.href = "/buy"; }}
                  className="vx-hide-mobile"
                  aria-label="Buy quiz rounds"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(251,191,36,0.3)",
                    background: "linear-gradient(135deg, rgba(251,191,36,0.1), rgba(245,158,11,0.1))",
                    color: "#fbbf24",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.2s",
                  }}
                >
                  <ShoppingCart style={{ width: 14, height: 14 }} />
                  {user && userRounds > 0 ? `${userRounds} Rounds` : "Buy Round"}
                </button>

                {/* Leaderboard - desktop only */}
                <button
                  onClick={() => { window.location.href = "/leaderboard"; }}
                  className="vx-hide-mobile"
                  aria-label="View leaderboard"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(148,163,253,0.22)",
                    background: "transparent",
                    color: "white",
                    fontSize: 13,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.2s",
                  }}
                >
                  <Trophy style={{ width: 14, height: 14, color: "#a78bfa" }} />
                  Leaderboard
                </button>

                {/* Auth Section */}
                {user ? (
                  <>
                    {/* Profile - desktop only */}
                    <button
                      onClick={() => { window.location.href = "/profile"; }}
                      className="vx-hide-mobile"
                      aria-label="View profile"
                      style={{
                        padding: "8px 16px",
                        borderRadius: 12,
                        border: "1px solid rgba(148,163,253,0.26)",
                        background: "rgba(9,9,13,0.96)",
                        color: "white",
                        fontSize: 13,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "9999px",
                          overflow: "hidden",
                          backgroundColor: "#020817",
                          border: "1px solid rgba(148,163,253,0.26)",
                        }}
                      >
                        <Image
                          src={user?.user_metadata?.avatar_url || "/images/logo.png"}
                          alt="User avatar"
                          width={20}
                          height={20}
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#e5e7eb",
                          maxWidth: 100,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user.user_metadata?.full_name || "Player"}
                      </span>
                    </button>

                    {/* Sign Out - MOBİLDE DE GÖRÜNÜR (vx-hide-mobile kaldırıldı) */}
                    <button
                      onClick={handleSignOut}
                      aria-label="Sign out"
                      style={{
                        position: "relative",
                        padding: "8px 18px",
                        borderRadius: 12,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "white",
                        overflow: "hidden",
                        background: "transparent",
                        transition: "transform 0.2s",
                      }}
                    >
                      <div
                        className="animate-shimmer"
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(90deg,#ef4444,#f97316,#ef4444)",
                          pointerEvents: "none",
                        }}
                      />
                      <span style={{ position: "relative", zIndex: 10 }}>Sign Out</span>
                    </button>
                  </>
                ) : (
                  /* Sign In */
                  <button
                    onClick={() => handleSignIn()}
                    aria-label="Sign in with Google"
                    style={{
                      position: "relative",
                      padding: "8px 18px",
                      borderRadius: 12,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "white",
                      overflow: "hidden",
                      background: "transparent",
                      transition: "transform 0.2s",
                    }}
                  >
                    <div
                      className="animate-shimmer"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(90deg,#7c3aed,#d946ef,#7c3aed)",
                        pointerEvents: "none",
                      }}
                    />
                    <span style={{ position: "relative", zIndex: 10 }}>Sign in with Google</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── LIVE BANNER ── */}
        <div className="vx-livebar">
          <div className="vx-container">
            <div className="vx-livebar-inner">
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <div
                  className="animate-pulse-slow"
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "9999px",
                    background: "#22c55e",
                    boxShadow: "0 0 12px #22c55e, 0 0 24px rgba(34, 197, 94, 0.4)",
                  }}
                />
                <span
                  style={{
                    color: "#22c55e",
                    fontWeight: 700,
                    fontSize: 15,
                    textShadow: "0 0 20px rgba(34, 197, 94, 0.5)",
                    letterSpacing: "0.1em",
                  }}
                >
                  LIVE
                </span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#cbd5e1" }}>
                <Globe style={{ width: 14, height: 14, color: "#a78bfa" }} />
                <span style={{ fontWeight: 700, color: "white" }}>{activePlayers.toLocaleString()}</span>
                <span>players online</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── HERO ── */}
        <main className="vx-hero">
          <div className="vx-container">
            <div className="vx-hero-badge">
              <Crown style={{ width: 16, height: 16, color: "#fbbf24" }} />
              Skill-based quiz. £1,000 monthly prize
              <Trophy style={{ width: 16, height: 16, color: "#fbbf24" }} />
            </div>

            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "8px 18px",
                  borderRadius: 10,
                  background: "rgba(34, 197, 94, 0.1)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  fontSize: 13,
                  color: "#4ade80",
                  fontWeight: 600,
                }}
              >
                <AlertCircle style={{ width: 15, height: 15 }} />
                *Terms apply
              </div>
            </div>

            <h1 className="vx-hero-title">
              <span className="vx-hero-neon">The Next Generation Live Quiz</span>
            </h1>

            <p className="vx-hero-subtitle">Global skill-based quiz competition</p>

            {/* ── COUNTDOWN PANEL ── */}
            <div className="vx-countdown-panel">
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: -100,
                  right: -100,
                  height: 1.5,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "80%",
                  height: 40,
                  background: "radial-gradient(ellipse, rgba(124, 58, 237, 0.15), transparent)",
                  filter: "blur(20px)",
                  pointerEvents: "none",
                }}
              />

              <div style={{ position: "relative", zIndex: 10 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#9ca3af",
                    marginBottom: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    textAlign: "center",
                  }}
                >
                  Next Round
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 42,
                      fontWeight: 800,
                      color: "#ffffff",
                      fontFamily: "ui-monospace, monospace",
                      letterSpacing: "0.02em",
                      textShadow: "0 2px 12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 255, 255, 0.1)",
                      lineHeight: 1,
                    }}
                  >
                    {formatTime(countdownSeconds)}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "6px 14px",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                      boxShadow: "0 0 24px rgba(34, 197, 94, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <div
                      className="animate-pulse-slow"
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#ffffff",
                        boxShadow: "0 0 10px #ffffff, 0 0 20px rgba(255, 255, 255, 0.5)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#ffffff",
                        letterSpacing: "0.1em",
                        textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      LIVE
                    </span>
                  </div>
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
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#22c55e" }} />
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>{activePlayers.toLocaleString()}</span>
                  <span>players ready</span>
                </div>
              </div>
            </div>

            {/* ── CTA BUTTONS ── */}
            <div className="vx-cta-wrap">
              <button
                className="vx-cta-btn vx-cta-live"
                type="button"
                onClick={handleEnterLive}
                aria-label="Enter live arena with prizes"
              >
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,#7c3aed,#d946ef)", pointerEvents: "none" }} />
                <Play style={{ position: "relative", zIndex: 10, width: 20, height: 20 }} />
                <span style={{ position: "relative", zIndex: 10 }}>Enter Live Arena</span>
                <ArrowRight style={{ position: "relative", zIndex: 10, width: 20, height: 20 }} />
              </button>

              <button
                className="vx-cta-btn vx-cta-free"
                type="button"
                onClick={handleEnterFree}
                aria-label="Try free practice quiz"
              >
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,#06b6d4,#22d3ee)", pointerEvents: "none" }} />
                <Gift style={{ position: "relative", zIndex: 10, width: 20, height: 20 }} />
                <span style={{ position: "relative", zIndex: 10 }}>Try Free Quiz</span>
                <ArrowRight style={{ position: "relative", zIndex: 10, width: 20, height: 20 }} />
              </button>
            </div>

            {/* ── STATS ── */}
            <div className="vx-stats-grid">
              {statsCards.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>

            {/* ── CHAMPIONS ── */}
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
        </main>

        {/* ── TRUST ELEMENTS ── */}
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
              {[
                { bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.2)", icon: CheckCircle, iconColor: "#22c55e", title: "SSL Encrypted", sub: "Bank-level security" },
                { bg: "rgba(139, 92, 246, 0.1)", border: "rgba(139, 92, 246, 0.2)", icon: ShoppingCart, iconColor: "#8b5cf6", title: "Stripe Verified", sub: "Secure payments" },
                { bg: "rgba(251, 191, 36, 0.1)", border: "rgba(251, 191, 36, 0.2)", icon: AlertCircle, iconColor: "#fbbf24", title: "18+ Only", sub: "Age verified" },
                { bg: "rgba(6, 182, 212, 0.1)", border: "rgba(6, 182, 212, 0.2)", icon: Globe, iconColor: "#06b6d4", title: "Global Arena", sub: "Worldwide players" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 16 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: item.bg,
                        border: `1px solid ${item.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon style={{ width: 20, height: 20, color: item.iconColor }} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", textAlign: "center" }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center", fontWeight: 500 }}>{item.sub}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="vx-footer">
          <div className="vx-container">
            <div className="vx-footer-legal">
              <strong style={{ color: "#94a3b8" }}>Educational Quiz Competition.</strong> 18+ only. This is a 100% skill-based
              knowledge competition with no element of chance. Entry fees apply. Prize pool activates with 3000+ monthly participants.
              See{" "}
              <a href="/terms" style={{ color: "#a78bfa", textDecoration: "underline" }}>
                Terms & Conditions
              </a>{" "}
              for full details.
            </div>

            <nav className="vx-footer-links" aria-label="Footer navigation">
              <a href="/privacy">Privacy Policy</a>
              <span className="vx-footer-divider" />
              <a href="/terms">Terms & Conditions</a>
              <span className="vx-footer-divider" />
              <a href="/cookies">Cookie Policy</a>
              <span className="vx-footer-divider" />
              <a href="/how-it-works">How It Works</a>
              <span className="vx-footer-divider" />
              <a href="/rules">Quiz Rules</a>
              <span className="vx-footer-divider" />
              <a href="/complaints">Complaints</a>
              <span className="vx-footer-divider" />
              <a href="/refunds">Refund Policy</a>
              <span className="vx-footer-divider" />
              <a href="/about">About Us</a>
              <span className="vx-footer-divider" />
              <a href="/contact">Contact</a>
              <span className="vx-footer-divider" />
              <a href="/faq">FAQ</a>
            </nav>

            <div className="vx-footer-company">
              <div style={{ marginBottom: 8, textAlign: "center" }}>© 2025 VibraXX. Operated by Sermin Limited (UK)</div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, textAlign: "center" }}>
                Registered in England & Wales | All rights reserved
              </div>
              <div style={{ marginBottom: 10, textAlign: "center" }}>
                <a href="mailto:team@vibraxx.com" style={{ color: "#a78bfa", textDecoration: "none", fontSize: 12, fontWeight: 600 }}>
                  team@vibraxx.com
                </a>
              </div>
              <div style={{ fontSize: 11, textAlign: "center" }}>
                Payment processing by{" "}
                <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" style={{ color: "#a78bfa", textDecoration: "none" }}>
                  Stripe
                </a>{" "}
                | Secure SSL encryption | Skill-based competition - Not gambling
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
