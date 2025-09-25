import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useUserStore = create((set) => ({
  user: null,
  users: [],
  trainers: [],
  isLoading: false,
  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/users/me");
      set({ user: res.data });
    } catch (error) {
      console.error("Error fetching user info:", error);
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
  clearUser: () => set({ user: null }),

  getAllUsers: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/users/alluser");
      set({ users: res.data });
      return true;
    } catch (error) {
      console.error("Error fetching all users:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  updateUser: async (id, userData) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.put(`/users/update/${id}`, userData);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Алдаа гарлаа", {
        position: "top-center",
      });
      console.error("Error updating user:", error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  deleteUser: async (id) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.delete(`/users/delete/${id}`);
      if (res.status === 200) {
        toast.success("Хэрэглэгчийг амжилттай устгалаа", {
          position: "top-center",
        });
      }
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Алдаа гарлаа", {
        position: "top-center",
      });
      console.error("Error deleting user:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  createUser: async (userData) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/users/create", userData);
      toast.success("Хэрэглэгчийг амжилттай бүртгэлээ", {
        position: "top-center",
      });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Алдаа гарлаа", {
        position: "top-center",
      });
      console.error("Error creating user:", error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));
