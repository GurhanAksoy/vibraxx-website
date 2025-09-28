import React from "react";

export const dynamic = "force-dynamic"; // cache yok

// ÜRETİM RAILWAY FALLBACK (garanti adres)
const FALLBACK_BASE = "https://shortage-longage-production-2774.up.railway.app";
// Env varsa onu kullan, yoksa fallback'e düş
const SNAPSHOT_BASE = process.env.NEXT_PUBLIC_WORKER_URL || FALLBACK_BASE;

type Row = {
  symbol: string;
  price: number | null;
  vol24h: number | null;
  chg24h: number | null;
  score: number;
  liquidations: number | null;
};

type Snapshot = {
  schema_ver: string;
  generated_at: string;
  now_ts: number;
  latency_ms: number;
  symbols_count: number;
  snapshot_bytes: number;
  alert_score_threshold: number;
  data: Row[];
};

type FetchDiag = {
  url: string;
  contentType: string;
  ok: boolean;
  status: number;
  head: string;
};

async function fetchSnapshot(): Promise<{ snap: Snapshot; diag: FetchDiag }> {
  const url = `${SNAPSHOT_BASE.replace(/\/+$/, "")}/snapshot`;
  const r = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });

  const ct = r.headers.get("content-type") || "";
  const txt = await r.text();
  const diag: FetchDiag = {
    url,
    contentType: ct,
    ok: r.ok,
    status: r.status,
    head: txt.slice(0, 120)
  };

  if (!ct.includes("application/json")) {
    // Non-JSON geldi: tanı bilgisini geri döndür, UI'da göstereceğiz
    throw new Error(`NON_JSON: ${JSON.stringify(diag)}`);
  }

  let parsed: Snapshot;
  try {
    parsed = JSON.parse(txt) as Snapshot;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`PARSE_FAIL: ${JSON.stringify({ ...diag, parseError: msg })}`);
  }

  return { snap: parsed, diag };
}

export default async function SignalsPage() {
  try {
    const { snap, diag } = await fetchSnapshot();
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold">Signals</h1>
        <div className="mt-2 text-xs opacity-70">
          <div>fetch url: <code>{diag.url}</code></div>
          <div>content-type: <code>{diag.contentType}</code></div>
          <div>status: <code>{diag.status}</code></div>
        </div>

        <p className="mt-2 text-sm opacity-70">
          symbols: {snap.symbols_count} | latency: {snap.latency_ms} ms
        </p>

        <div className="mt-4 grid gap-3">
          {snap.data.map((r: Row) => (
            <div key={r.symbol} className="rounded-xl border p-4">
              <div className="font-medium">{r.symbol}</div>
              <div className="text-sm">price: {r.price ?? "-"}</div>
              <div className="text-sm">chg24h: {r.chg24h ?? "-"}%</div>
              <div className="text-sm">vol24h: {r.vol24h ?? "-"}</div>
              <div className="text-sm">score: {r.score}</div>
            </div>
          ))}
          {snap.data.length === 0 && <div className="opacity-70">No data.</div>}
        </div>
      </main>
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-semibold">Signals</h1>
        <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm">
          <div className="font-medium">FETCH ERROR</div>
          <pre className="mt-2 whitespace-pre-wrap break-all text-xs">{msg}</pre>
          <div className="mt-2 opacity-70">
            Env seen at build: <code>NEXT_PUBLIC_WORKER_URL={(process.env.NEXT_PUBLIC_WORKER_URL || "").toString() || "(unset)"}</code>
            <br/>
            Using base: <code>{SNAPSHOT_BASE}</code>
          </div>
        </div>
      </main>
    );
  }
}
