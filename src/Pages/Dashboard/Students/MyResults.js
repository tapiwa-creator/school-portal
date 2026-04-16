// src/pages/student/MyResults.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/Authcontext";
import StudentResultsService from "../../../service/student/StudentRecordsServices";
import { BarChart, Trophy, AlertTriangle, FileText, ClipboardList, TrendingUp, GraduationCap, Lock } from "lucide-react";

const TERMS = ["Term 1", "Term 2", "Term 3"];
const TERM_KEY = { "Term 1": "term1", "Term 2": "term2", "Term 3": "term3" };

// ── Shared ProgressBar ────────────────────────────────────────────────────
const ProgressBar = ({ value, max = 100, color = "bg-green-500", height = "h-2" }) => (
  <div className={`w-full ${height} bg-gray-100 rounded-full overflow-hidden`}>
    <div
      className={`${height} ${color} rounded-full transition-all duration-500`}
      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
    />
  </div>
);

// ── Grade helpers ─────────────────────────────────────────────────────────
const calcLetter = (avg) =>
  avg >= 90 ? "A" : avg >= 85 ? "A-" : avg >= 80 ? "B+" :
    avg >= 75 ? "B" : avg >= 70 ? "B-" : avg >= 65 ? "C+" :
      avg >= 60 ? "C" : avg >= 55 ? "C-" : avg >= 50 ? "D" : "F";

const gradeColor = (avg) =>
  avg >= 80 ? "bg-green-100 text-green-600" :
    avg >= 65 ? "bg-blue-100 text-blue-600" :
      avg >= 50 ? "bg-orange-100 text-orange-500" : "bg-red-100 text-red-500";

const barColor = (avg) =>
  avg >= 80 ? "bg-green-500" : avg >= 65 ? "bg-green-400" : avg >= 50 ? "bg-yellow-400" : "bg-red-400";

const statusLabel = (avg) =>
  avg >= 75 ? { label: "Passing", cls: "bg-green-50 text-green-600" } :
    avg >= 60 ? { label: "Average", cls: "bg-orange-50 text-orange-500" } :
      { label: "At Risk", cls: "bg-red-50 text-red-500" };

// ── GPA (4.0 scale) ───────────────────────────────────────────────────────
const toGpaPoints = (avg) =>
  avg >= 90 ? 4.0 : avg >= 85 ? 3.7 : avg >= 80 ? 3.3 :
    avg >= 75 ? 3.0 : avg >= 70 ? 2.7 : avg >= 65 ? 2.3 :
      avg >= 60 ? 2.0 : avg >= 55 ? 1.7 : avg >= 50 ? 1.0 : 0.0;

const calcGpa = (records) => {
  if (!records.length) return 0;
  return records.reduce((s, r) => s + toGpaPoints(r.avg), 0) / records.length;
};

const standing = (gpa) =>
  gpa >= 3.5 ? "Excellent" : gpa >= 2.5 ? "Good" : gpa >= 2.0 ? "Average" : "At Risk";

