import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

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

  getAllTrainers: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/users/alltrainer");
      set({ trainers: res.data });
      return true;
    } catch (error) {
      console.error("Error fetching all trainers:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
