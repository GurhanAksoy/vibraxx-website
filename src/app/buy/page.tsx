"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Crown,
  Zap,
  Gift,
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
  Clock,
} from "lucide-react";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Pricing packages
const packages = [
  {
    id: "single",
    name: "Single Round",
    price: 1,
    currency: "£",
    rounds: 1,
    pricePerRound: 1.0,
    popular: false,
    savings: 0,
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    bgGlow: "rgba(56, 189, 248, 0.3)",
    features: [
      "1 Quiz Round",
      "50 Questions",
      "Instant Play",
      "Leaderboard Entry",
      "Score Tracking",
    ],
    description: "Try it out",
    stripePriceId: "price_single_round",
  },
  {
    id: "bundle",
    name: "Champion Bundle",
    price: 29,
    currency: "£",
    rounds: 35,
    pricePerRound: 0.83,
    popular: true,
    savings: 17,
    icon: Crown,
    color: "from-purple-500 to-pink-500",
    bgGlow: "rgba(168, 85, 247, 0.4)",
    features: [
      "35 Quiz Rounds",
      "1,750 Questions",
      "17% Savings (£6 off)",
      "Priority Support",
      "Extended Stats",
      "Champion Badge",
    ],
    description: "Best value",
    stripePriceId: "price_champion_bundle",
  },
];

