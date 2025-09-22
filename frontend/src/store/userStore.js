import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useUserStore = create((set) => ({
  user: null,
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
}));
