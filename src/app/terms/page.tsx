"use client";

import { ArrowLeft, Shield, AlertCircle, CheckCircle, Scale, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function TermsPage() {
  const router = useRouter();

  return (
    <>
      {/* ⚡ CRITICAL CSS - Prevents layout shift during hydration */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
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
      `,
        }}
      />

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
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.7;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
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
          background: linear-gradient(
            135deg,
            rgba(139, 92, 246, 0.15),
            rgba(217, 70, 239, 0.1)
          );
          border: 1px solid rgba(139, 92, 246, 0.3);
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 50% 0%,
            rgba(124, 58, 237, 0.2),
            transparent 70%
          );
          pointer-events: none;
        }

        .hero-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #d946ef);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 40px rgba(124, 58, 237, 0.4);
          position: relative;
        }

        .hero-title {
          font-size: clamp(32px, 6vw, 48px);
          font-weight: 800;
          margin-bottom: 16px;
          background: linear-gradient(90deg, #7c3aed, #22d3ee, #d946ef);
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

        .last-updated-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 9999px;
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.3);
          font-size: 13px;
          color: #60a5fa;
          font-weight: 600;
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

        .company-info-box {
          padding: 24px;
          border-radius: 16px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          margin-bottom: 40px;
        }

        .company-info-box h3 {
          font-size: 18px;
          font-weight: 700;
          color: #a78bfa;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .company-info-box p {
          color: #cbd5e1;
          font-size: 14px;
          margin-bottom: 8px;
          line-height: 1.7;
        }

        .age-warning {
          padding: 20px 24px;
          border-radius: 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 2px solid rgba(239, 68, 68, 0.4);
          margin-bottom: 40px;
          display: flex;
          align-items: start;
          gap: 16px;
          backdrop-filter: blur(10px);
        }

        .age-warning-icon {
          width: 24px;
          height: 24px;
          color: #ef4444;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .age-warning-title {
          font-size: 18px;
          font-weight: 700;
          color: #ef4444;
          margin-bottom: 8px;
        }

        .age-warning-text {
          font-size: 15px;
          color: #cbd5e1;
          line-height: 1.7;
        }

        @media (max-width: 768px) {
          .age-warning {
            padding: 16px 18px;
            gap: 12px;
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
          background: rgba(139, 92, 246, 0.1);
          border-left: 4px solid #7c3aed;
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

        .warning-box {
          padding: 24px;
          border-radius: 16px;
          background: rgba(251, 191, 36, 0.1);
          border-left: 4px solid #fbbf24;
          margin: 24px 0;
          backdrop-filter: blur(10px);
        }

        .warning-box strong {
          color: #fbbf24;
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

        .country-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin: 20px 0;
        }

        @media (min-width: 768px) {
          .country-list {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .country-item {
          padding: 12px 16px;
          border-radius: 10px;
          background: rgba(34, 197, 94, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.2);
          font-size: 14px;
          color: #86efac;
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
                  Legal
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
              <Scale style={{ width: 40, height: 40, color: "white" }} />
            </div>
            <h1 className="hero-title animate-shimmer">Terms & Conditions</h1>
            <p className="hero-subtitle">
              Please read these terms carefully before using VibraXX
            </p>
            <div className="last-updated-badge">
              <CheckCircle style={{ width: 16, height: 16 }} />
              Last Updated: March 15, 2026
            </div>
          </div>

          <div className="company-info-box">
            <h3>
              <Shield style={{ width: 20, height: 20 }} />
              Service Provider
            </h3>
            <p>
              <strong style={{ color: "#c4b5fd" }}>Platform:</strong> VibraXX Global Live Quiz Arena
            </p>
            <p>
              <strong style={{ color: "#c4b5fd" }}>Operated By:</strong> Sermin Limited
            </p>
            <p>
              <strong style={{ color: "#c4b5fd" }}>Company Number:</strong> 16778648
            </p>
            <p>
              <strong style={{ color: "#c4b5fd" }}>Registered Office:</strong> 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom
            </p>
            <p>
              <strong style={{ color: "#c4b5fd" }}>Contact:</strong>{" "}
              <a href="mailto:team@vibraxx.com" style={{ color: "#a78bfa", textDecoration: "none" }}>
                team@vibraxx.com
              </a>
              {" | "}
              <a href="mailto:contact@sermin.uk" style={{ color: "#a78bfa", textDecoration: "none" }}>
                contact@sermin.uk
              </a>
            </p>
          </div>

          <div className="age-warning">
            <AlertCircle className="age-warning-icon" />
            <div>
              <div className="age-warning-title">18+ Age Restriction</div>
              <p className="age-warning-text">
                You must be at least 18 years old to use VibraXX. By accessing this platform, you confirm that you are 18 or over, have legal capacity to enter into a binding agreement, and agree to these Terms.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>1.</span> Agreement to Terms
            </h2>
            <p>
              By accessing or using VibraXX, you agree to be bound by these Terms & Conditions, our Privacy Policy, and all applicable laws and regulations. If you do not agree, you must not use our Services.
            </p>
            <p style={{ marginTop: 16 }}>
              For information about how we collect, use, store, and protect personal information, including retention periods and international transfers, please review our{" "}
              <a href="/privacy" style={{ color: "#a78bfa", fontWeight: 600 }}>
                Privacy Policy
              </a>
              .
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Globe style={{ width: 24, height: 24 }} />
              <span>2.</span> Geographic Restrictions - Availability by Jurisdiction
            </h2>

            <div className="warning-box">
              <strong>Availability Only Where Lawful</strong>
              <p>
                VibraXX is offered only in territories and jurisdictions where the platform is lawfully made available by us. Access or participation from any jurisdiction where use of the service would be unlawful or restricted is strictly prohibited.
              </p>
            </div>

            <h3 className="subsection-title">Currently Supported Countries</h3>

            <div className="country-list">
              <div className="country-item">🇬🇧 United Kingdom</div>
              <div className="country-item">🇹🇷 Turkey</div>
              <div className="country-item">🇮🇪 Ireland</div>
              <div className="country-item">🇩🇪 Germany</div>
              <div className="country-item">🇫🇷 France</div>
              <div className="country-item">🇳🇱 Netherlands</div>
              <div className="country-item">🇧🇪 Belgium</div>
              <div className="country-item">🇱🇺 Luxembourg</div>
              <div className="country-item">🇦🇹 Austria</div>
              <div className="country-item">🇨🇭 Switzerland</div>
              <div className="country-item">🇩🇰 Denmark</div>
              <div className="country-item">🇸🇪 Sweden</div>
              <div className="country-item">🇳🇴 Norway</div>
              <div className="country-item">🇫🇮 Finland</div>
              <div className="country-item">🇮🇸 Iceland</div>
              <div className="country-item">🇪🇸 Spain</div>
              <div className="country-item">🇵🇹 Portugal</div>
              <div className="country-item">🇮🇹 Italy</div>
              <div className="country-item">🇬🇷 Greece</div>
              <div className="country-item">🇵🇱 Poland</div>
              <div className="country-item">🇨🇿 Czech Republic</div>
              <div className="country-item">🇭🇺 Hungary</div>
              <div className="country-item">🇷🇴 Romania</div>
              <div className="country-item">🇧🇬 Bulgaria</div>
              <div className="country-item">🇭🇷 Croatia</div>
              <div className="country-item">🇸🇮 Slovenia</div>
              <div className="country-item">🇸🇰 Slovakia</div>
              <div className="country-item">🇪🇪 Estonia</div>
              <div className="country-item">🇱🇻 Latvia</div>
              <div className="country-item">🇱🇹 Lithuania</div>
              <div className="country-item">🇨🇾 Cyprus</div>
              <div className="country-item">🇲🇹 Malta</div>
              <div className="country-item">🇨🇦 Canada</div>
              <div className="country-item">🇦🇺 Australia</div>
              <div className="country-item">🇳🇿 New Zealand</div>
              <div className="country-item">🇯🇵 Japan</div>
              <div className="country-item">🇰🇷 South Korea</div>
              <div className="country-item">🇸🇬 Singapore</div>
              <div className="country-item">🇲🇽 Mexico</div>
              <div className="country-item">🇧🇷 Brazil</div>
              <div className="country-item">🇦🇷 Argentina</div>
              <div className="country-item">🇿🇦 South Africa</div>
              <div className="country-item">🇮🇳 India</div>
            </div>

            <p>
              Where United States federal, state, or local law would prohibit or restrict participation, the service is void where prohibited and must not be used. Users are solely responsible for ensuring that use of VibraXX is lawful in their location.
            </p>

            <div className="warning-box" style={{ marginTop: 24 }}>
              <strong>VPN & Proxy Detection Policy</strong>
              <p>
                Using VPNs, proxies, location-masking tools, or any method intended to bypass geographic or jurisdictional restrictions is strictly prohibited. We may use IP analysis, network intelligence, device signals, and fraud screening tools to detect such activity.
                <br />
                <br />
                <strong style={{ color: "#fbbf24" }}>Consequences:</strong> If prohibited location masking or jurisdiction bypass is detected, your account may be suspended or terminated and any promotional or prize eligibility may be cancelled.
                <br />
                <br />
                <strong style={{ color: "#fbbf24" }}>Appeals:</strong> If you believe your account was incorrectly flagged, you may contact team@vibraxx.com and we may request supporting evidence, including proof of residence or lawful location.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>3.</span> Eligibility Requirements
            </h2>
            <p>To use VibraXX, you must:</p>
            <ul>
              <li>Be at least 18 years of age</li>
              <li>Reside in or access the service only from a permitted jurisdiction</li>
              <li>Have a valid Google account</li>
              <li>Provide accurate registration information</li>
              <li>Comply with all applicable laws and these Terms</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>4.</span> Skill-Based Competition
            </h2>
            <div className="highlight-box">
              <strong>Knowledge-Based Competition (Skill-Based)</strong>
              <p>
                VibraXX is a knowledge-based global competition platform. Success depends on a player's knowledge, reasoning ability, concentration, and response speed. No random draw, betting mechanism, roulette-style mechanic, or other element of chance determines the outcome.
              </p>
              <p style={{ marginTop: 16 }}>
                VibraXX is designed and operated as a <strong>skill-based knowledge competition</strong> and not as gambling, betting, or a lottery. Under the UK Gambling Commission’s guidance on prize competitions and free draws, a competition in which success depends on knowledge or skill is treated differently from ...gambling arrangements.
              </p>
              <p style={{ marginTop: 16 }}>
                In the United States and other jurisdictions, contests and promotions are generally also subject to local rules and consumer protection requirements. Participation is void where prohibited, and users remain responsible for complying with the ...laws that apply to them.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>5.</span> How VibraXX Works
            </h2>
            <ul>
              <li><strong>Registration:</strong> Sign in with Google only.</li>
              <li><strong>Global Live Competitions:</strong> VibraXX automatically creates a new global live round every <strong>5 minutes</strong>.</li>
              <li><strong>Round Format:</strong> Each round contains <strong>15 multiple-choice questions</strong>.</li>
              <li><strong>Question Card Timing:</strong> Each question card remains on screen for <strong>9 seconds</strong>.</li>
              <li><strong>Explanation Card Timing:</strong> Each question is followed by a <strong>9-second explanation card</strong> showing the correct answer and educational explanation.</li>
              <li><strong>Final Score Card:</strong> At the end of each completed round, a final score card is displayed for approximately <strong>15 seconds</strong>.</li>
              <li><strong>Scoring:</strong> Each correct answer awards <strong>10 points</strong>.</li>
              <li><strong>Maximum Score:</strong> The maximum score for a round is <strong>150 points</strong>.</li>
              <li><strong>Educational Focus:</strong> VibraXX is designed to be both competitive and educational. The platform does not focus on trivial or ultra-simple questions; the explanation-card system is intended to help players learn while competing.</li>
            </ul>

            <div className="highlight-box">
              <strong>Live Synchronised Arena</strong>
              <p>
                VibraXX is a synchronised live global arena. Once a round goes live, late entry may be restricted or unavailable. Availability, eligibility, and access are determined by the platform rules in force at the time of the round.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>6.</span> Pricing & Payment
            </h2>

            <h3 className="subsection-title">6.1 Round Prices</h3>
            <ul>
              <li><strong>Single Round:</strong> £2.00</li>
              <li><strong>30 Round Bundle:</strong> £49.00</li>
            </ul>

            <h3 className="subsection-title">6.2 Payment Processing</h3>
            <p>
              All payments are processed securely through Stripe. By purchasing on VibraXX, you also agree to any applicable Stripe checkout, billing, payment, and fraud-screening requirements used to complete your transaction.
            </p>
            <p style={{ marginTop: 16 }}>
              VibraXX does not store full payment card details on its own systems. Stripe is a PCI-compliant payment processor and payment information is processed through Stripe’s infrastructure. Stripe states that merchants remain responsible for compliance with applicable laws, regulations, and network rules, while Stripe’s systems help reduce direct handling of sensitive card data. :contentReference[oaicite:2]{index=2}
            </p>
            <p style={{ marginTop: 16 }}>
              Payment processing fees, issuer fees, exchange-rate differences, banking charges, and similar third-party costs may apply and may be non-refundable where the charge has already been incurred by the payment network or processor.
            </p>

            <h3 className="subsection-title">6.3 Currency</h3>
            <p>
              All prices are displayed in British Pounds (GBP) unless stated otherwise. If you pay in another currency, currency conversion is handled by your payment provider or card issuer. VibraXX is not responsible for foreign exchange losses or conversion fees applied by third parties.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>7.</span> Prize Pool & Distribution
            </h2>

            <h3 className="subsection-title">7.1 Monthly Prize</h3>
            <p>
              Subject to these Terms and all eligibility checks, the monthly prize is <strong>£1000 (GBP)</strong>, awarded to the participant with the highest cumulative eligible score for the applicable calendar month.
            </p>

            <h3 className="subsection-title">7.2 Minimum Activation Threshold</h3>
            <div className="warning-box">
              <strong>999 Paid Package Sales Required</strong>
              <p>
                The monthly £1000 prize pool activates only if at least <strong>999 paid competition packages</strong> are sold during that calendar month.
                <br />
                <br />
                This threshold is intended to support the sustainability of the platform, including infrastructure expenses, hosting, platform security, fraud prevention, support operations, and payment processing costs.
                <br />
                <br />
                If the threshold is not met during a month, the monthly prize will not be activated for that month unless VibraXX expressly announces otherwise.
              </p>
            </div>

            <h3 className="subsection-title">7.3 Tie-Breaking Rules</h3>
            <p>If multiple participants have the same highest cumulative score, the following tie-breakers apply in this order:</p>
            <ol>
              <li><strong>Fewest Incorrect Answers</strong></li>
              <li><strong>Highest Accuracy Rate</strong></li>
              <li><strong>Highest Average Score Per Round</strong></li>
              <li><strong>Equal Split or Other Fair Resolution</strong>, where required by platform rules or where the prior criteria do not resolve the tie</li>
            </ol>

            <h3 className="subsection-title">7.4 Prize Payment Timeline</h3>
            <ul>
              <li><strong>Winner Notification:</strong> Usually within 3 business days after the end of the relevant month</li>
              <li><strong>Identity Verification:</strong> Timing depends on the completeness and accuracy of documents submitted</li>
              <li><strong>Payment Processing:</strong> After verification approval and compliance checks are completed</li>
            </ul>
            <p>
              Prize payments are made by VibraXX or its operator using a lawful payment method chosen by us. Stripe is used for customer purchase processing and is not responsible for prize distribution.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>8.</span> Winner Verification
            </h2>
            <p>To receive a prize, a winner may be required to:</p>
            <ul>
              <li>Provide government-issued photo identification</li>
              <li>Confirm that they are 18 or older</li>
              <li>Provide lawful and accurate payment details</li>
              <li>Verify that their account ownership and submitted information are genuine</li>
              <li>Complete any anti-fraud, anti-money laundering, sanctions, or jurisdictional checks that we reasonably require</li>
            </ul>
            <div className="warning-box">
              <strong>Identity Verification Required</strong>
              <p>
                If identity checks fail, if documents are inconsistent, if jurisdictional restrictions apply, or if fraud is suspected, a prize may be withheld, delayed, or refused.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>9.</span> Refund Policy
            </h2>
            <div className="warning-box">
              <strong>All Purchases Are Generally Final</strong>
              <p>
                Quiz round purchases and competition access are digital services supplied immediately after purchase or made available for immediate use. By completing a purchase, you expressly request immediate performance of the service.
              </p>
            </div>
            <p>
              Refunds may be considered only in limited circumstances, such as duplicate billing, clear payment processing error, or a verified platform-side fault that materially prevented use of purchased access.
            </p>
            <p style={{ marginTop: 16 }}>
              For complete details, see our{" "}
              <a href="/refunds" style={{ color: "#a78bfa", fontWeight: 600 }}>
                Refund Policy
              </a>
              .
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>10.</span> Prohibited Conduct
            </h2>
            <p>The following conduct is prohibited:</p>
            <ul>
              <li>Cheating, collusion, or external assistance during play</li>
              <li>Using bots, automation, scripts, macros, or artificial interaction tools</li>
              <li>Creating or controlling multiple accounts</li>
              <li>Sharing account access or login credentials</li>
              <li>Using VPN, proxy, or location masking to bypass restrictions</li>
              <li>Attempting to exploit vulnerabilities, latency, scoring rules, or payment flows</li>
              <li>Sharing protected quiz content, answer keys, or internal mechanics</li>
              <li>Harassment, abuse, threats, or unlawful use of the service</li>
            </ul>
            <div className="warning-box">
              <strong>Consequences of Violations</strong>
              <p>
                Violations may result in suspension, termination, voiding of scores, cancellation of prize eligibility, forfeiture of purchased benefits where allowed by law, and legal action where appropriate.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>11.</span> Technical Issues & Question Errors
            </h2>

            <h3 className="subsection-title">11.1 Question Error Policy</h3>
            <p>
              If a question contains a factual mistake, display error, material ambiguity, or other defect that affects answer validity, VibraXX may review the issue and decide an appropriate remedy.
            </p>
            <ul>
              <li><strong>Error Review:</strong> Reports should be submitted as soon as reasonably possible after the round</li>
              <li><strong>Question Cancellation:</strong> If an affected question is invalidated, it may be excluded from scoring calculations</li>
              <li><strong>Score Recalculation:</strong> If one question is cancelled from a 15-question round, the remaining maximum score may become <strong>140 points</strong></li>
              <li><strong>No Automatic Refund:</strong> Question correction or cancellation does not automatically entitle a player to a refund</li>
            </ul>

            <h3 className="subsection-title">11.2 Technical Issues Beyond Our Control</h3>
            <p>
              We are not responsible for your device failure, browser issues, connection instability, ISP issues, third-party outages, or problems caused by Google account services, payment processors, hosting providers, or infrastructure providers where the issue is outside our reasonable control.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>12.</span> Complaints & Disputes
            </h2>
            <p>
              Complaints should be submitted promptly to team@vibraxx.com. We will review complaints in good faith and respond within a reasonable period.
            </p>
            <p>
              Additional information may be requested before a complaint can be resolved.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>13.</span> Limitation of Liability
            </h2>
            <p>
              <strong>Nothing in these Terms excludes or limits liability for:</strong>
            </p>
            <ul>
              <li>Death or personal injury caused by negligence</li>
              <li>Fraud or fraudulent misrepresentation</li>
              <li>Any liability that cannot lawfully be excluded or limited</li>
            </ul>
            <p style={{ marginTop: 16 }}>
              <strong>Subject to the above, VibraXX is not liable for:</strong>
            </p>
            <ul>
              <li>Loss of profit, revenue, goodwill, opportunity, or business</li>
              <li>Indirect, incidental, or consequential losses</li>
              <li>Losses caused by events outside our reasonable control</li>
            </ul>
            <p style={{ marginTop: 16 }}>
              <strong>Maximum Liability:</strong> To the extent permitted by law, our aggregate liability to you shall not exceed the total amount paid by you to VibraXX during the 12 months preceding the event giving rise to the claim.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>14.</span> Intellectual Property
            </h2>
            <p>
              All content, software, branding, quiz material, platform design, text, graphics, databases, and related intellectual property on VibraXX are owned by or licensed to Sermin Limited and are protected by UK and international intellectual property laws.
            </p>
            <p>
              You may not copy, scrape, reproduce, republish, distribute, modify, reverse engineer, or create derivative works from the service or its content without our prior written permission, except where mandatory law allows otherwise.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>15.</span> Account Suspension, Termination & Inactive Accounts
            </h2>

            <h3 className="subsection-title">15.1 Suspension or Termination by VibraXX</h3>
            <p>We may suspend, restrict, or terminate your account if:</p>
            <ul>
              <li>You breach these Terms</li>
              <li>We suspect fraud, abuse, evasion, or unlawful activity</li>
              <li>We are required to do so by law, court order, regulator, or payment provider</li>
              <li>Your account is inactive for an extended period</li>
            </ul>

            <h3 className="subsection-title">15.2 Inactive Account Policy</h3>
            <p>
              An account may be considered inactive if there has been no login activity for 36 consecutive months.
            </p>
            <ul>
              <li><strong>Notice:</strong> We may notify you before permanent closure where practicable</li>
              <li><strong>Unused Benefits:</strong> Treatment of unused rounds or credits will be subject to the applicable product rules and refund policy</li>
              <li><strong>Reactivation:</strong> Logging in before closure may prevent the account from being closed</li>
            </ul>

            <h3 className="subsection-title">15.3 Voluntary Account Closure</h3>
            <p>
              You may request account closure by contacting team@vibraxx.com. Closing an account does not remove obligations already incurred or invalidate prior lawful verification requirements.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>16.</span> Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of England and Wales.
            </p>
            <p style={{ marginTop: 16 }}>
              Subject to mandatory consumer protection laws that may apply in your place of residence, disputes relating to these Terms or the service shall be handled by the courts of England and Wales unless another forum is required by applicable law.
            </p>
            <div className="highlight-box" style={{ marginTop: 24 }}>
              <strong>Your Statutory Rights</strong>
              <p>
                Nothing in these Terms is intended to override any mandatory consumer rights that apply to you under applicable law.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>17.</span> Changes to Terms
            </h2>
            <p>
              We may update these Terms from time to time to reflect operational, legal, security, product, or regulatory changes.
            </p>
            <p style={{ marginTop: 16 }}>
              Where required, material changes will be communicated through the website, email, or in-app notice. Continued use of VibraXX after changes take effect means you accept the revised Terms.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>18.</span> Contact Information
            </h2>
            <div className="highlight-box">
              <strong>Contact Details</strong>
              <p style={{ marginTop: 12 }}>
                <strong style={{ color: "#c4b5fd" }}>Company:</strong> Sermin Limited (T/A VibraXX)
                <br />
                <strong style={{ color: "#c4b5fd" }}>Company Number:</strong> 16778648
                <br />
                <br />
                <strong style={{ color: "#c4b5fd" }}>Registered Office:</strong>
                <br />
                71-75 Shelton Street, Covent Garden
                <br />
                London, WC2H 9JQ, United Kingdom
                <br />
                <br />
                <strong style={{ color: "#c4b5fd" }}>Email:</strong>{" "}
                <a href="mailto:team@vibraxx.com" style={{ color: "#a78bfa", fontWeight: 600 }}>
                  team@vibraxx.com
                </a>
                <br />
                <strong style={{ color: "#c4b5fd" }}>Company Email:</strong>{" "}
                <a href="mailto:contact@sermin.uk" style={{ color: "#a78bfa", fontWeight: 600 }}>
                  contact@sermin.uk
                </a>
              </p>
            </div>
          </div>

          <div
            style={{
              padding: 24,
              borderRadius: 16,
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              textAlign: "center",
              marginTop: 40,
            }}
          >
            <CheckCircle style={{ width: 28, height: 28, color: "#4ade80", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, color: "#cbd5e1", margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: "#4ade80" }}>Acceptance of Terms</strong>
              <br />
              By using VibraXX, you confirm that you have read, understood, and agree to be bound by these Terms & Conditions.
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
            © 2026 VibraXX. Operated by Sermin Limited | Company No. 16778648
            <br />
            Registered in England & Wales | 71-75 Shelton Street, London, WC2H 9JQ, UK
          </div>
        </footer>
      </div>
    </>
  );
}