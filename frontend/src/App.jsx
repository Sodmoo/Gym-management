import React, { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/auth/loginPage";
import Register from "./pages/auth/registerPage";
import ForgotPassword from "./pages/auth/forgotPassword";
import ResetPassword from "./pages/auth/resetPassword";
import Setup_profile from "./pages/ProfileSetup/Setup_profile";
import A_Dashboard from "./pages/dashboard/Admin/A_dashboard";
import T_Dashboard from "./pages/dashboard/Trainer/T_dashboard";
import U_Dashboard from "./pages/dashboard/User/U_dashboard";
import Trainer from "./pages/dashboard/User/Trainer";
import PlansT from "./pages/dashboard/Trainer/Plans";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { Loader, User } from "lucide-react";
import { useUserStore } from "./store/userStore";

import DashboardLayout from "./layout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Users from "./pages/dashboard/Admin/Users";
import Settings from "./pages/dashboard/Admin/Settings";
import Trainers from "./pages/dashboard/Admin/Trainers";
import Equipments from "./pages/dashboard/Admin/Equipments";
import Plans from "./pages/dashboard/Admin/Plans";
import TemplateManager from "./pages/dashboard/Trainer/Template";
import ProgressPage from "./pages/dashboard/Trainer/ProgressPage";
import Schedule from "./pages/dashboard/Trainer/Schedule";
import ChatPage from "./pages/dashboard/Trainer/ChatPage";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const fetchUser = useUserStore((s) => s.fetchUser);
  const { profileComplete } = useAuthStore.getState();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) {
      fetchUser();
    }
  }, [authUser, fetchUser]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-15 h-15 animate-spin text-green-300" />
      </div>
    );

  return (
    <div>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={!authUser ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!authUser ? <Register /> : <Navigate to="/" />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:id/:token" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route
          path="/setup-profile"
          element={
            !authUser ? (
              <Navigate to="/login" />
            ) : !profileComplete ? (
              <Setup_profile />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Dashboard routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <A_Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Trainer routes */}
        <Route
          path="/trainer/*"
          element={
            <ProtectedRoute role="trainer">
              <DashboardLayout>
                <T_Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/Template"
          element={
            <ProtectedRoute role="trainer">
              <DashboardLayout>
                <TemplateManager />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/Plans"
          element={
            <ProtectedRoute role="trainer">
              <DashboardLayout>
                <PlansT />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/progress"
          element={
            <ProtectedRoute role="trainer">
              <DashboardLayout>
                <ProgressPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/schedule"
          element={
            <ProtectedRoute role="trainer">
              <DashboardLayout>
                <Schedule />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/chat"
          element={
            <ProtectedRoute role="trainer">
              <DashboardLayout>
                <ChatPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* User routes */}
        <Route
          path="/user/*"
          element={
            <ProtectedRoute role="user">
              <DashboardLayout>
                <U_Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/trainer"
          element={
            <ProtectedRoute role="user">
              <DashboardLayout>
                <Trainer />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <A_Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trainers"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <Trainers />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/equipments"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <Equipments />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/plans"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout>
                <Plans />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to={authUser ? `/${authUser.role}` : "/login"} />}
        />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
