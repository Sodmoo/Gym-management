import React, { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/auth/loginPage";
import Register from "./pages/auth/registerPage";
import ForgotPassword from "./pages/auth/forgotPassword";
import ResetPassword from "./pages/auth/resetPassword";
import Setup_profile from "./pages/ProfileSetup/Setup_profile";
import A_Dashboard from "./pages/dashboard/A_dashboard";
import T_Dashboard from "./pages/dashboard/T_dashboard";
import U_Dashboard from "./pages/dashboard/U_dashboard";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { Loader } from "lucide-react";
import { useUserStore } from "./store/userStore";

import DashboardLayout from "./layout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

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
        <Loader className="w-10 h-10 animate-spin" />
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:id/:token" element={<ResetPassword />} />

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
          path="/user/*"
          element={
            <ProtectedRoute role="user">
              <DashboardLayout>
                <U_Dashboard />
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