// ── Export PDF ────────────────────────────────────────────────────────────
function exportPDF(student, term, records) {
  let html = `<html><head><title>My Results – ${term}</title>
  <style>body{font-family:sans-serif;padding:24px}h1{color:#1a4d2a}table{width:100%;border-collapse:collapse;margin-top:12px}
  th{background:#1a4d2a;color:#fff;padding:8px;text-align:left;font-size:12px}
  td{padding:7px 8px;font-size:12px;border-bottom:1px solid #eee}tr:nth-child(even){background:#f9f9f9}</style>
  </head><body><h1>Academic Results — ${term}</h1>
  <p>${student.name} · ${student.grade} · Corner Stone Primary School</p>
  <table><tr><th>Subject</th><th>Test 1</th><th>Test 2</th><th>Assignment</th><th>Exam</th><th>Grade</th><th>Average</th></tr>`;
  records.forEach((r) => {
    html += `<tr><td>${r.subject}</td><td>${r.test1}%</td>
    <td>${r.test2 != null ? r.test2 + "%" : "–"}</td>
    <td>${r.assign != null ? r.assign + "%" : "–"}</td>
    <td>${r.exam}%</td><td>${calcLetter(r.avg)}</td><td><b>${r.avg}%</b></td></tr>`;
  });
  html += `</table></body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html); w.document.close(); w.print();
}

// ── Main Component ────────────────────────────────────────────────────────
export default function MyResults() {
  const { currentUser } = useAuth();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notLinked, setNotLinked] = useState(false);
  const [activeTerm, setActiveTerm] = useState(0);

  // ── Real-time subscription — only this student's own doc ──────────────
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

  // ── Derived values ────────────────────────────────────────────────────
  const term = TERMS[activeTerm];
  const termKey = TERM_KEY[term];

  const records = student?.academic?.[termKey] || [];
  
  // Show results unconditionally if they exist or if it's Term 1
  const published = records.length > 0 || termKey === "term1";

  const overallAvg = records.length ? Math.round(records.reduce((s, r) => s + r.avg, 0) / records.length) : 0;
  const best = records.length ? records.reduce((a, b) => a.avg > b.avg ? a : b) : null;
  const worst = records.length ? records.reduce((a, b) => a.avg < b.avg ? a : b) : null;
  const atRiskCount = records.filter((r) => r.avg < 60).length;
  const passRate = records.length ? Math.round((records.filter((r) => r.avg >= 50).length / records.length) * 100) : 0;
  const gpa = calcGpa(records);
  const gpaStr = gpa.toFixed(1);
  const sortedRecs = [...records].sort((a, b) => b.avg - a.avg);

  // Trend: average of each assessment type across all subjects
  const trendData = records.length ? [
    { label: "Test 1", value: Math.round(records.reduce((s, r) => s + r.test1, 0) / records.length) },
    { label: "Test 2", value: Math.round(records.reduce((s, r) => s + (r.test2 || 0), 0) / records.length) },
    { label: "Assign", value: Math.round(records.reduce((s, r) => s + (r.assign || 0), 0) / records.length) },
    { label: "Exam", value: Math.round(records.reduce((s, r) => s + r.exam, 0) / records.length) },
    { label: "Overall", value: overallAvg },
  ] : [];

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium">Loading your results…</p>
        </div>
      </div>
    );
  }

  // ── Not linked ────────────────────────────────────────────────────────
  if (notLinked) {
    return (
      <div className="min-h-screen bg-[#f0f4f0] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm border border-gray-100">
          <div className="text-4xl mb-4"><AlertTriangle className="w-5 h-5 inline-block" /></div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Account Not Linked</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your login hasn't been linked to a student record yet. Please contact your school administrator.
          </p>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 pt-16 md:pt-6">

      {/* ── Hero Banner ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-5 md:px-8 py-5 md:py-7 gap-4">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">My Academic Results</h1>
            <p className="text-green-300 text-xs md:text-sm">
              {term} &nbsp;|&nbsp; {student?.grade} &nbsp;|&nbsp; Corner Stone Primary School
            </p>
          </div>
          <div className="flex gap-3 md:gap-4">
            {[
              { value: published && overallAvg ? `${overallAvg}%` : "—", label: "Overall Avg" },
              { value: records.length, label: "Subjects" },
              { value: published && records.length ? calcLetter(overallAvg) : "—", label: "Standing" },
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

      {/* ── Term Tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-full md:w-fit overflow-x-auto">
        {TERMS.map((t, i) => {
          const tKey = TERM_KEY[t];
          // Green dot only when published AND records exist
          const isPub = student?.published?.[tKey] && (student?.academic?.[tKey] || []).length > 0;
          return (
            <button
              key={t}
              onClick={() => setActiveTerm(i)}
              className={`relative px-4 md:px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap flex-1 md:flex-none ${activeTerm === i
                  ? "bg-white text-gray-900 shadow-sm font-semibold"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {t}
              {student?.academic?.[tKey]?.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-100" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Results not published ── */}
      {!published && (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
          <div className="text-4xl mb-4"><Lock className="w-5 h-5 inline-block" /></div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">{term} Results Not Yet Available</h3>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            Your {term} results haven't been published yet. Check back later or contact your teacher.
          </p>
        </div>
      )}

      {published && (
        <>
          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">

            {/* Academic Average */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-50 rounded-xl flex items-center justify-center text-base md:text-lg"><BarChart className="w-5 h-5 inline-block" /></div>
                <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">{calcLetter(overallAvg)}</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{overallAvg}%</div>
              <div className="text-gray-400 text-sm mb-3 md:mb-4">Academic Average</div>
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Progress</span><span>{overallAvg} / 100</span>
              </div>
              <ProgressBar value={overallAvg} color="bg-green-500" />
            </div>

            {/* Best Subject */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-base md:text-lg"><Trophy className="w-5 h-5 inline-block" /></div>
                <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Best</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{best?.avg ?? 0}%</div>
              <div className="text-gray-400 text-sm mb-3 md:mb-4 truncate">{best?.subject ?? "—"}</div>
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Score</span><span>Grade {best ? calcLetter(best.avg) : "—"}</span>
              </div>
              <ProgressBar value={best?.avg ?? 0} color="bg-yellow-400" />
            </div>

            {/* Needs Attention */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-red-50 rounded-xl flex items-center justify-center text-base md:text-lg"><AlertTriangle className="w-5 h-5 inline-block" /></div>
                <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full hidden md:inline">Needs Attention</span>
                <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full md:hidden">Weak</span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{worst?.avg ?? 0}%</div>
              <div className="text-gray-400 text-sm mb-3 md:mb-4 truncate">{worst ? `${worst.subject} (Lowest)` : "—"}</div>
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Score</span><span>Grade {worst ? calcLetter(worst.avg) : "—"}</span>
              </div>
              <ProgressBar value={worst?.avg ?? 0} color="bg-red-400" />
            </div>

            {/* Assessments */}
            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-purple-50 rounded-xl flex items-center justify-center text-base md:text-lg"><FileText className="w-5 h-5 inline-block" /></div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {atRiskCount === 0 ? "On Track" : `${atRiskCount} At Risk`}
                </span>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{records.length}</div>
              <div className="text-gray-400 text-sm mb-3 md:mb-4">Subjects This Term</div>
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Pass rate</span><span>{passRate}%</span>
              </div>
              <ProgressBar value={passRate} color="bg-blue-500" />
            </div>

          </div>

          {/* ── Results Table ── */}
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg"><ClipboardList className="w-5 h-5 inline-block" /></span>
                <span className="font-semibold text-gray-800">Detailed Results – {term}</span>
              </div>
              <button
                onClick={() => exportPDF(student, term, records)}
                className="text-sm text-gray-400 hover:text-green-600 transition-colors"
              >
                Export PDF →
              </button>
            </div>

            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["SUBJECT", "TEST 1", "TEST 2", "ASSIGNMENT", "EXAM", "GRADE", "AVG", "STATUS"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={8} className="py-10 text-center text-gray-400 text-sm">No records for this term.</td></tr>
                  ) : records.map((r, i) => {
                    const st = statusLabel(r.avg);
                    return (
                      <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-3 pr-4 font-semibold text-gray-800">{r.subject}</td>
                        <td className="py-3 pr-4 text-gray-500">{r.test1}%</td>
                        <td className="py-3 pr-4 text-gray-500">{r.test2 != null ? `${r.test2}%` : "–"}</td>
                        <td className="py-3 pr-4 text-gray-500">{r.assign != null ? `${r.assign}%` : "–"}</td>
                        <td className="py-3 pr-4 text-gray-500">{r.exam}%</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${gradeColor(r.avg)}`}>
                            {calcLetter(r.avg)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-bold text-gray-800">{r.avg}%</td>
                        <td className="py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Performance Trend */}
            {trendData.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                    Performance Trend (Averages Across Subjects)
                  </span>
                </div>
                <div className="flex items-end gap-3 h-16">
                  {trendData.map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-[10px] font-semibold text-gray-400">{d.value}%</span>
                      <div
                        className="w-full rounded-t-md hover:opacity-80 transition-opacity"
                        style={{
                          height: `${(d.value / 100) * 48}px`,
                          background: `rgba(22,101,52,${0.35 + i * 0.15})`,
                          minHeight: "4px",
                        }}
                      />
                      <span className="text-[10px] text-gray-400">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Subject Breakdown + GPA ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 pb-6">

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-lg"><TrendingUp className="w-5 h-5 inline-block" /></span>
                <span className="font-semibold text-gray-800">Subject Performance Breakdown</span>
              </div>
              {sortedRecs.map((r) => (
                <div key={r.subject} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm font-semibold text-gray-800 w-36 md:w-44 shrink-0 truncate">{r.subject}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${barColor(r.avg)}`} style={{ width: `${r.avg}%` }} />
                  </div>
                  <span className="text-sm font-bold text-gray-800 w-10 text-right">{r.avg}%</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-lg"><GraduationCap className="w-5 h-5 inline-block" /></span>
                <span className="font-semibold text-gray-800">GPA & Standing</span>
              </div>
              <div className="flex justify-center mb-6">
                <div
                  className="w-28 h-28 rounded-full flex flex-col items-center justify-center"
                  style={{ border: "8px solid #4caf6a" }}
                >
                  <span className="text-3xl font-bold text-gray-900">{gpaStr}</span>
                  <span className="text-xs text-gray-400">GPA / 4.0</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { lbl: "Academic Standing", val: standing(gpa), cls: gpa >= 2.5 ? "text-green-600" : "text-red-500", bg: "bg-gray-50" },
                  { lbl: "Subjects Taken", val: `${records.length}`, cls: "text-gray-900", bg: "bg-gray-50" },
                  { lbl: "Pass Rate", val: `${passRate}%`, cls: "text-gray-900", bg: "bg-gray-50" },
                  { lbl: "At Risk Subjects", val: `${atRiskCount}`, cls: atRiskCount > 0 ? "text-red-500" : "text-green-600", bg: atRiskCount > 0 ? "bg-red-50" : "bg-gray-50" },
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