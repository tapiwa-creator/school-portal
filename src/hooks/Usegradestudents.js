// src/hooks/useGradeStudents.js
//
// Drop this hook into any page that needs to show students.
// It automatically reads the logged-in admin's assignedGrade from Firestore
// and returns ONLY students from that grade.
//
// Usage:
//   const { students, loading, error, assignedGrade } = useGradeStudents();

import { useState, useEffect } from "react";
import { auth, db } from "../Firebase/Firebase";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const useGradeStudents = () => {
    const [students, setStudents] = useState([]);
    const [assignedGrade, setAssignedGrade] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let unsubscribeStudents = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setStudents([]);
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch the current user's profile to get their assignedGrade
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (!userDoc.exists()) {
                    setError("User profile not found.");
                    setLoading(false);
                    return;
                }

                const userData = userDoc.data();

                // 2. Super-admins (no assignedGrade) see ALL students
                //    Regular admins only see their grade
                const grade = userData.assignedGrade || null;
                setAssignedGrade(grade);

                // 3. Build Firestore query
                const studentsRef = collection(db, "students");
                const q = grade
                    ? query(studentsRef, where("grade", "==", grade))
                    : studentsRef; // no filter → all students (super-admin)

                // 4. Real-time listener
                unsubscribeStudents = onSnapshot(
                    q,
                    (snap) => {
                        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                        setStudents(data);
                        setLoading(false);
                    },
                    (err) => {
                        console.error("useGradeStudents snapshot error:", err);
                        setError("Failed to load students.");
                        setLoading(false);
                    }
                );
            } catch (err) {
                console.error("useGradeStudents error:", err);
                setError("Failed to load student data.");
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeStudents) unsubscribeStudents();
        };
    }, []);

    return { students, loading, error, assignedGrade };
};

export default useGradeStudents;