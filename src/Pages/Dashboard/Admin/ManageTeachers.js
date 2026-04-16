// src/Pages/Dashboard/Admin/ManageStudents.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminStudentService from "../../../service/admin/StudentManagementService";

const STATUSES = ["All", "Active", "Pending"];

const avatarColors = [
  "from-green-600 to-green-400", "from-blue-600 to-blue-400",
  "from-purple-600 to-purple-400", "from-orange-500 to-orange-300",
  "from-teal-600 to-teal-400",
];

const ProgressBar = ({ value, max = 100, color = "bg-green-500", height = "h-2" }) => (
  <div className={`w-full ${height} bg-gray-100 rounded-full overflow-hidden`}>
    <div className={`${height} ${color} rounded-full transition-all duration-500`} style={{ width: `${(value / max) * 100}%` }} />
  </div>
);

// ── Add Student Modal ──────────────────────────────────────────────────────
function AddStudentModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: "", grade: "Grade 1", age: "", gender: "Male",
    parent: "", phone: "", email: "", address: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = async () => {
    if (!form.name.trim() || !form.parent.trim()) {
      setError("Full Name and Parent/Guardian are required.");
      return;
    }
    setSaving(true);
    setError("");
    const result = await AdminStudentService.addStudent(form);
    setSaving(false);
    if (result.success) {
      onAdd(result.data);
      onClose();
    } else {
      setError("Failed to save: " + result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex" onClick={onClose}>
      <div className="flex-1" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)" }} />
      <div className="h-full w-full max-w-[440px] bg-white flex flex-col"
        style={{ boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", animation: "slideRight 0.25s ease" }}
        onClick={e => e.stopPropagation()}>

        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add New Student</h2>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the details to enrol a new student</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors text-lg leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Full Name *",         key: "name",    type: "text",   placeholder: "e.g. Emma Kamau"     },
              { label: "Age",                 key: "age",     type: "number", placeholder: "e.g. 10"             },
              { label: "Parent / Guardian *", key: "parent",  type: "text",   placeholder: "e.g. Jane Kamau"     },
              { label: "Phone",               key: "phone",   type: "text",   placeholder: "+263 77 123 4567"    },
              { label: "Email",               key: "email",   type: "email",  placeholder: "parent@email.com"    },
              { label: "Address",             key: "address", type: "text",   placeholder: "14 Borrowdale Rd"    },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                <input type={type} placeholder={placeholder} value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Grade</label>
              <select value={form.grade} onChange={e => set("grade", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all">
                {["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7"].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Gender</label>
              <select value={form.gender} onChange={e => set("gender", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all">
                <option>Male</option><option>Female</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-600">
            Cancel
          </button>
          <button onClick={handleAdd} disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
            style={{ background: "#1a4d2a" }}>
            {saving ? "Saving..." : "Enrol Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Remove Modal ───────────────────────────────────────────────────────────
function RemoveModal({ student, onClose, onRemove }) {
  const [reason, setReason] = useState("Transferred");
  const [removing, setRemoving] = useState(false);
  const reasons = ["Transferred", "Withdrawn by parent", "Completed schooling", "Expelled", "Other"];

  const handleRemove = async () => {
    setRemoving(true);
    const result = await AdminStudentService.removeStudent(student.id);
    setRemoving(false);
    if (result.success) {
      onRemove(student.id, reason);
      onClose();
    } else {
      alert("Failed to remove student: " + result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-[400px] max-w-[95%]"
        style={{ padding: "36px 32px 28px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
        onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "#fff5f5", border: "2px solid #fecaca" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">Remove Student</h2>
        <p className="text-sm text-gray-400 text-center mb-5">
          You are about to remove <span className="font-semibold text-gray-700">{student.name}</span> from the system.
        </p>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Reason for removal</label>
          <select value={reason} onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all">
            {reasons.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition-colors" style={{ color: "#1a4d2e" }}>
            Cancel
          </button>
          <button onClick={handleRemove} disabled={removing}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-80 transition-opacity disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#b91c1c,#ef4444)", boxShadow: "0 4px 14px rgba(239,68,68,0.3)" }}>
            {removing ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Student Detail Drawer ──────────────────────────────────────────────────
function StudentDrawer({ student, onClose, onUpdateStudent }) {
  const [tab, setTab] = useState("profile");
  const [newRemark, setNewRemark] = useState("");
  const [newDiscipline, setNewDiscipline] = useState({ issue: "", action: "" });
  const [saving, setSaving] = useState(false);

  const addRemark = async () => {
    if (!newRemark.trim()) return;
    setSaving(true);
    const result = await AdminStudentService.addRemark(student.id, student.remarks, newRemark);
    setSaving(false);
    if (result.success) {
      onUpdateStudent({ ...student, remarks: [...student.remarks, newRemark.trim()] });
      setNewRemark("");
    }
  };

  const addDiscipline = async () => {
    if (!newDiscipline.issue.trim()) return;
    setSaving(true);
    const result = await AdminStudentService.addDisciplineRecord(student.id, student.discipline, newDiscipline);
    setSaving(false);
    if (result.success) {
      const entry = {
        date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        ...newDiscipline,
      };
      onUpdateStudent({ ...student, discipline: [...student.discipline, entry] });
      setNewDiscipline({ issue: "", action: "" });
    }
  };

  const tabs = [
    { key: "profile",    label: "Profile"    },
    { key: "academic",   label: "Academic"   },
    { key: "attendance", label: "Attendance" },
    { key: "remarks",    label: "Remarks"    },
    { key: "discipline", label: "Discipline" },
  ];

  const attendancePct = student.attendance?.total > 0
    ? Math.round((student.attendance.present / student.attendance.total) * 100) : 0;

  const colorIdx = typeof student.id === "string"
    ? student.id.charCodeAt(student.id.length - 1) % avatarColors.length : 0;

  return (
    <div className="fixed inset-0 z-[9998] flex" onClick={onClose}>
      <div className="flex-1" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)" }} />
      <div className="h-full w-full max-w-[560px] bg-white flex flex-col overflow-hidden"
        style={{ boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", animation: "slideRight 0.25s ease" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#0d2818 0%,#1a4d2a 50%,#2d6e3e 100%)", padding: "24px 24px 20px" }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarColors[colorIdx]} flex items-center justify-center text-white font-bold text-base flex-shrink-0`}>
                {student.avatar}
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">{student.name}</h2>
                <p className="text-green-300 text-xs mt-0.5">{student.id} · {student.grade}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors text-xl">×</button>
          </div>
          <div className="flex gap-3">
            {[
              { label: "Attendance", value: `${attendancePct}%` },
              { label: "Avg Score",  value: student.academic?.length > 0 ? `${Math.round(student.academic.reduce((s, r) => s + r.avg, 0) / student.academic.length)}%` : "—" },
              { label: "Remarks",    value: student.remarks?.length    ?? 0 },
              { label: "Incidents",  value: student.discipline?.length ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-center">
                <div className="text-white font-bold text-base">{value}</div>
                <div className="text-green-300 text-[10px] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4 pt-2 bg-white gap-1 flex-shrink-0 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${tab === t.key ? "border-b-2 border-green-600 text-green-700 bg-green-50" : "text-gray-400 hover:text-gray-600"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">

          {tab === "profile" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Full Name",       value: student.name     },
                  { label: "Student ID",      value: student.id       },
                  { label: "Grade",           value: student.grade    },
                  { label: "Age",             value: student.age ? `${student.age} years` : "—" },
                  { label: "Gender",          value: student.gender   },
                  { label: "Enrolled",        value: student.enrolled },
                  { label: "Status",          value: student.status   },
                  { label: "Parent/Guardian", value: student.parent   },
                  { label: "Phone",           value: student.phone    },
                  { label: "Email",           value: student.email    },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Address</p>
                <p className="text-sm font-semibold text-gray-800">{student.address || "—"}</p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold ${student.status === "Active" ? "bg-green-50 text-green-700 border border-green-200" : "bg-yellow-50 text-yellow-700 border border-yellow-200"}`}>
                {student.status === "Active" ? "Student is currently active and enrolled." : "Enrolment pending — awaiting confirmation."}
              </div>
            </div>
          )}

          {tab === "academic" && (
            <div className="space-y-4">
              {!student.academic?.length ? (
                <div className="text-center py-12 text-gray-400 text-sm">No academic records yet.</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          {["SUBJECT","TEST 1","TEST 2","ASSIGN","GRADE","AVG"].map(h => (
                            <th key={h} className="text-left text-xs font-semibold text-gray-400 pb-3 pr-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {student.academic.map((r, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-3 pr-3 font-semibold text-gray-800 text-xs">{r.subject}</td>
                            <td className="py-3 pr-3 text-gray-500 text-xs">{r.test1}%</td>
                            <td className="py-3 pr-3 text-gray-500 text-xs">{r.test2}%</td>
                            <td className="py-3 pr-3 text-gray-500 text-xs">{r.assign ? `${r.assign}%` : "–"}</td>
                            <td className="py-3 pr-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.color}`}>{r.grade}</span></td>
                            <td className="py-3 font-bold text-gray-800 text-xs">{r.avg}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {student.perfTrend?.length > 0 && (
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">Performance Trend</p>
                      <div className="flex items-end gap-2 h-14">
                        {student.perfTrend.map((v, i) => (
                          <div key={i} className="flex-1 rounded-md" style={{ height: `${v}%`, background: `rgba(22,101,52,${0.3 + i * 0.15})` }} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {tab === "attendance" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Days Present", value: student.attendance?.present ?? 0, color: "text-green-600", bg: "bg-green-50",  border: "border-green-200"  },
                  { label: "Days Absent",  value: student.attendance?.absent  ?? 0, color: "text-red-600",   bg: "bg-red-50",    border: "border-red-200"    },
                  { label: "Days Late",    value: student.attendance?.late    ?? 0, color: "text-orange-500",bg: "bg-orange-50", border: "border-orange-200" },
                  { label: "Total Days",   value: student.attendance?.total   ?? 0, color: "text-blue-600",  bg: "bg-blue-50",   border: "border-blue-200"   },
                ].map(({ label, value, color, bg, border }) => (
                  <div key={label} className={`${bg} border ${border} rounded-2xl p-4 text-center`}>
                    <div className={`text-3xl font-bold ${color}`}>{value}</div>
                    <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-700">Attendance Rate</span>
                  <span className={`font-bold ${attendancePct >= 80 ? "text-green-600" : "text-red-500"}`}>{attendancePct}%</span>
                </div>
                <ProgressBar value={attendancePct} color={attendancePct >= 80 ? "bg-green-500" : "bg-red-400"} height="h-3" />
                <p className={`text-xs mt-2 ${attendancePct >= 80 ? "text-green-600" : "text-red-500"}`}>
                  {attendancePct >= 80 ? "Attendance is satisfactory." : "Attendance is below the 80% minimum threshold."}
                </p>
              </div>
            </div>
          )}

          {tab === "remarks" && (
            <div className="space-y-4">
              <div className="space-y-2">
                {!student.remarks?.length
                  ? <p className="text-sm text-gray-400 text-center py-8">No remarks yet.</p>
                  : student.remarks.map((r, i) => (
                    <div key={i} className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <p className="text-sm text-gray-700">{r}</p>
                    </div>
                  ))
                }
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add Remark</p>
                <textarea value={newRemark} onChange={e => setNewRemark(e.target.value)} rows={3}
                  placeholder="Write a remark about this student..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all resize-none" />
                <button onClick={addRemark} disabled={saving}
                  className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
                  style={{ background: "#1a4d2a" }}>
                  {saving ? "Saving..." : "Add Remark"}
                </button>
              </div>
            </div>
          )}

          {tab === "discipline" && (
            <div className="space-y-4">
              <div className="space-y-2">
                {!student.discipline?.length
                  ? <p className="text-sm text-gray-400 text-center py-8">No discipline records.</p>
                  : student.discipline.map((d, i) => (
                    <div key={i} className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Incident</span>
                        <span className="text-xs text-gray-400">{d.date}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">{d.issue}</p>
                      <p className="text-xs text-gray-500">Action: {d.action}</p>
                    </div>
                  ))
                }
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Log Discipline Report</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Issue / Incident</label>
                    <input value={newDiscipline.issue} onChange={e => setNewDiscipline(d => ({ ...d, issue: e.target.value }))}
                      placeholder="Describe the incident..." type="text"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Action Taken</label>
                    <input value={newDiscipline.action} onChange={e => setNewDiscipline(d => ({ ...d, action: e.target.value }))}
                      placeholder="e.g. Verbal warning, Detention..." type="text"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all" />
                  </div>
                  <button onClick={addDiscipline} disabled={saving}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#b91c1c,#ef4444)", boxShadow: "0 4px 14px rgba(239,68,68,0.2)" }}>
                    {saving ? "Saving..." : "Log Report"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function ManageStudents() {
  const navigate = useNavigate();
  const [students, setStudents]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected]         = useState(null);
  const [showAdd, setShowAdd]           = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  // ── Load from Firebase on mount ──────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const unsubscribe = AdminStudentService.subscribeToStudents((data) => {
      setStudents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchStudents = () => {};

  const filtered = students.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
                        s.id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStudent = (updated) => {
    setStudents(ss => ss.map(s => s.id === updated.id ? updated : s));
    if (selected?.id === updated.id) setSelected(updated);
  };

  const addStudent = (newStudent) => {
    setStudents(ss => [newStudent, ...ss]);
  };

  const removeStudent = (id) => {
    setStudents(ss => ss.filter(s => s.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const activeCount  = students.filter(s => s.status === "Active").length;
  const pendingCount = students.filter(s => s.status === "Pending").length;

  return (
    <div className="min-h-screen bg-[#f0f4f0] p-3 md:p-6 space-y-5 font-sans pt-16 md:pt-6">

      {/* Hero Banner */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#0d2818 0%,#1a4d2a 50%,#2d6e3e 100%)" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-5 md:px-8 py-5 md:py-7 gap-4">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">Student Management</h1>
            <p className="text-green-300 text-xs md:text-sm">Term 1 · 2025 &nbsp;|&nbsp; Corner Stone Primary School</p>
          </div>
          <div className="flex gap-3">
            {[
              { value: students.length, label: "Total"   },
              { value: activeCount,     label: "Active"  },
              { value: pendingCount,    label: "Pending" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-5 py-2 text-center">
                <div className="text-white text-xl font-bold">{value}</div>
                <div className="text-green-300 text-[10px] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or student ID..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all">
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            All Students
            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {filtered.length} found
            </span>
          </h3>
          <button onClick={() => setShowAdd(true)}
            className="text-white font-semibold text-xs px-4 py-2 rounded-xl hover:bg-[#143d22] transition-colors"
            style={{ background: "#1a4d2a" }}>
            + Add Student
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-900" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["STUDENT","GRADE","PARENT/GUARDIAN","AVG SCORE","STATUS","ACTIONS"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                      {students.length === 0 ? "No students enrolled yet." : "No students match your search."}
                    </td>
                  </tr>
                ) : filtered.map((s, idx) => {
                  const avgScore = s.academic?.length > 0
                    ? Math.round(s.academic.reduce((a, r) => a + r.avg, 0) / s.academic.length) : null;
                  return (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelected(s)}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                            {s.avatar}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{s.name}</div>
                            <div className="text-xs text-gray-400">{s.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs font-medium">{s.grade}</td>
                      <td className="px-5 py-3.5">
                        <div className="text-gray-700 text-xs font-medium">{s.parent}</div>
                        <div className="text-gray-400 text-xs">{s.phone}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        {avgScore !== null
                          ? <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${avgScore >= 75 ? "bg-green-100 text-green-600" : avgScore >= 60 ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-500"}`}>
                              {avgScore}%
                            </span>
                          : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.status === "Active" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setSelected(s)}
                            className="text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
                            View
                          </button>
                          <button onClick={() => setRemoveTarget(s)}
                            className="text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals & Drawer */}
      {showAdd      && <AddStudentModal onClose={() => setShowAdd(false)} onAdd={addStudent} />}
      {removeTarget && <RemoveModal student={removeTarget} onClose={() => setRemoveTarget(null)} onRemove={removeStudent} />}
      {selected     && <StudentDrawer student={selected} onClose={() => setSelected(null)} onUpdateStudent={updateStudent} />}
    </div>
  );
}