"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  Users,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowLeft,
  Zap,
  Trophy,
  Globe,
  Play,
  CheckCircle,
  Flame,
  Star,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// ============================================
// LOBBY STATE INTERFACE (KANONİK KONTRAT)
// ============================================
interface LobbyState {
  round_id: number;
  round_status: string;
  seconds_to_start: number;
  
  user_credits: number;
  user_joined: boolean;
  can_join: boolean;
  join_block_reason: string | null;
  
  should_redirect_to_quiz: boolean;
  is_urgent: boolean;
  should_play_alarm: boolean;
  should_play_beep: boolean;
  
  participants_count: number;
  spectators_count: number;
  total_range: string;
  
  recent_players: Array<{
    user_id: string;
    full_name: string;
  }>;
}

// ============================================
// LOBBY STATE HOOK (TEK KAYNAK)
// ============================================
function useLobbyState() {
  const [state, setState] = useState<LobbyState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadState = useCallback(async (): Promise<LobbyState | null> => {
    try {
      const { data, error } = await supabase.rpc('get_lobby_state');

      if (error) {
        console.error('[LobbyState] RPC error:', error);
        setHasError(true);
        return null;
      }

      if (data) {
        const freshState = data as LobbyState;
        setState(freshState);
        setHasError(false);
        return freshState;
      }
      return null;
    } catch (err) {
      console.error('[LobbyState] Error:', err);
      setHasError(true);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, 3000);
    return () => clearInterval(interval);
  }, [loadState]);

  return { state, isLoading, hasError, refresh: loadState };
}

// ============================================
// PRESENCE HOOK (KANONİK)
// ============================================
function usePresence(pageType: string, roundId: number | null) {
  const sessionIdRef = useRef<string | undefined>(undefined);
  const lastRoundIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!roundId) return;

    if (lastRoundIdRef.current !== roundId) {
      lastRoundIdRef.current = roundId;
    }

    if (!sessionIdRef.current) {
      const stored = sessionStorage.getItem('presence_session_id');
      if (stored) {
        sessionIdRef.current = stored;
      } else {
        sessionIdRef.current = crypto.randomUUID();
        sessionStorage.setItem('presence_session_id', sessionIdRef.current);
      }
    }

    const sendHeartbeat = async () => {
      try {
        await supabase.rpc('update_presence', {
          p_session_id: sessionIdRef.current,
          p_page_type: pageType,
          p_round_id: roundId
        });
      } catch (err) {
        console.error('Presence heartbeat failed:', err);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
  }, [pageType, roundId]);
}

// ============================================
// DETERMINISTIC AUDIO CONTROLLER
// ============================================
function useAudioController() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const beepRef = useRef<HTMLAudioElement | null>(null);
  const hasInteractedRef = useRef(false);
  const lastAlarmPlayedRef = useRef(false);
  const lastBeepPlayedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFirstInteraction = () => {
      if (hasInteractedRef.current) return;
      hasInteractedRef.current = true;

      if (!audioRef.current) {
        audioRef.current = new Audio('/audio/vibraxx.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
      }

      if (!alarmRef.current) {
        alarmRef.current = new Audio('/audio/alarm.mp3');
        alarmRef.current.volume = 0.6;
      }

      if (!beepRef.current) {
        beepRef.current = new Audio('/audio/beep.mp3');
        beepRef.current.volume = 0.4;
      }

      const musicPref = localStorage.getItem('vibraxx_lobby_music');
      if (musicPref !== 'false') {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
        localStorage.setItem('vibraxx_lobby_music', 'true');
      }
    };

    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(() => {});
      localStorage.setItem('vibraxx_lobby_music', 'true');
    } else {
      audioRef.current.pause();
      localStorage.setItem('vibraxx_lobby_music', 'false');
    }
  }, [isPlaying]);

  const toggleMusic = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const playAlarm = useCallback((shouldPlay: boolean) => {
    if (!shouldPlay) {
      lastAlarmPlayedRef.current = false;
      return;
    }

    if (lastAlarmPlayedRef.current) return;
    lastAlarmPlayedRef.current = true;

    if (alarmRef.current && isPlaying) {
      alarmRef.current.currentTime = 0;
      alarmRef.current.play().catch(() => {});
    }
  }, [isPlaying]);

  const playBeep = useCallback((shouldPlay: boolean) => {
    if (!shouldPlay) {
      lastBeepPlayedRef.current = false;
      return;
    }

    if (lastBeepPlayedRef.current) return;
    lastBeepPlayedRef.current = true;

    if (beepRef.current && isPlaying) {
      beepRef.current.currentTime = 0;
      beepRef.current.play().catch(() => {});
    }
  }, [isPlaying]);

  return { isPlaying, toggleMusic, playAlarm, playBeep };
}

