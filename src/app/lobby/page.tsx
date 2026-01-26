"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Users,
  Clock,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  ArrowLeft,
  Shield,
  Zap,
  Trophy,
  Globe,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

// ============================================
// 🎯 PRESENCE TRACKING HOOK (KANONİK)
// ============================================
function usePresence(pageType: string, roundId: number | null = null) {
  const sessionIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') return;

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
        console.error('[Presence] Heartbeat failed:', err);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
  }, [pageType, roundId]);
}

// ============================================
// 🎯 ORGANIC PLAYER COUNT (KANONİK)
// ============================================
interface PlayerCountData {
  participants: number;
  spectators: number;
  displayRange: string;
}

function useOrganicPlayerCount(roundId: number | null) {
  const [counts, setCounts] = useState<PlayerCountData>({
    participants: 0,
    spectators: 0,
    displayRange: '0-50'
  });

  useEffect(() => {
    if (!roundId) return;

    async function loadCounts() {
      try {
        // Participants
        const { count: participants } = await supabase
          .from('round_participants')
          .select('*', { count: 'exact', head: true })
          .eq('round_id', roundId)
          .eq('source', 'live');

        // Spectators
        const { data: spectators } = await supabase
          .rpc('get_presence_count', {
            p_page_type: 'lobby',
            p_round_id: roundId
          });

        const p = participants || 0;
        const s = spectators || 0;
        const total = p + s;

        const rangeMin = Math.floor(total / 50) * 50;
        const rangeMax = rangeMin + 50;

        setCounts({
          participants: p,
          spectators: s,
          displayRange: `${rangeMin}-${rangeMax}`
        });
      } catch (err) {
        console.error('[PlayerCount] Error:', err);
      }
    }

    loadCounts();
    const interval = setInterval(loadCounts, 5000);

    const channel = supabase
      .channel(`players:${roundId}:live`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'round_participants',
        filter: `round_id=eq.${roundId}`
      }, loadCounts)
      .subscribe();

    return () => {
      clearInterval(interval);
      channel.unsubscribe();
    };
  }, [roundId]);

  return counts;
}

// ============================================
// 🎯 PUBLIC PROFILES FOR PLAYER LIST (KANONİK)
// ============================================
interface PublicPlayer {
  user_id: string;
  full_name: string;
  joined_at: string;
}

function useRecentPlayers(roundId: number | null, limit: number = 12) {
  const [players, setPlayers] = useState<PublicPlayer[]>([]);

  useEffect(() => {
    if (!roundId) return;

    async function loadPlayers() {
      try {
        const { data } = await supabase
          .from('round_participants')
          .select(`
            user_id,
            joined_at,
            profiles!inner(full_name)
          `)
          .eq('round_id', roundId)
          .eq('source', 'live')
          .order('joined_at', { ascending: false })
          .limit(limit);

        if (data) {
          const mapped = data.map((p: any) => ({
            user_id: p.user_id,
            full_name: p.profiles?.full_name || 'Player',
            joined_at: p.joined_at
          }));
          setPlayers(mapped);
        }
      } catch (err) {
        console.error('[RecentPlayers] Error:', err);
      }
    }

    loadPlayers();
    const interval = setInterval(loadPlayers, 5000);

    return () => clearInterval(interval);
  }, [roundId, limit]);

  return players;
}

