import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useEquipmentStore = create((set) => ({
  isLoading: false,
  equipment: [],

  // setter
  setEquipment: (equipment) => set({ equipment }),

  // fetch all equipment
  getAllEquipment: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/equipment");
      set({ equipment: res.data });
      return true;
    } catch (error) {
      console.error("Error fetching equipment:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // add new equipment
  addEquipment: async (newEquip) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/equipment", newEquip);
      console.log("Equipment added:", res.data);
      await useEquipmentStore.getState().getAllEquipment();
      return true;
    } catch (error) {
      console.error("Error adding equipment:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // update equipment
  updateEquipment: async (id, updatedData) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.put(`/equipment/${id}`, updatedData);
      console.log("Equipment updated:", res.data);
      await useEquipmentStore.getState().getAllEquipment();
      return true;
    } catch (error) {
      console.error("Error updating equipment:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // delete equipment
  deleteEquipment: async (id) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.delete(`/equipment/${id}`);
      console.log("Equipment deleted:", res.data);
      await useEquipmentStore.getState().getAllEquipment();
      return true;
    } catch (error) {
      console.error("Error deleting equipment:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
