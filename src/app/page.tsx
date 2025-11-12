"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { playMenuMusic, stopMenuMusic } from "@/lib/audioManager";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Tek tip sayı gösterimi
const fmt = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });

export default function HomePage() {
  const router = useRouter();

  // UI giriş efekti: orbları ilk anda gizle, 300ms sonra yumuşakça göster
  const [showOrbs, setShowOrbs] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowOrbs(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // State’ler
  const [isPlaying, setIsPlaying] = useState(false);
  const [nextRound, setNextRound] = useState(847);
  const [activePlayers, setActivePlayers] = useState(15234);
  const [user, setUser] = useState<any>(null);

  // LIVE STATS — sadece client’ta çalışır
  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = setInterval(() => {
      setNextRound((prev) => (prev > 0 ? prev - 1 : 900));
      setActivePlayers((prev) => {
        const delta = Math.floor(Math.random() * 10 - 5);
        const next = prev + delta;
        return next < 0 ? 0 : next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // AUTH dinleyici — sadece client’ta
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);
    };
    loadUser();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // MÜZİK
  const toggleMusic = () => {
    if (isPlaying) {
      stopMenuMusic();
      setIsPlaying(false);
    } else {
      playMenuMusic();
      setIsPlaying(true);
    }
  };
  useEffect(() => {
    if (typeof window === "undefined") return;
    return () => {
      stopMenuMusic();
    };
  }, []);

  // AUTH AKSİYONLARI
  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // QUIZ BAŞLAT (önce login → lobby)
  const handleStartQuiz = async () => {
    const { data } = await supabase.auth.getSession();
    const currentUser = data.session?.user;

    if (!currentUser) {
      await handleSignIn();
      return;
    }
    router.push("/lobby");
  };

  // ÜCRETSİZ QUIZ (günde 1)
  const handleStartFreeQuiz = async () => {
    const { data } = await supabase.auth.getSession();
    const currentUser = data.session?.user;

    if (!currentUser) {
      await handleSignIn();
      return;
    }
    router.push("/free");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // MOCK CHAMPIONS
  const champions = [
    {
      period: "Daily",
      name: "Sarah Chen",
      score: 2840,
      gradient: "linear-gradient(to bottom right, #eab308, #f97316)",
      color: "#facc15",
      icon: Crown,
    },
    {
      period: "Weekly",
      name: "Alex Kumar",
      score: 18250,
      gradient: "linear-gradient(to bottom right, #8b5cf6, #d946ef)",
      color: "#c084fc",
      icon: Trophy,
    },
    {
      period: "Monthly",
      name: "Emma Rodriguez",
      score: 125600,
      gradient: "linear-gradient(to bottom right, #3b82f6, #06b6d4)",
      color: "#22d3ee",
      icon: Sparkles,
    },
  ];

  return (
    <>
      <style jsx global>{`
        :root {
          color-scheme: dark;
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
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-shimmer { background-size: 200% 100%; animation: shimmer 3s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }

        .vx-container { max-width: 1280px; margin: 0 auto; padding: 0 16px; }
        @media (min-width: 640px) { .vx-container { padding: 0 24px; } }

        .vx-header {
          position: relative;
          z-index: 50;
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
          .vx-header-inner { justify-content: center; }
          .vx-header-right { justify-content: center; }
        }

        .vx-livebar {
          z-index: 40;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(16px);
          background: linear-gradient(90deg, rgba(139, 92, 246, 0.12), rgba(236, 72, 153, 0.08));
          font-size: 12px;
        }
        .vx-livebar-inner {
          display: flex; flex-wrap: wrap; gap: 10px;
          justify-content: center; align-items: center;
          padding: 8px 16px;
        }
        @media (min-width: 640px) { .vx-livebar-inner { font-size: 14px; padding: 10px 24px; } }

        .vx-hero { padding: 72px 16px 80px; text-align: center; }
        @media (min-width: 640px) { .vx-hero { padding: 96px 24px 96px; } }

        .vx-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 16px; border-radius: 9999px;
          border: 1px solid rgba(139, 92, 246, 0.35);
          background: rgba(15, 23, 42, 0.9); color: #c4b5fd;
          font-size: 12px; margin-bottom: 24px; backdrop-filter: blur(10px);
        }
        @media (min-width: 640px) { .vx-hero-badge { padding: 8px 20px; font-size: 14px; margin-bottom: 32px; } }

        .vx-hero-title { font-size: clamp(26px, 6vw, 42px); font-weight: 800; line-height: 1.2; margin-bottom: 18px; letter-spacing: -0.03em; }
        .vx-hero-neon {
          display: inline-block;
          background: linear-gradient(90deg, #7c3aed, #22d3ee, #f97316, #d946ef, #7c3aed);
          background-size: 250% 100%;
          -webkit-background-clip: text;
          color: transparent;
          animation: shimmer 4s linear infinite;
          text-shadow: 0 0 14px rgba(124, 58, 237, 0.45);
        }
        .vx-hero-subtitle {
          font-size: 16px; color: #94a3b8; max-width: 640px; margin: 0 auto 32px; line-height: 1.6;
        }
        @media (min-width: 640px) { .vx-hero-subtitle { font-size: 18px; margin-bottom: 40px; } }

        .vx-cta-wrap {
          display: flex; flex-direction: column; gap: 12px; align-items: center; justify-content: center; margin-bottom: 48px;
        }
        @media (min-width: 640px) { .vx-cta-wrap { margin-bottom: 64px; flex-direction: row; } }
        .vx-cta-btn {
          position: relative; padding: 14px 28px; border-radius: 14px; border: none; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          font-weight: 700; font-size: 16px; overflow: hidden; box-shadow: 0 20px 40px -16px rgba(139, 92, 246, 0.6);
        }
        @media (min-width: 640px) { .vx-cta-btn { padding: 18px 34px; font-size: 18px; } }

        .vx-stats-grid {
          display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 64px;
        }
        @media (min-width: 640px) { .vx-stats-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin-bottom: 80px; } }

        .vx-stat-card {
          position: relative; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center;
          border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(9, 9, 13, 0.9); backdrop-filter: blur(18px);
          min-height: 120px; padding: 1.5rem;
        }
        @media (min-width: 640px) { .vx-stat-card { min-height: 150px; padding: 1.75rem; } }
        .vx-stat-label { color: #94a3b8; font-size: 13px; }
        .vx-stat-value { font-weight: 800; font-size: 24px; }
        @media (min-width: 640px) { .vx-stat-value { font-size: 28px; } }

        .vx-champions-title {
          font-size: 24px; font-weight: 700; margin-bottom: 24px;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        @media (min-width: 640px) { .vx-champions-title { font-size: 32px; margin-bottom: 32px; } }

        .vx-champions-grid {
          display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 56px;
        }
        @media (min-width: 768px) { .vx-champions-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; } }

        .vx-champ-card {
          position: relative; padding: 22px; border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(9, 9, 13, 0.96); backdrop-filter: blur(18px);
          text-align: center;
        }
        @media (min-width: 640px) { .vx-champ-card { padding: 26px; } }

        .vx-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(9, 9, 13, 0.96); backdrop-filter: blur(16px);
          padding: 20px 16px 28px; text-align: center; color: #64748b; font-size: 12px;
        }
        @media (min-width: 640px) { .vx-footer { font-size: 13px; padding: 24px 24px 32px; } }
        .vx-footer-links { margin-top: 10px; display: flex; gap: 18px; justify-content: center; flex-wrap: wrap; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom right, #020817, #020817)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Neon Orbs: ilk render’da gizli, 300ms sonra fade-in */}
        {showOrbs && (
          <div style={{ opacity: showOrbs ? 1 : 0, transition: "opacity 0.8s ease" }}>
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
                opacity: 0.25,
                filter: "blur(70px)",
                zIndex: 0,
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
                opacity: 0.2,
                filter: "blur(70px)",
                zIndex: 0,
                animationDelay: "2s",
              }}
            />
          </div>
        )}

        {/* HEADER */}
        <header className="vx-header">
          <div className="vx-container">
            <div className="vx-header-inner">
              {/* Logo + Title */}
              <div
                style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 72,
                    height: 72,
                    borderRadius: "9999px",
                    padding: 3,
                    background: "radial-gradient(circle at 0 0,#7c3aed,#d946ef)",
                    boxShadow: "0 0 26px rgba(124,58,237,0.55)",
                    flexShrink: 0,
                  }}
                >
                  <div
                    className="animate-glow"
                    style={{
                      position: "absolute",
                      inset: -4,
                      borderRadius: "9999px",
                      background: "radial-gradient(circle,#a855f7,transparent)",
                      opacity: 0.4,
                      filter: "blur(8px)",
                    }}
                  />
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      borderRadius: "9999px",
                      backgroundColor: "#020817", // logo transparansı için koyu zemin
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src="/images/logo.png"
                      alt="VibraXX"
                      fill
                      sizes="72px"
                      style={{ objectFit: "contain" }}
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

              {/* Sağ kontrol paneli */}
              <div className="vx-header-right">
                {/* Müzik */}
                <button
                  onClick={toggleMusic}
                  aria-label="Toggle music"
                  style={{
                    padding: 9,
                    borderRadius: 12,
                    border: "1px solid rgba(148,163,253,0.22)",
                    background: "rgba(2,6,23,0.9)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {isPlaying ? (
                    <Volume2 style={{ width: 18, height: 18, color: "#a78bfa" }} />
                  ) : (
                    <VolumeX style={{ width: 18, height: 18, color: "#6b7280" }} />
                  )}
                </button>

                {/* Leaderboard */}
                <button
                  onClick={() => router.push("/leaderboard")}
                  className="vx-hide-mobile"
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
                  }}
                >
                  <Trophy style={{ width: 14, height: 14, color: "#a78bfa" }} />
                  Leaderboard
                </button>

                {/* Auth */}
                {user ? (
                  <>
                    <div
                      className="vx-hide-mobile"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "4px 10px",
                        borderRadius: 9999,
                        background: "rgba(9,9,13,0.96)",
                        border: "1px solid rgba(148,163,253,0.26)",
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
                          alt="Profile"
                          width={20}
                          height={20}
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#e5e7eb",
                          maxWidth: 120,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user?.user_metadata?.full_name || "Player"}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
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
                    onClick={handleSignIn}
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
                    <span style={{ position: "relative", zIndex: 10 }}>
                      Sign in with Google
                    </span>
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
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "9999px",
                    background: "#ef4444",
                  }}
                />
                <span style={{ color: "#f97316", fontWeight: 600 }}>LIVE</span>
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
                  {fmt.format(activePlayers)}
                </span>
                <span>players online</span>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#cbd5e1",
                }}
              >
                <Sparkles style={{ width: 14, height: 14, color: "#f0abfc" }} />
                <span>Next round</span>
                <span
                  style={{
                    fontWeight: 700,
                    background: "linear-gradient(to right,#a78bfa,#f0abfc)",
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

        {/* HERO + CONTENT */}
        <main className="vx-hero">
          <div className="vx-container">
            {/* Badge */}
            <div className="vx-hero-badge">
              <Sparkles style={{ width: 14, height: 14, color: "#c4b5fd" }} />
              Global Competition · Every 15 Minutes ·
              <strong style={{ marginLeft: 6 }}>£1000 Monthly Prize</strong>
            </div>

            {/* Title */}
            <h1 className="vx-hero-title">
              <span className="vx-hero-neon">The Next Generation Live Quiz</span>
            </h1>

            {/* Subtitle */}
            <p className="vx-hero-subtitle">
              Compete live with the world. Rise on the leaderboard.
            </p>

            {/* CTA */}
            <div className="vx-cta-wrap">
              <button className="vx-cta-btn" onClick={handleStartQuiz}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to right,#7c3aed,#d946ef)",
                  }}
                />
                <Play style={{ position: "relative", zIndex: 10, width: 20, height: 20 }} />
                <span style={{ position: "relative", zIndex: 10 }}>
                  Start Live Quiz (£1 / Round)
                </span>
                <ArrowRight
                  style={{ position: "relative", zIndex: 10, width: 20, height: 20 }}
                />
              </button>

              <button className="vx-cta-btn" onClick={handleStartFreeQuiz}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to right,#22c55e,#16a34a)",
                  }}
                />
                <Play style={{ position: "relative", zIndex: 10, width: 20, height: 20 }} />
                <span style={{ position: "relative", zIndex: 10 }}>Start Free Quiz</span>
                <ArrowRight
                  style={{ position: "relative", zIndex: 10, width: 20, height: 20 }}
                />
              </button>
            </div>

            {/* Paket metni */}
            <p className="vx-hero-subtitle" style={{ marginTop: -10, opacity: 0.95 }}>
              <strong>1 Round = £1</strong> · <strong>12 Rounds = £10 Bundle</strong>
            </p>

            {/* Stats */}
            <div className="vx-stats-grid">
              <div className="vx-stat-card">
                <Globe style={{ width: 22, height: 22, color: "#a78bfa", marginBottom: 4 }} />
                <div className="vx-stat-value" style={{ color: "#a78bfa" }}>
                  15K+
                </div>
                <div className="vx-stat-label">Active Players</div>
              </div>
              <div className="vx-stat-card">
                <Sparkles
                    style={{ width: 22, height: 22, color: "#f0abfc", marginBottom: 4 }}
                />
                <div className="vx-stat-value" style={{ color: "#f0abfc" }}>
                  2.8M+
                </div>
                <div className="vx-stat-label">Questions Answered</div>
              </div>
              <div className="vx-stat-card">
                <Zap style={{ width: 22, height: 22, color: "#22d3ee", marginBottom: 4 }} />
                <div className="vx-stat-value" style={{ color: "#22d3ee" }}>
                  96/day
                </div>
                <div className="vx-stat-label">Live Rounds</div>
              </div>
            </div>

            {/* Champions */}
            <h2 className="vx-champions-title">
              <Crown style={{ width: 24, height: 24, color: "#facc15" }} />
              Top Champions
            </h2>

            <div className="vx-champions-grid">
              {champions.map((champ, i) => {
                const Icon = champ.icon;
                return (
                  <div key={i} className="vx-champ-card">
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        margin: "0 auto 18px",
                        borderRadius: 18,
                        background: champ.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
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
                      {champ.period} Champion
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                      {champ.name}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: champ.color }}>
                      {fmt.format(champ.score)} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="vx-footer">
          <div>© 2025 VibraXX · Powered by Sermin Limited</div>
          <div className="vx-footer-links">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/support">Support</a>
          </div>
        </footer>
      </div>
    </>
  );
}
