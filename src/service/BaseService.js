// src/services/BaseService.js
import { db } from "../Firebase/Firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";

class BaseService {
  constructor() {
    this.db = db;
  }

  // Format date for display
  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  // Calculate urgency based on due date
  calculateUrgency(dueDate) {
    const days = this.daysUntilDue(dueDate);
    if (days < 0) return "overdue";
    if (days <= 3) return "urgent";
    if (days <= 7) return "medium";
    return "low";
  }

  // Calculate days until due
  daysUntilDue(dueDate) {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Find eligible students based on criteria
  async findEligibleStudents(criteria) {
    let studentsQuery = query(
      collection(this.db, "students"),
      where("status", "==", "active")
    );
    
    if (criteria.program) {
      studentsQuery = query(studentsQuery, where("program", "==", criteria.program));
    }
    if (criteria.year) {
      studentsQuery = query(studentsQuery, where("year", "==", criteria.year));
    }
    if (criteria.classes && criteria.classes.length > 0) {
      studentsQuery = query(studentsQuery, where("class", "in", criteria.classes));
    }
    
    const snapshot = await getDocs(studentsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

export default BaseService;