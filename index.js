import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import process from "process";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// --- ENV ---
const ENV = loadEnv();
const COINS = (ENV.COINS||"BTCUSDT,ETHUSDT,SOLUSDT").split(",").map(s=>s.trim().toUpperCase());
const THRESH = Number(ENV.ALERT_SCORE_THRESHOLD || 70);
const INTERVAL = Number(ENV.INTERVAL_SEC || 60);
const PORT = Number(ENV.PORT || 8787);

// --- STATE ---
const state = Object.fromEntries(COINS.map(s => [s, { oiSeries: [], lastAlertAt: 0 }]));
let latest = { updatedAt: 0, items: [] };

// --- HTTP SERVER (/snapshot) ---
const srv = http.createServer((req,res)=>{
  if (req.url === "/snapshot") {
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Content-Type","application/json; charset=utf-8");
    res.end(JSON.stringify(latest));
  } else {
    res.writeHead(200, {"Content-Type":"text/plain; charset=utf-8"});
    res.end("ShortAge/LongAge worker running. Endpoints: /snapshot");
  }
});
srv.listen(PORT, ()=>console.log("HTTP listening on http://localhost:"+PORT+"/snapshot"));

// --- LOOP ---
console.log(`ShortAge/LongAge worker baþladý. Coins: ${COINS.join(", ")} | threshold=${THRESH}`);
tick(); setInterval(tick, INTERVAL*1000);

async function tick(){
  const t0 = Date.now();
  const items = [];
  try {
    for (const sym of COINS){
      const sc = await scoreSymbol(sym);
      if (!sc) continue;
      const dir = sc.longScore >= sc.shortScore ? "LongAge" : "ShortAge";
      const score = Math.max(sc.longScore, sc.shortScore);

      items.push({ symbol: sym, dir, score: Math.round(score), ...sc });

      // eþik ve 5 dk anti-spam
      if (score >= THRESH && Date.now() - state[sym].lastAlertAt > 5*60*1000){
        state[sym].lastAlertAt = Date.now();
        const msg = formatMsg(sym, dir, score, sc);
        if (ENV.TELEGRAM_BOT_TOKEN && ENV.TELEGRAM_CHAT_ID) await sendTelegram(msg);
        console.log(new Date().toISOString(), "ALERT:", msg.replace(/\n/g," | "));
      } else {
        console.log(new Date().toISOString(), sym, "score", score.toFixed(0),
          dir, `| OI z=${sc.oiZ.toFixed(2)} | Taker=${sc.taker.toFixed(2)} | OB=${sc.obImb.toFixed(2)} | Vol×=${sc.volFactor.toFixed(2)} | Fund?=${sc.fundingDelta.toFixed(4)}% | RelBTC=${(sc.relBTC*100).toFixed(2)}%`);
      }
    }
  } catch(e){ console.error("tick error", e?.message||e); }
  finally {
    latest = { updatedAt: Date.now(), items };
    console.log("tick", ((Date.now()-t0)/1000).toFixed(1)+"s");
  }
}

