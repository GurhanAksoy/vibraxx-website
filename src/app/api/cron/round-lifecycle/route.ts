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
    // Yeni round oluştur
    const { data: newRound, error } = await supabase
      .from("rounds")
      .insert([
        {
          status: "READY",
          started_at: new Date()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      round: newRound
    });
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      error: e.message
    });
  }
}
