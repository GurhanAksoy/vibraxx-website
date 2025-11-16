"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Crown, Trophy, Zap, Play, Volume2, VolumeX, Sparkles, Globe,
  User, CreditCard, Award, Gift, Check, AlertCircle
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nextRound, setNextRound] = useState<number | null>(null);
  const [activePlayers, setActivePlayers] = useState(1000);
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [userRounds, setUserRounds] = useState(0);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [show18Modal, setShow18Modal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prizePool, setPrizePool] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [champions, setChampions] = useState<any[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        setAuthLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("rounds, is_over_18, name")
            .eq("id", session.user.id)
            .single();

          const displayName = profile?.name || 
                             session.user.user_metadata?.full_name || 
                             session.user.email?.split("@")[0] || 
                             "User";
          
          const avatarUrl = session.user.user_metadata?.avatar_url || 
                           session.user.user_metadata?.picture || '';

          setUser(session.user);
          setUserName(displayName);
          setUserAvatar(avatarUrl);
          setUserRounds(profile?.rounds || 0);
        }
        
        setAuthLoading(false);
      } catch (e) {
        console.error("Auth init error:", e);
        setAuthLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      setAuthLoading(false);

      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("rounds, is_over_18, name")
            .eq("id", session.user.id)
            .single();

          const displayName = profile?.name || 
                             session.user.user_metadata?.full_name || 
                             session.user.email?.split("@")[0] || 
                             "User";
          
          const avatarUrl = session.user.user_metadata?.avatar_url || 
                           session.user.user_metadata?.picture || '';

          setUser(session.user);
          setUserName(displayName);
          setUserAvatar(avatarUrl);
          setUserRounds(profile?.rounds || 0);
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      } else {
        setUser(null);
        setUserName("");
        setUserAvatar("");
        setUserRounds(0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
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
      setNextRound(prev => prev !== null && prev > 0 ? prev - 1 : prev);
      setActivePlayers(prev => Math.max(1000, prev + Math.floor(Math.random() * 10 - 5)));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prizePoolRes, statsRes, dailyRes, weeklyRes, monthlyRes] = await Promise.all([
          supabase.from('prize_pools').select('*').eq('active', true).single(),
          supabase.from('platform_stats').select('*').single(),
          supabase.from('leaderboard').select('user_id, score, profiles!inner(name)').eq('period', 'daily').order('score', { ascending: false }).limit(1).single(),
          supabase.from('leaderboard').select('user_id, score, profiles!inner(name)').eq('period', 'weekly').order('score', { ascending: false }).limit(1).single(),
          supabase.from('leaderboard').select('user_id, score, profiles!inner(name)').eq('period', 'monthly').order('score', { ascending: false }).limit(1).single()
        ]);

        if (prizePoolRes.data) setPrizePool(prizePoolRes.data);
        if (statsRes.data) setStats(statsRes.data);
        
        const championsData = [
          { period: "Daily", name: dailyRes.data?.profiles?.name || "TBA", score: dailyRes.data?.score || 0, gradient: "linear-gradient(135deg, #eab308, #f97316)", color: "#facc15" },
          { period: "Weekly", name: weeklyRes.data?.profiles?.name || "TBA", score: weeklyRes.data?.score || 0, gradient: "linear-gradient(135deg, #8b5cf6, #d946ef)", color: "#c084fc" },
          { period: "Monthly", name: monthlyRes.data?.profiles?.name || "TBA", score: monthlyRes.data?.score || 0, gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)", color: "#22d3ee" }
        ];
        
        setChampions(championsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  const toggleMusic = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const formatTime = useCallback((seconds: number | null) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  const navigate = useCallback((path: string) => router.push(path), [router]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      const redirectTo = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000/auth/callback'
        : 'https://vibraxx.com/auth/callback';
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) console.error('OAuth error:', error);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRounds(0);
      setUserName('');
      setUserAvatar('');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [navigate]);

  const handleJoinQuiz = useCallback(async () => {
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
  }, [user, userRounds, handleGoogleSignIn, navigate]);

  const confirm18Plus = useCallback(async () => {
    try {
      await supabase.from('profiles').update({ is_over_18: true }).eq('id', user.id);
      setShow18Modal(false);
      navigate('/lobby');
    } catch (error) {
      console.error('Error updating age verification:', error);
    }
  }, [user, navigate]);

  const handleFreeQuiz = useCallback(async () => {
    if (!user) {
      await handleGoogleSignIn();
      return;
    }
    navigate('/free');
  }, [user, handleGoogleSignIn, navigate]);

  const handleBuyBundle = useCallback(async () => {
    if (!user) {
      await handleGoogleSignIn();
      return;
    }
    navigate('/buy');
  }, [user, handleGoogleSignIn, navigate]);

  const prizeProgress = useMemo(() => 
    prizePool ? (prizePool.current_participants / prizePool.required_participants) * 100 : 0,
    [prizePool]
  );

  const statsData = useMemo(() => stats ? [
    { icon: Globe, value: `${Math.floor(stats.total_players / 1000)}K+`, label: 'Active Players', color: '#a78bfa' },
    { icon: Sparkles, value: `${(stats.questions_answered / 1000000).toFixed(1)}M+`, label: 'Questions Answered', color: '#f0abfc' },
    { icon: Zap, value: `${stats.daily_rounds}/day`, label: 'Live Rounds', color: '#22d3ee' }
  ] : [], [stats]);

  const prizeRules = useMemo(() => [
    { icon: Check, title: 'Minimum 2000 Players', desc: 'Rewards activate when we reach 2,000 active participants in the monthly competition.', bg: 'green' },
    { icon: Award, title: 'Rollover System', desc: 'If the participation target isn\'t met, only the cash prize is disabled; round rewards are still awarded as usual', bg: 'purple' },
    { icon: Crown, title: 'Top 3 Performers', desc: '1st place wins £1000, 2nd wins 30 rounds, 3rd wins 10 rounds!', bg: 'yellow' }
  ], []);

  const prizeList = useMemo(() => [
    { place: '1st', reward: '£1,000 Cash Prize', icon: '🏆', color: '#facc15' },
    { place: '2nd', reward: '30 Free Rounds', icon: '🥈', color: '#c0c0c0' },
    { place: '3rd', reward: '10 Free Rounds', icon: '🥉', color: '#cd7f32' }
  ], []);

  return (
    <>
      <audio ref={audioRef} src="/sounds/vibraxx.mp3" loop />
      
      <style jsx global>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.4), 0 0 40px rgba(234, 179, 8, 0.2); } 50% { box-shadow: 0 0 40px rgba(234, 179, 8, 0.8), 0 0 80px rgba(234, 179, 8, 0.4); } }
        @keyframes neon-pulse { 0%, 100% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.6), 0 0 40px rgba(124, 58, 237, 0.4), inset 0 0 20px rgba(124, 58, 237, 0.2); } 50% { box-shadow: 0 0 30px rgba(124, 58, 237, 0.8), 0 0 60px rgba(124, 58, 237, 0.6), inset 0 0 30px rgba(124, 58, 237, 0.3); } }
        @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes glow-pulse { 0%, 100% { filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.4)); } 50% { filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.8)); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.02); opacity: 0.95; } }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-shimmer { background-size: 200% 100%; animation: shimmer 3s linear infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-neon-pulse { animation: neon-pulse 2s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.5s ease-out forwards; }
        .animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
        
        .glass-card {
          background: rgba(2, 8, 23, 0.6);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        
        .glass-card:hover {
          background: rgba(2, 8, 23, 0.7);
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 0 12px 48px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15);
          transform: translateY(-4px);
        }
        
        .premium-card {
          position: relative;
          overflow: hidden;
        }
        
        .premium-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }
        
        .premium-card:hover::before {
          left: 100%;
        }
        
        * { 
          box-sizing: border-box; 
          margin: 0; 
          padding: 0;
          -webkit-tap-highlight-color: transparent;
        }
        
        body { 
          font-family: system-ui, -apple-system, sans-serif; 
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        button {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        
        @media (max-width: 768px) {
          .glass-card:hover {
            transform: translateY(-2px);
          }
          
          .animate-float {
            animation: float 8s ease-in-out infinite;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #020817, #0a0a1a, #020817)', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div className="animate-float" style={{ position: 'fixed', top: '5%', left: '-5%', width: isMobile ? '300px' : '400px', height: isMobile ? '300px' : '400px', borderRadius: '50%', background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', opacity: 0.2, filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }} />
        <div className="animate-float" style={{ position: 'fixed', bottom: '10%', right: '-5%', width: isMobile ? '400px' : '500px', height: isMobile ? '400px' : '500px', borderRadius: '50%', background: 'radial-gradient(circle, #d946ef 0%, transparent 70%)', opacity: 0.15, filter: 'blur(80px)', zIndex: 0, animationDelay: '2s', pointerEvents: 'none' }} />
        <div className="animate-float" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: isMobile ? '250px' : '300px', height: isMobile ? '250px' : '300px', borderRadius: '50%', background: 'radial-gradient(circle, #eab308 0%, transparent 70%)', opacity: 0.1, filter: 'blur(80px)', zIndex: 0, animationDelay: '1s', pointerEvents: 'none' }} />

        <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', background: 'rgba(2, 8, 23, 0.95)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '0 12px' : '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: isMobile ? '60px' : '70px', gap: isMobile ? '8px' : '12px', flexWrap: 'nowrap' }}>
              
              <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px', cursor: 'pointer', flexShrink: 0 }}>
                <div className="animate-neon-pulse" style={{ width: isMobile ? '50px' : '80px', height: isMobile ? '50px' : '80px', borderRadius: '50%', background: '#0f0f1a', border: '3px solid #7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', flexShrink: 0 }}>
                  <img src="/images/logo.png" alt="VibraXX" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                {!isMobile && (
                  <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    LIVE QUIZ ARENA
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px', flexWrap: 'nowrap' }}>
                <button onClick={toggleMusic} style={{ padding: isMobile ? '8px' : '10px', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)', background: isPlaying ? 'rgba(139, 92, 246, 0.2)' : 'transparent', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isPlaying ? <Volume2 style={{ width: isMobile ? '16px' : '18px', height: isMobile ? '16px' : '18px', color: '#a78bfa' }} /> : <VolumeX style={{ width: isMobile ? '16px' : '18px', height: isMobile ? '16px' : '18px', color: '#64748b' }} />}
                </button>

                <button onClick={() => navigate('/leaderboard')} style={{ padding: isMobile ? '8px' : '10px 16px', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'transparent', color: 'white', fontSize: isMobile ? '0' : '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s', flexShrink: 0 }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <Trophy style={{ width: isMobile ? '16px' : '18px', height: isMobile ? '16px' : '18px', color: '#a78bfa' }} />
                  {!isMobile && <span>Leaderboard</span>}
                </button>

                {authLoading ? (
                  <div style={{ padding: isMobile ? '8px 12px' : '10px 16px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', fontSize: isMobile ? '12px' : '14px', color: '#a78bfa', animation: 'pulse 1.5s ease-in-out infinite', whiteSpace: 'nowrap' }}>
                    {isMobile ? '...' : 'Loading...'}
                  </div>
                ) : user ? (
                  <>
                    <div style={{ padding: isMobile ? '6px 10px' : '8px 14px', borderRadius: '12px', border: '2px solid rgba(34, 197, 94, 0.4)', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <Zap style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '14px' : '16px', color: '#22c55e' }} />
                      <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 700, color: '#22c55e' }}>{userRounds}</span>
                    </div>

                    {userAvatar ? (
                      <img src={userAvatar} alt={userName} style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', borderRadius: '50%', border: '2px solid rgba(139, 92, 246, 0.5)', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: isMobile ? '32px' : '40px', height: isMobile ? '32px' : '40px', borderRadius: '50%', border: '2px solid rgba(139, 92, 246, 0.5)', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User style={{ width: isMobile ? '16px' : '20px', height: isMobile ? '16px' : '20px', color: '#a78bfa' }} />
                      </div>
                    )}

                    {!isMobile && (
                      <button onClick={() => navigate('/profile')} style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'rgba(139, 92, 246, 0.15)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s', whiteSpace: 'nowrap' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)'}>
                        <span>Profile</span>
                      </button>
                    )}

                    <button onClick={handleSignOut} style={{ position: 'relative', padding: isMobile ? '8px 12px' : '10px 16px', borderRadius: '12px', border: 'none', background: 'transparent', color: 'white', fontSize: isMobile ? '11px' : '13px', fontWeight: 600, cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      <div className="animate-shimmer" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)' }} />
                      <span style={{ position: 'relative', zIndex: 10 }}>{isMobile ? 'Exit' : 'Sign Out'}</span>
                    </button>
                  </>
                ) : (
                  <button onClick={handleGoogleSignIn} style={{ padding: isMobile ? '8px 12px' : '12px 20px', borderRadius: '12px', border: 'none', background: 'white', color: '#1f2937', fontSize: isMobile ? '12px' : '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)', transition: 'transform 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    <svg width={isMobile ? "16" : "18"} height={isMobile ? "16" : "18"} viewBox="0 0 18 18">
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

          <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.08))', backdropFilter: 'blur(16px)', padding: isMobile ? '8px 0' : '12px 0' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '0 12px' : '0 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? '8px' : '32px', flexWrap: 'wrap', fontSize: isMobile ? '10px' : '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                  <div style={{ width: isMobile ? '8px' : '10px', height: isMobile ? '8px' : '10px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
                  <span style={{ color: '#f87171', fontWeight: 700 }}>LIVE</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                  <Globe style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '14px' : '16px', color: '#a78bfa' }} />
                  <span style={{ fontWeight: 700, color: 'white' }}>{activePlayers.toLocaleString()}</span>
                  <span>{isMobile ? 'online' : 'players online'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
                  <Sparkles style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '14px' : '16px', color: '#f0abfc' }} />
                  <span>{isMobile ? 'Next' : 'Next round'}</span>
                  <span style={{ fontWeight: 700, color: '#a78bfa' }}>{formatTime(nextRound)}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main style={{ position: 'relative', zIndex: 10, padding: isMobile ? '24px 12px' : '60px 24px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            
            <div style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '80px' }}>
              <div className="animate-glow-pulse" style={{ display: 'inline-flex', alignItems: 'center', gap: isMobile ? '8px' : '10px', padding: isMobile ? '6px 12px' : '10px 24px', borderRadius: '9999px', border: '2px solid rgba(234, 179, 8, 0.4)', background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(202, 138, 4, 0.1))', backdropFilter: 'blur(10px)', marginBottom: isMobile ? '16px' : '24px', boxShadow: '0 0 40px rgba(234, 179, 8, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3)' }}>
                <Trophy style={{ width: isMobile ? '16px' : '20px', height: isMobile ? '16px' : '20px', color: '#facc15' }} />
                <span style={{ fontSize: isMobile ? '11px' : '16px', fontWeight: 700, background: 'linear-gradient(135deg, #fef08a, #facc15)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', whiteSpace: 'nowrap' }}>
                  £{prizePool?.amount || 1000} MONTHLY PRIZE
                </span>
              </div>

              {prizePool && prizePool.current_participants < prizePool.required_participants && (
                <div className="animate-scale-in" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: isMobile ? '6px 12px' : '10px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))', backdropFilter: 'blur(10px)', border: '1px solid rgba(34, 197, 94, 0.3)', marginBottom: isMobile ? '12px' : '20px', fontSize: isMobile ? '10px' : '13px', fontWeight: 600, color: '#22c55e', boxShadow: '0 4px 16px rgba(34, 197, 94, 0.2)', maxWidth: '100%' }}>
                  <Sparkles style={{ width: '12px', height: '12px', flexShrink: 0 }} />
                  <span style={{ lineHeight: 1.4 }}>Prize unlocks at 2K players • {prizePool.current_participants} joined!</span>
                </div>
              )}

              <h1 style={{ fontSize: isMobile ? '28px' : '64px', fontWeight: 900, lineHeight: 1.1, marginBottom: isMobile ? '12px' : '24px', letterSpacing: '-0.02em', padding: '0 12px' }}>
                <span className="animate-shimmer" style={{ background: 'linear-gradient(90deg, #7c3aed, #22d3ee, #f97316, #d946ef, #7c3aed)', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {isMobile ? 'Live Quiz Arena' : 'The Next Generation'}<br />{!isMobile && 'Live Quiz Arena'}
                </span>
              </h1>

              <p style={{ fontSize: isMobile ? '14px' : '20px', color: '#94a3b8', maxWidth: '700px', margin: isMobile ? '0 auto 24px' : '0 auto 40px', lineHeight: 1.6, padding: '0 12px' }}>
                Compete worldwide. Show your knowledge. Earn rewards!
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '16px', alignItems: 'center', marginBottom: isMobile ? '24px' : '32px', padding: '0 12px' }}>
                <button onClick={handleJoinQuiz} style={{ position: 'relative', padding: isMobile ? '14px 24px' : '20px 48px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontSize: isMobile ? '15px' : '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', overflow: 'hidden', boxShadow: '0 20px 60px -10px rgba(139, 92, 246, 0.6)', transition: 'transform 0.2s', color: 'white', width: '100%', maxWidth: isMobile ? '100%' : '400px', justifyContent: 'center', touchAction: 'manipulation' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #7c3aed, #d946ef)' }} />
                  <Play style={{ position: 'relative', zIndex: 10, width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px' }} />
                  <span style={{ position: 'relative', zIndex: 10 }}>{isMobile ? 'Join Quiz - £1' : 'Join Live Quiz - £1 per Round'}</span>
                </button>

                <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: isMobile ? '100%' : '500px' }}>
                  <button onClick={handleFreeQuiz} style={{ padding: isMobile ? '10px 16px' : '14px 32px', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.3)', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontSize: isMobile ? '13px' : '16px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: isMobile ? '0' : 'auto', justifyContent: 'center', touchAction: 'manipulation' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)'}>
                    <Gift style={{ width: isMobile ? '16px' : '18px', height: isMobile ? '16px' : '18px' }} />
                    <span>{isMobile ? 'Free' : 'Try Free Quiz'}</span>
                  </button>

                  <button onClick={handleBuyBundle} style={{ position: 'relative', padding: isMobile ? '10px 16px' : '14px 32px', borderRadius: '12px', border: 'none', background: 'transparent', color: 'white', fontSize: isMobile ? '13px' : '16px', fontWeight: 600, cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: isMobile ? '0' : 'auto', justifyContent: 'center', touchAction: 'manipulation' }}>
                    <div className="animate-shimmer" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #06b6d4, #0891b2, #06b6d4)' }} />
                    <CreditCard style={{ position: 'relative', zIndex: 10, width: isMobile ? '16px' : '18px', height: isMobile ? '16px' : '18px' }} />
                    <span style={{ position: 'relative', zIndex: 10 }}>{isMobile ? 'Bundle' : 'Buy Bundle'}</span>
                  </button>
                </div>
              </div>

              {!user && (
                <p style={{ fontSize: isMobile ? '12px' : '15px', color: '#ef4444', fontWeight: 600, marginBottom: isMobile ? '8px' : '12px', padding: '0 12px' }}>
                  ⚠️ Sign in with Google required
                </p>
              )}

              <p style={{ fontSize: isMobile ? '12px' : '15px', color: '#64748b', padding: '0 12px' }}>
                <strong style={{ color: '#a78bfa' }}>Best Deal:</strong> 12 Rounds = £10 (Save £2!)
              </p>
            </div>

            {prizePool && (
              <div className="animate-pulse-glow animate-slide-up" style={{ padding: isMobile ? '20px 16px' : '48px', borderRadius: isMobile ? '20px' : '24px', border: '2px solid rgba(234, 179, 8, 0.3)', background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(202, 138, 4, 0.05))', backdropFilter: 'blur(20px) saturate(180%)', marginBottom: isMobile ? '32px' : '60px', boxShadow: '0 12px 48px rgba(234, 179, 8, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)', position: 'relative', overflow: 'hidden' }}>
                <div className="animate-gradient" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), transparent, rgba(234, 179, 8, 0.05))', opacity: 0.5, pointerEvents: 'none' }} />
                
                <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '32px', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? '8px' : '12px', marginBottom: isMobile ? '12px' : '16px', flexWrap: 'wrap' }}>
                    <Award style={{ width: isMobile ? '28px' : '48px', height: isMobile ? '28px' : '48px', color: '#facc15' }} />
                    <h2 style={{ fontSize: isMobile ? '20px' : '36px', fontWeight: 900, color: '#fef08a' }}>Monthly Rewards</h2>
                  </div>
                  <p style={{ fontSize: isMobile ? '13px' : '16px', color: '#cbd5e1', maxWidth: '800px', margin: '0 auto', marginBottom: isMobile ? '16px' : '20px', padding: '0 8px' }}>
                    Test your knowledge and earn rewards. Top performers win prizes!
                  </p>
                  
                  {prizePool.current_participants < prizePool.required_participants ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: isMobile ? '8px' : '10px', padding: isMobile ? '10px 16px' : '16px 32px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.15))', backdropFilter: 'blur(10px)', border: '2px solid rgba(239, 68, 68, 0.4)', fontSize: isMobile ? '11px' : '15px', fontWeight: 700, color: '#fca5a5', boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)', animation: 'pulse 2s ease-in-out infinite', maxWidth: '100%', textAlign: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <AlertCircle style={{ width: isMobile ? '18px' : '24px', height: isMobile ? '18px' : '24px', flexShrink: 0 }} />
                      <span style={{ lineHeight: 1.5 }}>
                        💰 <strong>Cash Prize Unlocks</strong> at <strong>2,000 players</strong>
                        {!isMobile && <><br />
                        <span style={{ fontSize: '13px', opacity: 0.9 }}>
                          {prizePool.current_participants} joined • {prizePool.required_participants - prizePool.current_participants} more needed!
                        </span></>}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: isMobile ? '8px' : '10px', padding: isMobile ? '10px 16px' : '16px 32px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.15))', backdropFilter: 'blur(10px)', border: '2px solid rgba(34, 197, 94, 0.4)', fontSize: isMobile ? '12px' : '15px', fontWeight: 700, color: '#86efac', boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <Check style={{ width: isMobile ? '18px' : '24px', height: isMobile ? '18px' : '24px', flexShrink: 0 }} />
                      <span>🎉 Cash Prize <strong>ACTIVATED!</strong></span>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: isMobile ? '24px' : '32px', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
                    <span style={{ fontSize: isMobile ? '12px' : '16px', fontWeight: 600, color: '#94a3b8' }}>Participants Required</span>
                    <span style={{ fontSize: isMobile ? '14px' : '20px', fontWeight: 900, color: '#facc15' }}>
                      {prizePool.current_participants} / {prizePool.required_participants}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: isMobile ? '12px' : '16px', borderRadius: '9999px', background: 'rgba(0, 0, 0, 0.3)', overflow: 'hidden' }}>
                    <div style={{ width: `${prizeProgress}%`, height: '100%', background: 'linear-gradient(to right, #eab308, #f59e0b)', borderRadius: '9999px', transition: 'width 0.5s', boxShadow: '0 0 20px rgba(234, 179, 8, 0.5)' }} />
                  </div>
                  <p style={{ fontSize: isMobile ? '10px' : '14px', color: '#64748b', marginTop: '8px', textAlign: 'center' }}>
                    {Math.round(prizeProgress)}% complete • {prizePool.required_participants - prizePool.current_participants} more needed
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: isMobile ? '12px' : '20px', position: 'relative', zIndex: 1 }}>
                  {prizeRules.map((item, i) => (
                    <div key={i} style={{ padding: isMobile ? '14px' : '20px', borderRadius: '16px', background: `rgba(${item.bg === 'green' ? '34, 197, 94' : item.bg === 'purple' ? '139, 92, 246' : '234, 179, 8'}, 0.1)`, border: `1px solid rgba(${item.bg === 'green' ? '34, 197, 94' : item.bg === 'purple' ? '139, 92, 246' : '234, 179, 8'}, 0.2)` }}>
                      <item.icon style={{ width: isMobile ? '20px' : '24px', height: isMobile ? '20px' : '24px', color: item.bg === 'green' ? '#22c55e' : item.bg === 'purple' ? '#a78bfa' : '#facc15', marginBottom: '10px' }} />
                      <h3 style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 700, marginBottom: '6px', color: 'white' }}>{item.title}</h3>
                      <p style={{ fontSize: isMobile ? '12px' : '14px', color: '#94a3b8', lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>

                <button onClick={() => setShowPrizeModal(true)} style={{ marginTop: isMobile ? '20px' : '24px', padding: isMobile ? '10px 20px' : '12px 24px', borderRadius: '12px', border: '1px solid rgba(234, 179, 8, 0.3)', background: 'transparent', color: '#facc15', fontSize: isMobile ? '13px' : '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: isMobile ? '20px auto 0' : '24px auto 0', position: 'relative', zIndex: 1, touchAction: 'manipulation', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(234, 179, 8, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <AlertCircle style={{ width: isMobile ? '16px' : '18px', height: isMobile ? '16px' : '18px' }} />
                  {isMobile ? 'View Details' : 'View Full Reward Details'}
                </button>
              </div>
            )}

            {stats && statsData.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: isMobile ? '12px' : '24px', marginBottom: isMobile ? '32px' : '60px' }}>
                {statsData.map((stat, i) => (
                  <div key={i} className="glass-card premium-card animate-slide-up" style={{ padding: isMobile ? '20px 16px' : '32px', borderRadius: '20px', textAlign: 'center', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', animationDelay: `${i * 0.1}s` }}>
                    <stat.icon style={{ width: isMobile ? '24px' : '32px', height: isMobile ? '24px' : '32px', color: stat.color, margin: '0 auto 12px', filter: `drop-shadow(0 0 10px ${stat.color}80)` }} />
                    <div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 900, color: stat.color, marginBottom: '6px', textShadow: `0 0 20px ${stat.color}60` }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: isMobile ? '13px' : '15px', color: '#94a3b8' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {champions.length > 0 && (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: isMobile ? '24px' : '36px', fontWeight: 900, marginBottom: isMobile ? '24px' : '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? '8px' : '12px', flexWrap: 'wrap' }}>
                  <Crown style={{ width: isMobile ? '24px' : '32px', height: isMobile ? '24px' : '32px', color: '#facc15', filter: 'drop-shadow(0 0 10px #facc15)' }} />
                  <span>Current Champions</span>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: isMobile ? '12px' : '24px' }}>
                  {champions.map((champ, i) => (
                    <div key={i} className="glass-card premium-card animate-slide-up" style={{ padding: isMobile ? '20px 16px' : '32px', borderRadius: '20px', textAlign: 'center', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', animationDelay: `${i * 0.15}s` }}>
                      <div className="animate-scale-in" style={{ width: isMobile ? '56px' : '72px', height: isMobile ? '56px' : '72px', margin: '0 auto 16px', borderRadius: '20px', background: champ.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 30px ${champ.color}60, 0 8px 24px rgba(0, 0, 0, 0.3)` }}>
                        <Crown style={{ width: isMobile ? '28px' : '36px', height: isMobile ? '28px' : '36px', color: 'white' }} />
                      </div>
                      <div style={{ fontSize: isMobile ? '10px' : '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '6px' }}>
                        {champ.period} Champion
                      </div>
                      <div style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 700, marginBottom: '6px', color: 'white' }}>
                        {champ.name}
                      </div>
                      <div style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: 900, color: champ.color, textShadow: `0 0 20px ${champ.color}60` }}>
                        {champ.score.toLocaleString()} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(2, 8, 23, 0.95)', backdropFilter: 'blur(20px)', padding: isMobile ? '24px 12px' : '48px 24px', textAlign: 'center', marginTop: isMobile ? '32px' : '60px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#64748b', marginBottom: isMobile ? '12px' : '16px' }}>
              © 2025 VibraXX · Powered by Sermin Limited
            </div>
            <div style={{ display: 'flex', gap: isMobile ? '16px' : '24px', justifyContent: 'center', flexWrap: 'wrap', fontSize: isMobile ? '13px' : '14px' }}>
              <a href="/privacy" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy</a>
              <a href="/terms" style={{ color: '#64748b', textDecoration: 'none' }}>Terms</a>
              <a href="/support" style={{ color: '#64748b', textDecoration: 'none' }}>Support</a>
              <a href="/prize-rules" style={{ color: '#facc15', textDecoration: 'none', fontWeight: 600 }}>Prize Rules</a>
            </div>
          </div>
        </footer>

        {show18Modal && (
          <div onClick={() => setShow18Modal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(12px)', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%', padding: isMobile ? '32px 24px' : '48px 40px', borderRadius: '24px', border: '3px solid rgba(239, 68, 68, 0.4)', background: 'linear-gradient(135deg, rgba(2, 8, 23, 0.98), rgba(10, 10, 26, 0.98))', backdropFilter: 'blur(20px)', textAlign: 'center', boxShadow: '0 0 60px rgba(239, 68, 68, 0.3)' }}>
              <AlertCircle style={{ width: '64px', height: '64px', color: '#ef4444', margin: '0 auto 24px' }} />
              <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 900, marginBottom: '16px', color: '#ef4444' }}>Age Verification Required</h2>
              <p style={{ fontSize: isMobile ? '15px' : '18px', color: '#cbd5e1', marginBottom: '24px', lineHeight: 1.6 }}>
                You must be <strong style={{ color: '#ef4444' }}>18 years or older</strong> to participate in paid quiz competitions with rewards.
              </p>
              <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '32px' }}>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
                  By confirming, you certify that you are 18+ and agree to participate in this knowledge-based quiz competition.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                <button onClick={confirm18Plus} style={{ flex: 1, padding: '16px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  ✓ I am 18 or older
                </button>
                <button onClick={() => setShow18Modal(false)} style={{ flex: 1, padding: '16px 24px', borderRadius: '12px', border: '2px solid rgba(239, 68, 68, 0.3)', background: 'transparent', color: '#ef4444', fontSize: '16px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'; }}>
                  Cancel
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '20px', lineHeight: 1.5 }}>
                Free quiz option is available for all ages without age verification.
              </p>
            </div>
          </div>
        )}

        {showPrizeModal && (
          <div onClick={() => setShowPrizeModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%', padding: isMobile ? '24px' : '40px', borderRadius: '24px', border: '2px solid rgba(234, 179, 8, 0.3)', background: 'linear-gradient(135deg, rgba(2, 8, 23, 0.98), rgba(10, 10, 26, 0.98))', backdropFilter: 'blur(20px)', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <Trophy style={{ width: '48px', height: '48px', color: '#facc15', margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 900, marginBottom: '12px' }}>Reward Distribution</h2>
                <p style={{ fontSize: '16px', color: '#94a3b8' }}>Monthly Quiz Competition Rewards</p>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#facc15' }}>Top 3 Performer Rewards</h3>
                {prizeList.map((prize, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '16px' : '20px', marginBottom: '12px', borderRadius: '12px', background: i === 0 ? 'rgba(234, 179, 8, 0.15)' : 'rgba(139, 92, 246, 0.08)', border: `2px solid ${i === 0 ? 'rgba(234, 179, 8, 0.3)' : 'rgba(139, 92, 246, 0.15)'}`, boxShadow: i === 0 ? '0 0 20px rgba(234, 179, 8, 0.2)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '28px' }}>{prize.icon}</span>
                      <div>
                        <span style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 800, color: prize.color, display: 'block', marginBottom: '4px' }}>
                          {prize.place} Place
                        </span>
                        <span style={{ fontSize: isMobile ? '13px' : '14px', color: '#94a3b8' }}>Top Performer</span>
                      </div>
                    </div>
                    <span style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: 900, color: prize.color, textAlign: 'right' }}>
                      {prize.reward}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ padding: isMobile ? '16px' : '20px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '24px' }}>
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
              <button onClick={() => setShowPrizeModal(false)} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #d946ef)', color: 'white', fontSize: '16px', fontWeight: 700, cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}