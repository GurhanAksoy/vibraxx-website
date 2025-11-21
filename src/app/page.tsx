"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import Image from "next/image";
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
import { createClient } from "@supabase/supabase-js";
import { playMenuMusic, stopMenuMusic } from "@/lib/audioManager";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Memoized Components
const StatCard = memo(({ icon: Icon, value, label, color, delay }: any) => (
  <div className="vx-stat-card" style={{ animationDelay: `${delay}ms` }}>
    <div className="vx-stat-glow" style={{ background: color }} />
    <Icon style={{ width: 22, height: 22, color, marginBottom: 4 }} />
    <div className="vx-stat-value" style={{ color }}>{value}</div>
    <div className="vx-stat-label">{label}</div>
  </div>
));
StatCard.displayName = "StatCard";

const ChampionCard = memo(({ champion, delay }: any) => {
  const Icon = champion.icon;
  return (
    <div className="vx-champ-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="vx-champ-glow" style={{ background: champion.gradient }} />
      <div
        style={{
          width: 56,
          height: 56,
          margin: "0 auto 18px",
          borderRadius: 18,
          background: champion.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 8px 32px ${champion.color}40`,
        }}
      >
        <Icon style={{ width: 26, height: 26, color: "#ffffff" }} />
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "#6b7280",
          marginBottom: 6,
        }}
      >
        {champion.period} Champion
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
        {champion.name}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: champion.color }}>
        {champion.score.toLocaleString()} pts
      </div>
    </div>
  );
});
ChampionCard.displayName = "ChampionCard";

// Modal Components
const AgeVerificationModal = memo(({ onConfirm, onCancel }: any) => (
  <div className="vx-modal-overlay" onClick={onCancel}>
    <div className="vx-modal-content vx-modal-enter" onClick={(e) => e.stopPropagation()}>
      <div className="vx-modal-glow" />
      <div style={{ textAlign: "center", marginBottom: 24, position: "relative", zIndex: 10 }}>
        <div className="vx-modal-icon-wrapper">
          <div className="vx-modal-icon-glow" />
          <AlertCircle style={{ width: 32, height: 32, color: "white" }} />
        </div>
        <h3 className="vx-modal-title">Age Verification Required</h3>
        <p className="vx-modal-text">
          To participate in Live Quiz competitions with real prizes, you must be at least 18 years old.
        </p>
      </div>

      <div className="vx-modal-info-box">
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

      <div style={{ display: "flex", gap: 12, position: "relative", zIndex: 10 }}>
        <button onClick={onCancel} className="vx-btn-secondary">
          Cancel
        </button>
        <button onClick={onConfirm} className="vx-btn-primary vx-btn-purple">
          I&apos;m 18+ - Continue
        </button>
      </div>
    </div>
  </div>
));
AgeVerificationModal.displayName = "AgeVerificationModal";

const NoRoundsModal = memo(({ onBuyRounds, onCancel }: any) => (
  <div className="vx-modal-overlay" onClick={onCancel}>
    <div className="vx-modal-content vx-modal-enter" onClick={(e) => e.stopPropagation()}>
      <div className="vx-modal-glow vx-modal-glow-gold" />
      <div style={{ textAlign: "center", marginBottom: 24, position: "relative", zIndex: 10 }}>
        <div className="vx-modal-icon-wrapper vx-modal-icon-gold">
          <div className="vx-modal-icon-glow vx-modal-icon-glow-gold" />
          <ShoppingCart style={{ width: 32, height: 32, color: "white" }} />
        </div>
        <h3 className="vx-modal-title">No Rounds Available</h3>
        <p className="vx-modal-text">
          You need to purchase rounds to enter the Live Quiz lobby and compete for the{" "}
          <strong style={{ color: "#fbbf24" }}>£1000 monthly prize</strong>!
        </p>
      </div>

      <div className="vx-modal-info-box vx-modal-info-gold">
        <div style={{ display: "flex", alignItems: "start", gap: 12, marginBottom: 12 }}>
          <Trophy style={{ width: 20, height: 20, color: "#fbbf24", flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 14, color: "#cbd5e1", margin: 0 }}>
            <strong style={{ color: "white" }}>Live competitions</strong> every 15 minutes
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
          <Crown style={{ width: 20, height: 20, color: "#fbbf24", flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 14, color: "#cbd5e1", margin: 0 }}>
            Compete for <strong style={{ color: "white" }}>real prizes</strong> and leaderboard glory
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, position: "relative", zIndex: 10 }}>
        <button onClick={onCancel} className="vx-btn-secondary">
          Maybe Later
        </button>
        <button onClick={onBuyRounds} className="vx-btn-primary vx-btn-gold">
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
  const [nextRound, setNextRound] = useState<number | null>(null);
  const [activePlayers, setActivePlayers] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [champions, setChampions] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalQuestions: 0, roundsPerDay: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"live" | "free" | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [userRounds, setUserRounds] = useState(0);
  const [showNoRoundsModal, setShowNoRoundsModal] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  // Client-side mount check for SSR safety
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mouse parallax effect - only on client
  useEffect(() => {
    if (!isMounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMounted]);

  const fetchUserRounds = useCallback(async () => {
    if (!user) {
      setUserRounds(0);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_rounds")
        .select("purchased, used, remaining")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setUserRounds(data.remaining || 0);
      } else {
        setUserRounds(0);
      }
    } catch (err) {
      console.error("User rounds fetch error:", err);
      setUserRounds(0);
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isInitialLoad && isMounted) {
      const orbs = document.querySelectorAll('.vx-neon-orb');
      orbs.forEach((orb, index) => {
        setTimeout(() => {
          (orb as HTMLElement).style.opacity = '1';
        }, 300 + index * 200);
      });
    }
  }, [isInitialLoad, isMounted]);

  useEffect(() => {
    if (user) {
      fetchUserRounds();
    }
  }, [user, fetchUserRounds]);

  const fetchActivePlayers = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from("active_sessions")
        .select("*", { count: "exact", head: true })
        .gte("last_activity", new Date(Date.now() - 15 * 60 * 1000).toISOString());
      
      if (!error && count !== null) {
        setActivePlayers(count);
      } else {
        setActivePlayers(0);
      }
    } catch (err) {
      console.error("Active players fetch error:", err);
      setActivePlayers(0);
    }
  }, []);

  const fetchNextRound = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_rounds")
        .select("scheduled_at")
        .eq("status", "scheduled")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(1)
        .single();

      if (!error && data) {
        const scheduledTime = new Date(data.scheduled_at).getTime();
        const now = Date.now();
        const diff = Math.max(0, Math.floor((scheduledTime - now) / 1000));
        setNextRound(diff);
      } else {
        setNextRound(null);
      }
    } catch (err) {
      console.error("Next round fetch error:", err);
      setNextRound(null);
    }
  }, []);

  const fetchChampions = useCallback(async () => {
    try {
      const periods = ["daily", "weekly", "monthly"];
      const championsData = await Promise.all(
        periods.map(async (period, index) => {
          try {
            const { data, error } = await supabase
              .from("leaderboard")
              .select(`
                user_id,
                score,
                users:user_id (
                  full_name,
                  avatar_url
                )
              `)
              .eq("period", period)
              .order("score", { ascending: false })
              .limit(1)
              .single();

            if (error || !data) {
              return null;
            }

            const icons = [Crown, Trophy, Sparkles];
            const gradients = [
              "linear-gradient(135deg, #eab308, #f97316)",
              "linear-gradient(135deg, #8b5cf6, #d946ef)",
              "linear-gradient(135deg, #3b82f6, #06b6d4)",
            ];
            const colors = ["#facc15", "#c084fc", "#22d3ee"];

            const userData = data.users as any;
            const userName = userData?.full_name || "Anonymous Player";

            return {
              period: period.charAt(0).toUpperCase() + period.slice(1),
              name: userName,
              score: data.score || 0,
              gradient: gradients[index],
              color: colors[index],
              icon: icons[index],
            };
          } catch (err) {
            console.error(`Error fetching ${period} champion:`, err);
            return null;
          }
        })
      );

      const validChampions = championsData.filter((c) => c !== null);
      setChampions(validChampions);
    } catch (err) {
      console.error("Champions fetch error:", err);
      setChampions([]);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_stats")
        .select("total_questions, rounds_per_day")
        .single();

      if (!error && data) {
        setStats({
          totalQuestions: data.total_questions || 0,
          roundsPerDay: data.rounds_per_day || 0,
        });
      } else {
        setStats({
          totalQuestions: 0,
          roundsPerDay: 0,
        });
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
      setStats({
        totalQuestions: 0,
        roundsPerDay: 0,
      });
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchActivePlayers(),
        fetchNextRound(),
        fetchChampions(),
        fetchStats(),
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchActivePlayers, fetchNextRound, fetchChampions, fetchStats]);

  useEffect(() => {
    const playersInterval = setInterval(fetchActivePlayers, 8000);
    const roundInterval = setInterval(() => {
      setNextRound((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    if (nextRound === 0) {
      fetchNextRound();
    }

    return () => {
      clearInterval(playersInterval);
      clearInterval(roundInterval);
    };
  }, [fetchActivePlayers, fetchNextRound, nextRound]);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);
    };
    loadUser();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const toggleMusic = useCallback(() => {
    if (isPlaying) {
      stopMenuMusic();
      setIsPlaying(false);
      if (isMounted) localStorage.setItem("vibraxx_music", "false");
    } else {
      playMenuMusic();
      setIsPlaying(true);
      if (isMounted) localStorage.setItem("vibraxx_music", "true");
    }
  }, [isPlaying, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    
    const musicPref = localStorage.getItem("vibraxx_music");
    if (musicPref === "true") {
      playMenuMusic();
      setIsPlaying(true);
    }
    return () => stopMenuMusic();
  }, [isMounted]);

  const handleSignIn = useCallback(async () => {
    if (!isMounted) return;
    
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, [isMounted]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const handleAgeVerification = useCallback(() => {
    if (isMounted) localStorage.setItem("vibraxx_age_verified", "true");
    setShowAgeModal(false);
    
    if (pendingAction === "live") {
      if (userRounds <= 0) {
        setShowNoRoundsModal(true);
      } else {
        router.push("/lobby");
      }
    } else if (pendingAction === "free") {
      router.push("/free");
    }
    setPendingAction(null);
  }, [pendingAction, userRounds, router, isMounted]);

  const checkAgeVerification = useCallback(() => {
    if (!isMounted) return false;
    return localStorage.getItem("vibraxx_age_verified") === "true";
  }, [isMounted]);

  const handleStartLiveQuiz = useCallback(async () => {
    if (!user) {
      await handleSignIn();
      return;
    }

    if (!checkAgeVerification()) {
      setPendingAction("live");
      setShowAgeModal(true);
      return;
    }

    if (userRounds <= 0) {
      setShowNoRoundsModal(true);
      return;
    }

    router.push("/lobby");
  }, [user, handleSignIn, checkAgeVerification, userRounds, router]);

  const handleStartFreeQuiz = useCallback(async () => {
    if (!user) {
      await handleSignIn();
      return;
    }

    if (!checkAgeVerification()) {
      setPendingAction("free");
      setShowAgeModal(true);
      return;
    }

    router.push("/free");
  }, [user, handleSignIn, checkAgeVerification, router]);

  const formatTime = useCallback((seconds: number | null) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  const statsCards = useMemo(
    () => [
      {
        icon: Globe,
        value: activePlayers > 0 ? `${Math.floor(activePlayers / 1000)}K+` : "0",
        label: "Active Players",
        color: "#a78bfa",
        delay: 0,
      },
      {
        icon: Sparkles,
        value: stats.totalQuestions > 0 ? `${(stats.totalQuestions / 1000000).toFixed(1)}M+` : "0",
        label: "Questions Answered",
        color: "#f0abfc",
        delay: 100,
      },
      {
        icon: Zap,
        value: stats.roundsPerDay > 0 ? `${stats.roundsPerDay}/day` : "0/day",
        label: "Live Rounds",
        color: "#22d3ee",
        delay: 200,
      },
    ],
    [activePlayers, stats]
  );

  // Safe parallax calculation - only on client
  const parallaxX = isMounted ? (mousePos.x / window.innerWidth - 0.5) * 30 : 0;
  const parallaxY = isMounted ? (mousePos.y / window.innerHeight - 0.5) * 30 : 0;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <style jsx global>{`
        :root { 
          color-scheme: dark;
          background-color: #020817;
        }
        
        * { 
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        body {
          background-color: #020817;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        @keyframes float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -30px, 0); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes modal-enter {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes badge-shine {
          0% { left: -100%; }
          50%, 100% { left: 100%; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        .vx-neon-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 1s ease-in, transform 0.3s ease-out;
          will-change: transform, opacity;
          animation: float 8s ease-in-out infinite;
        }

        .vx-glass-card {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .vx-btn-primary {
          position: relative;
          padding: 14px 28px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 15px;
          color: white;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          touch-action: manipulation;
        }

        .vx-btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.3s;
          background: radial-gradient(circle at center, rgba(255,255,255,0.2), transparent);
        }

        .vx-btn-primary:hover::before {
          opacity: 1;
        }

        .vx-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }

        .vx-btn-primary:active {
          transform: translateY(0);
        }

        .vx-btn-purple {
          background: linear-gradient(135deg, #7c3aed, #d946ef);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4);
        }

        .vx-btn-gold {
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          box-shadow: 0 8px 24px rgba(251, 191, 36, 0.4);
        }

        .vx-btn-secondary {
          padding: 14px 24px;
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 253, 0.3);
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(10px);
          color: #94a3b8;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
        }

        .vx-btn-secondary:hover {
          border-color: rgba(148, 163, 253, 0.5);
          background: rgba(15, 23, 42, 0.8);
          color: #cbd5e1;
        }

        .vx-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .vx-modal-content {
          position: relative;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
          backdrop-filter: blur(24px);
          border-radius: 24px;
          padding: 32px;
          max-width: 480px;
          width: 100%;
          border: 1px solid rgba(139, 92, 246, 0.3);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .vx-modal-enter {
          animation: modal-enter 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .vx-modal-glow {
          position: absolute;
          inset: -40px;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.3), transparent 70%);
          filter: blur(40px);
          opacity: 0.6;
          animation: pulse-glow 3s ease-in-out infinite;
          pointer-events: none;
        }

        .vx-modal-glow-gold {
          background: radial-gradient(circle, rgba(251, 191, 36, 0.3), transparent 70%);
        }

        .vx-modal-icon-wrapper {
          position: relative;
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #d946ef);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vx-modal-icon-gold {
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
        }

        .vx-modal-icon-glow {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.4), transparent);
          filter: blur(16px);
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .vx-modal-icon-glow-gold {
          background: radial-gradient(circle, rgba(251, 191, 36, 0.4), transparent);
        }

        .vx-modal-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
          color: white;
          text-shadow: 0 2px 12px rgba(124, 58, 237, 0.3);
        }

        .vx-modal-text {
          font-size: 15px;
          color: #94a3b8;
          line-height: 1.6;
        }

        .vx-modal-info-box {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid rgba(139, 92, 246, 0.2);
          position: relative;
          z-index: 10;
        }

        .vx-modal-info-gold {
          background: rgba(251, 191, 36, 0.1);
          border-color: rgba(251, 191, 36, 0.2);
        }

        .vx-stat-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(24px);
          min-height: 140px;
          padding: 2rem;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fade-in-up 0.6s ease-out backwards;
          overflow: hidden;
        }

        .vx-stat-glow {
          position: absolute;
          inset: -20px;
          opacity: 0;
          filter: blur(30px);
          transition: opacity 0.4s;
          pointer-events: none;
        }

        .vx-stat-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
        }

        .vx-stat-card:hover .vx-stat-glow {
          opacity: 0.3;
        }

        .vx-stat-label { 
          color: #94a3b8; 
          font-size: 13px; 
          font-weight: 500;
        }

        .vx-stat-value { 
          font-weight: 800; 
          font-size: 32px; 
          margin: 8px 0;
          text-shadow: 0 2px 12px currentColor;
        }

        .vx-champ-card {
          position: relative;
          padding: 28px;
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(24px);
          text-align: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fade-in-up 0.6s ease-out backwards;
          overflow: hidden;
        }

        .vx-champ-glow {
          position: absolute;
          inset: -30px;
          opacity: 0;
          filter: blur(40px);
          transition: opacity 0.4s;
          pointer-events: none;
        }

        .vx-champ-card:hover {
          transform: translateY(-8px) scale(1.03);
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }

        .vx-champ-card:hover .vx-champ-glow {
          opacity: 0.2;
        }

        .vx-container { 
          max-width: 1280px; 
          margin: 0 auto; 
          padding: 0 16px;
          width: 100%;
        }

        .vx-header {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px) saturate(180%);
          background: rgba(2, 8, 23, 0.85);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
        }

        .vx-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 0;
        }

        .vx-header-right { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          flex-wrap: wrap;
        }

        .vx-hide-mobile { display: none; }

        @media (min-width: 640px) {
          .vx-container { padding: 0 24px; }
          .vx-header-inner { height: 80px; }
          .vx-header-right { gap: 12px; }
          .vx-hide-mobile { display: inline-flex; }
          .vx-stat-card { min-height: 160px; }
        }

        .vx-livebar {
          position: relative;
          z-index: 40;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
          background: linear-gradient(90deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.1));
          font-size: 12px;
          overflow: hidden;
        }

        .vx-livebar::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          animation: shimmer 3s linear infinite;
        }

        .vx-livebar-inner {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          align-items: center;
          padding: 10px 16px;
        }

        @media (min-width: 640px) {
          .vx-livebar-inner { font-size: 14px; padding: 12px 24px; }
        }

        .vx-hero { 
          padding: 80px 16px 80px; 
          text-align: center;
          width: 100%;
        }

        @media (min-width: 640px) { 
          .vx-hero { padding: 120px 24px 100px; } 
        }

        .vx-hero-badge {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          border-radius: 9999px;
          border: 2px solid rgba(251, 191, 36, 0.5);
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.15));
          color: #fbbf24;
          font-size: 13px;
          margin-bottom: 24px;
          backdrop-filter: blur(12px);
          font-weight: 700;
          box-shadow: 0 0 30px rgba(251, 191, 36, 0.4), 
                      inset 0 0 20px rgba(251, 191, 36, 0.1);
          overflow: hidden;
          animation: fade-in-up 0.6s ease-out;
        }

        .vx-hero-badge::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: badge-shine 3s infinite;
        }

        @media (min-width: 640px) {
          .vx-hero-badge { 
            padding: 12px 28px; 
            font-size: 14px; 
          }
        }

        .vx-hero-title {
          font-size: clamp(32px, 7vw, 56px);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -0.04em;
          animation: fade-in-up 0.6s ease-out 0.2s backwards;
        }

        .vx-hero-neon {
          display: inline-block;
          background: linear-gradient(90deg, #7c3aed, #22d3ee, #f97316, #d946ef, #7c3aed);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
          filter: drop-shadow(0 0 20px rgba(124, 58, 237, 0.5));
        }

        .vx-hero-subtitle {
          font-size: 18px;
          color: #94a3b8;
          max-width: 640px;
          margin: 0 auto 40px;
          line-height: 1.6;
          animation: fade-in-up 0.6s ease-out 0.4s backwards;
        }

        @media (min-width: 640px) {
          .vx-hero-subtitle { font-size: 20px; margin-bottom: 48px; }
        }

        .vx-cta-wrap {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
          justify-content: center;
          margin-bottom: 56px;
          width: 100%;
          animation: fade-in-up 0.6s ease-out 0.6s backwards;
        }

        @media (min-width: 640px) {
          .vx-cta-wrap { 
            flex-direction: row; 
            margin-bottom: 72px;
          }
        }

        .vx-cta-btn {
          position: relative;
          padding: 18px 36px;
          border-radius: 16px;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 700;
          font-size: 17px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          max-width: 340px;
          touch-action: manipulation;
        }

        .vx-cta-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(255,255,255,0.2), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .vx-cta-btn:hover::after {
          opacity: 1;
        }

        .vx-cta-btn:hover { 
          transform: translateY(-4px) scale(1.02); 
        }

        .vx-cta-btn:active { 
          transform: translateY(-2px) scale(1); 
        }

        @media (min-width: 640px) {
          .vx-cta-btn { 
            padding: 20px 40px; 
            font-size: 18px;
            width: auto;
            min-width: 240px;
          }
        }

        .vx-cta-live { 
          box-shadow: 0 16px 48px rgba(124, 58, 237, 0.5),
                      0 0 80px rgba(124, 58, 237, 0.3);
        }

        .vx-cta-free { 
          box-shadow: 0 16px 48px rgba(34, 211, 238, 0.5),
                      0 0 80px rgba(34, 211, 238, 0.3);
        }

        .vx-pricing-box {
          max-width: 680px;
          margin: 0 auto 64px;
          padding: 28px 20px;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.05));
          border: 1px solid rgba(251, 191, 36, 0.25);
          backdrop-filter: blur(16px);
          box-shadow: 0 8px 32px rgba(251, 191, 36, 0.15);
          animation: fade-in-up 0.6s ease-out 0.8s backwards;
        }

        .vx-stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 80px;
        }

        @media (min-width: 640px) {
          .vx-stats-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 24px;
            margin-bottom: 100px;
          }
        }

        .vx-champions-title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          animation: fade-in-up 0.6s ease-out;
          text-shadow: 0 2px 20px rgba(251, 191, 36, 0.3);
        }

        @media (min-width: 640px) {
          .vx-champions-title { font-size: 36px; margin-bottom: 40px; }
        }

        .vx-champions-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 64px;
        }

        @media (min-width: 768px) {
          .vx-champions-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 24px;
          }
        }

        .vx-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(2, 8, 23, 0.95);
          backdrop-filter: blur(16px);
          padding: 40px 16px 28px;
          text-align: center;
          color: #64748b;
          font-size: 12px;
        }

        @media (min-width: 640px) {
          .vx-footer { font-size: 13px; padding: 48px 24px 32px; }
        }

        .vx-footer-links {
          margin: 20px 0 24px;
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
          margin: 0 auto 20px;
          font-size: 11px;
          line-height: 1.7;
          color: #64748b;
        }

        .vx-footer-company {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 11px;
          color: #64748b;
        }

        @media (min-width: 640px) {
          .vx-footer-legal { font-size: 12px; }
          .vx-footer-company { font-size: 12px; }
        }

        .vx-pulse {
          animation: pulse-glow 2s ease-in-out infinite;
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
          transition: "opacity 0.5s ease-in",
        }}
      >
        {/* Enhanced Neon Orbs with Parallax */}
        {isMounted && (
          <>
            <div
              className="vx-neon-orb"
              style={{
                top: "60px",
                left: "-60px",
                width: "320px",
                height: "320px",
                background: "radial-gradient(circle, #7c3aed, #a855f7)",
                transform: `translate(${parallaxX}px, ${parallaxY}px)`,
              }}
            />
            <div
              className="vx-neon-orb"
              style={{
                bottom: "40px",
                right: "-60px",
                width: "340px",
                height: "340px",
                background: "radial-gradient(circle, #d946ef, #ec4899)",
                transform: `translate(${-parallaxX}px, ${-parallaxY}px)`,
                animationDelay: "2s",
              }}
            />
            <div
              className="vx-neon-orb"
              style={{
                top: "50%",
                left: "50%",
                width: "280px",
                height: "280px",
                background: "radial-gradient(circle, #22d3ee, #06b6d4)",
                transform: `translate(-50%, -50%) translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px)`,
                animationDelay: "4s",
              }}
            />
          </>
        )}

        {/* Modals */}
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

        {/* HEADER */}
        <header className="vx-header">
          <div className="vx-container">
            <div className="vx-header-inner">
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <div
                  style={{
                    position: "relative",
                    width: 90,
                    height: 90,
                    borderRadius: "9999px",
                    padding: 4,
                    background: "radial-gradient(circle at 30% 30%, #7c3aed, #d946ef)",
                    boxShadow: "0 0 40px rgba(124, 58, 237, 0.6), 0 0 80px rgba(217, 70, 239, 0.3)",
                    flexShrink: 0,
                  }}
                >
                  <div
                    className="vx-pulse"
                    style={{
                      position: "absolute",
                      inset: -8,
                      borderRadius: "9999px",
                      background: "radial-gradient(circle, #a855f7, transparent)",
                      filter: "blur(12px)",
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
                      sizes="90px"
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
                      letterSpacing: "0.15em",
                      whiteSpace: "nowrap",
                      fontWeight: 600,
                    }}
                  >
                    Live Quiz Arena
                  </span>
                </div>
              </div>

              <div className="vx-header-right">
                <button
                  onClick={toggleMusic}
                  aria-label={isPlaying ? "Mute music" : "Play music"}
                  style={{
                    padding: 10,
                    borderRadius: 14,
                    border: "1px solid rgba(148, 163, 253, 0.25)",
                    background: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(10px)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                >
                  {isPlaying ? (
                    <Volume2 style={{ width: 18, height: 18, color: "#a78bfa" }} />
                  ) : (
                    <VolumeX style={{ width: 18, height: 18, color: "#6b7280" }} />
                  )}
                </button>

                <button
                  onClick={() => router.push("/buy")}
                  className="vx-hide-mobile"
                  aria-label="Buy quiz rounds"
                  style={{
                    padding: "10px 18px",
                    borderRadius: 14,
                    border: "1px solid rgba(251, 191, 36, 0.35)",
                    background: "linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))",
                    backdropFilter: "blur(10px)",
                    color: "#fbbf24",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.3s",
                    boxShadow: "0 0 20px rgba(251, 191, 36, 0.2)",
                  }}
                >
                  <ShoppingCart style={{ width: 14, height: 14 }} />
                  {user && userRounds > 0 ? `${userRounds} Rounds` : "Buy Round"}
                </button>

                <button
                  onClick={() => router.push("/leaderboard")}
                  className="vx-hide-mobile"
                  aria-label="View leaderboard"
                  style={{
                    padding: "10px 18px",
                    borderRadius: 14,
                    border: "1px solid rgba(148, 163, 253, 0.25)",
                    background: "rgba(15, 23, 42, 0.8)",
                    backdropFilter: "blur(10px)",
                    color: "white",
                    fontSize: 13,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.3s",
                  }}
                >
                  <Trophy style={{ width: 14, height: 14, color: "#a78bfa" }} />
                  Leaderboard
                </button>

                {user ? (
                  <>
                    <button
                      onClick={() => router.push("/profile")}
                      aria-label="View profile"
                      style={{
                        padding: "10px 18px",
                        borderRadius: 14,
                        border: "1px solid rgba(148, 163, 253, 0.3)",
                        background: "rgba(15, 23, 42, 0.9)",
                        backdropFilter: "blur(10px)",
                        color: "white",
                        fontSize: 13,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        transition: "all 0.3s",
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "9999px",
                          overflow: "hidden",
                          backgroundColor: "#020817",
                          border: "2px solid rgba(148, 163, 253, 0.3)",
                        }}
                      >
                        <Image
                          src={user?.user_metadata?.avatar_url || "/images/logo.png"}
                          alt="User avatar"
                          width={22}
                          height={22}
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <span
                        className="vx-hide-mobile"
                        style={{
                          fontSize: 12,
                          color: "#e5e7eb",
                          maxWidth: 100,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                        }}
                      >
                        {user.user_metadata?.full_name || "Player"}
                      </span>
                    </button>

                    <button
                      onClick={handleSignOut}
                      aria-label="Sign out"
                      className="vx-hide-mobile"
                      style={{
                        padding: "10px 20px",
                        borderRadius: 14,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "white",
                        background: "linear-gradient(135deg, #ef4444, #f97316)",
                        transition: "all 0.3s",
                        boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSignIn}
                    aria-label="Sign in with Google"
                    style={{
                      padding: "10px 20px",
                      borderRadius: 14,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "white",
                      background: "linear-gradient(135deg, #7c3aed, #d946ef)",
                      transition: "all 0.3s",
                      boxShadow: "0 0 20px rgba(124, 58, 237, 0.4)",
                    }}
                  >
                    Sign in
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* LIVE BANNER */}
        <div className="vx-livebar">
          <div className="vx-container">
            <div className="vx-livebar-inner">
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <div
                  className="vx-pulse"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "9999px",
                    background: "#ef4444",
                    boxShadow: "0 0 12px #ef4444",
                  }}
                />
                <span style={{ color: "#f97316", fontWeight: 700 }}>LIVE</span>
              </div>

              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#cbd5e1" }}>
                <Globe style={{ width: 16, height: 16, color: "#a78bfa" }} />
                <span style={{ fontWeight: 700, color: "white" }}>
                  {activePlayers > 0 ? activePlayers.toLocaleString() : "0"}
                </span>
                <span>players online</span>
              </div>

              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#cbd5e1" }}>
                <Sparkles style={{ width: 16, height: 16, color: "#f0abfc" }} />
                <span>Next round</span>
                <span
                  style={{
                    fontWeight: 800,
                    background: "linear-gradient(to right, #a78bfa, #f0abfc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {formatTime(nextRound)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* HERO */}
        <main className="vx-hero">
          <div className="vx-container">
            <div className="vx-hero-badge">
              <Crown style={{ width: 18, height: 18, color: "#fbbf24" }} />
              Knowledge Quiz with a £1000 Monthly Prize
              <Trophy style={{ width: 18, height: 18, color: "#fbbf24" }} />
            </div>

            <div style={{ textAlign: "center", marginBottom: 32, animation: "fade-in-up 0.6s ease-out 0.3s backwards" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "10px 22px",
                  borderRadius: 12,
                  background: "rgba(34, 197, 94, 0.12)",
                  border: "1px solid rgba(34, 197, 94, 0.35)",
                  backdropFilter: "blur(10px)",
                  fontSize: 14,
                  color: "#4ade80",
                  fontWeight: 600,
                  boxShadow: "0 0 20px rgba(34, 197, 94, 0.2)",
                }}
              >
                <AlertCircle style={{ width: 16, height: 16 }} />
                Prize pool activates at 2000+
              </div>
            </div>

            <h1 className="vx-hero-title">
              <span className="vx-hero-neon">The Next Generation Live Quiz</span>
            </h1>

            <p className="vx-hero-subtitle">
              The world&apos;s number one educational and award-winning quiz!
            </p>

            {/* CTA Buttons */}
            <div className="vx-cta-wrap">
              <button
                className="vx-cta-btn vx-cta-live"
                onClick={handleStartLiveQuiz}
                aria-label="Start live quiz with prizes"
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(135deg, #7c3aed, #d946ef)",
                  }}
                />
                <Play style={{ position: "relative", zIndex: 10, width: 22, height: 22 }} />
                <span style={{ position: "relative", zIndex: 10 }}>Start Live Quiz</span>
                <ArrowRight style={{ position: "relative", zIndex: 10, width: 22, height: 22 }} />
              </button>

              <button
                className="vx-cta-btn vx-cta-free"
                onClick={handleStartFreeQuiz}
                aria-label="Start free practice quiz"
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(135deg, #06b6d4, #22d3ee)",
                  }}
                />
                <Gift style={{ position: "relative", zIndex: 10, width: 22, height: 22 }} />
                <span style={{ position: "relative", zIndex: 10 }}>Start Free Quiz</span>
                <ArrowRight style={{ position: "relative", zIndex: 10, width: 22, height: 22 }} />
              </button>
            </div>

            {/* Pricing Info */}
            <div className="vx-pricing-box">
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#fbbf24",
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    textShadow: "0 2px 12px rgba(251, 191, 36, 0.3)",
                  }}
                >
                  <ShoppingCart style={{ width: 22, height: 22 }} />
                  Round Pricing
                </h3>
                <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
                  Affordable entry to compete for big prizes
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div
                  className="vx-glass-card"
                  style={{
                    padding: 18,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                    Single Round
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#fbbf24", marginBottom: 4, textShadow: "0 2px 12px rgba(251, 191, 36, 0.4)" }}>
                    £1
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>per round</div>
                </div>

                <div
                  className="vx-glass-card"
                  style={{
                    padding: 18,
                    textAlign: "center",
                    position: "relative",
                    border: "2px solid rgba(251, 191, 36, 0.4)",
                    boxShadow: "0 0 30px rgba(251, 191, 36, 0.25)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      color: "white",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "4px 8px",
                      borderRadius: 8,
                      textTransform: "uppercase",
                      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
                    }}
                  >
                    Save 17%
                  </div>
                  <div style={{ fontSize: 13, color: "#fbbf24", marginBottom: 8, fontWeight: 600 }}>
                    Value Pack
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#fbbf24", marginBottom: 4, textShadow: "0 2px 12px rgba(251, 191, 36, 0.4)" }}>
                    £29
                  </div>
                  <div style={{ fontSize: 11, color: "#cbd5e1" }}>35 rounds (£0.83 each)</div>
                </div>
              </div>

              <div
                style={{
                  padding: 18,
                  borderRadius: 16,
                  background: "rgba(59, 130, 246, 0.12)",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                }}
              >
                <div style={{ display: "flex", alignItems: "start", gap: 10, marginBottom: 10 }}>
                  <AlertCircle
                    style={{
                      width: 18,
                      height: 18,
                      color: "#60a5fa",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#60a5fa", marginBottom: 4 }}>
                      Prize Pool Activation
                    </div>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
                      The <strong style={{ color: "white" }}>£1000 monthly prize</strong> activates when we reach{" "}
                      <strong style={{ color: "white" }}>2000+ active participants</strong>.
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "start", gap: 10 }}>
                  <CheckCircle
                    style={{
                      width: 18,
                      height: 18,
                      color: "#4ade80",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
                    <strong style={{ color: "#4ade80" }}>Fair & Transparent:</strong> The more players, the bigger the rewards!
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="vx-stats-grid">
              {statsCards.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>

            {/* Champions */}
            <h2 className="vx-champions-title">
              <Crown style={{ width: 28, height: 28, color: "#facc15" }} />
              Top Champions
            </h2>

            {champions.length > 0 ? (
              <div className="vx-champions-grid">
                {champions.map((champion, i) => (
                  <ChampionCard key={i} champion={champion} delay={i * 100} />
                ))}
              </div>
            ) : (
              <div
                className="vx-glass-card"
                style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  marginBottom: 64,
                  animation: "fade-in-up 0.6s ease-out",
                }}
              >
                <Trophy style={{ width: 56, height: 56, color: "#64748b", margin: "0 auto 20px" }} />
                <p style={{ fontSize: 18, color: "#94a3b8", margin: 0, fontWeight: 500 }}>
                  No champions yet. Be the first to compete!
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="vx-footer">
          <div className="vx-container">
            <div className="vx-footer-legal">
              <strong style={{ color: "#94a3b8" }}>Educational Quiz Competition.</strong> 18+ only. 
              This is a 100% skill-based knowledge competition with no element of chance. 
              Entry fees apply. Prize pool activates with 2000+ monthly participants. See{" "}
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
              <div style={{ marginBottom: 10, textAlign: "center" }}>
                © 2025 VibraXX. Operated by Sermin Limited (UK)
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10, textAlign: "center" }}>
                Registered in England & Wales | All rights reserved
              </div>
              <div style={{ marginBottom: 12, textAlign: "center" }}>
                <a 
                  href="mailto:team@vibraxx.com"
                  style={{ 
                    color: "#a78bfa", 
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  team@vibraxx.com
                </a>
              </div>
              <div style={{ fontSize: 11, textAlign: "center" }}>
                Payment processing by{" "}
                <a 
                  href="https://stripe.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: "#a78bfa", textDecoration: "none" }}
                >
                  Stripe
                </a>
                {" "}| Secure SSL encryption | Skill-based competition - Not gambling
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}