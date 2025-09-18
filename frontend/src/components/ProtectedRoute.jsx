import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ProtectedRoute = ({ children, role }) => {
  const { authUser } = useAuthStore();

  if (!authUser) return <Navigate to="/login" replace />;

  if (role && authUser.role !== role) {
    return <Navigate to="/" replace />; // Unauthorized бол default page руу
  }

  return children;
};

export default ProtectedRoute;
