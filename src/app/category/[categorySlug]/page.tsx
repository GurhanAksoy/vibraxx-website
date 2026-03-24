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

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "psychology-human-behavior":
    "Explore psychology and human behavior questions with answers and clear explanations.",
  "logic-puzzles":
    "Challenge yourself with logic and puzzle questions, detailed answers, and explanations.",
  "earth-natural-systems":
    "Discover Earth and natural systems questions with answers and explanations.",
  "engineering-technology":
    "Browse engineering and technology questions with answers and explanations.",
  "life-sciences-medicine":
    "Explore life sciences and medicine questions with answers and explanations.",
  "physical-sciences-mathematics":
    "Practice physical sciences and mathematics questions with answers and explanations.",
  "information-computation":
    "Explore information and computation questions with answers and explanations.",
  "sports-entertainment":
    "Browse sports and entertainment questions with answers and explanations.",
  history: "Explore history questions with answers and explanations.",
  geography: "Explore geography questions with answers and explanations.",
  science: "Explore science questions with answers and explanations.",
  technology: "Explore technology questions with answers and explanations.",
  "nature-animals":
    "Explore nature and animals questions with answers and explanations.",
  "human-body-health":
    "Explore human body and health questions with answers and explanations.",
  "language-communication":
    "Explore language and communication questions with answers and explanations.",
};

function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const label = CATEGORY_LABELS[categorySlug];

  if (!label) {
    return {
      title: "Category Not Found | VibraXX",
      robots: { index: false, follow: false },
    };
  }

  const description =
    CATEGORY_DESCRIPTIONS[categorySlug] ||
    `Explore ${label} questions with answers and explanations on VibraXX.`;

  return {
    title: `${label} Questions & Answers | VibraXX`,
    description,
    alternates: {
      canonical: `${SITE_URL}/category/${categorySlug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${label} Questions & Answers | VibraXX`,
      description,
      url: `${SITE_URL}/category/${categorySlug}`,
      siteName: "VibraXX",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${label} Questions & Answers | VibraXX`,
      description,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const label = CATEGORY_LABELS[categorySlug];

  if (!label) return notFound();

  const supabase = createSupabaseAdmin();

  const { data: questions, error } = await supabase
    .from("seo_pages")
    .select("slug, title")
    .eq("page_type", "question")
    .eq("category_slug", categorySlug)
    .eq("publish_status", "published")
    .eq("indexable", true)
    .order("id", { ascending: false })
    .limit(50);

  if (error) {
    console.error("category page query error:", error);
    return notFound();
  }

  const safeQuestions = (questions || []).filter((q) => q?.slug && q?.title);

  const description =
    CATEGORY_DESCRIPTIONS[categorySlug] ||
    `Explore ${label} questions with answers and explanations.`;

  return (
    <>
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
            <span style={{ margin: "0 8px", opacity: 0.5 }}>›</span>
            <span style={{ color: "#cbd5e1" }}>{label}</span>
          </div>

          <section
            style={{
              background: "#0f172a",
              borderRadius: "18px",
              padding: "22px 18px",
              marginBottom: "16px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#22d3ee",
                  background: "rgba(34,211,238,0.12)",
                  marginBottom: "12px",
                }}
              >
                Category
              </div>

              <h1
                style={{
                  margin: "0 0 10px",
                  fontSize: "clamp(28px, 5vw, 42px)",
                  lineHeight: 1.15,
                }}
              >
                {label}
              </h1>

              <p
                style={{
                  maxWidth: "640px",
                  margin: "0 auto",
                  opacity: 0.82,
                  fontSize: "15px",
                  lineHeight: 1.7,
                }}
              >
                {description}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "16px",
              }}
            >
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "999px",
                  background: "rgba(148,163,184,0.12)",
                  color: "#cbd5e1",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {safeQuestions.length} live questions shown
              </div>
            </div>
          </section>

          <section
            style={{
              background: "#0f172a",
              borderRadius: "18px",
              padding: "18px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                marginBottom: "14px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 14px",
                  fontSize: "22px",
                  lineHeight: 1.25,
                  textAlign: "center",
                }}
              >
                Latest Questions
              </h2>

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

            {safeQuestions.length === 0 ? (
              <div
                style={{
                  padding: "18px 16px",
                  borderRadius: "14px",
                  background: "rgba(148,163,184,0.08)",
                  color: "#cbd5e1",
                  fontSize: "15px",
                  lineHeight: 1.6,
                  textAlign: "center",
                }}
              >
                No published questions are available in this category yet.
              </div>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "grid",
                  gap: "12px",
                }}
              >
                {safeQuestions.map((q, index) => (
                  <li key={q.slug}>
                    <a
                      href={`/questions/${q.slug}`}
                      style={{
                        display: "block",
                        padding: "14px 14px",
                        borderRadius: "14px",
                        background:
                          index % 2 === 0
                            ? "rgba(15,23,42,0.9)"
                            : "rgba(30,41,59,0.72)",
                        border: "1px solid rgba(148,163,184,0.14)",
                        color: "#e2e8f0",
                        textDecoration: "none",
                        lineHeight: 1.6,
                        fontSize: "15px",
                        wordBreak: "break-word",
                      }}
                    >
                      <span
                        style={{
                          color: "#22d3ee",
                          fontWeight: 700,
                        }}
                      >
                        Q{index + 1}.
                      </span>{" "}
                      {q.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div
            style={{
              margin: "16px auto 0",
              padding: "18px 16px",
              borderRadius: "16px",
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.25)",
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
              Ready to compete live? Join the next global round now.
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
        </div>
      </main>

      <Footer />
    </>
  );
}