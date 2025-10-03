import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useTrainerStore = create((set, get) => ({
  isLoading: false,
  trainers: [],
  setTrainers: (trainers) => set({ trainers }),

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

  Trainers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.get("/trainers/trainers"); // GET trainers API
      set({ trainers: res.data });
    } catch (err) {
      console.error("Error fetching trainers:", err);
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  confirmTrainer: async (trainerId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.put(
        `/trainers/trainer_confirm/${trainerId}`
      );
      console.log("Trainer confirmed:", res.data);
      await get().getAllTrainers();
      return true;
    } catch (error) {
      console.error("Error confirming trainer:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  rejectTrainer: async (trainerId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.put(
        `/trainers/trainer_reject/${trainerId}`
      );
      console.log("Trainer rejected:", res.data);
      await get().getAllTrainers();
      return true;
    } catch (error) {
      console.error("Error rejecting trainer:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  assignStudent: async (trainerId, memberId) => {
    try {
      const res = await axiosInstance.post("/trainers/assign-student", {
        trainerId,
        memberId,
      });

      if (res.status === 200) {
        // Fetch latest trainer data from backend
        await get().getTrainerById(trainerId);
      }

      return true;
    } catch (error) {
      console.error("Error assigning student:", error);
      return false;
    }
  },

  removeStudent: async (trainerId, memberId) => {
    try {
      const res = await axiosInstance.post("/trainers/remove-student", {
        trainerId,
        memberId,
      });

      if (res.status === 200) {
        // Fetch latest trainer data from backend
        await get().getTrainerById(trainerId);
      }

      return true;
    } catch (error) {
      console.error("Error removing student:", error);
      return false;
    }
  },

  getTrainerById: async (trainerId) => {
    try {
      const res = await axiosInstance.get(`/trainers/trainer/${trainerId}`);
      set((state) => ({
        trainers: state.trainers.map((t) =>
          t.trainerId === trainerId ? { ...t, ...res.data } : t
        ),
      }));
      return true;
    } catch (error) {
      console.error("Error fetching trainer:", error);
      return false;
    }
  },
}));
