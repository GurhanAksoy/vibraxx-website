import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";   // Edge DEĞİL
export const dynamic = "force-dynamic";

export async function GET() {

  // Kullanıcıyı doğrulamak için ANON KEY kullanılmalı
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      canEnterLobby: false,
      reason: "NOT_AUTHENTICATED"
    });
  }

  // user_rounds tablosundan remaining çek (doğru kolon)
  const { data: roundInfo, error } = await supabase
    .from("user_rounds")
    .select("purchased, used, remaining")
    .eq("user_id", user.id)
    .single();

  if (error || !roundInfo) {
    return NextResponse.json({
      canEnterLobby: false,
      reason: "USER_ROUNDS_NOT_FOUND"
    });
  }

  if (roundInfo.remaining <= 0) {
    return NextResponse.json({
      canEnterLobby: false,
      reason: "NO_ROUNDS_AVAILABLE"
    });
  }

  return NextResponse.json({
    canEnterLobby: true,
    remaining_rounds: roundInfo.remaining
  });
}
