"use client";

import { ArrowLeft, BookOpen, Target, Zap, Trophy, AlertTriangle, Shield, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function QuizRulesPage() {
  const router = useRouter();

  return (
    <>
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
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(126, 34, 206, 0.1));
          border: 1px solid rgba(168, 85, 247, 0.3);
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.2), transparent 70%);
          pointer-events: none;
        }

        .hero-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #7e22ce);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 40px rgba(168, 85, 247, 0.4);
          position: relative;
        }

        .hero-title {
          font-size: clamp(32px, 6vw, 48px);
          font-weight: 800;
          margin-bottom: 16px;
          background: linear-gradient(90deg, #a855f7, #c084fc, #7e22ce);
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
          border-color: rgba(168, 85, 247, 0.3);
        }

        @media (max-width: 768px) {
          .content-card {
            padding: 24px 20px;
          }
        }

        .section-title {
          font-size: clamp(22px, 4vw, 28px);
          font-weight: 800;
          color: #c084fc;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(168, 85, 247, 0.3);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .subsection-title {
          font-size: clamp(18px, 3vw, 22px);
          font-weight: 700;
          color: #d8b4fe;
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
          background: rgba(168, 85, 247, 0.1);
          border-left: 4px solid #a855f7;
          margin: 24px 0;
          backdrop-filter: blur(10px);
        }

        .highlight-box strong {
          color: #c084fc;
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

        .warning-box {
          padding: 24px;
          border-radius: 16px;
          background: rgba(239, 68, 68, 0.1);
          border-left: 4px solid #ef4444;
          margin: 24px 0;
          backdrop-filter: blur(10px);
        }

        .warning-box strong {
          color: #f87171;
          display: block;
          margin-bottom: 10px;
          font-size: 17px;
          font-weight: 700;
        }

        .warning-box p {
          margin: 0;
          color: #cbd5e1;
          font-size: 15px;
          line-height: 1.7;
        }

        .info-box {
          padding: 24px;
          border-radius: 16px;
          background: rgba(59, 130, 246, 0.1);
          border-left: 4px solid #3b82f6;
          margin: 24px 0;
          backdrop-filter: blur(10px);
        }

        .info-box strong {
          color: #60a5fa;
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

        .rule-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin: 24px 0;
        }

        @media (min-width: 768px) {
          .rule-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .rule-card {
          padding: 20px;
          border-radius: 12px;
          background: rgba(168, 85, 247, 0.05);
          border: 1px solid rgba(168, 85, 247, 0.2);
          transition: all 0.2s;
        }

        .rule-card:hover {
          background: rgba(168, 85, 247, 0.1);
          border-color: rgba(168, 85, 247, 0.3);
        }

        .rule-card h4 {
          font-size: 16px;
          font-weight: 700;
          color: #c084fc;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rule-card p {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
          line-height: 1.6;
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
                  Rules
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
              <BookOpen style={{ width: 40, height: 40, color: "white" }} />
            </div>
            <h1 className="hero-title animate-shimmer">Quiz Competition Rules</h1>
            <p className="hero-subtitle">
              Official rules and guidelines for fair play on VibraXX
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Target style={{ width: 24, height: 24 }} />
              <span>1. Competition Format</span>
            </h2>

            <div className="rule-grid">
              <div className="rule-card">
                <h4>
                  <Zap style={{ width: 18, height: 18 }} />
                  Frequency
                </h4>
                <p>New live quiz every 15 minutes, 24/7 (96 rounds daily)</p>
              </div>
              <div className="rule-card">
                <h4>
                  <Target style={{ width: 18, height: 18 }} />
                  Questions
                </h4>
                <p>50 multiple-choice questions per round</p>
              </div>
              <div className="rule-card">
                <h4>
                  <Zap style={{ width: 18, height: 18 }} />
                  Answer Time
                </h4>
                <p>6 seconds per question to select your answer</p>
              </div>
              <div className="rule-card">
                <h4>
                  <BookOpen style={{ width: 18, height: 18 }} />
                  Explanation
                </h4>
                <p>5-second explanation after each answer</p>
              </div>
            </div>

            <h3 className="subsection-title">Question Types</h3>
            <p>All questions are multiple-choice with four possible answers (A, B, C, D). Only one answer is correct.</p>

            <h3 className="subsection-title">Topics Covered</h3>
            <ul>
              <li>General Knowledge</li>
              <li>History and Geography</li>
              <li>Science and Technology</li>
              <li>Current Affairs</li>
              <li>Arts and Entertainment</li>
              <li>Sports and Games</li>
              <li>Mathematics and Logic</li>
              <li>Language and Literature</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Trophy style={{ width: 24, height: 24 }} />
              <span>2. Scoring System</span>
            </h2>

            <div className="highlight-box">
              <strong>Points Per Question</strong>
              <p>
                Each correct answer earns exactly 2 points. Wrong answers or no answer earn 0 points. There are no negative points.
              </p>
            </div>

            <h3 className="subsection-title">Maximum Score</h3>
            <p>
              With 50 questions per round and 2 points per correct answer, the maximum possible score per round is <strong>100 points</strong>.
            </p>

            <h3 className="subsection-title">Monthly Accumulation</h3>
            <ul>
              <li>Your monthly score is the sum of all your round scores</li>
              <li>Play as many rounds as you want to increase your total</li>
              <li>No limit on number of rounds you can play per month</li>
              <li>Scores reset at the start of each calendar month (00:00 GMT on the 1st)</li>
            </ul>

            <h3 className="subsection-title">No Bonus Points</h3>
            <p>
              There are no bonus points for speed, consecutive correct answers, or difficulty. Every correct answer is worth exactly 2 points.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>3. Entry Requirements</span>
            </h2>

            <h3 className="subsection-title">Before Each Round</h3>
            <ol>
              <li>You must have at least one unused round in your account</li>
              <li>Join the lobby before the countdown reaches zero</li>
              <li>Confirm your 18+ age verification (first time only)</li>
              <li>Ensure stable internet connection</li>
            </ol>

            <h3 className="subsection-title">Entry Cutoff</h3>
            <div className="warning-box">
              <strong>No Late Entry</strong>
              <p>
                Once a quiz begins, entry is locked. Even if you're one second late, you cannot join. You must wait for the next round in 15 minutes.
              </p>
            </div>

            <h3 className="subsection-title">Round Consumption</h3>
            <p>
              One round is consumed from your account when you join a quiz. This happens immediately when the quiz starts, not when you join the lobby.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>4. During the Quiz</span>
            </h2>

            <h3 className="subsection-title">Answer Selection</h3>
            <ul>
              <li>Click or tap your chosen answer (A, B, C, or D) within 6 seconds</li>
              <li>Your selection is immediately locked—you cannot change it</li>
              <li>If time runs out, it counts as no answer (0 points)</li>
              <li>You cannot pause, replay, or skip questions</li>
            </ul>

            <h3 className="subsection-title">No Assistance Allowed</h3>
            <div className="warning-box">
              <strong>Solo Competition Only</strong>
              <p>
                You must answer all questions alone without ANY external help. This includes:
              </p>
            </div>
            <ul style={{ marginTop: 16 }}>
              <li>Search engines (Google, Bing, etc.)</li>
              <li>Other websites or apps</li>
              <li>Books, notes, or reference materials</li>
              <li>Friends, family, or other people</li>
              <li>AI assistants or chatbots</li>
              <li>Calculator apps (except for mental math)</li>
            </ul>

            <h3 className="subsection-title">Screen Recording</h3>
            <p>
              VibraXX may record quiz sessions for quality assurance and cheating prevention. By participating, you consent to this recording.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>5. Fair Play Rules</span>
            </h2>

            <div className="rule-grid">
              <div className="rule-card">
                <h4>
                  <CheckCircle style={{ width: 18, height: 18 }} />
                  Allowed
                </h4>
                <p>Using your own knowledge, memory, and reasoning skills</p>
              </div>
              <div className="rule-card">
                <h4>
                  <AlertTriangle style={{ width: 18, height: 18 }} />
                  Forbidden
                </h4>
                <p>Any external assistance, tools, or help from others</p>
              </div>
              <div className="rule-card">
                <h4>
                  <CheckCircle style={{ width: 18, height: 18 }} />
                  Allowed
                </h4>
                <p>Playing on any device (phone, tablet, computer)</p>
              </div>
              <div className="rule-card">
                <h4>
                  <AlertTriangle style={{ width: 18, height: 18 }} />
                  Forbidden
                </h4>
                <p>Using multiple devices simultaneously</p>
              </div>
              <div className="rule-card">
                <h4>
                  <CheckCircle style={{ width: 18, height: 18 }} />
                  Allowed
                </h4>
                <p>Playing multiple rounds to increase your score</p>
              </div>
              <div className="rule-card">
                <h4>
                  <AlertTriangle style={{ width: 18, height: 18 }} />
                  Forbidden
                </h4>
                <p>Creating multiple accounts</p>
              </div>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>6. Prohibited Conduct</span>
            </h2>

            <p>The following activities result in immediate account termination and prize forfeiture:</p>

            <ul>
              <li><strong>Cheating:</strong> Using any external help or resources</li>
              <li><strong>Multiple Accounts:</strong> Creating or using more than one account</li>
              <li><strong>Bots or Scripts:</strong> Using automated tools to answer questions</li>
              <li><strong>Sharing Answers:</strong> Communicating questions or answers to others</li>
              <li><strong>Account Sharing:</strong> Letting someone else use your account</li>
              <li><strong>VPN Usage:</strong> Using VPN to bypass geographic restrictions</li>
              <li><strong>Exploitation:</strong> Attempting to exploit bugs or glitches</li>
              <li><strong>Collusion:</strong> Coordinating with other players unfairly</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>7. Technical Issues</span>
            </h2>

            <h3 className="subsection-title">Question Errors</h3>
            <p>
              If a question contains a factual error, typo, or technical problem, that specific question will be cancelled and removed from scoring for all participants in that round.
            </p>

            <h3 className="subsection-title">Connection Problems</h3>
            <div className="info-box">
              <strong>Your Responsibility</strong>
              <p>
                You are responsible for maintaining a stable internet connection. We cannot refund rounds or replay quizzes due to your connection issues.
              </p>
            </div>

            <h3 className="subsection-title">Platform Errors</h3>
            <p>
              If VibraXX experiences a technical fault (server crash, widespread bug), we may:
            </p>
            <ul>
              <li>Cancel the affected round and refund entry fees</li>
              <li>Exclude the round from scoring</li>
              <li>Provide replacement rounds</li>
            </ul>

            <h3 className="subsection-title">Reporting Issues</h3>
            <p>
              Report technical problems to team@vibraxx.com within 7 days with:
            </p>
            <ul>
              <li>Your account email</li>
              <li>Date and time of the round</li>
              <li>Detailed description of the issue</li>
              <li>Screenshots or video if possible</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Shield style={{ width: 24, height: 24 }} />
              <span>8. Cheating Detection</span>
            </h2>

            <p>We employ multiple methods to detect and prevent cheating:</p>

            <ul>
              <li>Answer pattern analysis (impossibly fast or accurate answers)</li>
              <li>Device and browser fingerprinting</li>
              <li>IP address monitoring</li>
              <li>Timing analysis (detecting tab switches)</li>
              <li>Statistical anomaly detection</li>
              <li>Manual review of suspicious activity</li>
            </ul>

            <div className="warning-box">
              <strong>Zero Tolerance Policy</strong>
              <p>
                We have zero tolerance for cheating. If caught, your account will be permanently banned, all prizes forfeited, and you may be prohibited from creating new accounts. In cases of fraud, we may pursue legal action.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>9. Winning the Monthly Prize</span>
            </h2>

            <h3 className="subsection-title">Determining the Winner</h3>
            <ol>
              <li>The participant with the highest cumulative score wins</li>
              <li>If tied, the participant with fewer incorrect answers wins</li>
              <li>If still tied, the prize is divided equally</li>
            </ol>

            <h3 className="subsection-title">Eligibility Requirements</h3>
            <p>To be eligible for the monthly prize, you must:</p>
            <ul>
              <li>Be 18 years or older</li>
              <li>Reside in an approved country</li>
              <li>Have a verified account</li>
              <li>Have followed all competition rules</li>
              <li>Provide valid ID and bank details</li>
            </ul>

            <h3 className="subsection-title">Threshold Requirement</h3>
            <div className="info-box">
              <strong>3000+ Participants Needed</strong>
              <p>
                Remember: The £1000 prize is only awarded if 3000 or more unique participants compete during the month. If this threshold is not reached, all entry fees are refunded.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>10. Rule Changes</span>
            </h2>
            <p>
              We may update these rules from time to time. Changes will be announced via:
            </p>
            <ul>
              <li>Email notification to all registered users</li>
              <li>Banner notice on the website</li>
              <li>In-app notification</li>
            </ul>
            <p style={{ marginTop: 16 }}>
              Continued participation after rule changes constitutes acceptance. Material changes affecting scoring or prizes will be announced at least 7 days in advance.
            </p>
          </div>

          <div style={{
            padding: 24,
            borderRadius: 16,
            background: "rgba(168, 85, 247, 0.1)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            textAlign: "center",
            marginTop: 40
          }}>
            <Shield style={{ width: 28, height: 28, color: "#c084fc", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, color: "#cbd5e1", margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: "#c084fc" }}>Fair Play Commitment</strong>
              <br />
              By following these rules, you ensure a fair and enjoyable competition for everyone. Good luck!
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