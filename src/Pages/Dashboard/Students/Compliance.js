import { useState } from "react"; // Trigger webpack recompile
import { BarChart, AlertTriangle, ClipboardList, GraduationCap, CreditCard, CheckCircle, Clock, Library, Phone, Info } from "lucide-react";

// ── Data ───────────────────────────────────────────────────────────────────
const COMPLIANCE_ITEMS = [
  {
    id: 1,
    category: "Academic",
    title: "Student Registration",
    description: "Confirm your module registration for Semester 1, 2025.",
    status: "compliant",
    dueDate: "01 Feb 2025",
    completedDate: "28 Jan 2025",
    required: true,
    icon: <GraduationCap className="w-5 h-5" />,
  },
  {
    id: 2,
    category: "Financial",
    title: "Fee Payment – Instalment 1",
    description: "First instalment of $1,500 due. Outstanding balance affects exam access.",
    status: "compliant",
    dueDate: "15 Feb 2025",
    completedDate: "10 Feb 2025",
    required: true,
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    id: 3,
    category: "Financial",
    title: "Fee Payment – Instalment 2",
    description: "Second instalment of $1,500 due. Contact finance if unable to pay.",
    status: "pending",
    dueDate: "15 Mar 2025",
    completedDate: null,
    required: true,
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    id: 4,
    category: "Documents",
    title: "National ID / Passport Copy",
    description: "Certified copy of national ID or passport required for student records.",
    status: "compliant",
    dueDate: "01 Feb 2025",
    completedDate: "30 Jan 2025",
    required: true,
    icon: "🪪",
  },
  {
    id: 5,
    category: "Documents",
    title: "Medical Aid / Health Insurance",
    description: "Submit proof of medical aid membership or health insurance cover.",
    status: "non-compliant",
    dueDate: "01 Feb 2025",
    completedDate: null,
    required: true,
    icon: "",
  },
  {
    id: 6,
    category: "Academic",
    title: "Library Clearance",
    description: "Ensure no outstanding library books or fines on your account.",
    status: "compliant",
    dueDate: "Ongoing",
    completedDate: "Cleared",
    required: false,
    icon: <Library className="w-5 h-5" />,
  },
  {
    id: 7,
    category: "Administrative",
    title: "Emergency Contact Form",
    description: "Provide up-to-date emergency contact details in the student portal.",
    status: "pending",
    dueDate: "10 Mar 2025",
    completedDate: null,
    required: false,
    icon: <Phone className="w-5 h-5" />,
  },
  {
    id: 8,
    category: "Academic",
    title: "Graduation Application",
    description: "Final-year students must submit graduation application by the deadline.",
    status: "not-applicable",
    dueDate: "28 Feb 2025",
    completedDate: null,
    required: false,
    icon: <GraduationCap className="w-5 h-5" />,
  },
];

const CATEGORIES = ["All", "Academic", "Financial", "Documents", "Administrative"];

