import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VibraXX Leaderboard | Global Skill Arena',
  description: 'Compete in VibraXX live skill-based quiz leaderboards. Track your ranking, accuracy, and compete against top players in real-time trivia challenges.',
  keywords: ['leaderboard', 'trivia competition', 'quiz leaderboard', 'VibraXX rankings', 'live quiz', 'skill arena', 'global rankings'],
  authors: [{ name: 'VibraXX' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'VibraXX Leaderboard | Global Skill Arena',
    description: 'Track your ranking on the VibraXX leaderboard. Compete in live skill-based quiz challenges.',
    url: 'https://vibraxx.com/leaderboard',
    siteName: 'VibraXX',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: 'https://vibraxx.com/images/og-leaderboard.jpg',
        width: 1200,
        height: 630,
        alt: 'VibraXX Leaderboard - Global Skill Arena',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VibraXX Leaderboard | Global Skill Arena',
    description: 'Track rankings and compete in live skill-based quiz challenges on VibraXX.',
    images: ['https://vibraxx.com/images/twitter-leaderboard.jpg'],
    creator: '@VibraXX',
  },
  alternates: {
    canonical: 'https://vibraxx.com/leaderboard',
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Crown, Trophy, Star, Target, Clock, Users,
  Sparkles, Volume2, VolumeX, ChevronRight, Home
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Footer from "@/components/Footer";

// ═══════════════════════════════════════════════════════════
// TYPES (DB Contract)
// ═══════════════════════════════════════════════════════════
interface Player {
  user_id: string;
  rank: number;
  full_name: string;
  total_score: number;
  correct_answers: number;
  wrong_answers: number;
  rounds_played: number;
  accuracy: number;
  tier: string;
  tier_icon: string;
  tier_color: string;
}

interface LeaderboardData {
  tab: string;
  players: Player[];
  stats: {
    total_players: number;
    top_score: number;
    avg_accuracy: number;
  };
  prize: {
    type: 'money' | 'credits';
    amount: number;
    label: string;
    sublabel: string;
    unlocked: boolean | null;
    progress: number;
    threshold: number | null;
  };
  countdown: {
    days: number;
    hours: number;
    minutes: number;
  };
}

// ─── PODIUM CONFIG ───
const PODIUM_CFG = {
  1: {
    order: 2, animDelay: "0.2s", glowClass: "animate-glow", hoverY: "-12px",
    card: { pad: "clamp(24px, 5vw, 36px)", radius: "clamp(20px, 4vw, 28px)", border: "4px solid rgba(251,191,36,0.8)", bg: "linear-gradient(135deg, rgba(251,191,36,0.25), rgba(245,158,11,0.2))", blur: "25px", shadow: "0 0 60px rgba(251,191,36,0.6)" },
    medal: { size: "clamp(90px, 18vw, 120px)", pad: "5px", ring: "linear-gradient(135deg, #fbbf24, #f59e0b)", glow: "0 0 50px rgba(251,191,36,0.8)", emoji: "🥇", emojiSize: "clamp(40px, 8vw, 60px)", margin: "0 auto clamp(20px, 4vw, 24px)" },
    badge: { size: "clamp(36px, 7vw, 48px)", bottom: "-10px", border: "3px solid #0f172a", fontSize: "clamp(16px, 3.5vw, 24px)" },
    name: { size: "clamp(18px, 4vw, 24px)", weight: 900, mb: "6px" },
    tier: { gap: "6px", pad: "6px 14px", fontSize: "clamp(11px, 2.2vw, 14px)", iconSize: "clamp(14px, 3vw, 18px)", mb: "16px" },
    score: { size: "clamp(32px, 7vw, 48px)", gradient: "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)", mb: "12px" },
    showCrown: true, statsGrid: true,
  },
  2: {
    order: 1, animDelay: "0.1s", glowClass: "", hoverY: "-8px",
    card: { pad: "clamp(20px, 4vw, 28px)", radius: "clamp(16px, 3vw, 24px)", border: "3px solid rgba(192,192,192,0.6)", bg: "linear-gradient(135deg, rgba(192,192,192,0.2), rgba(156,163,175,0.15))", blur: "20px", shadow: "0 0 40px rgba(192,192,192,0.4)" },
    medal: { size: "clamp(70px, 14vw, 100px)", pad: "4px", ring: "linear-gradient(135deg, #d1d5db, #9ca3af)", glow: "0 0 30px rgba(192,192,192,0.6)", emoji: "🥈", emojiSize: "clamp(32px, 6vw, 48px)", margin: "0 auto clamp(16px, 3vw, 20px)" },
    badge: { size: "clamp(32px, 6vw, 40px)", bottom: "-8px", border: "2px solid #0f172a", fontSize: "clamp(14px, 3vw, 20px)" },
    name: { size: "clamp(14px, 3vw, 18px)", weight: 800, mb: "4px" },
    tier: { gap: "4px", pad: "4px 10px", fontSize: "clamp(10px, 2vw, 12px)", iconSize: null, mb: "12px" },
    score: { size: "clamp(24px, 5vw, 36px)", gradient: "linear-gradient(90deg, #d1d5db, #9ca3af)", mb: "8px" },
    showCrown: false, statsGrid: false,
  },
  3: {
    order: 3, animDelay: "0.15s", glowClass: "", hoverY: "-8px",
    card: { pad: "clamp(20px, 4vw, 28px)", radius: "clamp(16px, 3vw, 24px)", border: "3px solid rgba(217,119,6,0.6)", bg: "linear-gradient(135deg, rgba(217,119,6,0.2), rgba(194,65,12,0.15))", blur: "20px", shadow: "0 0 40px rgba(217,119,6,0.4)" },
    medal: { size: "clamp(70px, 14vw, 100px)", pad: "4px", ring: "linear-gradient(135deg, #d97706, #c2410c)", glow: "0 0 30px rgba(217,119,6,0.6)", emoji: "🥉", emojiSize: "clamp(32px, 6vw, 48px)", margin: "0 auto clamp(16px, 3vw, 20px)" },
    badge: { size: "clamp(32px, 6vw, 40px)", bottom: "-8px", border: "2px solid #0f172a", fontSize: "clamp(14px, 3vw, 20px)" },
    name: { size: "clamp(14px, 3vw, 18px)", weight: 800, mb: "4px" },
    tier: { gap: "4px", pad: "4px 10px", fontSize: "clamp(10px, 2vw, 12px)", iconSize: null, mb: "12px" },
    score: { size: "clamp(24px, 5vw, 36px)", gradient: "linear-gradient(90deg, #d97706, #c2410c)", mb: "8px" },
    showCrown: false, statsGrid: false,
  },
} as const;

function PodiumCard({ player, place }: { player: Player; place: 1 | 2 | 3 }) {
  const c = PODIUM_CFG[place];
  return (
    <div className={`animate-slide-up podium-${place === 1 ? "1st" : place === 2 ? "2nd" : "3rd"}`} style={{ order: c.order, animationDelay: c.animDelay }}>
      <div className={c.glowClass || undefined} style={{ padding: c.card.pad, borderRadius: c.card.radius, border: c.card.border, background: c.card.bg, backdropFilter: `blur(${c.card.blur})`, textAlign: "center" as const, boxShadow: c.card.shadow, transition: "transform 0.3s", cursor: "default" }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = `translateY(${c.hoverY})`)}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
        {c.showCrown && <Crown className="animate-crown" style={{ width: "clamp(32px, 6vw, 48px)", height: "clamp(32px, 6vw, 48px)", color: "#fbbf24", margin: "0 auto clamp(12px, 2.5vw, 16px)" }} />}
        <div style={{ position: "relative", width: c.medal.size, height: c.medal.size, margin: c.medal.margin, borderRadius: "50%", padding: c.medal.pad, background: c.medal.ring, boxShadow: c.medal.glow }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: c.medal.emojiSize }}>{c.medal.emoji}</div>
          <div style={{ position: "absolute", bottom: c.badge.bottom, left: "50%", transform: "translateX(-50%)", width: c.badge.size, height: c.badge.size, borderRadius: "50%", background: c.medal.ring, display: "flex", alignItems: "center", justifyContent: "center", border: c.badge.border, color: "#0f172a", fontWeight: 900, fontSize: c.badge.fontSize }}>{place}</div>
        </div>
        <h2 style={{ fontSize: c.name.size, fontWeight: c.name.weight, marginBottom: c.name.mb, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{player.full_name}</h2>
        <div style={{ display: "inline-flex", alignItems: "center", gap: c.tier.gap, padding: c.tier.pad, borderRadius: "999px", background: `${player.tier_color}${place === 1 ? '25' : '20'}`, border: `${place === 1 ? '2px' : '1px'} solid ${player.tier_color}${place === 1 ? '' : '60'}`, marginBottom: c.tier.mb, fontSize: c.tier.fontSize }}>
          <span style={c.tier.iconSize ? { fontSize: c.tier.iconSize } : {}}>{player.tier_icon}</span>
          <span style={{ color: player.tier_color, fontWeight: place === 1 ? 800 : 700 }}>{player.tier}</span>
        </div>
        <div style={{ fontSize: c.score.size, fontWeight: 900, background: c.score.gradient, backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: c.score.mb }}>{(player.total_score ?? 0).toLocaleString()}</div>
        {c.statsGrid ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "clamp(11px, 2.2vw, 14px)" }}>
            <div><div style={{ color: "#22c55e", fontWeight: 700 }}>{player.accuracy}%</div><div style={{ color: "#94a3b8", fontSize: "clamp(9px, 1.8vw, 11px)" }}>accuracy</div></div>
            <div><div style={{ color: "#38bdf8", fontWeight: 700 }}>{player.rounds_played}</div><div style={{ color: "#94a3b8", fontSize: "clamp(9px, 1.8vw, 11px)" }}>rounds</div></div>
          </div>
        ) : (
          <div style={{ fontSize: "clamp(10px, 2vw, 12px)", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "4px" }}>
            <span>{player.accuracy}% accuracy</span>
            <span>{player.rounds_played} rounds</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function LeaderboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helper - sıfır yerine tire
  const displayNum = (v?: number | null) =>
    typeof v === "number" && v > 0 ? v.toLocaleString() : "—";

  const top3 = data?.players?.slice(0, 3) || [];
  const restPlayers = data?.players?.slice(3) || [];

  // SEO - Dynamic title from DB data ONLY
  useEffect(() => {
    if (!data?.prize?.label) return;
    
    // DB decides the title via prize.label
    document.title = `${data.prize.label} - VibraXX Leaderboard`;
    
    // Update meta description from DB data
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && data.prize.sublabel) {
      metaDesc.setAttribute('content', `${data.prize.label}. ${data.prize.sublabel} Compete on VibraXX leaderboard.`);
    }
  }, [data?.prize]);

  // Music setup
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

  // Music interaction handler
  useEffect(() => {
    const handleInteraction = () => {
      if (audioRef.current && isMusicPlaying && audioRef.current.paused) {
        audioRef.current.play().catch(err => console.log("Audio play failed:", err));
      }
    };

    ["click", "touchstart", "keydown"].forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true, passive: true });
    });

    return () => {
      ["click", "touchstart", "keydown"].forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [isMusicPlaying]);

  // Music play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isMusicPlaying) {
      audioRef.current.play().catch(err => console.log("Play error:", err));
      localStorage.setItem("vibraxx_music_enabled", "true");
    } else {
      audioRef.current.pause();
      localStorage.setItem("vibraxx_music_enabled", "false");
    }
  }, [isMusicPlaying]);

  const toggleMusic = useCallback(() => {
    setIsMusicPlaying(prev => !prev);
  }, []);

  // Fetch data (DB-first)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: rpcData, error } = await supabase.rpc("get_leaderboard_data", { p_tab: activeTab });
        
        if (error) {
          console.error(`Leaderboard error:`, error);
          setData(null);
          return;
        }
        
        setData(rpcData || null);
      } catch (error) {
        console.error(`Leaderboard exception:`, error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab]);

  return (
    <>
      {/* JSON-LD Structured Data - DB data ONLY */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SportsEvent',
            name: 'VibraXX Leaderboard',
            description: data?.prize?.label || 'VibraXX skill-based leaderboard competition',
            url: `https://vibraxx.com/leaderboard?tab=${activeTab}`,
            eventStatus: 'https://schema.org/EventScheduled',
            eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
            organizer: {
              '@type': 'Organization',
              name: 'VibraXX',
              url: 'https://vibraxx.com',
              logo: 'https://vibraxx.com/images/logo.png',
            },
            offers: {
              '@type': 'Offer',
              price: data?.prize?.amount || '0',
              priceCurrency: data?.prize?.type === 'money' ? 'GBP' : undefined,
              availability: 'https://schema.org/InStock',
              description: data?.prize?.label || 'Leaderboard reward',
            },
            competitor: data?.players?.map((player, idx) => ({
              '@type': 'Person',
              name: player.full_name,
              identifier: `rank-${player.rank}`,
              award: idx === 0 && data?.prize?.label ? data.prize.label : undefined,
            })) || [],
          }),
        }}
      />

      {/* Breadcrumb Structured Data - DB data ONLY */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://vibraxx.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Leaderboard',
                item: 'https://vibraxx.com/leaderboard',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: data?.prize?.label || 'Rankings',
                item: `https://vibraxx.com/leaderboard?tab=${activeTab}`,
              },
            ],
          }),
        }}
      />

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.4); } 50% { box-shadow: 0 0 40px rgba(251,191,36,0.8); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes crownBounce { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(5deg); } }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.5s ease-out; }
        .animate-crown { animation: crownBounce 2s ease-in-out infinite; }
        @media (max-width: 768px) {
          .mobile-hide { display: none !important; }
          .mobile-grid { grid-template-columns: 1fr !important; }
          .mobile-stack { display: flex !important; flex-direction: column !important; }
          .podium-2nd { order: 2 !important; }
          .podium-1st { order: 1 !important; }
          .podium-3rd { order: 3 !important; }
          .prize-pool-content { flex-direction: column !important; }
          .prize-pool-info { text-align: center !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)", color: "white", paddingBottom: "0" }}>
        <div style={{ padding: "clamp(20px, 5vw, 40px) clamp(16px, 4vw, 24px)" }}>
          
          {/* HEADER */}
          <header role="banner" style={{ maxWidth: "1400px", margin: "0 auto clamp(24px, 5vw, 40px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            
            {/* Logo */}
            <div onClick={() => router.push("/")} role="button" tabIndex={0} aria-label="Go to homepage" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "clamp(8px, 2vw, 12px)", padding: "8px", borderRadius: "12px", transition: "all 0.3s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(139,92,246,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push('/'); }}>
              <Image 
                src="/images/logo.png" 
                alt="VibraXX Logo - Live Trivia Competition Platform" 
                width={48} 
                height={48}
                style={{ width: "clamp(36px, 8vw, 48px)", height: "clamp(36px, 8vw, 48px)", borderRadius: "12px" }}
                priority
              />
              <span style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 900, background: "linear-gradient(90deg, #a78bfa, #f0abfc)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VibraXX</span>
            </div>

            {/* Nav Tabs */}
            <nav role="navigation" aria-label="Leaderboard time period selection" style={{ display: "flex", gap: "8px", padding: "4px", borderRadius: "12px", background: "rgba(15,23,42,0.8)", border: "2px solid rgba(139,92,246,0.3)" }}>
              {(['weekly', 'monthly'] as const).map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-label={`View ${tab} leaderboard`}
                  style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: activeTab === tab ? "linear-gradient(135deg, #7c3aed, #d946ef)" : "transparent", color: activeTab === tab ? "white" : "#94a3b8", fontSize: "13px", fontWeight: 800, textTransform: "uppercase", cursor: "pointer", transition: "all 0.3s", letterSpacing: "0.5px" }}
                  onMouseEnter={(e) => { if (activeTab !== tab) { e.currentTarget.style.color = "#cbd5e1"; e.currentTarget.style.background = "rgba(139,92,246,0.15)"; } }}
                  onMouseLeave={(e) => { if (activeTab !== tab) { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; } }}>
                  {tab === 'weekly' ? '📅 Weekly' : '📆 Monthly'}
                </button>
              ))}
            </nav>

            {/* Live + Music */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div role="status" aria-live="polite" aria-label="Leaderboard is live" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "999px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.5)" }}>
                <div className="animate-pulse" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 600 }}>Live</span>
              </div>
              <button 
                onClick={toggleMusic} 
                aria-label={isMusicPlaying ? "Mute background music" : "Play background music"}
                aria-pressed={isMusicPlaying}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "10px", border: "2px solid rgba(139,92,246,0.5)", background: isMusicPlaying ? "linear-gradient(135deg, rgba(139,92,246,0.95), rgba(124,58,237,0.95))" : "rgba(15,23,42,0.8)", cursor: "pointer", transition: "all 0.3s ease", boxShadow: isMusicPlaying ? "0 0 15px rgba(139,92,246,0.5)" : "none" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#a78bfa"; e.currentTarget.style.transform = "scale(1.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"; e.currentTarget.style.transform = "scale(1)"; }}
                title={isMusicPlaying ? "Mute Music" : "Play Music"}>
                {isMusicPlaying ? <Volume2 className="animate-pulse" style={{ width: "18px", height: "18px", color: "white" }} /> : <VolumeX style={{ width: "18px", height: "18px", color: "#94a3b8" }} />}
              </button>
            </div>
          </header>

          <main role="main" style={{ maxWidth: "1400px", margin: "0 auto" }}>
            
            {/* ═══ HERO SECTION ═══ */}
            <div className="animate-slide-up" style={{ padding: "clamp(32px, 6vw, 48px) clamp(24px, 5vw, 40px)", borderRadius: "clamp(20px, 4vw, 28px)", border: "2px solid rgba(251,191,36,0.5)", background: "linear-gradient(135deg, rgba(30,27,75,0.98) 0%, rgba(15,23,42,0.98) 100%)", boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(251,191,36,0.3)", backdropFilter: "blur(20px)", marginBottom: "clamp(24px, 5vw, 40px)", textAlign: "center" as const }}>
              
              {/* Title */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "clamp(20px, 4vw, 32px)", flexWrap: "wrap" }}>
                <Trophy className="animate-float" style={{ width: "clamp(32px, 7vw, 48px)", height: "clamp(32px, 7vw, 48px)", color: "#fbbf24" }} />
                <h1 style={{ fontSize: "clamp(24px, 5vw, 48px)", fontWeight: 900, background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textTransform: "uppercase", letterSpacing: "2px" }}>
                  {data?.prize?.label || 'Leaderboard'}
                </h1>
                <Trophy className="animate-float" style={{ width: "clamp(32px, 7vw, 48px)", height: "clamp(32px, 7vw, 48px)", color: "#fbbf24" }} />
              </div>

              {/* ═══ PRIZE BLOCK ═══ */}
              {data?.prize?.type === 'money' ? (
                /* Monthly: £1000 + unlock */
                <div className="animate-glow" style={{ padding: "clamp(32px, 6vw, 48px) clamp(24px, 5vw, 40px)", borderRadius: "clamp(20px, 4vw, 28px)", background: "linear-gradient(135deg, rgba(251,191,36,0.25), rgba(245,158,11,0.2))", border: "3px solid rgba(251,191,36,0.6)", marginBottom: "clamp(24px, 5vw, 32px)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(circle at 50% 50%, rgba(251,191,36,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
                  
                  <div style={{ fontSize: "clamp(14px, 3vw, 18px)", color: "#fcd34d", fontWeight: 800, marginBottom: "clamp(24px, 5vw, 32px)", textTransform: "uppercase", letterSpacing: "1.5px", textAlign: "center" as const, position: "relative", zIndex: 1 }}>
                    💰 {data?.prize?.label || 'Monthly £1,000 Skill Reward'}
                  </div>
                  
                  <div className="prize-pool-content" style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "clamp(32px, 6vw, 48px)", position: "relative", zIndex: 1 }}>
                    
                    {/* Progress Ring */}
                    <div style={{ position: "relative", width: "clamp(160px, 30vw, 200px)", height: "clamp(160px, 30vw, 200px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)", filter: data?.prize?.unlocked ? "drop-shadow(0 0 20px rgba(251,191,36,0.8))" : "drop-shadow(0 0 10px rgba(139,92,246,0.5))" }}>
                        <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(15,23,42,0.6)" strokeWidth="12" />
                        <circle cx="100" cy="100" r="85" fill="none" stroke={data?.prize?.unlocked ? "url(#goldGradient)" : "url(#purpleGradient)"} strokeWidth="12" strokeLinecap="round" 
                          strokeDasharray={`${2 * Math.PI * 85}`} 
                          strokeDashoffset={`${2 * Math.PI * 85 * (1 - Math.min((data?.prize?.progress || 0) / (data?.prize?.threshold || 1), 1))}`} 
                          style={{ transition: "stroke-dashoffset 1s ease-out, stroke 0.5s ease" }} />
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
                      
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" as const }}>
                        <div style={{ fontSize: "clamp(32px, 6vw, 48px)", marginBottom: "8px", animation: data?.prize?.unlocked ? "float 2s ease-in-out infinite" : "none" }}>
                          {data?.prize?.unlocked ? "🎉" : "🔒"}
                        </div>
                        <div style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 900, background: data?.prize?.unlocked ? "linear-gradient(90deg, #fbbf24, #f59e0b)" : "linear-gradient(90deg, #8b5cf6, #d946ef)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
                          {(() => {
                            const pct = data?.prize?.threshold ? Math.round(((data?.prize?.progress || 0) / data.prize.threshold) * 100) : 0;
                            return pct > 0 ? `${pct}%` : "—";
                          })()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="prize-pool-info" style={{ flex: 1, textAlign: "left" as const }}>
                      <div style={{ fontSize: "clamp(48px, 10vw, 80px)", fontWeight: 900, background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: "16px", filter: data?.prize?.unlocked ? "drop-shadow(0 0 20px rgba(251,191,36,0.6))" : "none" }}>
                        £{displayNum(data?.prize?.amount)}
                      </div>
                      
                      {data?.prize?.unlocked ? (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(34,197,94,0.25), rgba(21,128,61,0.2))", border: "2px solid rgba(34,197,94,0.6)", marginBottom: "16px" }}>
                          <Sparkles style={{ width: "20px", height: "20px", color: "#22c55e" }} />
                          <span style={{ fontSize: "clamp(12px, 2.5vw, 16px)", fontWeight: 800, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            PRIZE ACTIVE!
                          </span>
                        </div>
                      ) : (
                        <div style={{ marginBottom: "16px" }}>
                          <div style={{ fontSize: "clamp(14px, 3vw, 18px)", fontWeight: 700, color: "#fcd34d", marginBottom: "8px" }}>
                            {displayNum(data?.prize?.progress)} / {displayNum(data?.prize?.threshold)} Paid Entries
                          </div>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "999px", background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.5)" }}>
                            <Target style={{ width: "16px", height: "16px", color: "#a78bfa" }} />
                            <span style={{ fontSize: "clamp(11px, 2.2vw, 14px)", fontWeight: 700, color: "#a78bfa" }}>
                              {displayNum((data?.prize?.threshold || 0) - (data?.prize?.progress || 0))} more to unlock!
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div style={{ fontSize: "clamp(10px, 2vw, 12px)", color: "#94a3b8", fontStyle: "italic", marginBottom: "12px" }}>
                        {data?.prize?.sublabel || 'Funded by VibraXX, not pooled'}
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "clamp(11px, 2.2vw, 14px)", color: "#cbd5e1" }}>
                        <Clock style={{ width: "16px", height: "16px" }} />
                        <span>Resets in {data?.countdown?.days || 0}d {data?.countdown?.hours || 0}h {data?.countdown?.minutes || 0}m</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Weekly: 15 Credits */
                <div style={{ padding: "clamp(32px, 6vw, 48px) clamp(24px, 5vw, 40px)", borderRadius: "clamp(20px, 4vw, 28px)", background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(124,58,237,0.2))", border: "3px solid rgba(139,92,246,0.6)", marginBottom: "clamp(24px, 5vw, 32px)", position: "relative", overflow: "hidden", textAlign: "center" as const }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
                  
                  <div style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 900, background: "linear-gradient(90deg, #a78bfa, #d946ef, #a78bfa)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "clamp(16px, 3vw, 24px)", position: "relative", zIndex: 1 }}>
                    🏆 {data?.prize?.label || 'Weekly Champion Reward'}
                  </div>
                  
                  <div style={{ fontSize: "clamp(64px, 12vw, 96px)", marginBottom: "clamp(16px, 3vw, 24px)", position: "relative", zIndex: 1, animation: "float 3s ease-in-out infinite" }}>
                    🎁
                  </div>
                  
                  <div style={{ fontSize: "clamp(48px, 10vw, 72px)", fontWeight: 900, background: "linear-gradient(90deg, #a78bfa, #f0abfc)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1, marginBottom: "12px", position: "relative", zIndex: 1 }}>
                    {displayNum(data?.prize?.amount)} Credits
                  </div>
                  
                  <div style={{ fontSize: "clamp(14px, 3vw, 18px)", color: "#c4b5fd", fontWeight: 600, marginBottom: "clamp(16px, 3vw, 24px)", position: "relative", zIndex: 1 }}>
                    {data?.prize?.sublabel || 'Free Live Arena Rounds'}
                  </div>
                  
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "999px", background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.5)", fontSize: "clamp(11px, 2.2vw, 14px)", color: "#cbd5e1", position: "relative", zIndex: 1 }}>
                    <Clock style={{ width: "16px", height: "16px" }} />
                    <span>Resets in {data?.countdown?.days || 0}d {data?.countdown?.hours || 0}h {data?.countdown?.minutes || 0}m</span>
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              <div className="mobile-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "clamp(12px, 3vw, 16px)" }}>
                <div style={{ padding: "clamp(16px, 3vw, 20px)", borderRadius: "14px", background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(124,58,237,0.15))", border: "2px solid rgba(139,92,246,0.5)", transition: "all 0.3s", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(139,92,246,0.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <Users style={{ width: "clamp(20px, 4vw, 28px)", height: "clamp(20px, 4vw, 28px)", color: "#a78bfa", margin: "0 auto 8px" }} />
                  <div style={{ fontSize: "clamp(20px, 4vw, 32px)", fontWeight: 900, color: "#a78bfa", lineHeight: 1, marginBottom: "4px" }}>
                    {displayNum(data?.stats?.total_players)}
                  </div>
                  <div style={{ fontSize: "clamp(10px, 2vw, 12px)", color: "#c4b5fd", fontWeight: 600, textTransform: "uppercase" }}>Players</div>
                </div>
                
                <div style={{ padding: "clamp(16px, 3vw, 20px)", borderRadius: "14px", background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(21,128,61,0.15))", border: "2px solid rgba(34,197,94,0.5)", transition: "all 0.3s", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(34,197,94,0.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <Star style={{ width: "clamp(20px, 4vw, 28px)", height: "clamp(20px, 4vw, 28px)", color: "#22c55e", margin: "0 auto 8px" }} />
                  <div style={{ fontSize: "clamp(20px, 4vw, 32px)", fontWeight: 900, color: "#22c55e", lineHeight: 1, marginBottom: "4px" }}>
                    {displayNum(data?.stats?.top_score)}
                  </div>
                  <div style={{ fontSize: "clamp(10px, 2vw, 12px)", color: "#86efac", fontWeight: 600, textTransform: "uppercase" }}>Top Score</div>
                </div>
                
                <div style={{ padding: "clamp(16px, 3vw, 20px)", borderRadius: "14px", background: "linear-gradient(135deg, rgba(56,189,248,0.2), rgba(14,165,233,0.15))", border: "2px solid rgba(56,189,248,0.5)", transition: "all 0.3s", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(56,189,248,0.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <Target style={{ width: "clamp(20px, 4vw, 28px)", height: "clamp(20px, 4vw, 28px)", color: "#38bdf8", margin: "0 auto 8px" }} />
                  <div style={{ fontSize: "clamp(20px, 4vw, 32px)", fontWeight: 900, color: "#38bdf8", lineHeight: 1, marginBottom: "4px" }}>
                    {displayNum(data?.stats?.avg_accuracy)}%
                  </div>
                  <div style={{ fontSize: "clamp(10px, 2vw, 12px)", color: "#7dd3fc", fontWeight: 600, textTransform: "uppercase" }}>Avg Accuracy</div>
                </div>
              </div>
            </div>

            {/* ═══ LOADING / EMPTY / LEADERBOARD ═══ */}
            {loading ? (
              <div role="status" aria-live="polite" aria-label="Loading leaderboard data" style={{ padding: "clamp(60px, 12vw, 100px)", textAlign: "center" as const }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", border: "4px solid rgba(139,92,246,0.3)", borderTopColor: "#a78bfa", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
                <p style={{ color: "#94a3b8", fontSize: "16px" }}>Loading leaderboard...</p>
              </div>
            ) : !data?.players || data.players.length === 0 ? (
              <div role="status" aria-label="No players found" style={{ padding: "clamp(60px, 12vw, 100px)", textAlign: "center" as const, borderRadius: "20px", border: "2px solid rgba(139,92,246,0.3)", background: "rgba(15,23,42,0.6)" }}>
                <Trophy style={{ width: "48px", height: "48px", color: "#64748b", margin: "0 auto 16px" }} />
                <p style={{ color: "#94a3b8", fontSize: "16px" }}>No players yet. Be the first!</p>
              </div>
            ) : (
              <>
                {/* TOP 3 PODIUM */}
                <section aria-labelledby="podium-title" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(16px, 3vw, 24px)", marginBottom: "clamp(32px, 6vw, 48px)", alignItems: "end" }} className="mobile-stack">
                  <h2 id="podium-title" style={{ position: "absolute", left: "-9999px" }}>Top 3 Players</h2>
                  {top3[1] && <PodiumCard player={top3[1]} place={2} />}
                  {top3[0] && <PodiumCard player={top3[0]} place={1} />}
                  {top3[2] && <PodiumCard player={top3[2]} place={3} />}
                </section>

                {/* REST LIST */}
                {restPlayers.length > 0 && (
                  <section aria-labelledby="ranked-players-title" className="animate-slide-up" style={{ padding: "clamp(24px, 5vw, 32px)", borderRadius: "clamp(16px, 3vw, 24px)", border: "2px solid rgba(139,92,246,0.5)", background: "linear-gradient(135deg, rgba(30,27,75,0.98) 0%, rgba(15,23,42,0.98) 100%)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", animationDelay: "0.3s" }}>
                    <h2 id="ranked-players-title" style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 900, marginBottom: "clamp(20px, 4vw, 24px)", display: "flex", alignItems: "center", gap: "10px" }}>
                      <Sparkles style={{ width: "24px", height: "24px", color: "#a78bfa" }} />
                      Ranked Players
                    </h2>
                    <ul role="list" style={{ display: "flex", flexDirection: "column", gap: "12px", listStyle: "none", padding: 0, margin: 0 }}>
                      {restPlayers.map((player, idx) => (
                        <li 
                          key={player.user_id} 
                          role="article"
                          aria-label={`Rank ${player.rank}: ${player.full_name} with ${player.total_score} points`}
                          className="animate-slide-up" 
                          style={{ display: "flex", alignItems: "center", gap: "clamp(12px, 2.5vw, 16px)", padding: "clamp(12px, 2.5vw, 16px)", borderRadius: "14px", background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.2)", transition: "all 0.3s", cursor: "pointer", animationDelay: `${Math.min(idx * 0.03, 0.5)}s` }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.15)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"; e.currentTarget.style.transform = "translateX(8px)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.05)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)"; e.currentTarget.style.transform = "translateX(0)"; }}>
                          
                          <div style={{ width: "clamp(36px, 7vw, 48px)", height: "clamp(36px, 7vw, 48px)", borderRadius: "10px", background: player.rank <= 10 ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : "rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(12px, 2.5vw, 16px)", fontWeight: 900, color: "white", flexShrink: 0, boxShadow: player.rank <= 10 ? "0 4px 12px rgba(139,92,246,0.5)" : "none" }}>
                            #{player.rank}
                          </div>
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                              <span style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                                {player.full_name}
                              </span>
                              <span style={{ fontSize: "clamp(14px, 3vw, 16px)" }}>{player.tier_icon}</span>
                            </div>
                            <div style={{ fontSize: "clamp(10px, 2vw, 12px)", color: "#64748b", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                              <span style={{ color: "#22c55e" }}>{player.accuracy}% acc</span>
                              <span className="mobile-hide">•</span>
                              <span className="mobile-hide">{player.rounds_played} rounds</span>
                            </div>
                          </div>
                          
                          <div style={{ padding: "clamp(8px, 2vw, 12px) clamp(12px, 2.5vw, 20px)", borderRadius: "10px", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", textAlign: "right" as const }}>
                            <div style={{ fontSize: "clamp(16px, 3.5vw, 22px)", fontWeight: 900, background: "linear-gradient(90deg, #a78bfa, #f0abfc)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                              {(player.total_score ?? 0).toLocaleString()}
                            </div>
                            <div style={{ fontSize: "clamp(9px, 1.8vw, 11px)", color: "#64748b" }}>points</div>
                          </div>
                          
                          <ChevronRight className="mobile-hide" style={{ width: "20px", height: "20px", color: "#64748b", flexShrink: 0 }} />
                        </li>
                      ))}
                    </ul>
                  </section>
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
