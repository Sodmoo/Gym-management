import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useMemberStore = create((set) => ({
  isLoading: false,
  members: [],
  getAllMembers: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/members/allmember");
      set({ members: res.data });
      return true;
    } catch (error) {
      console.error("Error fetching all members:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
