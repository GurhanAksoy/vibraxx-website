"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Crown, Trophy, Users, Clock, Radio, TrendingUp, CheckCircle, Target } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);

const CONFIG = { DEMO_MODE: true, TOTAL_QUESTIONS: 50, QUESTION_DURATION: 6, EXPLANATION_DURATION: 5 } as const;

export default function LiveOverlay() {
  const [currentPhase, setCurrentPhase] = useState<"waiting" | "quiz" | "results">("waiting");
  const [timeLeft, setTimeLeft] = useState(847);
  const [questionTimer, setQuestionTimer] = useState(6);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [activePlayers, setActivePlayers] = useState(1547);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  
  const [question] = useState({
    text: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctIndex: 1,
    explanation: "Mars is called the Red Planet because of iron oxide (rust) on its surface.",
  });
  
  const [topPlayers] = useState([
    { rank: 1, name: "Sarah Chen", score: 2840, avatar: "🏆" },
    { rank: 2, name: "Alex Kumar", score: 2650, avatar: "🥈" },
    { rank: 3, name: "Emma Rodriguez", score: 2580, avatar: "🥉" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhase((p) => p === "waiting" ? "quiz" : p === "quiz" ? "results" : "waiting");
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentPhase !== "waiting") return;
    const interval = setInterval(() => setTimeLeft((p) => (p <= 1 ? 900 : p - 1)), 1000);
    return () => clearInterval(interval);
  }, [currentPhase]);

  useEffect(() => {
    if (currentPhase !== "quiz" || showExplanation) return;
    const interval = setInterval(() => {
      setQuestionTimer((prev) => {
        if (prev <= 1) {
          setShowExplanation(true);
          setTimeout(() => {
            setShowExplanation(false);
            setCurrentQuestion((q) => (q >= 50 ? 1 : q + 1));
            setQuestionTimer(6);
          }, 5000);
          return 6;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentPhase, showExplanation]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const getTimerColor = () => questionTimer > 4 ? "#22c55e" : questionTimer > 2 ? "#eab308" : "#ef4444";
  const answeredPercentage = Math.round((answeredCount / activePlayers) * 100);

  return (
    <>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          background: transparent; 
          overflow: hidden; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.85; } }
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes glow { 
          0%, 100% { box-shadow: 0 0 25px rgba(139, 92, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(217, 70, 239, 0.8); }
        }
        .animate-pulse { animation: pulse 2s infinite; }
        .animate-slide-down { animation: slideDown 0.6s ease-out; }
        .animate-slide-up { animation: slideUp 0.6s ease-out; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-shimmer { background-size: 200% auto; animation: shimmer 3s linear infinite; }
        .glass { 
          background: rgba(255, 255, 255, 0.05); 
          backdrop-filter: blur(20px) saturate(180%); 
        }
        @media (max-width: 768px) { 
          .mobile-hide { display: none !important; }
        }
      `}</style>

      <div style={{ 
        width: "100vw", 
        height: "100vh", 
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)", 
        backgroundSize: "400% 400%",
        animation: "shimmer 20s ease infinite",
        color: "white", 
        position: "relative", 
        overflow: "hidden",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
      }}>
        
        {/* Background Orbs */}
        <div className="animate-float" style={{ position: "fixed", top: "-10%", left: "-5%", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.5), transparent 70%)", filter: "blur(80px)", opacity: 0.6, pointerEvents: "none", zIndex: 0 }} />
        <div className="animate-float" style={{ position: "fixed", bottom: "-10%", right: "-5%", width: "800px", height: "800px", borderRadius: "50%", background: "radial-gradient(circle, rgba(217,70,239,0.4), transparent 70%)", filter: "blur(100px)", opacity: 0.5, pointerEvents: "none", zIndex: 0, animationDelay: "2s" }} />

        {/* HEADER */}
        <header className="animate-slide-down glass" style={{ borderBottom: "2px solid rgba(139, 92, 246, 0.3)", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)", zIndex: 100, padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", maxWidth: "1920px", margin: "0 auto", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <img src="/images/logo.png" alt="Logo" style={{ height: "80px", width: "auto" }} />
              <div className="mobile-hide" style={{ fontSize: "16px", fontWeight: 700, color: "#94a3b8" }}>Global Live Quiz</div>
            </div>
            
            <div className="animate-glow" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 28px", borderRadius: "999px", background: "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.2))", border: "3px solid rgba(139, 92, 246, 0.7)" }}>
              <Radio style={{ width: "20px", height: "20px", color: "#ef4444" }} />
              <span style={{ fontSize: "20px", fontWeight: 900, background: "linear-gradient(90deg, #a78bfa, #d946ef)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>LIVE QUIZ</span>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px", borderRadius: "12px", background: "rgba(139, 92, 246, 0.25)", border: "2px solid rgba(139, 92, 246, 0.6)" }}>
              <Users style={{ width: "18px", height: "18px", color: "#a78bfa" }} />
              <span style={{ fontSize: "18px", fontWeight: 900 }}>{activePlayers.toLocaleString()}</span>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 10, overflow: "auto" }}>
          
          {/* WAITING */}
          {currentPhase === "waiting" && (
            <div className="glass" style={{ width: "100%", maxWidth: "700px", padding: "48px 32px", borderRadius: "32px", border: "2px solid rgba(139, 92, 246, 0.5)", boxShadow: "0 25px 70px rgba(0,0,0,0.7)", textAlign: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "12px 24px", borderRadius: "999px", background: "rgba(139, 92, 246, 0.25)", border: "2px solid rgba(139, 92, 246, 0.6)", marginBottom: "32px" }}>
                <Clock style={{ width: "18px", height: "18px", color: "#a78bfa" }} />
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#c4b5fd", textTransform: "uppercase" }}>Next Round Starting</span>
              </div>
              
              <div className="animate-pulse" style={{ width: "240px", height: "240px", margin: "0 auto 32px", borderRadius: "50%", border: "5px solid #22c55e", boxShadow: "0 0 50px rgba(34, 197, 94, 0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", background: "radial-gradient(circle, rgba(15, 23, 42, 0.95), rgba(6, 8, 20, 0.95))" }}>
                <Clock style={{ width: "32px", height: "32px", color: "#22c55e" }} />
                <div style={{ fontSize: "60px", fontWeight: 900, color: "#22c55e", textShadow: "0 0 30px rgba(34, 197, 94, 0.9)", fontFamily: "monospace" }}>{formatTime(timeLeft)}</div>
                <div style={{ fontSize: "13px", color: "#86efac", fontWeight: 700, textTransform: "uppercase" }}>MINUTES</div>
              </div>
              
              <div style={{ padding: "24px", borderRadius: "20px", background: "rgba(34, 197, 94, 0.2)", border: "2px solid rgba(34, 197, 94, 0.5)" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#4ade80", marginBottom: "8px" }}>🎮 {activePlayers.toLocaleString()} Players Ready</div>
                <div style={{ fontSize: "15px", color: "#94a3b8" }}>Auto-join when round starts</div>
              </div>
            </div>
          )}

          {/* QUIZ */}
          {currentPhase === "quiz" && (
            <div style={{ width: "100%", maxWidth: "1000px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div style={{ padding: "14px 28px", borderRadius: "999px", background: "rgba(251,191,36,0.25)", border: "2px solid rgba(251,191,36,0.7)" }}>
                  <span style={{ fontSize: "22px", fontWeight: 900, color: "#fbbf24" }}>Q{currentQuestion}/50</span>
                </div>
                <div className="animate-pulse" style={{ width: "100px", height: "100px", borderRadius: "50%", border: `5px solid ${getTimerColor()}`, boxShadow: `0 0 40px ${getTimerColor()}`, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15, 23, 42, 0.95)" }}>
                  <span style={{ fontSize: "50px", fontWeight: 900, color: getTimerColor(), fontFamily: "monospace" }}>{questionTimer}</span>
                </div>
                <div style={{ padding: "14px 28px", borderRadius: "999px", background: "rgba(59,130,246,0.25)", border: "2px solid rgba(59,130,246,0.7)" }}>
                  <span style={{ fontSize: "18px", fontWeight: 800, color: "#60a5fa" }}>{answeredPercentage}% Done</span>
                </div>
              </div>

              {!showExplanation ? (
                <>
                  <div className="glass" style={{ padding: "36px", borderRadius: "24px", border: "2px solid rgba(139,92,246,0.5)", boxShadow: "0 15px 50px rgba(0,0,0,0.6)" }}>
                    <h2 style={{ fontSize: "26px", fontWeight: 700, textAlign: "center", margin: 0, lineHeight: 1.5 }}>{question.text}</h2>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                    {question.options.map((opt, idx) => (
                      <div key={idx} className="glass" style={{ padding: "26px", borderRadius: "20px", border: "2px solid rgba(139,92,246,0.5)", boxShadow: "0 12px 35px rgba(0,0,0,0.5)", textAlign: "center", cursor: "pointer" }}>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#a78bfa", marginBottom: "10px" }}>OPTION {String.fromCharCode(65 + idx)}</div>
                        <div style={{ fontSize: "19px", fontWeight: 600, lineHeight: 1.4 }}>{opt}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="glass" style={{ padding: "40px", borderRadius: "28px", border: "3px solid rgba(34,197,94,0.7)", boxShadow: "0 20px 60px rgba(34,197,94,0.5)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", justifyContent: "center", flexWrap: "wrap" }}>
                    <CheckCircle style={{ width: "42px", height: "42px", color: "#22c55e" }} />
                    <span style={{ fontSize: "32px", fontWeight: 900, color: "#22c55e" }}>Correct Answer</span>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 800, textAlign: "center", padding: "24px", borderRadius: "18px", background: "rgba(34,197,94,0.2)", border: "2px solid rgba(34,197,94,0.5)", marginBottom: "24px" }}>{String.fromCharCode(65 + question.correctIndex)}: {question.options[question.correctIndex]}</div>
                  <p style={{ fontSize: "18px", color: "#cbd5e1", lineHeight: 1.7, textAlign: "center", marginBottom: "24px" }}>{question.explanation}</p>
                  <div style={{ padding: "18px", borderRadius: "14px", background: "rgba(15,23,42,0.9)", border: "2px solid rgba(56,189,248,0.5)", textAlign: "center" }}>
                    <p style={{ fontSize: "16px", color: "#94a3b8", margin: 0 }}>Next question in <span style={{ color: "#22d3ee", fontWeight: 900, fontSize: "22px" }}>5</span> seconds...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RESULTS */}
          {currentPhase === "results" && (
            <div className="glass" style={{ width: "100%", maxWidth: "800px", padding: "48px 32px", borderRadius: "32px", border: "2px solid rgba(251,191,36,0.5)", boxShadow: "0 30px 80px rgba(0,0,0,0.7)", textAlign: "center" }}>
              <div className="animate-float"><Trophy style={{ width: "70px", height: "70px", color: "#fbbf24", margin: "0 auto 28px" }} /></div>
              <h2 className="animate-shimmer" style={{ fontSize: "40px", fontWeight: 900, marginBottom: "20px", background: "linear-gradient(90deg, #fbbf24, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Round Complete!</h2>
              <p style={{ fontSize: "18px", color: "#94a3b8", marginBottom: "36px" }}>Top Performers</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
                {topPlayers.map((p, idx) => (
                  <div key={p.rank} className="glass" style={{ display: "flex", alignItems: "center", gap: "18px", padding: "20px", borderRadius: "22px", border: idx === 0 ? "3px solid rgba(251,191,36,0.7)" : "2px solid rgba(139,92,246,0.5)", background: idx === 0 ? "rgba(251,191,36,0.15)" : "rgba(139,92,246,0.1)" }}>
                    <div style={{ fontSize: "40px", width: "70px", height: "70px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "14px", background: idx === 0 ? "rgba(251,191,36,0.3)" : "rgba(139,92,246,0.25)", border: idx === 0 ? "3px solid rgba(251,191,36,0.7)" : "2px solid rgba(139,92,246,0.6)" }}>{p.avatar}</div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ fontSize: "22px", fontWeight: 800, marginBottom: "4px" }}>{p.name}</div>
                      <div style={{ fontSize: "15px", color: "#94a3b8", fontWeight: 600 }}>Rank #{p.rank}</div>
                    </div>
                    <div style={{ padding: "14px 20px", borderRadius: "999px", background: idx === 0 ? "rgba(251,191,36,0.3)" : "rgba(139,92,246,0.25)", border: idx === 0 ? "2px solid rgba(251,191,36,0.6)" : "2px solid rgba(139,92,246,0.5)" }}>
                      <div style={{ fontSize: "24px", fontWeight: 900, color: idx === 0 ? "#fbbf24" : "#a78bfa" }}>{p.score.toLocaleString()}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>POINTS</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(59,130,246,0.2)", border: "2px solid rgba(59,130,246,0.5)" }}>
                <div style={{ fontSize: "17px", color: "#60a5fa", fontWeight: 700 }}>⏳ Next round starting soon...</div>
              </div>
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="animate-slide-up glass" style={{ borderTop: "2px solid rgba(139,92,246,0.3)", boxShadow: "0 -8px 32px rgba(0,0,0,0.5)", zIndex: 100, padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", maxWidth: "1920px", margin: "0 auto", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 22px", borderRadius: "999px", background: "rgba(251,191,36,0.25)", border: "2px solid rgba(251,191,36,0.6)" }}>
              <Crown style={{ width: "24px", height: "24px", color: "#fbbf24" }} />
              <div>
                <div style={{ fontSize: "11px", color: "#fbbf24", fontWeight: 800 }}>MONTHLY PRIZE</div>
                <div style={{ fontSize: "20px", fontWeight: 900 }}>£1,000</div>
              </div>
            </div>
            <div className="mobile-hide" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
              <TrendingUp style={{ width: "20px", height: "20px", color: "#a78bfa" }} />
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#cbd5e1" }}>
                <span style={{ color: "#a78bfa", fontWeight: 900 }}>{topPlayers[0]?.name}</span> leads
              </div>
            </div>
            <div className="animate-pulse" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 22px", borderRadius: "999px", background: "rgba(34,197,94,0.25)", border: "2px solid rgba(34,197,94,0.6)" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 15px #22c55e" }} />
              <span style={{ fontSize: "15px", fontWeight: 800, color: "#4ade80", textTransform: "uppercase" }}>LIVE</span>
            </div>
          </div>
        </footer>

        {/* FLOATING CARDS - Desktop Only */}
        {currentPhase === "waiting" && (
          <>
            <aside className="mobile-hide glass" style={{ position: "absolute", top: "130px", left: "40px", width: "260px", padding: "24px", borderRadius: "24px", border: "2px solid rgba(167,139,250,0.5)", boxShadow: "0 15px 50px rgba(0,0,0,0.6)", textAlign: "center", zIndex: 50 }}>
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "14px", textTransform: "uppercase", fontWeight: 700 }}>Presented By</div>
              <div style={{ width: "100%", height: "110px", borderRadius: "14px", background: "radial-gradient(circle, rgba(167,139,250,0.15), transparent)", border: "1px solid rgba(148,163,253,0.3)", display: "flex", alignItems: "center", justifyContent: "center", padding: "14px" }}>
                <img src="/images/sponsor.png" alt="Sponsor" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement!.innerHTML = '<div style="color: #64748b; font-size: 14px;">Sponsor Logo</div>'; }} />
              </div>
            </aside>
            
            <aside className="mobile-hide glass" style={{ position: "absolute", top: "130px", right: "40px", width: "260px", padding: "24px", borderRadius: "24px", border: "2px solid rgba(139,92,246,0.5)", boxShadow: "0 15px 50px rgba(0,0,0,0.6)", zIndex: 50 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                <Target style={{ width: "24px", height: "24px", color: "#a78bfa" }} />
                <span style={{ fontSize: "15px", fontWeight: 800, color: "#c4b5fd", textTransform: "uppercase" }}>Stats</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600 }}>Rounds</span>
                  <span style={{ fontSize: "20px", fontWeight: 900, color: "#a78bfa" }}>1,247</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600 }}>Questions</span>
                  <span style={{ fontSize: "20px", fontWeight: 900, color: "#22d3ee" }}>62.3K</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 600 }}>Online</span>
                  <span style={{ fontSize: "20px", fontWeight: 900, color: "#4ade80" }}>{activePlayers}</span>
                </div>
              </div>
            </aside>
            
            <aside className="mobile-hide glass" style={{ position: "absolute", bottom: "130px", left: "40px", width: "260px", padding: "24px", borderRadius: "24px", border: "2px solid rgba(251,191,36,0.5)", boxShadow: "0 15px 50px rgba(0,0,0,0.6)", zIndex: 50 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <Trophy style={{ width: "24px", height: "24px", color: "#fbbf24" }} />
                <span style={{ fontSize: "15px", fontWeight: 800, color: "#fbbf24", textTransform: "uppercase" }}>Prize</span>
              </div>
              <div style={{ fontSize: "15px", color: "#cbd5e1", lineHeight: 1.6, marginBottom: "16px" }}>
                Winner gets <span style={{ color: "#fbbf24", fontWeight: 900, fontSize: "18px" }}>£1,000</span>
              </div>
              <div style={{ padding: "14px", borderRadius: "14px", background: "rgba(34,197,94,0.2)", border: "2px solid rgba(34,197,94,0.5)" }}>
                <div style={{ fontSize: "13px", color: "#86efac", fontWeight: 700, textAlign: "center" }}>✅ 2000+ players required</div>
              </div>
            </aside>
          </>
        )}
      </div>
    </>
  );
}