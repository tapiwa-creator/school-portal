import { db } from "../Firebase/Firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from "firebase/firestore";
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useState, useEffect } from "react";

// ── Profile Service Class ─────────────────────────────────────────────────
class ProfileService {
  constructor() {
    this.collections = {
      students: "students",
      studentContacts: "studentContacts",
      studentAcademics: "studentAcademics",
      studentDocuments: "studentDocuments",
      studentMedical: "studentMedical",
      studentRelations: "studentRelations",
      studentSettings: "studentSettings",
      studentActivity: "studentActivity",
      studentAcademicStanding: "studentAcademicStanding",
      studentStatuses: "studentStatuses",
      studentProgrammes: "studentProgrammes",
      studentDepartments: "studentDepartments",
      studentFaculties: "studentFaculties",
      studentRelationships: "studentRelationships",
      studentIntake: "studentIntake",
      studentGPA: "studentGPA",
      studentPasswords: "studentPasswords",
      users: "users"
    };
  }

  // ===========================================
  // STUDENT PROFILE OPERATIONS
  // ===========================================

  /**
   * Get complete student profile by student ID
   */
  async getStudentProfile(studentId) {
    try {
      const studentRef = doc(db, this.collections.students, studentId);
      const studentSnap = await getDoc(studentRef);
      
      if (!studentSnap.exists()) {
        return null;
      }

      const profile = { id: studentSnap.id, ...studentSnap.data() };

      // Fetch related data in parallel
      const [
        contacts,
        academics,
        medical,
        relations,
        settings,
        standing,
        gpa
      ] = await Promise.all([
        this.getStudentContacts(studentId),
        this.getStudentAcademics(studentId),
        this.getStudentMedical(studentId),
        this.getStudentRelations(studentId),
        this.getStudentSettings(studentId),
        this.getStudentAcademicStanding(studentId),
        this.getStudentGPA(studentId)
      ]);

      return {
        ...profile,
        contacts,
        academics,
        medical,
        relations,
        settings,
        standing,
        gpa
      };
    } catch (error) {
      console.error("Error fetching student profile:", error);
      throw error;
    }
  }

