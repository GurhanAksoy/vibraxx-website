"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
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
  ArrowRight,
  Target,
  Volume2,
  VolumeX,
  Shield,
  Percent,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ✅ FIXED: Updated pricing packages
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
      "50 Questions",
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
      "1,500 Questions", 
      "18% Savings (Save £11)",
      "Priority Support",
      "Extended Statistics",
      "Champion Badge",
    ],
    description: "Best value for champions",
  },
];

export default function BuyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userRounds, setUserRounds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPackageId, setProcessingPackageId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Audio
  useEffect(() => {
    const audio = new Audio("/sounds/vibraxx.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    
    if (!isMuted) {
      audio.play().catch(console.error);
    }

    return () => {
      audio.pause();
    };
  }, [isMuted]);

  // Fetch user
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        // ✅ Login yoksa Google OAuth aç (ana sayfaya atma!)
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?redirect=/buy`,
          },
        });
        return;
      }

      setUser(authUser);

      // ✅ FIXED: Using correct column name 'remaining'
      const { data: roundsData, error: roundsError } = await supabase
        .from("user_rounds")
        .select("remaining")
        .eq("user_id", authUser.id)
        .single();

      if (roundsError || !roundsData) {
        setUserRounds(0);
      } else {
        setUserRounds(roundsData.remaining || 0);
      }

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

  if (isLoading) {
    return (
      <div className="vx-loading">
        <div className="vx-spinner" />
        <style jsx>{`
          .vx-loading {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            display: flex;
            align-items: center;
            justifyContent: center;
          }
          .vx-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(139, 92, 246, 0.3);
            border-top-color: #8b5cf6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
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
        
        .vx-buy-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
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
          height: 80px;
        }

        .vx-buy-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: transform 0.3s;
          min-width: 0;
        }
        .vx-buy-logo:hover { transform: scale(1.05); }

        .vx-buy-logo-outer {
          position: relative;
          width: 90px;
          height: 90px;
          border-radius: 9999px;
          padding: 4px;
          background: radial-gradient(circle at 0 0, #7c3aed, #d946ef);
          box-shadow: 0 0 30px rgba(124, 58, 237, 0.6);
          flex-shrink: 0;
        }

        .vx-buy-logo-glow {
          position: absolute;
          inset: -5px;
          border-radius: 9999px;
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
          border-radius: 9999px;
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
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .vx-buy-logo-label {
          font-size: 13px;
          color: #c4b5fd;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          white-space: nowrap;
        }

        @keyframes glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }

        .vx-buy-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .vx-buy-audio-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 2px solid rgba(139, 92, 246, 0.5);
          background: rgba(139, 92, 246, 0.2);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        .vx-buy-audio-btn:hover {
          background: rgba(139, 92, 246, 0.4);
          transform: scale(1.05);
        }

        .vx-buy-back-btn {
          padding: 10px 20px;
          border-radius: 12px;
          border: 2px solid rgba(139, 92, 246, 0.5);
          background: rgba(139, 92, 246, 0.2);
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .vx-buy-back-btn:hover {
          background: rgba(139, 92, 246, 0.4);
          transform: translateY(-2px);
        }

        .vx-buy-main {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px);
        }

        .vx-buy-hero {
          text-align: center;
          margin-bottom: clamp(40px, 8vw, 60px);
        }

        .vx-buy-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 20px;
          background: rgba(251, 191, 36, 0.15);
          border: 1px solid rgba(251, 191, 36, 0.4);
          margin-bottom: 24px;
          font-size: 12px;
          font-weight: 700;
          color: #fbbf24;
          letter-spacing: 0.05em;
        }

        .vx-buy-title {
          font-size: clamp(36px, 8vw, 56px);
          font-weight: 900;
          margin-bottom: 16px;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .vx-buy-title-gradient {
          display: inline-block;
          background: linear-gradient(90deg, #7c3aed, #22d3ee, #f97316, #d946ef, #7c3aed);
          background-size: 250% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 250% center; }
        }

        .vx-buy-subtitle {
          font-size: clamp(16px, 3vw, 20px);
          color: #94a3b8;
          max-width: 700px;
          margin: 0 auto 24px;
          line-height: 1.6;
        }

        .vx-buy-trust {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 24px;
        }

        .vx-buy-trust-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          font-size: 12px;
          color: #4ade80;
          font-weight: 600;
        }

        .vx-buy-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
          gap: clamp(24px, 4vw, 32px);
          margin-bottom: clamp(40px, 6vw, 50px);
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
        }

        .vx-buy-card {
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.95) 100%);
          border-radius: 20px;
          border: 2px solid rgba(100, 116, 139, 0.3);
          overflow: hidden;
          backdrop-filter: blur(20px);
          transition: all 0.3s ease;
          position: relative;
        }

        .vx-buy-card.popular {
          border-color: rgba(139, 92, 246, 0.6);
          box-shadow: 0 20px 60px rgba(139, 92, 246, 0.4);
        }

        .vx-buy-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 30px 80px rgba(139, 92, 246, 0.5);
        }

        .vx-buy-ribbon {
          position: absolute;
          top: 16px;
          right: -8px;
          padding: 6px 16px 6px 20px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          font-size: 11px;
          font-weight: 900;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.6);
          z-index: 10;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 8px 100%, 0 50%);
        }

        .vx-buy-card-header {
          padding: 28px 28px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .vx-buy-card.popular .vx-buy-card-header {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), transparent);
        }

        .vx-buy-card-top {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }

        .vx-buy-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .vx-buy-card-name {
          font-size: 20px;
          font-weight: 900;
          margin-bottom: 4px;
          line-height: 1.2;
        }

        .vx-buy-card-desc {
          font-size: 13px;
          color: #94a3b8;
        }

        .vx-buy-price-box {
          background: rgba(15, 23, 42, 0.6);
          padding: 24px 20px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          text-align: center;
          position: relative;
        }

        .vx-buy-card.popular .vx-buy-price-box {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(217, 70, 239, 0.15));
          border-color: rgba(139, 92, 246, 0.3);
        }

        .vx-buy-savings {
          position: absolute;
          top: -10px;
          right: 12px;
          padding: 5px 12px;
          border-radius: 10px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          font-size: 11px;
          font-weight: 900;
          color: white;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .vx-buy-price {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 4px;
          margin-bottom: 12px;
        }

        .vx-buy-currency {
          font-size: 32px;
          font-weight: 900;
          color: #a78bfa;
          line-height: 1;
          margin-top: 4px;
        }

        .vx-buy-card.popular .vx-buy-currency {
          color: #c4b5fd;
        }

        .vx-buy-amount {
          font-size: clamp(56px, 12vw, 68px);
          font-weight: 900;
          color: white;
          line-height: 0.9;
          letter-spacing: -0.03em;
        }

        .vx-buy-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 12px;
        }

        .vx-buy-rounds-info {
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .vx-buy-rounds-count {
          font-size: 15px;
          color: #e2e8f0;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .vx-buy-per-round {
          font-size: 12px;
          color: #94a3b8;
        }

        .vx-buy-card-content {
          padding: 24px 28px;
        }

        .vx-buy-features-title {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 16px;
        }

        .vx-buy-features {
          list-style: none;
        }

        .vx-buy-feature {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #cbd5e1;
          font-weight: 500;
        }

        .vx-buy-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .vx-buy-card-footer {
          padding: 0 28px 28px;
        }

        .vx-buy-btn {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #475569, #64748b);
          color: white;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .vx-buy-card.popular .vx-buy-btn {
          background: linear-gradient(135deg, #8b5cf6, #d946ef);
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
        }

        .vx-buy-btn:hover {
          transform: translateY(-2px);
        }

        .vx-buy-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .vx-buy-benefits {
          padding: clamp(32px, 6vw, 40px);
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 27, 75, 0.6));
          border: 2px solid rgba(139, 92, 246, 0.3);
          backdrop-filter: blur(20px);
          margin-bottom: clamp(30px, 6vw, 40px);
        }

        .vx-buy-benefits-title {
          font-size: clamp(24px, 5vw, 32px);
          font-weight: 900;
          margin-bottom: 12px;
          text-align: center;
        }

        .vx-buy-benefits-subtitle {
          font-size: 15px;
          color: #94a3b8;
          text-align: center;
          margin-bottom: 32px;
        }

        .vx-buy-benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
          gap: 20px;
        }

        .vx-buy-benefit {
          padding: 20px;
          border-radius: 16px;
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
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }

        .vx-buy-benefit-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .vx-buy-benefit-text {
          font-size: 13px;
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
          font-size: clamp(11px, 2vw, 13px);
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
          font-size: clamp(11px, 2vw, 13px);
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
          font-size: clamp(11px, 2vw, 13px);
          line-height: 1.6;
          text-align: center;
        }

        .vx-buy-footer-email {
          color: #a78bfa;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
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
                <span className="vx-buy-logo-label">Live Quiz</span>
              </div>
            </div>

            <div className="vx-buy-right">
              <button className="vx-buy-audio-btn" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
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
              Compete for the <strong style={{ color: "#fbbf24" }}>£1,000 monthly prize</strong> when we reach 3000+ active participants
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

          {/* Cards */}
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
                    <div className="vx-buy-card-top">
                      <div
                        className="vx-buy-icon"
                        style={{
                          background: pkg.popular
                            ? "linear-gradient(135deg, #8b5cf6, #d946ef)"
                            : "linear-gradient(135deg, #3b82f6, #06b6d4)",
                          boxShadow: pkg.popular
                            ? "0 8px 24px rgba(139, 92, 246, 0.4)"
                            : "0 8px 24px rgba(59, 130, 246, 0.4)",
                        }}
                      >
                        <Icon size={26} color="white" />
                      </div>

                      <div>
                        <div className="vx-buy-card-name">{pkg.name}</div>
                        <div className="vx-buy-card-desc">{pkg.description}</div>
                      </div>
                    </div>

                    <div className="vx-buy-price-box">
                      {pkg.savings > 0 && (
                        <div className="vx-buy-savings">
                          <Percent size={11} />
                          {pkg.savings}% OFF
                        </div>
                      )}

                      <div className="vx-buy-price">
                        <span className="vx-buy-currency">£</span>
                        <span className="vx-buy-amount">{pkg.price}</span>
                      </div>

                      <div className="vx-buy-label">One-time payment</div>

                      <div className="vx-buy-rounds-info">
                        <div className="vx-buy-rounds-count">
                          {pkg.rounds} Quiz Round{pkg.rounds > 1 ? "s" : ""}
                        </div>
                        <div className="vx-buy-per-round">
                          £{(pkg.price / pkg.rounds).toFixed(2)} per round
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="vx-buy-card-content">
                    <div className="vx-buy-features-title">What's Included</div>
                    <ul className="vx-buy-features">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="vx-buy-feature">
                          <div className="vx-buy-check">
                            <Check size={12} color="white" strokeWidth={3} />
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="vx-buy-card-footer">
                    <button
                      className="vx-buy-btn"
                      onClick={() => handlePurchase(pkg)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <ShoppingCart size={20} />
                          Get Started Now
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Benefits */}
          <div className="vx-buy-benefits">
            <h2 className="vx-buy-benefits-title">Why VibraXX?</h2>
            <p className="vx-buy-benefits-subtitle">Professional quiz platform with premium features</p>

            <div className="vx-buy-benefits-grid">
              {[
                { icon: Trophy, title: "£1,000 Prize Pool", text: "Monthly rewards at 3000+ players", color: "#fbbf24" },
                { icon: Zap, title: "Instant Access", text: "Play immediately after purchase", color: "#06b6d4" },
                { icon: Users, title: "Global Leaderboard", text: "Compete with players worldwide", color: "#8b5cf6" },
                { icon: Target, title: "Detailed Analytics", text: "Track your progress & rankings", color: "#ec4899" },
              ].map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <div key={i} className="vx-buy-benefit">
                    <div className="vx-buy-benefit-icon" style={{ background: `${benefit.color}20`, border: `1px solid ${benefit.color}40` }}>
                      <Icon size={24} color={benefit.color} />
                    </div>
                    <div className="vx-buy-benefit-title">{benefit.title}</div>
                    <div className="vx-buy-benefit-text">{benefit.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="vx-buy-footer">
          <div className="vx-buy-footer-inner">
            <div className="vx-buy-footer-disclaimer">
              <strong style={{ color: "#94a3b8" }}>Educational Quiz Competition.</strong> 18+ only. 
              This is a 100% skill-based knowledge competition with no element of chance. 
              Entry fees apply. Prize pool activates with 3000+ monthly participants. See{" "}
              <a href="/terms" style={{ color: "#a78bfa", textDecoration: "underline" }}>Terms & Conditions</a> for full details.
            </div>

            <nav className="vx-buy-footer-links">
              {[
                { href: "/privacy", text: "Privacy Policy" },
                { href: "/terms", text: "Terms & Conditions" },
                { href: "/cookies", text: "Cookie Policy" },
                { href: "/how-it-works", text: "How It Works" },
                { href: "/rules", text: "Quiz Rules" },
                { href: "/complaints", text: "Complaints" },
                { href: "/refunds", text: "Refund Policy" },
                { href: "/about", text: "About Us" },
                { href: "/contact", text: "Contact" },
                { href: "/faq", text: "FAQ" },
              ].map((link, i, arr) => (
                <>
                  <a key={link.href} href={link.href} className="vx-buy-footer-link">{link.text}</a>
                  {i < arr.length - 1 && <span className="vx-buy-footer-sep">•</span>}
                </>
              ))}
            </nav>

            <div className="vx-buy-footer-company">
              <div style={{ marginBottom: 8 }}>© 2025 VibraXX. Operated by Sermin Limited (UK)</div>
              <div style={{ fontSize: 11, marginBottom: 8 }}>Registered in England & Wales | All rights reserved</div>
              <div style={{ marginBottom: 10 }}>
                <a href="mailto:team@vibraxx.com" className="vx-buy-footer-email">team@vibraxx.com</a>
              </div>
              <div style={{ fontSize: 11 }}>
                Payment processing by <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" style={{ color: "#a78bfa", textDecoration: "none" }}>Stripe</a>
                {" "}| Secure SSL encryption | Skill-based competition - Not gambling
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
