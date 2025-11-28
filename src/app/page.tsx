"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// ❌ REMOVED: import Head from "next/head"; - Use metadata in layout.tsx instead
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
  User,
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

// ✅ PREMIUM: Memoized Components
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
  return (
    <div className="vx-champ-card">
      {/* Premium icon container with subtle accent */}
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
      
      {/* Period label */}
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
      
      {/* Name - white */}
      <div style={{ 
        fontSize: 18, 
        fontWeight: 700, 
        marginBottom: 8,
        color: "#ffffff",
      }}>
        {champion.name}
      </div>
      
      {/* Score - colored accent */}
      <div style={{ 
        fontSize: 24, 
        fontWeight: 800, 
        color: champion.color,
        lineHeight: 1,
      }}>
        {champion.score.toLocaleString()} pts
      </div>
    </div>
  );
});
ChampionCard.displayName = "ChampionCard";

// Age Verification Modal Component
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

// No Rounds Modal Component
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
          You need to purchase rounds to enter the Live Quiz lobby and compete for the <strong style={{ color: "#fbbf24" }}>£1000 monthly prize</strong>!
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
  const [nextRound, setNextRound] = useState<number | null>(null);
  const [activePlayers, setActivePlayers] = useState(600);
  const [user, setUser] = useState<any>(null);
  const [champions, setChampions] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalQuestions: 0, roundsPerDay: 96 });
  const [isLoading, setIsLoading] = useState(true);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"live" | "free" | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [userRounds, setUserRounds] = useState(0);
  const [showNoRoundsModal, setShowNoRoundsModal] = useState(false);

  // Fetch user's available rounds
  const fetchUserRounds = useCallback(async () => {
    if (!user) {
      setUserRounds(0);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_rounds")
        .select("available_rounds")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setUserRounds(data.available_rounds || 0);
      } else {
        setUserRounds(0);
      }
    } catch (err) {
      console.error("User rounds fetch error:", err);
      setUserRounds(0);
    }
  }, [user]);

  // Initial Load with smooth fade in
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Smooth fade in for neon orbs after page loads
    if (!isInitialLoad) {
      const orbs = document.querySelectorAll('.animate-float');
      orbs.forEach((orb, index) => {
        setTimeout(() => {
          (orb as HTMLElement).style.opacity = index === 0 ? '0.28' : '0.22';
        }, 300 + index * 200);
      });
    }
  }, [isInitialLoad]);

  // Fetch user rounds when user changes
  useEffect(() => {
    if (user) {
      fetchUserRounds();
    }
  }, [user, fetchUserRounds]);

  // Real-time Active Players with Dynamic Variation
  const fetchActivePlayers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("active_sessions")
        .select("count", { count: "exact", head: true });
      
      if (!error && data !== null) {
        const realCount = (data as any) || 0;
        // Base: 600 + gerçek sayı + rastgele varyasyon (-50 ile +150 arası)
        const variation = Math.floor(Math.random() * 200) - 50;
        const finalCount = Math.max(600, 600 + realCount + variation);
        setActivePlayers(finalCount);
      } else {
        // Supabase hatası varsa dinamik sayı üret
        const variation = Math.floor(Math.random() * 200) - 50;
        setActivePlayers(Math.max(600, 600 + variation));
      }
    } catch (err) {
      console.error("Active players fetch error:", err);
      const variation = Math.floor(Math.random() * 200) - 50;
      setActivePlayers(Math.max(600, 600 + variation));
    }
  }, []);

  // Next Round Countdown
  const fetchNextRound = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_rounds")
        .select("scheduled_at")
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
        setNextRound(900);
      }
    } catch (err) {
      console.error("Next round fetch error:", err);
      setNextRound(900);
    }
  }, []);

  // Fetch Champions from Supabase (Optimized with proper error handling)
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

            if (error) {
              console.warn(`No ${period} champion data:`, error.message);
              return null;
            }

            if (!data) return null;

            const icons = [Crown, Trophy, Sparkles];
            const gradients = [
              "linear-gradient(to bottom right, #eab308, #f97316)",
              "linear-gradient(to bottom right, #8b5cf6, #d946ef)",
              "linear-gradient(to bottom right, #3b82f6, #06b6d4)",
            ];
            const colors = ["#facc15", "#c084fc", "#22d3ee"];

            // Safely access nested user data
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
      setChampions(validChampions.length > 0 ? validChampions : getDefaultChampions());
    } catch (err) {
      console.error("Champions fetch error:", err);
      setChampions(getDefaultChampions());
    }
  }, []);

  // Default Champions (removed fake names, will be populated from DB)
  const getDefaultChampions = () => [
    {
      period: "Daily",
      name: "TBA",
      score: 0,
      gradient: "linear-gradient(to bottom right, #eab308, #f97316)",
      color: "#facc15",
      icon: Crown,
    },
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
      icon: Sparkles,
    },
  ];

  // Fetch Stats from Supabase (Optimized)
  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_stats")
        .select("total_questions, rounds_per_day")
        .single();

      if (!error && data) {
        setStats({
          totalQuestions: data.total_questions || 2800000,
          roundsPerDay: data.rounds_per_day || 96,
        });
      } else {
        console.warn("No stats data found, using defaults");
        setStats({
          totalQuestions: 2800000,
          roundsPerDay: 96,
        });
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
      setStats({
        totalQuestions: 2800000,
        roundsPerDay: 96,
      });
    }
  }, []);

  // Initial Load
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

  // Real-time Updates
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

  // Auth Listener
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);
      
      // ✅ Check for pending buy action after login
      if (data.user) {
        const pendingBuy = localStorage.getItem('vibraxx_pending_buy');
        if (pendingBuy === 'true') {
          localStorage.removeItem('vibraxx_pending_buy');
          router.push('/buy');
        }
      }
    };
    loadUser();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      
      // ✅ Check for pending buy action when user logs in
      if (session?.user) {
        const pendingBuy = localStorage.getItem('vibraxx_pending_buy');
        if (pendingBuy === 'true') {
          localStorage.removeItem('vibraxx_pending_buy');
          router.push('/buy');
        }
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [router]);

  // Music Toggle
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

  // Load Music Preference
  useEffect(() => {
    const musicPref = localStorage.getItem("vibraxx_music");
    if (musicPref === "true") {
      playMenuMusic();
      setIsPlaying(true);
    }
    return () => stopMenuMusic();
  }, []);

  // Auth Actions
  const handleSignIn = useCallback(async (redirectPath?: string) => {
    const redirectUrl = redirectPath 
      ? `${window.location.origin}${redirectPath}`
      : `${window.location.origin}/auth/callback`;
      
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  // Age Verification Handler
  const handleAgeVerification = useCallback(() => {
    localStorage.setItem("vibraxx_age_verified", "true");
    setShowAgeModal(false);
    
    if (pendingAction === "live") {
      // Re-check rounds after age verification
      if (userRounds <= 0) {
        setShowNoRoundsModal(true);
      } else {
        router.push("/lobby");
      }
    } else if (pendingAction === "free") {
      router.push("/free");
    }
    setPendingAction(null);
  }, [pendingAction, userRounds, router]);

  // Check if user is verified 18+
  const checkAgeVerification = useCallback(() => {
    return localStorage.getItem("vibraxx_age_verified") === "true";
  }, []);

  // Start Live Quiz
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

    // Check if user has available rounds
    if (userRounds <= 0) {
      setShowNoRoundsModal(true);
      return;
    }

    // User has rounds, go to lobby
    router.push("/lobby");
  }, [user, handleSignIn, checkAgeVerification, userRounds, router]);

  // Start Free Quiz
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

  // Format Time
  const formatTime = useCallback((seconds: number | null) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  // ✅ PREMIUM: Stats Cards (no color prop)
  const statsCards = useMemo(
    () => [
      {
        icon: Globe,
        value: `${Math.floor(activePlayers / 1000)}K+`,
        label: "Active Players",
      },
      {
        icon: Sparkles,
        value: `${(stats.totalQuestions / 1000000).toFixed(1)}M+`,
        label: "Questions Answered",
      },
      {
        icon: Zap,
        value: `${stats.roundsPerDay}/day`,
        label: "Live Rounds",
      },
    ],
    [activePlayers, stats]
  );

  return (
    <>
      {/* ❌ REMOVED: <Head> component - SEO metadata moved to app/layout.tsx */}
      {/* Add metadata export to app/layout.tsx instead */}

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

        .vx-container { max-width: 1280px; margin: 0 auto; padding: 0 16px; }
        @media (min-width: 640px) { .vx-container { padding: 0 24px; } }

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

        .vx-header-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .vx-hide-mobile { display: none; }

        @media (min-width: 640px) {
          .vx-header-inner { height: 80px; flex-wrap: nowrap; }
          .vx-header-right { gap: 12px; }
          .vx-hide-mobile { display: inline-flex; }
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
          0%, 100% {
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
          .vx-livebar-inner { font-size: 14px; padding: 10px 24px; }
        }

        .vx-hero { padding: 72px 16px 80px; text-align: center; }
        @media (min-width: 640px) { .vx-hero { padding: 96px 24px 96px; } }

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
          0% { left: -100%; }
          50%, 100% { left: 100%; }
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
          .vx-hero-subtitle { font-size: 18px; margin-bottom: 40px; }
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

        .vx-cta-btn:hover { transform: translateY(-2px); }
        .vx-cta-btn:active { transform: translateY(0); }

        @media (min-width: 640px) {
          .vx-cta-btn { 
            padding: 18px 34px; 
            font-size: 18px;
            width: auto;
            min-width: 220px;
          }
        }

        .vx-cta-live { box-shadow: 0 20px 40px -16px rgba(139, 92, 246, 0.6); }
        .vx-cta-free { box-shadow: 0 20px 40px -16px rgba(34, 211, 238, 0.5); }

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

        /* ✅ PREMIUM: Stats Card */
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

        /* Premium shine effect */
        .vx-stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100px;
          right: -100px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        }

        .vx-stat-card:hover { 
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
        }

        @media (min-width: 640px) {
          .vx-stat-card { min-height: 150px; padding: 1.75rem; }
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
          .vx-stat-value { font-size: 32px; }
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
          .vx-champions-title { font-size: 32px; margin-bottom: 32px; }
        }

        .vx-champions-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 56px;
        }

        @media (min-width: 768px) {
          .vx-champions-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 20px;
          }
        }

        /* ✅ PREMIUM: Champion Card */
        .vx-champ-card {
          position: relative;
          padding: 24px;
          borderRadius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          backdrop-filter: blur(20px);
          text-align: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        /* Premium shine effect */
        .vx-champ-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100px;
          right: -100px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        }

        .vx-champ-card:hover { 
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        @media (min-width: 640px) {
          .vx-champ-card { padding: 28px; }
        }

        /* Footer */}
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
          .vx-footer { font-size: 13px; padding: 40px 24px 28px; }
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

        .vx-footer-links a:hover { color: #c4b5fd; }

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

        /* ✅ MOBILE OPTIMIZATIONS */
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
          
          /* Premium countdown mobile */
          .vx-hero-countdown-container {
            margin: 20px auto !important;
            padding: 16px 20px !important;
            max-width: 320px !important;
          }
          
          .vx-hero-countdown-timer {
            font-size: 32px !important; /* 38px → 32px */
          }
          
          /* Live banner mobile */
          .vx-livebar {
            padding: 10px 0 !important;
          }
          
          .vx-livebar-inner {
            font-size: 11px !important;
            gap: 6px !important;
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .vx-livebar-inner > div {
            font-size: 11px !important;
          }
          
          /* Stats grid mobile */
          .vx-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          
          /* Champions grid mobile */
          .vx-champions-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          
          /* Footer mobile */
          .vx-footer-links {
            flex-direction: column !important;
            gap: 8px !important;
            align-items: center !important;
          }
          
          .vx-footer-divider {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          .vx-hero-title {
            font-size: 28px !important;
          }
          
          .vx-hero-countdown-timer {
            font-size: 28px !important; /* 32px → 28px */
          }
          
          .vx-hero-countdown-container {
            max-width: 280px !important;
            padding: 14px 16px !important;
          }
          
          .vx-stat-card {
            padding: 16px !important;
          }
          
          .vx-champ-card {
            padding: 20px !important;
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
        {/* Neon Orbs */}
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

        {/* Age Verification Modal */}
        {showAgeModal && (
          <AgeVerificationModal
            onConfirm={handleAgeVerification}
            onCancel={() => {
              setShowAgeModal(false);
              setPendingAction(null);
            }}
          />
        )}

        {/* No Rounds Modal */}
        {showNoRoundsModal && (
          <NoRoundsModal
            onBuyRounds={async () => {
              setShowNoRoundsModal(false);
              
              // ✅ FIX: Check if user is logged in
              if (!user) {
                // Save pending action
                localStorage.setItem('vibraxx_pending_buy', 'true');
                
                // Sign in with Google - will redirect to /auth/callback
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                  },
                });
                return;
              }
              
              // Already logged in - go to buy page
              router.push("/buy");
            }}
            onCancel={() => setShowNoRoundsModal(false)}
          />
        )}

        {/* HEADER */}
        <header className="vx-header">
          <div className="vx-container">
            <div className="vx-header-inner">
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <div
                  style={{
                    position: "relative",
                    width: 90,
                    height: 90,
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
                      letterSpacing: "0.14em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Live Quiz Arena
                  </span>
                </div>
              </div>

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

                {/* Buy Round Button */}
                <button
                  onClick={() => router.push("/buy")}
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

                {/* Leaderboard */}
                <button
                  onClick={() => router.push("/leaderboard")}
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
                    {/* Profile Button */}
                    <button
                      onClick={() => router.push("/profile")}
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
                        className="vx-hide-mobile"
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

                    {/* Sign Out */}
                    <button
                      onClick={handleSignOut}
                      aria-label="Sign out"
                      className="vx-hide-mobile"
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
                        }}
                      />
                      <span style={{ position: "relative", zIndex: 10 }}>Sign Out</span>
                    </button>
                  </>
                ) : (
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
                      }}
                    />
                    <span style={{ position: "relative", zIndex: 10 }}>Sign in with Google</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* LIVE BANNER - Simplified */}
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
                <span style={{ 
                  color: "#22c55e", 
                  fontWeight: 700,
                  fontSize: 15,
                  textShadow: "0 0 20px rgba(34, 197, 94, 0.5)",
                  letterSpacing: "0.1em",
                }}>
                  LIVE
                </span>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#cbd5e1",
                }}
              >
                <Globe style={{ width: 14, height: 14, color: "#a78bfa" }} />
                <span style={{ fontWeight: 700, color: "white" }}>
                  {activePlayers.toLocaleString()}
                </span>
                <span>players online</span>
              </div>
            </div>
          </div>
        </div>

        {/* HERO + CONTENT */}
        <main className="vx-hero">
          <div className="vx-container">
            <div className="vx-hero-badge">
              <Crown style={{ width: 16, height: 16, color: "#fbbf24" }} />
              Knowledge Quiz with a £1000 Monthly Prize
              <Trophy style={{ width: 16, height: 16, color: "#fbbf24" }} />
            </div>

            {/* Prize Pool Notice - Below badge with proper block display */}
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
                Prize pool activates at 2000+
              </div>
            </div>

            <h1 className="vx-hero-title">
              <span className="vx-hero-neon">The Next Generation Live Quiz</span>
            </h1>

            <p className="vx-hero-subtitle">
              The world's number one educational and award-winning quiz!
            </p>

            {/* ✅ PREMIUM: Compact Countdown Timer */}
            <div
              style={{
                margin: "24px auto 28px",
                maxWidth: 380,
                padding: "18px 24px",
                borderRadius: 16,
                background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Premium shine effect */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: -100,
                  right: -100,
                  height: 1,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                }}
              />
              
              <div style={{ position: "relative", zIndex: 10 }}>
                {/* Top label */}
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#9ca3af",
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    textAlign: "center",
                  }}
                >
                  Next Round
                </div>
                
                {/* Timer display */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  {/* Time value */}
                  <div
                    style={{
                      fontSize: 38,
                      fontWeight: 800,
                      color: "#ffffff",
                      fontFamily: "ui-monospace, monospace",
                      letterSpacing: "0.02em",
                      textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
                      lineHeight: 1,
                    }}
                  >
                    {formatTime(nextRound)}
                  </div>
                  
                  {/* Live indicator */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 10px",
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                      boxShadow: "0 0 20px rgba(34, 197, 94, 0.4)",
                    }}
                  >
                    <div
                      className="animate-pulse-slow"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#ffffff",
                        boxShadow: "0 0 8px #ffffff",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#ffffff",
                        letterSpacing: "0.05em",
                      }}
                    >
                      LIVE
                    </span>
                  </div>
                </div>
                
                {/* Bottom info */}
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
                    {activePlayers.toLocaleString()}
                  </span>
                  <span>players ready</span>
                </div>
              </div>
            </div>

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
                    background: "linear-gradient(to right,#7c3aed,#d946ef)",
                  }}
                />
                <Play
                  style={{
                    position: "relative",
                    zIndex: 10,
                    width: 20,
                    height: 20,
                  }}
                />
                <span style={{ position: "relative", zIndex: 10 }}>Start Live Quiz</span>
                <ArrowRight
                  style={{
                    position: "relative",
                    zIndex: 10,
                    width: 20,
                    height: 20,
                  }}
                />
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
                    background: "linear-gradient(to right,#06b6d4,#22d3ee)",
                  }}
                />
                <Gift
                  style={{
                    position: "relative",
                    zIndex: 10,
                    width: 20,
                    height: 20,
                  }}
                />
                <span style={{ position: "relative", zIndex: 10 }}>Start Free Quiz</span>
                <ArrowRight
                  style={{
                    position: "relative",
                    zIndex: 10,
                    width: 20,
                    height: 20,
                  }}
                />
              </button>
            </div>

            {/* ✅ PREMIUM: Pricing Info Section */}
            <div
              style={{
                maxWidth: 640,
                margin: "0 auto 48px",
                padding: "32px 24px",
                borderRadius: 20,
                background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Premium shine effect */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: -100,
                  right: -100,
                  height: 1,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                }}
              />

              <div style={{ position: "relative", zIndex: 10 }}>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#ffffff",
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <ShoppingCart style={{ width: 20, height: 20, color: "#9ca3af" }} />
                    Round Pricing
                  </h3>
                  <p style={{ fontSize: 13, color: "#6b7280", margin: 0, fontWeight: 500 }}>
                    Affordable entry to compete for £1000 monthly prize
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  {/* Single Round */}
                  <div
                    style={{
                      padding: "20px 16px",
                      borderRadius: 16,
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      textAlign: "center",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Single Round
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: "#fbbf24", marginBottom: 4, lineHeight: 1 }}>
                      £1
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>per round</div>
                  </div>

                  {/* Value Pack - Highlighted */}
                  <div
                    style={{
                      padding: "20px 16px",
                      borderRadius: 16,
                      background: "linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))",
                      border: "2px solid rgba(251, 191, 36, 0.3)",
                      textAlign: "center",
                      position: "relative",
                      boxShadow: "0 0 30px rgba(251, 191, 36, 0.15)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.5)";
                      e.currentTarget.style.boxShadow = "0 0 40px rgba(251, 191, 36, 0.25)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.3)";
                      e.currentTarget.style.boxShadow = "0 0 30px rgba(251, 191, 36, 0.15)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Best Value Badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: -10,
                        right: -10,
                        background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                        color: "#0a0a0a",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "4px 8px",
                        borderRadius: 6,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        boxShadow: "0 2px 8px rgba(251, 191, 36, 0.4)",
                      }}
                    >
                      Save 17%
                    </div>
                    <div style={{ fontSize: 12, color: "#fbbf24", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Value Pack
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: "#fbbf24", marginBottom: 4, lineHeight: 1 }}>
                      £29
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>35 rounds (£0.83 each)</div>
                  </div>
                </div>

                {/* Premium Prize Pool Info */}
                <div
                  style={{
                    padding: "16px",
                    borderRadius: 12,
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "start", gap: 10, marginBottom: 10 }}>
                    <AlertCircle
                      style={{
                        width: 16,
                        height: 16,
                        color: "#9ca3af",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#ffffff", marginBottom: 4 }}>
                        Prize Pool Activation
                      </div>
                      <p style={{ fontSize: 11, color: "#6b7280", margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                        The <strong style={{ color: "#fbbf24" }}>£1000 monthly prize</strong> activates when we reach{" "}
                        <strong style={{ color: "#ffffff" }}>2000+ active participants</strong>. This ensures platform sustainability and full prize delivery.
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "start", gap: 10 }}>
                    <CheckCircle
                      style={{
                        width: 16,
                        height: 16,
                        color: "#22c55e",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    />
                    <p style={{ fontSize: 11, color: "#6b7280", margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                      <strong style={{ color: "#22c55e" }}>Fair & Transparent:</strong> All rounds contribute to the prize pool. The more players, the bigger the rewards!
                    </p>
                  </div>
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

        {/* ✅ PREMIUM: Trust Elements */}
        <div style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          background: "rgba(255, 255, 255, 0.01)",
          padding: "32px 0",
        }}>
          <div className="vx-container">
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 24,
              maxWidth: 1024,
              margin: "0 auto",
            }}>
              {/* SSL Encrypted */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: 16,
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(34, 197, 94, 0.1)",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <CheckCircle style={{ width: 20, height: 20, color: "#22c55e" }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", textAlign: "center" }}>
                  SSL Encrypted
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center", fontWeight: 500 }}>
                  Bank-level security
                </div>
              </div>

              {/* Stripe Verified */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: 16,
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(139, 92, 246, 0.1)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <ShoppingCart style={{ width: 20, height: 20, color: "#8b5cf6" }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", textAlign: "center" }}>
                  Stripe Verified
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center", fontWeight: 500 }}>
                  Secure payments
                </div>
              </div>

              {/* 18+ Only */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: 16,
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(251, 191, 36, 0.1)",
                  border: "1px solid rgba(251, 191, 36, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <AlertCircle style={{ width: 20, height: 20, color: "#fbbf24" }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", textAlign: "center" }}>
                  18+ Only
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center", fontWeight: 500 }}>
                  Age verified
                </div>
              </div>

              {/* Global Competition */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: 16,
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(6, 182, 212, 0.1)",
                  border: "1px solid rgba(6, 182, 212, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Globe style={{ width: 20, height: 20, color: "#06b6d4" }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", textAlign: "center" }}>
                  Global Arena
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", textAlign: "center", fontWeight: 500 }}>
                  Worldwide players
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="vx-footer">
          <div className="vx-container">
            {/* Legal Disclaimer */}
            <div className="vx-footer-legal">
              <strong style={{ color: "#94a3b8" }}>Educational Quiz Competition.</strong> 18+ only. 
              This is a 100% skill-based knowledge competition with no element of chance. 
              Entry fees apply. Prize pool activates with 2000+ monthly participants. See{" "}
              <a href="/terms" style={{ color: "#a78bfa", textDecoration: "underline" }}>
                Terms & Conditions
              </a>{" "}
              for full details.
            </div>

            {/* Main Links */}
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

            {/* Company Info */}
            <div className="vx-footer-company">
              <div style={{ marginBottom: 8, textAlign: "center" }}>
                © 2025 VibraXX. Operated by Sermin Limited (UK)
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, textAlign: "center" }}>
                Registered in England & Wales | All rights reserved
              </div>
              <div style={{ marginBottom: 10, textAlign: "center" }}>
                <a 
                  href="mailto:team@vibraxx.com"
                  style={{ 
                    color: "#a78bfa", 
                    textDecoration: "none",
                    fontSize: 12,
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