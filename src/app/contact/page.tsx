"use client";

import { ArrowLeft, Mail, MapPin, Building, Send, Clock, MessageCircle, HelpCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    setStatus("sending");
    
    // Simulated form submission
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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
          max-width: 1200px;
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

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-bottom: 40px;
        }

        @media (min-width: 1024px) {
          .contact-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .contact-form-section {
          background: rgba(9, 9, 13, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 36px;
          backdrop-filter: blur(18px);
        }

        .contact-info-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .contact-form-section {
            padding: 24px 20px;
          }
        }

        .section-title {
          font-size: clamp(22px, 4vw, 28px);
          font-weight: 800;
          color: #34d399;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #cbd5e1;
          margin-bottom: 8px;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(15, 23, 42, 0.5);
          color: white;
          font-size: 15px;
          transition: all 0.2s;
          font-family: inherit;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #10b981;
          background: rgba(15, 23, 42, 0.8);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .form-textarea {
          min-height: 150px;
          resize: vertical;
        }

        .submit-button {
          width: 100%;
          padding: 14px 24px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #10b981, #34d399);
          color: white;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .info-card {
          background: rgba(9, 9, 13, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(18px);
          transition: all 0.3s;
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

        .info-content {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.7;
        }

        .info-content a {
          color: #10b981;
          text-decoration: none;
          transition: color 0.2s;
        }

        .info-content a:hover {
          color: #34d399;
        }

        .success-message {
          padding: 16px 20px;
          border-radius: 12px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .error-message {
          padding: 16px 20px;
          border-radius: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
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
              <MessageCircle style={{ width: 40, height: 40, color: "white" }} />
            </div>
            <h1 className="hero-title animate-shimmer">Get In Touch</h1>
            <p className="hero-subtitle">
              Have questions, feedback, or need support? We're here to help. Reach out to us and we'll respond within 24-48 hours.
            </p>
          </div>

          <div className="contact-grid">
            <div className="contact-form-section">
              <h2 className="section-title">
                <Send style={{ width: 24, height: 24 }} />
                <span>Send Us a Message</span>
              </h2>

              {status === "success" && (
                <div className="success-message">
                  <Mail style={{ width: 20, height: 20 }} />
                  <span>Thank you! Your message has been sent successfully. We'll get back to you soon.</span>
                </div>
              )}

              {status === "error" && (
                <div className="error-message">
                  <AlertCircle style={{ width: 20, height: 20 }} />
                  <span>Oops! Something went wrong. Please try again or email us directly.</span>
                </div>
              )}

              <div>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="account">Account Issues</option>
                    <option value="payment">Payment & Billing</option>
                    <option value="prize">Prize Claims</option>
                    <option value="complaint">Complaint</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="partnership">Business Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Please describe your inquiry in detail..."
                  />
                </div>

                <button 
                  onClick={handleSubmit}
                  className="submit-button"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send style={{ width: 18, height: 18 }} />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="contact-info-section">
              <div className="info-card">
                <div className="info-card-header">
                  <div className="info-icon">
                    <Mail style={{ width: 20, height: 20, color: "white" }} />
                  </div>
                  <span className="info-title">Email Support</span>
                </div>
                <div className="info-content">
                  <p style={{ marginBottom: 8 }}>
                    <strong>VibraXX Platform:</strong><br />
                    <a href="mailto:team@vibraxx.com">team@vibraxx.com</a>
                  </p>
                  <p>
                    <strong>Sermin Limited (Corporate):</strong><br />
                    <a href="mailto:contact@sermin.uk">contact@sermin.uk</a>
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
                  <p style={{ marginTop: 8 }}>
                    For urgent technical issues during active quiz rounds, please include "URGENT" in your subject line.
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
                  <p style={{ marginTop: 8 }}>
                    71-75 Shelton Street<br />
                    Covent Garden<br />
                    London, WC2H 9JQ<br />
                    United Kingdom
                  </p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-header">
                  <div className="info-icon">
                    <MapPin style={{ width: 20, height: 20, color: "white" }} />
                  </div>
                  <span className="info-title">Operating Hours</span>
                </div>
                <div className="info-content">
                  <p>
                    <strong>Platform:</strong> 24/7 (Quiz rounds every 15 minutes)<br />
                    <strong>Support:</strong> Monday-Friday, 9:00 AM - 6:00 PM GMT<br />
                    <strong>Emergency:</strong> 24/7 for critical platform issues
                  </p>
                </div>
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