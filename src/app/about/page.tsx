"use client";

import { ArrowLeft, Info, Globe, Trophy, Zap, Users, Target, Shield, Clock, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AboutPage() {
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
          background: #8b5cf6;
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
          background: #a78bfa;
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
          background: radial-gradient(circle at 0 0, #8b5cf6, #a78bfa);
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
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
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(167, 139, 250, 0.1));
          border: 1px solid rgba(139, 92, 246, 0.3);
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.2), transparent 70%);
          pointer-events: none;
        }

        .hero-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #a78bfa);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 40px rgba(139, 92, 246, 0.4);
          position: relative;
        }

        .hero-title {
          font-size: clamp(32px, 6vw, 48px);
          font-weight: 800;
          margin-bottom: 16px;
          background: linear-gradient(90deg, #8b5cf6, #a78bfa, #8b5cf6);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: 18px;
          color: #cbd5e1;
          margin-bottom: 24px;
          line-height: 1.6;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
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

          .hero-subtitle {
            font-size: 16px;
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
          border-color: rgba(139, 92, 246, 0.3);
        }

        @media (max-width: 768px) {
          .content-card {
            padding: 24px 20px;
          }
        }

        .section-title {
          font-size: clamp(22px, 4vw, 28px);
          font-weight: 800;
          color: #a78bfa;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(139, 92, 246, 0.3);
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .subsection-title {
          font-size: clamp(18px, 3vw, 22px);
          font-weight: 700;
          color: #c4b5fd;
          margin: 28px 0 16px;
        }

        .content-card p {
          color: #cbd5e1;
          font-size: 15px;
          margin-bottom: 16px;
          line-height: 1.8;
        }

        .content-card ul {
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

        /* ✅ MOBILE-FIRST RESPONSIVE VALUE GRID */
        .value-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin: 24px 0;
        }

        @media (min-width: 640px) {
          .value-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .value-card {
          padding: 24px;
          border-radius: 16px;
          background: rgba(139, 92, 246, 0.05);
          border: 1px solid rgba(139, 92, 246, 0.2);
          transition: all 0.3s;
        }

        @media (max-width: 640px) {
          .value-card {
            padding: 20px;
          }
        }

        .value-card:hover {
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.4);
          transform: translateY(-4px);
        }

        .value-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #8b5cf6, #a78bfa);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .value-title {
          font-size: 18px;
          font-weight: 700;
          color: #a78bfa;
          margin-bottom: 8px;
        }

        @media (max-width: 640px) {
          .value-title {
            font-size: 16px;
          }
        }

        .value-description {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.7;
          margin: 0;
        }

        @media (max-width: 640px) {
          .value-description {
            font-size: 13px;
          }
        }

        .highlight-box {
          padding: 24px;
          border-radius: 16px;
          background: rgba(139, 92, 246, 0.1);
          border-left: 4px solid #8b5cf6;
          margin: 24px 0;
          backdrop-filter: blur(10px);
        }

        .highlight-box strong {
          color: #a78bfa;
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

        .company-info {
          padding: 32px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(167, 139, 250, 0.05));
          border: 1px solid rgba(139, 92, 246, 0.3);
          margin-top: 40px;
        }

        .company-info h3 {
          font-size: 24px;
          font-weight: 800;
          color: #a78bfa;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .info-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .info-label {
          font-size: 13px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .info-value {
          font-size: 15px;
          color: #cbd5e1;
          line-height: 1.6;
        }

        .info-value a {
          color: #a78bfa;
          text-decoration: none;
          transition: color 0.2s;
        }

        .info-value a:hover {
          color: #c4b5fd;
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

          .company-info {
            padding: 24px 20px;
          }

          .company-info h3 {
            font-size: 20px;
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
                  About
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
              <Info style={{ width: 40, height: 40, color: "white" }} />
            </div>
            <h1 className="hero-title animate-shimmer">About VibraXX</h1>
            <p className="hero-subtitle">
              The world's first 24/7 global live quiz competition platform where knowledge meets speed, skill meets reward, and players from every corner of the world compete in real-time.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Globe style={{ width: 24, height: 24 }} />
              <span>Our Vision</span>
            </h2>
            <p>
              VibraXX was created with a simple yet powerful vision: to build the world's most exciting and accessible knowledge competition platform. We believe that everyone, regardless of location or background, should have the opportunity to test their knowledge, challenge themselves, and win real prizes based purely on skill.
            </p>
            <p>
              Unlike traditional quiz shows limited to TV studios or local venues, VibraXX breaks down geographical barriers. Whether you're in London, Tokyo, New York, or Mumbai, you can compete alongside players worldwide in synchronized live quiz battles every 15 minutes, 24 hours a day, 7 days a week.
            </p>
            <div className="highlight-box">
              <strong>The Next Generation of Quiz Competitions</strong>
              <p>
                VibraXX represents the evolution of quiz competitions for the digital age—combining the excitement of live TV game shows with the accessibility of online platforms and the fairness of skill-based competition.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Target style={{ width: 24, height: 24 }} />
              <span>Our Mission</span>
            </h2>
            <p>
              Our mission is to create a fair, transparent, and exciting platform where knowledge and quick thinking are rewarded. We are committed to:
            </p>
            <ul>
              <li><strong>Pure Skill-Based Competition:</strong> Success on VibraXX depends entirely on your knowledge, accuracy, and speed—not luck or chance</li>
              <li><strong>Global Accessibility:</strong> Anyone with an internet connection can compete, making knowledge competition truly global</li>
              <li><strong>Transparency:</strong> Clear rules, visible leaderboards, and straightforward prize distribution</li>
              <li><strong>Fairness:</strong> Every player faces the same questions at the same time under identical conditions</li>
              <li><strong>Continuous Innovation:</strong> Constantly improving our platform with new features, better questions, and enhanced user experience</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Zap style={{ width: 24, height: 24 }} />
              <span>What Makes Us Different</span>
            </h2>

            <div className="value-grid">
              <div className="value-card">
                <div className="value-icon">
                  <Clock style={{ width: 24, height: 24, color: "white" }} />
                </div>
                <div className="value-title">24/7 Live Competitions</div>
                <p className="value-description">
                  New quiz rounds every 15 minutes, around the clock. No matter your timezone or schedule, there's always a competition ready for you.
                </p>
              </div>

              <div className="value-card">
                <div className="value-icon">
                  <Shield style={{ width: 24, height: 24, color: "white" }} />
                </div>
                <div className="value-title">100% Skill-Based</div>
                <p className="value-description">
                  No gambling, no luck, no random chance. Winners are determined purely by knowledge, speed, and accuracy—nothing else.
                </p>
              </div>

              <div className="value-card">
                <div className="value-icon">
                  <Globe style={{ width: 24, height: 24, color: "white" }} />
                </div>
                <div className="value-title">Global Synchronized Play</div>
                <p className="value-description">
                  Compete against players from 40+ countries in real-time. Everyone sees the same questions at the same moment.
                </p>
              </div>

              <div className="value-card">
                <div className="value-icon">
                  <Trophy style={{ width: 24, height: 24, color: "white" }} />
                </div>
                <div className="value-title">Real Cash Prizes</div>
                <p className="value-description">
                  Win £1000 every month as the top scorer. Clear rules, transparent leaderboards, and guaranteed prize distribution.
                </p>
              </div>

              <div className="value-card">
                <div className="value-icon">
                  <Users style={{ width: 24, height: 24, color: "white" }} />
                </div>
                <div className="value-title">Live Broadcasting (Coming Soon)</div>
                <p className="value-description">
                  24/7 YouTube streaming launching soon—watch live quiz action, see questions and explanations in real-time, even when you're not playing.
                </p>
              </div>

              <div className="value-card">
                <div className="value-icon">
                  <Heart style={{ width: 24, height: 24, color: "white" }} />
                </div>
                <div className="value-title">Free Practice Daily</div>
                <p className="value-description">
                  Every user gets one free practice quiz daily. Learn the format, test your skills, and build confidence before competing.
                </p>
              </div>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Shield style={{ width: 24, height: 24 }} />
              <span>Commitment to Fair Play</span>
            </h2>
            <p>
              Fair competition is the foundation of VibraXX. We take extensive measures to ensure every player has an equal and honest chance to succeed:
            </p>
            <ul>
              <li><strong>No Gambling Classification:</strong> VibraXX is a skill-based competition platform, not a gambling service, as recognized under UK law</li>
              <li><strong>Anti-Cheating Systems:</strong> Advanced monitoring to detect and prevent unfair advantages, bots, or external tools</li>
              <li><strong>One Account Rule:</strong> Strictly enforced to prevent manipulation and maintain competition integrity</li>
              <li><strong>Transparent Leaderboards:</strong> Real-time score tracking visible to all participants</li>
              <li><strong>Question Variety:</strong> Constantly refreshed question database covering diverse topics to reward well-rounded knowledge</li>
              <li><strong>Synchronized Start:</strong> No one can join mid-round, ensuring everyone starts together with the same information</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Users style={{ width: 24, height: 24 }} />
              <span>Our Community</span>
            </h2>
            <p>
              VibraXX is more than a quiz platform—it's a global community of knowledge enthusiasts. Our players come from all walks of life: students, professionals, retirees, trivia lovers, and competitive minds from over 40 countries.
            </p>
            <p>
              Join a growing global community where skill is rewarded and knowledge is celebrated. Whether you're here to win prizes, test your knowledge, or simply enjoy the thrill of competition, you're part of something special.
            </p>
            <div className="highlight-box">
              <strong>Join the Movement</strong>
              <p>
                Be part of the world's most innovative live quiz platform. Compete, learn, connect, and win. Your knowledge is your power.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Info style={{ width: 24, height: 24 }} />
              <span>Platform Evolution</span>
            </h2>
            <p>
              Launched in 2025, VibraXX represents years of development and refinement. Our platform is built on cutting-edge technology to deliver:
            </p>
            <ul>
              <li><strong>Real-Time Synchronization:</strong> Ensuring all players worldwide experience identical timing and questions</li>
              <li><strong>Robust Infrastructure:</strong> Handling thousands of concurrent players without lag or delays</li>
              <li><strong>Secure Payment Systems:</strong> Integration with Stripe for safe, reliable transactions</li>
              <li><strong>Mobile Optimization:</strong> Full functionality across all devices—desktop, tablet, and smartphone</li>
              <li><strong>AI-Powered Questions:</strong> Questions curated and generated using advanced AI technology to maintain freshness, variety, and quality</li>
              <li><strong>Live Broadcasting Capability:</strong> 24/7 YouTube streaming infrastructure ready to launch</li>
            </ul>
            <p>
              We continuously improve and expand VibraXX based on player feedback, technological advances, and emerging opportunities. Our roadmap includes new game modes, expanded prize structures, regional championships, and enhanced social features.
            </p>
          </div>

          <div className="company-info">
            <h3>
              <Shield style={{ width: 28, height: 28 }} />
              Company Information
            </h3>

            <div className="info-row">
              <span className="info-label">Operator</span>
              <span className="info-value">
                VibraXX is owned and operated by <strong>Sermin Limited</strong>, a private limited company registered in England and Wales.
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Company Number</span>
              <span className="info-value">16778648</span>
            </div>

            <div className="info-row">
              <span className="info-label">Registered Address</span>
              <span className="info-value">
                71-75 Shelton Street, Covent Garden<br />
                London, WC2H 9JQ<br />
                United Kingdom
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Contact Email</span>
              <span className="info-value">
                <a href="mailto:team@vibraxx.com">team@vibraxx.com</a> (VibraXX Platform)<br />
                <a href="mailto:contact@sermin.uk">contact@sermin.uk</a> (Sermin Limited)
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Jurisdiction</span>
              <span className="info-value">
                VibraXX operates in compliance with UK laws and regulations, including the Gambling Act 2005 classification of skill-based competitions.
              </span>
            </div>
          </div>

          <div style={{
            padding: 24,
            borderRadius: 16,
            background: "rgba(139, 92, 246, 0.1)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            textAlign: "center",
            marginTop: 40
          }}>
            <Trophy style={{ width: 28, height: 28, color: "#a78bfa", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, color: "#cbd5e1", margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: "#a78bfa" }}>Ready to Test Your Knowledge?</strong>
              <br />
              Join players worldwide in the ultimate quiz competition. Sign in with Google and start competing for £1000 monthly prizes today!
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
