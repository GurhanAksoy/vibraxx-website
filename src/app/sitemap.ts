import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from("seo_pages")
    .select("slug, updated_at")
    .eq("publish_status", "published")
    .eq("indexable", true)
    .limit(50000);

  const baseUrl = "https://www.vibraxx.com";

  return (data || []).map((page) => ({
    url: `${baseUrl}/questions/${page.slug}`,
    lastModified: page.updated_at || new Date().toISOString(),
  }));
}