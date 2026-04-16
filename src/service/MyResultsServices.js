import { db } from "../Firebase/Firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot
} from "firebase/firestore";

// ── Results Service Class ─────────────────────────────────────────────────
class ResultsService {
  constructor() {
    this.collections = {
      studentResults: "studentResults",
      results: "results",
      modules: "modules",
      moduleResults: "moduleResults",
      gradeDefinitions: "gradeDefinitions",
      gradeBoundaries: "gradeBoundaries",
      academicStandings: "academicStandings",
      performanceTrends: "performanceTrends",
      classPerformance: "classPerformance",
      studentGPA: "studentGPA",
      studentAcademics: "studentAcademics"
    };
  }

  // ===========================================
  // GRADE CALCULATION UTILITIES
  // ===========================================

  /**
   * Calculate grade based on percentage
   */
  calculateGrade(percentage) {
    if (percentage >= 80) return { grade: "A", label: "Excellent", color: "text-green-600", bgColor: "bg-green-100", gradePoint: 4.0 };
    if (percentage >= 75) return { grade: "B+", label: "Very Good", color: "text-blue-600", bgColor: "bg-blue-100", gradePoint: 3.3 };
    if (percentage >= 70) return { grade: "B", label: "Good", color: "text-blue-500", bgColor: "bg-blue-100", gradePoint: 3.0 };
    if (percentage >= 65) return { grade: "C+", label: "Above Average", color: "text-yellow-600", bgColor: "bg-yellow-100", gradePoint: 2.3 };
    if (percentage >= 60) return { grade: "C", label: "Average", color: "text-orange-500", bgColor: "bg-orange-100", gradePoint: 2.0 };
    if (percentage >= 50) return { grade: "C-", label: "Below Average", color: "text-orange-500", bgColor: "bg-orange-100", gradePoint: 1.7 };
    if (percentage >= 40) return { grade: "D", label: "Satisfactory", color: "text-red-500", bgColor: "bg-red-100", gradePoint: 1.0 };
    return { grade: "F", label: "Fail", color: "text-red-600", bgColor: "bg-red-200", gradePoint: 0.0 };
  }

  /**
   * Get grade color class based on percentage
   */
  getGradeColor(percentage) {
    if (percentage >= 75) return "bg-green-50 text-green-600";
    if (percentage >= 60) return "bg-orange-50 text-orange-500";
    return "bg-red-50 text-red-500";
  }

  /**
   * Get grade pill style based on grade
   */
  getGradePillStyle(grade) {
    const styles = {
      "A": "bg-green-100 text-green-600",
      "B+": "bg-blue-100 text-blue-600",
      "B": "bg-blue-100 text-blue-500",
      "C+": "bg-yellow-100 text-yellow-600",
      "C": "bg-orange-100 text-orange-500",
      "C-": "bg-orange-100 text-orange-400",
      "D": "bg-red-100 text-red-500",
      "F": "bg-red-200 text-red-600"
    };
    return styles[grade] || "bg-gray-100 text-gray-600";
  }

