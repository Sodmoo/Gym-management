import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useTrainerStore = create((set) => ({
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
  confirmTrainer: async (trainerId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.put(
        `/users/trainer_confirm/${trainerId}`
      );
      console.log("Trainer confirmed:", res.data);
      await useTrainerStore.getState().getAllTrainers();
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
      const res = await axiosInstance.put(`/users/trainer_reject/${trainerId}`);
      console.log("Trainer rejected:", res.data);
      await useTrainerStore.getState().getAllTrainers();
      return true;
    } catch (error) {
      console.error("Error confirming trainer:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  assignStudent: async (trainerId, memberId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/trainers/assign-student", {
        trainerId,
        memberId, // <-- FIXED: use memberId instead of studentId
      });
      if (res.status === 200) {
        console.log("Student assigned to trainer:", res.data);
      }
      await useTrainerStore.getState().getAllTrainers();
      return true;
    } catch (error) {
      console.error("Error assigning student:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  removeStudent: async (trainerId, memberId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/trainers/remove-student", {
        trainerId,
        memberId,
      });
      console.log("Student removed from trainer:", res.data);
      await useTrainerStore.getState().getAllTrainers();
      return true;
    } catch (error) {
      console.error("Error removing student:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
