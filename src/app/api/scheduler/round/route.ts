import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // önemli!
);

export async function GET() {
  const now = new Date();

  // Round timeline: 00,15,30,45
  const minute = now.getMinutes();
  const block = minute - (minute % 15); // 0,15,30,45
  const roundStart = new Date(now);
  roundStart.setMinutes(block, 0, 0);

  const roundEnd = new Date(roundStart);
  roundEnd.setMinutes(roundStart.getMinutes() + 15);

  const roundNumber = block / 15 + now.getHours() * 4;

  // 1) Round kaydı al
  let { data: rounds } = await supabase
    .from("global_rounds")
    .select("*")
    .eq("round_number", roundNumber)
    .limit(1);

  let round = rounds?.[0];

  // Round yoksa oluştur
  if (!round) {
    const { data: created } = await supabase
      .from("global_rounds")
      .insert({
        start_time: roundStart.toISOString(),
        end_time: roundEnd.toISOString(),
        status: "running",
        round_number: roundNumber
      })
      .select()
      .single();

    round = created;
  }

  // 2) Round durumunu güncelle
  const secondsSinceStart = Math.floor((now.getTime() - roundStart.getTime()) / 1000);

  // Faz sınırları
  const READY = 15;
  const QUESTION_TIME = 12; // soru başına saniye
  const TOTAL_QUESTIONS = 50;

  let phase = "ready";
  let question_index = 0;
  let time_left = 0;

  if (secondsSinceStart < READY) {
    phase = "ready";
    time_left = READY - secondsSinceStart;
  } else {
    const s = secondsSinceStart - READY;
    question_index = Math.floor(s / QUESTION_TIME) + 1;

    if (question_index > TOTAL_QUESTIONS) {
      phase = "finished";
      question_index = TOTAL_QUESTIONS;
      time_left = 0;
    } else {
      phase = "question";
      const mod = s % QUESTION_TIME;
      time_left = QUESTION_TIME - mod;
    }
  }

  // 3) Overlay state güncelle
  await supabase.from("live_round_state").update({
    phase,
    question_index,
    time_left,
    round_id: round.id,
    updated_at: new Date().toISOString()
  }).eq("round_id", round.id);

  return NextResponse.json({ ok: true, roundNumber, phase, question_index, time_left });
}
