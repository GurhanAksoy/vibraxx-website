"use client";

import { ArrowLeft, Play, Trophy, Zap, Users, Clock, Target, Gift, CheckCircle, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HowItWorksPage() {
  const router = useRouter();

  return (
    <>
      {/* ⚡ CRITICAL CSS - Prevents layout shift during hydration */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          color-scheme: dark;
          background-color: #020817;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          background-color: #020817 !important;
          color: white !important;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
          line-height: 1.7 !important;
          overflow-x: hidden !important;
        }
        .legal-page {
          min-height: 100vh;
          background: #020817;
          position: relative;
          overflow-x: hidden;
          contain: layout style paint;
        }
        .content-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px 80px;
        }
      `}} />

      <style jsx global>{`
        :root {
          color-scheme: dark;
          background-color: #020817;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background-color: #020817;
          color: white;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.7;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
          will-change: transform;
        }

        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }

        .legal-page {
          min-height: 100vh;
          background: #020817;
          position: relative;
          overflow-x: hidden;
        }

        .neon-orb-1 {
          position: fixed;
          top: 60px;
          left: -40px;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: #7c3aed;
          opacity: 0.28;
          filter: blur(70px);
          z-index: 0;
          pointer-events: none;
        }

        .neon-orb-2 {
          position: fixed;
          bottom: 40px;
          right: -40px;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: #d946ef;
          opacity: 0.22;
          filter: blur(70px);
          z-index: 0;
          animation-delay: 2s;
          pointer-events: none;
        }

        .vx-header {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          background: rgba(15, 23, 42, 0.92);
        }

        .vx-header-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 80px;
          gap: 16px;
        }

        @media (max-width: 639px) {
          .vx-header-inner {
            height: auto;
            padding: 12px 16px;
            flex-wrap: wrap;
          }
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .logo-wrapper {
          position: relative;
          width: 50px;
          height: 50px;
          border-radius: 9999px;
          padding: 2px;
          background: radial-gradient(circle at 0 0, #7c3aed, #d946ef);
          box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
        }

        .logo-inner {
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

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 253, 0.3);
          background: rgba(9, 9, 13, 0.9);
          color: #94a3b8;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-button:hover {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.5);
          color: #a78bfa;
          transform: translateX(-3px);
        }

        @media (max-width: 639px) {
          .back-button {
            padding: 8px 16px;
            font-size: 13px;
          }
        }

        .content-wrapper {
          position: relative;
          z-index: 1;
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px 80px;
        }

        @media (max-width: 768px) {
          .content-wrapper {
            padding: 24px 16px 60px;
          }
        }

        .hero-section {
          text-align: center;
          margin-bottom: 48px;
          padding: 48px 24px;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1));
          border: 1px solid rgba(251, 191, 36, 0.3);
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.2), transparent 70%);
          pointer-events: none;
        }

        .hero-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 40px rgba(251, 191, 36, 0.4);
          position: relative;
        }

        .hero-title {
          font-size: clamp(32px, 6vw, 48px);
          font-weight: 800;
          margin-bottom: 16px;
          background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: 16px;
          color: #94a3b8;
          margin-bottom: 24px;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 32px 20px;
            margin-bottom: 32px;
          }

          .hero-icon {
            width: 64px;
            height: 64px;
            margin-bottom: 20px;
          }
        }

        .content-card {
          background: rgba(9, 9, 13, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 36px;
          margin-bottom: 24px;
          backdrop-filter: blur(18px);
          transition: transform 0.3s, border-color 0.3s;
        }

        .content-card:hover {
          transform: translateY(-2px);
          border-color: rgba(251, 191, 36, 0.3);
        }

        @media (max-width: 768px) {
          .content-card {
            padding: 24px 20px;
          }
        }

        .section-title {
          font-size: clamp(22px, 4vw, 28px);
          font-weight: 800;
          color: #fbbf24;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(251, 191, 36, 0.3);
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .subsection-title {
          font-size: clamp(18px, 3vw, 22px);
          font-weight: 700;
          color: #fcd34d;
          margin: 28px 0 16px;
        }

        .content-card p {
          color: #cbd5e1;
          font-size: 15px;
          margin-bottom: 16px;
          line-height: 1.8;
        }

        .content-card ul,
        .content-card ol {
          margin: 16px 0 16px 24px;
          color: #cbd5e1;
        }

        .content-card li {
          margin-bottom: 12px;
          font-size: 15px;
          line-height: 1.8;
          padding-left: 8px;
        }

        .content-card strong {
          color: white;
          font-weight: 700;
        }

        .highlight-box {
          padding: 24px;
          border-radius: 16px;
          background: rgba(251, 191, 36, 0.1);
          border-left: 4px solid #fbbf24;
          margin: 24px 0;
          backdrop-filter: blur(10px);
        }

        .highlight-box strong {
          color: #fbbf24;
          display: block;
          margin-bottom: 10px;
          font-size: 17px;
          font-weight: 700;
        }

        .highlight-box p {
          margin: 0;
          color: #cbd5e1;
          font-size: 15px;
          line-height: 1.7;
        }

        .info-box {
          padding: 24px;
          border-radius: 16px;
          background: rgba(139, 92, 246, 0.1);
          border-left: 4px solid #7c3aed;
          margin: 24px 0;
          backdrop-filter: blur(10px);
        }

        .info-box strong {
          color: #a78bfa;
          display: block;
          margin-bottom: 10px;
          font-size: 17px;
          font-weight: 700;
        }

        .info-box p {
          margin: 0;
          color: #cbd5e1;
          font-size: 15px;
          line-height: 1.7;
        }

        .step-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin: 24px 0;
        }

        @media (min-width: 640px) {
          .step-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .step-card {
          padding: 24px;
          border-radius: 16px;
          background: rgba(251, 191, 36, 0.05);
          border: 1px solid rgba(251, 191, 36, 0.2);
          transition: all 0.3s;
        }

        .step-card:hover {
          background: rgba(251, 191, 36, 0.1);
          border-color: rgba(251, 191, 36, 0.4);
          transform: translateY(-4px);
        }

        @media (max-width: 640px) {
          .step-card {
            padding: 20px;
          }
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 800;
          color: white;
          margin-bottom: 16px;
        }

        .step-title {
          font-size: 18px;
          font-weight: 700;
          color: #fbbf24;
          margin-bottom: 8px;
        }

        @media (max-width: 640px) {
          .step-title {
            font-size: 16px;
          }
        }

        .step-description {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.7;
          margin: 0;
        }

        @media (max-width: 640px) {
          .step-description {
            font-size: 13px;
          }
        }

        .stat-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin: 24px 0;
        }

        @media (min-width: 640px) {
          .stat-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 768px) {
          .stat-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .stat-card {
          padding: 20px;
          border-radius: 12px;
          background: rgba(139, 92, 246, 0.05);
          border: 1px solid rgba(139, 92, 246, 0.2);
          text-align: center;
        }

        @media (max-width: 640px) {
          .stat-card {
            padding: 16px;
          }
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: #a78bfa;
          margin-bottom: 8px;
        }

        @media (max-width: 640px) {
          .stat-value {
            font-size: 28px;
          }
        }

        .stat-label {
          font-size: 14px;
          color: #94a3b8;
        }

        @media (max-width: 640px) {
          .stat-label {
            font-size: 13px;
          }
        }

        .vx-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(9, 9, 13, 0.96);
          backdrop-filter: blur(16px);
          padding: 40px 24px 28px;
          text-align: center;
          color: #64748b;
          font-size: 13px;
          position: relative;
          z-index: 1;
        }

        .vx-footer-links {
          margin: 16px 0 20px;
          display: flex;
          gap: 8px 20px;
          justify-content: center;
          flex-wrap: wrap;
          align-items: center;
        }

        .vx-footer-divider {
          width: 1px;
          height: 14px;
          background: rgba(255, 255, 255, 0.2);
        }

        .vx-footer-links a {
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.2s;
          font-size: 12px;
        }

        .vx-footer-links a:hover {
          color: #c4b5fd;
        }

        @media (max-width: 768px) {
          .vx-footer {
            padding: 32px 16px 24px;
            font-size: 12px;
          }
        }
      `}</style>

      <div className="legal-page">
        <div className="neon-orb-1 animate-float" />
        <div className="neon-orb-2 animate-float" />

        <header className="vx-header">
          <div className="vx-header-inner">
            <div className="logo-section">
              <div className="logo-wrapper">
                <div className="logo-inner">
                  <Image
                    src="/images/logo.png"
                    alt="VibraXX"
                    width={46}
                    height={46}
                    priority
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span
                  style={{
                    fontSize: 13,
                    color: "#c4b5fd",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    whiteSpace: "nowrap",
                  }}
                >
                  Guide
                </span>
              </div>
            </div>

            <button onClick={() => router.push("/")} className="back-button">
              <ArrowLeft style={{ width: 18, height: 18 }} />
              Back to Home
            </button>
          </div>
        </header>

        <div className="content-wrapper">
          <div className="hero-section">
            <div className="hero-icon">
              <Play style={{ width: 40, height: 40, color: "white" }} />
            </div>
            <h1 className="hero-title animate-shimmer">How VibraXX Works</h1>
            <p className="hero-subtitle">
              Everything you need to know about competing in the world's most exciting live quiz arena
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Target style={{ width: 24, height: 24 }} />
              <span>What is VibraXX?</span>
            </h2>
            <p>
              VibraXX is a global live quiz competition platform where knowledge meets speed. Compete against players from around the world in real-time quiz battles, test your knowledge across diverse topics, and win real prizes.
            </p>
            <div className="highlight-box">
              <strong>100% Skill-Based Competition</strong>
              <p>
                Success depends entirely on your knowledge, quick thinking, and accuracy. There is no luck or chance involved—just pure skill.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Zap style={{ width: 24, height: 24 }} />
              <span>Getting Started - 6 Simple Steps</span>
            </h2>

            <div className="step-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="step-title">Sign In with Google</div>
                <p className="step-description">
                  Quick and secure registration using your Google account. No passwords to remember.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">2</div>
                <div className="step-title">Try Free Practice Quiz</div>
                <p className="step-description">
                  Get one free daily quiz (20 questions) to practice. No prizes, just pure learning.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">3</div>
                <div className="step-title">Purchase Rounds</div>
                <p className="step-description">
                  Buy quiz rounds: £2.00 per round or save 18% with the 30-round bundle for £49.00.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">4</div>
                <div className="step-title">Join the Lobby</div>
                <p className="step-description">
                  Enter the live quiz lobby. New competitions start every 15 minutes.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">5</div>
                <div className="step-title">Compete & Score</div>
                <p className="step-description">
                  Answer 20 questions in 6 seconds each. Every correct answer earns 5 points.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">6</div>
                <div className="step-title">Win Prizes</div>
                <p className="step-description">
                  Top scorer for the month wins £1000. Accumulate points across all your rounds.
                </p>
              </div>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Clock style={{ width: 24, height: 24 }} />
              <span>Live Quiz Format</span>
            </h2>

            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-value">15min</div>
                <div className="stat-label">Between Rounds</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">20</div>
                <div className="stat-label">Questions Per Round</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">6sec</div>
                <div className="stat-label">Per Question</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">6sec</div>
                <div className="stat-label">Answer Explanation</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">5pts</div>
                <div className="stat-label">Per Correct Answer</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">100pts</div>
                <div className="stat-label">Maximum Per Round</div>
              </div>
            </div>

            <h3 className="subsection-title">How Each Round Works</h3>
            <ol>
              <li><strong>Lobby Countdown:</strong> Wait in the lobby for the next round to start</li>
              <li><strong>Competition Begins:</strong> Late arrivals must wait for the next round.</li>
              <li><strong>Question Appears:</strong> Read and select your answer within 6 seconds</li>
              <li><strong>Answer Revealed:</strong> See if you were correct with a 6-second explanation</li>
              <li><strong>Next Question:</strong> Automatically moves to the next question</li>
              <li><strong>Scorecard:</strong> After 20 questions, view your performance</li>
              <li><strong>Back to Lobby:</strong> Return to lobby if you have rounds remaining</li>
            </ol>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Trophy style={{ width: 24, height: 24 }} />
              <span>Prize System</span>
            </h2>

            <div className="highlight-box">
              <strong>Monthly Prize: £1000</strong>
              <p>
                The participant with the highest cumulative score for the calendar month wins £1000 (GBP).
              </p>
            </div>

            <h3 className="subsection-title">How Scoring Works</h3>
            <ul>
              <li><strong>Accumulation:</strong> Your score accumulates across all rounds you play in a month</li>
              <li><strong>Multiple Rounds:</strong> Play as many rounds as you want to increase your total score</li>
              <li><strong>Leaderboard:</strong> Track your position in real-time</li>
              <li><strong>Monthly Reset:</strong> Scores reset at the start of each calendar month</li>
            </ul>

            <h3 className="subsection-title">Important Threshold</h3>
            <div className="info-box">
              <strong>3000+ Paid Round Purchases Required</strong>
              <p>
               The £1000 prize pool activates only when a minimum of 3000 paid round purchases are completed during the calendar month. The number of individual participants is not relevant, as long as the total number of paid round purchases reaches this threshold. This threshold covers platform operational costs including payment processing fees, infrastructure, security, and support services.
                <br /><br />
                <strong style={{ color: "#a78bfa" }}>If the threshold is not met:</strong> No prize is awarded and funds do not carry over to the next month. Entry fees are not refunded as the platform service (quiz participation, scoring, leaderboards) has been provided.
              </p>
            </div>

            <h3 className="subsection-title">Tie-Breaking</h3>
            <p>If multiple players have the same top score:</p>
            <ol>
              <li><strong>Fewest Incorrect Answers:</strong> The player with fewer wrong answers wins</li>
              <li><strong>Highest Accuracy Rate:</strong> If still tied, highest overall accuracy percentage wins</li>
              <li><strong>Highest Average Score Per Round:</strong> If still tied, highest average score wins</li>
              <li><strong>Prize Split:</strong> If all criteria are equal, the prize is divided equally</li>
            </ol>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <DollarSign style={{ width: 24, height: 24 }} />
              <span>Pricing Options</span>
            </h2>

            <div className="step-grid">
              <div className="step-card">
                <div style={{
                  fontSize: 14,
                  color: "#94a3b8",
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  Single Round
                </div>
                <div style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: "#fbbf24",
                  marginBottom: 8
                }}>
                  £2.00
                </div>
                <p className="step-description">
                  Perfect for trying out the competition. One round, one chance to compete.
                </p>
              </div>

              <div className="step-card">
                <div style={{
                  fontSize: 14,
                  color: "#94a3b8",
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  Value Pack
                </div>
                <div style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: "#fbbf24",
                  marginBottom: 8
                }}>
                  £49.00
                </div>
                <p className="step-description">
                  30 rounds - Save 18%. Best value for serious competitors.
                </p>
              </div>
            </div>

            <div className="info-box" style={{ marginTop: 24 }}>
              <strong>Secure Payment via Stripe</strong>
              <p>
                All payments are processed securely through Stripe. We never store your card details. Payments are in GBP—your bank handles currency conversion if needed.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Gift style={{ width: 24, height: 24 }} />
              <span>Free Daily Practice</span>
            </h2>
            <p>
              Every registered user gets one free practice quiz daily. This helps you:
            </p>
            <ul>
              <li>Learn the quiz format without spending money</li>
              <li>Practice your speed and accuracy</li>
              <li>Discover your strengths and weaknesses</li>
              <li>Build confidence before competing for prizes</li>
            </ul>
            <div className="info-box">
              <strong>Free Quiz = Practice Only</strong>
              <p>
                Free quizzes are for practice only and have no impact on rankings, rewards, or prize eligibility.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Users style={{ width: 24, height: 24 }} />
              <span>Global Competition</span>
            </h2>
            <p>
              VibraXX brings together knowledge enthusiasts from around the world. Compete against players from 40+ countries in synchronized live quizzes.
            </p>

            <h3 className="subsection-title">Live Broadcasts</h3>
            <p>
              Watch live quiz action 24/7 on our YouTube channel. See questions, explanations, and leaderboard updates in real-time—even if you're not competing.
            </p>

            <h3 className="subsection-title">Community Features</h3>
            <ul>
              <li>Real-time leaderboard rankings</li>
              <li>Monthly champion hall of fame</li>
              <li>Performance statistics and history</li>
              <li>YouTube live broadcast viewing</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <CheckCircle style={{ width: 24, height: 24 }} />
              <span>Important Rules</span>
            </h2>
            <ul>
              <li><strong>Age Requirement:</strong> Must be 18 years or older</li>
              <li><strong>One Account:</strong> Only one account per person</li>
              <li><strong>No Cheating:</strong> External help or tools are forbidden</li>
              <li><strong>Fair Play:</strong> Automated tools, bots, or scripts result in immediate ban</li>
              <li><strong>Geographic Restrictions:</strong> Only permitted countries can participate</li>
              <li><strong>VPN Prohibited:</strong> Using VPN to bypass restrictions forfeits any prizes</li>
            </ul>
          </div>

          <div style={{
            padding: 24,
            borderRadius: 16,
            background: "rgba(251, 191, 36, 0.1)",
            border: "1px solid rgba(251, 191, 36, 0.3)",
            textAlign: "center",
            marginTop: 40
          }}>
            <Trophy style={{ width: 28, height: 28, color: "#fbbf24", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, color: "#cbd5e1", margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: "#fbbf24" }}>Ready to Compete?</strong>
              <br />
              Join thousands of players worldwide in the ultimate test of knowledge and speed. Sign in with Google and start your journey to becoming a VibraXX champion!
            </p>
          </div>
        </div>

        <footer className="vx-footer">
          <div className="vx-footer-links">
            <a href="/privacy">Privacy Policy</a>
            <span className="vx-footer-divider" />
            <a href="/terms">Terms & Conditions</a>
            <span className="vx-footer-divider" />
            <a href="/cookies">Cookie Policy</a>
            <span className="vx-footer-divider" />
            <a href="/how-it-works">How It Works</a>
            <span className="vx-footer-divider" />
            <a href="/rules">Quiz Rules</a>
            <span className="vx-footer-divider" />
            <a href="/complaints">Complaints</a>
            <span className="vx-footer-divider" />
            <a href="/refunds">Refund Policy</a>
            <span className="vx-footer-divider" />
            <a href="/about">About Us</a>
            <span className="vx-footer-divider" />
            <a href="/contact">Contact</a>
            <span className="vx-footer-divider" />
            <a href="/faq">FAQ</a>
          </div>
          <div style={{ marginTop: 20, fontSize: 12, color: "#64748b" }}>
            © 2025 VibraXX. Operated by Sermin Limited | Company No. 16778648
            <br />
            Registered in England & Wales | 71-75 Shelton Street, London, WC2H 9JQ, UK
          </div>
        </footer>
      </div>
    </>
  );
}
