// ═══════════════════════════════════════════════════════════════════════════
// VibraXX Question Generator v2.0
// ═══════════════════════════════════════════════════════════════════════════
// Premium Global Live Quiz Platform - £1000 Monthly Prize Pool
// Powered by Claude 3.5 Haiku - The Question Architect
// ENFORCED CATEGORY DISTRIBUTION
// ═══════════════════════════════════════════════════════════════════════════

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  MODEL: "claude-3-5-haiku-20241022",
  API_URL: "https://api.anthropic.com/v1/messages",
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.65,
  ANTHROPIC_VERSION: "2023-06-01",
};

const PRICING = {
  INPUT_PER_1K: 0.0008,
  OUTPUT_PER_1K: 0.004,
};

// ═══════════════════════════════════════════════════════════════════════════
// 📊 CATEGORY DISTRIBUTION (MANDATORY)
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

function calculateCategoryAllocation(totalCount) {
  const allocation = {};
  let allocated = 0;

  const categories = Object.keys(CATEGORY_DISTRIBUTION);
  
  categories.forEach((category, index) => {
    if (index === categories.length - 1) {
      allocation[category] = totalCount - allocated;
    } else {
      const count = Math.round(totalCount * CATEGORY_DISTRIBUTION[category]);
      allocation[category] = count;
      allocated += count;
    }
  });

  return allocation;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 THE ULTIMATE PROMPT - VibraXX Question Architecture
// ═══════════════════════════════════════════════════════════════════════════

function buildPrompt(count, category) {
  return `
You are the Chief Question Architect for VibraXX — the world's most premium real-time competitive quiz platform.

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
├─ NOT trivial (obvious answers)
├─ NOT academic (specialist knowledge)
└─ Educated adult with general knowledge should have fair chance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 MANDATORY CATEGORY FOR THIS REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOU MUST GENERATE QUESTIONS ONLY FOR THIS CATEGORY:
"${category}"

ALL ${count} questions MUST use category: "${category}"

DO NOT generate questions for any other category.

CATEGORY DEFINITIONS:
1. General Knowledge — Diverse facts across multiple domains
2. Science — Physics, Chemistry, Biology, Astronomy (no advanced math)
3. Geography — Physical features, natural phenomena (NOT capitals/flags)
4. History — Major events, figures, timelines (global perspective)
5. Technology — Computing, engineering, innovation
6. Arts & Literature — Famous works, movements, techniques
7. Sports & Games — Rules, records, legendary moments (global sports)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✍️  QUESTION CONSTRUCTION MASTERCLASS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LANGUAGE STANDARDS:
✓ Standard international English (BBC/CNN style)
✓ Clear, simple vocabulary (B2 level maximum)
✓ No idioms, slang, or colloquialisms
✓ No region-specific terms (lorry vs truck, flat vs apartment)
✗ British-only or American-only expressions

STRUCTURAL RULES:
✓ Single, clear sentence
✓ 8-15 words optimal length
✓ Direct question format
✓ Subject-verb-object clarity
✗ No compound questions ("Which X and when did Y?")
✗ No negative phrasing ("Which is NOT...")
✗ No double negatives
✗ No "All/None of the above" options

THE GLOBAL FAIRNESS TEST:
Ask yourself: Can players in these locations answer fairly?
├─ Istanbul, Turkey
├─ London, UK
├─ São Paulo, Brazil
├─ Tokyo, Japan
└─ Mumbai, India

If cultural knowledge gives unfair advantage → REJECT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎲 OPTIONS ENGINEERING (A, B, C, D)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THE CORRECT ANSWER:
✓ Factually accurate and verifiable
✓ Unambiguous and universally accepted
✓ No room for debate or interpretation

THE DISTRACTORS (Wrong Options):
✓ PLAUSIBLE — Must sound reasonable to someone unsure
✓ SAME SCALE — Match the magnitude/type of correct answer
✓ REQUIRES THINKING — Can't be eliminated instantly
✗ No joke or absurd options
✗ No extreme outliers
✗ No obviously wrong answers

DISTRACTOR MASTERCLASS:

❌ BAD EXAMPLE:
Q: "What percentage of Earth's surface is covered by water?"
A: 71%  ← Correct
B: 5%   ← Obviously wrong (too low)
C: 150% ← Impossible
D: "Water is wet" ← Joke answer

✅ GOOD EXAMPLE:
Q: "What percentage of Earth's surface is covered by water?"
A: 71%  ← Correct
B: 64%  ← Plausible (close, requires knowledge)
C: 82%  ← Plausible (bit high, sounds reasonable)
D: 55%  ← Plausible (bit low, could confuse)

All options are numbers in reasonable range. Player must KNOW the answer.

MORE EXAMPLES:

✅ TEMPERATURE QUESTION:
A: 100°C  ← Correct (water boiling point)
B: 90°C   ← Plausible distractor
C: 110°C  ← Plausible distractor
D: 95°C   ← Plausible distractor

✅ YEAR QUESTION:
A: 1969  ← Correct (moon landing)
B: 1967  ← Plausible (close year)
C: 1971  ← Plausible (close year)
D: 1965  ← Plausible (close year)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 FORBIDDEN CONTENT (Zero Tolerance)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BANNED QUESTION TYPES:
✗ Capital cities ("What is the capital of X?")
✗ Flags or national symbols
✗ Acronym expansions ("What does NASA stand for?")
✗ Basic definitions ("What is photosynthesis?")
✗ Obvious facts ("What color is the sky?")
✗ "Gotcha" trick questions
✗ Deliberately misleading wording
✗ Common school facts that can be answered in <2 seconds
✗ Simple number recall questions (unless contextual)

BANNED TOPICS:
✗ Politics or government leaders
✗ Religion or philosophy
✗ Current events or breaking news
✗ Pop culture, celebrities, influencers
✗ Brand names or products
✗ Controversial or sensitive subjects
✗ Regional traditions or customs
✗ Memes or internet culture

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 EXPLANATION GUIDELINES (Educational Excellence)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PURPOSE:
├─ Educate the player
├─ Make them feel smarter
├─ Provide interesting context
└─ No condescension or judgment

FORMAT:
✓ Maximum 2 short sentences (25-30 words total)
✓ First sentence: WHY the answer is correct
✓ Second sentence: Bonus interesting fact (optional)
✗ Don't repeat the question
✗ Don't mention wrong answers
✗ Don't use phrases like "The answer is X because..."
✗ No filler words or obvious statements

TONE: BBC documentary narrator — authoritative but warm

EXAMPLES:

✅ EXCELLENT:
"The Pacific Ocean covers approximately 63 million square miles, making it larger than all of Earth's land area combined. It contains more than half of the world's free water."

✅ EXCELLENT:
"Water boils at 100°C (212°F) at sea level under standard atmospheric pressure. This temperature decreases by roughly 1°C for every 300 meters of elevation gain."

❌ BAD:
"The answer is Pacific Ocean because it's the biggest ocean in the world. The other options were smaller oceans."

❌ BAD:
"100°C is correct. Options A, C, and D were wrong."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ THE VIBRAXX PREMIUM QUALITY CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before including ANY question, verify it passes ALL these tests:

✓ GLOBAL TEST
  → Works fairly for players in Turkey, UK, Brazil, Japan, India
  → No cultural bias or regional knowledge required

✓ SPEED TEST
  → Readable in 3 seconds
  → Decision makeable in 3 seconds

✓ FAIRNESS TEST
  → Rewards knowledge + reasoning, NOT guessing
  → Distractors are plausible, require elimination

✓ CLARITY TEST
  → Zero ambiguity in wording
  → One clear correct answer
  → No room for debate

✓ ENGAGEMENT TEST
  → Satisfying when answered correctly
  → Educational when answered incorrectly
  → Makes player feel intelligent

✓ PREMIUM TEST
  → Would I bet £1000 on this being fair?
  → Does this make VibraXX feel world-class?
  → Would BBC use this in a global quiz show?

✓ ORIGINALITY TEST
  → Not recycled from pub quizzes
  → Not copied from trivia websites
  → Fresh and well-crafted

✓ NON-TRIVIAL TEST
  → Requires actual thinking, not instant recall
  → Not answerable in under 2 seconds
  → Demands reasoning or comparison

IF ANY TEST FAILS → DO NOT INCLUDE THE QUESTION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 OUTPUT FORMAT (STRICT JSON - No Exceptions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY a valid JSON array.
NO markdown code blocks.
NO explanatory text before or after.
NO comments.
NO extra formatting.

EXACT FORMAT:

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
🎯 FINAL MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate EXACTLY ${count} questions for category "${category}".

For each question, ask yourself:
├─ Is this globally fair?
├─ Is this intellectually satisfying?
├─ Would this make VibraXX feel premium?
├─ Would I stake £1000 on this being perfect?
└─ Does this require real thinking, not just recall?

If unsure → Skip it and generate a better one.

Quality over everything. VibraXX is PREMIUM.

BEGIN GENERATION NOW.
`.trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// 💎 SAFE JSON EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractJsonArray(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("⚠️  Model output does not contain a valid JSON array");
  }

  const jsonText = text.slice(start, end + 1);

  try {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) {
      throw new Error("⚠️  Parsed output is not an array");
    }
    return parsed;
  } catch (error) {
    throw new Error(`⚠️  JSON parsing failed: ${error.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📊 COST CALCULATOR
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
// ✅ QUESTION VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════

function validateQuestion(q, index, expectedCategory = null) {
  const errors = [];

  if (!q.category) errors.push("Missing category");
  if (!q.difficulty) errors.push("Missing difficulty");
  if (!q.question || q.question.length < 10)
    errors.push("Question too short or missing");
  if (!q.explanation || q.explanation.length < 15)
    errors.push("Explanation too short or missing");

  if (!q.options?.A || !q.options?.B || !q.options?.C || !q.options?.D) {
    errors.push("Missing one or more options (A, B, C, D)");
  }

  if (!["A", "B", "C", "D"].includes(q.correct_answer)) {
    errors.push("Invalid correct_answer (must be A, B, C, or D)");
  }

  if (!["easy", "medium", "medium-hard", "hard"].includes(q.difficulty)) {
    errors.push("Invalid difficulty level");
  }

  if (!Object.keys(CATEGORY_DISTRIBUTION).includes(q.category)) {
    errors.push(`Invalid category: "${q.category}"`);
  }

  if (expectedCategory && q.category !== expectedCategory) {
    errors.push(`Category mismatch: expected "${expectedCategory}", got "${q.category}"`);
  }

  return {
    index: index + 1,
    valid: errors.length === 0,
    errors,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔄 CATEGORY DISTRIBUTION VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════

function validateCategoryDistribution(questions, expectedAllocation) {
  const actualCounts = {};
  
  Object.keys(CATEGORY_DISTRIBUTION).forEach(cat => {
    actualCounts[cat] = 0;
  });

  questions.forEach(q => {
    if (actualCounts[q.category] !== undefined) {
      actualCounts[q.category]++;
    }
  });

  const errors = [];
  Object.keys(expectedAllocation).forEach(category => {
    if (actualCounts[category] !== expectedAllocation[category]) {
      errors.push(
        `Category "${category}": expected ${expectedAllocation[category]}, got ${actualCounts[category]}`
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
// 🔧 API CALL FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function generateQuestionsForCategory(count, category, apiKey) {
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
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`API error for category ${category}: ${response.status} - ${JSON.stringify(data)}`);
  }

  const text = data?.content?.[0]?.text;
  if (!text) {
    throw new Error(`No text returned for category ${category}`);
  }

  const questions = extractJsonArray(text);

  if (!Array.isArray(questions) || questions.length !== count) {
    throw new Error(
      `Category ${category}: Expected ${count} questions, got ${questions.length}`
    );
  }

  questions.forEach((q, i) => {
    const validation = validateQuestion(q, i, category);
    if (!validation.valid) {
      throw new Error(
        `Category ${category}, Question ${i + 1} validation failed: ${validation.errors.join(", ")}`
      );
    }
  });

  return {
    questions,
    usage: data.usage,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const count = Number(process.argv[2] || 10);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🏆 VibraXX Question Generator v2.0");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ERROR: Missing ANTHROPIC_API_KEY in .env.local");
    process.exit(1);
  }

  console.log("✓ API Key loaded:", process.env.ANTHROPIC_API_KEY.slice(0, 20) + "...");
  console.log("✓ Model:", CONFIG.MODEL);
  console.log("✓ Generating:", count, "questions");
  
  const allocation = calculateCategoryAllocation(count);
  
  console.log("\n📊 ENFORCED CATEGORY DISTRIBUTION:");
  Object.entries(allocation).forEach(([cat, cnt]) => {
    const percentage = ((cnt / count) * 100).toFixed(1);
    console.log(`  ${cat}: ${cnt} questions (${percentage}%)`);
  });
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("⏳ Generating questions by category...\n");

  let allQuestions = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  for (const [category, categoryCount] of Object.entries(allocation)) {
    if (categoryCount === 0) continue;
    
    console.log(`  → Generating ${categoryCount} questions for "${category}"...`);
    
    try {
      const result = await generateQuestionsForCategory(
        categoryCount,
        category,
        process.env.ANTHROPIC_API_KEY
      );
      
      allQuestions = allQuestions.concat(result.questions);
      totalInputTokens += result.usage.input_tokens;
      totalOutputTokens += result.usage.output_tokens;
      
      console.log(`  ✓ Success: ${result.questions.length} questions generated`);
    } catch (error) {
      console.error(`  ✗ Failed for category "${category}": ${error.message}`);
      throw error;
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ VALIDATION RESULTS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  let validCount = 0;
  allQuestions.forEach((q, i) => {
    const validation = validateQuestion(q, i);
    if (validation.valid) {
      validCount++;
      console.log(`✓ Question ${validation.index}: VALID`);
    } else {
      console.log(`✗ Question ${validation.index}: INVALID`);
      validation.errors.forEach((err) => console.log(`  → ${err}`));
    }
  });

  const distributionValidation = validateCategoryDistribution(allQuestions, allocation);
  
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 CATEGORY DISTRIBUTION VALIDATION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (distributionValidation.valid) {
    console.log("✓ Category distribution is CORRECT\n");
    Object.entries(distributionValidation.actualCounts).forEach(([cat, cnt]) => {
      if (cnt > 0) {
        console.log(`  ${cat}: ${cnt} questions`);
      }
    });
  } else {
    console.log("✗ Category distribution MISMATCH:\n");
    distributionValidation.errors.forEach(err => console.log(`  → ${err}`));
    console.error("\n❌ FATAL: Category distribution does not match requirements");
    process.exit(1);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 GENERATION STATISTICS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("Questions generated:", allQuestions.length);
  console.log("Questions valid:", validCount);
  console.log("Questions invalid:", allQuestions.length - validCount);

  const totalUsage = {
    input_tokens: totalInputTokens,
    output_tokens: totalOutputTokens,
  };

  const cost = calculateCost(totalUsage);
  console.log("\n💰 TOKEN USAGE & COST:");
  console.log("  Input tokens:", totalUsage.input_tokens.toLocaleString());
  console.log("  Output tokens:", totalUsage.output_tokens.toLocaleString());
  console.log("  Input cost: $" + cost.inputCost);
  console.log("  Output cost: $" + cost.outputCost);
  console.log("  Total cost: $" + cost.totalCost);

  const questionsPerRequest = count;
  const requestsFor100k = Math.ceil(100000 / questionsPerRequest);
  const projectedCost = (parseFloat(cost.totalCost) * requestsFor100k).toFixed(2);

  console.log("\n📈 PROJECTION FOR 100,000 QUESTIONS:");
  console.log("  Estimated requests:", requestsFor100k.toLocaleString());
  console.log("  Estimated cost: $" + projectedCost);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📝 GENERATED QUESTIONS (JSON)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log(JSON.stringify(allQuestions, null, 2));

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ GENERATION COMPLETE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎬 EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

main().catch((err) => {
  console.error("\n❌ FATAL ERROR:", err.message);
  console.error("\nStack trace:", err.stack);
  process.exit(1);
});