import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4.1-mini"; // istersen gpt-4.1 veya gpt-4.1-mini yaparsın

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables.");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const {
      category = "General Knowledge",
      difficulty = "medium", // easy | medium | hard
      avoidQuestions = [], // önceki soruların textlerini gönderebilirsin, tekrar etmemesi için
    } = body || {};

    const prompt = `
You are an expert quiz question generator for a real-time, global, English-only quiz platform named "VibraXX".

Requirements:
- Language: STRICTLY ENGLISH ONLY.
- Style: Clear, concise, engaging, no slang, no localization.
- Format: Return ONLY a single JSON object. No markdown, no explanation text outside JSON.
- Question type: Multiple-choice (4 options).
- Difficulty: ${difficulty}.
- Category (guideline, can be interpreted creatively): ${category}.
- Quality: Unique, non-trivial, not directly copy-pasted from famous exam questions or copyrighted databases.
- Avoid repeating or paraphrasing these previous questions (if any): ${avoidQuestions
      .map((q: string) => q)
      .join(" | ")}

JSON schema (strict):
{
  "question": "string",
  "options": ["string", "string", "string", "string"],
  "correctIndex": 0,
  "explanation": "string",
  "category": "string",
  "difficulty": "easy | medium | hard"
}

Rules:
- "correctIndex" must be 0,1,2, or 3 and match the correct option.
- "options" must be 4 distinct, plausible answers.
- "question" must be answerable from given options only.
- No meta commentary. No extra fields.
Return ONLY valid JSON.
`.trim();

    const openaiRes = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You strictly follow instructions and always respond with valid JSON when requested.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.9,
        max_tokens: 400,
      }),
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error("OpenAI API Error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate question." },
        { status: 500 }
      );
    }

    const data = await openaiRes.json();

    const raw =
      data?.choices?.[0]?.message?.content?.trim() || "{}";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("JSON parse error from OpenAI:", raw);
      return NextResponse.json(
        { error: "Invalid JSON from OpenAI." },
        { status: 500 }
      );
    }

    // quick validation
    if (
      !parsed.question ||
      !Array.isArray(parsed.options) ||
      parsed.options.length !== 4 ||
      typeof parsed.correctIndex !== "number"
    ) {
      console.error("Invalid question shape:", parsed);
      return NextResponse.json(
        { error: "Invalid question format from OpenAI." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Server error generating question." },
      { status: 500 }
    );
  }
}
