export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

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
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #1e293b, #020617)",
        color: "#ffffff",
        padding: "16px",
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <img
            src="/images/logo.png"
            alt="VibraXX"
            style={{
              height: "72px",
              width: "auto",
              maxWidth: "100%",
              display: "block",
              margin: "0 auto",
            }}
          />

          <p
            style={{
              opacity: 0.82,
              marginTop: "10px",
              marginBottom: 0,
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            🔥 Global Live Quiz Arena — Every 5 minutes
            <br />
            🏆 Compete for up to £1,000 monthly prize
          </p>
        </div>

        <div
          style={{
            margin: "0 auto 14px",
            padding: "16px",
            borderRadius: "16px",
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.35)",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              lineHeight: 1.6,
              opacity: 0.95,
              textAlign: "center",
              marginBottom: "14px",
            }}
          >
            Join the next live round and compete with players worldwide.
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <a
              href="https://www.vibraxx.com/#arena"
              target="_blank"
              rel="noopener noreferrer"
              style={ctaButtonStyle()}
            >
              ENTER ARENA
            </a>
          </div>
        </div>

        <div
          style={{
            margin: "0 auto 12px",
            padding: "0 2px",
            fontSize: "14px",
            opacity: 0.88,
            lineHeight: 1.5,
            wordBreak: "break-word",
          }}
        >
          <a
            href="/"
            style={{
              color: "#93c5fd",
              textDecoration: "none",
            }}
          >
            Home
          </a>

          {categoryHref && categoryLabel ? (
            <>
              <span style={{ margin: "0 8px", opacity: 0.5 }}>›</span>
              <a
                href={categoryHref}
                style={{
                  color: "#93c5fd",
                  textDecoration: "none",
                }}
              >
                {categoryLabel}
              </a>
              <span style={{ margin: "0 8px", opacity: 0.5 }}>›</span>
              <span style={{ color: "#cbd5e1" }}>Question</span>
            </>
          ) : (
            <>
              <span style={{ margin: "0 8px", opacity: 0.5 }}>›</span>
              <span style={{ color: "#cbd5e1" }}>Question</span>
            </>
          )}
        </div>

        <section
          style={{
            margin: "0 auto",
            padding: "20px 18px",
            borderRadius: "18px",
            background: "#0f172a",
            boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                color: "#22d3ee",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.06em",
              }}
            >
              QUESTION
            </div>

            {categoryHref && categoryLabel && (
              <a
                href={categoryHref}
                style={{
                  color: "#93c5fd",
                  textDecoration: "none",
                  fontSize: "14px",
                  lineHeight: 1.4,
                }}
              >
                Explore more in {categoryLabel}
              </a>
            )}
          </div>

          <h1
            style={{
              margin: "0 0 20px",
              fontSize: "clamp(24px, 5vw, 32px)",
              lineHeight: 1.3,
              wordBreak: "break-word",
            }}
          >
            {q.question_text}
          </h1>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "12px",
            }}
          >
            {options.map((opt) => {
              const isCorrect = q.correct_option === opt.key;

              return (
                <div
                  key={opt.key}
                  style={{
                    padding: "14px 14px",
                    borderRadius: "12px",
                    border: isCorrect
                      ? "2px solid #22c55e"
                      : "1px solid #334155",
                    background: isCorrect
                      ? "rgba(34,197,94,0.1)"
                      : "rgba(15,23,42,0.72)",
                    lineHeight: 1.6,
                    fontSize: "15px",
                    wordBreak: "break-word",
                  }}
                >
                  <span style={{ fontWeight: 800 }}>{opt.key})</span> {opt.text}
                </div>
              );
            })}
          </div>
        </section>

        <section
          style={{
            margin: "16px auto",
            padding: "20px 18px",
            borderRadius: "18px",
            background: "#0f172a",
            boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "12px",
              fontSize: "22px",
              lineHeight: 1.3,
            }}
          >
            Explanation
          </h2>
          <p
            style={{
              opacity: 0.92,
              lineHeight: 1.75,
              whiteSpace: "pre-wrap",
              marginBottom: 0,
              fontSize: "15px",
              wordBreak: "break-word",
            }}
          >
            {q.explanation}
          </p>
        </section>

        <div
          style={{
            margin: "16px auto",
            padding: "18px 16px",
            borderRadius: "16px",
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.25)",
          }}
        >
          <div
            style={{
              opacity: 0.95,
              fontSize: "14px",
              lineHeight: 1.6,
              textAlign: "center",
              marginBottom: "14px",
            }}
          >
            Ready for the live challenge? Join the next global round now.
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <a
              href="https://www.vibraxx.com/#arena"
              target="_blank"
              rel="noopener noreferrer"
              style={ctaButtonStyle()}
            >
              ENTER ARENA
            </a>
          </div>
        </div>

        <section
          style={{
            margin: "16px auto",
            padding: "20px 18px",
            borderRadius: "18px",
            background: "#0f172a",
            boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "12px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "22px",
                lineHeight: 1.3,
              }}
            >
              Related Questions
            </h2>

            {categoryHref && categoryLabel && (
              <a
                href={categoryHref}
                style={{
                  color: "#93c5fd",
                  textDecoration: "none",
                  fontSize: "14px",
                  lineHeight: 1.4,
                }}
              >
                Browse {categoryLabel}
              </a>
            )}
          </div>

          {safeRelated.length === 0 ? (
            <div
              style={{
                padding: "14px",
                borderRadius: "12px",
                background: "rgba(148,163,184,0.08)",
                color: "#cbd5e1",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              No related questions found.
            </div>
          ) : (
            <ul
              style={{
                marginTop: "12px",
                paddingLeft: "16px",
                lineHeight: 1.7,
              }}
            >
              {safeRelated.map((item: any) => (
                <li key={item.id} style={{ marginBottom: "12px" }}>
                  <a
                    href={`/questions/${item.slug}`}
                    style={{
                      color: "#22d3ee",
                      textDecoration: "none",
                      lineHeight: 1.6,
                      fontSize: "15px",
                      wordBreak: "break-word",
                    }}
                  >
                    {item.question_text}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}