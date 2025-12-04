import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs"; // ⚠ Edge OLMAZ

function getCurrentRoundBlock() {
  const now = new Date();
  const minute = now.getUTCMinutes();
  const block = minute - (minute % 15);
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

export async function GET() {
  const now = new Date();
  const { roundNumber, scheduledStart } = getCurrentRoundBlock();

  // 1) Round var mı?
  const { data: existingRounds } = await supabaseAdmin
    .from("live_rounds")
    .select("*")
    .eq("round_number", roundNumber)
    .limit(1);

  let round = existingRounds?.[0];

  // 2) Round yoksa oluştur
  if (!round) {
    const { data: questions } = await supabaseAdmin
      .from("questions")
      .select("id")
      .eq("active", true)
      .limit(5000);

    const shuffled = questions
      ?.map((q) => q.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 50);

    const { data: created } = await supabaseAdmin
      .from("live_rounds")
      .insert({
        round_number,
        scheduled_start: scheduledStart.toISOString(),
        phase: "READY",
        status: "scheduled",
        current_question_index: 0,
        questions: shuffled
      })
      .select()
      .single();

    round = created;

    const list = shuffled.map((id: number, index: number) => ({
      round_id: round.id,
      question_id: id,
      position: index + 1,
    }));

    await supabaseAdmin.from("live_round_questions").insert(list);
  }

  // 3) Faz hesaplama (NEGATİF DEĞER DÜZELTME)
  const SECONDS_READY = 15;
  const QUESTION_TIME = 12;
  const TOTAL_QUESTIONS = 50;

  let secondsSinceStart = Math.floor(
    (now.getTime() - new Date(round.scheduled_start).getTime()) / 1000
  );

  // 🔥 NEGATİF OLURSA → 0 yapıyoruz. Build hatası buradan çıkıyordu!
  if (secondsSinceStart < 0) secondsSinceStart = 0;

  let phase = "READY";
  let question_index = 0;
  let time_left = 0;

  if (secondsSinceStart < SECONDS_READY) {
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
      time_left = QUESTION_TIME - (s % QUESTION_TIME);
    }
  }

  // 4) live_rounds güncelle
  await supabaseAdmin
    .from("live_rounds")
    .update({
      phase,
      current_question_index: question_index,
      question_started_at: now.toISOString()
    })
    .eq("id", round.id);

  // 5) overlay state (TEK SATIR id=2)
  await supabaseAdmin
    .from("overlay_round_state")
    .update({
      round_id: round.id,
      phase: phase === "READY" ? "countdown" : "question",
      question_index,
      time_left,
      updated_at: now.toISOString()
    })
    .eq("id", 2);

  return NextResponse.json({
    ok: true,
    round_id: round.id,
    phase,
    question_index,
    time_left
  });
}
