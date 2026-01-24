"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import CountryPicker from "@/components/CountryPicker";
import Footer from "@/components/Footer";
import {
  User, Mail, Trophy, Target, Flame, TrendingUp, Calendar, Award, Star, Crown,
  LogOut, Edit, Save, X, Send, CheckCircle, XCircle, BarChart3, Clock, Zap,
  Shield, Gift, ChevronRight, TrendingDown, Activity, Sparkles, ShoppingCart,
  AlertCircle, Medal, Rocket, Brain, Heart, Lock, Unlock, Volume2, VolumeX,
} from "lucide-react";

// ✅ TIER CONFIGURATION
const TIERS = {
  BRONZE: { min: 0, max: 500, name: "Bronze", icon: "🥉", color: "#cd7f32", gradient: "linear-gradient(135deg, #cd7f32, #b8651f)" },
  SILVER: { min: 500, max: 2000, name: "Silver", icon: "🥈", color: "#c0c0c0", gradient: "linear-gradient(135deg, #c0c0c0, #a8a8a8)" },
  GOLD: { min: 2000, max: 5000, name: "Gold", icon: "🥇", color: "#ffd700", gradient: "linear-gradient(135deg, #ffd700, #ffed4e)" },
  DIAMOND: { min: 5000, max: Infinity, name: "Diamond", icon: "💎", color: "#b9f2ff", gradient: "linear-gradient(135deg, #b9f2ff, #7dd3fc)" },
};

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  country?: string;
  created_at: string;
}

