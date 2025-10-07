// store/templateStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useTemplateStore = create((set) => ({
  // State
  workoutTemplates: [],
  dietTemplates: [],
  isLoadingWorkout: false,
  isLoadingDiet: false,

  // WorkoutTemplate CRUD
  getWorkoutTemplates: async (trainerId) => {
    if (!trainerId) return; // <-- guard
    set({ isLoadingWorkout: true });
    try {
      const res = await axiosInstance.get(
        `/trainers/workout-templates/${trainerId}`
      );
      set({ workoutTemplates: res.data, isLoadingWorkout: false });
    } catch (err) {
      console.error(err);
      set({ isLoadingWorkout: false });
    }
  },

  createWorkoutTemplate: async (data) => {
    const res = await axiosInstance.post(
      "/trainers/createTemplate-workout",
      data
    );
    set((state) => ({
      workoutTemplates: [...state.workoutTemplates, res.data.data],
    }));
  },

  updateWorkoutTemplate: async (id, data) => {
    const res = await axiosInstance.put(
      `/trainers/updatetemplate-workout/${id}`,
      data
    );
    set((state) => ({
      workoutTemplates: state.workoutTemplates.map((t) =>
        t._id === id ? res.data.data : t
      ),
    }));
  },

  deleteWorkoutTemplate: async (id) => {
    await axiosInstance.delete(`/trainers/deletetemplate-workout/${id}`);
    set((state) => ({
      workoutTemplates: state.workoutTemplates.filter((t) => t._id !== id),
    }));
  },

  // DietTemplate CRUD
  getDietTemplates: async (trainerId) => {
    if (!trainerId) return; // <-- guard
    set({ isLoadingDiet: true });
    try {
      const res = await axiosInstance.get(
        `/trainers/diet-templates/${trainerId}`
      );
      set({ dietTemplates: res.data, isLoadingDiet: false });
    } catch (err) {
      console.error(err);
      set({ isLoadingDiet: false });
    }
  },

  createDietTemplate: async (data) => {
    const res = await axiosInstance.post("/trainers/createTemplate-diet", data);
    set((state) => ({
      dietTemplates: [...state.dietTemplates, res.data.data],
    }));
  },

  updateDietTemplate: async (id, data) => {
    const res = await axiosInstance.put(
      `/trainers/updatetemplate-diet/${id}`,
      data
    );
    set((state) => ({
      dietTemplates: state.dietTemplates.map((t) =>
        t._id === id ? res.data.data : t
      ),
    }));
  },

  deleteDietTemplate: async (id) => {
    await axiosInstance.delete(`/trainers/deletetemplate-diet/${id}`);
    set((state) => ({
      dietTemplates: state.dietTemplates.filter((t) => t._id !== id),
    }));
  },
}));
