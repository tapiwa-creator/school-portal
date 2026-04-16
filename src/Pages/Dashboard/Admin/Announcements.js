import { useState, useRef } from "react";

// ── Initial Data ──────────────────────────────────────────────────────────────
const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1,
    title: "End of Term Examinations Schedule",
    body: "The end of term examinations will commence on 14 July 2025. All learners are required to be at school by 07:00. Please ensure all outstanding fees are settled before the examination period begins. Parents are requested to collect result slips on 25 July 2025.",
    category: "Examinations",
    audience: "All",
    priority: "high",
    author: "Administrator",
    date: "2025-06-02",
    pinned: true,
    attachment: null,
  },
  {
    id: 2,
    title: "Sports Day – Friday 13 June",
    body: "The annual sports day will be held on Friday 13 June 2025 at the school grounds. Learners should come dressed in their house colours. Events begin at 08:30. Parents and guardians are warmly invited to attend and cheer on their children.",
    category: "Events",
    audience: "All",
    priority: "medium",
    author: "Administrator",
    date: "2025-05-28",
    pinned: false,
    attachment: "sports_day_programme.pdf",
  },
  {
    id: 3,
    title: "Grade 7 Farewell Ceremony",
    body: "The Grade 7 farewell ceremony is scheduled for 18 July 2025 in the school hall. Admission is by ticket only. Each learner is allocated two tickets for parents or guardians. Dress code is formal. Ceremony starts at 14:00.",
    category: "Events",
    audience: "Grade 7",
    priority: "medium",
    author: "Administrator",
    date: "2025-05-25",
    pinned: false,
    attachment: null,
  },
  {
    id: 4,
    title: "Fee Payment Reminder – Term 2",
    body: "This is a reminder that Term 2 school fees were due on 1 May 2025. Learners with outstanding balances exceeding 50% of term fees may be excluded from examinations. Please contact the school bursar to make payment arrangements.",
    category: "Finance",
    audience: "Parents",
    priority: "high",
    author: "Administrator",
    date: "2025-05-20",
    pinned: false,
    attachment: null,
  },
  {
    id: 5,
    title: "New Library Hours",
    body: "The school library will now be open Monday to Friday from 06:45 to 16:30. Learners are encouraged to make use of the library for reading and study. A maximum of 2 books may be borrowed at a time for a period of 7 days.",
    category: "General",
    audience: "All",
    priority: "low",
    author: "Administrator",
    date: "2025-05-15",
    pinned: false,
    attachment: null,
  },
];

