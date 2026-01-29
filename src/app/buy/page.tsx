"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Footer from "@/components/Footer";
import {
  Crown,
  Zap,
  Check,
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
  Flame,
  Medal,
  Award,
  Gem,
  BarChart3,
  Wifi,
  Zap as Lightning,
  TrendingDown,
  DollarSign,
} from "lucide-react";

// ✅ CANONICAL Package configuration - IDs match database ENUM
const packages = [
  {
    id: "pack_3",  // ✅ Canonical enum match (was "single")
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
    id: "pack_25",  // ✅ Canonical enum match (was "bundle")
    name: "Champion Bundle",
    rounds: 30,
    popular: true,
    icon: Crown,
    badge: "🔥 SAVE 40% 🔥",
    tagline: "Best Value",
    features: [
      { icon: Trophy, text: "30 Quiz Rounds", highlight: true },
      { icon: Percent, text: "40% MEGA SAVINGS", highlight: true },
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

const PRIZE_UNLOCK_THRESHOLD = 3000;

export default function BuyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [liveCredits, setLiveCredits] = useState(0);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [processingPackageId, setProcessingPackageId] = useState<string | null>(null);
  
  // Music State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        if (musicEnabled === "true" && audioRef.current) {
          audioRef.current.play().catch(err => {
            console.log("Audio autoplay blocked:", err);
          });
        }
      }
    };

    document.addEventListener("click", handleFirstInteraction, { once: true });
    return () => {
      document.removeEventListener("click", handleFirstInteraction);
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

  // ✅ CANONICAL DATA LOADING - Single RPC
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

      // ✅ Single canonical RPC call
      const { data: snapshot, error } = await supabase.rpc("get_buy_snapshot");

      if (error) {
        console.error("[Buy] RPC error:", error);
        setIsLoading(false);
        return;
      }

      if (snapshot) {
        setLiveCredits(snapshot.live_credits || 0);
        setTotalPurchases(snapshot.total_purchases_month || 0);

        // ✅ Backend-provided UTC reset time
        if (snapshot.reset_at) {
          const calculateTimeRemaining = (resetAt: string) => {
            const now = Date.now();
            const target = new Date(resetAt).getTime();
            const diff = Math.max(0, target - now);

            return {
              days: Math.floor(diff / (1000 * 60 * 60 * 24)),
              hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
              minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            };
          };

          setTimeRemaining(calculateTimeRemaining(snapshot.reset_at));

          // Update timer every minute
          const interval = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining(snapshot.reset_at));
          }, 60000);

          return () => clearInterval(interval);
        }
      }

      setIsLoading(false);
    };

    loadData();
  }, [router]);

  const handlePurchase = async (pkg: typeof packages[0]) => {
    if (!user) {
      router.push("/");
      return;
    }

    setProcessingPackageId(pkg.id);

    try {
      // ✅ Validate with backend first
      const { data: validation, error: validationError } = await supabase.rpc(
        "validate_purchase_package",
        { p_package_id: pkg.id }
      );

      if (validationError || !validation?.valid) {
        alert(validation?.error || "Invalid package");
        setProcessingPackageId(null);
        return;
      }

      // ✅ Call Stripe with validated data
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: validation.package,      // Backend validated
          amount: validation.amount_pence,  // Backend amount
          credits: validation.credits,      // Backend credits
          userId: validation.user_id,       // Backend user_id
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

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up-hero {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.4); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; animation-fill-mode: both; }
        .animate-slide-up-hero { animation: slide-up-hero 0.8s ease-out; animation-fill-mode: both; }
        .animate-scale-in { animation: scale-in 0.6s ease-out; animation-fill-mode: both; }

        /* Buy Page Specific Styles */
        .vx-buy-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          position: relative;
          overflow: hidden;
        }

        .vx-buy-page::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.1) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        .vx-buy-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 40px);
          position: relative;
          z-index: 1;
        }

        /* Header */
        .vx-buy-header {
          padding: clamp(20px, 4vw, 40px) 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: clamp(16px, 3vw, 24px);
          flex-wrap: wrap;
        }

        .vx-buy-logo {
          font-size: clamp(24px, 5vw, 36px);
          font-weight: 900;
          background: linear-gradient(90deg, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .vx-buy-header-actions {
          display: flex;
          align-items: center;
          gap: clamp(12px, 2vw, 16px);
          flex-wrap: wrap;
        }

        .vx-buy-credits {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.1));
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 999px;
          font-weight: 700;
          font-size: clamp(13px, 2.5vw, 15px);
          color: #c4b5fd;
        }

        .vx-buy-music-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          color: #a78bfa;
        }

        .vx-buy-music-btn:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.5);
          transform: scale(1.05);
        }

        .vx-buy-music-btn.active {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          border-color: #8b5cf6;
          color: white;
          animation: glow-pulse 2s infinite;
        }

        /* Hero Section */
        .vx-buy-hero {
          text-align: center;
          padding: clamp(40px, 8vw, 80px) 0;
          margin-bottom: clamp(40px, 6vw, 60px);
        }

        .vx-buy-hero-title {
          font-size: clamp(36px, 8vw, 72px);
          font-weight: 900;
          margin-bottom: clamp(16px, 3vw, 24px);
          background: linear-gradient(90deg, #8b5cf6 0%, #ec4899 50%, #fbbf24 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
          line-height: 1.1;
        }

        .vx-buy-hero-subtitle {
          font-size: clamp(16px, 3vw, 20px);
          color: #94a3b8;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Prize Pool Banner */
        .vx-buy-prize {
          background: linear-gradient(135deg, 
            rgba(251, 191, 36, 0.15) 0%, 
            rgba(245, 158, 11, 0.1) 50%,
            rgba(217, 119, 6, 0.15) 100%);
          border: 2px solid rgba(251, 191, 36, 0.4);
          border-radius: clamp(20px, 4vw, 32px);
          padding: clamp(24px, 5vw, 40px);
          margin-bottom: clamp(40px, 6vw, 60px);
          position: relative;
          overflow: hidden;
        }

        .vx-buy-prize::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          animation: shimmer 2s infinite;
        }

        .vx-buy-prize-content {
          position: relative;
          z-index: 1;
        }

        .vx-buy-prize-header {
          display: flex;
          align-items: center;
          gap: clamp(12px, 3vw, 16px);
          margin-bottom: clamp(16px, 3vw, 24px);
          flex-wrap: wrap;
        }

        .vx-buy-prize-icon {
          width: clamp(48px, 10vw, 64px);
          height: clamp(48px, 10vw, 64px);
          border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(251, 191, 36, 0.5);
        }

        .vx-buy-prize-title {
          font-size: clamp(24px, 5vw, 36px);
          font-weight: 900;
          color: white;
        }

        .vx-buy-prize-amount {
          font-size: clamp(48px, 10vw, 72px);
          font-weight: 900;
          background: linear-gradient(135deg, #fbbf24, #fcd34d, #fbbf24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: clamp(12px, 2vw, 16px);
        }

        .vx-buy-prize-progress {
          width: 100%;
          height: clamp(12px, 2vw, 16px);
          background: rgba(0, 0, 0, 0.3);
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: clamp(16px, 3vw, 24px);
        }

        .vx-buy-prize-bar {
          height: 100%;
          background: linear-gradient(90deg, #fbbf24, #fcd34d);
          transition: width 0.5s ease;
          border-radius: 999px;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.6);
        }

        /* Package Cards */
        .vx-buy-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 350px), 1fr));
          gap: clamp(24px, 4vw, 32px);
          margin-bottom: clamp(60px, 8vw, 100px);
        }

        .vx-buy-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
          border: 2px solid rgba(139, 92, 246, 0.3);
          border-radius: clamp(20px, 4vw, 32px);
          padding: clamp(24px, 5vw, 32px);
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
          cursor: pointer;
        }

        .vx-buy-card:hover {
          transform: translateY(-8px);
          border-color: rgba(139, 92, 246, 0.6);
          box-shadow: 0 20px 60px rgba(139, 92, 246, 0.3);
        }

        .vx-buy-card.popular {
          border-color: rgba(251, 191, 36, 0.6);
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05));
        }

        .vx-buy-card.popular:hover {
          border-color: rgba(251, 191, 36, 0.8);
          box-shadow: 0 20px 60px rgba(251, 191, 36, 0.4);
        }

        .vx-buy-ribbon {
          position: absolute;
          top: 20px;
          right: -35px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #1e293b;
          font-weight: 900;
          font-size: clamp(11px, 2vw, 13px);
          padding: 8px 40px;
          transform: rotate(45deg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          text-align: center;
          z-index: 10;
        }

        .vx-buy-card-header {
          text-align: center;
          margin-bottom: clamp(24px, 4vw, 32px);
        }

        .vx-buy-icon-wrapper {
          width: clamp(80px, 15vw, 100px);
          height: clamp(80px, 15vw, 100px);
          margin: 0 auto clamp(16px, 3vw, 24px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .vx-buy-icon {
          width: clamp(40px, 8vw, 50px);
          height: clamp(40px, 8vw, 50px);
          color: white;
          position: relative;
          z-index: 2;
        }

        .vx-buy-card-tagline {
          font-size: clamp(12px, 2.5vw, 14px);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .vx-buy-card-name {
          font-size: clamp(24px, 5vw, 32px);
          font-weight: 900;
          color: white;
          margin-bottom: 8px;
        }

        .vx-buy-card-desc {
          font-size: clamp(13px, 2.5vw, 15px);
          color: #94a3b8;
          line-height: 1.5;
        }

        .vx-buy-round-display {
          text-align: center;
          padding: clamp(20px, 4vw, 24px);
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: clamp(12px, 3vw, 16px);
          margin-bottom: clamp(20px, 4vw, 24px);
        }

        .vx-buy-round-display.vx-buy-round-bundle {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1));
          border-color: rgba(251, 191, 36, 0.4);
        }

        .vx-buy-round-text {
          font-size: clamp(28px, 6vw, 36px);
          font-weight: 900;
          color: white;
          margin-bottom: 4px;
        }

        .vx-buy-round-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border-radius: 999px;
          font-size: clamp(11px, 2.2vw, 13px);
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .vx-buy-round-subtext {
          font-size: clamp(12px, 2.5vw, 14px);
          color: #94a3b8;
        }

        .vx-buy-features {
          margin-bottom: clamp(20px, 4vw, 24px);
        }

        .vx-buy-feature {
          display: flex;
          align-items: center;
          gap: clamp(10px, 2vw, 12px);
          padding: clamp(10px, 2vw, 12px) 0;
          color: #cbd5e1;
          font-size: clamp(13px, 2.5vw, 15px);
          font-weight: 500;
        }

        .vx-buy-feature.highlight {
          color: white;
          font-weight: 700;
        }

        .vx-buy-feature-icon {
          width: clamp(18px, 3.5vw, 20px);
          height: clamp(18px, 3.5vw, 20px);
          color: #8b5cf6;
          flex-shrink: 0;
        }

        .vx-buy-feature.highlight .vx-buy-feature-icon {
          color: #fbbf24;
        }

        .vx-buy-btn {
          width: 100%;
          padding: clamp(14px, 3vw, 18px) clamp(20px, 4vw, 28px);
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          border: none;
          border-radius: clamp(10px, 2vw, 12px);
          font-size: clamp(15px, 3vw, 18px);
          font-weight: 800;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(8px, 2vw, 12px);
          transition: all 0.3s;
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
        }

        .vx-buy-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(139, 92, 246, 0.5);
        }

        .vx-buy-btn.popular {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          box-shadow: 0 10px 30px rgba(251, 191, 36, 0.4);
        }

        .vx-buy-btn.popular:hover:not(:disabled) {
          box-shadow: 0 15px 40px rgba(251, 191, 36, 0.6);
        }

        .vx-buy-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Benefits Section */
        .vx-buy-benefits {
          padding: clamp(40px, 6vw, 60px) 0;
        }

        .vx-buy-benefits-title {
          font-size: clamp(28px, 6vw, 40px);
          font-weight: 900;
          text-align: center;
          color: white;
          margin-bottom: clamp(32px, 5vw, 48px);
        }

        .vx-buy-benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
          gap: clamp(20px, 4vw, 24px);
        }

        .vx-buy-benefit {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8));
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: clamp(16px, 3vw, 20px);
          padding: clamp(24px, 4vw, 32px);
          text-align: center;
        }

        .vx-buy-benefit-icon {
          width: clamp(60px, 12vw, 72px);
          height: clamp(60px, 12vw, 72px);
          margin: 0 auto clamp(16px, 3vw, 20px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vx-buy-benefit-title {
          font-size: clamp(18px, 3.5vw, 22px);
          font-weight: 800;
          color: white;
          margin-bottom: clamp(8px, 2vw, 12px);
        }

        .vx-buy-benefit-text {
          font-size: clamp(13px, 2.5vw, 15px);
          color: #94a3b8;
          line-height: 1.6;
        }

        /* Mobile Optimizations */
        @media (max-width: 768px) {
          .vx-buy-header {
            justify-content: center;
            text-align: center;
          }

          .vx-buy-header-actions {
            justify-content: center;
            width: 100%;
          }

          .vx-buy-cards {
            grid-template-columns: 1fr;
          }

          .vx-buy-prize-header {
            justify-content: center;
            text-align: center;
          }
        }
      `}</style>

      <div className="vx-buy-page animate-fade-in">
        <div className="vx-buy-container">
          {/* Header */}
          <header className="vx-buy-header animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="vx-buy-logo">
              ⚡ VibraXX
            </div>
            <div className="vx-buy-header-actions">
              <div className="vx-buy-credits">
                <Sparkles size={18} />
                <span>{liveCredits} Rounds</span>
              </div>
              <button
                className={`vx-buy-music-btn ${isMusicPlaying ? "active" : ""}`}
                onClick={toggleMusic}
                aria-label={isMusicPlaying ? "Mute music" : "Play music"}>
                {isMusicPlaying ? <Volume2 size={22} /> : <VolumeX size={22} />}
              </button>
            </div>
          </header>

          <main>
            {/* Hero */}
            <div className="vx-buy-hero animate-slide-up-hero" style={{ animationDelay: "0.2s" }}>
              <h1 className="vx-buy-hero-title">
                Buy Quiz Rounds
              </h1>
              <p className="vx-buy-hero-subtitle">
                Choose your package and compete for the £1,000 monthly prize
              </p>
            </div>

            {/* Prize Pool Banner */}
            <div className="vx-buy-prize animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="vx-buy-prize-content">
                <div className="vx-buy-prize-header">
                  <div className="vx-buy-prize-icon">
                    <Gift style={{ width: "clamp(28px, 6vw, 36px)", height: "clamp(28px, 6vw, 36px)", color: "white" }} />
                  </div>
                  <div>
                    <div className="vx-buy-prize-title">Monthly Prize Pool</div>
                    <div className="vx-buy-prize-amount">£1,000</div>
                  </div>
                </div>

                <div className="vx-buy-prize-progress">
                  <div 
                    className="vx-buy-prize-bar"
                    style={{
                      width: `${Math.min((totalPurchases / PRIZE_UNLOCK_THRESHOLD) * 100, 100)}%`
                    }}
                  />
                </div>

                {totalPurchases >= PRIZE_UNLOCK_THRESHOLD ? (
                  <div style={{
                    textAlign: "center",
                    padding: "clamp(12px, 3vw, 16px)",
                    background: "rgba(34, 197, 94, 0.2)",
                    border: "1px solid rgba(34, 197, 94, 0.4)",
                    borderRadius: "clamp(8px, 2vw, 12px)",
                    marginBottom: "clamp(12px, 2vw, 16px)",
                  }}>
                    <CheckCircle2 style={{ width: "clamp(24px, 5vw, 32px)", height: "clamp(24px, 5vw, 32px)", color: "#22c55e", marginBottom: "8px" }} />
                    <span style={{
                      display: "block",
                      fontSize: "clamp(16px, 3.5vw, 20px)",
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
                      {totalPurchases.toLocaleString()} / {PRIZE_UNLOCK_THRESHOLD.toLocaleString()} Purchases
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
                        {(PRIZE_UNLOCK_THRESHOLD - totalPurchases).toLocaleString()} more to unlock!
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

            {/* Package Cards */}
            <div className="vx-buy-cards">
              {packages.map((pkg, index) => {
                const Icon = pkg.icon;
                const isProcessing = processingPackageId === pkg.id;
                const isSingle = pkg.id === 'pack_3';
                const isBundle = pkg.id === 'pack_25';

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

                    {/* Round Display */}
                    {pkg.id === 'pack_3' ? (
                      <div className="vx-buy-round-display">
                        <div className="vx-buy-round-text">1 Round</div>
                        <div className="vx-buy-round-subtext">Perfect for trying out</div>
                      </div>
                    ) : (
                      <div className="vx-buy-round-display vx-buy-round-bundle">
                        <div className="vx-buy-round-text">30 Rounds</div>
                        <div className="vx-buy-round-badge">
                          <Sparkles size={16} />
                          <span>40% OFF</span>
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
      </div>
    </>
  );
}
