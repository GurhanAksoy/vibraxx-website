"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import dynamicImport from "next/dynamic";

const CountryPicker = dynamicImport(
  () => import("@/components/CountryPicker"),
  { ssr: false }
);

import Footer from "@/components/Footer";
import {
  User, Mail, Trophy, Target, Flame, TrendingUp, Calendar, Award, Crown,
  LogOut, Edit, Save, X, Send, CheckCircle, XCircle, BarChart3, Zap,
  Gift, ChevronRight, Activity, Sparkles, ShoppingCart,
  AlertCircle, Volume2, VolumeX, Clock, Star,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES (DB-driven, no business logic)
// ═══════════════════════════════════════════════════════════

interface ProfileData {
  profile: {
    id: string;
    full_name: string;
    avatar_url: string;
    country: string;
    created_at: string;
  };
  stats: {
    total_score: number;
    total_questions: number;
    correct_answers: number;
    wrong_answers: number;
    accuracy_percentage: number;
    rounds_played: number;
    tier: TierInfo;
    tier_progress: TierProgress;
  };
  credits: {
    live_credits: number;
  };
  rankings: {
    weekly_rank: number | null;
    monthly_rank: number | null;
  };
  personal_bests: {
    highest_score: number;
    best_accuracy: number;
    perfect_rounds: number;
    total_rounds: number;
  };
  today_stats: PeriodStats | null;
  month_stats: PeriodStats | null;
  recent_history: RoundHistory[];
  chart_data: ChartDay[];
  achievements: Achievement[];
  weekly_challenge: WeeklyChallenge;
}

interface TierInfo {
  name: string;
  icon: string;
  color: string;
  gradient: string;
  min: number;
  max: number;
}

interface TierProgress {
  progress: number;
  next_tier: TierInfo | null;
  points_needed: number;
}

interface PeriodStats {
  total_score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  accuracy_percentage: number;
  rounds_played: number;
}

interface RoundHistory {
  id: number;
  round_id: number;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  created_at: string;
  source: string;
}

interface ChartDay {
  date: string;
  score: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

interface WeeklyChallenge {
  current: number;
  target: number;
  completed: boolean;
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function ProfilePage() {
  const router = useRouter();

  // Core State (DB-driven data)
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userEmail, setUserEmail] = useState("");
  
  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(true);
  const [securityPassed, setSecurityPassed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCountry, setEditCountry] = useState("🌍");
  const [isSaving, setIsSaving] = useState(false);
  
  // Background Music
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Contact Form
  const [showContactForm, setShowContactForm] = useState(false);
  
  // ═══════════════════════════════════════════════════════════
  // SECURITY CHECK
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          router.push("/");
          return;
        }

        setUserEmail(authUser.email || "");
        setSecurityPassed(true);
        setIsVerifying(false);

      } catch (error) {
        console.error("Auth verification error:", error);
        router.push("/");
      }
    };

    verifyAuth();
  }, [router]);

  // ═══════════════════════════════════════════════════════════
  // FETCH PROFILE DATA (SINGLE RPC CALL)
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!securityPassed) return;

    const fetchProfileData = async () => {
      setIsLoading(true);

      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        // ✅ CANONICAL: Single RPC call, DB gives all orders
        const { data, error } = await supabase.rpc("get_user_profile_data", {
          p_user_id: authUser.id
        });

        if (error) {
          console.error("Error fetching profile data:", error);
          setIsLoading(false);
          return;
        }

        if (!data) {
          console.error("No profile data returned");
          setIsLoading(false);
          return;
        }

        // ✅ GUARD: Validate critical data from DB
        if (!data.stats?.tier) {
          console.error("Critical data missing: tier not returned from DB");
          setIsLoading(false);
          return;
        }

        if (!data.profile) {
          console.error("Critical data missing: profile not returned from DB");
          setIsLoading(false);
          return;
        }

        // Set data (no calculations, DB provides everything)
        setProfileData(data);
        setEditName(data.profile?.full_name || "User");
        setEditCountry(data.profile?.country || "🌍");
        setIsLoading(false);

      } catch (err) {
        console.error("Error fetching user data:", err);
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [securityPassed]);

  // ═══════════════════════════════════════════════════════════
  // REALTIME SUBSCRIPTIONS (FULL OPTIMIZED)
  // ═══════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════
  // REALTIME SUBSCRIPTIONS (DB-driven updates)
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    // ✅ STABLE: Extract userId to prevent re-renders
    const userId = profileData?.profile?.id;
    if (!userId) return;

    let refreshTimeout: NodeJS.Timeout;

    // ✅ Debounced refresh function (prevents excessive RPC calls)
    const debouncedRefresh = () => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(async () => {
        console.log("[Realtime] Refreshing profile data...");
        
        const { data, error } = await supabase.rpc("get_user_profile_data", {
          p_user_id: userId,
        });
        
        if (!error && data) {
          setProfileData(data);
          console.log("[Realtime] Profile updated");
        }
      }, 500); // 500ms debounce
    };

    // ═══════════════════════════════════════════════════════════
    // CHANNEL 1: ROUND PARTICIPANTS (game results)
    // ═══════════════════════════════════════════════════════════
    const scoreChannel = supabase
      .channel(`profile-participants-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "round_participants",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("[Realtime] Round participants changed:", payload);
          debouncedRefresh();
        }
      )
      .subscribe();

    // ═══════════════════════════════════════════════════════════
    // CHANNEL 2: USER CREDITS (purchases, rewards)
    // ═══════════════════════════════════════════════════════════
    const creditsChannel = supabase
      .channel(`profile-credits-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE", // Credits only update, never insert/delete
          schema: "public",
          table: "user_credits",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("[Realtime] Credits changed:", payload);
          debouncedRefresh();
        }
      )
      .subscribe();

    // ═══════════════════════════════════════════════════════════
    // CHANNEL 3: LEADERBOARDS (rank changes)
    // ═══════════════════════════════════════════════════════════
    const leaderboardChannel = supabase
      .channel(`profile-leaderboard-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leaderboard_weekly",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("[Realtime] Weekly leaderboard changed:", payload);
          debouncedRefresh();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leaderboard_monthly",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("[Realtime] Monthly leaderboard changed:", payload);
          debouncedRefresh();
        }
      )
      .subscribe();

    console.log("[Realtime] All channels subscribed for user:", userId);

    // ✅ CLEANUP: Remove all channels on unmount
    return () => {
      clearTimeout(refreshTimeout);
      supabase.removeChannel(scoreChannel);
      supabase.removeChannel(creditsChannel);
      supabase.removeChannel(leaderboardChannel);
      console.log("[Realtime] All channels unsubscribed");
    };
  }, [profileData?.profile?.id]); // ✅ STABLE: Only re-run if userId changes

  // ═══════════════════════════════════════════════════════════
  // BACKGROUND MUSIC
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    // ✅ GUARD: Prevent memory leak on re-mount
    if (!audioRef.current) {
      const audio = new Audio("/sounds/vibraxx.mp3");
      audio.loop = true;
      audio.volume = 0.3;
      audioRef.current = audio;
    }

    const musicEnabled = localStorage.getItem("vibraxx_music_enabled");
    if (musicEnabled === "true") {
      setIsMusicPlaying(true);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        const musicEnabled = localStorage.getItem("vibraxx_music_enabled");
        if (musicEnabled === "true" && audioRef.current) {
          audioRef.current.play().catch(err => console.log("Audio autoplay blocked:", err));
        }
      }
    };

    // ✅ FIXED: pointerdown instead of click
    document.addEventListener("pointerdown", handleFirstInteraction, { once: true });
    return () => document.removeEventListener("pointerdown", handleFirstInteraction);
  }, [hasInteracted]);
  useEffect(() => {
    if (!audioRef.current || !hasInteracted) return;

    if (isMusicPlaying) {
      audioRef.current.play().catch(err => console.log("Audio play error:", err));
      localStorage.setItem("vibraxx_music_enabled", "true");
    } else {
      audioRef.current.pause();
      localStorage.setItem("vibraxx_music_enabled", "false");
    }
  }, [isMusicPlaying, hasInteracted]);

  const toggleMusic = useCallback(() => {
    setHasInteracted(true);  // ✅ FIX: Music icon click counts as first interaction
    setIsMusicPlaying(prev => !prev);
  }, []);

  // ═══════════════════════════════════════════════════════════
  // SAVE PROFILE
  // ═══════════════════════════════════════════════════════════
  const handleSaveProfile = useCallback(async () => {
    if (!profileData || !editName.trim()) return;

    setIsSaving(true);

    try {
      await supabase.auth.updateUser({
        data: { 
          full_name: editName.trim(),
          country: editCountry
        }
      });

      const { error } = await supabase
        .from("profiles")
        .update({ 
          full_name: editName.trim(),
          country: editCountry 
        })
        .eq("id", profileData.profile.id);

      if (!error) {
        setProfileData({
          ...profileData,
          profile: {
            ...profileData.profile,
            full_name: editName.trim(),
            country: editCountry
          }
        });
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setIsSaving(false);
    }
  }, [profileData, editName, editCountry]);

  // ═══════════════════════════════════════════════════════════
  // LOGOUT
  // ═══════════════════════════════════════════════════════════
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/");
  }, [router]);

  // ═══════════════════════════════════════════════════════════
  // LOADING STATES
  // ═══════════════════════════════════════════════════════════
  if (isVerifying) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        color: "white",
      }}>
        <div style={{
          width: "60px",
          height: "60px",
          border: "4px solid rgba(139, 92, 246, 0.3)",
          borderTopColor: "#8b5cf6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <p style={{ color: "#a78bfa", fontSize: "16px", fontWeight: 600 }}>
          🔐 Verifying access...
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          border: "4px solid rgba(139,92,246,0.3)",
          borderTopColor: "#a78bfa",
          animation: "spin 1s linear infinite",
        }} />
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  // Destructure data (DB-provided, no calculations)
  const { profile, stats, credits, rankings, personal_bests, today_stats, month_stats, recent_history, chart_data, achievements, weekly_challenge } = profileData;
  
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const currentTier = stats.tier;
  const tierProgress = stats.tier_progress;
  
  // ✅ GUARD: Prevent crash if chart_data is empty
  const maxChartScore = chart_data.length 
    ? Math.max(...chart_data.map(d => d.score))
    : 1;

  return (
    <>
      
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)",
        backgroundSize: "400% 400%",
        color: "white",
        paddingBottom: "0",
      }}>
        
        <div style={{ padding: "clamp(20px, 5vw, 40px) clamp(16px, 4vw, 24px)" }}>
          
          {/* HEADER */}
          <header style={{
            maxWidth: "1200px",
            margin: "0 auto clamp(24px, 5vw, 40px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => router.push("/")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  border: "2px solid rgba(139,92,246,0.5)",
                  background: "rgba(15,23,42,0.8)",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#a78bfa";
                  e.currentTarget.style.background = "rgba(139,92,246,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)";
                  e.currentTarget.style.background = "rgba(15,23,42,0.8)";
                }}>
                <ChevronRight style={{ width: "18px", height: "18px", transform: "rotate(180deg)" }} />
                <span>Back to Home</span>
              </button>

              {/* Music Button */}
              <button
                onClick={toggleMusic}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  border: "2px solid rgba(139,92,246,0.5)",
                  background: isMusicPlaying 
                    ? "linear-gradient(135deg, rgba(139,92,246,0.95), rgba(124,58,237,0.95))"
                    : "rgba(15,23,42,0.8)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: isMusicPlaying ? "0 0 15px rgba(139,92,246,0.5)" : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#a78bfa";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                title={isMusicPlaying ? "Mute Music" : "Play Music"}>
                {isMusicPlaying ? (
                  <Volume2 style={{ width: "18px", height: "18px", color: "white" }} />
                ) : (
                  <VolumeX style={{ width: "18px", height: "18px", color: "#94a3b8" }} />
                )}
              </button>
            </div>

            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "12px",
                border: "2px solid rgba(239,68,68,0.5)",
                background: "rgba(15,23,42,0.8)",
                color: "#fca5a5",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#ef4444";
                e.currentTarget.style.background = "rgba(239,68,68,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)";
                e.currentTarget.style.background = "rgba(15,23,42,0.8)";
              }}>
              <LogOut style={{ width: "18px", height: "18px" }} />
              <span className="mobile-hide">Logout</span>
            </button>
          </header>

          <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
            
            {/* PROFILE CARD */}
            <div style={{
              padding: "clamp(24px, 5vw, 32px)",
              borderRadius: "clamp(20px, 4vw, 24px)",
              border: "2px solid rgba(139,92,246,0.5)",
              background: "linear-gradient(135deg, rgba(30,27,75,0.98) 0%, rgba(15,23,42,0.98) 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.4)",
              backdropFilter: "blur(20px)",
              marginBottom: "clamp(20px, 4vw, 24px)",
            }}>
              
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "clamp(16px, 3vw, 20px)",
                flexWrap: "wrap",
                marginBottom: "clamp(20px, 4vw, 24px)",
              }}>
                
                {/* Avatar */}
                <div style={{
                  position: "relative",
                  width: "clamp(80px, 15vw, 100px)",
                  height: "clamp(80px, 15vw, 100px)",
                  borderRadius: "50%",
                  padding: "4px",
                  background: currentTier.gradient,
                  boxShadow: `0 0 30px ${currentTier.color}60`,
                }}>
                  <div style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: "#020817",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}>
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        fill
                         style={{ objectFit: "cover" }}
                       />
                     ) : (
                       <User style={{ width: "50%", height: "50%", color: "#a78bfa" }} />
                     )}

                  </div>
                </div>

                {/* Name & Email */}
                <div style={{ flex: 1, minWidth: "200px" }}>
                  {isEditing ? (
                    <>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "2px solid rgba(139,92,246,0.5)",
                            background: "rgba(15,23,42,0.9)",
                            color: "white",
                            fontSize: "16px",
                            fontWeight: 700,
                          }}
                          placeholder="Enter your name"
                        />
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "none",
                            background: "linear-gradient(135deg, #22c55e, #16a34a)",
                            color: "white",
                            cursor: isSaving ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                          }}>
                          <Save style={{ width: "16px", height: "16px" }} />
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditName(profile.full_name);
                            setEditCountry(profile.country);
                          }}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "none",
                            background: "rgba(239,68,68,0.2)",
                            color: "#fca5a5",
                            cursor: "pointer",
                          }}>
                          <X style={{ width: "16px", height: "16px" }} />
                        </button>
                      </div>
                      
                      <div style={{ marginBottom: "8px" }}>
                        <CountryPicker
                          value={editCountry}
                          onChange={setEditCountry}
                          autoDetect={false}
                          showSearch={true}
                          
                        />
                      </div>
                    </>
                  ) : (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "8px",
                    }}>
                      <span style={{ fontSize: "clamp(32px, 6vw, 40px)" }}>
                        {profile.country}
                      </span>
                      <h1 style={{
                        fontSize: "clamp(20px, 4vw, 28px)",
                        fontWeight: 900,
                        background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}>
                        {profile.full_name}
                      </h1>
                      <button
                        onClick={() => setIsEditing(true)}
                        style={{
                          padding: "6px",
                          borderRadius: "8px",
                          border: "none",
                          background: "rgba(139,92,246,0.2)",
                          color: "#a78bfa",
                          cursor: "pointer",
                        }}>
                        <Edit style={{ width: "16px", height: "16px" }} />
                      </button>
                    </div>
                  )}
                  
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}>
                    <Mail style={{ width: "16px", height: "16px", color: "#94a3b8" }} />
                    <span style={{ fontSize: "14px", color: "#cbd5e1" }}>{userEmail}</span>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    <Calendar style={{ width: "16px", height: "16px", color: "#94a3b8" }} />
                    <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                      Member since {memberSince}
                    </span>
                  </div>
                </div>

                {/* Rounds Badge */}
                <div style={{
                  padding: "clamp(12px, 2.5vw, 16px) clamp(16px, 3vw, 20px)",
                  borderRadius: "clamp(12px, 2.5vw, 16px)",
                  background: credits.live_credits === 0 
                    ? "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(185,28,28,0.15))"
                    : "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15))",
                  border: `2px solid ${credits.live_credits === 0 ? "rgba(239,68,68,0.5)" : "rgba(251,191,36,0.5)"}`,
                  textAlign: "center",
                  ...(credits.live_credits === 0 ? { animation: "glow 2s ease-in-out infinite" } : {}),
                }}>
                  <Gift style={{
                    width: "clamp(24px, 5vw, 32px)",
                    height: "clamp(24px, 5vw, 32px)",
                    color: credits.live_credits === 0 ? "#ef4444" : "#fbbf24",
                    margin: "0 auto 4px",
                  }} />
                  <div style={{
                    fontSize: "clamp(24px, 5vw, 32px)",
                    fontWeight: 900,
                    color: credits.live_credits === 0 ? "#ef4444" : "#fbbf24",
                    lineHeight: 1,
                  }}>
                    {credits.live_credits}
                  </div>
                  <div style={{
                    fontSize: "clamp(11px, 2.2vw, 12px)",
                    color: credits.live_credits === 0 ? "#fca5a5" : "#fcd34d",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    marginTop: "4px",
                  }}>
                    Rounds Left
                  </div>
                </div>
              </div>

              {/* BUY ROUNDS CTA */}
              {credits.live_credits === 0 && (
                <div style={{
                  padding: "20px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2))",
                  border: "2px solid rgba(124,58,237,0.5)",
                  marginBottom: "20px",
                  textAlign: "center",
                }}>
                  <div style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#e5e7eb",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}>
                    <AlertCircle style={{ width: "20px", height: "20px", color: "#fbbf24" }} />
                    <span>No Rounds Available!</span>
                  </div>
                  <p style={{
                    fontSize: "14px",
                    color: "#cbd5e1",
                    marginBottom: "16px",
                  }}>
                    Continue your journey towards the £1000 monthly prize.
                  </p>
                  <button
                    onClick={() => router.push("/buy")}
                    style={{
                      width: "100%",
                      padding: "14px 24px",
                      borderRadius: "12px",
                      border: "none",
                      background: "linear-gradient(135deg, #7c3aed, #d946ef)",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.3s",
                      boxShadow: "0 0 30px rgba(124,58,237,0.6)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 0 40px rgba(124,58,237,0.8)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = "0 0 30px rgba(124,58,237,0.6)";
                    }}>
                    <ShoppingCart style={{ width: "20px", height: "20px" }} />
                    <span>Purchase Rounds</span>
                  </button>
                  <p style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    marginTop: "8px",
                  }}>
                    Skill-based • UK regulated
                  </p>
                </div>
              )}

              {/* TIER PROGRESS */}
              <div style={{
                padding: "20px",
                borderRadius: "16px",
                background: `linear-gradient(135deg, ${currentTier.color}20, rgba(15,23,42,0.5))`,
                border: `2px solid ${currentTier.color}60`,
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                  gap: "8px",
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    <span className="animate-float" style={{ fontSize: "28px" }}>{currentTier.icon}</span>
                    <span style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: currentTier.color,
                    }}>
                      {currentTier.name} Tier
                    </span>
                  </div>
                  {tierProgress.next_tier && (
                    <div style={{
                      fontSize: "14px",
                      color: "#cbd5e1",
                    }}>
                      {tierProgress.points_needed.toLocaleString()} pts to {tierProgress.next_tier.icon} {tierProgress.next_tier.name}
                    </div>
                  )}
                </div>
                
                {tierProgress.next_tier && (
                  <div style={{
                    width: "100%",
                    height: "12px",
                    borderRadius: "999px",
                    background: "rgba(15,23,42,0.8)",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${tierProgress.progress}%`,
                      height: "100%",
                      background: tierProgress.next_tier.gradient,
                      transition: "width 1s ease",
                      boxShadow: `0 0 10px ${tierProgress.next_tier.color}60`,
                    }} />
                  </div>
                )}
              </div>
            </div>

            {/* MAIN STATS GRID */}
            <div className="mobile-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "clamp(12px, 3vw, 16px)",
              marginBottom: "clamp(20px, 4vw, 24px)",
            }}>
              
              {/* Total Score */}
              <div style={{
                padding: "clamp(16px, 3vw, 20px)",
                borderRadius: "clamp(14px, 3vw, 16px)",
                background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15))",
                border: "2px solid rgba(251,191,36,0.5)",
                boxShadow: "0 0 20px rgba(251,191,36,0.3)",
                transition: "transform 0.3s",
                cursor: "default",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                <Trophy style={{
                  width: "clamp(24px, 5vw, 32px)",
                  height: "clamp(24px, 5vw, 32px)",
                  color: "#fbbf24",
                  marginBottom: "8px",
                }} />
                <div style={{
                  fontSize: "clamp(24px, 5vw, 32px)",
                  fontWeight: 900,
                  color: "#fbbf24",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}>
                  {stats.total_score.toLocaleString()}
                </div>
                <div style={{
                  fontSize: "clamp(11px, 2.2vw, 12px)",
                  color: "#fcd34d",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}>
                  Total Score
                </div>
              </div>

              {/* Accuracy */}
              <div style={{
                padding: "clamp(16px, 3vw, 20px)",
                borderRadius: "clamp(14px, 3vw, 16px)",
                background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(124,58,237,0.15))",
                border: "2px solid rgba(139,92,246,0.5)",
                boxShadow: "0 0 20px rgba(139,92,246,0.3)",
                transition: "transform 0.3s",
                cursor: "default",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                <Target style={{
                  width: "clamp(24px, 5vw, 32px)",
                  height: "clamp(24px, 5vw, 32px)",
                  color: "#a78bfa",
                  marginBottom: "8px",
                }} />
                <div style={{
                  fontSize: "clamp(24px, 5vw, 32px)",
                  fontWeight: 900,
                  color: "#a78bfa",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}>
                  {stats.accuracy_percentage.toFixed(1)}%
                </div>
                <div style={{
                  fontSize: "clamp(11px, 2.2vw, 12px)",
                  color: "#c4b5fd",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}>
                  Accuracy
                </div>
              </div>

              {/* Rounds Played */}
              <div style={{
                padding: "clamp(16px, 3vw, 20px)",
                borderRadius: "clamp(14px, 3vw, 16px)",
                background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(21,128,61,0.15))",
                border: "2px solid rgba(34,197,94,0.5)",
                boxShadow: "0 0 20px rgba(34,197,94,0.3)",
                transition: "transform 0.3s",
                cursor: "default",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                <Zap style={{
                  width: "clamp(24px, 5vw, 32px)",
                  height: "clamp(24px, 5vw, 32px)",
                  color: "#22c55e",
                  marginBottom: "8px",
                }} />
                <div style={{
                  fontSize: "clamp(24px, 5vw, 32px)",
                  fontWeight: 900,
                  color: "#22c55e",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}>
                  {stats.rounds_played}
                </div>
                <div style={{
                  fontSize: "clamp(11px, 2.2vw, 12px)",
                  color: "#86efac",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}>
                  Rounds Played
                </div>
              </div>

              {/* Correct Answers */}
              <div style={{
                padding: "clamp(16px, 3vw, 20px)",
                borderRadius: "clamp(14px, 3vw, 16px)",
                background: "linear-gradient(135deg, rgba(56,189,248,0.2), rgba(14,165,233,0.15))",
                border: "2px solid rgba(56,189,248,0.5)",
                boxShadow: "0 0 20px rgba(56,189,248,0.3)",
                transition: "transform 0.3s",
                cursor: "default",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                <CheckCircle style={{
                  width: "clamp(24px, 5vw, 32px)",
                  height: "clamp(24px, 5vw, 32px)",
                  color: "#38bdf8",
                  marginBottom: "8px",
                }} />
                <div style={{
                  fontSize: "clamp(24px, 5vw, 32px)",
                  fontWeight: 900,
                  color: "#38bdf8",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}>
                  {stats.correct_answers}
                </div>
                <div style={{
                  fontSize: "clamp(11px, 2.2vw, 12px)",
                  color: "#7dd3fc",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}>
                  Correct Answers
                </div>
              </div>
            </div>

            {/* PERFORMANCE CHART */}
            {chart_data.length > 0 && (
              <div style={{
                padding: "clamp(20px, 4vw, 24px)",
                borderRadius: "clamp(16px, 3vw, 20px)",
                border: "2px solid rgba(56,189,248,0.5)",
                background: "linear-gradient(135deg, rgba(8,47,73,0.98), rgba(6,8,20,0.98))",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(56,189,248,0.4)",
                backdropFilter: "blur(20px)",
                marginBottom: "clamp(20px, 4vw, 24px)",
              }}>
                <h2 style={{
                  fontSize: "clamp(18px, 4vw, 22px)",
                  fontWeight: 900,
                  marginBottom: "clamp(16px, 3vw, 20px)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#7dd3fc",
                }}>
                  <BarChart3 style={{ width: "24px", height: "24px" }} />
                  Performance Chart (Last 7 Days)
                </h2>

                <div style={{
                  height: "clamp(180px, 35vw, 220px)",
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "clamp(6px, 2vw, 12px)",
                  padding: "clamp(16px, 3vw, 20px) clamp(8px, 2vw, 10px)",
                }}>
                  {chart_data.map((day, index) => {
                    const barHeight = (day.score / maxChartScore) * 160;
                    return (
                      <div key={index} style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                      }}>
                        <div style={{
                          fontSize: "clamp(10px, 2vw, 12px)",
                          fontWeight: 700,
                          color: day.score > 0 ? "#7dd3fc" : "#64748b",
                        }}>
                          {day.score}
                        </div>
                        <div style={{
                          width: "100%",
                          height: `${barHeight}px`,
                          background: day.score > 0 
                            ? "linear-gradient(to top, #0ea5e9, #7dd3fc)"
                            : "rgba(100,116,139,0.3)",
                          borderRadius: "8px 8px 0 0",
                          transition: "all 0.3s",
                          cursor: "default",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.05)";
                          e.currentTarget.style.boxShadow = "0 0 20px rgba(125,211,252,0.6)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "none";
                        }} />
                        <div style={{
                          fontSize: "clamp(9px, 1.8vw, 11px)",
                          color: "#94a3b8",
                          textAlign: "center",
                        }}>
                          {day.date}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ACHIEVEMENTS */}
            {achievements.length > 0 && (
              <div style={{
                padding: "clamp(20px, 4vw, 24px)",
                borderRadius: "clamp(16px, 3vw, 20px)",
                border: "2px solid rgba(251,191,36,0.5)",
                background: "linear-gradient(135deg, rgba(30,27,75,0.98) 0%, rgba(15,23,42,0.98) 100%)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                backdropFilter: "blur(20px)",
                marginBottom: "clamp(20px, 4vw, 24px)",
              }}>
                <h2 style={{
                  fontSize: "clamp(18px, 4vw, 22px)",
                  fontWeight: 900,
                  marginBottom: "clamp(16px, 3vw, 20px)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#fbbf24",
                }}>
                  <Sparkles style={{ width: "24px", height: "24px" }} />
                  Achievements
                </h2>

                <div className="mobile-grid" style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "clamp(12px, 3vw, 16px)",
                }}>
                  {achievements.map((achievement) => (
                    <div key={achievement.id} style={{
                      padding: "16px",
                      borderRadius: "12px",
                      background: achievement.unlocked 
                        ? "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15))"
                        : "rgba(15,23,42,0.5)",
                      border: `2px solid ${achievement.unlocked ? "rgba(251,191,36,0.5)" : "rgba(71,85,105,0.5)"}`,
                      textAlign: "center",
                      opacity: achievement.unlocked ? 1 : 0.6,
                      transition: "all 0.3s",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.opacity = achievement.unlocked ? "1" : "0.6";
                    }}>
                      <div style={{
                        fontSize: "32px",
                        marginBottom: "8px",
                        filter: achievement.unlocked ? "none" : "grayscale(100%)",
                      }}>
                        {achievement.icon}
                      </div>
                      <div style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: achievement.unlocked ? "#fbbf24" : "#94a3b8",
                        marginBottom: "4px",
                      }}>
                        {achievement.title}
                      </div>
                      <div style={{
                        fontSize: "10px",
                        color: "#94a3b8",
                        marginBottom: "8px",
                      }}>
                        {achievement.description}
                      </div>
                      {achievement.progress !== undefined && achievement.target && (
                        <>
                          <div style={{
                            width: "100%",
                            height: "4px",
                            borderRadius: "999px",
                            background: "rgba(15,23,42,0.8)",
                            overflow: "hidden",
                            marginBottom: "4px",
                          }}>
                            <div style={{
                              width: `${(achievement.progress / achievement.target) * 100}%`,
                              height: "100%",
                              background: achievement.unlocked ? "#fbbf24" : "#64748b",
                              transition: "width 0.5s ease",
                            }} />
                          </div>
                          <div style={{
                            fontSize: "9px",
                            color: "#64748b",
                          }}>
                            {achievement.progress}/{achievement.target}
                          </div>
                        </>
                      )}
                      {achievement.unlocked && (
                        <div style={{
                          marginTop: "8px",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: "rgba(34,197,94,0.2)",
                          border: "1px solid rgba(34,197,94,0.5)",
                          fontSize: "9px",
                          fontWeight: 700,
                          color: "#22c55e",
                        }}>
                          UNLOCKED
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WEEKLY CHALLENGE */}
            <div style={{
              padding: "clamp(20px, 4vw, 24px)",
              borderRadius: "clamp(16px, 3vw, 20px)",
              border: "2px solid rgba(249,115,22,0.5)",
              background: "linear-gradient(135deg, rgba(30,27,75,0.98) 0%, rgba(15,23,42,0.98) 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              backdropFilter: "blur(20px)",
              marginBottom: "clamp(20px, 4vw, 24px)",
            }}>
              <h2 style={{
                fontSize: "clamp(18px, 4vw, 22px)",
                fontWeight: 900,
                marginBottom: "clamp(16px, 3vw, 20px)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#fb923c",
              }}>
                <Flame style={{ width: "24px", height: "24px" }} />
                Weekly Challenge
              </h2>

              <div style={{
                padding: "20px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(234,88,12,0.15))",
                border: "2px solid rgba(249,115,22,0.5)",
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}>
                  <span style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#e5e7eb",
                  }}>
                    Play 10 rounds this week
                  </span>
                  <span style={{
                    fontSize: "20px",
                    fontWeight: 900,
                    color: "#fb923c",
                  }}>
                    {weekly_challenge.current}/{weekly_challenge.target}
                  </span>
                </div>

                <div style={{
                  width: "100%",
                  height: "12px",
                  borderRadius: "999px",
                  background: "rgba(15,23,42,0.8)",
                  overflow: "hidden",
                  marginBottom: "12px",
                }}>
                  <div style={{
                    width: `${(weekly_challenge.current / weekly_challenge.target) * 100}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #f97316, #fb923c)",
                    transition: "width 1s ease",
                    boxShadow: "0 0 10px rgba(251,146,60,0.6)",
                  }} />
                </div>

                {weekly_challenge.completed ? (
                  <div style={{
                    padding: "12px",
                    borderRadius: "10px",
                    background: "rgba(34,197,94,0.2)",
                    border: "1px solid rgba(34,197,94,0.5)",
                    textAlign: "center",
                  }}>
                    <CheckCircle style={{
                      width: "20px",
                      height: "20px",
                      color: "#22c55e",
                      marginBottom: "4px",
                      display: "inline-block",
                    }} />
                    <div style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#22c55e",
                    }}>
                      Challenge Complete! 🎉
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "#86efac",
                      marginTop: "4px",
                    }}>
                      Reward: +1 Free Round
                    </div>
                  </div>
                ) : (
                  <div style={{
                    fontSize: "12px",
                    color: "#cbd5e1",
                    textAlign: "center",
                  }}>
                    {weekly_challenge.target - weekly_challenge.current} more rounds to complete
                  </div>
                )}
              </div>
            </div>

            {/* PERSONAL BESTS & RANKINGS */}
            <div className="mobile-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "clamp(16px, 3vw, 20px)",
              marginBottom: "clamp(20px, 4vw, 24px)",
            }}>
              
              {/* Personal Bests */}
              <div style={{
                padding: "clamp(20px, 4vw, 24px)",
                borderRadius: "clamp(16px, 3vw, 20px)",
                border: "2px solid rgba(217,70,239,0.5)",
                background: "linear-gradient(135deg, rgba(30,27,75,0.98) 0%, rgba(15,23,42,0.98) 100%)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                backdropFilter: "blur(20px)",
              }}>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#e879f9",
                }}>
                  <Star style={{ width: "20px", height: "20px" }} />
                  Personal Bests
                </h3>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Highest Score</div>
                    <div style={{ fontSize: "24px", fontWeight: 900, color: "#fbbf24" }}>
                      {personal_bests.highest_score}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Best Accuracy</div>
                    <div style={{ fontSize: "24px", fontWeight: 900, color: "#a78bfa" }}>
                      {personal_bests.best_accuracy.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Perfect Rounds</div>
                    <div style={{ fontSize: "24px", fontWeight: 900, color: "#22c55e" }}>
                      {personal_bests.perfect_rounds}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Total Rounds</div>
                    <div style={{ fontSize: "24px", fontWeight: 900, color: "#38bdf8" }}>
                      {personal_bests.total_rounds}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rankings */}
              <div style={{
                padding: "clamp(20px, 4vw, 24px)",
                borderRadius: "clamp(16px, 3vw, 20px)",
                border: "2px solid rgba(139,92,246,0.5)",
                background: "linear-gradient(135deg, rgba(30,27,75,0.98) 0%, rgba(15,23,42,0.98) 100%)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                backdropFilter: "blur(20px)",
              }}>
                <h3 style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#a78bfa",
                }}>
                  <Crown style={{ width: "20px", height: "20px" }} />
                  Your Rankings
                </h3>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}>
                  <div style={{
                    padding: "12px",
                    borderRadius: "10px",
                    background: "rgba(139,92,246,0.15)",
                    border: "1px solid rgba(139,92,246,0.3)",
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <span style={{ fontSize: "13px", color: "#cbd5e1" }}>Weekly Rank</span>
                      <span style={{ fontSize: "20px", fontWeight: 900, color: "#a78bfa" }}>
                        {rankings.weekly_rank ? `#${rankings.weekly_rank}` : "-"}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    padding: "12px",
                    borderRadius: "10px",
                    background: "rgba(56,189,248,0.15)",
                    border: "1px solid rgba(56,189,248,0.3)",
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <span style={{ fontSize: "13px", color: "#cbd5e1" }}>Monthly Rank</span>
                      <span style={{ fontSize: "20px", fontWeight: 900, color: "#38bdf8" }}>
                        {rankings.monthly_rank ? `#${rankings.monthly_rank}` : "-"}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    padding: "12px",
                    borderRadius: "10px",
                    background: "rgba(34,197,94,0.15)",
                    border: "1px solid rgba(34,197,94,0.3)",
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <span style={{ fontSize: "13px", color: "#cbd5e1" }}>Country</span>
                      <span style={{ fontSize: "20px" }}>
                        {profile.country}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TODAY & MONTH STATS */}
            {(today_stats || month_stats) && (
              <div style={{
                padding: "clamp(20px, 4vw, 24px)",
                borderRadius: "clamp(16px, 3vw, 20px)",
                border: "2px solid rgba(56,189,248,0.5)",
                background: "linear-gradient(135deg, rgba(8,47,73,0.98), rgba(6,8,20,0.98))",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(56,189,248,0.4)",
                backdropFilter: "blur(20px)",
                marginBottom: "clamp(20px, 4vw, 24px)",
              }}>
                <h2 style={{
                  fontSize: "clamp(18px, 4vw, 22px)",
                  fontWeight: 900,
                  marginBottom: "clamp(16px, 3vw, 20px)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#7dd3fc",
                }}>
                  <TrendingUp style={{ width: "24px", height: "24px" }} />
                  Recent Statistics
                </h2>

                <div className="mobile-grid" style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "clamp(16px, 3vw, 20px)",
                }}>
                  
                  {/* Today */}
                  {today_stats && (
                    <div style={{
                      padding: "clamp(16px, 3vw, 20px)",
                      borderRadius: "14px",
                      background: "rgba(34,197,94,0.15)",
                      border: "2px solid rgba(34,197,94,0.5)",
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "12px",
                      }}>
                        <Clock style={{ width: "20px", height: "20px", color: "#22c55e" }} />
                        <h3 style={{
                          fontSize: "16px",
                          fontWeight: 800,
                          color: "#22c55e",
                          textTransform: "uppercase",
                        }}>
                          Today
                        </h3>
                      </div>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}>
                        <div>
                          <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Rounds</div>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#fbbf24" }}>
                            {today_stats.rounds_played}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Score</div>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#fbbf24" }}>
                            {today_stats.total_score}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Correct</div>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#22c55e" }}>
                            {today_stats.correct_answers}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Accuracy</div>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#a78bfa" }}>
                            {today_stats.accuracy_percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* This Month */}
                  {month_stats && (
                    <div style={{
                      padding: "clamp(16px, 3vw, 20px)",
                      borderRadius: "14px",
                      background: "rgba(56,189,248,0.15)",
                      border: "2px solid rgba(56,189,248,0.5)",
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "12px",
                      }}>
                        <Calendar style={{ width: "20px", height: "20px", color: "#7dd3fc" }} />
                        <h3 style={{
                          fontSize: "16px",
                          fontWeight: 800,
                          color: "#7dd3fc",
                          textTransform: "uppercase",
                        }}>
                          This Month
                        </h3>
                      </div>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}>
                        <div>
                          <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Rounds</div>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#fbbf24" }}>
                            {month_stats.rounds_played}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Score</div>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#fbbf24" }}>
                            {month_stats.total_score}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Correct</div>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#22c55e" }}>
                            {month_stats.correct_answers}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Accuracy</div>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#a78bfa" }}>
                            {month_stats.accuracy_percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QUIZ HISTORY */}
            {recent_history.length > 0 && (
              <div style={{
                padding: "clamp(20px, 4vw, 24px)",
                borderRadius: "clamp(16px, 3vw, 20px)",
                border: "2px solid rgba(139,92,246,0.5)",
                background: "linear-gradient(135deg, rgba(30,27,75,0.98) 0%, rgba(15,23,42,0.98) 100%)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                backdropFilter: "blur(20px)",
                marginBottom: "clamp(20px, 4vw, 24px)",
              }}>
                <h2 style={{
                  fontSize: "clamp(18px, 4vw, 22px)",
                  fontWeight: 900,
                  marginBottom: "clamp(16px, 3vw, 20px)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <Activity style={{
                    width: "24px",
                    height: "24px",
                    color: "#a78bfa",
                  }} />
                  Recent Quiz History
                </h2>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}>
                  {recent_history.map((round) => (
                    <div
                      key={round.id}
                      style={{
                        padding: "clamp(12px, 2.5vw, 16px)",
                        borderRadius: "12px",
                        background: "rgba(15,23,42,0.8)",
                        border: "1px solid rgba(139,92,246,0.3)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}>
                      
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          background: "rgba(139,92,246,0.15)",
                          border: "1px solid rgba(139,92,246,0.3)",
                        }}>
                          <Clock style={{ width: "14px", height: "14px", color: "#a78bfa" }} />
                          <span style={{ fontSize: "clamp(10px, 2vw, 11px)", color: "#cbd5e1" }}>
                            {new Date(round.created_at).toLocaleDateString("en-US", { 
                              month: "short", 
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>

                        <div style={{
                          padding: "6px 10px",
                          borderRadius: "8px",
                          background: round.source === "live" 
                            ? "linear-gradient(90deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15))"
                            : "linear-gradient(90deg, rgba(56,189,248,0.2), rgba(14,165,233,0.15))",
                          border: `1px solid ${round.source === "live" ? "rgba(251,191,36,0.5)" : "rgba(56,189,248,0.5)"}`,
                        }}>
                          <span style={{ 
                            fontSize: "clamp(11px, 2.2vw, 12px)", 
                            fontWeight: 700, 
                            color: round.source === "live" ? "#fbbf24" : "#38bdf8",
                            textTransform: "uppercase",
                          }}>
                            {round.source}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                        gap: "8px",
                      }}>
                        <div>
                          <div style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 900, color: "#fbbf24" }}>
                            {round.score}
                          </div>
                          <div style={{ fontSize: "clamp(9px, 2vw, 10px)", color: "#94a3b8" }}>Score</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 900, color: "#22c55e" }}>
                            {round.correct_answers}
                          </div>
                          <div style={{ fontSize: "clamp(9px, 2vw, 10px)", color: "#94a3b8" }}>Correct</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 900, color: "#ef4444" }}>
                            {round.wrong_answers}
                          </div>
                          <div style={{ fontSize: "clamp(9px, 2vw, 10px)", color: "#94a3b8" }}>Wrong</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 900, color: "#a78bfa" }}>
                            {round.correct_answers + round.wrong_answers > 0 
                              ? Math.round((round.correct_answers / (round.correct_answers + round.wrong_answers)) * 100)
                              : 0}%
                          </div>
                          <div style={{ fontSize: "clamp(9px, 2vw, 10px)", color: "#94a3b8" }}>Accuracy</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTACT SUPPORT */}
            <div style={{
              padding: "clamp(20px, 4vw, 24px)",
              borderRadius: "clamp(16px, 3vw, 20px)",
              border: "2px solid rgba(56,189,248,0.5)",
              background: "linear-gradient(135deg, rgba(8,47,73,0.98), rgba(6,8,20,0.98))",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              backdropFilter: "blur(20px)",
              marginBottom: "clamp(20px, 4vw, 24px)",
            }}>
              <h2 style={{
                fontSize: "clamp(18px, 4vw, 22px)",
                fontWeight: 900,
                marginBottom: "clamp(12px, 3vw, 16px)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#7dd3fc",
              }}>
                <Send style={{ width: "24px", height: "24px" }} />
                Need Help?
              </h2>

              <p style={{
                fontSize: "14px",
                color: "#cbd5e1",
                marginBottom: "16px",
              }}>
                Have a question or need assistance? Our support team is here to help!
              </p>

              <div style={{
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(56,189,248,0.1)",
                border: "1px solid rgba(56,189,248,0.3)",
                marginBottom: "16px",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "4px",
                }}>
                  <Mail style={{ width: "16px", height: "16px", color: "#7dd3fc" }} />
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#7dd3fc" }}>
                    team@vibraxx.com
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginLeft: "24px" }}>
                  We typically respond within 24 hours
                </p>
              </div>

              <button
                onClick={() => setShowContactForm(true)}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  borderRadius: "12px",
                  border: "none",
                  background: "linear-gradient(135deg, #0ea5e9, #7dd3fc)",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.3s",
                  boxShadow: "0 0 20px rgba(14,165,233,0.5)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(14,165,233,0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(14,165,233,0.5)";
                }}>
                <Send style={{ width: "18px", height: "18px" }} />
                <span>Send Message</span>
              </button>
            </div>

          </main>
        </div>
       
        <Footer />
      </div>

      {/* ✅ CONTACT EMAIL - Simple display */}
{showContactForm && (
  <div style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.8)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  }}
  onClick={() => setShowContactForm(false)}>
    <div style={{
      background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))",
      borderRadius: "20px",
      border: "2px solid rgba(56,189,248,0.3)",
      maxWidth: "500px",
      width: "100%",
      padding: "32px",
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
    }}
    onClick={(e) => e.stopPropagation()}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
      }}>
        <h3 style={{
          fontSize: "clamp(18px, 4vw, 22px)",
          fontWeight: 900,
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <Send style={{ width: "24px", height: "24px", color: "#7dd3fc" }} />
          Contact Support
        </h3>
        <button
          onClick={() => setShowContactForm(false)}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            border: "none",
            background: "rgba(239,68,68,0.2)",
            color: "#fca5a5",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <X style={{ width: "20px", height: "20px" }} />
        </button>
      </div>

      <div style={{
        textAlign: "center",
        padding: "24px 0",
      }}>
        <Mail style={{
          width: "64px",
          height: "64px",
          color: "#38bdf8",
          margin: "0 auto 20px",
        }} />
        
        <p style={{
          fontSize: "16px",
          color: "#94a3b8",
          marginBottom: "16px",
        }}>
          Need help? Contact our support team:
        </p>

        
         <a
          href="mailto:team@vibraxx.com"
          style={{
            display: "inline-block",
            fontSize: "20px",
            fontWeight: 700,
            color: "#38bdf8",
            textDecoration: "none",
            padding: "12px 24px",
            background: "rgba(56,189,248,0.1)",
            borderRadius: "12px",
            border: "2px solid rgba(56,189,248,0.3)",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(56,189,248,0.2)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(56,189,248,0.1)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          team@vibraxx.com
        </a>

        <p style={{
          fontSize: "14px",
          color: "#64748b",
          marginTop: "20px",
        }}>
          We typically respond within 24 hours
        </p>
      </div>
    </div>
  </div>
)}
</>
);
}