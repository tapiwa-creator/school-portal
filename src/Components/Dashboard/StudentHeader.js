import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "../../context/Authcontext";

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IdIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <line x1="8" y1="10" x2="8" y2="10"/>
    <line x1="12" y1="10" x2="16" y2="10"/>
    <line x1="8" y1="14" x2="8" y2="14"/>
    <line x1="12" y1="14" x2="16" y2="14"/>
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

function getInitials(name) {
  if (!name) return "ST";
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function StudentHeader() {
  const { logout, userProfile, currentUser } = useAuth();
  const [dropOpen, setDropOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  // ── Student data (pulling from auth context now) ──
  const studentData = {
    name: userProfile?.fullName || userProfile?.name || currentUser?.displayName || "Student User",
    id: userProfile?.studentId || currentUser?.uid?.slice(0, 8) || "STU-001",
    program: userProfile?.grade || "Grade 1",
    year: "Current Academic Year",
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogoutClick = () => { setDropOpen(false); setShowConfirm(true); };
  
  const handleConfirmedLogout = async () => { 
    try {
      setShowConfirm(false); 
      await logout();
      navigate("/"); 
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <header style={{
        width: "100%", background: "#ffffff", borderBottom: "1px solid #f0f0f0",
        padding: "0 32px", height: "64px", display: "flex", alignItems: "center",
        justifyContent: "flex-end", gap: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        fontFamily: "'DM Sans', system-ui, sans-serif", boxSizing: "border-box",
      }}>

        {/* Bell */}
        <button style={{
          width: "38px", height: "38px", borderRadius: "50%", border: "none",
          background: "transparent", display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer", color: "#888", position: "relative", transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          aria-label="Notifications">
          <BellIcon />
          <span style={{ position: "absolute", top: "8px", right: "8px", width: "7px", height: "7px", background: "#f5a623", borderRadius: "50%", border: "1.5px solid #fff" }} />
        </button>

        {/* Avatar + Dropdown */}
        <div style={{ position: "relative" }} ref={dropRef}>
          <button onClick={() => setDropOpen(o => !o)} style={{
            display: "flex", alignItems: "center", gap: "10px", padding: "6px 10px 6px 6px",
            borderRadius: "40px", border: "1px solid transparent",
            background: dropOpen ? "#f5f5f5" : "transparent", cursor: "pointer", transition: "background 0.15s",
          }}
            onMouseEnter={e => { if (!dropOpen) e.currentTarget.style.background = "#f9f9f9"; }}
            onMouseLeave={e => { if (!dropOpen) e.currentTarget.style.background = "transparent"; }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "linear-gradient(135deg, #1a4d2e, #3a8c5c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: "700", fontSize: "13px", flexShrink: 0,
            }}>
              {getInitials(studentData.name)}
            </div>
            <div style={{ textAlign: "left", lineHeight: 1 }}>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1a1a1a" }}>{studentData.name}</p>
              <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#888", fontWeight: "400" }}>{studentData.program}</p>
            </div>
            <span style={{ color: "#aaa", display: "flex", transform: dropOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
              <ChevronDown />
            </span>
          </button>

          {/* Dropdown */}
          {dropOpen && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 8px)", width: "260px",
              background: "#fff", borderRadius: "14px", border: "1px solid #ebebeb",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)", overflow: "hidden", zIndex: 100, animation: "dropIn 0.15s ease",
            }}>
              <style>{`@keyframes dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

              {/* Header */}
              <div style={{ padding: "18px 20px", background: "linear-gradient(135deg,#f4faf5,#eaf5ec)", borderBottom: "1px solid #e8f0e9", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg,#1a4d2e,#3a8c5c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "15px", flexShrink: 0 }}>
                  {getInitials(studentData.name)}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: "700", color: "#1a1a1a", fontSize: "15px" }}>{studentData.name}</p>
                  <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#5a9a68", fontWeight: "500" }}>{studentData.program} · {studentData.year}</p>
                </div>
              </div>

              {/* Student ID */}
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "#999", display: "flex" }}><IdIcon /></span>
                <div>
                  <p style={{ margin: 0, fontSize: "11px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Student ID</p>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", fontWeight: "600", color: "#333", fontFamily: "monospace" }}>{studentData.id}</p>
                </div>
              </div>

              {/* Logout */}
              <button onClick={handleLogoutClick} style={{
                width: "100%", padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px",
                background: "none", border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.15s", color: "#e05252",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}>
                <LogoutIcon />
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Logout Modal */}
      {showConfirm && (
        <div onClick={() => setShowConfirm(false)} className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl text-center w-[360px] max-w-[90%]"
            style={{ padding: "36px 32px 28px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", animation: "modalIn 0.18s ease" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "#fff5f5", border: "2px solid #fecaca" }}>
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
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-green-50 transition-colors"
                style={{ color: "#1a4d2e" }}>Stay</button>
              <button onClick={handleConfirmedLogout}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-80 transition-opacity"
                style={{ background: "linear-gradient(135deg,#b91c1c,#ef4444)", boxShadow: "0 4px 14px rgba(239,68,68,0.3)" }}>
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.95) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </>
  );
}