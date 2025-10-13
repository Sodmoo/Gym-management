import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const usePlanStore = create((set) => ({
  // State
  plans: [],
  isLoading: false,
  // Plan CRUD
  getPlans: async (trainerId) => {
    if (!trainerId) return; // <-- guard
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/trainers/getPlanT/${trainerId}`);
      // backend returns { plans: [...] } so extract .plans
      set({ plans: res.data.plans || [], isLoading: false });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },
  createPlan: async (data) => {
    const res = await axiosInstance.post("/trainers/createPlan", data);
    // backend returns { message, plan, days }
    set((state) => ({
      plans: [...state.plans, res.data.plan],
    }));
  },
  updatePlan: async (id, data) => {
    const res = await axiosInstance.put(`/trainers/editPlan/${id}`, data);
    // backend returns { message, plan }
    set((state) => ({
      plans: state.plans.map((p) => (p._id === id ? res.data.plan : p)),
    }));
  },
  deletePlan: async (id) => {
    await axiosInstance.delete(`/trainers/deletePlan/${id}`);
    set((state) => ({
      plans: state.plans.filter((p) => p._id !== id),
    }));
  },
}));
