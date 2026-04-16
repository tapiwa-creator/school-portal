import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

// Layouts
import Layout from "../Components/Layout";
import StudentLayout from "../Components/Dashboard/StudentLayout";
import AdminLayout from "../Components/Dashboard/AdminLayout";

// Public pages
import LandingPage from "../Pages/LandingPage";
import Admissions from "../Pages/Admissions";
import Support from "../Pages/Support";
import Login from "../Pages/Login";
import CreateAccount from "../Pages/CreateAccount";

// Admin pages
import AdminDashboard from "../Pages/Dashboard/Admin/AdminDashboard";
import StudentsManagement from "../Pages/Dashboard/Admin/StudentsManagement";
import ManageTeachers from "../Pages/Dashboard/Admin/ManageTeachers";
import Timetable from "../Pages/Dashboard/Admin/Timetable";
import AcademicRecords from "../Pages/Dashboard/Admin/AcademicRecords";
import Results from "../Pages/Dashboard/Admin/Results";
import Reports from "../Pages/Dashboard/Admin/Reports";
import Announcements from "../Pages/Dashboard/Admin/Announcements";
import Tests from "../Pages/Dashboard/Admin/Tests";
import Events from "../Pages/Dashboard/Admin/Events";
import Assignments from "../Pages/Dashboard/Admin/Assignments";
import AdminProfile from "../Pages/Dashboard/Admin/AdminProfile"; // Import Admin Profile

// Student pages
import StudentDashboard from "../Pages/Dashboard/Students/StudentDashboard";
import MyResults from "../Pages/Dashboard/Students/MyResults";
import StudentTimetable from "../Pages/Dashboard/Students/Timetable";
import StudentAssignments from "../Pages/Dashboard/Students/Assignments";
import FeesPayment from "../Pages/Dashboard/Students/FeesPayment";
import Profile from "../Pages/Dashboard/Students/Profile";
import Compliance from "../Pages/Dashboard/Students/Compliance";
import Performance from "../Pages/Dashboard/Students/Performance";
import Messages from "../Pages/Dashboard/Students/Messages";
import Settings from "../Pages/Dashboard/Students/Settings";
import StudentEvents from "../Pages/Dashboard/Students/Events";

// Setup page (temporary)
import SetupDatabase from "../Pages/SetupDatabase";

// Import ProtectedRoute component
import ProtectedRoute from "../Components/ProtectedRoute";

