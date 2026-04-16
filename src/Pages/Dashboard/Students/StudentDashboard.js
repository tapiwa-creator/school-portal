import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/Authcontext";
import StudentResultsService from "../../../service/student/StudentRecordsServices";
import studentAssignmentService from "../../../service/student/StudentAssignmentService";
import StudentTimetableService from "../../../service/TimetableServices";
import EventServices from "../../../service/student/EventServices";
import { DAYS, PERIODS } from "../../../service/admin/TimetableServices";
import {
  BarChart, ClipboardList, GraduationCap, DollarSign,
  Calendar, CreditCard, MapPin, Megaphone,
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

// ── Greeting ───────────────────────────────────────────────────────────────
const getTimeGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

/**
 * Derive a display name + optional title prefix from the auth user object.
 *
 * For STUDENTS  → use student record name (first name only) once loaded,
 *                  fall back to auth displayName / email prefix.
 * For ADMINS    → prepend Mr / Mrs / Miss based on title stored at
 *                  user.title | user.displayTitle | user.prefix
 *                  (whichever your sign-up flow persists).
 */
function buildGreetingName(currentUser, studentRecord) {
  // Student path — use first name from the student record if available
  if (studentRecord?.name) {
    return studentRecord.name.split(" ")[0];
  }

  // Auth displayName fallback
  const raw = currentUser?.displayName || currentUser?.email?.split("@")[0] || "there";

  // Admin title prefix  (adjust field names to match your Firestore user doc)
  const title = currentUser?.title || currentUser?.displayTitle || currentUser?.prefix || "";
  const firstName = raw.split(" ")[0];

  if (title) return `${title} ${firstName}`;
  return firstName;
}

// ── ProgressBar ────────────────────────────────────────────────────────────
const ProgressBar = ({ value, max = 100, color = "bg-green-500", height = "h-2" }) => (
  <div className={`w-full ${height} bg-gray-100 rounded-full overflow-hidden`}>
    <div
      className={`${height} ${color} rounded-full transition-all duration-500`}
      style={{ width: `${Math.min((value / (max || 1)) * 100, 100)}%` }}
    />
  </div>
);

// ── Today helper ───────────────────────────────────────────────────────────
const TODAY_NAME = DAYS[new Date().getDay() === 0 ? 0 : new Date().getDay() - 1] ?? "Monday";

// ── Event type icon chars (no emoji dependency) ────────────────────────────
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

function formatEventDate(iso) {
  if (!iso) return "–";
  const d = new Date(iso);
  const diff = Math.ceil((d - new Date()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0) return `${Math.abs(diff)}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // ── state ──
  const [student, setStudent] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [events, setEvents] = useState([]);

  // ── 1. Student record (results + name) ────────────────────────────────
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = StudentResultsService.subscribeToMyRecord(currentUser, (rec) => {
      if (rec) setStudent(rec);
    });
    return () => unsub();
  }, [currentUser]);

  // ── 2. Assignments ────────────────────────────────────────────────────
  useEffect(() => {
    if (!student) return;
    const unsub = studentAssignmentService.subscribeToAssignments(student, (data) => {
      setAssignments(studentAssignmentService.formatAssignmentsForUI(data));
    });
    return () => unsub();
  }, [student]);

  // ── 3. Timetable ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.uid) return;
    let unsub = () => { };
    StudentTimetableService.subscribeToMyTimetable(currentUser.uid, (data) => {
      setTimetable(data);
    }).then((fn) => { unsub = fn; });
    return () => unsub();
  }, [currentUser]);

  // ── 4. Events ─────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = EventServices.subscribeToEvents((data) => setEvents(data));
    return () => unsub();
  }, []);

  // ── Derived: results ──────────────────────────────────────────────────
  const records = student?.academic?.term1 || [];
  const published = records.length > 0;
  const overallAvg = published
    ? Math.round(records.reduce((s, r) => s + r.avg, 0) / records.length)
    : 0;

  // performance trend from assessment averages
  const perfTrend = published
    ? [
      Math.round(records.reduce((s, r) => s + r.test1, 0) / records.length),
      Math.round(records.reduce((s, r) => s + (r.test2 || 0), 0) / records.length),
      Math.round(records.reduce((s, r) => s + (r.assign || 0), 0) / records.length),
      Math.round(records.reduce((s, r) => s + r.exam, 0) / records.length),
      overallAvg,
    ]
    : student?.perfTrend || [55, 68, 62, 78, 85];

  // ── Derived: assignments ──────────────────────────────────────────────
  const pendingAssignments = assignments
    .filter((a) => a.status === "pending" || a.status === "in-progress")
    .slice(0, 4);
  const urgentCount = assignments.filter(
    (a) => a.urgency === "urgent" || a.urgency === "overdue"
  ).length;
  const dueSoonCount = assignments.filter(
    (a) => (a.status === "pending" || a.status === "in-progress") &&
      (a.urgency === "urgent" || a.urgency === "medium")
  ).length;

  // ── Derived: today's classes ──────────────────────────────────────────
  const safeSchedule = timetable ?? {};
  const todaySchedule = safeSchedule[TODAY_NAME] ?? {};
  const todaysClasses = PERIODS
    .filter((p) => !p.isBreak)
    .map((p) => ({ period: p, cell: todaySchedule[p.id] }))
    .filter(({ cell }) => cell && cell.subject && cell.subject !== "Free")
    .slice(0, 5);

  // ── Derived: events → notices (upcoming/active, max 4) ───────────────
  const notices = events
    .filter((e) => e.status === "Upcoming" || e.status === "Active")
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
    .slice(0, 4);

  // ── Greeting ──────────────────────────────────────────────────────────
  const greetingName = buildGreetingName(currentUser, student);

  return (
    <div className="min-h-screen bg-[#f0f4f0] p-3 md:p-6 space-y-4 md:space-y-6 font-sans pt-16 md:pt-6">

      {/* ── Hero Banner ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-5 md:px-8 py-5 md:py-7 gap-4">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">
              {getTimeGreeting()}, {greetingName}
            </h1>
            <p className="text-green-300 text-xs md:text-sm">
              Term 1 · {new Date().getFullYear()} &nbsp;|&nbsp; Corner Stone Primary School
            </p>
          </div>
          <div className="flex gap-3 md:gap-4">
            {[
              { value: published && overallAvg ? `${overallAvg}%` : "—", label: "Overall Avg" },
              { value: records.length || "—", label: "Subjects" },
              { value: dueSoonCount || "—", label: "Due Soon" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 md:px-6 py-2 md:py-3 text-center flex-1 md:flex-none md:min-w-[90px]">
                <div className="text-white text-xl md:text-2xl font-bold">{value}</div>
                <div className="text-green-300 text-[10px] md:text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top 3 Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">

        {/* Academic Average */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <BarChart className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">
              {calcLetter(overallAvg || 0)}
            </span>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {published && overallAvg ? `${overallAvg}%` : "—"}
          </div>
          <div className="text-gray-400 text-sm mb-4">Academic Average</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Progress</span><span>{overallAvg || 0} / 100</span>
          </div>
          <ProgressBar value={overallAvg || 0} color="bg-green-500" />
        </div>

        {/* Outstanding Fees (static — wire to FeesService when available) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">Due</span>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-1">$1,240</div>
          <div className="text-gray-400 text-sm mb-4">Outstanding Fees</div>
          <div className="text-xs text-gray-400 mb-3">Next payment due: 15 Mar 2025</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Paid</span><span>$3,760 / $5,000</span>
          </div>
          <ProgressBar value={3760} max={5000} color="bg-yellow-400" />
        </div>

        {/* Assignments */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sm:col-span-2 md:col-span-1">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {assignments.length} Active
            </span>
          </div>
          <div className="text-4xl font-bold text-gray-900 mb-1">{dueSoonCount}</div>
          <div className="text-gray-400 text-sm mb-4">Assignments Due Soon</div>
          <div className="text-xs text-gray-400 mb-3">
            {pendingAssignments[0]?.title
              ? `Next: ${pendingAssignments[0].title.slice(0, 30)}…`
              : "No upcoming assignments"}
          </div>
          <div className="flex gap-2">
            {urgentCount > 0 && (
              <span className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full">
                {urgentCount} Urgent
              </span>
            )}
            {dueSoonCount - urgentCount > 0 && (
              <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
                {dueSoonCount - urgentCount} Medium
              </span>
            )}
            {dueSoonCount === 0 && (
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                All clear
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Results Table + Today's Classes ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">

        {/* Results — spans 2 cols */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">My Results – Term 1</span>
            </div>
            <button
              onClick={() => navigate("/student/results")}
              className="text-sm text-gray-400 hover:text-green-600 transition-colors"
            >
              View All →
            </button>
          </div>

          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {["SUBJECT", "TEST 1", "TEST 2", "ASSIGN", "GRADE", "AVG"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.length > 0 ? (
                  records.slice(0, 5).map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-gray-800 truncate max-w-[140px]">{r.subject}</td>
                      <td className="py-3 pr-4 text-gray-500">{r.test1}%</td>
                      <td className="py-3 pr-4 text-gray-500">{r.test2 != null ? `${r.test2}%` : "–"}</td>
                      <td className="py-3 pr-4 text-gray-500">{r.assign != null ? `${r.assign}%` : "–"}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${gradeColor(r.avg)}`}>
                          {calcLetter(r.avg)}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-gray-800">{r.avg}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-400 text-sm">
                      No results published yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Today's Classes */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">Today's Classes</span>
            </div>
            <button
              onClick={() => navigate("/student/timetable")}
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
                    <div className="font-semibold text-gray-800 text-sm leading-tight truncate">{cell.subject}</div>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <span className="truncate">{cell.room}{cell.teacher ? ` · ${cell.teacher}` : ""}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Calendar className="w-8 h-8 mb-2 text-gray-200" />
              <p className="text-sm">No classes today</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Assignments + Fee Summary + Events (Notices) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">

        {/* Assignments */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">Assignments</span>
            </div>
            <button
              onClick={() => navigate("/student/assignments")}
              className="text-sm text-gray-400 hover:text-green-600 transition-colors"
            >
              View All →
            </button>
          </div>

          {pendingAssignments.length > 0 ? (
            <div className="space-y-2">
              {pendingAssignments.map((a) => {
                const isUrgent = a.urgency === "urgent" || a.urgency === "overdue";
                const isMedium = a.urgency === "medium";
                const borderCls = isUrgent ? "border-red-400" : isMedium ? "border-orange-300" : "border-green-400";
                const dueCls = isUrgent ? "text-red-500" : isMedium ? "text-orange-500" : "text-green-600";
                return (
                  <div key={a.id} className={`flex items-start gap-3 p-3 rounded-xl border-l-4 ${borderCls} bg-gray-50`}>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 leading-tight truncate">{a.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{a.type} · {a.marks} marks</div>
                    </div>
                    <span className={`text-xs font-semibold flex-shrink-0 ${dueCls}`}>
                      {a.dueLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <ClipboardList className="w-8 h-8 mb-2 text-gray-200" />
              <p className="text-sm">No pending assignments</p>
            </div>
          )}
        </div>

        {/* Fee Summary (static — wire to FeesService when ready) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">Fee Summary</span>
            </div>
            <button
              onClick={() => navigate("/student/fees")}
              className="text-sm text-gray-400 hover:text-green-600 transition-colors"
            >
              Statement →
            </button>
          </div>
          <div className="space-y-2.5 mb-4">
            {[
              { label: "Tuition Fees", amount: "$3,800.00" },
              { label: "Res & Meals", amount: "$800.00" },
              { label: "Registration", amount: "$200.00" },
              { label: "Library Levy", amount: "$100.00" },
              { label: "Sports Levy", amount: "$100.00" },
            ].map(({ label, amount }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-700 font-medium">{amount}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Billed</span>
              <span className="font-semibold text-gray-800">$5,000.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Paid</span>
              <span className="font-semibold text-gray-800">-$3,760.00</span>
            </div>
            <div className="flex justify-between text-sm pt-1 border-t border-gray-100">
              <span className="font-bold text-gray-800">Balance Due</span>
              <span className="font-bold text-red-500 text-base">$1,240.00</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/student/fees")}
            className="w-full mt-4 bg-[#1a4d2a] hover:bg-[#143d22] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            Make Payment
          </button>
        </div>

        {/* Events / Notices */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sm:col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-800">Upcoming Events</span>
            </div>
            <button
              onClick={() => navigate("/student/events")}
              className="text-sm text-gray-400 hover:text-green-600 transition-colors"
            >
              All Events →
            </button>
          </div>

          {notices.length > 0 ? (
            <div className="space-y-3">
              {notices.map((ev) => {
                const typeStyle = EVENT_TYPE_COLOR[ev.type] || "bg-gray-100 text-gray-600";
                return (
                  <div
                    key={ev.id}
                    className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate("/student/events")}
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