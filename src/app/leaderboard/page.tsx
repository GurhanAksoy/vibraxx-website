"use client";

import { useState, useEffect, useRef } from "react";
import { Crown, Trophy, Medal, Flame, Zap, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function LeaderboardPage() {
  // ✅ ONLY weekly/monthly (NO daily/allTime!)
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');
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
  
  // ✅ Audio with click-to-play
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasInteractedRef = useRef(false);

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

  // ✅ CLICK ANYWHERE TO PLAY MUSIC
  useEffect(() => {
    const handleFirstClick = () => {
      if (!hasInteractedRef.current && audioRef.current) {
        hasInteractedRef.current = true;
        audioRef.current.muted = false;
        audioRef.current.play().catch(() => {});
        setIsMuted(false);
      }
    };

    document.addEventListener("click", handleFirstClick, { once: true });

    return () => {
      document.removeEventListener("click", handleFirstClick);
    };
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

  // ✅ FETCH LEADERBOARD - DIRECT QUERY (NO RPC!)
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      
      try {
        const tableName = activeTab === 'weekly' ? 'leaderboard_weekly' : 'leaderboard_monthly';
        
        // ✅ Direct table query (briefing compliant!)
        const { data, error } = await supabase
          .from(tableName)
          .select('user_id, full_name, total_score, correct_answers, wrong_answers, rounds_played, rank')
          .order('total_score', { ascending: false })
          .limit(100);

        if (error) {
          console.error(`[Leaderboard] ${activeTab} fetch error:`, error);
          setTopPlayers([]);
          return;
        }

        // ✅ Map to UI format with total_score (NOT points!)
        const leaderboard = (data || []).map((player: any) => ({
          id: player.user_id,
          rank: player.rank,
          name: player.full_name || "Anonymous",
          avatar: null,
          country: "🌍",
          score: player.total_score || 0, // ✅ total_score!
          correct: player.correct_answers || 0,
          wrong: player.wrong_answers || 0,
          rounds: player.rounds_played || 0,
          accuracy: player.correct_answers > 0 
            ? Math.round((player.correct_answers / (player.correct_answers + player.wrong_answers)) * 100) 
            : 0,
          streak: 0,
          isOnline: false
        }));

        setTopPlayers(leaderboard);
        
        console.log(`[Leaderboard] ${activeTab} loaded:`, leaderboard.length, 'players');
      } catch (error) {
        console.error(`[Leaderboard] ${activeTab} error:`, error);
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
              
              {/* Logo - NO TEXT! */}
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
            
            {/* Tab Navigation - ONLY WEEKLY & MONTHLY! */}
            <nav 
              style={{ 
                display: 'flex', 
                gap: 'clamp(6px, 1.5vw, 16px)', 
                marginBottom: 'clamp(20px, 4vw, 50px)',
                overflowX: 'auto',
                padding: '4px',
                WebkitOverflowScrolling: 'touch',
                justifyContent: 'center'
              }}
              role="tablist"
              aria-label="Leaderboard time periods">
              {['weekly', 'monthly'].map((tab) => (
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
                  {tab}
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

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '6px'
                    }}>
                      <Trophy style={{ 
                        width: 'clamp(14px, 2.8vw, 18px)', 
                        height: 'clamp(14px, 2.8vw, 18px)', 
                        color: '#d1d5db' 
                      }} 
                      aria-hidden="true" />
                      <h2 style={{ 
                        fontSize: 'clamp(13px, 2.6vw, 18px)', 
                        fontWeight: 800,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}>
                        {top3[1].name}
                      </h2>
                    </div>

                    <div style={{ 
                      fontSize: 'clamp(20px, 4vw, 32px)', 
                      fontWeight: 900,
                      background: 'linear-gradient(to right, #d1d5db, #9ca3af)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      marginBottom: '6px'
                    }}>
                      {top3[1].score.toLocaleString()}
                    </div>

                    <div style={{ fontSize: 'clamp(9px, 1.8vw, 12px)', color: '#94a3b8' }}>points</div>
                  </div>
                </article>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <article 
                  className="animate-slide-in" 
                  style={{ 
                    order: 2,
                    animationDelay: '0.2s'
                  }}
                  aria-label={`First place: ${top3[0].name}`}>
                  <div style={{
                    padding: 'clamp(20px, 4vw, 40px)',
                    borderRadius: '24px',
                    border: '4px solid rgba(234, 179, 8, 0.6)',
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(217, 119, 6, 0.15))',
                    backdropFilter: 'blur(25px)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  className="gold-glow">
                    <div style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'radial-gradient(circle, rgba(234, 179, 8, 0.15) 0%, transparent 70%)',
                      animation: 'float 3s ease-in-out infinite'
                    }}></div>

                    <Crown 
                      className="animate-float" 
                      style={{ 
                        width: 'clamp(32px, 6vw, 48px)', 
                        height: 'clamp(32px, 6vw, 48px)', 
                        color: '#fbbf24',
                        margin: '0 auto clamp(8px, 1.5vw, 12px)',
                        filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.8))'
                      }}
                      aria-hidden="true"
                    />
                    
                    <div style={{
                      position: 'relative',
                      width: 'clamp(80px, 16vw, 120px)',
                      height: 'clamp(80px, 16vw, 120px)',
                      margin: '0 auto clamp(16px, 3vw, 24px)',
                      borderRadius: '50%',
                      padding: '4px',
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      boxShadow: '0 0 50px rgba(251, 191, 36, 0.7)'
                    }}>
                      <img 
                        src={top3[0].avatar || "/images/default-avatar.png"} 
                        alt={`${top3[0].name}'s avatar`}
                        style={{ width: '100%', height: '100%', borderRadius: '50%' }} 
                      />
                      <div 
                        style={{
                          position: 'absolute',
                          bottom: '-10px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 'clamp(36px, 7vw, 50px)',
                          height: 'clamp(36px, 7vw, 50px)',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '3px solid rgba(15, 23, 42, 0.8)',
                          color: '#0f172a',
                          fontWeight: 900,
                          fontSize: 'clamp(16px, 3.2vw, 24px)',
                          boxShadow: '0 0 20px rgba(251, 191, 36, 0.8)'
                        }}
                        aria-label="Rank 1">
                        1
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: '10px',
                      marginBottom: '8px'
                    }}>
                      <Star style={{ 
                        width: 'clamp(16px, 3.2vw, 22px)', 
                        height: 'clamp(16px, 3.2vw, 22px)', 
                        color: '#fbbf24',
                        fill: '#fbbf24'
                      }} 
                      aria-hidden="true" />
                      <h2 style={{ 
                        fontSize: 'clamp(16px, 3.2vw, 24px)', 
                        fontWeight: 900,
                        margin: 0,
                        color: '#fbbf24',
                        textShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}>
                        {top3[0].name}
                      </h2>
                      <Star style={{ 
                        width: 'clamp(16px, 3.2vw, 22px)', 
                        height: 'clamp(16px, 3.2vw, 22px)', 
                        color: '#fbbf24',
                        fill: '#fbbf24'
                      }} 
                      aria-hidden="true" />
                    </div>

                    <div style={{ 
                      fontSize: 'clamp(28px, 5.5vw, 48px)', 
                      fontWeight: 900,
                      background: 'linear-gradient(to right, #fbbf24, #f59e0b)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      marginBottom: '8px',
                      textShadow: '0 0 30px rgba(251, 191, 36, 0.5)'
                    }}>
                      {top3[0].score.toLocaleString()}
                    </div>

                    <div style={{ fontSize: 'clamp(10px, 2vw, 14px)', color: '#fbbf24', fontWeight: 700 }}>
                      CHAMPION
                    </div>
                  </div>
                </article>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <article 
                  className="animate-slide-in" 
                  style={{ 
                    order: isDesktop ? 3 : 2,
                    animationDelay: '0.3s'
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
                      animation: 'float 4s ease-in-out infinite'
                    }}></div>
                    
                    <div style={{
                      position: 'relative',
                      width: 'clamp(60px, 13vw, 90px)',
                      height: 'clamp(60px, 13vw, 90px)',
                      margin: '0 auto clamp(12px, 2.5vw, 20px)',
                      borderRadius: '50%',
                      padding: '4px',
                      background: 'linear-gradient(135deg, #d97706, #b45309)',
                      boxShadow: '0 0 30px rgba(217, 119, 6, 0.5)'
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
                          background: 'linear-gradient(135deg, #d97706, #b45309)',
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

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: '8px',
                      marginBottom: '6px'
                    }}>
                      <Medal style={{ 
                        width: 'clamp(14px, 2.8vw, 18px)', 
                        height: 'clamp(14px, 2.8vw, 18px)', 
                        color: '#d97706' 
                      }} 
                      aria-hidden="true" />
                      <h2 style={{ 
                        fontSize: 'clamp(13px, 2.6vw, 18px)', 
                        fontWeight: 800,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}>
                        {top3[2].name}
                      </h2>
                    </div>

                    <div style={{ 
                      fontSize: 'clamp(20px, 4vw, 32px)', 
                      fontWeight: 900,
                      background: 'linear-gradient(to right, #d97706, #b45309)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      marginBottom: '6px'
                    }}>
                      {top3[2].score.toLocaleString()}
                    </div>

                    <div style={{ fontSize: 'clamp(9px, 1.8vw, 12px)', color: '#94a3b8' }}>points</div>
                  </div>
                </article>
              )}
            </section>

            {/* Rest of Players */}
            <section 
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: 'clamp(16px, 3vw, 32px)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3)'
              }}
              aria-label="Remaining players">
              
              <h2 style={{ 
                fontSize: 'clamp(16px, 3.2vw, 24px)', 
                fontWeight: 800,
                marginBottom: 'clamp(16px, 3vw, 24px)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Zap style={{ 
                  width: 'clamp(18px, 3.6vw, 26px)', 
                  height: 'clamp(18px, 3.6vw, 26px)', 
                  color: '#a78bfa' 
                }} 
                aria-hidden="true" />
                Top 100 Players
              </h2>

              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 'clamp(8px, 1.5vw, 12px)' 
              }}>
                {loading ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: 'clamp(30px, 5vw, 50px)', 
                    color: '#94a3b8' 
                  }}>
                    Loading leaderboard...
                  </div>
                ) : restPlayers.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: 'clamp(30px, 5vw, 50px)', 
                    color: '#94a3b8' 
                  }}>
                    No players yet. Be the first!
                  </div>
                ) : (
                  restPlayers.map((player, idx) => (
                    <article
                      key={player.id}
                      className="animate-slide-in"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'clamp(10px, 2vw, 16px)',
                        padding: 'clamp(10px, 2vw, 16px)',
                        borderRadius: '14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        animationDelay: `${Math.min(idx * 0.05, 1)}s`
                      }}
                      aria-label={`${player.name} ranked ${player.rank}`}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(139, 92, 246, 0.1)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139, 92, 246, 0.3)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateX(8px)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.03)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                      }}
                    >
                      <div 
                        style={{
                          width: 'clamp(32px, 6vw, 44px)',
                          height: 'clamp(32px, 6vw, 44px)',
                          borderRadius: '8px',
                          background: `linear-gradient(135deg, ${getRankColor(player.rank).replace('from-', 'var(--tw-gradient-from, ').replace(' to-', '), var(--tw-gradient-to, ')}))`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'clamp(11px, 2.2vw, 16px)',
                          fontWeight: 900,
                          color: 'white',
                          flexShrink: 0,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                        aria-label={`Rank ${player.rank}`}>
                        #{player.rank}
                      </div>

                      <div 
                        style={{
                          width: 'clamp(36px, 7vw, 50px)',
                          height: 'clamp(36px, 7vw, 50px)',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: '2px solid rgba(139, 92, 246, 0.3)',
                          flexShrink: 0
                        }}>
                        <img 
                          src={player.avatar || "/images/default-avatar.png"} 
                          alt={`${player.name}'s avatar`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: 'clamp(12px, 2.4vw, 16px)', 
                          fontWeight: 700,
                          marginBottom: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {player.name}
                        </div>
                        <div style={{ 
                          fontSize: 'clamp(9px, 1.8vw, 12px)', 
                          color: '#64748b',
                          display: 'flex',
                          gap: '10px',
                          flexWrap: 'wrap'
                        }}>
                          <span>{player.accuracy}% accuracy</span>
                          <span className="mobile-hide">•</span>
                          <span className="mobile-hide">{player.rounds} rounds</span>
                        </div>
                      </div>

                      <div style={{
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

            {/* NO STATS CARDS! (Active Players, Top Score, Longest Streak REMOVED!) */}

          </div>
        </main>

        {/* Footer */}
        <footer className="vx-footer">
          <div className="vx-container">
            <div className="vx-footer-legal">
              <strong style={{ color: "#94a3b8" }}>Educational Quiz Competition.</strong> 18+ only. 
              This is a 100% skill-based knowledge competition with no element of chance. 
              Entry fees apply. Prize pool activates with 3000+ monthly participants. See{" "}
              <a href="/terms" style={{ color: "#a78bfa", textDecoration: "underline" }}>
                Terms & Conditions
              </a>{" "}
              for full details.
            </div>

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
