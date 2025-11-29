import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic"; // cache'lenmesin, her seferinde canlı gelsin

export async function GET() {
  try {
    // 1) Basit environment kontrolü
    const envOk = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 2) questions tablosundan ufak bir örnek çekelim
    const { data: questions, error: questionsError, count } = await supabaseAdmin
      .from("questions")
      .select("id, question_text, correct_answer, category, difficulty, active, order_index", { count: "exact", head: false })
      .order("order_index", { ascending: true })
      .limit(10);

    // 3) profiles tablosu var mı? (yoksa hata alırız, bu da bilgi)
    const { count: profileCount, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true });

    return NextResponse.json(
      {
        ok: true,
        env: {
          hasSupabaseUrl: !!process.env.SUPABASE_URL,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
        questions: {
          total: count ?? null,
          sampleCount: questions ? questions.length : 0,
          sample: questions ?? [],
          error: questionsError ? questionsError.message : null,
        },
        profiles: {
          exists: !profilesError,
          total: profilesError ? null : profileCount ?? null,
          error: profilesError ? profilesError.message : null,
        },
      },
      { status: envOk ? 200 : 500 }
    );
  } catch (err: any) {
    console.error("🔴 /api/supabase-check error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
