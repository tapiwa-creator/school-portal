// src/service/admin/AdminStudentService.js
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
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase"; // path: src/service/admin/ → src/firebase


const COLLECTION = "students";

const AdminStudentService = {

  // ── Fetch all students ─────────────────────────────────────────────────
  getAllStudents: async () => {
    try {
      const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error("getAllStudents error:", error);
      return [];
    }
  },

  // ── Add a new student ──────────────────────────────────────────────────
  addStudent: async (studentData) => {
    try {
      const initials = studentData.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      const payload = {
        name:       studentData.name,
        grade:      studentData.grade,
        age:        Number(studentData.age) || null,
        gender:     studentData.gender,
        parent:     studentData.parent,
        phone:      studentData.phone     || "",
        email:      studentData.email     || "",
        address:    studentData.address   || "",
        avatar:     initials,
        status:     "Active",
        enrolled:   new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
        academic:   [],
        attendance: { present: 0, absent: 0, late: 0, total: 0 },
        remarks:    [],
        discipline: [],
        perfTrend:  [],
        createdAt:  serverTimestamp(),
        updatedAt:  serverTimestamp(),
      };

      const ref = await addDoc(collection(db, COLLECTION), payload);
      return { success: true, id: ref.id, data: { id: ref.id, ...payload } };
    } catch (error) {
      console.error("addStudent error:", error);
      return { success: false, error: error.message };
    }
  },

  // ── Update a student (any fields) ─────────────────────────────────────
  updateStudent: async (studentId, updates) => {
    try {
      const ref = doc(db, COLLECTION, studentId);
      await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (error) {
      console.error("updateStudent error:", error);
      return { success: false, error: error.message };
    }
  },

  // ── Remove a student ──────────────────────────────────────────────────
  removeStudent: async (studentId) => {
    try {
      await deleteDoc(doc(db, COLLECTION, studentId));
      return { success: true };
    } catch (error) {
      console.error("removeStudent error:", error);
      return { success: false, error: error.message };
    }
  },

  // ── Add a remark ──────────────────────────────────────────────────────
  addRemark: async (studentId, currentRemarks, newRemark) => {
    const updated = [...currentRemarks, newRemark.trim()];
    return AdminStudentService.updateStudent(studentId, { remarks: updated });
  },

  // ── Add a discipline record ───────────────────────────────────────────
  addDisciplineRecord: async (studentId, currentDiscipline, record) => {
    const entry = {
      date:   new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      issue:  record.issue,
      action: record.action,
    };
    const updated = [...currentDiscipline, entry];
    return AdminStudentService.updateStudent(studentId, { discipline: updated });
  },
};

export default AdminStudentService;