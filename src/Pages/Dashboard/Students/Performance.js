import { useState, useEffect } from "react";
import { useAuth } from "../../../context/Authcontext";
import StudentResultsService from "../../../service/student/StudentRecordsServices";
import {
  BarChart,
  Trophy,
  AlertTriangle,
  ClipboardList,
  TrendingUp,
  GraduationCap,
  Lock,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────
const SEMESTERS = ["Term 1", "Term 2", "Term 3"];
const TERM_KEY = { "Term 1": "term1", "Term 2": "term2", "Term 3": "term3" };

// ── Helpers ────────────────────────────────────────────────────────────────
const calcLetter = (avg) =>
  avg >= 90 ? "A" : avg >= 85 ? "A-" : avg >= 80 ? "B+" :
    avg >= 75 ? "B" : avg >= 70 ? "B-" : avg >= 65 ? "C+" :
      avg >= 60 ? "C" : avg >= 55 ? "C-" : avg >= 50 ? "D" : "F";

const toGpaPoints = (avg) =>
  avg >= 90 ? 4.0 : avg >= 85 ? 3.7 : avg >= 80 ? 3.3 :
    avg >= 75 ? 3.0 : avg >= 70 ? 2.7 : avg >= 65 ? 2.3 :
      avg >= 60 ? 2.0 : avg >= 55 ? 1.7 : avg >= 50 ? 1.0 : 0.0;

const calcGpa = (records) =>
  records.length
    ? (records.reduce((s, r) => s + toGpaPoints(r.avg), 0) / records.length).toFixed(1)
    : "0.0";

const gradeColor = (avg) =>
  avg >= 80 ? "bg-green-100 text-green-700" :
    avg >= 65 ? "bg-blue-100 text-blue-700" :
      avg >= 50 ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-600";

const ProgressBar = ({ value, max = 100, color = "bg-green-500", height = "h-1.5" }) => (
  <div className={`w-full ${height} bg-gray-100 rounded-full overflow-hidden`}>
    <div
      className={`h-full rounded-full transition-all duration-500 ${color}`}
      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
    />
  </div>
);

// ── Map a raw academic record → module shape used by this UI ──────────────
function toModule(r) {
  const trend = r.test2 != null ? (r.test2 >= r.test1 ? "up" : "down") : "up";
  return {
    code: r.subject.slice(0, 6).toUpperCase().replace(/\s/g, ""),
    name: r.subject,
    lecturer: r.lecturer ?? "—",
    credits: r.credits ?? 10,
    tests: [r.test1, r.test2 ?? r.test1],
    assign: r.assign ?? null,
    avg: r.avg,
    grade: calcLetter(r.avg),
    trend,
    gradeColor: gradeColor(r.avg),
  };
}

// ── Build weekly-style trend from assessment averages ─────────────────────
function buildTrend(records) {
  if (!records.length) return [];
  const avg = (key) =>
    Math.round(records.reduce((s, r) => s + (r[key] ?? 0), 0) / records.length);
  return [
    { week: "Test 1", avg: avg("test1") },
    { week: "Test 2", avg: avg("test2") },
    { week: "Assign", avg: avg("assign") },
    { week: "Exam", avg: avg("exam") },
    { week: "Overall", avg: Math.round(records.reduce((s, r) => s + r.avg, 0) / records.length) },
  ].filter((d) => d.avg > 0);
}

// ── Module row (expandable) ────────────────────────────────────────────────
function ModuleRow({ m, expanded, onToggle }) {
  const barColor =
    m.avg >= 75 ? "bg-green-500" :
      m.avg >= 60 ? "bg-yellow-400" : "bg-red-400";

  return (
    <div className="border-b border-gray-50 last:border-0">
      <div
        className="flex items-center gap-2 md:gap-4 px-4 md:px-5 py-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
        onClick={() => onToggle(m.code)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">{m.name}</p>
            <span className={`font-bold text-sm ${m.trend === "up" ? "text-green-500" : "text-red-400"}`}>
              {m.trend === "up" ? "↑" : "↓"}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{m.code} · {m.lecturer} · {m.credits} credits</p>
        </div>

        <div className="hidden md:flex gap-4 text-sm text-gray-500 flex-shrink-0">
          <span>{m.tests[0]}%</span>
          <span>{m.tests[1]}%</span>
          <span>{m.assign != null ? `${m.assign}%` : "–"}</span>
        </div>

        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${m.gradeColor}`}>
          {m.grade}
        </span>

        <span className="text-sm font-bold text-gray-900 w-10 md:w-12 text-right flex-shrink-0">
          {m.avg}%
        </span>

        <span className={`hidden md:inline text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${m.avg >= 75 ? "bg-green-50 text-green-600" :
            m.avg >= 60 ? "bg-orange-50 text-orange-500" :
              "bg-red-50 text-red-500"
          }`}>
          {m.avg >= 75 ? "Passing" : m.avg >= 60 ? "Average" : "At Risk"}
        </span>

        <span className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${expanded ? "rotate-180" : ""}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      <div className="px-4 md:px-5 pb-2">
        <ProgressBar value={m.avg} color={barColor} />
      </div>

      {expanded && (
        <div className="px-4 md:px-5 pb-5 pt-2 bg-gray-50/40 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Test 1", value: `${m.tests[0]}%` },
              { label: "Test 2", value: `${m.tests[1]}%` },
              { label: "Assignment", value: m.assign != null ? `${m.assign}%` : "N/A" },
              { label: "Final Avg", value: `${m.avg}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-lg font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
          {m.avg < 60 && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>This subject is below pass mark. Consider requesting additional support from your teacher.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Performance() {
  const { currentUser } = useAuth();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notLinked, setNotLinked] = useState(false);
  const [activeSem, setActiveSem] = useState(0);
  const [expanded, setExpanded] = useState(null);

  // ── Real-time subscription ─────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = StudentResultsService.subscribeToMyRecord(
      currentUser,
      (record) => {
        if (!record) setNotLinked(true);
        else { setStudent(record); setNotLinked(false); }
        setLoading(false);
      }
    );
    return () => unsub();
  }, [currentUser]);

  // ── Derived values ─────────────────────────────────────────────────────
  const term = SEMESTERS[activeSem];
  const termKey = TERM_KEY[term];
  const raw = student?.academic?.[termKey] || [];

  const MODULES = raw.map(toModule);
  const TREND_DATA = buildTrend(raw);

  const overallAvg = MODULES.length ? Math.round(MODULES.reduce((s, m) => s + m.avg, 0) / MODULES.length) : 0;
  const bestModule = [...MODULES].sort((a, b) => b.avg - a.avg)[0];
  const worstModule = [...MODULES].sort((a, b) => a.avg - b.avg)[0];
  const atRisk = MODULES.filter((m) => m.avg < 60).length;
  const passing = MODULES.filter((m) => m.avg >= 60).length;
  const gpa = calcGpa(raw);
  const maxBar = Math.max(...(TREND_DATA.map((d) => d.avg)), 1);

  const classAvg = Math.round(overallAvg * 0.9);   // placeholder — replace with real data if available
  const topPerf = Math.min(100, Math.round(overallAvg * 1.26));

  const COMPARISONS = [
    { label: "Your Average", value: overallAvg, color: "bg-green-500" },
    { label: "Class Average", value: classAvg, color: "bg-blue-400" },
    { label: "Top Performer", value: topPerf, color: "bg-purple-400" },
    { label: "Pass Mark", value: 50, color: "bg-gray-300" },
  ];

  const toggle = (code) => setExpanded((p) => (p === code ? null : code));

  // ── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-3 md:p-6 space-y-4 md:space-y-5 pt-16 md:pt-6">
        {/* ── Hero Skeleton ── */}
        <div className="rounded-2xl h-[120px] bg-gray-200 animate-pulse w-full"></div>

        {/* ── Tabs Skeleton ── */}
        <div className="flex gap-2 mb-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>

        {/* ── Summary Cards Skeleton ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-24 bg-gray-100 rounded mb-4"></div>
              <div className="h-2 w-full bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>

        {/* ── Table Skeleton ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
          <div className="h-14 bg-gray-50 border-b border-gray-100"></div>
          <div className="space-y-1">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50"></div>)}
          </div>
        </div>

        {/* ── Bottom Section Skeleton ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse h-64"></div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse h-64"></div>
        </div>
      </div>
    );
  }

  // ── Not linked ─────────────────────────────────────────────────────────
  if (notLinked) {
    return (
      <div className="min-h-screen bg-[#f0f4f0] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm border border-gray-100">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Account Not Linked</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your login hasn't been linked to a student record yet. Please contact your school administrator.
          </p>
        </div>
      </div>
    );
  }

  // ── No data for term ───────────────────────────────────────────────────
  const noData = MODULES.length === 0;

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-5 pt-16 md:pt-6">

      {/* ── Hero Banner ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-5 md:px-8 py-5 md:py-7 gap-4">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">My Performance</h1>
            <p className="text-green-300 text-xs md:text-sm">
              {term} &nbsp;|&nbsp; {student?.grade} &nbsp;|&nbsp; Corner Stone Primary School
            </p>
          </div>
          <div className="flex gap-3 md:gap-4">
            {[
              { value: noData ? "—" : `${overallAvg}%`, label: "Overall Avg" },
              { value: noData ? "—" : gpa, label: "GPA" },
              { value: noData ? "—" : String(atRisk), label: "At Risk" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 md:px-6 py-2 md:py-3 text-center flex-1 md:flex-none md:min-w-[90px]"
              >
                <div className="text-white text-xl md:text-2xl font-bold">{value}</div>
                <div className="text-green-300 text-[10px] md:text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Term tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-full md:w-fit overflow-x-auto">
        {SEMESTERS.map((s, i) => {
          const tKey = TERM_KEY[s];
          const hasData = (student?.academic?.[tKey] || []).length > 0;
          return (
            <button
              key={s}
              onClick={() => setActiveSem(i)}
              className={`relative px-4 md:px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap flex-1 md:flex-none ${activeSem === i
                  ? "bg-white text-gray-900 shadow-sm font-semibold"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {s}
              {hasData && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-100" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── No data state ── */}
      {noData && (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
          <Lock className="w-6 h-6 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">{term} Results Not Yet Available</h3>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            Your {term} results haven't been published yet. Check back later or contact your teacher.
          </p>
        </div>
      )}

      {!noData && (
        <>
          {/* ── Summary cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">

            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <BarChart className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                  {calcLetter(overallAvg)}
                </span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{overallAvg}%</div>
              <div className="text-gray-400 text-sm mb-3 md:mb-4">Overall Average</div>
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Progress</span><span>{overallAvg} / 100</span>
              </div>
              <ProgressBar value={overallAvg} color="bg-green-500" />
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Best</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{bestModule?.avg ?? 0}%</div>
              <div className="text-gray-400 text-sm mb-3 md:mb-4 truncate">{bestModule?.name ?? "—"}</div>
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Score</span><span>Grade {bestModule?.grade ?? "—"}</span>
              </div>
              <ProgressBar value={bestModule?.avg ?? 0} color="bg-yellow-400" />
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full hidden md:inline">Needs Attention</span>
                <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full md:hidden">Weak</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{worstModule?.avg ?? 0}%</div>
              <div className="text-gray-400 text-sm mb-3 md:mb-4 truncate">{worstModule?.name ?? "—"}</div>
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Score</span><span>Grade {worstModule?.grade ?? "—"}</span>
              </div>
              <ProgressBar value={worstModule?.avg ?? 0} color="bg-red-400" />
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {passing}/{MODULES.length}
                </span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{gpa}</div>
              <div className="text-gray-400 text-sm mb-3 md:mb-4">GPA / 4.0</div>
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Standing</span><span>{overallAvg >= 65 ? "Good" : "At Risk"}</span>
              </div>
              <ProgressBar value={(parseFloat(gpa) / 4) * 100} color="bg-purple-400" />
            </div>

          </div>

          {/* ── Module performance table ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 md:px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-800">Subject Performance – {term}</span>
              </div>
            </div>

            <div className="hidden md:grid grid-cols-[1fr_80px_80px_80px_70px_80px_90px_32px] gap-2 px-5 py-2.5 border-b border-gray-50">
              {["SUBJECT", "TEST 1", "TEST 2", "ASSIGN", "GRADE", "AVG", "STATUS", ""].map((h) => (
                <span key={h} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{h}</span>
              ))}
            </div>

            {MODULES.map((m) => (
              <ModuleRow key={m.code} m={m} expanded={expanded === m.code} onToggle={toggle} />
            ))}
          </div>

          {/* ── Assessment trend + comparison ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

            {/* Assessment trend chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-800">Assessment Performance Trend</span>
              </div>
              <div className="flex items-end gap-2 h-24 mb-2">
                {TREND_DATA.map((d, i) => {
                  const heightPct = (d.avg / maxBar) * 100;
                  const opacity = 0.3 + (i / TREND_DATA.length) * 0.7;
                  return (
                    <div key={d.week} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-[9px] font-semibold text-gray-400">{d.avg}%</span>
                      <div
                        className="w-full rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer"
                        style={{
                          height: `${heightPct * 0.72}px`,
                          background: `rgba(22,101,52,${opacity})`,
                        }}
                      />
                      <span className="text-[9px] text-gray-400">{d.week}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                <span className="text-xs text-gray-400">Average score per assessment type</span>
              </div>
            </div>

            {/* Class comparison */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <BarChart className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-800">Score Comparison</span>
              </div>
              <div className="flex flex-col gap-4">
                {COMPARISONS.map(({ label, value, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-600 w-32 flex-shrink-0">{label}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-500`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-800 w-8 text-right">{value}%</span>
                  </div>
                ))}
              </div>
              {overallAvg > classAvg && (
                <div className="mt-5 bg-green-50 rounded-xl p-3">
                  <p className="text-xs text-green-700 font-medium">
                    You are performing <strong>{overallAvg - classAvg}% above</strong> the estimated class average this term.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* ── Subject breakdown + GPA ring ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 pb-6">

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-800">Subject Breakdown</span>
              </div>
              {[...MODULES].sort((a, b) => b.avg - a.avg).map((m) => (
                <div key={m.code} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm font-semibold text-gray-800 w-36 md:w-44 shrink-0 truncate">{m.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${m.avg >= 75 ? "bg-green-500" :
                          m.avg >= 60 ? "bg-yellow-400" : "bg-red-400"
                        }`}
                      style={{ width: `${m.avg}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-800 w-10 text-right">{m.avg}%</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-5">
                <GraduationCap className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-800">GPA &amp; Academic Standing</span>
              </div>

              <div className="flex justify-center mb-6">
                <div
                  className="w-28 h-28 rounded-full flex flex-col items-center justify-center"
                  style={{ border: "8px solid #4caf6a" }}
                >
                  <span className="text-3xl font-bold text-gray-900">{gpa}</span>
                  <span className="text-xs text-gray-400">GPA / 4.0</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    lbl: "Academic Standing",
                    val: overallAvg >= 65 ? "Good" : "At Risk",
                    cls: overallAvg >= 65 ? "text-green-600" : "text-red-500",
                    bg: "bg-gray-50",
                  },
                  { lbl: "Subjects Taken", val: String(MODULES.length), cls: "text-gray-900", bg: "bg-gray-50" },
                  {
                    lbl: "Pass Rate",
                    val: `${MODULES.length ? Math.round((passing / MODULES.length) * 100) : 0}%`,
                    cls: "text-gray-900",
                    bg: "bg-gray-50",
                  },
                  {
                    lbl: "At Risk Subjects",
                    val: String(atRisk),
                    cls: atRisk > 0 ? "text-red-500" : "text-green-600",
                    bg: atRisk > 0 ? "bg-red-50" : "bg-gray-50",
                  },
                ].map(({ lbl, val, cls, bg }) => (
                  <div key={lbl} className={`${bg} rounded-xl p-3.5 text-center`}>
                    <div className="text-xs text-gray-400 mb-1">{lbl}</div>
                    <div className={`text-base font-bold ${cls}`}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}