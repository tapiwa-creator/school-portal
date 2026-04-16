// src/services/admin/AssignmentManagementService.js
import { db } from "../../Firebase/Firebase";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

const COLLECTION = "admin_assignments";

// ─── Grade options ─────────────────────────────────────────────────────────
// These are the EXACT strings stored in Firestore.
// StudentAssignmentService.toFirestoreGrade() must produce the same values.
const GRADE_OPTIONS = [
  "All",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
];

// ─── Helpers ───────────────────────────────────────────────────────────────
let _indexReady = false;

const mapDoc = (d) => ({
  id: d.id,
  ...d.data(),
  dueDate: d.data().dueDate?.toDate?.() ?? null,
  createdAt: d.data().createdAt?.toDate?.() ?? null,
});

const sortDesc = (docs) =>
  [...docs].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });

const isIndexError = (err) =>
  err?.code === "failed-precondition" ||
  err?.message?.includes("index") ||
  err?.message?.includes("requires an index");

// ─── Validate that grade is one of the canonical values ───────────────────
const validateGrade = (grade) => GRADE_OPTIONS.includes(grade);

const AssignmentManagementService = {

  GRADE_OPTIONS,

  // ── Create ──────────────────────────────────────────────────────────────
  createAssignment: async (assignmentData) => {
    try {
      const targetProgram = assignmentData.targetProgram;

      if (!validateGrade(targetProgram)) {
        return {
          success: false,
          error: `Invalid targetProgram "${targetProgram}". Must be one of: ${GRADE_OPTIONS.join(", ")}`,
        };
      }

      const payload = {
        title: assignmentData.title?.trim() ?? "",
        subject: assignmentData.subject?.trim() ?? "",
        targetProgram,                                         // stored exactly as chosen from GRADE_OPTIONS
        description: assignmentData.description?.trim() ?? "",
        dueDate: assignmentData.dueDate ? new Date(assignmentData.dueDate) : null,
        marks: Number(assignmentData.marks) || 25,
        type: assignmentData.type ?? "Individual",
        teacher: assignmentData.teacher?.trim() ?? "Class Teacher",
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const ref = await addDoc(collection(db, COLLECTION), payload);
      console.log(`[AssignmentService] Created ${ref.id} for grade "${targetProgram}"`);
      return { success: true, id: ref.id, data: { id: ref.id, ...payload } };
    } catch (error) {
      console.error("[AssignmentService] createAssignment error:", error);
      return { success: false, error: error.message };
    }
  },

  // ── Get all (one-time) ───────────────────────────────────────────────────
  getAllAssignments: async () => {
    try {
      const snap = await getDocs(collection(db, COLLECTION));
      return sortDesc(snap.docs.map(mapDoc));
    } catch (error) {
      console.error("[AssignmentService] getAllAssignments error:", error);
      return [];
    }
  },

  // ── Get by grade (one-time) ──────────────────────────────────────────────
  getAssignmentsByGrade: async (grade) => {
    try {
      const q = query(
        collection(db, COLLECTION),
        where("targetProgram", "==", grade)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map(mapDoc)
        .filter((d) => d.isActive !== false)
        .sort((a, b) => {
          const ta = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const tb = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          return ta - tb;
        });
    } catch (error) {
      console.error("[AssignmentService] getAssignmentsByGrade error:", error);
      return [];
    }
  },

  // ── Real-time subscription (3-tier fallback) ─────────────────────────────
  subscribeToAssignments: (callback) => {
    let unsubscribe = () => { };

    // Immediately signal "loading" so the UI clears any stale cached state
    // before the first real snapshot arrives. Components should treat `null`
    // as "data is on its way" and show a spinner instead of old data.
    callback(null);

    const deliver = (docs) => {
      // Always strip inactive records client-side so every fallback tier
      // returns only active assignments — this prevents the stale-data flash
      // that occurred when Tier 2 delivered unfiltered results before Tier 1
      // had a chance to apply the isActive filter.
      const active = docs.filter((d) => d.isActive !== false);
      const sorted = sortDesc(active);
      console.log(`[AssignmentService] ${sorted.length} assignments delivered`);
      callback(sorted);
    };

    const tryTier1 = () => {
      try {
        const q = query(
          collection(db, COLLECTION),
          where("isActive", "==", true),
          orderBy("createdAt", "desc")
        );
        unsubscribe = onSnapshot(
          q,
          (snap) => {
            _indexReady = true;
            deliver(snap.docs.map(mapDoc));
          },
          (err) => {
            if (isIndexError(err)) {
              console.warn("[AssignmentService] Tier 1 index missing — dropping to Tier 2");
              _indexReady = false;
              unsubscribe();
              tryTier2();
            } else {
              console.error("[AssignmentService] Tier 1 snapshot error:", err);
              unsubscribe();
              tryTier2();
            }
          }
        );
      } catch (err) {
        console.error("[AssignmentService] Tier 1 setup error:", err);
        tryTier2();
      }
    };

    const tryTier2 = () => {
      try {
        unsubscribe = onSnapshot(
          collection(db, COLLECTION),
          // deliver() already strips inactive docs so Tier 2 is safe
          (snap) => deliver(snap.docs.map(mapDoc)),
          (err) => {
            console.error("[AssignmentService] Tier 2 snapshot error:", err);
            unsubscribe();
            tryTier3();
          }
        );
      } catch (err) {
        console.error("[AssignmentService] Tier 2 setup error:", err);
        tryTier3();
      }
    };

    const tryTier3 = () => {
      console.warn("[AssignmentService] Tier 3 — falling back to polling");
      const fetchOnce = async () => {
        try {
          const snap = await getDocs(collection(db, COLLECTION));
          deliver(snap.docs.map(mapDoc));
        } catch (err) {
          console.error("[AssignmentService] Tier 3 fetch error:", err);
          callback([]);
        }
      };
      fetchOnce();
      const interval = setInterval(fetchOnce, 30000);
      unsubscribe = () => clearInterval(interval);
    };

    // FIX: Always start directly with Tier 1 (the authoritative filtered query).
    // The old code started with Tier 2 unconditionally and only promoted to
    // Tier 1 after a 2-second timeout — causing the UI to briefly show ALL
    // assignments (including inactive ones) before the correct filtered set
    // arrived. Starting with Tier 1 immediately eliminates that flash.
    // Tier 1 will self-demote to Tier 2 if the composite index is missing.
    tryTier1();

    return () => unsubscribe();
  },

  // ── Update ───────────────────────────────────────────────────────────────
  updateAssignment: async (assignmentId, updates) => {
    try {
      if (updates.targetProgram && !validateGrade(updates.targetProgram)) {
        return { success: false, error: `Invalid targetProgram "${updates.targetProgram}"` };
      }
      await updateDoc(
        doc(db, COLLECTION, assignmentId),
        { ...updates, updatedAt: serverTimestamp() }
      );
      return { success: true };
    } catch (error) {
      console.error("[AssignmentService] updateAssignment error:", error);
      return { success: false, error: error.message };
    }
  },

  // ── Deactivate (soft-delete) ─────────────────────────────────────────────
  deactivateAssignment: async (assignmentId) => {
    try {
      const snap = await getDoc(doc(db, COLLECTION, assignmentId));
      if (!snap.exists()) return { success: false, error: "Assignment not found" };
      if (snap.data().isActive === false) return { success: true };
      return AssignmentManagementService.updateAssignment(assignmentId, { isActive: false });
    } catch (error) {
      console.error("[AssignmentService] deactivateAssignment error:", error);
      return { success: false, error: error.message };
    }
  },

  // ── Hard-delete ──────────────────────────────────────────────────────────
  deleteAssignment: async (assignmentId) => {
    try {
      await deleteDoc(doc(db, COLLECTION, assignmentId));
      return { success: true };
    } catch (error) {
      console.error("[AssignmentService] deleteAssignment error:", error);
      return { success: false, error: error.message };
    }
  },

  // ── Get single ───────────────────────────────────────────────────────────
  getAssignment: async (assignmentId) => {
    try {
      const snap = await getDoc(doc(db, COLLECTION, assignmentId));
      if (!snap.exists()) return { success: false, error: "Assignment not found" };
      return { success: true, data: mapDoc(snap) };
    } catch (error) {
      console.error("[AssignmentService] getAssignment error:", error);
      return { success: false, error: error.message };
    }
  },

  // ── Get stats ────────────────────────────────────────────────────────────
  getAssignmentStats: async (assignmentId) => {
    try {
      // 1. Get assignment to find targetProgram
      const snap = await getDoc(doc(db, COLLECTION, assignmentId));
      if (!snap.exists()) return { total: 0, submitted: 0, submissionRate: 0, pending: 0, graded: 0 };
      const assignment = snap.data();

      // 2. Query all students and manual match against targetProgram
      const usersQ = query(collection(db, "users"), where("role", "==", "student"));
      const usersSnap = await getDocs(usersQ);
      let totalStudents = 0;
      usersSnap.docs.forEach(d => {
        const u = d.data();
        const grade = u.grade || u.program;
        if (grade === assignment.targetProgram) {
          totalStudents++;
        }
      });

      // 3. Query progress docs for this assignment
      const progressQ = query(collection(db, "student_progress"), where("assignmentId", "==", assignmentId));
      const progressSnap = await getDocs(progressQ);

      let submittedCount = 0;
      let gradedCount = 0;

      progressSnap.docs.forEach(d => {
        const p = d.data();
        if (p.status === "submitted") submittedCount++;
        if (p.status === "graded") gradedCount++;
      });

      let pendingCount = Math.max(0, totalStudents - submittedCount - gradedCount);
      let totalHandedIn = submittedCount + gradedCount;
      let submissionRate = totalStudents > 0 ? Math.round((totalHandedIn / totalStudents) * 100) : 0;

      return {
        total: totalStudents,
        submitted: submittedCount,
        submissionRate,
        pending: pendingCount,
        graded: gradedCount
      };
    } catch (err) {
      console.error("[AssignmentService] getAssignmentStats error:", err);
      return { total: 0, submitted: 0, submissionRate: 0, pending: 0, graded: 0 };
    }
  },
};

export default AssignmentManagementService;