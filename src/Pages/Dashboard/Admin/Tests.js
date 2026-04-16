import { useState, useRef } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────
const GRADES   = ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7"];
const CLASSES  = GRADES.flatMap(g => [`${g}A`, `${g}B`]);
const SUBJECTS = [
  "Mathematics","English","Science","Social Studies",
  "Shona","Physical Ed.","Art & Craft","Music","Environmental Science",
];
const TEACHERS = ["Mr. Moyo","Mrs. Dube","Mr. Ncube","Ms. Sibanda","Mrs. Mpofu","Mr. Ndlovu","Ms. Chikwanda"];

const SUBJECT_STYLES = {
  "Mathematics":           { pill: "bg-blue-100 text-blue-700",      dot: "bg-blue-500"   },
  "English":               { pill: "bg-pink-100 text-pink-700",       dot: "bg-pink-500"   },
  "Science":               { pill: "bg-green-100 text-green-700",     dot: "bg-green-500"  },
  "Social Studies":        { pill: "bg-orange-100 text-orange-700",   dot: "bg-orange-500" },
  "Shona":                 { pill: "bg-purple-100 text-purple-700",   dot: "bg-purple-500" },
  "Physical Ed.":          { pill: "bg-red-100 text-red-700",         dot: "bg-red-500"    },
  "Art & Craft":           { pill: "bg-yellow-100 text-yellow-700",   dot: "bg-yellow-500" },
  "Music":                 { pill: "bg-sky-100 text-sky-700",         dot: "bg-sky-500"    },
  "Environmental Science": { pill: "bg-teal-100 text-teal-700",       dot: "bg-teal-500"   },
};

const STATUS_STYLES = {
  "Scheduled": { pill: "bg-blue-100 text-blue-700",   dot: "bg-blue-500"   },
  "Active":    { pill: "bg-green-100 text-green-700", dot: "bg-green-500"  },
  "Completed": { pill: "bg-gray-100 text-gray-500",   dot: "bg-gray-400"   },
  "Cancelled": { pill: "bg-red-100 text-red-600",     dot: "bg-red-500"    },
};

