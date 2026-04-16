import { useState, useEffect } from "react";
import TimetableService, {
  DAYS,
  GRADES,
  ROOMS,
  TEACHERS,
  PERIODS,
  SUBJECTS,
} from "../../../service/admin/TimetableServices";
import { Calendar, Library, GraduationCap } from "lucide-react";

const subjectMap = Object.fromEntries(SUBJECTS.map(s => [s.name, s]));

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ cell, day, period, onSave, onClose, saving }) {
  const [form, setForm] = useState({ ...cell });
  const isFree = form.subject === "Free";
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const subjectInfo = subjectMap[form.subject];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}
        >
          <div>
            <h2 className="text-white text-lg font-bold">Edit Period</h2>
            <p className="text-green-300 text-xs mt-0.5">
              {day} · {PERIODS.find(p => p.id === period)?.label} · {PERIODS.find(p => p.id === period)?.time}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-base transition-colors hover:bg-white/20"
          >×</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
            <select
              value={form.subject || "Free"}
              onChange={e => {
                set("subject", e.target.value);
                if (e.target.value === "Free") { set("teacher", ""); set("room", ""); }
              }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-green-500 transition-colors"
            >
              <option value="Free">Free Period</option>
              {SUBJECTS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          {!isFree && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Teacher</label>
                <select
                  value={form.teacher || TEACHERS[0]}
                  onChange={e => set("teacher", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-green-500 transition-colors"
                >
                  <option value="">Select Teacher</option>
                  {TEACHERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Room</label>
                <select
                  value={form.room || ROOMS[0]}
                  onChange={e => set("room", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-green-500 transition-colors"
                >
                  <option value="">Select Room</option>
                  {ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </>
          )}

          {form.subject && (
            <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border ${isFree ? "bg-gray-50 border-gray-200" : "bg-gray-50 border-gray-100"}`}>
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isFree ? "bg-gray-400" : subjectInfo?.dot || "bg-green-500"}`} />
              <span className="text-sm font-semibold text-gray-800">
                {form.subject}{!isFree && form.teacher ? ` · ${form.teacher}` : ""}
              </span>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >Cancel</button>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60 flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #1a4d2a, #2d6e3e)" }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
const ProgressBar = ({ value, max = 100, color = "bg-green-500" }) => (
  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
    <div
      className={`h-2 ${color} rounded-full transition-all duration-500`}
      style={{ width: `${max ? (value / max) * 100 : 0}%` }}
    />
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function Timetable() {
  const [timetable, setTimetable] = useState(null);
  const [selectedClass, setSelectedClass] = useState("Grade 1");
  const [viewMode, setViewMode] = useState("week");
  const [activeDay] = useState("Monday");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsub = TimetableService.subscribeToTimetable(selectedClass, (data) => {
      setTimetable(data);
    });
    return () => unsub();
  }, [selectedClass]);

  const safeSchedule = timetable ?? {};
  const allCells = Object.values(safeSchedule).flatMap(d => Object.values(d));
  const lessonCount = allCells.filter(c => c.subject !== "Free").length;
  const freeCount = allCells.filter(c => c.subject === "Free").length;
  const displayDays = viewMode === "day" ? [activeDay] : DAYS;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const handleSave = async (form) => {
    if (!editing) return;
    setSaving(true);
    const result = await TimetableService.updateCell(
      selectedClass,
      editing.day,
      editing.periodId,
      form
    );
    setSaving(false);
    if (result.success) {
      setEditing(null);
      showToast(`${editing.day} · Period ${editing.periodId} updated`);
    } else {
      showToast("Failed to save: " + result.error, "error");
    }
  };

  const handleReset = async () => {
    if (!window.confirm(`Reset ${selectedClass} timetable to default? This cannot be undone.`)) return;
    setSaving(true);
    const result = await TimetableService.resetToDefault(selectedClass);
    setSaving(false);
    if (result.success) showToast(`${selectedClass} reset to default`);
  };

  const handleSeedAll = async () => {
    if (!window.confirm("Seed all class timetables with default data? Existing timetables will be skipped.")) return;
    const result = await TimetableService.seedAllDefaults();
    showToast(`Seeded ${result.created.length} classes · Skipped ${result.skipped.length}`);
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 pt-16 md:pt-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium ${toast.type === 'error' ? 'bg-red-500' : 'bg-gray-900'}`}>
          {toast.msg}
        </div>
      )}

      {/* Hero Banner */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between px-5 md:px-8 py-5 md:py-7 gap-4">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">Manage Timetables</h1>
            <p className="text-green-300 text-xs md:text-sm">Master Schedule Editor</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleReset} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-colors">
              Reset Class
            </button>
            <button onClick={handleSeedAll} className="px-4 py-2 bg-white text-green-900 hover:bg-gray-50 rounded-lg text-sm font-bold transition-colors shadow-sm">
              Seed All defaults
            </button>
          </div>
        </div>
      </div>

      {/* Grade Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-full overflow-x-auto">
        {GRADES.map(g => (
          <button
            key={g}
            onClick={() => setSelectedClass(g)}
            className={`px-4 md:px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap flex-1 md:flex-none ${selectedClass === g ? "bg-white text-gray-900 shadow-sm font-semibold" : "text-gray-500 hover:text-gray-700"}`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><Library className="w-4 h-4" /></div>
            <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">{selectedClass}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{lessonCount}</div>
          <div className="text-gray-400 text-sm mb-3">Total Lessons</div>
          <ProgressBar value={lessonCount} max={lessonCount + freeCount} color="bg-green-500" />
        </div>
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600"><Calendar className="w-4 h-4" /></div>
            <span className="text-xs font-semibold text-purple-500 bg-purple-50 px-2 py-1 rounded-full">Free</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{freeCount}</div>
          <div className="text-gray-400 text-sm mb-3">Free Periods</div>
          <ProgressBar value={freeCount} max={lessonCount + freeCount} color="bg-purple-400" />
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5 inline-flex">
        {[["week", "Weekly View"], ["day", "Daily View"]].map(([v, lbl]) => (
          <button
            key={v}
            onClick={() => setViewMode(v)}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${viewMode === v ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {v === "week" && <Calendar className="w-4 h-4 inline-block mr-1" />}
            {lbl}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="p-4 border-b border-gray-100 bg-gray-50/50 font-semibold text-gray-500 text-xs uppercase tracking-wider w-36 text-center">
                Period
              </th>
              {displayDays.map(day => (
                <th key={day} className="p-4 border-b border-gray-100 bg-gray-50/50 font-semibold text-gray-800 text-sm text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {PERIODS.map(period => (
              <tr key={period.id} className={period.isBreak ? "bg-gray-50" : "hover:bg-gray-50/30 transition-colors"}>
                <td className="p-4 text-center border-r border-gray-50">
                  <div className="text-xs font-bold text-gray-900">{period.label}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{period.time}</div>
                </td>
                {displayDays.map(day => {
                  const cell = safeSchedule[day]?.[period.id];
                  const isFree = !cell || cell?.subject === "Free";
                  const subjectInfo = subjectMap[cell?.subject];

                  if (period.isBreak) {
                    return (
                      <td key={day} className="p-4 text-center">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{period.label}</span>
                      </td>
                    );
                  }

                  return (
                    <td key={day} className="p-2 sm:p-3">
                      <div
                        onClick={() => setEditing({ day, periodId: period.id, cell: cell || { subject: "Free" } })}
                        className={`relative h-full min-h-[85px] rounded-xl p-3 border transition-all ${
                          isFree 
                            ? "border-dashed border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 cursor-pointer" 
                            : `border-transparent ${subjectInfo?.pill || "bg-gray-100 text-gray-800"} hover:shadow-md cursor-pointer`
                        }`}
                      >
                        {isFree ? (
                          <span className="text-xs font-medium text-gray-400">+ Add</span>
                        ) : (
                          <div className="flex flex-col h-full justify-between gap-1.5">
                             <div className="font-bold text-xs sm:text-sm tracking-tight leading-tight">{cell?.subject}</div>
                             <div className="space-y-0.5 pt-1">
                               <div className="text-[10px] font-medium opacity-80 flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                 <Library className="w-3 h-3 flex-shrink-0" />
                                 {cell?.room}
                               </div>
                               <div className="text-[10px] font-medium opacity-80 flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                 <GraduationCap className="w-3 h-3 flex-shrink-0" />
                                 {cell?.teacher}
                               </div>
                             </div>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditModal
          cell={editing.cell}
          day={editing.day}
          period={editing.periodId}
          onSave={handleSave}
          onClose={() => !saving && setEditing(null)}
          saving={saving}
        />
      )}
    </div>
  );
}