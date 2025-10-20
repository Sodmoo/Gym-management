import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

const calculateProgress = (goal) => {
  const { goalType, currentValue, targetValue } = goal;
  if (
    currentValue === undefined ||
    targetValue === undefined ||
    targetValue === 0
  )
    return 0;

  let progress = 0;
  switch (goalType) {
    case "weight":
    case "bodyFat": // Assume loss (higher current → lower progress)
      if (currentValue > targetValue) {
        const distanceToTarget = currentValue - targetValue;
        progress = Math.min(
          100,
          Math.max(0, 100 - (distanceToTarget / (currentValue * 0.2)) * 100)
        ); // Tuned for ~83% at 174/171
      } else {
        progress = 100;
      }
      break;
    case "muscleMass":
    case "strength": // Assume gain
      progress = Math.min(100, Math.max(0, (currentValue / targetValue) * 100));
      break;
    default:
      progress = 0;
  }
  return Math.round(progress);
};

const calculateStatus = (progress) => {
  return progress >= 83 ? "On Track" : "Overdue";
};

export const useGoalsMeasurementsStore = create((set, get) => ({
  isLoading: false,
  measurements: [],
  goals: [],
  currentMeasurement: null,
  currentGoal: null,

  setMeasurements: (measurements) => set({ measurements }),
  setGoals: (goals) => set({ goals }),

  getMeasurements: async (memberId = null) => {
    set({ isLoading: true });
    try {
      const url = `/trainers/getMeasurement/${memberId}`;
      const res = await axiosInstance.get(url);
      const data = res.data?.data ?? res.data;
      set({ measurements: data || [] });
      return data || [];
    } catch (error) {
      console.error("Error fetching measurements:", error);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  getMeasurementById: async (id) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/trainers/getMeasurement/${id}`);
      const data = res.data?.data ?? res.data;
      set({ currentMeasurement: data || null });
      set((state) => ({
        measurements: state.measurements.map((m) =>
          String(m._id) === String(id) ? { ...m, ...(data || {}) } : m
        ),
      }));
      return data || null;
    } catch (error) {
      console.error("Error fetching measurement:", error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  addMeasurement: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/trainers/addMeasurement", data);
      const created = res.data?.data ?? res.data;
      const memberId = data.member;
      if (memberId) {
        await get().getMeasurements(memberId);
        await get().getGoals(memberId);
      } else {
        // refresh all measurements if memberId not provided
        await get().getMeasurements();
      }
      return created || null;
    } catch (error) {
      console.error("Error adding measurement:", error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  editMeasurement: async (id, data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.put(
        `/trainers/updateMeasurement/${id}`,
        data
      );
      const updated = res.data?.data ?? res.data;
      const memberId = data.member || get().currentMeasurement?.member;
      if (memberId) {
        await get().getMeasurements(memberId);
        await get().getGoals(memberId);
      } else {
        // update local array if member unknown
        set((state) => ({
          measurements: state.measurements.map((m) =>
            String(m._id) === String(id) ? { ...m, ...(updated || {}) } : m
          ),
        }));
        set({ currentMeasurement: updated || null });
      }
      return updated || null;
    } catch (error) {
      console.error("Error editing measurement:", error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteMeasurement: async (id) => {
    set({ isLoading: true });
    try {
      await axiosInstance.delete(`/trainers/deleteMeasurement/${id}`);
      const measurement = get().measurements.find(
        (m) => String(m._id) === String(id)
      );
      if (measurement?.member) {
        await get().getMeasurements(measurement.member);
      } else {
        // remove locally if member unknown
        set((state) => ({
          measurements: state.measurements.filter(
            (m) => String(m._id) !== String(id)
          ),
        }));
      }
      return true;
    } catch (error) {
      console.error("Error deleting measurement:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // member-scoped goals (existing)
  getGoals: async (memberId) => {
    set({ isLoading: true });
    try {
      const url = memberId
        ? `/trainers/getGoals/${memberId}`
        : "/trainers/getGoals";
      const res = await axiosInstance.get(url);
      const data = res.data?.data ?? res.data;
      const goalsWithExtras = (data || []).map((goal) => ({
        ...goal,
        progress: calculateProgress(goal),
        status: calculateStatus(calculateProgress(goal)),
      }));
      set({ goals: goalsWithExtras });
      return goalsWithExtras;
    } catch (error) {
      console.error("Error fetching goals:", error);
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  addGoal: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/trainers/addGoal", data);
      const created = res.data?.data ?? res.data;
      const memberId = data.member;
      if (memberId) {
        await get().getGoals(memberId); // Refetches with calc
      } else {
        // refresh all goals if memberId not provided
        await get().getGoals();
      }
      // Set as current if needed
      if (created) {
        set({
          currentGoal: {
            ...created,
            progress: calculateProgress(created),
            status: calculateStatus(calculateProgress(created)),
          },
        });
      }
      return created || null;
    } catch (error) {
      console.error("Error adding goal:", error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  editGoal: async (id, data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.put(`/trainers/updateGoal/${id}`, data);
      const updated = res.data?.data ?? res.data;
      const memberId = data.member || get().currentGoal?.member;
      if (memberId) {
        await get().getGoals(memberId); // Refetches with calc
      } else {
        const updatedWithExtras = {
          ...updated,
          progress: calculateProgress({ ...updated, ...data }),
          status: calculateStatus(calculateProgress({ ...updated, ...data })),
        };
        set((state) => ({
          goals: state.goals.map((g) =>
            String(g._id) === String(id) ? updatedWithExtras : g
          ),
        }));
        set({ currentGoal: updatedWithExtras });
      }
      return updated || null;
    } catch (error) {
      console.error("Error editing goal:", error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteGoal: async (id) => {
    set({ isLoading: true });
    try {
      await axiosInstance.delete(`/deleteGoal/${id}`);
      const goal = get().goals.find((g) => String(g._id) === String(id));
      if (goal?.member) {
        await get().getGoals(goal.member);
      } else {
        set((state) => ({
          goals: state.goals.filter((g) => String(g._id) !== String(id)),
        }));
      }
      return true;
    } catch (error) {
      console.error("Error deleting goal:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
