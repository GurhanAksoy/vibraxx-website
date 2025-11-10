import { createClient } from "@supabase/supabase-js";

// Supabase client oluştur
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🔹 Günlük Şampiyon
export async function dailyChampion() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);

  const { data } = await supabase
    .from("user_rounds")
    .select("user_id, correct_count, wrong_count, accuracy")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString())
    .order("accuracy", { ascending: false })
    .limit(1)
    .single();

  if (data) {
    await supabase.from("daily_champions").insert({
      user_id: data.user_id,
      date_utc: start.toISOString().slice(0, 10),
      correct_count: data.correct_count,
      wrong_count: data.wrong_count,
      accuracy: data.accuracy,
    });
  }
}

// 🔹 Haftalık Şampiyon
export async function weeklyChampion() {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  monday.setUTCHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  const { data } = await supabase
    .from("user_rounds")
    .select("user_id, correct_count, wrong_count, accuracy")
    .gte("created_at", monday.toISOString())
    .lte("created_at", sunday.toISOString())
    .order("accuracy", { ascending: false })
    .limit(1)
    .single();

  if (data) {
    await supabase.from("weekly_champions").insert({
      user_id: data.user_id,
      week_start: monday.toISOString().slice(0, 10),
      week_end: sunday.toISOString().slice(0, 10),
      correct_count: data.correct_count,
      wrong_count: data.wrong_count,
      accuracy: data.accuracy,
    });
  }
}

// 🔹 Aylık Şampiyon
export async function monthlyChampion() {
  const now = new Date();
  const firstDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const { data } = await supabase
    .from("user_rounds")
    .select("user_id, correct_count, wrong_count, accuracy")
    .gte("created_at", firstDay.toISOString())
    .lt("created_at", nextMonth.toISOString())
    .order("accuracy", { ascending: false })
    .limit(1)
    .single();

  if (data) {
    await supabase.from("monthly_champions").insert({
      user_id: data.user_id,
      month_label: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`,
      correct_count: data.correct_count,
      wrong_count: data.wrong_count,
      accuracy: data.accuracy,
    });
  }
}
