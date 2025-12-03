import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { round_id } = await req.json();

  if (!round_id) {
    return NextResponse.json(
      { success: false, error: "NO_ROUND_ID" },
      { status: 400 }
    );
  }

  // Kullanıcı doğrulaması
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return NextResponse.json({
      success: false,
      error: "NOT_AUTHENTICATED"
    });
  }

  // Hakkı düşür
  const { error } = await supabase.rpc("consume_round_for_round", {
    p_round_id: round_id
  });

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }

  return NextResponse.json({ success: true });
}
