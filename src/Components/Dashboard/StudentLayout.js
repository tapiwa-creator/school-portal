import StudentSidebar from "./StudentSidebar";
import StudentHeader from "./StudentHeader";
import { CheckCircle } from "lucide-react";

export default function StudentLayout({ children }) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap"
        rel="stylesheet"
      />

      {/*
        Outer shell: fixed to the viewport.
        Only change: overflow set to visible so modals can appear above layout.
      */}
      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          overflow: "visible", // <CheckCircle className="w-5 h-5 inline-block mr-1" /> changed from "hidden"
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Sidebar */}
        <div style={{ flexShrink: 0, overflow: "hidden" }}>
          <StudentSidebar />
        </div>

        {/* Right column: header + scrollable content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            overflow: "hidden",
            background: "#f4f6f2",
          }}
        >
          {/* Header — never scrolls */}
          <StudentHeader />

          {/* Content — only this scrolls */}
          <main style={{ flex: 1, overflowY: "auto" }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}