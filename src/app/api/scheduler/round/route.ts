import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

// ---------------------------------------------------------
// ZAMAN SABİTLERİ (VibraXX OYUN TASARIMI)
// ---------------------------------------------------------
const SECONDS_READY = 15;
const QUESTION_SECONDS = 6;
const EXPLANATION_SECONDS = 5;
const PER_QUESTION_SECONDS = QUESTION_SECONDS + EXPLANATION_SECONDS; // 11
const TOTAL_QUESTIONS = 50;

// ---------------------------------------------------------
// ROUND BLOCK HESAPLAMA (UTC / 15 dk)
// ---------------------------------------------------------
function getCurrentRoundBlock() {
  const now = new Date();
  const minute = now.getUTCMinutes();
  const block = minute - (minute % 15);

  const roundNumber = now.getUTCHours() * 4 + block / 15;

  const scheduledStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      block,
      0
    )
  );

  return { roundNumber, scheduledStart };
}

// ---------------------------------------------------------
// API HANDLER (SADECE GÜNCELLEME - YARATMA YOK)
// ---------------------------------------------------------
export async function GET() {
  const now = new Date();
  const { roundNumber, scheduledStart } = getCurrentRoundBlock();

  // -----------------------------------------------------
  // 1️⃣ ROUND VAR MI?
  // -----------------------------------------------------
  const { data: existingRounds, error: fetchError } = await supabaseAdmin
    .from("live_rounds")
    .select("*")
    .eq("round_number", roundNumber)
    .limit(1);

  if (fetchError) {
    console.error("ROUND_FETCH_FAILED", fetchError);
    return NextResponse.json(
      { ok: false, error: "ROUND_FETCH_FAILED" },
      { status: 500 }
    );
  }

  const round = existingRounds?.[0];

  // -----------------------------------------------------
  // 2️⃣ ROUND YOKSA HATA DÖN (DB YARATIR)
  // -----------------------------------------------------
  if (!round) {
    console.error("ROUND_NOT_READY", { roundNumber });
    return NextResponse.json(
      { ok: false, error: "ROUND_NOT_READY" },
      { status: 503 }
    );
  }

  // -----------------------------------------------------
  // 3️⃣ FAZ / ZAMAN HESABI (2 FAZ: QUESTION + EXPLANATION)
  // -----------------------------------------------------
  let secondsSinceStart = Math.floor(
    (now.getTime() - new Date(round.scheduled_start).getTime()) / 1000
  );
  if (secondsSinceStart < 0) secondsSinceStart = 0;

  let phase: "READY" | "QUESTION" | "EXPLANATION" | "FINISHED" = "READY";
  let question_index = 0;
  let time_left = 0;

  if (secondsSinceStart < SECONDS_READY) {
    phase = "READY";
    time_left = SECONDS_READY - secondsSinceStart;
  } else {
    const s = secondsSinceStart - SECONDS_READY;
    question_index = Math.floor(s / PER_QUESTION_SECONDS) + 1;

    if (question_index > TOTAL_QUESTIONS) {
      phase = "FINISHED";
      question_index = TOTAL_QUESTIONS;
      time_left = 0;
    } else {
      const phaseInQuestion = s % PER_QUESTION_SECONDS;

      if (phaseInQuestion < QUESTION_SECONDS) {
        phase = "QUESTION";
        time_left = QUESTION_SECONDS - phaseInQuestion;
      } else {
        phase = "EXPLANATION";
        time_left = PER_QUESTION_SECONDS - phaseInQuestion;
      }
    }
  }

  // -----------------------------------------------------
  // 4️⃣ API STATE DİSİPLİNİ (KALE)
  // -----------------------------------------------------
  const prevStatus = round.status;
  const prevPhase = round.phase;

  // ❌ FINISHED ROUND ASLA GÜNCELLENMEZ
  if (prevPhase === "FINISHED") {
    return NextResponse.json(
      { ok: false, error: "ROUND_ALREADY_FINISHED" },
      { status: 409 }
    );
  }

  // 🔒 UPDATE PAYLOAD (BASE)
  const updates: any = {
    phase,
    current_question_index: question_index,
  };

  // 🔒 YENİ SORUYA GEÇİŞ → question_started_at SET ET
  const isNewQuestion = 
    phase === "QUESTION" && 
    question_index !== round.current_question_index;

  if (isNewQuestion) {
    updates.question_started_at = now.toISOString();
  }

  // 🔒 READY → QUESTION (İLK SORU BAŞLIYOR)
  if (prevPhase === "READY" && phase === "QUESTION") {
    updates.status = "running";
    updates.actual_start = round.scheduled_start;
  }

  // 🔒 ANY → FINISHED
  if (phase === "FINISHED") {
    updates.status = "finished";
  }

  // -----------------------------------------------------
  // 5️⃣ ATOMIC + OPTIMISTIC UPDATE
  // -----------------------------------------------------
  const { error: updateError } = await supabaseAdmin
    .from("live_rounds")
    .update(updates)
    .eq("id", round.id)
    .eq("status", prevStatus)
    .eq("phase", prevPhase);

  if (updateError) {
    console.error("STATE_CONFLICT", {
      round_id: round.id,
      expected: { status: prevStatus, phase: prevPhase },
      attempted: { status: updates.status, phase: updates.phase },
      error: updateError,
    });
    return NextResponse.json(
      { ok: false, error: "STATE_CONFLICT" },
      { status: 409 }
    );
  }

  // -----------------------------------------------------
  // 6️⃣ AUDIT LOG
  // -----------------------------------------------------
  console.log(JSON.stringify({
    event: "ROUND_UPDATE",
    timestamp: now.toISOString(),
    round_id: round.id,
    round_number: round.round_number,
    transition: `${prevStatus}/${prevPhase} → ${updates.status ?? prevStatus}/${phase}`,
    question_index,
    time_left,
    is_new_question: isNewQuestion,
    source: "api_scheduler_round",
  }));

  // -----------------------------------------------------
  // 7️⃣ OVERLAY STATE
  // -----------------------------------------------------
  const overlayPhase = 
    phase === "READY" ? "countdown" 
    : phase === "QUESTION" ? "question"
    : phase === "EXPLANATION" ? "explanation"
    : "finished";

  await supabaseAdmin
    .from("overlay_round_state")
    .upsert({
      round_id: round.id,
      phase: overlayPhase,
      current_question_index: question_index,
      question_started_at: round.question_started_at ?? now.toISOString(),
      updated_at: now.toISOString(),
    }, {
      onConflict: "round_id",
    });

  // -----------------------------------------------------
  // 8️⃣ RESPONSE
  // -----------------------------------------------------
  return NextResponse.json({
    ok: true,
    round_id: round.id,
    round_number: roundNumber,
    phase,
    status: updates.status ?? prevStatus,
    question_index,
    time_left,
    scheduled_start: round.scheduled_start,
    actual_start: round.actual_start ?? updates.actual_start,
  });
}