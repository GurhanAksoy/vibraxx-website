import { createClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

type SeoPageRow = {
  id: number;
  slug: string | null;
  updated_at: string | null;
};

const BASE_URL = "https://www.vibraxx.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase environment variables for sitemap generation.");
    return [];
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from("seo_pages")
    .select("id, slug, updated_at")
    .eq("page_type", "question")
    .eq("publish_status", "published")
    .eq("indexable", true)
    .not("slug", "is", null)
    .order("id", { ascending: true })
    .range(0, 49999);

  if (error) {
    console.error("Sitemap query error:", error);
    return [];
  }

  return ((data ?? []) as SeoPageRow[])
    .map((page) => ({
      ...page,
      slug: typeof page.slug === "string" ? page.slug.trim() : null,
    }))
    .filter((page) => page.slug && page.slug.length > 0)
    .map((page) => ({
      url: `${BASE_URL}/questions/${page.slug}`,
      ...(page.updated_at ? { lastModified: page.updated_at } : {}),
    }));
}