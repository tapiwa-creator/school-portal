import { db } from "../Firebase/Firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from "firebase/firestore";
import { useState, useEffect } from "react";

// ── Service Class ─────────────────────────────────────────────────────────
class PerformanceService {
  constructor() {
    this.collections = {
      modules: "modules",
      results: "results",
      students: "students",
      teachers: "teachers",
      classes: "classes",
      attendance: "attendance",
      performance: "performance",
      gradeBoundaries: "gradeBoundaries"
    };
  }

  // ── Grade Calculations ───────────────────────────────────────────────
  calculateGrade(percentage, gradeBoundaries = null) {
    const defaultBoundaries = {
      "A+": { min: 95, color: "bg-green-600", textColor: "text-green-700", bgColor: "bg-green-100" },
      "A":  { min: 80, color: "bg-green-500", textColor: "text-green-600", bgColor: "bg-green-100" },
      "B+": { min: 75, color: "bg-blue-500",  textColor: "text-blue-600",  bgColor: "bg-blue-100"  },
      "B":  { min: 70, color: "bg-blue-400",  textColor: "text-blue-500",  bgColor: "bg-blue-100"  },
      "C+": { min: 65, color: "bg-yellow-500", textColor: "text-yellow-600", bgColor: "bg-yellow-100"},
      "C":  { min: 60, color: "bg-orange-400", textColor: "text-orange-600", bgColor: "bg-orange-100"},
      "D":  { min: 50, color: "bg-red-400",   textColor: "text-red-600",   bgColor: "bg-red-100"   },
      "F":  { min: 0,  color: "bg-red-600",   textColor: "text-red-700",   bgColor: "bg-red-200"   }
    };

    const boundaries = gradeBoundaries || defaultBoundaries;
    
    for (const [grade, criteria] of Object.entries(boundaries)) {
      if (percentage >= criteria.min) {
        return {
          grade,
          color: criteria.color,
          textColor: criteria.textColor,
          bgColor: criteria.bgColor,
          percentage
        };
      }
    }
    
    return {
      grade: "F",
      color: "bg-red-600",
      textColor: "text-red-700",
      bgColor: "bg-red-200",
      percentage
    };
  }

