"use client";

import { useState, useEffect, useRef } from "react";
import { Crown, Trophy, Medal, Flame, Zap, TrendingUp, Star, Award, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('daily');
  const [particles, setParticles] = useState<any[]>([]);

useEffect(() => {
  const arr = [...Array(8)].map((_, i) => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    duration: 2 + Math.random() * 2,
    delay: i * 0.3,
  }));
  setParticles(arr);
}, []);

  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Audio controls - Simple mute/unmute
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Simple audio toggle
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.muted = false;
        audioRef.current.play();
      } else {
        audioRef.current.muted = true;
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  // Initialize audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.loop = true;
      audioRef.current.muted = true;
    }
  }, []);

  // SSR-safe viewport check
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)');
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsDesktop((e as MediaQueryList).matches ?? (e as MediaQueryListEvent).matches);
    onChange(mq as unknown as MediaQueryList);
    mq.addEventListener ? mq.addEventListener('change', onChange as any) : mq.addListener(onChange as any);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', onChange as any) : mq.removeListener(onChange as any);
    };
  }, []);


  // Fetch leaderboard using RPC function
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      
      try {
        // Map activeTab to RPC parameter format
        const leaderboardType = activeTab === 'allTime' ? 'alltime' : activeTab;
        
        // ✅ Use get_leaderboard RPC function
        const { data, error } = await supabase.rpc('get_leaderboard', {
          p_type: leaderboardType,
          p_limit: 100
        });

        if (error) {
          console.error("Error fetching leaderboard:", error);
          setTopPlayers([]);
          return;
        }

        // Map RPC response to UI format
        const leaderboard = (data || []).map((player: any) => ({
          id: player.user_id,
          rank: player.rank,
          name: player.full_name || "Anonymous",
          avatar: player.avatar_url || null,
          country: player.country || "🏳️",
          score: player.points || 0,
          correct: player.correct_answers || 0,
          wrong: player.wrong_answers || 0,
          rounds: player.rounds_played || 0,
          accuracy: player.accuracy || 0,
          streak: 0,  // Can be added later if needed
          isOnline: false  // Can be added later if needed
        }));

        setTopPlayers(leaderboard);
        
        // 🔍 DEBUG
        console.log('🎯 Leaderboard Data:', leaderboard);
        console.log('👑 Top 3:', leaderboard.slice(0, 3));
        console.log('📊 Total Players:', leaderboard.length);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setTopPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeTab]);

  // Helper function for rank colors
  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-400 to-yellow-500";
    if (rank === 2) return "from-gray-300 to-gray-400";
    if (rank === 3) return "from-amber-600 to-amber-700";
    return "from-violet-500 to-violet-600";
  };

  const top3 = topPlayers.slice(0, 3);
