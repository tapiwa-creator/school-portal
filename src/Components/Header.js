import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <header className="bg-[#f7f9f7] sticky top-0 z-50 border-b border-[#0d4a2f]/10">
        <div className="w-full px-6 sm:px-10 lg:px-14 xl:px-16 py-3.5 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#0d4a2f]/20 shadow-sm flex-shrink-0">
              <img
                src="/image.png"
                alt="Corner Stone Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[#0d2018] font-bold text-sm sm:text-base tracking-wide font-serif leading-tight">
                Corner Stone
              </span>
              <span className="text-[#22a86a] text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase">
                Primary School
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => handleLinkClick(link)}
                className="text-[#4a6b57] hover:text-[#0d4a2f] text-sm font-medium tracking-wide transition-colors duration-200 bg-transparent border-none cursor-pointer"
              >
                {link}
              </button>
            ))}

            {/* Divider */}
            <div className="w-px h-5 bg-[#0d4a2f]/15" />

            {isLoggedIn ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 bg-[#eaf5ef] border border-[#22a86a]/20 rounded-full pl-1.5 pr-3 py-1">
                  <div className="w-6 h-6 rounded-full bg-[#0d4a2f] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    S
                  </div>
                  <span className="text-[#0d4a2f] text-xs font-semibold">Student</span>
                </div>
                <button
                  onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 text-xs font-semibold px-3.5 py-2 rounded-full transition-all duration-200 bg-transparent cursor-pointer"
                >
                  <LogoutIcon />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#0d4a2f] hover:bg-[#1a6b43] text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transform tracking-wide"
              >
                Log In
              </Link>
            )}
          </nav>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center gap-2">
            {!isLoggedIn && (
              <Link
                to="/login"
                className="bg-[#0d4a2f] hover:bg-[#1a6b43] text-white text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200"
              >
                Log In
              </Link>
            )}
            <button
              className="text-[#0d4a2f] focus:outline-none p-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-[#0d4a2f]/10 px-6 py-4 flex flex-col gap-1 shadow-sm">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => handleLinkClick(link)}
                className="text-[#4a6b57] hover:text-[#0d4a2f] text-sm font-medium transition-colors duration-200 bg-transparent border-none text-left cursor-pointer py-2.5 border-b border-gray-100"
              >
                {link}
              </button>
            ))}

            {isLoggedIn ? (
              <div className="pt-3 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#0d4a2f] flex items-center justify-center text-white text-xs font-bold">
                    S
                  </div>
                  <span className="text-[#0d2018] text-sm font-semibold">Student</span>
                </div>
                <button
                  onClick={() => { setMenuOpen(false); setShowConfirm(true); }}
                  className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-semibold bg-transparent border-none text-left cursor-pointer transition-colors duration-200"
                >
                  <LogoutIcon />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#0d4a2f] hover:bg-[#1a6b43] text-white text-sm font-semibold px-6 py-2.5 rounded-full text-center transition-all duration-200 mt-2"
                onClick={() => setMenuOpen(false)}
              >
                Log In
              </Link>
            )}
          </div>
        )}
      </header>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showConfirm && (
        <div
          onClick={() => setShowConfirm(false)}
          className="fixed inset-0 z-[99999] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl text-center w-full max-w-[340px]"
            style={{
              padding: "32px 28px 24px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.14)",
              animation: "modalIn 0.18s ease",
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#fff5f5", border: "1.5px solid #fecaca" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-1.5">Log Out?</h2>
            <p className="text-sm text-gray-400 mb-7 leading-relaxed">
              Are you sure you want to log out of the Student Portal? Any unsaved changes will be lost.
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-[#f0faf5] transition-colors"
                style={{ color: "#0d4a2f" }}
              >
                Stay
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-85 transition-opacity"
                style={{
                  background: "linear-gradient(135deg,#b91c1c,#ef4444)",
                  boxShadow: "0 4px 12px rgba(239,68,68,0.25)",
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
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);    }
        }
      `}</style>
    </>
  );
};

export default Header;