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
    userId?: string;
    roundId?: string;
    rank?: number;
    roundNumber?: number;
  };
  variant?: "full" | "compact";
}

export default function ShareButtons({ scoreData, variant = "full" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Generate share text
  const shareText = `I just scored ${scoreData.score} points on VibraXX! 🎯\n✅ ${scoreData.correct} correct | ❌ ${scoreData.wrong} wrong | 📊 ${scoreData.accuracy}% accuracy${scoreData.rank ? ` | 👑 Ranked #${scoreData.rank}` : ''}`;
  
  // Generate share card URL
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/share-card?score=${scoreData.score}&correct=${scoreData.correct}&wrong=${scoreData.wrong}&accuracy=${scoreData.accuracy}&userName=${encodeURIComponent(scoreData.userName)}&country=${encodeURIComponent(scoreData.userCountry)}${scoreData.rank ? `&rank=${scoreData.rank}` : ''}${scoreData.roundNumber ? `&roundNumber=${scoreData.roundNumber}` : ''}`;
  
  const platformUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vibraxx.com';

  // Track share event
  const trackShare = async (platform: string) => {
    if (!scoreData.userId || !scoreData.roundId) return;
    
    try {
      await supabase.rpc('track_share_event', {
        p_user_id: scoreData.userId,
        p_round_id: scoreData.roundId,
        p_share_type: platform,
        p_score: scoreData.score,
        p_accuracy: scoreData.accuracy
      });
    } catch (error) {
      console.error('Failed to track share event:', error);
    }
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    trackShare('twitter');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
    trackShare('facebook');
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
    window.open(url, '_blank');
    trackShare('whatsapp');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    trackShare('linkedin');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText + '\n\n' + shareUrl);
      setCopied(true);
      trackShare('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadImage = async () => {
    try {
      setIsSharing(true);
      const response = await fetch(shareUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vibraxx-score-${scoreData.score}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      trackShare('download');
    } catch (error) {
      console.error('Failed to download image:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const shareViaNavigator = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My VibraXX Score',
          text: shareText,
          url: shareUrl,
        });
        trackShare('native');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    }
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: variant === 'full' ? '12px 20px' : '10px 16px',
    borderRadius: '999px',
    border: '2px solid rgba(139, 92, 246, 0.5)',
    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(79, 70, 229, 0.2))',
    color: 'white',
    fontSize: variant === 'full' ? '14px' : '13px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  const iconSize = variant === 'full' ? 18 : 16;

  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Native Share (Mobile) */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            onClick={shareViaNavigator}
            style={{
              ...buttonStyle,
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(217, 70, 239, 0.3))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Share2 size={iconSize} />
            <span>Share</span>
          </button>
        )}

        <button
          onClick={copyToClipboard}
          style={{
            ...buttonStyle,
            background: copied 
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.3))'
              : 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(79, 70, 229, 0.2))',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {copied ? <Check size={iconSize} /> : <LinkIcon size={iconSize} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        <button
          onClick={downloadImage}
          disabled={isSharing}
          style={{
            ...buttonStyle,
            opacity: isSharing ? 0.6 : 1,
            cursor: isSharing ? 'wait' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!isSharing) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Download size={iconSize} />
          <span>{isSharing ? 'Downloading...' : 'Download'}</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: 900, 
          color: 'white',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          📤 Share Your Score
        </h3>
        <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>
          Show off your achievement!
        </p>
      </div>

      {/* Social Buttons Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '10px' 
      }}>
        <button
          onClick={shareToTwitter}
          style={{
            ...buttonStyle,
            background: 'linear-gradient(135deg, rgba(29, 155, 240, 0.3), rgba(26, 140, 216, 0.2))',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(29, 155, 240, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Twitter size={iconSize} />
          <span>Twitter</span>
        </button>

        <button
          onClick={shareToFacebook}
          style={{
            ...buttonStyle,
            background: 'linear-gradient(135deg, rgba(24, 119, 242, 0.3), rgba(9, 105, 218, 0.2))',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(24, 119, 242, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Facebook size={iconSize} />
          <span>Facebook</span>
        </button>

        <button
          onClick={shareToWhatsApp}
          style={{
            ...buttonStyle,
            background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.3), rgba(29, 185, 84, 0.2))',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 211, 102, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <MessageCircle size={iconSize} />
          <span>WhatsApp</span>
        </button>

        <button
          onClick={shareToLinkedIn}
          style={{
            ...buttonStyle,
            background: 'linear-gradient(135deg, rgba(10, 102, 194, 0.3), rgba(0, 119, 181, 0.2))',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(10, 102, 194, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Linkedin size={iconSize} />
          <span>LinkedIn</span>
        </button>

        <button
          onClick={copyToClipboard}
          style={{
            ...buttonStyle,
            background: copied 
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.3))'
              : 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.2))',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {copied ? <Check size={iconSize} /> : <LinkIcon size={iconSize} />}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>

        <button
          onClick={downloadImage}
          disabled={isSharing}
          style={{
            ...buttonStyle,
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.2))',
            opacity: isSharing ? 0.6 : 1,
            cursor: isSharing ? 'wait' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!isSharing) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(251, 191, 36, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <Download size={iconSize} />
          <span>{isSharing ? 'Downloading...' : 'Download'}</span>
        </button>
      </div>
    </div>
  );
}