// ============================================
// PLAYER CARD COMPONENT
// ============================================
const PlayerCard = memo(({ player, index }: { player: { user_id: string; full_name: string }; index: number }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 12,
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      animation: `slideIn 0.4s ease-out ${index * 0.05}s backwards`,
      transition: 'all 0.2s',
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #7c3aed, #d946ef)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 16,
        color: 'white',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
      }}
    >
      {player.full_name.charAt(0).toUpperCase()}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'white',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {player.full_name}
      </div>
      <div style={{ fontSize: 12, color: '#6b7280' }}>Just joined</div>
    </div>
    <div
      style={{
        padding: '4px 8px',
        borderRadius: 6,
        background: 'rgba(34, 197, 94, 0.15)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
      }}
    >
      <CheckCircle style={{ width: 14, height: 14, color: '#22c55e' }} />
    </div>
  </div>
));
PlayerCard.displayName = 'PlayerCard';

// ============================================
// MAIN LOBBY PAGE
// ============================================
export default function LobbyPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const mountedRef = useRef(false);

  const { state, isLoading, hasError, refresh } = useLobbyState();
  const { isPlaying, toggleMusic, playAlarm, playBeep } = useAudioController();

  usePresence('lobby', state?.round_id || null);

  const countdownSeconds = state?.seconds_to_start ?? 0;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/');
        return;
      }
      setUser(data.user);
    };
    loadUser();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/');
        return;
      }
      setUser(session?.user || null);
    });

    return () => sub.subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (state?.should_redirect_to_quiz && !isRedirecting) {
      setIsRedirecting(true);
      router.push(`/quiz/${state.round_id}`);
    }
  }, [state?.should_redirect_to_quiz, state?.round_id, isRedirecting, router]);

  useEffect(() => {
    if (!state) return;
    playAlarm(state.should_play_alarm);
  }, [state?.should_play_alarm, playAlarm, state]);

  useEffect(() => {
    if (!state) return;
    playBeep(state.should_play_beep);
  }, [state?.should_play_beep, playBeep, state]);

  const handleJoinRound = async () => {
    if (!state || !state.can_join) return;

    try {
      const { data, error } = await supabase.rpc('join_live_round', {
        p_round_id: state.round_id
      });

      if (error) {
        console.error('[JoinRound] Error:', error);
        return;
      }

      const response = data as { success: boolean; error?: string };

      if (!response.success) {
        if (response.error === 'No credits available') {
          alert('You have no rounds left. Redirecting to purchase page...');
          setTimeout(() => router.push('/buy'), 1500);
        }
        return;
      }

      await refresh();
    } catch (err) {
      console.error('[JoinRound] Error:', err);
    }
  };

  const formatTime = useCallback((seconds: number) => {
    const safe = Math.max(0, Math.floor(seconds));
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', background: '#020817', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, margin: '0 auto 16px', borderRadius: '50%', border: '3px solid rgba(139, 92, 246, 0.3)', borderTopColor: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: 16, color: '#94a3b8', fontWeight: 500 }}>Loading Arena...</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div style={{ minHeight: '100vh', background: '#020817', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 20px' }}>
          <AlertCircle style={{ width: 64, height: 64, color: '#ef4444', margin: '0 auto 24px' }} />
          <div style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 12 }}>Connection Issue</div>
          <div style={{ fontSize: 16, color: '#94a3b8', marginBottom: 24, lineHeight: 1.6 }}>
            Temporary connection problem. Retrying automatically...
          </div>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #d946ef)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div style={{ minHeight: '100vh', background: '#020817', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 20px' }}>
          <Globe style={{ width: 64, height: 64, color: '#8b5cf6', margin: '0 auto 24px' }} />
          <div style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 12 }}>No Active Round</div>
          <div style={{ fontSize: 16, color: '#94a3b8', marginBottom: 24 }}>Waiting for next round to be scheduled...</div>
          <button onClick={() => router.push('/')} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #d946ef)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        :root {
          color-scheme: dark;
          background-color: #020817;
        }

        * {
          box-sizing: border-box;
        }

        body {
          background-color: #020817;
          margin: 0;
          padding: 0;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 rgba(139, 92, 246, 0); }
          50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.6); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes countdownPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .vx-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
        }

        @media (min-width: 640px) {
          .vx-container {
            padding: 0 24px;
          }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#020817', position: 'relative', overflow: 'hidden' }}>
        {/* Animated Background Orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '15%', left: '10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)', animation: 'float 6s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '50%', right: '10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(217, 70, 239, 0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)', animation: 'float 8s ease-in-out infinite', animationDelay: '1s' }} />
          <div style={{ position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)', width: 550, height: 550, background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)', animation: 'float 7s ease-in-out infinite', animationDelay: '2s' }} />
        </div>

        {/* Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', background: 'rgba(2, 8, 23, 0.9)' }}>
          <div className="vx-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)' }}>
                  <Zap style={{ width: 24, height: 24, color: 'white' }} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>VibraXX</div>
                  <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Arena Lobby</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={toggleMusic} style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)', color: isPlaying ? '#22d3ee' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} aria-label={isPlaying ? 'Mute music' : 'Play music'}>
                  {isPlaying ? <Volume2 style={{ width: 18, height: 18 }} /> : <VolumeX style={{ width: 18, height: 18 }} />}
                </button>

                <div style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(251, 191, 36, 0.3)', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles style={{ width: 14, height: 14 }} />
                  {state.user_credits} Rounds
                </div>

                <button onClick={() => router.push('/')} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ArrowLeft style={{ width: 16, height: 16 }} />
                  Exit
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Ultra Premium Sponsor Banner */}
        <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))', backdropFilter: 'blur(10px)' }}>
          <div className="vx-container">
            <div style={{ padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sponsored By</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: 0.6 }}>
                <div style={{ width: 100, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star style={{ width: 20, height: 20, color: '#8b5cf6' }} />
                </div>
                <div style={{ width: 100, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star style={{ width: 20, height: 20, color: '#22d3ee' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Status Bar */}
        <div style={{ zIndex: 40, borderBottom: '1px solid rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(16px)', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(217, 70, 239, 0.15))', animation: state.is_urgent ? 'pulse-glow 1s ease-in-out infinite' : 'none' }}>
          <div className="vx-container">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', alignItems: 'center', padding: '10px 0', fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', fontWeight: 700 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse-glow 2s ease-in-out infinite' }} />
                LIVE ARENA
              </div>
              <div style={{ color: '#94a3b8', fontWeight: 500 }}>•</div>
              <div style={{ color: '#94a3b8', fontWeight: 500 }}>{state.participants_count} Players Joined</div>
              <div style={{ color: '#94a3b8', fontWeight: 500 }}>•</div>
              <div style={{ color: '#fbbf24', fontWeight: 600 }}>Round #{state.round_id}</div>
            </div>
          </div>
        </div>

        <main style={{ position: 'relative', zIndex: 10, padding: '40px 0 60px' }}>
          <div className="vx-container">
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: 48, animation: 'slideIn 0.6s ease-out' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 9999, border: '2px solid rgba(251, 191, 36, 0.4)', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))', color: '#fbbf24', fontSize: 12, marginBottom: 20, backdropFilter: 'blur(10px)', fontWeight: 700, boxShadow: '0 0 20px rgba(251, 191, 36, 0.3), inset 0 0 20px rgba(251, 191, 36, 0.1)' }}>
                <Globe style={{ width: 16, height: 16 }} />
                Global Live Arena
              </div>

              <h1 style={{ fontSize: 'clamp(32px, 7vw, 52px)', fontWeight: 800, lineHeight: 1.2, marginBottom: 20, letterSpacing: '-0.03em', color: 'white' }}>
                <span style={{ display: 'inline-block', background: 'linear-gradient(90deg, #7c3aed, #22d3ee, #f97316, #d946ef, #7c3aed)', backgroundSize: '250% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'shimmer 4s linear infinite', textShadow: '0 0 20px rgba(124, 58, 237, 0.5)' }}>
                  Prepare for Battle
                </span>
              </h1>

              <p style={{ fontSize: 'clamp(15px, 3.5vw, 18px)', color: '#cbd5e1', maxWidth: 600, margin: '0 auto 16px', lineHeight: 1.7, fontWeight: 500 }}>
                Challenge yourself. Challenge the world.
              </p>

              <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
                {state.user_joined 
                  ? "You're locked in! The quiz starts when the countdown ends."
                  : "Join now to compete for prizes and glory."}
              </p>
            </div>

            {/* Premium Countdown Panel */}
            <div style={{ 
              margin: '32px auto 48px', 
              maxWidth: 520, 
              padding: state.is_urgent ? '24px 32px 32px' : '32px', 
              borderRadius: 24, 
              background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', 
              border: state.is_urgent ? '3px solid rgba(239, 68, 68, 0.6)' : '2px solid rgba(255, 255, 255, 0.15)', 
              backdropFilter: 'blur(20px)', 
              boxShadow: state.is_urgent 
                ? '0 20px 60px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3)' 
                : '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 2px 0 rgba(255, 255, 255, 0.08)', 
              position: 'relative', 
              overflow: 'hidden', 
              animation: state.is_urgent ? 'countdownPulse 1s ease-in-out infinite' : 'slideIn 0.6s ease-out 0.2s backwards',
            }}>
              {state.is_urgent && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '10px', background: 'rgba(239, 68, 68, 0.25)', borderBottom: '1px solid rgba(239, 68, 68, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#ef4444', animation: 'pulse-glow 1s ease-in-out infinite' }}>
                  <Flame style={{ width: 16, height: 16 }} />
                  QUIZ STARTING SOON!
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6b7280', textAlign: 'center' }}>
                  {state.user_joined ? 'Quiz Starts In' : 'Join Before'}
                </div>
                
                <div style={{ 
                  fontSize: 'clamp(56px, 15vw, 80px)', 
                  fontWeight: 900, 
                  background: state.is_urgent 
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                    : 'linear-gradient(135deg, #7c3aed, #22d3ee)', 
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textAlign: 'center', 
                  letterSpacing: '-0.02em', 
                  fontVariantNumeric: 'tabular-nums', 
                  lineHeight: 1,
                  filter: state.is_urgent ? 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.6))' : 'drop-shadow(0 0 20px rgba(124, 58, 237, 0.5))',
                }}>
                  {formatTime(countdownSeconds)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
                  <Clock style={{ width: 16, height: 16, color: state.is_urgent ? '#ef4444' : '#8b5cf6' }} />
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{state.spectators_count}</span>
                  <span>watching live</span>
                </div>
              </div>
            </div>

            {/* Join Button or Status */}
            {!state.user_joined ? (
              <div style={{ marginBottom: 48, textAlign: 'center', animation: 'slideIn 0.6s ease-out 0.3s backwards' }}>
                <button
                  onClick={handleJoinRound}
                  disabled={!state.can_join}
                  style={{
                    position: 'relative',
                    padding: '18px 48px',
                    borderRadius: 14,
                    border: 'none',
                    cursor: state.can_join ? 'pointer' : 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    fontWeight: 700,
                    fontSize: 18,
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    opacity: state.can_join ? 1 : 0.5,
                    boxShadow: state.can_join ? '0 20px 40px -16px rgba(139, 92, 246, 0.6)' : 'none',
                  }}
                  onMouseEnter={(e) => state.can_join && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #7c3aed, #d946ef)' }} />
                  <Play style={{ position: 'relative', zIndex: 10, width: 20, height: 20, color: 'white' }} />
                  <span style={{ position: 'relative', zIndex: 10, color: 'white' }}>
                    {state.join_block_reason === 'no_credits' ? 'No Rounds Left' : 'Join Arena'}
                  </span>
                </button>
                {state.join_block_reason === 'no_credits' && (
                  <div style={{ marginTop: 16, fontSize: 14, color: '#94a3b8' }}>
                    <button onClick={() => router.push('/buy')} style={{ color: '#fbbf24', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                      Buy more rounds
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: 48, padding: '20px 32px', borderRadius: 16, background: 'rgba(34, 197, 94, 0.15)', border: '2px solid rgba(34, 197, 94, 0.4)', textAlign: 'center', boxShadow: '0 8px 24px rgba(34, 197, 94, 0.2)', animation: 'slideIn 0.6s ease-out 0.3s backwards' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 16, fontWeight: 700, color: '#22c55e' }}>
                  <Trophy style={{ width: 22, height: 22 }} />
                  YOU'RE IN! GET READY...
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 48, animation: 'slideIn 0.6s ease-out 0.4s backwards' }}>
              <div style={{ padding: 24, borderRadius: 16, background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))', border: '1px solid rgba(139, 92, 246, 0.3)', textAlign: 'center', transition: 'all 0.3s' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 8 }}>{state.participants_count}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</div>
              </div>
              <div style={{ padding: 24, borderRadius: 16, background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(34, 211, 238, 0.05))', border: '1px solid rgba(34, 211, 238, 0.3)', textAlign: 'center', transition: 'all 0.3s' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 8 }}>{state.spectators_count}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Watching</div>
              </div>
              <div style={{ padding: 24, borderRadius: 16, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center', transition: 'all 0.3s' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 8 }}>{state.total_range}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Range</div>
              </div>
            </div>

            {/* Recent Players */}
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 24, padding: 32, border: '1px solid rgba(139, 92, 246, 0.3)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)', animation: 'slideIn 0.6s ease-out 0.5s backwards' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Users style={{ width: 24, height: 24, color: '#8b5cf6' }} />
                <h3 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'white' }}>Recent Joins</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
                {state.recent_players.length === 0 ? (
                  <div style={{ padding: 48, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                    Waiting for players to join...
                  </div>
                ) : (
                  state.recent_players.map((player, idx) => (
                    <PlayerCard key={player.user_id} player={player} index={idx} />
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}