const restPlayers = topPlayers.slice(3, 100);


  return (
    <>
      <audio 
        ref={audioRef} 
        src="sounds/vibraxx.mp3"
        aria-label="Background music"
      />

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
                        0 0 30px rgba(139, 92, 246, 0.2);
          }
          50% { 
            box-shadow: 0 0 20px rgba(217, 70, 239, 0.8),
                        0 0 40px rgba(217, 70, 239, 0.5),
                        0 0 60px rgba(217, 70, 239, 0.3);
          }
        }
        @keyframes goldGlow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(234, 179, 8, 0.6),
                        0 0 40px rgba(234, 179, 8, 0.4);
          }
          50% { 
            box-shadow: 0 0 30px rgba(234, 179, 8, 1),
                        0 0 60px rgba(234, 179, 8, 0.7);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes particle {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100px) scale(0); opacity: 0; }
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
        .animate-particle { animation: particle 2s ease-out infinite; }

        *:focus-visible {
          outline: 3px solid #a78bfa;
          outline-offset: 2px;
        }

        html {
          scroll-behavior: smooth;
        }

        @media (max-width: 768px) {
          .mobile-hide { display: none !important; }
          .mobile-stack { grid-template-columns: 1fr !important; }
        }

        /* Footer Styles */
        .vx-footer {
          position: relative;
          z-index: 10;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(20px);
          margin-top: clamp(40px, 6vw, 60px);
          padding: clamp(30px, 5vw, 50px) 0;
        }

        .vx-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 24px);
        }

        .vx-footer-legal {
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

        .vx-footer-legal a {
          color: #a78bfa;
          text-decoration: underline;
          transition: color 0.3s;
        }

        .vx-footer-legal a:hover {
          color: #c4b5fd;
        }

        .vx-footer-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: clamp(8px, 2vw, 12px);
          margin-bottom: clamp(24px, 4vw, 32px);
        }

        .vx-footer-links a {
          color: #94a3b8;
          text-decoration: none;
          font-size: clamp(11px, 2vw, 13px);
          font-weight: 500;
          transition: color 0.3s;
          white-space: nowrap;
        }

        .vx-footer-links a:hover {
          color: #a78bfa;
        }

        .vx-footer-divider {
          color: rgba(148, 163, 184, 0.3);
          font-size: clamp(10px, 2vw, 12px);
        }

        .vx-footer-company {
          color: #64748b;
          font-size: clamp(11px, 2vw, 13px);
          line-height: 1.6;
        }

        .vx-footer-company a {
          color: #a78bfa;
          text-decoration: none;
          transition: color 0.3s;
        }

        .vx-footer-company a:hover {
          color: #c4b5fd;
        }

        @media (max-width: 640px) {
          .vx-footer-divider {
            display: none;
          }
          
          .vx-footer-links {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #0f172a, #1e1b4b, #0f172a)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
      role="main"
      aria-label="Leaderboard page">
        {/* Animated Background */}
        <div className="animate-float" style={{
          position: 'fixed',
          top: '5%',
          left: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          opacity: 0.3,
          filter: 'blur(100px)',
          zIndex: 0
        }}
        aria-hidden="true"></div>
        <div className="animate-float" style={{
          position: 'fixed',
          bottom: '5%',
          right: '5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #d946ef 0%, transparent 70%)',
          opacity: 0.25,
          filter: 'blur(100px)',
          zIndex: 0,
          animationDelay: '1.5s'
        }}
        aria-hidden="true"></div>

      {/* Floating Particles */}
{particles.map((p, i) => (
  <div
    key={i}
    className="animate-particle"
    style={{
      position: "fixed",
      width: "4px",
      height: "4px",
      borderRadius: "50%",
      background: "rgba(167, 139, 250, 0.6)",
      top: `${p.top}%`,
      left: `${p.left}%`,
      animationDelay: `${p.delay}s`,
      animationDuration: `${p.duration}s`,
      zIndex: 0,
    }}
    aria-hidden="true"
  />
))}


        {/* Header */}
        <header 
          style={{
            position: 'relative',
            zIndex: 50,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            background: 'rgba(15, 23, 42, 0.8)'
          }}
          role="banner">
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 3vw, 24px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px', gap: 'clamp(12px, 2vw, 16px)' }}>
              
              {/* Logo */}
              <div
                onClick={() => (window.location.href = '/')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'transform 0.25s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.transform = 'scale(1)')}
                role="link"
                aria-label="Go to homepage"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    window.location.href = '/';
                  }
                }}
              >
                <div style={{
                  width: 'clamp(45px, 9vw, 60px)',
                  height: 'clamp(45px, 9vw, 60px)',
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
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: '4px',
                    borderRadius: '50%',
                    backgroundColor: '#0f172a',
                    zIndex: 1,
                  }} />
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
                  <div style={{
                    fontSize: 'clamp(14px, 2.5vw, 18px)',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}>
                    VIBRAXX
                  </div>
                  <div style={{
                    fontSize: 'clamp(9px, 1.8vw, 11px)',
                    color: '#94a3b8',
                    letterSpacing: '0.05em',
                  }}>
                    LIVE QUIZ ARENA
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 
                className="animate-shimmer" 
                style={{ 
                  fontSize: 'clamp(14px, 3vw, 28px)',
                  fontWeight: 900,
                  background: 'linear-gradient(90deg, #7c3aed, #d946ef, #f0abfc, #d946ef, #7c3aed)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  margin: 0,
                  flex: 1
                }}>
                Leaderboard
              </h1>

              {/* Audio & Home Buttons */}
              <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', alignItems: 'center', flexShrink: 0 }}>
                {/* Simple Audio Toggle */}
                <button
                  onClick={toggleAudio}
                  style={{
                    width: 'clamp(36px, 7vw, 44px)',
                    height: 'clamp(36px, 7vw, 44px)',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(217, 70, 239, 0.1))',
                    border: '2px solid rgba(139, 92, 246, 0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#a78bfa',
                    transition: 'all 0.3s',
                    boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)'
                  }}
                  className="neon-border"
                  aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 25px rgba(139, 92, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 15px rgba(139, 92, 246, 0.3)';
                  }}
                >
                  {isMuted ? 
                    <VolumeX style={{ width: 'clamp(16px, 3vw, 20px)', height: 'clamp(16px, 3vw, 20px)' }} /> : 
                    <Volume2 style={{ width: 'clamp(16px, 3vw, 20px)', height: 'clamp(16px, 3vw, 20px)' }} />
                  }
                </button>

                {/* Home Button */}
                <button
                  onClick={() => window.location.href = '/'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: 'clamp(8px, 2vw, 10px) clamp(12px, 2.5vw, 20px)',
                    borderRadius: '12px',
                    border: '2px solid rgba(139, 92, 246, 0.3)',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(217, 70, 239, 0.1))',
                    color: 'white',
                    fontSize: 'clamp(12px, 2.2vw, 14px)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
                    whiteSpace: 'nowrap'
                  }}
                  className="neon-border"
                  aria-label="Return to homepage"
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
                  <Zap style={{ width: 'clamp(14px, 2.8vw, 18px)', height: 'clamp(14px, 2.8vw, 18px)', color: '#a78bfa' }} aria-hidden="true" />
                  <span className="mobile-hide">Home</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main 
          style={{ position: 'relative', zIndex: 10, padding: 'clamp(20px, 4vw, 50px) clamp(12px, 3vw, 24px)' }}
          id="main-content">
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* Tab Navigation */}
            <nav 
              style={{ 
                display: 'flex', 
                gap: 'clamp(6px, 1.5vw, 16px)', 
                marginBottom: 'clamp(20px, 4vw, 50px)',
                overflowX: 'auto',
                padding: '4px',
                WebkitOverflowScrolling: 'touch'
              }}
              role="tablist"
              aria-label="Leaderboard time periods">
              {['daily', 'weekly', 'monthly', 'allTime'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls={`${tab}-leaderboard`}
                  tabIndex={activeTab === tab ? 0 : -1}
                  style={{
                    padding: 'clamp(10px, 2vw, 16px) clamp(16px, 3vw, 32px)',
                    borderRadius: '12px',
                    border: `2px solid ${activeTab === tab ? '#a78bfa' : 'rgba(255, 255, 255, 0.1)'}`,
                    background: activeTab === tab 
                      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(217, 70, 239, 0.2))' 
                      : 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: 'clamp(11px, 2.2vw, 15px)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    textTransform: 'capitalize',
                    whiteSpace: 'nowrap',
                    backdropFilter: 'blur(10px)',
                    boxShadow: activeTab === tab ? '0 0 20px rgba(139, 92, 246, 0.4)' : 'none',
                    flexShrink: 0
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
            </nav>

            {/* Top 3 Podium */}
            <section 
              className="mobile-stack" 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: 'clamp(12px, 2.5vw, 32px)',
                marginBottom: 'clamp(30px, 5vw, 60px)',
                alignItems: 'end'
              }}
              aria-label="Top 3 players"
              id={`${activeTab}-leaderboard`}
              role="tabpanel">
              
              {/* 2nd Place */}
              {top3[1] && (
                <article 
                  className="animate-slide-in" 
                  style={{ 
                    order: isDesktop ? 1 : 2,
                    animationDelay: '0.1s'
                  }}
                  aria-label={`Second place: ${top3[1].name}`}>
                  <div style={{
                    padding: 'clamp(16px, 3vw, 32px)',
                    borderRadius: '20px',
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
                      width: 'clamp(60px, 13vw, 90px)',
                      height: 'clamp(60px, 13vw, 90px)',
                      margin: '0 auto clamp(12px, 2.5vw, 20px)',
                      borderRadius: '50%',
                      padding: '4px',
                      background: 'linear-gradient(135deg, #d1d5db, #9ca3af)',
                      boxShadow: '0 0 30px rgba(192, 192, 192, 0.5)'
                    }}>
                      <img 
                        src={top3[1].avatar || "/images/default-avatar.png"} 
                        alt={`${top3[1].name}'s avatar`}
                        style={{ width: '100%', height: '100%', borderRadius: '50%' }} 
                      />
                      <div 
                        style={{
                          position: 'absolute',
                          bottom: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 'clamp(28px, 6vw, 40px)',
                          height: 'clamp(28px, 6vw, 40px)',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #d1d5db, #9ca3af)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid rgba(15, 23, 42, 0.8)',
                          color: '#0f172a',
                          fontWeight: 900,
                          fontSize: 'clamp(12px, 2.5vw, 18px)'
                        }}
                        aria-label="Rank 2">
                        2
                      </div>
                    </div>

                    <h3 style={{ fontSize: 'clamp(14px, 2.8vw, 20px)', fontWeight: 700, marginBottom: '6px' }}>
                      {top3[1].name}
                    </h3>
                    <div 
                      style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 900, color: '#d1d5db', marginBottom: '10px' }}
                      aria-label={`Score: ${top3[1].score.toLocaleString()} points`}>
                      {top3[1].score.toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', fontSize: 'clamp(10px, 2vw, 14px)', color: '#94a3b8' }}>
                      <span aria-label={`Accuracy: ${top3[1].accuracy} percent`}>{top3[1].accuracy}% acc</span>
                      <span aria-hidden="true">•</span>
                      <span className="mobile-hide" aria-label={`Streak: ${top3[1].streak} days`}>{top3[1].streak} 🔥</span>
                    </div>
                  </div>
                </article>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <article 
                  className="animate-slide-in gold-glow" 
                  style={{ 
                    order: isDesktop ? 2 : 1,
                    animationDelay: '0s',
                    transform: isDesktop ? 'scale(1.08)' : 'scale(1)'
                  }}
                  aria-label={`First place: ${top3[0].name}`}>
                  <div style={{
                    padding: 'clamp(20px, 4vw, 48px)',
                    borderRadius: '24px',
                    border: '4px solid rgba(234, 179, 8, 0.6)',
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(202, 138, 4, 0.15))',
                    backdropFilter: 'blur(20px)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
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
                      top: 'clamp(-15px, -2.5vw, -30px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 'clamp(30px, 6vw, 60px)'
                    }}
                    aria-hidden="true">
                      👑
                    </div>
                    
                    <div style={{
                      position: 'relative',
                      width: 'clamp(75px, 15vw, 120px)',
                      height: 'clamp(75px, 15vw, 120px)',
                      margin: '0 auto clamp(16px, 3vw, 24px)',
                      borderRadius: '50%',
                      padding: '5px',
                      background: 'linear-gradient(135deg, #eab308, #f59e0b)',
                      boxShadow: '0 0 50px rgba(234, 179, 8, 0.8)'
                    }}>
                      <img 
                        src={top3[0].avatar || "/images/default-avatar.png"} 
                        alt={`${top3[0].name}'s avatar - Champion`}
                        style={{ width: '100%', height: '100%', borderRadius: '50%' }} 
                      />
                      <div 
                        style={{
                          position: 'absolute',
                          bottom: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 'clamp(35px, 7vw, 50px)',
                          height: 'clamp(35px, 7vw, 50px)',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #eab308, #f59e0b)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '3px solid rgba(15, 23, 42, 0.8)',
                          boxShadow: '0 0 20px rgba(234, 179, 8, 0.8)'
                        }}
                        aria-label="Rank 1 - Champion">
                        <Crown style={{ width: 'clamp(18px, 3.5vw, 28px)', height: 'clamp(18px, 3.5vw, 28px)', color: '#0f172a' }} aria-hidden="true" />
                      </div>
                    </div>

                    <h3 style={{ fontSize: 'clamp(16px, 3.2vw, 24px)', fontWeight: 900, marginBottom: '8px' }}>
                      {top3[0].name}
                    </h3>
                    <div 
                      style={{ fontSize: 'clamp(26px, 5vw, 42px)', fontWeight: 900, color: '#facc15', marginBottom: '12px' }}
                      aria-label={`Score: ${top3[0].score.toLocaleString()} points`}>
                      {top3[0].score.toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', fontSize: 'clamp(11px, 2.2vw, 15px)', color: '#fef08a' }}>
                      <span aria-label={`Accuracy: ${top3[0].accuracy} percent`}>🎯 {top3[0].accuracy}%</span>
                      <span className="mobile-hide" aria-label={`Streak: ${top3[0].streak} days`}>🔥 {top3[0].streak}</span>
                    </div>
                  </div>
                </article>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <article 
                  className="animate-slide-in" 
                  style={{ 
                    order: 3,
                    animationDelay: '0.2s'
                  }}
                  aria-label={`Third place: ${top3[2].name}`}>
                  <div style={{
                    padding: 'clamp(16px, 3vw, 32px)',
                    borderRadius: '20px',
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
                      width: 'clamp(60px, 13vw, 90px)',
                      height: 'clamp(60px, 13vw, 90px)',
                      margin: '0 auto clamp(12px, 2.5vw, 20px)',
                      borderRadius: '50%',
                      padding: '4px',
                      background: 'linear-gradient(135deg, #b45309, #92400e)',
                      boxShadow: '0 0 30px rgba(180, 83, 9, 0.5)'
                    }}>
                      <img 
                        src={top3[2].avatar || "/images/default-avatar.png"} 
                        alt={`${top3[2].name}'s avatar`}
                        style={{ width: '100%', height: '100%', borderRadius: '50%' }} 
                      />
                      <div 
                        style={{
                          position: 'absolute',
                          bottom: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 'clamp(28px, 6vw, 40px)',
                          height: 'clamp(28px, 6vw, 40px)',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #b45309, #92400e)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid rgba(15, 23, 42, 0.8)',
                          color: '#0f172a',
                          fontWeight: 900,
                          fontSize: 'clamp(12px, 2.5vw, 18px)'
                        }}
                        aria-label="Rank 3">
                        3
                      </div>
                    </div>

                    <h3 style={{ fontSize: 'clamp(14px, 2.8vw, 20px)', fontWeight: 700, marginBottom: '6px' }}>
                      {top3[2].name}
                    </h3>
                    <div 
                      style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 900, color: '#d97706', marginBottom: '10px' }}
                      aria-label={`Score: ${top3[2].score.toLocaleString()} points`}>
                      {top3[2].score.toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', fontSize: 'clamp(10px, 2vw, 14px)', color: '#94a3b8' }}>
                      <span aria-label={`Accuracy: ${top3[2].accuracy} percent`}>{top3[2].accuracy}% acc</span>
                      <span aria-hidden="true">•</span>
                      <span className="mobile-hide" aria-label={`Streak: ${top3[2].streak} days`}>{top3[2].streak} 🔥</span>
                    </div>
                  </div>
                </article>
              )}
            </section>

            {/* Rest of Players */}
            <section 
              style={{
                borderRadius: '20px',
                border: '2px solid rgba(139, 92, 246, 0.2)',
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                overflow: 'hidden',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)'
              }}
              aria-label="Players ranked 4 to 100">
              <div style={{ 
                padding: 'clamp(16px, 3vw, 32px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(217, 70, 239, 0.05))'
              }}>
                <h2 style={{ fontSize: 'clamp(16px, 3vw, 24px)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                  <Star style={{ width: 'clamp(18px, 3.5vw, 24px)', height: 'clamp(18px, 3.5vw, 24px)', color: '#a78bfa' }} aria-hidden="true" />
                  Top 100 Players
                </h2>
              </div>

              <div 
                style={{ maxHeight: '800px', overflowY: 'auto', padding: 'clamp(10px, 2vw, 20px)' }}
                role="list"
                aria-label="Remaining top 100 players">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: 'clamp(40px, 8vw, 60px) 20px' }} role="status" aria-live="polite">
                    <div className="animate-glow" style={{
                      width: 'clamp(50px, 10vw, 60px)',
                      height: 'clamp(50px, 10vw, 60px)',
                      margin: '0 auto 20px',
                      borderRadius: '50%',
                      border: '4px solid rgba(139, 92, 246, 0.3)',
                      borderTopColor: '#a78bfa',
                      animation: 'spin 1s linear infinite'
                    }}
                    aria-hidden="true"></div>
                    <p style={{ color: '#94a3b8', fontSize: 'clamp(13px, 2.5vw, 16px)' }}>Loading leaderboard...</p>
                  </div>
                ) : restPlayers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'clamp(40px, 8vw, 60px) 20px' }} role="status">
                    <Trophy style={{ width: 'clamp(50px, 10vw, 60px)', height: 'clamp(50px, 10vw, 60px)', color: '#64748b', margin: '0 auto 20px' }} aria-hidden="true" />
                    <p style={{ color: '#94a3b8', fontSize: 'clamp(13px, 2.5vw, 16px)' }}>No players yet. Be the first!</p>
                  </div>
                ) : (
                  restPlayers.map((player, idx) => (
                    <article
                      key={player.rank}
                      className="animate-slide-in"
                      role="listitem"
                      aria-label={`Rank ${player.rank}: ${player.name}, ${player.score.toLocaleString()} points`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'clamp(8px, 2vw, 20px)',
                        padding: 'clamp(10px, 2vw, 18px)',
                        marginBottom: 'clamp(8px, 1.5vw, 12px)',
                        borderRadius: '14px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(217, 70, 239, 0.03))',
                        transition: 'all 0.3s',
                        animationDelay: `${idx * 0.02}s`,
                        cursor: 'pointer'
                      }}
                      tabIndex={0}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(217, 70, 239, 0.1))';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139, 92, 246, 0.3)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateX(6px)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(217, 70, 239, 0.03))';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.05)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                      }}
                    >
                      <div 
                        style={{
                          width: 'clamp(35px, 7vw, 50px)',
                          height: 'clamp(35px, 7vw, 50px)',
                          borderRadius: '10px',
                          background: `linear-gradient(135deg, ${getRankColor(player.rank)})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'clamp(12px, 2.5vw, 18px)',
                          fontWeight: 900,
                          flexShrink: 0,
                          border: '2px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                        }}
                        aria-label={`Rank ${player.rank}`}>
                        {player.rank}
                      </div>

                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img 
                          src={player.avatar || "/images/default-avatar.png"} 
                          alt={`${player.name}'s avatar`}
                          style={{
                            width: 'clamp(40px, 8vw, 56px)',
                            height: 'clamp(40px, 8vw, 56px)',
                            borderRadius: '50%',
                            border: '3px solid rgba(139, 92, 246, 0.5)',
                            boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)'
                          }}
                        />
                        {player.isOnline && (
                          <div 
                            style={{
                              position: 'absolute',
                              bottom: '1px',
                              right: '1px',
                              width: 'clamp(8px, 1.8vw, 12px)',
                              height: 'clamp(8px, 1.8vw, 12px)',
                              borderRadius: '50%',
                              background: '#22c55e',
                              border: '2px solid rgba(15, 23, 42, 0.9)',
                              boxShadow: '0 0 8px #22c55e'
                            }}
                            aria-label="Online"
                            title="Online"></div>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                          <h4 style={{ 
                            fontSize: 'clamp(12px, 2.5vw, 17px)', 
                            fontWeight: 700,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            margin: 0
                          }}>
                            {player.name}
                          </h4>
                          <span 
                            style={{ 
                              fontSize: 'clamp(20px, 4vw, 28px)',
                              lineHeight: 1,
                              display: 'inline-block'
                            }}
                            aria-label="Country flag"
                            role="img">
                            {player.country}
                          </span>
                          {player.streak >= 10 && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '3px',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid rgba(239, 68, 68, 0.3)'
                            }}
                            aria-label={`Hot streak: ${player.streak} days`}>
                              <Flame style={{ width: 'clamp(10px, 2vw, 12px)', height: 'clamp(10px, 2vw, 12px)', color: '#f87171' }} aria-hidden="true" />
                              <span style={{ fontSize: 'clamp(9px, 1.8vw, 11px)', fontWeight: 700, color: '#f87171' }}>
                                {player.streak}
                              </span>
                            </div>
                          )}
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          gap: 'clamp(6px, 1.5vw, 16px)', 
                          fontSize: 'clamp(10px, 2vw, 13px)', 
                          color: '#94a3b8',
                          flexWrap: 'wrap'
                        }}>
                          <span className="mobile-hide" aria-label={`Accuracy ${player.accuracy} percent`}>🎯 {player.accuracy}%</span>
                          <span className="mobile-hide" aria-hidden="true">•</span>
                          <span aria-label={`Score ${player.score.toLocaleString()} points`}>⚡ {player.score.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="mobile-hide" style={{
                        textAlign: 'right',
                        padding: 'clamp(6px, 1.5vw, 12px) clamp(10px, 2vw, 20px)',
                        borderRadius: '10px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.2)'
                      }}>
                        <div style={{ 
                          fontSize: 'clamp(14px, 2.8vw, 20px)', 
                          fontWeight: 900,
                          background: 'linear-gradient(to right, #a78bfa, #f0abfc)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>
                          {player.score.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 'clamp(9px, 1.8vw, 12px)', color: '#64748b' }}>points</div>
                      </div>

                      <ChevronRight 
                        className="mobile-hide"
                        style={{ 
                          width: 'clamp(16px, 3vw, 24px)', 
                          height: 'clamp(16px, 3vw, 24px)', 
                          color: '#64748b',
                          flexShrink: 0
                        }} 
                        aria-hidden="true"
                      />
                    </article>
                  ))
                )}
              </div>
            </section>

            {/* Stats Footer */}
            <section 
              className="mobile-stack" 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(150px, 30vw, 200px), 1fr))',
                gap: 'clamp(12px, 2.5vw, 24px)',
                marginTop: 'clamp(20px, 4vw, 50px)'
              }}
              aria-label="Leaderboard statistics">
              <div 
                style={{
                  padding: 'clamp(16px, 3vw, 28px)',
                  borderRadius: '16px',
                  border: '2px solid rgba(34, 197, 94, 0.3)',
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
                  backdropFilter: 'blur(20px)',
                  textAlign: 'center'
                }}
                role="article"
                aria-label={`Total active players: ${topPlayers.length}`}>
                <TrendingUp style={{ 
                  width: 'clamp(28px, 5vw, 40px)', 
                  height: 'clamp(28px, 5vw, 40px)', 
                  color: '#22c55e',
                  margin: '0 auto 10px'
                }} 
                aria-hidden="true" />
                <div style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 900, color: '#22c55e', marginBottom: '6px' }}>
                  {topPlayers.length}
                </div>
                <div style={{ fontSize: 'clamp(10px, 2vw, 14px)', color: '#94a3b8' }}>
                  Active Players
                </div>
              </div>

              <div 
                style={{
                  padding: 'clamp(16px, 3vw, 28px)',
                  borderRadius: '16px',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))',
                  backdropFilter: 'blur(20px)',
                  textAlign: 'center'
                }}
                role="article"
                aria-label={`Top score: ${topPlayers[0]?.score?.toLocaleString?.() ?? 'Not available'} points`}>
                <Award style={{ 
                  width: 'clamp(28px, 5vw, 40px)', 
                  height: 'clamp(28px, 5vw, 40px)', 
                  color: '#a78bfa',
                  margin: '0 auto 10px'
                }} 
                aria-hidden="true" />
                <div style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 900, color: '#a78bfa', marginBottom: '6px' }}>
                  {topPlayers[0]?.score?.toLocaleString?.() ?? '-'}
                </div>
                <div style={{ fontSize: 'clamp(10px, 2vw, 14px)', color: '#94a3b8' }}>
                  Top Score
                </div>
              </div>

              <div 
                style={{
                  padding: 'clamp(16px, 3vw, 28px)',
                  borderRadius: '16px',
                  border: '2px solid rgba(236, 72, 153, 0.3)',
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(236, 72, 153, 0.05))',
                  backdropFilter: 'blur(20px)',
                  textAlign: 'center'
                }}
                role="article"
                aria-label={`Longest streak: ${topPlayers.length ? Math.max(...topPlayers.map((p: any) => p.streak)) : 0} days`}>
                <Flame style={{ 
                  width: 'clamp(28px, 5vw, 40px)', 
                  height: 'clamp(28px, 5vw, 40px)', 
                  color: '#ec4899',
                  margin: '0 auto 10px'
                }} 
                aria-hidden="true" />
                <div style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 900, color: '#ec4899', marginBottom: '6px' }}>
                  {topPlayers.length ? Math.max(...topPlayers.map((p: any) => p.streak)) : 0}
                </div>
                <div style={{ fontSize: 'clamp(10px, 2vw, 14px)', color: '#94a3b8' }}>
                  Longest Streak
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="vx-footer">
          <div className="vx-container">
            {/* Legal Disclaimer */}
            <div className="vx-footer-legal">
              <strong style={{ color: "#94a3b8" }}>Educational Quiz Competition.</strong> 18+ only. 
              This is a 100% skill-based knowledge competition with no element of chance. 
              Entry fees apply. Prize pool activates with 3000+ monthly participants. See{" "}
              <a href="/terms" style={{ color: "#a78bfa", textDecoration: "underline" }}>
                Terms & Conditions
              </a>{" "}
              for full details.
            </div>

            {/* Main Links */}
            <nav className="vx-footer-links" aria-label="Footer navigation">
              <a href="/privacy">Privacy Policy</a>
              <span className="vx-footer-divider">•</span>
              <a href="/terms">Terms & Conditions</a>
              <span className="vx-footer-divider">•</span>
              <a href="/cookies">Cookie Policy</a>
              <span className="vx-footer-divider">•</span>
              <a href="/how-it-works">How It Works</a>
              <span className="vx-footer-divider">•</span>
              <a href="/rules">Quiz Rules</a>
              <span className="vx-footer-divider">•</span>
              <a href="/complaints">Complaints</a>
              <span className="vx-footer-divider">•</span>
              <a href="/refunds">Refund Policy</a>
              <span className="vx-footer-divider">•</span>
              <a href="/about">About Us</a>
              <span className="vx-footer-divider">•</span>
              <a href="/contact">Contact</a>
              <span className="vx-footer-divider">•</span>
              <a href="/faq">FAQ</a>
            </nav>

            {/* Company Info */}
            <div className="vx-footer-company">
              <div style={{ marginBottom: 8, textAlign: "center" }}>
                © 2025 VibraXX. Operated by Sermin Limited (UK)
              </div>
              <div style={{ fontSize: 'clamp(10px, 2vw, 11px)', color: "#64748b", marginBottom: 8, textAlign: "center" }}>
                Registered in England & Wales | All rights reserved
              </div>
              <div style={{ marginBottom: 10, textAlign: "center" }}>
                <a 
                  href="mailto:team@vibraxx.com"
                  style={{ 
                    color: "#a78bfa", 
                    textDecoration: "none",
                    fontSize: 'clamp(11px, 2.2vw, 12px)',
                    fontWeight: 600,
                  }}
                >
                  team@vibraxx.com
                </a>
              </div>
              <div style={{ fontSize: 'clamp(10px, 2vw, 11px)', textAlign: "center" }}>
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
    </>
  );
}