  /**
   * Get basic student info
   */
  async getStudentBasicInfo(studentId) {
    try {
      const studentRef = doc(db, this.collections.students, studentId);
      const studentSnap = await getDoc(studentRef);
      
      if (studentSnap.exists()) {
        return { id: studentSnap.id, ...studentSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching student basic info:", error);
      throw error;
    }
  }

  /**
   * Update student profile
   */
  async updateStudentProfile(studentId, updates, userId = "system") {
    try {
      const studentRef = doc(db, this.collections.students, studentId);
      
      // Get old data for logging
      const oldSnap = await getDoc(studentRef);
      const oldData = oldSnap.data();

      await updateDoc(studentRef, {
        ...updates,
        updatedAt: Timestamp.now(),
        lastModifiedBy: userId
      });

      // Log activity
      await this.logActivity({
        studentId,
        type: "profile_update",
        details: { changes: { from: oldData, to: updates } },
        performedBy: userId
      });

      return true;
    } catch (error) {
      console.error("Error updating student profile:", error);
      throw error;
    }
  }

  // ===========================================
  // CONTACT INFORMATION
  // ===========================================

  /**
   * Get student contact information
   */
  async getStudentContacts(studentId) {
    try {
      const q = query(
        collection(db, this.collections.studentContacts),
        where("studentId", "==", studentId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching student contacts:", error);
      throw error;
    }
  }

  /**
   * Update student contacts
   */
  async updateStudentContacts(studentId, contactsData, userId = "system") {
    try {
      const existing = await this.getStudentContacts(studentId);
      
      if (existing) {
        // Update existing
        const contactRef = doc(db, this.collections.studentContacts, existing.id);
        await updateDoc(contactRef, {
          ...contactsData,
          updatedAt: Timestamp.now()
        });
      } else {
        // Create new
        const contactRef = collection(db, this.collections.studentContacts);
        await setDoc(doc(contactRef), {
          studentId,
          ...contactsData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }

      await this.logActivity({
        studentId,
        type: "contacts_update",
        performedBy: userId
      });

      return true;
    } catch (error) {
      console.error("Error updating student contacts:", error);
      throw error;
    }
  }

  // ===========================================
  // ACADEMIC INFORMATION
  // ===========================================

  /**
   * Get student academic information
   */
  async getStudentAcademics(studentId) {
    try {
      const q = query(
        collection(db, this.collections.studentAcademics),
        where("studentId", "==", studentId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching student academics:", error);
      throw error;
    }
  }

  /**
   * Get student's academic standing
   */
  async getStudentAcademicStanding(studentId) {
    try {
      const q = query(
        collection(db, this.collections.studentAcademicStanding),
        where("studentId", "==", studentId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching academic standing:", error);
      throw error;
    }
  }

  /**
   * Get student's GPA information
   */
  async getStudentGPA(studentId) {
    try {
      const q = query(
        collection(db, this.collections.studentGPA),
        where("studentId", "==", studentId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching student GPA:", error);
      throw error;
    }
  }

  /**
   * Get student's programme details
   */
  async getStudentProgramme(programmeCode) {
    try {
      const programmeRef = doc(db, this.collections.studentProgrammes, programmeCode);
      const programmeSnap = await getDoc(programmeRef);
      
      if (programmeSnap.exists()) {
        return { id: programmeSnap.id, ...programmeSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching programme:", error);
      throw error;
    }
  }

  /**
   * Get student's faculty details
   */
  async getStudentFaculty(facultyId) {
    try {
      const facultyRef = doc(db, this.collections.studentFaculties, facultyId);
      const facultySnap = await getDoc(facultyRef);
      
      if (facultySnap.exists()) {
        return { id: facultySnap.id, ...facultySnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching faculty:", error);
      throw error;
    }
  }

  // ===========================================
  // MEDICAL INFORMATION
  // ===========================================

  /**
   * Get student medical information
   */
  async getStudentMedical(studentId) {
    try {
      const q = query(
        collection(db, this.collections.studentMedical),
        where("studentId", "==", studentId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching student medical:", error);
      throw error;
    }
  }

  /**
   * Update student medical information
   */
  async updateStudentMedical(studentId, medicalData, userId = "system") {
    try {
      const existing = await this.getStudentMedical(studentId);
      
      if (existing) {
        const medicalRef = doc(db, this.collections.studentMedical, existing.id);
        await updateDoc(medicalRef, {
          ...medicalData,
          updatedAt: Timestamp.now()
        });
      } else {
        const medicalRef = collection(db, this.collections.studentMedical);
        await setDoc(doc(medicalRef), {
          studentId,
          ...medicalData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }

      await this.logActivity({
        studentId,
        type: "medical_update",
        performedBy: userId
      });

      return true;
    } catch (error) {
      console.error("Error updating student medical:", error);
      throw error;
    }
  }

  // ===========================================
  // NEXT OF KIN / RELATIONS
  // ===========================================

  /**
   * Get student relations (next of kin)
   */
  async getStudentRelations(studentId) {
    try {
      const q = query(
        collection(db, this.collections.studentRelations),
        where("studentId", "==", studentId)
      );
      
      const querySnapshot = await getDocs(q);
      const relations = [];
      querySnapshot.forEach((doc) => {
        relations.push({ id: doc.id, ...doc.data() });
      });
      return relations;
    } catch (error) {
      console.error("Error fetching student relations:", error);
      throw error;
    }
  }

  /**
   * Add a relation (next of kin)
   */
  async addStudentRelation(studentId, relationData, userId = "system") {
    try {
      const relationsRef = collection(db, this.collections.studentRelations);
      await setDoc(doc(relationsRef), {
        studentId,
        ...relationData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      await this.logActivity({
        studentId,
        type: "relation_added",
        details: relationData,
        performedBy: userId
      });

      return true;
    } catch (error) {
      console.error("Error adding student relation:", error);
      throw error;
    }
  }

  /**
   * Update a relation
   */
  async updateStudentRelation(relationId, relationData, userId = "system") {
    try {
      const relationRef = doc(db, this.collections.studentRelations, relationId);
      await updateDoc(relationRef, {
        ...relationData,
        updatedAt: Timestamp.now()
      });

      return true;
    } catch (error) {
      console.error("Error updating student relation:", error);
      throw error;
    }
  }

  /**
   * Delete a relation
   */
  async deleteStudentRelation(relationId, studentId, userId = "system") {
    try {
      const relationRef = doc(db, this.collections.studentRelations, relationId);
      await deleteDoc(relationRef);

      await this.logActivity({
        studentId,
        type: "relation_deleted",
        performedBy: userId
      });

      return true;
    } catch (error) {
      console.error("Error deleting student relation:", error);
      throw error;
    }
  }

  // ===========================================
  // STUDENT SETTINGS & PREFERENCES
  // ===========================================

  /**
   * Get student settings
   */
  async getStudentSettings(studentId) {
    try {
      const q = query(
        collection(db, this.collections.studentSettings),
        where("studentId", "==", studentId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching student settings:", error);
      throw error;
    }
  }

  /**
   * Update student settings
   */
  async updateStudentSettings(studentId, settingsData, userId = "system") {
    try {
      const existing = await this.getStudentSettings(studentId);
      
      if (existing) {
        const settingsRef = doc(db, this.collections.studentSettings, existing.id);
        await updateDoc(settingsRef, {
          ...settingsData,
          updatedAt: Timestamp.now()
        });
      } else {
        const settingsRef = collection(db, this.collections.studentSettings);
        await setDoc(doc(settingsRef), {
          studentId,
          ...settingsData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }

      return true;
    } catch (error) {
      console.error("Error updating student settings:", error);
      throw error;
    }
  }

  // ===========================================
  // DOCUMENTS
  // ===========================================

  /**
   * Get student documents
   */
  async getStudentDocuments(studentId) {
    try {
      const q = query(
        collection(db, this.collections.studentDocuments),
        where("studentId", "==", studentId),
        orderBy("uploadedAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      return documents;
    } catch (error) {
      console.error("Error fetching student documents:", error);
      throw error;
    }
  }

  /**
   * Add a document record
   */
  async addStudentDocument(studentId, documentData) {
    try {
      const docsRef = collection(db, this.collections.studentDocuments);
      await setDoc(doc(docsRef), {
        studentId,
        ...documentData,
        uploadedAt: Timestamp.now(),
        createdAt: Timestamp.now()
      });

      await this.logActivity({
        studentId,
        type: "document_uploaded",
        details: { documentType: documentData.documentType, fileName: documentData.fileName },
        performedBy: studentId
      });

      return true;
    } catch (error) {
      console.error("Error adding student document:", error);
      throw error;
    }
  }

  /**
   * Verify a document (admin only)
   */
  async verifyDocument(documentId, verifiedBy, notes = "") {
    try {
      const docRef = doc(db, this.collections.studentDocuments, documentId);
      await updateDoc(docRef, {
        isVerified: true,
        verifiedBy,
        verifiedAt: Timestamp.now(),
        verificationNotes: notes
      });

      return true;
    } catch (error) {
      console.error("Error verifying document:", error);
      throw error;
    }
  }

  // ===========================================
  // ACTIVITY LOGGING
  // ===========================================

  /**
   * Log student activity
   */
  async logActivity(activityData) {
    try {
      const activityRef = collection(db, this.collections.studentActivity);
      await setDoc(doc(activityRef), {
        ...activityData,
        timestamp: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error("Error logging activity:", error);
      throw error;
    }
  }

  /**
   * Get student activity log
   */
  async getStudentActivity(studentId, limitCount = 50) {
    try {
      const q = query(
        collection(db, this.collections.studentActivity),
        where("studentId", "==", studentId),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const activities = [];
      querySnapshot.forEach((doc) => {
        activities.push({ id: doc.id, ...doc.data() });
      });
      return activities;
    } catch (error) {
      console.error("Error fetching student activity:", error);
      throw error;
    }
  }

  /**
   * Get last login time
   */
  async getLastLogin(studentId) {
    try {
      const q = query(
        collection(db, this.collections.studentActivity),
        where("studentId", "==", studentId),
        where("type", "==", "login"),
        orderBy("timestamp", "desc"),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().timestamp;
      }
      return null;
    } catch (error) {
      console.error("Error fetching last login:", error);
      throw error;
    }
  }

  // ===========================================
  // PASSWORD MANAGEMENT
  // ===========================================

  /**
   * Change password (with Firebase Auth)
   */
  async changePassword(currentPassword, newPassword, user) {
    try {
      const auth = getAuth();
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      
      // Re-authenticate user
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      // Log password change
      await this.logActivity({
        studentId: user.uid,
        type: "password_change",
        performedBy: user.uid
      });

      // Update password history in Firestore
      await this.updatePasswordHistory(user.uid, newPassword);

      return { success: true };
    } catch (error) {
      console.error("Error changing password:", error);
      return { 
        success: false, 
        error: error.code === "auth/wrong-password" 
          ? "Current password is incorrect" 
          : error.message 
      };
    }
  }

  /**
   * Update password history (store hashed history)
   */
  async updatePasswordHistory(studentId, newPassword) {
    try {
      const q = query(
        collection(db, this.collections.studentPasswords),
        where("studentId", "==", studentId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      const now = Timestamp.now();
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        const existing = querySnapshot.docs[0].data();
        
        // Add to history (keep last 5 passwords)
        const history = existing.passwordHistory || [];
        history.push({
          changedAt: now,
          expiresAt: new Date(now.toDate().getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days
        });
        
        if (history.length > 5) history.shift();
        
        await updateDoc(docRef, {
          passwordHistory: history,
          lastChanged: now,
          updatedAt: now
        });
      } else {
        // Create new password record
        const passwordRef = collection(db, this.collections.studentPasswords);
        await setDoc(doc(passwordRef), {
          studentId,
          passwordHistory: [{
            changedAt: now,
            expiresAt: new Date(now.toDate().getTime() + 90 * 24 * 60 * 60 * 1000)
          }],
          lastChanged: now,
          twoFactorEnabled: false,
          failedAttempts: 0,
          createdAt: now,
          updatedAt: now
        });
      }

      return true;
    } catch (error) {
      console.error("Error updating password history:", error);
      throw error;
    }
  }

  /**
   * Check if password is expired
   */
  async isPasswordExpired(studentId) {
    try {
      const q = query(
        collection(db, this.collections.studentPasswords),
        where("studentId", "==", studentId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        const lastChanged = data.lastChanged?.toDate() || new Date();
        const daysSinceChange = Math.floor((new Date() - lastChanged) / (1000 * 60 * 60 * 24));
        return daysSinceChange >= 90; // Expire after 90 days
      }
      return false;
    } catch (error) {
      console.error("Error checking password expiry:", error);
      throw error;
    }
  }

  // ===========================================
  // UTILITY FUNCTIONS
  // ===========================================

  /**
   * Get dashboard stats for student
   */
  async getStudentDashboardStats(studentId) {
    try {
      const [
        profile,
        academics,
        gpa,
        standing
      ] = await Promise.all([
        this.getStudentBasicInfo(studentId),
        this.getStudentAcademics(studentId),
        this.getStudentGPA(studentId),
        this.getStudentAcademicStanding(studentId)
      ]);

      return {
        fullName: profile?.personalInfo?.fullName || "",
        initials: profile?.personalInfo?.initials || "",
        programme: academics?.programme || "",
        year: academics?.currentYear ? `Year ${academics.currentYear}` : "",
        semester: academics?.currentSemester || "",
        status: academics?.standing || "Active",
        gpa: gpa?.cumulativeGPA || 0,
        creditsEarned: gpa?.creditsEarned || 0,
        totalCredits: gpa?.totalCredits || 0,
        standing: standing?.currentStanding || "Good"
      };
    } catch (error) {
      console.error("Error getting student dashboard stats:", error);
      throw error;
    }
  }

  /**
   * Check if student has complete profile
   */
  async isProfileComplete(studentId) {
    try {
      const profile = await this.getStudentProfile(studentId);
      
      if (!profile) return false;
      
      const required = [
        profile.personalInfo?.firstName,
        profile.personalInfo?.lastName,
        profile.personalInfo?.dateOfBirth,
        profile.contacts?.email,
        profile.contacts?.phone,
        profile.academics?.programme,
        profile.relations?.length > 0
      ];
      
      return required.every(Boolean);
    } catch (error) {
      console.error("Error checking profile completion:", error);
      throw error;
    }
  }
}

// ── Custom Hook for Profile ───────────────────────────────────────────────
export function useProfile(studentId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  
  const service = new ProfileService();

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) return;
      
      setLoading(true);
      try {
        const [profileData, statsData] = await Promise.all([
          service.getStudentProfile(studentId),
          service.getStudentDashboardStats(studentId)
        ]);
        
        setProfile(profileData);
        setStats(statsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const updateProfile = async (updates, userId) => {
    try {
      await service.updateStudentProfile(studentId, updates, userId);
      
      // Refresh data
      const updatedProfile = await service.getStudentProfile(studentId);
      setProfile(updatedProfile);
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const updateContacts = async (contactsData, userId) => {
    try {
      await service.updateStudentContacts(studentId, contactsData, userId);
      
      // Refresh profile
      const updatedProfile = await service.getStudentProfile(studentId);
      setProfile(updatedProfile);
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const updateMedical = async (medicalData, userId) => {
    try {
      await service.updateStudentMedical(studentId, medicalData, userId);
      
      const updatedProfile = await service.getStudentProfile(studentId);
      setProfile(updatedProfile);
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const changePassword = async (currentPassword, newPassword, user) => {
    try {
      const result = await service.changePassword(currentPassword, newPassword, user);
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return {
    loading,
    error,
    profile,
    stats,
    updateProfile,
    updateContacts,
    updateMedical,
    changePassword,
    service
  };
}

// ── Export singleton instance ─────────────────────────────────────────────
export const profileService = new ProfileService();

export default ProfileService;