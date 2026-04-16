// src/hooks/useStudentAssignments.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/Authcontext';
import StudentAssignmentService from '../service/student/StudentAssignmentService';
import { profileService } from '../service/ProfileServices';

export function useStudentAssignments() {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFilter, setCurrentFilter] = useState("All");

  const fetchData = useCallback(async () => {
    // Kept for backward compatibility, but not primarily used for refreshing anymore
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    let unsubscribe = () => {};

    const initializeSubscription = async () => {
      try {
        console.log("Setting up subscription for student data:", currentUser.uid);
        
        let program = "Grade 1";
        let year = "Term 1";

        try {
          const profileData = await profileService.getStudentBasicInfo(currentUser.uid);
          if (profileData) {
            program = profileData.grade || profileData.program || "Grade 1";
            year = profileData.term || profileData.year || "Term 1";
          }
        } catch (err) {
          console.warn("Could not fetch student profile, falling back to defaults", err);
        }

        const studentContext = { uid: currentUser.uid, program, year };

        unsubscribe = StudentAssignmentService.subscribeToAssignments(studentContext, async (assignmentsData) => {
          setAssignments(assignmentsData);
          
          try {
            const [statsData, deadlinesData] = await Promise.all([
              StudentAssignmentService.getMyStats(currentUser.uid),
              StudentAssignmentService.getUpcomingDeadlines(currentUser.uid)
            ]);
            setStats(statsData);
            setDeadlines(deadlinesData);
          } catch (err) {
            console.error("Error fetching dependent stats:", err);
          }
          setLoading(false);
        });
      } catch (err) {
        console.error("Error setting up subscription:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    initializeSubscription();

    return () => unsubscribe();
  }, [currentUser]);

  // Filter assignments based on current filter
  const filteredAssignments = assignments.filter(assignment => {
    if (currentFilter === "All") return true;
    if (currentFilter === "Pending") return assignment.status === "pending";
    if (currentFilter === "Submitted") return assignment.status === "submitted";
    if (currentFilter === "Urgent") return assignment.urgency === "urgent";
    return true;
  });

  const submitAssignment = async (assignmentId, submissionData) => {
    if (!currentUser) return false;
    
    const result = await StudentAssignmentService.submitAssignment(
      currentUser.uid,
      assignmentId,
      submissionData
    );
    
    if (result.success) {
      await fetchData(); // Refresh data
    }
    
    return result;
  };

  const updateProgress = async (assignmentId, progress) => {
    if (!currentUser) return false;
    
    const result = await StudentAssignmentService.updateProgress(
      currentUser.uid,
      assignmentId,
      progress
    );
    
    if (result.success) {
      // Update local state optimistically
      setAssignments(prev => 
        prev.map(a => a.id === assignmentId ? { ...a, progress } : a)
      );
    }
    
    return result;
  };

  return {
    assignments: filteredAssignments,
    allAssignments: assignments,
    stats,
    deadlines,
    loading,
    error,
    currentFilter,
    setCurrentFilter,
    filters: ["All", "Pending", "Submitted", "Urgent"],
    submitAssignment,
    updateProgress,
    refresh: fetchData
  };
}