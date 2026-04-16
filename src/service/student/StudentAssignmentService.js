// src/service/student/StudentAssignmentService.js
import { db } from "../../Firebase/Firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";

const COLLECTION = "admin_assignments";

const mapDoc = (d) => ({
  id: d.id,
  ...d.data(),
  createdAt: d.data().createdAt?.toDate?.() ?? d.data().createdAt ?? null,
});

const StudentAssignmentService = {

  _getStudentId(student) {
    return student?.uid ?? student?.id ?? student?.userId ?? null;
  },

  _isReady(student) {
    const id = this._getStudentId(student);
    const grade = student?.grade ?? student?.program ?? null;
    if (!id) { console.warn("[StudentService] Missing student id"); return false; }
    if (!grade) { console.warn("[StudentService] Missing grade — student:", JSON.stringify(student)); return false; }
    return true;
  },

  // ── Subscription (polling — avoids QUIC/websocket errors) ──────────────
  subscribeToAssignments(student, callback) {
    if (!this._isReady(student)) {
      console.log("[StudentService] Not ready yet");
      callback([]);
      return () => { };
    }

    const studentId = this._getStudentId(student);
    const grade = (student?.grade ?? student?.program ?? "").toString().trim();

    console.log(`[StudentService] Subscribing — grade="${grade}" id=${studentId}`);

    let stopped = false;

    const fetchAndDeliver = async () => {
      try {
        // Raw dump — shows everything in the collection before any filtering
        const rawSnap = await getDocs(collection(db, COLLECTION));
        console.log(`[StudentService] RAW COLLECTION SIZE: ${rawSnap.size}`);
        rawSnap.docs.forEach(d => {
          const data = d.data();
          console.log("[StudentService] RAW DOC:", JSON.stringify({
            id: d.id,
            title: data.title,
            targetProgram: data.targetProgram,
            targetYear: data.targetYear,
            isActive: data.isActive,
          }));
        });

        const allDocs = rawSnap.docs.map(mapDoc);

        // Build all values this student could match against
        const matchValues = new Set([grade, grade.toLowerCase(), "All", "all"]);
        const numMatch = grade.match(/^Grade\s*(\d)$/i);
        if (numMatch) matchValues.add(numMatch[1]);
        if (/^\d$/.test(grade)) matchValues.add(`Grade ${grade}`);

        console.log("[StudentService] Matching against:", Array.from(matchValues));

        const matched = allDocs.filter(a => {
          const tp = (a.targetProgram ?? "").toString().trim();
          const ty = (a.targetYear ?? "").toString().trim();
          const tpMatch = Array.from(matchValues).some(v => v.toLowerCase() === tp.toLowerCase());
          const tyMatch = Array.from(matchValues).some(v => v.toLowerCase() === ty.toLowerCase());
          console.log(`[StudentService] "${a.title}" targetProgram="${tp}" tpMatch=${tpMatch} isActive=${a.isActive}`);
          return (tpMatch || tyMatch) && a.isActive !== false;
        });

        console.log(`[StudentService] ${matched.length} assignments matched`);

        const final = await this._attachProgress(matched, studentId);
        if (!stopped) callback(final);
      } catch (err) {
        console.error("[StudentService] fetchAndDeliver error:", err);
        if (!stopped) callback([]);
      }
    };

    fetchAndDeliver();
    const interval = setInterval(fetchAndDeliver, 15000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  },

  // ── One-time fetch ──────────────────────────────────────────────────────
  async getMyAssignments(student) {
    if (!this._isReady(student)) return [];
    const studentId = this._getStudentId(student);
    const grade = (student?.grade ?? student?.program ?? "").toString().trim();

    try {
      const snap = await getDocs(collection(db, COLLECTION));
      const allDocs = snap.docs.map(mapDoc);

      const matchValues = new Set([grade, grade.toLowerCase(), "All", "all"]);
      const numMatch = grade.match(/^Grade\s*(\d)$/i);
      if (numMatch) matchValues.add(numMatch[1]);
      if (/^\d$/.test(grade)) matchValues.add(`Grade ${grade}`);

      const matched = allDocs.filter(a => {
        const tp = (a.targetProgram ?? "").toString().trim();
        const ty = (a.targetYear ?? "").toString().trim();
        return (
          Array.from(matchValues).some(v => v.toLowerCase() === tp.toLowerCase()) ||
          Array.from(matchValues).some(v => v.toLowerCase() === ty.toLowerCase())
        ) && a.isActive !== false;
      });

      return await this._attachProgress(matched, studentId);
    } catch (err) {
      console.error("[StudentService] getMyAssignments error:", err);
      return [];
    }
  },

  // ── Attach progress ─────────────────────────────────────────────────────
  async _attachProgress(assignments, studentId) {
    if (!Array.isArray(assignments) || assignments.length === 0) return [];
    try {
      const snap = await getDocs(
        query(collection(db, "student_progress"), where("studentId", "==", studentId))
      );
      const map = {};
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.assignmentId) map[data.assignmentId] = data;
      });
      return assignments.map(a => ({
        ...a,
        status: map[a.id]?.status ?? "pending",
        progress: map[a.id]?.progress ?? 0,
        grade: map[a.id]?.grade ?? null,
        feedback: map[a.id]?.feedback ?? null,
      }));
    } catch (err) {
      console.error("[StudentService] _attachProgress error:", err);
      return assignments;
    }
  },

  // ── Stats ───────────────────────────────────────────────────────────────
  getMyStats(assignments) {
    const safe = Array.isArray(assignments) ? assignments : [];
    return {
      total: safe.length,
      completed: safe.filter(a => a.status === "completed").length,
      pending: safe.filter(a => a.status === "pending").length,
      submitted: safe.filter(a => a.status === "submitted").length,
    };
  },

  getUpcomingDeadlines(assignments) {
    const safe = Array.isArray(assignments) ? assignments : [];
    const now = new Date();
    return safe
      .filter(a => a.dueDate && new Date(a.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);
  },

  // ── Submit ──────────────────────────────────────────────────────────────
  async submitAssignment(studentId, assignmentId, submissionData) {
    try {
      const ref = collection(db, "student_progress");
      const snap = await getDocs(
        query(ref,
          where("studentId", "==", studentId),
          where("assignmentId", "==", assignmentId)
        )
      );
      const payload = {
        studentId,
        assignmentId,
        status: "submitted",
        progress: 100,
        submission: submissionData,
        submittedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      if (snap.empty) await addDoc(ref, payload);
      else await updateDoc(doc(db, "student_progress", snap.docs[0].id), payload);
      return { success: true };
    } catch (err) {
      console.error("[StudentService] submitAssignment error:", err);
      return { success: false };
    }
  },

  // ── UI formatter ────────────────────────────────────────────────────────
  formatAssignmentsForUI(assignments) {
    if (!Array.isArray(assignments)) return [];
    const now = new Date();
    return assignments.map(a => {
      const due = a.dueDate ? new Date(a.dueDate) : null;
      const diffMs = due ? due - now : null;
      const diffDays = diffMs !== null ? Math.ceil(diffMs / 86400000) : null;

      let urgency = "low";
      let dueLabel = due
        ? due.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : "No due date";

      if (diffDays !== null && a.status !== "submitted" && a.status !== "graded") {
        if (diffDays < 0) { urgency = "overdue"; dueLabel = `Overdue by ${Math.abs(diffDays)}d`; }
        else if (diffDays <= 2) { urgency = "urgent"; dueLabel = diffDays === 0 ? "Due today" : `Due in ${diffDays}d`; }
        else if (diffDays <= 7) { urgency = "medium"; dueLabel = `Due in ${diffDays}d`; }
      }

      return {
        id: a.id,
        title: a.title ?? "Untitled",
        subject: a.module ?? a.subject ?? "",
        description: a.description ?? "",
        dueDate: a.dueDate ?? null,
        dueLabel,
        urgency,
        marks: a.marks ?? 25,
        type: a.type ?? "Individual",
        teacher: a.lecturer ?? a.teacher ?? "",
        status: a.status ?? "pending",
        progress: a.progress ?? 0,
        grade: a.grade ?? null,
        feedback: a.feedback ?? null,
      };
    });
  },
};

export default StudentAssignmentService;