import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.redirect(
    "https://www.vibraxx.com/sitemap_index.xml",
    301
  );
}