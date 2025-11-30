"use client";

import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RefundPolicyPage() {
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
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1));
          border: 1px solid rgba(59, 130, 246, 0.3);
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.2), transparent 70%);
          pointer-events: none;
        }

        .hero-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.4);
          position: relative;
        }

        .hero-title {
          font-size: clamp(32px, 6vw, 48px);
          font-weight: 800;
          margin-bottom: 16px;
          background: linear-gradient(90deg, #3b82f6, #06b6d4, #2563eb);
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
          border-color: rgba(59, 130, 246, 0.3);
        }

        @media (max-width: 768px) {
          .content-card {
            padding: 24px 20px;
          }
        }

        .section-title {
          font-size: clamp(22px, 4vw, 28px);
          font-weight: 800;
          color: #60a5fa;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(59, 130, 246, 0.3);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .subsection-title {
          font-size: clamp(18px, 3vw, 22px);
          font-weight: 700;
          color: #93c5fd;
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

        .error-box {
          padding: 24px;
          border-radius: 16px;
          background: rgba(239, 68, 68, 0.1);
          border-left: 4px solid #ef4444;
          margin: 24px 0;
          backdrop-filter: blur(10px);
        }

        .error-box strong {
          color: #f87171;
          display: block;
          margin-bottom: 10px;
          font-size: 17px;
          font-weight: 700;
        }

        .error-box p {
          margin: 0;
          color: #cbd5e1;
          font-size: 15px;
          line-height: 1.7;
        }

        .refund-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin: 24px 0;
        }

        @media (min-width: 768px) {
          .refund-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .refund-card {
          padding: 20px;
          border-radius: 12px;
          border: 1px solid rgba(59, 130, 246, 0.2);
          transition: all 0.2s;
        }

        .refund-card.eligible {
          background: rgba(34, 197, 94, 0.05);
          border-color: rgba(34, 197, 94, 0.3);
        }

        .refund-card.not-eligible {
          background: rgba(239, 68, 68, 0.05);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .refund-card:hover {
          transform: translateY(-2px);
        }

        .refund-card h4 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .refund-card.eligible h4 {
          color: #4ade80;
        }

        .refund-card.not-eligible h4 {
          color: #f87171;
        }

        .refund-card p {
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
                  Refunds
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
              <RefreshCw style={{ width: 40, height: 40, color: "white" }} />
            </div>
            <h1 className="hero-title animate-shimmer">Refund Policy</h1>
            <p className="hero-subtitle">
              Clear and fair refund terms compliant with UK Consumer Rights Act 2015
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <CheckCircle style={{ width: 24, height: 24 }} />
              <span>1. Your Right to Refund</span>
            </h2>
            <p>
              Under the UK Consumer Rights Act 2015, you have the right to request a refund for digital content in certain circumstances. This policy outlines when refunds are available for purchased quiz rounds on VibraXX.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Clock style={{ width: 24, height: 24 }} />
              <span>2. 14-Day Refund Window</span>
            </h2>
            <div className="highlight-box">
              <strong>Unused Rounds - Full Refund Available</strong>
              <p>
                You may request a full refund for unused quiz rounds within 14 days of purchase. Once a round is used to enter a live competition, it cannot be refunded.
              </p>
            </div>

            <h3 className="subsection-title">What Qualifies as "Unused"</h3>
            <ul>
              <li>Rounds purchased but not yet used to enter any live quiz</li>
              <li>Rounds still visible in your account balance</li>
              <li>Rounds not consumed or activated</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>3. Refund Eligibility</span>
            </h2>

            <div className="refund-grid">
              <div className="refund-card eligible">
                <h4>
                  <CheckCircle style={{ width: 18, height: 18 }} />
                  Eligible for Refund
                </h4>
                <p>Purchased rounds not used within 14 days</p>
              </div>

              <div className="refund-card not-eligible">
                <h4>
                  <XCircle style={{ width: 18, height: 18 }} />
                  Not Eligible
                </h4>
                <p>Rounds already used in competitions</p>
              </div>

              <div className="refund-card eligible">
                <h4>
                  <CheckCircle style={{ width: 18, height: 18 }} />
                  Eligible for Refund
                </h4>
                <p>Technical fault preventing round usage</p>
              </div>

              <div className="refund-card not-eligible">
                <h4>
                  <XCircle style={{ width: 18, height: 18 }} />
                  Not Eligible
                </h4>
                <p>Rounds purchased more than 14 days ago</p>
              </div>

              <div className="refund-card eligible">
                <h4>
                  <CheckCircle style={{ width: 18, height: 18 }} />
                  Eligible for Refund
                </h4>
                <p>Account banned due to our error</p>
              </div>

              <div className="refund-card not-eligible">
                <h4>
                  <XCircle style={{ width: 18, height: 18 }} />
                  Not Eligible
                </h4>
                <p>Account terminated for Terms violation</p>
              </div>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>4. How to Request a Refund</span>
            </h2>
            <p>To request a refund, follow these steps:</p>
            <ol>
              <li>Email us at <a href="mailto:team@vibraxx.com" style={{ color: "#60a5fa", fontWeight: 600 }}>team@vibraxx.com</a> within 14 days of purchase</li>
              <li>Include "Refund Request" in the subject line</li>
              <li>Provide your account email and purchase details</li>
              <li>Specify the number of unused rounds you wish to refund</li>
              <li>Explain the reason for your refund request</li>
            </ol>

            <div className="info-box" style={{ marginTop: 24 }}>
              <strong>Required Information</strong>
              <p>
                Please include: Account email, purchase date, transaction ID (if available), number of unused rounds, and reason for refund.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>5. Refund Processing Time</span>
            </h2>
            <ul>
              <li><strong>Review:</strong> We will review your request within 3 business days</li>
              <li><strong>Approval:</strong> Approved refunds are processed within 5 business days</li>
              <li><strong>Payment:</strong> Refunds are issued to your original payment method via Stripe</li>
              <li><strong>Arrival:</strong> Allow 5-10 business days for funds to appear in your account</li>
            </ul>

            <div className="warning-box">
              <strong>Payment Processing Fees</strong>
              <p>
                Stripe payment processing fees (approximately 1.5% + 20p per transaction) are non-refundable. You will receive a refund for the round purchase price minus the original processing fee.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>6. Prize Pool Threshold Not Met</span>
            </h2>
            <p>
              If the monthly participation threshold of 3000+ active participants is not reached, ALL rounds purchased during that month are automatically refunded—regardless of whether they were used.
            </p>

            <div className="highlight-box">
              <strong>Automatic Refund Process</strong>
              <p>
                If the 3000-participant threshold is not met by month-end, refunds are automatically processed within 14 business days. No action is required from you. You will receive an email notification when the refund is initiated.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>7. Technical Issues</span>
            </h2>
            <p>
              If you experience technical problems that prevent you from using purchased rounds:
            </p>
            <ul>
              <li>Contact us immediately at team@vibraxx.com</li>
              <li>Describe the technical issue in detail</li>
              <li>Include screenshots or error messages if available</li>
              <li>We will investigate and issue a refund or replacement rounds if the fault is on our side</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>8. Currency and Exchange Rates</span>
            </h2>
            <p>
              All refunds are processed in British Pounds (GBP). If you paid in a different currency:
            </p>
            <ul>
              <li>The refund amount will be the GBP equivalent at the time of purchase</li>
              <li>Your bank or payment provider will convert it to your local currency</li>
              <li>We are not responsible for exchange rate fluctuations</li>
              <li>Currency conversion fees charged by your bank are non-refundable</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>9. Exceptions and Special Circumstances</span>
            </h2>

            <h3 className="subsection-title">When Refunds Are Not Available</h3>
            <div className="error-box">
              <strong>No Refunds For</strong>
              <p>
                • Rounds used in competitions (even if you scored poorly)
                <br />
                • Rounds purchased more than 14 days ago
                <br />
                • Rounds on accounts banned for cheating or Terms violations
                <br />
                • Loss due to internet connection issues on your end
                <br />
                • Change of mind after using rounds
              </p>
            </div>

            <h3 className="subsection-title">Exceptional Circumstances</h3>
            <p>
              In cases of serious illness, bereavement, or other exceptional circumstances, please contact us. We will consider refund requests outside the standard policy on a case-by-case basis.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>10. Disputes</span>
            </h2>
            <p>
              If your refund request is denied and you believe this is incorrect:
            </p>
            <ul>
              <li>You may appeal the decision by replying to our refund decision email</li>
              <li>Provide any additional evidence or information</li>
              <li>A senior team member will review your appeal within 5 business days</li>
              <li>If still unsatisfied, see our Complaints Procedure</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>11. Contact Information</span>
            </h2>
            <div className="info-box">
              <strong>Refund Requests</strong>
              <p style={{ marginTop: 12 }}>
                <strong style={{ color: "#93c5fd" }}>Email:</strong>{" "}
                <a href="mailto:team@vibraxx.com" style={{ color: "#60a5fa", fontWeight: 600 }}>
                  team@vibraxx.com
                </a>
                <br />
                <strong style={{ color: "#93c5fd" }}>Subject:</strong> "Refund Request"
                <br />
                <strong style={{ color: "#93c5fd" }}>Response Time:</strong> Within 3 business days
                <br />
                <br />
                <strong style={{ color: "#93c5fd" }}>Company:</strong> Sermin Limited (trading as VibraXX)
                <br />
                <strong style={{ color: "#93c5fd" }}>Company Number:</strong> 16778648
                <br />
                <strong style={{ color: "#93c5fd" }}>Address:</strong> 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, UK
              </p>
            </div>
          </div>

          <div style={{
            padding: 24,
            borderRadius: 16,
            background: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            textAlign: "center",
            marginTop: 40
          }}>
            <AlertCircle style={{ width: 28, height: 28, color: "#60a5fa", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, color: "#cbd5e1", margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: "#60a5fa" }}>Fair Refund Policy</strong>
              <br />
              We are committed to providing fair refunds in accordance with UK consumer law. If you have any questions about our refund policy, please contact us.
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