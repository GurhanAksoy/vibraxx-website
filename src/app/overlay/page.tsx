"use client";

import { useState, useEffect } from "react";
import { Trophy, Users, Globe, Clock, Zap, CheckCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

type Phase = "question" | "countdown" | "reveal" | "explanation";

// --- Supabase client (browser) ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Fallback MOCK data (design için aynı kaldı) ---
const MOCK_QUESTION = {
  index: 23,
  total: 50,
  question: "Which element has the atomic number 79?",
  options: [
    { id: "A", text: "Silver" },
    { id: "B", text: "Gold" },
    { id: "C", text: "Platinum" },
    { id: "D", text: "Mercury" },
  ],
  correctAnswer: "B",
  explanation:
    "Gold (Au) has the atomic number 79. It's one of the least reactive chemical elements and has been valued throughout history for its beauty and malleability.",
};

const MOCK_LEADERBOARD = [
  {
    rank: 1,
    username: "John_Smith",
    country: "US",
    score: 23,
    correct: 23,
    avgTime: 2.3,
  },
  {
    rank: 2,
    username: "Emma_Wilson",
    country: "GB",
    score: 23,
    correct: 23,
    avgTime: 2.6,
  },
  {
    rank: 3,
    username: "Michael_Chen",
    country: "CA",
    score: 22,
    correct: 22,
    avgTime: 2.9,
  },
  {
    rank: 4,
    username: "Sarah_Brown",
    country: "US",
    score: 22,
    correct: 22,
    avgTime: 3.1,
  },
  {
    rank: 5,
    username: "James_Taylor",
    country: "GB",
    score: 22,
    correct: 22,
    avgTime: 3.2,
  },
  {
    rank: 6,
    username: "Raj_Patel",
    country: "IN",
    score: 21,
    correct: 21,
    avgTime: 3.4,
  },
  {
    rank: 7,
    username: "Sophie_Davis",
    country: "AU",
    score: 21,
    correct: 21,
    avgTime: 3.6,
  },
  {
    rank: 8,
    username: "Oliver_Miller",
    country: "US",
    score: 21,
    correct: 21,
    avgTime: 3.7,
  },
  {
    rank: 9,
    username: "Emily_Johnson",
    country: "CA",
    score: 20,
    correct: 20,
    avgTime: 3.8,
  },
  {
    rank: 10,
    username: "David_White",
    country: "GB",
    score: 20,
    correct: 20,
    avgTime: 4.0,
  },
];

const MOCK_COUNTRIES = [
  { code: "US", name: "USA", count: 248, flag: "🇺🇸" },
  { code: "GB", name: "UK", count: 206, flag: "🇬🇧" },
  { code: "CA", name: "Canada", count: 96, flag: "🇨🇦" },
  { code: "AU", name: "Australia", count: 82, flag: "🇦🇺" },
  { code: "IN", name: "India", count: 56, flag: "🇮🇳" },
];

// Supabase row tipleri (basit)
type OverlayRoundStateRow = {
  id: number;
  round_id: string | null;
  phase: Phase | null;
  question_index: number | null;
  time_left: number | null;
};

type OverlayCurrentQuestionRow = {
  id: number;
  round_id: string | null;
  question_id: string | null;
  question_text: string | null;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  correct_answer: "A" | "B" | "C" | "D" | null;
  explanation: string | null;
};

type OverlayStatsRow = {
  id: number;
  round_id: string | null;
  total_players: number | null;
  answering: number | null;
  correct_percent: number | null;
  avg_time: number | null;
  countries: any | null; // [{code, count}, ...] bekliyoruz
};

type OverlayLeaderboardRow = {
  id: number;
  round_id: string | null;
  rank: number | null;
  username: string | null;
  country: string | null;
  score: number | null;
  correct: number | null;
  avg_time: number | null;
};

export default function OverlayPage() {
  // Faz & süre
  const [phase, setPhase] = useState<Phase>("question");
  const [timeLeft, setTimeLeft] = useState<number>(6);
  const [questionStartAt, setQuestionStartAt] = useState<string | null>(null);
  const [roundNumber, setRoundNumber] = useState<number | null>(null);

  // Ekranda görünen soru (mock yapısında tutuyoruz)
  const [question, setQuestion] = useState(MOCK_QUESTION);

  // İstatistikler
  const [overlayStats, setOverlayStats] = useState<OverlayStatsRow | null>(
    null
  );

  // Ülkeler paneli
  const [countries, setCountries] = useState(MOCK_COUNTRIES);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState(MOCK_LEADERBOARD);
            
// Helper: Convert country code to flag emoji
function getFlagFromCode(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, char =>
      String.fromCodePoint(char.charCodeAt(0) + 127397)
    );
}

  // --- FETCH ACTIVE ROUND & INITIAL DATA ---
  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      try {
        // 1️⃣ Get active round from live_rounds
        const { data: activeRound } = await supabase
          .from("live_rounds")
          .select("*")
          .or("phase.eq.QUESTION,phase.eq.READY")
          .order("scheduled_start", { ascending: false })
          .limit(1)
          .single();

        const roundId = activeRound?.id ?? null;
        const roundNumber = activeRound?.global_round_index ?? null;
        
        if (!isMounted || !roundId) return;

        // Set phase from live_rounds (proper mapping)
        if (activeRound.phase === "QUESTION") setPhase("question");
        else if (activeRound.phase === "READY") setPhase("countdown");
        
        const currentIndex = activeRound.current_question_index || 0;

        // Store question start time for timer
        setQuestionStartAt(activeRound.question_started_at);

        // Store round number for display
        setRoundNumber(roundNumber);

        // 2️⃣ Fetch question from live_round_questions
        const { data: qData } = await supabase
          .from("live_round_questions")
          .select("position, questions(*)")
          .eq("round_id", roundId)
          .eq("position", currentIndex)
          .single();

        if (isMounted && (qData as any)?.questions) {
          setQuestion({
            index: currentIndex,
            total: 50,
            question: (qData as any).questions.question_text || "",
            options: [
              { id: "A", text: (qData as any).questions.option_a || "" },
              { id: "B", text: (qData as any).questions.option_b || "" },
              { id: "C", text: (qData as any).questions.option_c || "" },
              { id: "D", text: (qData as any).questions.option_d || "" },
            ],
            correctAnswer: (qData as any).questions.correct_answer || "A",
            explanation: (qData as any).questions.explanation || "",
          });
        }

        // 3️⃣ Fetch overlay stats
        const { data: statsData } = await supabase
          .from("overlay_stats")
          .select("*")
          .eq("round_id", roundId)
          .order("updated_at", { ascending: false })
          .limit(1);

        if (isMounted && statsData?.[0]) {
          setOverlayStats(statsData[0] as OverlayStatsRow);
          
          // Convert countries with flag mapping
          if (statsData[0].countries && Array.isArray(statsData[0].countries)) {
            const mappedCountries = statsData[0].countries.map((c: any) => ({
              code: c.code,
                name: c.name ?? c.code,
              flag: getFlagFromCode(c.code),
              count: c.count,
            }));
            setCountries(mappedCountries);
          }
        }

        // 4️⃣ Fetch leaderboard
        const { data: leaderboardData } = await supabase
          .from("overlay_leaderboard")
          .select("*")
          .eq("round_id", roundId)
          .order("rank", { ascending: true })
          .limit(10);

        if (isMounted && leaderboardData) {
          setLeaderboard(leaderboardData.map((row: any) => ({
            rank: row.rank ?? 0,
            username: row.username ?? "",
            country: row.country ?? "",
            score: row.score ?? 0,
            correct: row.correct ?? 0,
            avgTime: row.avg_time ?? 0,
          })));
        }

      } catch (err) {
        console.error("Error loading overlay data:", err);
      }
    };

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, []);

  // --- SERVER-SYNC TIMER (500ms polling with phase-aware duration) ---
  useEffect(() => {
    if (!questionStartAt) return;
    
    const interval = setInterval(() => {
      const start = new Date(questionStartAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - start) / 1000);
      
      // Phase-aware duration
      const duration =
        phase === "question" ? 6 :
        phase === "reveal" ? 5 :
        phase === "explanation" ? 5 :
        6;
      
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
    }, 500);
    
    return () => clearInterval(interval);
  }, [questionStartAt, phase]);

  // --- REALTIME SUBSCRIPTIONS ---
  useEffect(() => {
    let currentRoundId: string | null = null;

    // Get current round ID first
    const initRealtime = async () => {
      const { data: activeRound } = await supabase
        .from("live_rounds")
        .select("id")
        .or("phase.eq.QUESTION,phase.eq.READY")
        .order("scheduled_start", { ascending: false })
        .limit(1)
        .single();

      currentRoundId = activeRound?.id ?? null;
    };

    initRealtime();

    // Subscribe to live_rounds for phase/question updates
    const roundsChannel = supabase
      .channel("overlay-rounds")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "live_rounds",
        },
        async (payload) => {
          const row = payload.new as any;
          
          // Update current round ID
          currentRoundId = row.id;
          
          // Update round number
          setRoundNumber(row.global_round_index ?? null);
          
          // Proper phase mapping
          if (row.phase === "QUESTION") setPhase("question");
          else if (row.phase === "READY") setPhase("countdown");
          else if (row.phase === "REVEAL") setPhase("reveal");
          else if (row.phase === "EXPLANATION" || row.phase === "INTERMISSION") setPhase("explanation");
          else if (row.phase === "FINISHED") setPhase("reveal");

          // Update question start time
          setQuestionStartAt(row.question_started_at);

          // Fetch new question
          const newIndex = row.current_question_index || 0;
          const { data: qData } = await supabase
            .from("live_round_questions")
            .select("position, questions(*)")
            .eq("round_id", row.id)
            .eq("position", newIndex)
            .single();

          if ((qData as any)?.questions) {
            setQuestion({
              index: newIndex,
              total: 50,
              question: (qData as any).questions.question_text || "",
              options: [
                { id: "A", text: (qData as any).questions.option_a || "" },
                { id: "B", text: (qData as any).questions.option_b || "" },
                { id: "C", text: (qData as any).questions.option_c || "" },
                { id: "D", text: (qData as any).questions.option_d || "" },
              ],
              correctAnswer: (qData as any).questions.correct_answer || "A",
              explanation: (qData as any).questions.explanation || "",
            });
          }
        }
      )
      .subscribe();

    // Subscribe to overlay_stats
    const statsChannel = supabase
      .channel("overlay-stats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "overlay_stats",
        },
        (payload) => {
          const row = payload.new as OverlayStatsRow;
          
          // Only update if same round
          if (row.round_id === currentRoundId) {
            setOverlayStats(row);
            // Convert countries with flag mapping
            if (row.countries && Array.isArray(row.countries)) {
              const mappedCountries = row.countries.map((c: any) => ({
                code: c.code,
                name: c.name ?? c.code,
                flag: getFlagFromCode(c.code),
                count: c.count,
              }));
              setCountries(mappedCountries);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to overlay_leaderboard (optimized: patch state, not full refetch)
    const leaderboardChannel = supabase
      .channel("overlay-leaderboard")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "overlay_leaderboard",
        },
        (payload) => {
          const row = payload.new as any;
          
          // Only update if same round
          if (row.round_id === currentRoundId) {
            // Optimized: patch state instead of full refetch
            setLeaderboard((prev) => {
              let updated = prev.map((p) =>
                p.rank === row.rank
                  ? {
                      rank: row.rank ?? 0,
                      username: row.username ?? "",
                      country: row.country ?? "",
                      score: row.score ?? 0,
                      correct: row.correct ?? 0,
                      avgTime: row.avg_time ?? 0,
                    }
                  : p
              );
              
              // If rank not in list, add it (immutable)
              if (!updated.some((p) => p.rank === row.rank)) {
                updated = [
                  ...updated,
                  {
                    rank: row.rank ?? 0,
                    username: row.username ?? "",
                    country: row.country ?? "",
                    score: row.score ?? 0,
                    correct: row.correct ?? 0,
                    avgTime: row.avg_time ?? 0,
                  },
                ];
              }
              
              // Sort and limit to top 10
              return updated.sort((a, b) => a.rank - b.rank).slice(0, 10);
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roundsChannel);
      supabase.removeChannel(statsChannel);
      supabase.removeChannel(leaderboardChannel);
    };
  }, []);
  const totalPlayers =
    overlayStats?.total_players != null ? overlayStats.total_players : 688;
  const answering =
    overlayStats?.answering != null ? overlayStats.answering : 531;
  const correctPercent =
    overlayStats?.correct_percent != null
      ? overlayStats.correct_percent
      : 78;
  const avgTime =
    overlayStats?.avg_time != null ? overlayStats.avg_time : 3.2;

  const getCountryFlag = (code: string) => {
    const country = countries.find((c) => c.code === code);
    return country?.flag || "🌍";
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "💎";
  };

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Orbitron:wght:700;900&family=Outfit:wght:400;500;600;700&family=JetBrains+Mono:wght@600&display=swap");

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          overflow: hidden;
          font-family: "Outfit", sans-serif;
        }

        @keyframes pulseGlow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(139, 92, 246, 0.8),
              0 0 60px rgba(139, 92, 246, 0.4);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes correctReveal {
          0% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 60px rgba(34, 197, 94, 1),
              0 0 100px rgba(34, 197, 94, 0.5);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 40px rgba(34, 197, 94, 0.8);
          }
        }

        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.4s ease-out;
        }

        .stagger-1 {
          animation-delay: 0.1s;
        }
        .stagger-2 {
          animation-delay: 0.2s;
        }
        .stagger-3 {
          animation-delay: 0.3s;
        }
        .stagger-4 {
          animation-delay: 0.4s;
        }
      `}</style>

      <div
        style={{
          width: "1920px",
          height: "1080px",
          background:
            "linear-gradient(135deg, #0a0e27 0%, #1a1447 50%, #0a0e27 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Outfit, sans-serif",
        }}
      >
        {/* Animated background elements */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "5%",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "pulseGlow 4s ease-in-out infinite",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "5%",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(34, 197, 94, 0.1), transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
            animation: "pulseGlow 5s ease-in-out infinite",
          }}
        />

        {/* TOP: Sponsor Banner */}
        <div
          style={{
            height: "50px",
            background:
              "linear-gradient(90deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.08))",
            borderBottom: "1px solid rgba(139, 92, 246, 0.2)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "50px",
            position: "relative",
            zIndex: 10,
          }}
          className="animate-slide-up"
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.5px",
              filter:
                "drop-shadow(0 0 10px rgba(139, 92, 246, 0.4))",
            }}
          >
            www.vibraxx.com
          </div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: 500,
              color: "#64748b",
            }}
          >
            •
          </div>

          <div
            style={{
              width: "350px",
              height: "48px",
              background: "rgba(139, 92, 246, 0.08)",
              border: "1px dashed rgba(139, 92, 246, 0.25)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              color: "#64748b",
              letterSpacing: "0.5px",
            }}
          >
            SPONSOR LOGO
          </div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: 500,
              color: "#64748b",
            }}
          >
            •
          </div>

          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              background:
                "linear-gradient(135deg, #22c55e, #10b981, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.5px",
              filter:
                "drop-shadow(0 0 10px rgba(34, 197, 94, 0.4))",
            }}
          >
            Global Live Quiz
          </div>
        </div>

        {/* Header Bar */}
        <div
          style={{
            height: "90px",
            background:
              "linear-gradient(90deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))",
            backdropFilter: "blur(10px)",
            borderBottom: "2px solid rgba(139, 92, 246, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 50px",
            position: "relative",
            zIndex: 10,
          }}
          className="animate-slide-up"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src="/images/logo.png"
                alt="VibraXX"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback =
                    e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "block";
                }}
                style={{
                  height: "110px",
                  width: "auto",
                  objectFit: "contain",
                }}
              />
              <div
                style={{
                  display: "none",
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "72px",
                  fontWeight: 900,
                  background:
                    "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "2px",
                }}
              >
                VibraXX
              </div>
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                background:
                  "linear-gradient(135deg, #fbbf24, #f59e0b, #ef4444)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "1px",
                filter:
                  "drop-shadow(0 0 10px rgba(251, 191, 36, 0.4))",
              }}
            >
              GLOBAL CHAMPIONSHIP
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "35px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "rgba(34, 197, 94, 0.2)",
                padding: "10px 24px",
                borderRadius: "25px",
                border: "1px solid rgba(34, 197, 94, 0.5)",
                boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  animation: "pulseGlow 2s ease-in-out infinite",
                  boxShadow: "0 0 10px rgba(34, 197, 94, 0.8)",
                }}
              />
              <span
                style={{
                  color: "#22c55e",
                  fontWeight: 700,
                  fontSize: "17px",
                  textShadow:
                    "0 0 10px rgba(34, 197, 94, 0.5)",
                }}
              >
                LIVE
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Users size={26} color="#8b5cf6" />
              <span
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "26px",
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {totalPlayers}
              </span>
              <span style={{ color: "#94a3b8", fontSize: "15px" }}>
                players
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Globe size={26} color="#8b5cf6" />
              <span
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "26px",
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {countries.length}
              </span>
              <span style={{ color: "#94a3b8", fontSize: "15px" }}>
                countries
              </span>
            </div>

            <div
              style={{
                padding: "10px 24px",
                background: "rgba(139, 92, 246, 0.2)",
                borderRadius: "25px",
                border: "1px solid rgba(139, 92, 246, 0.5)",
              }}
            >
              <span
                style={{ color: "#a78bfa", fontSize: "15px" }}
              >
                Round{" "}
              </span>
              <span
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "20px",
                }}
              >
                {roundNumber ? `${roundNumber}/10` : "LIVE"}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div
          style={{
            display: "flex",
            height: "calc(100% - 140px)",
            padding: "35px",
            gap: "35px",
          }}
        >
          {/* Left: Question Area (70%) */}
          <div
            style={{
              flex: "0 0 70%",
              display: "flex",
              flexDirection: "column",
              gap: "25px",
            }}
          >
            {/* Question Number */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "10px",
              }}
              className="animate-fade-in"
            >
              <div
                style={{
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "30px",
                  fontWeight: 700,
                  color: "#8b5cf6",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                }}
              >
                ⚡ Question {question.index}/{question.total} ⚡
              </div>
            </div>

            {/* Question Card */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
                borderRadius: "20px",
                border: "2px solid rgba(139, 92, 246, 0.3)",
                padding: "45px",
                backdropFilter: "blur(10px)",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
              }}
              className="animate-scale-in"
            >
              <div
                style={{
                  fontSize: "38px",
                  fontWeight: 600,
                  color: "#ffffff",
                  lineHeight: "1.4",
                  textAlign: "center",
                  marginBottom: "45px",
                }}
              >
                {question.question}
              </div>

              {/* Options Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "22px",
                }}
              >
                {question.options.map((option, idx) => {
                  const isCorrect =
                    phase === "reveal" &&
                    option.id === question.correctAnswer;
                  const shouldHighlight = isCorrect;

                  return (
                    <div
                      key={option.id}
                      className={`animate-scale-in stagger-${
                        idx + 1
                      }`}
                      style={{
                        background: shouldHighlight
                          ? "linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.2))"
                          : "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8))",
                        border: shouldHighlight
                          ? "3px solid #22c55e"
                          : "2px solid rgba(139, 92, 246, 0.3)",
                        borderRadius: "15px",
                        padding: "28px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: shouldHighlight
                          ? "0 0 40px rgba(34, 197, 94, 0.6)"
                          : "0 10px 30px rgba(0, 0, 0, 0.3)",
                        animation: shouldHighlight
                          ? "correctReveal 1s ease-out"
                          : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "18px",
                      }}
                    >
                      <div
                        style={{
                          width: "55px",
                          height: "55px",
                          borderRadius: "12px",
                          background: shouldHighlight
                            ? "linear-gradient(135deg, #22c55e, #10b981)"
                            : "linear-gradient(135deg, #8b5cf6, #6366f1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "Orbitron, sans-serif",
                          fontSize: "26px",
                          fontWeight: 900,
                          color: "#ffffff",
                          flexShrink: 0,
                        }}
                      >
                        {option.id}
                      </div>
                      <div
                        style={{
                          fontSize: "26px",
                          fontWeight: 500,
                          color: "#ffffff",
                        }}
                      >
                        {option.text}
                      </div>
                      {shouldHighlight && (
                        <CheckCircle
                          size={34}
                          color="#22c55e"
                          style={{ marginLeft: "auto" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timer and Stats Bar */}
            <div
              style={{
                display: "flex",
                gap: "22px",
                alignItems: "center",
              }}
            >
              {/* Timer */}
              <div
                style={{
                  flex: "0 0 220px",
                  background:
                    timeLeft <= 2
                      ? "linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.2))"
                      : "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.2))",
                  border:
                    timeLeft <= 2
                      ? "2px solid #ef4444"
                      : "2px solid rgba(139, 92, 246, 0.5)",
                  borderRadius: "15px",
                  padding: "22px",
                  textAlign: "center",
                  backdropFilter: "blur(10px)",
                }}
                className="animate-scale-in"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    marginBottom: "10px",
                  }}
                >
                  <Clock
                    size={22}
                    color={timeLeft <= 2 ? "#ef4444" : "#8b5cf6"}
                  />
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: "15px",
                      fontWeight: 500,
                    }}
                  >
                    TIME
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "52px",
                    fontWeight: 600,
                    color: timeLeft <= 2 ? "#ef4444" : "#ffffff",
                  }}
                >
                  {timeLeft}s
                </div>
              </div>

              {/* Live Stats */}
              <div
                style={{
                  flex: 1,
                  background:
                    "linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))",
                  border: "2px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: "15px",
                  padding: "22px",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  justifyContent: "space-around",
                }}
                className="animate-slide-up stagger-2"
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: "15px",
                      marginBottom: "8px",
                      fontWeight: 500,
                    }}
                  >
                    ANSWERING
                  </div>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "30px",
                      fontWeight: 600,
                      color: "#8b5cf6",
                    }}
                  >
                    {answering}
                  </div>
                </div>
                <div
                  style={{
                    width: "1px",
                    background: "rgba(139, 92, 246, 0.3)",
                  }}
                />
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: "15px",
                      marginBottom: "8px",
                      fontWeight: 500,
                    }}
                  >
                    AVG TIME
                  </div>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "30px",
                      fontWeight: 600,
                      color: "#3b82f6",
                    }}
                  >
                    {avgTime}s
                  </div>
                </div>
                <div
                  style={{
                    width: "1px",
                    background: "rgba(139, 92, 246, 0.3)",
                  }}
                />
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: "15px",
                      marginBottom: "8px",
                      fontWeight: 500,
                    }}
                  >
                    CORRECT
                  </div>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "30px",
                      fontWeight: 600,
                      color: "#22c55e",
                    }}
                  >
                    {correctPercent}%
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation Card */}
            {phase === "explanation" && (
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.15))",
                  border: "2px solid rgba(34, 197, 94, 0.5)",
                  borderRadius: "15px",
                  padding: "32px",
                  backdropFilter: "blur(10px)",
                }}
                className="animate-slide-up"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    marginBottom: "18px",
                  }}
                >
                  <Zap size={30} color="#22c55e" />
                  <div
                    style={{
                      fontFamily: "Orbitron, sans-serif",
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "#22c55e",
                      letterSpacing: "1px",
                    }}
                  >
                    EXPLANATION
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "22px",
                    color: "#ffffff",
                    lineHeight: "1.6",
                  }}
                >
                  {question.explanation}
                </div>
              </div>
            )}
          </div>

          {/* Right: Leaderboard & Stats (30%) */}
          <div
            style={{
              flex: "0 0 30%",
              display: "flex",
              flexDirection: "column",
              gap: "22px",
            }}
          >
            {/* Leaderboard */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
                border: "2px solid rgba(139, 92, 246, 0.3)",
                borderRadius: "20px",
                padding: "28px",
                backdropFilter: "blur(10px)",
                flex: 1,
                overflow: "hidden",
              }}
              className="animate-slide-up stagger-3"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "22px",
                  paddingBottom: "18px",
                  borderBottom: "2px solid rgba(139, 92, 246, 0.3)",
                }}
              >
                <Trophy size={26} color="#fbbf24" />
                <div
                  style={{
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: "1px",
                  }}
                >
                  TOP 10 LIVE
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  overflowY: "auto",
                  maxHeight: "100%",
                }}
              >
                {leaderboard.map((player, idx) => (
                  <div
                    key={player.rank + player.username}
                    className={`animate-fade-in stagger-${Math.min(
                      idx + 1,
                      4
                    )}`}
                    style={{
                      background:
                        player.rank <= 3
                          ? "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.1))"
                          : "rgba(30, 41, 59, 0.5)",
                      border:
                        player.rank <= 3
                          ? "1px solid rgba(139, 92, 246, 0.4)"
                          : "1px solid rgba(71, 85, 105, 0.3)",
                      borderRadius: "12px",
                      padding: "14px 18px",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "22px",
                        width: "32px",
                        textAlign: "center",
                      }}
                    >
                      {getMedalEmoji(player.rank)}
                    </div>
                    <div
                      style={{
                        fontSize: "19px",
                        fontWeight: 600,
                        color: "#ffffff",
                        flex: 1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {player.username}
                    </div>
                    <div style={{ fontSize: "20px" }}>
                      {getCountryFlag(player.country)}
                    </div>
                    <div
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#22c55e",
                      }}
                    >
                      {player.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Country Stats */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
                border: "2px solid rgba(139, 92, 246, 0.3)",
                borderRadius: "20px",
                padding: "28px",
                backdropFilter: "blur(10px)",
              }}
              className="animate-slide-up stagger-4"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "22px",
                  paddingBottom: "18px",
                  borderBottom: "2px solid rgba(139, 92, 246, 0.3)",
                }}
              >
                <Globe size={26} color="#3b82f6" />
                <div
                  style={{
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: "1px",
                  }}
                >
                  COUNTRIES
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {countries.map((country, idx) => (
                  <div
                    key={country.code}
                    className={`animate-fade-in stagger-${idx + 1}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div style={{ fontSize: "26px" }}>
                      {country.flag}
                    </div>
                    <div
                      style={{
                        fontSize: "17px",
                        color: "#94a3b8",
                        flex: 1,
                      }}
                    >
                      {country.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "22px",
                        fontWeight: 600,
                        color: "#8b5cf6",
                      }}
                    >
                      {country.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
