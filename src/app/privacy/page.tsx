"use client";

import { ArrowLeft, Shield, Lock, Eye, Database, Globe, UserCheck, FileText, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PrivacyPage() {
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
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1));
          border: 1px solid rgba(34, 197, 94, 0.3);
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.2), transparent 70%);
          pointer-events: none;
        }

        .hero-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #22c55e);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 40px rgba(34, 197, 94, 0.4);
          position: relative;
        }

        .hero-title {
          font-size: clamp(32px, 6vw, 48px);
          font-weight: 800;
          margin-bottom: 16px;
          background: linear-gradient(90deg, #10b981, #22d3ee, #22c55e);
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

        .compliance-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          margin-top: 24px;
        }

        .compliance-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 9999px;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          font-size: 12px;
          color: #4ade80;
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

        .data-controller-box {
          padding: 24px;
          border-radius: 16px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          margin-bottom: 40px;
        }

        .data-controller-box h3 {
          font-size: 18px;
          font-weight: 700;
          color: #60a5fa;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .data-controller-box p {
          color: #cbd5e1;
          font-size: 14px;
          margin-bottom: 8px;
          line-height: 1.7;
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
          border-color: rgba(34, 197, 94, 0.3);
        }

        @media (max-width: 768px) {
          .content-card {
            padding: 24px 20px;
          }
        }

        .section-title {
          font-size: clamp(22px, 4vw, 28px);
          font-weight: 800;
          color: #4ade80;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(34, 197, 94, 0.3);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .subsection-title {
          font-size: clamp(18px, 3vw, 22px);
          font-weight: 700;
          color: #86efac;
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
          background: rgba(34, 197, 94, 0.1);
          border-left: 4px solid #22c55e;
          margin: 24px 0;
          backdrop-filter: blur(10px);
        }

        .highlight-box strong {
          color: #4ade80;
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

        .rights-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin: 24px 0;
        }

        @media (min-width: 768px) {
          .rights-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .right-card {
          padding: 20px;
          border-radius: 12px;
          background: rgba(34, 197, 94, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.2);
          transition: all 0.2s;
        }

        .right-card:hover {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
        }

        .right-card h4 {
          font-size: 16px;
          font-weight: 700;
          color: #4ade80;
          margin-bottom: 8px;
        }

        .right-card p {
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
                  Privacy Policy
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
              <Lock style={{ width: 40, height: 40, color: "white" }} />
            </div>
            <h1 className="hero-title animate-shimmer">Privacy Policy</h1>
            <p className="hero-subtitle">
              Your privacy is our priority. This policy explains how we collect, use, protect, and retain your personal data in compliance with UK and EU data protection laws.
            </p>
            <div className="compliance-badges">
              <div className="compliance-badge">
                <Shield style={{ width: 14, height: 14 }} />
                UK GDPR
              </div>
              <div className="compliance-badge">
                <Globe style={{ width: 14, height: 14 }} />
                EU GDPR
              </div>
              <div className="compliance-badge">
                <UserCheck style={{ width: 14, height: 14 }} />
                CCPA
              </div>
              <div className="compliance-badge">
                <FileText style={{ width: 14, height: 14 }} />
                PIPEDA
              </div>
            </div>
          </div>

          <div className="data-controller-box">
            <h3>
              <Database style={{ width: 20, height: 20 }} />
              Data Controller Information
            </h3>
            <p>
              <strong style={{ color: "#c4b5fd" }}>Company:</strong> Sermin Limited (trading as VibraXX)
            </p>
            <p>
              <strong style={{ color: "#c4b5fd" }}>Registered Address:</strong> 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom
            </p>
            <p>
              <strong style={{ color: "#c4b5fd" }}>Company Number:</strong> 16778648 (England & Wales)
            </p>
            <p>
              <strong style={{ color: "#c4b5fd" }}>Privacy Contact:</strong>{" "}
              <a
                href="mailto:team@vibraxx.com"
                style={{ color: "#60a5fa", textDecoration: "none" }}
              >
                team@vibraxx.com
              </a>
            </p>
            <p style={{ marginTop: 12, fontSize: 13, color: "#94a3b8" }}>
              Last Updated: December 11, 2025
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Eye style={{ width: 24, height: 24 }} />
              <span>1. Information We Collect</span>
            </h2>
            
            <h3 className="subsection-title">1.1 Personal Information</h3>
            <ul>
              <li><strong>Account Data:</strong> Full name, email address, date of birth (for age verification)</li>
              <li><strong>Authentication Data:</strong> Google OAuth credentials (managed via Supabase Auth)</li>
              <li><strong>Profile Information:</strong> Username, avatar, country/region</li>
            </ul>

            <h3 className="subsection-title">1.2 Financial Information</h3>
            <ul>
              <li><strong>Payment Data:</strong> Processed securely via Stripe (PCI-DSS Level 1 compliant). We do not store complete card details on our servers.</li>
              <li><strong>Transaction Records:</strong> Purchase history, payment amounts, timestamps</li>
              <li><strong>Prize Winnings:</strong> Details of prizes won, payout methods, tax documentation where required</li>
            </ul>

            <h3 className="subsection-title">1.3 Usage and Performance Data</h3>
            <ul>
              <li><strong>Quiz Performance:</strong> Scores, correct/incorrect answers, response times, leaderboard rankings</li>
              <li><strong>Game Logs:</strong> Session data, questions answered, timestamps, IP addresses</li>
              <li><strong>Anti-Cheat Data:</strong> Behavioral patterns, device fingerprints, anomaly detection metrics</li>
            </ul>

            <h3 className="subsection-title">1.4 Technical Data</h3>
            <ul>
              <li><strong>Device Information:</strong> Browser type, operating system, screen resolution</li>
              <li><strong>Network Data:</strong> IP address, approximate geolocation (country/city level)</li>
              <li><strong>Cookies & Identifiers:</strong> Session tokens, preference cookies (see our Cookie Policy)</li>
            </ul>

            <div className="warning-box">
              <strong>Children's Privacy</strong>
              <p>VibraXX is strictly for users aged 18+. We do not knowingly collect data from individuals under 18. If we discover that a minor has provided personal data, we will immediately delete it and terminate their account.</p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>2. Legal Basis for Processing (GDPR Article 6)</span>
            </h2>
            <p>We process your personal data based on the following lawful grounds under UK/EU GDPR:</p>
            
            <ul>
              <li><strong>Contract (Article 6(1)(b)):</strong> Processing necessary to provide quiz services, process payments, and award prizes as per our Terms & Conditions.</li>
              <li><strong>Legal Obligation (Article 6(1)(c)):</strong> Compliance with financial regulations (e.g., HMRC tax reporting), anti-money laundering laws, and data retention requirements.</li>
              <li><strong>Legitimate Interest (Article 6(1)(f)):</strong> Fraud prevention, platform security, service improvements, and marketing communications (with opt-out options).</li>
              <li><strong>Consent (Article 6(1)(a)):</strong> Where explicitly requested (e.g., marketing emails, optional analytics).</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>3. How We Use Your Data</span>
            </h2>
            
            <h3 className="subsection-title">3.1 Core Services</h3>
            <ul>
              <li>Authenticate users and manage accounts via Supabase Auth</li>
              <li>Enable participation in live quiz competitions</li>
              <li>Calculate scores, generate leaderboards, and determine winners</li>
              <li>Process payments for round purchases and distribute prize winnings</li>
            </ul>

            <h3 className="subsection-title">3.2 Security & Fraud Prevention</h3>
            <ul>
              <li>Detect and prevent cheating, multi-accounting, and automated bots</li>
              <li>Monitor for suspicious payment activity and account abuse</li>
              <li>Enforce age restrictions (18+ requirement) through automated checks</li>
            </ul>

            <h3 className="subsection-title">3.3 Communications</h3>
            <ul>
              <li>Send transactional emails via Zoho Mail (purchase confirmations, password resets, prize notifications)</li>
              <li>Deliver platform updates and important service announcements</li>
              <li>Provide customer support responses to user inquiries</li>
            </ul>

            <h3 className="subsection-title">3.4 Analytics & Improvement</h3>
            <ul>
              <li>Analyze aggregated usage patterns to optimize platform performance</li>
              <li>Improve quiz difficulty balancing and question quality</li>
              <li>Conduct A/B testing for feature enhancements (anonymized data only)</li>
            </ul>

            <div className="highlight-box">
              <strong>We Never Sell Your Data</strong>
              <p>Your personal information is never sold, rented, or shared with third parties for their marketing purposes. We only share data with trusted service providers as outlined in Section 5.</p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>4. Automated Decision-Making</span>
            </h2>
            <p>We use automated systems for the following purposes:</p>
            
            <ul>
              <li><strong>Quiz Scoring:</strong> Answers are automatically evaluated against correct responses to calculate scores in real-time.</li>
              <li><strong>Leaderboard Ranking:</strong> Players are ranked algorithmically based on total score, accuracy, and response times.</li>
              <li><strong>Anti-Cheat Detection:</strong> Machine learning models flag suspicious patterns (e.g., impossibly fast answers, coordinated behavior) for manual review.</li>
              <li><strong>Age Verification:</strong> Date of birth is automatically checked to ensure compliance with our 18+ policy.</li>
            </ul>

            <div className="info-box">
              <strong>Right to Human Review</strong>
              <p>If you believe an automated decision (such as account suspension for suspected cheating) was made in error, you have the right to request human review. Contact <a href="mailto:team@vibraxx.com" style={{ color: "#60a5fa", fontWeight: 600 }}>team@vibraxx.com</a> to appeal.</p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Globe style={{ width: 24, height: 24 }} />
              <span>5. Third-Party Services & Data Sharing</span>
            </h2>
            <p>We work with trusted service providers to deliver VibraXX. All processors are contractually bound to UK/EU GDPR standards:</p>
            
            <h3 className="subsection-title">5.1 Essential Service Providers</h3>
            <ul>
              <li><strong>Supabase (Backend & Auth):</strong> Database hosting, user authentication, real-time data sync. <em>Data Location: EU/US (Standard Contractual Clauses apply)</em></li>
              <li><strong>Stripe (Payment Processing):</strong> Secure payment processing, PCI-DSS Level 1 compliant. <em>Data Location: EU/US (GDPR-compliant)</em></li>
              <li><strong>Zoho Mail (Transactional Emails):</strong> Sending service emails (confirmations, password resets). <em>Data Location: EU data centers</em></li>
              <li><strong>Vercel (Hosting & CDN):</strong> Website hosting and content delivery. <em>Data Location: Global network with EU compliance</em></li>
            </ul>

            <h3 className="subsection-title">5.2 International Data Transfers</h3>
            <p>Some of our service providers (Supabase, Vercel) operate servers outside the UK/EU, primarily in the United States. To ensure GDPR compliance:</p>
            <ul>
              <li>We use <strong>Standard Contractual Clauses (SCCs)</strong> approved by the European Commission</li>
              <li>Providers implement <strong>supplementary security measures</strong> (encryption, access controls)</li>
              <li>We conduct regular <strong>Transfer Impact Assessments (TIAs)</strong> to monitor data protection risks</li>
            </ul>

            <h3 className="subsection-title">5.3 Legal Disclosures</h3>
            <p>We may disclose personal data if required by law or to:</p>
            <ul>
              <li>Comply with legal obligations (e.g., court orders, tax authorities)</li>
              <li>Enforce our Terms & Conditions or investigate violations</li>
              <li>Protect the rights, safety, or property of VibraXX, users, or the public</li>
            </ul>

            <div className="warning-box">
              <strong>No Data Sales</strong>
              <p>We never sell, rent, or trade your personal data to third parties for marketing or advertising purposes. All data sharing is strictly limited to the service providers listed above.</p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Shield style={{ width: 24, height: 24 }} />
              <span>6. Data Security</span>
            </h2>
            <p>We implement industry-standard security measures to protect your personal data:</p>
            
            <ul>
              <li><strong>Encryption:</strong> All data in transit is protected with TLS 1.3 encryption. Sensitive data at rest is encrypted using AES-256.</li>
              <li><strong>Access Controls:</strong> Role-based access restrictions ensure only authorized personnel can access personal data.</li>
              <li><strong>Password Security:</strong> Passwords are hashed using bcrypt with individual salts (never stored in plain text).</li>
              <li><strong>PCI-DSS Compliance:</strong> Payment processing adheres to Payment Card Industry Data Security Standards via Stripe.</li>
              <li><strong>Regular Audits:</strong> We conduct periodic security assessments and vulnerability testing.</li>
              <li><strong>Incident Response:</strong> In the event of a data breach, we will notify affected users and relevant authorities within 72 hours as required by GDPR.</li>
            </ul>

            <div className="info-box">
              <strong>Report Security Issues</strong>
              <p>If you discover a security vulnerability, please report it immediately to <a href="mailto:team@vibraxx.com" style={{ color: "#60a5fa", fontWeight: 600 }}>team@vibraxx.com</a>. We take all reports seriously and will investigate promptly.</p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>7. Data Retention</span>
            </h2>
            <p>We retain personal data only as long as necessary for the purposes outlined in this policy:</p>
            
            <h3 className="subsection-title">7.1 Active Accounts</h3>
            <ul>
              <li><strong>Profile Data:</strong> Retained while your account is active</li>
              <li><strong>Quiz Performance:</strong> Stored indefinitely for leaderboard history and analytics</li>
              <li><strong>Session Logs:</strong> Kept for 90 days for technical support and fraud prevention</li>
            </ul>

            <h3 className="subsection-title">7.2 Financial Records</h3>
            <ul>
              <li><strong>Transaction Data:</strong> Retained for <strong>7 years</strong> to comply with UK tax law (HMRC requirements)</li>
              <li><strong>Prize Payouts:</strong> Records kept for <strong>7 years</strong> for audit and legal compliance purposes</li>
            </ul>

            <h3 className="subsection-title">7.3 Closed Accounts</h3>
            <ul>
              <li><strong>Account Deletion:</strong> When you close your account, we anonymize your profile data within 30 days</li>
              <li><strong>Anonymization:</strong> Historical quiz scores remain in aggregated form but are no longer linked to your identity</li>
              <li><strong>Legal Hold:</strong> Financial records are retained for 7 years even after account closure (HMRC requirement)</li>
            </ul>

            <div className="highlight-box">
              <strong>Request Account Deletion</strong>
              <p>To delete your account and personal data, email <a href="mailto:team@vibraxx.com" style={{ color: "#4ade80", fontWeight: 600 }}>team@vibraxx.com</a> with your registered email address. We will process your request within 30 days. Note: Financial transaction records will be retained for 7 years as required by law.</p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <UserCheck style={{ width: 24, height: 24 }} />
              <span>8. Your Privacy Rights (UK/EU GDPR)</span>
            </h2>
            <p>Under UK and EU data protection law, you have the following rights:</p>
            
            <div className="rights-grid">
              <div className="right-card">
                <h4>Right to Access</h4>
                <p>Request a copy of all personal data we hold about you</p>
              </div>
              <div className="right-card">
                <h4>Right to Rectification</h4>
                <p>Correct inaccurate or incomplete information in your profile</p>
              </div>
              <div className="right-card">
                <h4>Right to Erasure</h4>
                <p>Request deletion of your personal data (subject to legal retention requirements)</p>
              </div>
              <div className="right-card">
                <h4>Right to Data Portability</h4>
                <p>Export your data in a machine-readable format (CSV/JSON)</p>
              </div>
              <div className="right-card">
                <h4>Right to Restrict Processing</h4>
                <p>Limit how we use your data while disputes are resolved</p>
              </div>
              <div className="right-card">
                <h4>Right to Object</h4>
                <p>Opt out of processing based on legitimate interest (e.g., marketing)</p>
              </div>
              <div className="right-card">
                <h4>Right to Withdraw Consent</h4>
                <p>Revoke consent for optional data processing (e.g., analytics cookies)</p>
              </div>
              <div className="right-card">
                <h4>Right to Lodge a Complaint</h4>
                <p>File a complaint with the UK Information Commissioner's Office (ICO) or your local data protection authority</p>
              </div>
            </div>

            <div className="highlight-box" style={{ marginTop: 24 }}>
              <strong>Exercise Your Rights</strong>
              <p>
                To exercise any of these rights, email <a href="mailto:team@vibraxx.com" style={{ color: "#4ade80", fontWeight: 600 }}>team@vibraxx.com</a> with your request. We will respond within <strong>30 days</strong> (or 60 days for complex requests).
                <br /><br />
                You may also contact the <strong>UK Information Commissioner's Office (ICO)</strong>:
                <br />Website: <a href="https://ico.org.uk" target="_blank" rel="noopener" style={{ color: "#4ade80" }}>ico.org.uk</a>
                <br />Phone: 0303 123 1113
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>9. Cookies & Tracking Technologies</span>
            </h2>
            <p>We use cookies and similar technologies to improve your experience. For full details, see our <a href="/cookies" style={{ color: "#4ade80", fontWeight: 600 }}>Cookie Policy</a>.</p>
            
            <h3 className="subsection-title">Types of Cookies We Use:</h3>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for authentication, session management, and core functionality</li>
              <li><strong>Performance Cookies:</strong> Anonymous analytics to improve platform performance</li>
              <li><strong>Preference Cookies:</strong> Remember your language, theme, and display settings</li>
            </ul>

            <p>You can manage cookie preferences through your browser settings. Disabling essential cookies may affect platform functionality.</p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>10. Changes to This Policy</span>
            </h2>
            <p>We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. When we make significant changes:</p>
            <ul>
              <li>We will notify you via email at your registered address</li>
              <li>A banner will appear on the website highlighting the updates</li>
              <li>The "Last Updated" date at the top of this policy will be revised</li>
            </ul>
            <p>We encourage you to review this policy regularly to stay informed about how we protect your data.</p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>11. Contact Us</span>
            </h2>
            <div className="highlight-box">
              <strong>Privacy & Data Protection Inquiries</strong>
              <p style={{ marginTop: 12 }}>
                <strong style={{ color: "#86efac" }}>Email:</strong>{" "}
                <a href="mailto:team@vibraxx.com" style={{ color: "#4ade80", fontWeight: 600 }}>
                  team@vibraxx.com
                </a>
                <br /><br />
                <strong style={{ color: "#86efac" }}>Company:</strong> Sermin Limited
                <br />
                <strong style={{ color: "#86efac" }}>Registered Address:</strong> 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom
                <br />
                <strong style={{ color: "#86efac" }}>Company Number:</strong> 16778648 (England & Wales)
              </p>
            </div>

            <div className="info-box">
              <strong>Data Protection Authority</strong>
              <p style={{ marginTop: 12 }}>
                If you have concerns about how we handle your data, you may contact the UK Information Commissioner's Office:
                <br /><br />
                <strong style={{ color: "#86efac" }}>Website:</strong> <a href="https://ico.org.uk" target="_blank" rel="noopener" style={{ color: "#60a5fa", fontWeight: 600 }}>ico.org.uk</a>
                <br />
                <strong style={{ color: "#86efac" }}>Phone:</strong> 0303 123 1113
                <br />
                <strong style={{ color: "#86efac" }}>Address:</strong> Information Commissioner's Office, Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF
              </p>
            </div>
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
            © 2025 VibraXX. Operated by Sermin Limited | Registered in England & Wales (Company No. 16778648)
            <br />
            71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom
          </div>
        </footer>
      </div>
    </>
  );
}
