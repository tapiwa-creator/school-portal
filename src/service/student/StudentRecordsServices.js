// src/service/student/StudentRecordsServices.js
// Student-facing service — reads only the student's own Firestore doc.
// Uses onSnapshot for real-time updates so results appear the moment
// the admin publishes them.

import { db } from "../../Firebase/Firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    or
} from "firebase/firestore";

const COLLECTION = "students";

const StudentResultsService = {
    // ── Real-time subscription to a single student doc by Auth UID ─────────
    // callback receives the full student object (id + data) or null if not found.
    subscribeToMyRecord: (user, callback) => {
        if (!user) return callback(null);
        try {
            const uid = user.uid || "";
            const email = user.email || "";
            const studentId = user.studentId || "";
            
            const conditions = [where("uid", "==", uid)];
            if (studentId) {
                conditions.push(where("studentId", "==", studentId));
            }
            if (email) {
                conditions.push(where("email", "==", email));
            }

            const q = query(collection(db, COLLECTION), or(...conditions));
            return onSnapshot(
                q,
                (snap) => {
                    if (snap.empty) {
                        callback(null);
                    } else {
                        const docWithRecords = snap.docs.find(d => {
                            const academic = d.data().academic;
                            return academic && Object.keys(academic).length > 0;
                        });
                        const d = docWithRecords || snap.docs[0];
                        callback({ id: d.id, ...d.data() });
                    }
                },
                (error) => {
                    console.error("subscribeToMyRecord error:", error);
                    callback(null);
                }
            );
        } catch (error) {
            console.error("Failed to subscribe to student record:", error);
            callback(null);
            return () => { };
        }
    },
};

export default StudentResultsService;