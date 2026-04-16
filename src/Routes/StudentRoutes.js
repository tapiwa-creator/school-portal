import { Route } from "react-router-dom";
import StudentDashboard from "../Pages/Dashboard/Students/StudentDashboard";
import DashboardPage from "../Pages/Dashboard/Students/DashboardPage";
import ResultsPage from "../Pages/Dashboard/Students/MyResults";
import TimetablePage from "../Pages/Dashboard/Students/Timetable";
import AssignmentsPage from "../Pages/Dashboard/Students/Assignments";
import FeesPage from "../Pages/Dashboard/Students/FeesPage";
import CompliancePage from "../Pages/Dashboard/Students/Compliance";
import PerformancePage from "../Pages/Dashboard/Students/Performance";
import ProfilePage from "../Pages/Dashboard/Students/Profile";
import EventsPage from "../Pages/Dashboard/Students/Events";

const StudentRoutes = (
  <Route path="/student" element={<StudentDashboard />}>
    <Route index element={<DashboardPage />} />
    <Route path="results" element={<ResultsPage />} />
    <Route path="timetable" element={<TimetablePage />} />
    <Route path="assignments" element={<AssignmentsPage />} />
    <Route path="fees" element={<FeesPage />} />
    <Route path="compliance" element={<CompliancePage />} />
    <Route path="performance" element={<PerformancePage />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="events" element={<EventsPage />} />
  </Route>
);

export default StudentRoutes;