const TYPE_STYLES = {
  "Class Test":  { pill: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  "Term Exam":   { pill: "bg-rose-100 text-rose-700",     dot: "bg-rose-500"   },
  "Quiz":        { pill: "bg-cyan-100 text-cyan-700",     dot: "bg-cyan-500"   },
  "Mock Exam":   { pill: "bg-amber-100 text-amber-700",   dot: "bg-amber-500"  },
  "Oral Test":   { pill: "bg-lime-100 text-lime-700",     dot: "bg-lime-500"   },
};

const FILE_ICONS = {
  pdf:  { bg: "bg-red-50",    icon: "text-red-500",    label: "PDF"  },
  docx: { bg: "bg-blue-50",   icon: "text-blue-500",   label: "DOCX" },
  xlsx: { bg: "bg-green-50",  icon: "text-green-600",  label: "XLSX" },
  pptx: { bg: "bg-orange-50", icon: "text-orange-500", label: "PPTX" },
  other:{ bg: "bg-gray-50",   icon: "text-gray-500",   label: "FILE" },
};

function getFileStyle(name) {
  if (!name) return FILE_ICONS.other;
  const ext = name.split(".").pop().toLowerCase();
  return FILE_ICONS[ext] || FILE_ICONS.other;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(iso) {
  return Math.ceil((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24));
}

const INITIAL_TESTS = [
  {
    id: 1,
    title: "Mathematics Mid-Term Test",
    type: "Class Test",
    subject: "Mathematics",
    description: "Covers chapters 4–6: fractions, decimals and percentages. Calculators are not permitted. Learners should bring pencils, rulers and erasers.",
    assignedTo: ["Grade 5A","Grade 5B"],
    teacher: "Mr. Moyo",
    testDate: "2025-06-14",
    duration: "60",
    totalMarks: 50,
    venue: "Room 101",
    status: "Scheduled",
    fileName: "maths_midterm_test_grade5.pdf",
    fileSize: "318 KB",
    fileType: "pdf",
  },
  {
    id: 2,
    title: "English Comprehension Quiz",
    type: "Quiz",
    subject: "English",
    description: "Short quiz on reading comprehension and vocabulary. Passage will be provided on the day. No prior reading material required.",
    assignedTo: ["Grade 3A","Grade 3B","Grade 4A"],
    teacher: "Mrs. Dube",
    testDate: "2025-06-10",
    duration: "30",
    totalMarks: 20,
    venue: "Room 102",
    status: "Active",
    fileName: "english_comprehension_quiz.pdf",
    fileSize: "142 KB",
    fileType: "pdf",
  },
  {
    id: 3,
    title: "Science End-of-Term Exam",
    type: "Term Exam",
    subject: "Science",
    description: "End of term examination covering the full syllabus for Term 2. Topics include matter, living organisms, energy and the environment.",
    assignedTo: ["Grade 6A","Grade 6B","Grade 7A","Grade 7B"],
    teacher: "Mr. Ncube",
    testDate: "2025-07-15",
    duration: "90",
    totalMarks: 100,
    venue: "Hall A",
    status: "Scheduled",
    fileName: "science_endterm_exam_g6_g7.pdf",
    fileSize: "524 KB",
    fileType: "pdf",
  },
  {
    id: 4,
    title: "Shona Oral Test – Term 2",
    type: "Oral Test",
    subject: "Shona",
    description: "Individual oral assessment on narrative storytelling and pronunciation. Each learner will be called individually. Duration per learner is approximately 5 minutes.",
    assignedTo: ["Grade 2A","Grade 2B"],
    teacher: "Ms. Sibanda",
    testDate: "2025-06-05",
    duration: "5",
    totalMarks: 20,
    venue: "Room 103",
    status: "Completed",
    fileName: null,
    fileSize: null,
    fileType: null,
  },
  {
    id: 5,
    title: "Social Studies Mock Exam",
    type: "Mock Exam",
    subject: "Social Studies",
    description: "Full mock examination in preparation for end of year. Covers map skills, community, history and government. Answer booklets will be provided.",
    assignedTo: ["Grade 7A","Grade 7B"],
    teacher: "Ms. Sibanda",
    testDate: "2025-06-20",
    duration: "90",
    totalMarks: 100,
    venue: "Hall A",
    status: "Scheduled",
    fileName: "social_studies_mock_grade7.docx",
    fileSize: "210 KB",
    fileType: "docx",
  },
];

// ── ProgressBar ───────────────────────────────────────────────────────────────
const ProgressBar = ({ value, max = 100, color = "bg-green-500" }) => (
  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
    <div className={`h-2 ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.min((value / (max || 1)) * 100, 100)}%` }} />
  </div>
);

// ── Confirm Delete ────────────────────────────────────────────────────────────
function ConfirmModal({ title, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5" style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}>
          <h2 className="text-white text-lg font-bold">Delete Test</h2>
          <p className="text-green-300 text-xs mt-0.5">This action cannot be undone</p>
        </div>
        <div className="p-6">
          <p className="text-gray-700 text-sm mb-1">Are you sure you want to delete:</p>
          <p className="text-gray-900 font-semibold text-sm">"{title}"</p>
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Test Modal (Add / Edit) ───────────────────────────────────────────────────
function TestModal({ test, onSave, onClose }) {
  const isEdit = !!test;
  const fileRef = useRef();

  const [form, setForm] = useState(
    isEdit ? { ...test } : {
      title: "", type: "Class Test", subject: "Mathematics",
      description: "", assignedTo: [], teacher: TEACHERS[0],
      testDate: "", duration: "60", totalMarks: 50, venue: "",
      status: "Scheduled", fileName: null, fileSize: null, fileType: null,
    }
  );
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleClass = cls => set("assignedTo",
    form.assignedTo.includes(cls) ? form.assignedTo.filter(c => c !== cls) : [...form.assignedTo, cls]
  );

  const validate = () => {
    const e = {};
    if (!form.title.trim())         e.title       = "Title is required";
    if (!form.description.trim())   e.description = "Description is required";
    if (!form.testDate)             e.testDate    = "Test date is required";
    if (!form.venue.trim())         e.venue       = "Venue is required";
    if (form.assignedTo.length === 0) e.assignedTo = "Select at least one class";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    set("fileName", f.name);
    set("fileSize", (f.size / 1024).toFixed(0) + " KB");
    set("fileType", f.name.split(".").pop().toLowerCase());
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ ...form, id: isEdit ? form.id : Date.now() });
  };

  const subStyle  = SUBJECT_STYLES[form.subject];
  const typeStyle = TYPE_STYLES[form.type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}>
          <div>
            <h2 className="text-white text-lg font-bold">{isEdit ? "Edit Test" : "Schedule New Test"}</h2>
            <p className="text-green-300 text-xs mt-0.5">{isEdit ? "Update test details and question paper" : "Fill in details and optionally upload a question paper"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: "rgba(255,255,255,0.1)" }}></button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Test Title <span className="text-red-400">*</span></label>
            <input type="text" value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="e.g. Mathematics Mid-Term Test – Grade 5"
              className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors ${errors.title ? "border-red-300" : "border-gray-200 focus:border-green-500"}`} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Type + Subject */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Test Type</label>
              <select value={form.type} onChange={e => set("type", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-green-500 transition-colors">
                {Object.keys(TYPE_STYLES).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
              <select value={form.subject} onChange={e => set("subject", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-green-500 transition-colors">
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Teacher */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Teacher / Invigilator</label>
            <select value={form.teacher} onChange={e => set("teacher", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-green-500 transition-colors">
              {TEACHERS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Instructions <span className="text-red-400">*</span></label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              placeholder="Topics covered, materials allowed, special instructions..."
              rows={3}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors resize-none ${errors.description ? "border-red-300" : "border-gray-200 focus:border-green-500"}`} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Date + Duration + Marks */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Test Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.testDate} onChange={e => set("testDate", e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors ${errors.testDate ? "border-red-300" : "border-gray-200 focus:border-green-500"}`} />
              {errors.testDate && <p className="text-red-500 text-xs mt-1">{errors.testDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Duration (min)</label>
              <input type="number" value={form.duration} onChange={e => set("duration", e.target.value)} min="5" max="300"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-green-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Total Marks</label>
              <input type="number" value={form.totalMarks} onChange={e => set("totalMarks", Number(e.target.value))} min="1"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-green-500 transition-colors" />
            </div>
          </div>

          {/* Venue + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Venue <span className="text-red-400">*</span></label>
              <input type="text" value={form.venue} onChange={e => set("venue", e.target.value)} placeholder="e.g. Room 101 / Hall A"
                className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors ${errors.venue ? "border-red-300" : "border-gray-200 focus:border-green-500"}`} />
              {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-green-500 transition-colors">
                {Object.keys(STATUS_STYLES).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Assign to classes */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Assign To <span className="text-red-400">*</span>
              {form.assignedTo.length > 0 && <span className="ml-2 text-green-600 normal-case font-semibold">{form.assignedTo.length} selected</span>}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {GRADES.map(g => (
                <div key={g}>
                  <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">{g}</div>
                  {["A","B"].map(s => {
                    const cls = `${g}${s}`;
                    const checked = form.assignedTo.includes(cls);
                    return (
                      <button key={cls} type="button" onClick={() => toggleClass(cls)}
                        className={`w-full mb-1 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          checked ? "bg-green-900 text-white border-green-900" : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                        }`}>{cls}</button>
                    );
                  })}
                </div>
              ))}
            </div>
            {errors.assignedTo && <p className="text-red-500 text-xs mt-1">{errors.assignedTo}</p>}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Question Paper (optional)</label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors text-center ${
                form.fileName ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-green-400 bg-gray-50"
              }`}
            >
              <input ref={fileRef} type="file" className="hidden" onChange={handleFile}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" />
              {form.fileName ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getFileStyle(form.fileName).bg}`}>
                      <svg className={`w-5 h-5 ${getFileStyle(form.fileName).icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{form.fileName}</div>
                      <div className="text-xs text-gray-400">{form.fileSize}</div>
                    </div>
                  </div>
                  <button type="button" onClick={e => { e.stopPropagation(); set("fileName",null); set("fileSize",null); set("fileType",null); }}
                    className="text-xs text-red-400 hover:text-red-600 font-semibold px-2 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">Remove</button>
                </div>
              ) : (
                <div>
                  <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <p className="text-sm text-gray-400 font-medium">Click to upload question paper</p>
                  <p className="text-xs text-gray-300 mt-0.5">PDF, DOCX, XLSX, JPG, PNG</p>
                </div>
              )}
            </div>
          </div>

          {/* Preview chip */}
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border bg-gray-50 border-gray-100">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${subStyle?.dot || "bg-gray-400"}`} />
            <span className="text-sm font-semibold text-gray-800 truncate flex-1">{form.title || "Test preview"}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${typeStyle?.pill || "bg-gray-100 text-gray-500"}`}>{form.type}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_STYLES[form.status]?.pill}`}>{form.status}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 flex gap-3 justify-end flex-shrink-0 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-green-900 hover:bg-green-800 transition-colors">
            {isEdit ? "Save Changes" : "Schedule Test"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Test Card ─────────────────────────────────────────────────────────────────
function TestCard({ test, isTeacher, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const subStyle  = SUBJECT_STYLES[test.subject]  || { pill: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
  const statStyle = STATUS_STYLES[test.status]    || STATUS_STYLES.Scheduled;
  const typeStyle = TYPE_STYLES[test.type]        || { pill: "bg-gray-100 text-gray-500", dot: "bg-gray-400" };
  const fileStyle = getFileStyle(test.fileName);
  const days      = daysUntil(test.testDate);
  const isLong    = test.description.length > 160;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-200">
      <div className="p-5">

        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${subStyle.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${subStyle.dot}`} />
              {test.subject}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${typeStyle.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${typeStyle.dot}`} />
              {test.type}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${statStyle.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statStyle.dot}`} />
              {test.status}
            </span>
          </div>
          {isTeacher && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => onEdit(test)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit
              </button>
              <button onClick={() => onDelete(test)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-gray-900 font-bold text-base mb-1.5 leading-snug">{test.title}</h3>

        {/* Key info row */}
        <div className="flex flex-wrap gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {formatDate(test.testDate)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {test.duration} min
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            {test.totalMarks} marks
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            {test.venue}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed">
          {isLong && !expanded ? test.description.slice(0, 160) + "..." : test.description}
        </p>
        {isLong && (
          <button onClick={() => setExpanded(e => !e)} className="text-green-600 text-xs font-semibold mt-1 hover:underline">
            {expanded ? "Show less" : "Read more"}
          </button>
        )}

        {/* Classes */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {test.assignedTo.map(cls => (
            <span key={cls} className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{cls}</span>
          ))}
        </div>

        {/* File */}
        {test.fileName && (
          <div className={`flex items-center gap-3 mt-3 px-3 py-2.5 rounded-xl border border-gray-100 ${fileStyle.bg}`}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border border-gray-100">
              <svg className={`w-4 h-4 ${fileStyle.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-700 truncate">{test.fileName}</div>
              <div className="text-[10px] text-gray-400">{test.fileSize} · {fileStyle.label}</div>
            </div>
            <button className="text-xs font-bold text-green-700 hover:text-green-900 transition-colors flex items-center gap-1 flex-shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <span className="text-xs text-gray-400">{test.teacher}</span>
          </div>
          {test.status !== "Completed" && test.status !== "Cancelled" && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              days < 0     ? "bg-red-50 text-red-500"
              : days <= 3  ? "bg-orange-50 text-orange-500"
              : days <= 7  ? "bg-yellow-50 text-yellow-600"
              :              "bg-gray-50 text-gray-400"
            }`}>
              {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `In ${days} day${days !== 1 ? "s" : ""}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Tests() {
  const [tests, setTests]               = useState(INITIAL_TESTS);
  const [isTeacher]                     = useState(true);
  const [search, setSearch]             = useState("");
  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]               = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800); };

  const handleSave = form => {
    if (editTarget) {
      setTests(prev => prev.map(t => t.id === editTarget.id ? form : t));
      showToast("Test updated successfully");
    } else {
      setTests(prev => [form, ...prev]);
      showToast("Test scheduled successfully");
    }
    setShowModal(false);
    setEditTarget(null);
  };

  const handleDelete = () => {
    setTests(prev => prev.filter(t => t.id !== deleteTarget.id));
    showToast("Test deleted", "error");
    setDeleteTarget(null);
  };

  const openEdit = t  => { setEditTarget(t); setShowModal(true); };
  const openNew  = () => { setEditTarget(null); setShowModal(true); };

  const filtered = tests.filter(t =>
    !search ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.teacher.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase())
  );

  const total     = tests.length;
  const scheduled = tests.filter(t => t.status === "Scheduled").length;
  const active    = tests.filter(t => t.status === "Active").length;
  const completed = tests.filter(t => t.status === "Completed").length;
  const withFile  = tests.filter(t => t.fileName).length;

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 pt-16 md:pt-6">

      {/* ── Hero Banner ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-5 md:px-8 py-5 md:py-7 gap-4">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">Tests & Examinations</h1>
            <p className="text-green-300 text-xs md:text-sm">
              Academic Year 2024 / 25 &nbsp;|&nbsp; Term 2 &nbsp;|&nbsp; Corner Stone Primary School
            </p>
          </div>
          <div className="flex gap-3 md:gap-4 flex-wrap">
            {[
              { value: total,     label: "Total"     },
              { value: scheduled, label: "Scheduled" },
              { value: completed, label: "Completed" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 md:px-6 py-2 md:py-3 text-center flex-1 md:flex-none md:min-w-[90px]">
                <div className="text-white text-xl md:text-2xl font-bold">{value}</div>
                <div className="text-green-300 text-[10px] md:text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">

        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
            <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">All</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{total}</div>
          <div className="text-gray-400 text-sm mb-3 md:mb-4">Total Tests</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>All tests</span><span>{total}</span></div>
          <ProgressBar value={total} max={total} color="bg-green-500" />
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded-full">Soon</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{scheduled}</div>
          <div className="text-gray-400 text-sm mb-3 md:mb-4">Scheduled</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Of total</span><span>{total}</span></div>
          <ProgressBar value={scheduled} max={total} color="bg-blue-500" />
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Done</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{completed}</div>
          <div className="text-gray-400 text-sm mb-3 md:mb-4">Completed</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Of total</span><span>{total}</span></div>
          <ProgressBar value={completed} max={total} color="bg-gray-400" />
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            </div>
            <span className="text-xs font-semibold text-purple-500 bg-purple-50 px-2 py-1 rounded-full">Papers</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{withFile}</div>
          <div className="text-gray-400 text-sm mb-3 md:mb-4">With Question Papers</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Of total</span><span>{total}</span></div>
          <ProgressBar value={withFile} max={total} color="bg-purple-400" />
        </div>

      </div>

      {/* ── Tests List Card ── */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span className="font-semibold text-gray-800">All Tests</span>
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search tests..."
                className="pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-green-400 transition-colors w-72" />
            </div>
            {isTeacher && (
              <button onClick={openNew}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold text-white bg-green-900 hover:bg-green-800 transition-colors whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Schedule Test
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <p className="text-sm font-medium">No tests found</p>
              <p className="text-xs mt-1">Try adjusting your search</p>
            </div>
          ) : (
            filtered.map(t => (
              <TestCard key={t.id} test={t} isTeacher={isTeacher} onEdit={openEdit} onDelete={setDeleteTarget} />
            ))
          )}
        </div>

        {/* Legend */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Test Types</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TYPE_STYLES).map(([type, style]) => (
              <div key={type} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.pill}`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                {type}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom two-col ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 pb-6">

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            <span className="font-semibold text-gray-800">Tests by Subject</span>
          </div>
          {SUBJECTS.map(s => {
            const count = tests.filter(t => t.subject === s).length;
            if (!count) return null;
            return (
              <div key={s} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm font-semibold text-gray-800 w-44 shrink-0 truncate">{s}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${SUBJECT_STYLES[s]?.dot}`} style={{ width: `${(count / total) * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-gray-800 w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span className="font-semibold text-gray-800">Test Overview</span>
          </div>
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 rounded-full flex flex-col items-center justify-center" style={{ border: "8px solid #4caf6a" }}>
              <span className="text-3xl font-bold text-gray-900">{total}</span>
              <span className="text-xs text-gray-400 mt-0.5">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { lbl: "Scheduled",  val: `${scheduled}`,                                              cls: "text-blue-600",   bg: "bg-blue-50"   },
              { lbl: "Active",     val: `${active}`,                                                 cls: "text-green-600",  bg: "bg-green-50"  },
              { lbl: "Completed",  val: `${completed}`,                                              cls: "text-gray-600",   bg: "bg-gray-50"   },
              { lbl: "With Papers",val: `${withFile}`,                                               cls: "text-purple-600", bg: "bg-purple-50" },
            ].map(({ lbl, val, cls, bg }) => (
              <div key={lbl} className={`${bg} rounded-xl p-3.5 text-center`}>
                <div className="text-xs text-gray-400 mb-1">{lbl}</div>
                <div className={`text-base font-bold ${cls}`}>{val}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-7 right-7 z-50 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-xl"
          style={{ background: toast.type === "error" ? "linear-gradient(135deg,#c0392b,#e74c3c)" : "linear-gradient(135deg,#1a4d2a,#2d6e3e)", animation: "slideUp .3s ease" }}>
          {toast.msg}
        </div>
      )}

      {showModal && (
        <TestModal test={editTarget} onSave={handleSave} onClose={() => { setShowModal(false); setEditTarget(null); }} />
      )}
      {deleteTarget && (
        <ConfirmModal title={deleteTarget.title} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(14px); opacity:0; } to { transform: translateY(0); opacity:1; } }
      `}</style>
    </div>
  );
}