import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/Authcontext";
import AdminStudentService from "../../../service/admin/StudentManagementService";
import AdminAssignmentService from "../../../service/admin/AdminAssignmentService";
import EventServices from "../../../service/admin/EventServices";
import TimetableService, { DAYS, PERIODS } from "../../../service/admin/TimetableServices";
import {
  BarChart, FileText, ClipboardList, GraduationCap,
  Calendar, Megaphone, MapPin, Search,
} from "lucide-react";

// ── Grade helpers ──────────────────────────────────────────────────────────
const calcLetter = (avg) =>
  avg >= 90 ? "A" : avg >= 85 ? "A-" : avg >= 80 ? "B+" :
    avg >= 75 ? "B" : avg >= 70 ? "B-" : avg >= 65 ? "C+" :
      avg >= 60 ? "C" : avg >= 55 ? "C-" : avg >= 50 ? "D" : "F";

const gradeColor = (avg) =>
  avg >= 80 ? "bg-green-100 text-green-600" :
    avg >= 65 ? "bg-blue-100 text-blue-600" :
      avg >= 50 ? "bg-orange-100 text-orange-500" : "bg-red-100 text-red-500";

// ── Time greeting ──────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

/**
 * Build the admin display name with title prefix.
 * Title comes from: currentUser.title | currentUser.prefix | currentUser.displayTitle
 * Name comes from: currentUser.displayName | currentUser.fullName | email prefix
 */
function buildAdminName(currentUser) {
  const raw =
    currentUser?.displayName ||
    currentUser?.fullName ||
    currentUser?.email?.split("@")[0] ||
    "Admin";

  const title =
    currentUser?.title ||
    currentUser?.prefix ||
    currentUser?.displayTitle ||
    "";

  const firstName = raw.split(" ")[0];
  return title ? `${title} ${firstName}` : firstName;
}

// ── Today's day name ───────────────────────────────────────────────────────
const TODAY_NAME = (() => {
  const d = new Date().getDay();
  return DAYS[d === 0 ? 0 : d - 1] ?? "Monday";
})();

