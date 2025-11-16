import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next(); // allow all
}

export const config = { matcher: ["/:path*"] };
