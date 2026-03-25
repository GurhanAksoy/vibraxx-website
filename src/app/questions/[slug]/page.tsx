export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.vibraxx.com";

const CATEGORY_LABELS: Record<string, string> = {
  "psychology-human-behavior": "Psychology & Human Behavior",
  "logic-puzzles": "Logic & Puzzles",
  "earth-natural-systems": "Earth & Natural Systems",
  "engineering-technology": "Engineering & Technology",
  "life-sciences-medicine": "Life Sciences & Medicine",
  "physical-sciences-mathematics": "Physical Sciences & Mathematics",
  "information-computation": "Information & Computation",
  "sports-entertainment": "Sports & Entertainment",
  history: "History",
  geography: "Geography",
  science: "Science",
  technology: "Technology",
  "nature-animals": "Nature & Animals",
  "human-body-health": "Human Body & Health",
  "language-communication": "Language & Communication",
};

function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function toAbsoluteUrl(urlOrPath?: string | null) {
  if (!urlOrPath) return null;
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    return urlOrPath;
  }
  return `${SITE_URL}${urlOrPath.startsWith("/") ? "" : "/"}${urlOrPath}`;
}

function ctaButtonStyle(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "46px",
    padding: "12px 22px",
    background: "#22c55e",
    color: "#052e16",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: "14px",
    letterSpacing: "0.03em",
    whiteSpace: "nowrap",
    lineHeight: 1,
    textAlign: "center",
  };
}