// ── Event date label ───────────────────────────────────────────────────────
function formatEventDate(iso) {
  if (!iso) return "–";
  const d = new Date(iso);
  const diff = Math.ceil((d - new Date()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return `${Math.abs(diff)}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const EVENT_TYPE_COLOR = {
  Sports: "bg-orange-100 text-orange-700",
  Academic: "bg-blue-100 text-blue-700",
  Cultural: "bg-purple-100 text-purple-700",
  Health: "bg-red-100 text-red-700",
  Meeting: "bg-gray-100 text-gray-600",
  Ceremony: "bg-yellow-100 text-yellow-700",
  Trip: "bg-teal-100 text-teal-700",
  Fundraiser: "bg-pink-100 text-pink-700",
};

// ── ProgressBar ────────────────────────────────────────────────────────────
const ProgressBar = ({ value, max = 100, color = "bg-green-500", height = "h-2" }) => (
  <div className={`w-full ${height} bg-gray-100 rounded-full overflow-hidden`}>
    <div
      className={`${height} ${color} rounded-full transition-all duration-500`}
      style={{ width: `${Math.min((value / (max || 1)) * 100, 100)}%` }}
    />
  </div>
);

// ── Component ──────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // ── state ──
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [events, setEvents] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [search, setSearch] = useState("");

  // ── 1. Students — same service & subscription as AcademicRecords ──────
  useEffect(() => {
    const unsub = AdminStudentService.subscribeToStudents((data) => {
      setStudents(data);
    });
    return () => unsub();
  }, []);

  // ── 2. Assignments ─────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = AdminAssignmentService.subscribeToAssignments((data) => {
      if (data) setAssignments(data);
    });
    return () => unsub();
  }, []);

  // ── 3. Events ──────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = EventServices.subscribeToEvents((data) => setEvents(data));
    return () => unsub();
  }, []);

  // ── 4. Timetable (Grade 1 preview for today's schedule) ───────────────
  useEffect(() => {
    const unsub = TimetableService.subscribeToTimetable("Grade 1", (data) => {
      setTimetable(data);
    });
    return () => unsub();
  }, []);

  // ── Derived: students ──────────────────────────────────────────────────
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === "Active").length;

  // Build one result row per student using academic.term1 (same structure
  // as AcademicRecords.jsx). Each row shows overall avg, best and worst subject.
  const allResultRows = students
    .map((s) => {
      const records = s.academic?.term1 || [];
      if (records.length === 0) return null;
      const overall = Math.round(records.reduce((a, r) => a + r.avg, 0) / records.length);
      const best = records.reduce((a, b) => a.avg > b.avg ? a : b);
      const worst = records.reduce((a, b) => a.avg < b.avg ? a : b);
      return {
        id: s.id,
        name: s.name || s.fullName || "—",
        grade: s.grade || "—",
        subjects: records.length,
        best: best.subject,
        bestAvg: best.avg,
        worst: worst.subject,
        worstAvg: worst.avg,
        letter: calcLetter(overall),
        overall,
        color: gradeColor(overall),
      };
    })
    .filter(Boolean);

  // --- MODIFICATION START: Only show top 5 students by average ---
  // Sort by overall average (descending) and take top 5
  const top5Students = [...allResultRows]
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 5);

  // Filter by search — matches name, student ID, or grade, but only from top 5
  const filteredRows = top5Students.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.grade.toLowerCase().includes(q)
    );
  });

  // When search is active, show filtered results; otherwise show all top 5
  const displayRows = search.trim() ? filteredRows : top5Students;
  // --- MODIFICATION END ---

  // ── Derived: assignments ───────────────────────────────────────────────
  const totalAssignments = assignments.length;

  function dueLabel(dueDate) {
    if (!dueDate) return "—";
    const d = dueDate instanceof Date ? dueDate : new Date(dueDate);
    const diff = Math.ceil((d - new Date()) / 86400000);
    if (diff < 0) return "Overdue";
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  const urgentCount = assignments.filter((a) => {
    if (!a.dueDate) return false;
    const diff = Math.ceil((new Date(a.dueDate) - new Date()) / 86400000);
    return diff >= 0 && diff <= 2;
  }).length;

  const mediumCount = assignments.filter((a) => {
    if (!a.dueDate) return false;
    const diff = Math.ceil((new Date(a.dueDate) - new Date()) / 86400000);
    return diff > 2 && diff <= 7;
  }).length;

  // ── Derived: today's schedule ──────────────────────────────────────────
  const safeSchedule = timetable ?? {};
  const todaySchedule = safeSchedule[TODAY_NAME] ?? {};
  const todaysClasses = PERIODS
    .filter((p) => !p.isBreak)
    .map((p) => ({ period: p, cell: todaySchedule[p.id] }))
    .filter(({ cell }) => cell && cell.subject && cell.subject !== "Free")
    .slice(0, 5);

  // ── Derived: upcoming events (max 4) ──────────────────────────────────
  const upcomingEvents = events
    .filter((e) => e.status === "Upcoming" || e.status === "Active")
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
    .slice(0, 4);

  // ── Greeting ──────────────────────────────────────────────────────────
  const adminName = buildAdminName(currentUser);

  return (
    <div className="min-h-screen bg-[#f0f4f0] p-3 md:p-6 space-y-4 md:space-y-6 font-sans pt-16 md:pt-6">

      {/* ── Hero Banner ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-5 md:px-8 py-5 md:py-7 gap-4">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">
              {getGreeting()}, {adminName}
            </h1>
            <p className="text-green-300 text-xs md:text-sm">
              Term 1 · {new Date().getFullYear()} &nbsp;|&nbsp; Corner Stone Primary School
            </p>
          </div>
          <div className="flex gap-3 md:gap-4">
            {[
              { value: totalStudents || "—", label: "Students" },
              { value: events.filter((e) => e.status === "Upcoming" || e.status === "Active").length || "—", label: "Events" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 md:px-6 py-2 md:py-3 text-center flex-1 md:flex-none md:min-w-[90px]">
                <div className="text-white text-xl md:text-2xl font-bold">{value}</div>
                <div className="text-green-300 text-[10px] md:text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top 3 Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">

        {/* Total Students */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">
              {activeStudents} Active
            </span>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-1">{totalStudents}</div>
          <div className="text-gray-400 text-sm mb-4">Total Students</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Enrollment</span><span>{totalStudents} / 1,400</span>
          </div>
          <ProgressBar value={totalStudents} max={1400} color="bg-green-500" />
        </div>

        {/* Assignments */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
              {totalAssignments} Active
            </span>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-1">{totalAssignments}</div>
          <div className="text-gray-400 text-sm mb-4">Total Assignments</div>
          <div className="text-xs text-gray-400 mb-3">
            {assignments[0]?.title
              ? `Latest: ${assignments[0].title.slice(0, 28)}…`
              : "No assignments yet"}
          </div>
          <div className="flex gap-2 flex-wrap">
            {urgentCount > 0 && (
              <span className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full">
                {urgentCount} Urgent
              </span>
            )}
            {mediumCount > 0 && (
              <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
                {mediumCount} Medium
              </span>
            )}
            {urgentCount === 0 && mediumCount === 0 && (
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                All clear
              </span>
            )}
          </div>
        </div>

        {/* Events */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sm:col-span-2 md:col-span-1">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
              This Term
            </span>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-1">{events.length}</div>
          <div className="text-gray-400 text-sm mb-4">Total Events</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Upcoming</span>
            <span>{events.filter((e) => e.status === "Upcoming").length} / {events.length}</span>
          </div>
          <ProgressBar
            value={events.filter((e) => e.status === "Upcoming").length}
            max={events.length || 1}
            color="bg-blue-400"
          />
        </div>
      </div>

      {/* ── Results Table + Today's Schedule ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">

        {/* Student Results — spans 2 cols, now shows only top 5 */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">

          {/* Header with inline search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <BarChart className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800"> Results - Top 5 Students</span>
              {top5Students.length > 0 && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {search.trim() ? `${filteredRows.length} found` : `Top ${top5Students.length}`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Search bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search top students…"
                  className="pl-8 pr-7 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 w-48 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 text-base leading-none transition-colors"
                  >×</button>
                )}
              </div>
              <button
                onClick={() => navigate("/admin/results")}
                className="text-sm text-gray-400 hover:text-green-600 transition-colors whitespace-nowrap"
              >
                View All →
              </button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {["STUDENT", "GRADE", "SUBJECTS", "BEST", "NEEDS WORK", "GRADE", "AVG"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.length > 0 ? (
                  displayRows.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-gray-800 truncate max-w-[130px]">{r.name}</td>
                      <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{r.grade}</td>
                      <td className="py-3 pr-4 text-gray-500">{r.subjects}</td>
                      <td className="py-3 pr-4">
                        <div className="text-xs font-medium text-gray-700 truncate max-w-[90px]">{r.best}</div>
                        <div className="text-[10px] text-green-600 font-bold">{r.bestAvg}%</div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="text-xs font-medium text-gray-700 truncate max-w-[90px]">{r.worst}</div>
                        <div className="text-[10px] text-red-500 font-bold">{r.worstAvg}%</div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${r.color}`}>
                          {r.letter}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-gray-800">{r.overall}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-400 text-sm">
                      {search.trim()
                        ? `No top students match "${search}"`
                        : "No student results available to rank top 5."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer hint - removed because we only show top 5 */}
          {top5Students.length === 0 && !search.trim() && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-center text-xs text-gray-400">
              Add academic records to see the top 5 performers.
            </div>
          )}
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">Today's Schedule</span>
            </div>
            <button
              onClick={() => navigate("/admin/timetable")}
              className="text-sm text-gray-400 hover:text-green-600 transition-colors"
            >
              Full Schedule →
            </button>
          </div>

          {todaysClasses.length > 0 ? (
            <div className="space-y-3">
              {todaysClasses.map(({ period, cell }, i) => (
                <div key={i} className="flex gap-3 items-start p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="text-[11px] text-gray-400 font-medium leading-tight w-14 flex-shrink-0 text-right pt-0.5">
                    {period.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm leading-tight truncate">
                      {cell.subject}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <span className="truncate">
                        {cell.room
                          ? `${cell.room}${cell.teacher ? ` · ${cell.teacher}` : ""}`
                          : cell.teacher || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Calendar className="w-8 h-8 mb-2 text-gray-200" />
              <p className="text-sm">No classes scheduled today</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Assignments + Upcoming Events ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

        {/* Assignments */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">Assignments</span>
            </div>
            <button
              onClick={() => navigate("/admin/assignments")}
              className="text-sm text-gray-400 hover:text-green-600 transition-colors"
            >
              View All →
            </button>
          </div>

          {assignments.length > 0 ? (
            <div className="space-y-2">
              {assignments.slice(0, 4).map((a, i) => {
                const due = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
                const diff = a.dueDate ? Math.ceil((due - new Date()) / 86400000) : null;
                const isUrgent = diff !== null && diff <= 2 && diff >= 0;
                const isMedium = diff !== null && diff > 2 && diff <= 7;
                const borderCls = isUrgent ? "border-red-400" : isMedium ? "border-orange-300" : "border-green-400";
                const dueCls = isUrgent ? "text-red-500" : isMedium ? "text-orange-500" : "text-green-600";
                return (
                  <div key={a.id || i} className={`flex items-start gap-3 p-3 rounded-xl border-l-4 ${borderCls} bg-gray-50`}>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 leading-tight truncate">{a.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {a.targetProgram} · {a.marks} marks
                      </div>
                    </div>
                    <span className={`text-xs font-semibold flex-shrink-0 ${dueCls}`}>
                      {dueLabel(a.dueDate)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <ClipboardList className="w-8 h-8 mb-2 text-gray-200" />
              <p className="text-sm">No assignments yet</p>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">Upcoming Events</span>
            </div>
            <button
              onClick={() => navigate("/admin/events")}
              className="text-sm text-gray-400 hover:text-green-600 transition-colors"
            >
              All Events →
            </button>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map((ev) => {
                const typeStyle = EVENT_TYPE_COLOR[ev.type] || "bg-gray-100 text-gray-600";
                return (
                  <div
                    key={ev.id}
                    className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate("/admin/events")}
                  >
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${typeStyle}`}>
                        {ev.type?.slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-gray-800 text-sm leading-tight truncate">{ev.title}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{formatEventDate(ev.eventDate)}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{ev.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <Megaphone className="w-8 h-8 mb-2 text-gray-200" />
              <p className="text-sm">No upcoming events</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}