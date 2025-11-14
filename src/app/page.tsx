"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@supabase/supabase-js';
import { 
  Crown, Trophy, Zap, Play, Volume2, VolumeX, Sparkles, Globe,
  User, CreditCard, Award, Gift, Check, AlertCircle
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function HomePage() {
  const router = useRouter();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nextRound, setNextRound] = useState(null);
  const [activePlayers, setActivePlayers] = useState(1000);
  const [user, setUser] = useState(null);
  const [userRounds, setUserRounds] = useState(0);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [show18Modal, setShow18Modal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prizePool, setPrizePool] = useState(null);
  const [stats, setStats] = useState(null);
  const [champions, setChampions] = useState([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('rounds, is_over_18')
            .eq('id', authUser.id)
            .single();
          
          setUser(authUser);
          setUserRounds(profile?.rounds || 0);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    fetchUserData();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('rounds, is_over_18')
          .eq('id', session.user.id)
          .single();
        
        setUser(session.user);
        setUserRounds(profile?.rounds || 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRounds(0);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchNextRound = async () => {
      try {
        const { data } = await supabase
          .from('quiz_rounds')
          .select('start_time')
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(1)
          .single();
        
        if (data) {
          const diff = Math.floor((new Date(data.start_time).getTime() - new Date().getTime()) / 1000);
          setNextRound(Math.max(0, diff));
        }
      } catch (error) {
        console.error('Error fetching next round:', error);
      }
    };
    
    fetchNextRound();
    const interval = setInterval(fetchNextRound, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNextRound(prev => prev > 0 ? prev - 1 : prev);
      setActivePlayers(prev => Math.max(1000, prev + Math.floor(Math.random() * 10 - 5)));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPrizePool = async () => {
      try {
        const { data } = await supabase
          .from('prize_pools')
          .select('*')
          .eq('active', true)
          .single();
        
        setPrizePool(data);
      } catch (error) {
        console.error('Error fetching prize pool:', error);
      }
    };
    
    fetchPrizePool();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await supabase
          .from('platform_stats')
          .select('*')
          .single();
        
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const { data: daily } = await supabase
          .from('leaderboard')
          .select('user_id, score, profiles!inner(name)')
          .eq('period', 'daily')
          .order('score', { ascending: false })
          .limit(1)
          .single();

        const { data: weekly } = await supabase
          .from('leaderboard')
          .select('user_id, score, profiles!inner(name)')
          .eq('period', 'weekly')
          .order('score', { ascending: false })
          .limit(1)
          .single();

        const { data: monthly } = await supabase
          .from('leaderboard')
          .select('user_id, score, profiles!inner(name)')
          .eq('period', 'monthly')
          .order('score', { ascending: false })
          .limit(1)
          .single();

        setChampions([
          { period: 'Daily', name: (daily?.profiles as any)?.name || 'TBA', score: daily?.score || 0, gradient: 'linear-gradient(135deg, #eab308, #f97316)', color: '#facc15' },
          { period: 'Weekly', name: (weekly?.profiles as any)?.name || 'TBA', score: weekly?.score || 0, gradient: 'linear-gradient(135deg, #8b5cf6, #d946ef)', color: '#c084fc' },
          { period: 'Monthly', name: (monthly?.profiles as any)?.name || 'TBA', score: monthly?.score || 0, gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)', color: '#22d3ee' }
        ]);
      } catch (error) {
        console.error('Error fetching champions:', error);
      }
    };
    
    fetchChampions();
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const navigate = (path) => router.push(path);

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRounds(0);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleJoinQuiz = async () => {
    if (!user) {
      await handleGoogleSignIn();
      return;
    }

    if (userRounds <= 0) {
      navigate('/buy');
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_over_18')
        .eq('id', user.id)
        .single();

      if (!profile?.is_over_18) {
        setShow18Modal(true);
      } else {
        navigate('/lobby');
      }
    } catch (error) {
      console.error('Error checking age:', error);
      setShow18Modal(true);
    }
  };

  const confirm18Plus = async () => {
    try {
      await supabase
        .from('profiles')
        .update({ is_over_18: true })
        .eq('id', user.id);
      
      setShow18Modal(false);
      navigate('/lobby');
    } catch (error) {
      console.error('Error updating age verification:', error);
    }
  };

  const handleFreeQuiz = async () => {
    if (!user) {
      await handleGoogleSignIn();
      return;
    }
    navigate('/free');
  };

  const handleBuyBundle = async () => {
    if (!user) {
      await handleGoogleSignIn();
      return;
    }
    navigate('/buy');
  };

  const prizeProgress = prizePool ? (prizePool.current_participants / prizePool.required_participants) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} src="/sounds/vibraxx.mp3" loop />
      
      <style jsx global>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.4); } 50% { box-shadow: 0 0 40px rgba(234, 179, 8, 0.8); } }
        @keyframes neon-pulse { 
          0%, 100% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.6), 0 0 40px rgba(124, 58, 237, 0.4), inset 0 0 20px rgba(124, 58, 237, 0.2); } 
          50% { box-shadow: 0 0 30px rgba(124, 58, 237, 0.8), 0 0 60px rgba(124, 58, 237, 0.6), inset 0 0 30px rgba(124, 58, 237, 0.3); } 
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-shimmer { background-size: 200% 100%; animation: shimmer 3s linear infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-neon-pulse { animation: neon-pulse 2s ease-in-out infinite; }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, -apple-system, sans-serif; overflow-x: hidden; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #020817, #0a0a1a, #020817)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background */}
        <div className="animate-float" style={{
          position: 'fixed', top: '5%', left: '-5%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          opacity: 0.2, filter: 'blur(80px)', zIndex: 0
        }} />
        <div className="animate-float" style={{
          position: 'fixed', bottom: '10%', right: '-5%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, #d946ef 0%, transparent 70%)',
          opacity: 0.15, filter: 'blur(80px)', zIndex: 0, animationDelay: '2s'
        }} />
        <div className="animate-float" style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, #eab308 0%, transparent 70%)',
          opacity: 0.1, filter: 'blur(80px)', zIndex: 0, animationDelay: '1s'
        }} />

        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(2, 8, 23, 0.95)'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              minHeight: '70px',
              gap: '12px',
              flexWrap: 'wrap',
              padding: '8px 0'
            }}>
              
              {/* Logo */}
              <div 
                onClick={() => navigate('/')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  cursor: 'pointer'
                }}
              >
                <div className="animate-neon-pulse" style={{
                  width: isMobile ? '80px' : '100px', 
                  height: isMobile ? '80px' : '100px', 
                  borderRadius: '50%',
                  background: '#0f0f1a',
                  border: '3px solid #7c3aed',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '10px'
                }}>
                  <img 
                    src="/images/logo.png" 
                    alt="VibraXX Logo" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain' 
                    }} 
                  />
                </div>
                <div>
                  <div style={{ 
                    fontSize: isMobile ? '11px' : '14px', 
                    color: '#94a3b8', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.15em',
                    fontWeight: 700
                  }}>
                    LIVE QUIZ ARENA
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: isMobile ? '8px' : '10px', 
                flexWrap: 'wrap',
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'flex-end' : 'flex-start'
              }}>
                {/* Music */}
                <button
                  onClick={toggleMusic}
                  style={{
                    padding: '10px', 
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    background: isPlaying ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                    cursor: 'pointer', 
                    transition: 'all 0.3s',
                    minWidth: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isPlaying ? 
                    <Volume2 style={{ width: '18px', height: '18px', color: '#a78bfa' }} /> : 
                    <VolumeX style={{ width: '18px', height: '18px', color: '#64748b' }} />
                  }
                </button>

                {/* Leaderboard */}
                <button
                  onClick={() => navigate('/leaderboard')}
                  style={{
                    padding: isMobile ? '10px' : '10px 18px', 
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    background: 'transparent', 
                    color: 'white',
                    fontSize: '14px', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap',
                    minWidth: isMobile ? '40px' : 'auto',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Trophy style={{ width: '18px', height: '18px', color: '#a78bfa' }} />
                  {!isMobile && <span>Leaderboard</span>}
                </button>

                {user ? (
                  <>
                    {/* Rounds Display */}
                    <div style={{
                      padding: isMobile ? '10px 12px' : '10px 16px',
                      borderRadius: '12px',
                      border: '2px solid rgba(34, 197, 94, 0.4)',
                      background: 'rgba(34, 197, 94, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      minWidth: isMobile ? 'auto' : 'auto'
                    }}>
                      <Zap style={{ width: '16px', height: '16px', color: '#22c55e' }} />
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: 700, 
                        color: '#22c55e' 
                      }}>
                        {userRounds}
                      </span>
                    </div>

                    {/* Profile */}
                    <button
                      onClick={() => navigate('/profile')}
                      style={{
                        padding: isMobile ? '10px' : '10px 18px', 
                        borderRadius: '12px',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        background: 'rgba(139, 92, 246, 0.15)', 
                        color: 'white',
                        fontSize: '14px', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        transition: 'all 0.3s',
                        whiteSpace: 'nowrap',
                        minWidth: isMobile ? '40px' : 'auto',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)'}
                    >
                      <User style={{ width: '18px', height: '18px', color: '#a78bfa' }} />
                      {!isMobile && <span>Profile</span>}
                    </button>

                    {/* Sign Out */}
                    <button
                      onClick={handleSignOut}
                      style={{
                        position: 'relative', 
                        padding: isMobile ? '10px 16px' : '10px 18px', 
                        borderRadius: '12px',
                        border: 'none', 
                        background: 'transparent', 
                        color: 'white',
                        fontSize: '13px', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <div className="animate-shimmer" style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)'
                      }} />
                      <span style={{ position: 'relative', zIndex: 10 }}>Out</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleGoogleSignIn}
                    style={{
                      position: 'relative', 
                      padding: isMobile ? '12px 18px' : '12px 24px', 
                      borderRadius: '12px',
                      border: 'none', 
                      background: 'white', 
                      color: '#1f2937',
                      fontSize: isMobile ? '14px' : '15px', 
                      fontWeight: 700, 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <svg width="20" height="20" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                      <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
                      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                    </svg>
                    <span>{isMobile ? 'Sign In' : 'Sign in with Google'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Live Banner */}
        <div style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.08))',
          backdropFilter: 'blur(16px)', 
          padding: isMobile ? '10px 0' : '12px 0'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: isMobile ? '12px' : '32px', 
              flexWrap: 'wrap', 
              fontSize: isMobile ? '11px' : '14px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
                <span style={{ color: '#f87171', fontWeight: 700 }}>LIVE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
                <Globe style={{ width: '16px', height: '16px', color: '#a78bfa' }} />
                <span style={{ fontWeight: 700, color: 'white' }}>{activePlayers.toLocaleString()}</span>
                <span>{isMobile ? 'online' : 'players online'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
                <Sparkles style={{ width: '16px', height: '16px', color: '#f0abfc' }} />
                <span>{isMobile ? 'Next' : 'Next round'}</span>
                <span style={{ fontWeight: 700, color: '#a78bfa' }}>{formatTime(nextRound)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main style={{ 
          position: 'relative', 
          zIndex: 10, 
          padding: isMobile ? '30px 16px' : '60px 24px' 
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: isMobile ? '40px' : '80px' }}>
              {/* Prize Badge */}
              <div style={{
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '10px',
                padding: isMobile ? '8px 16px' : '10px 24px', 
                borderRadius: '9999px',
                border: '2px solid rgba(234, 179, 8, 0.4)',
                background: 'rgba(234, 179, 8, 0.1)',
                marginBottom: isMobile ? '20px' : '24px', 
                boxShadow: '0 0 30px rgba(234, 179, 8, 0.3)'
              }}>
                <Trophy style={{ width: isMobile ? '18px' : '20px', height: isMobile ? '18px' : '20px', color: '#facc15' }} />
                <span style={{ fontSize: isMobile ? '12px' : '16px', fontWeight: 700, color: '#fef08a' }}>
                  £{prizePool?.amount?.toLocaleString() || '---'} MONTHLY GRAND PRIZE
                </span>
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: isMobile ? '28px' : '64px',
                fontWeight: 900, 
                lineHeight: 1.1,
                marginBottom: isMobile ? '16px' : '24px', 
                letterSpacing: '-0.02em',
                padding: '0 16px'
              }}>
                <span className="animate-shimmer" style={{
                  background: 'linear-gradient(90deg, #7c3aed, #22d3ee, #f97316, #d946ef, #7c3aed)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  The Next Generation<br />Live Quiz Arena
                </span>
              </h1>

              <p style={{
                fontSize: isMobile ? '14px' : '20px',
                color: '#94a3b8', 
                maxWidth: '700px',
                margin: isMobile ? '0 auto 30px' : '0 auto 40px', 
                lineHeight: 1.6,
                padding: '0 16px'
              }}>
                Compete worldwide. Show your knowledge. Earn rewards!
              </p>

              {/* CTA Buttons */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px', 
                alignItems: 'center', 
                marginBottom: '32px' 
              }}>
                <button 
                  onClick={handleJoinQuiz}
                  style={{
                    position: 'relative', 
                    padding: isMobile ? '14px 28px' : '20px 48px',
                    borderRadius: '16px', 
                    border: 'none', 
                    cursor: 'pointer',
                    fontSize: isMobile ? '15px' : '18px', 
                    fontWeight: 700,
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    overflow: 'hidden', 
                    boxShadow: '0 20px 60px -10px rgba(139, 92, 246, 0.6)',
                    transition: 'transform 0.2s', 
                    color: 'white',
                    width: isMobile ? '100%' : 'auto',
                    maxWidth: isMobile ? '350px' : 'none',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #7c3aed, #d946ef)' }} />
                  <Play style={{ position: 'relative', zIndex: 10, width: '24px', height: '24px' }} />
                  <span style={{ position: 'relative', zIndex: 10 }}>
                    {isMobile ? 'Join Quiz - £1' : 'Join Live Quiz - £1 per Round'}
                  </span>
                </button>

                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  flexWrap: 'wrap', 
                  justifyContent: 'center',
                  width: '100%',
                  maxWidth: isMobile ? '350px' : 'none'
                }}>
                  <button 
                    onClick={handleFreeQuiz}
                    style={{
                      padding: isMobile ? '10px 16px' : '14px 32px',
                      borderRadius: '12px', 
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      background: 'rgba(34, 197, 94, 0.1)', 
                      color: '#22c55e',
                      fontSize: isMobile ? '13px' : '16px', 
                      fontWeight: 600,
                      cursor: 'pointer', 
                      transition: 'all 0.2s',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      flex: isMobile ? '1' : 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'}
                  >
                    <Gift style={{ width: '18px', height: '18px' }} />
                    <span>{isMobile ? 'Free' : 'Try Free Quiz'}</span>
                  </button>

                  <button 
                    onClick={handleBuyBundle}
                    style={{
                      position: 'relative', 
                      padding: isMobile ? '10px 16px' : '14px 32px',
                      borderRadius: '12px', 
                      border: 'none',
                      background: 'transparent', 
                      color: 'white',
                      fontSize: isMobile ? '13px' : '16px', 
                      fontWeight: 600,
                      cursor: 'pointer', 
                      overflow: 'hidden',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      flex: isMobile ? '1' : 'none'
                    }}
                  >
                    <div className="animate-shimmer" style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(90deg, #06b6d4, #0891b2, #06b6d4)'
                    }} />
                    <CreditCard style={{ position: 'relative', zIndex: 10, width: '18px', height: '18px' }} />
                    <span style={{ position: 'relative', zIndex: 10 }}>
                      {isMobile ? 'Bundle' : 'Buy Bundle'}
                    </span>
                  </button>
                </div>
              </div>

              {!user && (
                <p style={{ 
                  fontSize: isMobile ? '13px' : '15px', 
                  color: '#ef4444',
                  fontWeight: 600,
                  marginBottom: '12px'
                }}>
                  ⚠️ Sign in with Google required to play
                </p>
              )}

              <p style={{ fontSize: isMobile ? '12px' : '15px', color: '#64748b' }}>
                <strong style={{ color: '#a78bfa' }}>Best Deal:</strong> 12 Rounds = £10 Bundle (Save £2!)
              </p>
            </div>

            {/* Prize Pool Info */}
            {prizePool && (
              <div className="animate-pulse-glow" style={{
                padding: isMobile ? '24px' : '48px',
                borderRadius: '24px',
                border: '2px solid rgba(234, 179, 8, 0.3)',
                background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(202, 138, 4, 0.05))',
                backdropFilter: 'blur(20px)',
                marginBottom: isMobile ? '40px' : '60px'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                    <Award style={{ width: isMobile ? '32px' : '48px', height: isMobile ? '32px' : '48px', color: '#facc15' }} />
                    <h2 style={{ fontSize: isMobile ? '24px' : '36px', fontWeight: 900, color: '#fef08a' }}>
                      Monthly Rewards
                    </h2>
                  </div>
                  <p style={{ fontSize: isMobile ? '13px' : '16px', color: '#cbd5e1', maxWidth: '800px', margin: '0 auto' }}>
                    Test your knowledge and earn rewards. Top performers win prizes!
                  </p>
                </div>

                {/* Prize Progress */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: isMobile ? '13px' : '16px', fontWeight: 600, color: '#94a3b8' }}>
                      Participants Required
                    </span>
                    <span style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 900, color: '#facc15' }}>
                      {prizePool.current_participants} / {prizePool.required_participants}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '16px', borderRadius: '9999px', background: 'rgba(0, 0, 0, 0.3)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${prizeProgress}%`,
                      height: '100%',
                      background: 'linear-gradient(to right, #eab308, #f59e0b)',
                      borderRadius: '9999px',
                      transition: 'width 0.5s',
                      boxShadow: '0 0 20px rgba(234, 179, 8, 0.5)'
                    }} />
                  </div>
                  <p style={{ fontSize: isMobile ? '11px' : '14px', color: '#64748b', marginTop: '8px', textAlign: 'center' }}>
                    {Math.round(prizeProgress)}% complete • {prizePool.required_participants - prizePool.current_participants} more needed
                  </p>
                </div>

                {/* Prize Rules */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
                  gap: isMobile ? '16px' : '20px' 
                }}>
                  <div style={{
                    padding: isMobile ? '16px' : '20px', 
                    borderRadius: '16px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                  }}>
                    <Check style={{ width: '24px', height: '24px', color: '#22c55e', marginBottom: '12px' }} />
                    <h3 style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 700, marginBottom: '8px', color: 'white' }}>Minimum 2000 Players</h3>
                    <p style={{ fontSize: isMobile ? '13px' : '14px', color: '#94a3b8', lineHeight: 1.5 }}>
                      Rewards activate when we reach 2,000 active participants in the monthly competition.
                    </p>
                  </div>

                  <div style={{
                    padding: isMobile ? '16px' : '20px', 
                    borderRadius: '16px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                  }}>
                    <Award style={{ width: '24px', height: '24px', color: '#a78bfa', marginBottom: '12px' }} />
                    <h3 style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 700, marginBottom: '8px', color: 'white' }}>Rollover System</h3>
                    <p style={{ fontSize: isMobile ? '13px' : '14px', color: '#94a3b8', lineHeight: 1.5 }}>
                      If the participation target isn't met, only the cash prize is disabled; round rewards are still awarded as usual
                    </p>
                  </div>

                  <div style={{
                    padding: isMobile ? '16px' : '20px', 
                    borderRadius: '16px',
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.2)'
                  }}>
                    <Crown style={{ width: '24px', height: '24px', color: '#facc15', marginBottom: '12px' }} />
                    <h3 style={{ fontSize: isMobile ? '15px' : '16px', fontWeight: 700, marginBottom: '8px', color: 'white' }}>Top 3 Performers</h3>
                    <p style={{ fontSize: isMobile ? '13px' : '14px', color: '#94a3b8', lineHeight: 1.5 }}>
                      1st place wins £1000, 2nd wins 30 rounds, 3rd wins 10 rounds!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowPrizeModal(true)}
                  style={{
                    marginTop: '24px',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    background: 'transparent',
                    color: '#facc15',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '24px auto 0'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(234, 179, 8, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <AlertCircle style={{ width: '18px', height: '18px' }} />
                  View Full Reward Details
                </button>
              </div>
            )}

            {/* Stats Grid */}
            {stats && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: isMobile ? '16px' : '24px',
                marginBottom: isMobile ? '40px' : '60px'
              }}>
                {[
                  { icon: Globe, value: `${Math.floor(stats.total_players / 1000)}K+`, label: 'Active Players', color: '#a78bfa' },
                  { icon: Sparkles, value: `${(stats.questions_answered / 1000000).toFixed(1)}M+`, label: 'Questions Answered', color: '#f0abfc' },
                  { icon: Zap, value: `${stats.daily_rounds}/day`, label: 'Live Rounds', color: '#22d3ee' }
                ].map((stat, i) => (
                  <div key={i} style={{
                    padding: isMobile ? '24px 20px' : '32px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(2, 8, 23, 0.8)',
                    backdropFilter: 'blur(20px)',
                    textAlign: 'center',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <stat.icon style={{ width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px', color: stat.color, margin: '0 auto 16px' }} />
                    <div style={{ fontSize: isMobile ? '32px' : '36px', fontWeight: 900, color: stat.color, marginBottom: '8px' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: isMobile ? '14px' : '15px', color: '#94a3b8' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Champions */}
            {champions.length > 0 && (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{
                  fontSize: isMobile ? '28px' : '36px',
                  fontWeight: 900, 
                  marginBottom: '32px',
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center', 
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <Crown style={{ width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px', color: '#facc15' }} />
                  <span>Current Champions</span>
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gap: isMobile ? '16px' : '24px'
                }}>
                  {champions.map((champ, i) => (
                    <div key={i} style={{
                      padding: isMobile ? '24px 20px' : '32px',
                      borderRadius: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(2, 8, 23, 0.8)',
                      backdropFilter: 'blur(20px)',
                      textAlign: 'center',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{
                        width: isMobile ? '64px' : '72px', 
                        height: isMobile ? '64px' : '72px',
                        margin: '0 auto 20px',
                        borderRadius: '20px',
                        background: champ.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 30px ${champ.color}40`
                      }}>
                        <Crown style={{ width: isMobile ? '32px' : '36px', height: isMobile ? '32px' : '36px', color: 'white' }} />
                      </div>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: '#64748b',
                        marginBottom: '8px'
                      }}>
                        {champ.period} Champion
                      </div>
                      <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 700, marginBottom: '8px' }}>
                        {champ.name}
                      </div>
                      <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 900, color: champ.color }}>
                        {champ.score.toLocaleString()} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(2, 8, 23, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: isMobile ? '32px 16px' : '48px 24px',
          textAlign: 'center',
          marginTop: isMobile ? '40px' : '60px'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ fontSize: isMobile ? '13px' : '14px', color: '#64748b', marginBottom: '16px' }}>
              © 2025 VibraXX · Powered by Sermin Limited
            </div>
            <div style={{ 
              display: 'flex', 
              gap: isMobile ? '16px' : '24px', 
              justifyContent: 'center', 
              flexWrap: 'wrap', 
              fontSize: isMobile ? '13px' : '14px' 
            }}>
              <a href="/privacy" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy</a>
              <a href="/terms" style={{ color: '#64748b', textDecoration: 'none' }}>Terms</a>
              <a href="/support" style={{ color: '#64748b', textDecoration: 'none' }}>Support</a>
              <a href="/prize-rules" style={{ color: '#facc15', textDecoration: 'none', fontWeight: 600 }}>Prize Rules</a>
            </div>
          </div>
        </footer>

        {/* 18+ Age Verification Modal */}
        {show18Modal && (
          <div
            onClick={() => setShow18Modal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(12px)',
              zIndex: 150,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '500px',
                width: '100%',
                padding: isMobile ? '32px 24px' : '48px 40px',
                borderRadius: '24px',
                border: '3px solid rgba(239, 68, 68, 0.4)',
                background: 'linear-gradient(135deg, rgba(2, 8, 23, 0.98), rgba(10, 10, 26, 0.98))',
                backdropFilter: 'blur(20px)',
                textAlign: 'center',
                boxShadow: '0 0 60px rgba(239, 68, 68, 0.3)'
              }}
            >
              <AlertCircle style={{ width: '64px', height: '64px', color: '#ef4444', margin: '0 auto 24px' }} />
              
              <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 900, marginBottom: '16px', color: '#ef4444' }}>
                Age Verification Required
              </h2>
              
              <p style={{ fontSize: isMobile ? '15px' : '18px', color: '#cbd5e1', marginBottom: '24px', lineHeight: 1.6 }}>
                You must be <strong style={{ color: '#ef4444' }}>18 years or older</strong> to participate in paid quiz competitions with rewards.
              </p>

              <div style={{
                padding: '20px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                marginBottom: '32px'
              }}>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
                  By confirming, you certify that you are 18+ and agree to participate in this knowledge-based quiz competition.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                <button
                  onClick={confirm18Plus}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ✓ I am 18 or older
                </button>

                <button
                  onClick={() => setShow18Modal(false)}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    borderRadius: '12px',
                    border: '2px solid rgba(239, 68, 68, 0.3)',
                    background: 'transparent',
                    color: '#ef4444',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  }}
                >
                  Cancel
                </button>
              </div>

              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '20px', lineHeight: 1.5 }}>
                Free quiz option is available for all ages without age verification.
              </p>
            </div>
          </div>
        )}

        {/* Prize Modal */}
        {showPrizeModal && (
          <div
            onClick={() => setShowPrizeModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '600px',
                width: '100%',
                padding: isMobile ? '24px' : '40px',
                borderRadius: '24px',
                border: '2px solid rgba(234, 179, 8, 0.3)',
                background: 'linear-gradient(135deg, rgba(2, 8, 23, 0.98), rgba(10, 10, 26, 0.98))',
                backdropFilter: 'blur(20px)',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <Trophy style={{ width: '48px', height: '48px', color: '#facc15', margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 900, marginBottom: '12px' }}>
                  Reward Distribution
                </h2>
                <p style={{ fontSize: '16px', color: '#94a3b8' }}>
                  Monthly Quiz Competition Rewards
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#facc15' }}>
                  Top 3 Performer Rewards
                </h3>
                {[
                  { place: '1st', reward: '£1,000 Cash Prize', icon: '🏆', color: '#facc15' },
                  { place: '2nd', reward: '30 Free Rounds', icon: '🥈', color: '#c0c0c0' },
                  { place: '3rd', reward: '10 Free Rounds', icon: '🥉', color: '#cd7f32' }
                ].map((prize, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: isMobile ? '16px' : '20px',
                    marginBottom: '12px',
                    borderRadius: '12px',
                    background: i === 0 ? 'rgba(234, 179, 8, 0.15)' : 'rgba(139, 92, 246, 0.08)',
                    border: `2px solid ${i === 0 ? 'rgba(234, 179, 8, 0.3)' : 'rgba(139, 92, 246, 0.15)'}`,
                    boxShadow: i === 0 ? '0 0 20px rgba(234, 179, 8, 0.2)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '28px' }}>{prize.icon}</span>
                      <div>
                        <span style={{ 
                          fontSize: isMobile ? '16px' : '18px', 
                          fontWeight: 800, 
                          color: prize.color,
                          display: 'block',
                          marginBottom: '4px'
                        }}>
                          {prize.place} Place
                        </span>
                        <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#94a3b8' }}>
                          Top Performer
                        </span>
                      </div>
                    </div>
                    <span style={{ 
                      fontSize: isMobile ? '15px' : '17px', 
                      fontWeight: 900, 
                      color: prize.color,
                      textAlign: 'right'
                    }}>
                      {prize.reward}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{
                padding: isMobile ? '16px' : '20px',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                marginBottom: '24px'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check style={{ width: '20px', height: '20px' }} />
                  Important Rules
                </h4>
                <ul style={{ fontSize: isMobile ? '13px' : '14px', color: '#94a3b8', lineHeight: 1.8, paddingLeft: '20px', margin: 0 }}>
                  <li>Minimum 2,000 active participants required</li>
                  <li>Winners must be 18+ years old</li>
                  <li>Cash prizes are paid within 7 days after KYC verification</li>
                  <li>Free rounds credited immediately to account</li>
                  <li>If minimum not met, rewards roll over to next month</li>
                  <li>Rounds start automatically every 15 minutes</li>
                  <li>Only players who are in the lobby at the time can join the round</li>
                </ul>
              </div>

              <button
                onClick={() => setShowPrizeModal(false)}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, #d946ef)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}