const CATEGORIES = ["General", "Examinations", "Events", "Finance", "Health", "Academic"];
const AUDIENCES  = ["All", "Parents", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"];
const PRIORITIES = ["low", "medium", "high"];

const CATEGORY_STYLES = {
  General:      { pill: "bg-gray-100 text-gray-600",       dot: "bg-gray-400"    },
  Examinations: { pill: "bg-blue-100 text-blue-700",       dot: "bg-blue-500"    },
  Events:       { pill: "bg-purple-100 text-purple-700",   dot: "bg-purple-500"  },
  Finance:      { pill: "bg-orange-100 text-orange-700",   dot: "bg-orange-500"  },
  Health:       { pill: "bg-red-100 text-red-700",         dot: "bg-red-500"     },
  Academic:     { pill: "bg-green-100 text-green-700",     dot: "bg-green-500"   },
};

const PRIORITY_STYLES = {
  low:    { label: "Low",    pill: "bg-gray-100 text-gray-500"     },
  medium: { label: "Medium", pill: "bg-yellow-100 text-yellow-700" },
  high:   { label: "High",   pill: "bg-red-100 text-red-600"       },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
const ProgressBar = ({ value, max = 100, color = "bg-green-500" }) => (
  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
    <div className={`h-2 ${color} rounded-full transition-all duration-500`} style={{ width: `${(value / max) * 100}%` }} />
  </div>
);

// ── Confirm Delete Modal ──────────────────────────────────────────────────────
function ConfirmModal({ title, onConfirm, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5" style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}>
          <h2 className="text-white text-lg font-bold">Delete Announcement</h2>
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

// ── Add / Edit Modal ──────────────────────────────────────────────────────────
function AnnouncementModal({ announcement, onSave, onClose }) {
  const isEdit = !!announcement;
  const fileRef = useRef();

  const [form, setForm] = useState(
    isEdit
      ? { ...announcement }
      : { title: "", body: "", category: "General", audience: "All", priority: "medium", pinned: false, attachment: null }
  );
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.body.trim())  e.body  = "Body is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ ...form, date: isEdit ? form.date : new Date().toISOString().split("T")[0] });
  };

  const handleFile = e => {
    const f = e.target.files[0];
    if (f) set("attachment", f.name);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}>
          <div>
            <h2 className="text-white text-lg font-bold">{isEdit ? "Edit Announcement" : "New Announcement"}</h2>
            <p className="text-green-300 text-xs mt-0.5">{isEdit ? "Update the announcement details below" : "Fill in the details to post a new announcement"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold transition-colors" style={{ background: "rgba(255,255,255,0.1)" }}></button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Title <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="Enter announcement title"
              className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors ${errors.title ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-green-500"}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Message <span className="text-red-400">*</span></label>
            <textarea
              value={form.body}
              onChange={e => set("body", e.target.value)}
              placeholder="Write the full announcement message..."
              rows={4}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none transition-colors resize-none ${errors.body ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-green-500"}`}
            />
            {errors.body && <p className="text-red-500 text-xs mt-1">{errors.body}</p>}
          </div>

          {/* Category + Audience */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-green-500 transition-colors">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Audience</label>
              <select value={form.audience} onChange={e => set("audience", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-green-500 transition-colors">
                {AUDIENCES.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Priority + Pin */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => set("priority", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-green-500 transition-colors">
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pb-1">
              <button
                type="button"
                onClick={() => set("pinned", !form.pinned)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.pinned ? "bg-green-500" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${form.pinned ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className="text-sm font-medium text-gray-600">Pin to top</span>
            </div>
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Attachment (optional)</label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-green-400 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <span className="text-sm text-gray-400">{form.attachment || "Click to upload a file"}</span>
              <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
              {form.attachment ? (
                <button type="button" onClick={e => { e.stopPropagation(); set("attachment", null); }}
                  className="text-xs text-red-400 hover:text-red-600 font-semibold ml-2">Remove</button>
              ) : (
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              )}
            </div>
          </div>

          {/* Preview chip */}
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border bg-gray-50 border-gray-100`}>
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${CATEGORY_STYLES[form.category]?.dot || "bg-gray-400"}`} />
            <span className="text-sm font-semibold text-gray-800 truncate">{form.title || "Announcement preview"}</span>
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_STYLES[form.priority]?.pill}`}>{PRIORITY_STYLES[form.priority]?.label}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3 justify-end flex-shrink-0 border-t border-gray-100 pt-4">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-colors" style={{ background: "linear-gradient(135deg, #1a4d2a, #2d6e3e)" }}>
            {isEdit ? "Save Changes" : "Post Announcement"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Announcement Card ─────────────────────────────────────────────────────────
function AnnouncementCard({ ann, isAdmin, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const catStyle  = CATEGORY_STYLES[ann.category] || CATEGORY_STYLES.General;
  const priStyle  = PRIORITY_STYLES[ann.priority];
  const isLong    = ann.body.length > 180;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 ${ann.pinned ? "border-green-300 ring-1 ring-green-200" : "border-gray-100"}`}>
      {/* Pinned banner */}
      {ann.pinned && (
        <div className="px-5 pt-3 pb-0 flex items-center gap-1.5">
          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M16 4v6l2 2-2 2v2h-4v4l-1 2-1-2v-4H6v-2l2-2-2-2V4h10z"/></svg>
          <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Pinned</span>
        </div>
      )}

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${catStyle.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${catStyle.dot}`} />
              {ann.category}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priStyle.pill}`}>{priStyle.label} Priority</span>
            <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{ann.audience}</span>
          </div>
          {/* Admin actions */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => onEdit(ann)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit
              </button>
              <button
                onClick={() => onDelete(ann)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-gray-900 font-bold text-base mb-1.5 leading-snug">{ann.title}</h3>

        {/* Body */}
        <p className="text-gray-500 text-sm leading-relaxed">
          {isLong && !expanded ? ann.body.slice(0, 180) + "..." : ann.body}
        </p>
        {isLong && (
          <button onClick={() => setExpanded(e => !e)} className="text-green-600 text-xs font-semibold mt-1 hover:underline">
            {expanded ? "Show less" : "Read more"}
          </button>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <span className="text-xs text-gray-400">{ann.author}</span>
          </div>
          <div className="flex items-center gap-3">
            {ann.attachment && (
              <span className="flex items-center gap-1 text-xs text-blue-500 font-medium">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                {ann.attachment}
              </span>
            )}
            <span className="text-xs text-gray-400">{formatDate(ann.date)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Announcements() {
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [isAdmin]       = useState(true); // toggle to false to preview non-admin view
  const [filter, setFilter]       = useState("All");
  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]               = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800); };

  // CRUD
  const handleSave = form => {
    if (editTarget) {
      setAnnouncements(prev => prev.map(a => a.id === editTarget.id ? { ...form, id: a.id } : a));
      showToast("Announcement updated successfully");
    } else {
      setAnnouncements(prev => [{ ...form, id: Date.now(), author: "Administrator" }, ...prev]);
      showToast("Announcement posted successfully");
    }
    setShowModal(false);
    setEditTarget(null);
  };

  const handleDelete = () => {
    setAnnouncements(prev => prev.filter(a => a.id !== deleteTarget.id));
    showToast("Announcement deleted", "error");
    setDeleteTarget(null);
  };

  const openEdit = ann => { setEditTarget(ann); setShowModal(true); };
  const openNew  = ()  => { setEditTarget(null); setShowModal(true); };

  // Filter + search
  const categories  = ["All", ...CATEGORIES];
  const filtered = announcements
    .filter(a => filter === "All" || a.category === filter)
    .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.body.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  // Stats
  const total    = announcements.length;
  const pinned   = announcements.filter(a => a.pinned).length;
  const highPri  = announcements.filter(a => a.priority === "high").length;
  const withFile = announcements.filter(a => a.attachment).length;

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 pt-16 md:pt-6">

      {/* ── Hero Banner ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-5 md:px-8 py-5 md:py-7 gap-4">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">Announcements</h1>
            <p className="text-green-300 text-xs md:text-sm">
              Academic Year 2024 / 25 &nbsp;|&nbsp; Term 2 &nbsp;|&nbsp; Corner Stone Primary School
            </p>
          </div>
          <div className="flex gap-3 md:gap-4 flex-wrap">
            {[
              { value: total,    label: "Total"      },
              { value: pinned,   label: "Pinned"     },
              { value: highPri,  label: "High Priority" },
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
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
            </div>
            <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">Active</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{total}</div>
          <div className="text-gray-400 text-sm mb-3 md:mb-4">Total Announcements</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Published</span><span>{total}</span></div>
          <ProgressBar value={total} max={total || 1} color="bg-green-500" />
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">Urgent</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{highPri}</div>
          <div className="text-gray-400 text-sm mb-3 md:mb-4">High Priority</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Of total</span><span>{total}</span></div>
          <ProgressBar value={highPri} max={total || 1} color="bg-red-400" />
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            </div>
            <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded-full">Top</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{pinned}</div>
          <div className="text-gray-400 text-sm mb-3 md:mb-4">Pinned</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Of total</span><span>{total}</span></div>
          <ProgressBar value={pinned} max={total || 1} color="bg-blue-400" />
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Files</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{withFile}</div>
          <div className="text-gray-400 text-sm mb-3 md:mb-4">With Attachments</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Of total</span><span>{total}</span></div>
          <ProgressBar value={withFile} max={total || 1} color="bg-purple-400" />
        </div>
      </div>

      {/* ── Announcements List Card ── */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">

        {/* Card header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <span className="font-semibold text-gray-800">All Announcements</span>
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search announcements..."
                className="pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-green-400 transition-colors w-72"
              />
            </div>
            {isAdmin && (
              <button
                onClick={openNew}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold text-white transition-colors bg-green-900 hover:bg-green-800 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New Announcement
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <p className="text-sm font-medium">No announcements found</p>
              <p className="text-xs mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            filtered.map(ann => (
              <AnnouncementCard
                key={ann.id}
                ann={ann}
                isAdmin={isAdmin}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))
          )}
        </div>

        {/* Footer legend */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Categories</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <div key={c} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${CATEGORY_STYLES[c]?.pill || "bg-gray-100 text-gray-500"}`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${CATEGORY_STYLES[c]?.dot}`} />
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom two-col section (mirrors Timetable/MyResults) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 pb-6">

        {/* By Category breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            <span className="font-semibold text-gray-800">Announcements by Category</span>
          </div>
          {CATEGORIES.map(c => {
            const count = announcements.filter(a => a.category === c).length;
            if (!count) return null;
            return (
              <div key={c} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm font-semibold text-gray-800 w-36 shrink-0">{c}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${CATEGORY_STYLES[c]?.dot}`} style={{ width: `${(count / total) * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-gray-800 w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Summary panel */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span className="font-semibold text-gray-800">Notice Board Summary</span>
          </div>
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 rounded-full flex flex-col items-center justify-center" style={{ border: "8px solid #4caf6a" }}>
              <span className="text-3xl font-bold text-gray-900">{total}</span>
              <span className="text-xs text-gray-400 mt-0.5">Notices</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { lbl: "High Priority",    val: `${highPri}`,   cls: "text-red-500",    bg: "bg-red-50"    },
              { lbl: "Pinned",           val: `${pinned}`,    cls: "text-green-600",  bg: "bg-green-50"  },
              { lbl: "With Attachments", val: `${withFile}`,  cls: "text-blue-600",   bg: "bg-blue-50"   },
              { lbl: "Categories Used",  val: `${[...new Set(announcements.map(a=>a.category))].length}`, cls: "text-gray-900", bg: "bg-gray-50" },
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
        <div
          className="fixed bottom-7 right-7 z-50 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-xl"
          style={{
            background: toast.type === "error"
              ? "linear-gradient(135deg,#c0392b,#e74c3c)"
              : "linear-gradient(135deg, #1a4d2a, #2d6e3e)",
            animation: "slideUp .3s ease",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <AnnouncementModal
          announcement={editTarget}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          title={deleteTarget.title}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(14px); opacity:0; } to { transform: translateY(0); opacity:1; } }
      `}</style>
    </div>
  );
}