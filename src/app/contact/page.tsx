"use client";

import { ArrowLeft, Mail, MapPin, Building, Clock, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ContactPage() {
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
          background: #10b981;
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
          background: #34d399;
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
          background: radial-gradient(circle at 0 0, #10b981, #34d399);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
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
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.1));
          border: 1px solid rgba(16, 185, 129, 0.3);
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.2), transparent 70%);
          pointer-events: none;
        }

        .hero-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #34d399);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 40px rgba(16, 185, 129, 0.4);
          position: relative;
        }

        .hero-title {
          font-size: clamp(32px, 6vw, 48px);
          font-weight: 800;
          margin-bottom: 16px;
          background: linear-gradient(90deg, #10b981, #34d399, #10b981);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: 16px;
          color: #cbd5e1;
          margin-bottom: 24px;
          line-height: 1.6;
          max-width: 600px;
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
        }

        .contact-info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-bottom: 40px;
        }

        @media (min-width: 640px) {
          .contact-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .info-card {
          background: rgba(9, 9, 13, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(18px);
          transition: all 0.3s;
        }

        @media (max-width: 640px) {
          .info-card {
            padding: 20px;
          }
        }

        .info-card:hover {
          border-color: rgba(16, 185, 129, 0.3);
          transform: translateY(-2px);
        }

        .info-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .info-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #10b981, #34d399);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-title {
          font-size: 18px;
          font-weight: 700;
          color: #34d399;
        }

        @media (max-width: 640px) {
          .info-title {
            font-size: 16px;
          }
        }

        .info-content {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.7;
        }

        @media (max-width: 640px) {
          .info-content {
            font-size: 13px;
          }
        }

        .info-content p {
          margin-bottom: 8px;
        }

        .info-content p:last-child {
          margin-bottom: 0;
        }

        .info-content a {
          color: #10b981;
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 600;
        }

        .info-content a:hover {
          color: #34d399;
        }

        .highlight-box {
          padding: 24px;
          border-radius: 16px;
          background: rgba(16, 185, 129, 0.1);
          border-left: 4px solid #10b981;
          margin-bottom: 40px;
          backdrop-filter: blur(10px);
        }

        .highlight-box strong {
          color: #34d399;
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

        .quick-links {
          background: rgba(9, 9, 13, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 32px;
          margin-top: 40px;
        }

        .quick-links h3 {
          font-size: 22px;
          font-weight: 800;
          color: #34d399;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quick-links-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        @media (min-width: 640px) {
          .quick-links-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .quick-links-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .quick-link-item {
          padding: 16px 20px;
          border-radius: 12px;
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #cbd5e1;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
          font-size: 14px;
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .quick-link-item {
            padding: 14px 16px;
            font-size: 13px;
          }
        }

        .quick-link-item:hover {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.4);
          transform: translateX(4px);
          color: #34d399;
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

          .quick-links {
            padding: 24px 20px;
          }

          .quick-links h3 {
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
                    color: "#6ee7b7",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    whiteSpace: "nowrap",
                  }}
                >
                  Contact
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
              <Mail style={{ width: 40, height: 40, color: "white" }} />
            </div>
            <h1 className="hero-title animate-shimmer">Contact Us</h1>
            <p className="hero-subtitle">
              For all inquiries, please contact us directly via email. We typically respond within 24-48 hours during business days.
            </p>
          </div>

          <div className="highlight-box">
            <strong>Email Contact Only</strong>
            <p>
              We handle all customer inquiries via email to ensure proper documentation and tracking. Please reach out to the appropriate email address below based on your inquiry type.
            </p>
          </div>

          <div className="contact-info-grid">
            <div className="info-card">
              <div className="info-card-header">
                <div className="info-icon">
                  <Mail style={{ width: 20, height: 20, color: "white" }} />
                </div>
                <span className="info-title">Email Support</span>
              </div>
              <div className="info-content">
                <p>
                  <strong>VibraXX Platform:</strong><br />
                  <a href="mailto:team@vibraxx.com">team@vibraxx.com</a>
                </p>
                <p style={{ marginTop: 12 }}>
                  For technical support, account issues, prize claims, complaints, feedback, and all platform-related inquiries.
                </p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <div className="info-icon">
                  <Mail style={{ width: 20, height: 20, color: "white" }} />
                </div>
                <span className="info-title">Corporate Contact</span>
              </div>
              <div className="info-content">
                <p>
                  <strong>Sermin Limited:</strong><br />
                  <a href="mailto:contact@sermin.uk">contact@sermin.uk</a>
                </p>
                <p style={{ marginTop: 12 }}>
                  For business partnerships, legal matters, press inquiries, and corporate communications.
                </p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <div className="info-icon">
                  <Clock style={{ width: 20, height: 20, color: "white" }} />
                </div>
                <span className="info-title">Response Time</span>
              </div>
              <div className="info-content">
                <p>
                  We typically respond to all inquiries within <strong>24-48 hours</strong> during business days (Monday-Friday).
                </p>
                <p style={{ marginTop: 12 }}>
                  For urgent technical issues during active quiz rounds, please include <strong>"URGENT"</strong> in your email subject line.
                </p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <div className="info-icon">
                  <Building style={{ width: 20, height: 20, color: "white" }} />
                </div>
                <span className="info-title">Registered Office</span>
              </div>
              <div className="info-content">
                <p>
                  <strong>Sermin Limited</strong><br />
                  Company No. 16778648
                </p>
                <p style={{ marginTop: 12 }}>
                  71-75 Shelton Street<br />
                  Covent Garden<br />
                  London, WC2H 9JQ<br />
                  United Kingdom
                </p>
              </div>
            </div>
          </div>

          <div className="quick-links">
            <h3>
              <HelpCircle style={{ width: 24, height: 24 }} />
              Need Help Quickly?
            </h3>
            <div className="quick-links-grid">
              <a href="/faq" className="quick-link-item">
                <HelpCircle style={{ width: 16, height: 16 }} />
                FAQ - Common Questions
              </a>
              <a href="/how-it-works" className="quick-link-item">
                <Mail style={{ width: 16, height: 16 }} />
                How VibraXX Works
              </a>
              <a href="/rules" className="quick-link-item">
                <Mail style={{ width: 16, height: 16 }} />
                Quiz Rules
              </a>
              <a href="/refunds" className="quick-link-item">
                <Mail style={{ width: 16, height: 16 }} />
                Refund Policy
              </a>
              <a href="/complaints" className="quick-link-item">
                <Mail style={{ width: 16, height: 16 }} />
                File a Complaint
              </a>
              <a href="/terms" className="quick-link-item">
                <Mail style={{ width: 16, height: 16 }} />
                Terms & Conditions
              </a>
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
            © 2025 VibraXX. Operated by Sermin Limited | Company No. 16778648
            <br />
            Registered in England & Wales | 71-75 Shelton Street, London, WC2H 9JQ, UK
          </div>
        </footer>
      </div>
    </>
  );
}