  /**
   * Calculate GPA from modules
   */
  calculateGPA(modules) {
    if (!modules || modules.length === 0) return "0.0";
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    modules.forEach(module => {
      const gradeInfo = this.calculateGrade(module.average);
      totalPoints += gradeInfo.gradePoint * (module.credits || 15);
      totalCredits += module.credits || 15;
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(1) : "0.0";
  }

  /**
   * Calculate academic standing based on GPA
   */
  getAcademicStanding(gpa) {
    if (gpa >= 3.5) return { standing: "Excellent", color: "text-green-600", bgColor: "bg-green-50" };
    if (gpa >= 2.5) return { standing: "Good", color: "text-blue-600", bgColor: "bg-blue-50" };
    if (gpa >= 2.0) return { standing: "Satisfactory", color: "text-yellow-600", bgColor: "bg-yellow-50" };
    return { standing: "At Risk", color: "text-red-500", bgColor: "bg-red-50" };
  }

  /**
   * Calculate pass rate
   */
  calculatePassRate(modules) {
    if (!modules || modules.length === 0) return 0;
    const passing = modules.filter(m => m.average >= 50).length;
    return Math.round((passing / modules.length) * 100);
  }

  /**
   * Count at-risk modules (below 60%)
   */
  countAtRiskModules(modules) {
    return modules?.filter(m => m.average < 60).length || 0;
  }

  // ===========================================
  // STUDENT RESULTS OPERATIONS
  // ===========================================

  /**
   * Get student results for a specific semester
   */
  async getStudentResults(studentId, semester) {
    try {
      const q = query(
        collection(db, this.collections.studentResults),
        where("studentId", "==", studentId),
        where("semester", "==", semester),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching student results:", error);
      throw error;
    }
  }

  /**
   * Get all semesters for a student
   */
  async getStudentSemesters(studentId) {
    try {
      const q = query(
        collection(db, this.collections.studentResults),
        where("studentId", "==", studentId),
        orderBy("semester", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const semesters = [];
      querySnapshot.forEach((doc) => {
        semesters.push(doc.data().semester);
      });
      return semesters;
    } catch (error) {
      console.error("Error fetching student semesters:", error);
      throw error;
    }
  }

  /**
   * Get all results for a student (all semesters)
   */
  async getAllStudentResults(studentId) {
    try {
      const q = query(
        collection(db, this.collections.studentResults),
        where("studentId", "==", studentId),
        orderBy("semester", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (error) {
      console.error("Error fetching all student results:", error);
      throw error;
    }
  }

  /**
   * Get current semester results (latest)
   */
  async getCurrentSemesterResults(studentId) {
    try {
      const q = query(
        collection(db, this.collections.studentResults),
        where("studentId", "==", studentId),
        orderBy("semester", "desc"),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching current semester results:", error);
      throw error;
    }
  }

  // ===========================================
  // MODULE RESULTS OPERATIONS
  // ===========================================

  /**
   * Get module results for a student
   */
  async getModuleResults(studentId, moduleCode, semester) {
    try {
      const q = query(
        collection(db, this.collections.moduleResults),
        where("studentId", "==", studentId),
        where("moduleCode", "==", moduleCode),
        where("semester", "==", semester),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching module results:", error);
      throw error;
    }
  }

  /**
   * Get all module results for a student in a semester
   */
  async getSemesterModuleResults(studentId, semester) {
    try {
      const q = query(
        collection(db, this.collections.moduleResults),
        where("studentId", "==", studentId),
        where("semester", "==", semester)
      );
      
      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (error) {
      console.error("Error fetching semester module results:", error);
      throw error;
    }
  }

  // ===========================================
  // PERFORMANCE TRENDS
  // ===========================================

  /**
   * Get performance trend data for a student
   */
  async getPerformanceTrend(studentId, semester, limitCount = 5) {
    try {
      const q = query(
        collection(db, this.collections.performanceTrends),
        where("studentId", "==", studentId),
        where("semester", "==", semester),
        orderBy("date", "asc"),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const trends = [];
      querySnapshot.forEach((doc) => {
        trends.push(doc.data());
      });
      
      // Format for UI
      return trends.map((t, i) => ({
        label: t.assessment || `Test ${i + 1}`,
        value: t.score
      }));
    } catch (error) {
      console.error("Error fetching performance trend:", error);
      throw error;
    }
  }

  /**
   * Get weekly performance trend
   */
  async getWeeklyPerformanceTrend(studentId, semester) {
    try {
      const q = query(
        collection(db, this.collections.performanceTrends),
        where("studentId", "==", studentId),
        where("semester", "==", semester),
        where("type", "==", "weekly"),
        orderBy("week", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const weekly = [];
      querySnapshot.forEach((doc) => {
        weekly.push(doc.data());
      });
      
      return weekly.map(w => ({
        week: w.week,
        average: w.average
      }));
    } catch (error) {
      console.error("Error fetching weekly performance trend:", error);
      throw error;
    }
  }

  // ===========================================
  // CLASS COMPARISON
  // ===========================================

  /**
   * Get class performance data for comparison
   */
  async getClassPerformance(moduleCode, semester) {
    try {
      const q = query(
        collection(db, this.collections.classPerformance),
        where("moduleCode", "==", moduleCode),
        where("semester", "==", semester),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return doc.data();
      }
      return null;
    } catch (error) {
      console.error("Error fetching class performance:", error);
      throw error;
    }
  }

  /**
   * Get class average for a module
   */
  async getClassAverage(moduleCode, semester) {
    try {
      const classPerf = await this.getClassPerformance(moduleCode, semester);
      return classPerf?.classAverage || 0;
    } catch (error) {
      console.error("Error fetching class average:", error);
      throw error;
    }
  }

  /**
   * Get top performer score for a module
   */
  async getTopPerformerScore(moduleCode, semester) {
    try {
      const classPerf = await this.getClassPerformance(moduleCode, semester);
      return classPerf?.topPerformer || 100;
    } catch (error) {
      console.error("Error fetching top performer:", error);
      throw error;
    }
  }

  // ===========================================
  // GPA OPERATIONS
  // ===========================================

  /**
   * Get student GPA history
   */
  async getStudentGPAHistory(studentId) {
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
   * Get current GPA
   */
  async getCurrentGPA(studentId) {
    try {
      const gpaData = await this.getStudentGPAHistory(studentId);
      return gpaData?.cumulativeGPA || 0;
    } catch (error) {
      console.error("Error fetching current GPA:", error);
      throw error;
    }
  }

  // ===========================================
  // ACADEMIC STANDING
  // ===========================================

  /**
   * Get student academic standing
   */
  async getAcademicStanding(studentId) {
    try {
      const q = query(
        collection(db, this.collections.academicStandings),
        where("studentId", "==", studentId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return doc.data().standing;
      }
      return "Good"; // Default
    } catch (error) {
      console.error("Error fetching academic standing:", error);
      throw error;
    }
  }

  /**
   * Get credits earned
   */
  async getCreditsEarned(studentId) {
    try {
      const q = query(
        collection(db, this.collections.studentAcademics),
        where("studentId", "==", studentId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        return {
          earned: data.creditsEarned || 38,
          total: data.totalCredits || 60
        };
      }
      return { earned: 0, total: 0 };
    } catch (error) {
      console.error("Error fetching credits earned:", error);
      throw error;
    }
  }

  // ===========================================
  // PROCESSING & AGGREGATION
  // ===========================================

  /**
   * Process student results for a semester
   */
  async processStudentSemesterResults(studentId, semester) {
    try {
      // Get module results
      const moduleResults = await this.getSemesterModuleResults(studentId, semester);
      
      if (!moduleResults || moduleResults.length === 0) {
        return null;
      }

      // Calculate averages and grades
      const modules = moduleResults.map(mr => ({
        name: mr.moduleName,
        test1: mr.assessments?.find(a => a.type === "test" && a.name === "Test 1")?.score || 0,
        test2: mr.assessments?.find(a => a.type === "test" && a.name === "Test 2")?.score || 0,
        assign: mr.assessments?.find(a => a.type === "assignment")?.score || null,
        avg: mr.weightedAverage || 0,
        grade: mr.finalGrade || this.calculateGrade(mr.weightedAverage || 0).grade,
        gradeColor: this.getGradePillStyle(mr.finalGrade)
      }));

      // Calculate overall stats
      const overallAvg = modules.length > 0
        ? Math.round(modules.reduce((sum, m) => sum + m.avg, 0) / modules.length)
        : 0;

      const bestModule = modules.reduce((best, current) => 
        current.avg > best.avg ? current : best
      , modules[0]);

      const worstModule = modules.reduce((worst, current) => 
        current.avg < worst.avg ? current : worst
      , modules[0]);

      const gpa = this.calculateGPA(moduleResults);
      const passRate = this.calculatePassRate(modules);
      const atRiskModules = this.countAtRiskModules(modules);

      // Get class comparisons
      const classAverages = await Promise.all(
        moduleResults.map(mr => this.getClassAverage(mr.moduleCode, semester))
      );
      const avgClassAverage = classAverages.length > 0
        ? Math.round(classAverages.reduce((sum, avg) => sum + avg, 0) / classAverages.length)
        : 0;

      return {
        modules,
        overallAvg,
        bestModule: {
          name: bestModule.name,
          avg: bestModule.avg,
          grade: bestModule.grade
        },
        worstModule: {
          name: worstModule.name,
          avg: worstModule.avg,
          grade: worstModule.grade
        },
        gpa,
        passRate,
        atRiskModules,
        assessmentsCompleted: moduleResults.length * 3, // Approx
        totalAssessments: moduleResults.length * 4,
        classAverage: avgClassAverage,
        standing: this.getAcademicStanding(parseFloat(gpa))
      };
    } catch (error) {
      console.error("Error processing student results:", error);
      throw error;
    }
  }

  /**
   * Get complete results dashboard data
   */
  async getResultsDashboard(studentId, semester = null) {
    try {
      // If semester not provided, get current
      let targetSemester = semester;
      if (!targetSemester) {
        const current = await this.getCurrentSemesterResults(studentId);
        targetSemester = current?.semester;
      }

      if (!targetSemester) {
        return null;
      }

      // Fetch all data in parallel
      const [
        processedData,
        trendData,
        semesterList,
        gpaHistory,
        credits
      ] = await Promise.all([
        this.processStudentSemesterResults(studentId, targetSemester),
        this.getPerformanceTrend(studentId, targetSemester, 5),
        this.getStudentSemesters(studentId),
        this.getStudentGPAHistory(studentId),
        this.getCreditsEarned(studentId)
      ]);

      if (!processedData) return null;

      return {
        ...processedData,
        trendData,
        semesters: semesterList,
        currentSemester: targetSemester,
        gpaHistory: gpaHistory?.semesterHistory || [],
        creditsEarned: credits.earned,
        totalCredits: credits.total
      };
    } catch (error) {
      console.error("Error getting results dashboard:", error);
      throw error;
    }
  }

  /**
   * Subscribe to overall dashboard real-time data
   */
  subscribeToDashboard(studentId, semester, callback) {
    try {
      if (!studentId || !semester) {
        callback(null);
        return () => {};
      }

      const q = query(
        collection(db, this.collections.moduleResults),
        where("studentId", "==", studentId),
        where("semester", "==", semester)
      );

      // Reconstruct dashboard when the module results update
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        try {
          const dashboardData = await this.getResultsDashboard(studentId, semester);
          callback(dashboardData);
        } catch (error) {
          console.error("Error in dashboard subscription callback:", error);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up dashboard subscription:", error);
      return () => {};
    }
  }

  // ===========================================
  // EXPORT FUNCTIONS
  // ===========================================

  /**
   * Generate CSV export data
   */
  generateCSV(modules, semester) {
    const rows = [
      ["Module", "Test 1", "Test 2", "Assignment", "Grade", "Average", "Status"]
    ];

    modules.forEach(m => {
      rows.push([
        m.name,
        `${m.test1}%`,
        `${m.test2}%`,
        m.assign ? `${m.assign}%` : "–",
        m.grade,
        `${m.avg}%`,
        m.avg >= 75 ? "Passing" : m.avg >= 60 ? "Average" : "At Risk"
      ]);
    });

    return rows.map(row => row.join(",")).join("\n");
  }

  /**
   * Generate HTML for PDF export
   */
  generatePDFHTML(studentName, studentId, semester, modules, stats) {
    return `
      <html>
        <head>
          <title>Academic Results - ${semester}</title>
          <style>
            body { font-family: 'DM Sans', sans-serif; padding: 40px; }
            h1 { color: #0d2818; font-size: 28px; margin-bottom: 8px; }
            h2 { color: #1a4d2a; font-size: 20px; margin-bottom: 24px; }
            .header { margin-bottom: 32px; }
            .student-info { color: #666; font-size: 14px; margin-bottom: 8px; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
            .stat-card { background: #f8f9fa; padding: 16px; border-radius: 12px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #0d2818; }
            .stat-label { font-size: 12px; color: #666; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
            th { background: #0d2818; color: white; padding: 12px; text-align: left; font-size: 12px; }
            td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
            .grade-A, .grade-B, .grade-C { font-weight: 600; }
            .grade-A { color: #059669; }
            .grade-B { color: #2563eb; }
            .grade-C { color: #d97706; }
            .grade-D, .grade-F { color: #dc2626; }
            .footer { margin-top: 48px; color: #999; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Corner Stone Primary School</h1>
            <h2>Academic Results - ${semester}</h2>
            <div class="student-info">Student: ${studentName} (${studentId})</div>
            <div class="student-info">Programme: BCom Accounting - Year 2</div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${stats.overallAvg}%</div>
              <div class="stat-label">Overall Average</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.gpa}</div>
              <div class="stat-label">GPA / 4.0</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.passRate}%</div>
              <div class="stat-label">Pass Rate</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.creditsEarned}</div>
              <div class="stat-label">Credits Earned</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Module</th>
                <th>Test 1</th>
                <th>Test 2</th>
                <th>Assignment</th>
                <th>Grade</th>
                <th>Average</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${modules.map(m => `
                <tr>
                  <td>${m.name}</td>
                  <td>${m.test1}%</td>
                  <td>${m.test2}%</td>
                  <td>${m.assign ? m.assign + '%' : '–'}</td>
                  <td class="grade-${m.grade.charAt(0)}">${m.grade}</td>
                  <td><strong>${m.avg}%</strong></td>
                  <td>${
                    m.avg >= 75 ? 'Passing' :
                    m.avg >= 60 ? 'Average' : 'At Risk'
                  }</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            Generated on ${new Date().toLocaleDateString()} · Corner Stone School Management System
          </div>
        </body>
      </html>
    `;
  }
}

// ── Custom Hook for MyResults ─────────────────────────────────────────────
export function useMyResults(studentId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(null);
  
  const service = new ResultsService();

  useEffect(() => {
    let unsubscribe = () => {};

    const fetchData = async () => {
      if (!studentId) return;
      
      setLoading(true);
      try {
        const [semesterList, currentResults] = await Promise.all([
          service.getStudentSemesters(studentId),
          service.getCurrentSemesterResults(studentId)
        ]);
        
        setSemesters(semesterList);
        const targetSem = currentResults?.semester;
        setCurrentSemester(targetSem);
        
        if (targetSem) {
          unsubscribe = service.subscribeToDashboard(studentId, targetSem, (dashboardData) => {
            setResults(dashboardData);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      unsubscribe();
    };
  }, [studentId]);

  const loadSemester = async (semester) => {
    setLoading(true);
    setCurrentSemester(semester);
    // Note: To fully support switching semesters with real-time updates,
    // the hook would need to manage the active subscription.
    // For now, we update the state and rely on the UI to reflect it.
    try {
      const dashboardData = await service.getResultsDashboard(studentId, semester);
      setResults(dashboardData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!results?.modules) return;
    const csv = service.generateCSV(results.modules, currentSemester);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `results_${currentSemester?.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!results?.modules) return;
    const html = service.generatePDFHTML(
      "Tanaka Moyo", // Get from profile
      studentId,
      currentSemester,
      results.modules,
      results
    );
    
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  return {
    loading,
    error,
    results,
    semesters,
    currentSemester,
    loadSemester,
    exportCSV,
    exportPDF,
    service
  };
}

// ── Export singleton instance ─────────────────────────────────────────────
export const resultsService = new ResultsService();

export default ResultsService;