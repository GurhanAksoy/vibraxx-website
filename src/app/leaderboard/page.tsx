"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Crown, Trophy, Star, Target, Clock, Users,
  Sparkles, Volume2, VolumeX, ChevronRight, Home
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Footer from "@/components/Footer";

// ✅ TIER CONFIGURATION (Profile page ile aynı)
const TIERS = {
  BRONZE: { min: 0, max: 500, name: "Bronze", icon: "🥉", color: "#cd7f32", gradient: "linear-gradient(135deg, #cd7f32, #b8651f)" },
  SILVER: { min: 500, max: 2000, name: "Silver", icon: "🥈", color: "#c0c0c0", gradient: "linear-gradient(135deg, #c0c0c0, #a8a8a8)" },
  GOLD: { min: 2000, max: 5000, name: "Gold", icon: "🥇", color: "#ffd700", gradient: "linear-gradient(135deg, #ffd700, #ffed4e)" },
  DIAMOND: { min: 5000, max: Infinity, name: "Diamond", icon: "💎", color: "#b9f2ff", gradient: "linear-gradient(135deg, #b9f2ff, #7dd3fc)" },
};

interface Player {
  id: string;
  rank: number;
  name: string;
  score: number;
  correct: number;
  wrong: number;
  rounds: number;
  accuracy: number;
  tier: string;
  tierIcon: string;
  tierColor: string;
}

// ─── PODIUM CARD ───────────────────────────────────────────
// place: 1 | 2 | 3  →  her place için renk/boyut/davranış farklı
// Tasarım pixel-exact korunur, sadece tekrar eden inline JSX → component
const PODIUM_CFG = {
  1: {
    order: 2, animDelay: "0.2s", glowClass: "animate-glow",
    hoverY: "-12px",
    card: { pad: "clamp(24px, 5vw, 36px)", radius: "clamp(20px, 4vw, 28px)", border: "4px solid rgba(251,191,36,0.8)", bg: "linear-gradient(135deg, rgba(251,191,36,0.25), rgba(245,158,11,0.2))", blur: "25px", shadow: "0 0 60px rgba(251,191,36,0.6)" },
    medal: { size: "clamp(90px, 18vw, 120px)", pad: "5px", ring: "linear-gradient(135deg, #fbbf24, #f59e0b)", glow: "0 0 50px rgba(251,191,36,0.8)", emoji: "🥇", emojiSize: "clamp(40px, 8vw, 60px)", margin: "0 auto clamp(20px, 4vw, 24px)" },
    badge: { size: "clamp(36px, 7vw, 48px)", bottom: "-10px", border: "3px solid #0f172a", fontSize: "clamp(16px, 3.5vw, 24px)" },
    name: { size: "clamp(18px, 4vw, 24px)", weight: 900, mb: "6px" },
    tier: { gap: "6px", pad: "6px 14px", borderFn: (c: string) => `2px solid ${c}`, bgFn: (c: string) => `${c}25`, mb: "16px", fontSize: "clamp(11px, 2.2vw, 14px)", iconStyle: { fontSize: "clamp(14px, 3vw, 18px)" }, iconWeight: 800 },
    score: { size: "clamp(32px, 7vw, 48px)", gradient: "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)", mb: "12px" },
    showCrown: true,
    stats: "grid", // 1st: 2-col grid
  },
  2: {
    order: 1, animDelay: "0.1s", glowClass: "",
    hoverY: "-8px",
    card: { pad: "clamp(20px, 4vw, 28px)", radius: "clamp(16px, 3vw, 24px)", border: "3px solid rgba(192,192,192,0.6)", bg: "linear-gradient(135deg, rgba(192,192,192,0.2), rgba(156,163,175,0.15))", blur: "20px", shadow: "0 0 40px rgba(192,192,192,0.4)" },
    medal: { size: "clamp(70px, 14vw, 100px)", pad: "4px", ring: "linear-gradient(135deg, #d1d5db, #9ca3af)", glow: "0 0 30px rgba(192,192,192,0.6)", emoji: "🥈", emojiSize: "clamp(32px, 6vw, 48px)", margin: "0 auto clamp(16px, 3vw, 20px)" },
    badge: { size: "clamp(32px, 6vw, 40px)", bottom: "-8px", border: "2px solid #0f172a", fontSize: "clamp(14px, 3vw, 20px)" },
    name: { size: "clamp(14px, 3vw, 18px)", weight: 800, mb: "4px" },
    tier: { gap: "4px", pad: "4px 10px", borderFn: (c: string) => `1px solid ${c}60`, bgFn: (c: string) => `${c}20`, mb: "12px", fontSize: "clamp(10px, 2vw, 12px)", iconStyle: {}, iconWeight: 700 },
    score: { size: "clamp(24px, 5vw, 36px)", gradient: "linear-gradient(90deg, #d1d5db, #9ca3af)", mb: "8px" },
    showCrown: false,
    stats: "column",
  },
  3: {
    order: 3, animDelay: "0.15s", glowClass: "",
    hoverY: "-8px",
    card: { pad: "clamp(20px, 4vw, 28px)", radius: "clamp(16px, 3vw, 24px)", border: "3px solid rgba(217,119,6,0.6)", bg: "linear-gradient(135deg, rgba(217,119,6,0.2), rgba(194,65,12,0.15))", blur: "20px", shadow: "0 0 40px rgba(217,119,6,0.4)" },
    medal: { size: "clamp(70px, 14vw, 100px)", pad: "4px", ring: "linear-gradient(135deg, #d97706, #c2410c)", glow: "0 0 30px rgba(217,119,6,0.6)", emoji: "🥉", emojiSize: "clamp(32px, 6vw, 48px)", margin: "0 auto clamp(16px, 3vw, 20px)" },
    badge: { size: "clamp(32px, 6vw, 40px)", bottom: "-8px", border: "2px solid #0f172a", fontSize: "clamp(14px, 3vw, 20px)" },
    name: { size: "clamp(14px, 3vw, 18px)", weight: 800, mb: "4px" },
    tier: { gap: "4px", pad: "4px 10px", borderFn: (c: string) => `1px solid ${c}60`, bgFn: (c: string) => `${c}20`, mb: "12px", fontSize: "clamp(10px, 2vw, 12px)", iconStyle: {}, iconWeight: 700 },
    score: { size: "clamp(24px, 5vw, 36px)", gradient: "linear-gradient(90deg, #d97706, #c2410c)", mb: "8px" },
    showCrown: false,
    stats: "column",
  },
} as const;

