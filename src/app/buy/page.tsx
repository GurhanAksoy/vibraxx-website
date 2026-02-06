"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Footer from "@/components/Footer";
import {
  Crown,
  Zap,
  TrendingUp,
  Users,
  Trophy,
  Sparkles,
  Lock,
  ChevronRight,
  Rocket,
  ShoppingCart,
  CheckCircle2,
  Target,
  Volume2,
  VolumeX,
  Shield,
  Percent,
  Gift,
  Star,
  Clock,
  BarChart3,
  Wifi,
  Zap as Lightning,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES (DB Contract - Same as Leaderboard)
// ═══════════════════════════════════════════════════════════

interface PrizeData {
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

// ═══════════════════════════════════════════════════════════
// PACKAGE CONFIGURATION (No prices - Stripe handles)
// ═══════════════════════════════════════════════════════════

const packages = [
  {
    id: "single",
    name: "Single Round",
    rounds: 1,
    popular: false,
    icon: Zap,
    badge: null,
    tagline: "Try it out",
    features: [
      { icon: Lightning, text: "1 Quiz Round", highlight: false },
      { icon: Target, text: "20 Questions", highlight: false },
      { icon: Rocket, text: "Instant Access", highlight: true },
      { icon: BarChart3, text: "Leaderboard Entry", highlight: false },
      { icon: TrendingUp, text: "Score Tracking", highlight: false },
      { icon: Wifi, text: "Real-time Stats", highlight: false },
    ],
    description: "Perfect for trying out the competition",
    color: {
      primary: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)",
      secondary: "rgba(139,92,246,0.15)",
      border: "rgba(139,92,246,0.5)",
      glow: "rgba(139,92,246,0.4)",
      iconBg: "linear-gradient(135deg, #7c3aed, #d946ef)",
    },
  },
  {
    id: "bundle",
    name: "Champion Bundle",
    rounds: 30,
    popular: true,
    icon: Crown,
    badge: "🔥 SAVE 20% 🔥", // ✅ FIXED: 40% → 20%
    tagline: "Best Value",
    features: [
      { icon: Trophy, text: "30 Quiz Rounds", highlight: true },
      { icon: Percent, text: "20% Savings", highlight: true }, // ✅ FIXED: 40% → 20%
      { icon: Target, text: "600 Questions Total", highlight: false },
      { icon: Star, text: "Priority Support", highlight: false },
      { icon: BarChart3, text: "Extended Statistics", highlight: false },
      { icon: Crown, text: "Champion Badge", highlight: true },
      { icon: Users, text: "Exclusive Discord Access", highlight: false },
      { icon: Gift, text: "Monthly Prize Entry", highlight: true },
    ],
    description: "Ultimate package for serious competitors",
    color: {
      primary: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
      secondary: "rgba(251,191,36,0.15)",
      border: "rgba(251,191,36,0.6)",
      glow: "rgba(251,191,36,0.5)",
      iconBg: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    },
  },
];

export default function BuyPage() {
  const router = useRouter();
  
  // ═══════════════════════════════════════════════════════════
  // STATE (DB-driven only)
  // ═══════════════════════════════════════════════════════════
  const [user, setUser] = useState<any>(null);
  const [liveCredits, setLiveCredits] = useState(0);
  const [prizeData, setPrizeData] = useState<PrizeData | null>(null); // ✅ Same as Leaderboard
  const [isLoading, setIsLoading] = useState(true);
  const [processingPackageId, setProcessingPackageId] = useState<string | null>(null);
  
  // Music State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ═══════════════════════════════════════════════════════════
  // BACKGROUND MUSIC
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    // ✅ GUARD: Prevent memory leak
    if (!audioRef.current) {
      const audio = new Audio("/sounds/vibraxx.mp3");
      audio.loop = true;
      audio.volume = 0.3;
      audioRef.current = audio;
    }

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
        if (musicEnabled === "true" && audioRef.current) {
          audioRef.current.play().catch(err => {
            console.log("Audio autoplay blocked:", err);
          });
        }
      }
    };

    // ✅ Use pointerdown instead of click for better mobile support
    document.addEventListener("pointerdown", handleFirstInteraction, { once: true });
    return () => {
      document.removeEventListener("pointerdown", handleFirstInteraction);
    };
  }, [hasInteracted]);

  useEffect(() => {
    if (!audioRef.current || !hasInteracted) return;

    if (isMusicPlaying) {
      audioRef.current.play().catch(err => {
        console.log("Audio play error:", err);
      });
      localStorage.setItem("vibraxx_music_enabled", "true");
    } else {
      audioRef.current.pause();
      localStorage.setItem("vibraxx_music_enabled", "false");
    }
  }, [isMusicPlaying, hasInteracted]);

  const toggleMusic = useCallback(() => {
    setIsMusicPlaying(prev => !prev);
  }, []);

  // ═══════════════════════════════════════════════════════════
  // FETCH DATA (CANONICAL - Same RPC as Leaderboard)
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?redirect=/buy`,
          },
        });
        return;
      }

      setUser(authUser);

      // ✅ CANONICAL: Get user credits
      const { data: creditsData } = await supabase
        .from("user_credits")
        .select("live_credits")
        .eq("user_id", authUser.id)
        .single();

      setLiveCredits(creditsData?.live_credits || 0);

      // ✅ CANONICAL: Use SAME RPC as Leaderboard for prize data
      const { data: leaderboardData, error: prizeError } = await supabase.rpc("get_leaderboard_data", {
        p_tab: 'monthly' // ✅ £1000 prize is MONTHLY, not weekly
      });

      if (!prizeError && leaderboardData) {
        setPrizeData({
          prize: leaderboardData.prize,
          countdown: leaderboardData.countdown
        });
      }

      setIsLoading(false);
    };

    loadData();
  }, [router]);

  // ═══════════════════════════════════════════════════════════
  // REALTIME: Prize Pool Updates
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    // ✅ GUARD: Wait for both prizeData AND user to be ready
    if (!prizeData || !user?.id) return;

    const refreshPrizeData = async () => {
      const { data: leaderboardData, error } = await supabase.rpc("get_leaderboard_data", {
        p_tab: 'monthly' // ✅ £1000 prize is MONTHLY
      });

      if (!error && leaderboardData) {
        setPrizeData({
          prize: leaderboardData.prize,
          countdown: leaderboardData.countdown
        });
      }
    };

    // ✅ Listen for new purchases (updates prize pool)
    const purchaseChannel = supabase
      .channel("buy-page-purchases")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "premium_purchases",
        },
        () => {
          console.log("[Realtime] New purchase - refreshing prize pool");
          refreshPrizeData();
        }
      )
      .subscribe();

    // ✅ Listen for credit updates
    const creditChannel = supabase
      .channel(`buy-page-credits-${user?.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_credits",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          console.log("[Realtime] Credits updated");
          // Refresh credits
          supabase
            .from("user_credits")
            .select("live_credits")
            .eq("user_id", user.id)
            .single()
            .then(({ data }) => {
              if (data) setLiveCredits(data.live_credits || 0);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(purchaseChannel);
      supabase.removeChannel(creditChannel);
    };
  }, [prizeData, user]); // ✅ Add user to dependencies

  // ═══════════════════════════════════════════════════════════
  // PURCHASE HANDLER (Stripe checkout)
  // ═══════════════════════════════════════════════════════════
  const handlePurchase = async (pkg: typeof packages[0]) => {
    if (!user) {
      router.push("/");
      return;
    }

    setProcessingPackageId(pkg.id);

    try {
      // ✅ SECURITY: Only send package type - backend controls pricing
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: pkg.id,  // ✅ Only 'single' | 'bundle'
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Failed to process purchase. Please try again.");
      setProcessingPackageId(null);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          border: "4px solid rgba(139, 92, 246, 0.3)",
          borderTopColor: "#8b5cf6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow-x: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.4); }
          50% { box-shadow: 0 0 40px rgba(251,191,36,0.8); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes cardShine {
          0% { left: -100%; }
          100% { left: 200%; }
        }

        @keyframes megaBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-8px) scale(1.1); }
          50% { transform: translateY(-4px) scale(1.05); }
          75% { transform: translateY(-6px) scale(1.08); }
        }

        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.6s ease-out; }
        .animate-scale-in { animation: scaleIn 0.5s ease-out; }
        .animate-mega-bounce { animation: megaBounce 1.5s ease-in-out infinite; }

        .vx-buy-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%);
          background-size: 400% 400%;
          color: white;
          position: relative;
        }

        .vx-buy-bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.5;
          pointer-events: none;
        }

        .vx-buy-header {
          position: relative;
          z-index: 10;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          background: rgba(15, 23, 42, 0.8);
        }

        .vx-buy-header-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 24px);
          display: flex;
          align-items: center;
          justifyContent: space-between;
          height: clamp(60px, 12vw, 80px);
          gap: clamp(12px, 3vw, 16px);
        }

        .vx-buy-logo {
          display: flex;
          align-items: center;
          gap: clamp(8px, 2vw, 10px);
          cursor: pointer;
          transition: transform 0.3s;
        }
        .vx-buy-logo:hover { transform: scale(1.05); }

        .vx-buy-logo-outer {
          position: relative;
          width: clamp(60px, 12vw, 90px);
          height: clamp(60px, 12vw, 90px);
          border-radius: 50%;
          padding: 4px;
          background: radial-gradient(circle at 0 0, #7c3aed, #d946ef);
          box-shadow: 0 0 30px rgba(124, 58, 237, 0.6);
          flex-shrink: 0;
        }

        .vx-buy-logo-glow {
          position: absolute;
          inset: -5px;
          border-radius: 50%;
          background: radial-gradient(circle, #a855f7, transparent);
          opacity: 0.4;
          filter: blur(10px);
          pointer-events: none;
          animation: glow 2s ease-in-out infinite;
        }

        .vx-buy-logo-circle {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: #020817;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .vx-buy-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 10px;
        }

        .vx-buy-logo-text {
          font-size: clamp(11px, 2.2vw, 13px);
          color: #c4b5fd;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-weight: 600;
        }

        .vx-buy-right {
          display: flex;
          align-items: center;
          gap: clamp(10px, 2.5vw, 12px);
        }

        .vx-buy-audio-btn,
        .vx-buy-back-btn {
          display: flex;
          align-items: center;
          gap: clamp(6px, 1.5vw, 8px);
          padding: clamp(8px, 2vw, 10px) clamp(14px, 3vw, 16px);
          border-radius: clamp(10px, 2.5vw, 12px);
          border: 2px solid rgba(139, 92, 246, 0.5);
          background: rgba(15, 23, 42, 0.8);
          color: white;
          font-size: clamp(13px, 3vw, 14px);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          min-height: 44px;
        }

        .vx-buy-audio-btn {
          width: 44px;
          height: 44px;
          padding: 0;
          justify-content: center;
        }

        .vx-buy-audio-btn:hover,
        .vx-buy-back-btn:hover {
          border-color: #a78bfa;
          background: rgba(139, 92, 246, 0.2);
          transform: scale(1.05);
        }

        .vx-buy-main {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px) 0;
        }

        .vx-buy-hero {
          text-align: center;
          margin-bottom: clamp(50px, 10vw, 80px);
        }

        .vx-buy-badge {
          display: inline-flex;
          align-items: center;
          gap: clamp(6px, 1.5vw, 8px);
          padding: clamp(8px, 2vw, 10px) clamp(18px, 4vw, 20px);
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.15));
          border: 2px solid rgba(251, 191, 36, 0.6);
          border-radius: 999px;
          font-size: clamp(11px, 2.2vw, 13px);
          font-weight: 800;
          color: #fbbf24;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: clamp(20px, 4vw, 28px);
          animation: pulse 2s ease-in-out infinite;
          box-shadow: 0 0 20px rgba(251,191,36,0.3);
        }

        .vx-buy-title {
          font-size: clamp(36px, 8vw, 64px);
          font-weight: 900;
          margin-bottom: clamp(20px, 4vw, 28px);
          line-height: 1.1;
        }

        .vx-buy-title-gradient {
          background: linear-gradient(90deg, #a78bfa, #f0abfc, #fbbf24, #f0abfc, #a78bfa);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .vx-buy-subtitle {
          font-size: clamp(15px, 3.5vw, 19px);
          color: #cbd5e1;
          line-height: 1.7;
          max-width: 720px;
          margin: 0 auto clamp(28px, 5vw, 36px);
        }

        .vx-buy-trust {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: clamp(14px, 3vw, 18px);
        }

        .vx-buy-trust-badge {
          display: flex;
          align-items: center;
          gap: clamp(6px, 1.5vw, 8px);
          padding: clamp(8px, 2vw, 10px) clamp(16px, 3.5vw, 18px);
          background: rgba(34, 197, 94, 0.12);
          border: 2px solid rgba(34, 197, 94, 0.4);
          border-radius: clamp(8px, 2vw, 10px);
          font-size: clamp(12px, 2.5vw, 14px);
          font-weight: 700;
          color: #86efac;
          box-shadow: 0 0 15px rgba(34,197,94,0.2);
        }

        .prize-pool-content {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
        }

        .prize-pool-info {
          text-align: left;
        }

        .prize-pool-countdown {
          justify-content: flex-start;
        }

        .vx-buy-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
          gap: clamp(32px, 6vw, 48px);
          margin-bottom: clamp(80px, 12vw, 100px);
        }

        .vx-buy-card {
          position: relative;
          background: linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(15, 23, 42, 0.95));
          border: 3px solid transparent;
          border-radius: clamp(24px, 5vw, 32px);
          padding: clamp(36px, 6vw, 48px) clamp(28px, 5vw, 40px);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .vx-buy-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 0%, rgba(139,92,246,0.15), transparent 70%);
          opacity: 0;
          transition: opacity 0.5s;
          pointer-events: none;
        }

        .vx-buy-card::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          transform: rotate(45deg);
          pointer-events: none;
        }

        .vx-buy-card:hover::before {
          opacity: 1;
        }

        .vx-buy-card:hover::after {
          animation: cardShine 1.5s ease-in-out;
        }

        .vx-buy-card:hover {
          transform: translateY(-16px) scale(1.02);
          box-shadow: 0 40px 100px rgba(139, 92, 246, 0.6);
        }

        .vx-buy-card.popular {
          border-color: #fbbf24;
          box-shadow: 0 0 80px rgba(251, 191, 36, 0.4);
          background: linear-gradient(135deg, rgba(45, 35, 75, 0.95), rgba(30, 20, 52, 0.95));
        }

        .vx-buy-card.popular:hover {
          box-shadow: 0 40px 100px rgba(251, 191, 36, 0.7);
        }

        .vx-buy-ribbon {
          position: absolute;
          top: clamp(20px, 4vw, 28px);
          right: clamp(-36px, -7vw, -48px);
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #0f172a;
          padding: 10px 52px;
          font-size: clamp(11px, 2.4vw, 14px);
          font-weight: 900;
          letter-spacing: 0.1em;
          box-shadow: 0 4px 20px rgba(251, 191, 36, 0.6);
          transform: rotate(45deg);
          z-index: 2;
          animation: megaBounce 1.5s ease-in-out infinite;
        }

        .vx-buy-card-header {
          text-align: center;
          margin-bottom: clamp(28px, 5vw, 36px);
          position: relative;
          z-index: 1;
        }

        .vx-buy-icon-wrapper {
          width: clamp(100px, 18vw, 120px);
          height: clamp(100px, 18vw, 120px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto clamp(24px, 5vw, 32px);
          position: relative;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .vx-buy-icon-wrapper::before {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          opacity: 0.5;
          filter: blur(20px);
          transition: all 0.4s;
          z-index: -1;
        }

        .vx-buy-card:hover .vx-buy-icon-wrapper {
          transform: scale(1.15) rotate(360deg);
        }

        .vx-buy-card:hover .vx-buy-icon-wrapper::before {
          opacity: 1;
          filter: blur(30px);
        }

        .vx-buy-icon {
          width: clamp(48px, 10vw, 60px);
          height: clamp(48px, 10vw, 60px);
          color: white;
          filter: drop-shadow(0 0 10px rgba(255,255,255,0.5));
        }

        .vx-buy-card-tagline {
          font-size: clamp(11px, 2.2vw, 13px);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: clamp(6px, 1.5vw, 8px);
          opacity: 0.8;
        }

        .vx-buy-card-name {
          font-size: clamp(26px, 5vw, 32px);
          font-weight: 900;
          margin-bottom: clamp(10px, 2.5vw, 12px);
          background: linear-gradient(90deg, #ffffff, #e5e7eb, #ffffff);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }

        .vx-buy-card-desc {
          font-size: clamp(13px, 2.8vw, 15px);
          color: #94a3b8;
          line-height: 1.5;
        }

        .vx-buy-round-display {
          text-align: center;
          margin-bottom: clamp(28px, 5vw, 36px);
          padding: clamp(24px, 5vw, 32px);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
          border-radius: 20px;
          border: 2px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
        }

        .vx-buy-round-display.vx-buy-round-bundle {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1));
          border: 2px solid rgba(251, 191, 36, 0.4);
          animation: glow 2s ease-in-out infinite;
        }

        .vx-buy-round-text {
          font-size: clamp(40px, 9vw, 56px);
          font-weight: 900;
          background: linear-gradient(90deg, #a78bfa, #f0abfc, #fbbf24);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.2;
          margin-bottom: clamp(10px, 2.5vw, 12px);
          animation: shimmer 3s linear infinite;
        }

        .vx-buy-round-badge {
          display: inline-flex;
          align-items: center;
          gap: clamp(6px, 1.5vw, 8px);
          padding: clamp(8px, 2vw, 10px) clamp(18px, 4vw, 20px);
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.2));
          border: 2px solid rgba(251, 191, 36, 0.6);
          border-radius: 999px;
          font-size: clamp(14px, 3vw, 16px);
          font-weight: 900;
          color: #fbbf24;
          margin-bottom: clamp(10px, 2.5vw, 12px);
          box-shadow: 0 0 20px rgba(251,191,36,0.3);
          animation: pulse 2s ease-in-out infinite;
        }

        .vx-buy-round-subtext {
          font-size: clamp(13px, 2.8vw, 15px);
          color: #94a3b8;
          font-weight: 600;
        }

        .vx-buy-round-bundle .vx-buy-round-subtext {
          color: #fcd34d;
        }

        .vx-buy-features {
          flex: 1;
          margin-bottom: clamp(28px, 5vw, 36px);
        }

        .vx-buy-feature {
          display: flex;
          align-items: center;
          gap: clamp(12px, 3vw, 14px);
          padding: clamp(12px, 3vw, 14px) clamp(14px, 3.5vw, 16px);
          margin-bottom: clamp(8px, 2vw, 10px);
          font-size: clamp(14px, 3vw, 16px);
          color: #cbd5e1;
          background: rgba(255, 255, 255, 0.03);
          border-radius: clamp(10px, 2.5vw, 12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 0.3s;
        }

        .vx-buy-feature:hover {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateX(clamp(4px, 1.5vw, 6px));
        }

        .vx-buy-feature.highlight {
          background: rgba(251, 191, 36, 0.08);
          border-color: rgba(251, 191, 36, 0.3);
        }

        .vx-buy-feature-icon {
          width: clamp(20px, 4.5vw, 22px);
          height: clamp(20px, 4.5vw, 22px);
          flex-shrink: 0;
          color: #22c55e;
        }

        .vx-buy-feature.highlight .vx-buy-feature-icon {
          color: #fbbf24;
        }

        .vx-buy-btn {
          width: 100%;
          padding: clamp(18px, 4vw, 22px);
          background: linear-gradient(135deg, #7c3aed, #d946ef);
          border: none;
          border-radius: clamp(14px, 3.5vw, 16px);
          color: white;
          font-size: clamp(16px, 3.5vw, 18px);
          font-weight: 900;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(10px, 2.5vw, 12px);
          box-shadow: 0 10px 40px rgba(124, 58, 237, 0.5);
          position: relative;
          overflow: hidden;
          z-index: 1;
          min-height: 44px;
        }

        .vx-buy-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
          z-index: -1;
        }

        .vx-buy-btn:hover::before {
          width: 400px;
          height: 400px;
        }

        .vx-buy-btn:hover:not(:disabled) {
          transform: translateY(-4px);
          box-shadow: 0 15px 50px rgba(124, 58, 237, 0.7);
        }

        .vx-buy-btn:active:not(:disabled) {
          transform: translateY(-2px);
        }

        .vx-buy-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .vx-buy-btn.popular {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          box-shadow: 0 10px 40px rgba(251, 191, 36, 0.5);
        }

        .vx-buy-btn.popular:hover:not(:disabled) {
          box-shadow: 0 15px 50px rgba(251, 191, 36, 0.7);
        }

        .vx-buy-benefits {
          max-width: 1000px;
          margin: 0 auto clamp(80px, 12vw, 100px);
        }

        .vx-buy-benefits-title {
          text-align: center;
          font-size: clamp(32px, 7vw, 44px);
          font-weight: 900;
          margin-bottom: clamp(50px, 8vw, 60px);
          background: linear-gradient(90deg, #ffffff, #e5e7eb, #ffffff);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }

        .vx-buy-benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
          gap: clamp(20px, 4vw, 28px);
        }

        .vx-buy-benefit {
          padding: clamp(24px, 4.5vw, 32px);
          border-radius: clamp(18px, 4vw, 24px);
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.1);
          transition: all 0.4s;
          text-align: center;
        }

        .vx-buy-benefit:hover {
          background: rgba(139, 92, 246, 0.12);
          border-color: rgba(139, 92, 246, 0.5);
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 20px 60px rgba(139, 92, 246, 0.4);
        }

        .vx-buy-benefit-icon {
          width: clamp(56px, 11vw, 64px);
          height: clamp(56px, 11vw, 64px);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto clamp(16px, 3.5vw, 20px);
          transition: transform 0.4s;
        }

        .vx-buy-benefit:hover .vx-buy-benefit-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .vx-buy-benefit-title {
          font-size: clamp(16px, 3.5vw, 18px);
          font-weight: 800;
          margin-bottom: clamp(6px, 1.5vw, 8px);
          color: #e5e7eb;
        }

        .vx-buy-benefit-text {
          font-size: clamp(14px, 3vw, 15px);
          color: #94a3b8;
          line-height: 1.7;
        }

        @media (max-width: 768px) {
          .mobile-hide { display: none !important; }
          .prize-pool-content { flex-direction: column !important; }
          .prize-pool-info { text-align: center !important; }
          .prize-pool-countdown { justify-content: center !important; }
        }
      `}</style>

      <div className="vx-buy-container">
        <div className="vx-buy-bg-grid" />

        {/* Header */}
        <header className="vx-buy-header">
          <div className="vx-buy-header-inner">
            <div className="vx-buy-logo" onClick={() => router.push("/")}>
              <div className="vx-buy-logo-outer">
                <div className="vx-buy-logo-glow" />
                <div className="vx-buy-logo-circle">
                  <img src="/images/logo.png" alt="VibraXX Logo" className="vx-buy-logo-img" />
                </div>
              </div>
              <div className="vx-buy-logo-text mobile-hide">
                Live Quiz
              </div>
            </div>

            <div className="vx-buy-right">
              <button className="vx-buy-audio-btn" onClick={toggleMusic}>
                {isMusicPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>

              <button className="vx-buy-back-btn" onClick={() => router.push("/")}>
                <ChevronRight size={16} style={{ transform: "rotate(180deg)" }} />
                <span className="mobile-hide">Back to Home</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="vx-buy-main">
          {/* Hero */}
          <div className="vx-buy-hero animate-slide-up">
            <div className="vx-buy-badge">
              <Sparkles size={18} />
              LIMITED TIME OFFER
            </div>

            <h1 className="vx-buy-title">
              <span className="vx-buy-title-gradient">Choose Your Champion Plan</span>
            </h1>

            <p className="vx-buy-subtitle">
              Join the elite competition for the <strong style={{ color: "#fbbf24", fontWeight: 900 }}>£1,000 monthly prize</strong>. 
              Skill-based, UK-regulated, and completely transparent. Your journey to victory starts here.
            </p>

            <div className="vx-buy-trust">
              <div className="vx-buy-trust-badge">
                <Shield size={16} />
                <span>Secure Payment</span>
              </div>
              <div className="vx-buy-trust-badge">
                <Lock size={16} />
                <span>SSL Encrypted</span>
              </div>
              <div className="vx-buy-trust-badge">
                <CheckCircle2 size={16} />
                <span>Instant Access</span>
              </div>
            </div>
          </div>

          {/* ✅ PRIZE POOL SECTION - EXACT SAME AS LEADERBOARD */}
          {prizeData?.prize && prizeData?.countdown && (
            <div className="animate-glow animate-scale-in" style={{
              padding: "clamp(32px, 6vw, 48px) clamp(24px, 5vw, 40px)",
              borderRadius: "clamp(20px, 4vw, 28px)",
              background: "linear-gradient(135deg, rgba(251,191,36,0.25), rgba(245,158,11,0.2))",
              border: "3px solid rgba(251,191,36,0.6)",
              marginBottom: "clamp(60px, 10vw, 80px)",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "radial-gradient(circle at 50% 50%, rgba(251,191,36,0.15) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

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
                💰 {prizeData?.prize?.label || 'Prize Pool'}
              </div>

              <div className="prize-pool-content" style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "clamp(32px, 6vw, 48px)",
                position: "relative",
                zIndex: 1,
              }}>
                
                {/* Circular Progress Ring - EXACT SAME */}
                <div style={{
                  position: "relative",
                  width: "clamp(160px, 30vw, 200px)",
                  height: "clamp(160px, 30vw, 200px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 200 200"
                    style={{
                      transform: "rotate(-90deg)",
                      filter: prizeData?.prize?.unlocked 
                        ? "drop-shadow(0 0 20px rgba(251,191,36,0.8))"
                        : "drop-shadow(0 0 10px rgba(139,92,246,0.5))",
                    }}>
                    <circle
                      cx="100"
                      cy="100"
                      r="85"
                      fill="none"
                      stroke="rgba(15,23,42,0.6)"
                      strokeWidth="12"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="85"
                      fill="none"
                      stroke={prizeData?.prize?.unlocked 
                        ? "url(#goldGradient)" 
                        : "url(#purpleGradient)"}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 85}`}
                      strokeDashoffset={`${2 * Math.PI * 85 * (1 - Math.min(
                        (prizeData?.prize?.progress || 0) / (prizeData?.prize?.threshold || 1), 
                        1
                      ))}`}
                      style={{
                        transition: "stroke-dashoffset 1s ease-out, stroke 0.5s ease",
                      }}
                    />
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

                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}>
                    <div style={{
                      fontSize: "clamp(32px, 6vw, 48px)",
                      marginBottom: "8px",
                      animation: prizeData?.prize?.unlocked 
                        ? "float 2s ease-in-out infinite"
                        : "none",
                    }}>
                      {prizeData?.prize?.unlocked ? "🎉" : "🔒"}
                    </div>
                    <div style={{
                      fontSize: "clamp(24px, 5vw, 36px)",
                      fontWeight: 900,
                      background: prizeData?.prize?.unlocked
                        ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                        : "linear-gradient(90deg, #8b5cf6, #d946ef)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      lineHeight: 1,
                    }}>
                      {prizeData?.prize?.threshold 
                        ? Math.round(((prizeData?.prize?.progress || 0) / prizeData.prize.threshold) * 100)
                        : 0}%
                    </div>
                  </div>
                </div>

                {/* Right Side - Info - EXACT SAME */}
                <div className="prize-pool-info" style={{ flex: 1, textAlign: "left" }}>
                  <div style={{
                    fontSize: "clamp(48px, 10vw, 80px)",
                    fontWeight: 900,
                    background: "linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1,
                    marginBottom: "16px",
                    filter: prizeData?.prize?.unlocked
                      ? "drop-shadow(0 0 20px rgba(251,191,36,0.6))"
                      : "none",
                  }}>
                    £{(prizeData?.prize?.amount || 0).toLocaleString()}
                  </div>

                  {prizeData?.prize?.unlocked ? (
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
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{
                        fontSize: "clamp(14px, 3vw, 18px)",
                        fontWeight: 700,
                        color: "#fcd34d",
                        marginBottom: "8px",
                      }}>
                        {(prizeData?.prize?.progress || 0).toLocaleString()} / {(prizeData?.prize?.threshold || 0).toLocaleString()} Paid Entries
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
                          {((prizeData?.prize?.threshold || 0) - (prizeData?.prize?.progress || 0)).toLocaleString()} more to unlock!
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Countdown - EXACT SAME */}
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
                      Resets in {prizeData?.countdown?.days || 0}d {prizeData?.countdown?.hours || 0}h {prizeData?.countdown?.minutes || 0}m
                    </span>
                  </div>

                  {/* Sublabel */}
                  <div style={{
                    fontSize: "clamp(11px, 2.2vw, 13px)",
                    color: "#94a3b8",
                    marginTop: "12px",
                    fontStyle: "italic",
                  }}>
                    {prizeData?.prize?.sublabel || 'Prize information'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Package Cards */}
          <div className="vx-buy-cards">
            {packages.map((pkg, index) => {
              const Icon = pkg.icon;
              const isProcessing = processingPackageId === pkg.id;

              return (
                <div 
                  key={pkg.id} 
                  className={`vx-buy-card ${pkg.popular ? "popular" : ""} animate-slide-up`}
                  style={{
                    borderColor: pkg.color.border,
                    animationDelay: `${index * 0.15}s`,
                  }}>
                  {pkg.badge && (
                    <div className="vx-buy-ribbon">
                      {pkg.badge}
                    </div>
                  )}

                  <div className="vx-buy-card-header">
                    <div
                      className="vx-buy-icon-wrapper"
                      style={{
                        background: pkg.color.iconBg,
                        boxShadow: `0 0 50px ${pkg.color.glow}`,
                      }}>
                      <div style={{
                        position: "absolute",
                        inset: -8,
                        background: pkg.color.iconBg,
                        borderRadius: "50%",
                        opacity: 0.5,
                        filter: "blur(20px)",
                      }} />
                      <Icon className="vx-buy-icon" />
                    </div>
                    {pkg.tagline && (
                      <div className="vx-buy-card-tagline" style={{ color: pkg.popular ? "#fbbf24" : "#a78bfa" }}>
                        {pkg.tagline}
                      </div>
                    )}
                    <h3 className="vx-buy-card-name">{pkg.name}</h3>
                    <p className="vx-buy-card-desc">{pkg.description}</p>
                  </div>

                  {/* Round Display - No Pricing */}
                  {pkg.id === 'single' ? (
                    <div className="vx-buy-round-display">
                      <div className="vx-buy-round-text">1 Round</div>
                      <div className="vx-buy-round-subtext">Perfect for trying out</div>
                    </div>
                  ) : (
                    <div className="vx-buy-round-display vx-buy-round-bundle">
                      <div className="vx-buy-round-text">30 Rounds</div>
                      <div className="vx-buy-round-badge">
                        <Sparkles size={16} />
                        <span>20% OFF</span> {/* ✅ FIXED: 40% → 20% */}
                      </div>
                      <div className="vx-buy-round-subtext">Best Value Package</div>
                    </div>
                  )}

                  <div className="vx-buy-features">
                    {pkg.features.map((feature, idx) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div key={idx} className={`vx-buy-feature ${feature.highlight ? "highlight" : ""}`}>
                          <FeatureIcon className="vx-buy-feature-icon" />
                          <span>{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePurchase(pkg)}
                    disabled={isProcessing}
                    className={`vx-buy-btn ${pkg.popular ? "popular" : ""}`}>
                    {isProcessing ? (
                      <>
                        <div style={{
                          width: "20px",
                          height: "20px",
                          border: "3px solid rgba(255,255,255,0.3)",
                          borderTopColor: "white",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }} />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={22} />
                        <span>Purchase Now - Instant Access</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Benefits */}
          <div className="vx-buy-benefits">
            <h2 className="vx-buy-benefits-title">Why Choose VibraXX?</h2>
            <div className="vx-buy-benefits-grid">
              <div className="vx-buy-benefit animate-scale-in" style={{ animationDelay: "0.1s" }}>
                <div className="vx-buy-benefit-icon" style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>
                  <Trophy size={28} color="white" />
                </div>
                <div className="vx-buy-benefit-title">Skill-Based Competition</div>
                <div className="vx-buy-benefit-text">
                  Test your knowledge and compete based on pure skill, not chance. Every question counts!
                </div>
              </div>

              <div className="vx-buy-benefit animate-scale-in" style={{ animationDelay: "0.2s" }}>
                <div className="vx-buy-benefit-icon" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                  <Shield size={28} color="white" />
                </div>
                <div className="vx-buy-benefit-title">UK Regulated</div>
                <div className="vx-buy-benefit-text">
                  Fully compliant with UK gaming laws and consumer protection standards
                </div>
              </div>

              <div className="vx-buy-benefit animate-scale-in" style={{ animationDelay: "0.3s" }}>
                <div className="vx-buy-benefit-icon" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                  <TrendingUp size={28} color="white" />
                </div>
                <div className="vx-buy-benefit-title">Track Progress</div>
                <div className="vx-buy-benefit-text">
                  Real-time statistics, detailed performance analytics, and tier rankings
                </div>
              </div>

              <div className="vx-buy-benefit animate-scale-in" style={{ animationDelay: "0.4s" }}>
                <div className="vx-buy-benefit-icon" style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
                  <Rocket size={28} color="white" />
                </div>
                <div className="vx-buy-benefit-title">Instant Access</div>
                <div className="vx-buy-benefit-text">
                  Start playing immediately after purchase - no waiting, no delays
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