// --- SCORING ---
async function scoreSymbol(symbol){
  const [klines, depth, oiNow, fundArr] = await Promise.all([
    getKlines(symbol, "5m", 50),
    getDepth(symbol, 50),
    getOpenInterest(symbol),
    getFunding(symbol, 2)
  ]);
  if (!klines?.length || !depth?.bids) return null;

  const closes = klines.map(k => Number(k[4]));
  const vols   = klines.map(k => Number(k[5]));
  const takerBuy = Number(klines.at(-1)[9] || 0);
  const volLast  = Number(klines.at(-1)[5] || 0);
  const volMean20 = avg(vols.slice(-21,-1));
  const volFactor = volMean20 > 0 ? (volLast/volMean20) : 1;

  const hi50 = Math.max(...closes.slice(0,-1));
  const lo50 = Math.min(...closes.slice(0,-1));
  const close = closes.at(-1);
  const breakoutUp = close > hi50 && volFactor >= 2;
  const breakoutDn = close < lo50 && volFactor >= 2;

  const takerSell = Math.max(volLast - takerBuy, 0.0000001);
  const taker = takerBuy / takerSell;

  const obImb = sumQty(depth.bids) / Math.max(sumQty(depth.asks), 1e-9);

  let fundingDelta = 0;
  if (fundArr?.length >= 2){
    const sorted = fundArr.sort((a,b)=>a.fundingTime-b.fundingTime);
    fundingDelta = (Number(sorted[1].fundingRate) - Number(sorted[0].fundingRate)) * 100;
  }

  const oi = Number(oiNow.openInterest || oiNow);
  const s = state[symbol];
  if (!Number.isFinite(oi)) return null;
  s.oiSeries.push(oi); if (s.oiSeries.length > 60) s.oiSeries.shift();
  const { z: oiZ } = zScore(s.oiSeries);
  const oiReady = s.oiSeries.length >= 6;

  let relBTC = 0;
  if (symbol !== "BTCUSDT"){
    const btc = await getKlines("BTCUSDT","5m", 7);
    relBTC = retPct(closes,6) - retPct(btc.map(k=>Number(k[4])),6);
  }

  let longScore = 0, shortScore = 0;
  if (oiReady && oiZ >= 2) longScore += 28;
  if (oiReady && oiZ <= -2) shortScore += 28;

  if (fundingDelta >= 0.02) longScore += 18;
  if (fundingDelta <= -0.02) shortScore += 18;

  if (taker >= 1.25) longScore += 18;
  if (taker <= 0.80) shortScore += 18;

  if (obImb >= 1.8) longScore += 12;
  if (obImb <= 0.55) shortScore += 12;

  if (breakoutUp) longScore += 18;
  if (breakoutDn) shortScore += 18;

  if (relBTC > 0.001) longScore += 6;
  if (relBTC < -0.001) shortScore += 6;

  if ((oiZ >= 2 || oiZ <= -2) && volFactor < 1.2){
    longScore = Math.min(longScore, 69);
    shortScore = Math.min(shortScore, 69);
  }
  if ((fundingDelta >= 0.02 && taker <= 0.9) || (fundingDelta <= -0.02 && taker >= 1.1)){
    longScore = Math.max(0, longScore - 10);
    shortScore = Math.max(0, shortScore - 10);
  }

  return { longScore, shortScore, oiZ, taker, obImb, volFactor, fundingDelta, relBTC };
}

// --- HTTP helpers & utils ---
async function fetchJson(url){
  const r = await fetch(url, { headers: { "User-Agent": "shortage-longage/0.2" }});
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} for ${url}`);
  return r.json();
}
async function getKlines(symbol, interval="5m", limit=50){
  return fetchJson(`https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
}
async function getDepth(symbol, limit=50){
  return fetchJson(`https://fapi.binance.com/fapi/v1/depth?symbol=${symbol}&limit=${limit}`);
}
async function getOpenInterest(symbol){
  return fetchJson(`https://fapi.binance.com/fapi/v1/openInterest?symbol=${symbol}`);
}
async function getFunding(symbol, limit=2){
  return fetchJson(`https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=${limit}`);
}
function sumQty(levels){ return levels.slice(0,50).reduce((a,[,q]) => a + Number(q), 0); }
function avg(a){ return a.length? a.reduce((x,y)=>x+y,0)/a.length : 0; }
function zScore(series){
  if (series.length < 6) return { z: 0, mean: 0, sd: 1 };
  const mean = avg(series);
  const sd = Math.sqrt(avg(series.map(x => (x-mean)**2))) || 1;
  const z = (series.at(-1) - mean) / sd;
  return { z, mean, sd };
}
function retPct(arr, n){
  if (arr.length <= n) return 0;
  const a = arr.at(-n-1), b = arr.at(-1);
  return (b-a)/a;
}
function formatMsg(symbol, dir, score, sc){
  return [
    `*${symbol}* › *${dir}*  *${score.toFixed(0)}/100*`,
    `OI z=${sc.oiZ.toFixed(2)} | Taker=${sc.taker.toFixed(2)} | OB=${sc.obImb.toFixed(2)}`,
    `Vol×=${sc.volFactor.toFixed(2)} | Funding?=${sc.fundingDelta.toFixed(4)}% | RelBTC=${(sc.relBTC*100).toFixed(2)}%`,
    `_Yatýrým tavsiyesi deðildir_`
  ].join("\n");
}
async function sendTelegram(text){
  const url = `https://api.telegram.org/bot${ENV.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = { chat_id: ENV.TELEGRAM_CHAT_ID, text, parse_mode: "Markdown" };
  try{
    const r = await fetch(url, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
    if (!r.ok) console.error("telegram error", await r.text());
  }catch(e){ console.error("telegram error", e?.message||e); }
}
function loadEnv(){
  const p = path.join(__dirname, ".env");
  if (fs.existsSync(p)){
    const raw = fs.readFileSync(p,"utf8").split(/\r?\n/).filter(Boolean);
    for (const line of raw){
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
      if (m) process.env[m[1]] = m[2];
    }
  }
  if (!process.env.COINS) console.warn(".env eksik: COINS");
  return process.env;
}
