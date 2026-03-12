"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Crown, Trophy, Star, Target, Clock, Users,
  Sparkles, Volume2, VolumeX, ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Footer from "@/components/Footer";

// ── TIER CONFIG (profile page ile aynı) ─────────────────────────────────────
const TIERS = {
  BRONZE:  { min: 0,    max: 500,      name: "Bronze",  icon: "🥉", color: "#cd7f32" },
  SILVER:  { min: 500,  max: 2000,     name: "Silver",  icon: "🥈", color: "#c0c0c0" },
  GOLD:    { min: 2000, max: 5000,     name: "Gold",    icon: "🥇", color: "#ffd700" },
  DIAMOND: { min: 5000, max: Infinity, name: "Diamond", icon: "💎", color: "#b9f2ff" },
};

// ── TYPES ────────────────────────────────────────────────────────────────────
type Tab = "daily" | "weekly" | "monthly";

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

interface RpcPayload {
  players: any[];
  stats: { total_players: number; top_score: number; avg_accuracy: number };
  prize: { unlocked: boolean; progress: number; amount?: number };
  countdown: { days: number; hours: number; minutes: number };
}

// ── COMPONENT ────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab]           = useState<Tab>("daily");
  const [players, setPlayers]               = useState<Player[]>([]);
  const [rpcData, setRpcData]               = useState<RpcPayload | null>(null);
  const [loading, setLoading]               = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasInteracted, setHasInteracted]   = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── SEO ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const label = activeTab === "daily" ? "Daily" : activeTab === "weekly" ? "Weekly" : "Monthly";
    document.title = `${label} Leaderboard – VibraXX`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", `Compete for prizes. View ${activeTab} VibraXX leaderboard rankings.`);
  }, [activeTab]);

  // ── BACKGROUND MUSIC ──────────────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio("/sounds/vibraxx.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    if (localStorage.getItem("vibraxx_music_enabled") === "true") setIsMusicPlaying(true);
    return () => { audioRef.current?.pause(); audioRef.current = null; };
  }, []);

  useEffect(() => {
    const onFirst = () => {
      if (hasInteracted) return;
      setHasInteracted(true);
      if (localStorage.getItem("vibraxx_music_enabled") !== "false" && audioRef.current) {
        setIsMusicPlaying(true);
        audioRef.current.play().catch(() => {});
      }
      document.removeEventListener("click", onFirst);
    };
    document.addEventListener("click", onFirst);
    return () => document.removeEventListener("click", onFirst);
  }, [hasInteracted]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.play().catch(() => {});
      localStorage.setItem("vibraxx_music_enabled", "true");
    } else {
      audioRef.current.pause();
      localStorage.setItem("vibraxx_music_enabled", "false");
    }
  }, [isMusicPlaying, hasInteracted]);

  const toggleMusic = useCallback(() => setIsMusicPlaying(p => !p), []);

  // ── DATA FETCH — RPC ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc("get_leaderboard_data", { p_tab: activeTab });
        if (error || !data) { setRpcData(null); setPlayers([]); return; }

        const mapped: Player[] = (data.players || []).map((p: any) => ({
          id:        p.user_id,
          rank:      p.rank,
          name:      p.full_name       || "Anonymous",
          score:     p.total_score     || 0,
          correct:   p.correct_answers || 0,
          wrong:     p.wrong_answers   || 0,
          rounds:    p.rounds_played   || 0,
          accuracy:  p.accuracy        || 0,
          tier:      p.tier            || "Bronze",
          tierIcon:  p.tier_icon       || "🥉",
          tierColor: p.tier_color      || "#cd7f32",
        }));

        setRpcData(data as RpcPayload);
        setPlayers(mapped);
      } catch {
        setRpcData(null);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [activeTab]);

  // ── DERIVED ───────────────────────────────────────────────────────────────
  const top3        = players.slice(0, 3);
  const restPlayers = players.slice(3);
  const countdown   = rpcData?.countdown ?? { days: 0, hours: 0, minutes: 0 };
  const stats       = rpcData?.stats     ?? { total_players: 0, top_score: 0, avg_accuracy: 0 };
  const prize       = rpcData?.prize     ?? { unlocked: false, progress: 0 };

  const TAB_LABEL: Record<Tab, string>      = { daily: "⚡ Daily", weekly: "📅 Weekly", monthly: "📆 Monthly" };
  const CHAMPION_TITLE: Record<Tab, string> = { daily: "Daily Champion", weekly: "Weekly Champion", monthly: "Monthly Champion" };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { overflow-x: hidden; }

        @keyframes spin        { to { transform: rotate(360deg); } }
        @keyframes pulse       { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes glow        { 0%,100% { box-shadow: 0 0 20px rgba(251,191,36,.4); } 50% { box-shadow: 0 0 40px rgba(251,191,36,.8); } }
        @keyframes float       { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes slideUp     { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes crownBounce { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(5deg); } }

        .animate-pulse    { animation: pulse       2s ease-in-out infinite; }
        .animate-glow     { animation: glow        2s ease-in-out infinite; }
        .animate-float    { animation: float       3s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp    0.5s ease-out both; }
        .animate-crown    { animation: crownBounce 2s ease-in-out infinite; }

        @media (max-width: 768px) {
          .mobile-hide  { display: none !important; }
          .mobile-grid  { grid-template-columns: 1fr !important; gap: 12px !important; }
          .mobile-stack { flex-direction: column !important; }
          .podium-2nd   { order: 2 !important; }
          .podium-1st   { order: 1 !important; }
          .podium-3rd   { order: 3 !important; }
          .prize-pool-content { flex-direction: column !important; }
          .prize-pool-info    { text-align: center !important; }
          .prize-pool-cta     { justify-content: center !important; }
          button { min-height: 44px !important; }
        }

        @media (max-width: 375px) {
          nav button { padding: 8px 12px !important; font-size: 11px !important; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)",
        color: "white",
        paddingBottom: 0,
      }}>
        <div style={{ padding: "clamp(20px,5vw,40px) clamp(16px,4vw,24px)" }}>

          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <header style={{
            maxWidth: "900px",
            margin: "0 auto clamp(24px,5vw,40px)",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: "16px",
          }}>

            {/* LEFT: Logo + Leaderboard */}
            <div
              onClick={() => router.push("/")}
              style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", flexShrink: 0 }}
            >
              <img src="/logo.png" alt="VibraXX" width={44} height={44} style={{ borderRadius: "10px", display: "block", width: 44, height: 44, objectFit: "contain" }} />
              <span style={{ fontSize: "clamp(16px,2.5vw,20px)", fontWeight: 900, background: "linear-gradient(90deg, #fbbf24, #f59e0b)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "1px", whiteSpace: "nowrap" }}>
                Leaderboard
              </span>
            </div>

            {/* CENTER: Tabs */}
            <nav style={{ display: "flex", justifyContent: "center", gap: "4px", padding: "4px", borderRadius: "12px", background: "rgba(15,23,42,.8)", border: "2px solid rgba(139,92,246,.3)" }}>
              {(["daily", "weekly", "monthly"] as Tab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "9px 16px", borderRadius: "10px", border: "none",
                    background: activeTab === tab ? "linear-gradient(135deg, #7c3aed, #d946ef)" : "transparent",
                    color: activeTab === tab ? "white" : "#94a3b8",
                    fontSize: "12px", fontWeight: 800, textTransform: "uppercase",
                    letterSpacing: "0.5px", cursor: "pointer", transition: "all .3s", whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { if (activeTab !== tab) { e.currentTarget.style.color = "#cbd5e1"; e.currentTarget.style.background = "rgba(139,92,246,.15)"; } }}
                  onMouseLeave={e => { if (activeTab !== tab) { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; } }}
                >
                  {TAB_LABEL[tab]}
                </button>
              ))}
            </nav>

            {/* RIGHT: Music + Live */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              <button
                onClick={toggleMusic}
                title={isMusicPlaying ? "Mute Music" : "Play Music"}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 40, height: 40, borderRadius: "10px",
                  border: "2px solid rgba(139,92,246,.5)",
                  background: isMusicPlaying ? "linear-gradient(135deg, rgba(139,92,246,.95), rgba(124,58,237,.95))" : "rgba(15,23,42,.8)",
                  cursor: "pointer", transition: "all .3s",
                  boxShadow: isMusicPlaying ? "0 0 15px rgba(139,92,246,.5)" : "none",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#a78bfa"; e.currentTarget.style.transform = "scale(1.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,.5)"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                {isMusicPlaying
                  ? <Volume2 className="animate-pulse" style={{ width: 18, height: 18, color: "white" }} />
                  : <VolumeX style={{ width: 18, height: 18, color: "#94a3b8" }} />
                }
              </button>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "8px 14px", borderRadius: "999px", background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.5)" }}>
                <div className="animate-pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 600 }}>Live</span>
              </div>
            </div>
          </header>

          {/* ── MAIN ──────────────────────────────────────────────────── */}
          <main style={{ maxWidth: "900px", margin: "0 auto" }}>

            {/* === HERO SECTION === */}
            <div className="animate-slide-up" style={{
              padding: "clamp(28px,5vw,44px) clamp(20px,4vw,36px)",
              borderRadius: "clamp(20px,4vw,28px)",
              border: "2px solid rgba(251,191,36,.5)",
              background: "linear-gradient(135deg, rgba(30,27,75,.98) 0%, rgba(15,23,42,.98) 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,.6), 0 0 40px rgba(251,191,36,.25)",
              backdropFilter: "blur(20px)",
              marginBottom: "clamp(20px,4vw,36px)",
              textAlign: "center",
            }}>

              {/* Champion Title */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "14px", marginBottom: "clamp(18px,3.5vw,28px)", flexWrap: "wrap",
              }}>
                <Trophy className="animate-float" style={{ width: "clamp(28px,5vw,40px)", height: "clamp(28px,5vw,40px)", color: "#fbbf24" }} />
                <h1 style={{
                  fontSize: "clamp(22px,4.5vw,40px)", fontWeight: 900, margin: 0,
                  background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)",
                  backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  textTransform: "uppercase", letterSpacing: "2px",
                }}>
                  {CHAMPION_TITLE[activeTab]}
                </h1>
                <Trophy className="animate-float" style={{ width: "clamp(28px,5vw,40px)", height: "clamp(28px,5vw,40px)", color: "#fbbf24", animationDelay: ".3s" }} />
              </div>

              {/* ── PRIZE BLOCK ── */}

              {/* MONTHLY — Progress ring */}
              {activeTab === "monthly" && (
                <div className="animate-glow" style={{
                  padding: "clamp(24px,5vw,40px) clamp(20px,4vw,36px)",
                  borderRadius: "clamp(18px,3vw,24px)",
                  background: "linear-gradient(135deg, rgba(251,191,36,.2), rgba(245,158,11,.15))",
                  border: "3px solid rgba(251,191,36,.6)",
                  marginBottom: "clamp(20px,4vw,28px)",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(251,191,36,.12) 0%, transparent 70%)", pointerEvents: "none" }} />

                  <div style={{ fontSize: "clamp(13px,2.5vw,16px)", color: "#fcd34d", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "clamp(20px,4vw,28px)", position: "relative", zIndex: 1 }}>
                    💰 Monthly Prize Pool
                  </div>

                  <div className="prize-pool-content" style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "clamp(28px,5vw,44px)", position: "relative", zIndex: 1 }}>

                    {/* SVG Ring */}
                    <div style={{ position: "relative", width: "clamp(140px,25vw,180px)", height: "clamp(140px,25vw,180px)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="100%" height="100%" viewBox="0 0 200 200" style={{
                        transform: "rotate(-90deg)",
                        filter: prize.unlocked ? "drop-shadow(0 0 20px rgba(251,191,36,.8))" : "drop-shadow(0 0 10px rgba(139,92,246,.5))",
                      }}>
                        <defs>
                          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%"   stopColor="#fbbf24" />
                            <stop offset="50%"  stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#fbbf24" />
                          </linearGradient>
                          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%"   stopColor="#8b5cf6" />
                            <stop offset="50%"  stopColor="#d946ef" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                        <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(15,23,42,.6)" strokeWidth="12" />
                        <circle
                          cx="100" cy="100" r="85" fill="none"
                          stroke={prize.unlocked ? "url(#goldGradient)" : "url(#purpleGradient)"}
                          strokeWidth="12" strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 85}`}
                          strokeDashoffset={`${2 * Math.PI * 85 * (1 - Math.min((prize.progress || 0) / 100, 1))}`}
                          style={{ transition: "stroke-dashoffset 1s ease-out, stroke .5s ease" }}
                        />
                      </svg>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                        <div style={{ fontSize: "clamp(28px,5vw,40px)", marginBottom: "6px", animation: prize.unlocked ? "float 2s ease-in-out infinite" : "none" }}>
                          {prize.unlocked ? "🎉" : "🔒"}
                        </div>
                        <div style={{ fontSize: "clamp(20px,4vw,30px)", fontWeight: 900, lineHeight: 1, background: prize.unlocked ? "linear-gradient(90deg, #fbbf24, #f59e0b)" : "linear-gradient(90deg, #8b5cf6, #d946ef)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                          {prize.progress || 0}%
                        </div>
                      </div>
                    </div>

                    {/* Right Info */}
                    <div className="prize-pool-info" style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ fontSize: "clamp(40px,8vw,68px)", fontWeight: 900, lineHeight: 1, marginBottom: "14px", background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: prize.unlocked ? "drop-shadow(0 0 20px rgba(251,191,36,.6))" : "none" }}>
                        £1,000
                      </div>

                      {prize.unlocked ? (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "9px 18px", borderRadius: "999px", marginBottom: "14px", background: "linear-gradient(135deg, rgba(34,197,94,.25), rgba(21,128,61,.2))", border: "2px solid rgba(34,197,94,.6)" }}>
                          <Sparkles style={{ width: 18, height: 18, color: "#22c55e" }} />
                          <span style={{ fontSize: "clamp(12px,2.2vw,15px)", fontWeight: 800, color: "#22c55e", textTransform: "uppercase", letterSpacing: ".5px" }}>PRIZE ACTIVE!</span>
                        </div>
                      ) : (
                        <div style={{ marginBottom: "14px" }}>
                          <div style={{ fontSize: "clamp(13px,2.5vw,16px)", fontWeight: 700, color: "#fcd34d", marginBottom: "8px" }}>
                            Prize Pool Locked — Activates via Sales Milestone
                          </div>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "7px 14px", borderRadius: "999px", background: "rgba(139,92,246,.2)", border: "1px solid rgba(139,92,246,.5)" }}>
                            <Target style={{ width: 14, height: 14, color: "#a78bfa" }} />
                            <span style={{ fontSize: "clamp(11px,2vw,13px)", fontWeight: 700, color: "#a78bfa" }}>Full terms on the Legal page</span>
                          </div>
                        </div>
                      )}

                      <div className="prize-pool-cta" style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "clamp(11px,2vw,13px)", color: "#cbd5e1" }}>
                        <Clock style={{ width: 14, height: 14 }} />
                        <span>Resets in {countdown.days}d {countdown.hours}h {countdown.minutes}m</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* WEEKLY — 15 Free Rounds */}
              {activeTab === "weekly" && (
                <div style={{
                  padding: "clamp(20px,4vw,28px)", borderRadius: "clamp(16px,3vw,22px)",
                  background: "linear-gradient(135deg, rgba(139,92,246,.18), rgba(124,58,237,.12))",
                  border: "2px solid rgba(139,92,246,.5)",
                  marginBottom: "clamp(18px,3.5vw,26px)",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,.1) 0%, transparent 70%)", pointerEvents: "none" }} />
                  <div style={{ fontSize: "clamp(32px,6vw,48px)", marginBottom: "10px", animation: "float 3s ease-in-out infinite" }}>🎟️</div>
                  <div style={{ fontSize: "clamp(24px,5vw,36px)", fontWeight: 900, marginBottom: "8px", background: "linear-gradient(90deg, #a78bfa, #f0abfc)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {prize.amount ?? 15} Free Rounds
                  </div>
                  <div style={{ fontSize: "clamp(11px,2vw,13px)", color: "#94a3b8", marginBottom: "14px", fontStyle: "italic" }}>
                    Awarded to the weekly champion who has made at least one paid entry.
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "999px", background: "rgba(139,92,246,.2)", border: "1px solid rgba(139,92,246,.4)", fontSize: "clamp(11px,2vw,13px)", color: "#c4b5fd", fontWeight: 700 }}>
                    <Clock style={{ width: 13, height: 13 }} />
                    Resets in {countdown.days}d {countdown.hours}h {countdown.minutes}m
                  </div>
                </div>
              )}

              {/* DAILY — Glory only */}
              {activeTab === "daily" && (
                <div style={{
                  padding: "clamp(20px,4vw,28px)", borderRadius: "clamp(16px,3vw,22px)",
                  background: "linear-gradient(135deg, rgba(139,92,246,.13), rgba(124,58,237,.08))",
                  border: "2px solid rgba(139,92,246,.4)",
                  marginBottom: "clamp(18px,3.5vw,26px)",
                }}>
                  <div style={{ fontSize: "clamp(32px,6vw,48px)", marginBottom: "10px" }}>🏅</div>
                  <div style={{ fontSize: "clamp(18px,3.5vw,24px)", fontWeight: 900, marginBottom: "8px", background: "linear-gradient(90deg, #a78bfa, #f0abfc)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Daily Glory
                  </div>
                  <div style={{ fontSize: "clamp(11px,2vw,13px)", color: "#94a3b8", marginBottom: "14px" }}>
                    Top the daily rankings and claim your spot as today&apos;s champion.
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "999px", background: "rgba(139,92,246,.2)", border: "1px solid rgba(139,92,246,.4)", fontSize: "clamp(11px,2vw,13px)", color: "#c4b5fd", fontWeight: 700 }}>
                    <Clock style={{ width: 13, height: 13 }} />
                    Resets in {countdown.days}d {countdown.hours}h {countdown.minutes}m
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              <div className="mobile-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: "clamp(10px,2.5vw,14px)" }}>
                {[
                  { icon: <Users  style={{ width: "clamp(18px,3.5vw,24px)", height: "clamp(18px,3.5vw,24px)", color: "#a78bfa", margin: "0 auto 6px" }} />, value: stats.total_players.toLocaleString(), label: "Players",      fg: "#a78bfa", bg: "rgba(139,92,246,.2)",  border: "rgba(139,92,246,.5)",  sub: "#c4b5fd" },
                  { icon: <Star   style={{ width: "clamp(18px,3.5vw,24px)", height: "clamp(18px,3.5vw,24px)", color: "#22c55e", margin: "0 auto 6px" }} />, value: stats.top_score.toLocaleString(),     label: "Top Score",    fg: "#22c55e", bg: "rgba(34,197,94,.2)",   border: "rgba(34,197,94,.5)",   sub: "#86efac" },
                  { icon: <Target style={{ width: "clamp(18px,3.5vw,24px)", height: "clamp(18px,3.5vw,24px)", color: "#38bdf8", margin: "0 auto 6px" }} />, value: `${stats.avg_accuracy}%`,             label: "Avg Accuracy", fg: "#38bdf8", bg: "rgba(56,189,248,.2)",  border: "rgba(56,189,248,.5)",  sub: "#7dd3fc" },
                ].map(({ icon, value, label, fg, bg, border, sub }) => (
                  <div key={label} style={{ padding: "clamp(14px,2.5vw,18px)", borderRadius: "14px", background: bg, border: `2px solid ${border}` }}>
                    {icon}
                    <div style={{ fontSize: "clamp(18px,3.5vw,28px)", fontWeight: 900, color: fg, lineHeight: 1, marginBottom: "3px" }}>{value}</div>
                    <div style={{ fontSize: "clamp(9px,1.8vw,11px)", color: sub, fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* === LOADING / EMPTY / LIST === */}
            {loading ? (
              <div style={{ padding: "clamp(60px,12vw,100px)", textAlign: "center" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", border: "4px solid rgba(139,92,246,.3)", borderTopColor: "#a78bfa", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
                <p style={{ color: "#94a3b8", fontSize: "16px" }}>Loading leaderboard...</p>
              </div>
            ) : players.length === 0 ? (
              <div style={{ padding: "clamp(60px,12vw,100px)", textAlign: "center", borderRadius: "20px", border: "2px solid rgba(139,92,246,.3)", background: "rgba(15,23,42,.6)" }}>
                <Trophy style={{ width: 48, height: 48, color: "#64748b", margin: "0 auto 16px" }} />
                <p style={{ color: "#94a3b8", fontSize: "16px" }}>No players yet. Be the first!</p>
              </div>
            ) : (
              <>
                {/* === PODIUM TOP 3 === */}
                <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(14px,3vw,22px)", marginBottom: "clamp(28px,5vw,44px)", alignItems: "end" }}>

                  {/* 2nd */}
                  {top3[1] && (
                    <div className="animate-slide-up podium-2nd" style={{ order: 1, animationDelay: ".1s" }}>
                      <div
                        style={{ padding: "clamp(18px,3.5vw,26px)", borderRadius: "clamp(14px,3vw,22px)", border: "3px solid rgba(192,192,192,.6)", background: "linear-gradient(135deg, rgba(192,192,192,.18), rgba(156,163,175,.12))", backdropFilter: "blur(20px)", textAlign: "center", boxShadow: "0 0 40px rgba(192,192,192,.35)", transition: "transform .3s", cursor: "default" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-8px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                      >
                        <div style={{ position: "relative", width: "clamp(64px,12vw,90px)", height: "clamp(64px,12vw,90px)", margin: "0 auto clamp(14px,2.5vw,18px)", borderRadius: "50%", padding: 4, background: "linear-gradient(135deg, #d1d5db, #9ca3af)", boxShadow: "0 0 30px rgba(192,192,192,.6)" }}>
                          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(28px,5vw,40px)" }}>🥈</div>
                          <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", width: "clamp(28px,5vw,36px)", height: "clamp(28px,5vw,36px)", borderRadius: "50%", background: "linear-gradient(135deg, #d1d5db, #9ca3af)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #0f172a", color: "#0f172a", fontWeight: 900, fontSize: "clamp(13px,2.5vw,18px)" }}>2</div>
                        </div>
                        <h2 style={{ fontSize: "clamp(13px,2.5vw,17px)", fontWeight: 800, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{top3[1].name}</h2>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: "999px", background: `${top3[1].tierColor}20`, border: `1px solid ${top3[1].tierColor}60`, marginBottom: 10, fontSize: "clamp(9px,1.8vw,11px)" }}>
                          <span>{top3[1].tierIcon}</span><span style={{ color: top3[1].tierColor, fontWeight: 700 }}>{top3[1].tier}</span>
                        </div>
                        <div style={{ fontSize: "clamp(22px,4.5vw,32px)", fontWeight: 900, background: "linear-gradient(90deg, #d1d5db, #9ca3af)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 }}>{top3[1].score.toLocaleString()}</div>
                        <div style={{ fontSize: "clamp(9px,1.8vw,11px)", color: "#94a3b8", display: "flex", flexDirection: "column", gap: 3 }}>
                          <span>{top3[1].accuracy}% accuracy</span><span>{top3[1].rounds} rounds</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1st */}
                  {top3[0] && (
                    <div className="animate-slide-up podium-1st" style={{ order: 2, animationDelay: ".2s" }}>
                      <div
                        className="animate-glow"
                        style={{ padding: "clamp(22px,4.5vw,34px)", borderRadius: "clamp(18px,4vw,26px)", border: "4px solid rgba(251,191,36,.8)", background: "linear-gradient(135deg, rgba(251,191,36,.22), rgba(245,158,11,.17))", backdropFilter: "blur(25px)", textAlign: "center", boxShadow: "0 0 60px rgba(251,191,36,.55)", transition: "transform .3s", cursor: "default" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-12px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                      >
                        <Crown className="animate-crown" style={{ width: "clamp(28px,5.5vw,44px)", height: "clamp(28px,5.5vw,44px)", color: "#fbbf24", margin: "0 auto clamp(10px,2vw,14px)" }} />
                        <div style={{ position: "relative", width: "clamp(80px,15vw,108px)", height: "clamp(80px,15vw,108px)", margin: "0 auto clamp(16px,3vw,22px)", borderRadius: "50%", padding: 5, background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 0 50px rgba(251,191,36,.8)" }}>
                          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(36px,7vw,54px)" }}>🥇</div>
                          <div style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", width: "clamp(32px,6vw,42px)", height: "clamp(32px,6vw,42px)", borderRadius: "50%", background: "linear-gradient(135deg, #fbbf24, #f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #0f172a", color: "#0f172a", fontWeight: 900, fontSize: "clamp(14px,3vw,22px)" }}>1</div>
                        </div>
                        <h2 style={{ fontSize: "clamp(16px,3.5vw,22px)", fontWeight: 900, marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{top3[0].name}</h2>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: "999px", background: `${top3[0].tierColor}25`, border: `2px solid ${top3[0].tierColor}`, marginBottom: 14, fontSize: "clamp(10px,2vw,13px)" }}>
                          <span style={{ fontSize: "clamp(12px,2.5vw,16px)" }}>{top3[0].tierIcon}</span><span style={{ color: top3[0].tierColor, fontWeight: 800 }}>{top3[0].tier}</span>
                        </div>
                        <div style={{ fontSize: "clamp(28px,6vw,44px)", fontWeight: 900, background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 10 }}>{top3[0].score.toLocaleString()}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: "clamp(10px,2vw,13px)" }}>
                          <div><div style={{ color: "#22c55e", fontWeight: 700 }}>{top3[0].accuracy}%</div><div style={{ color: "#94a3b8", fontSize: "clamp(8px,1.6vw,10px)" }}>accuracy</div></div>
                          <div><div style={{ color: "#38bdf8", fontWeight: 700 }}>{top3[0].rounds}</div><div style={{ color: "#94a3b8", fontSize: "clamp(8px,1.6vw,10px)" }}>rounds</div></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3rd */}
                  {top3[2] && (
                    <div className="animate-slide-up podium-3rd" style={{ order: 3, animationDelay: ".15s" }}>
                      <div
                        style={{ padding: "clamp(18px,3.5vw,26px)", borderRadius: "clamp(14px,3vw,22px)", border: "3px solid rgba(217,119,6,.6)", background: "linear-gradient(135deg, rgba(217,119,6,.18), rgba(194,65,12,.12))", backdropFilter: "blur(20px)", textAlign: "center", boxShadow: "0 0 40px rgba(217,119,6,.35)", transition: "transform .3s", cursor: "default" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-8px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                      >
                        <div style={{ position: "relative", width: "clamp(64px,12vw,90px)", height: "clamp(64px,12vw,90px)", margin: "0 auto clamp(14px,2.5vw,18px)", borderRadius: "50%", padding: 4, background: "linear-gradient(135deg, #d97706, #c2410c)", boxShadow: "0 0 30px rgba(217,119,6,.6)" }}>
                          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(28px,5vw,40px)" }}>🥉</div>
                          <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", width: "clamp(28px,5vw,36px)", height: "clamp(28px,5vw,36px)", borderRadius: "50%", background: "linear-gradient(135deg, #d97706, #c2410c)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #0f172a", color: "#0f172a", fontWeight: 900, fontSize: "clamp(13px,2.5vw,18px)" }}>3</div>
                        </div>
                        <h2 style={{ fontSize: "clamp(13px,2.5vw,17px)", fontWeight: 800, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{top3[2].name}</h2>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: "999px", background: `${top3[2].tierColor}20`, border: `1px solid ${top3[2].tierColor}60`, marginBottom: 10, fontSize: "clamp(9px,1.8vw,11px)" }}>
                          <span>{top3[2].tierIcon}</span><span style={{ color: top3[2].tierColor, fontWeight: 700 }}>{top3[2].tier}</span>
                        </div>
                        <div style={{ fontSize: "clamp(22px,4.5vw,32px)", fontWeight: 900, background: "linear-gradient(90deg, #d97706, #c2410c)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 }}>{top3[2].score.toLocaleString()}</div>
                        <div style={{ fontSize: "clamp(9px,1.8vw,11px)", color: "#94a3b8", display: "flex", flexDirection: "column", gap: 3 }}>
                          <span>{top3[2].accuracy}% accuracy</span><span>{top3[2].rounds} rounds</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* === RANKED PLAYERS === */}
                {restPlayers.length > 0 && (
                  <div className="animate-slide-up" style={{ padding: "clamp(20px,4vw,30px)", borderRadius: "clamp(16px,3vw,24px)", border: "2px solid rgba(139,92,246,.5)", background: "linear-gradient(135deg, rgba(30,27,75,.98) 0%, rgba(15,23,42,.98) 100%)", boxShadow: "0 20px 60px rgba(0,0,0,.6)", backdropFilter: "blur(20px)", animationDelay: ".3s" }}>
                    <h2 style={{ fontSize: "clamp(16px,3.5vw,22px)", fontWeight: 900, marginBottom: "clamp(16px,3vw,22px)", display: "flex", alignItems: "center", gap: 10 }}>
                      <Sparkles style={{ width: 22, height: 22, color: "#a78bfa" }} />
                      Ranked Players
                    </h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {restPlayers.map((player, idx) => (
                        <div
                          key={player.id}
                          className="animate-slide-up"
                          style={{ display: "flex", alignItems: "center", gap: "clamp(10px,2.5vw,14px)", padding: "clamp(10px,2vw,14px)", borderRadius: "12px", background: "rgba(139,92,246,.05)", border: "1px solid rgba(139,92,246,.2)", transition: "all .3s", cursor: "pointer", animationDelay: `${Math.min(idx * 0.03, 0.5)}s` }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,.15)"; e.currentTarget.style.borderColor = "rgba(139,92,246,.5)"; e.currentTarget.style.transform = "translateX(6px)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(139,92,246,.05)"; e.currentTarget.style.borderColor = "rgba(139,92,246,.2)"; e.currentTarget.style.transform = "translateX(0)"; }}
                        >
                          <div style={{ width: "clamp(34px,6.5vw,44px)", height: "clamp(34px,6.5vw,44px)", borderRadius: "10px", flexShrink: 0, background: player.rank <= 10 ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : "rgba(139,92,246,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(11px,2.2vw,14px)", fontWeight: 900, color: "white", boxShadow: player.rank <= 10 ? "0 4px 12px rgba(139,92,246,.5)" : "none" }}>
                            #{player.rank}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                              <span style={{ fontSize: "clamp(13px,2.5vw,15px)", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player.name}</span>
                              <span style={{ fontSize: "clamp(13px,2.5vw,15px)" }}>{player.tierIcon}</span>
                            </div>
                            <div style={{ fontSize: "clamp(9px,1.8vw,11px)", color: "#64748b", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ color: "#22c55e" }}>{player.accuracy}% acc</span>
                              <span className="mobile-hide">•</span>
                              <span className="mobile-hide">{player.rounds} rounds</span>
                            </div>
                          </div>
                          <div style={{ padding: "clamp(7px,1.5vw,10px) clamp(10px,2vw,16px)", borderRadius: "10px", background: "rgba(139,92,246,.15)", border: "1px solid rgba(139,92,246,.3)", textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: "clamp(14px,3vw,20px)", fontWeight: 900, background: "linear-gradient(90deg, #a78bfa, #f0abfc)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{player.score.toLocaleString()}</div>
                            <div style={{ fontSize: "clamp(8px,1.6vw,10px)", color: "#64748b" }}>points</div>
                          </div>
                          <ChevronRight className="mobile-hide" style={{ width: 18, height: 18, color: "#64748b", flexShrink: 0 }} />
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