export default function LobbyPage() {
  const router = useRouter();

  // Core State
  const [isPlaying, setIsPlaying] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userCredits, setUserCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  // Round State
  const [nextRound, setNextRound] = useState<any>(null);
  const [timeUntilStart, setTimeUntilStart] = useState<number>(0);

  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const countdownBeepRef = useRef<HTMLAudioElement | null>(null);
  const hasInteractedRef = useRef(false);

  // 🎯 PRESENCE TRACKING
  usePresence('lobby', nextRound?.id || null);

  // 🎯 ORGANIC DATA
  const { participants, spectators, displayRange } = useOrganicPlayerCount(nextRound?.id);
  const recentPlayers = useRecentPlayers(nextRound?.id);

  // ============================================
  // AUDIO INITIALIZATION
  // ============================================
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFirstInteraction = () => {
      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true;

        if (!audioRef.current) {
          audioRef.current = new Audio("/audio/lobby-music.mp3");
          audioRef.current.loop = true;
          audioRef.current.volume = 0.3;
        }

        if (!alarmRef.current) {
          alarmRef.current = new Audio("/audio/alarm.mp3");
          alarmRef.current.volume = 0.6;
        }

        if (!countdownBeepRef.current) {
          countdownBeepRef.current = new Audio("/audio/beep.mp3");
          countdownBeepRef.current.volume = 0.4;
        }

        const musicPref = localStorage.getItem("vibraxx_lobby_music");
        if (musicPref !== "false") {
          setIsPlaying(true);
          audioRef.current?.play().catch(() => {});
        }
      }
    };

    document.addEventListener("click", handleFirstInteraction, { once: true });
    document.addEventListener("touchstart", handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {});
      localStorage.setItem("vibraxx_lobby_music", "true");
    } else if (audioRef.current) {
      audioRef.current.pause();
      localStorage.setItem("vibraxx_lobby_music", "false");
    }
  }, [isPlaying]);

  // ============================================
  // AUTH CHECK
  // ============================================
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/");
        return;
      }
      setUser(data.user);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  // ============================================
  // FETCH USER CREDITS
  // ============================================
  const fetchUserCredits = useCallback(async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from("user_credits")
        .select("live_credits")
        .eq("user_id", user.id)
        .single();

      setUserCredits(data?.live_credits || 0);
    } catch (err) {
      console.error("[Credits] Error:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchUserCredits();
  }, [user, fetchUserCredits]);

  // ============================================
  // FETCH NEXT ROUND
  // ============================================
  const loadNextRound = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("rounds")
        .select("id, scheduled_start, status")
        .eq("status", "scheduled")
        .order("scheduled_start", { ascending: true })
        .limit(1)
        .single();

      if (data) {
        setNextRound(data);

        const scheduledStart = new Date(data.scheduled_start).getTime();
        const now = Date.now();
        const seconds = Math.floor((scheduledStart - now) / 1000);

        if (Number.isFinite(seconds)) {
          setTimeUntilStart(Math.max(0, seconds));
        }
      }
    } catch (err) {
      console.error("[NextRound] Error:", err);
    }
  }, []);

  useEffect(() => {
    loadNextRound();
    const interval = setInterval(loadNextRound, 5000);
    return () => clearInterval(interval);
  }, [loadNextRound]);

  // ============================================
  // COUNTDOWN TIMER
  // ============================================
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilStart((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ============================================
  // CHECK IF ALREADY JOINED
  // ============================================
  useEffect(() => {
    if (!user || !nextRound) return;

    const checkJoinedStatus = async () => {
      try {
        const { data } = await supabase
          .from("round_participants")
          .select("round_id")
          .eq("round_id", nextRound.id)
          .eq("user_id", user.id)
          .eq("source", "live")
          .maybeSingle();

        if (data) {
          setHasJoined(true);
        }
      } catch (err) {
        console.error("[CheckJoined] Error:", err);
      }
    };

    checkJoinedStatus();
  }, [user, nextRound]);

  // ============================================
  // WARNING & SOUND EFFECTS
  // ============================================
  useEffect(() => {
    if (timeUntilStart === 10) {
      setShowWarning(true);
      if (isPlaying && alarmRef.current) {
        alarmRef.current.currentTime = 0;
        alarmRef.current.play().catch(() => {});
      }
    }

    if (timeUntilStart <= 10 && timeUntilStart > 0) {
      if (isPlaying && countdownBeepRef.current) {
        countdownBeepRef.current.currentTime = 0;
        countdownBeepRef.current.play().catch(() => {});
      }
    }

    if (timeUntilStart > 10) {
      setShowWarning(false);
    }
  }, [timeUntilStart, isPlaying]);

  // ============================================
  // AUTO START WHEN COUNTDOWN ENDS
  // ============================================
  useEffect(() => {
    if (
      timeUntilStart <= 0 &&
      nextRound?.status === "scheduled" &&
      !isRedirecting &&
      hasJoined
    ) {
      handleStartGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeUntilStart, nextRound?.status, isRedirecting, hasJoined]);

  // ============================================
  // 🎯 JOIN ROUND (KANONİK)
  // ============================================
  const handleJoinRound = async () => {
    if (!nextRound || !user || hasJoined) return;

    try {
      const { data, error } = await supabase.rpc('join_live_round', {
        p_round_id: nextRound.id
      });

      if (error) {
        console.error('[JoinRound] RPC error:', error);
        return;
      }

      const response = data as { success: boolean; error?: string };

      if (!response.success) {
        if (response.error === 'No credits available') {
          alert('You have no rounds left. Redirecting to purchase page...');
          setTimeout(() => router.push('/buy'), 1500);
        } else if (response.error === 'Already joined') {
          setHasJoined(true);
        }
        return;
      }

      setHasJoined(true);
      await fetchUserCredits();
    } catch (err: any) {
      console.error('[JoinRound] Error:', err);
    }
  };

  // ============================================
  // START GAME
  // ============================================
  const handleStartGame = async () => {
    if (isRedirecting) return;
    setIsRedirecting(true);

    console.log("[Lobby] Quiz starting, redirecting...");
    router.push(`/quiz/${nextRound.id}`);
  };

  // ============================================
  // HANDLE BACK
  // ============================================
  const handleBack = async () => {
    console.log("[Lobby] User left lobby");
    router.push("/");
  };

  // ============================================
  // FORMAT TIME
  // ============================================
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ============================================
  // PROGRESS CALCULATION
  // ============================================
  const progress = ((300 - Math.max(Math.min(timeUntilStart, 300), 0)) / 300) * 100;

  // ============================================
  // STATUS COLOR
  // ============================================
  const getStatusColor = () => {
    if (timeUntilStart <= 10) return "#ef4444";
    if (timeUntilStart <= 30) return "#f59e0b";
    return "#22c55e";
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (isLoading || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "white" }}>
          <div
            style={{
              width: 48,
              height: 48,
              margin: "0 auto 16px",
              border: "3px solid rgba(139, 92, 246, 0.3)",
              borderTopColor: "#8b5cf6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ fontSize: 14, color: "#94a3b8" }}>Loading lobby...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

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
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes neonPulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.6),
              0 0 40px rgba(139, 92, 246, 0.4),
              inset 0 0 20px rgba(139, 92, 246, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(217, 70, 239, 0.9),
              0 0 60px rgba(217, 70, 239, 0.6),
              inset 0 0 30px rgba(217, 70, 239, 0.3);
          }
        }

        @keyframes warningPulse {
          0%, 100% {
            opacity: 0.25;
          }
          50% {
            opacity: 0.45;
          }
        }

        @keyframes glow {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }

        .hide-on-small {
          display: inline;
        }

        @media (max-width: 480px) {
          .hide-on-small {
            display: none;
          }
        }

        * {
          box-sizing: border-box;
        }

        body {
          overflow-x: hidden;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated Background Orbs */}
        <div
          className="animate-float"
          style={{
            position: "fixed",
            top: "-150px",
            left: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent)",
            filter: "blur(90px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          className="animate-float"
          style={{
            position: "fixed",
            bottom: "-150px",
            right: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(217, 70, 239, 0.4), transparent)",
            filter: "blur(90px)",
            pointerEvents: "none",
            zIndex: 0,
            animationDelay: "2s",
          }}
        />

        {/* RED WARNING Overlay */}
        {showWarning && timeUntilStart <= 10 && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: `radial-gradient(circle, rgba(239, 68, 68, 0.25), transparent)`,
              pointerEvents: "none",
              zIndex: 40,
              animation: "warningPulse 0.6s ease-in-out infinite",
            }}
          />
        )}

        {/* Top Header Bar */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              padding: "clamp(14px, 3.6vw, 19px) clamp(19px, 4.8vw, 38px)",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Left: Back Button */}
              <button
                onClick={handleBack}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(148, 163, 253, 0.3)",
                  background: "rgba(15, 23, 42, 0.8)",
                  color: "white",
                  fontSize: "clamp(13px, 2.5vw, 15px)",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s",
                  zIndex: 21,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(139, 92, 246, 0.2)";
                  e.currentTarget.style.transform = "translateX(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(15, 23, 42, 0.8)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <ArrowLeft style={{ width: 18, height: 18 }} />
                <span className="hide-on-small">Back</span>
              </button>

              {/* Right: Credits + Sound Toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", zIndex: 21 }}>
                {/* Credits Display */}
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(251, 191, 36, 0.4)",
                    background: "rgba(251, 191, 36, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Shield style={{ width: 18, height: 18, color: "#fbbf24" }} />
                  <span
                    style={{
                      fontSize: "clamp(13px, 2.5vw, 15px)",
                      fontWeight: 700,
                      color: "#fbbf24",
                    }}
                  >
                    {userCredits} Rounds
                  </span>
                </div>

                {/* Sound Toggle */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    padding: "11px",
                    borderRadius: "12px",
                    border: "1px solid rgba(148, 163, 253, 0.3)",
                    background: "rgba(15, 23, 42, 0.8)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(15, 23, 42, 0.8)";
                  }}
                >
                  {isPlaying ? (
                    <Volume2 style={{ width: 20, height: 20, color: "#a78bfa" }} />
                  ) : (
                    <VolumeX style={{ width: 20, height: 20, color: "#6b7280" }} />
                  )}
                </button>
              </div>
            </div>

            {/* Center: Logo + GLOBAL ARENA Text */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                gap: "clamp(12px, 3vw, 16px)",
              }}
            >
              {/* Logo */}
              <div
                style={{
                  position: "relative",
                  width: "clamp(70px, 14vw, 90px)",
                  height: "clamp(70px, 14vw, 90px)",
                  borderRadius: "50%",
                  padding: 3,
                  background: "linear-gradient(135deg, #7c3aed, #d946ef)",
                  boxShadow:
                    "0 0 30px rgba(124, 58, 237, 0.7), 0 0 60px rgba(217, 70, 239, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <div
                  className="animate-glow"
                  style={{
                    position: "absolute",
                    inset: -5,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #a855f7, transparent)",
                    opacity: 0.5,
                    filter: "blur(10px)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    backgroundColor: "#020817",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                  }}
                >
                  <Image
                    src="/images/logo.png"
                    alt="VibraXX"
                    fill
                    sizes="90px"
                    style={{ objectFit: "contain", padding: "5px" }}
                    priority
                  />
                </div>
              </div>

              {/* GLOBAL ARENA Text */}
              <div>
                <div
                  style={{
                    fontSize: "clamp(16px, 3.5vw, 22px)",
                    fontWeight: 900,
                    backgroundImage: "linear-gradient(135deg, #a78bfa, #f0abfc)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    lineHeight: 1.2,
                    textShadow: "0 0 20px rgba(167, 139, 250, 0.5)",
                  }}
                >
                  GLOBAL ARENA
                </div>
                {spectators > 0 && (
                  <div
                    style={{
                      fontSize: "clamp(10px, 2vw, 12px)",
                      color: "#94a3b8",
                      fontWeight: 600,
                      marginTop: "2px",
                    }}
                  >
                    {spectators} online
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "clamp(24px, 5vw, 40px) clamp(16px, 4vw, 32px)",
          }}
        >
          {/* ULTRA PREMIUM Sponsor Banner */}
          <div
            style={{
              marginBottom: "clamp(24px, 5vw, 36px)",
              padding: "clamp(20px, 4vw, 32px)",
              borderRadius: "24px",
              background:
                "linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.18) 50%, rgba(234, 88, 12, 0.15) 100%)",
              border: "3px solid transparent",
              backgroundImage: `
                linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.18) 50%, rgba(234, 88, 12, 0.15) 100%),
                linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)
              `,
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
              backdropFilter: "blur(24px)",
              position: "relative",
              overflow: "hidden",
              boxShadow:
                "0 0 40px rgba(251, 191, 36, 0.4), 0 10px 60px rgba(251, 191, 36, 0.25), inset 0 0 50px rgba(251, 191, 36, 0.08)",
              minHeight: "clamp(120px, 20vw, 180px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "neonPulse 4s ease-in-out infinite",
            }}
          >
            {/* Animated gradient overlay */}
            <div
              style={{
                position: "absolute",
                top: "-50%",
                left: "-50%",
                width: "200%",
                height: "200%",
                background:
                  "conic-gradient(from 0deg, transparent, rgba(251, 191, 36, 0.3), transparent 30%)",
                animation: "spin 8s linear infinite",
                pointerEvents: "none",
              }}
            />

            {/* Shimmer effect 1 */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "50%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)",
                animation: "shimmer 3s infinite",
                pointerEvents: "none",
              }}
            />

            {/* Shimmer effect 2 (delayed) */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "30%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.4), transparent)",
                animation: "shimmer 4s infinite 1.5s",
                pointerEvents: "none",
              }}
            />

            {/* Glow particles */}
            <div
              style={{
                position: "absolute",
                top: "20%",
                left: "10%",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#fbbf24",
                boxShadow: "0 0 20px #fbbf24",
                animation: "float 5s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "70%",
                right: "15%",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#f59e0b",
                boxShadow: "0 0 15px #f59e0b",
                animation: "float 6s ease-in-out infinite 1s",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "40%",
                right: "25%",
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#fbbf24",
                boxShadow: "0 0 12px #fbbf24",
                animation: "float 7s ease-in-out infinite 2s",
                pointerEvents: "none",
              }}
            />

            {/* Content container */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: "clamp(120px, 20vw, 180px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "clamp(12px, 2.5vw, 16px)",
                zIndex: 10,
              }}
            >
              {/* Premium badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 16px",
                  borderRadius: "999px",
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(251, 191, 36, 0.6)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 4px 20px rgba(251, 191, 36, 0.3)",
                }}
              >
                <Sparkles style={{ width: 14, height: 14, color: "#fbbf24" }} />
                <span
                  style={{
                    fontSize: "clamp(10px, 2vw, 12px)",
                    fontWeight: 700,
                    color: "#fbbf24",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    textShadow: "0 0 10px rgba(251, 191, 36, 0.5)",
                  }}
                >
                  Official Sponsor
                </span>
                <Sparkles style={{ width: 14, height: 14, color: "#fbbf24" }} />
              </div>

              {/* Sponsor image with fallback */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "clamp(300px, 60vw, 600px)",
                  height: "clamp(80px, 15vw, 120px)",
                }}
              >
                <Image
                  src="/images/sponsor.png"
                  alt="Official Sponsor"
                  fill
                  sizes="(max-width: 768px) 300px, 600px"
                  style={{
                    objectFit: "contain",
                    filter: "drop-shadow(0 0 20px rgba(251, 191, 36, 0.3))",
                  }}
                  priority
                  onError={(e) => {
                    const img = e.currentTarget;
                    const container = img.parentElement as HTMLDivElement;
                    if (container) {
                      container.innerHTML = `
                        <div style="
                          width: 100%;
                          height: 100%;
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                          gap: 12px;
                        ">
                          <div style="
                            font-size: clamp(24px, 5vw, 36px);
                            font-weight: 900;
                            background: linear-gradient(135deg, #fbbf24, #f59e0b);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            text-shadow: 0 0 30px rgba(251, 191, 36, 0.5);
                          ">
                            PREMIUM SPONSOR
                          </div>
                          <div style="
                            font-size: clamp(12px, 2.5vw, 15px);
                            color: #cbd5e1;
                            font-weight: 600;
                          ">
                            Powering Global Competition
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
              </div>

              {/* Subtitle */}
              <div
                style={{
                  fontSize: "clamp(11px, 2.2vw, 13px)",
                  color: "#e0e7ff",
                  fontWeight: 600,
                  textAlign: "center",
                  maxWidth: "500px",
                  lineHeight: 1.4,
                  textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                }}
              >
                Supporting skill-based competition worldwide
              </div>
            </div>

            {/* Corner accents */}
            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                width: "40px",
                height: "40px",
                borderTop: "3px solid rgba(251, 191, 36, 0.6)",
                borderLeft: "3px solid rgba(251, 191, 36, 0.6)",
                borderRadius: "8px 0 0 0",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "40px",
                height: "40px",
                borderTop: "3px solid rgba(251, 191, 36, 0.6)",
                borderRight: "3px solid rgba(251, 191, 36, 0.6)",
                borderRadius: "0 8px 0 0",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                left: "10px",
                width: "40px",
                height: "40px",
                borderBottom: "3px solid rgba(251, 191, 36, 0.6)",
                borderLeft: "3px solid rgba(251, 191, 36, 0.6)",
                borderRadius: "0 0 0 8px",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                width: "40px",
                height: "40px",
                borderBottom: "3px solid rgba(251, 191, 36, 0.6)",
                borderRight: "3px solid rgba(251, 191, 36, 0.6)",
                borderRadius: "0 0 8px 0",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Prize Banner */}
          <div
            style={{
              marginBottom: "clamp(24px, 5vw, 36px)",
              padding: "clamp(16px, 3.5vw, 28px)",
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, rgba(251, 191, 36, 0.18), rgba(245, 158, 11, 0.12))",
              border: "2px solid rgba(251, 191, 36, 0.5)",
              backdropFilter: "blur(20px)",
              position: "relative",
              overflow: "hidden",
              animation: "slideIn 0.5s ease-out",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
                animation: "shimmer 3s linear infinite",
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "clamp(12px, 3vw, 18px)",
                flexWrap: "wrap",
              }}
            >
              <Trophy style={{ width: "clamp(28px, 6vw, 38px)", height: "clamp(28px, 6vw, 38px)", color: "#fbbf24" }} />
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "clamp(18px, 4.5vw, 28px)",
                    fontWeight: 900,
                    color: "#fbbf24",
                    textShadow: "0 0 20px rgba(251, 191, 36, 0.6)",
                    lineHeight: 1.2,
                  }}
                >
                  £1,000 MONTHLY PRIZE
                </div>
                <div
                  style={{
                    fontSize: "clamp(12px, 2.5vw, 15px)",
                    color: "#cbd5e1",
                    marginTop: "4px",
                    fontWeight: 600,
                  }}
                >
                  Top scorer wins when 3000+ rounds sold
                </div>
              </div>
              <Sparkles style={{ width: "clamp(28px, 6vw, 38px)", height: "clamp(28px, 6vw, 38px)", color: "#fbbf24" }} />
            </div>
          </div>

          {/* Main Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
              gap: "clamp(20px, 4vw, 32px)",
            }}
          >
            {/* Left: Countdown Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                borderRadius: "24px",
                padding: "clamp(24px, 5vw, 36px)",
                border: timeUntilStart <= 10 ? "2px solid #ef4444" : "2px solid rgba(139, 92, 246, 0.4)",
                boxShadow: timeUntilStart <= 10 
                  ? "0 0 40px rgba(239, 68, 68, 0.6), inset 0 0 40px rgba(239, 68, 68, 0.1)"
                  : "0 0 40px rgba(139, 92, 246, 0.3), inset 0 0 30px rgba(139, 92, 246, 0.1)",
                position: "relative",
                overflow: "hidden",
                animation: "slideIn 0.6s ease-out 0.1s backwards",
              }}
            >
              {/* Shimmer Effect */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)",
                  animation: "shimmer 2s linear infinite",
                }}
              />

              {/* Status Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "999px",
                  background: `${getStatusColor()}20`,
                  border: `1px solid ${getStatusColor()}`,
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: getStatusColor(),
                    animation: "pulse-ring 2s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    fontWeight: 700,
                    color: getStatusColor(),
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {hasJoined ? "JOINED" : timeUntilStart <= 10 ? "STARTING SOON" : "WAITING"}
                </span>
              </div>

              {/* Countdown Display */}
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <div
                  style={{
                    fontSize: "clamp(11px, 2.2vw, 13px)",
                    color: "#94a3b8",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "16px",
                  }}
                >
                  Round Starts In
                </div>
                <div
                  style={{
                    fontSize: "clamp(64px, 15vw, 96px)",
                    fontWeight: 900,
                    fontFamily: "ui-monospace, monospace",
                    color: getStatusColor(),
                    lineHeight: 1,
                    textShadow: `0 0 40px ${getStatusColor()}80`,
                    marginBottom: "24px",
                  }}
                >
                  {formatTime(timeUntilStart)}
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "999px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: "100%",
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${getStatusColor()}, ${getStatusColor()}dd)`,
                      borderRadius: "999px",
                      transition: "width 1s linear",
                      boxShadow: `0 0 20px ${getStatusColor()}`,
                    }}
                  />
                </div>
              </div>

              {/* Join Button */}
              {!hasJoined && (
                <button
                  onClick={handleJoinRound}
                  disabled={userCredits === 0}
                  style={{
                    width: "100%",
                    padding: "clamp(16px, 3.5vw, 20px)",
                    borderRadius: "16px",
                    border: "none",
                    background: userCredits === 0
                      ? "rgba(148, 163, 184, 0.3)"
                      : "linear-gradient(135deg, #7c3aed, #d946ef)",
                    color: "white",
                    fontSize: "clamp(16px, 3.5vw, 20px)",
                    fontWeight: 800,
                    cursor: userCredits === 0 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    transition: "all 0.3s",
                    opacity: userCredits === 0 ? 0.5 : 1,
                    boxShadow: userCredits === 0 
                      ? "none"
                      : "0 10px 40px rgba(139, 92, 246, 0.5)",
                  }}
                  onMouseEnter={(e) => {
                    if (userCredits > 0) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 15px 50px rgba(139, 92, 246, 0.6)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (userCredits > 0) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 10px 40px rgba(139, 92, 246, 0.5)";
                    }
                  }}
                >
                  {userCredits === 0 ? (
                    <>
                      <Shield style={{ width: 20, height: 20 }} />
                      No Rounds Left
                    </>
                  ) : (
                    <>
                      <Zap style={{ width: 20, height: 20 }} />
                      JOIN ROUND (1 Credit)
                      <Flame style={{ width: 20, height: 20 }} />
                    </>
                  )}
                </button>
              )}

              {hasJoined && (
                <div
                  style={{
                    width: "100%",
                    padding: "20px",
                    borderRadius: "16px",
                    background: "rgba(34, 197, 94, 0.15)",
                    border: "2px solid rgba(34, 197, 94, 0.4)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "clamp(16px, 3.5vw, 18px)",
                      fontWeight: 700,
                      color: "#22c55e",
                    }}
                  >
                    <Trophy style={{ width: 22, height: 22 }} />
                    YOU'RE IN! GET READY...
                  </div>
                </div>
              )}
            </div>

            {/* Right: Players Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                borderRadius: "24px",
                padding: "clamp(24px, 5vw, 36px)",
                border: "2px solid rgba(139, 92, 246, 0.3)",
                animation: "slideIn 0.6s ease-out 0.2s backwards",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "24px",
                }}
              >
                <Users style={{ width: 24, height: 24, color: "#8b5cf6" }} />
                <h3
                  style={{
                    fontSize: "clamp(18px, 4vw, 24px)",
                    fontWeight: 800,
                    margin: 0,
                    color: "white",
                  }}
                >
                  Live Arena
                </h3>
              </div>

              {/* Stats Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(139, 92, 246, 0.1)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, color: "white", marginBottom: "4px" }}>
                    {participants}
                  </div>
                  <div style={{ fontSize: "clamp(10px, 2vw, 12px)", color: "#94a3b8", fontWeight: 600 }}>
                    JOINED
                  </div>
                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(34, 211, 238, 0.1)",
                    border: "1px solid rgba(34, 211, 238, 0.3)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, color: "white", marginBottom: "4px" }}>
                    {spectators}
                  </div>
                  <div style={{ fontSize: "clamp(10px, 2vw, 12px)", color: "#94a3b8", fontWeight: 600 }}>
                    WATCHING
                  </div>
                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "clamp(18px, 4.5vw, 24px)", fontWeight: 800, color: "white", marginBottom: "4px" }}>
                    {displayRange}
                  </div>
                  <div style={{ fontSize: "clamp(10px, 2vw, 12px)", color: "#94a3b8", fontWeight: 600 }}>
                    ACTIVE
                  </div>
                </div>
              </div>

              {/* Recent Players List */}
              <div>
                <div
                  style={{
                    fontSize: "clamp(13px, 2.8vw, 15px)",
                    color: "#94a3b8",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "16px",
                  }}
                >
                  Recent Joins
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {recentPlayers.length === 0 ? (
                    <div
                      style={{
                        padding: "24px",
                        textAlign: "center",
                        color: "#6b7280",
                        fontSize: "14px",
                      }}
                    >
                      Waiting for players to join...
                    </div>
                  ) : (
                    recentPlayers.map((player, idx) => (
                      <div
                        key={player.user_id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px",
                          borderRadius: "12px",
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          animation: `slideIn 0.4s ease-out ${idx * 0.05}s backwards`,
                        }}
                      >
                        {/* Avatar */}
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #7c3aed, #d946ef)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "16px",
                            color: "white",
                            flexShrink: 0,
                          }}
                        >
                          {player.full_name.charAt(0).toUpperCase()}
                        </div>

                        {/* Name */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "clamp(13px, 2.8vw, 15px)",
                              fontWeight: 600,
                              color: "white",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {player.full_name}
                          </div>
                          <div
                            style={{
                              fontSize: "clamp(10px, 2vw, 12px)",
                              color: "#6b7280",
                            }}
                          >
                            Just joined
                          </div>
                        </div>

                        {/* Badge */}
                        <div
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            background: "rgba(34, 197, 94, 0.15)",
                            border: "1px solid rgba(34, 197, 94, 0.3)",
                          }}
                        >
                          <Clock style={{ width: 14, height: 14, color: "#22c55e" }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div
            style={{
              marginTop: "32px",
              padding: "20px",
              borderRadius: "16px",
              background: "rgba(139, 92, 246, 0.08)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              textAlign: "center",
              animation: "slideIn 0.6s ease-out 0.3s backwards",
            }}
          >
            <p
              style={{
                fontSize: "clamp(13px, 2.8vw, 15px)",
                color: "#cbd5e1",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: "white" }}>You're in the lobby!</strong> The quiz will start
              automatically when the countdown reaches 0. Get ready to compete!
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
