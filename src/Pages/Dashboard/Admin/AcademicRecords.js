// src/pages/admin/AcademicRecords.jsx
// All mock data removed. Students are fetched live from Firestore via
// AdminStudentService.  Academic records live at student.academic[termKey].
// Publish writes to student.published[termKey] per-student.
// Design, colours and layout are unchanged.

import { useState, useEffect } from "react";
import AdminStudentService from "../../../service/admin/StudentManagementService"
import { useAuth } from "../../../context/Authcontext";

// ── Constants ─────────────────────────────────────────────────────────────
const TERMS = ["Term 1", "Term 2", "Term 3"];
const TERM_KEY = { "Term 1": "term1", "Term 2": "term2", "Term 3": "term3" };
const SUBJECTS = ["Mathematics", "English", "Science", "Social Studies", "Art"];

// ── Grade / colour helpers ────────────────────────────────────────────────
const calcLetter = (avg) =>
  avg >= 90 ? "A" : avg >= 85 ? "A-" : avg >= 80 ? "B+" :
    avg >= 75 ? "B" : avg >= 70 ? "B-" : avg >= 65 ? "C+" :
      avg >= 60 ? "C" : avg >= 55 ? "C-" : avg >= 50 ? "D" : "F";

const calcColor = (avg) =>
  avg >= 80 ? "bg-green-100 text-green-600" :
    avg >= 65 ? "bg-blue-100 text-blue-600" :
      avg >= 50 ? "bg-orange-100 text-orange-500" : "bg-red-100 text-red-500";

const avgColor = (v) =>
  v >= 80 ? "bg-green-100 text-green-600" :
    v >= 65 ? "bg-blue-100 text-blue-600" :
      v >= 50 ? "bg-orange-100 text-orange-500" : "bg-red-100 text-red-500";

const barColor = (v) =>
  v >= 80 ? "bg-green-500" : v >= 65 ? "bg-blue-400" : v >= 50 ? "bg-orange-400" : "bg-red-400";

const makeRecord = (subject, t1, t2, assign, exam) => {
  const parts = [t1, t2, exam, ...(assign != null ? [assign] : [])];
  const avg = Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
  return { subject, test1: t1, test2: t2, assign, exam, avg, letter: calcLetter(avg), color: calcColor(avg) };
};

// ── Small UI atoms ────────────────────────────────────────────────────────
const ProgressBar = ({ value, max = 100, color = "bg-green-500", height = "h-2" }) => (
  <div className={`w-full ${height} bg-gray-100 rounded-full overflow-hidden`}>
    <div className={`${height} ${color} rounded-full transition-all duration-500`}
      style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
  </div>
);

const Spinner = () => (
  <div className="flex items-center justify-center h-40">
    <div className="w-8 h-8 rounded-full border-4 border-green-200 border-t-green-700 animate-spin" />
  </div>
);

