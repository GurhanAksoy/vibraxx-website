import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,   // ← DOĞRU KEY
    {
      auth: { persistSession: false }
    }
  );

  try {
    // En son round'u al
    const { data: round, error } = await supabase
      .from("rounds")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    if (!round) {
      return NextResponse.json({
        success: true,
        message: "No active round"
      });
    }

    // Overlay başlangıç değerleri
    await supabase
      .from("overlay_round_state")
      .update({
        phase: "question",
        question_index: 1,
        time_left: 6
      })
      .eq("round_id", round.id);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      error: e.message
    });
  }
}
