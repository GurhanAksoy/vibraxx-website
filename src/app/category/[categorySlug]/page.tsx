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

async function getCategoryBySlug(slug: string) {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name_en, slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) {
    console.error("category lookup error:", error);
    return null;
  }
  return data;
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

function buildCategoryDescription(label: string): string {
  return `Explore ${label} questions with answers and explanations on VibraXX.`;
}

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const safeSlug = categorySlug?.trim().toLowerCase();

  if (!safeSlug) {
    return { title: "Category Not Found | VibraXX", robots: { index: false, follow: false } };
  }

  const category = await getCategoryBySlug(safeSlug);
  if (!category) {
    return { title: "Category Not Found | VibraXX", robots: { index: false, follow: false } };
  }

  const questions = await fetchCategoryQuestions(safeSlug, 1);
  if (questions.length === 0) {
    return { title: "Category Not Found | VibraXX", robots: { index: false, follow: false } };
  }

  const label = category.name_en;
  const description = buildCategoryDescription(label);

  return {
    title: `${label} Questions & Answers | VibraXX`,
    description,
    alternates: { canonical: `${SITE_URL}/category/${safeSlug}` },
    robots: { index: true, follow: true },
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

  if (!safeSlug) return notFound();

  const category = await getCategoryBySlug(safeSlug);
  if (!category) return notFound();

  const safeQuestions = await fetchCategoryQuestions(safeSlug, 50);
  if (safeQuestions.length === 0) return notFound();

  const label = category.name_en;
  const description = buildCategoryDescription(label);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%);
          background-attachment: fixed;
          min-height: 100vh;
        }
        .cat-question-link:hover {
          border-color: rgba(139,92,246,0.5) !important;
          background: rgba(139,92,246,0.08) !important;
          transform: translateX(4px);
        }
        @media (max-width: 600px) {
          .cat-header-btns { flex-direction: column !important; }
        }
      `}</style>

      <main style={{
        minHeight: "100vh",
        color: "#ffffff",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: "clamp(16px,4vw,32px) clamp(16px,4vw,24px)",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>

          {/* Header — profile/lobby ile aynı stil */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 12, marginBottom: "clamp(24px,5vw,36px)", flexWrap: "wrap",
          }}>
            <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: "clamp(52px,10vw,72px)", height: "clamp(52px,10vw,72px)",
                borderRadius: "50%", padding: 3, flexShrink: 0,
                background: "radial-gradient(circle at 0 0,#7c3aed,#d946ef)",
                boxShadow: "0 0 24px rgba(124,58,237,0.6)",
              }}>
                <div style={{
                  width: "100%", height: "100%", borderRadius: "50%",
                  background: "#020817", overflow: "hidden", position: "relative",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <img src="/images/logo.png" alt="VibraXX"
                    style={{ width: "80%", height: "80%", objectFit: "contain" }} />
                </div>
              </div>
              <span style={{
                fontSize: "clamp(13px,2.5vw,16px)", fontWeight: 700, color: "#c4b5fd",
                textTransform: "uppercase", letterSpacing: "0.12em",
              }}>Live Quiz Arena</span>
            </a>

            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 10,
              background: "linear-gradient(135deg,rgba(251,191,36,0.1),rgba(245,158,11,0.08))",
              border: "1px solid rgba(251,191,36,0.3)",
              color: "#fbbf24", fontSize: 12, fontWeight: 700,
            }}>
              🔥 Rounds every 5 min
            </div>
          </div>

          {/* Category Hero */}
          <div style={{
            padding: "clamp(20px,5vw,32px)",
            borderRadius: "clamp(16px,4vw,24px)",
            background: "linear-gradient(135deg,rgba(30,27,75,0.98),rgba(15,23,42,0.98))",
            border: "2px solid rgba(139,92,246,0.5)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.2)",
            backdropFilter: "blur(20px)",
            textAlign: "center",
            marginBottom: "clamp(16px,4vw,24px)",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 999,
              background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.3)",
              color: "#67e8f9", fontSize: 11, fontWeight: 800,
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16,
            }}>
              Quiz Category
            </div>

            <h1 style={{
              fontSize: "clamp(28px,6vw,44px)", fontWeight: 900,
              lineHeight: 1.1, marginBottom: 14,
              background: "linear-gradient(90deg,#a78bfa,#f0abfc,#fbbf24)",
              backgroundClip: "text", WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {label}
            </h1>

            <p style={{ color: "#cbd5e1", fontSize: "clamp(14px,3vw,16px)", lineHeight: 1.7, marginBottom: 20, maxWidth: 560, margin: "0 auto 20px" }}>
              {description}
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }} className="cat-header-btns">
              <div style={{
                padding: "8px 16px", borderRadius: 10,
                background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
                color: "#c4b5fd", fontSize: 13, fontWeight: 600,
              }}>
                {safeQuestions.length} questions
              </div>
              <a
                href="/"
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
          </div>

          {/* Questions */}
          <div style={{
            padding: "clamp(16px,4vw,24px)",
            borderRadius: "clamp(14px,3vw,20px)",
            background: "linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,27,75,0.98))",
            border: "1px solid rgba(139,92,246,0.3)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            marginBottom: "clamp(16px,4vw,24px)",
          }}>
            <h2 style={{
              fontSize: "clamp(16px,3.5vw,20px)", fontWeight: 800,
              marginBottom: 16, color: "#e2e8f0", textAlign: "center",
            }}>
              Latest Questions
            </h2>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
              {safeQuestions.map((q, index) => (
                <li key={q.slug}>
                  <a
                    href={`/questions/${q.slug}`}
                    className="cat-question-link"
                    style={{
                      display: "block",
                      padding: "clamp(10px,2.5vw,14px) clamp(12px,3vw,16px)",
                      borderRadius: 12,
                      background: "rgba(139,92,246,0.04)",
                      border: "1px solid rgba(139,92,246,0.15)",
                      color: "#e2e8f0",
                      textDecoration: "none",
                      fontSize: "clamp(13px,2.5vw,15px)",
                      lineHeight: 1.6,
                      wordBreak: "break-word",
                      transition: "all 0.2s",
                    }}
                  >
                    <span style={{ color: "#a78bfa", fontWeight: 700, marginRight: 6 }}>
                      Q{index + 1}.
                    </span>
                    {q.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Bottom */}
          <div style={{
            padding: "clamp(16px,4vw,24px)",
            borderRadius: "clamp(14px,3vw,20px)",
            background: "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(217,70,239,0.08))",
            border: "1px solid rgba(139,92,246,0.3)",
            textAlign: "center",
          }}>
            <p style={{ color: "#c4b5fd", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              Ready to compete live? Join the next global round now.
            </p>
            <a
              href="/"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: 12, textDecoration: "none",
                background: "linear-gradient(135deg,#7c3aed,#d946ef)",
                color: "white", fontSize: 15, fontWeight: 800,
                boxShadow: "0 0 30px rgba(124,58,237,0.5)",
                letterSpacing: "0.03em",
              }}
            >
              ⚡ Enter Arena
            </a>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
