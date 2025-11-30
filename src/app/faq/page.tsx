"use client";

import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
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
          a: "VibraXX is a global live quiz competition platform operated by Sermin Limited. Players compete in real-time quiz battles every 15 minutes, testing their knowledge and speed to win prizes. It's 100% skill-based with no element of chance."
        },
        {
          q: "How do I sign up?",
          a: "Simply click 'Sign In with Google' on the homepage. We use Google authentication for quick, secure registration. No passwords to remember, and you'll be ready to compete in seconds."
        },
        {
          q: "Is VibraXX free to play?",
          a: "Every registered user gets one free daily practice quiz (50 questions). This practice quiz doesn't count toward prizes or leaderboards—it's purely for learning. To compete for the monthly £1000 prize, you need to purchase quiz rounds: £1 per round or £29 for 35 rounds (17% savings)."
        },
        {
          q: "Do I need to download an app?",
          a: "No. VibraXX is fully web-based and works on any device—desktop, tablet, or mobile. Just visit our website and sign in."
        }
      ]
    },
    {
      category: "How the Quiz Works",
      questions: [
        {
          q: "How often do quiz rounds start?",
          a: "New quiz rounds start automatically every 15 minutes, 24/7. You can join the lobby and wait for the next round to begin."
        },
        {
          q: "How many questions are in each round?",
          a: "Each round contains exactly 50 questions. You have 6 seconds to answer each question, followed by a 5-second explanation. The entire round takes approximately 10 minutes."
        },
        {
          q: "What happens if I don't answer in time?",
          a: "If you don't select an answer within 6 seconds, it's automatically marked as incorrect (0 points). The quiz then moves to the next question."
        },
        {
          q: "Can I join a round after it has started?",
          a: "No. Once a round begins, no one can join. This ensures fairness—everyone starts at the same time with the same questions."
        },
        {
          q: "What topics are covered in the quizzes?",
          a: "Questions cover a wide range of general knowledge topics including history, science, geography, arts, sports, current events, and more. The variety ensures that well-rounded knowledge is rewarded."
        }
      ]
    },
    {
      category: "Scoring & Prizes",
      questions: [
        {
          q: "How is scoring calculated?",
          a: "Every correct answer earns you 2 points. Maximum score per round is 100 points (50 questions × 2 points). Your monthly total score is the sum of all rounds you've played that month."
        },
        {
          q: "How do I win the £1000 prize?",
          a: "The player with the highest cumulative score for the calendar month wins £1000. You can play as many rounds as you want to increase your total. The more rounds you play correctly, the higher your score."
        },
        {
          q: "What is the 3000 participant threshold?",
          a: "The £1000 monthly prize activates only if 3000 or more unique participants compete during that month. This ensures the platform can sustain the prize pool. If the threshold isn't met, all entry fees are refunded within 14 days."
        },
        {
          q: "What happens if there's a tie for first place?",
          a: "If multiple players have the same top score: (1) The player with fewer incorrect answers wins. (2) If still tied, the prize is split equally among all tied participants."
        },
        {
          q: "Does the free daily quiz count toward my score?",
          a: "No. The free daily practice quiz does not contribute to leaderboard scores and does not qualify for prizes. It's only for practice."
        },
        {
          q: "When do scores reset?",
          a: "Scores reset at the beginning of each calendar month (00:00 UTC on the 1st). Everyone starts fresh each month with equal opportunity to win."
        }
      ]
    },
    {
      category: "Payments & Pricing",
      questions: [
        {
          q: "How much does it cost to play?",
          a: "Individual rounds cost £1 each. We also offer a value pack: 35 rounds for £29 (£0.83 per round), saving you 17%."
        },
        {
          q: "What payment methods do you accept?",
          a: "All payments are processed securely through Stripe. We accept all major credit/debit cards (Visa, Mastercard, American Express, etc.). We never store your card details."
        },
        {
          q: "Can I get a refund?",
          a: "Purchased rounds are generally non-refundable once used. However, unused rounds may be refunded within 14 days of purchase. If the monthly prize threshold (3000 participants) isn't met, all entry fees are automatically refunded. See our Refund Policy for full details."
        },
        {
          q: "Do round credits expire?",
          a: "No. Purchased round credits never expire. Use them at your own pace—today, next week, or next month."
        },
        {
          q: "What currency are prices in?",
          a: "All prices are in British Pounds (GBP). If you're paying from outside the UK, your bank or card provider will handle currency conversion."
        }
      ]
    },
    {
      category: "Rules & Fair Play",
      questions: [
        {
          q: "What are the age requirements?",
          a: "You must be at least 18 years old to participate in VibraXX competitions and be eligible for prizes."
        },
        {
          q: "Can I have multiple accounts?",
          a: "No. Each person is allowed only one account. Creating multiple accounts to gain unfair advantage will result in permanent ban and forfeiture of any prizes."
        },
        {
          q: "Is using external help or tools allowed?",
          a: "No. You must answer all questions yourself without external assistance, search engines, AI tools, or help from others. VibraXX is a test of your own knowledge and speed. Cheating results in immediate disqualification."
        },
        {
          q: "Can I use a VPN?",
          a: "VPNs are prohibited if used to bypass geographic restrictions. If we detect VPN usage to access the platform from restricted regions, your account will be banned and any prizes forfeited."
        },
        {
          q: "Which countries can participate?",
          a: "VibraXX is available in most countries. However, due to local gambling and competition laws, some regions may be restricted. Check our Terms & Conditions for the current list."
        }
      ]
    },
    {
      category: "Technical & Account",
      questions: [
        {
          q: "What if I experience technical issues during a quiz?",
          a: "If you encounter technical problems (internet disconnection, browser crash, etc.), unfortunately the round cannot be restarted or refunded. We recommend using a stable internet connection and a modern browser for the best experience."
        },
        {
          q: "Which browsers are supported?",
          a: "VibraXX works best on modern browsers: Chrome, Firefox, Safari, and Edge (latest versions). Make sure your browser is up to date for optimal performance."
        },
        {
          q: "Is VibraXX mobile-friendly?",
          a: "Yes. VibraXX is fully responsive and works seamlessly on smartphones and tablets. You can compete from any device with an internet connection."
        },
        {
          q: "How do I update my account information?",
          a: "Visit your Profile page after signing in. You can update your display name and view your competition history. Since we use Google authentication, your email is managed through your Google account."
        },
        {
          q: "How do I delete my account?",
          a: "Contact us at team@vibraxx.com with your account deletion request. We'll process it within 7 business days in accordance with GDPR and UK data protection laws."
        }
      ]
    },
    {
      category: "Prizes & Payouts",
      questions: [
        {
          q: "How are winners paid?",
          a: "Monthly winners are contacted via their registered email within 7 days after month-end. Prizes are paid via bank transfer (UK) or PayPal (international). Winners must provide valid payment details and verify their identity."
        },
        {
          q: "How long does it take to receive my prize?",
          a: "Once you've provided your payment details and completed identity verification, prizes are typically paid within 14 business days."
        },
        {
          q: "Are prizes taxable?",
          a: "Prize winners are responsible for any applicable taxes in their jurisdiction. In the UK, competition prizes are generally not subject to income tax, but you should consult a tax professional for your specific situation."
        },
        {
          q: "What if I can't claim my prize?",
          a: "Winners have 60 days to claim their prize. If unclaimed after 60 days, the prize is forfeited and may be donated to charity or added to the next month's prize pool."
        }
      ]
    },
    {
      category: "About VibraXX",
      questions: [
        {
          q: "Who operates VibraXX?",
          a: "VibraXX is operated by Sermin Limited, a company registered in England & Wales (Company Number: 16778648). Registered office: 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, UK."
        },
        {
          q: "Is VibraXX gambling or a game of chance?",
          a: "No. VibraXX is a 100% skill-based competition. Success depends entirely on your knowledge, speed, and accuracy—not luck. Under UK law, skill-based competitions are not classified as gambling."
        },
        {
          q: "Can I watch quiz competitions live?",
          a: "Yes! We broadcast live quiz rounds 24/7 on our YouTube channel. You can watch questions, explanations, and leaderboard updates in real-time, even if you're not competing."
        },
        {
          q: "How can I contact support?",
          a: "Email us at team@vibraxx.com for any questions, technical issues, or support requests. We typically respond within 24-48 hours."
        }
      ]
    }
  ];

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
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(14, 165, 233, 0.1));
          border: 1px solid rgba(6, 182, 212, 0.3);
          position: relative;
          overflow: hidden;
        }

        .hero-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.2), transparent 70%);
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
              Find answers to common questions about VibraXX. Can't find what you're looking for? Contact us!
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
                    <div 
                      className="faq-question"
                      onClick={() => toggleFAQ(uniqueIndex)}
                    >
                      <span className="faq-question-text">{item.q}</span>
                      <ChevronDown 
                        className={`faq-icon ${isOpen ? 'open' : ''}`}
                        style={{ width: 20, height: 20 }}
                      />
                    </div>
                    <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                      {item.a}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          <div className="contact-box">
            <h3>Still Have Questions?</h3>
            <p>
              If you couldn't find the answer you were looking for, our support team is here to help.
              <br />
              Email us at <a href="mailto:team@vibraxx.com">team@vibraxx.com</a> and we'll get back to you within 24-48 hours.
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
            © 2025 VibraXX. Operated by Sermin Limited | Company No. 16778648
            <br />
            Registered in England & Wales | 71-75 Shelton Street, London, WC2H 9JQ, UK
          </div>
        </footer>
      </div>
    </>
  );
}