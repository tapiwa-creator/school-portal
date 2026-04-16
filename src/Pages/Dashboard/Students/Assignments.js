import { useState, useEffect } from "react";
import studentAssignmentService from "../../../service/student/StudentAssignmentService";
import { BarChart, ClipboardList, CheckCircle, Clock, Library, Star, Info } from "lucide-react";

export default function StudentAssignments({ student }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!student || (!student.grade && !student.program)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = studentAssignmentService.subscribeToAssignments(student, (data) => {
      const formatted = studentAssignmentService.formatAssignmentsForUI(data);
      setAssignments(formatted);
      setLoading(false);
    });
    return () => unsub();
  }, [student]);

  const visible = assignments.filter((a) => {
    if (filter === "all") return true;
    if (filter === "pending") return a.status === "pending" || a.status === "in-progress";
    if (filter === "submitted") return a.status === "submitted";
    if (filter === "graded") return a.status === "graded";
    return true;
  });

  const counts = {
    all: assignments.length,
    pending: assignments.filter((a) => a.status === "pending" || a.status === "in-progress").length,
    submitted: assignments.filter((a) => a.status === "submitted").length,
    graded: assignments.filter((a) => a.status === "graded").length,
  };

  const urgentCount = assignments.filter(
    (a) => a.urgency === "urgent" || a.urgency === "overdue"
  ).length;

  const gradedCount = counts.graded;
  const submittedCount = counts.submitted;
  const pendingCount = counts.pending;
  const total = assignments.length;
  const completionRate = total > 0 ? Math.round(((gradedCount + submittedCount) / total) * 100) : 0;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: "24px 20px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ══════════════════════════════════════════
          GREEN HERO BANNER
      ══════════════════════════════════════════ */}
      <div style={{
        background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)",
        borderRadius: 18,
        overflow: "hidden",
        marginBottom: 24,
      }}>
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "28px 32px",
          gap: 20,
          flexWrap: "wrap",
        }}>
          {/* Left: title + subtitle */}
          <div>
            <h1 style={{
              margin: "0 0 6px",
              fontSize: 26,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.5px",
            }}>
              My Assignments
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#86efac" }}>
              {student?.grade ?? "Your grade"} &nbsp;|&nbsp; {total} assignment{total !== 1 ? "s" : ""}
              {urgentCount > 0 && (
                <span style={{
                  marginLeft: 10, fontSize: 12, fontWeight: 600,
                  background: "rgba(254,242,242,0.15)", color: "#fca5a5",
                  border: "1px solid rgba(252,165,165,0.3)", borderRadius: 20, padding: "2px 10px",
                }}>
                  {urgentCount} urgent
                </span>
              )}
            </p>
          </div>

          {/* Right: stat chips */}
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { value: `${completionRate}%`, label: "Completed" },
              { value: String(urgentCount), label: "Urgent" },
              { value: String(pendingCount), label: "To Do" },
            ].map(({ value, label }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 14,
                padding: "10px 20px",
                textAlign: "center",
                backdropFilter: "blur(8px)",
                minWidth: 80,
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#ffffff" }}>{value}</div>
                <div style={{ fontSize: 11, color: "#86efac", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SUMMARY STAT CARDS
      ══════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          {
            icon: <Library className="w-5 h-5" />,
            value: String(total),
            label: "Total Assignments",
            tag: "All",
            tagBg: "#eff6ff", tagColor: "#1d4ed8", tagBorder: "#bfdbfe",
            bar: 100, barColor: "#3b82f6", sub: "This semester",
          },
          {
            icon: <Clock className="w-5 h-5" />,
            value: String(pendingCount),
            label: "To Do",
            tag: "Pending",
            tagBg: "#fff7ed", tagColor: "#ea580c", tagBorder: "#fed7aa",
            bar: total > 0 ? (pendingCount / total) * 100 : 0, barColor: "#f97316", sub: "Needs attention",
          },
          {
            icon: <CheckCircle className="w-5 h-5" />,
            value: String(submittedCount),
            label: "Submitted",
            tag: "Awaiting",
            tagBg: "#f0fdf4", tagColor: "#15803d", tagBorder: "#bbf7d0",
            bar: total > 0 ? (submittedCount / total) * 100 : 0, barColor: "#22c55e", sub: "Under review",
          },
          {
            icon: <Star className="w-5 h-5" />,
            value: String(gradedCount),
            label: "Graded",
            tag: "Done",
            tagBg: "#faf5ff", tagColor: "#7c3aed", tagBorder: "#e9d5ff",
            bar: total > 0 ? (gradedCount / total) * 100 : 0, barColor: "#8b5cf6", sub: "Results in",
          },
        ].map(({ icon, value, label, tag, tagBg, tagColor, tagBorder, bar, barColor, sub }) => (
          <div key={label} style={{
            background: "#fff", borderRadius: 14, padding: "16px",
            border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                background: tagBg, color: tagColor, border: `1px solid ${tagBorder}`, whiteSpace: "nowrap",
              }}>{tag}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>{label}</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>
              <span>Progress</span><span>{sub}</span>
            </div>
            <div style={{ height: 4, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 4, width: `${Math.min(bar, 100)}%`,
                background: barColor, transition: "width 0.5s",
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          OVERALL PROGRESS METER
      ══════════════════════════════════════════ */}
      <div style={{
        background: "#fff", borderRadius: 14, padding: "20px 22px",
        border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        marginBottom: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}><BarChart className="w-5 h-5 inline-block" /></span>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>Overall Assignment Progress</span>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20,
            background: completionRate >= 70 ? "#f0fdf4" : "#fff7ed",
            color: completionRate >= 70 ? "#15803d" : "#ea580c",
            border: `1px solid ${completionRate >= 70 ? "#bbf7d0" : "#fed7aa"}`,
          }}>
            {completionRate >= 70 ? " On Track" : <><Clock className="w-5 h-5 inline-block mr-1" /> In Progress</>}
          </span>
        </div>

        <div style={{ height: 10, background: "#f1f5f9", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
          <div style={{
            height: "100%", borderRadius: 10, width: `${completionRate}%`,
            background: "linear-gradient(90deg, #1a4d2a, #22c55e)",
            transition: "width 0.7s",
          }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>0%</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>{completionRate}% Complete</span>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>100%</span>
        </div>

        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {[
            { label: "To Do", count: pendingCount, color: "#f97316" },
            { label: "Submitted", count: submittedCount, color: "#22c55e" },
            { label: "Graded", count: gradedCount, color: "#8b5cf6" },
            { label: "Urgent", count: urgentCount, color: "#ef4444" },
          ].map(({ label, count, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FILTER TABS + ASSIGNMENT LIST
      ══════════════════════════════════════════ */}
      <div style={{
        background: "#fff", borderRadius: 14,
        border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        overflow: "hidden", marginBottom: 20,
      }}>
        {/* Header + filter pills */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12,
          padding: "16px 20px", borderBottom: "1px solid #f1f5f9",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}><ClipboardList className="w-5 h-5 inline-block" /></span>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>Assignment List</span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 20,
              background: "#f1f5f9", color: "#94a3b8",
            }}>{visible.length}</span>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "To Do" },
              { key: "submitted", label: "Submitted" },
              { key: "graded", label: "Graded" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)} style={{
                padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 500,
                cursor: "pointer", border: "1px solid",
                background: filter === key ? "#3b82f6" : "#fff",
                color: filter === key ? "#fff" : "#475569",
                borderColor: filter === key ? "#3b82f6" : "#e2e8f0",
              }}>
                {label}
                <span style={{
                  marginLeft: 6, fontSize: 11, fontWeight: 700,
                  background: filter === key ? "rgba(255,255,255,0.25)" : "#f1f5f9",
                  color: filter === key ? "#fff" : "#94a3b8",
                  borderRadius: 20, padding: "1px 7px",
                }}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 16 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}><Library className="w-5 h-5 inline-block" /></div>
              <p style={{ margin: 0, fontSize: 15 }}>Loading your assignments…</p>
            </div>
          ) : visible.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "60px 24px",
              background: "#f8fafc", borderRadius: 12, border: "1px dashed #e2e8f0",
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}></div>
              <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
                {filter === "all" ? "No assignments yet" : `No ${filter} assignments`}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
                {filter === "all" ? "Your teacher hasn't posted any assignments yet." : "Nothing here right now."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {visible.map((a) => (
                <AssignmentCard key={a.id} assignment={a} onView={() => setSelected(a)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          NOTICES
      ══════════════════════════════════════════ */}
      <div style={{
        display: "grid",
        gridTemplateColumns: urgentCount > 0 ? "1fr 1fr" : "1fr",
        gap: 14,
        paddingBottom: 32,
      }}>
        {urgentCount > 0 && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 14, padding: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}></span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#991b1b" }}>Urgent Assignments</span>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#dc2626", lineHeight: 1.6 }}>
              You have <strong>{urgentCount}</strong> urgent or overdue assignment{urgentCount > 1 ? "s" : ""}.
              Late submissions may affect your final grade. Please action these immediately.
            </p>
            <button style={{
              padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: "#dc2626", color: "#fff", border: "none", cursor: "pointer",
            }}>
              View Urgent →
            </button>
          </div>
        )}

        <div style={{
          background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, padding: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}><Info className="w-5 h-5 inline-block" /></span>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#1e40af" }}>Submission Policy</span>
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: "#1d4ed8", lineHeight: 1.6 }}>
            All assignments must be submitted by 23:59 on the due date. Late submissions attract
            a 10% penalty per day. Contact your lecturer for extension requests.
          </p>
          <button style={{
            padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer",
          }}>
            View Policy →
          </button>
        </div>
      </div>

      {selected && (
        <AssignmentDetail
          assignment={selected}
          onClose={() => setSelected(null)}
          student={student}
          onSubmitted={(updatedId) => {
            setAssignments((prev) =>
              prev.map((a) =>
                a.id === updatedId ? { ...a, status: "submitted", progress: 100 } : a
              )
            );
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

// ── Assignment Card ────────────────────────────────────────────────────────
function AssignmentCard({ assignment: a, onView }) {
  const urgencyColors = {
    overdue: { bg: "#fef2f2", border: "#fecaca", accent: "#dc2626" },
    urgent: { bg: "#fff7ed", border: "#fed7aa", accent: "#ea580c" },
    medium: { bg: "#fffbeb", border: "#fde68a", accent: "#d97706" },
    low: { bg: "#fff", border: "#f1f5f9", accent: "#3b82f6" },
  };
  const statusColors = {
    pending: { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" },
    "in-progress": { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
    submitted: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
    graded: { bg: "#faf5ff", text: "#7c3aed", border: "#e9d5ff" },
  };

  const isDone = a.status === "submitted" || a.status === "graded";
  const uc = urgencyColors[isDone ? "low" : (a.urgency ?? "low")] ?? urgencyColors.low;
  const sc = statusColors[a.status] ?? statusColors.pending;

  return (
    <div
      onClick={onView}
      style={{
        background: uc.bg,
        border: `1px solid ${uc.border}`,
        borderLeft: `4px solid ${uc.accent}`,
        borderRadius: 12,
        padding: "16px 18px",
        cursor: "pointer",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{a.title}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
              background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
            }}>
              {a.status === "in-progress"
                ? "In Progress"
                : a.status.charAt(0).toUpperCase() + a.status.slice(1)}
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            {a.subject && (
              <span style={{
                fontSize: 12, padding: "2px 10px", borderRadius: 20,
                background: "#faf5ff", color: "#7c3aed", border: "1px solid #e9d5ff", fontWeight: 500,
              }}>
                {a.subject}
              </span>
            )}
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{a.marks} marks · {a.type}</span>
            {a.teacher && (
              <span style={{ fontSize: 12, color: "#94a3b8" }}> {a.teacher}</span>
            )}
          </div>

          {(a.status === "pending" || a.status === "in-progress") && (
            <div style={{ height: 4, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 4,
                width: `${a.progress ?? 0}%`,
                background: "#3b82f6", transition: "width 0.3s",
              }} />
            </div>
          )}
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8,
            background: isDone ? "#f0fdf4" : uc.bg,
            color: isDone ? "#15803d" : uc.accent,
            border: `1px solid ${isDone ? "#bbf7d0" : uc.border}`,
            whiteSpace: "nowrap",
          }}>
            {a.status === "submitted" ? " Submitted" : a.status === "graded" ? " Graded" : a.dueLabel}
          </div>
          {a.grade && (
            <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: "#7c3aed" }}>
              {a.grade}/{a.marks}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Assignment Detail Modal ────────────────────────────────────────────────
function AssignmentDetail({ assignment: a, onClose, student, onSubmitted }) {
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const studentId = student?.uid ?? student?.id ?? student?.userId;
    const result = await studentAssignmentService.submitAssignment(studentId, a.id, { notes, files: [] });
    setSubmitting(false);
    if (result.success) {
      setDone(true);
      setTimeout(() => onSubmitted(a.id), 1200);
    }
  };

  const canSubmit = a.status === "pending" || a.status === "in-progress";

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 520,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        {/* Modal header */}
        <div style={{
          padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>{a.title}</h2>
            <span style={{ fontSize: 13, color: "#7c3aed", fontWeight: 500 }}>{a.subject}</span>
          </div>
          <button onClick={onClose} style={{
            background: "#f1f5f9", border: "none", borderRadius: 8,
            width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b", flexShrink: 0,
          }}></button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["Due", a.dueLabel],
              ["Marks", `${a.marks} marks`],
              ["Type", a.type],
              ["Teacher", a.teacher ?? "—"],
            ].map(([label, val]) => (
              <div key={label} style={{
                background: "#f8fafc", borderRadius: 10,
                padding: "10px 14px", border: "1px solid #f1f5f9",
              }}>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                <div style={{ fontSize: 14, color: "#0f172a", fontWeight: 500 }}>{val}</div>
              </div>
            ))}
          </div>

          {a.description && (
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 14, border: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Instructions</div>
              <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{a.description}</p>
            </div>
          )}

          {a.status === "graded" && (
            <div style={{ background: "#faf5ff", borderRadius: 10, padding: 14, border: "1px solid #e9d5ff" }}>
              <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Your Result</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#7c3aed", marginBottom: 4 }}>
                {a.grade} / {a.marks}
              </div>
              {a.feedback && <p style={{ margin: 0, fontSize: 13, color: "#6b21a8" }}>{a.feedback}</p>}
            </div>
          )}

          {canSubmit && !done && (
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for your teacher…"
                rows={3}
                style={{
                  width: "100%", padding: "10px 12px", fontSize: 14,
                  border: "1px solid #e2e8f0", borderRadius: 8, resize: "vertical",
                  fontFamily: "inherit", boxSizing: "border-box", outline: "none",
                }}
              />
              <button onClick={handleSubmit} disabled={submitting} style={{
                marginTop: 12, width: "100%",
                background: submitting ? "#93c5fd" : "#3b82f6",
                color: "#fff", border: "none", borderRadius: 10,
                padding: 12, fontSize: 15, fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
              }}>
                {submitting ? "Submitting…" : "Submit Assignment"}
              </button>
            </div>
          )}

          {a.status === "submitted" && !done && (
            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: 10, padding: 14, textAlign: "center",
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}><CheckCircle className="w-5 h-5 inline-block" /></div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#15803d" }}>
                Submitted — waiting for your teacher to grade it.
              </p>
            </div>
          )}

          {done && (
            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: 10, padding: 14, textAlign: "center",
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}></div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#15803d" }}>
                Assignment submitted successfully!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}