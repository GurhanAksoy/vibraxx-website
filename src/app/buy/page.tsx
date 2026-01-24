"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Crown,
  Zap,
  Check,
  TrendingUp,
  Users,
  Trophy,
  Sparkles,
  Lock,
  Unlock,
  ChevronRight,
  Rocket,
  ShoppingCart,
  CheckCircle2,
  ArrowRight,
  Target,
  Volume2,
  VolumeX,
  Shield,
  Percent,
  Gift,
  Flame,
} from "lucide-react";

// ✅ UPDATED: 20 questions per round (not 50)
const packages = [
  {
    id: "single",
    name: "Single Round",
    price: 2,
    originalPrice: null,
    rounds: 1,
    popular: false,
    savings: 0,
    icon: Zap,
    features: [
      "1 Quiz Round",
      "20 Questions",
      "Instant Access",
      "Leaderboard Entry",
      "Score Tracking",
    ],
    description: "Perfect for trying out",
  },
  {
    id: "bundle",
    name: "Champion Bundle",
    price: 49,
    originalPrice: 60,
    rounds: 30,
    popular: true,
    savings: 18,
    icon: Crown,
    features: [
      "30 Quiz Rounds",
      "600 Questions", // ✅ 30 x 20 = 600
      "18% Savings (Save £11)",
      "Priority Support",
      "Extended Statistics",
      "Champion Badge",
    ],
    description: "Best value for champions",
  },
];

// ✅ Prize unlock threshold
const PRIZE_UNLOCK_TARGET = 3000;

