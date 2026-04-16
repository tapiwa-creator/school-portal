import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

// ── Footer link ────────────────────────────────────────────────────────────
const FooterLink = ({ to, href, children }) => {
  const base = "block text-[13px] text-white/60 hover:text-white transition-colors duration-200 mb-2.5 no-underline";
  return to
    ? <Link to={to} className={base}>{children}</Link>
    : <a href={href || "#"} className={base}>{children}</a>;
};

// ── Column title ───────────────────────────────────────────────────────────
const ColTitle = ({ children }) => (
  <p
    className="text-[11px] font-bold tracking-[0.12em] uppercase mb-4"
    style={{ color: "#c8a84b" }}
  >
    {children}
  </p>
);

// ── Component ──────────────────────────────────────────────────────────────
export default function Footer() {
  return (
    <footer
      className="font-sans"
      style={{ background: "#0d2818", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Main grid ── */}
      <div className="footer-container">
        {/* Brand column */}
        <div className="footer-brand">
          {/* Logo + name */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <img
                src="/image.png"
                alt="Corner Stone"
                className="w-full h-full object-cover"
                onError={e => {
                  e.target.style.display = "none";
                  e.target.parentNode.innerHTML = `<span style="color:#fff;font-weight:800;font-size:13px">CS</span>`;
                }}
              />
            </div>
            <div>
              <p className="text-white font-bold text-[15px] leading-tight tracking-wide">
                CORNER STONE
              </p>
              <p
                className="text-[10px] font-semibold tracking-[0.1em] uppercase mt-0.5"
                style={{ color: "#c8a84b" }}
              >
                Student Portal
              </p>
            </div>
          </div>

          {/* Tagline */}
          <p className="footer-tagline">
            Empowering students with a modern academic experience — nurturing excellence, character, and lifelong curiosity.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <ColTitle>Quick Links</ColTitle>
          <FooterLink to="/">Home</FooterLink>
          <FooterLink to="/admissions">Admissions</FooterLink>
          <FooterLink to="/support">Support</FooterLink>
          <FooterLink to="/login">Portal Login</FooterLink>
        </div>

        {/* Admissions */}
        <div className="footer-section">
          <ColTitle>Admissions</ColTitle>
          <FooterLink to="/admissions">Apply Now</FooterLink>
          <FooterLink href="#">Eligibility Criteria</FooterLink>
          <FooterLink href="#">Fee Structure</FooterLink>
          <FooterLink href="#">Academic Calendar</FooterLink>
          <FooterLink href="#">Term Dates</FooterLink>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <ColTitle>Contact Us</ColTitle>
          <div className="flex flex-col gap-3">
            {[
              { icon: <MapPin className="w-5 h-5" />, text: "14 Main Road, Harare, Zimbabwe" },
              { icon: <Phone className="w-5 h-5" />, text: "+263 4 123 4567" },
              { icon: <Mail className="w-5 h-5" />, text: "admissions@cornerstone.edu" },
              { icon: <Clock className="w-5 h-5" />, text: "Mon – Fri, 07:30 – 17:00" },
            ].map(({ icon, text }) => (
              <div key={text} className="footer-contact-item">
                <span className="footer-contact-icon">{icon}</span>
                <span className="footer-contact-text">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="footer-divider">
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} Corner Stone College. All rights reserved.
        </p>
        <div className="footer-links">
          {["Privacy Policy", "Terms of Use", "Cookie Policy"].map(item => (
            <a
              key={item}
              href="#"
              className="footer-bottom-link"
            >
              {item}
            </a>
          ))}
        </div>
      </div>

      {/* Mobile Responsive Styles */}
      <style>{`
        /* Main container styles */
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 56px 48px 40px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
        }

        /* Brand column */
        .footer-brand {
          grid-column: span 1;
        }

        .footer-tagline {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          line-height: 1.6;
          font-weight: 300;
          max-width: 260px;
          margin-bottom: 24px;
        }

        /* Contact items */
        .footer-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .footer-contact-icon {
          font-size: 13px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .footer-contact-text {
          font-size: 12px;
          color: rgba(255,255,255,0.55);
          line-height: 1.5;
        }

        /* Divider */
        .footer-divider {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px;
        }

        /* Bottom bar */
        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .footer-copyright {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          margin: 0;
        }

        .footer-links {
          display: flex;
          gap: 24px;
        }

        .footer-bottom-link {
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-bottom-link:hover {
          color: rgba(255,255,255,0.7);
        }

        /* Tablet Styles (768px - 1024px) */
        @media (max-width: 1024px) {
          .footer-container {
            padding: 48px 32px 40px;
            gap: 36px;
          }
          
          .footer-divider {
            padding: 0 32px;
          }
          
          .footer-bottom {
            padding: 20px 32px;
          }
        }

        /* Mobile Styles (640px - 768px) */
        @media (max-width: 768px) {
          .footer-container {
            grid-template-columns: 1fr;
            padding: 40px 24px 32px;
            gap: 32px;
          }
          
          .footer-brand {
            text-align: center;
          }
          
          .flex.items-center.gap-3 {
            justify-content: center;
          }
          
          .footer-tagline {
            max-width: 100%;
            text-align: center;
            margin: 0 auto 24px;
          }
          
          .footer-section {
            text-align: center;
          }
          
          .footer-section .flex.flex-col {
            align-items: center;
          }
          
          .footer-contact-item {
            justify-content: center;
          }
          
          .footer-divider {
            padding: 0 24px;
          }
          
          .footer-bottom {
            padding: 20px 24px;
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }
          
          .footer-links {
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
          }
        }

        /* Small Mobile Styles (below 640px) */
        @media (max-width: 640px) {
          .footer-container {
            padding: 32px 20px 28px;
            gap: 28px;
          }
          
          .footer-divider {
            padding: 0 20px;
          }
          
          .footer-bottom {
            padding: 16px 20px;
          }
          
          .footer-links {
            flex-direction: column;
            gap: 12px;
          }
          
          .footer-copyright {
            font-size: 11px;
          }
          
          .footer-bottom-link {
            font-size: 11px;
          }
          
          .footer-tagline {
            font-size: 12px;
          }
          
          .footer-contact-text {
            font-size: 11px;
          }
        }

        /* Extra Small Mobile (below 480px) */
        @media (max-width: 480px) {
          .footer-container {
            padding: 28px 16px 24px;
            gap: 24px;
          }
          
          .footer-divider {
            padding: 0 16px;
          }
          
          .footer-bottom {
            padding: 16px;
          }
          
          .footer-links {
            gap: 10px;
          }
          
          .footer-section .flex.flex-col {
            gap: 12px;
          }
          
          .footer-contact-item {
            gap: 8px;
          }
        }

        /* Hover effects */
        .footer-bottom-link:hover,
        .footer-link:hover {
          color: rgba(255,255,255,0.7);
          transition: color 0.2s ease;
        }

        /* Animation for responsive transitions */
        .footer-container,
        .footer-bottom,
        .footer-section {
          transition: all 0.3s ease;
        }
      `}</style>
    </footer>
  );
}