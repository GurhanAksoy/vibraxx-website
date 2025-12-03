import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // 1) Kullanıcının kim olduğu (Token cookie üzerinden değil → service role ile RPC güvenli)
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return NextResponse.json({
      canEnterLobby: false,
      reason: "NOT_AUTHENTICATED"
    });
  }

  // 2) Round hakkı kontrolü
  const { data: rounds, error: roundsError } = await supabase
    .from("user_rounds")
    .select("remaining_rounds")
    .eq("user_id", user.id)
    .single();

  if (roundsError || !rounds) {
    return NextResponse.json({
      canEnterLobby: false,
      reason: "NO_ROUNDS_TABLE"
    });
  }

  if (rounds.remaining_rounds <= 0) {
    return NextResponse.json({
      canEnterLobby: false,
      reason: "NO_ROUNDS_AVAILABLE"
    });
  }

  // 3) Giriş serbest
  return NextResponse.json({
    canEnterLobby: true,
    remaining_rounds: rounds.remaining_rounds
  });
}
