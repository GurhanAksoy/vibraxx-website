import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("seo_pages")
    .select("slug, updated_at")
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

  const baseUrl = "https://www.vibraxx.com";

  return (data || [])
    .filter((page) => typeof page.slug === "string" && page.slug.trim().length > 0)
    .map((page) => ({
      url: `${baseUrl}/questions/${page.slug}`,
      lastModified: page.updated_at || new Date().toISOString(),
    }));
}