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
  addSubGoal: async (memberId, newGoal) => {
    try {
      const res = await axiosInstance.post(
        `/members/${memberId}/subgoals`,
        newGoal
      );
      // update local state
      set((state) => ({
        members: state.members.map((m) =>
          m._id === memberId ? { ...m, subGoals: res.data.subGoals } : m
        ),
      }));
    } catch (err) {
      console.error("Error adding subgoal:", err);
    }
  },

  updateSubGoal: async (memberId, subGoalId, newProgress) => {
    try {
      const res = await axiosInstance.patch(
        `/members/${memberId}/subgoals/${subGoalId}`,
        { progress: newProgress }
      );
      set((state) => ({
        members: state.members.map((m) =>
          m._id === memberId ? { ...m, subGoals: res.data.subGoals } : m
        ),
      }));
    } catch (err) {
      console.error("Error updating subgoal:", err);
    }
  },

  deleteSubGoal: async (memberId, subGoalId) => {
    try {
      const res = await axiosInstance.delete(
        `/members/${memberId}/subgoals/${subGoalId}`
      );
      set((state) => ({
        members: state.members.map((m) =>
          m._id === memberId ? { ...m, subGoals: res.data.subGoals } : m
        ),
      }));
    } catch (err) {
      console.error("Error deleting subgoal:", err);
    }
  },
}));
