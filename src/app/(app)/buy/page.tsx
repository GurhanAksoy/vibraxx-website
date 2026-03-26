"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import AnnouncementModal from "@/components/AnnouncementModal";
import Image from "next/image";
import {
  Crown, Zap, TrendingUp, Users, Trophy, Sparkles,
  Target, Volume2, VolumeX, Shield, Percent, Gift,
  Star, Clock, BarChart3, ShoppingCart, CheckCircle2,
  Lock, Rocket,
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface PrizeData {
  prize: {
    type: "money" | "credits";
    amount: number;
    label: string;
    sublabel: string;
    unlocked: boolean | null;
    progress: number;
    threshold: number | null;
  };
  countdown: { days: number; hours: number; minutes: number };
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

// Para birimi tespiti — locale + timezone birlikte kullan
// handlePurchase dışına çıkarıldı: her çağrıda yeniden tanımlanmasın
const detectCurrency = (): string => {
  try {
    const locale   = navigator.language || "en-GB";
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (locale.startsWith("en-AU") || timezone.startsWith("Australia"))                                                                           return "AUD";
    if (locale.startsWith("en-CA") || timezone.startsWith("America/Toronto")   || timezone.startsWith("America/Vancouver"))                       return "CAD";
    if (locale.startsWith("en-US") || timezone.startsWith("America/New_York")  || timezone.startsWith("America/Los_Angeles") || timezone.startsWith("America/Chicago")) return "USD";
    if (["de","fr","it","es","nl","pt","fi","el"].some(l => locale.startsWith(l)))                                                                return "EUR";
    if (locale.startsWith("en-GB") || timezone.startsWith("Europe/London"))                                                                       return "GBP";
    return "GBP";
  } catch {
    return "GBP";
  }
};

// ─────────────────────────────────────────────
// PACKAGE CONFIG  (no prices — Stripe handles)
// ─────────────────────────────────────────────

const packages = [
  {
    id: "single",
    name: "Starter Pack",
    rounds: 3,
    popular: false,
    icon: Zap,
    badge: null,
    tagline: "Get started",
    features: [
      { icon: Zap,        text: "3 Quiz Rounds",        highlight: false },
      { icon: Target,     text: "15 Questions Each",     highlight: false },
      { icon: Rocket,     text: "Instant Access",        highlight: true  },
      { icon: BarChart3,  text: "Leaderboard Entry",     highlight: false },
      { icon: TrendingUp, text: "Score Tracking",        highlight: false },
    ],
    description: "Jump in with 3 rounds and start competing",
    color: {
      border:  "rgba(139,92,246,0.5)",
      glow:    "rgba(139,92,246,0.4)",
      iconBg:  "linear-gradient(135deg,#7c3aed,#d946ef)",
    },
  },
  {
    id: "bundle",
    name: "Champion Bundle",
    rounds: 30,
    popular: true,
    icon: Crown,
    badge: "🔥 SAVE 40% 🔥",
    tagline: "Best Value",
    features: [
      { icon: Trophy,     text: "30 Quiz Rounds",          highlight: true  },
      { icon: Percent,    text: "40% Savings",              highlight: true  },
      { icon: Target,     text: "450 Questions Total",      highlight: false },
      { icon: Star,       text: "Priority Support",         highlight: false },
      { icon: BarChart3,  text: "Extended Statistics",      highlight: false },
      { icon: Crown,      text: "Champion Badge",           highlight: true  },
      { icon: Users,      text: "Community Access",         highlight: false },
      { icon: Gift,       text: "Monthly Prize Entry",      highlight: true  },
    ],
    description: "Ultimate package for serious competitors",
    color: {
      border:  "rgba(251,191,36,0.6)",
      glow:    "rgba(251,191,36,0.5)",
      iconBg:  "linear-gradient(135deg,#fbbf24,#f59e0b)",
    },
  },
];

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function BuyPage() {
  const router = useRouter();

  const [user,                setUser]                = useState<any>(null);
  const [liveCredits,         setLiveCredits]         = useState(0);
  const [prizeData,           setPrizeData]           = useState<PrizeData | null>(null);
  const [isLoading,           setIsLoading]           = useState(true);
  const [processingPackageId, setProcessingPackageId] = useState<string | null>(null);
  const [isMusicPlaying,      setIsMusicPlaying]      = useState(false);
  const [hasInteracted,       setHasInteracted]       = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Music — init ───────────────────────────
  useEffect(() => {
    const audio = new Audio("/sounds/vibraxx.mp3");
    audio.loop = true; audio.volume = 0.3;
    audioRef.current = audio;
    if (localStorage.getItem("vibraxx_music_enabled") === "true") setIsMusicPlaying(true);
    return () => { audioRef.current?.pause(); audioRef.current = null; };
  }, []);

  // Music — first interaction gate
  // { once: true } kullanılıyor, hasInteracted dep gereksiz — kaldırıldı
  useEffect(() => {
    const onFirst = () => {
      setHasInteracted(true);
      if (localStorage.getItem("vibraxx_music_enabled") !== "false" && audioRef.current)
        audioRef.current.play().catch(() => {});
    };
    document.addEventListener("pointerdown", onFirst, { once: true });
    return () => document.removeEventListener("pointerdown", onFirst);
  }, []);

  // Music — play/pause sync
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

  // ── Fetch ──────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}/auth/callback?redirect=/buy` },
        });
        return;
      }
      setUser(authUser);

      const { data: creditsData } = await supabase
        .from("v2_user_credits")
        .select("paid_credits, bonus_credits")
        .eq("user_id", authUser.id)
        .single();
      setLiveCredits((creditsData?.paid_credits || 0) + (creditsData?.bonus_credits || 0));

      const { data: lb, error: lbErr } = await supabase.rpc("get_leaderboard_data", { p_tab: "monthly" });
      if (!lbErr && lb) setPrizeData({ prize: lb.prize, countdown: lb.countdown });

      setIsLoading(false);
    };
    loadData();
  }, []);

  // ── Realtime ───────────────────────────────
  // prizeData dep kaldırıldı: channel'ı her prize güncellemesinde yeniden kuruyordu
  useEffect(() => {
    if (!user?.id) return;

    const refreshPrize = async () => {
      const { data: lb, error } = await supabase.rpc("get_leaderboard_data", { p_tab: "monthly" });
      if (!error && lb) setPrizeData({ prize: lb.prize, countdown: lb.countdown });
    };

    const refreshCredits = async () => {
      const { data } = await supabase
        .from("v2_user_credits")
        .select("paid_credits, bonus_credits")
        .eq("user_id", user.id)
        .single();
      if (data) setLiveCredits((data.paid_credits || 0) + (data.bonus_credits || 0));
    };

    const purchaseCh = supabase
      .channel("buy-page-purchases")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "v2_round_participants" }, refreshPrize)
      .subscribe();

    const creditCh = supabase
      .channel(`buy-page-credits-${user.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "v2_user_credits", filter: `user_id=eq.${user.id}` }, refreshCredits)
      .subscribe();

    return () => {
      supabase.removeChannel(purchaseCh);
      supabase.removeChannel(creditCh);
    };
  }, [user?.id]);

  // ── Purchase ───────────────────────────────
  const handlePurchase = async (pkg: typeof packages[0]) => {
    if (!user) { router.push("/"); return; }
    setProcessingPackageId(pkg.id);
    try {
      const currency = detectCurrency();
      const res  = await fetch("/api/create-checkout-session", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ package: pkg.id, user_id: user.id, currency }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error("No checkout URL");
    } catch {
      alert("Failed to process purchase. Please try again.");
      setProcessingPackageId(null);
    }
  };

  // ── Loading ────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a,#1e1b4b)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 52, height: 52, border: "4px solid rgba(139,92,246,.3)", borderTopColor: "#8b5cf6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  const CIRCUMFERENCE = 2 * Math.PI * 85;
  const progressRatio = Math.min((prizeData?.prize?.progress || 0) / (prizeData?.prize?.threshold || 1000), 1);
  const dashOffset    = CIRCUMFERENCE * (1 - progressRatio);
  const isUnlocked    = prizeData?.prize?.unlocked === true;

  return (
    <>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow-x: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes glow    { 0%,100% { box-shadow: 0 0 20px rgba(251,191,36,.4); } 50% { box-shadow: 0 0 40px rgba(251,191,36,.8); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.7; } }
        @keyframes float   { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes slideUp { from { transform:translateY(24px); opacity:0; } to { transform:translateY(0); opacity:1; } }
        @keyframes scaleIn { from { transform:scale(.92); opacity:0; } to { transform:scale(1); opacity:1; } }

        .animate-glow     { animation: glow    2s ease-in-out infinite; }
        .animate-pulse    { animation: pulse   2s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.5s ease-out both; }
        .animate-scale-in { animation: scaleIn 0.4s ease-out both; }

        /* ── BACKGROUND — diğer sayfalarla uyumlu ── */
        body {
          background: linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%);
          background-attachment: fixed;
        }
        .vx-container { color: white; position: relative; }

        /* ── HEADER ── */
        .vx-header { position: relative; z-index: 10; }
        .vx-header-inner {
          max-width: min(960px, 100%); margin: 0 auto;
          padding: clamp(10px,2.5vw,28px) clamp(14px,4vw,20px);
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 8px;
        }
        .vx-logo {
          display: flex; align-items: center; gap: 8px;
          cursor: pointer; transition: opacity .2s; flex-shrink: 0; min-width: 0;
        }
        .vx-logo:hover { opacity: .85; }
        .vx-logo-outer {
          width: clamp(64px,12vw,88px); height: clamp(64px,12vw,88px); flex-shrink: 0;
          border-radius: 50%; padding: 2px;
          background: radial-gradient(circle at 0 0,#7c3aed,#d946ef);
          box-shadow: 0 0 24px rgba(124,58,237,.6); position: relative;
        }
        .vx-logo-circle {
          width: 100%; height: 100%; border-radius: 50%; background: #020817;
          display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative;
        }
        .vx-logo-label { font-size: 13px; color: #c4b5fd; text-transform: uppercase; letter-spacing: .14em; font-weight: 600; white-space: nowrap; }
        .vx-header-right { display: flex; align-items: center; gap: 8px; flex-wrap: nowrap; flex-shrink: 0; }
        .vx-audio-btn {
          display: flex; align-items: center; justify-content: center;
          width: 40px; min-width: 40px; max-width: 40px; height: 40px;
          border-radius: 12px; flex-shrink: 0; flex-grow: 0;
          border: 1px solid rgba(148,163,253,.22); background: rgba(15,23,42,.8);
          cursor: pointer; transition: all .25s;
        }
        .vx-audio-btn:hover { border-color: #a78bfa; background: rgba(139,92,246,.2); }
        .vx-rounds-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 12px; border-radius: 12px;
          border: 1px solid rgba(251,191,36,.3);
          background: linear-gradient(135deg,rgba(251,191,36,.1),rgba(245,158,11,.1));
          color: #fbbf24; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all .2s; flex-shrink: 0;
        }
        .vx-rounds-badge:hover { border-color: rgba(251,191,36,.6); background: linear-gradient(135deg,rgba(251,191,36,.2),rgba(245,158,11,.15)); }
        @media (max-width: 480px) {
          .vx-logo-label { display: none !important; }
          .vx-rounds-badge span.vx-rounds-text { display: none; }
          .vx-header-inner { padding: 10px 14px; }
        }

        /* ── MAIN ── */
        .vx-main {
          position: relative; z-index: 1;
          max-width: min(960px, 100%); margin: 0 auto;
          padding: clamp(28px,6vw,52px) clamp(14px,4vw,24px) 0;
        }

        /* ── HERO ── */
        .vx-hero { text-align: center; margin-bottom: clamp(28px,6vw,48px); }
        .vx-hero-badge {
          display: inline-flex; align-items: center; gap: 7px; padding: 7px 16px;
          background: linear-gradient(135deg,rgba(251,191,36,.18),rgba(245,158,11,.12));
          border: 2px solid rgba(251,191,36,.55); border-radius: 999px;
          font-size: clamp(10px,2vw,12px); font-weight: 800; color: #fbbf24;
          text-transform: uppercase; letter-spacing: .1em;
          margin-bottom: clamp(14px,3vw,20px); animation: pulse 2s ease-in-out infinite;
        }
        .vx-hero-title {
          font-size: clamp(28px,6.5vw,52px); font-weight: 900;
          line-height: 1.1; margin-bottom: clamp(12px,3vw,18px);
          background: linear-gradient(90deg,#a78bfa,#f0abfc,#fbbf24);
          background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .vx-hero-sub {
          font-size: clamp(13px,3vw,16px); color: #cbd5e1;
          line-height: 1.65; max-width: min(600px,100%); margin: 0 auto clamp(18px,4vw,26px);
        }
        .vx-trust { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
        .vx-trust-badge {
          display: flex; align-items: center; gap: 6px; padding: 7px 14px;
          background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.35);
          border-radius: 8px; font-size: clamp(11px,2.2vw,13px); font-weight: 700; color: #86efac;
        }

        /* ── PRIZE BLOCK ── */
        .vx-prize {
          padding: clamp(20px,4vw,32px) clamp(18px,4vw,32px);
          border-radius: clamp(16px,3vw,22px);
          background: linear-gradient(135deg,rgba(251,191,36,.14),rgba(245,158,11,.09));
          border: 2px solid rgba(251,191,36,.55);
          margin-bottom: clamp(28px,6vw,48px); position: relative; overflow: hidden;
          animation: glow 2s ease-in-out infinite;
        }
        .vx-prize-label {
          font-size: clamp(12px,2.5vw,15px); color: #fcd34d; font-weight: 800;
          text-transform: uppercase; letter-spacing: 1.2px;
          text-align: center; margin-bottom: clamp(16px,3.5vw,24px); position: relative; z-index: 1;
        }
        .vx-prize-content {
          display: flex; align-items: center; justify-content: center;
          gap: clamp(20px,5vw,44px); position: relative; z-index: 1; flex-wrap: wrap;
        }
        .vx-prize-ring {
          position: relative; flex-shrink: 0;
          width: clamp(130px,25vw,170px); height: clamp(130px,25vw,170px);
          display: flex; align-items: center; justify-content: center;
        }
        .vx-prize-info { flex: 1; min-width: 0; text-align: left; }
        .vx-prize-amount {
          font-size: clamp(32px,7vw,56px); font-weight: 900; line-height: 1; margin-bottom: 10px;
          background: linear-gradient(90deg,#fbbf24,#f59e0b,#fbbf24);
          background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        /* ── CARDS ── */
        .vx-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
          gap: clamp(20px,4vw,32px); margin-bottom: clamp(48px,8vw,72px);
        }
        .vx-card {
          position: relative;
          background: linear-gradient(135deg,rgba(30,27,75,.98),rgba(15,23,42,.98));
          border: 2px solid transparent; border-radius: clamp(18px,4vw,24px);
          padding: clamp(24px,4vw,36px) clamp(20px,4vw,30px);
          display: flex; flex-direction: column; overflow: hidden;
          transition: transform .3s, box-shadow .3s;
        }
        .vx-card:hover { transform: translateY(-8px); box-shadow: 0 24px 60px rgba(139,92,246,.4); }
        .vx-card.popular {
          border-color: #fbbf24 !important;
          box-shadow: 0 0 50px rgba(251,191,36,.3);
          background: linear-gradient(135deg,rgba(40,32,72,.98),rgba(25,18,50,.98));
        }
        .vx-card.popular:hover { box-shadow: 0 24px 60px rgba(251,191,36,.5); }

        /* Ribbon — bounce animasyonu kaldırıldı, static */
        .vx-ribbon {
          position: absolute; top: clamp(16px,3.5vw,22px); right: clamp(-32px,-6vw,-42px);
          background: linear-gradient(135deg,#fbbf24,#f59e0b);
          color: #0f172a; padding: 8px 46px;
          font-size: clamp(10px,2.2vw,12px); font-weight: 900; letter-spacing: .08em;
          box-shadow: 0 4px 16px rgba(251,191,36,.55); transform: rotate(45deg); z-index: 2;
        }

        .vx-card-header { text-align: center; margin-bottom: clamp(18px,4vw,26px); position: relative; z-index: 1; }
        .vx-icon-wrap {
          width: clamp(72px,14vw,90px); height: clamp(72px,14vw,90px);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          margin: 0 auto clamp(14px,3vw,20px); position: relative; transition: transform .3s;
        }
        .vx-card:hover .vx-icon-wrap { transform: scale(1.1); }
        .vx-icon { width: clamp(34px,7vw,44px); height: clamp(34px,7vw,44px); color: white; }

        .vx-tagline { font-size: clamp(10px,2vw,12px); font-weight: 700; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 5px; opacity: .8; }
        .vx-card-name {
          font-size: clamp(20px,4.5vw,26px); font-weight: 900; margin-bottom: 6px; color: #fff;
        }
        .vx-card-desc { font-size: clamp(12px,2.5vw,14px); color: #94a3b8; }

        .vx-round-display {
          text-align: center; margin-bottom: clamp(18px,4vw,26px);
          padding: clamp(16px,3.5vw,22px);
          background: rgba(255,255,255,.04); border-radius: 16px; border: 1px solid rgba(255,255,255,.07);
        }
        .vx-round-display.bundle {
          background: linear-gradient(135deg,rgba(251,191,36,.1),rgba(245,158,11,.06));
          border: 1px solid rgba(251,191,36,.3); animation: glow 2s ease-in-out infinite;
        }
        .vx-round-text {
          font-size: clamp(32px,7vw,44px); font-weight: 900; line-height: 1.15; margin-bottom: 8px;
          background: linear-gradient(90deg,#a78bfa,#f0abfc,#fbbf24);
          background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .vx-round-badge {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px;
          background: linear-gradient(135deg,rgba(251,191,36,.2),rgba(245,158,11,.12));
          border: 1px solid rgba(251,191,36,.45); border-radius: 999px;
          font-size: clamp(12px,2.5vw,14px); font-weight: 900; color: #fbbf24; margin-bottom: 8px;
        }
        .vx-round-sub { font-size: clamp(11px,2.3vw,13px); color: #94a3b8; font-weight: 600; }
        .bundle .vx-round-sub { color: #fcd34d; }

        .vx-features { flex: 1; margin-bottom: clamp(18px,4vw,26px); }
        .vx-feature {
          display: flex; align-items: center; gap: clamp(10px,2.5vw,12px);
          padding: clamp(9px,2vw,11px) clamp(10px,2.5vw,13px);
          margin-bottom: 6px; font-size: clamp(12px,2.5vw,14px); color: #cbd5e1;
          background: rgba(255,255,255,.025); border-radius: 10px;
          border: 1px solid rgba(255,255,255,.05); transition: all .2s;
        }
        .vx-feature:hover { background: rgba(139,92,246,.09); border-color: rgba(139,92,246,.28); transform: translateX(4px); }
        .vx-feature.hi { background: rgba(251,191,36,.07); border-color: rgba(251,191,36,.2); }
        .vx-feat-icon { width: clamp(16px,3.5vw,18px); height: clamp(16px,3.5vw,18px); flex-shrink: 0; color: #22c55e; }
        .vx-feature.hi .vx-feat-icon { color: #fbbf24; }

        .vx-btn {
          width: 100%; padding: clamp(14px,3.5vw,18px);
          background: linear-gradient(135deg,#7c3aed,#d946ef);
          border: none; border-radius: clamp(12px,3vw,14px); color: white;
          font-size: clamp(14px,3vw,16px); font-weight: 900; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 8px 30px rgba(124,58,237,.4);
          transition: transform .25s, box-shadow .25s; min-height: 44px;
        }
        .vx-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(124,58,237,.6); }
        .vx-btn:disabled { opacity: .6; cursor: not-allowed; }
        .vx-btn.popular { background: linear-gradient(135deg,#fbbf24,#f59e0b); box-shadow: 0 8px 30px rgba(251,191,36,.4); }
        .vx-btn.popular:hover:not(:disabled) { box-shadow: 0 12px 36px rgba(251,191,36,.6); }

        /* ── BENEFITS ── */
        .vx-benefits { max-width: min(860px,100%); margin: 0 auto clamp(48px,8vw,72px); }
        .vx-benefits-title {
          text-align: center; font-size: clamp(24px,5.5vw,36px); font-weight: 900;
          margin-bottom: clamp(28px,5vw,44px); color: #fff;
        }
        .vx-benefits-grid {
          display: grid; grid-template-columns: repeat(auto-fit,minmax(min(100%,190px),1fr));
          gap: clamp(14px,3vw,20px);
        }
        .vx-benefit {
          padding: clamp(18px,4vw,24px); border-radius: clamp(14px,3vw,18px);
          background: rgba(255,255,255,.025); border: 1px solid rgba(255,255,255,.08);
          transition: transform .3s, box-shadow .3s, background .3s, border-color .3s; text-align: center;
        }
        .vx-benefit:hover { background: rgba(139,92,246,.1); border-color: rgba(139,92,246,.35); transform: translateY(-6px); box-shadow: 0 16px 36px rgba(139,92,246,.25); }
        .vx-benefit-icon {
          width: clamp(48px,9vw,56px); height: clamp(48px,9vw,56px); border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto clamp(12px,3vw,16px); transition: transform .3s;
        }
        .vx-benefit:hover .vx-benefit-icon { transform: scale(1.08); }
        .vx-benefit-title { font-size: clamp(14px,3vw,16px); font-weight: 800; margin-bottom: 5px; color: #e5e7eb; }
        .vx-benefit-text  { font-size: clamp(12px,2.5vw,13px); color: #94a3b8; line-height: 1.6; }

        /* ── MOBILE ── */
        @media (max-width: 600px) {
          .mobile-hide   { display: none !important; }
          .vx-prize-info { text-align: center; }
          .vx-ribbon     { right: -38px !important; padding: 7px 40px !important; font-size: 9px !important; }
          .vx-card:hover { transform: none !important; }
          .vx-card:hover .vx-icon-wrap { transform: none !important; }
          .vx-benefit:hover { transform: none !important; }
          .vx-card { padding: clamp(18px,5vw,24px) clamp(14px,4vw,20px) !important; }
          .vx-prize-content { flex-direction: column; align-items: center; }
          .vx-benefits-grid { grid-template-columns: 1fr 1fr !important; }
          .vx-trust { gap: 7px; }
          .vx-trust-badge { padding: 6px 10px; font-size: 11px; }
        }
        @media (max-width: 380px) {
          .vx-benefits-grid { grid-template-columns: 1fr !important; }
          .vx-hero-title    { font-size: 24px !important; }
          .vx-prize-amount  { font-size: 28px !important; }
        }
      `}</style>

      <AnnouncementBanner />
      <AnnouncementModal />

      <div className="vx-container">
        {/* ── HEADER ── */}
        <header className="vx-header">
          <div className="vx-header-inner">
            {/* LEFT: Logo */}
            <div className="vx-logo" onClick={() => router.push("/")}>
              <div className="vx-logo-outer">
                <div className="vx-logo-circle">
                  <Image src="/images/logo.png" alt="VibraXX" fill sizes="80px" style={{ objectFit: "contain", padding: "12%" }} />
                </div>
              </div>
              <span className="vx-logo-label">Live Quiz Arena</span>
            </div>

            {/* RIGHT: Rounds + Audio — always together */}
            <div className="vx-header-right">
              {liveCredits > 0 && (
                <div className="vx-rounds-badge">
                  <ShoppingCart style={{ width: 14, height: 14 }} />
                  <span>{liveCredits}</span>
                  <span className="vx-rounds-text">Rounds</span>
                </div>
              )}
              <button className="vx-audio-btn" onClick={toggleMusic} title={isMusicPlaying ? "Mute" : "Play music"}
                style={{ width: 40, minWidth: 40, maxWidth: 40, height: 40, flexShrink: 0, flexGrow: 0, background: isMusicPlaying ? "linear-gradient(135deg,rgba(139,92,246,.9),rgba(124,58,237,.9))" : "rgba(15,23,42,.8)", boxShadow: isMusicPlaying ? "0 0 14px rgba(139,92,246,.5)" : "none" }}>
                {isMusicPlaying
                  ? <Volume2 style={{ width: 18, height: 18, color: "white" }} />
                  : <VolumeX style={{ width: 18, height: 18, color: "#94a3b8" }} />}
              </button>
            </div>
          </div>
        </header>

        {/* ── MAIN ── */}
        <main className="vx-main">

          {/* HERO */}
          <div className="vx-hero animate-slide-up">
            <div className="vx-hero-badge">
              <Sparkles size={16} />
              Choose Your Plan
            </div>
            <h1 className="vx-hero-title">Compete. Win. Repeat.</h1>
            <p className="vx-hero-sub">
              Join the global skill-based quiz competition and fight for the{" "}
              <strong style={{ color: "#fbbf24", fontWeight: 900 }}>£1,000 monthly prize</strong>.
              Pure knowledge, zero chance.
            </p>
            <div className="vx-trust">
              <div className="vx-trust-badge"><Shield   size={14} /><span>Secure Payment</span></div>
              <div className="vx-trust-badge"><Lock     size={14} /><span>SSL Encrypted</span></div>
              <div className="vx-trust-badge"><CheckCircle2 size={14} /><span>Instant Access</span></div>
            </div>
          </div>

          {/* PRIZE BLOCK */}
          {prizeData?.prize && prizeData?.countdown && (
            <div className="vx-prize animate-scale-in">
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%,rgba(251,191,36,.08) 0%,transparent 70%)", pointerEvents: "none" }} />
              <div className="vx-prize-label">💰 {prizeData.prize.label || "Monthly Prize Pool"}</div>

              <div className="vx-prize-content">
                <div className="vx-prize-ring">
                  <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)", filter: isUnlocked ? "drop-shadow(0 0 18px rgba(251,191,36,.8))" : "drop-shadow(0 0 10px rgba(139,92,246,.5))" }}>
                    <defs>
                      <linearGradient id="buyGold"   x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%"   stopColor="#fbbf24" />
                        <stop offset="50%"  stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                      <linearGradient id="buyPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%"   stopColor="#8b5cf6" />
                        <stop offset="50%"  stopColor="#d946ef" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(15,23,42,.6)" strokeWidth="12" />
                    <circle cx="100" cy="100" r="85" fill="none"
                      stroke={isUnlocked ? "url(#buyGold)" : "url(#buyPurple)"}
                      strokeWidth="12" strokeLinecap="round"
                      strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset}
                      style={{ transition: "stroke-dashoffset 1s ease-out, stroke .5s ease" }}
                    />
                  </svg>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                    <div style={{ fontSize: "clamp(26px,5vw,36px)", marginBottom: 5, animation: isUnlocked ? "float 2s ease-in-out infinite" : "none" }}>
                      {isUnlocked ? "🎉" : "🔒"}
                    </div>
                    <div style={{ fontSize: "clamp(16px,3.5vw,22px)", fontWeight: 900, background: isUnlocked ? "linear-gradient(90deg,#fbbf24,#f59e0b)" : "linear-gradient(90deg,#8b5cf6,#d946ef)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
                      {Math.round(progressRatio * 100)}%
                    </div>
                  </div>
                </div>

                <div className="vx-prize-info">
                  <div className="vx-prize-amount" style={{ filter: isUnlocked ? "drop-shadow(0 0 16px rgba(251,191,36,.6))" : "none" }}>
                    £{(prizeData.prize.amount || 1000).toLocaleString()}
                  </div>

                  {isUnlocked ? (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: "999px", background: "linear-gradient(135deg,rgba(34,197,94,.2),rgba(21,128,61,.14))", border: "2px solid rgba(34,197,94,.5)", marginBottom: 10 }}>
                      <Sparkles style={{ width: 16, height: 16, color: "#22c55e" }} />
                      <span style={{ fontSize: "clamp(11px,2.2vw,13px)", fontWeight: 800, color: "#22c55e", textTransform: "uppercase", letterSpacing: ".5px" }}>PRIZE ACTIVE!</span>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: "clamp(12px,2.5vw,15px)", fontWeight: 700, color: "#fcd34d", marginBottom: 6 }}>
                        {(prizeData.prize.progress || 0).toLocaleString()} / {(prizeData.prize.threshold || 1000).toLocaleString()} Paid Entries
                      </div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: "999px", background: "rgba(139,92,246,.18)", border: "1px solid rgba(139,92,246,.45)" }}>
                        <Target style={{ width: 11, height: 11, color: "#a78bfa", flexShrink: 0 }} />
                        <span style={{ fontSize: "clamp(10px,2vw,12px)", fontWeight: 700, color: "#a78bfa" }}>
                          {((prizeData.prize.threshold || 1000) - (prizeData.prize.progress || 0)).toLocaleString()} more to unlock!
                        </span>
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: "clamp(10px,2vw,12px)", color: "#94a3b8", marginBottom: 8, lineHeight: 1.5 }}>
                    {prizeData.prize.sublabel}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: "999px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", fontSize: "clamp(10px,2vw,12px)", color: "#94a3b8", fontWeight: 600 }}>
                    <Clock style={{ width: 11, height: 11, flexShrink: 0 }} />
                    Resets in {prizeData.countdown.days}d {prizeData.countdown.hours}h {prizeData.countdown.minutes}m
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PACKAGE CARDS */}
          <div className="vx-cards">
            {packages.map((pkg, i) => {
              const Icon         = pkg.icon;
              const isProcessing = processingPackageId === pkg.id;
              return (
                <div key={pkg.id}
                  className={`vx-card ${pkg.popular ? "popular" : ""} animate-slide-up`}
                  style={{ borderColor: pkg.color.border, animationDelay: `${i * 0.12}s` }}>

                  {pkg.badge && <div className="vx-ribbon">{pkg.badge}</div>}

                  <div className="vx-card-header">
                    <div className="vx-icon-wrap" style={{ background: pkg.color.iconBg, boxShadow: `0 0 32px ${pkg.color.glow}` }}>
                      <Icon className="vx-icon" />
                    </div>
                    {pkg.tagline && <div className="vx-tagline" style={{ color: pkg.popular ? "#fbbf24" : "#a78bfa" }}>{pkg.tagline}</div>}
                    <h3 className="vx-card-name">{pkg.name}</h3>
                    <p className="vx-card-desc">{pkg.description}</p>
                  </div>

                  <div className={`vx-round-display ${pkg.id === "bundle" ? "bundle" : ""}`}>
                    <div className="vx-round-text">{pkg.rounds === 3 ? "3 Rounds" : "30 Rounds"}</div>
                    {pkg.id === "bundle" && (
                      <div className="vx-round-badge"><Sparkles size={14} /><span>40% OFF</span></div>
                    )}
                    <div className="vx-round-sub">{pkg.id === "single" ? "Jump in and start competing" : "Best Value Package"}</div>
                  </div>

                  <div className="vx-features">
                    {pkg.features.map((f, idx) => {
                      const FIcon = f.icon;
                      return (
                        <div key={idx} className={`vx-feature ${f.highlight ? "hi" : ""}`}>
                          <FIcon className="vx-feat-icon" />
                          <span>{f.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  <button onClick={() => handlePurchase(pkg)} disabled={isProcessing}
                    className={`vx-btn ${pkg.popular ? "popular" : ""}`}>
                    {isProcessing ? (
                      <>
                        <div style={{ width: 18, height: 18, border: "3px solid rgba(255,255,255,.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        <span>Purchase Now — Instant Access</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* BENEFITS */}
          <div className="vx-benefits">
            <h2 className="vx-benefits-title">Why VibraXX?</h2>
            <div className="vx-benefits-grid">
              {[
                { bg: "linear-gradient(135deg,#3b82f6,#2563eb)", icon: <Trophy size={26} color="white" />, title: "Skill-Based",      text: "Compete on pure knowledge. No luck, no chance — every correct answer counts." },
                { bg: "linear-gradient(135deg,#10b981,#059669)", icon: <Shield size={26} color="white" />, title: "UK Based",         text: "Operated by Sermin Limited, a company registered in England & Wales." },
                { bg: "linear-gradient(135deg,#f59e0b,#d97706)", icon: <TrendingUp size={26} color="white" />, title: "Track Progress", text: "Real-time stats, detailed analytics, and tier rankings after every round." },
                { bg: "linear-gradient(135deg,#8b5cf6,#7c3aed)", icon: <Rocket size={26} color="white" />,    title: "Instant Access", text: "Start playing immediately after purchase. No waiting, no delays." },
              ].map(({ bg, icon, title, text }, i) => (
                <div key={title} className="vx-benefit animate-scale-in" style={{ animationDelay: `${(i + 1) * 0.1}s` }}>
                  <div className="vx-benefit-icon" style={{ background: bg }}>{icon}</div>
                  <div className="vx-benefit-title">{title}</div>
                  <div className="vx-benefit-text">{text}</div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
      <Footer />
    </>
  );
}
