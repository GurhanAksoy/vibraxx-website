"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { PositionSizer, TradeChecklist } from "./RiskWidgets";

const SNAPSHOT_URL = process.env.NEXT_PUBLIC_SNAPSHOT_URL || "http://127.0.0.1:8787/snapshot";
const c={green:"#16a34a",red:"#dc2626",gray:"#6b7280",border:"#e5e7eb",sub:"#9ca3af",text:"#111827",bg:"#fafafa"};

const safeGet = (k, fallback) => (typeof window!=="undefined" ? window.localStorage.getItem(k) ?? fallback : fallback);
const safeSet = (k, v) => { if (typeof window!=="undefined") window.localStorage.setItem(k, v); };

function Badge({dir,score,th}) {
  const on = score>=th;
  const bg = on ? (dir==="LongAge" ? c.green : c.red) : c.gray;
  return <span style={{background:bg,color:"#fff",padding:"4px 10px",borderRadius:999,fontWeight:700}}>
    {dir} {score}/100
  </span>;
}

function useBeep(){
  const ctxRef=useRef(null);
  return ()=>{try{
    if(!ctxRef.current) ctxRef.current = new (window.AudioContext||window.webkitAudioContext)();
    const ctx=ctxRef.current; const o=ctx.createOscillator(); const g=ctx.createGain();
    o.type="square"; o.frequency.value=880; g.gain.value=0.04; o.connect(g); g.connect(ctx.destination); o.start();
    setTimeout(()=>{o.stop(); o.disconnect(); g.disconnect();},150);
  }catch(e){}};
}