const STATUS_CONFIG = {
  compliant:       { label: "Compliant",       bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500",  border: "border-l-green-500",  icon: ""  },
  pending:         { label: "Pending",          bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-400", border: "border-l-orange-400", icon: <Clock className="w-5 h-5" /> },
  "non-compliant": { label: "Non-Compliant",    bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-500",    border: "border-l-red-500",    icon: ""  },
  "not-applicable":{ label: "Not Applicable",   bg: "bg-gray-50",   text: "text-gray-500",   dot: "bg-gray-300",   border: "border-l-gray-300",   icon: "–"  },
};

const CATEGORY_COLORS = {
  Academic:       "bg-blue-50 text-blue-700",
  Financial:      "bg-yellow-50 text-yellow-700",
  Documents:      "bg-purple-50 text-purple-700",
  Administrative: "bg-teal-50 text-teal-700",
};

// ── Progress bar ───────────────────────────────────────────────────────────
const ProgressBar = ({ value, color = "bg-green-500" }) => (
  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-500 ${color}`}
      style={{ width: `${value}%` }}
    />
  </div>
);

// ── Compliance item card ───────────────────────────────────────────────────
function ComplianceCard({ item, expanded, onToggle }) {
  const s = STATUS_CONFIG[item.status];
  const cat = CATEGORY_COLORS[item.category] || "bg-gray-100 text-gray-600";

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden border-l-4 ${s.border} transition-all duration-200`}>

      {/* Main row */}
      <div
        className="flex items-center gap-3 md:gap-4 p-4 md:p-5 cursor-pointer hover:bg-gray-50/60 transition-colors"
        onClick={() => onToggle(item.id)}
      >
        {/* Status icon circle */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${s.bg}`}>
          {item.icon}
        </div>

        {/* Title + category */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-semibold ${item.status === "non-compliant" ? "text-red-700" : "text-gray-900"}`}>
              {item.title}
            </p>
            {item.required && (
              <span className="text-[10px] font-bold bg-red-50 text-red-500 px-1.5 py-0.5 rounded">
                Required
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
        </div>

        {/* Category badge — hidden on mobile */}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 hidden sm:block ${cat}`}>
          {item.category}
        </span>

        {/* Due date — hidden on mobile */}
        <div className="text-right flex-shrink-0 hidden md:block">
          <p className="text-[10px] text-gray-400">Due</p>
          <p className="text-xs font-semibold text-gray-600">{item.dueDate}</p>
        </div>

        {/* Status badge */}
        <span className={`text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-full flex-shrink-0 ${s.bg} ${s.text}`}>
          {s.icon} <span className="hidden sm:inline">{s.label}</span>
        </span>

        {/* Chevron */}
        <span className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${expanded ? "rotate-180" : ""}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-4 md:px-5 pb-5 pt-1 border-t border-gray-50 space-y-4">
          <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Due Date</p>
              <p className="text-sm font-semibold text-gray-800">{item.dueDate}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                {item.completedDate ? "Completed" : "Status"}
              </p>
              <p className={`text-sm font-semibold ${s.text}`}>
                {item.completedDate || s.label}
              </p>
            </div>
          </div>

          {item.status === "non-compliant" && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-3">
              <span className="text-red-500 mt-0.5"><AlertTriangle className="w-5 h-5 inline-block" /></span>
              <p className="text-xs text-red-600 leading-relaxed">
                This item is overdue and may affect your access to exams or academic records. Please resolve immediately by visiting the relevant office or uploading the required document.
              </p>
            </div>
          )}

          {item.status === "pending" && (
            <button
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-85 transition-opacity"
              style={{ background: "linear-gradient(135deg, #0d2818, #1a4d2a)" }}
            >
              Resolve Now →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Compliance() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [expanded, setExpanded]             = useState(null);

  const compliant      = COMPLIANCE_ITEMS.filter(i => i.status === "compliant").length;
  const nonCompliant   = COMPLIANCE_ITEMS.filter(i => i.status === "non-compliant").length;
  const pending        = COMPLIANCE_ITEMS.filter(i => i.status === "pending").length;
  const total          = COMPLIANCE_ITEMS.filter(i => i.status !== "not-applicable").length;
  const complianceRate = Math.round((compliant / total) * 100);

  const filtered = COMPLIANCE_ITEMS.filter(i =>
    activeCategory === "All" || i.category === activeCategory
  );

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-5 pt-16 md:pt-6">

      {/* ══════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════ */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-5 md:px-8 py-5 md:py-7 gap-4">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">Compliance </h1>
            <p className="text-green-300 text-xs md:text-sm">
              Semester 1 · 2025 &nbsp;|&nbsp; Week 8 of 18 &nbsp;|&nbsp; BCom Accounting – Year 2
            </p>
          </div>
          <div className="flex gap-3 md:gap-4">
            {[
              { value: `${complianceRate}%`, label: "Compliant"     },
              { value: String(nonCompliant), label: "Issues"        },
              { value: String(pending),      label: "Pending"       },
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

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">

        {/* Compliance Rate */}
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-green-50 rounded-xl flex items-center justify-center text-base md:text-lg"><CheckCircle className="w-5 h-5 inline-block" /></div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full hidden sm:block">
              {complianceRate >= 80 ? "Good Standing" : "At Risk"}
            </span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{complianceRate}%</div>
          <div className="text-gray-400 text-sm mb-3 md:mb-4">Compliance Rate</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Progress</span><span>{compliant} / {total}</span>
          </div>
          <ProgressBar value={complianceRate} color="bg-green-500" />
        </div>

        {/* Compliant */}
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-50 rounded-xl flex items-center justify-center text-base md:text-lg"><ClipboardList className="w-5 h-5 inline-block" /></div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Cleared</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{compliant}</div>
          <div className="text-gray-400 text-sm mb-3 md:mb-4">Items Compliant</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Of total</span><span>{total} items</span>
          </div>
          <ProgressBar value={(compliant / total) * 100} color="bg-blue-400" />
        </div>

        {/* Non-Compliant */}
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-red-50 rounded-xl flex items-center justify-center text-base md:text-lg"><AlertTriangle className="w-5 h-5 inline-block" /></div>
            <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full hidden sm:block">Needs Action</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{nonCompliant}</div>
          <div className="text-gray-400 text-sm mb-3 md:mb-4">Non-Compliant</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Resolve ASAP</span><span>Exam risk</span>
          </div>
          <ProgressBar value={(nonCompliant / total) * 100} color="bg-red-400" />
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-orange-50 rounded-xl flex items-center justify-center text-base md:text-lg"><Clock className="w-5 h-5 inline-block" /></div>
            <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded-full hidden sm:block">In Progress</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{pending}</div>
          <div className="text-gray-400 text-sm mb-3 md:mb-4">Items Pending</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Awaiting</span><span>Review</span>
          </div>
          <ProgressBar value={(pending / total) * 100} color="bg-orange-400" />
        </div>

      </div>

      {/* ── Overall compliance meter ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg"><BarChart className="w-5 h-5 inline-block" /></span>
            <span className="font-semibold text-gray-800">Overall Compliance Status</span>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            complianceRate >= 80 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}>
            {complianceRate >= 80 ? " Good Standing" : " At Risk"}
          </span>
        </div>

        {/* Wide progress bar */}
        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${complianceRate}%`,
              background: complianceRate >= 80
                ? "linear-gradient(90deg, #15803d, #4ade80)"
                : "linear-gradient(90deg, #dc2626, #f87171)",
            }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-400">
          <span>0%</span>
          <span className={`font-bold text-sm ${complianceRate >= 80 ? "text-green-600" : "text-red-500"}`}>
            {complianceRate}% Compliant
          </span>
          <span>100%</span>
        </div>

        {/* Status breakdown pills */}
        <div className="flex gap-3 md:gap-4 mt-4 flex-wrap">
          {[
            { label: "Compliant",      count: compliant,    color: "bg-green-500"  },
            { label: "Pending",        count: pending,      color: "bg-orange-400" },
            { label: "Non-Compliant",  count: nonCompliant, color: "bg-red-500"    },
            { label: "Not Applicable", count: COMPLIANCE_ITEMS.filter(i => i.status === "not-applicable").length, color: "bg-gray-300" },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
              <span className="text-xs text-gray-600 font-medium">{label}</span>
              <span className="text-xs font-bold text-gray-800">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Compliance checklist ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Header + category filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 md:px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-lg"><ClipboardList className="w-5 h-5 inline-block" /></span>
            <span className="font-semibold text-gray-800">Compliance Checklist</span>
            <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {filtered.length}
            </span>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 md:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="p-3 md:p-4 flex flex-col gap-3">
          {filtered.map(item => (
            <ComplianceCard
              key={item.id}
              item={item}
              expanded={expanded === item.id}
              onToggle={toggleExpand}
            />
          ))}
        </div>
      </div>

      {/* ── Important notices ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 pb-6">

        {/* Non-compliant alert */}
        {nonCompliant > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg"></span>
              <span className="font-semibold text-red-700">Action Required</span>
            </div>
            <p className="text-sm text-red-600 leading-relaxed mb-4">
              You have <strong>{nonCompliant}</strong> non-compliant item{nonCompliant > 1 ? "s" : ""} that may affect your
              access to examinations and academic records. Please resolve immediately.
            </p>
            <button
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-85 transition-opacity"
              style={{ background: "linear-gradient(135deg, #b91c1c, #ef4444)" }}
            >
              View Issues →
            </button>
          </div>
        )}

        {/* Exam clearance info */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg"><Info className="w-5 h-5 inline-block" /></span>
            <span className="font-semibold text-blue-700">Exam Clearance</span>
          </div>
          <p className="text-sm text-blue-600 leading-relaxed mb-4">
            All required compliance items must be resolved before the examination period
            (5–23 May 2025). Students with outstanding issues will not be granted exam access.
          </p>
          <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Check Exam Access →
          </button>
        </div>

      </div>

    </div>
  );
}