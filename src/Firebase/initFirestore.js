// src/Firebase/initFirestore.js
import { db } from "./Firebase";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";

// Initialize Firestore collections with proper Admin/Student separation
export const setupDatabase = async () => {
  try {
    console.log("🚀 Starting Firestore collections initialization...");
    const createdCollections = [];

    // Helper function to create a collection by adding an empty document
    const createCollection = async (collectionName) => {
      try {
        const ref = collection(db, collectionName);
        const snapshot = await getDocs(ref);
        if (snapshot.empty) {
          await setDoc(doc(ref, "_placeholder"), {
            _created: new Date().toISOString(),
            _note: "Placeholder document - delete after adding real data",
          });
          createdCollections.push(collectionName);
          console.log(`✅ ${collectionName} collection created`);
        }
      } catch (error) {
        console.log(`⚠️ ${collectionName} collection may already exist`);
      }
    };

    // ===========================================
    // 1. CORE & AUTH COLLECTIONS
    // ===========================================
    await createCollection("users");
    await createCollection("admins");
    await createCollection("teachers");
    await createCollection("students");

    // ===========================================
    // 2. ADMIN MASTER COLLECTIONS
    // ===========================================
    console.log("\n📋 Creating ADMIN MASTER collections...");

    await createCollection("admin_modules");
    await createCollection("admin_assignments");
    await createCollection("admin_tests");
    await createCollection("admin_timetables");
    await createCollection("admin_results");
    await createCollection("admin_compliance");
    await createCollection("admin_announcements");
    await createCollection("admin_events");
    await createCollection("admin_fees");
    await createCollection("admin_subjects");
    await createCollection("admin_classes");
    await createCollection("admin_gradeBoundaries");

    // ===========================================
    // 3. STUDENT DERIVED COLLECTIONS
    // ===========================================
    console.log("\n📋 Creating STUDENT DERIVED collections...");

    await createCollection("student_modules");
    await createCollection("student_assignments");
    await createCollection("student_tests");
    await createCollection("student_timetable");
    await createCollection("student_results");
    await createCollection("student_compliance");
    await createCollection("student_performance");
    await createCollection("student_attendance");
    await createCollection("student_fees");
    await createCollection("student_transactions");
    await createCollection("student_documents");
    await createCollection("student_contacts");
    await createCollection("student_medical");
    await createCollection("student_relations");
    await createCollection("student_settings");
    await createCollection("student_activity");
    await createCollection("student_academicStanding");
    await createCollection("student_gpa");
    await createCollection("student_submissions");
    await createCollection("student_assignmentProgress");
    await createCollection("student_deadlines");
    await createCollection("student_complianceItems");
    await createCollection("student_examClearance");
    await createCollection("student_complianceAlerts");
    await createCollection("student_complianceHistory");
    await createCollection("student_dashboard");
    await createCollection("student_notices");
    await createCollection("student_quickStats");
    await createCollection("student_alerts");
    await createCollection("student_upcomingEvents");
    await createCollection("student_progress");

    // ===========================================
    // 4. LOOKUP / REFERENCE COLLECTIONS
    // ===========================================
    console.log("\n📋 Creating LOOKUP collections...");

    await createCollection("subjects");
    await createCollection("terms");
    await createCollection("academicYears");
    await createCollection("gradeDefinitions");
    await createCollection("academicStandings");
    await createCollection("classTypes");
    await createCollection("eventTypes");
    await createCollection("announcementTypes");
    await createCollection("complianceCategories");
    await createCollection("paymentMethods");
    await createCollection("feeCategories");
    await createCollection("documentTypes");
    await createCollection("relationshipTypes");
    await createCollection("fileTypes");

    // ===========================================
    // 5. SYSTEM COLLECTIONS
    // ===========================================
    console.log("\n📋 Creating SYSTEM collections...");

    await createCollection("system_settings");
    await createCollection("system_logs");
    await createCollection("system_backups");
    await createCollection("system_notifications");

    // ===========================================
    // 6. ACADEMIC SUPPORT COLLECTIONS
    // ===========================================
    console.log("\n📋 Creating ACADEMIC SUPPORT collections...");

    await createCollection("modules");
    await createCollection("results");
    await createCollection("assignments");
    await createCollection("timetables");
    await createCollection("compliance");
    await createCollection("performance");
    await createCollection("attendance");

    // ===========================================
    // 7. TIMETABLE SUPPORT COLLECTIONS
    // ===========================================
    await createCollection("periods");
    await createCollection("rooms");
    await createCollection("days");
    await createCollection("breaks");

    // ===========================================
    // 8. EVENTS SUPPORT COLLECTIONS
    // ===========================================
    await createCollection("events");
    await createCollection("venues");
    await createCollection("event_attendees");

    // ===========================================
    // 9. ANNOUNCEMENTS SUPPORT COLLECTIONS
    // ===========================================
    await createCollection("announcements");
    await createCollection("categories");
    await createCollection("audiences");
    await createCollection("priorities");

    // ===========================================
    // 10. FEES SUPPORT COLLECTIONS
    // ===========================================
    await createCollection("fees");
    await createCollection("transactions");
    await createCollection("payment_plans");
    await createCollection("payment_reminders");

    // ===========================================
    // 11. REPORTS SUPPORT COLLECTIONS
    // ===========================================
    await createCollection("reports");
    await createCollection("report_templates");
    await createCollection("report_history");

    // ===========================================
    // 12. ADMISSIONS COLLECTIONS
    // ===========================================
    console.log("\n📋 Creating ADMISSIONS collections...");

    await createCollection("applications");
    await createCollection("admission_sessions");
    await createCollection("admission_stats");
    await createCollection("admission_documents");
    await createCollection("admission_eligibility");
    await createCollection("admission_steps");
    await createCollection("admission_checklist");
    await createCollection("admission_contacts");
    await createCollection("admission_drafts");
    await createCollection("admission_reviews");
    await createCollection("admission_communications");
    await createCollection("admission_uploadedDocs");
    await createCollection("admission_deadlines");
    await createCollection("admission_requirements");
    await createCollection("admission_statuses");
    await createCollection("admission_parentGuardian");
    await createCollection("admission_studentInfo");
    await createCollection("admission_declaration");
    await createCollection("admission_gradeOptions");
    await createCollection("admission_termOptions");
    await createCollection("admission_languageOptions");
    await createCollection("admission_nationalityOptions");
    await createCollection("admission_relationshipOptions");
    await createCollection("admission_specialNeeds");
    await createCollection("admission_healthConditions");
    await createCollection("admission_previousSchool");
    await createCollection("admission_notifications");
    await createCollection("admission_enrollment");
    await createCollection("admission_waitlist");

    // ===========================================
    // 13. DASHBOARD COLLECTIONS
    // ===========================================
    console.log("\n📋 Creating DASHBOARD collections...");

    await createCollection("admin_dashboard");
    await createCollection("teacher_dashboard");
    await createCollection("dashboard_stats");
    await createCollection("dashboard_greetings");

    // ===========================================
    // 14. FILES COLLECTION
    // ===========================================
    await createCollection("files");

    // ── Summary ──────────────────────────────────────────────────────────
    console.log("\n✅✅✅ Firestore initialization complete!");
    console.log(`📊 Created ${createdCollections.length} collections`);
    console.log("\n📋 Collection Structure Summary:");
    console.log("┌─────────────────────┬─────────────────────┐");
    console.log("│ ADMIN MASTER         │ STUDENT DERIVED     │");
    console.log("├─────────────────────┼─────────────────────┤");
    console.log("│ admin_modules        │ student_modules     │");
    console.log("│ admin_assignments    │ student_assignments │");
    console.log("│ admin_tests          │ student_tests       │");
    console.log("│ admin_timetables     │ student_timetable   │");
    console.log("│ admin_results        │ student_results     │");
    console.log("│ admin_compliance     │ student_compliance  │");
    console.log("│ admin_announcements  │ student_notices     │");
    console.log("│ admin_events         │ student_upcomingEvents│");
    console.log("│ admin_fees           │ student_fees        │");
    console.log("└─────────────────────┴─────────────────────┘");

    return {
      success: true,
      collections: createdCollections,
      message: `Database setup complete! Created ${createdCollections.length} collections with Admin/Student separation.`,
    };

  } catch (error) {
    console.error("❌ Error initializing Firestore:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};