"use client";
import React, { useState } from "react";

export function PositionSizer(){
  const [balance,setBalance]=useState(1000);
  const [riskPct,setRiskPct]=useState(1);
  const [entry,setEntry]=useState(100);
  const [stop,setStop]=useState(98);
  const [sym,setSym]=useState("BTCUSDT");

  const riskAmt = balance * (riskPct/100);
  const stopDist = Math.max(0.0001, Math.abs(entry - stop));
  const qty = (riskAmt / stopDist);

  const inputStyle = {padding:"8px 10px", border:"1px solid #e5e7eb", borderRadius:8, width:"100%"};

  return (
    <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:12}}>
      <div style={{fontWeight:700,marginBottom:8}}>Pozisyon Boyutu</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
        <input style={inputStyle} placeholder="Bakiye (USDT)" value={balance} onChange={e=>setBalance(Number(e.target.value)||0)}/>
        <input style={inputStyle} placeholder="Risk %" value={riskPct} onChange={e=>setRiskPct(Number(e.target.value)||0)}/>
        <input style={inputStyle} placeholder="Giriş" value={entry} onChange={e=>setEntry(Number(e.target.value)||0)}/>
        <input style={inputStyle} placeholder="Stop" value={stop} onChange={e=>setStop(Number(e.target.value)||0)}/>
        <input style={inputStyle} placeholder="Sembol" value={sym} onChange={e=>setSym(e.target.value)}/>
      </div>
      <div style={{marginTop:8,fontSize:12,color:"#6b7280"}}>
        Öneri adet: <b>{qty.toFixed(4)}</b> | Risk Tutarı: <b>{riskAmt.toFixed(2)} USDT</b>
      </div>
    </div>
  );
}

export function TradeChecklist(){
  const items=["Trend yönü lehte mi?","Hacim yeterli mi?","Stop/TP yazıldı mı?","Korelasyon çatışması yok?","Haber/Vol spike yok?"];
  const [checked,setChecked]=useState(items.map(()=>false));
  const pass = checked.filter(Boolean).length===items.length;
  return (
    <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:12}}>
      <div style={{fontWeight:700,marginBottom:8}}>İşlem Kontrol Listesi</div>
      {items.map((t,i)=>(
        <label key={i} style={{display:"block",fontSize:14,marginBottom:6}}>
          <input type="checkbox" checked={checked[i]} onChange={e=>{
            const c=[...checked]; c[i]=e.target.checked; setChecked(c);
          }}/> {t}
        </label>
      ))}
      <div style={{marginTop:8,fontWeight:700,color: pass ? "#16a34a" : "#dc2626"}}>
        {pass ? "Hazır ✔" : "Eksikler var!"}
      </div>
    </div>
  );
}