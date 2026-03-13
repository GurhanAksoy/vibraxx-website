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
            <strong style={{ color: "#94a3b8" }}>18+ · Knowledge Competition · Not Gambling.</strong>{" "}
            VibraXX is a paid-entry, skill-based quiz. No element of chance. Entry fees non-refundable except where required by law.
            The £1,000 monthly prize activates upon reaching the sales milestone — see{" "}
            <a href="/terms" style={{ color: "#a78bfa", textDecoration: "underline" }}>Terms &amp; Conditions</a>.
            One free round credited daily, resets at midnight UTC.
            Not affiliated with or endorsed by Google.
          </div>

          <nav className="vx-footer-links" aria-label="Footer navigation">
            <a href="/privacy">Privacy Policy</a>
            <span className="vx-footer-divider" />
            <a href="/terms">Terms &amp; Conditions</a>
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
              © {new Date().getFullYear()} VibraXX. Operated by Sermin Limited
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, textAlign: "center" }}>
              Company No. 16778648 · Registered in England &amp; Wales
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, textAlign: "center" }}>
              71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, United Kingdom
            </div>
            <div style={{ marginBottom: 6, textAlign: "center" }}>
              <a
                href="mailto:team@vibraxx.com"
                style={{ color: "#a78bfa", textDecoration: "none", fontSize: 12, fontWeight: 600 }}
              >
                team@vibraxx.com
              </a>
            </div>
            <div style={{ marginBottom: 10, textAlign: "center" }}>
              <a
                href="mailto:contact@sermin.uk"
                style={{ color: "#64748b", textDecoration: "none", fontSize: 11 }}
              >
                contact@sermin.uk
              </a>
            </div>
            <div style={{ fontSize: 11, textAlign: "center" }}>
              Payment processing by{" "}
              <a
                href="https://stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#a78bfa", textDecoration: "none" }}
              >
                Stripe
              </a>{" "}
              · SSL encrypted · This is not gambling
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}
