import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const Header = ({ isLoggedIn = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const navLinks = ["Admissions", "Support"];

  const handleLinkClick = (link) => {
    navigate(`/${link.toLowerCase()}`);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    setShowConfirm(false);
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <header className="bg-[#0d4a2f] sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
              <img
                src="/image.png"
                alt="Corner Stone Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl tracking-wide font-serif leading-tight">
                Corner Stone
              </span>
              {/* ── Only this line changed: text-yellow-400 ── */}
              <span className="text-yellow-400 text-xs font-medium tracking-wider">
                Primary School
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => handleLinkClick(link)}
                className="text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors duration-200 bg-transparent border-none cursor-pointer"
              >
                {link}
              </button>
            ))}

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full pl-1 pr-3 py-1">
                  <div className="w-7 h-7 rounded-full bg-[#22a86a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    S
                  </div>
                  <span className="text-white text-xs font-medium">Student</span>
                </div>

                <button
                  onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-400/30 hover:border-red-300/40 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 bg-transparent cursor-pointer"
                >
                  <LogoutIcon />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#22a86a] hover:bg-[#1d9459] text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 transform"
              >
                Log In
              </Link>
            )}
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0a3d26] border-t border-white/10 px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => handleLinkClick(link)}
                className="text-white/75 hover:text-white text-sm font-medium transition-colors duration-200 bg-transparent border-none text-left cursor-pointer"
              >
                {link}
              </button>
            ))}

            {isLoggedIn ? (
              <button
                onClick={() => { setMenuOpen(false); setShowConfirm(true); }}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-semibold bg-transparent border-none text-left cursor-pointer transition-colors duration-200"
              >
                <LogoutIcon />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-[#22a86a] hover:bg-[#1d9459] text-white text-sm font-semibold px-6 py-2.5 rounded-full text-center transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                Log In
              </Link>
            )}
          </div>
        )}
      </header>

      {/* ════════════════ LOGOUT CONFIRMATION MODAL ════════════════ */}
      {showConfirm && (
        <div
          onClick={() => setShowConfirm(false)}
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl text-center w-[360px] max-w-[90%]"
            style={{
              padding: "36px 32px 28px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              animation: "modalIn 0.18s ease",
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "#fff5f5", border: "2px solid #fecaca" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">Log Out?</h2>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              Are you sure you want to log out of the Student Portal? Any unsaved changes will be lost.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-green-50 transition-colors"
                style={{ color: "#1a4d2e" }}
              >
                Stay
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-80 transition-opacity"
                style={{
                  background: "linear-gradient(135deg,#b91c1c,#ef4444)",
                  boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
                }}
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(6px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);    }
        }
      `}</style>
    </>
  );
};

export default Header;