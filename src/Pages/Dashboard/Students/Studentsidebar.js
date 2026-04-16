import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { School } from "lucide-react";

const NAV_ITEMS = [
  { 
    label: "Dashboard", 
    path: "/student",
    icon: (className) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    )
  },
  { 
    label: "My Results", 
    path: "/student/results",
    icon: (className) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    )
  },
  { 
    label: "Timetable", 
    path: "/student/timetable",
    icon: (className) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )
  },
  { 
    label: "Assignments", 
    path: "/student/assignments",
    badge: 3,
    icon: (className) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    )
  },
  { 
    label: "Fee Payments", 
    path: "/student/fees",
    icon: (className) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    )
  },
  { 
    label: "Compliance", 
    path: "/student/compliance",
    icon: (className) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    )
  },
  { 
    label: "Performance", 
    path: "/student/performance",
    icon: (className) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    )
  },
  { 
    label: "Profile", 
    path: "/student/profile",
    icon: (className) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    )
  }
];

const BOTTOM_ITEMS = [
  { 
    label: "Settings", 
    path: "/student/settings",
    icon: (className) => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="3"/>
        <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
        <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/>
        <line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/>
      </svg>
    )
  }
];

export default function StudentSidebar() {
  const { pathname } = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    // Add any session/auth cleanup here
    setShowConfirm(false);
    // Navigate to landing page
    window.location.href = "/";
  };

  // Helper to check if a path is active
  const isActive = (path) => pathname === path;

  return (
    <>
      {/* Main Layout Container */}
      <div className="flex min-h-screen bg-[#f7f8f6] font-['DM_Sans']">
        {/* Sidebar */}
        <aside className="w-60 min-h-screen bg-[#1a4d2e] flex flex-col flex-shrink-0">
          
          {/* Brand */}
          <div className="flex items-center gap-3 px-5 py-[22px] border-b border-white/10">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 text-lg"><School className="w-5 h-5 inline-block" /></div>
            <div>
              <div className="text-[13.5px] font-bold text-white tracking-wide">
                CORNER STONE
              </div>
              <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#c8a84b] mt-0.5">
                Student Portal
              </div>
            </div>
          </div>

          {/* Section Label */}
          <div className="px-5 pt-5 pb-2 text-[10px] font-semibold tracking-[0.12em] uppercase text-white/30">
            Main Menu
          </div>

          {/* Navigation */}
          <nav className="flex-1 pb-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 py-2.5 px-3.5 mx-2 rounded-lg
                  border-l-3 transition-all duration-150
                  ${isActive(item.path) 
                    ? 'bg-white/12 border-l-[3px] border-white/70 pl-[11px]' 
                    : 'border-l-3 border-transparent hover:bg-white/6'
                  }
                `}
              >
                <span className="flex items-center flex-shrink-0">
                  {item.icon(
                    `w-4 h-4 ${isActive(item.path) ? 'text-white' : 'text-white/55'} 
                    ${!isActive(item.path) && 'group-hover:text-white'}`
                  )}
                </span>
                <span className={`
                  text-sm flex-1
                  ${isActive(item.path) ? 'font-semibold text-white' : 'font-normal text-white'}
                `}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className="text-[10px] font-bold bg-red-500 text-white rounded-full w-[18px] h-[18px] flex items-center justify-center flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-white/10 py-2 pb-3">
            {BOTTOM_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 py-2.5 px-3.5 mx-2 rounded-lg
                  border-l-3 transition-all duration-150
                  ${isActive(item.path) 
                    ? 'bg-white/12 border-l-[3px] border-white/70 pl-[11px]' 
                    : 'border-l-3 border-transparent hover:bg-white/6'
                  }
                `}
              >
                <span className="flex items-center flex-shrink-0">
                  {item.icon(
                    `w-4 h-4 ${isActive(item.path) ? 'text-white' : 'text-white/55'} 
                    ${!isActive(item.path) && 'group-hover:text-white'}`
                  )}
                </span>
                <span className={`
                  text-sm flex-1
                  ${isActive(item.path) ? 'font-semibold text-white' : 'font-normal text-white'}
                `}>
                  {item.label}
                </span>
              </Link>
            ))}

            {/* Logout Button */}
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-3 py-2.5 px-3.5 mx-2 rounded-lg w-[calc(100%-16px)] text-left text-sm font-normal text-red-500 hover:bg-red-500/12 hover:text-red-300 transition-all duration-150"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>
        </aside>

        {/* Demo Content Area */}
        <div className="flex-1 p-8 flex flex-col gap-3">
          <div className="bg-white rounded-xl p-6 border border-[#ebebeb] text-sm text-[#444]">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-1.5">Sidebar Preview</h2>
            <p>This is a live preview of the sidebar design. The sidebar on the left shows:</p>
            <ul className="mt-2.5 pl-5 space-y-1">
              <li className="list-disc">Background: single dark green <code className="bg-gray-100 px-1 rounded">#1a4d2e</code></li>
              <li className="list-disc">"Student Portal" label: gold/yellow <code className="bg-gray-100 px-1 rounded">#c8a84b</code></li>
              <li className="list-disc">All nav options: white <code className="bg-gray-100 px-1 rounded">#ffffff</code></li>
              <li className="list-disc">Logout button: red <code className="bg-gray-100 px-1 rounded">#ef4444</code></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div
          onClick={() => setShowConfirm(false)}
          className="fixed inset-0 z-[999999] bg-black/50 backdrop-blur-sm flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-10 pt-9 pb-8 w-[360px] max-w-[90%] text-center shadow-2xl animate-modalIn relative"
          >
            {/* Door Icon */}
            <div className="w-[68px] h-[68px] rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center text-3xl mx-auto mb-[22px]">
              
            </div>

            {/* Heading */}
            <h2 className="text-xl font-bold text-[#1a2e1c] mb-2.5">
              Log Out?
            </h2>

            {/* Body Text */}
            <p className="text-sm text-[#6b7f6e] mb-8 leading-relaxed">
              Are you sure you want to log out of the Student Portal?
              Any unsaved changes will be lost.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2.5">
              {/* Stay Button */}
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-lg border-2 border-[#dde8dc] bg-white text-sm font-semibold text-[#2d6a4f] hover:bg-[#f0f7f2] transition-colors duration-150"
              >
                Stay
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-lg border-none bg-gradient-to-r from-red-700 to-red-500 text-sm font-semibold text-white shadow-lg shadow-red-500/35 hover:opacity-85 transition-opacity duration-150"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add custom animation to tailwind */}
      <style>{`
        @keyframes modalIn {
          from { 
            opacity: 0; 
            transform: scale(0.94) translateY(8px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        .animate-modalIn {
          animation: modalIn 0.2s ease;
        }
      `}</style>
    </>
  );
}