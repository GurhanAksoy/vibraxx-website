"use client";

import { useState, useEffect, useRef } from "react";
import {
  Crown,
  Users,
  Zap,
  Trophy,
  Clock,
  Sparkles,
  Flame,
  Target,
  Volume2,
  VolumeX,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function LobbyPage() {
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState(847); // 14:07
  const [isPlaying, setIsPlaying] = useState(false);
  const [players, setPlayers] = useState([
    {
      id: 1,
      name: "Sarah Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      score: 2840,
      streak: 12,
    },
    {
      id: 2,
      name: "Alex Kumar",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      score: 1950,
      streak: 8,
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      score: 3120,
      streak: 15,
    },
    {
      id: 4,
      name: "Michael Zhang",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      score: 1750,
      streak: 5,
    },
    {
      id: 5,
      name: "Sofia Martinez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",
      score: 2600,
      streak: 10,
    },
  ]);
  const [totalPlayers, setTotalPlayers] = useState(15234);

  // Ses için audio referansı
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio init
  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio("/sounds/vibraxx.mp3");
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play / Pause kontrolü
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {
        // autoplay engellenirse sessiz geç
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleStartGame();
          return 900; // Reset to 15 minutes
        }
        return prev - 1;
      });

      // Simulate players joining
      if (Math.random() > 0.7) {
        setTotalPlayers((prev) => prev + Math.floor(Math.random() * 3));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleStartGame = () => {
    console.log("Game starting! Redirecting to game...");
    // router.push("/game");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((900 - timeLeft) / 900) * 100;

  return (
    <>
      <style jsx global>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.95);
            opacity: 1;
          }
          50% {
            transform: scale(1);
            opacity: 0.7;
          }
          100% {
            transform: scale(0.95);
            opacity: 1;
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        @keyframes slideIn {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }
        .animate-slide-in {
          animation: slideIn 0.5s ease-out;
        }

        @media (max-width: 768px) {
          .lobby-grid {
            grid-template-columns: 1fr !important;
          }
          .mobile-hide {
            display: none !important;
          }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(to bottom right, #0f172a, #1e1b4b, #0f172a)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated Background */}
        <div
          className="animate-float"
          style={{
            position: "fixed",
            top: "10%",
            left: "5%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
            opacity: 0.3,
            filter: "blur(80px)",
          }}
        ></div>
        <div
          className="animate-float"
          style={{
            position: "fixed",
            bottom: "10%",
            right: "5%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #d946ef 0%, transparent 70%)",
            opacity: 0.25,
            filter: "blur(80px)",
            animationDelay: "1.5s",
          }}
        ></div>

        {/* Header */}
        <header
          style={{
            position: "relative",
            zIndex: 50,
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            background: "rgba(15, 23, 42, 0.8)",
          }}
        >
          <div
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              padding: "0 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "80px",
                gap: "16px",
              }}
            >
              {/* Left - LOBBY label + Back Home */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <button
                  onClick={() => router.push("/")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 9999,
                    border: "1px solid rgba(56,189,248,0.6)",
                    background: "rgba(8,47,73,0.9)",
                    color: "#e0f2fe",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    cursor: "pointer",
                    boxShadow: "0 0 14px rgba(56,189,248,0.7)",
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 0 20px rgba(56,189,248,0.9)";
                    e.currentTarget.style.background =
                      "rgba(8,47,73,1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow =
                      "0 0 14px rgba(56,189,248,0.7)";
                    e.currentTarget.style.background =
                      "rgba(8,47,73,0.9)";
                  }}
                >
                  <ArrowLeft
                    style={{ width: 14, height: 14 }}
                  />
                  Main Stage
                </button>

                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    padding: "4px 12px",
                    borderRadius: 9999,
                    border:
                      "1px solid rgba(167,139,250,0.7)",
                    background: "rgba(10,16,30,0.98)",
                    color: "#c4b5fd",
                    boxShadow:
                      "0 0 14px rgba(167,139,250,0.6)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "9999px",
                      background:
                        "linear-gradient(to right,#22c55e,#a855f7)",
                      boxShadow:
                        "0 0 10px rgba(168,85,247,0.9)",
                    }}
                  ></span>
                  LOBBY
                </span>
              </div>

              {/* Center - The Next Generation Live Quiz */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    backgroundImage:
                      "linear-gradient(to right,#a78bfa,#f97316,#22d3ee,#f0abfc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  The Next Generation Live Quiz
                </div>
              </div>

              {/* Right - Controls */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                }}
              >
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    padding: "12px",
                    borderRadius: "12px",
                    border:
                      "1px solid rgba(255, 255, 255, 0.1)",
                    background:
                      "rgba(255, 255, 255, 0.05)",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)";
                  }}
                >
                  {isPlaying ? (
                    <Volume2
                      style={{
                        width: 20,
                        height: 20,
                        color: "#a78bfa",
                      }}
                    />
                  ) : (
                    <VolumeX
                      style={{
                        width: 20,
                        height: 20,
                        color: "#64748b",
                      }}
                    />
                  )}
                </button>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "12px",
                    background:
                      "rgba(139, 92, 246, 0.1)",
                    border:
                      "1px solid rgba(139, 92, 246, 0.3)",
                  }}
                >
                  <Users
                    style={{
                      width: 18,
                      height: 18,
                      color: "#a78bfa",
                    }}
                  />
                  <span
                    style={{
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {totalPlayers.toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: "#cbd5e1",
                    }}
                  >
                    online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          style={{
            position: "relative",
            zIndex: 10,
            padding: "40px 16px",
          }}
        >
          <div
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
            }}
          >
            <div
              className="lobby-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 400px",
                gap: "32px",
              }}
            >
              {/* Left Column - Timer & Status */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {/* Logo Area */}
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    <div
                      className="animate-pulse-ring mobile-hide"
                      style={{
                        position: "absolute",
                        inset: "-10px",
                        borderRadius: "50%",
                        border:
                          "2px solid rgba(139, 92, 246, 0.3)",
                      }}
                    ></div>
                    <div
                      style={{
                        width: "clamp(80px, 15vw, 120px)",
                        height: "clamp(80px, 15vw, 120px)",
                        background: "#020817",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow:
                          "0 0 60px rgba(15,23,42,0.9)",
                        border:
                          "3px solid rgba(148, 163, 253, 0.28)",
                        padding: "10px",
                      }}
                    >
                      <img
                        src="/images/logo.png"
                        alt="VibraXX Logo"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          filter:
                            "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.8))",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Ad Banner / Sponsor */}
                <div
                  style={{
                    padding: "clamp(20px, 4vw, 32px)",
                    borderRadius: "24px",
                    border:
                      "1px solid rgba(167,139,250,0.9)",
                    background: "rgba(6, 10, 25, 0.96)",
                    backdropFilter: "blur(20px)",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow:
                      "0 0 18px rgba(168,85,247,0.45)",
                  }}
                >
                  {/* Neon outer glow line */}
                  <div
                    style={{
                      position: "absolute",
                      inset: "-1px",
                      borderRadius: "24px",
                      border:
                        "1px solid rgba(236,72,153,0.18)",
                      boxShadow:
                        "0 0 22px rgba(236,72,153,0.35)",
                      pointerEvents: "none",
                    }}
                  ></div>

                  {/* Top shimmer line */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-2px",
                      left: "-40%",
                      width: "180%",
                      height: "2px",
                      background:
                        "linear-gradient(90deg, transparent, #a78bfa, #f0abfc, transparent)",
                      animation:
                        "shimmer 3s linear infinite",
                      opacity: 0.9,
                    }}
                  ></div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginBottom: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Sponsored
                  </div>

                  {/* Sponsor image container */}
                  <div
                    style={{
                      width: "100%",
                      minHeight: "100px",
                      height: "clamp(100px, 15vw, 120px)",
                      borderRadius: "16px",
                      background:
                        "radial-gradient(circle at top, rgba(167,139,250,0.18), transparent 70%)",
                      border:
                        "1px solid rgba(148,163,253,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "10px 14px",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      boxShadow:
                        "0 0 16px rgba(79,70,229,0.35)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        "scale(1.02)";
                      e.currentTarget.style.boxShadow =
                        "0 0 26px rgba(168,85,247,0.6)";
                      e.currentTarget.style.borderColor =
                        "rgba(236,72,153,0.6)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        "scale(1)";
                      e.currentTarget.style.boxShadow =
                        "0 0 16px rgba(79,70,229,0.35)";
                      e.currentTarget.style.borderColor =
                        "rgba(148,163,253,0.35)";
                    }}
                  >
                    <img
                      src="/images/sponsor.png"
                      alt="Sponsor"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </div>
                </div>

                {/* Timer Card */}
                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))",
                      borderRadius: "32px",
                      filter: "blur(40px)",
                      opacity: 0.6,
                    }}
                  ></div>

                  <div
                    style={{
                      position: "relative",
                      padding: "48px",
                      borderRadius: "32px",
                      border:
                        "1px solid rgba(255, 255, 255, 0.1)",
                      background:
                        "rgba(15, 23, 42, 0.8)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    <div
                      style={{
                        textAlign: "center",
                        marginBottom: "32px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "24px",
                      }}
                    >
                      {/* NEXT ROUND badge */}
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 20px",
                          borderRadius: "9999px",
                          background:
                            "rgba(239, 68, 68, 0.2)",
                          border:
                            "1px solid rgba(239, 68, 68, 0.3)",
                        }}
                      >
                        <div
                          className="animate-pulse"
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#ef4444",
                          }}
                        ></div>
                        <span
                          style={{
                            fontSize:
                              "clamp(11px, 2vw, 14px)",
                            fontWeight: 600,
                            color: "#f87171",
                          }}
                        >
                          NEXT ROUND STARTING IN
                        </span>
                      </div>

                      {/* Timer */}
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block",
                        }}
                      >
                        <div
                          className="animate-pulse-ring mobile-hide"
                          style={{
                            position: "absolute",
                            inset: "-15px",
                            borderRadius: "50%",
                            border:
                              "3px solid rgba(139, 92, 246, 0.5)",
                          }}
                        ></div>
                        <div
                          style={{
                            position: "relative",
                            width:
                              "clamp(180px, 35vw, 220px)",
                            height:
                              "clamp(180px, 35vw, 220px)",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))",
                            border:
                              "3px solid rgba(255, 255, 255, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: "8px",
                            boxShadow:
                              "0 0 80px rgba(139, 92, 246, 0.4)",
                          }}
                        >
                          <Clock
                            style={{
                              width:
                                "clamp(24px, 5vw, 32px)",
                              height:
                                "clamp(24px, 5vw, 32px)",
                              color: "#a78bfa",
                            }}
                          />
                          <div
                            style={{
                              fontSize:
                                "clamp(40px, 8vw, 56px)",
                              fontWeight: 900,
                              lineHeight: 1,
                              backgroundImage:
                                "linear-gradient(to right, #a78bfa, #f0abfc)",
                              WebkitBackgroundClip:
                                "text",
                              WebkitTextFillColor:
                                "transparent",
                            }}
                          >
                            {formatTime(timeLeft)}
                          </div>
                          <div
                            style={{
                              fontSize:
                                "clamp(10px, 2vw, 12px)",
                              color: "#94a3b8",
                              textTransform:
                                "uppercase",
                              letterSpacing:
                                "0.1em",
                            }}
                          >
                            Minutes
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div
                        style={{
                          maxWidth: "400px",
                          margin: "0 auto",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: "8px",
                            borderRadius: "9999px",
                            background:
                              "rgba(255, 255, 255, 0.1)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            className="animate-shimmer"
                            style={{
                              width: `${progress}%`,
                              height: "100%",
                              background:
                                "linear-gradient(90deg, #7c3aed, #d946ef, #7c3aed)",
                              backgroundSize:
                                "200% 100%",
                              transition:
                                "width 1s linear",
                            }}
                          ></div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            marginTop: "12px",
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          <span>Waiting...</span>
                          <span>
                            {Math.floor(progress)}%
                            {" "}Complete
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Auto-Join Info */}
                    <div
                      style={{
                        padding: "20px",
                        borderRadius: "16px",
                        background:
                          "rgba(34, 197, 94, 0.1)",
                        border:
                          "1px solid rgba(34, 197, 94, 0.3)",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "center",
                          gap: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background:
                              "#22c55e",
                            boxShadow:
                              "0 0 12px #22c55e",
                          }}
                        ></div>
                        <span
                          style={{
                            fontSize:
                              "clamp(14px, 2.5vw, 16px)",
                            fontWeight: 700,
                            color:
                              "#4ade80",
                          }}
                        >
                          YOU&apos;RE IN THE
                          LOBBY
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize:
                            "clamp(12px, 2vw, 14px)",
                          color: "#94a3b8",
                          margin: 0,
                        }}
                      >
                        You&apos;ll
                        automatically join when
                        the round starts
                      </p>
                    </div>
                  </div>
                </div>

                {/* Game Info */}
                <div
                  style={{
                    padding: "clamp(20px, 4vw, 32px)",
                    borderRadius: "24px",
                    border:
                      "1px solid rgba(255, 255, 255, 0.1)",
                    background:
                      "rgba(15, 23, 42, 0.6)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <h3
                    style={{
                      fontSize:
                        "clamp(16px, 3vw, 20px)",
                      fontWeight: 700,
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Target
                      style={{
                        width: 24,
                        height: 24,
                        color: "#a78bfa",
                      }}
                    />
                    Round Information
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(120px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        background:
                          "rgba(139, 92, 246, 0.1)",
                        border:
                          "1px solid rgba(139, 92, 246, 0.2)",
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "clamp(10px, 2vw, 12px)",
                          color: "#94a3b8",
                          marginBottom: "4px",
                        }}
                      >
                        Question Type
                      </div>
                      <div
                        style={{
                          fontSize:
                            "clamp(14px, 3vw, 18px)",
                          fontWeight: 700,
                          color: "#a78bfa",
                        }}
                      >
                        Multiple Choice
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        background:
                          "rgba(236, 72, 153, 0.1)",
                        border:
                          "1px solid rgba(236, 72, 153, 0.2)",
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "clamp(10px, 2vw, 12px)",
                          color: "#94a3b8",
                          marginBottom: "4px",
                        }}
                      >
                        Time Limit
                      </div>
                      <div
                        style={{
                          fontSize:
                            "clamp(14px, 3vw, 18px)",
                          fontWeight: 700,
                          color: "#f0abfc",
                        }}
                      >
                        30 seconds
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        background:
                          "rgba(34, 197, 94, 0.1)",
                        border:
                          "1px solid rgba(34, 197, 94, 0.2)",
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "clamp(10px, 2vw, 12px)",
                          color: "#94a3b8",
                          marginBottom: "4px",
                        }}
                      >
                        Points
                      </div>
                      <div
                        style={{
                          fontSize:
                            "clamp(14px, 3vw, 18px)",
                          fontWeight: 700,
                          color: "#4ade80",
                        }}
                      >
                        100-500
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        background:
                          "rgba(234, 179, 8, 0.1)",
                        border:
                          "1px solid rgba(234, 179, 8, 0.2)",
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "clamp(10px, 2vw, 12px)",
                          color: "#94a3b8",
                          marginBottom: "4px",
                        }}
                      >
                        Difficulty
                      </div>
                      <div
                        style={{
                          fontSize:
                            "clamp(14px, 3vw, 18px)",
                          fontWeight: 700,
                          color: "#facc15",
                        }}
                      >
                        Medium
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                      padding: "16px",
                      borderRadius: "12px",
                      background:
                        "rgba(59, 130, 246, 0.1)",
                      border:
                        "1px solid rgba(59, 130, 246, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "clamp(12px, 2.5vw, 14px)",
                        color: "#94a3b8",
                        marginBottom: "8px",
                      }}
                    >
                      💡{" "}
                      <strong
                        style={{
                          color: "white",
                        }}
                      >
                        Pro Tip:
                      </strong>{" "}
                      Faster answers earn more points!
                      The first 10 seconds give maximum
                      points.
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Players List */}
              <div>
                <div
                  style={{
                    padding: "32px",
                    borderRadius: "24px",
                    border:
                      "1px solid rgba(255, 255, 255, 0.1)",
                    background:
                      "rgba(15, 23, 42, 0.6)",
                    backdropFilter: "blur(20px)",
                    height: "fit-content",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      marginBottom: "24px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <Users
                        style={{
                          width: 24,
                          height: 24,
                          color: "#a78bfa",
                        }}
                      />
                      Players in Lobby
                    </h3>
                    <div
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background:
                          "rgba(139, 92, 246, 0.2)",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#a78bfa",
                      }}
                    >
                      {players.length}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      maxHeight: "600px",
                      overflowY: "auto",
                    }}
                  >
                    {players.map((player, idx) => (
                      <div
                        key={player.id}
                        className="animate-slide-in"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
                          padding: "16px",
                          borderRadius: "16px",
                          border:
                            "1px solid rgba(255, 255, 255, 0.1)",
                          background:
                            "rgba(255, 255, 255, 0.03)",
                          transition: "all 0.3s",
                          animationDelay: `${idx * 0.1}s`,
                        }}
                      >
                        <img
                          src={player.avatar}
                          alt={player.name}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            border:
                              "2px solid rgba(139, 92, 246, 0.5)",
                          }}
                        />

                        <div
                          style={{
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "4px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "16px",
                                fontWeight: 600,
                              }}
                            >
                              {player.name}
                            </span>
                            {player.streak >= 10 && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding:
                                    "2px 8px",
                                  borderRadius: "6px",
                                  background:
                                    "rgba(239, 68, 68, 0.2)",
                                  border:
                                    "1px solid rgba(239, 68, 68, 0.3)",
                                }}
                              >
                                <Flame
                                  style={{
                                    width: 12,
                                    height: 12,
                                    color:
                                      "#f87171",
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    color:
                                      "#f87171",
                                  }}
                                >
                                  {player.streak}
                                </span>
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                            }}
                          >
                            {player.score.toLocaleString()}{" "}
                            points
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                      padding: "16px",
                      borderRadius: "12px",
                      background:
                        "rgba(139, 92, 246, 0.1)",
                      border:
                        "1px solid rgba(139, 92, 246, 0.2)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#94a3b8",
                      }}
                    >
                      <strong
                        style={{
                          color: "#a78bfa",
                        }}
                      >
                        {totalPlayers.toLocaleString()}
                      </strong>{" "}
                      players worldwide waiting
                    </div>
                  </div>
                </div>
              </div>
              {/* End Right Column */}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
