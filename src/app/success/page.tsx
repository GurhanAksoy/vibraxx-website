"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  CheckCircle2,
  Rocket,
  Trophy,
  Gift,
  Sparkles,
  ArrowRight,
  Crown,
  Zap,
  Target,
  TrendingUp,
  Play,
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
  const [packageName, setPackageName] = useState("");
  const [purchasedRounds, setPurchasedRounds] = useState(0);

  useEffect(() => {
    const loadRounds = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/");
        return;
      }

      // Fetch updated rounds
      const { data, error } = await supabase
        .from("user_rounds")
        .select("available_rounds")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setUserRounds(data.available_rounds || 0);
      }

      // Try to get package details from session storage or default values
      if (sessionId) {
        const storedPackage = sessionStorage.getItem(`purchase_${sessionId}`);
        if (storedPackage) {
          const pkg = JSON.parse(storedPackage);
          setPackageName(pkg.name || "Quiz Rounds");
          setPurchasedRounds(pkg.rounds || 0);
          sessionStorage.removeItem(`purchase_${sessionId}`);
        }
      }

      setIsLoading(false);
    };

    loadRounds();
  }, [router, sessionId]);

  if (isLoading) {
    return (
      <div className="vx-success-loading">
        <div className="vx-success-spinner" />
        <style jsx>{`
          .vx-success-loading {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .vx-success-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(139, 92, 246, 0.3);
            border-top-color: #8b5cf6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
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
        
        .vx-success-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          color: white;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .vx-success-bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.5;
          pointer-events: none;
        }

        .vx-success-header {
          position: relative;
          z-index: 10;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          background: rgba(15, 23, 42, 0.8);
        }

        .vx-success-header-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 24px);
          display: flex;
          align-items: center;
          justify-content: center;
          height: 80px;
        }

        .vx-success-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: transform 0.3s;
          min-width: 0;
        }
        .vx-success-logo:hover { transform: scale(1.05); }

        .vx-success-logo-outer {
          position: relative;
          width: 70px;
          height: 70px;
          border-radius: 9999px;
          padding: 3px;
          background: radial-gradient(circle at 0 0, #7c3aed, #d946ef);
          box-shadow: 0 0 30px rgba(124, 58, 237, 0.6);
          flex-shrink: 0;
        }

        .vx-success-logo-glow {
          position: absolute;
          inset: -5px;
          border-radius: 9999px;
          background: radial-gradient(circle, #a855f7, transparent);
          opacity: 0.4;
          filter: blur(10px);
          pointer-events: none;
          animation: glow 2s ease-in-out infinite;
        }

        .vx-success-logo-circle {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background-color: #020817;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .vx-success-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 8px;
        }

        .vx-success-logo-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .vx-success-logo-label {
          font-size: 13px;
          color: #c4b5fd;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          white-space: nowrap;
        }

        @keyframes glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }

        .vx-success-main {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px);
        }

        .vx-success-content {
          max-width: 700px;
          width: 100%;
          text-align: center;
        }

        .vx-success-icon-wrap {
          margin-bottom: 32px;
          animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .vx-success-icon-outer {
          width: 120px;
          height: 120px;
          margin: 0 auto;
          position: relative;
        }

        .vx-success-icon-circle {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 60px rgba(34, 197, 94, 0.5);
          position: relative;
          animation: pulse-success 2s ease-in-out infinite;
        }

        .vx-success-icon-glow {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.6), transparent);
          filter: blur(20px);
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes pulse-success {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.9; }
        }

        .vx-success-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 20px;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.4);
          margin-bottom: 24px;
          font-size: 12px;
          font-weight: 700;
          color: #4ade80;
          letter-spacing: 0.05em;
          animation: slide-up 0.8s ease-out 0.2s both;
        }

        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .vx-success-title {
          font-size: clamp(36px, 8vw, 56px);
          font-weight: 900;
          margin-bottom: 16px;
          line-height: 1.2;
          letter-spacing: -0.02em;
          animation: slide-up 0.8s ease-out 0.3s both;
        }

        .vx-success-title-gradient {
          display: inline-block;
          background: linear-gradient(90deg, #22c55e, #4ade80, #22d3ee, #4ade80, #22c55e);
          background-size: 250% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 250% center; }
        }

        .vx-success-message {
          font-size: clamp(16px, 3vw, 20px);
          color: #cbd5e1;
          max-width: 600px;
          margin: 0 auto 32px;
          line-height: 1.6;
          animation: slide-up 0.8s ease-out 0.4s both;
        }

        .vx-success-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr));
          gap: 16px;
          margin-bottom: 40px;
          animation: slide-up 0.8s ease-out 0.5s both;
        }

        .vx-success-stat {
          padding: 20px 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s;
        }

        .vx-success-stat:hover {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.4);
          transform: translateY(-4px);
        }

        .vx-success-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }

        .vx-success-stat-value {
          font-size: 28px;
          font-weight: 900;
          margin-bottom: 4px;
          background: linear-gradient(135deg, #22c55e, #4ade80);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .vx-success-stat-label {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .vx-success-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 400px;
          margin: 0 auto;
          animation: slide-up 0.8s ease-out 0.6s both;
        }

        .vx-success-btn {
          width: 100%;
          padding: 16px 24px;
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

        .vx-success-btn-primary {
          background: linear-gradient(135deg, #8b5cf6, #d946ef);
          color: white;
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
        }

        .vx-success-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(139, 92, 246, 0.6);
        }

        .vx-success-btn-secondary {
          background: transparent;
          color: #a78bfa;
          border: 2px solid rgba(139, 92, 246, 0.5);
        }

        .vx-success-btn-secondary:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.8);
        }

        .vx-success-features {
          margin-top: 40px;
          padding: 32px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 27, 75, 0.6));
          border: 2px solid rgba(139, 92, 246, 0.3);
          backdrop-filter: blur(20px);
          animation: slide-up 0.8s ease-out 0.7s both;
        }

        .vx-success-features-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #e2e8f0;
          text-align: center;
        }

        .vx-success-features-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
          gap: 16px;
        }

        .vx-success-feature {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #cbd5e1;
        }

        .vx-success-feature-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .mobile-hide { display: none !important; }
        }

        @media (max-width: 640px) {
          .vx-success-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="vx-success-container">
        <div className="vx-success-bg-grid" />

        {/* Header */}
        <header className="vx-success-header">
          <div className="vx-success-header-inner">
            <div className="vx-success-logo" onClick={() => router.push("/")}>
              <div className="vx-success-logo-outer">
                <div className="vx-success-logo-glow" />
                <div className="vx-success-logo-circle">
                  <img src="/images/logo.png" alt="VibraXX Logo" className="vx-success-logo-img" />
                </div>
              </div>
              <div className="vx-success-logo-text mobile-hide">
                <span className="vx-success-logo-label">Live Quiz</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="vx-success-main">
          <div className="vx-success-content">
            {/* Success Icon */}
            <div className="vx-success-icon-wrap">
              <div className="vx-success-icon-outer">
                <div className="vx-success-icon-glow" />
                <div className="vx-success-icon-circle">
                  <CheckCircle2 size={60} color="white" strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* Badge */}
            <div className="vx-success-badge">
              <Sparkles size={16} />
              PAYMENT SUCCESSFUL
            </div>

            {/* Title */}
            <h1 className="vx-success-title">
              <span className="vx-success-title-gradient">Welcome to the Arena!</span>
            </h1>

            {/* Message */}
            <p className="vx-success-message">
              Your purchase was successful! Your quiz rounds have been added to your account and you're ready to compete for the <strong style={{ color: "#fbbf24" }}>£1,000 monthly prize</strong>.
            </p>

            {/* Stats */}
            <div className="vx-success-stats">
              <div className="vx-success-stat">
                <div className="vx-success-stat-icon" style={{ background: "rgba(139, 92, 246, 0.2)" }}>
                  <Gift size={20} color="#a78bfa" />
                </div>
                <div className="vx-success-stat-value">{userRounds}</div>
                <div className="vx-success-stat-label">Total Rounds</div>
              </div>

              <div className="vx-success-stat">
                <div className="vx-success-stat-icon" style={{ background: "rgba(34, 197, 94, 0.2)" }}>
                  <TrendingUp size={20} color="#4ade80" />
                </div>
                <div className="vx-success-stat-value">{purchasedRounds || "+"}</div>
                <div className="vx-success-stat-label">Just Added</div>
              </div>

              <div className="vx-success-stat">
                <div className="vx-success-stat-icon" style={{ background: "rgba(251, 191, 36, 0.2)" }}>
                  <Trophy size={20} color="#fbbf24" />
                </div>
                <div className="vx-success-stat-value">£1000</div>
                <div className="vx-success-stat-label">Prize Pool</div>
              </div>
            </div>

            {/* Actions */}
            <div className="vx-success-actions">
              <button className="vx-success-btn vx-success-btn-primary" onClick={() => router.push("/lobby")}>
                <Play size={20} />
                Start Live Quiz
                <ArrowRight size={18} />
              </button>

              <button className="vx-success-btn vx-success-btn-secondary" onClick={() => router.push("/")}>
                <Rocket size={20} />
                Go to Home
              </button>
            </div>

            {/* Features */}
            <div className="vx-success-features">
              <div className="vx-success-features-title">What's Next?</div>
              <div className="vx-success-features-list">
                <div className="vx-success-feature">
                  <div className="vx-success-feature-check">
                    <CheckCircle2 size={12} color="white" strokeWidth={3} />
                  </div>
                  Join live competitions
                </div>
                <div className="vx-success-feature">
                  <div className="vx-success-feature-check">
                    <CheckCircle2 size={12} color="white" strokeWidth={3} />
                  </div>
                  Climb the leaderboard
                </div>
                <div className="vx-success-feature">
                  <div className="vx-success-feature-check">
                    <CheckCircle2 size={12} color="white" strokeWidth={3} />
                  </div>
                  Compete for prizes
                </div>
                <div className="vx-success-feature">
                  <div className="vx-success-feature-check">
                    <CheckCircle2 size={12} color="white" strokeWidth={3} />
                  </div>
                  Track your progress
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
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
  
  const [isLoading, setIsLoading] = useState(true);
  const [userRounds, setUserRounds] = useState(0);
  const [packageName, setPackageName] = useState("");
  const [purchasedRounds, setPurchasedRounds] = useState(0);

  useEffect(() => {
    const loadRounds = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/");
        return;
      }

      // Fetch updated rounds
      const { data, error } = await supabase
        .from("user_rounds")
        .select("available_rounds")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setUserRounds(data.available_rounds || 0);
      }

      // Try to get package details from session storage or default values
      if (sessionId) {
        const storedPackage = sessionStorage.getItem(`purchase_${sessionId}`);
        if (storedPackage) {
          const pkg = JSON.parse(storedPackage);
          setPackageName(pkg.name || "Quiz Rounds");
          setPurchasedRounds(pkg.rounds || 0);
          sessionStorage.removeItem(`purchase_${sessionId}`);
        }
      }

      setIsLoading(false);
    };

    loadRounds();
  }, [router, sessionId]);

  if (isLoading) {
    return (
      <div className="vx-success-loading">
        <div className="vx-success-spinner" />
        <style jsx>{`
          .vx-success-loading {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .vx-success-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(139, 92, 246, 0.3);
            border-top-color: #8b5cf6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
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
        
        .vx-success-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          color: white;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .vx-success-bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.5;
          pointer-events: none;
        }

        .vx-success-header {
          position: relative;
          z-index: 10;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          background: rgba(15, 23, 42, 0.8);
        }

        .vx-success-header-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 24px);
          display: flex;
          align-items: center;
          justify-content: center;
          height: 80px;
        }

        .vx-success-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: transform 0.3s;
          min-width: 0;
        }
        .vx-success-logo:hover { transform: scale(1.05); }

        .vx-success-logo-outer {
          position: relative;
          width: 70px;
          height: 70px;
          border-radius: 9999px;
          padding: 3px;
          background: radial-gradient(circle at 0 0, #7c3aed, #d946ef);
          box-shadow: 0 0 30px rgba(124, 58, 237, 0.6);
          flex-shrink: 0;
        }

        .vx-success-logo-glow {
          position: absolute;
          inset: -5px;
          border-radius: 9999px;
          background: radial-gradient(circle, #a855f7, transparent);
          opacity: 0.4;
          filter: blur(10px);
          pointer-events: none;
          animation: glow 2s ease-in-out infinite;
        }

        .vx-success-logo-circle {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background-color: #020817;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .vx-success-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 8px;
        }

        .vx-success-logo-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .vx-success-logo-label {
          font-size: 13px;
          color: #c4b5fd;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          white-space: nowrap;
        }

        @keyframes glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }

        .vx-success-main {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px);
        }

        .vx-success-content {
          max-width: 700px;
          width: 100%;
          text-align: center;
        }

        .vx-success-icon-wrap {
          margin-bottom: 32px;
          animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .vx-success-icon-outer {
          width: 120px;
          height: 120px;
          margin: 0 auto;
          position: relative;
        }

        .vx-success-icon-circle {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 60px rgba(34, 197, 94, 0.5);
          position: relative;
          animation: pulse-success 2s ease-in-out infinite;
        }

        .vx-success-icon-glow {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.6), transparent);
          filter: blur(20px);
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes pulse-success {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.9; }
        }

        .vx-success-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 20px;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.4);
          margin-bottom: 24px;
          font-size: 12px;
          font-weight: 700;
          color: #4ade80;
          letter-spacing: 0.05em;
          animation: slide-up 0.8s ease-out 0.2s both;
        }

        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .vx-success-title {
          font-size: clamp(36px, 8vw, 56px);
          font-weight: 900;
          margin-bottom: 16px;
          line-height: 1.2;
          letter-spacing: -0.02em;
          animation: slide-up 0.8s ease-out 0.3s both;
        }

        .vx-success-title-gradient {
          display: inline-block;
          background: linear-gradient(90deg, #22c55e, #4ade80, #22d3ee, #4ade80, #22c55e);
          background-size: 250% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 250% center; }
        }

        .vx-success-message {
          font-size: clamp(16px, 3vw, 20px);
          color: #cbd5e1;
          max-width: 600px;
          margin: 0 auto 32px;
          line-height: 1.6;
          animation: slide-up 0.8s ease-out 0.4s both;
        }

        .vx-success-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr));
          gap: 16px;
          margin-bottom: 40px;
          animation: slide-up 0.8s ease-out 0.5s both;
        }

        .vx-success-stat {
          padding: 20px 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s;
        }

        .vx-success-stat:hover {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.4);
          transform: translateY(-4px);
        }

        .vx-success-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }

        .vx-success-stat-value {
          font-size: 28px;
          font-weight: 900;
          margin-bottom: 4px;
          background: linear-gradient(135deg, #22c55e, #4ade80);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .vx-success-stat-label {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .vx-success-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 400px;
          margin: 0 auto;
          animation: slide-up 0.8s ease-out 0.6s both;
        }

        .vx-success-btn {
          width: 100%;
          padding: 16px 24px;
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

        .vx-success-btn-primary {
          background: linear-gradient(135deg, #8b5cf6, #d946ef);
          color: white;
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
        }

        .vx-success-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(139, 92, 246, 0.6);
        }

        .vx-success-btn-secondary {
          background: transparent;
          color: #a78bfa;
          border: 2px solid rgba(139, 92, 246, 0.5);
        }

        .vx-success-btn-secondary:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.8);
        }

        .vx-success-features {
          margin-top: 40px;
          padding: 32px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 27, 75, 0.6));
          border: 2px solid rgba(139, 92, 246, 0.3);
          backdrop-filter: blur(20px);
          animation: slide-up 0.8s ease-out 0.7s both;
        }

        .vx-success-features-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #e2e8f0;
          text-align: center;
        }

        .vx-success-features-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
          gap: 16px;
        }

        .vx-success-feature {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #cbd5e1;
        }

        .vx-success-feature-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .mobile-hide { display: none !important; }
        }

        @media (max-width: 640px) {
          .vx-success-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="vx-success-container">
        <div className="vx-success-bg-grid" />

        {/* Header */}
        <header className="vx-success-header">
          <div className="vx-success-header-inner">
            <div className="vx-success-logo" onClick={() => router.push("/")}>
              <div className="vx-success-logo-outer">
                <div className="vx-success-logo-glow" />
                <div className="vx-success-logo-circle">
                  <img src="/images/logo.png" alt="VibraXX Logo" className="vx-success-logo-img" />
                </div>
              </div>
              <div className="vx-success-logo-text mobile-hide">
                <span className="vx-success-logo-label">Live Quiz</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="vx-success-main">
          <div className="vx-success-content">
            {/* Success Icon */}
            <div className="vx-success-icon-wrap">
              <div className="vx-success-icon-outer">
                <div className="vx-success-icon-glow" />
                <div className="vx-success-icon-circle">
                  <CheckCircle2 size={60} color="white" strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* Badge */}
            <div className="vx-success-badge">
              <Sparkles size={16} />
              PAYMENT SUCCESSFUL
            </div>

            {/* Title */}
            <h1 className="vx-success-title">
              <span className="vx-success-title-gradient">Welcome to the Arena!</span>
            </h1>

            {/* Message */}
            <p className="vx-success-message">
              Your purchase was successful! Your quiz rounds have been added to your account and you're ready to compete for the <strong style={{ color: "#fbbf24" }}>£1,000 monthly prize</strong>.
            </p>

            {/* Stats */}
            <div className="vx-success-stats">
              <div className="vx-success-stat">
                <div className="vx-success-stat-icon" style={{ background: "rgba(139, 92, 246, 0.2)" }}>
                  <Gift size={20} color="#a78bfa" />
                </div>
                <div className="vx-success-stat-value">{userRounds}</div>
                <div className="vx-success-stat-label">Total Rounds</div>
              </div>

              <div className="vx-success-stat">
                <div className="vx-success-stat-icon" style={{ background: "rgba(34, 197, 94, 0.2)" }}>
                  <TrendingUp size={20} color="#4ade80" />
                </div>
                <div className="vx-success-stat-value">{purchasedRounds || "+"}</div>
                <div className="vx-success-stat-label">Just Added</div>
              </div>

              <div className="vx-success-stat">
                <div className="vx-success-stat-icon" style={{ background: "rgba(251, 191, 36, 0.2)" }}>
                  <Trophy size={20} color="#fbbf24" />
                </div>
                <div className="vx-success-stat-value">£1000</div>
                <div className="vx-success-stat-label">Prize Pool</div>
              </div>
            </div>

            {/* Actions */}
            <div className="vx-success-actions">
              <button className="vx-success-btn vx-success-btn-primary" onClick={() => router.push("/lobby")}>
                <Play size={20} />
                Start Live Quiz
                <ArrowRight size={18} />
              </button>

              <button className="vx-success-btn vx-success-btn-secondary" onClick={() => router.push("/")}>
                <Rocket size={20} />
                Go to Home
              </button>
            </div>

            {/* Features */}
            <div className="vx-success-features">
              <div className="vx-success-features-title">What's Next?</div>
              <div className="vx-success-features-list">
                <div className="vx-success-feature">
                  <div className="vx-success-feature-check">
                    <CheckCircle2 size={12} color="white" strokeWidth={3} />
                  </div>
                  Join live competitions
                </div>
                <div className="vx-success-feature">
                  <div className="vx-success-feature-check">
                    <CheckCircle2 size={12} color="white" strokeWidth={3} />
                  </div>
                  Climb the leaderboard
                </div>
                <div className="vx-success-feature">
                  <div className="vx-success-feature-check">
                    <CheckCircle2 size={12} color="white" strokeWidth={3} />
                  </div>
                  Compete for prizes
                </div>
                <div className="vx-success-feature">
                  <div className="vx-success-feature-check">
                    <CheckCircle2 size={12} color="white" strokeWidth={3} />
                  </div>
                  Track your progress
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
