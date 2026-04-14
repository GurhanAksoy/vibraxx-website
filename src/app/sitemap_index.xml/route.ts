// app/sitemap_index.xml/route.ts

import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const BASE_URL = "https://www.vibraxx.com";
const SHARD_SIZE = 40000;

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables for sitemap index generation.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function getQuestionSitemapShardCount(): Promise<number> {
  const supabase = getSupabaseAdmin();

  const { count, error } = await supabase
    .from("seo_pages")
    .select("id", { count: "exact", head: true })
    .eq("page_type", "question")
    .eq("publish_status", "published")
    .eq("indexable", true)
    .not("slug", "is", null);

  if (error) {
    throw new Error(`Sitemap index count query failed: ${error.message}`);
  }

  const totalRows = count ?? 0;
  return Math.max(1, Math.ceil(totalRows / SHARD_SIZE));
}

export async function GET() {
  const totalShards = await getQuestionSitemapShardCount();
  const now = new Date().toISOString();

  const sitemaps = Array.from({ length: totalShards }, (_, index) => {
    return `
  <sitemap>
    <loc>${BASE_URL}/question-sitemap/sitemap/${index}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemaps}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}