export const dynamic = "force-dynamic";

import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.vibraxx.com";

type PageParams = Promise<{ categorySlug: string }>;

type QuestionRow = {
  slug: string | null;
  title: string | null;
};

function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function ctaButtonStyle(): CSSProperties {
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

function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();

      if (lower === "ai") return "AI";
      if (lower === "scr") return "SCR";
      if (lower === "usa") return "USA";
      if (lower === "uk") return "UK";

      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ")
    .replace(/\bAnd\b/g, "&");
}

function buildCategoryDescription(label: string): string {
  return `Explore ${label} questions with answers and explanations on VibraXX.`;
}

async function fetchCategoryQuestions(categorySlug: string, limit = 50) {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("seo_pages")
    .select("slug, title")
    .eq("page_type", "question")
    .eq("category_slug", categorySlug)
    .eq("publish_status", "published")
    .eq("indexable", true)
    .order("id", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("category page query error:", error);
    return [];
  }

  return ((data ?? []) as QuestionRow[]).filter(
    (q): q is { slug: string; title: string } =>
      typeof q?.slug === "string" &&
      q.slug.trim().length > 0 &&
      typeof q?.title === "string" &&
      q.title.trim().length > 0
  );
}

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const safeSlug = categorySlug?.trim().toLowerCase();

  if (!safeSlug) {
    return {
      title: "Category Not Found | VibraXX",
      robots: { index: false, follow: false },
    };
  }

  const questions = await fetchCategoryQuestions(safeSlug, 1);

  if (questions.length === 0) {
    return {
      title: "Category Not Found | VibraXX",
      robots: { index: false, follow: false },
    };
  }

  const label = slugToLabel(safeSlug);
  const description = buildCategoryDescription(label);

  return {
    title: `${label} Questions & Answers | VibraXX`,
    description,
    alternates: {
      canonical: `${SITE_URL}/category/${safeSlug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${label} Questions & Answers | VibraXX`,
      description,
      url: `${SITE_URL}/category/${safeSlug}`,
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
  params: PageParams;
}) {
  const { categorySlug } = await params;
  const safeSlug = categorySlug?.trim().toLowerCase();

  if (!safeSlug) {
    return notFound();
  }

  const safeQuestions = await fetchCategoryQuestions(safeSlug, 50);

  if (safeQuestions.length === 0) {
    return notFound();
  }

  const label = slugToLabel(safeSlug);
  const description = buildCategoryDescription(label);

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
              borderRadius: "18px",
              background: "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(15,23,42,0.88))",
              border: "1px solid rgba(148,163,184,0.12)",
              boxShadow: "0 10px 32px rgba(0,0,0,0.22)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  background: "rgba(34,211,238,0.12)",
                  border: "1px solid rgba(34,211,238,0.24)",
                  color: "#67e8f9",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Category
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(28px, 6vw, 40px)",
                  lineHeight: 1.1,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                }}
              >
                {label}
              </h1>

              <p
                style={{
                  margin: 0,
                  maxWidth: "620px",
                  color: "#cbd5e1",
                  fontSize: "15px",
                  lineHeight: 1.7,
                }}
              >
                {description}
              </p>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
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
          </div>

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
                        transition:
                          "transform 0.18s ease, border-color 0.18s ease, background 0.18s ease",
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