const AppRoutes = () => {
  // userProfile contains the full Firestore user doc including grade, name, etc.
  const { userProfile } = useAuth();

  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route path="/" element={<Layout><LandingPage /></Layout>} />
      <Route path="/admissions" element={<Layout><Admissions /></Layout>} />
      <Route path="/support" element={<Layout><Support /></Layout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/create-account" element={<CreateAccount />} />

      {/* ── TEMPORARY: Database setup route ── */}
      <Route path="/setup" element={<SetupDatabase />} />

      {/* ── Logout ── */}
      <Route path="/logout" element={<Navigate to="/" replace />} />

      {/* ── Admin routes ── */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRole="admin">
          <AdminLayout><AdminDashboard /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRole="admin">
          <AdminLayout><AdminDashboard /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/students" element={
        <ProtectedRoute allowedRole="admin">
          <AdminLayout><StudentsManagement /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/teachers" element={
        <ProtectedRoute allowedRole="admin">
          <AdminLayout><ManageTeachers /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/timetable" element={
        <ProtectedRoute allowedRole="admin">
          <AdminLayout><Timetable /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/academic-records" element={
        <ProtectedRoute allowedRole="admin">
          <AdminLayout><AcademicRecords /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/results" element={
        <ProtectedRoute allowedRole="admin">
          <AdminLayout><Results /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRole="admin">
          <AdminLayout><Reports /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/announcements" element={
        <ProtectedRoute allowedRole="admin">
          <AdminLayout><Announcements /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/tests" element={
        <ProtectedRoute allowedRole="admin">
          <AdminLayout><Tests /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/events" element={
        <ProtectedRoute allowedRole="admin">
          <AdminLayout><Events /></AdminLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/assignments" element={
        <ProtectedRoute allowedRole="admin">
          <AdminLayout><Assignments /></AdminLayout>
        </ProtectedRoute>
      } />
      {/* Admin Profile Route */}
      <Route path="/admin/profile" element={
        <ProtectedRoute allowedRole="admin">
          <AdminLayout><AdminProfile /></AdminLayout>
        </ProtectedRoute>
      } />

      {/* ── Student routes ── */}
      <Route path="/student" element={
        <ProtectedRoute allowedRole="student">
          <StudentLayout><StudentDashboard student={userProfile} /></StudentLayout>
        </ProtectedRoute>
      } />
      <Route path="/student/dashboard" element={
        <ProtectedRoute allowedRole="student">
          <StudentLayout><StudentDashboard student={userProfile} /></StudentLayout>
        </ProtectedRoute>
      } />
      <Route path="/student/results" element={
        <ProtectedRoute allowedRole="student">
          <StudentLayout><MyResults student={userProfile} /></StudentLayout>
        </ProtectedRoute>
      } />
      <Route path="/student/timetable" element={
        <ProtectedRoute allowedRole="student">
          <StudentLayout><StudentTimetable student={userProfile} /></StudentLayout>
        </ProtectedRoute>
      } />

      {/* FIX: pass userProfile as student prop so grade field is available */}
      <Route path="/student/assignments" element={
        <ProtectedRoute allowedRole="student">
          <StudentLayout><StudentAssignments student={userProfile} /></StudentLayout>
        </ProtectedRoute>
      } />

      <Route path="/student/fees" element={
        <ProtectedRoute allowedRole="student">
          <StudentLayout><FeesPayment student={userProfile} /></StudentLayout>
        </ProtectedRoute>
      } />
      <Route path="/student/profile" element={
        <ProtectedRoute allowedRole="student">
          <StudentLayout><Profile student={userProfile} /></StudentLayout>
        </ProtectedRoute>
      } />
      <Route path="/student/compliance" element={
        <ProtectedRoute allowedRole="student">
          <StudentLayout><Compliance student={userProfile} /></StudentLayout>
        </ProtectedRoute>
      } />
      <Route path="/student/performance" element={
        <ProtectedRoute allowedRole="student">
          <StudentLayout><Performance student={userProfile} /></StudentLayout>
        </ProtectedRoute>
      } />
      <Route path="/student/messages" element={
        <ProtectedRoute allowedRole="student">
          <StudentLayout><Messages student={userProfile} /></StudentLayout>
        </ProtectedRoute>
      } />
      <Route path="/student/settings" element={
        <ProtectedRoute allowedRole="student">
          <StudentLayout><Settings student={userProfile} /></StudentLayout>
        </ProtectedRoute>
      } />
      <Route path="/student/events" element={
        <ProtectedRoute allowedRole="student">
          <StudentLayout><StudentEvents student={userProfile} /></StudentLayout>
        </ProtectedRoute>
      } />

      {/* ── 404 Not Found ── */}
      <Route path="*" element={
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: "100vh", background: "#fff", fontFamily: "sans-serif",
        }}>
          <h1 style={{ fontSize: 72, fontWeight: 900, color: "#22a86a", fontFamily: "serif", margin: 0 }}>404</h1>
          <p style={{ fontSize: 16, color: "#6b8f7a", marginTop: 12 }}>Page not found.</p>
          <a href="/" style={{
            marginTop: 24, background: "#0d4a2f", color: "#fff",
            padding: "12px 28px", borderRadius: 24, fontSize: 14, fontWeight: 600, textDecoration: "none",
          }}>← Back to Home</a>
        </div>
      } />
    </Routes>
  );
};

export default AppRoutes;