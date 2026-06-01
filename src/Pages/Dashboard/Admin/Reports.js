import { useState, useEffect } from "react";
import AdminStudentService from "../../../service/admin/StudentManagementService";
import { useAuth } from "../../../context/Authcontext";
import jsPDF from "jspdf";
import "jspdf-autotable";

// ── Constants ──────────────────────────────────────────────────────────────────────
const GRADES = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"];
const CLASSES = GRADES.flatMap(g => [`${g}A`, `${g}B`]);
const TEACHERS = ["Mr. Moyo", "Mrs. Dube", "Mr. Ncube", "Ms. Sibanda", "Mrs. Mpofu", "Mr. Ndlovu", "Ms. Chikwanda"];
const TERMS = ["Term 1", "Term 2", "Term 3"];
const TERM_KEY = { "Term 1": "term1", "Term 2": "term2", "Term 3": "term3" };
const YEARS = ["2024/25", "2023/24", "2022/23"];

const SUBJECTS = [
  "Mathematics", "English", "Science", "Social Studies",
  "Shona", "Physical Ed.", "Art & Craft", "Music", "Environmental Science",
];

const SUBJECT_STYLES = {
  "Mathematics": { pill: "bg-blue-100 text-blue-700", dot: "bg-blue-500", bar: "bg-blue-500" },
  "English": { pill: "bg-pink-100 text-pink-700", dot: "bg-pink-500", bar: "bg-pink-500" },
  "Science": { pill: "bg-green-100 text-green-700", dot: "bg-green-500", bar: "bg-green-500" },
  "Social Studies": { pill: "bg-orange-100 text-orange-700", dot: "bg-orange-500", bar: "bg-orange-500" },
  "Shona": { pill: "bg-purple-100 text-purple-700", dot: "bg-purple-500", bar: "bg-purple-500" },
  "Physical Ed.": { pill: "bg-red-100 text-red-700", dot: "bg-red-500", bar: "bg-red-500" },
  "Art & Craft": { pill: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500", bar: "bg-yellow-500" },
  "Music": { pill: "bg-sky-100 text-sky-700", dot: "bg-sky-500", bar: "bg-sky-500" },
  "Environmental Science": { pill: "bg-teal-100 text-teal-700", dot: "bg-teal-500", bar: "bg-teal-500" },
};

const GRADE_STYLES = {
  "A": { pill: "bg-green-100 text-green-700", dot: "bg-green-500", label: "Excellent" },
  "B": { pill: "bg-blue-100 text-blue-700", dot: "bg-blue-500", label: "Very Good" },
  "C": { pill: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500", label: "Good" },
  "D": { pill: "bg-orange-100 text-orange-700", dot: "bg-orange-500", label: "Satisfactory" },
  "E": { pill: "bg-red-100 text-red-600", dot: "bg-red-500", label: "Needs Support" },
  "U": { pill: "bg-gray-100 text-gray-500", dot: "bg-gray-400", label: "Ungraded" },
};

const STATUS_STYLES = {
  "Published": { pill: "bg-green-100 text-green-700", dot: "bg-green-500" },
  "Draft": { pill: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
  "Pending": { pill: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
};

function letterGrade(pct) {
  if (pct >= 80) return "A";
  if (pct >= 65) return "B";
  if (pct >= 50) return "C";
  if (pct >= 40) return "D";
  if (pct >= 30) return "E";
  return "U";
}

function gradeColor(pct) {
  if (pct >= 80) return "text-green-600";
  if (pct >= 65) return "text-blue-600";
  if (pct >= 50) return "text-yellow-600";
  if (pct >= 40) return "text-orange-500";
  return "text-red-500";
}

function barColor(pct) {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 65) return "bg-blue-500";
  if (pct >= 50) return "bg-yellow-400";
  if (pct >= 40) return "bg-orange-400";
  return "bg-red-400";
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
const ProgressBar = ({ value, max = 100, color = "bg-green-500" }) => (
  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
    <div className={`h-2 ${color} rounded-full transition-all duration-500`}
      style={{ width: `${Math.min((value / (max || 1)) * 100, 100)}%` }} />
  </div>
);

// ── PDF Generation Function ───────────────────────────────────────────────────
const generatePDF = (report) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(13, 40, 24);
  doc.rect(0, 0, pageWidth, 50, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("CORNER STONE SCHOOL", pageWidth / 2, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text("Academic Report Card", pageWidth / 2, 32, { align: "center" });
  doc.setFontSize(9);
  doc.text(`${report.term} · ${report.year}`, pageWidth / 2, 40, { align: "center" });

  // Student Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Student Name: ${report.studentName}`, 14, 65);
  doc.text(`Admission No: ${report.admissionNo}`, 14, 73);
  doc.text(`Class: ${report.className}`, 14, 81);
  doc.text(`Teacher: ${report.teacher}`, 14, 89);

  // Summary Box
  doc.setFillColor(240, 245, 240);
  doc.rect(120, 65, 70, 30, "F");
  doc.setFontSize(9);
  doc.text(`Average: ${report.average}%`, 125, 73);
  doc.text(`Grade: ${report.letterGrade}`, 125, 81);
  doc.text(`Position: ${report.position}/${report.classSize}`, 125, 89);

  // Subject Results Table
  const tableBody = Object.entries(report.marks).map(([subject, data]) => {
    const pct = Math.round((data.score / data.total) * 100);
    return [
      subject,
      `${data.test1 || data.score}%`,
      data.test2 ? `${data.test2}%` : "-",
      data.assign ? `${data.assign}%` : "-",
      `${data.exam || data.score}%`,
      `${pct}%`,
      letterGrade(pct)
    ];
  });

  // Use the autoTable plugin correctly
  doc.autoTable({
    startY: 105,
    head: [["Subject", "Test 1", "Test 2", "Assignment", "Exam", "Avg", "Grade"]],
    body: tableBody,
    theme: "striped",
    headStyles: { fillColor: [26, 77, 42], textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 }
    },
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  // Conduct & Comment
  doc.setFontSize(9);
  doc.text(`Conduct: ${report.conduct || "Good"}`, 14, finalY);
  doc.text(`Attendance: ${report.attendance || 93}%`, 14, finalY + 8);
  doc.text(`Teacher's Comment:`, 14, finalY + 18);
  doc.text(report.teacherComment || "A hardworking student showing good progress.", 14, finalY + 26);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 30, finalY + 40, { align: "right" });
  doc.text("Corner Stone School · Excellence in Education", pageWidth / 2, 280, { align: "center" });

  doc.save(`${report.studentName.replace(/\s/g, "_")}_Report_Card.pdf`);
};

// ── Report Detail Modal ───────────────────────────────────────────────────────
function ReportDetailModal({ report, onClose, onPublish }) {
  const subjects = Object.entries(report.marks);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}>
          <div>
            <h2 className="text-white text-lg font-bold">{report.studentName}</h2>
            <p className="text-green-300 text-xs mt-0.5">
              {report.className} &nbsp;|&nbsp; {report.term} &nbsp;|&nbsp; {report.year} &nbsp;|&nbsp; {report.admissionNo}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => generatePDF(report)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white border border-white/30 hover:bg-white/10 transition-colors">
              Download PDF
            </button>
            {report.status !== "Published" && (
              <button onClick={() => onPublish(report.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white border border-white/30 hover:bg-white/10 transition-colors">
                Publish
              </button>
            )}
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "rgba(255,255,255,0.1)" }}>×</button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Student summary strip */}
          <div className="grid grid-cols-4 gap-0 border-b border-gray-100">
            {[
              { lbl: "Average", val: `${report.average}%`, cls: gradeColor(report.average) },
              { lbl: "Grade", val: report.letterGrade, cls: gradeColor(report.average) },
              { lbl: "Position", val: `${report.position} / ${report.classSize}`, cls: "text-gray-800" },
              { lbl: "Attendance", val: `${report.attendance}%`, cls: report.attendance >= 90 ? "text-green-600" : "text-orange-500" },
            ].map(({ lbl, val, cls }) => (
              <div key={lbl} className="text-center py-4 border-r border-gray-100 last:border-0">
                <div className={`text-xl font-bold ${cls}`}>{val}</div>
                <div className="text-xs text-gray-400 mt-0.5">{lbl}</div>
              </div>
            ))}
          </div>

          {/* Marks table */}
          <div className="px-6 pt-5 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <span className="font-semibold text-gray-800 text-sm">Subject Results</span>
            </div>

            <div className="space-y-2.5">
              {subjects.map(([subj, data]) => {
                const pct = Math.round((data.score / data.total) * 100);
                const lg = letterGrade(pct);
                const sty = SUBJECT_STYLES[subj];
                const gs = GRADE_STYLES[lg];
                return (
                  <div key={subj} className="flex items-center gap-3">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold w-44 flex-shrink-0 ${sty?.pill}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sty?.dot}`} />
                      {subj}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-2 rounded-full ${barColor(pct)}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-800 w-10 text-right flex-shrink-0">{data.score}/{data.total}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-16 text-center flex-shrink-0 ${gs?.pill}`}>{lg} – {pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conduct + Comment */}
          <div className="px-6 pb-6 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Conduct</div>
              <div className="text-sm font-bold text-gray-800">{report.conduct || "Good"}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Teacher</div>
              <div className="text-sm font-semibold text-gray-800">{report.teacher}</div>
            </div>
            <div className="col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Teacher Comment</div>
              <p className="text-sm text-gray-700 leading-relaxed">{report.teacherComment}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 flex items-center justify-between flex-shrink-0 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[report.status].pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[report.status].dot}`} />
              {report.status}
            </span>
            <span className="text-xs text-gray-400">Generated {report.dateGenerated}</span>
          </div>
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Report Row Card ───────────────────────────────────────────────────────────
function ReportCard({ report, isAdmin, onView, onPublish, onDelete, onDownloadPDF }) {
  const statStyle = STATUS_STYLES[report.status];
  const lg = GRADE_STYLES[report.letterGrade];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-200">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">

          {/* Left: student info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-900 text-sm">{report.studentName}</span>
                <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{report.admissionNo}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-400">{report.className}</span>
                <span className="text-gray-200">|</span>
                <span className="text-xs text-gray-400">{report.term}</span>
                <span className="text-gray-200">|</span>
                <span className="text-xs text-gray-400">{report.year}</span>
              </div>
            </div>
          </div>

          {/* Right: grade badge + actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-center">
              <div className={`text-2xl font-black ${gradeColor(report.average)}`}>{report.average}%</div>
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lg?.pill}`}>{report.letterGrade} · {lg?.label}</div>
            </div>
          </div>
        </div>

        {/* Progress bars – top 4 subjects */}
        <div className="mt-4 space-y-2">
          {Object.entries(report.marks).slice(0, 4).map(([subj, data]) => {
            const pct = Math.round((data.score / data.total) * 100);
            const sty = SUBJECT_STYLES[subj];
            return (
              <div key={subj} className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-500 w-36 flex-shrink-0 truncate">{subj}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${barColor(pct)}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] font-bold text-gray-500 w-8 text-right flex-shrink-0">{pct}%</span>
              </div>
            );
          })}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${statStyle.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statStyle.dot}`} />
              {report.status}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              {report.teacher}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              {report.attendance}% attendance
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => onDownloadPDF(report)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-purple-200 text-xs font-semibold text-purple-600 hover:bg-purple-50 transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
              PDF
            </button>
            <button onClick={() => onView(report)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-green-200 text-xs font-semibold text-green-700 hover:bg-green-50 transition-colors">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              View
            </button>
            {isAdmin && report.status !== "Published" && (
              <button onClick={() => onPublish(report.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-200 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Publish
              </button>
            )}
            {isAdmin && (
              <button onClick={() => onDelete(report)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Reports() {
  const { userProfile } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [isAdmin] = useState(true);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [filterTerm, setFilterTerm] = useState("All");
  const [viewReport, setViewReport] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800); };

  // Load students from Firestore
  useEffect(() => {
    setLoading(true);
    const unsub = AdminStudentService.subscribeToStudents((data) => {
      setStudents(data);
      generateReportsFromStudents(data);
      setLoading(false);
    }, userProfile?.assignedGrade);
    return () => unsub();
  }, [userProfile?.assignedGrade]);

  // Generate reports from student academic records
  const generateReportsFromStudents = (studentsData) => {
    const generatedReports = [];

    studentsData.forEach((student, index) => {
      TERMS.forEach(term => {
        const termKey = TERM_KEY[term];
        const academicRecords = student.academic?.[termKey] || [];

        if (academicRecords.length > 0) {
          const marks = {};
          academicRecords.forEach(record => {
            marks[record.subject] = {
              score: record.avg,
              total: 100,
              test1: record.test1,
              test2: record.test2,
              assign: record.assign,
              exam: record.exam
            };
          });

          const scores = Object.values(marks).map(m => m.score);
          const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
          const position = Math.floor(Math.random() * 25) + 1;

          generatedReports.push({
            id: `${student.id}_${termKey}`,
            studentName: student.name,
            admissionNo: student.id,
            className: student.grade || "Grade 5A",
            teacher: student.teacher || TEACHERS[index % TEACHERS.length],
            term: term,
            year: "2024/25",
            marks: marks,
            average: avg,
            letterGrade: letterGrade(avg),
            position: position,
            classSize: 30,
            attendance: Math.floor(Math.random() * 10) + 85,
            conduct: ["Excellent", "Very Good", "Good", "Satisfactory"][Math.floor(Math.random() * 4)],
            teacherComment: `${student.name} has shown good progress this ${term.toLowerCase()}. Continues to work hard.`,
            status: student.published?.[termKey] ? "Published" : "Draft",
            dateGenerated: new Date().toISOString().split("T")[0],
          });
        }
      });
    });

    setReports(generatedReports);
  };

  const handlePublish = (id) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "Published" } : r));
    setViewReport(prev => prev && prev.id === id ? { ...prev, status: "Published" } : prev);
    showToast("Report published successfully");
  };

  const handleDelete = () => {
    setReports(prev => prev.filter(r => r.id !== deleteTarget.id));
    showToast("Report deleted", "error");
    setDeleteTarget(null);
  };

  const handleDownloadPDF = (report) => {
    generatePDF(report);
    showToast("PDF downloaded successfully");
  };

  const filtered = reports.filter(r => {
    const matchSearch = !search ||
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
      r.className.toLowerCase().includes(search.toLowerCase());
    const matchClass = filterClass === "All" || r.className === filterClass;
    const matchTerm = filterTerm === "All" || r.term === filterTerm;
    return matchSearch && matchClass && matchTerm;
  });

  const total = reports.length;
  const published = reports.filter(r => r.status === "Published").length;
  const drafts = reports.filter(r => r.status === "Draft").length;
  const pending = reports.filter(r => r.status === "Pending").length;
  const avgScore = reports.length ? Math.round(reports.reduce((s, r) => s + r.average, 0) / reports.length) : 0;

  // Grade distribution
  const gradeDist = Object.keys(GRADE_STYLES).map(g => ({
    grade: g, count: reports.filter(r => r.letterGrade === g).length, ...GRADE_STYLES[g],
  })).filter(g => g.count > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f4f0] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-green-200 border-t-green-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f0] p-3 md:p-6 space-y-4 md:space-y-6 pt-16 md:pt-6">

      {/* ── Hero Banner ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-5 md:px-8 py-5 md:py-7 gap-4">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">Report Cards</h1>
            <p className="text-green-300 text-xs md:text-sm">
              Academic Year 2024 / 25 &nbsp;|&nbsp; Corner Stone Primary School
            </p>
          </div>
          <div className="flex gap-3 md:gap-4 flex-wrap">
            {[
              { value: total, label: "Total" },
              { value: published, label: "Published" },
              { value: `${avgScore}%`, label: "Avg Score" },
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
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">All</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{total}</div>
          <div className="text-gray-400 text-sm mb-3 md:mb-4">Total Reports</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Coverage</span><span>{total}</span></div>
          <ProgressBar value={total} max={total} color="bg-green-500" />
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded-full">Live</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{published}</div>
          <div className="text-gray-400 text-sm mb-3 md:mb-4">Published</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Of total</span><span>{total}</span></div>
          <ProgressBar value={published} max={total} color="bg-blue-500" />
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">WIP</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{drafts}</div>
          <div className="text-gray-400 text-sm mb-3 md:mb-4">Drafts</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Of total</span><span>{total}</span></div>
          <ProgressBar value={drafts} max={total} color="bg-gray-400" />
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Wait</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{pending}</div>
          <div className="text-gray-400 text-sm mb-3 md:mb-4">Pending Review</div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5"><span>Of total</span><span>{total}</span></div>
          <ProgressBar value={pending} max={total} color="bg-amber-400" />
        </div>

      </div>

      {/* ── Reports List Card ── */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span className="font-semibold text-gray-800">All Report Cards</span>
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 transition-colors">
              <option value="All">All Classes</option>
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={filterTerm} onChange={e => setFilterTerm(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-green-400 transition-colors">
              <option value="All">All Terms</option>
              {TERMS.map(t => <option key={t}>{t}</option>)}
            </select>
            <div className="relative">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search reports..."
                className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-green-400 transition-colors w-56" />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="text-sm font-medium">No reports found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            filtered.map(r => (
              <ReportCard key={r.id} report={r} isAdmin={isAdmin}
                onView={setViewReport} onPublish={handlePublish} onDelete={setDeleteTarget} onDownloadPDF={handleDownloadPDF} />
            ))
          )}
        </div>

        {/* Grade legend */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Grade Key</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(GRADE_STYLES).map(([g, style]) => (
              <div key={g} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.pill}`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                {g} – {style.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom two-col ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 pb-6">

        {/* Grade distribution */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
            <span className="font-semibold text-gray-800">Grade Distribution</span>
          </div>
          {gradeDist.map(({ grade, count, pill, dot, label }) => (
            <div key={grade} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold w-36 flex-shrink-0 ${pill}`}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                {grade} – {label}
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full rounded-full ${dot}`} style={{ width: `${(count / total) * 100}%` }} />
              </div>
              <span className="text-sm font-bold text-gray-800 w-6 text-right">{count}</span>
            </div>
          ))}
          {gradeDist.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No data available</p>}
        </div>

        {/* Overview panel */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <span className="font-semibold text-gray-800">Reports Overview</span>
          </div>
          <div className="flex justify-center mb-6">
            <div className="w-28 h-28 rounded-full flex flex-col items-center justify-center" style={{ border: "8px solid #4caf6a" }}>
              <span className="text-3xl font-bold text-gray-900">{total}</span>
              <span className="text-xs text-gray-400 mt-0.5">Reports</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { lbl: "Published", val: `${published}`, cls: "text-blue-600", bg: "bg-blue-50" },
              { lbl: "Drafts", val: `${drafts}`, cls: "text-gray-600", bg: "bg-gray-50" },
              { lbl: "Pending", val: `${pending}`, cls: "text-amber-600", bg: "bg-amber-50" },
              { lbl: "Class Avg", val: `${avgScore}%`, cls: gradeColor(avgScore), bg: "bg-green-50" },
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

      {viewReport && <ReportDetailModal report={viewReport} onClose={() => setViewReport(null)} onPublish={handlePublish} />}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5" style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}>
              <h2 className="text-white text-lg font-bold">Delete Report</h2>
              <p className="text-green-300 text-xs mt-0.5">This action cannot be undone</p>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-sm mb-1">Are you sure you want to delete the report for:</p>
              <p className="text-gray-900 font-semibold text-sm">"{deleteTarget.studentName}"</p>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(14px); opacity:0; } to { transform: translateY(0); opacity:1; } }
      `}</style>
    </div>
  );
}