// app/question-sitemap/sitemap.ts

import { createClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const BASE_URL = "https://www.vibraxx.com";
const SHARD_SIZE = 40000;

type SeoPageRow = {
  id: number;
  slug: string | null;
  updated_at: string | null;
};

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables for sitemap generation.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function normalizeSlug(slug: string | null): string | null {
  if (typeof slug !== "string") return null;
  const trimmed = slug.trim();
  return trimmed.length > 0 ? trimmed : null;
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
    throw new Error(`Sitemap count query failed: ${error.message}`);
  }

  const totalRows = count ?? 0;
  return Math.max(1, Math.ceil(totalRows / SHARD_SIZE));
}

export async function generateSitemaps() {
  const totalShards = await getQuestionSitemapShardCount();

  return Array.from({ length: totalShards }, (_, index) => ({
    id: String(index),
  }));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const rawId = await props.id;
  const shardId = Number(rawId);

  if (!Number.isInteger(shardId) || shardId < 0) {
    return [];
  }

  const supabase = getSupabaseAdmin();

  const start = shardId * SHARD_SIZE;
  const end = start + SHARD_SIZE - 1;

  const { data, error } = await supabase
    .from("seo_pages")
    .select("id, slug, updated_at")
    .eq("page_type", "question")
    .eq("publish_status", "published")
    .eq("indexable", true)
    .not("slug", "is", null)
    .order("id", { ascending: true })
    .range(start, end);

  if (error) {
    throw new Error(
      `Sitemap shard query failed for shard ${shardId}: ${error.message}`
    );
  }

  return ((data ?? []) as SeoPageRow[])
    .map((page) => ({
      slug: normalizeSlug(page.slug),
      updated_at: page.updated_at,
    }))
    .filter(
      (page): page is { slug: string; updated_at: string | null } =>
        page.slug !== null
    )
    .map((page) => ({
      url: `${BASE_URL}/questions/${page.slug}`,
      ...(page.updated_at ? { lastModified: page.updated_at } : {}),
    }));
}