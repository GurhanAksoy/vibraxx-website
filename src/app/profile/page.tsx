"use client";

import { useState, useEffect, useRef } from "react";
import { 
  User, Crown, Trophy, Target, Calendar, CheckCircle, XCircle, 
  Zap, TrendingUp, Mail, Send, Package, Home, BarChart3,
  Clock, Flame, Award, Star, Volume2, VolumeX
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    joinedDate: "2025-01-15"
  });

  const [stats, setStats] = useState({
    lastRound: { correct: 42, wrong: 8, score: 4200, rank: 15 },
    today: { correct: 128, wrong: 22, score: 12800, rounds: 3 },
    monthly: { correct: 1450, wrong: 250, score: 145000, rounds: 35 },
    rounds: { purchased: 100, used: 38, remaining: 62 }
  });

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  
  const profileMusicRef = useRef(null);

  // Play/Stop music
  useEffect(() => {
    if (isSoundEnabled && profileMusicRef.current) {
      profileMusicRef.current.play().catch(err => console.log('Audio play failed:', err));
    } else if (profileMusicRef.current) {
      profileMusicRef.current.pause();
    }
  }, [isSoundEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (profileMusicRef.current) {
        profileMusicRef.current.pause();
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    
    // Simulate API call
    // In real app: await fetch('/api/contact', { method: 'POST', body: JSON.stringify({ message }) })
    setTimeout(() => {
      setSending(false);
      setMessageSent(true);
      setMessage("");
      setTimeout(() => setMessageSent(false), 3000);
    }, 1500);
  };

  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(217, 70, 239, 0.6); }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
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
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.5s ease-out; }
        .animate-spin { animation: spin 1s linear infinite; }

        @media (max-width: 768px) {
          .mobile-stack { grid-template-columns: 1fr !important; }
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
        ::-webkit-scrollbar-thumb { 
          background: linear-gradient(to bottom, #7c3aed, #d946ef);
          border-radius: 4px;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #0f172a, #1e1b4b, #0f172a)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Audio Element */}
        <audio ref={profileMusicRef} src="/sounds/profile.mp3" loop />

        {/* Animated Background */}
        <div className="animate-float" style={{
          position: 'fixed',
          top: '10%',
          left: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          opacity: 0.2,
          filter: 'blur(100px)',
          zIndex: 0
        }}></div>
        <div className="animate-float" style={{
          position: 'fixed',
          bottom: '10%',
          right: '5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #d946ef 0%, transparent 70%)',
          opacity: 0.15,
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
              
              {/* Left - Home Button */}
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 20px)',
                  borderRadius: '12px',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: 'white',
                  fontSize: 'clamp(13px, 2.5vw, 15px)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Home style={{ width: 'clamp(16px, 3vw, 20px)', height: 'clamp(16px, 3vw, 20px)', color: '#a78bfa' }} />
                <span>Home</span>
              </button>

              {/* Center - Title */}
              <div className="animate-shimmer" style={{ 
                fontSize: 'clamp(18px, 3.5vw, 28px)',
                fontWeight: 900,
                background: 'linear-gradient(90deg, #7c3aed, #d946ef, #f0abfc, #d946ef, #7c3aed)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                My Profile
              </div>

              {/* Right - Sound Button */}
              <button
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                style={{
                  padding: 'clamp(10px, 2vw, 12px)',
                  borderRadius: '12px',
                  border: `2px solid ${isSoundEnabled ? 'rgba(139, 92, 246, 0.3)' : 'rgba(100, 116, 139, 0.3)'}`,
                  background: isSoundEnabled ? 'rgba(139, 92, 246, 0.2)' : 'rgba(100, 116, 139, 0.1)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isSoundEnabled ? 'rgba(139, 92, 246, 0.3)' : 'rgba(100, 116, 139, 0.2)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isSoundEnabled ? 'rgba(139, 92, 246, 0.2)' : 'rgba(100, 116, 139, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {isSoundEnabled ? (
                  <Volume2 style={{ width: 'clamp(18px, 4vw, 22px)', height: 'clamp(18px, 4vw, 22px)', color: '#a78bfa' }} />
                ) : (
                  <VolumeX style={{ width: 'clamp(18px, 4vw, 22px)', height: 'clamp(18px, 4vw, 22px)', color: '#64748b' }} />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ position: 'relative', zIndex: 10, padding: 'clamp(30px, 5vw, 50px) clamp(16px, 3vw, 24px)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* Profile Card */}
            <div className="animate-slide-up animate-pulse-glow" style={{
              padding: 'clamp(32px, 5vw, 48px)',
              borderRadius: '32px',
              border: '2px solid rgba(139, 92, 246, 0.3)',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 27, 75, 0.8))',
              backdropFilter: 'blur(20px)',
              marginBottom: 'clamp(30px, 5vw, 40px)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #7c3aed, #d946ef, #f0abfc)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s linear infinite'
              }}></div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(20px, 4vw, 32px)', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <div className="animate-pulse-glow" style={{
                    width: 'clamp(100px, 20vw, 140px)',
                    height: 'clamp(100px, 20vw, 140px)',
                    borderRadius: '50%',
                    padding: '5px',
                    background: 'linear-gradient(135deg, #7c3aed, #d946ef)',
                  }}>
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '4px solid rgba(15, 23, 42, 0.9)'
                      }}
                    />
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '5px',
                    right: '5px',
                    width: 'clamp(24px, 5vw, 32px)',
                    height: 'clamp(24px, 5vw, 32px)',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    border: '3px solid rgba(15, 23, 42, 0.9)',
                    boxShadow: '0 0 20px #22c55e'
                  }}></div>
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, marginBottom: '8px' }}>
                    {user.name}
                  </h1>
                  <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', color: '#94a3b8', marginBottom: '12px' }}>
                    {user.email}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                      <Calendar style={{ width: '16px', height: '16px', color: '#a78bfa' }} />
                      <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', color: '#c4b5fd' }}>
                        Joined {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'rgba(234, 179, 8, 0.2)',
                      border: '1px solid rgba(234, 179, 8, 0.3)'
                    }}>
                      <Crown style={{ width: '16px', height: '16px', color: '#facc15' }} />
                      <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', color: '#fef08a' }}>
                        Premium Member
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mobile-stack" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: 'clamp(20px, 4vw, 32px)',
              marginBottom: 'clamp(30px, 5vw, 40px)'
            }}>
              
              {/* Last Round */}
              <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div style={{
                  padding: 'clamp(24px, 4vw, 32px)',
                  borderRadius: '24px',
                  border: '2px solid rgba(139, 92, 246, 0.2)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(20px)',
                  height: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #7c3aed, #d946ef)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
                    }}>
                      <Target style={{ width: '24px', height: '24px' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: 700 }}>Last Round</h3>
                      <p style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: '#94a3b8' }}>Most Recent Performance</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <CheckCircle style={{ width: '18px', height: '18px', color: '#22c55e' }} />
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Correct</span>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: '#22c55e' }}>{stats.lastRound.correct}</div>
                    </div>
                    <div style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <XCircle style={{ width: '18px', height: '18px', color: '#ef4444' }} />
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Wrong</span>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: '#ef4444' }}>{stats.lastRound.wrong}</div>
                    </div>
                  </div>

                  <div style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(217, 70, 239, 0.1))',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Score</div>
                    <div style={{ 
                      fontSize: '36px', 
                      fontWeight: 900,
                      background: 'linear-gradient(to right, #a78bfa, #f0abfc)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {stats.lastRound.score.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Rank #{stats.lastRound.rank}
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Stats */}
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div style={{
                  padding: 'clamp(24px, 4vw, 32px)',
                  borderRadius: '24px',
                  border: '2px solid rgba(234, 179, 8, 0.2)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(20px)',
                  height: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #eab308, #f59e0b)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 20px rgba(234, 179, 8, 0.5)'
                    }}>
                      <Clock style={{ width: '24px', height: '24px' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: 700 }}>Today</h3>
                      <p style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: '#94a3b8' }}>{stats.today.rounds} Rounds Played</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <CheckCircle style={{ width: '18px', height: '18px', color: '#22c55e' }} />
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Correct</span>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: '#22c55e' }}>{stats.today.correct}</div>
                    </div>
                    <div style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <XCircle style={{ width: '18px', height: '18px', color: '#ef4444' }} />
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Wrong</span>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: '#ef4444' }}>{stats.today.wrong}</div>
                    </div>
                  </div>

                  <div style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(202, 138, 4, 0.1))',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Total Score</div>
                    <div style={{ fontSize: '36px', fontWeight: 900, color: '#facc15' }}>
                      {stats.today.score.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Accuracy: {Math.round((stats.today.correct / (stats.today.correct + stats.today.wrong)) * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Stats */}
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div style={{
                  padding: 'clamp(24px, 4vw, 32px)',
                  borderRadius: '24px',
                  border: '2px solid rgba(236, 72, 153, 0.2)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(20px)',
                  height: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #ec4899, #d946ef)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)'
                    }}>
                      <BarChart3 style={{ width: '24px', height: '24px' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: 700 }}>This Month</h3>
                      <p style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: '#94a3b8' }}>{stats.monthly.rounds} Total Rounds</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <CheckCircle style={{ width: '18px', height: '18px', color: '#22c55e' }} />
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Correct</span>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: '#22c55e' }}>{stats.monthly.correct}</div>
                    </div>
                    <div style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <XCircle style={{ width: '18px', height: '18px', color: '#ef4444' }} />
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Wrong</span>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: '#ef4444' }}>{stats.monthly.wrong}</div>
                    </div>
                  </div>

                  <div style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(217, 70, 239, 0.1))',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Total Score</div>
                    <div style={{ fontSize: '36px', fontWeight: 900, color: '#f0abfc' }}>
                      {stats.monthly.score.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      Accuracy: {Math.round((stats.monthly.correct / (stats.monthly.correct + stats.monthly.wrong)) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rounds & Contact Section */}
            <div className="mobile-stack" style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 'clamp(20px, 4vw, 32px)'
            }}>
              
              {/* Round Credits */}
              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div style={{
                  padding: 'clamp(24px, 4vw, 32px)',
                  borderRadius: '24px',
                  border: '2px solid rgba(6, 182, 212, 0.2)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(20px)',
                  height: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)'
                    }}>
                      <Package style={{ width: '24px', height: '24px' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: 700 }}>Round Credits</h3>
                      <p style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: '#94a3b8' }}>Your Subscription</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    <div style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Purchased</div>
                      <div style={{ fontSize: '24px', fontWeight: 900, color: '#22c55e' }}>{stats.rounds.purchased}</div>
                    </div>
                    <div style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Used</div>
                      <div style={{ fontSize: '24px', fontWeight: 900, color: '#a78bfa' }}>{stats.rounds.used}</div>
                    </div>
                    <div style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(6, 182, 212, 0.1)',
                      border: '1px solid rgba(6, 182, 212, 0.2)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>Remaining</div>
                      <div style={{ fontSize: '24px', fontWeight: 900, color: '#22d3ee' }}>{stats.rounds.remaining}</div>
                    </div>
                  </div>

                  <div style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(8, 145, 178, 0.1))',
                    border: '1px solid rgba(6, 182, 212, 0.3)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', color: '#94a3b8' }}>Usage</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#22d3ee' }}>
                        {Math.round((stats.rounds.used / stats.rounds.purchased) * 100)}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', borderRadius: '9999px', background: 'rgba(0, 0, 0, 0.3)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(stats.rounds.used / stats.rounds.purchased) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(to right, #06b6d4, #0891b2)',
                        borderRadius: '9999px',
                        transition: 'width 0.3s'
                      }}></div>
                    </div>
                  </div>

                  <button
                    style={{
                      width: '100%',
                      marginTop: '20px',
                      padding: '16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Buy More Rounds
                  </button>
                </div>
              </div>

              {/* Contact Form */}
              <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <div style={{
                  padding: 'clamp(24px, 4vw, 32px)',
                  borderRadius: '24px',
                  border: '2px solid rgba(139, 92, 246, 0.2)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(20px)',
                  height: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #7c3aed, #d946ef)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
                    }}>
                      <Mail style={{ width: '24px', height: '24px' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: 700 }}>Contact Support</h3>
                      <p style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: '#94a3b8' }}>We're here to help</p>
                    </div>
                  </div>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    disabled={sending}
                    style={{
                      width: '100%',
                      minHeight: '200px',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: 'white',
                      fontSize: '14px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      marginBottom: '16px',
                      transition: 'all 0.3s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />

                  {messageSent && (
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: '#22c55e',
                      fontSize: '14px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <CheckCircle style={{ width: '18px', height: '18px' }} />
                      Message sent successfully!
                    </div>
                  )}

                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !message.trim()}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: sending || !message.trim() 
                        ? 'rgba(139, 92, 246, 0.3)' 
                        : 'linear-gradient(135deg, #7c3aed, #d946ef)',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 700,
                      cursor: sending || !message.trim() ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      opacity: sending || !message.trim() ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!sending && message.trim()) {
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin" style={{
                          width: '20px',
                          height: '20px',
                          border: '3px solid rgba(255, 255, 255, 0.3)',
                          borderTopColor: 'white',
                          borderRadius: '50%'
                        }}></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send style={{ width: '20px', height: '20px' }} />
                        Send Message
                      </>
                    )}
                  </button>
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