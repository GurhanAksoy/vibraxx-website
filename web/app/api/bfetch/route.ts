import { NextResponse } from "next/server";

const WL = [
  /^https:\/\/api\.binance\.com\//,
  /^https:\/\/fapi\.binance\.com\//,
  /^https:\/\/dapi\.binance\.com\//
];

function cors(res: NextResponse) {
  res.headers.set("access-control-allow-origin", "*");
  res.headers.set("access-control-allow-methods", "GET,OPTIONS");
  res.headers.set("access-control-allow-headers", "content-type");
  res.headers.set("content-type", "application/json; charset=utf-8");
  res.headers.set("cache-control", "no-store");
  return res;
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const u = searchParams.get("u") || "";
    if (!u) {
      return cors(NextResponse.json({ error: "missing u" }, { status: 400 }));
    }
    if (!WL.some((re) => re.test(u))) {
      return cors(NextResponse.json({ error: "domain not allowed" }, { status: 403 }));
    }

    const upstream = await fetch(u, { headers: { accept: "application/json" } });
    const text = await upstream.text();
    const ct = upstream.headers.get("content-type") || "";

    if (!ct.includes("application/json")) {
      return cors(NextResponse.json({
        error: "upstream non-json",
        status: upstream.status,
        contentType: ct,
        head: text.slice(0, 200)
      }, { status: 502 }));
    }
    return cors(new NextResponse(text, { status: upstream.status }));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return cors(NextResponse.json({ error: msg }, { status: 500 }));
  }
}
