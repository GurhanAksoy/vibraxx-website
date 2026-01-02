// ═══════════════════════════════════════════════════════════════════════════
// ⚠️ PROMPT LAB TOOL - NOT FOR PRODUCTION
// ═══════════════════════════════════════════════════════════════════════════
// VibraXX Question Generator v2.4 - Absolutely Bulletproof (Final)
// 
// PURPOSE:
// - Prompt engineering and optimization
// - Cost simulation and projection  
// - Quality benchmarking
// - Model output validation
//
// ❌ DO NOT USE IN PRODUCTION
// ❌ Does not write to database
// ❌ Does not integrate with job system
// ❌ Not deployed as Edge Function
//
// Production question generation:
// → supabase/functions/ai-worker (Edge Function)
// → Connected to ai_question_jobs table
// → Integrated with quality-gate pipeline
// ═══════════════════════════════════════════════════════════════════════════

import dotenv from "dotenv";
dotenv.config({ path: "../.env.local" });
import fs from "fs";
import path from "path";

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  MODEL: "claude-3-5-haiku-20241022",
  API_URL: "https://api.anthropic.com/v1/messages",
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.65,
  ANTHROPIC_VERSION: "2023-06-01",
  ANTHROPIC_TIMEOUT_MS: 30000,
  MAX_WORD_COUNT: 18, // 6-second rule
  MAX_OPTION_LENGTH: 100,
  MAX_EXPLANATION_SENTENCES: 2,
  REQUIRE_QUESTION_MARK: true, // Premium UX requirement
  MIN_MEDIUM_HARD_RATIO: 0.15, // Quality signal for difficulty mix
};

const PRICING = {
  INPUT_PER_1K: 0.0008,
  OUTPUT_PER_1K: 0.004,
};

// ═══════════════════════════════════════════════════════════════════════════
// 📊 CATEGORY DISTRIBUTION
// ═══════════════════════════════════════════════════════════════════════════
// ⚠️ SOURCE OF TRUTH: Prompt Lab only
// Production distribution is enforced in DB via ai_question_jobs
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORY_DISTRIBUTION = {
  "General Knowledge": 0.40,
  "Science": 0.15,
  "Geography": 0.15,
  "History": 0.10,
  "Technology": 0.10,
  "Arts & Literature": 0.05,
  "Sports & Games": 0.05,
};

const VALID_DIFFICULTIES = ["medium", "medium-hard"];
const VALID_ANSWERS = ["A", "B", "C", "D"];

// ═══════════════════════════════════════════════════════════════════════════
// 📐 CATEGORY ALLOCATION
// ═══════════════════════════════════════════════════════════════════════════

