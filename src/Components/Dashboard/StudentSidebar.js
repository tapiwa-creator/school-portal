// ─────────────────────────────────────────────────────────────────────────────
// StudentSidebar.jsx
// Drop this file into the SAME folder as StudentLayout.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

// ── STEP 1: Icons defined first (arrow functions are NOT hoisted) ─────────────

const DashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
const ResultsIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
const TimetableIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const AssignIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
const EventsIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></svg>;
const FeeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>;
const PerfIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const ProfileIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const SettingsIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /><line x1="4.93" y1="4.93" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.07" y2="19.07" /><line x1="4.93" y1="19.07" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.07" y2="4.93" /></svg>;
const LogoutIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;

// ── STEP 2: Nav arrays defined AFTER icons ────────────────────────────────────

const NAV_MAIN = [
  { label: "Dashboard", path: "/student", Icon: DashIcon },
  { label: "My Results", path: "/student/results", Icon: ResultsIcon },
  { label: "Timetable", path: "/student/timetable", Icon: TimetableIcon },
  { label: "Assignments", path: "/student/assignments", Icon: AssignIcon, badge: 3 },
  { label: "Events", path: "/student/events", Icon: EventsIcon },
  { label: "Fee Payments", path: "/student/fees", Icon: FeeIcon },
  // Compliance module removed
  { label: "Performance", path: "/student/performance", Icon: PerfIcon },
  { label: "Profile", path: "/student/profile", Icon: ProfileIcon },
];

const NAV_BOTTOM = [];

// ── STEP 3: NavItem component ─────────────────────────────────────────────────

function NavItem({ label, path, Icon, badge, pathname, onNavigate }) {
  const active = pathname === path;
  return (
    <Link
      to={path}
      onClick={onNavigate}
      style={{ textDecoration: "none" }}
      className={
        "flex items-center gap-3 mx-2 my-0.5 py-2.5 rounded-xl transition-colors duration-150 group " +
        (active
          ? "bg-white/[0.12] border-l-[3px] border-white/70 px-[11px]"
          : "border-l-[3px] border-transparent px-3.5 hover:bg-white/[0.06]")
      }
    >
      {/* Icon — dims when inactive, full white on active/hover */}
      <span className={"flex items-center flex-shrink-0 " + (active ? "text-white" : "text-white/55 group-hover:text-white")}>
        <Icon />
      </span>

      {/* Label — ALWAYS WHITE */}
      <span className={"flex-1 text-[13px] text-white " + (active ? "font-semibold" : "font-normal")}>
        {label}
      </span>

      {badge && (
        <span className="flex items-center justify-center w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex-shrink-0">
          {badge}
        </span>
      )}
    </Link>
  );
}

// ── STEP 4: Sidebar inner content (shared between desktop & mobile drawer) ────

function SidebarContent({ pathname, onNavigate, onLogout }) {
  return (
    <>
      {/* Brand block */}
      <div
        className="flex items-center gap-3 px-5 py-[22px]"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <img
            src="/image.png"
            alt="CS"
            className="w-full h-full object-cover"
            onError={e => {
              e.target.style.display = "none";
              e.target.parentNode.innerHTML = `<span style="color:#fff;font-weight:800;font-size:13px">CS</span>`;
            }}
          />
        </div>

        <div>
          {/* <CheckCircle className="w-5 h-5 inline-block mr-1" /> White brand name */}
          <p className="text-white font-bold text-[13.5px] leading-tight tracking-wide">
            CORNER STONE
          </p>
          {/* <CheckCircle className="w-5 h-5 inline-block mr-1" /> Yellow subtitle */}
          <p
            className="text-[10px] font-semibold tracking-[0.1em] uppercase mt-0.5"
            style={{ color: "#c8a84b" }}
          >
            Student Portal
          </p>
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 pt-5 pb-2">
        <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-white/30">
          Main Menu
        </span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto pb-2">
        {NAV_MAIN.map(item => (
          <NavItem key={item.path} {...item} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* Bottom: settings + logout */}
      <div
        className="pt-2 pb-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        {NAV_BOTTOM.map(item => (
          <NavItem key={item.path} {...item} pathname={pathname} onNavigate={onNavigate} />
        ))}

        {/* <CheckCircle className="w-5 h-5 inline-block mr-1" /> Logout — red */}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 mx-2 my-0.5 px-3.5 py-2.5 rounded-xl w-[calc(100%-16px)] text-left bg-transparent border-none cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/[0.12] transition-colors duration-150"
        >
          <span className="flex items-center flex-shrink-0"><LogoutIcon /></span>
          <span className="text-[13px] font-normal">Logout</span>
        </button>
      </div>
    </>
  );
}

// ── STEP 5: Main sidebar component ───────────────────────────────────────────

export default function StudentSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setMobileOpen(false);
    setShowConfirm(true);
  };

  const handleMobileNav = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* ════════════════════ MOBILE TOP BAR ════════════════════ */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-[9998] flex items-center justify-between px-4 h-14"
        style={{ background: "#0d2818", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <img
              src="/image.png"
              alt="CS"
              className="w-full h-full object-cover"
              onError={e => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML = `<span style="color:#fff;font-weight:800;font-size:12px">CS</span>`;
              }}
            />
          </div>
          <div>
            <p className="text-white font-bold text-[12.5px] leading-tight tracking-wide">CORNER STONE</p>
            <p className="text-[9px] font-semibold tracking-[0.1em] uppercase" style={{ color: "#c8a84b" }}>Student Portal</p>
          </div>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex flex-col justify-center items-center w-9 h-9 rounded-lg gap-[5px] bg-transparent border-none cursor-pointer hover:bg-white/[0.08] transition-colors"
          aria-label="Open menu"
        >
          <span className="block w-5 h-[2px] bg-white rounded-full" />
          <span className="block w-5 h-[2px] bg-white rounded-full" />
          <span className="block w-5 h-[2px] bg-white rounded-full" />
        </button>
      </div>

      {/* ════════════════════ MOBILE DRAWER OVERLAY ════════════════════ */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-[9999]"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
        >
          <aside
            onClick={e => e.stopPropagation()}
            className="flex flex-col h-full"
            style={{ width: 240, background: "#0d2818", animation: "slideIn 0.22s ease" }}
          >
            <SidebarContent
              pathname={pathname}
              onNavigate={handleMobileNav}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* ════════════════════ DESKTOP SIDEBAR ════════════════════ */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 h-screen"
        style={{ width: 240, background: "#0d2818" }}
      >
        <SidebarContent
          pathname={pathname}
          onNavigate={undefined}
          onLogout={handleLogout}
        />
      </aside>

      {/* ════════════════════ LOGOUT MODAL ════════════════════ */}
      {showConfirm && (
        <div
          onClick={() => setShowConfirm(false)}
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl text-center w-[360px] max-w-[90%]"
            style={{ padding: "36px 32px 28px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", animation: "modalIn 0.18s ease" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "#fff5f5", border: "2px solid #fecaca" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
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
                onClick={() => { setShowConfirm(false); navigate("/"); }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-80 transition-opacity"
                style={{ background: "linear-gradient(135deg,#b91c1c,#ef4444)", boxShadow: "0 4px 14px rgba(239,68,68,0.3)" }}
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
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}