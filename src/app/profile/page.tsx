"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  User, Crown, Trophy, Target, Calendar, CheckCircle, XCircle, 
  Zap, TrendingUp, Mail, Send, Package, Home, BarChart3,
  Clock, Flame, Award, Star, Volume2, VolumeX
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: "",
    joinedDate: ""
  });

  const [stats, setStats] = useState({
    lastRound: { correct: 0, wrong: 0, score: 0, rank: 0 },
    today: { correct: 0, wrong: 0, score: 0, rounds: 0 },
    monthly: { correct: 0, wrong: 0, score: 0, rounds: 0 },
    rounds: { purchased: 0, used: 0, remaining: 0 }
  });

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const audioRef = useRef(null);

  // Fetch user data (profile, stats, rounds)
useEffect(() => {
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get logged-in user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
if (sessionError) throw sessionError;

if (!session) {
  window.location.href = "/login";
  return;
}

const authUser = session.user;


      //
      // 1) Fetch Profile
      //
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Profile fetch error:", profileError);
      }

      setUser({
        name: profile?.name || profile?.full_name || authUser.email?.split("@")[0] || "User",
        email: authUser.email || "",
        avatar: profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
        joinedDate: authUser.created_at || new Date().toISOString(),
      });

      //
      // 2) Fetch user_stats (lastRound, today, monthly)
      //
      const { data: statsData, error: statsError } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", authUser.id)
        .single();

      if (!statsError && statsData) {
        setStats(prev => ({
          ...prev,
          lastRound: statsData.last_round || prev.lastRound,
          today: statsData.today || prev.today,
          monthly: statsData.monthly || prev.monthly,
        }));
      } else if (statsError && statsError.code !== "PGRST116") {
        console.error("Stats error:", statsError);
      }

      //
      // 3) Fetch user_rounds (purchased, used, remaining)
      //
      const { data: roundsData, error: roundsError } = await supabase
        .from("user_rounds")
        .select("*")
        .eq("user_id", authUser.id)
        .single();

      if (!roundsError && roundsData) {
        setStats(prev => ({
          ...prev,
          rounds: {
            purchased: roundsData.purchased || 0,
            used: roundsData.used || 0,
            remaining: roundsData.remaining || 0,
          },
        }));
      } else if (roundsError && roundsError.code !== "PGRST116") {
        console.error("Rounds fetch error:", roundsError);
      }

    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchUserData();
}, []);

  // Audio control
  const toggleAudio = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.muted = false;
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      } else {
        audioRef.current.muted = true;
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Initialize audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.loop = true;
      audioRef.current.muted = true;
    }
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        alert('Please log in to send messages');
        return;
      }
      
      const { error } = await supabase
        .from('support_messages')
        .insert({
          user_id: authUser.id,
          user_email: authUser.email,
          message: message.trim(),
          status: 'pending',
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setMessageSent(true);
      setMessage("");
      setTimeout(() => setMessageSent(false), 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const calculateAccuracy = useCallback((correct, wrong) => {
    const total = correct + wrong;
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, []);

  return (
    <>
      <audio 
        ref={audioRef} 
        src="/sounds/vibraxx.mp3"
        aria-label="Background music"
        preload="none"
      />

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
        @keyframes neonPulse {
          0%, 100% { 
            box-shadow: 0 0 10px rgba(139, 92, 246, 0.5),
                        0 0 20px rgba(139, 92, 246, 0.3);
          }
          50% { 
            box-shadow: 0 0 20px rgba(217, 70, 239, 0.8),
                        0 0 40px rgba(217, 70, 239, 0.5);
          }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.5s ease-out; }
        .animate-spin { animation: spin 1s linear infinite; }
        .neon-border { animation: neonPulse 2s ease-in-out infinite; }

        *:focus-visible {
          outline: 3px solid #a78bfa;
          outline-offset: 2px;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          overflow-x: hidden;
        }

        * {
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .mobile-stack { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 640px) {
          .mobile-2-col { grid-template-columns: 1fr !important; }
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
        ::-webkit-scrollbar-thumb { 
          background: linear-gradient(to bottom, #7c3aed, #d946ef);
          border-radius: 4px;
        }

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
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100vw'
      }}
      role="main"
      aria-label="Profile page">
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
          zIndex: 0,
          pointerEvents: 'none'
        }}
        aria-hidden="true"></div>
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
          animationDelay: '1.5s',
          pointerEvents: 'none'
        }}
        aria-hidden="true"></div>

        {/* Header */}
        <header style={{
          position: 'relative',
          zIndex: 50,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(15, 23, 42, 0.8)'
        }}
        role="banner">
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(12px, 3vw, 24px)', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px', gap: 'clamp(8px, 2vw, 16px)' }}>
              
              {/* Home Button */}
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 'clamp(6px, 2vw, 10px) clamp(8px, 2.5vw, 16px)',
                  borderRadius: '10px',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: 'white',
                  fontSize: 'clamp(11px, 2.2vw, 14px)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  flexShrink: 0,
                  whiteSpace: 'nowrap'
                }}
                aria-label="Go to homepage"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Home style={{ width: 'clamp(12px, 2.8vw, 18px)', height: 'clamp(12px, 2.8vw, 18px)', color: '#a78bfa' }} aria-hidden="true" />
                <span style={{ display: 'inline' }}>Home</span>
              </button>

              {/* Title */}
              <h1 className="animate-shimmer" style={{ 
                fontSize: 'clamp(14px, 3.2vw, 28px)',
                fontWeight: 900,
                background: 'linear-gradient(90deg, #7c3aed, #d946ef, #f0abfc, #d946ef, #7c3aed)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                textAlign: 'center',
                margin: 0,
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                My Profile
              </h1>

              {/* Audio Button */}
              <button
                onClick={toggleAudio}
                style={{
                  width: 'clamp(34px, 7vw, 44px)',
                  height: 'clamp(34px, 7vw, 44px)',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(217, 70, 239, 0.1))',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a78bfa',
                  transition: 'all 0.3s',
                  boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
                  flexShrink: 0,
                  padding: 0
                }}
                className="neon-border"
                aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(139, 92, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(139, 92, 246, 0.3)';
                }}
              >
                {isMuted ? 
                  <VolumeX style={{ width: 'clamp(14px, 3vw, 20px)', height: 'clamp(14px, 3vw, 20px)' }} /> : 
                  <Volume2 style={{ width: 'clamp(14px, 3vw, 20px)', height: 'clamp(14px, 3vw, 20px)' }} />
                }
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ position: 'relative', zIndex: 10, padding: 'clamp(20px, 4vw, 50px) clamp(12px, 3vw, 24px)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* Loading State */}
            {loading ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '400px',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div className="animate-spin" style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid rgba(139, 92, 246, 0.2)',
                  borderTopColor: '#a78bfa',
                  borderRadius: '50%'
                }}
                aria-hidden="true"></div>
                <p style={{ color: '#94a3b8', fontSize: '18px' }}>Loading your profile...</p>
              </div>
            ) : (
              <>
            
            {/* Profile Card */}
            <article className="animate-slide-up animate-pulse-glow" style={{
              padding: 'clamp(20px, 4vw, 48px)',
              borderRadius: 'clamp(20px, 4vw, 32px)',
              border: '2px solid rgba(139, 92, 246, 0.3)',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 27, 75, 0.8))',
              backdropFilter: 'blur(20px)',
              marginBottom: 'clamp(20px, 4vw, 40px)',
              position: 'relative',
              overflow: 'hidden'
            }}
            aria-label="User profile information">
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #7c3aed, #d946ef, #f0abfc)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s linear infinite'
              }}
              aria-hidden="true"></div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px, 3vw, 32px)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div className="animate-pulse-glow" style={{
                    width: 'clamp(80px, 16vw, 140px)',
                    height: 'clamp(80px, 16vw, 140px)',
                    borderRadius: '50%',
                    padding: '5px',
                    background: 'linear-gradient(135deg, #7c3aed, #d946ef)',
                  }}>
                    <img 
                      src={user.avatar} 
                      alt={`${user.name}'s avatar`}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '4px solid rgba(15, 23, 42, 0.9)'
                      }}
                      loading="lazy"
                    />
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '5px',
                    right: '5px',
                    width: 'clamp(20px, 4vw, 32px)',
                    height: 'clamp(20px, 4vw, 32px)',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    border: '3px solid rgba(15, 23, 42, 0.9)',
                    boxShadow: '0 0 20px #22c55e'
                  }}
                  aria-label="Online"
                  title="Online"></div>
                </div>

                <div style={{ flex: 1, minWidth: '200px', textAlign: 'center' }}>
                  <h2 style={{ fontSize: 'clamp(20px, 4vw, 36px)', fontWeight: 900, marginBottom: '6px', wordBreak: 'break-word' }}>
                    {user.name}
                  </h2>
                  <p style={{ fontSize: 'clamp(12px, 2.5vw, 16px)', color: '#94a3b8', marginBottom: '10px', wordBreak: 'break-all' }}>
                    {user.email}
                  </p>
                  <div style={{ display: 'flex', gap: 'clamp(10px, 2vw, 16px)', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 16px)',
                      borderRadius: '8px',
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                      <Calendar style={{ width: 'clamp(14px, 2.8vw, 16px)', height: 'clamp(14px, 2.8vw, 16px)', color: '#a78bfa' }} aria-hidden="true" />
                      <span style={{ fontSize: 'clamp(11px, 2.2vw, 14px)', color: '#c4b5fd' }}>
                        Joined {formatDate(user.joinedDate)}
                      </span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 16px)',
                      borderRadius: '8px',
                      background: 'rgba(234, 179, 8, 0.2)',
                      border: '1px solid rgba(234, 179, 8, 0.3)'
                    }}>
                      <Crown style={{ width: 'clamp(14px, 2.8vw, 16px)', height: 'clamp(14px, 2.8vw, 16px)', color: '#facc15' }} aria-hidden="true" />
                      <span style={{ fontSize: 'clamp(11px, 2.2vw, 14px)', color: '#fef08a' }}>
                        Premium Member
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Stats Grid */}
            <section className="mobile-stack" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', 
              gap: 'clamp(16px, 3vw, 32px)',
              marginBottom: 'clamp(20px, 4vw, 40px)'
            }}
            aria-label="Performance statistics">
              
              {/* Last Round */}
              <article className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div style={{
                  padding: 'clamp(20px, 3.5vw, 32px)',
                  borderRadius: 'clamp(16px, 3vw, 24px)',
                  border: '2px solid rgba(139, 92, 246, 0.2)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(20px)',
                  height: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'clamp(16px, 3vw, 20px)' }}>
                    <div style={{
                      width: 'clamp(40px, 8vw, 48px)',
                      height: 'clamp(40px, 8vw, 48px)',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #7c3aed, #d946ef)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
                    }}>
                      <Target style={{ width: 'clamp(20px, 4vw, 24px)', height: 'clamp(20px, 4vw, 24px)' }} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 'clamp(14px, 2.8vw, 18px)', fontWeight: 700, margin: 0 }}>Last Round</h3>
                      <p style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#94a3b8', margin: 0 }}>Most Recent Performance</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(12px, 2.5vw, 16px)', marginBottom: 'clamp(16px, 3vw, 20px)' }}>
                    <div style={{
                      padding: 'clamp(12px, 2.5vw, 16px)',
                      borderRadius: '10px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <CheckCircle style={{ width: 'clamp(14px, 2.8vw, 18px)', height: 'clamp(14px, 2.8vw, 18px)', color: '#22c55e' }} aria-hidden="true" />
                        <span style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#94a3b8' }}>Correct</span>
                      </div>
                      <div style={{ fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 900, color: '#22c55e' }}>{stats.lastRound.correct}</div>
                    </div>
                    <div style={{
                      padding: 'clamp(12px, 2.5vw, 16px)',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <XCircle style={{ width: 'clamp(14px, 2.8vw, 18px)', height: 'clamp(14px, 2.8vw, 18px)', color: '#ef4444' }} aria-hidden="true" />
                        <span style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#94a3b8' }}>Wrong</span>
                      </div>
                      <div style={{ fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 900, color: '#ef4444' }}>{stats.lastRound.wrong}</div>
                    </div>
                  </div>

                  <div style={{
                    padding: 'clamp(16px, 3vw, 20px)',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(217, 70, 239, 0.1))',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 'clamp(12px, 2.4vw, 14px)', color: '#94a3b8', marginBottom: '6px' }}>Score</div>
                    <div style={{ 
                      fontSize: 'clamp(28px, 5.5vw, 36px)', 
                      fontWeight: 900,
                      background: 'linear-gradient(to right, #a78bfa, #f0abfc)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {stats.lastRound.score.toLocaleString()}
                    </div>
                    {stats.lastRound.rank > 0 && (
                      <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#64748b', marginTop: '4px' }}>
                        Rank #{stats.lastRound.rank}
                      </div>
                    )}
                  </div>
                </div>
              </article>

              {/* Today's Stats */}
              <article className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div style={{
                  padding: 'clamp(20px, 3.5vw, 32px)',
                  borderRadius: 'clamp(16px, 3vw, 24px)',
                  border: '2px solid rgba(234, 179, 8, 0.2)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(20px)',
                  height: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'clamp(16px, 3vw, 20px)' }}>
                    <div style={{
                      width: 'clamp(40px, 8vw, 48px)',
                      height: 'clamp(40px, 8vw, 48px)',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #eab308, #f59e0b)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 20px rgba(234, 179, 8, 0.5)'
                    }}>
                      <Clock style={{ width: 'clamp(20px, 4vw, 24px)', height: 'clamp(20px, 4vw, 24px)' }} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 'clamp(14px, 2.8vw, 18px)', fontWeight: 700, margin: 0 }}>Today</h3>
                      <p style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#94a3b8', margin: 0 }}>{stats.today.rounds} Rounds Played</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(12px, 2.5vw, 16px)', marginBottom: 'clamp(16px, 3vw, 20px)' }}>
                    <div style={{
                      padding: 'clamp(12px, 2.5vw, 16px)',
                      borderRadius: '10px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <CheckCircle style={{ width: 'clamp(14px, 2.8vw, 18px)', height: 'clamp(14px, 2.8vw, 18px)', color: '#22c55e' }} aria-hidden="true" />
                        <span style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#94a3b8' }}>Correct</span>
                      </div>
                      <div style={{ fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 900, color: '#22c55e' }}>{stats.today.correct}</div>
                    </div>
                    <div style={{
                      padding: 'clamp(12px, 2.5vw, 16px)',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <XCircle style={{ width: 'clamp(14px, 2.8vw, 18px)', height: 'clamp(14px, 2.8vw, 18px)', color: '#ef4444' }} aria-hidden="true" />
                        <span style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#94a3b8' }}>Wrong</span>
                      </div>
                      <div style={{ fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 900, color: '#ef4444' }}>{stats.today.wrong}</div>
                    </div>
                  </div>

                  <div style={{
                    padding: 'clamp(16px, 3vw, 20px)',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(202, 138, 4, 0.1))',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 'clamp(12px, 2.4vw, 14px)', color: '#94a3b8', marginBottom: '6px' }}>Total Score</div>
                    <div style={{ fontSize: 'clamp(28px, 5.5vw, 36px)', fontWeight: 900, color: '#facc15' }}>
                      {stats.today.score.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#64748b', marginTop: '4px' }}>
                      Accuracy: {calculateAccuracy(stats.today.correct, stats.today.wrong)}%
                    </div>
                  </div>
                </div>
              </article>

              {/* Monthly Stats */}
              <article className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div style={{
                  padding: 'clamp(20px, 3.5vw, 32px)',
                  borderRadius: 'clamp(16px, 3vw, 24px)',
                  border: '2px solid rgba(236, 72, 153, 0.2)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(20px)',
                  height: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'clamp(16px, 3vw, 20px)' }}>
                    <div style={{
                      width: 'clamp(40px, 8vw, 48px)',
                      height: 'clamp(40px, 8vw, 48px)',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #ec4899, #d946ef)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)'
                    }}>
                      <BarChart3 style={{ width: 'clamp(20px, 4vw, 24px)', height: 'clamp(20px, 4vw, 24px)' }} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 'clamp(14px, 2.8vw, 18px)', fontWeight: 700, margin: 0 }}>This Month</h3>
                      <p style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#94a3b8', margin: 0 }}>{stats.monthly.rounds} Total Rounds</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(12px, 2.5vw, 16px)', marginBottom: 'clamp(16px, 3vw, 20px)' }}>
                    <div style={{
                      padding: 'clamp(12px, 2.5vw, 16px)',
                      borderRadius: '10px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <CheckCircle style={{ width: 'clamp(14px, 2.8vw, 18px)', height: 'clamp(14px, 2.8vw, 18px)', color: '#22c55e' }} aria-hidden="true" />
                        <span style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#94a3b8' }}>Correct</span>
                      </div>
                      <div style={{ fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 900, color: '#22c55e' }}>{stats.monthly.correct}</div>
                    </div>
                    <div style={{
                      padding: 'clamp(12px, 2.5vw, 16px)',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <XCircle style={{ width: 'clamp(14px, 2.8vw, 18px)', height: 'clamp(14px, 2.8vw, 18px)', color: '#ef4444' }} aria-hidden="true" />
                        <span style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#94a3b8' }}>Wrong</span>
                      </div>
                      <div style={{ fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 900, color: '#ef4444' }}>{stats.monthly.wrong}</div>
                    </div>
                  </div>

                  <div style={{
                    padding: 'clamp(16px, 3vw, 20px)',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(217, 70, 239, 0.1))',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 'clamp(12px, 2.4vw, 14px)', color: '#94a3b8', marginBottom: '6px' }}>Total Score</div>
                    <div style={{ fontSize: 'clamp(28px, 5.5vw, 36px)', fontWeight: 900, color: '#f0abfc' }}>
                      {stats.monthly.score.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#64748b', marginTop: '4px' }}>
                      Accuracy: {calculateAccuracy(stats.monthly.correct, stats.monthly.wrong)}%
                    </div>
                  </div>
                </div>
              </article>
            </section>

            {/* Rounds & Contact Section */}
            <section className="mobile-stack mobile-2-col" style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 'clamp(16px, 3vw, 32px)'
            }}
            aria-label="Round credits and support">
              
              {/* Round Credits */}
              <article className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div style={{
                  padding: 'clamp(20px, 3.5vw, 32px)',
                  borderRadius: 'clamp(16px, 3vw, 24px)',
                  border: '2px solid rgba(6, 182, 212, 0.2)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(20px)',
                  height: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'clamp(20px, 3.5vw, 24px)' }}>
                    <div style={{
                      width: 'clamp(40px, 8vw, 48px)',
                      height: 'clamp(40px, 8vw, 48px)',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)'
                    }}>
                      <Package style={{ width: 'clamp(20px, 4vw, 24px)', height: 'clamp(20px, 4vw, 24px)' }} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 'clamp(14px, 2.8vw, 18px)', fontWeight: 700, margin: 0 }}>Round Credits</h3>
                      <p style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#94a3b8', margin: 0 }}>Your Subscription</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(10px, 2vw, 12px)', marginBottom: 'clamp(16px, 3vw, 20px)' }}>
                    <div style={{
                      padding: 'clamp(12px, 2.5vw, 16px)',
                      borderRadius: '10px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#94a3b8', marginBottom: '6px' }}>Purchased</div>
                      <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 900, color: '#22c55e' }}>{stats.rounds.purchased}</div>
                    </div>
                    <div style={{
                      padding: 'clamp(12px, 2.5vw, 16px)',
                      borderRadius: '10px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#94a3b8', marginBottom: '6px' }}>Used</div>
                      <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 900, color: '#a78bfa' }}>{stats.rounds.used}</div>
                    </div>
                    <div style={{
                      padding: 'clamp(12px, 2.5vw, 16px)',
                      borderRadius: '10px',
                      background: 'rgba(6, 182, 212, 0.1)',
                      border: '1px solid rgba(6, 182, 212, 0.2)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#94a3b8', marginBottom: '6px' }}>Remaining</div>
                      <div style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 900, color: '#22d3ee' }}>{stats.rounds.remaining}</div>
                    </div>
                  </div>

                  <div style={{
                    padding: 'clamp(16px, 3vw, 20px)',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(8, 145, 178, 0.1))',
                    border: '1px solid rgba(6, 182, 212, 0.3)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: 'clamp(12px, 2.4vw, 14px)', color: '#94a3b8' }}>Usage</span>
                      <span style={{ fontSize: 'clamp(12px, 2.4vw, 14px)', fontWeight: 700, color: '#22d3ee' }}>
                        {stats.rounds.purchased > 0 ? Math.round((stats.rounds.used / stats.rounds.purchased) * 100) : 0}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', borderRadius: '9999px', background: 'rgba(0, 0, 0, 0.3)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${stats.rounds.purchased > 0 ? (stats.rounds.used / stats.rounds.purchased) * 100 : 0}%`,
                        height: '100%',
                        background: 'linear-gradient(to right, #06b6d4, #0891b2)',
                        borderRadius: '9999px',
                        transition: 'width 0.3s'
                      }}></div>
                    </div>
                  </div>

                  <button
                    onClick={() => window.location.href = '/pricing'}
                    style={{
                      width: '100%',
                      marginTop: 'clamp(16px, 3vw, 20px)',
                      padding: 'clamp(12px, 2.5vw, 16px)',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                      color: 'white',
                      fontSize: 'clamp(13px, 2.6vw, 16px)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    aria-label="Purchase more rounds"
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Buy More Rounds
                  </button>
                </div>
              </article>

              {/* Contact Form */}
              <article className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <div style={{
                  padding: 'clamp(20px, 3.5vw, 32px)',
                  borderRadius: 'clamp(16px, 3vw, 24px)',
                  border: '2px solid rgba(139, 92, 246, 0.2)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(20px)',
                  height: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'clamp(20px, 3.5vw, 24px)' }}>
                    <div style={{
                      width: 'clamp(40px, 8vw, 48px)',
                      height: 'clamp(40px, 8vw, 48px)',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #7c3aed, #d946ef)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
                    }}>
                      <Mail style={{ width: 'clamp(20px, 4vw, 24px)', height: 'clamp(20px, 4vw, 24px)' }} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 'clamp(14px, 2.8vw, 18px)', fontWeight: 700, margin: 0 }}>Contact Support</h3>
                      <p style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: '#94a3b8', margin: 0 }}>We're here to help</p>
                    </div>
                  </div>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    disabled={sending}
                    aria-label="Support message"
                    maxLength={1000}
                    style={{
                      width: '100%',
                      minHeight: 'clamp(150px, 30vw, 200px)',
                      padding: 'clamp(12px, 2.5vw, 16px)',
                      borderRadius: '12px',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      background: 'rgba(0, 0, 0, 0.3)',
                      color: 'white',
                      fontSize: 'clamp(12px, 2.4vw, 14px)',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      marginBottom: 'clamp(12px, 2.5vw, 16px)',
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
                      padding: 'clamp(10px, 2vw, 12px) clamp(12px, 2.5vw, 16px)',
                      borderRadius: '8px',
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: '#22c55e',
                      fontSize: 'clamp(12px, 2.4vw, 14px)',
                      marginBottom: 'clamp(12px, 2.5vw, 16px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    role="status"
                    aria-live="polite">
                      <CheckCircle style={{ width: 'clamp(16px, 3vw, 18px)', height: 'clamp(16px, 3vw, 18px)' }} aria-hidden="true" />
                      Message sent successfully!
                    </div>
                  )}

                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !message.trim()}
                    aria-label="Send message to support"
                    style={{
                      width: '100%',
                      padding: 'clamp(12px, 2.5vw, 16px)',
                      borderRadius: '12px',
                      border: 'none',
                      background: sending || !message.trim() 
                        ? 'rgba(139, 92, 246, 0.3)' 
                        : 'linear-gradient(135deg, #7c3aed, #d946ef)',
                      color: 'white',
                      fontSize: 'clamp(13px, 2.6vw, 16px)',
                      fontWeight: 700,
                      cursor: sending || !message.trim() ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
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
                          width: 'clamp(16px, 3vw, 20px)',
                          height: 'clamp(16px, 3vw, 20px)',
                          border: '3px solid rgba(255, 255, 255, 0.3)',
                          borderTopColor: 'white',
                          borderRadius: '50%'
                        }}
                        aria-hidden="true"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send style={{ width: 'clamp(16px, 3vw, 20px)', height: 'clamp(16px, 3vw, 20px)' }} aria-hidden="true" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </article>
            </section>
              </>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="vx-footer">
          <div className="vx-container">
            <div className="vx-footer-legal">
              <strong style={{ color: "#94a3b8" }}>Educational Quiz Competition.</strong> 18+ only. 
              This is a 100% skill-based knowledge competition with no element of chance. 
              Entry fees apply. Prize pool activates with 2000+ monthly participants. See{" "}
              <a href="/terms">Terms & Conditions</a> for full details.
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