export default function Page(){
  const [data,setData]=useState({updatedAt:0,items:[]});
  const [loading,setLoading]=useState(false);

  // SSR güvenli başlangıç
  const [threshold,setThreshold]=useState(70);
  const [dir,setDir]=useState("all");
  const [q,setQ]=useState("");
  const [sortBy,setSortBy]=useState("score");
  const [intervalMs,setIntervalMs]=useState(5000);
  const [sound,setSound]=useState(false);

  // client'ta localStorage'dan yükle
  useEffect(()=>{
    setThreshold(Number(safeGet("th","70"))||70);
    setDir(safeGet("dir","all"));
    setSortBy(safeGet("sortBy","score"));
    setIntervalMs(Number(safeGet("intv","5000"))||5000);
    setSound(safeGet("sound","0")==="1");
  },[]);

  async function load(){
    try{ setLoading(true); const r=await fetch(SNAPSHOT_URL,{cache:"no-store"}); const j=await r.json(); setData(j); }
    catch{} finally{ setLoading(false); }
  }
  useEffect(()=>{ load(); const id=setInterval(load,intervalMs); return ()=>clearInterval(id); },[intervalMs]);

  useEffect(()=>{ safeSet("th", String(threshold)); },[threshold]);
  useEffect(()=>{ safeSet("dir", dir); },[dir]);
  useEffect(()=>{ safeSet("sortBy", sortBy); },[sortBy]);
  useEffect(()=>{ safeSet("intv", String(intervalMs)); },[intervalMs]);
  useEffect(()=>{ safeSet("sound", sound?"1":"0"); },[sound]);

  const items=useMemo(()=>{
    let arr=(data.items||[]);
    if(dir!=="all") arr=arr.filter(x=>x.dir===dir);
    if(q.trim()) arr=arr.filter(x=>x.symbol.toLowerCase().includes(q.trim().toLowerCase()));
    const key={
      score:(x)=>x.score, oi:(x)=>x.oiZ, taker:(x)=>x.taker, ob:(x)=>x.obImb,
      vol:(x)=>x.volFactor, fund:(x)=>x.fundingDelta, rel:(x)=>x.relBTC
    }[sortBy] || ((x)=>x.score);
    return arr.slice().sort((a,b)=> key(b)-key(a) || (b.score-a.score));
  },[data,dir,q,sortBy]);

  const beep=useBeep(); const hotRef=useRef(new Set());
  useEffect(()=>{
    if(!sound) return;
    const currentHot=new Set(items.filter(x=>x.score>=threshold).map(x=>x.symbol));
    let should=false; for(const s of currentHot) if(!hotRef.current.has(s)){ should=true; break; }
    hotRef.current=currentHot; if(should) beep();
  },[items,threshold,sound]);

  const kpiAll=data.items?.length||0;
  const kpiHot=(data.items||[]).filter(x=>x.score>=threshold).length;

  return (
    <main style={{padding:24,fontFamily:"ui-sans-serif",color:c.text,background:c.bg,minHeight:"100vh"}}>
      <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,margin:0}}>ShortAge / LongAge</h1>
          <div style={{fontSize:12,color:c.sub}}>Son güncelleme: {data.updatedAt? new Date(data.updatedAt).toLocaleTimeString(): "-"} {loading && " (yenileniyor...)"}</div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button onClick={load} style={{padding:"6px 10px",border:"1px solid "+c.border,borderRadius:8,background:"#fff"}}>Yenile</button>
          <label style={{fontSize:12,color:c.sub}}>Sesli uyarı <input type="checkbox" checked={sound} onChange={e=>setSound(e.target.checked)}/></label>
        </div>
      </header>

      {/* Filtreler */}
      <section style={{display:"grid",gridTemplateColumns:"repeat(6,minmax(0,1fr))",gap:12,marginBottom:16}}>
        <div style={{gridColumn:"span 2"}}>
          <label style={{fontSize:12,color:c.sub}}>Arama</label>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="BTC, ETH, SOL..." style={{width:"100%",padding:"8px 10px",border:"1px solid "+c.border,borderRadius:8,background:"#fff"}}/>
        </div>
        <div>
          <label style={{fontSize:12,color:c.sub}}>Yön</label>
          <select value={dir} onChange={e=>setDir(e.target.value)} style={{width:"100%",padding:"8px 10px",border:"1px solid "+c.border,borderRadius:8,background:"#fff"}}>
            <option value="all">Hepsi</option><option value="LongAge">LongAge</option><option value="ShortAge">ShortAge</option>
          </select>
        </div>
        <div>
          <label style={{fontSize:12,color:c.sub}}>Sırala</label>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{width:"100%",padding:"8px 10px",border:"1px solid "+c.border,borderRadius:8,background:"#fff"}}>
            <option value="score">Skor</option><option value="oi">OI z</option><option value="taker">Taker</option>
            <option value="ob">OB Imb</option><option value="vol">Vol×</option><option value="fund">FundingΔ</option><option value="rel">RelBTC</option>
          </select>
        </div>
        <div>
          <label style={{fontSize:12,color:c.sub}}>Eşik (≥)</label>
          <input type="number" min={50} max={95} value={threshold}
            onChange={e=>setThreshold(Math.max(50, Math.min(95, Number(e.target.value)||70)))}
            style={{width:"100%",padding:"8px 10px",border:"1px solid "+c.border,borderRadius:8,background:"#fff"}}/>
        </div>
        <div>
          <label style={{fontSize:12,color:c.sub}}>Yenileme</label>
          <select value={intervalMs} onChange={e=>setIntervalMs(Number(e.target.value))}
            style={{width:"100%",padding:"8px 10px",border:"1px solid "+c.border,borderRadius:8,background:"#fff"}}>
            <option value="3000">3 sn</option><option value="5000">5 sn</option><option value="10000">10 sn</option><option value="30000">30 sn</option>
          </select>
        </div>
      </section>

      {/* KPI’lar */}
      <section style={{display:"flex",gap:12,marginBottom:12}}>
        <div style={{flex:1,background:"#fff",border:"1px solid "+c.border,borderRadius:12,padding:12}}>
          <div style={{fontSize:12,color:c.sub}}>Takip Edilen Coin</div>
          <div style={{fontSize:20,fontWeight:800}}>{kpiAll}</div>
        </div>
        <div style={{flex:1,background:"#fff",border:"1px solid "+c.border,borderRadius:12,padding:12}}>
          <div style={{fontSize:12,color:c.sub}}>≥ Eşik Sinyal</div>
          <div style={{fontSize:20,fontWeight:800}}>{kpiHot}</div>
        </div>
      </section>

      {/* Risk widget'ları */}
      <section style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <PositionSizer/>
        <TradeChecklist/>
      </section>

      {/* Tablo */}
      <section style={{background:"#fff",border:"1px solid "+c.border,borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{textAlign:"left",borderBottom:"1px solid "+c.border,background:"#fcfcfc"}}>
              <th style={{padding:10}}>Coin</th><th style={{padding:10}}>Sinyal</th><th style={{padding:10}}>OI z</th>
              <th style={{padding:10}}>Taker</th><th style={{padding:10}}>OB</th><th style={{padding:10}}>Vol×</th>
              <th style={{padding:10}}>FundingΔ</th><th style={{padding:10}}>RelBTC%</th>
            </tr>
          </thead>
          <tbody>
            {items.map(x=>{
              const hot=x.score>=threshold;
              const rowBg=hot ? (x.dir==="LongAge" ? "#ecfdf5" : "#fef2f2") : "transparent";
              return (
                <tr key={x.symbol} style={{borderBottom:"1px solid "+c.border,background:rowBg}}>
                  <td style={{padding:10,fontWeight:700}}>{x.symbol}</td>
                  <td style={{padding:10}}><Badge dir={x.dir} score={x.score} th={threshold}/></td>
                  <td style={{padding:10}}>{x.oiZ.toFixed(2)}</td>
                  <td style={{padding:10}}>{x.taker.toFixed(2)}</td>
                  <td style={{padding:10}}>{x.obImb.toFixed(2)}</td>
                  <td style={{padding:10}}>{x.volFactor.toFixed(2)}</td>
                  <td style={{padding:10}}>{x.fundingDelta.toFixed(4)}%</td>
                  <td style={{padding:10}}>{(x.relBTC*100).toFixed(2)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length===0 && <div style={{padding:16,color:c.sub}}>Filtreye uyan sinyal yok. Eşiği düşürmeyi deneyebilirsin.</div>}
      </section>

      <footer style={{marginTop:12,fontSize:12,color:c.sub}}>
        Not: Sinyaller yalnızca bilgi amaçlıdır. Yatırım tavsiyesi değildir.
      </footer>
    </main>
  );
}