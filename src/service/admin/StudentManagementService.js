// src/service/admin/AdminStudentService.js
import { db } from "../../Firebase/Firebase";// path: src/service/admin/ → src/firebase
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
  onSnapshot
} from "firebase/firestore";
const COLLECTION = "students";

const AdminStudentService = {

  // ── Fetch all students ─────────────────────────────────────────────────
  getAllStudents: async (assignedGrade) => {
    try {
      let q;
      if (assignedGrade) {
        q = query(collection(db, COLLECTION), where("grade", "==", assignedGrade));
      } else {
        q = query(collection(db, COLLECTION));
      }
      const snap = await getDocs(q);
      const students = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort in memory to avoid Firestore missing index error
      students.sort((a, b) => {
        const t1 = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const t2 = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return t2 - t1;
      });
      return students;
    } catch (error) {
      console.error("getAllStudents error:", error);
      return [];
    }
  },

  // ── Subscribe to all students (real-time) ─────────────────────────────
  subscribeToStudents: (callback, assignedGrade) => {
    try {
      let q;
      if (assignedGrade) {
        q = query(collection(db, COLLECTION), where("grade", "==", assignedGrade));
      } else {
        q = query(collection(db, COLLECTION));
      }
      return onSnapshot(q, (snap) => {
        const students = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort in memory to avoid Firestore missing index error
        students.sort((a, b) => {
          const t1 = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const t2 = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return t2 - t1;
        });
        callback(students);
      }, (error) => {
        console.error("subscribeToStudents error:", error);
        callback([]);
      });
    } catch (error) {
      console.error("Failed to setup students subscription:", error);
      return () => {};
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

      let uniqueStudentId = "";
      let isUnique = false;
      while (!isUnique) {
        uniqueStudentId = "C" + Math.floor(100000 + Math.random() * 900000).toString();
        // Check uniqueness across students collection just in case
        const q = query(collection(db, COLLECTION), where("studentId", "==", uniqueStudentId));
        const snap = await getDocs(q);
        if (snap.empty) {
          isUnique = true;
        }
      }

      const payload = {
        name:       studentData.name,
        studentId:  uniqueStudentId,
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