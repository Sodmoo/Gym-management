import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useOnboardingStore = create((set) => ({
  step: 1,
  data: {
    age: "",
    address: "",
    height: "",
    weight: "",
    goal: "",
    phone: "",
    avatar: null,
  },
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: state.step - 1 })),
  updateData: (newData) =>
    set((state) => ({
      data: { ...state.data, ...newData },
    })),
  updateProfile: async (formData) => {
    try {
      const res = await axiosInstance.put("/auth/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (error) {
      // Log the full error response for debugging
      if (error.response) {
        console.error("Error updating profile:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      return false;
    }
  },
  reset: () =>
    set({
      step: 1,
      data: {
        age: "",
        address: "",
        height: "",
        weight: "",
        goal: "",
        phone: "",
        avatar: null,
      },
    }),
}));