export default function BuyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userRounds, setUserRounds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPackageId, setProcessingPackageId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Audio setup
  useEffect(() => {
    const bgAudio = new Audio("/sounds/vibraxx.mp3");
    bgAudio.loop = true;
    bgAudio.volume = 0.3;
    setAudio(bgAudio);

    return () => {
      bgAudio.pause();
    };
  }, []);

  const toggleMute = () => {
    if (audio) {
      if (isMuted) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  // Fetch user and rounds
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        router.push("/");
        return;
      }

      setUser(authUser);

      const { data: roundsData, error: roundsError } = await supabase
        .from("user_rounds")
        .select("available_rounds")
        .eq("user_id", authUser.id)
        .single();

      if (!roundsError && roundsData) {
        setUserRounds(roundsData.available_rounds || 0);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: pkg.stripePriceId,
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
          animation: "spin 1s linear infinite",
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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
      position: "relative",
      overflow: "hidden",
      color: "white",
    }}>
      
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
        .animate-pop-in {
          animation: popIn 0.5s ease-out;
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }

        @media (max-width: 768px) {
          .mobile-hide { display: none !important; }
        }

        * {
          box-sizing: border-box;
        }
        
        body {
          overflow-x: hidden;
        }
      `}</style>

      {/* Background Effects */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(217, 70, 239, 0.15) 0%, transparent 50%)",
        pointerEvents: "none",
      }} />

      {/* Animated Grid Pattern */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
        opacity: 0.5,
        pointerEvents: "none",
      }} />

      {/* Header */}
      <header style={{
        position: "relative",
        zIndex: 10,
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(20px)",
        background: "rgba(15, 23, 42, 0.8)",
      }}>
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 clamp(16px, 4vw, 24px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "80px",
        }}>
          {/* Logo */}
          <div
            onClick={() => router.push("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <div style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #d946ef)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 30px rgba(139, 92, 246, 0.6)",
            }}>
              <img src="/images/logo.png" alt="VibraXX" style={{ width: "30px", height: "30px" }} />
            </div>
            <div className="mobile-hide">
              <div style={{ fontSize: "18px", fontWeight: 700 }}>VIBRAXX</div>
              <div style={{ fontSize: "10px", color: "#94a3b8", letterSpacing: "0.05em" }}>PREMIUM PLANS</div>
            </div>
          </div>

          {/* Right Side */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            {/* Audio Toggle */}
            <button
              onClick={toggleMute}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                border: "2px solid rgba(139, 92, 246, 0.5)",
                background: "rgba(139, 92, 246, 0.2)",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(139, 92, 246, 0.4)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(139, 92, 246, 0.2)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {isMuted ? (
                <VolumeX style={{ width: "20px", height: "20px" }} />
              ) : (
                <Volume2 style={{ width: "20px", height: "20px" }} />
              )}
            </button>

            {/* User Rounds */}
            <div style={{
              padding: "8px 16px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.15))",
              border: "2px solid rgba(251, 191, 36, 0.5)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 0 20px rgba(251, 191, 36, 0.3)",
            }}>
              <Gift style={{ width: "20px", height: "20px", color: "#fbbf24" }} />
              <span style={{ fontSize: "16px", fontWeight: 900, color: "#fbbf24" }}>
                {userRounds}
              </span>
              <span className="mobile-hide" style={{ fontSize: "12px", color: "#fcd34d" }}>
                rounds
              </span>
            </div>

            {/* Back Button */}
            <button
              onClick={() => router.push("/")}
              style={{
                padding: "10px 20px",
                borderRadius: "12px",
                border: "2px solid rgba(139, 92, 246, 0.5)",
                background: "rgba(139, 92, 246, 0.2)",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(139, 92, 246, 0.4)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(139, 92, 246, 0.2)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <ChevronRight style={{ width: "16px", height: "16px", transform: "rotate(180deg)" }} />
              <span className="mobile-hide">Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        position: "relative",
        zIndex: 1,
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px)",
      }}>
        
        {/* Hero Section - Corporate */}
        <div className="animate-slide-up" style={{
          textAlign: "center",
          marginBottom: "clamp(40px, 8vw, 60px)",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            borderRadius: "20px",
            background: "rgba(251, 191, 36, 0.15)",
            border: "1px solid rgba(251, 191, 36, 0.4)",
            marginBottom: "24px",
            fontSize: "12px",
            fontWeight: 700,
            color: "#fbbf24",
            letterSpacing: "0.05em",
          }}>
            <Sparkles style={{ width: "16px", height: "16px" }} />
            LIMITED TIME OFFER
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 8vw, 56px)",
            fontWeight: 900,
            marginBottom: "16px",
            background: "linear-gradient(135deg, #ffffff, #c4b5fd)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}>
            Choose Your Plan
          </h1>

          <p style={{
            fontSize: "clamp(16px, 3vw, 20px)",
            color: "#94a3b8",
            maxWidth: "700px",
            margin: "0 auto 24px",
            lineHeight: 1.6,
          }}>
            Compete for the <span style={{ color: "#fbbf24", fontWeight: 700 }}>£1,000 monthly prize</span> when we reach 2000+ active participants
          </p>

          {/* Trust Badges */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginTop: "24px",
          }}>
            {[
              { icon: Shield, text: "Secure Payment" },
              { icon: Lock, text: "SSL Encrypted" },
              { icon: CheckCircle2, text: "Instant Access" },
            ].map((badge, i) => {
              const Icon = badge.icon;
              return (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: "rgba(34, 197, 94, 0.1)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  fontSize: "12px",
                  color: "#4ade80",
                  fontWeight: 600,
                }}>
                  <Icon style={{ width: "14px", height: "14px" }} />
                  {badge.text}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Cards - Corporate Premium */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: "clamp(24px, 4vw, 32px)",
          marginBottom: "clamp(40px, 6vw, 50px)",
          maxWidth: "900px",
          margin: "0 auto clamp(40px, 6vw, 50px)",
        }}>
          {packages.map((pkg, index) => {
            const Icon = pkg.icon;
            const isProcessing = processingPackageId === pkg.id;

            return (
              <div
                key={pkg.id}
                className="animate-pop-in"
                style={{
                  position: "relative",
                  animationDelay: `${index * 0.15}s`,
                }}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "6px 16px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                    fontSize: "11px",
                    fontWeight: 900,
                    color: "#0f172a",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    boxShadow: "0 4px 12px rgba(251, 191, 36, 0.6)",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}>
                    <Crown style={{ width: "14px", height: "14px" }} />
                    BEST VALUE
                  </div>
                )}

                <div style={{
                  background: pkg.popular 
                    ? "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(217, 70, 239, 0.1))"
                    : "rgba(15, 23, 42, 0.6)",
                  borderRadius: "24px",
                  border: pkg.popular 
                    ? "2px solid rgba(139, 92, 246, 0.6)" 
                    : "2px solid rgba(139, 92, 246, 0.25)",
                  padding: "clamp(28px, 5vw, 36px)",
                  backdropFilter: "blur(20px)",
                  boxShadow: pkg.popular 
                    ? "0 20px 60px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)" 
                    : "0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = pkg.popular
                    ? "0 30px 80px rgba(139, 92, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
                    : "0 20px 50px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = pkg.popular
                    ? "0 20px 60px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                    : "0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)";
                }}
                >
                  {/* Shimmer Effect */}
                  {pkg.popular && (
                    <div className="shimmer" style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "100%",
                      pointerEvents: "none",
                    }} />
                  )}

                  {/* Header with Icon */}
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    marginBottom: "24px",
                  }}>
                    <div style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "16px",
                      background: `linear-gradient(135deg, ${pkg.color})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 8px 24px ${pkg.bgGlow}`,
                      flexShrink: 0,
                    }}>
                      <Icon style={{ width: "28px", height: "28px", color: "white" }} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: "clamp(18px, 4vw, 22px)",
                        fontWeight: 900,
                        marginBottom: "4px",
                        lineHeight: 1.2,
                      }}>
                        {pkg.name}
                      </h3>
                      <p style={{
                        fontSize: "13px",
                        color: "#94a3b8",
                        margin: 0,
                      }}>
                        {pkg.description}
                      </p>
                    </div>
                  </div>

                  {/* PRICE - VERY PROMINENT */}
                  <div style={{ 
                    marginBottom: "24px",
                    padding: "24px",
                    borderRadius: "16px",
                    background: pkg.popular 
                      ? "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(217, 70, 239, 0.15))" 
                      : "rgba(15, 23, 42, 0.5)",
                    border: `2px solid ${pkg.popular ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                    textAlign: "center",
                    position: "relative",
                  }}>
                    {/* Savings Badge */}
                    {pkg.savings > 0 && (
                      <div style={{
                        position: "absolute",
                        top: "-10px",
                        right: "12px",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        fontSize: "11px",
                        fontWeight: 900,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        boxShadow: "0 4px 12px rgba(34, 197, 94, 0.4)",
                      }}>
                        <Percent style={{ width: "12px", height: "12px" }} />
                        SAVE {pkg.savings}%
                      </div>
                    )}

                    {/* Main Price - SUPER VISIBLE */}
                    <div style={{
                      marginBottom: "16px",
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        gap: "6px",
                        marginBottom: "8px",
                      }}>
                        <span style={{
                          fontSize: "clamp(28px, 6vw, 36px)",
                          fontWeight: 900,
                          color: pkg.popular ? "#a78bfa" : "#94a3b8",
                          lineHeight: 1,
                          marginTop: "8px",
                        }}>
                          £
                        </span>
                        <span style={{
                          fontSize: "clamp(56px, 12vw, 72px)",
                          fontWeight: 900,
                          color: "white",
                          lineHeight: 1,
                          letterSpacing: "-0.03em",
                          textShadow: pkg.popular 
                            ? "0 0 40px rgba(139, 92, 246, 0.8)" 
                            : "0 0 20px rgba(100, 116, 139, 0.5)",
                        }}>
                          {pkg.price}
                        </span>
                      </div>
                      <div style={{
                        fontSize: "13px",
                        color: "#64748b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}>
                        One-time payment
                      </div>
                    </div>

                    {/* Details */}
                    <div style={{
                      fontSize: "14px",
                      color: "#cbd5e1",
                      fontWeight: 600,
                      marginBottom: "8px",
                    }}>
                      {pkg.rounds} Quiz Round{pkg.rounds > 1 ? "s" : ""}
                    </div>
                    <div style={{
                      fontSize: "13px",
                      color: "#64748b",
                    }}>
                      £{pkg.pricePerRound.toFixed(2)} per round
                    </div>
                  </div>

                  {/* Features */}
                  <ul style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 24px 0",
                    flex: 1,
                  }}>
                    {pkg.features.map((feature, i) => (
                      <li
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "12px",
                          fontSize: "14px",
                          color: "#e2e8f0",
                          fontWeight: 500,
                        }}
                      >
                        <div style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #22c55e, #16a34a)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: "0 2px 8px rgba(34, 197, 94, 0.3)",
                        }}>
                          <Check style={{ width: "12px", height: "12px", color: "white", strokeWidth: 3 }} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Buy Button - Corporate */}
                  <button
                    onClick={() => handlePurchase(pkg)}
                    disabled={isProcessing}
                    style={{
                      width: "100%",
                      padding: "16px",
                      borderRadius: "14px",
                      border: "none",
                      background: pkg.popular
                        ? "linear-gradient(135deg, #8b5cf6, #d946ef)"
                        : "linear-gradient(135deg, #475569, #64748b)",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: 800,
                      cursor: isProcessing ? "not-allowed" : "pointer",
                      transition: "all 0.3s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      boxShadow: pkg.popular
                        ? "0 10px 30px rgba(139, 92, 246, 0.4)"
                        : "0 6px 20px rgba(0, 0, 0, 0.3)",
                      opacity: isProcessing ? 0.6 : 1,
                      letterSpacing: "0.02em",
                      textTransform: "uppercase",
                    }}
                    onMouseEnter={(e) => {
                      if (!isProcessing) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = pkg.popular
                          ? "0 15px 40px rgba(139, 92, 246, 0.6)"
                          : "0 10px 30px rgba(100, 116, 139, 0.5)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = pkg.popular
                        ? "0 10px 30px rgba(139, 92, 246, 0.4)"
                        : "0 6px 20px rgba(0, 0, 0, 0.3)";
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <div style={{
                          width: "18px",
                          height: "18px",
                          border: "2px solid rgba(255, 255, 255, 0.3)",
                          borderTopColor: "white",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart style={{ width: "20px", height: "20px" }} />
                        Purchase Now
                        <ArrowRight style={{ width: "18px", height: "18px" }} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits Section - Compact Corporate */}
        <div className="animate-slide-up" style={{
          padding: "clamp(32px, 6vw, 40px)",
          borderRadius: "24px",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 27, 75, 0.6))",
          border: "2px solid rgba(139, 92, 246, 0.3)",
          backdropFilter: "blur(20px)",
          marginBottom: "clamp(30px, 6vw, 40px)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}>
          <div style={{
            textAlign: "center",
            marginBottom: "32px",
          }}>
            <h2 style={{
              fontSize: "clamp(24px, 5vw, 32px)",
              fontWeight: 900,
              marginBottom: "12px",
              background: "linear-gradient(135deg, #ffffff, #c4b5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Why VibraXX?
            </h2>
            <p style={{
              fontSize: "15px",
              color: "#94a3b8",
            }}>
              Professional quiz platform with premium features
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: "20px",
          }}>
            {[
              {
                icon: Trophy,
                title: "£1,000 Prize Pool",
                description: "Monthly rewards at 2000+ players",
                color: "#fbbf24",
              },
              {
                icon: Zap,
                title: "Instant Access",
                description: "Play immediately after purchase",
                color: "#06b6d4",
              },
              {
                icon: Users,
                title: "Global Leaderboard",
                description: "Compete with players worldwide",
                color: "#8b5cf6",
              },
              {
                icon: Target,
                title: "Detailed Analytics",
                description: "Track your progress & rankings",
                color: "#ec4899",
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  style={{
                    padding: "20px",
                    borderRadius: "16px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    transition: "all 0.3s",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)";
                    e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: `${benefit.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                    border: `1px solid ${benefit.color}40`,
                  }}>
                    <Icon style={{ width: "24px", height: "24px", color: benefit.color }} />
                  </div>
                  <h3 style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}>
                    {benefit.title}
                  </h3>
                  <p style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    margin: 0,
                    lineHeight: 1.5,
                  }}>
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer - Home Page Style */}
      <footer style={{
        position: "relative",
        zIndex: 10,
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        background: "rgba(15, 23, 42, 0.9)",
        backdropFilter: "blur(20px)",
        padding: "clamp(30px, 5vw, 50px) 0",
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 clamp(16px, 4vw, 24px)",
        }}>
          
          {/* Legal Disclaimer */}
          <div style={{
            background: "rgba(139, 92, 246, 0.1)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            borderRadius: "12px",
            padding: "clamp(16px, 3vw, 20px)",
            marginBottom: "clamp(24px, 4vw, 32px)",
            fontSize: "clamp(11px, 2vw, 13px)",
            lineHeight: 1.6,
            color: "#cbd5e1",
            textAlign: "center",
          }}>
            <strong style={{ color: "#94a3b8" }}>Educational Quiz Competition.</strong> 18+ only. 
            This is a 100% skill-based knowledge competition with no element of chance. 
            Entry fees apply. Prize pool activates with 2000+ monthly participants. See{" "}
            <a href="/terms" style={{ color: "#a78bfa", textDecoration: "underline" }}>
              Terms & Conditions
            </a>{" "}
            for full details.
          </div>

          {/* Main Links */}
          <nav style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "clamp(8px, 2vw, 12px)",
            marginBottom: "clamp(24px, 4vw, 32px)",
          }}>
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
                <a
                  key={link.href}
                  href={link.href}
                  style={{
                    color: "#94a3b8",
                    textDecoration: "none",
                    fontSize: "clamp(11px, 2vw, 13px)",
                    fontWeight: 500,
                    transition: "color 0.3s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "#a78bfa"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#94a3b8"}
                >
                  {link.text}
                </a>
                {i < arr.length - 1 && (
                  <span style={{ color: "rgba(148, 163, 184, 0.3)", fontSize: "clamp(10px, 2vw, 12px)" }}>•</span>
                )}
              </>
            ))}
          </nav>

          {/* Company Info */}
          <div style={{ color: "#64748b", fontSize: "clamp(11px, 2vw, 13px)", lineHeight: 1.6 }}>
            <div style={{ marginBottom: "8px", textAlign: "center" }}>
              © 2025 VibraXX. Operated by Sermin Limited (UK)
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px", textAlign: "center" }}>
              Registered in England & Wales | All rights reserved
            </div>
            <div style={{ marginBottom: "10px", textAlign: "center" }}>
              <a 
                href="mailto:team@vibraxx.com"
                style={{ 
                  color: "#a78bfa", 
                  textDecoration: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                team@vibraxx.com
              </a>
            </div>
            <div style={{ fontSize: "11px", textAlign: "center" }}>
              Payment processing by{" "}
              <a 
                href="https://stripe.com" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: "#a78bfa", textDecoration: "none" }}
              >
                Stripe
              </a>
              {" "}| Secure SSL encryption | Skill-based competition - Not gambling
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
