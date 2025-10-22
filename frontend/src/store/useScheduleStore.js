import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useScheduleStore = create((set, get) => ({
  schedules: [],
  todaySchedules: [],
  isLoading: false,
  createSchedule: async (scheduleData) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/schedules/create", scheduleData);
      toast.success("Schedule амжилттай үүсгэлээ", {
        position: "top-center",
      });
      // Optionally refetch schedules after creation
      get().getAllSchedules();
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Алдаа гарлаа", {
        position: "top-center",
      });
      console.error("Error creating schedule:", error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  getAllSchedules: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/getAllSchedules");
      set({ schedules: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching all schedules:", error);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  getSchedulesByTrainer: async (trainerId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/schedules/${trainerId}`);
      set({ schedules: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching trainer schedules:", error);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  getTodaySchedules: async (trainerId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(
        `/schedules/trainer/${trainerId}/today`
      );
      set({ todaySchedules: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching today's schedules:", error);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  markScheduleComplete: async (id) => {
    set({ isLoading: true });
    try {
      // FIXED: Use a dedicated endpoint if markScheduleComplete is routed separately; assuming /schedules/${id}/complete for PUT
      // If it's the same as update, keep as is; adjust route as per your backend routes
      const res = await axiosInstance.put(`/schedules/${id}/complete`, {
        isCompleted: true,
      });
      toast.success("Schedule амжилттай дуусгалаа", {
        position: "top-center",
      });
      // Refetch to update the list
      const currentSchedules = get().schedules;
      set({
        schedules: currentSchedules.map((sch) =>
          sch._id === id ? res.data : sch
        ),
      });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Алдаа гарлаа", {
        position: "top-center",
      });
      console.error("Error marking schedule complete:", error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  updateSchedule: async (id, scheduleData) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.put(`/schedules/${id}`, scheduleData);
      toast.success("Schedule амжилттай шинэчиллээ", {
        position: "top-center",
      });
      // Refetch or update in state
      const currentSchedules = get().schedules;
      set({
        schedules: currentSchedules.map((sch) =>
          sch._id === id ? res.data : sch
        ),
      });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Алдаа гарлаа", {
        position: "top-center",
      });
      console.error("Error updating schedule:", error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  deleteSchedule: async (id) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.delete(`/schedules/${id}`);
      if (res.status === 200) {
        toast.success("Schedule амжилттай устгалаа", {
          position: "top-center",
        });
        // Update state by filtering out the deleted one
        const currentSchedules = get().schedules;
        set({
          schedules: currentSchedules.filter((sch) => sch._id !== id),
        });
      }
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Алдаа гарлаа", {
        position: "top-center",
      });
      console.error("Error deleting schedule:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  clearSchedules: () => set({ schedules: [], todaySchedules: [] }),
}));
