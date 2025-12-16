import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  MODEL: "claude-3-5-haiku-20241022",
  API_URL: "https://api.anthropic.com/v1/messages",
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.65,
  ANTHROPIC_VERSION: "2023-06-01",
  BATCH_SIZE: 50,
  MAX_PER_RUN: 500, // ← TEK SEFERDE MAX 500 SORU
};

const CATEGORY_DISTRIBUTION = {
  "General Knowledge": 0.40,
  "Science": 0.15,
  "Geography": 0.15,
  "History": 0.10,
  "Technology": 0.10,
  "Arts & Literature": 0.05,
  "Sports & Games": 0.05,
};

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 PROMPT
// ═══════════════════════════════════════════════════════════════════════════

function buildPrompt(count: number, category: string): string {
  return `You are the Chief Question Architect for VibraXX — the world's most premium real-time competitive quiz platform.

🏆 CONTEXT:
- £1000 monthly prize pool
- Global audience across 50+ countries
- Real-time competition with 6-second answer windows
- Players are educated adults seeking intellectual challenge

Your mission: Create questions that are FAIR, INTELLIGENT, and THRILLING.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️  THE 6-SECOND RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TIMING BREAKDOWN:
├─ 0-3 seconds → Player reads question + options
├─ 3-6 seconds → Player thinks and selects answer
└─ Total: 6 seconds (strictly enforced by platform)

DIFFICULTY CALIBRATION:
├─ Target success rate: 40-60% of global players
├─ Too easy (>80% success) → REJECT
├─ Too hard (<25% success) → REJECT
└─ Sweet spot: Requires knowledge + reasoning, NOT luck

DIFFICULTY LEVEL: Medium to Medium-Hard ONLY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 MANDATORY CATEGORY FOR THIS REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOU MUST GENERATE QUESTIONS ONLY FOR THIS CATEGORY: "${category}"
ALL ${count} questions MUST use category: "${category}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 OUTPUT FORMAT (STRICT JSON)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON array. NO markdown, NO comments.

[
  {
    "category": "${category}",
    "difficulty": "medium",
    "question": "At what temperature does water boil at sea level?",
    "options": {
      "A": "90°C",
      "B": "100°C",
      "C": "110°C",
      "D": "95°C"
    },
    "correct_answer": "B",
    "explanation": "Water boils at 100°C (212°F) at sea level under standard atmospheric pressure."
  }
]

Generate EXACTLY ${count} questions for category "${category}".
Quality over everything. VibraXX is PREMIUM.
BEGIN GENERATION NOW.`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔧 HAIKU API
// ═══════════════════════════════════════════════════════════════════════════

async function callHaiku(count: number, category: string, apiKey: string) {
  const response = await fetch(CONFIG.API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": CONFIG.ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: CONFIG.MODEL,
      max_tokens: CONFIG.MAX_TOKENS,
      temperature: CONFIG.TEMPERATURE,
      messages: [{ role: "user", content: buildPrompt(count, category) }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Haiku error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text;

  if (!text) throw new Error("No text from Haiku");

  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");

  if (start === -1 || end === -1) throw new Error("Invalid JSON");

  const questions = JSON.parse(text.slice(start, end + 1));

  return { questions, usage: data.usage };
}

// ═══════════════════════════════════════════════════════════════════════════
// 🗄️ SUPABASE INSERT
// ═══════════════════════════════════════════════════════════════════════════

async function insertQuestions(supabase: any, questions: any[]) {
  const rows = questions.map((q) => ({
    question_text: q.question,
    option_a: q.options.A,
    option_b: q.options.B,
    option_c: q.options.C,
    option_d: q.options.D,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    category: q.category,
    difficulty: q.difficulty,
    active: true,
  }));

  const { error } = await supabase.from("questions").insert(rows);
  if (error) throw new Error(`INSERT failed: ${error.message}`);

  return rows.length;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 MAIN
// ═══════════════════════════════════════════════════════════════════════════

serve(async () => {
  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!ANTHROPIC_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing ENV");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1️⃣ Job al
    const { data: jobData } = await supabase.rpc("take_ai_question_job");

    if (!jobData || jobData.length === 0) {
      return new Response(JSON.stringify({ ok: false, message: "No job" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const job = jobData[0];
    const jobId = job.id;
    const targetTotal = job.picked_target_total;

    console.log(`Job ${jobId}: Target ${targetTotal}, will process ${CONFIG.MAX_PER_RUN}`);

    // 2️⃣ Bu run'da kaç soru üretelim (max 500)
    const questionsThisRun = Math.min(targetTotal, CONFIG.MAX_PER_RUN);

    // 3️⃣ Kategori dağılımı
    const allocation: Record<string, number> = {};
    let allocated = 0;
    const categories = Object.keys(CATEGORY_DISTRIBUTION);

    categories.forEach((cat, i) => {
      if (i === categories.length - 1) {
        allocation[cat] = questionsThisRun - allocated;
      } else {
        const count = Math.round(questionsThisRun * CATEGORY_DISTRIBUTION[cat]);
        allocation[cat] = count;
        allocated += count;
      }
    });

    // 4️⃣ Soru üret
    let totalInserted = 0;

    for (const [category, categoryCount] of Object.entries(allocation)) {
      if (categoryCount === 0) continue;

      const batches = Math.ceil(categoryCount / CONFIG.BATCH_SIZE);

      for (let i = 0; i < batches; i++) {
        const batchSize = Math.min(
          CONFIG.BATCH_SIZE,
          categoryCount - i * CONFIG.BATCH_SIZE
        );

        const result = await callHaiku(batchSize, category, ANTHROPIC_API_KEY);
        const inserted = await insertQuestions(supabase, result.questions);

        totalInserted += inserted;
        console.log(`${category} batch ${i + 1}/${batches}: ${inserted}`);
      }
    }

    // 5️⃣ Job durumu
    const { data: currentQuestions } = await supabase
      .from("questions")
      .select("id", { count: "exact", head: true });

    const totalQuestions = currentQuestions || 0;

    // Hedef tamamlandıysa job bitir
    if (totalQuestions >= targetTotal) {
      await supabase.rpc("finish_ai_question_job", { p_job_id: jobId });
      console.log(`Job ${jobId} FINISHED: ${totalQuestions}/${targetTotal}`);
    } else {
      console.log(`Job ${jobId} PROGRESS: ${totalQuestions}/${targetTotal}`);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        job_id: jobId,
        inserted_this_run: totalInserted,
        total_questions: totalQuestions,
        target: targetTotal,
        finished: totalQuestions >= targetTotal,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});