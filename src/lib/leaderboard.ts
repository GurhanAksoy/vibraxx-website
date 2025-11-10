import { supabase } from "./supabaseClient";

/**
 * Save a user's finished round result.
 * - roundId: the synchronized global round id (if you don't have server sync yet, pass null)
 * - accuracy: 0..100
 * - durationSeconds: total time player spent (optional)
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

  const { error } = await supabase.from("user_rounds").insert([
    {
      user_id: userId,
      round_id: roundId,
      correct_count: correct,
      wrong_count: wrong,
      accuracy,
      duration_seconds: durationSeconds,
    },
  ]);

  if (error) {
    console.error("saveRoundResult error:", error);
    throw error;
  }
}

/**
 * Get champions:
 * - roundChampion: top score for the latest round (by rounds.started_at)
 * - day/week/month: top 3 by score within the time windows
 */
export async function getChampions() {
  // Latest round id
  const { data: latestRound } = await supabase
    .from("rounds")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let roundChampion: any[] = [];
  if (latestRound?.id) {
    const { data: rc } = await supabase
      .from("user_rounds")
      .select("*, user:auth.users(id, email, user_metadata)")
      .eq("round_id", latestRound.id)
      .order("score", { ascending: false })
      .limit(3);
    roundChampion = rc || [];
  }

  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  // Simple window helpers
  const weekStart = new Date(now);
  const day = weekStart.getDay(); // 0..6
  const diff = (day + 6) % 7; // Monday-based week
  weekStart.setDate(weekStart.getDate() - diff);
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data: dayTop } = await supabase
    .from("user_rounds")
    .select("*, user:auth.users(id, email, user_metadata)")
    .gte("created_at", dayStart.toISOString())
    .order("score", { ascending: false })
    .limit(3);

  const { data: weekTop } = await supabase
    .from("user_rounds")
    .select("*, user:auth.users(id, email, user_metadata)")
    .gte("created_at", weekStart.toISOString())
    .order("score", { ascending: false })
    .limit(3);

  const { data: monthTop } = await supabase
    .from("user_rounds")
    .select("*, user:auth.users(id, email, user_metadata)")
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
