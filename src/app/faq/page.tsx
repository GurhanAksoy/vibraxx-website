"use client";

import { ArrowLeft, HelpCircle, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

export default function FAQPage() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "What is VibraXX?",
          a: "VibraXX is a global live quiz competition platform operated by Sermin Limited. Players compete in real-time quiz rounds every 5 minutes, testing their knowledge and accuracy in a synchronized live arena. VibraXX is designed as a skill-based knowledge competition platform and is not intended to operate as a gambling service.",
        },
        {
          q: "How do I sign up?",
          a: "Simply click 'Sign In with Google' on the homepage. We use Google authentication for quick, secure registration. No separate password setup is required, and you can get started in moments.",
        },
        {
          q: "Is VibraXX free to play?",
          a: "Every registered user receives one free daily practice opportunity. Practice play does not affect leaderboards, prize eligibility, or monthly rankings and is intended for learning the format. To compete in paid live rounds and build an eligible monthly score, you need purchased round packages.",
        },
        {
          q: "Do I need to download an app?",
          a: "No. VibraXX is fully web-based and works on desktop, tablet, and mobile devices. Just visit the website and sign in with Google.",
        },
      ],
    },
    {
      category: "How the Quiz Works",
      questions: [
        {
          q: "How often do quiz rounds start?",
          a: "New live quiz rounds start automatically every 5 minutes, 24 hours a day, 7 days a week. You can join the lobby and wait for the next synchronized round to begin.",
        },
        {
          q: "How many questions are in each round?",
          a: "Each live round contains exactly 15 multiple-choice questions. Each question is shown with a 9-second answer window, followed by a 9-second explanation card.",
        },
        {
          q: "What happens if I do not answer in time?",
          a: "If you do not select an answer within the answer window, that question is treated as unanswered and earns 0 points. The round then continues automatically.",
        },
        {
          q: "Can I join a round after it has started?",
          a: "No. Once a round goes live, late entry is not allowed. This helps ensure fairness because all players start the round together under the same conditions.",
        },
        {
          q: "What topics are covered in the quizzes?",
          a: "VibraXX currently uses 15 categories: Psychology & Human Behavior, Logic & Puzzles, Earth & Natural Systems, Engineering & Technology, Life Sciences & Medicine, Physical Sciences & Mathematics, Information & Computation, Sports & Entertainment, History, Geography, Science, Technology, Nature & Animals, Human Body & Health, and Language & Communication.",
        },
      ],
    },
    {
      category: "Scoring & Prizes",
      questions: [
        {
          q: "How is scoring calculated?",
          a: "Every correct answer earns 10 points. A fully correct 15-question round therefore has a maximum score of 150 points. Your monthly score is based on the total of your eligible round results for that month.",
        },
        {
          q: "How do I win the £1000 prize?",
          a: "Subject to the platform rules and eligibility checks, the participant with the highest cumulative eligible score for the relevant calendar month wins the monthly £1000 prize.",
        },
        {
          q: "What is the monthly prize activation threshold?",
          a: "The monthly prize activates only if at least 999 paid package purchases are completed during that calendar month. If that activation threshold is not met, the monthly prize is not activated for that month unless VibraXX expressly announces otherwise.",
        },
        {
          q: "What happens if there is a tie for first place?",
          a: "If multiple participants finish with the same top cumulative score, tie-breakers apply in this order: fewest incorrect answers, highest accuracy rate, and highest average score per round. If a tie still remains, VibraXX may apply an equal split or another fair resolution under the platform rules.",
        },
        {
          q: "Does the free daily practice count toward my score?",
          a: "No. Free daily practice does not affect leaderboards, monthly prize rankings, or prize eligibility. It is intended only for practice and familiarization.",
        },
        {
          q: "When do scores reset?",
          a: "Monthly scores reset at the end of each calendar month according to the platform’s official reset schedule.",
        },
      ],
    },
    {
      category: "Payments & Pricing",
      questions: [
        {
          q: "How much does it cost to play?",
          a: "Current package pricing is £3.00 for a 3-round bundle and £18.00 for a 30-round bundle, unless VibraXX states otherwise on the platform at the time of purchase.",
        },
        {
          q: "What payment methods do you accept?",
          a: "Payments are processed securely through Stripe. Available payment methods may vary depending on your region and Stripe checkout availability. We do not store your full card details on our own systems.",
        },
        {
          q: "Can I get a refund?",
          a: "Quiz round purchases are generally final because they are digital services made available immediately after purchase. Refunds are considered only in limited circumstances such as duplicate billing, clear payment processing error, or a verified platform-side fault that materially prevented use of purchased access. Please see the Refund Policy for full details.",
        },
        {
          q: "Do round credits expire?",
          a: "Unless expressly stated otherwise in a product-specific rule or promotion, purchased round access is intended to remain available on your account until used.",
        },
        {
          q: "What currency are prices in?",
          a: 'All prices are displayed in British Pounds (GBP) unless stated otherwise. If you pay in another currency, your payment provider or card issuer handles the currency conversion.',
        },
      ],
    },
    {
      category: "Rules & Fair Play",
      questions: [
        {
          q: "What are the age requirements?",
          a: "You must be at least 18 years old to use VibraXX and to be eligible for prizes.",
        },
        {
          q: "Can I have multiple accounts?",
          a: "No. Each person is allowed only one account. Creating or controlling multiple accounts may result in suspension, termination, cancellation of scores, or loss of prize eligibility.",
        },
        {
          q: "Is using external help or tools allowed?",
          a: "No. Players must answer using their own knowledge, reasoning, and judgment. External help, bots, scripts, automation, coordinated assistance, or other unfair methods are prohibited.",
        },
        {
          q: "Can I use a VPN?",
          a: "Using VPNs, proxies, or location-masking tools to bypass geographic restrictions or platform rules is prohibited. If prohibited location masking is detected, your account may be restricted and prize eligibility may be cancelled.",
        },
        {
          q: "Which countries can participate?",
          a: "VibraXX is offered only in territories and jurisdictions where the service is lawfully made available by us. Availability may change over time. Please check the Terms & Conditions for the latest permitted-jurisdiction rules.",
        },
      ],
    },
    {
      category: "Technical & Account",
      questions: [
        {
          q: "What if I experience technical issues during a quiz?",
          a: "If you experience a problem during a round, contact us as soon as reasonably possible with the date, time, and details of the issue. Platform-side faults may be reviewed under our Terms, Complaints Procedure, and Refund Policy where applicable. Problems caused by your own internet connection, device, browser, or third-party service issues may not qualify for any remedy.",
        },
        {
          q: "Which browsers are supported?",
          a: "VibraXX works best on modern versions of major browsers such as Chrome, Edge, Firefox, and Safari. Keeping your browser updated is strongly recommended.",
        },
        {
          q: "Is VibraXX mobile-friendly?",
          a: "Yes. VibraXX is designed to work across desktop, tablet, and mobile devices.",
        },
        {
          q: "How do I update my account information?",
          a: "Some account details are linked to your Google sign-in. Platform-specific profile information may be managed through your account area where available.",
        },
        {
          q: "How do I delete my account?",
          a: "Contact us at team@vibraxx.com using your registered email address and request account closure. We will review and process the request in accordance with applicable legal and data-retention requirements.",
        },
      ],
    },
    {
      category: "Prizes & Payouts",
      questions: [
        {
          q: "How are winners paid?",
          a: "Eligible winners are contacted using their registered contact details after the relevant month ends. Prize payment is made only after verification, eligibility review, and any required compliance checks are completed.",
        },
        {
          q: "How long does it take to receive my prize?",
          a: "Winner notification is usually sent within 3 business days after the end of the relevant month. Payment timing depends on how quickly verification and compliance checks are completed.",
        },
        {
          q: "Are prizes taxable?",
          a: "Prize winners are responsible for their own tax obligations where applicable. VibraXX does not provide personal tax advice, so you should consult a qualified adviser if needed.",
        },
        {
          q: "What if I cannot complete prize verification?",
          a: "If required identity, ownership, jurisdiction, or compliance checks cannot be completed successfully, the prize may be delayed, withheld, or refused in accordance with the platform rules.",
        },
      ],
    },
    {
      category: "About VibraXX",
      questions: [
        {
          q: "Who operates VibraXX?",
          a: "VibraXX is operated by Sermin Limited, a company registered in England and Wales under company number 16778648. Registered office: 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom.",
        },
        {
          q: "Is VibraXX gambling or a game of chance?",
          a: "No. VibraXX is designed as a skill-based knowledge competition platform. Outcomes are determined by knowledge, accuracy, and performance rather than chance.",
        },
        {
          q: "Can I watch quiz competitions live?",
          a: "Live broadcast features may be introduced or expanded by VibraXX over time. Any currently available or upcoming viewing features will be announced on the platform.",
        },
        {
          q: "How can I contact support?",
          a: "Email us at team@vibraxx.com for support, technical issues, complaints, or general platform questions. For corporate matters, you can also use contact@sermin.uk.",
        },
      ],
    },
  ];

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
          background: #06b6d4;
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
          background: #0ea5e9;
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
          background: radial-gradient(circle at 0 0, #06b6d4, #0ea5e9);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
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
            rgba(6, 182, 212, 0.15),
            rgba(14, 165, 233, 0.1)
          );
          border: 1px solid rgba(6, 182, 212, 0.3);
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 50% 0%,
            rgba(6, 182, 212, 0.2),
            transparent 70%
          );
          pointer-events: none;
        }

        .hero-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4, #0ea5e9);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 40px rgba(6, 182, 212, 0.4);
          position: relative;
        }

        .hero-title {
          font-size: clamp(32px, 6vw, 48px);
          font-weight: 800;
          margin-bottom: 16px;
          background: linear-gradient(90deg, #06b6d4, #0ea5e9, #06b6d4);
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

        .faq-category {
          margin-bottom: 32px;
        }

        .category-title {
          font-size: clamp(20px, 4vw, 24px);
          font-weight: 800;
          color: #0ea5e9;
          margin-bottom: 16px;
          padding-bottom: 10px;
          border-bottom: 2px solid rgba(6, 182, 212, 0.3);
        }

        .faq-item {
          background: rgba(9, 9, 13, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          margin-bottom: 12px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .faq-item:hover {
          border-color: rgba(6, 182, 212, 0.3);
        }

        .faq-question {
          padding: 20px 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          transition: all 0.2s;
          user-select: none;
        }

        .faq-question:hover {
          background: rgba(6, 182, 212, 0.05);
        }

        .faq-question-text {
          font-size: 16px;
          font-weight: 700;
          color: #cbd5e1;
          flex: 1;
        }

        .faq-icon {
          flex-shrink: 0;
          color: #06b6d4;
          transition: transform 0.3s;
        }

        .faq-icon.open {
          transform: rotate(180deg);
        }

        .faq-answer {
          padding: 0 24px;
          max-height: 0;
          overflow: hidden;
          transition: all 0.3s ease-in-out;
          color: #94a3b8;
          font-size: 15px;
          line-height: 1.8;
          white-space: pre-line;
        }

        .faq-answer.open {
          padding: 0 24px 20px;
          max-height: 1000px;
        }

        @media (max-width: 768px) {
          .faq-question {
            padding: 16px 20px;
          }

          .faq-question-text {
            font-size: 15px;
          }

          .faq-answer {
            font-size: 14px;
          }

          .faq-answer.open {
            padding: 0 20px 16px;
          }
        }

        .contact-box {
          padding: 32px;
          border-radius: 20px;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.3);
          text-align: center;
          margin-top: 48px;
        }

        .contact-box h3 {
          font-size: 24px;
          font-weight: 800;
          color: #0ea5e9;
          margin-bottom: 16px;
        }

        .contact-box p {
          font-size: 15px;
          color: #cbd5e1;
          margin-bottom: 20px;
          line-height: 1.7;
        }

        .contact-box a {
          color: #06b6d4;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
        }

        .contact-box a:hover {
          color: #0ea5e9;
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

          .contact-box {
            padding: 24px 20px;
          }

          .contact-box h3 {
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
                    color: "#67e8f9",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    whiteSpace: "nowrap",
                  }}
                >
                  FAQ
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
              <HelpCircle style={{ width: 40, height: 40, color: "white" }} />
            </div>
            <h1 className="hero-title animate-shimmer">Frequently Asked Questions</h1>
            <p className="hero-subtitle">
              Find answers to common questions about VibraXX. If anything here differs from our
              formal legal documents, the Terms & Conditions and related policies will prevail.
            </p>
          </div>

          {faqs.map((category, catIndex) => (
            <div key={catIndex} className="faq-category">
              <h2 className="category-title">{category.category}</h2>

              {category.questions.map((item, qIndex) => {
                const uniqueIndex = catIndex * 100 + qIndex;
                const isOpen = openIndex === uniqueIndex;

                return (
                  <div key={qIndex} className="faq-item">
                    <div className="faq-question" onClick={() => toggleFAQ(uniqueIndex)}>
                      <span className="faq-question-text">{item.q}</span>
                      <ChevronDown
                        className={`faq-icon ${isOpen ? "open" : ""}`}
                        style={{ width: 20, height: 20 }}
                      />
                    </div>

                    <div className={`faq-answer ${isOpen ? "open" : ""}`}>{item.a}</div>
                  </div>
                );
              })}
            </div>
          ))}

          <div className="contact-box">
            <h3>Still Have Questions?</h3>
            <p>
              If you could not find the answer you were looking for, our support team is here to
              help.
              <br />
              Email us at <a href="mailto:team@vibraxx.com">team@vibraxx.com</a> and we will reply
              as soon as reasonably possible.
            </p>
            <p style={{ marginTop: 24, fontSize: 14, color: "#64748b" }}>
              <strong>Company Information:</strong>
              <br />
              Sermin Limited | Company No. 16778648
              <br />
              71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, UK
              <br />
              General Inquiries: <a href="mailto:contact@sermin.uk">contact@sermin.uk</a>
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