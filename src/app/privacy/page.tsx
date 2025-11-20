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
                  Privacy
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
              Your privacy is our priority. Learn how we protect and use your data.
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
              <strong style={{ color: "#c4b5fd" }}>Company:</strong> Sermin Limited (VibraXX)
            </p>
            <p>
              <strong style={{ color: "#c4b5fd" }}>Email:</strong>{" "}
              <a
                href="mailto:team@vibraxx.com"
                style={{ color: "#60a5fa", textDecoration: "none" }}
              >
                team@vibraxx.com
              </a>
            </p>
            <p style={{ marginTop: 12, fontSize: 13, color: "#94a3b8" }}>
              Last Updated: November 18, 2025
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Eye style={{ width: 24, height: 24 }} />
              <span>1. Information We Collect</span>
            </h2>
            <ul>
              <li>Name, email, date of birth (18+ verification)</li>
              <li>Payment info (via Stripe)</li>
              <li>Quiz scores and performance</li>
              <li>Device and usage data</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>2. How We Use Your Data</span>
            </h2>
            <ul>
              <li>Provide quiz services</li>
              <li>Process payments and prizes</li>
              <li>Verify age and prevent fraud</li>
              <li>Improve platform</li>
            </ul>
            <div className="highlight-box">
              <strong>We Never Sell Your Data</strong>
              <p>Your information is never sold to third parties.</p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <UserCheck style={{ width: 24, height: 24 }} />
              <span>3. Your Privacy Rights</span>
            </h2>
            <div className="rights-grid">
              <div className="right-card">
                <h4>Access</h4>
                <p>Request your data</p>
              </div>
              <div className="right-card">
                <h4>Rectification</h4>
                <p>Correct information</p>
              </div>
              <div className="right-card">
                <h4>Erasure</h4>
                <p>Delete your data</p>
              </div>
              <div className="right-card">
                <h4>Portability</h4>
                <p>Export your data</p>
              </div>
            </div>
            <div className="highlight-box" style={{ marginTop: 24 }}>
              <strong>Exercise Your Rights</strong>
              <p>
                Email{" "}
                <a href="mailto:team@vibraxx.com" style={{ color: "#4ade80", fontWeight: 600 }}>
                  team@vibraxx.com
                </a>
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Shield style={{ width: 24, height: 24 }} />
              <span>4. Data Security</span>
            </h2>
            <ul>
              <li>SSL/TLS encryption</li>
              <li>Secure password hashing</li>
              <li>Regular security audits</li>
              <li>PCI DSS compliance</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>5. Contact Us</span>
            </h2>
            <div className="highlight-box">
              <strong>Privacy Contact</strong>
              <p style={{ marginTop: 12 }}>
                <strong style={{ color: "#86efac" }}>Email:</strong>{" "}
                <a href="mailto:team@vibraxx.com" style={{ color: "#4ade80", fontWeight: 600 }}>
                  team@vibraxx.com
                </a>
                <br />
                <br />
                <strong style={{ color: "#86efac" }}>Company:</strong> Sermin Limited
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
            © 2025 VibraXX. Operated by Sermin Limited (UK) | Registered in England & Wales
          </div>
        </footer>
      </div>
    </>
  );
}