// src/Pages/Dashboard/Admin/Students.js
import React, { useState, useEffect } from 'react';
import { db } from '../../../Firebase/Firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Phone } from 'lucide-react';
import { useAuth } from '../../../context/Authcontext';
import AdminStudentService from '../../../service/admin/StudentManagementService';

const GRADES = ['All', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'];
const STATUSES = ['All', 'Active', 'Pending', 'Inactive'];

export default function AdminStudents() {
  const { userProfile } = useAuth();
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // ── Real-time listener ────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const unsub = AdminStudentService.subscribeToStudents((data) => {
      data.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
      setStudents(data);
      setLoading(false);
    }, userProfile?.assignedGrade);

    return () => unsub();
  }, [userProfile?.assignedGrade]);

  const safeStudents = students ?? [];

  // ── Derived / filtered list ───────────────────────────────────────────────
  const filtered = safeStudents.filter(s => {
    const matchSearch =
      !search ||
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(search.toLowerCase());
    const matchGrade = gradeFilter === 'All' || s.grade === gradeFilter;
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchGrade && matchStatus;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalActive = safeStudents.filter(s => s.status === 'Active').length;
  const totalPending = safeStudents.filter(s => s.status === 'Pending').length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openProfile = (student) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
  };

  const openEdit = (student) => {
    setSelectedStudent(student);
    setEditForm({
      fullName: student.fullName || '',
      email: student.email || '',
      phone: student.phone || '',
      grade: student.grade || 'Grade 1',
      status: student.status || 'Active',
    });
    setShowEditModal(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', selectedStudent.id), {
        ...editForm,
        updatedAt: serverTimestamp(),
      });
      setShowEditModal(false);
    } catch (err) {
      alert('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Attendance helpers ────────────────────────────────────────────────────
  const attendancePct = (s) => {
    const total = s.attendance?.total || 0;
    const present = s.attendance?.present || 0;
    if (!total) return null;
    return Math.round((present / total) * 100);
  };

  const statusColor = (status) => {
    if (status === 'Active') return { bg: 'bg-green-50', text: 'text-green-700' };
    if (status === 'Pending') return { bg: 'bg-yellow-50', text: 'text-yellow-700' };
    return { bg: 'bg-gray-100', text: 'text-gray-500' };
  };

  const initials = (name = '') =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

  const avatarColor = (name = '') => {
    const colors = [
      '#0d2818', '#1a4d2a', '#2d6e3e', '#3a8c5c',
      '#1e3a5f', '#2e5e8a', '#5b3a8a', '#8a3a5b',
    ];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
    return colors[Math.abs(h) % colors.length];
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 pt-16 md:pt-6">

      {/* Hero Banner */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d2818 0%, #1a4d2a 50%, #2d6e3e 100%)' }}
      >
        <div className="px-5 md:px-8 py-5 md:py-7">
          <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">Manage Students</h1>
          <p className="text-green-300 text-xs md:text-sm">
            View and manage all enrolled students · Real-time sync
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-gray-900 mb-1">{safeStudents.length}</div>
          <div className="text-gray-500 text-sm">Total Students</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-gray-900 mb-1">{totalActive}</div>
          <div className="text-gray-500 text-sm">Active Students</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-gray-900 mb-1">{totalPending}</div>
          <div className="text-gray-500 text-sm">Pending Approval</div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="font-semibold text-gray-800">All Students</h2>
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search name, email, ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 w-48"
              />
            </div>
            {/* Grade filter */}
            <select
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-green-500"
            >
              {GRADES.map(g => <option key={g}>{g}</option>)}
            </select>
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-green-500"
            >
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            {/* Count badge */}
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {filtered.length} student{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-5 flex items-start gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="flex gap-2 mt-2">
                    <div className="h-4 bg-gray-100 rounded-full w-16" />
                    <div className="h-4 bg-gray-100 rounded-full w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">No students found</p>
                {search && (
                  <button onClick={() => setSearch('')} className="mt-2 text-green-600 hover:text-green-700 text-sm font-semibold">
                    Clear search →
                  </button>
                )}
              </div>
            ) : (
              filtered.map(student => {
                const pct = attendancePct(student);
                const sc = statusColor(student.status);
                return (
                  <div key={student.id} className="p-5 hover:bg-gray-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: avatar + info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ backgroundColor: avatarColor(student.fullName) }}
                        >
                          {initials(student.fullName)}
                        </div>
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{student.fullName || '—'}</h3>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {student.email} · {student.studentId}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                              {student.grade || '—'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                              {student.status || 'Unknown'}
                            </span>
                            {student.phone && (
                              <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {student.phone}
                              </span>
                            )}
                            {pct !== null && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${pct >= 75 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                {pct}% attendance
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openProfile(student)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => openEdit(student)}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ── Profile Modal ─────────────────────────────────────────────────── */}
      {showProfileModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Student Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >×</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar + name block */}
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                  style={{ backgroundColor: avatarColor(selectedStudent.fullName) }}
                >
                  {initials(selectedStudent.fullName)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedStudent.fullName}</h3>
                  <p className="text-sm text-gray-500">{selectedStudent.studentId}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{selectedStudent.grade}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(selectedStudent.status).bg} ${statusColor(selectedStudent.status).text}`}>
                      {selectedStudent.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Email', value: selectedStudent.email },
                  { label: 'Phone', value: selectedStudent.phone || '—' },
                  { label: 'Grade', value: selectedStudent.grade || '—' },
                  { label: 'Role', value: selectedStudent.role || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1">{label}</div>
                    <div className="text-sm font-semibold text-gray-800 truncate">{value}</div>
                  </div>
                ))}
              </div>

              {/* Attendance */}
              {selectedStudent.attendance && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Attendance</div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Total', value: selectedStudent.attendance.total || 0, color: 'text-gray-700' },
                      { label: 'Present', value: selectedStudent.attendance.present || 0, color: 'text-green-600' },
                      { label: 'Absent', value: selectedStudent.attendance.absent || 0, color: 'text-red-500' },
                      { label: 'Late', value: selectedStudent.attendance.late || 0, color: 'text-yellow-600' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className={`text-xl font-bold ${color}`}>{value}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                  {(selectedStudent.attendance.total || 0) > 0 && (() => {
                    const pct = Math.round(((selectedStudent.attendance.present || 0) / selectedStudent.attendance.total) * 100);
                    return (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Attendance Rate</span><span>{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 75 ? 'bg-green-500' : 'bg-red-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Academic */}
              {Array.isArray(selectedStudent.academic) && selectedStudent.academic.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Academic Records</div>
                  <div className="space-y-2">
                    {selectedStudent.academic.map((rec, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center text-sm">
                        <span className="text-gray-700 font-medium">{rec.subject || rec.name || `Record ${i + 1}`}</span>
                        <span className="font-bold text-gray-900">{rec.grade || rec.score || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Remarks */}
              {Array.isArray(selectedStudent.remarks) && selectedStudent.remarks.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Remarks</div>
                  <div className="space-y-2">
                    {selectedStudent.remarks.map((r, i) => (
                      <div key={i} className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 text-sm text-yellow-800">
                        {typeof r === 'string' ? r : r.text || JSON.stringify(r)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discipline */}
              {Array.isArray(selectedStudent.discipline) && selectedStudent.discipline.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Discipline</div>
                  <div className="space-y-2">
                    {selectedStudent.discipline.map((d, i) => (
                      <div key={i} className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                        {typeof d === 'string' ? d : d.text || JSON.stringify(d)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                <div>Enrolled: {selectedStudent.createdAt?.toDate?.().toLocaleDateString() ?? '—'}</div>
                <div>Updated:  {selectedStudent.updatedAt?.toDate?.().toLocaleDateString() ?? '—'}</div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => { setShowProfileModal(false); openEdit(selectedStudent); }}
                className="flex-1 px-4 py-3 text-white rounded-xl text-sm font-semibold transition-colors"
                style={{ backgroundColor: '#0d2818' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a4d2a'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0d2818'}
              >
                Edit Student
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ────────────────────────────────────────────────────── */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Edit Student</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >×</button>
            </div>

            <form onSubmit={handleEditSave} className="p-6 space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Grade + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Grade</label>
                  <select
                    value={editForm.grade}
                    onChange={e => setEditForm(p => ({ ...p, grade: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                  >
                    {GRADES.filter(g => g !== 'All').map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
                  >
                    {STATUSES.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                  style={{ backgroundColor: '#0d2818' }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = '#1a4d2a'; }}
                  onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = '#0d2818'; }}
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}