export default function BuyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [liveCredits, setLiveCredits] = useState(0);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPackageId, setProcessingPackageId] = useState<string | null>(null);
  
  // Music State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ✅ BACKGROUND MUSIC (same as leaderboard)
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

  // Handle first interaction
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

  // Handle music play/pause
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

  // ✅ FETCH USER DATA (Updated Supabase Schema)
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        // ✅ Redirect to Google OAuth
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?redirect=/buy`,
          },
        });
        return;
      }

      setUser(authUser);

      // ✅ FIXED: Using user_credits table (not user_rounds)
      const { data: creditsData } = await supabase
        .from("user_credits")
        .select("live_credits")
        .eq("user_id", authUser.id)
        .single();

      setLiveCredits(creditsData?.live_credits || 0);

      // ✅ Get total purchases for prize unlock
      const { data: purchaseData } = await supabase
        .from("premium_purchases")
        .select("id", { count: "exact" });

      setTotalPurchases(purchaseData?.length || 0);

      setIsLoading(false);
    };

    loadUser();
  }, [router]);

  const handlePurchase = async (pkg: typeof packages[0]) => {
    if (!user) {
      router.push("/");
      return;
    }

    setProcessingPackageId(pkg.id);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: `price_${pkg.id}`,
          userId: user.id,
          rounds: pkg.rounds,
          packageName: pkg.name,
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

  // ✅ Prize unlock progress
  const prizeProgress = Math.min((totalPurchases / PRIZE_UNLOCK_TARGET) * 100, 100);
  const isPrizeUnlocked = totalPurchases >= PRIZE_UNLOCK_TARGET;

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
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

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
          justify-content: space-between;
          height: clamp(60px, 12vw, 80px);
          gap: 16px;
        }

        .vx-buy-logo {
          display: flex;
          align-items: center;
          gap: 10px;
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
          justifyContent: center;
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
          gap: 12px;
        }

        .vx-buy-audio-btn,
        .vx-buy-back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          borderRadius: 12px;
          border: 2px solid rgba(139, 92, 246, 0.5);
          background: rgba(15, 23, 42, 0.8);
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
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
          padding: clamp(30px, 6vw, 60px) clamp(16px, 4vw, 24px);
        }

        .vx-buy-hero {
          text-align: center;
          margin-bottom: clamp(40px, 8vw, 60px);
        }

        .vx-buy-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.15));
          border: 1px solid rgba(251, 191, 36, 0.5);
          border-radius: 999px;
          font-size: clamp(10px, 2vw, 12px);
          font-weight: 700;
          color: #fbbf24;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: clamp(16px, 3vw, 20px);
        }

        .vx-buy-title {
          font-size: clamp(32px, 7vw, 48px);
          font-weight: 900;
          margin-bottom: clamp(16px, 3vw, 20px);
          line-height: 1.2;
        }

        .vx-buy-title-gradient {
          background: linear-gradient(90deg, #a78bfa, #f0abfc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .vx-buy-subtitle {
          font-size: clamp(14px, 3vw, 16px);
          color: #cbd5e1;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto clamp(20px, 4vw, 24px);
        }

        .vx-buy-trust {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: clamp(12px, 3vw, 16px);
        }

        .vx-buy-trust-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 8px;
          font-size: clamp(11px, 2.2vw, 13px);
          font-weight: 600;
          color: #86efac;
        }

        /* ✅ PRIZE UNLOCK SECTION */
        .vx-prize-unlock {
          max-width: 800px;
          margin: 0 auto clamp(40px, 8vw, 60px);
          padding: clamp(24px, 5vw, 32px);
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1));
          border: 2px solid rgba(251, 191, 36, 0.5);
          border-radius: clamp(16px, 3vw, 20px);
          box-shadow: 0 0 40px rgba(251, 191, 36, 0.3);
        }

        .vx-prize-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: clamp(16px, 3vw, 20px);
          flex-wrap: wrap;
          gap: 12px;
        }

        .vx-prize-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: clamp(18px, 4vw, 22px);
          font-weight: 900;
          color: #fbbf24;
        }

        .vx-prize-amount {
          font-size: clamp(24px, 5vw, 32px);
          font-weight: 900;
          color: #fbbf24;
          text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
        }

        .vx-prize-progress-bar {
          position: relative;
          width: 100%;
          height: clamp(40px, 8vw, 50px);
          background: rgba(15, 23, 42, 0.8);
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: clamp(12px, 3vw, 16px);
          border: 2px solid rgba(251, 191, 36, 0.3);
        }

        .vx-prize-progress-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: linear-gradient(90deg, #f59e0b, #fbbf24, #fcd34d);
          transition: width 1s ease;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.6);
        }

        .vx-prize-progress-text {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          font-size: clamp(14px, 3vw, 16px);
          font-weight: 800;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .vx-prize-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: clamp(12px, 3vw, 14px);
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 12px;
          font-size: clamp(12px, 2.5vw, 14px);
          font-weight: 700;
          color: #fbbf24;
          text-align: center;
        }

        .vx-prize-unlocked {
          background: rgba(34, 197, 94, 0.2);
          border-color: rgba(34, 197, 94, 0.5);
          color: #22c55e;
        }

        .vx-buy-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
          gap: clamp(20px, 4vw, 30px);
          margin-bottom: clamp(40px, 8vw, 60px);
        }

        .vx-buy-card {
          position: relative;
          background: linear-gradient(135deg, rgba(30, 27, 75, 0.98), rgba(15, 23, 42, 0.98));
          border: 2px solid rgba(139, 92, 246, 0.3);
          border-radius: clamp(16px, 3vw, 20px);
          padding: clamp(24px, 5vw, 32px);
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
        }

        .vx-buy-card:hover {
          border-color: #a78bfa;
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(139, 92, 246, 0.4);
        }

        .vx-buy-card.popular {
          border-color: #fbbf24;
          box-shadow: 0 0 40px rgba(251, 191, 36, 0.3);
        }

        .vx-buy-ribbon {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #0f172a;
          padding: 6px 16px;
          border-radius: 999px;
          font-size: clamp(10px, 2vw, 11px);
          font-weight: 800;
          letter-spacing: 0.1em;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.5);
        }

        .vx-buy-card-header {
          text-align: center;
          margin-bottom: clamp(20px, 4vw, 24px);
        }

        .vx-buy-icon {
          width: clamp(48px, 10vw, 64px);
          height: clamp(48px, 10vw, 64px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto clamp(16px, 3vw, 20px);
          background: linear-gradient(135deg, #7c3aed, #d946ef);
          box-shadow: 0 0 30px rgba(124, 58, 237, 0.5);
        }

        .vx-buy-card-name {
          font-size: clamp(20px, 4vw, 24px);
          font-weight: 800;
          margin-bottom: 8px;
          color: #e5e7eb;
        }

        .vx-buy-card-desc {
          font-size: clamp(12px, 2.5vw, 13px);
          color: #94a3b8;
        }

        .vx-buy-pricing {
          text-align: center;
          margin-bottom: clamp(20px, 4vw, 24px);
        }

        .vx-buy-original-price {
          font-size: clamp(14px, 3vw, 16px);
          color: #64748b;
          text-decoration: line-through;
          margin-bottom: 4px;
        }

        .vx-buy-price {
          font-size: clamp(40px, 8vw, 56px);
          font-weight: 900;
          color: #fbbf24;
          line-height: 1;
        }

        .vx-buy-savings {
          margin-top: 8px;
          padding: 6px 12px;
          background: rgba(34, 197, 94, 0.2);
          border: 1px solid rgba(34, 197, 94, 0.5);
          border-radius: 8px;
          display: inline-block;
          font-size: clamp(12px, 2.5vw, 13px);
          font-weight: 700;
          color: #86efac;
        }

        .vx-buy-features {
          flex: 1;
          margin-bottom: clamp(20px, 4vw, 24px);
        }

        .vx-buy-feature {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          font-size: clamp(13px, 2.8vw, 14px);
          color: #cbd5e1;
        }

        .vx-buy-feature-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          color: #22c55e;
        }

        .vx-buy-btn {
          width: 100%;
          padding: clamp(14px, 3vw, 16px);
          background: linear-gradient(135deg, #7c3aed, #d946ef);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: clamp(14px, 3vw, 16px);
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 0 30px rgba(124, 58, 237, 0.5);
        }

        .vx-buy-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 40px rgba(124, 58, 237, 0.7);
        }

        .vx-buy-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .vx-buy-btn.popular {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          box-shadow: 0 0 30px rgba(251, 191, 36, 0.5);
        }

        .vx-buy-btn.popular:hover:not(:disabled) {
          box-shadow: 0 0 40px rgba(251, 191, 36, 0.7);
        }

        .vx-buy-benefits {
          max-width: 900px;
          margin: 0 auto clamp(40px, 8vw, 60px);
        }

        .vx-buy-benefits-title {
          text-align: center;
          font-size: clamp(24px, 5vw, 32px);
          font-weight: 900;
          margin-bottom: clamp(30px, 6vw, 40px);
          color: #e5e7eb;
        }

        .vx-buy-benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
          gap: clamp(16px, 3vw, 20px);
        }

        .vx-buy-benefit {
          padding: clamp(20px, 4vw, 24px);
          border-radius: clamp(14px, 3vw, 16px);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s;
          text-align: center;
        }

        .vx-buy-benefit:hover {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.4);
          transform: translateY(-4px);
        }

        .vx-buy-benefit-icon {
          width: clamp(44px, 9vw, 48px);
          height: clamp(44px, 9vw, 48px);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto clamp(10px, 2vw, 12px);
        }

        .vx-buy-benefit-title {
          font-size: clamp(14px, 3vw, 16px);
          font-weight: 700;
          margin-bottom: 6px;
          color: #e5e7eb;
        }

        .vx-buy-benefit-text {
          font-size: clamp(12px, 2.5vw, 13px);
          color: #94a3b8;
          line-height: 1.5;
        }

        .vx-buy-footer {
          position: relative;
          z-index: 10;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(20px);
          padding: clamp(30px, 5vw, 50px) 0;
        }

        .vx-buy-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 24px);
        }

        .vx-buy-footer-disclaimer {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 12px;
          padding: clamp(16px, 3vw, 20px);
          margin-bottom: clamp(24px, 4vw, 32px);
          font-size: clamp(11px, 2.2vw, 13px);
          line-height: 1.6;
          color: #cbd5e1;
          text-align: center;
        }

        .vx-buy-footer-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: clamp(8px, 2vw, 12px);
          margin-bottom: clamp(24px, 4vw, 32px);
        }

        .vx-buy-footer-link {
          color: #94a3b8;
          text-decoration: none;
          font-size: clamp(11px, 2.2vw, 13px);
          font-weight: 500;
          transition: color 0.3s;
          white-space: nowrap;
        }

        .vx-buy-footer-link:hover {
          color: #a78bfa;
        }

        .vx-buy-footer-sep {
          color: rgba(148, 163, 184, 0.3);
          font-size: clamp(10px, 2vw, 12px);
        }

        .vx-buy-footer-company {
          color: #64748b;
          font-size: clamp(11px, 2.2vw, 13px);
          line-height: 1.6;
          text-align: center;
        }

        @media (max-width: 768px) {
          .mobile-hide { display: none !important; }
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
          <div className="vx-buy-hero">
            <div className="vx-buy-badge">
              <Sparkles size={16} />
              LIMITED TIME OFFER
            </div>

            <h1 className="vx-buy-title">
              <span className="vx-buy-title-gradient">Choose Your Plan</span>
            </h1>

            <p className="vx-buy-subtitle">
              Join the competition for the <strong style={{ color: "#fbbf24" }}>£1,000 monthly prize</strong>
            </p>

            <div className="vx-buy-trust">
              <div className="vx-buy-trust-badge">
                <Shield size={14} />
                Secure Payment
              </div>
              <div className="vx-buy-trust-badge">
                <Lock size={14} />
                SSL Encrypted
              </div>
              <div className="vx-buy-trust-badge">
                <CheckCircle2 size={14} />
                Instant Access
              </div>
            </div>
          </div>

          {/* ✅ PRIZE UNLOCK SECTION */}
          <div className="vx-prize-unlock">
            <div className="vx-prize-header">
              <div className="vx-prize-title">
                {isPrizeUnlocked ? (
                  <>
                    <Unlock size={24} />
                    Monthly Prize Pool
                  </>
                ) : (
                  <>
                    <Lock size={24} />
                    Prize Unlocking Soon
                  </>
                )}
              </div>
              <div className="vx-prize-amount">£1,000</div>
            </div>

            <div className="vx-prize-progress-bar">
              <div className="vx-prize-progress-fill" style={{ width: `${prizeProgress}%` }} />
              <div className="vx-prize-progress-text">
                {totalPurchases.toLocaleString()} / {PRIZE_UNLOCK_TARGET.toLocaleString()} Purchases
              </div>
            </div>

            <div className={`vx-prize-status ${isPrizeUnlocked ? "vx-prize-unlocked" : ""}`}>
              {isPrizeUnlocked ? (
                <>
                  <Trophy size={18} />
                  Prize Pool Active! Compete now for £1,000 monthly!
                </>
              ) : (
                <>
                  <Target size={18} />
                  {(PRIZE_UNLOCK_TARGET - totalPurchases).toLocaleString()} more purchases to unlock the prize pool!
                </>
              )}
            </div>
          </div>

          {/* Package Cards */}
          <div className="vx-buy-cards">
            {packages.map((pkg) => {
              const Icon = pkg.icon;
              const isProcessing = processingPackageId === pkg.id;

              return (
                <div key={pkg.id} className={`vx-buy-card ${pkg.popular ? "popular" : ""}`}>
                  {pkg.popular && (
                    <div className="vx-buy-ribbon">
                      BEST VALUE
                    </div>
                  )}

                  <div className="vx-buy-card-header">
                    <div
                      className="vx-buy-icon"
                      style={{
                        background: pkg.popular
                          ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                          : "linear-gradient(135deg, #7c3aed, #d946ef)"
                      }}>
                      <Icon size={32} color="white" />
                    </div>
                    <h3 className="vx-buy-card-name">{pkg.name}</h3>
                    <p className="vx-buy-card-desc">{pkg.description}</p>
                  </div>

                  <div className="vx-buy-pricing">
                    {pkg.originalPrice && (
                      <div className="vx-buy-original-price">£{pkg.originalPrice}</div>
                    )}
                    <div className="vx-buy-price">£{pkg.price}</div>
                    {pkg.savings > 0 && (
                      <div className="vx-buy-savings">
                        <Percent size={14} />
                        Save {pkg.savings}% (£{pkg.originalPrice! - pkg.price})
                      </div>
                    )}
                  </div>

                  <div className="vx-buy-features">
                    {pkg.features.map((feature, idx) => (
                      <div key={idx} className="vx-buy-feature">
                        <Check size={20} className="vx-buy-feature-icon" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePurchase(pkg)}
                    disabled={isProcessing}
                    className={`vx-buy-btn ${pkg.popular ? "popular" : ""}`}>
                    {isProcessing ? (
                      <>
                        <div style={{
                          width: "18px",
                          height: "18px",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "white",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite"
                        }} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} />
                        Buy Now
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Benefits */}
          <div className="vx-buy-benefits">
            <h2 className="vx-buy-benefits-title">Why VibraXX?</h2>
            <div className="vx-buy-benefits-grid">
              <div className="vx-buy-benefit">
                <div className="vx-buy-benefit-icon" style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>
                  <Trophy size={24} color="white" />
                </div>
                <div className="vx-buy-benefit-title">Skill-Based Competition</div>
                <div className="vx-buy-benefit-text">
                  Test your knowledge and compete based on pure skill
                </div>
              </div>

              <div className="vx-buy-benefit">
                <div className="vx-buy-benefit-icon" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                  <Users size={24} color="white" />
                </div>
                <div className="vx-buy-benefit-title">Fair Play Guaranteed</div>
                <div className="vx-buy-benefit-text">
                  UK-regulated platform with transparent rules
                </div>
              </div>

              <div className="vx-buy-benefit">
                <div className="vx-buy-benefit-icon" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                  <TrendingUp size={24} color="white" />
                </div>
                <div className="vx-buy-benefit-title">Track Your Progress</div>
                <div className="vx-buy-benefit-text">
                  Real-time statistics and performance analytics
                </div>
              </div>

              <div className="vx-buy-benefit">
                <div className="vx-buy-benefit-icon" style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
                  <Rocket size={24} color="white" />
                </div>
                <div className="vx-buy-benefit-title">Instant Access</div>
                <div className="vx-buy-benefit-text">
                  Start playing immediately after purchase
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="vx-buy-footer">
          <div className="vx-buy-footer-inner">
            <div className="vx-buy-footer-disclaimer">
              <strong>Important:</strong> VibraXX is a skill-based quiz competition regulated under UK law. 
              Participation requires knowledge and strategy. Players must be 18+ and located in the UK. 
              The £1,000 monthly prize is awarded when 3,000+ active purchases are reached. 
              See Terms & Conditions for full details.
            </div>

            <div className="vx-buy-footer-links">
              <a href="/terms" className="vx-buy-footer-link">Terms & Conditions</a>
              <span className="vx-buy-footer-sep">•</span>
              <a href="/privacy" className="vx-buy-footer-link">Privacy Policy</a>
              <span className="vx-buy-footer-sep">•</span>
              <a href="/rules" className="vx-buy-footer-link">Competition Rules</a>
              <span className="vx-buy-footer-sep">•</span>
              <a href="/contact" className="vx-buy-footer-link">Contact Support</a>
            </div>

            <div className="vx-buy-footer-company">
              © 2025 VibraXX • Operated by Sermin Limited (UK Company No. 16088119)<br />
              Registered Office: 167-169 Great Portland Street, London, W1W 5PF<br />
              Contact: <a href="mailto:team@vibraxx.com" className="vx-buy-footer-link">team@vibraxx.com</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
