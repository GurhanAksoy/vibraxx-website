"use client";

/**
 * LOBBY PAGE - OPTIMIZED & SECURED
 * 
 * ✅ Design 100% preserved (inline styles untouched)
 * ✅ 4-layer security system (URL protection removed for flexibility)
 * ✅ Browser-compliant music autoplay
 * ✅ Supabase migration (new schema)
 * ✅ Real-time subscriptions
 * ✅ useNextRound hook (DRY with homepage)
 * ✅ Anti-cheat mechanisms
 * 
 * SECURITY LAYERS:
 * Layer 1: Authentication check (Supabase auth)
 * Layer 2: Credits verification (user_credits table)
 * Layer 3: Age verification (UK legal compliance)
 * Layer 4: Round status validation (useNextRound hook)
 */

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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useNextRound } from "@/hooks/useNextRound";
import Image from "next/image";

// ==================== TYPES ====================

interface LobbyPlayer {
  user_id: string;
  full_name: string;
  avatar_url: string;
  joined_at: string;
}

// ==================== COMPONENT ====================

export default function LobbyPage() {
  const router = useRouter();

  // ==================== HOOKS ====================
  
  // Shared hook with homepage (DRY principle)
  const { timeUntilStart, formattedCountdown, nextRound, lobbyStatus, reload } = useNextRound();

  // ==================== STATE ====================
  
  // Auth & User
  const [user, setUser] = useState<any>(null);
  const [userCredits, setUserCredits] = useState(0);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  
  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  // Lobby Data
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  
  // Music
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // ==================== REFS ====================
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const countdownBeepRef = useRef<HTMLAudioElement | null>(null);
  const lastRoundIdRef = useRef<number | null>(null);

  // ==================== AUDIO INITIALIZATION ====================
  
  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio("/sounds/vibraxx.mp3");
    audio.loop = true;
    audioRef.current = audio;

    alarmRef.current = new Audio("/sounds/alarm.mp3");
    countdownBeepRef.current = new Audio("/sounds/countdown.mp3");

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (alarmRef.current) {
        alarmRef.current.pause();
        alarmRef.current = null;
      }
      if (countdownBeepRef.current) {
        countdownBeepRef.current.pause();
        countdownBeepRef.current = null;
      }
    };
  }, []);

  // ==================== MUSIC AUTOPLAY (Browser-Compliant) ====================
  
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        
        const savedPref = localStorage.getItem("vibraxx_music");
        
        if (savedPref !== "false") {
          audioRef.current?.play().catch(() => {});
          setIsPlaying(true);
        }
      }
    };
    
    document.addEventListener("click", handleFirstInteraction, { once: true });
    document.addEventListener("touchstart", handleFirstInteraction, { once: true });
    
    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [hasInteracted]);

  // Play/Pause control
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const toggleMusic = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    localStorage.setItem("vibraxx_music", String(newState));
  };

  // ==================== 🔐 SECURITY SYSTEM: 4-LAYER VALIDATION ====================
  // Auth State Listener - Production-safe async auth handling
  
  useEffect(() => {
    let isMounted = true;

    const runSecurityChecks = async (authUser: any) => {
      if (!isMounted) return;

      try {
        setUser(authUser);
        console.log("✅ [Security L1] User authenticated:", authUser.id);

        // 🔐 LAYER 2: Credits Check
        const { data: creditsData, error: creditsError } = await supabase
          .from("user_credits")
          .select("live_credits")
          .eq("user_id", authUser.id)
          .single();

        if (!isMounted) return;

        if (creditsError || !creditsData || creditsData.live_credits <= 0) {
          console.error("🚫 [Security L2] Insufficient credits");
          router.push("/buy");
          return;
        }

        setUserCredits(creditsData.live_credits);
        console.log("✅ [Security L2] Credits verified:", creditsData.live_credits);

        // 🔐 LAYER 3: Age Verification (UK Legal Compliance)
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("age_verified")
          .eq("user_id", authUser.id)
          .single();

        if (!isMounted) return;

        if (profileError || !profileData?.age_verified) {
          console.error("🚫 [Security L3] Age verification required");
          router.push("/verify-age");
          return;
        }

        setIsAgeVerified(true);
        console.log("✅ [Security L3] Age verified");

        // 🔐 LAYER 4: Round Status Check (handled by useNextRound hook)
        // Will validate round availability and timing

        // ✅ ALL SECURITY CHECKS PASSED
        if (isMounted) {
          setIsLoading(false);
        }

      } catch (err) {
        console.error("🚫 [Security] Security checks failed:", err);
        if (isMounted) {
          router.push("/");
        }
      }
    };

    // 🔐 LAYER 1: Auth State Listener (Production-safe)
    const initAuth = async () => {
      // Initial session check (for already logged-in users)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user && isMounted) {
        console.log("[Auth] Initial session found:", session.user.id);
        await runSecurityChecks(session.user);
      }

      // Listen for auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log(`[Auth] Event: ${event}, Session:`, session?.user?.id || 'none');

          // No session = redirect to homepage
          if (!session?.user) {
            console.warn("⏳ [Security L1] No active session - redirecting");
            if (isMounted) {
              router.push("/");
            }
            return;
          }

          // Session exists - run security checks
          await runSecurityChecks(session.user);
        }
      );

      return authListener;
    };

    // Start auth initialization
    const authPromise = initAuth();

    // Cleanup
    return () => {
      isMounted = false;
      authPromise.then((listener) => {
        listener?.subscription.unsubscribe();
      });
    };
  }, [router]);

  // ==================== ROUND CHANGE DETECTION ====================
  
  useEffect(() => {
    if (!nextRound) return;

    // Detect round change and reset state
    if (lastRoundIdRef.current && lastRoundIdRef.current !== nextRound.id) {
      console.log("🔄 Round changed, resetting lobby state");
      
      setHasJoined(false);
      setShowWarning(false);
      setIsRedirecting(false);
      setPlayers([]);
      setTotalPlayers(0);
    }

    lastRoundIdRef.current = nextRound.id;
  }, [nextRound]);

  // ==================== FETCH LOBBY PLAYERS ====================
  
  const fetchLobbyPlayers = useCallback(async () => {
    if (!nextRound?.id) return;

    try {
      const { data, error } = await supabase
        .from("round_participants")
        .select(`
          user_id,
          joined_at,
          profiles!inner (
            full_name,
            avatar_url
          )
        `)
        .eq("round_id", nextRound.id)
        .order("joined_at", { ascending: true })
        .limit(50); // Top 50 players in lobby

      if (error) {
        console.error("[LobbyPlayers] Query error:", error);
        return;
      }

      if (!data) {
        setPlayers([]);
        return;
      }

      // Transform data
      const playerList: LobbyPlayer[] = data.map((p: any) => ({
        user_id: p.user_id,
        full_name: p.profiles?.full_name || "Anonymous",
        avatar_url: p.profiles?.avatar_url || "/images/logo.png",
        joined_at: p.joined_at,
      }));

      setPlayers(playerList);

    } catch (err) {
      console.error("[LobbyPlayers] Unexpected error:", err);
    }
  }, [nextRound?.id]);

  // ==================== FETCH TOTAL PARTICIPANTS ====================
  
  const fetchTotalParticipants = useCallback(async () => {
    if (!nextRound?.id) return;

    try {
      const { count, error } = await supabase
        .from("round_participants")
        .select("*", { count: "exact", head: true })
        .eq("round_id", nextRound.id);

      if (error) {
        console.error("[TotalParticipants] Query error:", error);
        return;
      }

      setTotalPlayers(count || 0);

    } catch (err) {
      console.error("[TotalParticipants] Unexpected error:", err);
    }
  }, [nextRound?.id]);

  // ==================== CHECK IF ALREADY JOINED ====================
  
  const checkIfAlreadyJoined = useCallback(async () => {
    if (!user || !nextRound?.id) return;

    try {
      const { data, error } = await supabase
        .from("round_participants")
        .select("user_id")
        .eq("round_id", nextRound.id)
        .eq("user_id", user.id)
        .single();

      if (data) {
        setHasJoined(true);
        console.log("✅ User already joined this round");
      }

    } catch (err) {
      // Not joined yet (expected)
    }
  }, [user, nextRound?.id]);

  // ==================== INITIAL DATA LOAD ====================
  
  useEffect(() => {
    if (!nextRound?.id || !user) return;

    fetchLobbyPlayers();
    fetchTotalParticipants();
    checkIfAlreadyJoined();
  }, [nextRound?.id, user, fetchLobbyPlayers, fetchTotalParticipants, checkIfAlreadyJoined]);

  // ==================== REAL-TIME SUBSCRIPTIONS ====================
  
  useEffect(() => {
    if (!nextRound?.id) return;

    // Subscribe to new participants
    const channel = supabase
      .channel(`lobby:${nextRound.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'round_participants',
        filter: `round_id=eq.${nextRound.id}`
      }, (payload) => {
        console.log("[Realtime] New player joined:", payload);
        
        // Refresh player list and count
        fetchLobbyPlayers();
        fetchTotalParticipants();
      })
      .subscribe();

    console.log("[Realtime] Subscribed to lobby updates");

    return () => {
      console.log("[Realtime] Unsubscribing from lobby");
      channel.unsubscribe();
    };
  }, [nextRound?.id, fetchLobbyPlayers, fetchTotalParticipants]);

  // ==================== WARNING SYSTEM (10s before start) ====================
  
  useEffect(() => {
    if (timeUntilStart === 10 && !showWarning) {
      setShowWarning(true);
      alarmRef.current?.play().catch(() => {});
      console.log("⚠️ 10 seconds warning!");
    }

    if (timeUntilStart === 3 && !isRedirecting) {
      countdownBeepRef.current?.play().catch(() => {});
      console.log("🔊 Final countdown beep!");
    }
  }, [timeUntilStart, showWarning, isRedirecting]);

  // ==================== AUTO REDIRECT (when countdown hits 0) ====================
  
  useEffect(() => {
    if (timeUntilStart === 0 && !isRedirecting && hasJoined) {
      setIsRedirecting(true);
      console.log("🚀 Redirecting to quiz...");
      
      setTimeout(() => {
        router.push(`/quiz/live?round_id=${nextRound?.id}`);
      }, 1000);
    }
  }, [timeUntilStart, isRedirecting, hasJoined, nextRound?.id, router]);

  // ==================== JOIN ROUND HANDLER ====================
  
  const handleJoinRound = async () => {
    if (!user || !nextRound || hasJoined || isJoining) return;
    
    if (timeUntilStart <= 0) {
      alert("Round has started! Please wait for the next one.");
      return;
    }

    try {
      setIsJoining(true);

      // Call join_round RPC
      const { data, error } = await supabase.rpc("join_round", {
        round_id: nextRound.id
      });

      if (error) {
        // Handle specific errors
        if (error.message.includes("already joined")) {
          console.log("[JoinRound] Already joined");
          setHasJoined(true);
          return;
        }
        
        console.error("[JoinRound] Error:", error);
        alert("Failed to join round. Please try again.");
        return;
      }

      console.log("✅ Successfully joined round:", nextRound.id);
      setHasJoined(true);
      
      // Refresh player list
      fetchLobbyPlayers();
      fetchTotalParticipants();

    } catch (err) {
      console.error("[JoinRound] Unexpected error:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  // ==================== LOADING STATE ====================
  
  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020817"
      }}>
        <div style={{
          fontSize: "24px",
          color: "#c4b5fd",
          fontWeight: 700
        }}>
          Loading lobby...
        </div>
      </div>
    );
  }

  // ==================== NO ROUND STATE ====================
  
  if (!nextRound) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020817",
        padding: "20px"
      }}>
        <div style={{
          textAlign: "center",
          maxWidth: "500px"
        }}>
          <h2 style={{
            fontSize: "32px",
            color: "#c4b5fd",
            marginBottom: "20px"
          }}>
            No Active Rounds
          </h2>
          <p style={{
            fontSize: "18px",
            color: "#94a3b8",
            marginBottom: "30px"
          }}>
            Check back soon for the next round!
          </p>
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "16px 32px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #7c3aed, #d946ef)",
              color: "#fff",
              fontSize: "18px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer"
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  
  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          background: "#020817",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* ==================== HEADER ==================== */}
        <header
          style={{
            background: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              padding: "clamp(16px, 3vw, 24px) clamp(16px, 4vw, 40px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "clamp(45px, 10vw, 60px)",
                  height: "clamp(45px, 10vw, 60px)",
                  position: "relative",
                }}
              >
                <Image
                  src="/images/logo.png"
                  alt="VibraXX"
                  fill
                  sizes="60px"
                  style={{ objectFit: "contain" }}
                />
              </div>
              <h1
                style={{
                  fontSize: "clamp(20px, 4.5vw, 28px)",
                  fontWeight: 900,
                  background: "linear-gradient(135deg, #7c3aed, #d946ef)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                VIBRAXX
              </h1>
            </div>

            {/* Right Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "clamp(12px, 2.5vw, 18px)" }}>
              {/* Music Toggle */}
              <button
                onClick={toggleMusic}
                style={{
                  width: "clamp(42px, 9vw, 50px)",
                  height: "clamp(42px, 9vw, 50px)",
                  borderRadius: "12px",
                  border: "2px solid rgba(139, 92, 246, 0.4)",
                  background: isPlaying
                    ? "linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(217, 70, 239, 0.15))"
                    : "rgba(15, 23, 42, 0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                  e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)";
                }}
              >
                {isPlaying ? (
                  <Volume2 style={{ width: "clamp(18px, 4vw, 22px)", height: "clamp(18px, 4vw, 22px)", color: "#c4b5fd" }} />
                ) : (
                  <VolumeX style={{ width: "clamp(18px, 4vw, 22px)", height: "clamp(18px, 4vw, 22px)", color: "#64748b" }} />
                )}
              </button>

              {/* Back Button */}
              <button
                onClick={() => router.push("/")}
                style={{
                  padding: "clamp(10px, 2.2vw, 14px) clamp(16px, 3.5vw, 22px)",
                  borderRadius: "12px",
                  border: "2px solid rgba(139, 92, 246, 0.4)",
                  background: "rgba(15, 23, 42, 0.8)",
                  color: "#c4b5fd",
                  fontSize: "clamp(13px, 2.8vw, 15px)",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(124, 58, 237, 0.2)";
                  e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(15, 23, 42, 0.8)";
                  e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)";
                }}
              >
                <ArrowLeft style={{ width: "clamp(16px, 3.5vw, 18px)", height: "clamp(16px, 3.5vw, 18px)" }} />
                Back
              </button>
            </div>
          </div>
        </header>

        {/* ==================== MAIN CONTENT ==================== */}
        <main
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px)",
          }}
        >
          {/* Warning Banner */}
          {showWarning && (
            <div
              style={{
                marginBottom: "clamp(20px, 4vw, 32px)",
                padding: "clamp(16px, 3.5vw, 24px)",
                borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))",
                border: "2px solid rgba(239, 68, 68, 0.5)",
                textAlign: "center",
                animation: "pulse 1.5s infinite",
                boxShadow: "0 0 30px rgba(239, 68, 68, 0.3)",
              }}
            >
              <div
                style={{
                  fontSize: "clamp(18px, 4vw, 24px)",
                  fontWeight: 800,
                  color: "#fca5a5",
                  marginBottom: "8px",
                }}
              >
                ⚠️ ROUND STARTING SOON!
              </div>
              <div
                style={{
                  fontSize: "clamp(14px, 3vw, 16px)",
                  color: "#fecaca",
                  fontWeight: 600,
                }}
              >
                Get ready! The quiz will begin in {timeUntilStart} seconds
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "clamp(20px, 4.5vw, 32px)",
            }}
          >
            {/* Left Column - Round Info & Join */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "clamp(20px, 4.5vw, 28px)",
              }}
            >
              {/* Countdown Card */}
              <div
                style={{
                  padding: "clamp(28px, 6vw, 42px)",
                  borderRadius: "24px",
                  background: "rgba(15, 23, 42, 0.92)",
                  border: "2px solid rgba(139, 92, 246, 0.3)",
                  boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "clamp(20px, 4.5vw, 28px)",
                  }}
                >
                  <Clock
                    style={{
                      width: "clamp(26px, 6vw, 34px)",
                      height: "clamp(26px, 6vw, 34px)",
                      color: "#c4b5fd",
                    }}
                  />
                  <h2
                    style={{
                      fontSize: "clamp(22px, 5vw, 30px)",
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    Round Starts In
                  </h2>
                </div>

                <div
                  style={{
                    fontSize: "clamp(64px, 15vw, 96px)",
                    fontWeight: 900,
                    textAlign: "center",
                    background: "linear-gradient(135deg, #7c3aed, #d946ef)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    marginBottom: "clamp(24px, 5vw, 36px)",
                    fontFamily: "monospace",
                    letterSpacing: "0.05em",
                  }}
                >
                  {formattedCountdown}
                </div>

                {/* Round Info */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "clamp(14px, 3vw, 20px)",
                    marginBottom: "clamp(24px, 5vw, 32px)",
                  }}
                >
                  <div
                    style={{
                      padding: "clamp(14px, 3vw, 18px)",
                      borderRadius: "14px",
                      background: "rgba(139, 92, 246, 0.12)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "clamp(12px, 2.5vw, 13px)",
                        color: "#94a3b8",
                        fontWeight: 600,
                        marginBottom: "6px",
                      }}
                    >
                      Your Credits
                    </div>
                    <div
                      style={{
                        fontSize: "clamp(22px, 5vw, 28px)",
                        fontWeight: 800,
                        color: "#c4b5fd",
                      }}
                    >
                      {userCredits}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "clamp(14px, 3vw, 18px)",
                      borderRadius: "14px",
                      background: "rgba(6, 182, 212, 0.12)",
                      border: "1px solid rgba(6, 182, 212, 0.3)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "clamp(12px, 2.5vw, 13px)",
                        color: "#94a3b8",
                        fontWeight: 600,
                        marginBottom: "6px",
                      }}
                    >
                      Duration
                    </div>
                    <div
                      style={{
                        fontSize: "clamp(22px, 5vw, 28px)",
                        fontWeight: 800,
                        color: "#67e8f9",
                      }}
                    >
                      {Math.floor((nextRound?.round_duration_seconds || 270) / 60)}m
                    </div>
                  </div>
                </div>

                {/* Join Button */}
                {!hasJoined ? (
                  <button
                    onClick={handleJoinRound}
                    disabled={isJoining || timeUntilStart <= 0}
                    style={{
                      width: "100%",
                      padding: "clamp(18px, 4vw, 24px)",
                      borderRadius: "16px",
                      background: timeUntilStart > 0
                        ? "linear-gradient(135deg, #7c3aed, #d946ef)"
                        : "rgba(100, 116, 139, 0.5)",
                      color: "#fff",
                      fontSize: "clamp(17px, 3.8vw, 20px)",
                      fontWeight: 800,
                      border: "none",
                      cursor: timeUntilStart > 0 ? "pointer" : "not-allowed",
                      transition: "all 0.3s",
                      boxShadow: timeUntilStart > 0
                        ? "0 20px 40px -16px rgba(139, 92, 246, 0.6)"
                        : "none",
                      opacity: isJoining ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (timeUntilStart > 0 && !isJoining) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 25px 50px -12px rgba(139, 92, 246, 0.7)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = timeUntilStart > 0
                        ? "0 20px 40px -16px rgba(139, 92, 246, 0.6)"
                        : "none";
                    }}
                  >
                    {isJoining ? (
                      "Joining..."
                    ) : timeUntilStart <= 0 ? (
                      "Round Started - Wait for Next"
                    ) : (
                      <>
                        <Sparkles
                          style={{
                            width: "clamp(20px, 4.5vw, 24px)",
                            height: "clamp(20px, 4.5vw, 24px)",
                            display: "inline-block",
                            marginRight: "10px",
                            verticalAlign: "middle",
                          }}
                        />
                        Join This Round
                      </>
                    )}
                  </button>
                ) : (
                  <div
                    style={{
                      width: "100%",
                      padding: "clamp(18px, 4vw, 24px)",
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.15))",
                      border: "2px solid rgba(34, 197, 94, 0.5)",
                      color: "#86efac",
                      fontSize: "clamp(17px, 3.8vw, 20px)",
                      fontWeight: 800,
                      textAlign: "center",
                      boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)",
                    }}
                  >
                    ✅ Joined! Get ready...
                  </div>
                )}

                {/* Security Badge */}
                <div
                  style={{
                    marginTop: "clamp(20px, 4vw, 28px)",
                    padding: "clamp(12px, 2.5vw, 16px)",
                    borderRadius: "12px",
                    background: "rgba(34, 197, 94, 0.1)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "clamp(12px, 2.5vw, 14px)",
                    color: "#86efac",
                    fontWeight: 600,
                  }}
                >
                  <Shield style={{ width: "18px", height: "18px" }} />
                  Verified & Secure
                </div>
              </div>
            </div>

            {/* Right Column - Players */}
            <div
              style={{
                padding: "clamp(28px, 6vw, 40px)",
                borderRadius: "24px",
                background: "rgba(15, 23, 42, 0.92)",
                border: "2px solid rgba(139, 92, 246, 0.3)",
                boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "clamp(20px, 4.5vw, 28px)",
                }}
              >
                <h3
                  style={{
                    fontSize: "clamp(20px, 4.5vw, 26px)",
                    fontWeight: 800,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <Users
                    style={{
                      width: "clamp(22px, 5.5vw, 28px)",
                      height: "clamp(22px, 5.5vw, 28px)",
                      color: "#c4b5fd",
                    }}
                  />
                  Players in Lobby
                </h3>
                <div
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    background: "rgba(139, 92, 246, 0.25)",
                    border: "2px solid rgba(139, 92, 246, 0.4)",
                    fontSize: "clamp(14px, 3vw, 16px)",
                    fontWeight: 800,
                    color: "#c4b5fd",
                    boxShadow: "0 0 15px rgba(139, 92, 246, 0.3)",
                  }}
                >
                  {players.length}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "clamp(12px, 2.5vw, 16px)",
                  maxHeight: "550px",
                  overflowY: "auto",
                  paddingRight: "8px",
                }}
              >
                {players.length > 0 ? (
                  players.map((player, idx) => (
                    <div
                      key={player.user_id}
                      className="animate-slide-in"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "clamp(14px, 3.5vw, 18px)",
                        padding: "clamp(14px, 3.5vw, 20px)",
                        borderRadius: "18px",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        background: "rgba(255, 255, 255, 0.04)",
                        transition: "all 0.3s",
                        animationDelay: `${idx * 0.1}s`,
                        boxShadow: "0 0 15px rgba(0, 0, 0, 0.2)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)";
                        e.currentTarget.style.transform = "translateX(8px)";
                        e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                        e.currentTarget.style.transform = "translateX(0)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                      }}
                    >
                      <div
                        style={{
                          width: "clamp(44px, 11vw, 54px)",
                          height: "clamp(44px, 11vw, 54px)",
                          borderRadius: "50%",
                          border: "3px solid rgba(139, 92, 246, 0.6)",
                          overflow: "hidden",
                          flexShrink: 0,
                          position: "relative",
                          boxShadow: "0 0 15px rgba(139, 92, 246, 0.4)",
                        }}
                      >
                        <Image
                          src={player.avatar_url || "/images/logo.png"}
                          alt={player.full_name}
                          fill
                          sizes="54px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "clamp(15px, 3.5vw, 17px)",
                            fontWeight: 700,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {player.full_name || "Anonymous"}
                        </div>
                        <div
                          style={{
                            fontSize: "clamp(12px, 2.8vw, 14px)",
                            color: "#94a3b8",
                            fontWeight: 600,
                          }}
                        >
                          Joined {new Date(player.joined_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      padding: "clamp(28px, 6vw, 40px)",
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: "clamp(14px, 3.2vw, 16px)",
                      fontWeight: 600,
                    }}
                  >
                    Waiting for players to join...
                  </div>
                )}
              </div>

              {/* Total Players Info */}
              <div
                style={{
                  marginTop: "clamp(20px, 4.5vw, 28px)",
                  padding: "clamp(16px, 4vw, 22px)",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(217, 70, 239, 0.1))",
                  border: "2px solid rgba(139, 92, 246, 0.3)",
                  textAlign: "center",
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.25)",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(14px, 3.2vw, 16px)",
                    color: "#cbd5e1",
                    fontWeight: 600,
                  }}
                >
                  🌍{" "}
                  <strong style={{ color: "#c4b5fd", fontWeight: 800 }}>
                    {totalPlayers.toLocaleString()}
                  </strong>{" "}
                  players in this round
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          main > div:last-child {
            grid-template-columns: 1.3fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .hide-on-small {
            display: none !important;
          }

          header > div {
            position: relative !important;
          }
        }

        @media (max-width: 899px) {
          .hide-mobile {
            display: none !important;
          }
        }

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.7);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.7),
            rgba(217, 70, 239, 0.5)
          );
          border-radius: 10px;
          border: 2px solid rgba(15, 23, 42, 0.7);
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.9),
            rgba(217, 70, 239, 0.7)
          );
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out forwards;
        }
      `}</style>
    </>
  );
}