// ── Export helpers ────────────────────────────────────────────────────────
function exportCSV(students, term) {
  const key = TERM_KEY[term];
  const rows = [["Student", "ID", "Grade", "Subject", "Test 1", "Test 2", "Assignment", "Exam", "Average", "Grade Letter"]];
  students.forEach(s => {
    (s.academic?.[key] || []).forEach(r => {
      rows.push([s.name, s.id, s.grade, r.subject, r.test1, r.test2 || "", r.assign || "", r.exam, r.avg, r.letter]);
    });
  });
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `academic_records_${term.replace(" ", "_")}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(students, term) {
  const key = TERM_KEY[term];
  let html = `<html><head><title>Academic Records – ${term}</title>
  <style>body{font-family:sans-serif;padding:24px}h1{color:#1a4d2a}table{width:100%;border-collapse:collapse;margin-top:12px}
  th{background:#1a4d2a;color:#fff;padding:8px;text-align:left;font-size:12px}
  td{padding:7px 8px;font-size:12px;border-bottom:1px solid #eee}tr:nth-child(even){background:#f9f9f9}</style></head><body>
  <h1>Academic Records — ${term}</h1><p>Corner Stone Primary School · ${new Date().getFullYear()}</p><table>
  <tr><th>Student</th><th>ID</th><th>Grade</th><th>Subject</th><th>Test 1</th><th>Test 2</th><th>Assign</th><th>Exam</th><th>Avg</th><th>Grade</th></tr>`;
  students.forEach(s => {
    (s.academic?.[key] || []).forEach(r => {
      html += `<tr><td>${s.name}</td><td>${s.id}</td><td>${s.grade}</td><td>${r.subject}</td>
      <td>${r.test1}%</td><td>${r.test2 ? r.test2 + "%" : "–"}</td><td>${r.assign ? r.assign + "%" : "–"}</td>
      <td>${r.exam}%</td><td><b>${r.avg}%</b></td><td>${r.letter}</td></tr>`;
    });
  });
  html += `</table></body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html); w.document.close(); w.print();
}

// ── Add Records Side Panel ────────────────────────────────────────────────
function AddRecordPanel({ students, onClose, onSave }) {
  const [studentId, setStudentId] = useState(students[0]?.id || "");
  const [term, setTerm] = useState("Term 1");
  const [saving, setSaving] = useState(false);

  const emptyMarks = () =>
    SUBJECTS.reduce((acc, s) => ({ ...acc, [s]: { test1: "", test2: "", assign: "", exam: "" } }), {});
  const [marks, setMarks] = useState(emptyMarks());

  // Pre-fill existing records when student / term changes
  useEffect(() => {
    const student = students.find(s => s.id === studentId);
    const key = TERM_KEY[term];
    const existing = student?.academic?.[key] || [];
    const filled = emptyMarks();
    existing.forEach(r => {
      if (filled[r.subject]) {
        filled[r.subject] = {
          test1: r.test1 ?? "",
          test2: r.test2 ?? "",
          assign: r.assign ?? "",
          exam: r.exam ?? "",
        };
      }
    });
    setMarks(filled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, term]);

  const setMark = (subject, field, val) =>
    setMarks(m => ({ ...m, [subject]: { ...m[subject], [field]: val } }));

  const handleSave = async () => {
    const records = SUBJECTS
      .filter(s => marks[s].test1 !== "" && marks[s].exam !== "")
      .map(s => {
        const { test1, test2, assign, exam } = marks[s];
        return makeRecord(
          s,
          Number(test1),
          Number(test2) || 0,
          assign !== "" ? Number(assign) : null,
          Number(exam)
        );
      });
    if (records.length === 0) return;
    setSaving(true);
    await onSave({ studentId, term, records });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex" onClick={onClose}>
      <div className="flex-1" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)" }} />
      <div className="h-full w-full max-w-[520px] bg-white flex flex-col"
        style={{ boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", animation: "slideRight 0.25s ease" }}
        onClick={e => e.stopPropagation()}>

        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add Academic Records</h2>
            <p className="text-xs text-gray-400 mt-0.5">Enter marks for all subjects</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors text-lg leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Student & Term */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Student</label>
              <select value={studentId} onChange={e => setStudentId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all">
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Term</label>
              <select value={term} onChange={e => setTerm(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all">
                {TERMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Per-subject mark entry */}
          {SUBJECTS.map(subject => (
            <div key={subject} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">{subject}</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Test 1", key: "test1" },
                  { label: "Test 2", key: "test2" },
                  { label: "Assign", key: "assign" },
                  { label: "Exam", key: "exam" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wide">{label}</label>
                    <input type="number" min="0" max="100" placeholder="–"
                      value={marks[subject][key]}
                      onChange={e => setMark(subject, key, e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all text-center" />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400">Only subjects with Test 1 and Exam filled will be saved. Average is auto-calculated.</p>
        </div>

        <div className="px-6 py-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-600">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:bg-[#143d22] transition-colors disabled:opacity-60"
            style={{ background: "#1a4d2a" }}>
            {saving ? "Saving…" : "Save Records"}
          </button>
        </div>
      </div>
      <style>{`@keyframes slideRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
    </div>
  );
}

// ── Publish Confirm Modal ─────────────────────────────────────────────────
function PublishModal({ term, count, onClose, onConfirm, publishing }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-[380px] max-w-[95%] text-center"
        style={{ padding: "36px 32px 28px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
        onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "#f0faf5", border: "2px solid #bbf7d0" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a4d2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Publish {term} Results?</h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          This will make {term} results visible to <span className="font-semibold text-gray-700">{count} students</span> and their parents. This action can be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={publishing}
            className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-600">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={publishing}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:bg-[#143d22] transition-colors disabled:opacity-60"
            style={{ background: "#1a4d2a" }}>
            {publishing ? "Publishing…" : "Publish Now"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Record Drawer ─────────────────────────────────────────────────────────
function RecordDrawer({ student, term, onClose }) {
  const key = TERM_KEY[term];
  // Records live under student.academic[termKey]
  const records = student.academic?.[key] || [];
  const overall = records.length > 0
    ? Math.round(records.reduce((s, r) => s + r.avg, 0) / records.length) : 0;
  const trend = student.perfTrend || [];

  return (
    <div className="fixed inset-0 z-[9998] flex" onClick={onClose}>
      <div className="flex-1" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)" }} />
      <div className="h-full w-full max-w-[560px] bg-white flex flex-col overflow-hidden"
        style={{ boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", animation: "slideRight 0.25s ease" }}
        onClick={e => e.stopPropagation()}>

        <div style={{ background: "linear-gradient(135deg,#0d2818 0%,#1a4d2a 50%,#2d6e3e 100%)", padding: "24px 24px 20px" }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${student.avatarColor || "from-green-600 to-green-400"} flex items-center justify-center text-white font-bold text-base flex-shrink-0`}>
                {student.avatar}
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">{student.name}</h2>
                <p className="text-green-300 text-xs mt-0.5">{student.id} · {student.grade} · {term}</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors text-xl">×</button>
          </div>
          <div className="flex gap-3">
            {[
              { label: "Subjects", value: records.length },
              { label: "Overall Avg", value: `${overall}%` },
              { label: "Top Subject", value: records.length > 0 ? records.reduce((a, b) => a.avg > b.avg ? a : b).subject.split(" ")[0] : "—" },
              { label: "Needs Work", value: records.length > 0 ? records.reduce((a, b) => a.avg < b.avg ? a : b).subject.split(" ")[0] : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 bg-white/10 rounded-xl px-2 py-2 text-center">
                <div className="text-white font-bold text-sm">{value}</div>
                <div className="text-green-300 text-[10px] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm">Subject Results — {term}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["SUBJECT", "TEST 1", "TEST 2", "ASSIGN", "EXAM", "GRADE", "AVG"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0
                    ? <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No records for this term.</td></tr>
                    : records.map((r, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-800 text-xs">{r.subject}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{r.test1}%</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{r.test2 ? `${r.test2}%` : "–"}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{r.assign ? `${r.assign}%` : "–"}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{r.exam}%</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.color}`}>{r.letter}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-800 text-xs">{r.avg}%</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>

          {records.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">Performance by Subject</h3>
              <div className="space-y-3">
                {records.map((r, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-gray-700">{r.subject}</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${avgColor(r.avg)}`}>{r.avg}%</span>
                    </div>
                    <ProgressBar value={r.avg} color={barColor(r.avg)} height="h-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trend — stored as student.perfTrend in Firestore */}
          {trend.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Overall Performance Trend</h3>
              <div className="flex items-end gap-2 h-16">
                {trend.map((v, i) => (
                  <div key={i} className="flex-1 rounded-md"
                    style={{ height: `${v}%`, background: `rgba(22,101,52,${0.3 + i * 0.15})` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function AcademicRecords() {
  const { userProfile } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("Term 1");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Subscribe to Firestore students ──────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const unsub = AdminStudentService.subscribeToStudents((data) => {
      setStudents(data);
      setLoading(false);
    }, userProfile?.assignedGrade);
    return () => unsub();
  }, [userProfile?.assignedGrade]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Derived values ────────────────────────────────────────────────────
  const termKey = TERM_KEY[term];
  const pubKey = termKey; // published.term1 / term2 / term3

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.id?.toLowerCase().includes(search.toLowerCase())
  );

  const isPublished = students.length > 0 && students.every(s => s.published?.[pubKey]);

  const allAvgs = students.map(s => {
    const recs = s.academic?.[termKey] || [];
    return recs.length > 0 ? Math.round(recs.reduce((a, r) => a + r.avg, 0) / recs.length) : null;
  }).filter(v => v !== null);

  const schoolAvg = allAvgs.length > 0 ? Math.round(allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length) : 0;
  const topStudents = allAvgs.filter(v => v >= 80).length;
  const atRisk = allAvgs.filter(v => v < 60).length;

  // ── Save records → Firestore ──────────────────────────────────────────
  const handleAddRecords = async ({ studentId, term: recTerm, records }) => {
    const key = TERM_KEY[recTerm];
    const result = await AdminStudentService.updateStudent(studentId, { [`academic.${key}`]: records });
    if (result.success) {
      // Optimistic local update
      setStudents(ss => ss.map(s =>
        s.id !== studentId ? s : { ...s, academic: { ...s.academic, [key]: records } }
      ));
      showToast(`Records saved for ${recTerm}`);
    } else {
      showToast("Failed to save records", "error");
    }
  };

  // ── Publish → Firestore ───────────────────────────────────────────────
  const handlePublish = async () => {
    setPublishing(true);
    await Promise.all(
      students.map(s =>
        AdminStudentService.updateStudent(s.id, { [`published.${pubKey}`]: true })
      )
    );
    setStudents(ss => ss.map(s => ({
      ...s, published: { ...s.published, [pubKey]: true },
    })));
    setPublishing(false);
    setShowPublish(false);
    showToast(`${term} results published successfully`);
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0f4f0] p-3 md:p-6 space-y-5 font-sans pt-16 md:pt-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[99999] px-5 py-3 rounded-2xl text-sm font-semibold text-white shadow-lg"
          style={{ background: toast.type === "success" ? "#1a4d2a" : "#b91c1c", animation: "fadeUp .3s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* Hero Banner */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#0d2818 0%,#1a4d2a 50%,#2d6e3e 100%)" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-5 md:px-8 py-5 md:py-7 gap-4">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">Academic Records</h1>
            <p className="text-green-300 text-xs md:text-sm">{new Date().getFullYear()} · Corner Stone Primary School</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { value: loading ? "…" : students.length, label: "Students" },
              { value: loading ? "…" : `${schoolAvg}%`, label: "School Avg" },
              { value: loading ? "…" : topStudents, label: "Top Performers" },
              { value: loading ? "…" : atRisk, label: "At Risk" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-2 text-center">
                <div className="text-white text-xl font-bold">{value}</div>
                <div className="text-green-300 text-[10px] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "School Average", value: `${schoolAvg}%`, sub: `${term} overall`, barVal: schoolAvg, color: "bg-green-500" },
          { label: "Top Performers", value: topStudents, sub: "Scoring 80% and above", barVal: students.length > 0 ? (topStudents / students.length) * 100 : 0, color: "bg-blue-400" },
          { label: "Students At Risk", value: atRisk, sub: "Scoring below 60%", barVal: students.length > 0 ? (atRisk / students.length) * 100 : 0, color: "bg-red-400" },
        ].map(({ label, value, sub, barVal, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-gray-500 text-sm mb-1">{label}</div>
            <div className="text-xs text-gray-400 mb-3">{sub}</div>
            <ProgressBar value={barVal} color={color} height="h-2" />
          </div>
        ))}
      </div>

      {/* Filters + Actions */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or student ID..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all" />
        </div>

        {/* Term toggle */}
        <div className="flex rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex-shrink-0">
          {TERMS.map(t => (
            <button key={t} onClick={() => setTerm(t)}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${term === t ? "text-white" : "text-gray-500 hover:text-gray-700"}`}
              style={term === t ? { background: "#1a4d2a" } : {}}>
              {t}
            </button>
          ))}
        </div>

        {/* Export PDF */}
        <button onClick={() => exportPDF(students, term)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
          </svg>
          Export PDF
        </button>

        {/* Export Excel/CSV */}
        <button onClick={() => { exportCSV(students, term); showToast("CSV exported successfully"); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export Excel
        </button>

        {/* Publish */}
        <button onClick={() => !isPublished && setShowPublish(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex-shrink-0 ${isPublished ? "bg-green-50 text-green-700 border border-green-200 cursor-default" : "text-white hover:bg-[#143d22]"}`}
          style={!isPublished ? { background: "#1a4d2a" } : {}}
          disabled={isPublished || loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" />
          </svg>
          {isPublished ? "Published" : "Publish"}
        </button>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            {term} Results
            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filtered.length} students</span>
            {isPublished && (
              <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Published</span>
            )}
          </h3>
          <button onClick={() => students.length > 0 && setShowAdd(true)} disabled={students.length === 0}
            className="text-white font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#143d22] transition-colors disabled:opacity-40"
            style={{ background: "#1a4d2a" }}>
            + Add Record
          </button>
        </div>

        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["STUDENT", "GRADE", "SUBJECTS", "HIGHEST", "LOWEST", "OVERALL AVG", "ACTIONS"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400 text-sm">
                      {students.length === 0 ? "No students registered yet." : "No students found."}
                    </td>
                  </tr>
                ) : filtered.map((s) => {
                  // Records live under academic[termKey]
                  const records = s.academic?.[termKey] || [];
                  const avg = records.length > 0 ? Math.round(records.reduce((a, r) => a + r.avg, 0) / records.length) : null;
                  const highest = records.length > 0 ? records.reduce((a, b) => a.avg > b.avg ? a : b) : null;
                  const lowest = records.length > 0 ? records.reduce((a, b) => a.avg < b.avg ? a : b) : null;
                  return (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelected(s)}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${s.avatarColor || "from-green-600 to-green-400"} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                            {s.avatar}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{s.name}</div>
                            <div className="text-xs text-gray-400">{s.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs font-medium">{s.grade}</td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs">{records.length} subjects</td>
                      <td className="px-5 py-3.5">
                        {highest
                          ? <div><div className="text-xs font-semibold text-gray-800">{highest.subject}</div><div className="text-xs text-green-600 font-bold">{highest.avg}%</div></div>
                          : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {lowest
                          ? <div><div className="text-xs font-semibold text-gray-800">{lowest.subject}</div><div className="text-xs text-red-500 font-bold">{lowest.avg}%</div></div>
                          : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {avg !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16"><ProgressBar value={avg} color={barColor(avg)} height="h-1.5" /></div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${avgColor(avg)}`}>{avg}%</span>
                          </div>
                        ) : <span className="text-xs text-gray-400">No records</span>}
                      </td>
                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelected(s)}
                          className="text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Panels & Modals */}
      {showAdd && <AddRecordPanel students={students} onClose={() => setShowAdd(false)} onSave={handleAddRecords} />}
      {showPublish && <PublishModal term={term} count={students.length} onClose={() => setShowPublish(false)} onConfirm={handlePublish} publishing={publishing} />}
      {selected && <RecordDrawer student={selected} term={term} onClose={() => setSelected(null)} />}

      <style>{`
        @keyframes slideRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}