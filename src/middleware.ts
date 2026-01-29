import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Public assets asla auth'a takılmasın
  if (
    pathname.startsWith("/manifest.json") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/sw.js")
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
