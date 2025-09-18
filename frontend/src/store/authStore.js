import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

import { toast, Toaster } from "react-hot-toast";

export const useAuthStore = create((set) => {
  return {
    authUser: null,
    isAuthenticated: false,
    isRegistering: false,
    isLogin: false,
    isCheckingAuth: true,
    isLoading: false,
    role: null,
    profileComplete: false,
    register: async (data) => {
      set({ isRegistering: true });
      try {
        const res = await axiosInstance.post("/auth/register", data);

        toast.success(res.data.message, { position: "top-right" });
        return true; // Indicate successful registration
      } catch (error) {
        toast.error(error.response.data.message, { position: "top-center" });
        console.error("Error in register:", error);
        return false; // Indicate registration failure
      } finally {
        set({ isRegistering: false });
      }
    },
    login: async (data) => {
      set({ isLogin: true });
      try {
        const res = await axiosInstance.post("/auth/login", data);

        // 👉 backend-аас ирсэн хэрэглэгчийн мэдээлэл
        const { role, profileComplete, message } = res.data;

        // Store-д хадгалах
        set({
          authUser: res.data,
          isAuthenticated: true,
          role,
          profileComplete,
        });

        toast.success(message, { position: "top-right" });
        return true;
      } catch (error) {
        toast.error(error.response?.data?.message || "Login failed", {
          position: "top-center",
        });
        return false;
      } finally {
        set({ isLogin: false });
      }
    },

    logout: async () => {
      try {
        await axiosInstance.post("/auth/logout");
        set({ authUser: null, isAuthenticated: false });
        toast.success("Logged out successfully", { position: "top-right" });
        return true; // Indicate successful logout
      } catch (error) {
        toast.error(error.response.data.message, { position: "top-center" });
        return false; // Indicate logout failure
      }
    },
    forgotPassword: async (email) => {
      set({ isLoading: true });
      try {
        await axiosInstance.post("/auth/forgotPassword", {
          email,
        });
        set({ isLoading: false });
        toast.success("Reset password email sent please check email", {
          position: "top-center",
        });
      } catch (error) {
        set({ isLoading: false });
        toast.error(error.response.data.message, { position: "top-center" });
      }
    },
    resetPassword: async (id, token, password) => {
      set({ isLoading: true });

      try {
        await axiosInstance.post(`auth/resetPassword/${id}/${token}`, {
          password,
        });
        toast.success("Password reset successfully", {
          position: "top-center",
        });
      } catch (error) {
        set({ isLoading: false });
        toast.error(error.response.data.message, { position: "top-center" });
      }
    },

    checkAuth: async () => {
      try {
        const res = await axiosInstance.get("/auth/check");

        set({ authUser: res.data, isCheckingAuth: false });
      } catch (error) {
        console.log("Error in checkAuth:", error);
        set({ authUser: null, isAuthenticated: false, isCheckingAuth: false });
      } finally {
        set({ isCheckingAuth: false });
      }
    },
  };
});
