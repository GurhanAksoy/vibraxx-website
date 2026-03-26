"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Crown, Trophy, Star, Target, Clock, Users,
  Sparkles, Volume2, VolumeX, ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import AnnouncementModal from "@/components/AnnouncementModal";


type Tab = "daily" | "weekly" | "monthly";

interface Player {
  id: string; rank: number; name: string; score: number;
  correct: number; wrong: number; rounds: number; accuracy: number;
  tier: string; tierIcon: string; tierColor: string;
  avatarUrl: string; country: string;
}

// flagcdn.com — Windows Chrome/Edge emoji render etmez, CDN PNG her platformda çalışır
const flagUrl = (code: string): string | null => {
  if (!code || code.length !== 2 || !/^[A-Z]{2}$/i.test(code)) return null;
  return `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;
};

interface RpcPayload {
  players: any[];
  stats: { total_players: number; top_score: number; avg_accuracy: number };
  prize: { unlocked: boolean; progress: number; amount?: number; threshold?: number };
  countdown: { days: number; hours: number; minutes: number };
}

export default function LeaderboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab]           = useState<Tab>("daily");
  const [players, setPlayers]               = useState<Player[]>([]);
  const [rpcData, setRpcData]               = useState<RpcPayload | null>(null);
  const [loading, setLoading]               = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasInteracted, setHasInteracted]   = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // SEO
  useEffect(() => {
    const label = activeTab === "daily" ? "Daily" : activeTab === "weekly" ? "Weekly" : "Monthly";
    document.title = `${label} Leaderboard – VibraXX`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", `Compete for prizes. View ${activeTab} VibraXX leaderboard rankings.`);
  }, [activeTab]);

  // Music — init
  useEffect(() => {
    const audio = new Audio("/sounds/vibraxx.mp3");
    audio.loop = true; audio.volume = 0.3;
    audioRef.current = audio;
    if (localStorage.getItem("vibraxx_music_enabled") === "true") setIsMusicPlaying(true);
    return () => { audioRef.current?.pause(); audioRef.current = null; };
  }, []);

  // Music — first interaction gate
  // hasInteracted dep kaldırıldı: listener kendini siliyor, closure yeterli
  useEffect(() => {
    const onFirst = () => {
      setHasInteracted(true);
      if (localStorage.getItem("vibraxx_music_enabled") !== "false" && audioRef.current) {
        audioRef.current.play().catch(() => {});
        setIsMusicPlaying(true);
      }
      document.removeEventListener("click", onFirst);
    };
    document.addEventListener("click", onFirst);
    return () => document.removeEventListener("click", onFirst);
  }, []);

  // Music — play/pause sync
  // hasInteracted guard eklendi: ilk etkileşim olmadan play() çağrılmaz
  useEffect(() => {
    if (!audioRef.current || !hasInteracted) return;
    if (isMusicPlaying) {
      audioRef.current.play().catch(() => {});
      localStorage.setItem("vibraxx_music_enabled", "true");
    } else {
      audioRef.current.pause();
      localStorage.setItem("vibraxx_music_enabled", "false");
    }
  }, [isMusicPlaying, hasInteracted]);

  const toggleMusic = useCallback(() => setIsMusicPlaying(p => !p), []);

  // `fetch` global'i shadow etmemek için fetchLeaderboard olarak rename edildi
  const fetchLeaderboard = useCallback(async (tab: Tab) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_leaderboard_data", { p_tab: tab });
      if (error || !data) { setRpcData(null); setPlayers([]); return; }
      const mapped: Player[] = (data.players || []).map((p: any) => ({
        id: p.user_id, rank: p.rank,
        name: p.full_name || "Anonymous",
        score: p.total_score || 0, correct: p.correct_answers || 0,
        wrong: p.wrong_answers || 0, rounds: p.rounds_played || 0,
        accuracy: p.accuracy || 0,
        tier: p.tier || "Bronze", tierIcon: p.tier_icon || "🥉", tierColor: p.tier_color || "#cd7f32",
        avatarUrl: p.avatar_url || "",
        country: p.country || "",
      }));
      setRpcData(data as RpcPayload);
      setPlayers(mapped);
    } catch {
      setRpcData(null); setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab, fetchLeaderboard]);

  const top3        = players.slice(0, 3);
  const restPlayers = players.slice(3);
  const countdown   = rpcData?.countdown ?? { days: 0, hours: 0, minutes: 0 };
  const stats       = rpcData?.stats     ?? { total_players: 0, top_score: 0, avg_accuracy: 0 };
  const prize       = rpcData?.prize     ?? { unlocked: false, progress: 0 };

  const TAB_LABEL: Record<Tab, string>      = { daily: "⚡ Daily", weekly: "📅 Weekly", monthly: "📆 Monthly" };
  const CHAMPION_TITLE: Record<Tab, string> = { daily: "Daily Champion", weekly: "Weekly Champion", monthly: "Monthly Champion" };

  return (
    <>
      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }

        @keyframes spin        { to { transform: rotate(360deg); } }
        @keyframes pulse       { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes glow        { 0%,100% { box-shadow: 0 0 20px rgba(251,191,36,.4); } 50% { box-shadow: 0 0 40px rgba(251,191,36,.8); } }
        @keyframes float       { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes slideUp     { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes crownBounce { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(5deg); } }

        .animate-pulse    { animation: pulse       2s ease-in-out infinite; }
        .animate-glow     { animation: glow        2s ease-in-out infinite; }
        .animate-float    { animation: float       3s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp    0.4s ease-out both; }
        .animate-crown    { animation: crownBounce 2s ease-in-out infinite; }

        /* ── BASE HEADER ── */
        .lb-header {
          max-width: 900px;
          margin: 0 auto;
          margin-bottom: clamp(20px,4vw,36px);
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 12px;
        }
        .lb-tabs {
          display: flex;
          justify-content: center;
          gap: 4px;
          padding: 4px;
          border-radius: 12px;
          background: rgba(15,23,42,.8);
          border: 2px solid rgba(139,92,246,.3);
          overflow: hidden;
        }
        .lb-tab-btn {
          padding: 9px 16px;
          border-radius: 10px;
          border: none;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all .3s;
          white-space: nowrap;
          min-height: 40px;
        }
        .lb-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .lb-logo-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* ── PODIUM ── */
        .podium-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(12px, 3vw, 22px);
          margin-bottom: clamp(20px, 4vw, 40px);
          align-items: end;
        }

        /* ── MOBILE ── */
        @media (max-width: 640px) {
          /* Header: 2 satır */
          .lb-header {
            grid-template-columns: 1fr auto;
            grid-template-rows: auto auto;
            gap: 10px;
          }
          .lb-logo-wrap  { grid-column: 1; grid-row: 1; }
          .lb-right      { grid-column: 2; grid-row: 1; }
          .lb-tabs       { grid-column: 1 / -1; grid-row: 2; }
          .lb-tab-btn    { padding: 8px 10px; font-size: 10px; letter-spacing: 0; }

          /* Logo boyutu */
          .lb-logo-circle { width: 58px !important; height: 58px !important; }

          /* Podium: 1 sütun, 1. en üstte */
          .podium-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .podium-1st { order: 1 !important; }
          .podium-2nd { order: 2 !important; }
          .podium-3rd { order: 3 !important; }

          /* Stats grid */
          .stats-grid { grid-template-columns: 1fr !important; gap: 8px !important; }

          /* Player row */
          .mobile-hide { display: none !important; }

          button { min-height: 44px; }
        }

        @media (max-width: 380px) {
          .lb-tab-btn { padding: 7px 7px; font-size: 9px; }
          .lb-logo-title { font-size: 14px !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <AnnouncementBanner />
      <AnnouncementModal />

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)",
        color: "white",
      }}>
        <div style={{ padding: "clamp(14px,4vw,36px) clamp(12px,3vw,24px)" }}>

          {/* ── HEADER ── */}
          <header className="lb-header">

            {/* LEFT: Logo + Title */}
            <div className="lb-logo-wrap" onClick={() => router.push("/")}>
              <div
                className="lb-logo-circle"
                style={{
                  position: "relative", width: 88, height: 88,
                  borderRadius: "9999px", padding: 2,
                  background: "radial-gradient(circle at 0 0,#7c3aed,#d946ef)",
                  boxShadow: "0 0 24px rgba(124,58,237,0.6)", flexShrink: 0,
                }}
              >
                <div className="animate-glow" style={{
                  position: "absolute", inset: -5, borderRadius: "9999px",
                  background: "radial-gradient(circle,#a855f7,transparent)",
                  opacity: 0.4, filter: "blur(8px)", pointerEvents: "none",
                }} />
                <div style={{
                  position: "relative", width: "100%", height: "100%",
                  borderRadius: "9999px", backgroundColor: "#020817",
                  display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                }}>
                  <Image src="/images/logo.png" alt="VibraXX Logo" fill sizes="80px" style={{ objectFit: "contain", padding: "18%" }} />
                </div>
              </div>
              <span
                className="lb-logo-title"
                style={{
                  fontSize: "clamp(16px,3vw,22px)", fontWeight: 900,
                  background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
                  backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  letterSpacing: "1px",
                }}
              >
                Leaderboard
              </span>
            </div>

            {/* CENTER: Tabs */}
            <nav className="lb-tabs">
              {(["daily", "weekly", "monthly"] as Tab[]).map(tab => (
                <button
                  key={tab}
                  className="lb-tab-btn"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: activeTab === tab ? "linear-gradient(135deg, #7c3aed, #d946ef)" : "transparent",
                    color: activeTab === tab ? "white" : "#94a3b8",
                  }}
                  onMouseEnter={e => { if (activeTab !== tab) { e.currentTarget.style.color = "#cbd5e1"; e.currentTarget.style.background = "rgba(139,92,246,.15)"; } }}
                  onMouseLeave={e => { if (activeTab !== tab) { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "transparent"; } }}
                >
                  {TAB_LABEL[tab]}
                </button>
              ))}
            </nav>

            {/* RIGHT: Music + Live */}
            <div className="lb-right">
              <button
                onClick={toggleMusic}
                title={isMusicPlaying ? "Mute" : "Play"}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 40, height: 40, borderRadius: "10px", flexShrink: 0,
                  border: "2px solid rgba(139,92,246,.5)",
                  background: isMusicPlaying ? "linear-gradient(135deg, rgba(139,92,246,.95), rgba(124,58,237,.95))" : "rgba(15,23,42,.8)",
                  cursor: "pointer", transition: "all .3s",
                  boxShadow: isMusicPlaying ? "0 0 15px rgba(139,92,246,.5)" : "none",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#a78bfa"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(139,92,246,.5)"; }}
              >
                {isMusicPlaying
                  ? <Volume2 className="animate-pulse" style={{ width: 18, height: 18, color: "white" }} />
                  : <VolumeX style={{ width: 18, height: 18, color: "#94a3b8" }} />
                }
              </button>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 12px", borderRadius: "999px",
                background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.5)",
                flexShrink: 0,
              }}>
                <div className="animate-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: 600 }}>Live</span>
              </div>
            </div>
          </header>

          {/* ── MAIN ── */}
          <main style={{ maxWidth: "900px", margin: "0 auto" }}>

            {/* HERO */}
            <div className="animate-slide-up" style={{
              padding: "clamp(20px,4vw,40px) clamp(16px,4vw,32px)",
              borderRadius: "clamp(16px,4vw,28px)",
              border: "2px solid rgba(251,191,36,.5)",
              background: "linear-gradient(135deg, rgba(30,27,75,.98) 0%, rgba(15,23,42,.98) 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,.6), 0 0 40px rgba(251,191,36,.2)",
              backdropFilter: "blur(20px)",
              marginBottom: "clamp(16px,4vw,32px)",
              textAlign: "center",
            }}>

              {/* Champion Title */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: "clamp(16px,3vw,24px)", flexWrap: "wrap" }}>
                <Trophy className="animate-float" style={{ width: "clamp(24px,5vw,40px)", height: "clamp(24px,5vw,40px)", color: "#fbbf24", flexShrink: 0 }} />
                <h1 style={{
                  fontSize: "clamp(18px,5vw,40px)", fontWeight: 900,
                  background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)",
                  backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  textTransform: "uppercase", letterSpacing: "clamp(1px,0.5vw,3px)",
                }}>
                  {CHAMPION_TITLE[activeTab]}
                </h1>
                <Trophy className="animate-float" style={{ width: "clamp(24px,5vw,40px)", height: "clamp(24px,5vw,40px)", color: "#fbbf24", flexShrink: 0, animationDelay: ".3s" }} />
              </div>

              {/* PRIZE BLOCK */}
              {(() => {
                const cfg = {
                  daily:   { emoji: "🏅", color: "rgba(139,92,246,.5)",  bg: "rgba(139,92,246,.12)", glow: "rgba(139,92,246,.08)", title: "Daily Glory",      sub: "Top the daily rankings and claim your spot as today's champion." },
                  weekly:  { emoji: "🎟️", color: "rgba(139,92,246,.5)",  bg: "rgba(139,92,246,.14)", glow: "rgba(139,92,246,.08)", title: "15 Free Rounds",   sub: "Awarded to the weekly champion who has made at least one paid entry." },
                  monthly: { emoji: prize.unlocked ? "🎉" : "🔒", color: "rgba(251,191,36,.6)", bg: "rgba(251,191,36,.14)", glow: "rgba(251,191,36,.08)", title: "£1,000 Cash Prize", sub: prize.unlocked ? "Prize Active! Monthly champion takes all." : "Prize Pool Locked — Activates via Sales Milestone." },
                }[activeTab];

                const CIRCUMFERENCE = 2 * Math.PI * 85;
                const progressRatio = Math.min((prize.progress || 0) / (prize.threshold || 1000), 1);
                const dashOffset = CIRCUMFERENCE * (1 - progressRatio);

                return (
                  <div style={{
                    padding: "clamp(20px,4vw,32px)",
                    borderRadius: "clamp(14px,3vw,22px)",
                    background: `linear-gradient(135deg, ${cfg.bg}, transparent)`,
                    border: `2px solid ${cfg.color}`,
                    marginBottom: "clamp(14px,3vw,22px)",
                    position: "relative", overflow: "hidden",
                    boxShadow: activeTab === "monthly" ? "0 0 40px rgba(251,191,36,.2)" : "none",
                  }}>
                    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 30%, ${cfg.glow} 0%, transparent 65%)`, pointerEvents: "none" }} />

                    {/* MONTHLY — ring layout */}
                    {activeTab === "monthly" ? (
                      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(16px,4vw,48px)", flexWrap: "wrap" }}>

                        {/* Circular Ring */}
                        <div style={{ position: "relative", width: "clamp(110px,22vw,170px)", height: "clamp(110px,22vw,170px)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)", filter: prize.unlocked ? "drop-shadow(0 0 20px rgba(251,191,36,.8))" : "drop-shadow(0 0 10px rgba(139,92,246,.5))" }}>
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
                            <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(15,23,42,.6)" strokeWidth="12" />
                            <circle cx="100" cy="100" r="85" fill="none"
                              stroke={prize.unlocked ? "url(#goldGradient)" : "url(#purpleGradient)"}
                              strokeWidth="12" strokeLinecap="round"
                              strokeDasharray={CIRCUMFERENCE}
                              strokeDashoffset={dashOffset}
                              style={{ transition: "stroke-dashoffset 1s ease-out, stroke .5s ease" }}
                            />
                          </svg>
                          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                            <div style={{ fontSize: "clamp(28px,6vw,42px)", marginBottom: 6, animation: prize.unlocked ? "float 2s ease-in-out infinite" : "none" }}>
                              {prize.unlocked ? "🎉" : "🔒"}
                            </div>
                            <div style={{
                              fontSize: "clamp(18px,4vw,28px)", fontWeight: 900,
                              background: prize.unlocked ? "linear-gradient(90deg,#fbbf24,#f59e0b)" : "linear-gradient(90deg,#8b5cf6,#d946ef)",
                              backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1,
                            }}>
                              {Math.round(progressRatio * 100)}%
                            </div>
                          </div>
                        </div>

                        {/* Right info */}
                        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                          <div style={{
                            fontSize: "clamp(28px,6vw,56px)", fontWeight: 900, lineHeight: 1, marginBottom: 12,
                            background: "linear-gradient(90deg,#fbbf24,#f59e0b,#fbbf24)",
                            backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            filter: prize.unlocked ? "drop-shadow(0 0 20px rgba(251,191,36,.6))" : "none",
                          }}>£1,000</div>

                          {prize.unlocked ? (
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: "999px", background: "linear-gradient(135deg,rgba(34,197,94,.25),rgba(21,128,61,.2))", border: "2px solid rgba(34,197,94,.6)", marginBottom: 12 }}>
                              <Sparkles style={{ width: 18, height: 18, color: "#22c55e" }} />
                              <span style={{ fontSize: "clamp(11px,2.2vw,14px)", fontWeight: 800, color: "#22c55e", textTransform: "uppercase", letterSpacing: ".5px" }}>PRIZE ACTIVE!</span>
                            </div>
                          ) : (
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: "clamp(12px,2.5vw,16px)", fontWeight: 700, color: "#fcd34d", marginBottom: 6 }}>
                                {(prize.progress || 0).toLocaleString()} / {(prize.threshold || 1000).toLocaleString()} Paid Entries
                              </div>
                              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: "999px", background: "rgba(139,92,246,.2)", border: "1px solid rgba(139,92,246,.5)" }}>
                                <Target style={{ width: 12, height: 12, color: "#a78bfa", flexShrink: 0 }} />
                                <span style={{ fontSize: "clamp(10px,2vw,12px)", fontWeight: 700, color: "#a78bfa" }}>
                                  {((prize.threshold || 1000) - (prize.progress || 0)).toLocaleString()} more to unlock!
                                </span>
                              </div>
                            </div>
                          )}

                          <div style={{ fontSize: "clamp(10px,2vw,12px)", color: "#94a3b8", marginBottom: 10, lineHeight: 1.5 }}>
                            {cfg.sub}
                          </div>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: "999px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", fontSize: "clamp(10px,2vw,12px)", color: "#94a3b8", fontWeight: 600 }}>
                            <Clock style={{ width: 11, height: 11, flexShrink: 0 }} />
                            Resets in {countdown.days}d {countdown.hours}h {countdown.minutes}m
                          </div>
                        </div>
                      </div>

                    ) : (
                      /* DAILY / WEEKLY — sütun layout */
                      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(8px,2vw,12px)" }}>
                        <div style={{ fontSize: "clamp(36px,8vw,56px)", lineHeight: 1, animation: "float 3s ease-in-out infinite" }}>{cfg.emoji}</div>
                        <div style={{ fontSize: "clamp(20px,5vw,36px)", fontWeight: 900, lineHeight: 1, background: "linear-gradient(90deg,#a78bfa,#f0abfc)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                          {cfg.title}
                        </div>
                        <div style={{ fontSize: "clamp(11px,2.5vw,14px)", color: "#94a3b8", lineHeight: 1.5, maxWidth: 420, textAlign: "center" }}>{cfg.sub}</div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: "999px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", fontSize: "clamp(10px,2vw,12px)", color: "#94a3b8", fontWeight: 600 }}>
                          <Clock style={{ width: 12, height: 12, flexShrink: 0 }} />
                          Resets in {countdown.days}d {countdown.hours}h {countdown.minutes}m
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Stats */}
              <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(8px,2vw,14px)" }}>
                {[
                  { icon: <Users style={{ width: "clamp(16px,3vw,22px)", height: "clamp(16px,3vw,22px)", color: "#a78bfa", margin: "0 auto 5px" }} />, value: stats.total_players.toLocaleString(), label: "Players",   fg: "#a78bfa", bg: "rgba(139,92,246,.18)", border: "rgba(139,92,246,.5)", sub: "#c4b5fd" },
                  { icon: <Star   style={{ width: "clamp(16px,3vw,22px)", height: "clamp(16px,3vw,22px)", color: "#22c55e", margin: "0 auto 5px" }} />, value: stats.top_score.toLocaleString(),    label: "Top Score", fg: "#22c55e", bg: "rgba(34,197,94,.18)",  border: "rgba(34,197,94,.5)",  sub: "#86efac" },
                  { icon: <Target style={{ width: "clamp(16px,3vw,22px)", height: "clamp(16px,3vw,22px)", color: "#38bdf8", margin: "0 auto 5px" }} />, value: `${stats.avg_accuracy}%`,            label: "Avg Acc",   fg: "#38bdf8", bg: "rgba(56,189,248,.18)", border: "rgba(56,189,248,.5)", sub: "#7dd3fc" },
                ].map(({ icon, value, label, fg, bg, border, sub }) => (
                  <div key={label} style={{ padding: "clamp(10px,2.5vw,16px) clamp(8px,2vw,14px)", borderRadius: "12px", background: bg, border: `2px solid ${border}` }}>
                    {icon}
                    <div style={{ fontSize: "clamp(16px,4vw,26px)", fontWeight: 900, color: fg, lineHeight: 1, marginBottom: 3 }}>{value}</div>
                    <div style={{ fontSize: "clamp(8px,1.8vw,11px)", color: sub, fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* LOADING / EMPTY / LIST */}
            {loading ? (
              <div style={{ padding: "clamp(40px,10vw,80px) 0", textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", border: "4px solid rgba(139,92,246,.3)", borderTopColor: "#a78bfa", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                <p style={{ color: "#94a3b8" }}>Loading leaderboard...</p>
              </div>
            ) : players.length === 0 ? (
              <div style={{ padding: "clamp(40px,10vw,80px) 20px", textAlign: "center", borderRadius: "20px", border: "2px solid rgba(139,92,246,.3)", background: "rgba(15,23,42,.6)" }}>
                <Trophy style={{ width: 44, height: 44, color: "#64748b", margin: "0 auto 14px" }} />
                <p style={{ color: "#94a3b8" }}>No players yet. Be the first!</p>
              </div>
            ) : (
              <>
                {/* PODIUM */}
                <div className="podium-grid">

                  {/* 2nd */}
                  {top3[1] && (
                    <div className="animate-slide-up podium-2nd" style={{ animationDelay: ".1s" }}>
                      <div style={{ padding: "clamp(14px,3vw,24px)", borderRadius: "clamp(12px,3vw,20px)", border: "3px solid rgba(192,192,192,.6)", background: "linear-gradient(135deg,rgba(192,192,192,.16),rgba(156,163,175,.1))", backdropFilter: "blur(20px)", textAlign: "center", boxShadow: "0 0 30px rgba(192,192,192,.3)", transition: "transform .3s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                      >
                        <div style={{ position: "relative", width: "clamp(56px,12vw,80px)", height: "clamp(56px,12vw,80px)", margin: "0 auto clamp(10px,2vw,16px)", borderRadius: "50%", padding: 3, background: "linear-gradient(135deg,#d1d5db,#9ca3af)", boxShadow: "0 0 20px rgba(192,192,192,.5)" }}>
                          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", background: "#1e293b", overflow: "hidden" }}>
                            {top3[1].avatarUrl ? (
                              <Image src={top3[1].avatarUrl} alt={top3[1].name} fill sizes="80px" style={{ objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(22px,5vw,36px)" }}>🥈</div>
                            )}
                          </div>
                          <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", width: "clamp(22px,5vw,32px)", height: "clamp(22px,5vw,32px)", borderRadius: "50%", background: "linear-gradient(135deg,#d1d5db,#9ca3af)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #0f172a", color: "#0f172a", fontWeight: 900, fontSize: "clamp(10px,2.5vw,16px)" }}>2</div>
                        </div>
                        <h2 style={{ fontSize: "clamp(12px,2.5vw,16px)", fontWeight: 800, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                          {flagUrl(top3[1].country) && <img src={flagUrl(top3[1].country)!} alt={top3[1].country} style={{ width: 20, height: 15, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }} />}
                          {top3[1].name}
                        </h2>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 7px", borderRadius: "999px", background: `${top3[1].tierColor}20`, border: `1px solid ${top3[1].tierColor}60`, marginBottom: 8, fontSize: "clamp(8px,1.8vw,11px)" }}>
                          <span>{top3[1].tierIcon}</span><span style={{ color: top3[1].tierColor, fontWeight: 700 }}>{top3[1].tier}</span>
                        </div>
                        <div style={{ fontSize: "clamp(18px,4vw,28px)", fontWeight: 900, background: "linear-gradient(90deg,#d1d5db,#9ca3af)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 5 }}>{top3[1].score.toLocaleString()}</div>
                        <div style={{ fontSize: "clamp(9px,1.8vw,11px)", color: "#94a3b8" }}>{top3[1].accuracy}% acc</div>
                      </div>
                    </div>
                  )}

                  {/* 1st */}
                  {top3[0] && (
                    <div className="animate-slide-up podium-1st" style={{ animationDelay: ".2s" }}>
                      <div className="animate-glow" style={{ padding: "clamp(16px,3.5vw,28px)", borderRadius: "clamp(14px,4vw,24px)", border: "4px solid rgba(251,191,36,.8)", background: "linear-gradient(135deg,rgba(251,191,36,.2),rgba(245,158,11,.14))", backdropFilter: "blur(25px)", textAlign: "center", boxShadow: "0 0 50px rgba(251,191,36,.5)", transition: "transform .3s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-10px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                      >
                        <Crown className="animate-crown" style={{ width: "clamp(22px,5vw,40px)", height: "clamp(22px,5vw,40px)", color: "#fbbf24", margin: "0 auto clamp(8px,2vw,12px)" }} />
                        <div style={{ position: "relative", width: "clamp(68px,14vw,100px)", height: "clamp(68px,14vw,100px)", margin: "0 auto clamp(12px,2.5vw,20px)", borderRadius: "50%", padding: 4, background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 0 40px rgba(251,191,36,.7)" }}>
                          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", background: "#1e293b", overflow: "hidden" }}>
                            {top3[0].avatarUrl ? (
                              <Image src={top3[0].avatarUrl} alt={top3[0].name} fill sizes="100px" style={{ objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(28px,6vw,48px)" }}>🥇</div>
                            )}
                          </div>
                          <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", width: "clamp(26px,5.5vw,38px)", height: "clamp(26px,5.5vw,38px)", borderRadius: "50%", background: "linear-gradient(135deg,#fbbf24,#f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #0f172a", color: "#0f172a", fontWeight: 900, fontSize: "clamp(11px,2.5vw,18px)" }}>1</div>
                        </div>
                        <h2 style={{ fontSize: "clamp(14px,3vw,20px)", fontWeight: 900, marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          {flagUrl(top3[0].country) && <img src={flagUrl(top3[0].country)!} alt={top3[0].country} style={{ width: 22, height: 16, borderRadius: 2, objectFit: "cover", flexShrink: 0 }} />}
                          {top3[0].name}
                        </h2>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: "999px", background: `${top3[0].tierColor}25`, border: `2px solid ${top3[0].tierColor}`, marginBottom: 10, fontSize: "clamp(9px,2vw,12px)" }}>
                          <span>{top3[0].tierIcon}</span><span style={{ color: top3[0].tierColor, fontWeight: 800 }}>{top3[0].tier}</span>
                        </div>
                        <div style={{ fontSize: "clamp(22px,6vw,40px)", fontWeight: 900, background: "linear-gradient(90deg,#fbbf24,#f59e0b,#fbbf24)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>{top3[0].score.toLocaleString()}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, fontSize: "clamp(9px,2vw,12px)" }}>
                          <div><div style={{ color: "#22c55e", fontWeight: 700 }}>{top3[0].accuracy}%</div><div style={{ color: "#94a3b8", fontSize: "clamp(8px,1.5vw,10px)" }}>accuracy</div></div>
                          <div><div style={{ color: "#38bdf8", fontWeight: 700 }}>{top3[0].rounds}</div><div style={{ color: "#94a3b8", fontSize: "clamp(8px,1.5vw,10px)" }}>rounds</div></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3rd */}
                  {top3[2] && (
                    <div className="animate-slide-up podium-3rd" style={{ animationDelay: ".15s" }}>
                      <div style={{ padding: "clamp(14px,3vw,24px)", borderRadius: "clamp(12px,3vw,20px)", border: "3px solid rgba(217,119,6,.6)", background: "linear-gradient(135deg,rgba(217,119,6,.16),rgba(194,65,12,.1))", backdropFilter: "blur(20px)", textAlign: "center", boxShadow: "0 0 30px rgba(217,119,6,.3)", transition: "transform .3s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                      >
                        <div style={{ position: "relative", width: "clamp(56px,12vw,80px)", height: "clamp(56px,12vw,80px)", margin: "0 auto clamp(10px,2vw,16px)", borderRadius: "50%", padding: 3, background: "linear-gradient(135deg,#d97706,#c2410c)", boxShadow: "0 0 20px rgba(217,119,6,.5)" }}>
                          <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", background: "#1e293b", overflow: "hidden" }}>
                            {top3[2].avatarUrl ? (
                              <Image src={top3[2].avatarUrl} alt={top3[2].name} fill sizes="80px" style={{ objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(22px,5vw,36px)" }}>🥉</div>
                            )}
                          </div>
                          <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", width: "clamp(22px,5vw,32px)", height: "clamp(22px,5vw,32px)", borderRadius: "50%", background: "linear-gradient(135deg,#d97706,#c2410c)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #0f172a", color: "#0f172a", fontWeight: 900, fontSize: "clamp(10px,2.5vw,16px)" }}>3</div>
                        </div>
                        <h2 style={{ fontSize: "clamp(12px,2.5vw,16px)", fontWeight: 800, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                          {flagUrl(top3[2].country) && <img src={flagUrl(top3[2].country)!} alt={top3[2].country} style={{ width: 20, height: 15, borderRadius: 2, objectFit: "cover", flexShrink: 0 }} />}
                          {top3[2].name}
                        </h2>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 7px", borderRadius: "999px", background: `${top3[2].tierColor}20`, border: `1px solid ${top3[2].tierColor}60`, marginBottom: 8, fontSize: "clamp(8px,1.8vw,11px)" }}>
                          <span>{top3[2].tierIcon}</span><span style={{ color: top3[2].tierColor, fontWeight: 700 }}>{top3[2].tier}</span>
                        </div>
                        <div style={{ fontSize: "clamp(18px,4vw,28px)", fontWeight: 900, background: "linear-gradient(90deg,#d97706,#c2410c)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 5 }}>{top3[2].score.toLocaleString()}</div>
                        <div style={{ fontSize: "clamp(9px,1.8vw,11px)", color: "#94a3b8" }}>{top3[2].accuracy}% acc</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* RANKED PLAYERS */}
                {restPlayers.length > 0 && (
                  <div className="animate-slide-up" style={{ padding: "clamp(16px,4vw,28px)", borderRadius: "clamp(14px,3vw,22px)", border: "2px solid rgba(139,92,246,.5)", background: "linear-gradient(135deg,rgba(30,27,75,.98) 0%,rgba(15,23,42,.98) 100%)", boxShadow: "0 20px 60px rgba(0,0,0,.6)", backdropFilter: "blur(20px)", animationDelay: ".3s" }}>
                    <h2 style={{ fontSize: "clamp(14px,3.5vw,20px)", fontWeight: 900, marginBottom: "clamp(14px,3vw,20px)", display: "flex", alignItems: "center", gap: 8 }}>
                      <Sparkles style={{ width: 20, height: 20, color: "#a78bfa", flexShrink: 0 }} />
                      Ranked Players
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {restPlayers.map((player, idx) => (
                        <div key={player.id} className="animate-slide-up"
                          style={{ display: "flex", alignItems: "center", gap: "clamp(8px,2vw,14px)", padding: "clamp(8px,2vw,14px)", borderRadius: "12px", background: "rgba(139,92,246,.05)", border: "1px solid rgba(139,92,246,.2)", transition: "all .3s", animationDelay: `${Math.min(idx * 0.03, 0.4)}s` }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,.14)"; e.currentTarget.style.borderColor = "rgba(139,92,246,.5)"; e.currentTarget.style.transform = "translateX(4px)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "rgba(139,92,246,.05)"; e.currentTarget.style.borderColor = "rgba(139,92,246,.2)"; e.currentTarget.style.transform = "translateX(0)"; }}
                        >
                          <div style={{ width: "clamp(30px,6vw,42px)", height: "clamp(30px,6vw,42px)", borderRadius: "9px", flexShrink: 0, background: player.rank <= 10 ? "linear-gradient(135deg,#8b5cf6,#7c3aed)" : "rgba(139,92,246,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(10px,2vw,13px)", fontWeight: 900, color: "white", boxShadow: player.rank <= 10 ? "0 4px 10px rgba(139,92,246,.4)" : "none" }}>
                            #{player.rank}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                              {flagUrl(player.country) && <img src={flagUrl(player.country)!} alt={player.country} style={{ width: 20, height: 15, borderRadius: 2, objectFit: "cover", flexShrink: 0 }} />}
                              <span style={{ fontSize: "clamp(12px,2.5vw,15px)", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player.name}</span>
                              <span style={{ fontSize: "clamp(12px,2.5vw,14px)", flexShrink: 0 }}>{player.tierIcon}</span>
                            </div>
                            <div style={{ fontSize: "clamp(9px,1.8vw,11px)", color: "#22c55e" }}>{player.accuracy}% acc<span className="mobile-hide"> · {player.rounds} rounds</span></div>
                          </div>
                          <div style={{ padding: "clamp(5px,1.5vw,9px) clamp(8px,2vw,14px)", borderRadius: "9px", background: "rgba(139,92,246,.14)", border: "1px solid rgba(139,92,246,.3)", textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: "clamp(12px,3vw,18px)", fontWeight: 900, background: "linear-gradient(90deg,#a78bfa,#f0abfc)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{player.score.toLocaleString()}</div>
                            <div style={{ fontSize: "clamp(8px,1.5vw,10px)", color: "#64748b" }}>pts</div>
                          </div>
                          <ChevronRight className="mobile-hide" style={{ width: 16, height: 16, color: "#64748b", flexShrink: 0 }} />
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
