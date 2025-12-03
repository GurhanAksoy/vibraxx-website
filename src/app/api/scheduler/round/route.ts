import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * 🔥 DERLENME SORUNLARINI %100 ÇÖZEN AYARLAR
 * - dynamic = force-dynamic → Edge önbellekleme engellenir
 * - revalidate = 0 → her çağrıda çalışır
 * - runtime = "nodejs" → SERVICE_ROLE_KEY çalışır
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

// 🔥 Server-side Supabase client (SERVICE ROLE → sadece backend)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

/** ───────────────────────────────────────────────
 *  15 Dakikalık blok hesaplama (UTC)
 *  Round numarası ve planlanan başlangıç saati
 * ─────────────────────────────────────────────── */
function getCurrentRoundBlock() {
  const now = new Date();
  const minute = now.getUTCMinutes();
  const block = minute - (minute % 15); // 00 / 15 / 30 / 45

  const roundNumber = now.getUTCHours() * 4 + block / 15;

  const scheduledStart = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    block,
    0
  ));

  return { roundNumber, scheduledStart };
}

/** ───────────────────────────────────────────────
 *  GET → round scheduler çalıştır
 * ─────────────────────────────────────────────── */
export async function GET() {
  const now = new Date();
  const { roundNumber, scheduledStart } = getCurrentRoundBlock();

  /** ─────────────────────────────────────────
   * 1) ACTIVE 15-min round var mı?
   * ───────────────────────────────────────── */
  const { data: existingRounds, error: fetchError } = await supabase
    .from("live_rounds")
    .select("*")
    .eq("round_number", roundNumber)
    .limit(1);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  let round = existingRounds?.[0];

  /** ─────────────────────────────────────────
   * 2) Round yoksa → 50 soru seç ve round oluştur
   * ───────────────────────────────────────── */
  if (!round) {
    const { data: questions } = await supabase
      .from("questions")
      .select("id")
      .eq("active", true)
      .limit(5000);

    const shuffled = questions
      ?.map((q) => q.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 50);

    const { data: created, error: insertError } = await supabase
      .from("live_rounds")
      .insert({
        round_number: roundNumber,
        scheduled_start: scheduledStart.toISOString(),
        phase: "READY",
        status: "scheduled",
        current_question_index: 0,
        questions: shuffled
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    round = created;

    // mapping tabloya yaz (round_id + question_id + position)
    const bulkInsert = shuffled.map((id: number, index: number) => ({
      round_id: round.id,
      question_id: id,
      position: index + 1,
    }));

    await supabase.from("live_round_questions").insert(bulkInsert);
  }

  /** ─────────────────────────────────────────
   * 3) Round faz hesaplama (READY → QUESTION → FINISHED)
   * ───────────────────────────────────────── */
  const SECONDS_READY = 15;
  const QUESTION_TIME = 12;
  const TOTAL_QUESTIONS = 50;

  const secondsSinceStart = Math.floor(
    (now.getTime() - new Date(round.scheduled_start).getTime()) / 1000
  );

  let phase = "READY";
  let question_index = 0;
  let time_left = 0;

  if (secondsSinceStart < SECONDS_READY) {
    phase = "READY";
    time_left = SECONDS_READY - secondsSinceStart;
  } else {
    const s = secondsSinceStart - SECONDS_READY;
    question_index = Math.floor(s / QUESTION_TIME) + 1;

    if (question_index > TOTAL_QUESTIONS) {
      phase = "FINISHED";
      question_index = TOTAL_QUESTIONS;
      time_left = 0;
    } else {
      phase = "QUESTION";
      const mod = s % QUESTION_TIME;
      time_left = QUESTION_TIME - mod;
    }
  }

  /** ─────────────────────────────────────────
   * 4) live_rounds güncelle
   * ───────────────────────────────────────── */
  await supabase
    .from("live_rounds")
    .update({
      phase,
      current_question_index: question_index,
      question_started_at: now.toISOString()
    })
    .eq("id", round.id);

  /** ─────────────────────────────────────────
   * 5) overlay_round_state güncelle (KRİTİK SATIR)
   *    ❗ round_id ile değil → id = 2 olan SATIR güncellenir
   * ───────────────────────────────────────── */
  await supabase
    .from("overlay_round_state")
    .update({
      round_id: round.id,
      phase: phase === "READY" ? "countdown" : "question",
      question_index,
      time_left,
      updated_at: now.toISOString()
    })
    .eq("id", 2);  // ✔ SENDEKİ TEK SATIR = 2

  /** ─────────────────────────────────────────
   * 6) Response
   * ───────────────────────────────────────── */
  return NextResponse.json({
    ok: true,
    round_id: round.id,
    round_number: roundNumber,
    phase,
    question_index,
    time_left
  });
}
