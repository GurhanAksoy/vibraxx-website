export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // SEO PAGE
  const { data: seoPage } = await supabase
    .from("seo_pages")
    .select("question_id")
    .eq("slug", slug)
    .single();

  if (!seoPage) return notFound();

  // QUESTION
  const { data: q } = await supabase
    .from("questions")
    .select(
      "question_text, explanation, option_a, option_b, option_c, option_d, correct_option"
    )
    .eq("id", seoPage.question_id)
    .single();

  if (!q) return notFound();

  // RELATED (STABLE)
  const { data: related } = await supabase.rpc(
    "get_related_questions",
    { qid: seoPage.question_id }
  );

  const safeRelated = (related || []).filter(
    (item) => item && item.slug
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #1e293b, #020617)",
        color: "white",
        padding: "20px",
        fontFamily: "system-ui",
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <img
          src="/images/logo.png"
          alt="VibraXX"
          style={{
            height: "80px",
            width: "auto",
            display: "block",
            margin: "0 auto",
          }}
        />

        <p style={{ opacity: 0.7, marginTop: "6px" }}>
          🔥 Global Live Quiz Arena — Every 5 minutes  
          🏆 Compete for up to £1,000 monthly prize
        </p>
      </div>

      {/* CTA */}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto 16px",
          padding: "12px 16px",
          borderRadius: "12px",
          background: "rgba(99,102,241,0.15)",
          border: "1px solid rgba(99,102,241,0.4)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "14px", opacity: 0.9 }}>
          Join the next live round now
        </div>

        <a
          href="https://www.vibraxx.com/#arena"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "8px 14px",
            background: "#22c55e",
            color: "#022c22",
            borderRadius: "8px",
            fontWeight: "bold",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          Enter Arena
        </a>
      </div>

      {/* QUESTION */}
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "20px",
          borderRadius: "16px",
          background: "#0f172a",
        }}
      >
        <div style={{ color: "#22d3ee", marginBottom: "10px" }}>
          QUESTION
        </div>

        <h2 style={{ marginBottom: "20px" }}>
          {q.question_text}
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          {[
            { key: "A", text: q.option_a },
            { key: "B", text: q.option_b },
            { key: "C", text: q.option_c },
            { key: "D", text: q.option_d },
          ].map((opt) => {
            const isCorrect = q.correct_option === opt.key;

            return (
              <div
                key={opt.key}
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  border: isCorrect
                    ? "2px solid #22c55e"
                    : "1px solid #334155",
                  background: isCorrect
                    ? "rgba(34,197,94,0.1)"
                    : "transparent",
                }}
              >
                {opt.key}) {opt.text}
              </div>
            );
          })}
        </div>
      </div>

      {/* EXPLANATION */}
      <div
        style={{
          maxWidth: 900,
          margin: "16px auto",
          padding: "20px",
          borderRadius: "16px",
          background: "#0f172a",
        }}
      >
        <h2>Explanation</h2>
        <p style={{ opacity: 0.9 }}>{q.explanation}</p>
      </div>

      {/* RELATED */}
      <div
        style={{
          maxWidth: 900,
          margin: "16px auto",
          padding: "20px",
          borderRadius: "16px",
          background: "#0f172a",
        }}
      >
        <h2>Related Questions</h2>

        {safeRelated.length === 0 ? (
          <p style={{ opacity: 0.6 }}>
            No related questions found.
          </p>
        ) : (
          <ul style={{ marginTop: "12px", paddingLeft: "18px" }}>
            {safeRelated.map((item) => (
              <li key={item.id} style={{ marginBottom: "10px" }}>
                <a
                  href={`/questions/${item.slug}`}
                  style={{
                    color: "#22d3ee",
                    textDecoration: "none",
                  }}
                >
                  {item.question_text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}