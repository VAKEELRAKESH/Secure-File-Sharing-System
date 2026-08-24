import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import UploadFile from "../pages/UploadFile";
import MyFiles from "../pages/MyFiles";
import SharedFiles from "../pages/SharedFiles";
import Analytics from "../pages/Analytics";
import Notifications from "../pages/Notifications";
import AdminDashboard from "../pages/AdminDashboard";
import DashboardLayout from "../components/layout/DashboardLayout";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        }
      />

      <Route
        path="/upload"
        element={
          <DashboardLayout>
            <UploadFile />
          </DashboardLayout>
        }
      />

      <Route
        path="/myfiles"
        element={
          <DashboardLayout>
            <MyFiles />
          </DashboardLayout>
        }
      />

      <Route
        path="/sharedfiles"
        element={
          <DashboardLayout>
            <SharedFiles />
          </DashboardLayout>
        }
      />

      <Route
        path="/analytics"
        element={
          <DashboardLayout>
            <Analytics />
          </DashboardLayout>
        }
      />

      <Route
        path="/notifications"
        element={
          <DashboardLayout>
            <Notifications />
          </DashboardLayout>
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          <DashboardLayout>
            <AdminDashboard />
          </DashboardLayout>
        }
      />
      <Route
         path="*"
         element={
           <DashboardLayout>
             <NotFound />
           </DashboardLayout>
       }
     />
    </Routes>
  );
}

export default AppRoutes;