  calculateGPA(modules) {
    const gradePoints = {
      "A+": 4.0, "A": 4.0, "A-": 3.7,
      "B+": 3.3, "B": 3.0, "B-": 2.7,
      "C+": 2.3, "C": 2.0, "C-": 1.7,
      "D": 1.0, "F": 0.0
    };

    let totalPoints = 0;
    let totalCredits = 0;

    modules.forEach(module => {
      const points = gradePoints[module.grade] || 0;
      totalPoints += points * module.credits;
      totalCredits += module.credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(1) : "0.0";
  }

  calculateTrend(currentAvg, previousAvg) {
    if (currentAvg > previousAvg) return "up";
    if (currentAvg < previousAvg) return "down";
    return "stable";
  }

  // ── Data Fetching ────────────────────────────────────────────────────
  async fetchStudentModules(studentId, semester = null) {
    try {
      let q = query(
        collection(db, this.collections.modules),
        where("enrolledStudents", "array-contains", studentId)
      );

      if (semester) {
        q = query(q, where("semester", "==", semester));
      }

      const querySnapshot = await getDocs(q);
      const modules = [];

      querySnapshot.forEach((doc) => {
        modules.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return modules;
    } catch (error) {
      console.error("Error fetching student modules:", error);
      throw error;
    }
  }

  async fetchModuleResults(moduleId, studentId) {
    try {
      const q = query(
        collection(db, this.collections.results),
        where("moduleId", "==", moduleId),
        where("studentId", "==", studentId)
      );

      const querySnapshot = await getDocs(q);
      const results = [];

      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return results;
    } catch (error) {
      console.error("Error fetching module results:", error);
      throw error;
    }
  }

  async fetchStudentPerformance(studentId, academicYear = null) {
    try {
      let q = query(
        collection(db, this.collections.performance),
        where("studentId", "==", studentId)
      );

      if (academicYear) {
        q = query(q, where("academicYear", "==", academicYear));
      }

      q = query(q, orderBy("semester", "desc"));

      const querySnapshot = await getDocs(q);
      const performance = [];

      querySnapshot.forEach((doc) => {
        performance.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return performance;
    } catch (error) {
      console.error("Error fetching student performance:", error);
      throw error;
    }
  }

  async fetchClassAverage(moduleId, classId) {
    try {
      const q = query(
        collection(db, this.collections.results),
        where("moduleId", "==", moduleId),
        where("classId", "==", classId)
      );

      const querySnapshot = await getDocs(q);
      let total = 0;
      let count = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        total += data.finalGrade || 0;
        count++;
      });

      return count > 0 ? Math.round(total / count) : 0;
    } catch (error) {
      console.error("Error fetching class average:", error);
      throw error;
    }
  }

  async fetchTopPerformer(moduleId) {
    try {
      const q = query(
        collection(db, this.collections.results),
        where("moduleId", "==", moduleId),
        orderBy("finalGrade", "desc"),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching top performer:", error);
      throw error;
    }
  }

  async fetchWeeklyPerformance(studentId, moduleId, weeks = 8) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (weeks * 7));

      const q = query(
        collection(db, this.collections.performance),
        where("studentId", "==", studentId),
        where("moduleId", "==", moduleId),
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(endDate)),
        orderBy("date", "asc")
      );

      const querySnapshot = await getDocs(q);
      const weeklyData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        weeklyData.push({
          week: this.getWeekNumber(data.date.toDate()),
          avg: data.weeklyAverage,
          date: data.date.toDate()
        });
      });

      return weeklyData;
    } catch (error) {
      console.error("Error fetching weekly performance:", error);
      throw error;
    }
  }

  // ── Data Processing ──────────────────────────────────────────────────
  async processStudentResults(studentId, semester) {
    try {
      const modules = await this.fetchStudentModules(studentId, semester);
      const processedModules = [];
      let totalAverage = 0;

      for (const module of modules) {
        const results = await this.fetchModuleResults(module.id, studentId);
        
        // Calculate module averages
        const tests = results.filter(r => r.type === "test").map(r => r.score);
        const assignments = results.filter(r => r.type === "assignment").map(r => r.score);
        
        const testAvg = tests.length > 0 
          ? Math.round(tests.reduce((a, b) => a + b, 0) / tests.length) 
          : null;
        
        const assignAvg = assignments.length > 0 
          ? Math.round(assignments.reduce((a, b) => a + b, 0) / assignments.length) 
          : null;

        // Calculate overall module average
        let moduleAvg = 0;
        let weightCount = 0;
        
        if (testAvg) {
          moduleAvg += testAvg * 0.6; // Tests worth 60%
          weightCount += 0.6;
        }
        if (assignAvg) {
          moduleAvg += assignAvg * 0.4; // Assignments worth 40%
          weightCount += 0.4;
        }
        
        moduleAvg = weightCount > 0 ? Math.round(moduleAvg / weightCount) : 0;

        // Get previous average for trend calculation
        const previousPerformance = await this.fetchPreviousModuleAverage(studentId, module.id, semester);
        const trend = this.calculateTrend(moduleAvg, previousPerformance);

        const gradeInfo = this.calculateGrade(moduleAvg);

        processedModules.push({
          code: module.code,
          name: module.name,
          lecturer: module.lecturer,
          credits: module.credits,
          tests: tests,
          assign: assignAvg,
          avg: moduleAvg,
          grade: gradeInfo.grade,
          gradeColor: `${gradeInfo.bgColor} ${gradeInfo.textColor}`,
          trend: trend,
          id: module.id
        });

        totalAverage += moduleAvg;
      }

      const overallAvg = processedModules.length > 0 
        ? Math.round(totalAverage / processedModules.length) 
        : 0;

      return {
        modules: processedModules,
        overallAvg,
        gpa: this.calculateGPA(processedModules),
        totalModules: processedModules.length
      };
    } catch (error) {
      console.error("Error processing student results:", error);
      throw error;
    }
  }

  async fetchPreviousModuleAverage(studentId, moduleId, currentSemester) {
    try {
      // Implementation depends on your data structure
      // This is a placeholder
      return 0;
    } catch (error) {
      console.error("Error fetching previous module average:", error);
      return 0;
    }
  }

  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // ── CRUD Operations ──────────────────────────────────────────────────
  async addResult(resultData) {
    try {
      const docRef = await addDoc(collection(db, this.collections.results), {
        ...resultData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding result:", error);
      throw error;
    }
  }

  async updateResult(resultId, updateData) {
    try {
      const resultRef = doc(db, this.collections.results, resultId);
      await updateDoc(resultRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error("Error updating result:", error);
      throw error;
    }
  }

  async deleteResult(resultId) {
    try {
      await deleteDoc(doc(db, this.collections.results, resultId));
      return true;
    } catch (error) {
      console.error("Error deleting result:", error);
      throw error;
    }
  }

  async addModule(moduleData) {
    try {
      const docRef = await addDoc(collection(db, this.collections.modules), {
        ...moduleData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding module:", error);
      throw error;
    }
  }
}

// ── Custom Hook for Performance Data ─────────────────────────────────────
export function usePerformance(studentId, semester = null) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState({
    modules: [],
    overallAvg: 0,
    gpa: "0.0",
    bestModule: null,
    worstModule: null,
    atRisk: 0,
    passing: 0,
    weeklyTrend: [],
    classComparison: []
  });

  const service = new PerformanceService();

  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Process main performance data
        const { modules, overallAvg, gpa } = await service.processStudentResults(studentId, semester);
        
        // Calculate statistics
        const bestModule = modules.length > 0 
          ? modules.reduce((best, current) => current.avg > best.avg ? current : best)
          : null;
        
        const worstModule = modules.length > 0
          ? modules.reduce((worst, current) => current.avg < worst.avg ? current : worst)
          : null;

        const atRisk = modules.filter(m => m.avg < 60).length;
        const passing = modules.filter(m => m.avg >= 60).length;

        // Fetch weekly trend data (example for first module)
        let weeklyTrend = [];
        if (modules.length > 0) {
          weeklyTrend = await service.fetchWeeklyPerformance(studentId, modules[0].id);
        }

        // Fetch class comparisons
        const classComparison = await fetchClassComparisons(service, modules, studentId);

        setPerformanceData({
          modules,
          overallAvg,
          gpa,
          bestModule,
          worstModule,
          atRisk,
          passing,
          weeklyTrend,
          classComparison
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, semester]);

  return { performanceData, loading, error, service };
}

async function fetchClassComparisons(service, modules, studentId) {
  const comparisons = [];

  for (const module of modules) {
    try {
      const classAvg = await service.fetchClassAverage(module.id, "class-id"); // You need actual class ID
      const topPerformer = await service.fetchTopPerformer(module.id);
      
      comparisons.push({
        moduleName: module.name,
        yourAvg: module.avg,
        classAvg,
        topPerformer: topPerformer?.score || 0,
        passMark: 50
      });
    } catch (error) {
      console.error("Error fetching class comparison:", error);
    }
  }

  return comparisons;
}

// Export singleton instance
export const performanceService = new PerformanceService();

// Export utility functions
export const gradeUtils = {
  calculateGrade: (percentage) => performanceService.calculateGrade(percentage),
  calculateGPA: (modules) => performanceService.calculateGPA(modules),
  calculateTrend: performanceService.calculateTrend
};

export default PerformanceService;