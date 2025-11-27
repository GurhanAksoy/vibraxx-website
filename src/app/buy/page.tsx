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
  Unlock,
  ChevronRight,
  CreditCard,
  Rocket,
  Star,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Flame,
  Target,
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
    description: "Perfect for trying it out",
    stripePriceId: "price_single_round", // Replace with actual Stripe Price ID
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
      "17% Savings",
      "Priority Entry",
      "Extended Stats",
      "Badge: Champion",
    ],
    description: "Best value for champions",
    stripePriceId: "price_champion_bundle", // Replace with actual Stripe Price ID
  },
];

export default function BuyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userRounds, setUserRounds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPackageId, setProcessingPackageId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchasedRounds, setPurchasedRounds] = useState(0);

  // Fetch user and rounds
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      
      // Get authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        // Redirect to home if not authenticated
        router.push("/");
        return;
      }

      setUser(authUser);

      // Fetch user's available rounds
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

  // Handle purchase with Stripe
  const handlePurchase = async (pkg: typeof packages[0]) => {
    if (!user) {
      router.push("/");
      return;
    }

    setProcessingPackageId(pkg.id);

    try {
      // Call your backend API to create Stripe Checkout Session
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
        // Redirect to Stripe Checkout
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
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(217, 70, 239, 0.8); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
        .animate-pop-in {
          animation: popIn 0.5s ease-out;
        }

        @media (max-width: 768px) {
          .mobile-hide { display: none !important; }
          .mobile-stack { flex-direction: column !important; }
        }

        @media (max-width: 640px) {
          /* Footer links stack on very small screens */
          nav span[style*="color: rgba(148, 163, 184, 0.3)"] {
            display: none;
          }
        }

        /* Ensure no horizontal scroll */
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

      {/* Animated particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: i % 3 === 0 ? "#8b5cf6" : i % 3 === 1 ? "#d946ef" : "#06b6d4",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            opacity: 0.6,
          }}
        />
      ))}

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
              <div style={{ fontSize: "10px", color: "#94a3b8" }}>BUY ROUNDS</div>
            </div>
          </div>

          {/* User Rounds Display */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}>
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
              <span className="mobile-hide">Back to Home</span>
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
        
        {/* Hero Section */}
        <div className="animate-slide-up" style={{
          textAlign: "center",
          marginBottom: "clamp(40px, 8vw, 60px)",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "20px",
            background: "rgba(139, 92, 246, 0.2)",
            border: "1px solid rgba(139, 92, 246, 0.5)",
            marginBottom: "20px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#c4b5fd",
          }}>
            <Sparkles style={{ width: "16px", height: "16px" }} />
            SPECIAL OFFER
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 8vw, 56px)",
            fontWeight: 900,
            marginBottom: "16px",
            background: "linear-gradient(135deg, #ffffff, #d4d4d8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.2,
          }}>
            Choose Your Plan
          </h1>

          <p style={{
            fontSize: "clamp(16px, 3vw, 20px)",
            color: "#94a3b8",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}>
            Compete for the <span style={{ color: "#fbbf24", fontWeight: 700 }}>£1,000 monthly prize</span> with 2000+ participants
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "clamp(20px, 3vw, 24px)",
          marginBottom: "clamp(40px, 6vw, 50px)",
          maxWidth: "800px",
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
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div style={{
                    position: "absolute",
                    top: "-10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#0f172a",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    boxShadow: "0 4px 12px rgba(251, 191, 36, 0.5)",
                    zIndex: 10,
                  }}>
                    BEST VALUE
                  </div>
                )}

                <div style={{
                  background: pkg.popular 
                    ? "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(217, 70, 239, 0.15))"
                    : "rgba(15, 23, 42, 0.6)",
                  borderRadius: "20px",
                  border: pkg.popular 
                    ? "2px solid rgba(139, 92, 246, 0.5)" 
                    : "2px solid rgba(139, 92, 246, 0.2)",
                  padding: "clamp(20px, 4vw, 24px)",
                  backdropFilter: "blur(20px)",
                  boxShadow: pkg.popular 
                    ? "0 20px 60px rgba(139, 92, 246, 0.4)" 
                    : "0 10px 30px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.3s",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = pkg.popular
                    ? "0 25px 70px rgba(139, 92, 246, 0.5)"
                    : "0 15px 50px rgba(139, 92, 246, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = pkg.popular
                    ? "0 20px 60px rgba(139, 92, 246, 0.4)"
                    : "0 10px 30px rgba(0, 0, 0, 0.3)";
                }}
                >
                  {/* Header */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                  }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: `linear-gradient(135deg, ${pkg.color})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 0 20px ${pkg.bgGlow}`,
                      flexShrink: 0,
                    }}>
                      <Icon style={{ width: "24px", height: "24px", color: "white" }} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: "clamp(16px, 3vw, 18px)",
                        fontWeight: 800,
                        marginBottom: "2px",
                        lineHeight: 1.2,
                      }}>
                        {pkg.name}
                      </h3>
                      <p style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                        margin: 0,
                      }}>
                        {pkg.description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ 
                    marginBottom: "16px",
                    padding: "16px",
                    borderRadius: "12px",
                    background: pkg.popular 
                      ? "rgba(139, 92, 246, 0.1)" 
                      : "rgba(15, 23, 42, 0.4)",
                    border: `1px solid ${pkg.popular ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
                      <span style={{
                        fontSize: "clamp(32px, 7vw, 40px)",
                        fontWeight: 900,
                        background: `linear-gradient(135deg, ${pkg.color})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        lineHeight: 1,
                      }}>
                        {pkg.currency}{pkg.price}
                      </span>
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "#64748b",
                    }}>
                      {pkg.rounds} round{pkg.rounds > 1 ? "s" : ""} • £{pkg.pricePerRound.toFixed(2)} each
                    </div>
                    {pkg.savings > 0 && (
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "8px",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        background: "rgba(34, 197, 94, 0.2)",
                        border: "1px solid rgba(34, 197, 94, 0.4)",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#22c55e",
                      }}>
                        <TrendingUp style={{ width: "12px", height: "12px" }} />
                        Save {pkg.savings}%
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 20px 0",
                    flex: 1,
                  }}>
                    {pkg.features.map((feature, i) => (
                      <li
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "10px",
                          fontSize: "13px",
                          color: "#cbd5e1",
                        }}
                      >
                        <div style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: "rgba(34, 197, 94, 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <Check style={{ width: "10px", height: "10px", color: "#22c55e" }} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Buy Button */}
                  <button
                    onClick={() => handlePurchase(pkg)}
                    disabled={isProcessing}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "12px",
                      border: "none",
                      background: pkg.popular
                        ? "linear-gradient(135deg, #8b5cf6, #d946ef)"
                        : "linear-gradient(135deg, #1e293b, #334155)",
                      color: "white",
                      fontSize: "15px",
                      fontWeight: 700,
                      cursor: isProcessing ? "not-allowed" : "pointer",
                      transition: "all 0.3s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: pkg.popular
                        ? "0 8px 20px rgba(139, 92, 246, 0.4)"
                        : "0 4px 12px rgba(0, 0, 0, 0.3)",
                      opacity: isProcessing ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isProcessing) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = pkg.popular
                          ? "0 12px 30px rgba(139, 92, 246, 0.6)"
                          : "0 8px 20px rgba(139, 92, 246, 0.4)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = pkg.popular
                        ? "0 8px 20px rgba(139, 92, 246, 0.4)"
                        : "0 4px 12px rgba(0, 0, 0, 0.3)";
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <div style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(255, 255, 255, 0.3)",
                          borderTopColor: "white",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart style={{ width: "18px", height: "18px" }} />
                        Buy Now
                        <ArrowRight style={{ width: "16px", height: "16px" }} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits Section - Compact */}
        <div className="animate-slide-up" style={{
          padding: "clamp(24px, 5vw, 32px)",
          borderRadius: "20px",
          background: "rgba(15, 23, 42, 0.6)",
          border: "2px solid rgba(139, 92, 246, 0.3)",
          backdropFilter: "blur(20px)",
          marginBottom: "clamp(30px, 6vw, 40px)",
        }}>
          <h2 style={{
            fontSize: "clamp(20px, 4vw, 24px)",
            fontWeight: 900,
            marginBottom: "20px",
            textAlign: "center",
          }}>
            Why Choose VibraXX?
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: "16px",
          }}>
            {[
              {
                icon: Trophy,
                title: "£1,000 Prize",
                description: "Monthly prize at 2000+ players",
                color: "#fbbf24",
              },
              {
                icon: Zap,
                title: "Instant Play",
                description: "Start immediately after purchase",
                color: "#06b6d4",
              },
              {
                icon: Users,
                title: "Global Ranks",
                description: "Compete worldwide",
                color: "#8b5cf6",
              },
              {
                icon: Target,
                title: "Track Stats",
                description: "Detailed progress & rankings",
                color: "#ec4899",
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)";
                    e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.5)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <Icon style={{ width: "28px", height: "28px", color: benefit.color, margin: "0 auto 8px" }} />
                  <h3 style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    marginBottom: "4px",
                  }}>
                    {benefit.title}
                  </h3>
                  <p style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    margin: 0,
                    lineHeight: 1.4,
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
            <a href="/privacy" style={{
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
              Privacy Policy
            </a>
            <span style={{ color: "rgba(148, 163, 184, 0.3)", fontSize: "clamp(10px, 2vw, 12px)" }}>•</span>
            <a href="/terms" style={{
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
              Terms & Conditions
            </a>
            <span style={{ color: "rgba(148, 163, 184, 0.3)", fontSize: "clamp(10px, 2vw, 12px)" }}>•</span>
            <a href="/cookies" style={{
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
              Cookie Policy
            </a>
            <span style={{ color: "rgba(148, 163, 184, 0.3)", fontSize: "clamp(10px, 2vw, 12px)" }}>•</span>
            <a href="/how-it-works" style={{
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
              How It Works
            </a>
            <span style={{ color: "rgba(148, 163, 184, 0.3)", fontSize: "clamp(10px, 2vw, 12px)" }}>•</span>
            <a href="/rules" style={{
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
              Quiz Rules
            </a>
            <span style={{ color: "rgba(148, 163, 184, 0.3)", fontSize: "clamp(10px, 2vw, 12px)" }}>•</span>
            <a href="/complaints" style={{
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
              Complaints
            </a>
            <span style={{ color: "rgba(148, 163, 184, 0.3)", fontSize: "clamp(10px, 2vw, 12px)" }}>•</span>
            <a href="/refunds" style={{
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
              Refund Policy
            </a>
            <span style={{ color: "rgba(148, 163, 184, 0.3)", fontSize: "clamp(10px, 2vw, 12px)" }}>•</span>
            <a href="/about" style={{
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
              About Us
            </a>
            <span style={{ color: "rgba(148, 163, 184, 0.3)", fontSize: "clamp(10px, 2vw, 12px)" }}>•</span>
            <a href="/contact" style={{
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
              Contact
            </a>
            <span style={{ color: "rgba(148, 163, 184, 0.3)", fontSize: "clamp(10px, 2vw, 12px)" }}>•</span>
            <a href="/faq" style={{
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
              FAQ
            </a>
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className="animate-pop-in"
            style={{
              background: "linear-gradient(135deg, #1e293b, #0f172a)",
              borderRadius: "24px",
              border: "2px solid rgba(34, 197, 94, 0.5)",
              padding: "40px",
              maxWidth: "400px",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(34, 197, 94, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 0 40px rgba(34, 197, 94, 0.5)",
            }}>
              <CheckCircle2 style={{ width: "40px", height: "40px", color: "white" }} />
            </div>
            <h3 style={{
              fontSize: "24px",
              fontWeight: 900,
              marginBottom: "12px",
            }}>
              Purchase Successful!
            </h3>
            <p style={{
              fontSize: "16px",
              color: "#94a3b8",
              marginBottom: "24px",
            }}>
              {purchasedRounds} rounds added to your account
            </p>
            <button
              onClick={() => router.push("/lobby")}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "white",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              Start Playing
              <Rocket style={{ width: "20px", height: "20px" }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