function PodiumCard({ player, place }: { player: Player; place: 1 | 2 | 3 }) {
  const c = PODIUM_CFG[place];

  return (
    <div
      className={`animate-slide-up podium-${place === 1 ? "1st" : place === 2 ? "2nd" : "3rd"}`}
      style={{ order: c.order, animationDelay: c.animDelay }}
    >
      <div
        className={c.glowClass || undefined}
        style={{
          padding: c.card.pad,
          borderRadius: c.card.radius,
          border: c.card.border,
          background: c.card.bg,
          backdropFilter: `blur(${c.card.blur})`,
          textAlign: "center" as const,
          boxShadow: c.card.shadow,
          transition: "transform 0.3s",
          cursor: "default",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = `translateY(${c.hoverY})`)}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        {/* Crown — sadece 1st */}
        {c.showCrown && (
          <Crown className="animate-crown" style={{
            width: "clamp(32px, 6vw, 48px)",
            height: "clamp(32px, 6vw, 48px)",
            color: "#fbbf24",
            margin: "0 auto clamp(12px, 2.5vw, 16px)",
          }} />
        )}

        {/* Medal Ring */}
        <div style={{
          position: "relative",
          width: c.medal.size,
          height: c.medal.size,
          margin: c.medal.margin,
          borderRadius: "50%",
          padding: c.medal.pad,
          background: c.medal.ring,
          boxShadow: c.medal.glow,
        }}>
          <div style={{
            width: "100%", height: "100%",
            borderRadius: "50%",
            background: "#1e293b",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: c.medal.emojiSize,
          }}>
            {c.medal.emoji}
          </div>
          {/* Rank number badge */}
          <div style={{
            position: "absolute",
            bottom: c.badge.bottom,
            left: "50%",
            transform: "translateX(-50%)",
            width: c.badge.size,
            height: c.badge.size,
            borderRadius: "50%",
            background: c.medal.ring,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: c.badge.border,
            color: "#0f172a",
            fontWeight: 900,
            fontSize: c.badge.fontSize,
          }}>
            {place}
          </div>
        </div>

        {/* Name */}
        <h2 style={{
          fontSize: c.name.size,
          fontWeight: c.name.weight,
          marginBottom: c.name.mb,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap" as const,
        }}>
          {player.name}
        </h2>

        {/* Tier Badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: c.tier.gap,
          padding: c.tier.pad,
          borderRadius: "999px",
          background: c.tier.bgFn(player.tierColor),
          border: c.tier.borderFn(player.tierColor),
          marginBottom: c.tier.mb,
          fontSize: c.tier.fontSize,
        }}>
          <span style={c.tier.iconStyle}>{player.tierIcon}</span>
          <span style={{ color: player.tierColor, fontWeight: c.tier.iconWeight }}>
            {player.tier}
          </span>
        </div>

        {/* Score */}
        <div style={{
          fontSize: c.score.size,
          fontWeight: 900,
          background: c.score.gradient,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: c.score.mb,
        }}>
          {(player.score ?? 0).toLocaleString()}
        </div>

        {/* Stats — 1st: grid, 2nd/3rd: column */}
        {c.stats === "grid" ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            fontSize: "clamp(11px, 2.2vw, 14px)",
          }}>
            <div>
              <div style={{ color: "#22c55e", fontWeight: 700 }}>{player.accuracy}%</div>
              <div style={{ color: "#94a3b8", fontSize: "clamp(9px, 1.8vw, 11px)" }}>accuracy</div>
            </div>
            <div>
              <div style={{ color: "#38bdf8", fontWeight: 700 }}>{player.rounds}</div>
              <div style={{ color: "#94a3b8", fontSize: "clamp(9px, 1.8vw, 11px)" }}>rounds</div>
            </div>
          </div>
        ) : (
          <div style={{
            fontSize: "clamp(10px, 2vw, 12px)",
            color: "#94a3b8",
            display: "flex",
            flexDirection: "column" as const,
            gap: "4px",
          }}>
            <span>{player.accuracy}% accuracy</span>
            <span>{player.rounds} rounds</span>
          </div>
        )}
      </div>
    </div>
  );
}
// ────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const router = useRouter();
  
  // Core State
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stats — players'dan türetilir (useMemo, ayrı state yok)
  const [totalRounds, setTotalRounds] = useState(0); // prize unlock: toplam rounds_played
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0 });
  
  // Prize unlock constants
  const PRIZE_UNLOCK_THRESHOLD = 3000;
  
  // Background Music State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ✅ GET TIER INFO
  const getTierInfo = useCallback((totalScore: number) => {
    if (totalScore >= TIERS.DIAMOND.min) return TIERS.DIAMOND;
    if (totalScore >= TIERS.GOLD.min) return TIERS.GOLD;
    if (totalScore >= TIERS.SILVER.min) return TIERS.SILVER;
    return TIERS.BRONZE;
  }, []);

  // ✅ SEO
  useEffect(() => {
    document.title = `${activeTab === 'weekly' ? 'Weekly' : 'Monthly'} Leaderboard - VibraXX`;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", `Compete for £1,000 monthly prize. View ${activeTab} VibraXX leaderboard rankings in UK's premier skill-based quiz competition.`);
    }
  }, [activeTab]);

  // ✅ BACKGROUND MUSIC
  useEffect(() => {
    const audio = new Audio("/sounds/vibraxx.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    const musicEnabled = localStorage.getItem("vibraxx_music_enabled");
    if (musicEnabled === "true") {
      setIsMusicPlaying(true);
    }

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
        const musicEnabled = localStorage.getItem("vibraxx_music_enabled");
        
        // Autoplay on first interaction (unless user explicitly disabled it)
        if (musicEnabled !== "false" && audioRef.current) {
          setIsMusicPlaying(true);
          audioRef.current.play().catch(err => console.log("Audio blocked:", err));
        }
      }
    };

    document.addEventListener("click", handleFirstInteraction, { once: true });
    return () => document.removeEventListener("click", handleFirstInteraction);
  }, [hasInteracted]);

  useEffect(() => {
    if (!audioRef.current || !hasInteracted) return;

    if (isMusicPlaying) {
      audioRef.current.play().catch(err => console.log("Play error:", err));
      localStorage.setItem("vibraxx_music_enabled", "true");
    } else {
      audioRef.current.pause();
      localStorage.setItem("vibraxx_music_enabled", "false");
    }
  }, [isMusicPlaying, hasInteracted]);

  const toggleMusic = useCallback(() => {
    setIsMusicPlaying(prev => !prev);
  }, []);

  // ✅ CALCULATE TIME REMAINING
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      let targetDate: Date;

      if (activeTab === 'weekly') {
        // Next Sunday 23:59:59 UTC
        targetDate = new Date(now);
        const daysUntilSunday = (7 - now.getUTCDay()) % 7 || 7;
        targetDate.setUTCDate(now.getUTCDate() + daysUntilSunday);
        targetDate.setUTCHours(23, 59, 59, 999);
      } else {
        // End of current month 23:59:59 UTC
        targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
      }

      const diff = targetDate.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining({ days, hours, minutes });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [activeTab]);

  // ✅ FETCH LEADERBOARD DATA (YENİ SUPABASE ŞEMASI)
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase.rpc("get_leaderboard_snapshot", {
          p_tab: activeTab,  // 'weekly' | 'monthly'
        });

        if (error) {
          console.error(`Leaderboard ${activeTab} error:`, error);
          setPlayers([]);
          return;
        }

        if (!data || data.length === 0) {
          setPlayers([]);
          setTotalRounds(0);
          return;
        }

        // Map to Player format with tier info
        const leaderboard: Player[] = data.map((player: any) => {
          const tier = getTierInfo(player.total_score || 0);
          const totalQuestions = (player.correct_answers || 0) + (player.wrong_answers || 0);
          const accuracy = totalQuestions > 0 
            ? Math.round(((player.correct_answers || 0) / totalQuestions) * 100)
            : 0;

          return {
            id: player.user_id,
            rank: player.rank,
            name: player.full_name || "Anonymous",
            score: player.total_score || 0,
            correct: player.correct_answers || 0,
            wrong: player.wrong_answers || 0,
            rounds: player.rounds_played || 0,
            accuracy,
            tier: tier.name,
            tierIcon: tier.icon,
            tierColor: tier.color,
          };
        });

        setPlayers(leaderboard);

        // prize unlock progress: toplam rounds
        setTotalRounds(leaderboard.reduce((sum, p) => sum + p.rounds, 0));

      } catch (error) {
        console.error(`Leaderboard ${activeTab} error:`, error);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeTab, getTierInfo]);

  const top3 = useMemo(() => players.slice(0, 3), [players]);
  const restPlayers = useMemo(() => players.slice(3), [players]);

  // Stats — players'dan türetilen, ayrı state yok
  const totalPlayers = players.length;
  const topScore = players[0]?.score ?? 0;
  const avgAccuracy = useMemo(() => {
    if (players.length === 0) return 0;
    return Math.round(players.reduce((sum, p) => sum + p.accuracy, 0) / players.length);
  }, [players]);

  return (
    <>
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { overflow-x: hidden; }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.4); }
          50% { box-shadow: 0 0 40px rgba(251,191,36,0.8); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes crownBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.5s ease-out; }
        .animate-crown { animation: crownBounce 2s ease-in-out infinite; }

        @media (max-width: 768px) {
          .mobile-hide { display: none !important; }
          .mobile-grid { 
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .mobile-stack { flex-direction: column !important; }
          .podium-2nd { order: 2 !important; }
          .podium-1st { order: 1 !important; }
          .podium-3rd { order: 3 !important; }
          .prize-pool-content { flex-direction: column !important; }
          .prize-pool-info { text-align: center !important; }
          .prize-pool-countdown { justify-content: center !important; }
          button { min-height: 44px !important; }
        }
        
        @media (max-width: 375px) {
          nav button {
            padding: 8px 16px !important;
            font-size: 12px !important;
            letter-spacing: 0.3px !important;
          }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)",
        backgroundSize: "400% 400%",
        color: "white",
        paddingBottom: "0",
      }}>
        
        <div style={{ padding: "clamp(20px, 5vw, 40px) clamp(16px, 4vw, 24px)" }}>
          
          {/* HEADER */}
          <header style={{
            maxWidth: "1400px",
            margin: "0 auto clamp(24px, 5vw, 40px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}>
            {/* Left: Home + Music */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <button
                onClick={() => router.push("/")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  border: "2px solid rgba(139,92,246,0.5)",
                  background: "rgba(15,23,42,0.8)",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#a78bfa";
                  e.currentTarget.style.background = "rgba(139,92,246,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)";
                  e.currentTarget.style.background = "rgba(15,23,42,0.8)";
                }}>
                <Home style={{ width: "18px", height: "18px" }} />
                <span>Home</span>
              </button>

              {/* Music Button - Küçük */}
              <button
                onClick={toggleMusic}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  border: "2px solid rgba(139,92,246,0.5)",
                  background: isMusicPlaying 
                    ? "linear-gradient(135deg, rgba(139,92,246,0.95), rgba(124,58,237,0.95))"
                    : "rgba(15,23,42,0.8)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: isMusicPlaying 
                    ? "0 0 15px rgba(139,92,246,0.5)"
                    : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#a78bfa";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                title={isMusicPlaying ? "Mute Music" : "Play Music"}>
                {isMusicPlaying ? (
                  <Volume2 className="animate-pulse" style={{
                    width: "18px",
                    height: "18px",
                    color: "white",
                  }} />
                ) : (
                  <VolumeX style={{
                    width: "18px",
                    height: "18px",
                    color: "#94a3b8",
                  }} />
                )}
              </button>
            </div>

            {/* Center: Weekly/Monthly Tabs */}
            <nav style={{
              display: "flex",
              gap: "8px",
              padding: "4px",
              borderRadius: "12px",
              background: "rgba(15,23,42,0.8)",
              border: "2px solid rgba(139,92,246,0.3)",
            }}>
              {(['weekly', 'monthly'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background: activeTab === tab 
                      ? "linear-gradient(135deg, #7c3aed, #d946ef)"
                      : "transparent",
                    color: activeTab === tab ? "white" : "#94a3b8",
                    fontSize: "13px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    letterSpacing: "0.5px",
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab) {
                      e.currentTarget.style.color = "#cbd5e1";
                      e.currentTarget.style.background = "rgba(139,92,246,0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab) {
                      e.currentTarget.style.color = "#94a3b8";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}>
                  {tab === 'weekly' ? '📅 Weekly' : '📆 Monthly'}
                </button>
              ))}
            </nav>

            {/* Right: Live Indicator */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              borderRadius: "999px",
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.5)",
            }}>
              <div className="animate-pulse" style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#22c55e",
              }} />
              <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 600 }}>
                Live
              </span>
            </div>
          </header>

          <main style={{ maxWidth: "1400px", margin: "0 auto" }}>
            
            {/* === HERO SECTION === */}
            <div className="animate-slide-up" style={{
              padding: "clamp(32px, 6vw, 48px) clamp(24px, 5vw, 40px)",
              borderRadius: "clamp(20px, 4vw, 28px)",
              border: "2px solid rgba(251,191,36,0.5)",
              background: "linear-gradient(135deg, rgba(30,27,75,0.98) 0%, rgba(15,23,42,0.98) 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(251,191,36,0.3)",
              backdropFilter: "blur(20px)",
              marginBottom: "clamp(24px, 5vw, 40px)",
              textAlign: "center",
            }}>
              
              {/* Title */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                marginBottom: "clamp(20px, 4vw, 32px)",
                flexWrap: "wrap",
              }}>
                <Trophy className="animate-float" style={{
                  width: "clamp(32px, 7vw, 48px)",
                  height: "clamp(32px, 7vw, 48px)",
                  color: "#fbbf24",
                }} />
                <h1 style={{
                  fontSize: "clamp(24px, 5vw, 48px)",
                  fontWeight: 900,
                  background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}>
                  {activeTab === 'weekly' ? 'Weekly' : 'Monthly'} Leaderboard
                </h1>
                <Trophy className="animate-float" style={{
                  width: "clamp(32px, 7vw, 48px)",
                  height: "clamp(32px, 7vw, 48px)",
                  color: "#fbbf24",
                }} />
              </div>

              {/* Premium Prize Pool with Progress Ring */}
              <div className="animate-glow" style={{
                padding: "clamp(32px, 6vw, 48px) clamp(24px, 5vw, 40px)",
                borderRadius: "clamp(20px, 4vw, 28px)",
                background: "linear-gradient(135deg, rgba(251,191,36,0.25), rgba(245,158,11,0.2))",
                border: "3px solid rgba(251,191,36,0.6)",
                marginBottom: "clamp(24px, 5vw, 32px)",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Background particles */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "radial-gradient(circle at 50% 50%, rgba(251,191,36,0.15) 0%, transparent 70%)",
                  pointerEvents: "none",
                }} />

                {/* Title */}
                <div style={{
                  fontSize: "clamp(14px, 3vw, 18px)",
                  color: "#fcd34d",
                  fontWeight: 800,
                  marginBottom: "clamp(24px, 5vw, 32px)",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  textAlign: "center",
                  position: "relative",
                  zIndex: 1,
                }}>
                  💰 {activeTab === 'weekly' ? 'Weekly' : 'Monthly'} Prize Pool
                </div>

                {/* Main Content - Circular Progress */}
                <div className="prize-pool-content" style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "clamp(32px, 6vw, 48px)",
                  position: "relative",
                  zIndex: 1,
                }}>
                  
                  {/* Circular Progress Ring */}
                  <div style={{
                    position: "relative",
                    width: "clamp(160px, 30vw, 200px)",
                    height: "clamp(160px, 30vw, 200px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {/* SVG Progress Ring */}
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 200 200"
                      style={{
                        transform: "rotate(-90deg)",
                        filter: totalRounds >= PRIZE_UNLOCK_THRESHOLD 
                          ? "drop-shadow(0 0 20px rgba(251,191,36,0.8))"
                          : "drop-shadow(0 0 10px rgba(139,92,246,0.5))",
                      }}>
                      {/* Background Circle */}
                      <circle
                        cx="100"
                        cy="100"
                        r="85"
                        fill="none"
                        stroke="rgba(15,23,42,0.6)"
                        strokeWidth="12"
                      />
                      {/* Progress Circle */}
                      <circle
                        cx="100"
                        cy="100"
                        r="85"
                        fill="none"
                        stroke={totalRounds >= PRIZE_UNLOCK_THRESHOLD 
                          ? "url(#goldGradient)" 
                          : "url(#purpleGradient)"}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 85}`}
                        strokeDashoffset={`${2 * Math.PI * 85 * (1 - Math.min(totalRounds / PRIZE_UNLOCK_THRESHOLD, 1))}`}
                        style={{
                          transition: "stroke-dashoffset 1s ease-out, stroke 0.5s ease",
                        }}
                      />
                      {/* Gradients */}
                      <defs>
                        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#fbbf24" />
                        </linearGradient>
                        <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="50%" stopColor="#d946ef" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Center Content */}
                    <div style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                    }}>
                      {/* Icon */}
                      <div style={{
                        fontSize: "clamp(32px, 6vw, 48px)",
                        marginBottom: "8px",
                        animation: totalRounds >= PRIZE_UNLOCK_THRESHOLD 
                          ? "float 2s ease-in-out infinite"
                          : totalRounds >= PRIZE_UNLOCK_THRESHOLD * 0.95
                          ? "pulse 1s ease-in-out infinite"
                          : "none",
                      }}>
                        {totalRounds >= PRIZE_UNLOCK_THRESHOLD ? "🎉" : "🔒"}
                      </div>
                      {/* Percentage */}
                      <div style={{
                        fontSize: "clamp(24px, 5vw, 36px)",
                        fontWeight: 900,
                        background: totalRounds >= PRIZE_UNLOCK_THRESHOLD
                          ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                          : "linear-gradient(90deg, #8b5cf6, #d946ef)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        lineHeight: 1,
                      }}>
                        {Math.round((totalRounds / PRIZE_UNLOCK_THRESHOLD) * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Info */}
                  <div className="prize-pool-info" style={{
                    flex: 1,
                    textAlign: "left",
                  }}>
                    {/* Prize Amount */}
                    <div style={{
                      fontSize: "clamp(48px, 10vw, 80px)",
                      fontWeight: 900,
                      background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      lineHeight: 1,
                      marginBottom: "16px",
                      filter: totalRounds >= PRIZE_UNLOCK_THRESHOLD
                        ? "drop-shadow(0 0 20px rgba(251,191,36,0.6))"
                        : "none",
                    }}>
                      £1,000
                    </div>

                    {/* Status */}
                    {totalRounds >= PRIZE_UNLOCK_THRESHOLD ? (
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 20px",
                        borderRadius: "999px",
                        background: "linear-gradient(135deg, rgba(34,197,94,0.25), rgba(21,128,61,0.2))",
                        border: "2px solid rgba(34,197,94,0.6)",
                        marginBottom: "16px",
                      }}>
                        <Sparkles style={{ width: "20px", height: "20px", color: "#22c55e" }} />
                        <span style={{
                          fontSize: "clamp(12px, 2.5vw, 16px)",
                          fontWeight: 800,
                          color: "#22c55e",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}>
                          PRIZE ACTIVE!
                        </span>
                      </div>
                    ) : (
                      <div style={{
                        marginBottom: "16px",
                      }}>
                        <div style={{
                          fontSize: "clamp(14px, 3vw, 18px)",
                          fontWeight: 700,
                          color: "#fcd34d",
                          marginBottom: "8px",
                        }}>
                          {totalRounds.toLocaleString()} / {PRIZE_UNLOCK_THRESHOLD.toLocaleString()} Purchases
                        </div>
                        <div style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 16px",
                          borderRadius: "999px",
                          background: "rgba(139,92,246,0.2)",
                          border: "1px solid rgba(139,92,246,0.5)",
                        }}>
                          <Target style={{ width: "16px", height: "16px", color: "#a78bfa" }} />
                          <span style={{
                            fontSize: "clamp(11px, 2.2vw, 14px)",
                            fontWeight: 700,
                            color: "#a78bfa",
                          }}>
                            {(PRIZE_UNLOCK_THRESHOLD - totalRounds).toLocaleString()} more to unlock!
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Countdown */}
                    <div className="prize-pool-countdown" style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: "8px",
                      fontSize: "clamp(11px, 2.2vw, 14px)",
                      color: "#cbd5e1",
                    }}>
                      <Clock style={{ width: "16px", height: "16px" }} />
                      <span>
                        Resets in {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="mobile-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "clamp(12px, 3vw, 16px)",
              }}>
                
                {/* Total Players */}
                <div style={{
                  padding: "clamp(16px, 3vw, 20px)",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(124,58,237,0.15))",
                  border: "2px solid rgba(139,92,246,0.5)",
                }}>
                  <Users style={{
                    width: "clamp(20px, 4vw, 28px)",
                    height: "clamp(20px, 4vw, 28px)",
                    color: "#a78bfa",
                    margin: "0 auto 8px",
                  }} />
                  <div style={{
                    fontSize: "clamp(20px, 4vw, 32px)",
                    fontWeight: 900,
                    color: "#a78bfa",
                    lineHeight: 1,
                    marginBottom: "4px",
                  }}>
                    {totalPlayers.toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: "clamp(10px, 2vw, 12px)",
                    color: "#c4b5fd",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}>
                    Players
                  </div>
                </div>

                {/* Top Score */}
                <div style={{
                  padding: "clamp(16px, 3vw, 20px)",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(21,128,61,0.15))",
                  border: "2px solid rgba(34,197,94,0.5)",
                }}>
                  <Star style={{
                    width: "clamp(20px, 4vw, 28px)",
                    height: "clamp(20px, 4vw, 28px)",
                    color: "#22c55e",
                    margin: "0 auto 8px",
                  }} />
                  <div style={{
                    fontSize: "clamp(20px, 4vw, 32px)",
                    fontWeight: 900,
                    color: "#22c55e",
                    lineHeight: 1,
                    marginBottom: "4px",
                  }}>
                    {topScore.toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: "clamp(10px, 2vw, 12px)",
                    color: "#86efac",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}>
                    Top Score
                  </div>
                </div>

                {/* Avg Accuracy */}
                <div style={{
                  padding: "clamp(16px, 3vw, 20px)",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, rgba(56,189,248,0.2), rgba(14,165,233,0.15))",
                  border: "2px solid rgba(56,189,248,0.5)",
                }}>
                  <Target style={{
                    width: "clamp(20px, 4vw, 28px)",
                    height: "clamp(20px, 4vw, 28px)",
                    color: "#38bdf8",
                    margin: "0 auto 8px",
                  }} />
                  <div style={{
                    fontSize: "clamp(20px, 4vw, 32px)",
                    fontWeight: 900,
                    color: "#38bdf8",
                    lineHeight: 1,
                    marginBottom: "4px",
                  }}>
                    {avgAccuracy}%
                  </div>
                  <div style={{
                    fontSize: "clamp(10px, 2vw, 12px)",
                    color: "#7dd3fc",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}>
                    Avg Accuracy
                  </div>
                </div>
              </div>
            </div>

            {/* === LOADING === */}
            {loading ? (
              <div style={{
                padding: "clamp(60px, 12vw, 100px)",
                textAlign: "center",
              }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  border: "4px solid rgba(139,92,246,0.3)",
                  borderTopColor: "#a78bfa",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 20px",
                }} />
                <p style={{ color: "#94a3b8", fontSize: "16px" }}>Loading leaderboard...</p>
              </div>
            ) : players.length === 0 ? (
              <div style={{
                padding: "clamp(60px, 12vw, 100px)",
                textAlign: "center",
                borderRadius: "20px",
                border: "2px solid rgba(139,92,246,0.3)",
                background: "rgba(15,23,42,0.6)",
              }}>
                <Trophy style={{
                  width: "48px",
                  height: "48px",
                  color: "#64748b",
                  margin: "0 auto 16px",
                }} />
                <p style={{ color: "#94a3b8", fontSize: "16px" }}>No players yet. Be the first!</p>
              </div>
            ) : (
              <>
                {/* === TOP 3 PODIUM === */}
                <div className="mobile-stack" style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "clamp(16px, 3vw, 24px)",
                  marginBottom: "clamp(32px, 6vw, 48px)",
                  alignItems: "end",
                }}>
                  
                  {/* 2nd Place */}
                  {top3[1] && <PodiumCard player={top3[1]} place={2} />}

                  {/* 1st Place */}
                  {top3[0] && <PodiumCard player={top3[0]} place={1} />}

                  {/* 3rd Place */}
                  {top3[2] && <PodiumCard player={top3[2]} place={3} />}
                </div>

                {/* === REST OF LEADERBOARD === */}
                {restPlayers.length > 0 && (
                  <div className="animate-slide-up" style={{
                    padding: "clamp(24px, 5vw, 32px)",
                    borderRadius: "clamp(16px, 3vw, 24px)",
                    border: "2px solid rgba(139,92,246,0.5)",
                    background: "linear-gradient(135deg, rgba(30,27,75,0.98) 0%, rgba(15,23,42,0.98) 100%)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                    backdropFilter: "blur(20px)",
                    animationDelay: "0.3s",
                  }}>
                    
                    <h2 style={{
                      fontSize: "clamp(18px, 4vw, 24px)",
                      fontWeight: 900,
                      marginBottom: "clamp(20px, 4vw, 24px)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}>
                      <Sparkles style={{ width: "24px", height: "24px", color: "#a78bfa" }} />
                      Ranked Players
                    </h2>

                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}>
                      {restPlayers.map((player, idx) => (
                        <div
                          key={player.id}
                          className="animate-slide-up"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "clamp(12px, 2.5vw, 16px)",
                            padding: "clamp(12px, 2.5vw, 16px)",
                            borderRadius: "14px",
                            background: "rgba(139,92,246,0.05)",
                            border: "1px solid rgba(139,92,246,0.2)",
                            transition: "all 0.3s",
                            cursor: "pointer",
                            animationDelay: `${Math.min(idx * 0.03, 0.5)}s`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(139,92,246,0.15)";
                            e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)";
                            e.currentTarget.style.transform = "translateX(8px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(139,92,246,0.05)";
                            e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)";
                            e.currentTarget.style.transform = "translateX(0)";
                          }}>
                          
                          {/* Rank Badge */}
                          <div style={{
                            width: "clamp(36px, 7vw, 48px)",
                            height: "clamp(36px, 7vw, 48px)",
                            borderRadius: "10px",
                            background: player.rank <= 10 
                              ? "linear-gradient(135deg, #8b5cf6, #7c3aed)"
                              : "rgba(139,92,246,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "clamp(12px, 2.5vw, 16px)",
                            fontWeight: 900,
                            color: "white",
                            flexShrink: 0,
                            boxShadow: player.rank <= 10 ? "0 4px 12px rgba(139,92,246,0.5)" : "none",
                          }}>
                            #{player.rank}
                          </div>

                          {/* Player Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "4px",
                            }}>
                              <span style={{
                                fontSize: "clamp(14px, 3vw, 16px)",
                                fontWeight: 800,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}>
                                {player.name}
                              </span>
                              <span style={{ fontSize: "clamp(14px, 3vw, 16px)" }}>
                                {player.tierIcon}
                              </span>
                            </div>
                            <div style={{
                              fontSize: "clamp(10px, 2vw, 12px)",
                              color: "#64748b",
                              display: "flex",
                              gap: "10px",
                              flexWrap: "wrap",
                            }}>
                              <span style={{ color: "#22c55e" }}>
                                {player.accuracy}% acc
                              </span>
                              <span className="mobile-hide">•</span>
                              <span className="mobile-hide">
                                {player.rounds} rounds
                              </span>
                            </div>
                          </div>

                          {/* Score */}
                          <div style={{
                            padding: "clamp(8px, 2vw, 12px) clamp(12px, 2.5vw, 20px)",
                            borderRadius: "10px",
                            background: "rgba(139,92,246,0.15)",
                            border: "1px solid rgba(139,92,246,0.3)",
                            textAlign: "right",
                          }}>
                            <div style={{
                              fontSize: "clamp(16px, 3.5vw, 22px)",
                              fontWeight: 900,
                              background: "linear-gradient(90deg, #a78bfa, #f0abfc)",
                              backgroundClip: "text",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}>
                              {(player.score ?? 0).toLocaleString()}
                            </div>
                            <div style={{
                              fontSize: "clamp(9px, 1.8vw, 11px)",
                              color: "#64748b",
                            }}>
                              points
                            </div>
                          </div>

                          <ChevronRight 
                            className="mobile-hide"
                            style={{
                              width: "20px",
                              height: "20px",
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

          </main>
        </div>

        <Footer />
      </div>
    </>
  );
}

