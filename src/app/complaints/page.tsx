"use client";

import { ArrowLeft, MessageSquare, CheckCircle, Clock, AlertTriangle, Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ComplaintsPage() {
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
          background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(219, 39, 119, 0.1));
          border: 1px solid rgba(236, 72, 153, 0.3);
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(236, 72, 153, 0.2), transparent 70%);
          pointer-events: none;
        }

        .hero-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899, #db2777);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 40px rgba(236, 72, 153, 0.4);
          position: relative;
        }

        .hero-title {
          font-size: clamp(32px, 6vw, 48px);
          font-weight: 800;
          margin-bottom: 16px;
          background: linear-gradient(90deg, #ec4899, #f472b6, #db2777);
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
          border-color: rgba(236, 72, 153, 0.3);
        }

        @media (max-width: 768px) {
          .content-card {
            padding: 24px 20px;
          }
        }

        .section-title {
          font-size: clamp(22px, 4vw, 28px);
          font-weight: 800;
          color: #f472b6;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(236, 72, 153, 0.3);
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .subsection-title {
          font-size: clamp(18px, 3vw, 22px);
          font-weight: 700;
          color: #f9a8d4;
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
          background: rgba(236, 72, 153, 0.1);
          border-left: 4px solid #ec4899;
          margin: 24px 0;
          backdrop-filter: blur(10px);
        }

        .highlight-box strong {
          color: #f472b6;
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

        /* ✅ MOBILE-OPTIMIZED TIMELINE */
        .timeline {
          position: relative;
          padding-left: 40px;
          margin: 24px 0;
        }

        @media (max-width: 640px) {
          .timeline {
            padding-left: 24px;
          }
        }

        .timeline::before {
          content: "";
          position: absolute;
          left: 8px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, #ec4899, #db2777);
        }

        @media (max-width: 640px) {
          .timeline::before {
            left: 6px;
          }
        }

        .timeline-item {
          position: relative;
          margin-bottom: 32px;
        }

        @media (max-width: 640px) {
          .timeline-item {
            margin-bottom: 28px;
          }
        }

        .timeline-item::before {
          content: "";
          position: absolute;
          left: -32px;
          top: 4px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ec4899;
          border: 3px solid #020817;
          box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.3);
        }

        @media (max-width: 640px) {
          .timeline-item::before {
            left: -19px;
            width: 13px;
            height: 13px;
            border-width: 2px;
          }
        }

        .timeline-step {
          font-weight: 700;
          color: #f472b6;
          font-size: 16px;
          margin-bottom: 8px;
        }

        @media (max-width: 640px) {
          .timeline-step {
            font-size: 15px;
          }
        }

        .timeline-content {
          color: #cbd5e1;
          font-size: 15px;
          line-height: 1.7;
        }

        @media (max-width: 640px) {
          .timeline-content {
            font-size: 14px;
          }
        }

        .contact-card {
          padding: 24px;
          border-radius: 16px;
          background: rgba(236, 72, 153, 0.05);
          border: 1px solid rgba(236, 72, 153, 0.2);
          margin: 16px 0;
        }

        @media (max-width: 640px) {
          .contact-card {
            padding: 20px;
          }
        }

        .contact-card h4 {
          font-size: 16px;
          font-weight: 700;
          color: #f472b6;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 640px) {
          .contact-card h4 {
            font-size: 15px;
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
                  Support
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
              <MessageSquare style={{ width: 40, height: 40, color: "white" }} />
            </div>
            <h1 className="hero-title animate-shimmer">Complaints Procedure</h1>
            <p className="hero-subtitle">
              We take all complaints seriously and aim to resolve issues fairly and promptly
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>1. Our Commitment</span>
            </h2>
            <p>
              At VibraXX, we are committed to providing excellent service. If you are unhappy with any aspect of our platform, we want to hear from you and make things right.
            </p>
            <div className="highlight-box">
              <strong>Fair Resolution</strong>
              <p>
                Every complaint is taken seriously and investigated thoroughly. We aim to resolve issues quickly, fairly, and transparently.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <Clock style={{ width: 24, height: 24 }} />
              <span>2. Time Limits</span>
            </h2>
            <p>
              To ensure fair and effective resolution, complaints must be submitted within <strong>7 days</strong> of the incident or issue occurring.
            </p>
            <div className="info-box">
              <strong>Why 7 Days?</strong>
              <p>
                This timeframe allows us to investigate while evidence and records are still fresh. Late complaints may not be investigated if key information is no longer available.
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>3. How to Submit a Complaint</span>
            </h2>

            <div className="contact-card">
              <h4>
                <Mail style={{ width: 18, height: 18 }} />
                Email (Preferred Method)
              </h4>
              <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                <strong style={{ color: "#f9a8d4" }}>Address:</strong>{" "}
                <a href="mailto:team@vibraxx.com" style={{ color: "#f472b6", fontWeight: 600, textDecoration: "none" }}>
                  team@vibraxx.com
                </a>
                <br />
                <strong style={{ color: "#f9a8d4" }}>Subject:</strong> "Complaint - [Brief Description]"
                <br />
                <strong style={{ color: "#f9a8d4" }}>Response:</strong> Within 3 business days
              </p>
            </div>

            <h3 className="subsection-title">Information to Include</h3>
            <p>To help us resolve your complaint quickly, please provide:</p>
            <ul>
              <li><strong>Your account email address</strong></li>
              <li><strong>Date and time of the incident</strong> (as accurately as possible)</li>
              <li><strong>Detailed description</strong> of what happened</li>
              <li><strong>Screenshots or evidence</strong> (if applicable)</li>
              <li><strong>Quiz round details</strong> (if complaint relates to a specific competition)</li>
              <li><strong>Your desired outcome</strong> (e.g. explanation or technical review). Requested outcomes do not guarantee entitlement.</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>4. Complaint Process Timeline</span>
            </h2>

            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-step">Step 1: Acknowledgment</div>
                <div className="timeline-content">
                  We will acknowledge receipt of your complaint within <strong>24 hours</strong> and provide a reference number for tracking.
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-step">Step 2: Investigation</div>
                <div className="timeline-content">
                  Our team will investigate your complaint thoroughly, reviewing logs, recordings, and any relevant evidence. This typically takes <strong>1-3 business days</strong>.
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-step">Step 3: Response</div>
                <div className="timeline-content">
                  You will receive a detailed response within <strong>3 business days</strong> of submission, explaining our findings and proposed resolution.
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-step">Step 4: Resolution</div>
                <div className="timeline-content">
                  If we agree with your complaint, we will implement the agreed resolution immediately. If we do not uphold your complaint, we will explain our decision clearly.
                </div>
              </div>
            </div>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>5. Types of Complaints We Handle</span>
            </h2>
            <ul>
              <li><strong>Technical Issues:</strong> Platform errors, crashes, or malfunctions</li>
              <li><strong>Payment Problems:</strong> Charges, refunds, or billing issues</li>
              <li><strong>Quiz Content:</strong> Incorrect questions or answers</li>
              <li><strong>Scoring Disputes:</strong> Disagreements about quiz results</li>
              <li><strong>Account Issues:</strong> Access problems or suspension concerns</li>
              <li><strong>Prize Distribution:</strong> Delays or errors in prize payments</li>
              <li><strong>Customer Service:</strong> Staff conduct or response quality</li>
              <li><strong>Privacy Concerns:</strong> Data handling or security issues</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>6. Possible Outcomes</span>
            </h2>
            <p>Depending on the nature of your complaint, we may offer:</p>
            <ul>
              <li><strong>Apology</strong> and explanation</li>
              <li><strong>Refund</strong> of entry fees or rounds (only in cases of verified platform error or wrongful charge, in strict accordance with our Refund Policy)</li>
              <li><strong>Replacement rounds</strong> at no cost</li>
              <li><strong>Account reinstatement</strong> (if wrongly suspended)</li>
              <li><strong>Quiz replay opportunity</strong> (in case of technical fault)</li>
              <li><strong>Goodwill gestures</strong> (in exceptional circumstances)</li>
              <li><strong>Policy clarification</strong> or correction</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <AlertTriangle style={{ width: 24, height: 24 }} />
              <span>7. If You're Not Satisfied</span>
            </h2>
            <p>
              If you are not satisfied with our initial response, you can request an escalation:
            </p>

            <h3 className="subsection-title">Escalation Process</h3>
            <ol>
              <li>Reply to our response email with "Request Escalation"</li>
              <li>Explain why you remain dissatisfied</li>
              <li>Provide any additional evidence or information</li>
              <li>A senior manager will review your case within <strong>5 business days</strong></li>
              <li>You will receive a final decision from senior management</li>
            </ol>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>8. Alternative Dispute Resolution</span>
            </h2>
            <p>
              If we cannot resolve your complaint internally and you are a consumer in the UK or EU, you may access alternative dispute resolution:
            </p>

            <h3 className="subsection-title">For UK Consumers</h3>
            <ul>
              <li><strong>Citizens Advice Consumer Service:</strong> 0808 223 1133</li>
              <li><strong>Website:</strong> citizensadvice.org.uk</li>
            </ul>

            <h3 className="subsection-title">For EU Consumers</h3>
            <ul>
              <li><strong>European Online Dispute Resolution:</strong> ec.europa.eu/consumers/odr</li>
            </ul>

            <h3 className="subsection-title">Other Jurisdictions</h3>
            <p>
              Contact your local consumer protection agency or ombudsman service.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>9. Frivolous or Vexatious Complaints</span>
            </h2>
            <p>
              While we welcome all legitimate complaints, we reserve the right to refuse to process complaints that are:
            </p>
            <ul>
              <li>Repeatedly submitted without new information</li>
              <li>Abusive, threatening, or harassing in nature</li>
              <li>Clearly intended to disrupt our operations</li>
              <li>Fraudulent or made in bad faith</li>
            </ul>
            <p>
              In such cases, we will explain why we cannot process the complaint and may take further action if necessary.
            </p>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>10. Learning from Complaints</span>
            </h2>
            <p>
              We value complaints as feedback that helps us improve. All complaints are reviewed regularly to identify patterns and areas for improvement. We use complaint data to:
            </p>
            <ul>
              <li>Improve our platform and services</li>
              <li>Train our team more effectively</li>
              <li>Update our policies and procedures</li>
              <li>Enhance the user experience</li>
            </ul>
          </div>

          <div className="content-card">
            <h2 className="section-title">
              <span>11. Contact Information</span>
            </h2>
            <div className="highlight-box">
              <strong>Complaints Department</strong>
              <p style={{ marginTop: 12 }}>
                <strong style={{ color: "#f9a8d4" }}>Email:</strong>{" "}
                <a href="mailto:team@vibraxx.com" style={{ color: "#f472b6", fontWeight: 600, textDecoration: "none" }}>
                  team@vibraxx.com
                </a>
                <br />
                <strong style={{ color: "#f9a8d4" }}>Subject:</strong> "Complaint - [Your Issue]"
                <br />
                <br />
                <strong style={{ color: "#f9a8d4" }}>Company:</strong> Sermin Limited (trading as VibraXX)
                <br />
                <strong style={{ color: "#f9a8d4" }}>Company Number:</strong> 16778648
                <br />
                <strong style={{ color: "#f9a8d4" }}>Address:</strong> 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, UK
                <br />
                <br />
                <strong style={{ color: "#f9a8d4" }}>Acknowledgment:</strong> Within 24 hours
                <br />
                <strong style={{ color: "#f9a8d4" }}>Full Response:</strong> Within 3 business days
              </p>
            </div>
          </div>

          <div style={{
            padding: 24,
            borderRadius: 16,
            background: "rgba(236, 72, 153, 0.1)",
            border: "1px solid rgba(236, 72, 153, 0.3)",
            textAlign: "center",
            marginTop: 40
          }}>
            <CheckCircle style={{ width: 28, height: 28, color: "#f472b6", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, color: "#cbd5e1", margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: "#f472b6" }}>We're Here to Help</strong>
              <br />
              Your satisfaction matters to us. If something isn't right, please let us know so we can make it better.
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
