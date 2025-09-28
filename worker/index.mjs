import http from "node:http";
import { URL } from "node:url";

const PORT = Number(process.env.PORT || 8787);
const PROXY_BASE = process.env.PROXY_BASE || "";
const INTERVAL_SEC = Number(process.env.INTERVAL_SEC || 5);
const ALERT_SCORE_THRESHOLD = Number(process.env.ALERT_SCORE_THRESHOLD || 70);

const WL = [
  /^https:\/\/api\.binance\.com\//,
  /^https:\/\/fapi\.binance\.com\//,
  /^https:\/\/dapi\.binance\.com\//
];

function corsHeaders(extra = {}) {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,OPTIONS",
    "access-control-allow-headers": "content-type",
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...extra
  };
}

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, corsHeaders());
  res.end(data);
}

function isBinanceUrl(u) {
  return WL.some(re => re.test(u));
}

// --- Core fetch via Vercel proxy
async function viaProxy(binanceUrl) {
  if (!PROXY_BASE) throw new Error("PROXY_BASE missing");
  if (!isBinanceUrl(binanceUrl)) throw new Error("URL not allowed");
  const proxied = PROXY_BASE + encodeURIComponent(binanceUrl);
  const r = await fetch(proxied, { headers: { accept: "application/json" }});
  const txt = await r.text();
  const ct = r.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    throw new Error(`Upstream non-json (${r.status}) ${ct}: ${txt.slice(0,120)}`);
  }
  return JSON.parse(txt);
}

// --- Minimal sampler
const SAMPLE = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];

async function buildSnapshot() {
  const t0 = Date.now();
  let rows = [];
  try {
    for (const sym of SAMPLE) {
      const url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`;
      const j = await viaProxy(url);
      rows.push({
        symbol: j.symbol,
        price: j.lastPrice ? Number(j.lastPrice) : null,
        vol24h: j.volume ? Number(j.volume) : null,
        chg24h: j.priceChangePercent ? Number(j.priceChangePercent) : null,
        score: j.priceChangePercent ? Math.min(100, Math.max(0, Math.abs(Number(j.priceChangePercent)))) : 0,
        liquidations: null
      });
    }
  } catch (e) {
    // snapshot yine de dönecek
  }
  const payload = JSON.stringify(rows);
  const latency = Date.now() - t0;

  return {
    schema_ver: "1",
    generated_at: new Date().toISOString(),
    now_ts: Date.now(),
    latency_ms: latency,
    symbols_count: rows.length,
    snapshot_bytes: Buffer.byteLength(payload, "utf8"),
    alert_score_threshold: ALERT_SCORE_THRESHOLD,
    data: rows
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const { method, url } = req;
    if (method === "OPTIONS") {
      res.writeHead(204, corsHeaders());
      res.end();
      return;
    }

    if (url === "/env") {
      return json(res, 200, {
        ok: true,
        via: "railway-worker",
        PROXY_BASE: !!PROXY_BASE,
        INTERVAL_SEC,
        ALERT_SCORE_THRESHOLD
      });
    }

    if (url === "/snapshot") {
      const snap = await buildSnapshot();
      return json(res, 200, snap);
    }

    if (url === "/") {
      return json(res, 200, { ok: true, name: "vibraxx-worker" });
    }

    return json(res, 404, { error: "not_found", path: url });
  } catch (e) {
    return json(res, 500, { error: String(e?.message || e) });
  }
});

server.listen(PORT, () => {
  console.log(`worker listening on ${PORT}`);
});
