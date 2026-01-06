"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import CountryPicker from "@/components/CountryPicker";
import {
  User,
  Mail,
  Trophy,
  Target,
  Flame,
  TrendingUp,
  Calendar,
  Award,
  Star,
  Crown,
  LogOut,
  Edit,
  Save,
  X,
  Send,
  CheckCircle,
  XCircle,
  BarChart3,
  Clock,
  Zap,
  Shield,
  Gift,
  Settings,
  ChevronRight,
} from "lucide-react";

interface UserStats {
  total_questions_answered: number;
  correct_answers: number;
  wrong_answers: number;
  accuracy_percentage: number;
  max_streak: number;
  last_round_score: number;
  total_score: number;
}

interface QuizHistory {
  id: number;
  score: number;
  correct_count: number;
  wrong_count: number;
  accuracy: number;
  max_streak: number;
  completed_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  country?: string;
  created_at: string;
}

interface DetailedStats {
  today: {
    rounds_played: number;
    total_questions: number;
    correct: number;
    wrong: number;
    accuracy: number;
    total_score: number;
  };
  thisMonth: {
    rounds_played: number;
    total_questions: number;
    correct: number;
    wrong: number;
    accuracy: number;
    total_score: number;
  };
  lastRound: QuizHistory | null;
}

export default function ProfilePage() {
  const router = useRouter();

  // State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);
  const [userRounds, setUserRounds] = useState(0);
  const [totalPurchasedRounds, setTotalPurchasedRounds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(true);
  const [securityPassed, setSecurityPassed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCountry, setEditCountry] = useState("🌍"); // Country edit state
  const [isSaving, setIsSaving] = useState(false);
  
  // Contact form
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "success" | "error">("idle");

  // 🔐 === SECURITY CHECK - AUTHENTICATION ===
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log("🔐 Profile Security: Starting verification...");

        // CHECK: User authentication
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          console.log("❌ Profile Security: Not authenticated");
          router.push("/");
          return;
        }

        console.log("✅ Profile Security: User authenticated -", authUser.id);
        console.log("✅ Profile Security: All checks passed!");

        setSecurityPassed(true);
        setIsVerifying(false);

      } catch (error) {
        console.error("❌ Profile Security: Verification error", error);
        router.push("/");
      }
    };

    verifyAuth();
  }, [router]);


  // === FETCH USER DATA (Optimized with RPC and correct tables) ===
  useEffect(() => {
    if (!securityPassed) return;

    const fetchUserData = async () => {
      setIsLoading(true);

      try {
        // Get authenticated user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        // Fetch profile from profiles table
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, round_credits, country")
          .eq("id", authUser.id)
          .single();

        // Set user profile
        setUser({
          id: authUser.id,
          email: authUser.email || "",
          full_name: profileData?.full_name || authUser.user_metadata?.full_name || "User",
          avatar_url: profileData?.avatar_url || authUser.user_metadata?.avatar_url || "",
          country: profileData?.country || authUser.user_metadata?.country || "🌍",
          created_at: authUser.created_at,
        });
        setEditName(profileData?.full_name || authUser.user_metadata?.full_name || "User");
        setEditCountry(profileData?.country || authUser.user_metadata?.country || "🌍");

        // ✅ Get user round credits using RPC
        const { data: creditsData } = await supabase.rpc('get_my_round_credits');
        setUserRounds(creditsData || 0);
        setTotalPurchasedRounds(0); // Can be calculated from payment history if needed

        // ✅ Fetch all-time stats from leaderboard_alltime
        const { data: alltimeStats } = await supabase
          .from("leaderboard_alltime")
          .select("*")
          .eq("user_id", authUser.id)
          .single();

        // ✅ Fetch recent round history from user_round_results
        const { data: recentRounds } = await supabase
          .from("user_round_results")
          .select("*")
          .eq("user_id", authUser.id)
          .order("completed_at", { ascending: false })
          .limit(10);

        // ✅ FIX: Fetch today's stats using RPC (secure, no 406 error)
        const { data: todayStatsArray } = await supabase.rpc('get_user_leaderboard_position', {
          p_user_id: authUser.id,
          p_period: 'daily'
        });
        const todayStats = todayStatsArray && todayStatsArray.length > 0 ? todayStatsArray[0] : null;

        // ✅ FIX: Fetch this month's stats using RPC (secure, no 406 error)
        const { data: monthStatsArray } = await supabase.rpc('get_user_leaderboard_position', {
          p_user_id: authUser.id,
          p_period: 'monthly'
        });
        const monthStats = monthStatsArray && monthStatsArray.length > 0 ? monthStatsArray[0] : null;

        // Set overall stats (from all-time leaderboard)
        if (alltimeStats) {
          const totalQuestions = (alltimeStats.correct_answers || 0) + (alltimeStats.wrong_answers || 0);
          
          setStats({
            total_questions_answered: totalQuestions,
            correct_answers: alltimeStats.correct_answers || 0,
            wrong_answers: alltimeStats.wrong_answers || 0,
            accuracy_percentage: alltimeStats.accuracy || 0,
            max_streak: 0, // Can be added later if tracked
            last_round_score: recentRounds && recentRounds.length > 0 ? recentRounds[0].total_points : 0,
            total_score: alltimeStats.points || 0,
          });
        } else {
          // No stats yet - set defaults
          setStats({
            total_questions_answered: 0,
            correct_answers: 0,
            wrong_answers: 0,
            accuracy_percentage: 0,
            max_streak: 0,
            last_round_score: 0,
            total_score: 0,
          });
        }

        // Set history from recent rounds
        if (recentRounds && recentRounds.length > 0) {
          setHistory(recentRounds.map(round => ({
            id: round.id,
            score: round.total_points,
            correct_count: round.correct_answers,
            wrong_count: round.wrong_answers,
            accuracy: round.correct_answers + round.wrong_answers > 0 
              ? Math.round((round.correct_answers / (round.correct_answers + round.wrong_answers)) * 100)
              : 0,
            max_streak: 0,
            completed_at: round.completed_at,
          })));
        } else {
          setHistory([]);
        }

        // Set detailed stats (today & month) - Using RPC data
        setDetailedStats({
          today: {
            rounds_played: todayStats?.rounds_played || 0,
            total_questions: todayStats ? (todayStats.correct_answers + todayStats.wrong_answers) : 0,
            correct: todayStats?.correct_answers || 0,
            wrong: todayStats?.wrong_answers || 0,
            accuracy: todayStats?.accuracy || 0,
            total_score: todayStats?.points || 0,
          },
          thisMonth: {
            rounds_played: monthStats?.rounds_played || 0,
            total_questions: monthStats ? (monthStats.correct_answers + monthStats.wrong_answers) : 0,
            correct: monthStats?.correct_answers || 0,
            wrong: monthStats?.wrong_answers || 0,
            accuracy: monthStats?.accuracy || 0,
            total_score: monthStats?.points || 0,
          },
          lastRound: recentRounds && recentRounds.length > 0 ? {
            id: recentRounds[0].id,
            score: recentRounds[0].total_points,
            correct_count: recentRounds[0].correct_answers,
            wrong_count: recentRounds[0].wrong_answers,
            accuracy: recentRounds[0].correct_answers + recentRounds[0].wrong_answers > 0
              ? Math.round((recentRounds[0].correct_answers / (recentRounds[0].correct_answers + recentRounds[0].wrong_answers)) * 100)
              : 0,
            max_streak: 0,
            completed_at: recentRounds[0].completed_at,
          } : null,
        });

      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [securityPassed, router]);
  
  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user || !editName.trim()) return;

    setIsSaving(true);

    try {
      // Update user metadata (auth)
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          full_name: editName.trim(),
          country: editCountry
        }
      });

      // Update profiles table using RPC
      const { error: profileError } = await supabase.rpc('update_user_profile', {
        p_user_id: user.id,
        p_full_name: editName.trim(),
        p_country: editCountry
      });

      if (!authError && !profileError) {
        setUser({ ...user, full_name: editName.trim(), country: editCountry });
        setIsEditing(false);
      } else {
        console.error("Update errors:", { authError, profileError });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Send contact email
  const handleSendEmail = async () => {
    if (!user || !contactSubject.trim() || !contactMessage.trim()) return;

    setIsSendingEmail(true);
    setEmailStatus("idle");

    try {
      // Send email via API route
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_email: user.email,
          from_name: user.full_name,
          subject: contactSubject,
          message: contactMessage,
          user_id: user.id,
        }),
      });

      if (response.ok) {
        setEmailStatus("success");
        setContactMessage("");
        setContactSubject("");
        setTimeout(() => {
          setShowContactForm(false);
          setEmailStatus("idle");
        }, 2000);
      } else {
        setEmailStatus("error");
      }
    } catch (err) {
      console.error("Error sending email:", err);
      setEmailStatus("error");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // 🔐 === SECURITY VERIFICATION SCREEN ===
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
        <p style={{
          color: "#a78bfa",
          fontSize: "16px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          🔐 Verifying access...
        </p>
      </div>
    );
  }

  // Loading screen
  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div className="animate-pulse" style={{
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

  if (!user) {
    return null;
  }

  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-slide-up { animation: slideUp 0.4s ease-out; }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }

        @media (max-width: 768px) {
          .mobile-hide { display: none !important; }
          .mobile-grid { 
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .mobile-stack { flex-direction: column !important; }
          .detailed-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .stats-grid-item {
            min-width: 100% !important;
          }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)",
        backgroundSize: "400% 400%",
        animation: "shimmer 15s ease infinite",
        color: "white",
        padding: "clamp(20px, 5vw, 40px) clamp(16px, 4vw, 24px)",
      }}>
        
        {/* Header */}
        <header style={{
          maxWidth: "1200px",
          margin: "0 auto clamp(24px, 5vw, 40px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}>
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

        <main style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}>
          
          {/* Profile Card */}
          <div className="animate-slide-up" style={{
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
              flexDirection: "column",
              gap: "clamp(20px, 4vw, 24px)",
            }}>
              
              {/* Profile Header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "clamp(16px, 3vw, 20px)",
                flexWrap: "wrap",
              }}>
                
                {/* Avatar */}
                <div style={{
                  position: "relative",
                  width: "clamp(80px, 15vw, 100px)",
                  height: "clamp(80px, 15vw, 100px)",
                  borderRadius: "50%",
                  padding: "4px",
                  background: "linear-gradient(135deg, #7c3aed, #d946ef)",
                  boxShadow: "0 0 30px rgba(124,58,237,0.6)",
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
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.full_name}
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
                            gap: "4px",
                          }}>
                          <Save style={{ width: "16px", height: "16px" }} />
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditName(user.full_name);
                            setEditCountry(user.country || '🌍');
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
                      
                      {/* Country Picker */}
                      <div style={{ marginBottom: "8px" }}>
                        <CountryPicker
                          value={editCountry}
                          onChange={setEditCountry}
                          autoDetect={false}
                          showSearch={true}
                          size="sm"
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
                      {/* Country Flag */}
                      <span style={{ fontSize: "clamp(32px, 6vw, 40px)" }}>
                        {user.country || '🌍'}
                      </span>
                      <h1 style={{
                        fontSize: "clamp(20px, 4vw, 28px)",
                        fontWeight: 900,
                        background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}>
                        {user.full_name}
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
                    <span style={{ fontSize: "14px", color: "#cbd5e1" }}>{user.email}</span>
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
                  background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15))",
                  border: "2px solid rgba(251,191,36,0.5)",
                  textAlign: "center",
                }}>
                  <Gift style={{
                    width: "clamp(24px, 5vw, 32px)",
                    height: "clamp(24px, 5vw, 32px)",
                    color: "#fbbf24",
                    margin: "0 auto 4px",
                  }} />
                  <div style={{
                    fontSize: "clamp(24px, 5vw, 32px)",
                    fontWeight: 900,
                    color: "#fbbf24",
                    lineHeight: 1,
                  }}>
                    {userRounds}
                  </div>
                  <div style={{
                    fontSize: "clamp(11px, 2.2vw, 12px)",
                    color: "#fcd34d",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    marginTop: "4px",
                  }}>
                    Rounds Left
                  </div>
                </div>
              </div>

              {/* Contact Support Button */}
              <button
                onClick={() => setShowContactForm(true)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "2px solid rgba(56,189,248,0.5)",
                  background: "rgba(8,47,73,0.5)",
                  color: "#7dd3fc",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#0ea5e9";
                  e.currentTarget.style.background = "rgba(56,189,248,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(56,189,248,0.5)";
                  e.currentTarget.style.background = "rgba(8,47,73,0.5)";
                }}>
                <Send style={{ width: "18px", height: "18px" }} />
                <span>Contact Support - team@vibraxx.com</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="mobile-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "clamp(12px, 3vw, 16px)",
              marginBottom: "clamp(20px, 4vw, 24px)",
            }}>
              
              {/* Total Score */}
              <div className="animate-slide-up" style={{
                padding: "clamp(16px, 3vw, 20px)",
                borderRadius: "clamp(14px, 3vw, 16px)",
                background: "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15))",
                border: "2px solid rgba(251,191,36,0.5)",
                boxShadow: "0 0 20px rgba(251,191,36,0.3)",
              }}>
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
                  {stats.total_score}
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
              <div className="animate-slide-up" style={{
                padding: "clamp(16px, 3vw, 20px)",
                borderRadius: "clamp(14px, 3vw, 16px)",
                background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(124,58,237,0.15))",
                border: "2px solid rgba(139,92,246,0.5)",
                boxShadow: "0 0 20px rgba(139,92,246,0.3)",
              }}>
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

              {/* Max Streak */}
              <div className="animate-slide-up" style={{
                padding: "clamp(16px, 3vw, 20px)",
                borderRadius: "clamp(14px, 3vw, 16px)",
                background: "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(234,88,12,0.15))",
                border: "2px solid rgba(249,115,22,0.5)",
                boxShadow: "0 0 20px rgba(249,115,22,0.3)",
              }}>
                <Flame style={{
                  width: "clamp(24px, 5vw, 32px)",
                  height: "clamp(24px, 5vw, 32px)",
                  color: "#fb923c",
                  marginBottom: "8px",
                }} />
                <div style={{
                  fontSize: "clamp(24px, 5vw, 32px)",
                  fontWeight: 900,
                  color: "#fb923c",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}>
                  {stats.max_streak}
                </div>
                <div style={{
                  fontSize: "clamp(11px, 2.2vw, 12px)",
                  color: "#fdba74",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}>
                  Max Streak
                </div>
              </div>

              {/* Total Questions */}
              <div className="animate-slide-up" style={{
                padding: "clamp(16px, 3vw, 20px)",
                borderRadius: "clamp(14px, 3vw, 16px)",
                background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(21,128,61,0.15))",
                border: "2px solid rgba(34,197,94,0.5)",
                boxShadow: "0 0 20px rgba(34,197,94,0.3)",
              }}>
                <CheckCircle style={{
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
                  {stats.correct_answers}
                </div>
                <div style={{
                  fontSize: "clamp(11px, 2.2vw, 12px)",
                  color: "#86efac",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}>
                  Correct Answers
                </div>
              </div>
            </div>
          )}

          {/* Detailed Stats - Last Round, Today, This Month */}
          {detailedStats && (
            <div className="animate-slide-up" style={{
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
                <TrendingUp style={{
                  width: "clamp(20px, 4vw, 24px)",
                  height: "clamp(20px, 4vw, 24px)",
                }} />
                Detailed Statistics
              </h2>

              <div className="mobile-grid detailed-stats-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "clamp(16px, 3vw, 20px)",
              }}>
                
                {/* Last Round */}
                {detailedStats.lastRound && (
                  <div style={{
                    padding: "clamp(16px, 3vw, 20px)",
                    borderRadius: "14px",
                    background: "rgba(217,70,239,0.15)",
                    border: "2px solid rgba(217,70,239,0.5)",
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "12px",
                    }}>
                      <Zap style={{ width: "20px", height: "20px", color: "#e879f9" }} />
                      <h3 style={{
                        fontSize: "16px",
                        fontWeight: 800,
                        color: "#e879f9",
                        textTransform: "uppercase",
                      }}>
                        Last Round
                      </h3>
                    </div>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}>
                      <div>
                        <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Score</div>
                        <div style={{ fontSize: "20px", fontWeight: 900, color: "#fbbf24" }}>
                          {detailedStats.lastRound.score}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Accuracy</div>
                        <div style={{ fontSize: "20px", fontWeight: 900, color: "#a78bfa" }}>
                          {detailedStats.lastRound.accuracy.toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Correct</div>
                        <div style={{ fontSize: "20px", fontWeight: 900, color: "#22c55e" }}>
                          {detailedStats.lastRound.correct_count}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Wrong</div>
                        <div style={{ fontSize: "20px", fontWeight: 900, color: "#ef4444" }}>
                          {detailedStats.lastRound.wrong_count}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      marginTop: "12px",
                      paddingTop: "12px",
                      borderTop: "1px solid rgba(217,70,239,0.3)",
                      fontSize: "11px",
                      color: "#94a3b8",
                    }}>
                      {new Date(detailedStats.lastRound.completed_at).toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Today */}
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
                        {detailedStats.today.rounds_played}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Score</div>
                      <div style={{ fontSize: "20px", fontWeight: 900, color: "#fbbf24" }}>
                        {detailedStats.today.total_score}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Correct</div>
                      <div style={{ fontSize: "20px", fontWeight: 900, color: "#22c55e" }}>
                        {detailedStats.today.correct}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Wrong</div>
                      <div style={{ fontSize: "20px", fontWeight: 900, color: "#ef4444" }}>
                        {detailedStats.today.wrong}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(34,197,94,0.3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>Accuracy</span>
                    <span style={{ fontSize: "16px", fontWeight: 900, color: "#a78bfa" }}>
                      {detailedStats.today.accuracy.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* This Month */}
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
                        {detailedStats.thisMonth.rounds_played}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Score</div>
                      <div style={{ fontSize: "20px", fontWeight: 900, color: "#fbbf24" }}>
                        {detailedStats.thisMonth.total_score}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Correct</div>
                      <div style={{ fontSize: "20px", fontWeight: 900, color: "#22c55e" }}>
                        {detailedStats.thisMonth.correct}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Wrong</div>
                      <div style={{ fontSize: "20px", fontWeight: 900, color: "#ef4444" }}>
                        {detailedStats.thisMonth.wrong}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(56,189,248,0.3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>Accuracy</span>
                    <span style={{ fontSize: "16px", fontWeight: 900, color: "#a78bfa" }}>
                      {detailedStats.thisMonth.accuracy.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Round Info */}
              <div style={{
                marginTop: "clamp(16px, 3vw, 20px)",
                padding: "clamp(14px, 3vw, 16px)",
                borderRadius: "12px",
                background: "rgba(251,191,36,0.15)",
                border: "1px solid rgba(251,191,36,0.3)",
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Shield style={{ width: "18px", height: "18px", color: "#fbbf24" }} />
                    <span style={{ fontSize: "clamp(13px, 3vw, 14px)", fontWeight: 700, color: "#fcd34d" }}>
                      Round Status
                    </span>
                  </div>
                  <div style={{
                    display: "flex",
                    gap: "clamp(12px, 3vw, 20px)",
                    flexWrap: "wrap",
                  }}>
                    <div>
                      <span style={{ fontSize: "clamp(10px, 2vw, 11px)", color: "#94a3b8" }}>Available: </span>
                      <span style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 900, color: "#22c55e" }}>
                        {userRounds}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: "clamp(10px, 2vw, 11px)", color: "#94a3b8" }}>Purchased: </span>
                      <span style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 900, color: "#a78bfa" }}>
                        {totalPurchasedRounds}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: "clamp(10px, 2vw, 11px)", color: "#94a3b8" }}>Used: </span>
                      <span style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 900, color: "#fb923c" }}>
                        {Math.max(0, totalPurchasedRounds - userRounds)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz History */}
          {history.length > 0 && (
            <div className="animate-slide-up" style={{
              padding: "clamp(20px, 4vw, 24px)",
              borderRadius: "clamp(16px, 3vw, 20px)",
              border: "2px solid rgba(139,92,246,0.5)",
              background: "linear-gradient(135deg, rgba(30,27,75,0.98) 0%, rgba(15,23,42,0.98) 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              backdropFilter: "blur(20px)",
            }}>
              
              <h2 style={{
                fontSize: "clamp(18px, 4vw, 22px)",
                fontWeight: 900,
                marginBottom: "clamp(16px, 3vw, 20px)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
                <BarChart3 style={{
                  width: "clamp(20px, 4vw, 24px)",
                  height: "clamp(20px, 4vw, 24px)",
                  color: "#a78bfa",
                }} />
                Recent Quiz History
              </h2>

              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}>
                {history.map((round) => (
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
                      {/* Date */}
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
                        <span style={{ fontSize: "clamp(10px, 2vw, 11px)", color: "#cbd5e1", whiteSpace: "nowrap" }}>
                          {new Date(round.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      {/* Streak Badge */}
                      <div style={{
                        padding: "6px 10px",
                        borderRadius: "8px",
                        background: "linear-gradient(90deg, rgba(249,115,22,0.2), rgba(234,88,12,0.15))",
                        border: "1px solid rgba(249,115,22,0.5)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        whiteSpace: "nowrap",
                      }}>
                        <Flame style={{ width: "14px", height: "14px", color: "#fb923c" }} />
                        <span style={{ fontSize: "clamp(11px, 2.2vw, 12px)", fontWeight: 700, color: "#fb923c" }}>
                          {round.max_streak}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))",
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
                          {round.correct_count}
                        </div>
                        <div style={{ fontSize: "clamp(9px, 2vw, 10px)", color: "#94a3b8" }}>Correct</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 900, color: "#a78bfa" }}>
                          {round.accuracy.toFixed(0)}%
                        </div>
                        <div style={{ fontSize: "clamp(9px, 2vw, 10px)", color: "#94a3b8" }}>Accuracy</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}>
            <div className="animate-slide-up" style={{
              width: "min(500px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "clamp(24px, 5vw, 32px)",
              borderRadius: "clamp(16px, 3vw, 20px)",
              background: "linear-gradient(135deg, rgba(30,27,75,0.98), rgba(15,23,42,0.98))",
              border: "2px solid rgba(139,92,246,0.5)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(139,92,246,0.4)",
              backdropFilter: "blur(20px)",
            }}>
              
              {/* Header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
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

              {/* Contact Info */}
              <div style={{
                padding: "12px 16px",
                borderRadius: "12px",
                background: "rgba(56,189,248,0.1)",
                border: "1px solid rgba(56,189,248,0.3)",
                marginBottom: "20px",
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

              {/* Form */}
              {emailStatus === "success" ? (
                <div style={{
                  padding: "32px",
                  textAlign: "center",
                }}>
                  <CheckCircle style={{
                    width: "48px",
                    height: "48px",
                    color: "#22c55e",
                    margin: "0 auto 16px",
                  }} />
                  <h4 style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#22c55e",
                    marginBottom: "8px",
                  }}>
                    Message Sent!
                  </h4>
                  <p style={{ fontSize: "14px", color: "#94a3b8" }}>
                    We'll get back to you soon.
                  </p>
                </div>
              ) : (
                <>
                  {/* Subject */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#cbd5e1",
                      marginBottom: "8px",
                    }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="What can we help you with?"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: "2px solid rgba(139,92,246,0.5)",
                        background: "rgba(15,23,42,0.9)",
                        color: "white",
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  {/* Message */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#cbd5e1",
                      marginBottom: "8px",
                    }}>
                      Message
                    </label>
                    <textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Tell us more..."
                      rows={6}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: "2px solid rgba(139,92,246,0.5)",
                        background: "rgba(15,23,42,0.9)",
                        color: "white",
                        fontSize: "14px",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  {/* Error */}
                  {emailStatus === "error" && (
                    <div style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.4)",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}>
                      <XCircle style={{ width: "16px", height: "16px", color: "#ef4444" }} />
                      <span style={{ fontSize: "13px", color: "#fca5a5" }}>
                        Failed to send. Please try again or email us directly.
                      </span>
                    </div>
                  )}

                  {/* Send Button */}
                  <button
                    onClick={handleSendEmail}
                    disabled={isSendingEmail || !contactSubject.trim() || !contactMessage.trim()}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "12px",
                      border: "none",
                      background: (!contactSubject.trim() || !contactMessage.trim())
                        ? "rgba(139,92,246,0.3)"
                        : "linear-gradient(135deg, #7c3aed, #d946ef)",
                      color: "white",
                      fontSize: "15px",
                      fontWeight: 800,
                      cursor: (!contactSubject.trim() || !contactMessage.trim()) ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      transition: "all 0.3s",
                    }}>
                    {isSendingEmail ? (
                      <>
                        <div className="animate-pulse" style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "white",
                          animation: "spin 0.8s linear infinite",
                        }} />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send style={{ width: "18px", height: "18px" }} />
                        Send Message
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
