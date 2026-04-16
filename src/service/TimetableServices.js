import { profileService } from "./ProfileServices";
import TimetableServiceAdmin from "./admin/TimetableServices";

const StudentTimetableService = {
  /**
   * Subscribes to the timetable of the student's assigned class.
   * @param {string} userId - The student's Firebase UID
   * @param {function} callback - Callback function that receives the timetable data
   * @returns {function} Unsubscribe function
   */
  subscribeToMyTimetable: async (userId, callback) => {
    try {
      // Default to Grade 1 if profile not found
      let studentClass = "Grade 1";
      
      try {
        const profileData = await profileService.getStudentBasicInfo(userId);
        if (profileData && (profileData.grade || profileData.program)) {
          studentClass = profileData.grade || profileData.program;
        }
      } catch (err) {
        console.warn("[StudentTimetableService] Could not fetch student profile, falling back to default Grade 1", err);
      }

      // We only append "A" for demo mapping since the admin classes are Grade 1-7
      // Wait, admin Timetable says CLASSES = GRADES = ["Grade 1", "Grade 2",...]. So it's just "Grade 1" not "Grade 1A"
      // Let's make sure it matches the exact naming by removing any trailing "A" or "B" if the default config doesn't use it.
      const normalizedClass = studentClass.replace(/[AB]$/, "").trim();

      // Defer to the main real-time timetable service
      return TimetableServiceAdmin.subscribeToTimetable(normalizedClass, callback);
    } catch (err) {
      console.error("[StudentTimetableService] Error:", err);
      // Fire callback with empty object so UI doesn't crash
      callback({});
      return () => {}; // empty unsubscribe
    }
  }
};

export default StudentTimetableService;