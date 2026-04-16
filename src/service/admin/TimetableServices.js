// src/services/admin/TimetableService.js
import { db } from "../../Firebase/Firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    query,
    where,
} from "firebase/firestore";

// ─── Constants (single source of truth — imported by the UI too) ──────────────
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const GRADES = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4",
    "Grade 5", "Grade 6", "Grade 7",
];

// One class per grade — no streams
export const CLASSES = GRADES;

export const ROOMS = [
    "Room 101", "Room 102", "Room 103", "Room 104",
    "Hall A", "Lab 1", "Gym", "Art Room",
];

export const TEACHERS = [
    "Mr. Moyo", "Mrs. Dube", "Mr. Ncube", "Ms. Sibanda",
    "Mrs. Mpofu", "Mr. Ndlovu", "Ms. Chikwanda",
];

export const PERIODS = [
    { id: 1, label: "Period 1", time: "07:30 – 08:20" },
    { id: 2, label: "Period 2", time: "08:20 – 09:10" },
    { id: 3, label: "Break", time: "09:10 – 09:30", isBreak: true },
    { id: 4, label: "Period 3", time: "09:30 – 10:20" },
    { id: 5, label: "Period 4", time: "10:20 – 11:10" },
    { id: 6, label: "Period 5", time: "11:10 – 12:00" },
    { id: 7, label: "Lunch", time: "12:00 – 13:00", isBreak: true },
    { id: 8, label: "Period 6", time: "13:00 – 13:50" },
    { id: 9, label: "Period 7", time: "13:50 – 14:40" },
];