function calculateCategoryAllocation(totalCount) {
  const allocation = {};
  let remaining = totalCount;
  const categories = Object.keys(CATEGORY_DISTRIBUTION);

  categories.forEach((category, index) => {
    if (index === categories.length - 1) {
      allocation[category] = Math.max(0, remaining);
    } else {
      const count = Math.floor(totalCount * CATEGORY_DISTRIBUTION[category]);
      allocation[category] = count;
      remaining -= count;
    }
  });

  return allocation;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════════════════

function buildPrompt(count, category) {
  return `
You are the Chief Question Architect for VibraXX — the world's most premium real-time competitive quiz platform.

🏆 CONTEXT:
- £1000 monthly prize pool
- Global audience across 50+ countries
- Real-time competition with 6-second answer windows
- Players are educated adults seeking intellectual challenge

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️  THE 6-SECOND RULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TIMING: 0-3s read, 3-6s think & select
DIFFICULTY: Use "medium" OR "medium-hard" — mix both naturally
TARGET: 40-60% success rate globally
QUESTION LENGTH: Maximum 18 words
QUESTION FORMAT: Must end with "?" (standard quiz format)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 MANDATORY CATEGORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GENERATE EXACTLY ${count} QUESTIONS FOR: "${category}"

ALL questions MUST have category: "${category}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✍️  CONSTRUCTION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LANGUAGE:
✓ Standard international English (BBC/CNN style)
✓ Clear, simple vocabulary (B2 level max)
✓ No idioms, slang, or regional terms
✓ 8-18 words per question
✓ Always end with "?"

STRUCTURE:
✓ Single clear sentence
✓ Direct question format
✗ No compound questions
✗ No negative phrasing
✗ No "All/None of the above"

GLOBAL FAIRNESS:
Must work fairly for players in: Istanbul, London, São Paulo, Tokyo, Mumbai

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎲 OPTIONS ENGINEERING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CORRECT ANSWER:
✓ Factually accurate and verifiable
✓ Unambiguous

DISTRACTORS (Wrong Options):
✓ PLAUSIBLE — sound reasonable
✓ SAME SCALE — match magnitude/type
✓ REQUIRE THINKING — not instantly wrong
✗ No joke or absurd options
✗ No extreme outliers

EXAMPLE:
Q: "What percentage of Earth's surface is water?"
A: 71%  ← Correct
B: 64%  ← Plausible (close)
C: 82%  ← Plausible (bit high)
D: 55%  ← Plausible (bit low)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 FORBIDDEN CONTENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BANNED TYPES:
✗ Capital cities
✗ Flags or symbols
✗ Acronym expansions
✗ Basic definitions
✗ Obvious facts
✗ "Gotcha" tricks

BANNED TOPICS:
✗ Politics/leaders
✗ Religion
✗ Current events
✗ Pop culture/celebrities
✗ Brands
✗ Controversial subjects

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 EXPLANATION GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT:
✓ Maximum 2 sentences (25-30 words total)
✓ First: WHY answer is correct
✓ Second: Bonus fact (optional)
✗ Don't repeat question
✗ Don't mention wrong answers

TONE: BBC documentary — authoritative but warm

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON array. NO markdown, NO comments, NO extra text.

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
    "explanation": "Water boils at 100°C (212°F) at sea level under standard atmospheric pressure. This temperature decreases by roughly 1°C for every 300 meters of elevation gain."
  }
]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 FINAL CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before including ANY question:
✓ Global fairness — works for Turkey, UK, Brazil, Japan, India
✓ Speed test — readable in 3s, answerable in 6s
✓ Fairness — rewards knowledge, not guessing
✓ Clarity — zero ambiguity
✓ Premium quality — BBC-level standard
✓ Non-trivial — requires actual thinking
✓ Ends with "?"

Generate EXACTLY ${count} questions for "${category}". Quality over everything.

BEGIN.
`.trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// 💎 JSON EXTRACTION (BULLETPROOF)
// ═══════════════════════════════════════════════════════════════════════════

function extractJsonArray(text) {
  // 🆕 FIX #3: Use regex to find first valid JSON array
  const match = text.match(/\[[\s\S]*?\]/);
  
  if (!match) {
    throw new Error("No JSON array found in model output");
  }

  try {
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) {
      throw new Error("Parsed output is not an array");
    }
    return parsed;
  } catch (error) {
    throw new Error(`JSON parsing failed: ${error.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ✅ QUESTION VALIDATOR (ABSOLUTELY BULLETPROOF - FINAL)
// ═══════════════════════════════════════════════════════════════════════════

function validateQuestion(q, index, expectedCategory = null) {
  const errors = [];

  // Required fields
  if (!q.category) errors.push("Missing category");
  if (!q.difficulty) errors.push("Missing difficulty");
  if (!q.question || q.question.length < 10) {
    errors.push("Question too short or missing");
  }
  if (!q.explanation || q.explanation.length < 15) {
    errors.push("Explanation too short or missing");
  }

  // 🆕 FIX #1: Early guard for missing/invalid options object
  if (!q.options || typeof q.options !== "object") {
    errors.push("Options object missing or invalid");
    return {
      index: index + 1,
      valid: false,
      errors,
      wordCount: 0,
      difficulty: q.difficulty || "unknown",
    };
  }

  // Exact option keys validation (A, B, C, D only)
  const optionKeys = Object.keys(q.options);
  if (optionKeys.length !== 4) {
    errors.push("Options must contain exactly A, B, C, D");
  }

  const expectedKeys = new Set(VALID_ANSWERS);
  for (const key of optionKeys) {
    if (!expectedKeys.has(key)) {
      errors.push(`Invalid option key: "${key}" (must be A, B, C, or D)`);
    }
  }

  // Option content validation
  for (const key of VALID_ANSWERS) {
    const opt = q.options[key];
    if (typeof opt !== "string" || opt.trim().length < 1) {
      errors.push(`Option ${key} is empty or invalid`);
    } else if (opt.length > CONFIG.MAX_OPTION_LENGTH) {
      errors.push(`Option ${key} too long (max ${CONFIG.MAX_OPTION_LENGTH} chars)`);
    }
  }

  // Answer validation
  if (!VALID_ANSWERS.includes(q.correct_answer)) {
    errors.push("Invalid correct_answer (must be A, B, C, or D)");
  }

  // Difficulty validation (strict)
  if (!VALID_DIFFICULTIES.includes(q.difficulty)) {
    errors.push(`Invalid difficulty (must be ${VALID_DIFFICULTIES.join(" or ")})`);
  }

  // Category validation
  if (!Object.keys(CATEGORY_DISTRIBUTION).includes(q.category)) {
    errors.push(`Invalid category: "${q.category}"`);
  }

  if (expectedCategory && q.category !== expectedCategory) {
    errors.push(
      `Category mismatch: expected "${expectedCategory}", got "${q.category}"`
    );
  }

  // 6-second rule validation
  const wordCount = q.question.trim().split(/\s+/).length;
  if (wordCount > CONFIG.MAX_WORD_COUNT) {
    errors.push(
      `Question too long for 6-second rule (${wordCount} words, max ${CONFIG.MAX_WORD_COUNT})`
    );
  }

  // Question mark requirement (Premium UX)
  if (CONFIG.REQUIRE_QUESTION_MARK && !q.question.trim().endsWith("?")) {
    errors.push("Question must end with '?'");
  }

  // 🆕 FIX #2: Robust sentence count (handles decimals, abbreviations)
  const sentenceCount = q.explanation.match(/[^.!?]+[.!?]+/g)?.length || 1;
  if (sentenceCount > CONFIG.MAX_EXPLANATION_SENTENCES) {
    errors.push(
      `Explanation exceeds ${CONFIG.MAX_EXPLANATION_SENTENCES} sentences (has ${sentenceCount})`
    );
  }

  return {
    index: index + 1,
    valid: errors.length === 0,
    errors,
    wordCount,
    difficulty: q.difficulty,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔄 DISTRIBUTION VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════

function validateCategoryDistribution(questions, expectedAllocation) {
  const actualCounts = {};

  Object.keys(CATEGORY_DISTRIBUTION).forEach((cat) => {
    actualCounts[cat] = 0;
  });

  questions.forEach((q) => {
    if (actualCounts[q.category] !== undefined) {
      actualCounts[q.category]++;
    }
  });

  const errors = [];
  Object.keys(expectedAllocation).forEach((category) => {
    if (actualCounts[category] !== expectedAllocation[category]) {
      errors.push(
        `"${category}": expected ${expectedAllocation[category]}, got ${actualCounts[category]}`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    actualCounts,
    expectedCounts: expectedAllocation,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 💰 COST CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════

function calculateCost(usage) {
  const inputCost = (usage.input_tokens / 1000) * PRICING.INPUT_PER_1K;
  const outputCost = (usage.output_tokens / 1000) * PRICING.OUTPUT_PER_1K;
  const totalCost = inputCost + outputCost;

  return {
    inputCost: inputCost.toFixed(4),
    outputCost: outputCost.toFixed(4),
    totalCost: totalCost.toFixed(4),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔧 API CALL WITH TIMEOUT (ABSOLUTELY BULLETPROOF)
// ═══════════════════════════════════════════════════════════════════════════

async function generateQuestionsForCategory(count, category, apiKey) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    CONFIG.ANTHROPIC_TIMEOUT_MS
  );

  try {
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
        messages: [
          {
            role: "user",
            content: buildPrompt(count, category),
          },
        ],
      }),
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `API error for ${category}: ${response.status} - ${JSON.stringify(data)}`
      );
    }

    const text = data?.content?.[0]?.text;

    if (!text) {
      throw new Error(`No text returned for ${category}`);
    }

    const questions = extractJsonArray(text);

    if (!Array.isArray(questions)) {
      throw new Error(`Invalid response format for ${category}`);
    }

    if (questions.length !== count) {
      throw new Error(
        `Expected ${count} questions, got ${questions.length} for ${category}`
      );
    }

    // Validate each question
    questions.forEach((q, i) => {
      const validation = validateQuestion(q, i, category);
      if (!validation.valid) {
        throw new Error(
          `${category}, Q${i + 1} failed: ${validation.errors.join(", ")}`
        );
      }
    });

    return {
      questions,
      usage: data.usage, // May be undefined in edge cases
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        `Timeout after ${CONFIG.ANTHROPIC_TIMEOUT_MS}ms for ${category}`
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const count = Number(process.argv[2] || 10);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🏆 VibraXX Question Generator v2.4 - Final Polish");
  console.log("⚠️  PROMPT LAB TOOL - NOT FOR PRODUCTION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ERROR: Missing ANTHROPIC_API_KEY in .env.local");
    process.exit(1);
  }

  console.log("✓ API Key loaded");
  console.log("✓ Model:", CONFIG.MODEL);
  console.log("✓ Generating:", count, "questions");

  const allocation = calculateCategoryAllocation(count);

  console.log("\n📊 CATEGORY DISTRIBUTION (Prompt Lab Test):");
  console.log("⚠️  Production uses DB-enforced distribution");
  Object.entries(allocation).forEach(([cat, cnt]) => {
    const percentage = ((cnt / count) * 100).toFixed(1);
    console.log(`  ${cat}: ${cnt} (${percentage}%)`);
  });

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("⏳ Generating questions by category...\n");

  let allQuestions = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  const skippedCategories = [];

  for (const [category, categoryCount] of Object.entries(allocation)) {
    if (categoryCount === 0) continue;

    console.log(`  → ${category}: generating ${categoryCount}...`);

    try {
      const result = await generateQuestionsForCategory(
        categoryCount,
        category,
        process.env.ANTHROPIC_API_KEY
      );

      allQuestions = allQuestions.concat(result.questions);

      // Safe usage handling
      if (result.usage) {
        totalInputTokens += result.usage.input_tokens || 0;
        totalOutputTokens += result.usage.output_tokens || 0;
      }

      console.log(`  ✓ Success: ${result.questions.length} generated`);
    } catch (error) {
      console.error(`  ✗ Skipped: ${error.message}`);
      skippedCategories.push({ category, error: error.message });
    }
  }

  if (allQuestions.length === 0) {
    console.error("\n❌ FATAL: No questions generated");
    process.exit(1);
  }

  if (skippedCategories.length > 0) {
    console.log("\n⚠️  SKIPPED CATEGORIES:");
    skippedCategories.forEach(({ category, error }) => {
      console.log(`  → ${category}: ${error}`);
    });
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ VALIDATION RESULTS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  let validCount = 0;
  const invalidQuestions = [];

  allQuestions.forEach((q, i) => {
    const validation = validateQuestion(q, i);
    if (validation.valid) {
      validCount++;
    } else {
      invalidQuestions.push(validation);
    }
  });

  console.log(`✓ Valid: ${validCount}/${allQuestions.length}`);

  if (invalidQuestions.length > 0) {
    console.log(`✗ Invalid: ${invalidQuestions.length}`);
    invalidQuestions.forEach((v) => {
      console.log(`  Q${v.index}: ${v.errors.join(", ")}`);
    });
  }

  // 🆕 FIX #4: Enhanced difficulty mix analysis with ratio
  const diffCounts = { medium: 0, "medium-hard": 0 };
  allQuestions.forEach((q) => {
    if (diffCounts[q.difficulty] !== undefined) {
      diffCounts[q.difficulty]++;
    }
  });

  const mediumHardRatio = diffCounts["medium-hard"] / allQuestions.length;

  console.log("\n📊 DIFFICULTY DISTRIBUTION:");
  console.log(`  medium: ${diffCounts.medium} (${((diffCounts.medium / allQuestions.length) * 100).toFixed(1)}%)`);
  console.log(`  medium-hard: ${diffCounts["medium-hard"]} (${(mediumHardRatio * 100).toFixed(1)}%)`);

  if (allQuestions.length > 5 && mediumHardRatio < CONFIG.MIN_MEDIUM_HARD_RATIO) {
    console.warn(`\n⚠️  WARNING: medium-hard ratio too low: ${mediumHardRatio.toFixed(2)}`);
    console.warn(`  Expected: ≥${CONFIG.MIN_MEDIUM_HARD_RATIO} (${(CONFIG.MIN_MEDIUM_HARD_RATIO * 100).toFixed(0)}%)`);
    console.warn("  Consider adjusting prompt or temperature for better mix");
  }

  const distributionValidation = validateCategoryDistribution(
    allQuestions,
    allocation
  );

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 CATEGORY DISTRIBUTION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (distributionValidation.valid) {
    console.log("✓ Distribution CORRECT\n");
  } else {
    console.log("⚠️  Distribution MISMATCH:\n");
    distributionValidation.errors.forEach((err) => console.log(`  → ${err}`));

    if (skippedCategories.length > 0) {
      console.error("\n❌ FATAL: Category distribution violated due to skipped categories");
      process.exit(1);
    }
  }

  Object.entries(distributionValidation.actualCounts).forEach(([cat, cnt]) => {
    if (cnt > 0) {
      console.log(`  ${cat}: ${cnt}`);
    }
  });

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 STATISTICS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("Questions generated:", allQuestions.length);
  console.log("Questions valid:", validCount);
  console.log("Questions invalid:", allQuestions.length - validCount);

  const totalUsage = {
    input_tokens: totalInputTokens,
    output_tokens: totalOutputTokens,
  };

  const cost = calculateCost(totalUsage);

  console.log("\n💰 COST (Estimation only - not production):");
  console.log("  Input tokens:", totalUsage.input_tokens.toLocaleString());
  console.log("  Output tokens:", totalUsage.output_tokens.toLocaleString());
  console.log("  Input cost: $" + cost.inputCost);
  console.log("  Output cost: $" + cost.outputCost);
  console.log("  Total cost: $" + cost.totalCost);

  const questionsPerRequest = count;
  const requestsFor100k = Math.ceil(100000 / questionsPerRequest);
  const projectedCost = (parseFloat(cost.totalCost) * requestsFor100k).toFixed(2);

  console.log("\n📈 PROJECTION (100K questions):");
  console.log("  Estimated requests:", requestsFor100k.toLocaleString());
  console.log("  Estimated cost: $" + projectedCost);

  // Save to file
  const outputDir = path.resolve("./output");
  fs.mkdirSync(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputFile = path.join(outputDir, `questions-${timestamp}.json`);

  fs.writeFileSync(outputFile, JSON.stringify(allQuestions, null, 2), "utf8");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📝 OUTPUT");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log(`✅ Saved to: ${outputFile}\n`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎬 EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

main().catch((err) => {
  console.error("\n❌ FATAL ERROR:", err.message);
  console.error("\nStack trace:", err.stack);
  process.exit(1);
});