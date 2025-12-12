"use client";

import { ArrowLeft, Shield, AlertCircle, CheckCircle, Scale, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function TermsPage() {
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
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(217, 70, 239, 0.1));
          border: 1px solid rgba(139, 92, 246, 0.3);
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.2), transparent 70%);
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
              Last Updated: December 11, 2025
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
                You must be at least 18 years old to use VibraXX. By accessing this platform, you confirm you are 18 or over and agree to these Terms.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>1.</span> Agreement to Terms
            </h2>
            <p>
              By accessing or using VibraXX, you agree to be bound by these Terms & Conditions, our Privacy Policy, and all applicable laws. If you do not agree, you must not use our Services.
            </p>
            <p style={{ marginTop: 16 }}>
              For information about how we handle your personal data, including data retention periods and international transfers, please see our <a href="/privacy" style={{ color: "#a78bfa", fontWeight: 600 }}>Privacy Policy</a>.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Globe style={{ width: 24, height: 24 }} />
              <span>2.</span> Geographic Restrictions - Whitelist Policy
            </h2>
            <div className="warning-box">
              <strong>Whitelist Approach - Approved Countries Only</strong>
              <p>
                VibraXX is available ONLY to residents of the countries listed below. All other countries are prohibited.
              </p>
            </div>

            <h3 className="subsection-title">Permitted Countries</h3>
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

            <div className="warning-box" style={{ marginTop: 24 }}>
              <strong>VPN & Proxy Detection Policy</strong>
              <p>
                Using VPN, proxy servers, or any method to bypass geographic restrictions is strictly prohibited. We detect VPN usage through IP address analysis and ASN (Autonomous System Number) checks against known VPN provider ranges.
                <br /><br />
                <strong style={{ color: "#fbbf24" }}>Consequences:</strong> If VPN usage is detected, your account will be immediately terminated and all prizes forfeited—even if legitimately won.
                <br /><br />
                <strong style={{ color: "#fbbf24" }}>False Positives:</strong> If you believe your account was incorrectly flagged (e.g., corporate VPN, shared network), you may appeal by contacting team@vibraxx.com with proof of residency (utility bill, government ID). Appeals are reviewed within 5 business days.
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
              <li>Reside in a permitted country (see Section 2)</li>
              <li>Have a valid Google account</li>
              <li>Provide accurate registration information</li>
              <li>Comply with all applicable laws</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>4.</span> Skill-Based Competition
            </h2>
            <div className="highlight-box">
              <strong>100% Skill-Based - Not Gambling</strong>
              <p>
                VibraXX is a knowledge-based competition platform. Success depends entirely on your knowledge, speed, and accuracy—with no element of chance. This is not gambling under UK law (Gambling Act 2005).
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>5.</span> How VibraXX Works
            </h2>
            <ul>
              <li><strong>Registration:</strong> Sign in with Google only</li>
              <li><strong>Free Practice:</strong> One free daily quiz (50 questions) - no prizes</li>
              <li><strong>Live Competitions:</strong> Purchase rounds to compete for the monthly £1000 prize</li>
              <li><strong>Frequency:</strong> Live quiz every 15 minutes (96 rounds daily)</li>
              <li><strong>Format:</strong> 50 multiple-choice questions</li>
              <li><strong>Timing:</strong> 6 seconds per question + 5 seconds for answer explanation</li>
              <li><strong>Scoring:</strong> 2 points per correct answer (100 points maximum per round)</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>6.</span> Pricing & Payment
            </h2>
            <h3 className="subsection-title">6.1 Round Prices</h3>
            <ul>
              <li><strong>Single Round:</strong> £2.00</li>
              <li><strong>35 Round Bundle:</strong> £49.00 (£1.40 per round - 30% savings)</li>
            </ul>

            <h3 className="subsection-title">6.2 Payment Processing</h3>
            <p>
              All payments are processed securely through Stripe. By purchasing, you agree to Stripe's terms. We do not store payment card details.
            </p>
            <p style={{ marginTop: 16 }}>
              <strong>Payment processing fees (approximately 1.5% + 20p per transaction) are non-refundable.</strong> These fees are charged by Stripe and deducted immediately upon transaction completion.
            </p>

            <h3 className="subsection-title">6.3 Currency</h3>
            <p>
              All prices are in British Pounds (GBP). If you pay in a different currency, your bank or payment provider handles the conversion. We are not responsible for exchange rate differences or conversion fees charged during purchase transactions.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>7.</span> Prize Pool & Distribution
            </h2>
            <h3 className="subsection-title">7.1 Monthly Prize</h3>
            <p>
              The monthly prize is <strong>£1000 (GBP)</strong>, awarded to the participant with the highest cumulative score for that calendar month.
            </p>

            <h3 className="subsection-title">7.2 Minimum Participation Threshold</h3>
            <div className="warning-box">
              <strong>3000+ Unique Paid Participants Required</strong>
              <p>
                The prize pool activates only if <strong>3000 or more unique participants who have purchased at least one paid round</strong> compete during the calendar month. This threshold covers platform operational costs including payment processing fees, infrastructure, security, and support services. If the threshold is not met, no prize is awarded and funds do not carry over to the next month.
                <br /><br />
                <strong style={{ color: "#fbbf24" }}>Clarification:</strong> "Unique paid participants" means individual users who have purchased and used at least one paid competition round during the month. Free practice rounds do not count toward this threshold.
              </p>
            </div>

            <h3 className="subsection-title">7.3 Tie-Breaking Rules</h3>
            <p>If multiple participants have the same highest cumulative score, the following tie-breaking rules apply in order:</p>
            <ol>
              <li><strong>Fewest Incorrect Answers:</strong> The participant with the fewest total wrong answers wins</li>
              <li><strong>Highest Accuracy Rate:</strong> If still tied, the participant with the highest overall accuracy percentage wins</li>
              <li><strong>Highest Average Score Per Round:</strong> If still tied, the participant with the highest average score across all rounds played wins</li>
              <li><strong>Prize Split:</strong> If all above criteria are equal, the prize is divided equally among all tied participants</li>
            </ol>

            <h3 className="subsection-title">7.4 Prize Payment Timeline</h3>
            <ul>
              <li><strong>Winner Notification:</strong> Winners are notified by email within <strong>3 business days</strong> of month-end</li>
              <li><strong>Identity Verification:</strong> Up to <strong>10 business days</strong> for document review and approval</li>
              <li><strong>Payment Processing:</strong> <strong>7 business days</strong> after verification approval</li>
              <li><strong>Maximum Total Timeline:</strong> <strong>21 calendar days</strong> from month-end to payment completion</li>
            </ul>
            <p>
              All payments are made in GBP via Stripe to your verified bank account. If you require payment in a different currency, currency conversion fees and exchange rate differences are your responsibility.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>8.</span> Winner Verification
            </h2>
            <p>To receive prize payments, winners must:</p>
            <ul>
              <li>Provide government-issued photo ID (passport or national ID card)</li>
              <li>Confirm they are 18 years or older</li>
              <li>Provide bank account details (IBAN) matching the ID name</li>
              <li>Verify their Google account matches registration details</li>
            </ul>
            <div className="warning-box">
              <strong>Identity Verification Required</strong>
              <p>
                If identity verification fails or documents do not match, the prize will not be paid. Fraudulent information results in immediate account termination and potential legal action.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>9.</span> Refund Policy
            </h2>
            <div className="warning-box">
              <strong>All Purchases Are Final</strong>
              <p>
                Quiz round purchases are for digital content that is delivered immediately upon payment. By purchasing, you expressly agree that the digital service begins immediately, and you waive your right to the 14-day cancellation period under the UK Consumer Rights Act 2015.
              </p>
            </div>
            <p>
              Refunds are available <strong>only in exceptional circumstances</strong> where VibraXX is at fault, including:
            </p>
            <ul>
              <li>Verified platform technical error preventing round usage</li>
              <li>Wrongful or duplicate payment charges</li>
              <li>Account wrongfully restricted due to our error</li>
              <li>Widespread platform outage preventing competition access</li>
              <li>Billing error (incorrect amount charged)</li>
            </ul>
            <p style={{ marginTop: 16 }}>
              For full details on refund eligibility, the request process, and processing times, see our <a href="/refunds" style={{ color: "#a78bfa", fontWeight: 600 }}>Refund Policy</a>.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>10.</span> Prohibited Conduct
            </h2>
            <p>The following activities are strictly forbidden:</p>
            <ul>
              <li>Cheating or using external assistance during quizzes</li>
              <li>Creating multiple accounts</li>
              <li>Using bots, scripts, or automated tools</li>
              <li>Sharing quiz questions or answers</li>
              <li>Account sharing or credential trading</li>
              <li>Using VPN or proxy to bypass geographic restrictions</li>
              <li>Harassment or abusive behavior</li>
              <li>Attempting to exploit or hack the platform</li>
            </ul>
            <div className="warning-box">
              <strong>Consequences of Violations</strong>
              <p>
                Violation of these rules results in immediate account termination and forfeiture of all rounds and prizes—no exceptions.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>11.</span> Technical Issues & Question Errors
            </h2>
            <h3 className="subsection-title">11.1 Question Error Policy</h3>
            <p>
              If a quiz question contains a factual error, ambiguous wording, or technical display issue that affects answer validity, the following process applies:
            </p>
            <ul>
              <li><strong>Error Validation:</strong> Errors must be reported within 24 hours of the round completion via team@vibraxx.com. Our admin team will review the question and validate the error.</li>
              <li><strong>Question Cancellation:</strong> If an error is confirmed, that specific question will be cancelled and excluded from all participants' scores for that round.</li>
              <li><strong>Score Recalculation:</strong> The round score will be recalculated based on the remaining 49 questions (maximum score becomes 98 points).</li>
              <li><strong>No Refunds:</strong> Cancelled questions do not entitle participants to refunds. The competition continues normally with adjusted scoring.</li>
            </ul>

            <h3 className="subsection-title">11.2 Technical Issues Beyond Our Control</h3>
            <p>
              We are not liable for issues caused by your internet connection, device problems, browser incompatibility, or third-party service outages (Google OAuth, Stripe, Supabase).
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>12.</span> Complaints & Disputes
            </h2>
            <p>
              Complaints must be submitted within 7 days of the incident via email to team@vibraxx.com. We will respond within 3 business days. See our Complaints Procedure for full details.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>13.</span> Limitation of Liability
            </h2>
            <p>
              <strong>Nothing in these Terms excludes liability for:</strong>
            </p>
            <ul>
              <li>Death or personal injury caused by negligence</li>
              <li>Fraud or fraudulent misrepresentation</li>
              <li>Any liability that cannot be excluded under UK law</li>
            </ul>
            <p style={{ marginTop: 16 }}>
              <strong>Subject to the above, we are not liable for:</strong>
            </p>
            <ul>
              <li>Loss of profits, revenue, or business</li>
              <li>Loss of data or business interruption</li>
              <li>Any indirect or consequential losses</li>
            </ul>
            <p style={{ marginTop: 16 }}>
              <strong>Maximum Liability:</strong> Our total liability shall not exceed the total amount you paid to us in the 12 months before the claim.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>14.</span> Intellectual Property
            </h2>
            <p>
              All content on VibraXX, including quiz questions, design, software, logos, and trademarks, is owned by or licensed to Sermin Limited and protected by UK and international intellectual property laws.
            </p>
            <p>
              You may not copy, reproduce, distribute, or create derivative works without our written permission.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>15.</span> Account Termination & Inactive Accounts
            </h2>
            <h3 className="subsection-title">15.1 Termination by VibraXX</h3>
            <p>We may suspend or terminate your account if:</p>
            <ul>
              <li>You breach these Terms</li>
              <li>We suspect fraud or illegal activity</li>
              <li>Required by law</li>
              <li>Your account meets the inactive account criteria (see below)</li>
            </ul>

            <h3 className="subsection-title">15.2 Inactive Account Policy</h3>
            <p>
              An account is considered inactive if there has been <strong>no login activity for 36 consecutive months</strong> (3 years).
            </p>
            <ul>
              <li><strong>Warning Notice:</strong> We will send an email notification to your registered address 30 days before account closure.</li>
              <li><strong>Remaining Rounds:</strong> Any unused purchased rounds will expire and will <strong>not be refunded</strong> upon account closure due to inactivity.</li>
              <li><strong>Reactivation:</strong> To prevent closure, simply log in within the 30-day warning period.</li>
            </ul>

            <h3 className="subsection-title">15.3 Voluntary Account Closure</h3>
            <p>
              You may close your account anytime by contacting team@vibraxx.com. Account closure does not affect obligations already incurred or prizes already won. Unused rounds are subject to our standard refund policy (see Section 9).
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>16.</span> Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of England and Wales. Disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
            <p style={{ marginTop: 16 }}>
              EU residents may also bring proceedings in their country of residence. Nothing in these Terms affects your statutory consumer rights.
            </p>
            <div className="highlight-box" style={{ marginTop: 24 }}>
              <strong>Your Statutory Rights</strong>
              <p>
                Nothing in these Terms limits or excludes your statutory rights where applicable. These Terms set out our commercial practices but do not override rights granted to you by law.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>17.</span> Changes to Terms
            </h2>
            <p>
              We may update these Terms from time to time. Material changes will be notified via email and prominent website notice at least 30 days in advance.
            </p>
            <p style={{ marginTop: 16 }}>
              Continued use after notification constitutes acceptance. If you disagree with changes, stop using VibraXX.
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

          <div style={{
            padding: 24,
            borderRadius: 16,
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            textAlign: "center",
            marginTop: 40
          }}>
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
            © 2025 VibraXX. Operated by Sermin Limited | Company No. 16778648
            <br />
            Registered in England & Wales | 71-75 Shelton Street, London, WC2H 9JQ, UK
          </div>
        </footer>
      </div>
    </>
  );
}
