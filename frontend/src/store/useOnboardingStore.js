import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useOnboardingStore = create((set) => ({
  step: 1,
  role: "",
  data: {
    age: "",
    address: "",
    height: "",
    weight: "",
    goal: "",
    phone: "",
    avatar: null,
    experience: "",
    specialization: "",
    certifications: "",
  },
  nextStep: (role) =>
    set((state) => {
      if (role === "trainer" && state.step === 3) {
        return { step: 5 }; // Trainer Step3 → Step5
      }
      if (state.step === 5 || (state.step === 3 && role === "user")) {
        return { step: 4 }; // User Step3 → Step4, Trainer Step5 → Step4
      }
      return { step: state.step + 1 };
    }),

  prevStep: () =>
    set((state) => ({ step: state.step > 1 ? state.step - 1 : 1 })),
  updateData: (newData) =>
    set((state) => ({ data: { ...state.data, ...newData } })),
  updateProfile: async (formData) => {
    try {
      const res = await axiosInstance.put("/auth/complateprofile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      if (error.response) console.error("Error:", error.response.data);
      else if (error.request) console.error("No response:", error.request);
      else console.error("Request setup error:", error.message);
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
        experience: "",
        specialization: "",
        certifications: "",
      },
    }),
}));
