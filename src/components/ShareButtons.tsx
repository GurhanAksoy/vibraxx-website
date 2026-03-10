"use client";

import { useState } from "react";
import { Check, Copy, Download, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface ShareButtonsProps {
  scoreData: {
    score: number;
    correct: number;
    wrong: number;
    accuracy: number;
    userName: string;
    userCountry: string;
    roundId?: number | string;
    rank?: number;
    roundNumber?: number;
  };
  variant?: "full" | "compact";
}

// Platform SVG icons — inline, no dep
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

export default function ShareButtons({ scoreData, variant = "full" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const shareText = `🎯 VibraXX Global Arena\n${scoreData.userName} scored ${scoreData.score} pts\n✅ ${scoreData.correct} correct · ❌ ${scoreData.wrong} wrong · ${scoreData.accuracy}% accuracy${scoreData.rank ? ` · 🏆 #${scoreData.rank}` : ""}\nPlay at vibraxx.com`;

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}` : "https://vibraxx.com";

  const track = async (platform: string) => {
    if (!scoreData.roundId) return;
    try {
      await supabase.rpc("track_share_event", {
        p_round_id: scoreData.roundId,
        p_share_type: platform,
        p_score: scoreData.score,
        p_accuracy: scoreData.accuracy,
      });
    } catch {}
  };

  const platforms = [
    {
      id: "x",
      label: "X",
      icon: <XIcon />,
      color: "#000000",
      border: "rgba(255,255,255,0.15)",
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank", "width=600,height=400");
        track("twitter");
      },
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <WhatsAppIcon />,
      color: "#128c7e",
      border: "rgba(37,211,102,0.4)",
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
        track("whatsapp");
      },
    },
    {
      id: "telegram",
      label: "Telegram",
      icon: <TelegramIcon />,
      color: "#0088cc",
      border: "rgba(0,136,204,0.4)",
      action: () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, "_blank");
        track("telegram");
      },
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      track("copy");
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = async () => {
    setDownloading(true);
    track("download");
    try {
      // Canvas ile skor kartı oluştur
      const canvas = document.createElement("canvas");
      const dpr = 2;
      canvas.width = 1080 * dpr;
      canvas.height = 1080 * dpr;
      canvas.style.width = "1080px";
      canvas.style.height = "1080px";
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      const W = 1080, H = 1080;

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#0f172a");
      bg.addColorStop(0.4, "#1e1b4b");
      bg.addColorStop(0.7, "#312e81");
      bg.addColorStop(1, "#0f172a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Purple orb top-left
      const orb1 = ctx.createRadialGradient(150, 150, 0, 150, 150, 300);
      orb1.addColorStop(0, "rgba(124,58,237,0.5)");
      orb1.addColorStop(1, "transparent");
      ctx.fillStyle = orb1;
      ctx.fillRect(0, 0, W, H);

      // Pink orb bottom-right
      const orb2 = ctx.createRadialGradient(W - 150, H - 150, 0, W - 150, H - 150, 300);
      orb2.addColorStop(0, "rgba(217,70,239,0.4)");
      orb2.addColorStop(1, "transparent");
      ctx.fillStyle = orb2;
      ctx.fillRect(0, 0, W, H);

      // Card
      const cx = W / 2, cy = H / 2;
      const cardW = 800, cardH = 720;
      const cardX = cx - cardW / 2, cardY = cy - cardH / 2;

      ctx.save();
      roundRect(ctx, cardX, cardY, cardW, cardH, 40);
      ctx.fillStyle = "rgba(15,10,40,0.92)";
      ctx.fill();
      ctx.strokeStyle = "rgba(251,191,36,0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Gold top line
      const goldLine = ctx.createLinearGradient(cx - 120, cardY, cx + 120, cardY);
      goldLine.addColorStop(0, "transparent");
      goldLine.addColorStop(0.5, "#fbbf24");
      goldLine.addColorStop(1, "transparent");
      ctx.strokeStyle = goldLine;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 120, cardY + 1.5);
      ctx.lineTo(cx + 120, cardY + 1.5);
      ctx.stroke();

      // VIBRAXX logo text
      ctx.font = "bold 36px monospace";
      ctx.fillStyle = "rgba(167,139,250,0.7)";
      ctx.textAlign = "center";
      ctx.fillText("⚡ VIBRAXX GLOBAL ARENA", cx, cardY + 64);

      // Username
      ctx.font = "bold 28px sans-serif";
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(scoreData.userName, cx, cardY + 108);

      // Big score
      const scoreGrad = ctx.createLinearGradient(cx - 100, 0, cx + 100, 0);
      scoreGrad.addColorStop(0, "#a78bfa");
      scoreGrad.addColorStop(1, "#d946ef");
      ctx.font = "900 160px sans-serif";
      ctx.fillStyle = scoreGrad;
      ctx.fillText(scoreData.score.toString(), cx, cardY + 280);

      ctx.font = "bold 24px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("POINTS", cx, cardY + 320);

      // Divider
      ctx.strokeStyle = "rgba(139,92,246,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cardX + 60, cardY + 350);
      ctx.lineTo(cardX + cardW - 60, cardY + 350);
      ctx.stroke();

      // Stats row
      const stats = [
        { label: "CORRECT", value: scoreData.correct.toString(), color: "#22c55e" },
        { label: "WRONG", value: scoreData.wrong.toString(), color: "#ef4444" },
        { label: "ACCURACY", value: `${scoreData.accuracy}%`, color: "#fbbf24" },
        ...(scoreData.rank ? [{ label: "RANK", value: `#${scoreData.rank}`, color: "#a78bfa" }] : []),
      ];

      const colW = cardW / stats.length;
      stats.forEach((s, i) => {
        const x = cardX + colW * i + colW / 2;
        ctx.font = "900 52px sans-serif";
        ctx.fillStyle = s.color;
        ctx.fillText(s.value, x, cardY + 450);
        ctx.font = "700 18px sans-serif";
        ctx.fillStyle = "rgba(148,163,184,0.8)";
        ctx.fillText(s.label, x, cardY + 484);
      });

      // Answer dots
      const total = scoreData.correct + scoreData.wrong;
      if (total > 0) {
        const dotR = 10, dotGap = 26;
        const dotsW = total * dotGap - (dotGap - dotR * 2);
        let dotX = cx - dotsW / 2 + dotR;
        for (let i = 0; i < scoreData.correct; i++) {
          ctx.beginPath();
          ctx.arc(dotX, cardY + 540, dotR, 0, Math.PI * 2);
          ctx.fillStyle = "#22c55e";
          ctx.fill();
          dotX += dotGap;
        }
        for (let i = 0; i < scoreData.wrong; i++) {
          ctx.beginPath();
          ctx.arc(dotX, cardY + 540, dotR, 0, Math.PI * 2);
          ctx.fillStyle = "#ef4444";
          ctx.fill();
          dotX += dotGap;
        }
      }

      // Bottom CTA
      ctx.font = "600 22px monospace";
      ctx.fillStyle = "rgba(167,139,250,0.6)";
      ctx.fillText("vibraxx.com · Play the Global Quiz", cx, cardY + cardH - 36);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `vibraxx-score-${scoreData.score}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, "image/png");
    } finally {
      setDownloading(false);
    }
  };

  // Helper: rounded rect path
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Label */}
      <div style={{
        fontSize: "10px", fontWeight: 800, color: "#475569",
        textTransform: "uppercase", letterSpacing: "0.12em",
        marginBottom: "10px", textAlign: "center",
      }}>
        Share Your Result
      </div>

      {/* Platform buttons */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "8px",
        marginBottom: "8px",
      }}>
        {platforms.map((p) => (
          <button
            key={p.id}
            onClick={p.action}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "6px",
              padding: "10px 8px",
              borderRadius: "10px",
              border: `1px solid ${p.border}`,
              background: `${p.color}22`,
              color: "white",
              fontSize: "12px", fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${p.color}44`; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = `${p.color}22`; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {p.icon}
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Copy + Download */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <button
          onClick={handleCopy}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            padding: "10px 8px",
            borderRadius: "10px",
            border: `1px solid ${copied ? "rgba(34,197,94,0.5)" : "rgba(100,116,139,0.3)"}`,
            background: copied ? "rgba(34,197,94,0.15)" : "rgba(30,41,59,0.6)",
            color: copied ? "#22c55e" : "#94a3b8",
            fontSize: "12px", fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>

        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            padding: "10px 8px",
            borderRadius: "10px",
            border: "1px solid rgba(251,191,36,0.4)",
            background: "rgba(251,191,36,0.1)",
            color: "#fbbf24",
            fontSize: "12px", fontWeight: 700,
            cursor: downloading ? "wait" : "pointer",
            transition: "all 0.2s",
            opacity: downloading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => { if (!downloading) e.currentTarget.style.background = "rgba(251,191,36,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(251,191,36,0.1)"; }}
        >
          <Download size={14} />
          <span>{downloading ? "Saving..." : "Save Card"}</span>
        </button>
      </div>
    </div>
  );
}
