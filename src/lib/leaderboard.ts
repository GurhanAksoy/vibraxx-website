import { supabase } from "./supabaseClient";

/**
 * Save a user's finished round result.
 */
export async function saveRoundResult(opts: {
  userId: string;
  roundId?: string | null;
  correct: number;
  wrong: number;
  accuracy: number;
  durationSeconds?: number;
}) {
  const { userId, roundId = null, correct, wrong, accuracy, durationSeconds = 0 } = opts;

  // Score hesapla
  const score = correct * 10 - wrong * 5 + accuracy;

  const { error } = await supabase.from("user_rounds").insert([
    {
      user_id: userId,
      round_id: roundId,
      correct_count: correct,
      wrong_count: wrong,
      accuracy,
      duration_seconds: durationSeconds,
      score,
    },
  ]);

  if (error) {
    console.error("saveRoundResult error:", error);
    throw error;
  }
}

/**
 * Get champions for round / day / week / month
 */
export async function getChampions() {
  // -------------------------------
  // 1) Latest round
  // -------------------------------
  const { data: latestRound } = await supabase
    .from("rounds")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let roundChampion: any[] = [];

  if (latestRound?.id) {
    const { data } = await supabase
      .from("user_rounds")
      .select(`
        id,
        score,
        correct_count,
        wrong_count,
        accuracy,
        profiles!inner(id, name)
      `)
      .eq("round_id", latestRound.id)
      .order("score", { ascending: false })
      .limit(3);

    roundChampion = data || [];
  }

  // -------------------------------
  // 2) Time windows
  // -------------------------------
  const now = new Date();

  // Day start (midnight)
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  // Week start (Monday based)
  const weekStart = new Date(now);
  const dow = weekStart.getDay(); // 0-6
  const diff = (dow + 6) % 7;
  weekStart.setDate(weekStart.getDate() - diff);
  weekStart.setHours(0, 0, 0, 0);

  // Month start
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // -------------------------------
  // 3) Day Leaderboard
  // -------------------------------
  const { data: dayTop } = await supabase
    .from("user_rounds")
    .select(`
      id,
      score,
      correct_count,
      wrong_count,
      accuracy,
      profiles!inner(id, name)
    `)
    .gte("created_at", dayStart.toISOString())
    .order("score", { ascending: false })
    .limit(3);

  // -------------------------------
  // 4) Week Leaderboard
  // -------------------------------
  const { data: weekTop } = await supabase
    .from("user_rounds")
    .select(`
      id,
      score,
      correct_count,
      wrong_count,
      accuracy,
      profiles!inner(id, name)
    `)
    .gte("created_at", weekStart.toISOString())
    .order("score", { ascending: false })
    .limit(3);

  // -------------------------------
  // 5) Month Leaderboard
  // -------------------------------
  const { data: monthTop } = await supabase
    .from("user_rounds")
    .select(`
      id,
      score,
      correct_count,
      wrong_count,
      accuracy,
      profiles!inner(id, name)
    `)
    .gte("created_at", monthStart.toISOString())
    .order("score", { ascending: false })
    .limit(3);

  return {
    latestRound: latestRound ?? null,
    roundChampion: roundChampion ?? [],
    dayTop: dayTop ?? [],
    weekTop: weekTop ?? [],
    monthTop: monthTop ?? [],
  };
}
