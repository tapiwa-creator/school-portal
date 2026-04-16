import AdminLayout from "../../../Components/Dashboard/AdminLayout";
import { FileText, ClipboardList, GraduationCap, Calendar } from "lucide-react";

const C = {
  greenDark: "#1a4d2e",
  greenAccent: "#3a8c5c",
  greenLight: "#e8f5ee",
  gold: "#c8a84b",
  border: "#d4e6da",
  white: "#fff",
  textDark: "#111",
  textMid: "#444",
  textLight: "#888",
  red: "#e74c3c",
  amber: "#f59e0b",
};

const StatCard = ({ icon, label, value, sub, color }) => (
  <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px 24px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: color }} />
    <div style={{ fontSize: 26, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: C.textDark, fontFamily: "'Playfair Display', serif" }}>{value}</div>
    <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark, marginTop: 4 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: C.textLight, marginTop: 3 }}>{sub}</div>}
  </div>
);

const RecentRow = ({ name, grade, status, date }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.greenLight}` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.greenLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}><GraduationCap className="w-5 h-5 inline-block" /></div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.textDark }}>{name}</div>
        <div style={{ fontSize: 11, color: C.textLight }}>{grade}</div>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <span style={{ fontSize: 11, color: C.textLight }}>{date}</span>
      <span style={{
        fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
        background: status === "Active" ? C.greenLight : "#fff3cd",
        color: status === "Active" ? C.greenAccent : "#92400e",
      }}>{status}</span>
    </div>
  </div>
);

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard" subtitle="Welcome back, Administrator">
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32, animation: "fadeUp .4s ease" }}>
        <StatCard icon=<GraduationCap className="w-5 h-5" /> label="Total Students" value="1,248" sub="↑ 12 this term" color={C.greenAccent} />
        <StatCard icon=<FileText className="w-5 h-5" /> label="Pending Assignments" value="14" sub="Awaiting submission" color={C.amber} />
        <StatCard icon=<ClipboardList className="w-5 h-5" /> label="Tests Conducted" value="38" sub="This term" color="#3b82f6" />
        <StatCard icon=<Calendar className="w-5 h-5" /> label="Upcoming Events" value="5" sub="Next 30 days" color={C.red} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, animation: "fadeUp .5s ease" }}>

        {/* Recent students */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textDark, margin: 0 }}>Recently Enrolled Students</h3>
            <a href="/admin/students" style={{ fontSize: 12, color: C.greenAccent, textDecoration: "none", fontWeight: 600 }}>View all →</a>
          </div>
          <div style={{ padding: "8px 22px 16px" }}>
            {[
              { name: "Emma Kamau", grade: "Grade 4", status: "Active", date: "Mar 1" },
              { name: "Tafara Moyo", grade: "Grade 2", status: "Active", date: "Feb 28" },
              { name: "Chidi Okafor", grade: "Grade 6", status: "Pending", date: "Feb 25" },
              { name: "Aisha Banda", grade: "Grade 1", status: "Active", date: "Feb 20" },
              { name: "Liam Dube", grade: "Grade 5", status: "Pending", date: "Feb 18" },
            ].map((s, i) => <RecentRow key={i} {...s} />)}
          </div>
        </div>

        {/* Quick actions + upcoming events */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Quick actions */}
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "18px 22px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textDark, marginBottom: 16, marginTop: 0 }}>Quick Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { icon: "", label: "Add Student", path: "/admin/students" },
                { icon: "", label: "Announcement", path: "/admin/announcements" },
                { icon: <FileText className="w-5 h-5" />, label: "New Assignment", path: "/admin/assignments" },
                { icon: <ClipboardList className="w-5 h-5" />, label: "Schedule Test", path: "/admin/tests" },
              ].map(({ icon, label, path }) => (
                <a key={label} href={path} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                  borderRadius: 10, background: C.greenLight, border: `1px solid ${C.border}`,
                  textDecoration: "none", fontSize: 13, fontWeight: 500, color: C.greenDark,
                  transition: "all .2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#d0eedd"}
                  onMouseLeave={e => e.currentTarget.style.background = C.greenLight}
                >
                  <span>{icon}</span>{label}
                </a>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "18px 22px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textDark, marginBottom: 16, marginTop: 0 }}>Upcoming Events</h3>
            {[
              { label: "End of Term Exams", date: "Mar 14", color: C.red },
              { label: "Sports Day", date: "Mar 20", color: C.greenAccent },
              { label: "Parent-Teacher Day", date: "Mar 25", color: C.gold },
              { label: "Science Fair", date: "Apr 2", color: "#3b82f6" },
              { label: "School Closure", date: "Apr 5", color: C.amber },
            ].map(({ label, date, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${C.greenLight}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: C.textDark, fontWeight: 500 }}>{label}</span>
                </div>
                <span style={{ fontSize: 11, color: C.textLight, fontWeight: 600 }}>{date}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}