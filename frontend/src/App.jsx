import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import CivicPulseDashboard from "./Pages/CivicPulseDashboad";
import CommunityReports from "./Pages/CommunityReports";
import TrackReports from "./Pages/TrackReports";

import { Toaster } from "sonner";

import AdminDashboard from "./Pages/SuperAdmin/AdminDashboard";
import AdminAllReports from "./Pages/SuperAdmin/AdminAllReports";
import DepartmentDashboard from "./Pages/SuperAdmin/DepartmentDashboard";
import AdminAnalytics from "./Pages/SuperAdmin/AdminAnalytics";
import NewReport from "./Pages/SuperAdmin/NewReport";

import AdminLayout from "./components/AdminLayout";
import RedFlagAlert from "./components/RedFagAlert";
import StateAgentLayout from "./components/StateAgentLayout";
import StateAgentHub from "./Pages/Agents/StateAgentHub";

import "./App.css";

function App() {
  return (
    <BrowserRouter>

      {/* Global Red Flag Alert */}
      <RedFlagAlert />

      {/* Toast Notifications */}
      <Toaster
        richColors
        position="top-right"
      />

      <Routes>

        {/* =========================================
            PUBLIC ROUTES
        ========================================= */}

        <Route
          path="/"
          element={<CivicPulseDashboard />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/community"
          element={<CommunityReports />}
        />

        <Route
          path="/track-reports"
          element={<TrackReports />}
        />


        {/* =========================================
            ADMIN ROUTES
        ========================================= */}

        <Route
          path="/superAdmin"
          element={<AdminLayout />}
        >

          {/* /superAdmin */}
          <Route
            index
            element={<AdminDashboard />}
          />

          {/* /superAdmin/reports */}
          <Route
            path="reports"
            element={<AdminAllReports />}
          />

          {/* /superAdmin/analytics */}
          <Route
            path="analytics"
            element={<AdminAnalytics />}
          />

          {/* /superAdmin/newReport */}
          <Route
            path="newReport"
            element={<NewReport />}
          />

        </Route>


        {/* =========================================
            OTHER ADMIN ROUTES
        ========================================= */}

        <Route
          path="/allreports"
          element={<AdminAllReports />}
        />

        <Route
          path="/department"
          element={<DepartmentDashboard />}
        />

        <Route
          path="/analytics"
          element={<AdminAnalytics />}
        />


        {/* =========================================
            STATE AGENT ROUTES
        ========================================= */}

        {/* Hub: /agent — shows all states */}
        <Route
          path="/agent"
          element={<StateAgentHub />}
        />

        {/* Dynamic: /agent/:stateSlug — e.g. /agent/rajasthan */}
        <Route
          path="/agent/:stateSlug"
          element={<StateAgentLayout />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
