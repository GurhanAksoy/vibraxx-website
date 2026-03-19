"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { playMenuMusic, stopMenuMusic } from "@/lib/audioManager";
import dynamicImport from "next/dynamic";

const CountryPicker = dynamicImport(
  () => import("@/components/CountryPicker"),
  { ssr: false }
);

import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import {
  User, Mail, Trophy, Target, TrendingUp, Calendar, Crown,
  Edit, Save, X, Send, CheckCircle, BarChart3, Zap,
  Gift, Activity, Sparkles, ShoppingCart,
  AlertCircle, Volume2, VolumeX, Clock, Star, Flame,
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const FLAG_MAP: Record<string, string> = {
  AF:"🇦🇫",AL:"🇦🇱",DZ:"🇩🇿",AD:"🇦🇩",AO:"🇦🇴",AG:"🇦🇬",AR:"🇦🇷",AM:"🇦🇲",AU:"🇦🇺",AT:"🇦🇹",
  AZ:"🇦🇿",BS:"🇧🇸",BH:"🇧🇭",BD:"🇧🇩",BB:"🇧🇧",BY:"🇧🇾",BE:"🇧🇪",BZ:"🇧🇿",BJ:"🇧🇯",BT:"🇧🇹",
  BO:"🇧🇴",BA:"🇧🇦",BW:"🇧🇼",BR:"🇧🇷",BN:"🇧🇳",BG:"🇧🇬",BF:"🇧🇫",BI:"🇧🇮",CV:"🇨🇻",KH:"🇰🇭",
  CM:"🇨🇲",CA:"🇨🇦",CF:"🇨🇫",TD:"🇹🇩",CL:"🇨🇱",CN:"🇨🇳",CO:"🇨🇴",KM:"🇰🇲",CG:"🇨🇬",CD:"🇨🇩",
  CR:"🇨🇷",CI:"🇨🇮",HR:"🇭🇷",CU:"🇨🇺",CY:"🇨🇾",CZ:"🇨🇿",DK:"🇩🇰",DJ:"🇩🇯",DM:"🇩🇲",DO:"🇩🇴",
  EC:"🇪🇨",EG:"🇪🇬",SV:"🇸🇻",GQ:"🇬🇶",ER:"🇪🇷",EE:"🇪🇪",SZ:"🇸🇿",ET:"🇪🇹",FJ:"🇫🇯",FI:"🇫🇮",
  FR:"🇫🇷",GA:"🇬🇦",GM:"🇬🇲",GE:"🇬🇪",DE:"🇩🇪",GH:"🇬🇭",GR:"🇬🇷",GD:"🇬🇩",GT:"🇬🇹",GN:"🇬🇳",
  GW:"🇬🇼",GY:"🇬🇾",HT:"🇭🇹",HN:"🇭🇳",HU:"🇭🇺",IS:"🇮🇸",IN:"🇮🇳",ID:"🇮🇩",IR:"🇮🇷",IQ:"🇮🇶",
  IE:"🇮🇪",IL:"🇮🇱",IT:"🇮🇹",JM:"🇯🇲",JP:"🇯🇵",JO:"🇯🇴",KZ:"🇰🇿",KE:"🇰🇪",KI:"🇰🇮",KW:"🇰🇼",
  KG:"🇰🇬",LA:"🇱🇦",LV:"🇱🇻",LB:"🇱🇧",LS:"🇱🇸",LR:"🇱🇷",LY:"🇱🇾",LI:"🇱🇮",LT:"🇱🇹",LU:"🇱🇺",
  MG:"🇲🇬",MW:"🇲🇼",MY:"🇲🇾",MV:"🇲🇻",ML:"🇲🇱",MT:"🇲🇹",MH:"🇲🇭",MR:"🇲🇷",MU:"🇲🇺",MX:"🇲🇽",
  FM:"🇫🇲",MD:"🇲🇩",MC:"🇲🇨",MN:"🇲🇳",ME:"🇲🇪",MA:"🇲🇦",MZ:"🇲🇿",MM:"🇲🇲",NA:"🇳🇦",NR:"🇳🇷",
  NP:"🇳🇵",NL:"🇳🇱",NZ:"🇳🇿",NI:"🇳🇮",NE:"🇳🇪",NG:"🇳🇬",NO:"🇳🇴",OM:"🇴🇲",PK:"🇵🇰",PW:"🇵🇼",
  PA:"🇵🇦",PG:"🇵🇬",PY:"🇵🇾",PE:"🇵🇪",PH:"🇵🇭",PL:"🇵🇱",PT:"🇵🇹",QA:"🇶🇦",RO:"🇷🇴",RU:"🇷🇺",
  RW:"🇷🇼",KN:"🇰🇳",LC:"🇱🇨",VC:"🇻🇨",WS:"🇼🇸",SM:"🇸🇲",ST:"🇸🇹",SA:"🇸🇦",SN:"🇸🇳",RS:"🇷🇸",
  SC:"🇸🇨",SL:"🇸🇱",SG:"🇸🇬",SK:"🇸🇰",SI:"🇸🇮",SB:"🇸🇧",SO:"🇸🇴",ZA:"🇿🇦",SS:"🇸🇸",ES:"🇪🇸",
  LK:"🇱🇰",SD:"🇸🇩",SR:"🇸🇷",SE:"🇸🇪",CH:"🇨🇭",SY:"🇸🇾",TW:"🇹🇼",TJ:"🇹🇯",TZ:"🇹🇿",TH:"🇹🇭",
  TL:"🇹🇱",TG:"🇹🇬",TO:"🇹🇴",TT:"🇹🇹",TN:"🇹🇳",TR:"🇹🇷",TM:"🇹🇲",TV:"🇹🇻",UG:"🇺🇬",UA:"🇺🇦",
  AE:"🇦🇪",GB:"🇬🇧",US:"🇺🇸",UY:"🇺🇾",UZ:"🇺🇿",VU:"🇻🇺",VE:"🇻🇪",VN:"🇻🇳",YE:"🇾🇪",ZM:"🇿🇲",ZW:"🇿🇼",
};

const countryToFlag = (code: string): string => {
  if (!code || code === '🌍') return '🌍';
  const clean = code.trim().toUpperCase();
  return FLAG_MAP[clean] || code;
};

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();

  const [profileData,    setProfileData]    = useState<ProfileData | null>(null);
  const [userEmail,      setUserEmail]      = useState("");
  const [isLoading,      setIsLoading]      = useState(true);
  const [isVerifying,    setIsVerifying]    = useState(true);
  const [securityPassed, setSecurityPassed] = useState(false);
  const [isEditing,      setIsEditing]      = useState(false);
  const [editName,       setEditName]       = useState("");
  const [editCountry,    setEditCountry]    = useState("🌍");
  const [isSaving,       setIsSaving]       = useState(false);
  const [showContact,    setShowContact]    = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasInteracted,  setHasInteracted]  = useState(false);

  // ── Auth check ──
  useEffect(() => {
    const verify = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) { router.push("/"); return; }
        setUserEmail(user.email || "");
        setSecurityPassed(true);
        setIsVerifying(false);
      } catch {
        router.push("/");
      }
    };
    verify();
  }, [router]);

  // ── Fetch profile ──
  useEffect(() => {
    if (!securityPassed) return;
    const fetch = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase.rpc("get_user_profile_data");
        if (error || !data || !data.stats?.tier || !data.profile) {
          setIsLoading(false);
          return;
        }
        setProfileData(data);
        setEditName(data.profile?.full_name || "");
        setEditCountry(data.profile?.country || "🌍");
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [securityPassed]);

  // ── Realtime ──
  useEffect(() => {
    const userId = profileData?.profile?.id;
    if (!userId) return;

    let refreshTimeout: NodeJS.Timeout;
    const debouncedRefresh = () => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(async () => {
        const { data, error } = await supabase.rpc("get_user_profile_data");
        if (!error && data) setProfileData(data);
      }, 500);
    };

    const scoreCh = supabase
      .channel(`profile-participants-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "v2_round_participants", filter: `user_id=eq.${userId}` }, debouncedRefresh)
      .subscribe();

    const creditCh = supabase
      .channel(`profile-credits-${userId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "v2_user_credits", filter: `user_id=eq.${userId}` }, debouncedRefresh)
      .subscribe();

    const cacheCh = supabase
      .channel(`profile-cache-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "v2_leaderboard_cache" }, debouncedRefresh)
      .subscribe();

    return () => {
      clearTimeout(refreshTimeout);
      supabase.removeChannel(scoreCh);
      supabase.removeChannel(creditCh);
      supabase.removeChannel(cacheCh);
    };
  }, [profileData?.profile?.id]);

  // ── Music ──
  useEffect(() => {
    const musicPref = localStorage.getItem("vibraxx_music");
    if (musicPref === "true") setIsMusicPlaying(true);
    return () => stopMenuMusic();
  }, []);

  useEffect(() => {
    const handleFirstInteraction = () => {
      const savedPref = localStorage.getItem("vibraxx_music");
      if (savedPref !== "false") {
        playMenuMusic();
        setIsMusicPlaying(true);
        localStorage.setItem("vibraxx_music", "true");
      }
      setHasInteracted(true);
    };
    document.addEventListener("click", handleFirstInteraction, { once: true });
    document.addEventListener("touchstart", handleFirstInteraction, { once: true });
    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []); // boş dependency — sadece mount'ta bir kez

  const toggleMusic = useCallback(() => {
    if (isMusicPlaying) {
      stopMenuMusic();
      setIsMusicPlaying(false);
      localStorage.setItem("vibraxx_music", "false");
    } else {
      playMenuMusic();
      setIsMusicPlaying(true);
      localStorage.setItem("vibraxx_music", "true");
    }
  }, [isMusicPlaying]);

  // ── Save profile ──
  const handleSaveProfile = useCallback(async () => {
    if (!profileData || !editName.trim()) return;
    setIsSaving(true);
    try {
      await supabase.auth.updateUser({ data: { full_name: editName.trim(), country: editCountry } });
      const { error } = await supabase
        .from("v2_users_public")
        .update({ full_name: editName.trim(), updated_at: new Date().toISOString() })
        .eq("user_id", profileData.profile.id);
      if (!error) {
        setProfileData({ ...profileData, profile: { ...profileData.profile, full_name: editName.trim(), country: editCountry } });
        setIsEditing(false);
      }
    } catch {
      // silent
    } finally {
      setIsSaving(false);
    }
  }, [profileData, editName, editCountry]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/");
  }, [router]);

  // ── Loading states ──
  if (isVerifying) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a,#1e1b4b)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, color: "white", overflow: "hidden" }}>
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 60, height: 60, border: "4px solid rgba(139,92,246,.3)", borderTopColor: "#8b5cf6", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "#a78bfa", fontSize: 16, fontWeight: 600 }}>🔐 Verifying access...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f172a,#1e1b4b 50%,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 80, height: 80, borderRadius: "50%", border: "4px solid rgba(139,92,246,.3)", borderTopColor: "#a78bfa", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!profileData) return null;

  const { profile, stats, credits, rankings, personal_bests, today_stats, month_stats, recent_history, chart_data, achievements, weekly_challenge } = profileData;
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const currentTier = stats.tier;
  const tierProgress = stats.tier_progress;
  const maxChartScore = chart_data.length ? Math.max(...chart_data.map(d => d.score)) : 1;

  return (
    <>
      <style jsx global>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes glow  { 0%,100% { box-shadow: 0 0 20px rgba(251,191,36,.4); } 50% { box-shadow: 0 0 40px rgba(251,191,36,.8); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        body { background: linear-gradient(135deg,#0f172a 0%,#1e1b4b 25%,#312e81 50%,#1e1b4b 75%,#0f172a 100%); background-attachment: fixed; overflow-x: hidden; }
        @media (max-width: 640px) {
          .mobile-hide { display: none !important; }
          .mobile-grid { grid-template-columns: 1fr !important; }
          .profile-header { flex-wrap: wrap !important; }
        }
      `}</style>

      {/* <AnnouncementBanner /> */}

      <div style={{ color: "white", paddingBottom: 0 }}>
        <div style={{ padding: "clamp(20px,5vw,40px) clamp(16px,4vw,24px)" }}>

          {/* ── HEADER ── */}
          <header className="profile-header" style={{ maxWidth: "min(1200px,100%)", margin: "0 auto clamp(24px,5vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            {/* Sol: Logo */}
            <div onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <div style={{ position: "relative", width: "clamp(64px,10vw,80px)", height: "clamp(64px,10vw,80px)", borderRadius: "50%", padding: 4, background: "radial-gradient(circle at 0 0,#7c3aed,#d946ef)", boxShadow: "0 0 24px rgba(124,58,237,.6)", flexShrink: 0, overflow: "hidden" }}>
                <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", background: "#020817", overflow: "hidden" }}>
                  <Image src="/images/logo.png" alt="VibraXX" fill sizes="80px" style={{ objectFit: "contain", padding: "12%" }} />
                </div>
              </div>
              <span style={{ fontSize: "clamp(16px,3vw,22px)", fontWeight: 900, background: "linear-gradient(90deg,#fbbf24,#f59e0b)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap" }}>
                Profile
              </span>
            </div>
            {/* Sağ: Ses */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <button onClick={toggleMusic}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: 10, border: "2px solid rgba(139,92,246,.5)", background: isMusicPlaying ? "linear-gradient(135deg,rgba(139,92,246,.95),rgba(124,58,237,.95))" : "rgba(15,23,42,.8)", cursor: "pointer", transition: "all .3s", boxShadow: isMusicPlaying ? "0 0 15px rgba(139,92,246,.5)" : "none" }}
                title={isMusicPlaying ? "Mute" : "Play Music"}>
                {isMusicPlaying ? <Volume2 style={{ width: 18, height: 18, color: "white" }} /> : <VolumeX style={{ width: 18, height: 18, color: "#94a3b8" }} />}
              </button>
            </div>
          </header>

          <main style={{ maxWidth: "min(1200px,100%)", margin: "0 auto" }}>

            {/* ── PROFILE CARD ── */}
            <div style={{ padding: "clamp(24px,5vw,32px)", borderRadius: "clamp(20px,4vw,24px)", border: "2px solid rgba(139,92,246,.5)", background: "linear-gradient(135deg,rgba(30,27,75,.98) 0%,rgba(15,23,42,.98) 100%)", boxShadow: "0 20px 60px rgba(0,0,0,.6),0 0 40px rgba(139,92,246,.4)", backdropFilter: "blur(20px)", marginBottom: "clamp(20px,4vw,24px)" }}>
              
              <div style={{ display: "flex", alignItems: "center", gap: "clamp(16px,3vw,20px)", flexWrap: "wrap", marginBottom: "clamp(20px,4vw,24px)" }}>
                
                {/* Avatar */}
                <div style={{ position: "relative", width: "clamp(80px,15vw,100px)", height: "clamp(80px,15vw,100px)", borderRadius: "50%", padding: 4, background: currentTier.gradient, boxShadow: `0 0 30px ${currentTier.color}60` }}>
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#020817", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {profile.avatar_url
                      ? <Image src={profile.avatar_url} alt={profile.full_name} fill style={{ objectFit: "cover" }} />
                      : <User style={{ width: "50%", height: "50%", color: "#a78bfa" }} />}
                  </div>
                </div>

                {/* Name / Email */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  {isEditing ? (
                    <>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                          style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "2px solid rgba(139,92,246,.5)", background: "rgba(15,23,42,.9)", color: "white", fontSize: 16, fontWeight: 700 }}
                          placeholder="Enter your name" />
                        <button onClick={handleSaveProfile} disabled={isSaving}
                          style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "white", cursor: isSaving ? "not-allowed" : "pointer", display: "flex", alignItems: "center" }}>
                          <Save style={{ width: 16, height: 16 }} />
                        </button>
                        <button onClick={() => { setIsEditing(false); setEditName(profile.full_name); setEditCountry(profile.country); }}
                          style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "rgba(239,68,68,.2)", color: "#fca5a5", cursor: "pointer" }}>
                          <X style={{ width: 16, height: 16 }} />
                        </button>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <CountryPicker value={editCountry} onChange={setEditCountry} autoDetect={false} showSearch={true} />
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: "clamp(32px,6vw,40px)" }}>{countryToFlag(profile.country)}</span>
                      <h1 style={{ fontSize: "clamp(20px,4vw,28px)", fontWeight: 900, background: "linear-gradient(90deg,#fbbf24,#f59e0b)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        {profile.full_name}
                      </h1>
                      <button onClick={() => setIsEditing(true)}
                        style={{ padding: 6, borderRadius: 8, border: "none", background: "rgba(139,92,246,.2)", color: "#a78bfa", cursor: "pointer" }}>
                        <Edit style={{ width: 16, height: 16 }} />
                      </button>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Mail style={{ width: 16, height: 16, color: "#94a3b8" }} />
                    <span style={{ fontSize: 14, color: "#cbd5e1" }}>{userEmail}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar style={{ width: 16, height: 16, color: "#94a3b8" }} />
                    <span style={{ fontSize: 14, color: "#94a3b8" }}>Member since {memberSince}</span>
                  </div>
                </div>

                {/* Credits badge */}
                <div style={{ padding: "clamp(12px,2.5vw,16px) clamp(16px,3vw,20px)", borderRadius: "clamp(12px,2.5vw,16px)", background: credits.live_credits === 0 ? "linear-gradient(135deg,rgba(239,68,68,.2),rgba(185,28,28,.15))" : "linear-gradient(135deg,rgba(251,191,36,.2),rgba(245,158,11,.15))", border: `2px solid ${credits.live_credits === 0 ? "rgba(239,68,68,.5)" : "rgba(251,191,36,.5)"}`, textAlign: "center", ...(credits.live_credits === 0 ? { animation: "glow 2s ease-in-out infinite" } : {}) }}>
                  <Gift style={{ width: "clamp(24px,5vw,32px)", height: "clamp(24px,5vw,32px)", color: credits.live_credits === 0 ? "#ef4444" : "#fbbf24", margin: "0 auto 4px" }} />
                  <div style={{ fontSize: "clamp(24px,5vw,32px)", fontWeight: 900, color: credits.live_credits === 0 ? "#ef4444" : "#fbbf24", lineHeight: 1 }}>{credits.live_credits}</div>
                  <div style={{ fontSize: "clamp(11px,2.2vw,12px)", color: credits.live_credits === 0 ? "#fca5a5" : "#fcd34d", fontWeight: 600, textTransform: "uppercase", marginTop: 4 }}>Rounds Left</div>
                </div>
              </div>

              {/* Buy rounds CTA */}
              {credits.live_credits === 0 && (
                <div style={{ padding: 20, borderRadius: 16, background: "linear-gradient(135deg,rgba(124,58,237,.2),rgba(6,182,212,.2))", border: "2px solid rgba(124,58,237,.5)", marginBottom: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#e5e7eb", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <AlertCircle style={{ width: 20, height: 20, color: "#fbbf24" }} />
                    <span>No Rounds Available!</span>
                  </div>
                  <p style={{ fontSize: 14, color: "#cbd5e1", marginBottom: 16 }}>Continue your journey towards the £1,000 monthly prize.</p>
                  <button onClick={() => router.push("/buy")}
                    style={{ width: "100%", padding: "14px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#7c3aed,#d946ef)", color: "white", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .3s", boxShadow: "0 0 30px rgba(124,58,237,.6)" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(124,58,237,.8)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(124,58,237,.6)"; }}>
                    <ShoppingCart style={{ width: 20, height: 20 }} />
                    <span>Purchase Rounds</span>
                  </button>
                  <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>Skill-based competition</p>
                </div>
              )}

              {/* Tier progress */}
              <div style={{ padding: 20, borderRadius: 16, background: `linear-gradient(135deg,${currentTier.color}20,rgba(15,23,42,.5))`, border: `2px solid ${currentTier.color}60` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="animate-float" style={{ fontSize: 28 }}>{currentTier.icon}</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: currentTier.color }}>{currentTier.name} Tier</span>
                  </div>
                  {tierProgress.next_tier && (
                    <div style={{ fontSize: 14, color: "#cbd5e1" }}>
                      {tierProgress.points_needed.toLocaleString()} pts to {tierProgress.next_tier.icon} {tierProgress.next_tier.name}
                    </div>
                  )}
                </div>
                {tierProgress.next_tier && (
                  <div style={{ width: "100%", height: 12, borderRadius: 999, background: "rgba(15,23,42,.8)", overflow: "hidden" }}>
                    <div style={{ width: `${tierProgress.progress}%`, height: "100%", background: tierProgress.next_tier.gradient, transition: "width 1s ease", boxShadow: `0 0 10px ${tierProgress.next_tier.color}60` }} />
                  </div>
                )}
              </div>
            </div>

            {/* ── STATS GRID ── */}
            <div className="mobile-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "clamp(12px,3vw,16px)", marginBottom: "clamp(20px,4vw,24px)" }}>
              {[
                { icon: <Trophy style={{ width: "clamp(24px,5vw,32px)", height: "clamp(24px,5vw,32px)", color: "#fbbf24", marginBottom: 8 }} />, value: stats.total_score.toLocaleString(), label: "Total Score", fg: "#fbbf24", sub: "#fcd34d", bg: "rgba(251,191,36,.2)", border: "rgba(251,191,36,.5)", glow: "rgba(251,191,36,.3)" },
                { icon: <Target style={{ width: "clamp(24px,5vw,32px)", height: "clamp(24px,5vw,32px)", color: "#a78bfa", marginBottom: 8 }} />, value: `${stats.accuracy_percentage.toFixed(1)}%`, label: "Accuracy", fg: "#a78bfa", sub: "#c4b5fd", bg: "rgba(139,92,246,.2)", border: "rgba(139,92,246,.5)", glow: "rgba(139,92,246,.3)" },
                { icon: <Zap style={{ width: "clamp(24px,5vw,32px)", height: "clamp(24px,5vw,32px)", color: "#22c55e", marginBottom: 8 }} />, value: stats.rounds_played, label: "Rounds Played", fg: "#22c55e", sub: "#86efac", bg: "rgba(34,197,94,.2)", border: "rgba(34,197,94,.5)", glow: "rgba(34,197,94,.3)" },
                { icon: <CheckCircle style={{ width: "clamp(24px,5vw,32px)", height: "clamp(24px,5vw,32px)", color: "#38bdf8", marginBottom: 8 }} />, value: stats.correct_answers, label: "Correct Answers", fg: "#38bdf8", sub: "#7dd3fc", bg: "rgba(56,189,248,.2)", border: "rgba(56,189,248,.5)", glow: "rgba(56,189,248,.3)" },
              ].map(({ icon, value, label, fg, sub, bg, border, glow }) => (
                <div key={label} style={{ padding: "clamp(16px,3vw,20px)", borderRadius: "clamp(14px,3vw,16px)", background: `linear-gradient(135deg,${bg},${bg.replace('.2', '.15')})`, border: `2px solid ${border}`, boxShadow: `0 0 20px ${glow}`, transition: "transform .3s", cursor: "default" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  {icon}
                  <div style={{ fontSize: "clamp(24px,5vw,32px)", fontWeight: 900, color: fg, lineHeight: 1, marginBottom: 4 }}>{value}</div>
                  <div style={{ fontSize: "clamp(11px,2.2vw,12px)", color: sub, fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* ── PERFORMANCE CHART ── */}
            {chart_data.length > 0 && (
              <div style={{ padding: "clamp(20px,4vw,24px)", borderRadius: "clamp(16px,3vw,20px)", border: "2px solid rgba(56,189,248,.5)", background: "linear-gradient(135deg,rgba(8,47,73,.98),rgba(6,8,20,.98))", boxShadow: "0 20px 60px rgba(0,0,0,.6),0 0 40px rgba(56,189,248,.4)", backdropFilter: "blur(20px)", marginBottom: "clamp(20px,4vw,24px)" }}>
                <h2 style={{ fontSize: "clamp(18px,4vw,22px)", fontWeight: 900, marginBottom: "clamp(16px,3vw,20px)", display: "flex", alignItems: "center", gap: 10, color: "#7dd3fc" }}>
                  <BarChart3 style={{ width: 24, height: 24 }} />
                  Performance Chart (Last 7 Days)
                </h2>
                <div style={{ height: "clamp(180px,35vw,220px)", display: "flex", alignItems: "flex-end", gap: "clamp(6px,2vw,12px)", padding: "clamp(16px,3vw,20px) clamp(8px,2vw,10px)" }}>
                  {chart_data.map((day, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: "clamp(10px,2vw,12px)", fontWeight: 700, color: day.score > 0 ? "#7dd3fc" : "#64748b" }}>{day.score}</div>
                      <div style={{ width: "100%", height: `${(day.score / maxChartScore) * 160}px`, background: day.score > 0 ? "linear-gradient(to top,#0ea5e9,#7dd3fc)" : "rgba(100,116,139,.3)", borderRadius: "8px 8px 0 0", transition: "all .3s" }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(125,211,252,.6)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }} />
                      <div style={{ fontSize: "clamp(9px,1.8vw,11px)", color: "#94a3b8", textAlign: "center" }}>{day.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ACHIEVEMENTS ── */}
            {achievements.length > 0 && (
              <div style={{ padding: "clamp(20px,4vw,24px)", borderRadius: "clamp(16px,3vw,20px)", border: "2px solid rgba(251,191,36,.5)", background: "linear-gradient(135deg,rgba(30,27,75,.98) 0%,rgba(15,23,42,.98) 100%)", boxShadow: "0 20px 60px rgba(0,0,0,.6)", backdropFilter: "blur(20px)", marginBottom: "clamp(20px,4vw,24px)" }}>
                <h2 style={{ fontSize: "clamp(18px,4vw,22px)", fontWeight: 900, marginBottom: "clamp(16px,3vw,20px)", display: "flex", alignItems: "center", gap: 10, color: "#fbbf24" }}>
                  <Sparkles style={{ width: 24, height: 24 }} /> Achievements
                </h2>
                <div className="mobile-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "clamp(12px,3vw,16px)" }}>
                  {achievements.map(a => (
                    <div key={a.id} style={{ padding: 16, borderRadius: 12, background: a.unlocked ? "linear-gradient(135deg,rgba(251,191,36,.2),rgba(245,158,11,.15))" : "rgba(15,23,42,.5)", border: `2px solid ${a.unlocked ? "rgba(251,191,36,.5)" : "rgba(71,85,105,.5)"}`, textAlign: "center", opacity: a.unlocked ? 1 : 0.6, transition: "all .3s" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.opacity = "1"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.opacity = a.unlocked ? "1" : "0.6"; }}>
                      <div style={{ fontSize: 32, marginBottom: 8, filter: a.unlocked ? "none" : "grayscale(100%)" }}>{a.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: a.unlocked ? "#fbbf24" : "#94a3b8", marginBottom: 4 }}>{a.title}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 8 }}>{a.description}</div>
                      {a.progress !== undefined && a.target && (
                        <>
                          <div style={{ width: "100%", height: 4, borderRadius: 999, background: "rgba(15,23,42,.8)", overflow: "hidden", marginBottom: 4 }}>
                            <div style={{ width: `${(a.progress / a.target) * 100}%`, height: "100%", background: a.unlocked ? "#fbbf24" : "#64748b", transition: "width .5s ease" }} />
                          </div>
                          <div style={{ fontSize: 9, color: "#64748b" }}>{a.progress}/{a.target}</div>
                        </>
                      )}
                      {a.unlocked && <div style={{ marginTop: 8, padding: "4px 8px", borderRadius: 6, background: "rgba(34,197,94,.2)", border: "1px solid rgba(34,197,94,.5)", fontSize: 9, fontWeight: 700, color: "#22c55e" }}>UNLOCKED</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── WEEKLY CHALLENGE ── */}
            <div style={{ padding: "clamp(20px,4vw,24px)", borderRadius: "clamp(16px,3vw,20px)", border: "2px solid rgba(249,115,22,.5)", background: "linear-gradient(135deg,rgba(30,27,75,.98) 0%,rgba(15,23,42,.98) 100%)", boxShadow: "0 20px 60px rgba(0,0,0,.6)", backdropFilter: "blur(20px)", marginBottom: "clamp(20px,4vw,24px)" }}>
              <h2 style={{ fontSize: "clamp(18px,4vw,22px)", fontWeight: 900, marginBottom: "clamp(16px,3vw,20px)", display: "flex", alignItems: "center", gap: 10, color: "#fb923c" }}>
                <Flame style={{ width: 24, height: 24 }} /> Weekly Challenge
              </h2>
              <div style={{ padding: 20, borderRadius: 14, background: "linear-gradient(135deg,rgba(249,115,22,.2),rgba(234,88,12,.15))", border: "2px solid rgba(249,115,22,.5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#e5e7eb" }}>Play 10 rounds this week</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: "#fb923c" }}>{weekly_challenge.current}/{weekly_challenge.target}</span>
                </div>
                <div style={{ width: "100%", height: 12, borderRadius: 999, background: "rgba(15,23,42,.8)", overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ width: `${(weekly_challenge.current / weekly_challenge.target) * 100}%`, height: "100%", background: "linear-gradient(90deg,#f97316,#fb923c)", transition: "width 1s ease", boxShadow: "0 0 10px rgba(251,146,60,.6)" }} />
                </div>
                {weekly_challenge.completed ? (
                  <div style={{ padding: 12, borderRadius: 10, background: "rgba(34,197,94,.2)", border: "1px solid rgba(34,197,94,.5)", textAlign: "center" }}>
                    <CheckCircle style={{ width: 20, height: 20, color: "#22c55e", marginBottom: 4, display: "inline-block" }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#22c55e" }}>Challenge Complete! 🎉</div>
                    <div style={{ fontSize: 12, color: "#86efac", marginTop: 4 }}>Reward: +1 Free Round</div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "#cbd5e1", textAlign: "center" }}>
                    {weekly_challenge.target - weekly_challenge.current} more rounds to complete
                  </div>
                )}
              </div>
            </div>

            {/* ── PERSONAL BESTS & RANKINGS ── */}
            <div className="mobile-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "clamp(16px,3vw,20px)", marginBottom: "clamp(20px,4vw,24px)" }}>
              <div style={{ padding: "clamp(20px,4vw,24px)", borderRadius: "clamp(16px,3vw,20px)", border: "2px solid rgba(217,70,239,.5)", background: "linear-gradient(135deg,rgba(30,27,75,.98) 0%,rgba(15,23,42,.98) 100%)", boxShadow: "0 20px 60px rgba(0,0,0,.6)", backdropFilter: "blur(20px)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, color: "#e879f9" }}>
                  <Star style={{ width: 20, height: 20 }} /> Personal Bests
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Highest Score", value: personal_bests.highest_score, color: "#fbbf24" },
                    { label: "Best Accuracy", value: `${personal_bests.best_accuracy.toFixed(1)}%`, color: "#a78bfa" },
                    { label: "Perfect Rounds", value: personal_bests.perfect_rounds, color: "#22c55e" },
                    { label: "Total Rounds", value: personal_bests.total_rounds, color: "#38bdf8" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: "#cbd5e1", marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "clamp(20px,4vw,24px)", borderRadius: "clamp(16px,3vw,20px)", border: "2px solid rgba(139,92,246,.5)", background: "linear-gradient(135deg,rgba(30,27,75,.98) 0%,rgba(15,23,42,.98) 100%)", boxShadow: "0 20px 60px rgba(0,0,0,.6)", backdropFilter: "blur(20px)" }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, color: "#a78bfa" }}>
                  <Crown style={{ width: 20, height: 20 }} /> Your Rankings
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { label: "Weekly Rank", value: rankings.weekly_rank ? `#${rankings.weekly_rank}` : "-", bg: "rgba(139,92,246,.15)", border: "rgba(139,92,246,.3)", color: "#a78bfa" },
                    { label: "Monthly Rank", value: rankings.monthly_rank ? `#${rankings.monthly_rank}` : "-", bg: "rgba(56,189,248,.15)", border: "rgba(56,189,248,.3)", color: "#38bdf8" },
                    { label: "Country", value: countryToFlag(profile.country), bg: "rgba(34,197,94,.15)", border: "rgba(34,197,94,.3)", color: "white" },
                  ].map(({ label, value, bg, border, color }) => (
                    <div key={label} style={{ padding: 12, borderRadius: 10, background: bg, border: `1px solid ${border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: "#cbd5e1" }}>{label}</span>
                        <span style={{ fontSize: 20, fontWeight: 900, color }}>{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── TODAY & MONTH STATS ── */}
            {(today_stats || month_stats) && (
              <div style={{ padding: "clamp(20px,4vw,24px)", borderRadius: "clamp(16px,3vw,20px)", border: "2px solid rgba(56,189,248,.5)", background: "linear-gradient(135deg,rgba(8,47,73,.98),rgba(6,8,20,.98))", boxShadow: "0 20px 60px rgba(0,0,0,.6),0 0 40px rgba(56,189,248,.4)", backdropFilter: "blur(20px)", marginBottom: "clamp(20px,4vw,24px)" }}>
                <h2 style={{ fontSize: "clamp(18px,4vw,22px)", fontWeight: 900, marginBottom: "clamp(16px,3vw,20px)", display: "flex", alignItems: "center", gap: 10, color: "#7dd3fc" }}>
                  <TrendingUp style={{ width: 24, height: 24 }} /> Recent Statistics
                </h2>
                <div className="mobile-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "clamp(16px,3vw,20px)" }}>
                  {[
                    { data: today_stats, label: "Today", icon: <Clock style={{ width: 20, height: 20, color: "#22c55e" }} />, color: "#22c55e", bg: "rgba(34,197,94,.15)", border: "rgba(34,197,94,.5)" },
                    { data: month_stats, label: "This Month", icon: <Calendar style={{ width: 20, height: 20, color: "#7dd3fc" }} />, color: "#7dd3fc", bg: "rgba(56,189,248,.15)", border: "rgba(56,189,248,.5)" },
                  ].filter(s => s.data).map(({ data, label, icon, color, bg, border }) => (
                    <div key={label} style={{ padding: "clamp(16px,3vw,20px)", borderRadius: 14, background: bg, border: `2px solid ${border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        {icon}
                        <h3 style={{ fontSize: 16, fontWeight: 800, color, textTransform: "uppercase" }}>{label}</h3>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {[
                          { l: "Rounds", v: data!.rounds_played },
                          { l: "Score", v: data!.total_score },
                          { l: "Correct", v: data!.correct_answers, c: "#22c55e" },
                          { l: "Accuracy", v: `${data!.accuracy_percentage.toFixed(1)}%`, c: "#a78bfa" },
                        ].map(({ l, v, c }) => (
                          <div key={l}>
                            <div style={{ fontSize: 11, color: "#cbd5e1", marginBottom: 4 }}>{l}</div>
                            <div style={{ fontSize: 20, fontWeight: 900, color: c || "#fbbf24" }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── QUIZ HISTORY ── */}
            {recent_history.length > 0 && (
              <div style={{ padding: "clamp(20px,4vw,24px)", borderRadius: "clamp(16px,3vw,20px)", border: "2px solid rgba(139,92,246,.5)", background: "linear-gradient(135deg,rgba(30,27,75,.98) 0%,rgba(15,23,42,.98) 100%)", boxShadow: "0 20px 60px rgba(0,0,0,.6)", backdropFilter: "blur(20px)", marginBottom: "clamp(20px,4vw,24px)" }}>
                <h2 style={{ fontSize: "clamp(18px,4vw,22px)", fontWeight: 900, marginBottom: "clamp(16px,3vw,20px)", display: "flex", alignItems: "center", gap: 10 }}>
                  <Activity style={{ width: 24, height: 24, color: "#a78bfa" }} /> Recent Quiz History
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {recent_history.map(round => (
                    <div key={round.id} style={{ padding: "clamp(12px,2.5vw,16px)", borderRadius: 12, background: "rgba(15,23,42,.8)", border: "1px solid rgba(139,92,246,.3)", display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, background: "rgba(139,92,246,.15)", border: "1px solid rgba(139,92,246,.3)" }}>
                          <Clock style={{ width: 14, height: 14, color: "#a78bfa" }} />
                          <span style={{ fontSize: "clamp(10px,2vw,11px)", color: "#cbd5e1" }}>
                            {new Date(round.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div style={{ padding: "6px 10px", borderRadius: 8, background: round.source === "live" ? "linear-gradient(90deg,rgba(251,191,36,.2),rgba(245,158,11,.15))" : "linear-gradient(90deg,rgba(56,189,248,.2),rgba(14,165,233,.15))", border: `1px solid ${round.source === "live" ? "rgba(251,191,36,.5)" : "rgba(56,189,248,.5)"}` }}>
                          <span style={{ fontSize: "clamp(11px,2.2vw,12px)", fontWeight: 700, color: round.source === "live" ? "#fbbf24" : "#38bdf8", textTransform: "uppercase" }}>{round.source}</span>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(80px,1fr))", gap: 8 }}>
                        {[
                          { l: "Score", v: round.score, c: "#fbbf24" },
                          { l: "Correct", v: round.correct_answers, c: "#22c55e" },
                          { l: "Wrong", v: round.wrong_answers, c: "#ef4444" },
                          { l: "Accuracy", v: `${round.correct_answers + round.wrong_answers > 0 ? Math.round((round.correct_answers / (round.correct_answers + round.wrong_answers)) * 100) : 0}%`, c: "#a78bfa" },
                        ].map(({ l, v, c }) => (
                          <div key={l}>
                            <div style={{ fontSize: "clamp(14px,3vw,16px)", fontWeight: 900, color: c }}>{v}</div>
                            <div style={{ fontSize: "clamp(9px,2vw,10px)", color: "#94a3b8" }}>{l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CONTACT ── */}
            <div style={{ padding: "clamp(20px,4vw,24px)", borderRadius: "clamp(16px,3vw,20px)", border: "2px solid rgba(56,189,248,.5)", background: "linear-gradient(135deg,rgba(8,47,73,.98),rgba(6,8,20,.98))", boxShadow: "0 20px 60px rgba(0,0,0,.6)", backdropFilter: "blur(20px)", marginBottom: "clamp(20px,4vw,24px)" }}>
              <h2 style={{ fontSize: "clamp(18px,4vw,22px)", fontWeight: 900, marginBottom: "clamp(12px,3vw,16px)", display: "flex", alignItems: "center", gap: 10, color: "#7dd3fc" }}>
                <Send style={{ width: 24, height: 24 }} /> Need Help?
              </h2>
              <p style={{ fontSize: 14, color: "#cbd5e1", marginBottom: 16 }}>Have a question or need assistance? Our support team is here to help!</p>
              <div style={{ padding: 16, borderRadius: 12, background: "rgba(56,189,248,.1)", border: "1px solid rgba(56,189,248,.3)", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Mail style={{ width: 16, height: 16, color: "#7dd3fc" }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#7dd3fc" }}>team@vibraxx.com</span>
                </div>
                <p style={{ fontSize: 12, color: "#94a3b8", marginLeft: 24 }}>We typically respond within 24 hours</p>
              </div>
              <button onClick={() => setShowContact(true)}
                style={{ width: "100%", padding: "14px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#0ea5e9,#7dd3fc)", color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .3s", boxShadow: "0 0 20px rgba(14,165,233,.5)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(14,165,233,.7)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(14,165,233,.5)"; }}>
                <Send style={{ width: 18, height: 18 }} />
                <span>Send Message</span>
              </button>
            </div>

          </main>
        </div>
        <Footer />
      </div>

      {/* ── CONTACT MODAL ── */}
      {showContact && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
          onClick={() => setShowContact(false)}>
          <div style={{ background: "linear-gradient(135deg,rgba(15,23,42,.95),rgba(30,41,59,.95))", borderRadius: 20, border: "2px solid rgba(56,189,248,.3)", maxWidth: 500, width: "100%", padding: 32, boxShadow: "0 25px 50px -12px rgba(0,0,0,.5)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: "clamp(18px,4vw,22px)", fontWeight: 900, display: "flex", alignItems: "center", gap: 10 }}>
                <Send style={{ width: 24, height: 24, color: "#7dd3fc" }} /> Contact Support
              </h3>
              <button onClick={() => setShowContact(false)}
                style={{ width: 36, height: 36, borderRadius: 8, border: "none", background: "rgba(239,68,68,.2)", color: "#fca5a5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <Mail style={{ width: 64, height: 64, color: "#38bdf8", margin: "0 auto 20px" }} />
              <p style={{ fontSize: 16, color: "#94a3b8", marginBottom: 16 }}>Need help? Contact our support team:</p>
              <a href="mailto:team@vibraxx.com"
                style={{ display: "inline-block", fontSize: 20, fontWeight: 700, color: "#38bdf8", textDecoration: "none", padding: "12px 24px", background: "rgba(56,189,248,.1)", borderRadius: 12, border: "2px solid rgba(56,189,248,.3)", transition: "all .3s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(56,189,248,.2)"; e.currentTarget.style.transform = "scale(1.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(56,189,248,.1)"; e.currentTarget.style.transform = "scale(1)"; }}>
                team@vibraxx.com
              </a>
              <p style={{ fontSize: 14, color: "#64748b", marginTop: 20 }}>We typically respond within 24 hours</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

