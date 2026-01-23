"use client";

export default function Footer() {
  return (
    <>
      <style jsx>{`
        .vx-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(9, 9, 13, 0.96);
          backdrop-filter: blur(16px);
          padding: 32px 16px 24px;
          text-align: center;
          color: #64748b;
          font-size: 12px;
        }

        @media (min-width: 640px) {
          .vx-footer {
            font-size: 13px;
            padding: 40px 24px 28px;
          }
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

        .vx-footer-legal {
          max-width: 800px;
          margin: 0 auto 16px;
          font-size: 11px;
          line-height: 1.6;
          color: #64748b;
        }

        .vx-footer-company {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 11px;
          color: #64748b;
        }

        @media (min-width: 640px) {
          .vx-footer-legal {
            font-size: 12px;
          }
          .vx-footer-company {
            font-size: 12px;
          }
        }

        .vx-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
      `}</style>

      <footer className="vx-footer">
        <div className="vx-container">
          <div className="vx-footer-legal">
            <strong style={{ color: "#94a3b8" }}>Educational Quiz Competition.</strong> 18+ only. This is a 100% skill-based
            knowledge competition with no element of chance. Entry fees apply. Prize pool activates with 3000+ monthly participants. See{" "}
            <a href="/terms" style={{ color: "#a78bfa", textDecoration: "underline" }}>
              Terms & Conditions
            </a>{" "}
            for full details.
          </div>

          <nav className="vx-footer-links" aria-label="Footer navigation">
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
          </nav>

          <div className="vx-footer-company">
            <div style={{ marginBottom: 8, textAlign: "center" }}>
              © 2025 VibraXX. Operated by Sermin Limited (UK)
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, textAlign: "center" }}>
              Registered in England & Wales | All rights reserved
            </div>
            <div style={{ marginBottom: 10, textAlign: "center" }}>
              <a
                href="mailto:team@vibraxx.com"
                style={{ color: "#a78bfa", textDecoration: "none", fontSize: 12, fontWeight: 600 }}
              >
                team@vibraxx.com
              </a>
            </div>
            <div style={{ fontSize: 11, textAlign: "center" }}>
              Payment processing by{" "}
              <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" style={{ color: "#a78bfa", textDecoration: "none" }}>
                Stripe
              </a>{" "}
              | Secure SSL encryption | Skill-based competition - Not gambling
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
