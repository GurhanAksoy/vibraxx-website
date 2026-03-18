"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { playMenuMusic, stopMenuMusic } from "@/lib/audioManager";
import Footer from "@/components/Footer";
import {
  CheckCircle, Crown, Trophy, Zap, Play, ArrowRight,
  Volume2, VolumeX, Sparkles, Gift, Star, Flame,
} from "lucide-react";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [user, setUser]               = useState<any>(null);
  const [credits, setCredits]         = useState<number | null>(null);
  const [packageInfo, setPackageInfo] = useState<{ rounds: number; name: string } | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [dots, setDots]               = useState(0);

  // ── Müzik ──
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

  // ── Kredi yüklenene kadar animasyonlu nokta ──
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => setDots(d => (d + 1) % 4), 500);
    return () => clearInterval(interval);
  }, [isLoading]);

  // ── Auth + kredi yükle ──
  useEffect(() => {
    const load = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push("/"); return; }
      setUser(authUser);

      // Session bilgisinden paket bilgisini al
      if (sessionId) {
        // Webhook async çalışıyor — biraz bekleyip kredileri çek
        await new Promise(r => setTimeout(r, 2000));
      }

      const { data: creditsData } = await supabase
        .from("v2_user_credits")
        .select("paid_credits, bonus_credits, free_day_utc, free_used")
        .eq("user_id", authUser.id)
        .single();

      if (creditsData) {
        const today = new Date().toISOString().split("T")[0];
        const freeCredit = (creditsData.free_day_utc !== today || !creditsData.free_used) ? 1 : 0;
        setCredits((creditsData.paid_credits || 0) + (creditsData.bonus_credits || 0) + freeCredit);
      }

      setIsLoading(false);
    };
    load();
  }, [router, sessionId]);

  // ── Realtime kredi güncelleme ──
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`success-credits-${user.id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "v2_user_credits",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const d = payload.new as any;
        const today = new Date().toISOString().split("T")[0];
        const freeCredit = (d.free_day_utc !== today || !d.free_used) ? 1 : 0;
        setCredits((d.paid_credits || 0) + (d.bonus_credits || 0) + freeCredit);
        setIsLoading(false);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  return (
    <>
      <style jsx global>{`
        :root { color-scheme: dark; background-color: #020817; }
        * { box-sizing: border-box; }
        body { background: #020817; margin: 0; padding: 0; overflow-x: hidden; }

        @keyframes float    { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes glow     { 0%,100% { box-shadow: 0 0 20px rgba(251,191,36,.4); } 50% { box-shadow: 0 0 50px rgba(251,191,36,.8); } }
        @keyframes shimmer  { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes slideUp  { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes scaleIn  { from { transform: scale(.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes pulse-slow { 0%,100% { opacity: .5; } 50% { opacity: .9; } }
        @keyframes badge-shine { 0% { left: -100%; } 50%,100% { left: 100%; } }
        @keyframes confetti { 0% { transform: translateY(-10px) rotate(0deg); opacity: 1; } 100% { transform: translateY(80px) rotate(360deg); opacity: 0; } }
        @keyframes crown-bounce { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(5deg); } }

        .animate-float      { animation: float      4s ease-in-out infinite; }
        .animate-glow       { animation: glow       2s ease-in-out infinite; }
        .animate-shimmer    { background-size: 200% 100%; animation: shimmer 3s linear infinite; }
        .animate-slide-up   { animation: slideUp   0.5s ease-out both; }
        .animate-scale-in   { animation: scaleIn   0.4s ease-out both; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-crown      { animation: crown-bounce 2s ease-in-out infinite; }

        .success-container {
          min-height: 100vh;
          background: #020817;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .success-header {
          position: sticky; top: 0; z-index: 50;
          border-bottom: 1px solid rgba(255,255,255,.1);
          backdrop-filter: blur(20px);
          background: rgba(15,23,42,.92);
        }
        .success-header-inner {
          max-width: 900px; margin: 0 auto;
          padding: 0 clamp(16px,4vw,24px);
          height: clamp(64px,12vw,80px);
          display: flex; align-items: center; justify-content: space-between;
        }

        .success-main {
          max-width: 760px; margin: 0 auto;
          padding: clamp(40px,8vw,72px) clamp(16px,4vw,24px) 0;
        }

        .success-hero {
          text-align: center;
          margin-bottom: clamp(32px,6vw,48px);
          animation: slideUp .5s ease-out both;
        }

        .success-check {
          width: clamp(80px,16vw,110px);
          height: clamp(80px,16vw,110px);
          margin: 0 auto clamp(20px,4vw,28px);
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 60px rgba(34,197,94,.6), 0 0 120px rgba(34,197,94,.2);
          position: relative;
        }
        .success-check::before {
          content: ''; position: absolute; inset: -8px; border-radius: 50%;
          background: rgba(34,197,94,.15); animation: pulse-slow 2s ease-in-out infinite;
        }

        .success-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 20px; border-radius: 999px;
          background: linear-gradient(135deg,rgba(251,191,36,.18),rgba(245,158,11,.12));
          border: 2px solid rgba(251,191,36,.5);
          color: #fbbf24; font-size: clamp(11px,2.5vw,13px);
          font-weight: 800; text-transform: uppercase; letter-spacing: .1em;
          margin-bottom: clamp(16px,3vw,22px);
          position: relative; overflow: hidden;
        }
        .success-badge::before {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);
          animation: badge-shine 3s infinite;
        }

        .success-title {
          font-size: clamp(28px,6vw,48px); font-weight: 900;
          line-height: 1.15; margin-bottom: clamp(12px,3vw,18px);
          letter-spacing: -.02em;
        }
        .success-title-neon {
          background: linear-gradient(90deg,#7c3aed,#22d3ee,#f97316,#d946ef,#7c3aed);
          background-size: 250% 100%;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .success-subtitle {
          font-size: clamp(14px,3vw,17px); color: #94a3b8;
          max-width: 560px; margin: 0 auto; line-height: 1.65;
        }

        /* Credits card */
        .credits-card {
          padding: clamp(24px,5vw,36px);
          border-radius: clamp(18px,4vw,24px);
          background: linear-gradient(135deg,rgba(30,27,75,.98),rgba(15,23,42,.98));
          border: 2px solid rgba(251,191,36,.6);
          box-shadow: 0 0 60px rgba(251,191,36,.25), 0 20px 60px rgba(0,0,0,.5);
          margin-bottom: clamp(20px,4vw,28px);
          text-align: center;
          position: relative; overflow: hidden;
          animation: slideUp .5s ease-out .1s both;
        }
        .credits-card::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 0%,rgba(251,191,36,.12),transparent 65%);
          pointer-events: none;
        }

        /* Action buttons */
        .action-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(12px,3vw,18px);
          margin-bottom: clamp(20px,4vw,28px);
          animation: slideUp .5s ease-out .3s both;
        }
        @media (max-width: 480px) { .action-grid { grid-template-columns: 1fr; } }

        .action-btn {
          padding: clamp(14px,3.5vw,18px) clamp(16px,4vw,24px);
          border-radius: 14px; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 10px; font-weight: 800; font-size: clamp(14px,3vw,16px);
          transition: all .3s cubic-bezier(.4,0,.2,1);
          position: relative; overflow: hidden;
        }
        .action-btn-primary {
          background: linear-gradient(135deg,#7c3aed,#d946ef);
          color: white;
          box-shadow: 0 8px 30px rgba(124,58,237,.5);
        }
        .action-btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(124,58,237,.7);
        }
        .action-btn-secondary {
          background: linear-gradient(135deg,rgba(251,191,36,.15),rgba(245,158,11,.1));
          color: #fbbf24; border: 2px solid rgba(251,191,36,.4);
        }
        .action-btn-secondary:hover {
          transform: translateY(-3px);
          border-color: rgba(251,191,36,.7);
          box-shadow: 0 8px 24px rgba(251,191,36,.3);
        }

        /* Features */
        .features-card {
          padding: clamp(20px,4vw,28px);
          border-radius: clamp(16px,3vw,20px);
          background: linear-gradient(135deg,rgba(30,27,75,.98),rgba(15,23,42,.98));
          border: 2px solid rgba(139,92,246,.4);
          margin-bottom: clamp(20px,4vw,28px);
          animation: slideUp .5s ease-out .4s both;
        }
        .feature-item {
          display: flex; align-items: center; gap: 12px;
          padding: clamp(10px,2.5vw,14px);
          border-radius: 12px;
          background: rgba(139,92,246,.06);
          border: 1px solid rgba(139,92,246,.15);
          margin-bottom: 8px;
          transition: all .25s;
          font-size: clamp(13px,2.5vw,15px); color: #cbd5e1;
        }
        .feature-item:last-child { margin-bottom: 0; }
        .feature-item:hover {
          background: rgba(139,92,246,.14);
          border-color: rgba(139,92,246,.35);
          transform: translateX(4px);
        }

        @media (max-width: 640px) {
          .mobile-hide { display: none !important; }
          .action-grid { grid-template-columns: 1fr !important; }
          .success-main { padding-top: 32px !important; }
          .credits-card { padding: 20px 16px !important; }
          .features-card { padding: 16px !important; }
        }
      `}</style>

      <div className="success-container">
        {/* Neon orbs */}
        <div className="animate-float" style={{
          position: "fixed", top: 80, left: -40, width: 260, height: 260,
          borderRadius: "50%", background: "#22c55e", opacity: 0.12,
          filter: "blur(70px)", zIndex: 0, pointerEvents: "none",
        }} />
        <div className="animate-float" style={{
          position: "fixed", bottom: 40, right: -40, width: 260, height: 260,
          borderRadius: "50%", background: "#7c3aed", opacity: 0.15,
          filter: "blur(70px)", zIndex: 0, animationDelay: "2s", pointerEvents: "none",
        }} />

        {/* Header */}
        <header className="success-header">
          <div className="success-header-inner">
            <div
              onClick={() => router.push("/")}
              style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            >
              <div style={{
                position: "relative", width: "clamp(48px,10vw,80px)", height: "clamp(48px,10vw,80px)",
                borderRadius: "9999px", padding: 4,
                background: "radial-gradient(circle at 0 0,#7c3aed,#d946ef)",
                boxShadow: "0 0 24px rgba(124,58,237,.6)", flexShrink: 0,
              }}>
                <div style={{
                  width: "100%", height: "100%", borderRadius: "9999px",
                  background: "#020817", display: "flex", alignItems: "center",
                  justifyContent: "center", overflow: "hidden",
                }}>
                  <Image src="/images/logo.png" alt="VibraXX" fill sizes="80px" style={{ objectFit: "contain", padding: "18%" }} />
                </div>
              </div>
              <span className="mobile-hide" style={{
                fontSize: 13, color: "#c4b5fd",
                textTransform: "uppercase", letterSpacing: "0.14em",
              }}>Live Quiz Arena</span>
            </div>

            <button
              onClick={toggleMusic}
              style={{
                padding: 9, borderRadius: 12, border: "1px solid rgba(148,163,253,.22)",
                background: "rgba(2,6,23,.9)", display: "inline-flex",
                alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
            >
              {isPlaying
                ? <Volume2 style={{ width: 18, height: 18, color: "#a78bfa" }} />
                : <VolumeX style={{ width: 18, height: 18, color: "#6b7280" }} />
              }
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="success-main" style={{ position: "relative", zIndex: 1 }}>

          {/* Hero */}
          <div className="success-hero">
            <div className="success-check animate-glow">
              <CheckCircle style={{ width: "clamp(40px,8vw,56px)", height: "clamp(40px,8vw,56px)", color: "white", strokeWidth: 2.5 }} />
            </div>

            <div className="success-badge">
              <Sparkles style={{ width: 14, height: 14 }} />
              Payment Successful!
            </div>

            <h1 className="success-title">
              <span className="success-title-neon">You're In. The Arena Awaits.</span>
            </h1>

            <p className="success-subtitle">
              Get ready to compete in the Global Live Quiz.
            </p>
            <p style={{
              fontSize: "clamp(14px,3vw,17px)",
              fontWeight: 700, marginTop: 8,
              textAlign: "center", whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis",
              maxWidth: "100%", padding: "0 16px",
            }}>
              <strong style={{ color: "#fbbf24" }}>Compete for up to £1,000.</strong>{" "}
              <strong style={{ color: "#a78bfa" }}>Skill Wins. Not Luck.*</strong>
            </p>
            <div style={{
              fontSize: "clamp(10px,2vw,12px)", color: "#475569",
              marginTop: 6, fontStyle: "italic", textAlign: "center",
            }}>
              *Terms & Conditions apply.
            </div>
          </div>

          {/* Credits Card */}
          <div className="credits-card animate-glow">
            <div style={{ position: "relative", zIndex: 1 }}>
              <Crown className="animate-crown" style={{
                width: "clamp(28px,6vw,40px)", height: "clamp(28px,6vw,40px)",
                color: "#fbbf24", margin: "0 auto 16px", display: "block",
              }} />

              <div style={{
                fontSize: "clamp(11px,2.5vw,13px)", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: ".15em",
                color: "#6b7280", marginBottom: 8,
              }}>
                Your Rounds Available
              </div>

              {isLoading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    border: "3px solid rgba(251,191,36,.3)", borderTopColor: "#fbbf24",
                    animation: "spin 1s linear infinite",
                  }} />
                  <span style={{ color: "#94a3b8", fontSize: 16 }}>
                    Loading{"...".slice(0, dots + 1)}
                  </span>
                </div>
              ) : (
                <div style={{
                  fontSize: "clamp(48px,12vw,72px)", fontWeight: 900, lineHeight: 1,
                  background: "linear-gradient(90deg,#fbbf24,#f59e0b,#fbbf24)",
                  backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  marginBottom: 8,
                }}>
                  {credits ?? 0}
                </div>
              )}

              <div style={{ fontSize: "clamp(13px,3vw,16px)", color: "#94a3b8", fontWeight: 500 }}>
                Ready for upcoming live rounds
              </div>

              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                marginTop: 16, padding: "6px 14px", borderRadius: 999,
                background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.4)",
                fontSize: 12, color: "#4ade80", fontWeight: 700,
              }}>
                <div className="animate-pulse-slow" style={{
                  width: 7, height: 7, borderRadius: "50%", background: "#22c55e",
                }} />
                Rounds credited to your account
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-grid">
            <button className="action-btn action-btn-primary" onClick={() => router.push("/lobby")}>
              <Play style={{ width: 18, height: 18, fill: "white" }} />
              Enter Live Arena
              <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
            <button className="action-btn action-btn-secondary" onClick={() => router.push("/leaderboard")}>
              <Trophy style={{ width: 18, height: 18 }} />
              View Leaderboard
            </button>
          </div>

          {/* What's Next */}
          <div className="features-card">
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 16,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg,#f97316,#ea580c)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 16px rgba(249,115,22,.5)",
              }}>
                <Flame style={{ width: 20, height: 20, color: "white" }} />
              </div>
              <h2 style={{ fontSize: "clamp(16px,3.5vw,20px)", fontWeight: 800 }}>
                What Happens Next
              </h2>
            </div>

            {[
              { icon: Zap,    color: "#fbbf24", text: "Live rounds every 5 minutes — don't miss your next round" },
              { icon: Trophy, color: "#a78bfa", text: "Climb daily, weekly & monthly leaderboards" },
              { icon: Star,   color: "#22d3ee", text: "Improve your accuracy and ranking" },
              { icon: Gift,   color: "#22c55e", text: "1 free round credited daily (midnight UTC)" },
              { icon: Crown,  color: "#f97316", text: "Climb the ranks. Compete with the best." },
            ].map(({ icon: Icon, color, text }, i) => (
              <div key={i} className="feature-item">
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: `${color}20`, border: `1px solid ${color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon style={{ width: 16, height: 16, color }} />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Prize info */}
          <div style={{
            padding: "clamp(16px,4vw,24px)",
            borderRadius: "clamp(14px,3vw,20px)",
            background: "linear-gradient(135deg,rgba(251,191,36,.12),rgba(245,158,11,.08))",
            border: "1px solid rgba(251,191,36,.3)",
            marginBottom: "clamp(20px,4vw,28px)",
            animation: "slideUp .5s ease-out .5s both",
            textAlign: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
              <Trophy style={{ width: 20, height: 20, color: "#fbbf24", flexShrink: 0 }} />
              <span style={{ fontSize: "clamp(14px,3vw,16px)", fontWeight: 800, color: "#fbbf24" }}>
                Monthly Prize Pool
              </span>
            </div>
            <p style={{ fontSize: "clamp(12px,2.5vw,14px)", color: "#94a3b8", lineHeight: 1.7, margin: "0 auto", maxWidth: 560 }}>
              The up to <strong style={{ color: "#fbbf24" }}>£1,000 prize pool</strong> activates once the monthly paid entry threshold is reached.
              Participation fees are non-refundable as the quiz service is fully provided regardless of prize pool activation.{" "}
              <strong style={{ color: "#cbd5e1" }}>Terms & Conditions apply.</strong>
            </p>
            <p style={{ fontSize: "clamp(10px,2vw,12px)", color: "#334155", marginTop: 10, fontStyle: "italic" }}>
              Skill-based competition. No element of chance.
            </p>
          </div>

        </main>

        <Footer />
      </div>
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh", background: "#020817",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: "50%",
          border: "4px solid rgba(139,92,246,.3)", borderTopColor: "#a78bfa",
          animation: "spin 1s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
