"use client";

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import Image from "next/image";
import {
  Crown,
  Trophy,
  Zap,
  Play,
  Volume2,
  VolumeX,
  Globe,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Flame,
  Gift,
  Smartphone,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { playMenuMusic, stopMenuMusic } from "@/lib/audioManager";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";

// ============================================
// MEMOIZED COMPONENTS
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
  const isEmpty = !champion.name || champion.name === "TBA" || champion.score === 0;

  // Period → leaderboard renk/border sistemi
  const periodStyle = {
    Today:   { border: "2px solid rgba(249,115,22,0.7)",  bg: "linear-gradient(135deg,rgba(249,115,22,0.18),rgba(234,88,12,0.12))",  glow: "rgba(249,115,22,0.35)",  gradient: "linear-gradient(90deg,#f97316,#ea580c)",  rankBg: "linear-gradient(135deg,#f97316,#ea580c)" },
    Weekly:  { border: "2px solid rgba(192,132,252,0.7)", bg: "linear-gradient(135deg,rgba(192,132,252,0.18),rgba(139,92,246,0.12))", glow: "rgba(192,132,252,0.3)",  gradient: "linear-gradient(90deg,#c084fc,#a855f7)",  rankBg: "linear-gradient(135deg,#c084fc,#a855f7)" },
    Monthly: { border: "3px solid rgba(251,191,36,0.8)",  bg: "linear-gradient(135deg,rgba(251,191,36,0.2),rgba(245,158,11,0.14))", glow: "rgba(251,191,36,0.5)",  gradient: "linear-gradient(90deg,#fbbf24,#f59e0b,#fbbf24)", rankBg: "linear-gradient(135deg,#fbbf24,#f59e0b)" },
  }[champion.period as "Today" | "Weekly" | "Monthly"];

  const periodEmoji = { Today: "🏅", Weekly: "🎟️", Monthly: "👑" }[champion.period as "Today" | "Weekly" | "Monthly"];

  if (isEmpty) {
    return (
      <div
        style={{
          padding: "clamp(16px,3.5vw,24px)",
          borderRadius: "clamp(14px,4vw,22px)",
          border: periodStyle.border,
          background: periodStyle.bg,
          backdropFilter: "blur(20px)",
          textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          boxShadow: `0 0 24px ${periodStyle.glow}`,
        }}
      >
        <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 4 }}>{periodEmoji}</div>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#6b7280" }}>
          {champion.period} Champion
        </div>
        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, fontWeight: 500 }}>
          {champion.period === "Today" && "Resets at midnight UTC"}
          {champion.period === "Weekly" && "Resets every Monday UTC"}
          {champion.period === "Monthly" && "Resets at month end UTC"}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "clamp(16px,3.5vw,24px)",
        borderRadius: "clamp(14px,4vw,22px)",
        border: periodStyle.border,
        background: periodStyle.bg,
        backdropFilter: "blur(20px)",
        textAlign: "center",
        boxShadow: `0 0 32px ${periodStyle.glow}`,
        transition: "transform 0.3s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
    >
      {/* Avatar ring */}
      <div style={{
        position: "relative",
        width: "clamp(64px,14vw,88px)", height: "clamp(64px,14vw,88px)",
        margin: "0 auto 14px",
        borderRadius: "50%", padding: 3,
        background: periodStyle.rankBg,
        boxShadow: `0 0 24px ${periodStyle.glow}`,
      }}>
        <div style={{
          width: "100%", height: "100%", borderRadius: "50%",
          background: "#1e293b", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "clamp(26px,6vw,40px)",
          overflow: "hidden",
        }}>
          {champion.avatarUrl ? (
            <Image src={champion.avatarUrl} alt={champion.name} fill sizes="88px" style={{ objectFit: "cover", borderRadius: "50%" }} />
          ) : (
            <span>{periodEmoji}</span>
          )}
        </div>
        {/* Rank badge */}
        <div style={{
          position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
          width: "clamp(22px,5vw,30px)", height: "clamp(22px,5vw,30px)", borderRadius: "50%",
          background: periodStyle.rankBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid #0f172a", color: "#0f172a", fontWeight: 900,
          fontSize: "clamp(9px,2vw,12px)",
        }}>1</div>
      </div>

      {/* Period label */}
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#6b7280", marginBottom: 6 }}>
        {champion.period} Champion
      </div>

      {/* Name */}
      <div style={{
        fontSize: "clamp(14px,3vw,18px)", fontWeight: 800, marginBottom: 8,
        color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {champion.name}
      </div>

      {/* Score */}
      <div style={{
        fontSize: "clamp(20px,5vw,30px)", fontWeight: 900, lineHeight: 1, marginBottom: 10,
        background: periodStyle.gradient,
        backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>
        {champion.score.toLocaleString()}
      </div>
      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>pts</div>
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
          <strong style={{ color: "#fbbf24" }}>up to £1,000 monthly prize pool</strong>!
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [globalTimeLeft, setGlobalTimeLeft] = useState<number | null>(null);
  const [activePlayers, setActivePlayers] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [champions, setChampions] = useState<any[]>([]);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"live" | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [userRounds, setUserRounds] = useState(0);
  const [showNoRoundsModal, setShowNoRoundsModal] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [totalRounds, setTotalRounds] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);

  // PWA Install
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  const deferredPromptRef = useRef<any>(null);

  const countdownPauseUntilRef = useRef<number>(0);
  const mountedRef = useRef<boolean>(false);
  const resumeIntentHandledRef = useRef<boolean>(false);

  // ============================================
  // FETCH HOMEPAGE STATE (TEK RPC)
  // ============================================
  const fetchHomepageState = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      // Heartbeat — anlık online sayısı için
      if (currentUser?.id) {
        await supabase.rpc("upsert_user_public", { p_user_id: currentUser.id });
      }

      const { data, error } = await supabase.rpc("get_homepage_state", {
        p_user_id: currentUser?.id ?? null,
      });

      if (error || !data) {
        console.error("[Homepage] RPC error:", error);
        return;
      }
      if (!mountedRef.current) return;

      if (data.active_players !== undefined) {
        console.log("[Homepage] active_players from RPC:", data.active_players);
        setActivePlayers(data.active_players);
      }
      if (data.live_credits !== undefined)       setUserRounds(data.live_credits ?? 0);
      if (data.total_rounds !== undefined)       setTotalRounds(data.total_rounds);
      if (data.total_participants !== undefined) setTotalParticipants(data.total_participants);

      if (data.next_round_in_seconds != null) {
        setGlobalTimeLeft(Math.max(0, data.next_round_in_seconds));
      }

      const icons = [Flame, Trophy, Crown];
      const colors = ["#f97316", "#c084fc", "#22d3ee"];
      setChampions([
        {
          period: "Today",
          name: data.today_champion_name || "TBA",
          score: data.today_champion_score || 0,
          avatarUrl: data.today_champion_avatar || "",
          color: colors[0],
          icon: icons[0],
        },
        {
          period: "Weekly",
          name: data.weekly_champion_name || "TBA",
          score: data.weekly_champion_score || 0,
          avatarUrl: data.weekly_champion_avatar || "",
          color: colors[1],
          icon: icons[1],
        },
        {
          period: "Monthly",
          name: data.monthly_champion_name || "TBA",
          score: data.monthly_champion_score || 0,
          avatarUrl: data.monthly_champion_avatar || "",
          color: colors[2],
          icon: icons[2],
        },
      ]);
    } catch (err) {
      console.error("[Homepage] Fetch failed:", err);
    }
  }, []);

  // ============================================
  // INITIAL MOUNT
  // ============================================
  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(() => setIsInitialLoad(false), 100);
    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, []);

  // ============================================
  // PWA INSTALL PROMPT
  // ============================================
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      if (deferredPromptRef.current && mountedRef.current) {
        setShowPWAPrompt(true);
      }
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowPWAPrompt(false);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handlePWAInstall = async () => {
    if (!deferredPromptRef.current) return;
    deferredPromptRef.current.prompt();
    const { outcome } = await deferredPromptRef.current.userChoice;
    if (outcome === "accepted") setShowPWAPrompt(false);
    deferredPromptRef.current = null;
  };

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

  // ============================================
  // POLLING
  // ============================================
  useEffect(() => {
    fetchHomepageState();
    const interval = setInterval(fetchHomepageState, 15000);
    return () => clearInterval(interval);
  }, [fetchHomepageState]);

  // Countdown tick
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      const now = Date.now();
      if (now < countdownPauseUntilRef.current) return;
      setGlobalTimeLeft((prev) => (prev && prev > 0 ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, []);

  // ============================================
  // AUTH LISTENER
  // ============================================
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);

      if (data.user && sessionStorage.getItem("pendingBuyRounds") === "true") {
        sessionStorage.removeItem("pendingBuyRounds");
        setTimeout(() => {
          if (!mountedRef.current) return;
          window.location.href = "/buy";
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
            window.location.href = "/buy";
          }, 300);
        }
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || resumeIntentHandledRef.current) return;
    const intent = sessionStorage.getItem("postLoginIntent");
    if (intent !== "live") return;

    resumeIntentHandledRef.current = true;
    sessionStorage.removeItem("postLoginIntent");

    const ageOk = localStorage.getItem("vibraxx_age_verified") === "true";
    if (!ageOk) {
      setPendingAction("live");
      setShowAgeModal(true);
      return;
    }

    fetchHomepageState().then(() => {
      if (!mountedRef.current) return;
      window.location.href = "/lobby";
    });
  }, [user, fetchHomepageState]);

  // ============================================
  // MUSIC
  // ============================================
  useEffect(() => {
    const musicPref = localStorage.getItem("vibraxx_music");
    if (musicPref === "true") setIsPlaying(true);
    return () => stopMenuMusic();
  }, []);

  useEffect(() => {
    const handleFirstInteraction = () => {
      const savedPref = localStorage.getItem("vibraxx_music");
      if (savedPref !== "false") {
        playMenuMusic();
        setIsPlaying(true);
        localStorage.setItem("vibraxx_music", "true");
      }
      setHasInteracted(true);
    };
    document.addEventListener("click", handleFirstInteraction, { once: true });
    document.addEventListener("touchstart", handleFirstInteraction, { once: true });
    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []); // boş dependency — sadece mount'ta bir kez

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

  // ============================================
  // AUTH ACTIONS
  // ============================================
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
    await fetchHomepageState();
    if (action === "live") window.location.href = "/lobby";
  }, [pendingAction, fetchHomepageState]);

  const formatTime = useCallback((seconds: number | null) => {
    if (seconds === null || typeof seconds !== "number" || Number.isNaN(seconds))
      return "--:--";
    const safe = Math.max(0, seconds);
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  // ============================================
  // STATS CARDS
  // ============================================
  const statsCards = useMemo(
    () => [
      { icon: Globe, value: `${activePlayers}+`, label: "Active Players" },
      { icon: Zap, value: `${totalRounds.toLocaleString()}+`, label: "Rounds Played" },
      { icon: Trophy, value: `${totalParticipants.toLocaleString()}+`, label: "Competitors" },
    ],
    [activePlayers, totalRounds, totalParticipants]
  );

  return (
    <>
      <style jsx global>{`
        :root {
          color-scheme: dark;
          background-color: #020817;
        }
        * { box-sizing: border-box; }
        body { background-color: #020817; margin: 0; padding: 0; }

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
        @keyframes badge-shine {
          0% { left: -100%; }
          50%, 100% { left: 100%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 rgba(139, 92, 246, 0); }
          50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
        }
        @keyframes slide-shine {
          0% { left: -100%; }
          50%, 100% { left: 100%; }
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

        .vx-container { max-width: 1400px; margin: 0 auto; padding: 0 16px; }
        @media (min-width: 640px) { .vx-container { padding: 0 24px; } }

        .vx-header {
          position: sticky; top: 0; z-index: 50;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          background: rgba(15, 23, 42, 0.92);
        }
        .vx-header-inner {
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; padding: 8px 0; flex-wrap: wrap;
        }
        .vx-header-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .vx-hide-mobile { display: none; }
        @media (min-width: 640px) {
          .vx-header-inner { height: 80px; flex-wrap: nowrap; }
          .vx-header-right { gap: 12px; }
          .vx-hide-mobile { display: inline-flex; }
        }
        @media (max-width: 639px) {
          .vx-header-inner { justify-content: space-between; padding: 12px 0; }
          .vx-header-right { justify-content: flex-end; }
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
        .vx-livebar-inner {
          display: flex; flex-wrap: wrap; gap: 10px;
          justify-content: center; align-items: center; padding: 8px 16px;
        }
        @media (min-width: 640px) { .vx-livebar-inner { font-size: 14px; padding: 10px 24px; } }

        .vx-hero { padding: 72px 16px 80px; text-align: center; }
        @media (min-width: 640px) { .vx-hero { padding: 96px 24px 96px; } }

        .vx-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 20px; border-radius: 9999px;
          border: 2px solid rgba(251, 191, 36, 0.4);
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1));
          color: #fbbf24; font-size: 12px; margin-bottom: 12px;
          backdrop-filter: blur(10px); font-weight: 700;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.3), inset 0 0 20px rgba(251, 191, 36, 0.1);
          position: relative; overflow: hidden;
        }
        .vx-hero-badge::before {
          content: ""; position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: badge-shine 3s infinite;
        }
        @media (min-width: 640px) { .vx-hero-badge { padding: 10px 24px; font-size: 14px; margin-bottom: 14px; } }

        .vx-hero-title {
          font-size: clamp(26px, 6vw, 42px); font-weight: 800;
          line-height: 1.2; margin-bottom: 18px; letter-spacing: -0.03em;
        }
        .vx-hero-neon {
          display: inline-block;
          background: linear-gradient(90deg, #7c3aed, #22d3ee, #f97316, #d946ef, #7c3aed);
          background-size: 250% 100%;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: shimmer 4s linear infinite;
          text-shadow: 0 0 14px rgba(124, 58, 237, 0.45);
        }
        .vx-hero-subtitle {
          font-size: 16px; color: #94a3b8; max-width: 640px;
          margin: 0 auto 32px; line-height: 1.6;
        }
        @media (min-width: 640px) { .vx-hero-subtitle { font-size: 18px; margin-bottom: 40px; } }

        .vx-countdown-panel {
          margin: 24px auto 28px; max-width: 380px; padding: 20px 26px;
          border-radius: 18px;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          border: 2px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 2px 0 rgba(255, 255, 255, 0.08);
          position: relative; overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .vx-countdown-panel:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 2px 0 rgba(255, 255, 255, 0.12), 0 0 40px rgba(124, 58, 237, 0.3);
        }

        .vx-cta-wrap {
          display: flex; flex-direction: column; gap: 12px;
          align-items: center; justify-content: center;
          margin-bottom: 48px; width: 100%; max-width: 100%; padding: 0 16px;
        }
        @media (min-width: 640px) { .vx-cta-wrap { flex-direction: row; margin-bottom: 64px; padding: 0; } }

        .vx-cta-btn {
          position: relative; padding: 14px 28px; border-radius: 14px;
          border: none; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          gap: 10px; font-weight: 700; font-size: 15px;
          overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;
          width: auto; min-width: clamp(180px, 50vw, 260px); color: white;
        }
        .vx-cta-btn:hover { transform: translateY(-2px); }
        .vx-cta-btn:active { transform: translateY(0); }
        @media (min-width: 640px) {
          .vx-cta-btn { padding: 18px 34px; font-size: 18px; min-width: 260px; }
        }
        .vx-cta-live { box-shadow: 0 20px 40px -16px rgba(139, 92, 246, 0.6); }

        .vx-stats-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 64px; }
        @media (min-width: 640px) {
          .vx-stats-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin-bottom: 80px; }
        }

        .vx-stat-card {
          position: relative; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center;
          border-radius: 16px;
          border: 1px solid rgba(34, 197, 94, 0.35);
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), rgba(255, 255, 255, 0.01));
          backdrop-filter: blur(20px); min-height: 120px; padding: 1.5rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden;
          box-shadow: 0 0 18px rgba(34, 197, 94, 0.12), inset 0 1px 0 rgba(34, 197, 94, 0.08);
        }
        .vx-stat-card::before {
          content: ""; position: absolute; top: 0; left: -100px; right: -100px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.4), transparent);
        }
        .vx-stat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(34, 197, 94, 0.6);
          box-shadow: 0 0 28px rgba(34, 197, 94, 0.25), inset 0 1px 0 rgba(34, 197, 94, 0.12);
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(255, 255, 255, 0.02));
        }
        @media (min-width: 640px) { .vx-stat-card { min-height: 150px; padding: 1.75rem; } }
        .vx-stat-label { color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
        .vx-stat-value { font-weight: 800; font-size: 28px; color: #ffffff; }
        @media (min-width: 640px) { .vx-stat-value { font-size: 32px; } }

        .vx-champions-title {
          font-size: 24px; font-weight: 700; margin-bottom: 24px;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        @media (min-width: 640px) { .vx-champions-title { font-size: 32px; margin-bottom: 32px; } }

        .vx-champions-grid {
          display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 56px;
        }
        @media (min-width: 768px) {
          .vx-champions-grid {
            grid-template-columns: repeat(3, minmax(0, 360px));
            justify-content: center; gap: 20px;
          }
        }

        .vx-champ-card {
          position: relative; padding: 24px; border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          backdrop-filter: blur(20px); text-align: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }
        .vx-champ-card::before {
          content: ""; position: absolute; top: 0; left: -100px; right: -100px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        }
        .vx-champ-card:hover {
          transform: translateY(-2px); border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        @media (min-width: 640px) { .vx-champ-card { padding: 28px; } }

        @media (max-width: 640px) {
          .vx-countdown-panel { padding: 16px 18px; margin-left: 12px; margin-right: 12px; }
          .vx-countdown-time { font-size: 34px !important; }
          .vx-hero-title { font-size: 36px !important; line-height: 1.2 !important; padding: 0 8px; }
          .vx-hero-subtitle { font-size: 16px !important; padding: 0 12px; }
          .vx-cta-wrap { flex-direction: column !important; gap: 12px !important; width: 100%; padding: 0 16px; }
          .vx-cta-btn { width: auto !important; min-width: clamp(200px, 70vw, 300px) !important; font-size: 14px !important; }
          .vx-livebar { padding: 10px 0 !important; }
          .vx-livebar-inner { font-size: 11px !important; gap: 6px !important; flex-wrap: wrap; justify-content: center; }
          .vx-stats-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .vx-champions-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
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
        {/* Neon Orbs */}
        <div
          className="animate-float"
          style={{
            position: "fixed", top: "60px", left: "-40px",
            width: "260px", height: "260px", borderRadius: "50%",
            background: "#7c3aed", opacity: 0, filter: "blur(70px)",
            zIndex: 0, pointerEvents: "none",
            animation: isInitialLoad ? "none" : undefined,
            transition: "opacity 0.8s ease-in 0.3s",
          }}
        />
        <div
          className="animate-float"
          style={{
            position: "fixed", bottom: "40px", right: "-40px",
            width: "260px", height: "260px", borderRadius: "50%",
            background: "#d946ef", opacity: 0, filter: "blur(70px)",
            zIndex: 0, animationDelay: "2s", pointerEvents: "none",
            animation: isInitialLoad ? "none" : undefined,
            transition: "opacity 0.8s ease-in 0.5s",
          }}
        />

        {/* Modals */}
        {showAgeModal && (
          <AgeVerificationModal
            onConfirm={handleAgeVerification}
            onCancel={() => { setShowAgeModal(false); setPendingAction(null); }}
          />
        )}

        {showNoRoundsModal && (
          <NoRoundsModal
            onBuyRounds={async () => {
              setShowNoRoundsModal(false);
              if (!user) {
                sessionStorage.setItem("pendingBuyRounds", "true");
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: { redirectTo: `${window.location.origin}/auth/callback` },
                });
                return;
              }
              window.location.href = "/buy";
            }}
            onCancel={() => setShowNoRoundsModal(false)}
          />
        )}

        {/* Announcement Banner */}
        {/* <AnnouncementBanner /> */}

        {/* Header */}
        <header className="vx-header">
          <div className="vx-container">
            <div className="vx-header-inner">
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <div
                  style={{
                    position: "relative",
                    width: "clamp(48px,10vw,80px)", height: "clamp(48px,10vw,80px)",
                    borderRadius: "9999px",
                    padding: 4, background: "radial-gradient(circle at 0 0,#7c3aed,#d946ef)",
                    boxShadow: "0 0 30px rgba(124,58,237,0.6)", flexShrink: 0,
                  }}
                >
                  <div
                    className="animate-glow"
                    style={{
                      position: "absolute", inset: -5, borderRadius: "9999px",
                      background: "radial-gradient(circle,#a855f7,transparent)",
                      opacity: 0.4, filter: "blur(10px)", pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position: "relative", width: "100%", height: "100%",
                      borderRadius: "9999px", backgroundColor: "#020817",
                      display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                    }}
                  >
                    <Image
                      src="/images/logo.png" alt="VibraXX Logo" fill sizes="72px"
                      style={{ objectFit: "contain", padding: "18%" }}
                    />
                  </div>
                </div>
                <span style={{ fontSize: 13, color: "#c4b5fd", textTransform: "uppercase", letterSpacing: "0.14em", whiteSpace: "nowrap" }}>
                  Live Quiz Arena
                </span>
              </div>

              <div className="vx-header-right">
                {/* Music Toggle */}
                <button
                  onClick={toggleMusic}
                  aria-label={isPlaying ? "Mute music" : "Play music"}
                  style={{
                    padding: 9, borderRadius: 12, border: "1px solid rgba(148,163,253,0.22)",
                    background: "rgba(2,6,23,0.9)", display: "inline-flex",
                    alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  {isPlaying
                    ? <Volume2 style={{ width: 18, height: 18, color: "#a78bfa" }} />
                    : <VolumeX style={{ width: 18, height: 18, color: "#6b7280" }} />
                  }
                </button>

                {/* PWA Install */}
                {showPWAPrompt && (
                  <button
                    onClick={handlePWAInstall}
                    aria-label="Install App"
                    style={{
                      padding: "8px 14px", borderRadius: 12,
                      border: "1px solid rgba(251,191,36,0.6)",
                      background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(168,85,247,0.25))",
                      color: "white", fontSize: 12, fontWeight: 700,
                      cursor: "pointer", display: "inline-flex",
                      alignItems: "center", gap: 7, transition: "all 0.25s",
                      boxShadow: "0 0 16px rgba(124,58,237,0.35), 0 0 8px rgba(251,191,36,0.2), inset 0 1px 0 rgba(255,255,255,0.12)",
                      position: "relative", overflow: "hidden",
                      letterSpacing: "0.03em",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(251,191,36,0.9)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 24px rgba(124,58,237,0.55), 0 0 16px rgba(251,191,36,0.35), inset 0 1px 0 rgba(255,255,255,0.18)";
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(251,191,36,0.6)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 16px rgba(124,58,237,0.35), 0 0 8px rgba(251,191,36,0.2), inset 0 1px 0 rgba(255,255,255,0.12)";
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{
                      position: "absolute", inset: 0, pointerEvents: "none",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)",
                      animation: "slide-shine 3s ease-in-out infinite",
                    }} />
                    <Smartphone style={{ width: 14, height: 14, color: "#c4b5fd", flexShrink: 0, position: "relative", zIndex: 1 }} />
                    <span style={{
                      background: "linear-gradient(135deg, #e9d5ff, #c4b5fd)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      fontWeight: 800, position: "relative", zIndex: 1,
                    }}>Install App</span>
                  </button>
                )}

                {/* Buy Round Button */}
                <button
                  onClick={() => { window.location.href = "/buy"; }}
                  className="vx-hide-mobile"
                  aria-label="Buy quiz rounds"
                  style={{
                    padding: "8px 16px", borderRadius: 12,
                    border: "1px solid rgba(251,191,36,0.3)",
                    background: "linear-gradient(135deg, rgba(251,191,36,0.1), rgba(245,158,11,0.1))",
                    color: "#fbbf24", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 6, transition: "all 0.2s",
                  }}
                >
                  <ShoppingCart style={{ width: 14, height: 14 }} />
                  {user && userRounds > 0 ? `${userRounds} Rounds` : "Buy Round"}
                </button>

                {/* Leaderboard */}
                <button
                  onClick={() => { window.location.href = "/leaderboard"; }}
                  className="vx-hide-mobile"
                  aria-label="View leaderboard"
                  style={{
                    padding: "8px 16px", borderRadius: 12,
                    border: "1px solid rgba(148,163,253,0.22)",
                    background: "transparent", color: "white", fontSize: 13,
                    cursor: "pointer", display: "inline-flex", alignItems: "center",
                    gap: 6, transition: "all 0.2s",
                  }}
                >
                  <Trophy style={{ width: 14, height: 14, color: "#a78bfa" }} />
                  Leaderboard
                </button>

                {/* Auth */}
                {user ? (
                  <>
                    <button
                      onClick={() => { window.location.href = "/profile"; }}
                      aria-label="View profile"
                      style={{
                        padding: "6px 12px 6px 6px",
                        borderRadius: 999,
                        border: "1px solid rgba(167,139,250,0.4)",
                        background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(15,23,42,0.95))",
                        cursor: "pointer", display: "inline-flex", alignItems: "center",
                        gap: 8, transition: "all 0.25s",
                        boxShadow: "0 0 12px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
                        position: "relative", overflow: "hidden",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(167,139,250,0.8)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.12)";
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(167,139,250,0.4)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 12px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.08)";
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                      }}
                    >
                      {/* Shine sweep */}
                      <div style={{
                        position: "absolute", inset: 0, pointerEvents: "none",
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
                        animation: "slide-shine 4s ease-in-out infinite",
                      }} />
                      {/* Avatar ring */}
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                        padding: 2, position: "relative", zIndex: 1,
                        background: "linear-gradient(135deg, #7c3aed, #d946ef)",
                        boxShadow: "0 0 10px rgba(124,58,237,0.6)",
                      }}>
                        <div style={{
                          width: "100%", height: "100%", borderRadius: "50%",
                          overflow: "hidden", background: "#020817",
                        }}>
                          <Image
                            src={user?.user_metadata?.avatar_url || "/images/logo.png"}
                            alt="User avatar" width={24} height={24} style={{ objectFit: "cover" }}
                          />
                        </div>
                      </div>
                      <span style={{
                        fontSize: 12, fontWeight: 700, position: "relative", zIndex: 1,
                        background: "linear-gradient(135deg, #e9d5ff, #c4b5fd)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {user.user_metadata?.full_name?.split(" ")[0] || "Profile"}
                      </span>
                    </button>

                    <button
                      onClick={handleSignOut}
                      aria-label="Sign out"
                      style={{
                        position: "relative", padding: "8px 18px", borderRadius: 12,
                        border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                        color: "white", overflow: "hidden", background: "transparent", transition: "transform 0.2s",
                      }}
                    >
                      <div className="animate-shimmer" style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(90deg,#ef4444,#f97316,#ef4444)",
                      }} />
                      <span style={{ position: "relative", zIndex: 10 }}>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleSignIn()}
                    aria-label="Sign in with Google"
                    style={{
                      position: "relative", padding: "8px 18px", borderRadius: 12,
                      border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                      color: "white", overflow: "hidden", background: "transparent", transition: "transform 0.2s",
                    }}
                  >
                    <div className="animate-shimmer" style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(90deg,#7c3aed,#d946ef,#7c3aed)",
                    }} />
                    <span style={{ position: "relative", zIndex: 10 }}>Sign in with Google</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Live Banner */}
        <div className="vx-livebar">
          <div className="vx-container">
            <div className="vx-livebar-inner">
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <div
                  className="animate-pulse-slow"
                  style={{
                    width: 10, height: 10, borderRadius: "9999px", background: "#22c55e",
                    boxShadow: "0 0 12px #22c55e, 0 0 24px rgba(34, 197, 94, 0.4)",
                  }}
                />
                <span style={{
                  color: "#22c55e", fontWeight: 700, fontSize: 15,
                  textShadow: "0 0 20px rgba(34, 197, 94, 0.5)", letterSpacing: "0.1em",
                }}>
                  LIVE
                </span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#cbd5e1" }}>
                <Globe style={{ width: 14, height: 14, color: "#a78bfa" }} />
                <span style={{ fontWeight: 700, color: "white" }}>{activePlayers.toLocaleString()}</span>
                <span>online now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero */}
        <main className="vx-hero">
          <div className="vx-container">
            <div className="vx-hero-badge">
              <Crown style={{ width: 16, height: 16, color: "#fbbf24" }} />
              Up to £1,000 monthly prize pool*
              <Trophy style={{ width: 16, height: 16, color: "#fbbf24" }} />
            </div>

            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                gap: 8, padding: "8px 18px", borderRadius: 10,
                background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)",
                fontSize: 13, color: "#4ade80", fontWeight: 600,
              }}>
                <AlertCircle style={{ width: 15, height: 15 }} />
                *Terms apply
              </div>
            </div>

            {/* Free Daily Round Banner */}
            <div style={{ textAlign: "center", marginBottom: 32, padding: "0 16px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 12,
                padding: "14px 22px", borderRadius: 16,
                background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))",
                border: "1px solid rgba(34,197,94,0.4)",
                boxShadow: "0 0 24px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 16,
                  background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.06), transparent)",
                  animation: "badge-shine 4s infinite", pointerEvents: "none",
                }} />
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 16px rgba(34,197,94,0.5)",
                }}>
                  <Gift style={{ width: 20, height: 20, color: "white" }} />
                </div>
                <span style={{
                  fontSize: "clamp(15px,4vw,18px)", fontWeight: 800, color: "#4ade80",
                  letterSpacing: "0.01em", position: "relative", zIndex: 1,
                }}>
                  1 Free Round Daily
                </span>
              </div>
            </div>

            <h1 className="vx-hero-title">
              <span className="vx-hero-neon">The Next Generation Live Quiz</span>
            </h1>

            <p className="vx-hero-subtitle">Global skill-based quiz competition</p>

            {/* Countdown */}
            <div className="vx-countdown-panel">
              <div style={{
                position: "absolute", top: 0, left: -100, right: -100, height: 1.5,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              }} />
              <div style={{
                position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
                width: "80%", height: 40,
                background: "radial-gradient(ellipse, rgba(124, 58, 237, 0.15), transparent)",
                filter: "blur(20px)", pointerEvents: "none",
              }} />

              <div style={{ position: "relative", zIndex: 10 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, color: "#9ca3af", marginBottom: 12,
                  textTransform: "uppercase", letterSpacing: "0.15em", textAlign: "center",
                }}>
                  Next Round
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <div
                    className="vx-countdown-time"
                    style={{
                      fontSize: 42, fontWeight: 800, color: "#ffffff",
                      fontFamily: "ui-monospace, monospace", letterSpacing: "0.02em",
                      textShadow: "0 2px 12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 255, 255, 0.1)",
                      lineHeight: 1,
                    }}
                  >
                    {formatTime(globalTimeLeft)}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 14px",
                    borderRadius: 10, background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    boxShadow: "0 0 24px rgba(34, 197, 94, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}>
                    <div className="animate-pulse-slow" style={{
                      width: 7, height: 7, borderRadius: "50%", background: "#ffffff",
                      boxShadow: "0 0 10px #ffffff, 0 0 20px rgba(255, 255, 255, 0.5)",
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", letterSpacing: "0.1em", textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)" }}>
                      LIVE
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#22c55e" }} />
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>{activePlayers.toLocaleString()}</span>
                  <span>online now</span>
                </div>
              </div>
            </div>

            {/* CTA — Tek Buton */}
            <div className="vx-cta-wrap">
              <button
                className="vx-cta-btn vx-cta-live"
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (!user) {
                    sessionStorage.setItem("postLoginIntent", "live");
                    await handleSignIn();
                    return;
                  }

                  const ageOk = localStorage.getItem("vibraxx_age_verified") === "true";
                  if (!ageOk) {
                    setPendingAction("live");
                    setShowAgeModal(true);
                    return;
                  }

                  if (userRounds <= 0) {
                    setShowNoRoundsModal(true);
                    return;
                  }

                  window.location.href = "/lobby";
                }}
                aria-label="Enter Arena"
                style={{
                  position: "relative",
                  padding: "0",
                  border: "none",
                  borderRadius: 18,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "clamp(15px,3.5vw,18px)",
                  overflow: "hidden",
                  color: "white",
                  width: "auto",
                  minWidth: "clamp(200px,55vw,280px)",
                  minHeight: 60,
                  letterSpacing: "0.02em",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.15), 0 8px 32px rgba(124,58,237,0.5), 0 20px 60px rgba(217,70,239,0.3)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px) scale(1.01)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 1px rgba(255,255,255,0.2), 0 12px 40px rgba(124,58,237,0.7), 0 28px 80px rgba(217,70,239,0.4)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0) scale(1)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 1px rgba(255,255,255,0.15), 0 8px 32px rgba(124,58,237,0.5), 0 20px 60px rgba(217,70,239,0.3)";
                }}
                onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0) scale(0.99)"; }}
                onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px) scale(1.01)"; }}
              >
                {/* Base gradient */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 30%, #a855f7 60%, #d946ef 100%)",
                  borderRadius: 18,
                }} />
                {/* Shine sweep */}
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 18, overflow: "hidden",
                  pointerEvents: "none",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
                    animation: "slide-shine 3s ease-in-out infinite",
                  }} />
                </div>
                {/* Top highlight */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 1,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                  borderRadius: "18px 18px 0 0",
                  pointerEvents: "none",
                }} />
                {/* Content */}
                <div style={{
                  position: "relative", zIndex: 10,
                  display: "flex", alignItems: "center", gap: "clamp(8px,2vw,12px)",
                  padding: "0 clamp(24px,5vw,36px)", width: "100%", justifyContent: "center",
                  minHeight: 60,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backdropFilter: "blur(4px)", flexShrink: 0,
                  }}>
                    <Play style={{ width: 16, height: 16, fill: "white", color: "white" }} />
                  </div>
                  <span style={{ fontWeight: 800, textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
                    Enter Arena
                  </span>
                </div>
              </button>
            </div>

            {/* PWA Install Banner — Premium */}
            {showPWAPrompt && (
              <div style={{ textAlign: "center", marginBottom: 40, padding: "0 16px" }}>
                <button
                  onClick={handlePWAInstall}
                  aria-label="Install VibraXX App"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 14,
                    padding: "16px 24px", borderRadius: 18, border: "none",
                    cursor: "pointer", position: "relative", overflow: "hidden",
                    background: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 50%, #1e1b4b 100%)",
                    boxShadow: "0 0 0 1px rgba(251,191,36,0.5), 0 8px 32px rgba(124,58,237,0.4), 0 0 60px rgba(139,92,246,0.15)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    width: "100%", maxWidth: 420,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 1px rgba(251,191,36,0.8), 0 12px 40px rgba(124,58,237,0.6), 0 0 80px rgba(139,92,246,0.2)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 1px rgba(251,191,36,0.5), 0 8px 32px rgba(124,58,237,0.4), 0 0 60px rgba(139,92,246,0.15)";
                  }}
                >
                  {/* Shine */}
                  <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
                    animation: "slide-shine 3s ease-in-out infinite",
                  }} />
                  {/* Top line */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 1,
                    background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent)",
                    pointerEvents: "none",
                  }} />

                  {/* Icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 20px rgba(124,58,237,0.6)",
                    position: "relative", zIndex: 1,
                  }}>
                    <Smartphone style={{ width: 22, height: 22, color: "white" }} />
                  </div>

                  {/* Text */}
                  <div style={{ textAlign: "left", flex: 1, position: "relative", zIndex: 1 }}>
                    <div style={{
                      fontSize: "clamp(14px,3.5vw,16px)", fontWeight: 800,
                      background: "linear-gradient(135deg, #e9d5ff, #c4b5fd, #a78bfa)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                      marginBottom: 3,
                    }}>
                      Install VibraXX App
                    </div>
                    <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 600 }}>
                      Fast • No browser needed • Always ready
                    </div>
                  </div>

                  {/* Badge */}
                  <div style={{
                    padding: "5px 10px", borderRadius: 8, flexShrink: 0,
                    background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(168,85,247,0.3))",
                    border: "1px solid rgba(167,139,250,0.4)",
                    fontSize: 11, fontWeight: 800, color: "#c4b5fd",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    position: "relative", zIndex: 1,
                  }}>FREE</div>
                </button>
              </div>
            )}

            {/* Stats Cards */}
            <div className="vx-stats-grid">
              {statsCards.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>

            {/* Champions */}
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

        {/* Trust Elements */}
        <div style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          background: "rgba(255, 255, 255, 0.01)", padding: "32px 0",
        }}>
          <div className="vx-container">
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 24, maxWidth: 1024, margin: "0 auto",
            }}>
              {[
                { icon: CheckCircle, color: "#22c55e", bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.2)", title: "SSL Encrypted", sub: "Bank-level security" },
                { icon: ShoppingCart, color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)", border: "rgba(139, 92, 246, 0.2)", title: "Stripe Verified", sub: "Secure payments" },
                { icon: AlertCircle, color: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)", border: "rgba(251, 191, 36, 0.2)", title: "18+ Only", sub: "Age verified" },
                { icon: Globe, color: "#06b6d4", bg: "rgba(6, 182, 212, 0.1)", border: "rgba(6, 182, 212, 0.2)", title: "Global Arena", sub: "Worldwide players" },
              ].map(({ icon: Icon, color, bg, border, title, sub }, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ width: 20, height: 20, color }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", textAlign: "center" }}>{title}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center", fontWeight: 500 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
