"use client";

import { useState } from "react";
import {
  Twitter,
  Facebook,
  MessageCircle,
  Linkedin,
  Link as LinkIcon,
  Download,
  Share2,
  Check
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface ShareButtonsProps {
  scoreData: {
    score: number;
    correct: number;
    wrong: number;
    accuracy: number;
    userName: string;
    userCountry: string;
    roundId?: number;
    rank?: number;
    roundNumber?: number;
  };
  variant?: "full" | "compact";
}

export default function ShareButtons({ scoreData, variant = "full" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const shareText = `I just scored ${scoreData.score} points on VibraXX! 🎯
✅ ${scoreData.correct} correct | ❌ ${scoreData.wrong} wrong | 📊 ${scoreData.accuracy}% accuracy${
    scoreData.rank ? ` | 👑 Ranked #${scoreData.rank}` : ""
  }`;

  const shareUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/api/share-card?score=${scoreData.score}&correct=${scoreData.correct}&wrong=${
    scoreData.wrong
  }&accuracy=${scoreData.accuracy}&userName=${encodeURIComponent(
    scoreData.userName
  )}&country=${encodeURIComponent(scoreData.userCountry)}${
    scoreData.rank ? `&rank=${scoreData.rank}` : ""
  }${scoreData.roundNumber ? `&roundNumber=${scoreData.roundNumber}` : ""}`;

  const trackShare = async (platform: string) => {
    if (!scoreData.roundId) return;
    await supabase.rpc("track_share_event", {
      p_round_id: scoreData.roundId,
      p_share_type: platform,
      p_score: scoreData.score,
      p_accuracy: scoreData.accuracy
    });
  };

  const open = (url: string, platform: string) => {
    window.open(url, "_blank", "width=600,height=400");
    trackShare(platform);
  };

  const shareToTwitter = () =>
    open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(shareUrl)}`,
      "twitter"
    );

  const shareToFacebook = () =>
    open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}&quote=${encodeURIComponent(shareText)}`,
      "facebook"
    );

  const shareToWhatsApp = () =>
    open(
      `https://wa.me/?text=${encodeURIComponent(
        shareText + "\n\n" + shareUrl
      )}`,
      "whatsapp"
    );

  const shareToLinkedIn = () =>
    open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`,
      "linkedin"
    );

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareText + "\n\n" + shareUrl);
    setCopied(true);
    trackShare("copy");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = async () => {
    try {
      setIsSharing(true);
      const response = await fetch(shareUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vibraxx-score-${scoreData.score}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      trackShare("download");
    } finally {
      setIsSharing(false);
    }
  };

  const shareViaNavigator = async () => {
    if (!navigator.share) return;
    await navigator.share({
      title: "My VibraXX Score",
      text: shareText,
      url: shareUrl
    });
    trackShare("native");
  };

  const iconSize = variant === "full" ? 18 : 16;

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
      {navigator.share && (
        <button onClick={shareViaNavigator}>
          <Share2 size={iconSize} /> Share
        </button>
      )}
      <button onClick={shareToTwitter}>
        <Twitter size={iconSize} /> Twitter
      </button>
      <button onClick={shareToFacebook}>
        <Facebook size={iconSize} /> Facebook
      </button>
      <button onClick={shareToWhatsApp}>
        <MessageCircle size={iconSize} /> WhatsApp
      </button>
      <button onClick={shareToLinkedIn}>
        <Linkedin size={iconSize} /> LinkedIn
      </button>
      <button onClick={copyToClipboard}>
        {copied ? <Check size={iconSize} /> : <LinkIcon size={iconSize} />} Copy
      </button>
      <button onClick={downloadImage} disabled={isSharing}>
        <Download size={iconSize} /> {isSharing ? "..." : "Download"}
      </button>
    </div>
  );
}
