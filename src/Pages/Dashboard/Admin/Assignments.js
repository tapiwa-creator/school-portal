// src/Pages/Dashboard/Admin/Assignments.js
import React, { useState, useEffect } from 'react';
import AdminAssignmentService from '../../../service/admin/AdminAssignmentService';
import { useAuth } from '../../../context/Authcontext';
import { InfoIcon } from "lucide-react";

export default function AdminAssignments() {
  const { currentUser } = useAuth();
  const [assignments, setAssignments] = useState(null); // null = loading, [] = empty
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentStats, setAssignmentStats] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    module: 'Mathematics',
    moduleCode: 'MAT301',
    type: 'Individual',
    marks: 25,
    dueDate: '',
    description: '',
    lecturer: 'Dr. Chikwanda',
    lecturerId: 'tch-001',
    targetProgram: 'Grade 1',
    targetYear: 'Term 1',
    targetClasses: []
  });

  useEffect(() => {
    // Setup real-time listener for assignments
    const unsubscribe = AdminAssignmentService.subscribeToAssignments((data) => {
      if (data === null) {
        // Service is loading fresh data — keep spinner, clear stale assignments
        setAssignments(null);
        setLoading(true);
      } else {
        setAssignments(data);
        setLoading(false);
      }
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  // Removing fetchAssignments since we use real-time listeners now
  // We keep the reference updated to prevent breaking existing calls to fetchAssignments 
  // (though it doesn't need to do anything anymore for a subscription architecture)
  const fetchAssignments = () => { };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const adminId = currentUser?.uid || "system";
    const result = await AdminAssignmentService.createAssignment(formData, adminId);
    if (result.success) {
      setShowCreateModal(false);
      fetchAssignments();
      setFormData({
        title: '',
        module: 'Mathematics',
        moduleCode: 'MAT301',
        type: 'Individual',
        marks: 25,
        dueDate: '',
        description: '',
        lecturer: 'Dr. Chikwanda',
        lecturerId: 'tch-001',
        targetProgram: 'Grade 1',
        targetYear: 'Term 1',
        targetClasses: []
      });
      alert(result.message);
    } else {
      alert("Error: " + result.error);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm("Are you sure you want to delete this assignment? This will also hide it from students.")) {
      const result = await AdminAssignmentService.deleteAssignment(assignmentId);
      if (result.success) {
        fetchAssignments();
      }
    }
  };

  const viewStats = async (assignment) => {
    setSelectedAssignment(assignment);
    const stats = await AdminAssignmentService.getAssignmentStats(assignment.id);
    setAssignmentStats(stats);
    setShowStatsModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Safe list — never null when used in JSX
  const safeAssignments = assignments ?? [];

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 pt-16 md:pt-6">

      {/* Hero Banner */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)" }}
      >
        <div className="px-5 md:px-8 py-5 md:py-7">
          <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">Manage Assignments</h1>
          <p className="text-green-300 text-xs md:text-sm">
            Create and manage assignments · Auto-syncs to primary students
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-gray-900 mb-1">{safeAssignments.length}</div>
          <div className="text-gray-500 text-sm">Total Assignments</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {safeAssignments.reduce((sum, a) => sum + (a.syncedCount || 0), 0)}
          </div>
          <div className="text-gray-500 text-sm">Total Student Assignments</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {safeAssignments.filter(a => a.syncStatus === 'completed').length}
          </div>
          <div className="text-gray-500 text-sm">Synced Assignments</div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">All Assignments</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {safeAssignments.length} total
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors"
              style={{ backgroundColor: '#0d2818' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a4d2a'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0d2818'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create New Assignment
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-900"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {safeAssignments.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">No assignments created yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-2 text-green-600 hover:text-green-700 text-sm font-semibold"
                >
                  Create your first assignment →
                </button>
              </div>
            ) : (
              safeAssignments.map(assignment => (
                <div key={assignment.id} className="p-5 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {assignment.module} • {assignment.marks} marks • Due {assignment.dueDate instanceof Date ? assignment.dueDate.toLocaleDateString() : assignment.dueDate}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          {assignment.targetProgram}
                        </span>
                        <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                          {assignment.targetYear}
                        </span>
                        <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                          {assignment.syncedCount || 0} students
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewStats(assignment)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        View Stats
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Create New Assignment</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Assignment Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
                  placeholder="e.g. Mathematics – Fractions Exercise"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <select
                    name="module"
                    value={formData.module}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                  >
                    <option>Mathematics</option>
                    <option>English</option>
                    <option>Science</option>
                    <option>Social Studies</option>
                    <option>Arts & Craft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Assignment Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                  >
                    <option>Individual</option>
                    <option>Group</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    name="marks"
                    value={formData.marks}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Due Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Target Class
                  </label>
                  <select
                    name="targetProgram"
                    value={formData.targetProgram}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                  >
                    <option>Grade 1</option>
                    <option>Grade 2</option>
                    <option>Grade 3</option>
                    <option>Grade 4</option>
                    <option>Grade 5</option>
                    <option>Grade 6</option>
                    <option>Grade 7</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Term
                  </label>
                  <select
                    name="targetYear"
                    value={formData.targetYear}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                  >
                    <option>Term 1</option>
                    <option>Term 2</option>
                    <option>Term 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Description / Instructions <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none"
                  placeholder="Enter assignment instructions..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  <span className="font-bold"><InfoIcon className="w-5 h-5 inline-block mr-1" /> Note:</span> This assignment will be automatically synced to all eligible primary students based on the target class and term.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-white rounded-xl text-sm font-semibold transition-colors"
                  style={{ backgroundColor: '#0d2818' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a4d2a'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0d2818'}
                >
                  Create Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Assignment Stats</h2>
              <button
                onClick={() => setShowStatsModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{selectedAssignment.title}</h3>
              <p className="text-sm text-gray-500 mb-6">{selectedAssignment.module}</p>

              {assignmentStats && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{assignmentStats.total}</div>
                      <div className="text-xs text-gray-500 mt-1">Total Students</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{assignmentStats.submitted}</div>
                      <div className="text-xs text-green-600 mt-1">Submitted</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Submission Rate</span>
                        <span>{assignmentStats.submissionRate}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${assignmentStats.submissionRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-sm pt-2">
                      <span className="text-gray-500">Pending:</span>
                      <span className="font-semibold text-orange-600">{assignmentStats.pending}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Graded:</span>
                      <span className="font-semibold text-blue-600">{assignmentStats.graded}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowStatsModal(false)}
                className="w-full mt-6 px-4 py-3 text-white rounded-xl text-sm font-semibold"
                style={{ backgroundColor: '#0d2818' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a4d2a'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0d2818'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}