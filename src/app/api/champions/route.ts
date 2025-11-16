import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    // latest round
    const { data: latestRound } = await supabase
      .from("rounds")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    if (!latestRound) {
      return NextResponse.json({
        latestRound: null,
        roundChampion: [],
        dayTop: [],
        weekTop: [],
        monthTop: [],
      });
    }

    // top scores for that round
    const { data: roundScores } = await supabase
      .from("user_rounds")
      .select("*")
      .eq("round_id", latestRound.id)
      .order("accuracy", { ascending: false })
      .limit(3);

    // daily, weekly, monthly global stats
    const { data: dayTop } = await supabase
      .from("user_rounds")
      .select("*")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("accuracy", { ascending: false })
      .limit(3);

    const { data: weekTop } = await supabase
      .from("user_rounds")
      .select("*")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("accuracy", { ascending: false })
      .limit(3);

    const { data: monthTop } = await supabase
      .from("user_rounds")
      .select("*")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("accuracy", { ascending: false })
      .limit(3);

    return NextResponse.json({
      latestRound,
      roundChampion: roundScores || [],
      dayTop: dayTop || [],
      weekTop: weekTop || [],
      monthTop: monthTop || [],
    });
  } catch (err) {
    console.error("Champions API Error:", err);
    return NextResponse.json(
      { error: "Failed to load champions data" },
      { status: 500 }
    );
  }
}
