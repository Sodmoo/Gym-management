// store/membershipTypeStore.js
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useMembershipTypeStore = create((set) => ({
  isLoading: false,
  types: [],

  // setter
  setTypes: (types) => set({ types }),

  // fetch all membership types
  getAllTypes: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/membership-types");
      set({ types: res.data }); // API array буцаах ёстой
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Төрөл татахад алдаа гарлаа",
        {
          position: "top-center",
        }
      );
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // add new membership type
  addType: async (newType) => {
    set({ isLoading: true });
    try {
      await axiosInstance.post("/membership-types", newType);
      toast.success("Төрөл амжилттай нэмэгдлээ", {
        position: "top-center",
      });
      await useMembershipTypeStore.getState().getAllTypes(); // refresh
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Төрөл нэмэхэд алдаа гарлаа",
        {
          position: "top-center",
        }
      );
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // update membership type
  updateType: async (id, updatedData) => {
    set({ isLoading: true });
    try {
      await axiosInstance.put(`/membership-types/${id}`, updatedData);
      toast.success("Төрөл амжилттай засагдлаа", {
        position: "top-center",
      });
      await useMembershipTypeStore.getState().getAllTypes(); // refresh
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Төрөл засахад алдаа гарлаа",
        {
          position: "top-center",
        }
      );
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // delete membership type
  deleteType: async (id) => {
    set({ isLoading: true });
    try {
      await axiosInstance.delete(`/membership-types/${id}`);
      toast.success("Төрөл амжилттай устгалаа", {
        position: "top-center",
      });
      await useMembershipTypeStore.getState().getAllTypes(); // refresh
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Төрөл устгахад алдаа гарлаа",
        {
          position: "top-center",
        }
      );
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
