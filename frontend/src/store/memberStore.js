import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useMemberStore = create((set, get) => ({
  isLoading: false,
  members: [],
  fetchMember: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get(
        "http://localhost:5000/api/members/me",
        {
          withCredentials: true,
        }
      );
      set({ member: res.data, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch member:", err);
      set({
        error: err.response?.data?.message || "Error fetching member",
        isLoading: false,
      });
    }
  },

  // бүх members татах
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

  // Шинэ subgoal нэмэх
  addSubGoal: async (memberId, newGoal) => {
    try {
      const res = await axiosInstance.post(
        `/members/${memberId}/subgoals`,
        newGoal
      );

      if (res?.data?.subGoals) {
        // сервер бүх subGoals массив буцаавал state update
        set((state) => ({
          members: state.members.map((m) =>
            m._id === memberId ? { ...m, subGoals: res.data.subGoals } : m
          ),
        }));
        return;
      }

      if (res?.data?.subGoal) {
        // сервер зөвхөн шинэ subGoal буцаавал append
        set((state) => ({
          members: state.members.map((m) =>
            m._id === memberId
              ? { ...m, subGoals: [...(m.subGoals || []), res.data.subGoal] }
              : m
          ),
        }));
        return;
      }

      // ямар ч data ирээгүй бол fallback refetch
      await get().getAllMembers();
    } catch (err) {
      console.error("Error adding subgoal:", err);
      await get().getAllMembers(); // алдаа гарсан үед state сэргээх
    }
  },

  // Progress update хийх
  updateSubGoal: async (memberId, subGoalId, newProgress) => {
    if (!subGoalId) {
      console.warn("updateSubGoal called without subGoalId, refetching...");
      await get().getAllMembers();
      return;
    }

    try {
      const res = await axiosInstance.put(
        `/members/${memberId}/subgoals/${subGoalId}/progress`,
        { progress: newProgress }
      );

      if (res?.data?.subGoals) {
        set((state) => ({
          members: state.members.map((m) =>
            m._id === memberId ? { ...m, subGoals: res.data.subGoals } : m
          ),
        }));
      } else {
        await get().getAllMembers();
      }
    } catch (err) {
      console.error("Error updating subgoal:", err);
      await get().getAllMembers();
    }
  },

  // Subgoal устгах
  deleteSubGoal: async (memberId, subGoalId) => {
    if (!subGoalId) return;

    try {
      const res = await axiosInstance.delete(
        `/members/${memberId}/subgoals/${subGoalId}/delete`
      );

      if (res?.data?.subGoals) {
        set((state) => ({
          members: state.members.map((m) =>
            m._id === memberId ? { ...m, subGoals: res.data.subGoals } : m
          ),
        }));
      } else {
        await get().getAllMembers();
      }
    } catch (err) {
      console.error("Error deleting subgoal:", err);
      await get().getAllMembers();
    }
  },

  joinTrainer: async (trainerId, memberId) => {
    try {
      const res = await axiosInstance.post("/members/joinTrainer", {
        trainerId,
        memberId,
      });
      set({
        trainers: get().trainers.map((t) =>
          t.trainerId === trainerId ? { ...t, joined: true } : t
        ),
      });

      return res.data;
    } catch (error) {
      console.error("Error joining trainer:", error);
      throw error;
    }
  },
}));
