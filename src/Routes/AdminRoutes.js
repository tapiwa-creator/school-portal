import React from "react";
import { Routes, Route } from "react-router-dom";

// Layout
import AdminLayout from "../Components/Dashboard/AdminLayout";

// Admin pages
import AdminDashboard from "../Pages/Dashboard/Admin/AdminDashboard";
import ManageStudents from "../Pages/Dashboard/Admin/ManageTeachers";
import ManageTeachers from "../Pages/Dashboard/Admin/ManageTeachers"; // Fixed import
import FeeManagement  from "../Pages/Dashboard/Admin/FeeManagement";
import AcademicRecords from "../Pages/Dashboard/Admin/AcademicRecords"; // Renamed for clarity
import Reports        from "../Pages/Dashboard/Admin/Reports";
import Announcements  from "../Pages/Dashboard/Admin/Announcements"; // Fixed import
import Timetable      from "../Pages/Dashboard/Admin/Timetable";

// New imports for additional routes
import Tests          from "../Pages/Dashboard/Admin/Tests";
import Events         from "../Pages/Dashboard/Admin/Events";
import Assignments    from "../Pages/Dashboard/Admin/Assignments";

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        {/* Existing routes - fixed */}
        <Route path="/admin"               element={<AdminDashboard />} />
        <Route path="/admin/students"      element={<ManageStudents />} />
        <Route path="/admin/teachers"      element={<ManageTeachers />} />
        <Route path="/admin/fees"          element={<FeeManagement />} />
        <Route path="/admin/records"       element={<AcademicRecords />} /> {/* Updated component name */}
        <Route path="/admin/reports"       element={<Reports />} />
        <Route path="/admin/announcements" element={<Announcements />} />
        <Route path="/admin/timetable"     element={<Timetable />} />
        
        {/* New routes */}
        <Route path="/admin/tests"         element={<Tests />} />
        <Route path="/admin/events"        element={<Events />} />
        <Route path="/admin/assignments"   element={<Assignments />} />
        
        {/* Note: Reports route already exists above */}
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;