export const SUBJECTS = [
    { name: "Mathematics", pill: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
    { name: "English", pill: "bg-pink-100 text-pink-700", dot: "bg-pink-500" },
    { name: "Science", pill: "bg-green-100 text-green-700", dot: "bg-green-500" },
    { name: "Social Studies", pill: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
    { name: "Shona", pill: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
    { name: "Physical Ed.", pill: "bg-red-100 text-red-700", dot: "bg-red-500" },
    { name: "Art & Craft", pill: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
    { name: "Music", pill: "bg-sky-100 text-sky-700", dot: "bg-sky-500" },
    { name: "Environmental Science", pill: "bg-teal-100 text-teal-700", dot: "bg-teal-500" },
];

// ─── Firestore collection ─────────────────────────────────────────────────────
// Structure:  timetables/{classId}
//   classId  = e.g. "Grade 1A"
//   fields:
//     classId    : string
//     schedule   : { [day]: { [periodId]: { subject, teacher, room, class } } }
//     updatedAt  : timestamp
//     createdAt  : timestamp

const COLLECTION = "timetables";

// ─── Build the default schedule for a class (mirrors hard-coded data) ─────────
export function buildDefaultSchedule(cls) {
    const names = SUBJECTS.map(s => s.name);
    const schedule = {};

    DAYS.forEach((day, di) => {
        schedule[day] = {};
        PERIODS.filter(p => !p.isBreak).forEach((p, pi) => {
            const isFree = (di + pi) % 7 === 0;
            schedule[day][p.id] = isFree
                ? { subject: "Free", teacher: "", room: "", class: cls }
                : {
                    subject: names[(di * 3 + pi) % names.length],
                    teacher: TEACHERS[(di + pi) % TEACHERS.length],
                    room: ROOMS[pi % ROOMS.length],
                    class: cls,
                };
        });
    });

    return schedule;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const docRef = (classId) => doc(db, COLLECTION, classId);

// ─── Service ──────────────────────────────────────────────────────────────────
const TimetableService = {

    // ── Seed all classes with default data if they don't exist ────────────────
    // Call once from an admin "Setup" action — safe to call repeatedly
    seedAllDefaults: async () => {
        const results = { created: [], skipped: [], errors: [] };
        for (const cls of CLASSES) {
            try {
                const snap = await getDoc(docRef(cls));
                if (snap.exists()) {
                    results.skipped.push(cls);
                    continue;
                }
                await setDoc(docRef(cls), {
                    classId: cls,
                    schedule: buildDefaultSchedule(cls),
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
                results.created.push(cls);
                console.log(`[TimetableService] Seeded ${cls}`);
            } catch (err) {
                console.error(`[TimetableService] Seed error for ${cls}:`, err);
                results.errors.push({ cls, error: err.message });
            }
        }
        console.log("[TimetableService] Seed complete:", results);
        return results;
    },

    // ── Get timetable for one class (one-time) ────────────────────────────────
    getTimetable: async (classId) => {
        try {
            const snap = await getDoc(docRef(classId));
            if (!snap.exists()) {
                // Auto-create with defaults if missing
                const schedule = buildDefaultSchedule(classId);
                await setDoc(docRef(classId), {
                    classId,
                    schedule,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
                return { success: true, data: schedule, fromDefault: true };
            }
            return { success: true, data: snap.data().schedule, fromDefault: false };
        } catch (err) {
            console.error("[TimetableService] getTimetable error:", err);
            return { success: false, error: err.message, data: buildDefaultSchedule(classId) };
        }
    },

    // ── Real-time subscription for one class ──────────────────────────────────
    subscribeToTimetable: (classId, callback) => {
        // Signal loading
        callback(null);

        const ref = docRef(classId);
        const unsub = onSnapshot(
            ref,
            async (snap) => {
                if (!snap.exists()) {
                    // Auto-seed on first access
                    console.log(`[TimetableService] ${classId} not found — seeding defaults`);
                    const schedule = buildDefaultSchedule(classId);
                    try {
                        await setDoc(ref, {
                            classId,
                            schedule,
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp(),
                        });
                    } catch (e) {
                        console.error("[TimetableService] auto-seed error:", e);
                        callback(schedule); // fall back to in-memory default
                    }
                    // Next snapshot will deliver the written data
                } else {
                    callback(snap.data().schedule);
                }
            },
            (err) => {
                console.error("[TimetableService] subscribeToTimetable error:", err);
                // Deliver in-memory default so UI doesn't break offline
                callback(buildDefaultSchedule(classId));
            }
        );

        return unsub;
    },

    // ── Update a single cell (one period on one day) ──────────────────────────
    updateCell: async (classId, day, periodId, cellData) => {
        try {
            await updateDoc(docRef(classId), {
                [`schedule.${day}.${periodId}`]: {
                    subject: cellData.subject ?? "Free",
                    teacher: cellData.teacher ?? "",
                    room: cellData.room ?? "",
                    class: cellData.class ?? classId,
                },
                updatedAt: serverTimestamp(),
            });
            console.log(`[TimetableService] Updated ${classId} / ${day} / Period ${periodId}`);
            return { success: true };
        } catch (err) {
            console.error("[TimetableService] updateCell error:", err);
            return { success: false, error: err.message };
        }
    },

    // ── Update an entire day's schedule ──────────────────────────────────────
    updateDay: async (classId, day, daySchedule) => {
        try {
            await updateDoc(docRef(classId), {
                [`schedule.${day}`]: daySchedule,
                updatedAt: serverTimestamp(),
            });
            return { success: true };
        } catch (err) {
            console.error("[TimetableService] updateDay error:", err);
            return { success: false, error: err.message };
        }
    },

    // ── Replace the entire schedule for a class ───────────────────────────────
    setSchedule: async (classId, schedule) => {
        try {
            await setDoc(docRef(classId), {
                classId,
                schedule,
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
            }, { merge: true });
            return { success: true };
        } catch (err) {
            console.error("[TimetableService] setSchedule error:", err);
            return { success: false, error: err.message };
        }
    },

    // ── Reset a class back to defaults ────────────────────────────────────────
    resetToDefault: async (classId) => {
        try {
            const schedule = buildDefaultSchedule(classId);
            await setDoc(docRef(classId), {
                classId,
                schedule,
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
            });
            return { success: true, data: schedule };
        } catch (err) {
            console.error("[TimetableService] resetToDefault error:", err);
            return { success: false, error: err.message };
        }
    },

    // ── Get all timetables (admin overview) ───────────────────────────────────
    getAllTimetables: async () => {
        try {
            const snap = await getDocs(collection(db, COLLECTION));
            const result = {};
            snap.docs.forEach(d => { result[d.id] = d.data().schedule; });
            return { success: true, data: result };
        } catch (err) {
            console.error("[TimetableService] getAllTimetables error:", err);
            return { success: false, error: err.message, data: {} };
        }
    },
};

export default TimetableService;