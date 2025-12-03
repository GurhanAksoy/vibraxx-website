import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";     // ÇOK ÖNEMLİ — Edge OLAMAZ
export const dynamic = "force-dynamic";

export async function POST(req: Request) {

  // Client: anon key kullanmalı, service key değil
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,  // 🔥 DEĞİŞTİ
    { auth: { persistSession: false } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "NOT_AUTHENTICATED" },
      { status: 401 }
    );
  }

  const { round_id } = await req.json();

  if (!round_id) {
    return NextResponse.json(
      { success: false, error: "NO_ROUND_ID" },
      { status: 400 }
    );
  }

  // Round tüketimi — RPC yerine direkt tablo güncelleme
  const { error } = await supabase.rpc("consume_round", {
    p_user_id: user.id
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
