"use client";

import { useState, useEffect } from "react";
import { Crown, Trophy, Medal, Flame, Zap, TrendingUp, Star, Award, ChevronRight } from "lucide-react";
// import { supabase } from "@/lib/supabaseClient"; // Uncomment when ready

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('daily');
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  // SSR-safe viewport check for ordering podium cards
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)');
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsDesktop((e as MediaQueryList).matches ?? (e as MediaQueryListEvent).matches);
    onChange(mq as unknown as MediaQueryList);
    mq.addEventListener ? mq.addEventListener('change', onChange as any) : mq.addListener(onChange as any);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', onChange as any) : mq.removeListener(onChange as any);
    };
  }, []);

  // Mock data - Replace with API
  const leaderboardData: Record<string, any[]> = {
    daily: Array.from({ length: 100 }, (_, i) => ({
      rank: i + 1,
      name: ['Sarah Chen', 'Alex Kumar', 'Emma Rodriguez', 'Michael Zhang', 'Sofia Martinez', 'James Wilson', 'Lisa Anderson', 'David Lee', 'Maria Garcia', 'John Smith'][i % 10],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      score: 50000 - (i * 450),
      accuracy: Math.max(0, Math.floor(98 - (i * 0.3))),
      streak: Math.max(1, 20 - i),
      country: ['🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇯🇵', '🇰🇷', '🇧🇷', '🇮🇳'][i % 10],
      isOnline: i < 30
    })),
    weekly: Array.from({ length: 100 }, (_, i) => ({
      rank: i + 1,
      name: ['Alex Kumar', 'Sarah Chen', 'Emma Rodriguez', 'Michael Zhang', 'Sofia Martinez', 'James Wilson', 'Lisa Anderson', 'David Lee', 'Maria Garcia', 'John Smith'][i % 10],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 50}`,
      score: 180000 - (i * 1600),
      accuracy: Math.max(0, Math.floor(96 - (i * 0.25))),
      streak: Math.max(1, 25 - i),
      country: ['🇬🇧', '🇺🇸', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇯🇵', '🇰🇷', '🇧🇷', '🇮🇳'][i % 10],
      isOnline: i < 25
    })),
    monthly: Array.from({ length: 100 }, (_, i) => ({
      rank: i + 1,
      name: ['Emma Rodriguez', 'Alex Kumar', 'Sarah Chen', 'Michael Zhang', 'Sofia Martinez', 'James Wilson', 'Lisa Anderson', 'David Lee', 'Maria Garcia', 'John Smith'][i % 10],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 100}`,
      score: 750000 - (i * 7000),
      accuracy: Math.max(0, Math.floor(95 - (i * 0.2))),
      streak: Math.max(1, 30 - i),
      country: ['🇪🇸', '🇬🇧', '🇺🇸', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇯🇵', '🇰🇷', '🇧🇷'][i % 10],
      isOnline: i < 20
    })),
    allTime: Array.from({ length: 100 }, (_, i) => ({
      rank: i + 1,
      name: ['Michael Zhang', 'Emma Rodriguez', 'Alex Kumar', 'Sarah Chen', 'Sofia Martinez', 'James Wilson', 'Lisa Anderson', 'David Lee', 'Maria Garcia', 'John Smith'][i % 10],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 150}`,
      score: 2500000 - (i * 23000),
      accuracy: Math.max(0, Math.floor(94 - (i * 0.15))),
      streak: Math.max(1, 50 - i),
      country: ['🇨🇳', '🇪🇸', '🇬🇧', '🇺🇸', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇯🇵', '🇰🇷'][i % 10],
      isOnline: i < 15
    }))
  };

  // Fetch leaderboard (mock for now; keep your Supabase options commented as in source)
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);

      // --- OPTION 1: Direct Supabase Query (keep as-is in your original code) ---
      // (left commented to avoid build errors when supabase client is not present)

      // --- OPTION 2: API Route (left commented, same as original) ---

      // TEMPORARY: Using mock data (kept from original source)
      setTimeout(() => {
        setTopPlayers(leaderboardData[activeTab]);
        setLoading(false);
      }, 400);
    };

    fetchLeaderboard();

    // Optional realtime (kept commented in original)
  }, [activeTab]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-orange-500';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-600 to-amber-800';
    return 'from-violet-500 to-fuchsia-500';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-full h-full" />;
    if (rank === 2) return <Trophy className="w-full h-full" />;
    if (rank === 3) return <Medal className="w-full h-full" />;
    return rank;
  };

  const top3 = topPlayers.slice(0, 3);
  const restPlayers = topPlayers.slice(3);

  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes neonPulse {
          0%, 100% { 
            box-shadow: 0 0 10px rgba(139, 92, 246, 0.5),
                        0 0 20px rgba(139, 92, 246, 0.3),
                        0 0 30px rgba(139, 92, 246, 0.2),
                        inset 0 0 15px rgba(139, 92, 246, 0.1);
          }
          50% { 
            box-shadow: 0 0 20px rgba(217, 70, 239, 0.8),
                        0 0 40px rgba(217, 70, 239, 0.5),
                        0 0 60px rgba(217, 70, 239, 0.3),
                        inset 0 0 25px rgba(217, 70, 239, 0.2);
          }
        }
        @keyframes goldGlow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(234, 179, 8, 0.6),
                        0 0 40px rgba(234, 179, 8, 0.4),
                        0 0 60px rgba(234, 179, 8, 0.2);
          }
          50% { 
            box-shadow: 0 0 30px rgba(234, 179, 8, 1),
                        0 0 60px rgba(234, 179, 8, 0.7),
                        0 0 90px rgba(234, 179, 8, 0.4);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-slide-in { animation: slideIn 0.5s ease-out; }
        .neon-border { animation: neonPulse 2s ease-in-out infinite; }
        .gold-glow { animation: goldGlow 2s ease-in-out infinite; }

        @media (max-width: 768px) {
          .mobile-hide { display: none !important; }
          .mobile-stack { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #0f172a, #1e1b4b, #0f172a)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background */}
        <div className="animate-float" style={{
          position: 'fixed',
          top: '5%',
          left: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          opacity: 0.25,
          filter: 'blur(100px)',
          zIndex: 0
        }}></div>
        <div className="animate-float" style={{
          position: 'fixed',
          bottom: '5%',
          right: '5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #d946ef 0%, transparent 70%)',
          opacity: 0.2,
          filter: 'blur(100px)',
          zIndex: 0,
          animationDelay: '1.5s'
        }}></div>

        {/* Header */}
        <header style={{
          position: 'relative',
          zIndex: 50,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(15, 23, 42, 0.8)'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 3vw, 24px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px', gap: '16px' }}>
              
              {/* Left - Logo */}
<div
  onClick={() => (window.location.href = '/')}
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'transform 0.25s ease, opacity 0.25s ease',
  }}
  onMouseEnter={(e) =>
    ((e.currentTarget as HTMLDivElement).style.transform = 'scale(1.05)')
  }
  onMouseLeave={(e) =>
    ((e.currentTarget as HTMLDivElement).style.transform = 'scale(1)')
  }
>
  <div
    style={{
      width: 'clamp(50px, 10vw, 60px)',
      height: 'clamp(50px, 10vw, 60px)',
      borderRadius: '50%',
      background: 'linear-gradient(to bottom right, #7c3aed, #d946ef)',
      padding: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 25px rgba(139, 92, 246, 0.55)',
      border: '2px solid rgba(255, 255, 255, 0.08)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* 🔵 İç koyu zemin */}
    <div
      style={{
        position: 'absolute',
        inset: '4px',
        borderRadius: '50%',
        backgroundColor: '#0f172a', // dark navy background
        zIndex: 1,
      }}
    />

    {/* 🟣 Logo */}
    <img
      src="images/logo.png"
      alt="VibraXX Logo"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        position: 'relative',
        zIndex: 2,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
      }}
    />
  </div>

  <div className="mobile-hide">
    <div
      style={{
        fontSize: 'clamp(16px, 3vw, 20px)',
        fontWeight: 700,
        letterSpacing: '0.02em',
      }}
    >
         </div>
    <div
      style={{
        fontSize: 'clamp(10px, 2vw, 12px)',
        color: '#94a3b8',
        letterSpacing: '0.05em',
      }}
    >
      LIVE QUIZ ARENA
    </div>
  </div>
</div>


              {/* Center - Title */}
              <div className="animate-shimmer" style={{ 
                fontSize: 'clamp(16px, 3vw, 28px)',
                fontWeight: 900,
                background: 'linear-gradient(90deg, #7c3aed, #d946ef, #f0abfc, #d946ef, #7c3aed)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'center'
              }}>
                Leaderboard
              </div>

              {/* Right - Home Button */}
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 24px)',
                  borderRadius: '12px',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(217, 70, 239, 0.1))',
                  color: 'white',
                  fontSize: 'clamp(13px, 2.5vw, 15px)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
                  whiteSpace: 'nowrap'
                }}
                className="neon-border"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(217, 70, 239, 0.2))';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 5px 30px rgba(139, 92, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(217, 70, 239, 0.1))';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.3)';
                }}
              >
                <Zap style={{ width: 'clamp(16px, 3vw, 20px)', height: 'clamp(16px, 3vw, 20px)', color: '#a78bfa' }} />
                <span className="mobile-hide">Home</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ position: 'relative', zIndex: 10, padding: 'clamp(30px, 5vw, 50px) clamp(16px, 3vw, 24px)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* Tab Navigation */}
            <div style={{ 
              display: 'flex', 
              gap: 'clamp(8px, 2vw, 16px)', 
              marginBottom: 'clamp(30px, 5vw, 50px)',
              overflowX: 'auto',
              padding: '4px'
            }}>
              {['daily', 'weekly', 'monthly', 'allTime'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  style={{
                    padding: 'clamp(12px, 2.5vw, 16px) clamp(20px, 4vw, 32px)',
                    borderRadius: '16px',
                    border: `2px solid ${activeTab === tab ? '#a78bfa' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: activeTab === tab 
                      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(217, 70, 239, 0.2))' 
                      : 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: 'clamp(13px, 2.5vw, 16px)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    textTransform: 'capitalize',
                    whiteSpace: 'nowrap',
                    backdropFilter: 'blur(10px)',
                    boxShadow: activeTab === tab ? '0 0 20px rgba(139, 92, 246, 0.4)' : 'none'
                  }}
                  className={activeTab === tab ? 'neon-border' : ''}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139, 92, 246, 0.15)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139, 92, 246, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.05)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                >
                  {tab === 'allTime' ? 'All Time' : tab}
                </button>
              ))}
            </div>

            {/* Top 3 Podium */}
            <div className="mobile-stack" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 'clamp(16px, 3vw, 32px)',
              marginBottom: 'clamp(40px, 6vw, 60px)',
              alignItems: 'end'
            }}>
              {/* 2nd Place */}
              {top3[1] && (
                <div className="animate-slide-in" style={{ 
                  order: isDesktop ? 1 : 2,
                  animationDelay: '0.1s'
                }}>
                  <div style={{
                    padding: 'clamp(24px, 4vw, 32px)',
                    borderRadius: '24px',
                    border: '3px solid rgba(192, 192, 192, 0.5)',
                    background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15), rgba(156, 163, 175, 0.1))',
                    backdropFilter: 'blur(20px)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 0 30px rgba(192, 192, 192, 0.3)'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'radial-gradient(circle, rgba(192, 192, 192, 0.1) 0%, transparent 70%)',
                      animation: 'float 4s ease-in-out infinite'
                    }}></div>
                    
                    <div style={{
                      position: 'relative',
                      width: 'clamp(70px, 15vw, 90px)',
                      height: 'clamp(70px, 15vw, 90px)',
                      margin: '0 auto clamp(16px, 3vw, 20px)',
                      borderRadius: '50%',
                      padding: '4px',
                      background: 'linear-gradient(135deg, #d1d5db, #9ca3af)',
                      boxShadow: '0 0 30px rgba(192, 192, 192, 0.5)'
                    }}>
                      <img src={top3[1].avatar} alt={top3[1].name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                      <div style={{
                        position: 'absolute',
                        bottom: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'clamp(32px, 7vw, 40px)',
                        height: 'clamp(32px, 7vw, 40px)',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #d1d5db, #9ca3af)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(15, 23, 42, 0.8)',
                        color: '#0f172a',
                        fontWeight: 900,
                        fontSize: 'clamp(14px, 3vw, 18px)'
                      }}>
                        2
                      </div>
                    </div>

                    <h3 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 700, marginBottom: '8px' }}>
                      {top3[1].name}
                    </h3>
                    <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900, color: '#d1d5db', marginBottom: '12px' }}>
                      {top3[1].score.toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: 'clamp(12px, 2.5vw, 14px)', color: '#94a3b8' }}>
                      <span>{top3[1].accuracy}% acc</span>
                      <span>•</span>
                      <span className="mobile-hide">{top3[1].streak} streak</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <div className="animate-slide-in gold-glow" style={{ 
                  order: isDesktop ? 2 : 1,
                  animationDelay: '0s'
                }}>
                  <div style={{
                    padding: 'clamp(32px, 5vw, 48px)',
                    borderRadius: '32px',
                    border: '4px solid rgba(234, 179, 8, 0.6)',
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(202, 138, 4, 0.15))',
                    backdropFilter: 'blur(20px)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    transform: 'scale(1.1)'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'radial-gradient(circle, rgba(234, 179, 8, 0.2) 0%, transparent 70%)',
                      animation: 'float 3s ease-in-out infinite'
                    }}></div>

                    <div className="animate-float" style={{
                      position: 'absolute',
                      top: 'clamp(-20px, -3vw, -30px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 'clamp(40px, 8vw, 60px)'
                    }}>
                      👑
                    </div>
                    
                    <div style={{
                      position: 'relative',
                      width: 'clamp(90px, 18vw, 120px)',
                      height: 'clamp(90px, 18vw, 120px)',
                      margin: '0 auto clamp(20px, 4vw, 24px)',
                      borderRadius: '50%',
                      padding: '5px',
                      background: 'linear-gradient(135deg, #eab308, #f59e0b)',
                      boxShadow: '0 0 50px rgba(234, 179, 8, 0.8)'
                    }}>
                      <img src={top3[0].avatar} alt={top3[0].name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                      <div style={{
                        position: 'absolute',
                        bottom: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'clamp(40px, 8vw, 50px)',
                        height: 'clamp(40px, 8vw, 50px)',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #eab308, #f59e0b)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px solid rgba(15, 23, 42, 0.8)',
                        boxShadow: '0 0 20px rgba(234, 179, 8, 0.8)'
                      }}>
                        <Crown style={{ width: 'clamp(20px, 4vw, 28px)', height: 'clamp(20px, 4vw, 28px)', color: '#0f172a' }} />
                      </div>
                    </div>

                    <h3 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, marginBottom: '8px' }}>
                      {top3[0].name}
                    </h3>
                    <div style={{ fontSize: 'clamp(32px, 6vw, 42px)', fontWeight: 900, color: '#facc15', marginBottom: '16px' }}>
                      {top3[0].score.toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: 'clamp(13px, 2.5vw, 15px)', color: '#fef08a' }}>
                      <span>🎯 {top3[0].accuracy}%</span>
                      <span className="mobile-hide">🔥 {top3[0].streak}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <div className="animate-slide-in" style={{ 
                  order: 3,
                  animationDelay: '0.2s'
                }}>
                  <div style={{
                    padding: 'clamp(24px, 4vw, 32px)',
                    borderRadius: '24px',
                    border: '3px solid rgba(180, 83, 9, 0.5)',
                    background: 'linear-gradient(135deg, rgba(180, 83, 9, 0.15), rgba(146, 64, 14, 0.1))',
                    backdropFilter: 'blur(20px)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 0 30px rgba(180, 83, 9, 0.3)'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'radial-gradient(circle, rgba(180, 83, 9, 0.1) 0%, transparent 70%)',
                      animation: 'float 4s ease-in-out infinite',
                      animationDelay: '1s'
                    }}></div>
                    
                    <div style={{
                      position: 'relative',
                      width: 'clamp(70px, 15vw, 90px)',
                      height: 'clamp(70px, 15vw, 90px)',
                      margin: '0 auto clamp(16px, 3vw, 20px)',
                      borderRadius: '50%',
                      padding: '4px',
                      background: 'linear-gradient(135deg, #b45309, #92400e)',
                      boxShadow: '0 0 30px rgba(180, 83, 9, 0.5)'
                    }}>
                      <img src={top3[2].avatar} alt={top3[2].name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                      <div style={{
                        position: 'absolute',
                        bottom: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'clamp(32px, 7vw, 40px)',
                        height: 'clamp(32px, 7vw, 40px)',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #b45309, #92400e)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(15, 23, 42, 0.8)',
                        color: '#0f172a',
                        fontWeight: 900,
                        fontSize: 'clamp(14px, 3vw, 18px)'
                      }}>
                        3
                      </div>
                    </div>

                    <h3 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 700, marginBottom: '8px' }}>
                      {top3[2].name}
                    </h3>
                    <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900, color: '#d97706', marginBottom: '12px' }}>
                      {top3[2].score.toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: 'clamp(12px, 2.5vw, 14px)', color: '#94a3b8' }}>
                      <span>{top3[2].accuracy}% acc</span>
                      <span>•</span>
                      <span className="mobile-hide">{top3[2].streak} streak</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rest of Players */}
            <div style={{
              borderRadius: '24px',
              border: '2px solid rgba(139, 92, 246, 0.2)',
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(20px)',
              overflow: 'hidden',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)'
            }}>
              <div style={{ 
                padding: 'clamp(20px, 4vw, 32px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(217, 70, 239, 0.05))'
              }}>
                <h2 style={{ fontSize: 'clamp(18px, 3.5vw, 24px)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Star style={{ width: 'clamp(20px, 4vw, 24px)', height: 'clamp(20px, 4vw, 24px)', color: '#a78bfa' }} />
                  Top 100 Players
                </h2>
              </div>

              <div style={{ maxHeight: '800px', overflowY: 'auto', padding: 'clamp(12px, 3vw, 20px)' }}>
                {loading ? (
                  // Loading skeleton
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div className="animate-glow" style={{
                      width: '60px',
                      height: '60px',
                      margin: '0 auto 20px',
                      borderRadius: '50%',
                      border: '4px solid rgba(139, 92, 246, 0.3)',
                      borderTopColor: '#a78bfa',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ color: '#94a3b8', fontSize: '16px' }}>Loading leaderboard...</p>
                  </div>
                ) : restPlayers.length === 0 ? (
                  // Empty state
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Trophy style={{ width: '60px', height: '60px', color: '#64748b', margin: '0 auto 20px' }} />
                    <p style={{ color: '#94a3b8', fontSize: '16px' }}>No players yet. Be the first!</p>
                  </div>
                ) : (
                  restPlayers.map((player, idx) => (
                    <div
                      key={player.rank}
                      className="animate-slide-in"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'clamp(12px, 3vw, 20px)',
                        padding: 'clamp(14px, 3vw, 18px)',
                        marginBottom: '12px',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(217, 70, 239, 0.03))',
                        transition: 'all 0.3s',
                        animationDelay: `${idx * 0.02}s`,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(217, 70, 239, 0.1))';
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(139, 92, 246, 0.3)';
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateX(8px)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(217, 70, 239, 0.03))';
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255, 255, 255, 0.05)';
                        (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)';
                      }}
                    >
                      {/* Rank */}
                      <div style={{
                        width: 'clamp(40px, 8vw, 50px)',
                        height: 'clamp(40px, 8vw, 50px)',
                        borderRadius: '12px',
                        background: `linear-gradient(135deg, ${getRankColor(player.rank)})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'clamp(14px, 3vw, 18px)',
                        fontWeight: 900,
                        flexShrink: 0,
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                      }}>
                        {player.rank}
                      </div>

                      {/* Avatar */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img 
                          src={player.avatar} 
                          alt={player.name}
                          style={{
                            width: 'clamp(45px, 9vw, 56px)',
                            height: 'clamp(45px, 9vw, 56px)',
                            borderRadius: '50%',
                            border: '3px solid rgba(139, 92, 246, 0.5)',
                            boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)'
                          }}
                        />
                        {player.isOnline && (
                          <div style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            width: 'clamp(10px, 2vw, 12px)',
                            height: 'clamp(10px, 2vw, 12px)',
                            borderRadius: '50%',
                            background: '#22c55e',
                            border: '2px solid rgba(15, 23, 42, 0.9)',
                            boxShadow: '0 0 8px #22c55e'
                          }}></div>
                        )}
                      </div>

                      {/* Player Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h4 style={{ 
                            fontSize: 'clamp(14px, 3vw, 17px)', 
                            fontWeight: 700,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {player.name}
                          </h4>
                          <span style={{ fontSize: 'clamp(16px, 3vw, 20px)' }}>{player.country}</span>
                          {player.streak >= 10 && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid rgba(239, 68, 68, 0.3)'
                            }}>
                              <Flame style={{ width: '12px', height: '12px', color: '#f87171' }} />
                              <span style={{ fontSize: 'clamp(10px, 2vw, 11px)', fontWeight: 700, color: '#f87171' }}>
                                {player.streak}
                              </span>
                            </div>
                          )}
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          gap: 'clamp(8px, 2vw, 16px)', 
                          fontSize: 'clamp(11px, 2vw, 13px)', 
                          color: '#94a3b8',
                          flexWrap: 'wrap'
                        }}>
                          <span className="mobile-hide">🎯 {player.accuracy}%</span>
                          <span className="mobile-hide">•</span>
                          <span>⚡ {player.score.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Score Display */}
                      <div className="mobile-hide" style={{
                        textAlign: 'right',
                        padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px)',
                        borderRadius: '12px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.2)'
                      }}>
                        <div style={{ 
                          fontSize: 'clamp(16px, 3vw, 20px)', 
                          fontWeight: 900,
                          background: 'linear-gradient(to right, #a78bfa, #f0abfc)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>
                          {player.score.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#64748b' }}>points</div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight 
                        className="mobile-hide"
                        style={{ 
                          width: 'clamp(18px, 4vw, 24px)', 
                          height: 'clamp(18px, 4vw, 24px)', 
                          color: '#64748b',
                          flexShrink: 0
                        }} 
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stats Footer */}
            <div className="mobile-stack" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'clamp(16px, 3vw, 24px)',
              marginTop: 'clamp(30px, 5vw, 50px)'
            }}>
              <div style={{
                padding: 'clamp(20px, 4vw, 28px)',
                borderRadius: '20px',
                border: '2px solid rgba(34, 197, 94, 0.3)',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
                backdropFilter: 'blur(20px)',
                textAlign: 'center'
              }}>
                <TrendingUp style={{ 
                  width: 'clamp(32px, 6vw, 40px)', 
                  height: 'clamp(32px, 6vw, 40px)', 
                  color: '#22c55e',
                  margin: '0 auto 12px'
                }} />
                <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900, color: '#22c55e', marginBottom: '8px' }}>
                  {topPlayers.length}
                </div>
                <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', color: '#94a3b8' }}>
                  Active Players
                </div>
              </div>

              <div style={{
                padding: 'clamp(20px, 4vw, 28px)',
                borderRadius: '20px',
                border: '2px solid rgba(139, 92, 246, 0.3)',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))',
                backdropFilter: 'blur(20px)',
                textAlign: 'center'
              }}>
                <Award style={{ 
                  width: 'clamp(32px, 6vw, 40px)', 
                  height: 'clamp(32px, 6vw, 40px)', 
                  color: '#a78bfa',
                  margin: '0 auto 12px'
                }} />
                <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900, color: '#a78bfa', marginBottom: '8px' }}>
                  {topPlayers[0]?.score?.toLocaleString?.() ?? '-'}
                </div>
                <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', color: '#94a3b8' }}>
                  Top Score
                </div>
              </div>

              <div style={{
                padding: 'clamp(20px, 4vw, 28px)',
                borderRadius: '20px',
                border: '2px solid rgba(236, 72, 153, 0.3)',
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(236, 72, 153, 0.05))',
                backdropFilter: 'blur(20px)',
                textAlign: 'center'
              }}>
                <Flame style={{ 
                  width: 'clamp(32px, 6vw, 40px)', 
                  height: 'clamp(32px, 6vw, 40px)', 
                  color: '#ec4899',
                  margin: '0 auto 12px'
                }} />
                <div style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900, color: '#ec4899', marginBottom: '8px' }}>
                  {topPlayers.length ? Math.max(...topPlayers.map((p: any) => p.streak)) : 0}
                </div>
                <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', color: '#94a3b8' }}>
                  Longest Streak
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          position: 'relative',
          zIndex: 10,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(20px)',
          marginTop: 'clamp(40px, 6vw, 60px)'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(30px, 5vw, 40px) clamp(16px, 3vw, 24px)' }}>
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
              © 2025 VibraXX · Powered by Sermin Limited
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
