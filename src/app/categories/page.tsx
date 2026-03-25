export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Footer from "@/components/Footer";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.vibraxx.com";

function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getCategories() {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name_en, slug, description_en")
    .eq("is_active", true)
    .order("id", { ascending: true });
  if (error) {
    console.error("categories fetch error:", error);
    return [];
  }
  return data ?? [];
}

async function getCategoryQuestionCount(slug: string) {
  const supabase = createSupabaseAdmin();
  const { count } = await supabase
    .from("seo_pages")
    .select("id", { count: "exact", head: true })
    .eq("page_type", "question")
    .eq("category_slug", slug)
    .eq("publish_status", "published")
    .eq("indexable", true);
  return count ?? 0;
}

export const metadata: Metadata = {
  title: "Quiz Categories | VibraXX",
  description:
    "Explore all quiz categories on VibraXX — Science, History, Geography, Technology and more. Compete live every 5 minutes for up to £1,000.",
  alternates: { canonical: `${SITE_URL}/categories` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Quiz Categories | VibraXX",
    description:
      "Explore all quiz categories on VibraXX and compete live every 5 minutes.",
    url: `${SITE_URL}/categories`,
    siteName: "VibraXX",
    type: "website",
  },
};

const CATEGORY_ICONS: Record<string, string> = {
  "psychology-and-human-behavior": "🧠",
  "logic-and-puzzles": "🧩",
  "earth-and-natural-systems": "🌍",
  "engineering-and-technology": "⚙️",
  "life-sciences-and-medicine": "🧬",
  "physical-sciences-and-mathematics": "⚛️",
  "information-and-computation": "💻",
  "sports-and-entertainment": "🏆",
  history: "📜",
  geography: "🗺️",
  science: "🔬",
  technology: "📱",
  "nature-and-animals": "🦁",
  "human-body-and-health": "❤️",
  "language-and-communication": "💬",
};

function getCategoryIcon(slug: string): string {
  return CATEGORY_ICONS[slug] ?? "🎯";
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  // Fetch question counts in parallel
  const counts = await Promise.all(
    categories.map((cat) => getCategoryQuestionCount(cat.slug))
  );

  const categoriesWithCount = categories.map((cat, i) => ({
    ...cat,
    count: counts[i],
  }));

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%);
          background-attachment: fixed;
          min-height: 100vh;
        }
        .cat-card {
          transition: all 0.2s;
          text-decoration: none;
          display: block;
        }
        .cat-card:hover {
          transform: translateY(-4px);
          border-color: rgba(139,92,246,0.6) !important;
          box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 24px rgba(139,92,246,0.2) !important;
        }
      `}</style>

      <main style={{
        minHeight: "100vh",
        color: "#ffffff",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: "clamp(16px,4vw,28px) clamp(16px,4vw,24px)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 12, marginBottom: "clamp(24px,5vw,40px)", flexWrap: "wrap",
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

            <a href="/" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 12, textDecoration: "none",
              background: "linear-gradient(135deg,#7c3aed,#d946ef)",
              color: "white", fontSize: 14, fontWeight: 800,
              boxShadow: "0 0 24px rgba(124,58,237,0.5)",
              letterSpacing: "0.03em",
            }}>
              ⚡ Enter Arena
            </a>
          </div>

          {/* Hero */}
          <div style={{
            padding: "clamp(20px,5vw,36px)",
            borderRadius: "clamp(16px,4vw,24px)",
            background: "linear-gradient(135deg,rgba(30,27,75,0.98),rgba(15,23,42,0.98))",
            border: "2px solid rgba(139,92,246,0.5)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.2)",
            textAlign: "center",
            marginBottom: "clamp(24px,5vw,40px)",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 14px", borderRadius: 999,
              background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
              color: "#c4b5fd", fontSize: 11, fontWeight: 800,
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16,
            }}>
              🧠 All Categories
            </div>

            <h1 style={{
              fontSize: "clamp(26px,6vw,42px)", fontWeight: 900,
              lineHeight: 1.1, marginBottom: 14,
              background: "linear-gradient(90deg,#a78bfa,#f0abfc,#fbbf24)",
              backgroundClip: "text", WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Explore Quiz Categories
            </h1>

            <p style={{
              color: "#cbd5e1", fontSize: "clamp(14px,3vw,16px)",
              lineHeight: 1.7, marginBottom: 8, maxWidth: 560, margin: "0 auto 8px",
            }}>
              {categoriesWithCount.length} categories · {categoriesWithCount.reduce((a, c) => a + c.count, 0).toLocaleString()}+ questions
            </p>
            <p style={{ color: "#fbbf24", fontSize: 13, fontWeight: 700, marginBottom: 0 }}>
              🏆 Up to £1,000 monthly prize pool &nbsp;
              <span style={{ color: "#64748b", fontWeight: 500, fontSize: 11 }}>*Terms apply</span>
            </p>
          </div>

          {/* Category Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(clamp(200px,40vw,260px), 1fr))",
            gap: "clamp(10px,2.5vw,16px)",
            marginBottom: "clamp(24px,5vw,40px)",
          }}>
            {categoriesWithCount.map((cat) => (
              <a
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="cat-card"
                style={{
                  padding: "clamp(16px,3.5vw,22px)",
                  borderRadius: "clamp(12px,3vw,18px)",
                  background: "linear-gradient(135deg,rgba(30,27,75,0.9),rgba(15,23,42,0.9))",
                  border: "1px solid rgba(139,92,246,0.25)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  color: "white",
                }}
              >
                <div style={{ fontSize: "clamp(28px,6vw,36px)", marginBottom: 10, lineHeight: 1 }}>
                  {getCategoryIcon(cat.slug)}
                </div>
                <div style={{
                  fontSize: "clamp(14px,3vw,16px)", fontWeight: 800,
                  marginBottom: 6, color: "#f1f5f9", lineHeight: 1.3,
                }}>
                  {cat.name_en}
                </div>
                {cat.description_en && (
                  <div style={{
                    fontSize: 12, color: "#64748b", lineHeight: 1.5,
                    marginBottom: 10,
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {cat.description_en}
                  </div>
                )}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "4px 10px", borderRadius: 999,
                  background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
                  color: "#a78bfa", fontSize: 11, fontWeight: 600,
                }}>
                  {cat.count.toLocaleString()} questions
                </div>
              </a>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            padding: "clamp(16px,4vw,24px)",
            borderRadius: "clamp(14px,3vw,20px)",
            background: "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(217,70,239,0.08))",
            border: "1px solid rgba(139,92,246,0.3)",
            textAlign: "center",
          }}>
            <p style={{ color: "#fbbf24", fontSize: 15, fontWeight: 800, marginBottom: 6 }}>
              🏆 Up to £1,000 monthly prize pool
            </p>
            <p style={{ color: "#c4b5fd", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              Ready to compete live? Join the next global round now.
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

        </div>
      </main>

      <Footer />
    </>
  );
}