async function getSeoQuestionPage(slug: string) {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("seo_pages")
    .select(
      "question_id, category_slug, title, meta_description, canonical_url, publish_status, indexable"
    )
    .eq("slug", slug)
    .eq("page_type", "question")
    .eq("publish_status", "published")
    .eq("indexable", true)
    .maybeSingle();

  if (error) {
    console.error("seo_pages fetch error:", error);
    return null;
  }

  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const seoPage = await getSeoQuestionPage(slug);

  if (!seoPage) {
    return {
      title: "Question Not Found | VibraXX",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonical =
    toAbsoluteUrl(seoPage.canonical_url) || `${SITE_URL}/questions/${slug}`;

  return {
    title: seoPage.title || "Quiz Question | VibraXX",
    description:
      seoPage.meta_description ||
      "Challenge yourself with a quiz question and detailed explanation on VibraXX.",
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: seoPage.title || "Quiz Question | VibraXX",
      description:
        seoPage.meta_description ||
        "Challenge yourself with a quiz question and detailed explanation on VibraXX.",
      url: canonical,
      siteName: "VibraXX",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: seoPage.title || "Quiz Question | VibraXX",
      description:
        seoPage.meta_description ||
        "Challenge yourself with a quiz question and detailed explanation on VibraXX.",
    },
  };
}

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createSupabaseAdmin();

  const seoPage = await getSeoQuestionPage(slug);
  if (!seoPage?.question_id) return notFound();

  const { data: q, error: questionError } = await supabase
    .from("questions")
    .select(
      "question_text, explanation, option_a, option_b, option_c, option_d, correct_option"
    )
    .eq("id", seoPage.question_id)
    .maybeSingle();

  if (questionError) {
    console.error("questions fetch error:", questionError);
    return notFound();
  }

  if (!q) return notFound();

  const { data: relatedRaw, error: relatedError } = await supabase.rpc(
    "get_related_questions",
    { qid: seoPage.question_id }
  );

  if (relatedError) {
    console.error("get_related_questions error:", relatedError);
  }

  const safeRelated = (relatedRaw || []).filter(
    (item: any) => item && item.slug && item.question_text
  );

  const categorySlug = seoPage.category_slug || null;
  const categoryLabel = categorySlug
    ? CATEGORY_LABELS[categorySlug] || categorySlug
    : null;
  const categoryHref = categorySlug ? `/category/${categorySlug}` : null;

  const options = [
    { key: "A", text: q.option_a },
    { key: "B", text: q.option_b },
    { key: "C", text: q.option_c },
    { key: "D", text: q.option_d },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%);
          background-attachment: fixed;
          min-height: 100vh;
        }
        .q-opt { transition: all 0.18s; }
        .q-opt:hover { transform: translateX(3px); }
        .q-related-link { transition: all 0.18s; }
        .q-related-link:hover { color: #a78bfa !important; padding-left: 4px; }
      `}</style>

      <main style={{
        minHeight: "100vh",
        color: "#ffffff",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: "clamp(16px,4vw,28px) clamp(16px,4vw,24px)",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 12, marginBottom: "clamp(20px,4vw,32px)", flexWrap: "wrap",
          }}>
            <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: "clamp(48px,9vw,68px)", height: "clamp(48px,9vw,68px)",
                borderRadius: "50%", padding: 3, flexShrink: 0,
                background: "radial-gradient(circle at 0 0,#7c3aed,#d946ef)",
                boxShadow: "0 0 24px rgba(124,58,237,0.6)",
              }}>
                <div style={{
                  width: "100%", height: "100%", borderRadius: "50%",
                  background: "#020817", overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <img src="/images/logo.png" alt="VibraXX"
                    style={{ width: "80%", height: "80%", objectFit: "contain" }} />
                </div>
              </div>
              <span style={{
                fontSize: "clamp(12px,2.5vw,15px)", fontWeight: 700, color: "#c4b5fd",
                textTransform: "uppercase", letterSpacing: "0.12em",
              }}>Live Quiz Arena</span>
            </a>

            <a href="/"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 12, textDecoration: "none",
                background: "linear-gradient(135deg,#7c3aed,#d946ef)",
                color: "white", fontSize: 14, fontWeight: 800,
                boxShadow: "0 0 24px rgba(124,58,237,0.5)",
                letterSpacing: "0.03em",
              }}
            >
              ⚡ Enter Arena
            </a>
          </div>

          {/* Breadcrumb */}
          <div style={{
            marginBottom: "clamp(12px,3vw,20px)",
            fontSize: 13, lineHeight: 1.5, wordBreak: "break-word",
            display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap",
          }}>
            <a href="/" style={{ color: "#a78bfa", textDecoration: "none" }}>Home</a>
            {categoryHref && categoryLabel ? (
              <>
                <span style={{ margin: "0 8px", color: "#475569" }}>›</span>
                <a href={categoryHref} style={{ color: "#a78bfa", textDecoration: "none" }}>{categoryLabel}</a>
                <span style={{ margin: "0 8px", color: "#475569" }}>›</span>
                <span style={{ color: "#64748b" }}>Question</span>
              </>
            ) : (
              <>
                <span style={{ margin: "0 8px", color: "#475569" }}>›</span>
                <span style={{ color: "#64748b" }}>Question</span>
              </>
            )}
          </div>

          {/* Question Card */}
          <section style={{
            padding: "clamp(18px,4vw,28px)",
            borderRadius: "clamp(16px,4vw,24px)",
            background: "linear-gradient(135deg,rgba(30,27,75,0.98),rgba(15,23,42,0.98))",
            border: "2px solid rgba(139,92,246,0.4)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.15)",
            backdropFilter: "blur(20px)",
            marginBottom: "clamp(12px,3vw,18px)",
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              gap: 12, flexWrap: "wrap", marginBottom: 16,
            }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 999,
                background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.3)",
                color: "#67e8f9", fontSize: 11, fontWeight: 800,
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                Question
              </div>
              {categoryHref && categoryLabel && (
                <a href={categoryHref} style={{
                  color: "#a78bfa", textDecoration: "none",
                  fontSize: 13, fontWeight: 600,
                }}>
                  ← {categoryLabel}
                </a>
              )}
            </div>

            <h1 style={{
              margin: "0 0 clamp(16px,4vw,24px)",
              fontSize: "clamp(18px,4vw,26px)",
              lineHeight: 1.4, wordBreak: "break-word", fontWeight: 800,
              color: "#f1f5f9",
            }}>
              {q.question_text}
            </h1>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              {options.map((opt) => {
                const isCorrect = q.correct_option === opt.key;
                return (
                  <div key={opt.key} className="q-opt" style={{
                    padding: "clamp(12px,3vw,16px) clamp(14px,3.5vw,18px)",
                    borderRadius: 12,
                    border: isCorrect ? "2px solid #22c55e" : "1px solid rgba(139,92,246,0.2)",
                    background: isCorrect
                      ? "linear-gradient(135deg,rgba(34,197,94,0.15),rgba(21,128,61,0.1))"
                      : "rgba(139,92,246,0.04)",
                    fontSize: "clamp(14px,3vw,15px)", lineHeight: 1.6,
                    wordBreak: "break-word",
                    boxShadow: isCorrect ? "0 0 16px rgba(34,197,94,0.2)" : "none",
                  }}>
                    <span style={{
                      fontWeight: 800,
                      color: isCorrect ? "#22c55e" : "#a78bfa",
                      marginRight: 8,
                    }}>{opt.key})</span>
                    {opt.text}
                    {isCorrect && (
                      <span style={{ marginLeft: 8, color: "#22c55e", fontWeight: 700 }}>✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Explanation */}
          <section style={{
            padding: "clamp(18px,4vw,28px)",
            borderRadius: "clamp(14px,3vw,20px)",
            background: "linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,27,75,0.98))",
            border: "1px solid rgba(56,189,248,0.3)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.3), 0 0 20px rgba(56,189,248,0.1)",
            marginBottom: "clamp(12px,3vw,18px)",
          }}>
            <h2 style={{
              marginTop: 0, marginBottom: 14,
              fontSize: "clamp(16px,3.5vw,20px)", fontWeight: 800,
              color: "#38bdf8",
            }}>
              💡 Explanation
            </h2>
            <p style={{
              opacity: 0.92, lineHeight: 1.8,
              whiteSpace: "pre-wrap", marginBottom: 0,
              fontSize: "clamp(14px,2.8vw,15px)", wordBreak: "break-word",
              color: "#cbd5e1",
            }}>
              {q.explanation}
            </p>
          </section>

          {/* CTA */}
          <div style={{
            padding: "clamp(16px,4vw,24px)",
            borderRadius: "clamp(14px,3vw,20px)",
            background: "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(217,70,239,0.08))",
            border: "1px solid rgba(139,92,246,0.3)",
            textAlign: "center",
            marginBottom: "clamp(12px,3vw,18px)",
          }}>
            <p style={{ color: "#fbbf24", fontSize: 15, fontWeight: 800, marginBottom: 6 }}>
              🏆 Up to £1,000 monthly prize pool
            </p>
            <p style={{ color: "#c4b5fd", fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
              Ready for the live challenge? Join the next global round now.
              <br />
              <span style={{ fontSize: 11, color: "#64748b" }}>*Terms apply. Skill-based competition.</span>
            </p>
            <a href="/" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 12, textDecoration: "none",
              background: "linear-gradient(135deg,#7c3aed,#d946ef)",
              color: "white", fontSize: 15, fontWeight: 800,
              boxShadow: "0 0 30px rgba(124,58,237,0.5)",
              letterSpacing: "0.03em",
            }}>
              ⚡ Enter Arena
            </a>
          </div>

          {/* Related Questions */}
          {safeRelated.length > 0 && (
            <section style={{
              padding: "clamp(18px,4vw,28px)",
              borderRadius: "clamp(14px,3vw,20px)",
              background: "linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,27,75,0.98))",
              border: "1px solid rgba(139,92,246,0.25)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                gap: 12, flexWrap: "wrap", marginBottom: 16,
              }}>
                <h2 style={{ margin: 0, fontSize: "clamp(16px,3.5vw,20px)", fontWeight: 800, color: "#e2e8f0" }}>
                  Related Questions
                </h2>
                {categoryHref && categoryLabel && (
                  <a href={categoryHref} style={{ color: "#a78bfa", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                    Browse {categoryLabel} →
                  </a>
                )}
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                {safeRelated.map((item: any) => (
                  <li key={item.id}>
                    <a href={`/questions/${item.slug}`} className="q-related-link" style={{
                      display: "block",
                      padding: "clamp(10px,2.5vw,14px) clamp(12px,3vw,16px)",
                      borderRadius: 10,
                      background: "rgba(139,92,246,0.04)",
                      border: "1px solid rgba(139,92,246,0.15)",
                      color: "#94a3b8", textDecoration: "none",
                      fontSize: "clamp(13px,2.5vw,15px)", lineHeight: 1.6,
                      wordBreak: "break-word",
                    }}>
                      {item.question_text}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
