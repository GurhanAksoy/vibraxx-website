"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  CheckCircle2,
  Rocket,
  Trophy,
  Sparkles,
  ArrowRight,
  Play,
  Star,
  Flame,
  Volume2,
  VolumeX,
  Home,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  
  const [isLoading, setIsLoading] = useState(true);
  const [userRounds, setUserRounds] = useState(0);
  const [purchasedRounds, setPurchasedRounds] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadRounds = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("user_rounds")
        .select("available_rounds")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setUserRounds(data.available_rounds || 0);
      }

      if (sessionId) {
        const storedPackage = sessionStorage.getItem(`purchase_${sessionId}`);
        if (storedPackage) {
          const pkg = JSON.parse(storedPackage);
          setPurchasedRounds(pkg.rounds || 0);
          sessionStorage.removeItem(`purchase_${sessionId}`);
        }
      }

      setIsLoading(false);
    };

    loadRounds();
  }, [router, sessionId]);

  useEffect(() => {
    const audioElement = new Audio("/sounds/vibraxx.mp3");
    audioElement.loop = true;
    audioElement.volume = 0.3;
    setAudio(audioElement);

    return () => {
      audioElement.pause();
      audioElement.src = "";
    };
  }, []);

  const toggleAudio = () => {
    if (!audio) return;
    
    if (isMuted) {
      audio.play().catch(() => {});
      setIsMuted(false);
    } else {
      audio.pause();
      setIsMuted(true);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(139, 92, 246, 0.3)',
          borderTopColor: '#8b5cf6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow-x: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        
        .vx-champ-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          color: white;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .vx-champ-bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.5;
          pointer-events: none;
        }

        .vx-champ-header {
          position: relative;
          z-index: 10;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          background: rgba(15, 23, 42, 0.8);
        }

        .vx-champ-header-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 24px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100px;
        }

        .vx-champ-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.3s;
        }
        .vx-champ-logo:hover { transform: scale(1.05); }

        .vx-champ-logo-outer {
          position: relative;
          width: 90px;
          height: 90px;
          border-radius: 9999px;
          padding: 3px;
          background: radial-gradient(circle at 0 0, #7c3aed, #d946ef);
          box-shadow: 
            0 0 40px rgba(124, 58, 237, 0.8),
            0 0 80px rgba(217, 70, 239, 0.4),
            inset 0 0 20px rgba(168, 85, 247, 0.3);
          flex-shrink: 0;
          animation: logo-pulse 3s ease-in-out infinite;
        }

        @keyframes logo-pulse {
          0%, 100% { 
            box-shadow: 
              0 0 40px rgba(124, 58, 237, 0.8),
              0 0 80px rgba(217, 70, 239, 0.4),
              inset 0 0 20px rgba(168, 85, 247, 0.3);
          }
          50% { 
            box-shadow: 
              0 0 60px rgba(124, 58, 237, 1),
              0 0 120px rgba(217, 70, 239, 0.6),
              inset 0 0 30px rgba(168, 85, 247, 0.5);
          }
        }

        .vx-champ-logo-glow {
          position: absolute;
          inset: -8px;
          border-radius: 9999px;
          background: radial-gradient(circle, #a855f7, transparent);
          opacity: 0.6;
          filter: blur(15px);
          pointer-events: none;
          animation: glow-pulse 2s ease-in-out infinite;
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        .vx-champ-logo-circle {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background: 
            radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.3), transparent),
            #020817;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 2px solid rgba(139, 92, 246, 0.5);
        }

        .vx-champ-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 10px;
          filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.6));
        }

        .vx-champ-logo-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .vx-champ-logo-label {
          font-size: 14px;
          color: #c4b5fd;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          white-space: nowrap;
          text-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }

        .vx-champ-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .vx-champ-header-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          color: #a78bfa;
        }

        .vx-champ-header-btn:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.5);
          transform: translateY(-2px);
        }

        .vx-champ-main {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px);
        }

        .vx-champ-content {
          max-width: 800px;
          width: 100%;
        }

        .vx-champ-hero {
          text-align: center;
          margin-bottom: 48px;
          animation: slide-up 0.8s ease-out both;
        }

        .vx-champ-success-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 60px rgba(34, 197, 94, 0.5);
          animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
        }

        .vx-champ-success-icon::before {
          content: '';
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.4), transparent);
          filter: blur(20px);
          animation: success-glow 2s ease-in-out infinite;
        }

        @keyframes success-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }

        .vx-champ-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 20px;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.4);
          margin-bottom: 16px;
          font-size: 12px;
          font-weight: 700;
          color: #4ade80;
          letter-spacing: 0.05em;
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
        }

        .vx-champ-title {
          font-size: clamp(32px, 6vw, 48px);
          font-weight: 900;
          margin-bottom: 8px;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .vx-champ-title-gradient {
          display: inline-block;
          background: linear-gradient(90deg, #22c55e, #fbbf24, #22d3ee, #fbbf24, #22c55e);
          background-size: 250% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
          filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.5));
        }

        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 250% center; }
        }

        .vx-champ-subtitle {
          font-size: clamp(15px, 3vw, 18px);
          color: #cbd5e1;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .vx-champ-section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: clamp(24px, 5vw, 32px);
          margin-bottom: 24px;
          animation: slide-up 0.8s ease-out 0.2s both;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .vx-champ-section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .vx-champ-section-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .vx-champ-section-title {
          font-size: clamp(18px, 4vw, 22px);
          font-weight: 700;
          margin: 0;
        }

        .vx-champ-rounds-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
          gap: 16px;
        }

        .vx-champ-rounds-card {
          background: rgba(139, 92, 246, 0.1);
          border: 2px solid rgba(139, 92, 246, 0.3);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s;
        }

        .vx-champ-rounds-card:hover {
          transform: translateY(-4px);
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
        }

        .vx-champ-rounds-number {
          font-size: clamp(36px, 8vw, 48px);
          font-weight: 900;
          background: linear-gradient(135deg, #8b5cf6, #d946ef);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 4px;
          filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.5));
        }

        .vx-champ-rounds-label {
          font-size: 14px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .vx-champ-rounds-added {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
        }

        .vx-champ-rounds-added:hover {
          border-color: rgba(34, 197, 94, 0.5);
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);
        }

        .vx-champ-rounds-added .vx-champ-rounds-number {
          background: linear-gradient(135deg, #22c55e, #4ade80);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.5));
        }

        .vx-champ-prize-content {
          text-align: center;
        }

        .vx-champ-prize-amount {
          font-size: clamp(48px, 10vw, 72px);
          font-weight: 900;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 12px;
          line-height: 1;
          filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.6));
        }

        .vx-champ-prize-text {
          font-size: clamp(14px, 3vw, 16px);
          color: #cbd5e1;
          line-height: 1.6;
        }

        .vx-champ-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
          gap: 12px;
          margin-bottom: 24px;
          animation: slide-up 0.8s ease-out 0.4s both;
        }

        .vx-champ-btn {
          padding: 18px 24px;
          border-radius: 12px;
          border: none;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .vx-champ-btn-primary {
          background: linear-gradient(135deg, #8b5cf6, #d946ef);
          color: white;
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
        }

        .vx-champ-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(139, 92, 246, 0.6);
        }

        .vx-champ-btn-secondary {
          background: transparent;
          color: #a78bfa;
          border: 2px solid rgba(139, 92, 246, 0.5);
        }

        .vx-champ-btn-secondary:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.8);
          transform: translateY(-2px);
        }

        .vx-champ-features {
          animation: slide-up 0.8s ease-out 0.6s both;
        }

        .vx-champ-features-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .vx-champ-features-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
        }

        .vx-champ-features-text {
          font-size: clamp(18px, 4vw, 22px);
          font-weight: 700;
        }

        .vx-champ-features-grid {
          display: grid;
          gap: 12px;
        }

        .vx-champ-feature {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s;
        }

        .vx-champ-feature:hover {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.3);
          transform: translateX(4px);
        }

        .vx-champ-feature-bullet {
          font-size: 20px;
          color: #4ade80;
          flex-shrink: 0;
          margin-top: 2px;
          text-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
        }

        .vx-champ-feature-text {
          font-size: 15px;
          color: #cbd5e1;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .mobile-hide { display: none !important; }
          .vx-champ-header-inner { height: 80px; }
          .vx-champ-logo-outer { width: 70px; height: 70px; }
        }
      `}</style>

      <div className="vx-champ-container">
        <div className="vx-champ-bg-grid" />

        <header className="vx-champ-header">
          <div className="vx-champ-header-inner">
            <div className="vx-champ-logo" onClick={() => router.push("/")}>
              <div className="vx-champ-logo-outer">
                <div className="vx-champ-logo-glow" />
                <div className="vx-champ-logo-circle">
                  <img src="/images/logo.png" alt="VibraXX Logo" className="vx-champ-logo-img" />
                </div>
              </div>
              <div className="vx-champ-logo-text mobile-hide">
                <span className="vx-champ-logo-label">Live Quiz</span>
              </div>
            </div>

            <div className="vx-champ-header-actions">
              <button className="vx-champ-header-btn" onClick={toggleAudio} title={isMuted ? "Unmute" : "Mute"}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <button className="vx-champ-header-btn" onClick={() => router.push("/")} title="Back to Home">
                <Home size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className="vx-champ-main">
          <div className="vx-champ-content">
            {/* Hero */}
            <div className="vx-champ-hero">
              <div className="vx-champ-success-icon">
                <CheckCircle2 size={48} color="white" strokeWidth={3} />
              </div>
              
              <div className="vx-champ-badge">
                <Sparkles size={14} />
                PAYMENT SUCCESSFUL!
              </div>

              <h1 className="vx-champ-title">
                Welcome to the Arena, <span className="vx-champ-title-gradient">Champion!</span>
              </h1>

              <p className="vx-champ-subtitle">
                Your rounds have been added to your account and you're now ready to enter the Global Live Quiz and compete for the <strong style={{ color: "#fbbf24" }}>£1,000 Monthly Prize</strong>.
              </p>
            </div>

            {/* Your Rounds */}
            <div className="vx-champ-section">
              <div className="vx-champ-section-header">
                <div className="vx-champ-section-icon" style={{ background: "linear-gradient(135deg, #8b5cf6, #d946ef)" }}>
                  <Star size={24} color="white" />
                </div>
                <h2 className="vx-champ-section-title">Your Rounds</h2>
              </div>

              <div className="vx-champ-rounds-grid">
                <div className="vx-champ-rounds-card">
                  <div className="vx-champ-rounds-number">{userRounds}</div>
                  <div className="vx-champ-rounds-label">Total Rounds</div>
                </div>

                <div className="vx-champ-rounds-card vx-champ-rounds-added">
                  <div className="vx-champ-rounds-number">+{purchasedRounds || 0}</div>
                  <div className="vx-champ-rounds-label">Just Added</div>
                </div>
              </div>
            </div>

            {/* Prize Pool */}
            <div className="vx-champ-section">
              <div className="vx-champ-section-header">
                <div className="vx-champ-section-icon" style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}>
                  <Trophy size={24} color="white" />
                </div>
                <h2 className="vx-champ-section-title">Prize Pool</h2>
              </div>

              <div className="vx-champ-prize-content">
                <div className="vx-champ-prize-amount">£1,000</div>
                <p className="vx-champ-prize-text">
                  The prize activates when we reach 2000+ monthly participants.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="vx-champ-actions">
              <button className="vx-champ-btn vx-champ-btn-primary" onClick={() => router.push("/lobby")}>
                <Play size={20} />
                Start Live Quiz
                <ArrowRight size={18} />
              </button>

              <button className="vx-champ-btn vx-champ-btn-secondary" onClick={() => router.push("/")}>
                <Rocket size={20} />
                Go to Home
              </button>
            </div>

            {/* What's Next */}
            <div className="vx-champ-section vx-champ-features">
              <div className="vx-champ-features-title">
                <div className="vx-champ-features-icon">
                  <Flame size={24} color="white" />
                </div>
                <h2 className="vx-champ-features-text">What's Next?</h2>
              </div>

              <div className="vx-champ-features-grid">
                <div className="vx-champ-feature">
                  <span className="vx-champ-feature-bullet">✓</span>
                  <span className="vx-champ-feature-text">Join live competitions every 15 minutes</span>
                </div>

                <div className="vx-champ-feature">
                  <span className="vx-champ-feature-bullet">✓</span>
                  <span className="vx-champ-feature-text">Climb the daily, weekly, monthly leaderboard</span>
                </div>

                <div className="vx-champ-feature">
                  <span className="vx-champ-feature-bullet">✓</span>
                  <span className="vx-champ-feature-text">Build your score, accuracy, and streak</span>
                </div>

                <div className="vx-champ-feature">
                  <span className="vx-champ-feature-bullet">✓</span>
                  <span className="vx-champ-feature-text">Become the next VibraXX Global Champion</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(139, 92, 246, 0.3)',
          borderTopColor: '#8b5cf6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