interface UserStats {
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

interface ScoreData {
  score: number;
  correct_answers: number;
  wrong_answers: number;
  source?: string;
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

interface PersonalBest {
  highest_score: number;
  best_accuracy: number;
  total_rounds: number;
  perfect_rounds: number;
}

interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon: string;
  color: string;
}

export default function ProfilePage() {
  const router = useRouter();

  // Core State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<RoundHistory[]>([]);
  const [todayStats, setTodayStats] = useState<UserStats | null>(null);
  const [monthStats, setMonthStats] = useState<UserStats | null>(null);
  const [weeklyRank, setWeeklyRank] = useState<number | null>(null);
  const [monthlyRank, setMonthlyRank] = useState<number | null>(null);
  const [liveCredits, setLiveCredits] = useState(0);
  const [chartData, setChartData] = useState<{ date: string; score: number }[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [personalBests, setPersonalBests] = useState<PersonalBest | null>(null);
  const [weeklyChallenge, setWeeklyChallenge] = useState<{ current: number; target: number }>({ current: 0, target: 10 });
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  
  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(true);
  const [securityPassed, setSecurityPassed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCountry, setEditCountry] = useState("🌍");
  const [isSaving, setIsSaving] = useState(false);
  
  // Background Music State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Contact Form State
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "success" | "error">("idle");

  // ✅ SEO
  useEffect(() => {
    document.title = "My Profile - VibraXX | UK Skill-Based Quiz Competition";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "View your VibraXX profile, stats, rankings, and achievements. Track your performance in the UK's premier skill-based quiz competition.");
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", "My Profile - VibraXX");

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", "Track your quiz performance, rankings, and achievements on VibraXX.");

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute("content", "https://vibraxx.com/og-profile.png");

    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (twitterCard) twitterCard.setAttribute("content", "summary_large_image");
  }, []);

  // ✅ BACKGROUND MUSIC
  useEffect(() => {
    // Create audio element
    const audio = new Audio("/sounds/vibraxx.mp3");
    audio.loop = true;
    audio.volume = 0.3; // 30% volume
    audioRef.current = audio;

    // Check localStorage for music preference
    const musicEnabled = localStorage.getItem("vibraxx_music_enabled");
    if (musicEnabled === "true") {
      setIsMusicPlaying(true);
    }

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle first interaction to enable audio
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        
        // If music should be playing, start it now
        const musicEnabled = localStorage.getItem("vibraxx_music_enabled");
        if (musicEnabled === "true" && audioRef.current) {
          audioRef.current.play().catch(err => {
            console.log("Audio autoplay blocked:", err);
          });
        }
      }
    };

    document.addEventListener("click", handleFirstInteraction, { once: true });
    
    return () => {
      document.removeEventListener("click", handleFirstInteraction);
    };
  }, [hasInteracted]);

  // Handle music play/pause
  useEffect(() => {
    if (!audioRef.current || !hasInteracted) return;

    if (isMusicPlaying) {
      audioRef.current.play().catch(err => {
        console.log("Audio play error:", err);
      });
      localStorage.setItem("vibraxx_music_enabled", "true");
    } else {
      audioRef.current.pause();
      localStorage.setItem("vibraxx_music_enabled", "false");
    }
  }, [isMusicPlaying, hasInteracted]);

  // Toggle music function
  const toggleMusic = useCallback(() => {
    setIsMusicPlaying(prev => !prev);
  }, []);

  // 🔐 SECURITY CHECK
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log("🔐 Profile Security: Starting verification...");

        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          console.log("❌ Profile Security: Not authenticated");
          router.push("/");
          return;
        }

        console.log("✅ Profile Security: User authenticated -", authUser.id);
        setSecurityPassed(true);
        setIsVerifying(false);

      } catch (error) {
        console.error("❌ Profile Security: Verification error", error);
        router.push("/");
      }
    };

    verifyAuth();
  }, [router]);

  // ✅ FETCH ALL USER DATA (YENİ SUPABASE ŞEMASI!)
  useEffect(() => {
    if (!securityPassed) return;

    const fetchUserData = async () => {
      setIsLoading(true);

      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        // 1️⃣ PROFILE
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, country, created_at")
          .eq("id", authUser.id)
          .single();

        setUser({
          id: authUser.id,
          email: authUser.email || "",
          full_name: profileData?.full_name || authUser.user_metadata?.full_name || "User",
          avatar_url: profileData?.avatar_url || authUser.user_metadata?.avatar_url || "",
          country: profileData?.country || authUser.user_metadata?.country || "🌍",
          created_at: profileData?.created_at || authUser.created_at,
        });
        setEditName(profileData?.full_name || "User");
        setEditCountry(profileData?.country || "🌍");

        // 2️⃣ LIVE CREDITS
        const { data: creditsData } = await supabase
          .from("user_credits")
          .select("live_credits")
          .eq("user_id", authUser.id)
          .single();

        setLiveCredits(creditsData?.live_credits || 0);

        // 3️⃣ ALL-TIME STATS
        const { data: allScores } = await supabase
          .from("score_ledger")
          .select("score, correct_answers, wrong_answers, source")
          .eq("user_id", authUser.id);

        if (allScores && allScores.length > 0) {
          const totalScore = allScores.reduce((sum, r) => sum + r.score, 0);
          const totalCorrect = allScores.reduce((sum, r) => sum + r.correct_answers, 0);
          const totalWrong = allScores.reduce((sum, r) => sum + r.wrong_answers, 0);
          const totalQuestions = totalCorrect + totalWrong;
          const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

          setStats({
            total_score: totalScore,
            total_questions: totalQuestions,
            correct_answers: totalCorrect,
            wrong_answers: totalWrong,
            accuracy_percentage: accuracy,
            rounds_played: allScores.length,
          });

          // Personal Bests
          const highestScore = Math.max(...allScores.map(r => r.score));
          const accuracies = allScores.map(r => {
            const total = r.correct_answers + r.wrong_answers;
            return total > 0 ? (r.correct_answers / total) * 100 : 0;
          });
          const bestAccuracy = Math.max(...accuracies);
          const perfectRounds = allScores.filter(r => 
            r.correct_answers > 0 && r.wrong_answers === 0
          ).length;

          setPersonalBests({
            highest_score: highestScore,
            best_accuracy: bestAccuracy,
            total_rounds: allScores.length,
            perfect_rounds: perfectRounds,
          });
        } else {
          setStats({
            total_score: 0,
            total_questions: 0,
            correct_answers: 0,
            wrong_answers: 0,
            accuracy_percentage: 0,
            rounds_played: 0,
          });
        }

        // 4️⃣ TODAY STATS
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);

        const { data: todayScores } = await supabase
          .from("score_ledger")
          .select("score, correct_answers, wrong_answers")
          .eq("user_id", authUser.id)
          .gte("created_at", todayStart.toISOString());

        if (todayScores && todayScores.length > 0) {
          const todayTotal = todayScores.reduce((sum, r) => sum + r.score, 0);
          const todayCorrect = todayScores.reduce((sum, r) => sum + r.correct_answers, 0);
          const todayWrong = todayScores.reduce((sum, r) => sum + r.wrong_answers, 0);
          const todayQuestions = todayCorrect + todayWrong;
          const todayAccuracy = todayQuestions > 0 ? (todayCorrect / todayQuestions) * 100 : 0;

          setTodayStats({
            total_score: todayTotal,
            total_questions: todayQuestions,
            correct_answers: todayCorrect,
            wrong_answers: todayWrong,
            accuracy_percentage: todayAccuracy,
            rounds_played: todayScores.length,
          });
        }

        // 5️⃣ THIS MONTH STATS
        const monthStart = new Date();
        monthStart.setUTCDate(1);
        monthStart.setUTCHours(0, 0, 0, 0);

        const { data: monthScores } = await supabase
          .from("score_ledger")
          .select("score, correct_answers, wrong_answers")
          .eq("user_id", authUser.id)
          .gte("created_at", monthStart.toISOString());

        if (monthScores && monthScores.length > 0) {
          const monthTotal = monthScores.reduce((sum, r) => sum + r.score, 0);
          const monthCorrect = monthScores.reduce((sum, r) => sum + r.correct_answers, 0);
          const monthWrong = monthScores.reduce((sum, r) => sum + r.wrong_answers, 0);
          const monthQuestions = monthCorrect + monthWrong;
          const monthAccuracy = monthQuestions > 0 ? (monthCorrect / monthQuestions) * 100 : 0;

          setMonthStats({
            total_score: monthTotal,
            total_questions: monthQuestions,
            correct_answers: monthCorrect,
            wrong_answers: monthWrong,
            accuracy_percentage: monthAccuracy,
            rounds_played: monthScores.length,
          });
        }

        // 6️⃣ WEEKLY CHALLENGE
        const weekStart = new Date();
        const dayOfWeek = weekStart.getUTCDay();
        weekStart.setUTCDate(weekStart.getUTCDate() - dayOfWeek);
        weekStart.setUTCHours(0, 0, 0, 0);

        const { data: weekScores } = await supabase
          .from("score_ledger")
          .select("id")
          .eq("user_id", authUser.id)
          .gte("created_at", weekStart.toISOString());

        setWeeklyChallenge({
          current: weekScores?.length || 0,
          target: 10,
        });

        // 7️⃣ RANKINGS
        const { data: weeklyLeaderboard } = await supabase
          .from("leaderboard_weekly")
          .select("rank")
          .eq("user_id", authUser.id)
          .maybeSingle();

        setWeeklyRank(weeklyLeaderboard?.rank || null);

        const { data: monthlyLeaderboard } = await supabase
          .from("leaderboard_monthly")
          .select("rank")
          .eq("user_id", authUser.id)
          .maybeSingle();

        setMonthlyRank(monthlyLeaderboard?.rank || null);

        // 8️⃣ RECENT HISTORY
        const { data: recentRounds } = await supabase
          .from("score_ledger")
          .select("id, round_id, score, correct_answers, wrong_answers, created_at, source")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false })
          .limit(10);

        setHistory(recentRounds || []);

        // 9️⃣ PERFORMANCE CHART
        const last7Days: { date: string; score: number }[] = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setUTCDate(date.getUTCDate() - i);
          date.setUTCHours(0, 0, 0, 0);
          
          const nextDay = new Date(date);
          nextDay.setUTCDate(nextDay.getUTCDate() + 1);

          const { data: dayScores } = await supabase
            .from("score_ledger")
            .select("score")
            .eq("user_id", authUser.id)
            .gte("created_at", date.toISOString())
            .lt("created_at", nextDay.toISOString());

          const totalScore = dayScores?.reduce((sum, r) => sum + r.score, 0) || 0;

          last7Days.push({
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            score: totalScore,
          });
        }

        setChartData(last7Days);

        // 🔟 ACHIEVEMENTS
        calculateAchievements(allScores || [], weekScores?.length || 0, weeklyLeaderboard?.rank, personalBests);

        // 1️⃣1️⃣ ACTIVITY FEED
        generateActivityFeed(recentRounds || [], allScores || [], weeklyLeaderboard?.rank, monthlyLeaderboard?.rank);

      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [securityPassed]);

  // ✅ CALCULATE ACHIEVEMENTS
  const calculateAchievements = useCallback((
    allScores: ScoreData[], 
    weekRoundsCount: number, 
    weekRank: number | null,
    bests: PersonalBest | null
  ) => {
    const totalRounds = allScores.length;
    const totalCorrect = allScores.reduce((sum, r) => sum + r.correct_answers, 0);
    const totalQuestions = allScores.reduce((sum, r) => sum + r.correct_answers + r.wrong_answers, 0);
    const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    const achievementsList: Achievement[] = [
      {
        id: "first_round",
        title: "First Steps",
        description: "Complete your first round",
        icon: "🎯",
        unlocked: totalRounds >= 1,
      },
      {
        id: "10_rounds",
        title: "Getting Started",
        description: "Complete 10 rounds",
        icon: "🔥",
        unlocked: totalRounds >= 10,
        progress: Math.min(totalRounds, 10),
        target: 10,
      },
      {
        id: "50_rounds",
        title: "Quiz Master",
        description: "Complete 50 rounds",
        icon: "👑",
        unlocked: totalRounds >= 50,
        progress: Math.min(totalRounds, 50),
        target: 50,
      },
      {
        id: "90_accuracy",
        title: "Accuracy Master",
        description: "Reach 90% overall accuracy",
        icon: "🎯",
        unlocked: accuracy >= 90,
        progress: Math.min(accuracy, 90),
        target: 90,
      },
      {
        id: "week_warrior",
        title: "Week Warrior",
        description: "Play 5 rounds this week",
        icon: "⚡",
        unlocked: weekRoundsCount >= 5,
        progress: Math.min(weekRoundsCount, 5),
        target: 5,
      },
      {
        id: "top_10",
        title: "Top 10 Player",
        description: "Reach top 10 in weekly leaderboard",
        icon: "🏆",
        unlocked: weekRank !== null && weekRank <= 10,
      },
      {
        id: "perfect_round",
        title: "Perfect Round",
        description: "Complete a round with no mistakes",
        icon: "💯",
        unlocked: bests !== null && bests.perfect_rounds > 0,
      },
      {
        id: "veteran",
        title: "Veteran Player",
        description: "Complete 100 rounds",
        icon: "🎖️",
        unlocked: totalRounds >= 100,
        progress: Math.min(totalRounds, 100),
        target: 100,
      },
    ];

    setAchievements(achievementsList);
  }, []);

  // ✅ GENERATE ACTIVITY FEED
  const generateActivityFeed = useCallback((
    recentRounds: RoundHistory[],
    allScores: ScoreData[],
    weekRank: number | null,
    monthRank: number | null
  ) => {
    const activities: ActivityItem[] = [];

    // Recent rounds
    recentRounds.slice(0, 3).forEach((round, index) => {
      if (index === 0) {
        activities.push({
          id: `round-${round.id}`,
          type: "round",
          message: `Scored ${round.score} points in a ${round.source} round`,
          timestamp: round.created_at,
          icon: "🎮",
          color: "#a78bfa",
        });
      }
    });

    // Weekly rank achievement
    if (weekRank && weekRank <= 10) {
      activities.push({
        id: "rank-weekly",
        type: "achievement",
        message: `Reached #${weekRank} in Weekly Leaderboard!`,
        timestamp: new Date().toISOString(),
        icon: "🏆",
        color: "#fbbf24",
      });
    }

    // High score
    if (allScores.length > 0) {
      const maxScore = Math.max(...allScores.map(s => s.score));
      if (maxScore >= 500) {
        activities.push({
          id: "high-score",
          type: "milestone",
          message: `Achieved personal best: ${maxScore} points!`,
          timestamp: new Date().toISOString(),
          icon: "⭐",
          color: "#22c55e",
        });
      }
    }

    setActivityFeed(activities.slice(0, 5));
  }, []);

  // ✅ GET TIER INFO
  const getTierInfo = useMemo(() => {
    return (totalScore: number) => {
      if (totalScore >= TIERS.DIAMOND.min) return TIERS.DIAMOND;
      if (totalScore >= TIERS.GOLD.min) return TIERS.GOLD;
      if (totalScore >= TIERS.SILVER.min) return TIERS.SILVER;
      return TIERS.BRONZE;
    };
  }, []);

  // ✅ GET NEXT TIER PROGRESS
  const getNextTierProgress = useMemo(() => {
    return (totalScore: number) => {
      const currentTier = getTierInfo(totalScore);
      if (currentTier.name === "Diamond") {
        return { progress: 100, nextTier: null, pointsNeeded: 0 };
      }

      const nextTierName = 
        currentTier.name === "Bronze" ? "Silver" : 
        currentTier.name === "Silver" ? "Gold" : "Diamond";
      
      const nextTier = Object.values(TIERS).find(t => t.name === nextTierName);
      
      if (!nextTier) return { progress: 100, nextTier: null, pointsNeeded: 0 };

      const progress = ((totalScore - currentTier.min) / (nextTier.min - currentTier.min)) * 100;
      const pointsNeeded = nextTier.min - totalScore;

      return { progress: Math.min(progress, 100), nextTier, pointsNeeded };
    };
  }, [getTierInfo]);

  // ✅ SAVE PROFILE
  const handleSaveProfile = useCallback(async () => {
    if (!user || !editName.trim()) return;

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
        .eq("id", user.id);

      if (!error) {
        setUser({ ...user, full_name: editName.trim(), country: editCountry });
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setIsSaving(false);
    }
  }, [user, editName, editCountry]);

  // ✅ SEND CONTACT EMAIL
  const handleSendEmail = useCallback(async () => {
    if (!user || !contactSubject.trim() || !contactMessage.trim()) return;

    setIsSendingEmail(true);
    setEmailStatus("idle");

    try {
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
  }, [user, contactSubject, contactMessage]);

  // ✅ LOGOUT
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/");
  }, [router]);

  // 🔐 SECURITY VERIFICATION SCREEN
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
        }}>
          🔐 Verifying access...
        </p>
      </div>
    );
  }

  // LOADING SCREEN
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

  if (!user || !stats) {
    return null;
  }

  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const currentTier = getTierInfo(stats.total_score);
  const nextTierProgress = getNextTierProgress(stats.total_score);
  const maxChartScore = Math.max(...chartData.map(d => d.score), 1);

  return (
    <>
      {/* ✅ SEO: Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": user.full_name,
            "email": user.email,
            "memberOf": {
              "@type": "Organization",
              "name": "VibraXX",
              "url": "https://vibraxx.com"
            }
          })
        }}
      />

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        body {
          overflow-x: hidden;
        }
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
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 40px rgba(239,68,68,0.8); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-slide-up { animation: slideUp 0.4s ease-out; }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }

        @media (max-width: 768px) {
          .mobile-hide { display: none !important; }
          .mobile-grid { 
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .mobile-stack { flex-direction: column !important; }
          button { min-height: 44px !important; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)",
        backgroundSize: "400% 400%",
        animation: "shimmer 15s ease infinite",
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

          <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
            
            {/* PROFILE CARD */}
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
                  background: liveCredits === 0 
                    ? "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(185,28,28,0.15))"
                    : "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.15))",
                  border: `2px solid ${liveCredits === 0 ? "rgba(239,68,68,0.5)" : "rgba(251,191,36,0.5)"}`,
                  textAlign: "center",
                  ...(liveCredits === 0 ? { animation: "glow 2s ease-in-out infinite" } : {}),
                }}>
                  <Gift style={{
                    width: "clamp(24px, 5vw, 32px)",
                    height: "clamp(24px, 5vw, 32px)",
                    color: liveCredits === 0 ? "#ef4444" : "#fbbf24",
                    margin: "0 auto 4px",
                  }} />
                  <div style={{
                    fontSize: "clamp(24px, 5vw, 32px)",
                    fontWeight: 900,
                    color: liveCredits === 0 ? "#ef4444" : "#fbbf24",
                    lineHeight: 1,
                  }}>
                    {liveCredits}
                  </div>
                  <div style={{
                    fontSize: "clamp(11px, 2.2vw, 12px)",
                    color: liveCredits === 0 ? "#fca5a5" : "#fcd34d",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    marginTop: "4px",
                  }}>
                    Rounds Left
                  </div>
                </div>
              </div>

              {/* BUY ROUNDS CTA */}
              {liveCredits === 0 && (
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
                  {nextTierProgress.nextTier && (
                    <div style={{
                      fontSize: "14px",
                      color: "#cbd5e1",
                    }}>
                      {nextTierProgress.pointsNeeded.toLocaleString()} pts to {nextTierProgress.nextTier.icon} {nextTierProgress.nextTier.name}
                    </div>
                  )}
                </div>
                
                {nextTierProgress.nextTier && (
                  <div style={{
                    width: "100%",
                    height: "12px",
                    borderRadius: "999px",
                    background: "rgba(15,23,42,0.8)",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${nextTierProgress.progress}%`,
                      height: "100%",
                      background: nextTierProgress.nextTier.gradient,
                      transition: "width 1s ease",
                      boxShadow: `0 0 10px ${nextTierProgress.nextTier.color}60`,
                    }} />
                  </div>
                )}
              </div>
            </div>

            {/* === MAIN STATS GRID === */}
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
              <div className="animate-slide-up" style={{
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
              <div className="animate-slide-up" style={{
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
              <div className="animate-slide-up" style={{
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

            {/* === PERFORMANCE CHART === */}
            {chartData.length > 0 && (
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
                  {chartData.map((day, index) => {
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

            {/* === ACHIEVEMENTS === */}
            {achievements.length > 0 && (
              <div className="animate-slide-up" style={{
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

            {/* === WEEKLY CHALLENGE === */}
            <div className="animate-slide-up" style={{
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
                    {weeklyChallenge.current}/{weeklyChallenge.target}
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
                    width: `${(weeklyChallenge.current / weeklyChallenge.target) * 100}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #f97316, #fb923c)",
                    transition: "width 1s ease",
                    boxShadow: "0 0 10px rgba(251,146,60,0.6)",
                  }} />
                </div>

                {weeklyChallenge.current >= weeklyChallenge.target ? (
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
                    {weeklyChallenge.target - weeklyChallenge.current} more rounds to complete
                  </div>
                )}
              </div>
            </div>

            {/* === PERSONAL BESTS & RANKINGS === */}
            <div className="mobile-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "clamp(16px, 3vw, 20px)",
              marginBottom: "clamp(20px, 4vw, 24px)",
            }}>
              
              {/* Personal Bests */}
              {personalBests && (
                <div className="animate-slide-up" style={{
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
                        {personalBests.highest_score}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Best Accuracy</div>
                      <div style={{ fontSize: "24px", fontWeight: 900, color: "#a78bfa" }}>
                        {personalBests.best_accuracy.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Perfect Rounds</div>
                      <div style={{ fontSize: "24px", fontWeight: 900, color: "#22c55e" }}>
                        {personalBests.perfect_rounds}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Total Rounds</div>
                      <div style={{ fontSize: "24px", fontWeight: 900, color: "#38bdf8" }}>
                        {personalBests.total_rounds}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rankings */}
              <div className="animate-slide-up" style={{
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
                        {weeklyRank ? `#${weeklyRank}` : "-"}
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
                        {monthlyRank ? `#${monthlyRank}` : "-"}
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
                        {user.country || '🌍'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* === TODAY & MONTH STATS === */}
            {(todayStats || monthStats) && (
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
                  <TrendingUp style={{ width: "24px", height: "24px" }} />
                  Recent Statistics
                </h2>

                <div className="mobile-grid" style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "clamp(16px, 3vw, 20px)",
                }}>
                  
                  {/* Today */}
                  {todayStats && (
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
                            {todayStats.rounds_played}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Score</div>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#fbbf24" }}>
                            {todayStats.total_score}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Correct</div>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#22c55e" }}>
                            {todayStats.correct_answers}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Accuracy</div>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#a78bfa" }}>
                            {todayStats.accuracy_percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* This Month */}
                  {monthStats && (
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
                            {monthStats.rounds_played}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Score</div>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#fbbf24" }}>
                            {monthStats.total_score}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Correct</div>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#22c55e" }}>
                            {monthStats.correct_answers}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#cbd5e1", marginBottom: "4px" }}>Accuracy</div>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#a78bfa" }}>
                            {monthStats.accuracy_percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* === QUIZ HISTORY === */}
            {history.length > 0 && (
              <div className="animate-slide-up" style={{
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

            {/* === CONTACT SUPPORT === */}
            <div className="animate-slide-up" style={{
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

        {/* === BACKGROUND MUSIC TOGGLE === */}
        <button
          onClick={toggleMusic}
          style={{
            position: "fixed",
            top: "clamp(20px, 4vw, 24px)",
            right: "clamp(20px, 4vw, 24px)",
            width: "clamp(48px, 10vw, 56px)",
            height: "clamp(48px, 10vw, 56px)",
            borderRadius: "50%",
            border: "2px solid rgba(139,92,246,0.5)",
            background: isMusicPlaying 
              ? "linear-gradient(135deg, rgba(139,92,246,0.95), rgba(124,58,237,0.95))"
              : "rgba(15,23,42,0.95)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 50,
            transition: "all 0.3s ease",
            boxShadow: isMusicPlaying 
              ? "0 0 20px rgba(139,92,246,0.6), 0 8px 16px rgba(0,0,0,0.4)"
              : "0 4px 12px rgba(0,0,0,0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1) rotate(5deg)";
            e.currentTarget.style.boxShadow = isMusicPlaying
              ? "0 0 30px rgba(139,92,246,0.8), 0 12px 20px rgba(0,0,0,0.5)"
              : "0 8px 16px rgba(0,0,0,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1) rotate(0deg)";
            e.currentTarget.style.boxShadow = isMusicPlaying
              ? "0 0 20px rgba(139,92,246,0.6), 0 8px 16px rgba(0,0,0,0.4)"
              : "0 4px 12px rgba(0,0,0,0.3)";
          }}
          title={isMusicPlaying ? "Mute Music" : "Play Music"}
          aria-label={isMusicPlaying ? "Mute background music" : "Play background music"}>
          {isMusicPlaying ? (
            <Volume2 style={{
              width: "clamp(20px, 5vw, 24px)",
              height: "clamp(20px, 5vw, 24px)",
              color: "white",
              animation: "pulse 2s ease-in-out infinite",
            }} />
          ) : (
            <VolumeX style={{
              width: "clamp(20px, 5vw, 24px)",
              height: "clamp(20px, 5vw, 24px)",
              color: "#94a3b8",
            }} />
          )}
        </button>

        <Footer />
      </div>

      {/* === CONTACT FORM MODAL === */}
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
          padding: "clamp(12px, 3vw, 20px)",
        }}
        onClick={() => setShowContactForm(false)}>
          <div className="animate-slide-up" style={{
            width: "min(500px, 100%)",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "clamp(20px, 4vw, 32px)",
            borderRadius: "clamp(14px, 3vw, 20px)",
            background: "linear-gradient(135deg, rgba(30,27,75,0.98), rgba(15,23,42,0.98))",
            border: "2px solid rgba(139,92,246,0.5)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(139,92,246,0.4)",
            backdropFilter: "blur(20px)",
          }}
          onClick={(e) => e.stopPropagation()}>
            
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
                      <div style={{
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
    </>
  );
}
