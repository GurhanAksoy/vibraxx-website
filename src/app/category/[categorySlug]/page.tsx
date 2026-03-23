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

  return {
    title: `${label} Questions & Answers | VibraXX`,
    description: `Explore ${label} questions with answers and explanations. Challenge yourself on VibraXX.`,
    alternates: {
      canonical: `${SITE_URL}/category/${categorySlug}`,
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
    console.error(error);
    return notFound();
  }

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
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1>{label}</h1>
        <p style={{ opacity: 0.7 }}>
          Explore questions and explanations in {label}
        </p>
      </div>

      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#0f172a",
          borderRadius: "16px",
          padding: "20px",
        }}
      >
        {questions.length === 0 ? (
          <p>No questions found.</p>
        ) : (
          <ul style={{ paddingLeft: "18px" }}>
            {questions.map((q) => (
              <li key={q.slug} style={{ marginBottom: "12px" }}>
                <a
                  href={`/questions/${q.slug}`}
                  style={{
                    color: "#22d3ee",
                    textDecoration: "none",
                  }}
                >
                  {q.title}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}