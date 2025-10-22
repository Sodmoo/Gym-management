// pages/SchedulesPage.jsx (Main container)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useScheduleStore } from "../../../store/useScheduleStore";
import { useUserStore } from "../../../store/userStore";
import { usePlanStore } from "../../../store/planStore";
import { useTemplateStore } from "../../../store/TemplateStore";
import { useTrainerStore } from "../../../store/trainerStore";
import {
  Calendar,
  FileText,
  Clock,
  Users,
  Dumbbell,
  Ruler,
} from "lucide-react";
import SchedulesHeader from "../../../components/Schedule/SchedulesHeader";
import SearchAndFilters from "../../../components/Schedule/SearchAndFilters";
import DashboardStats from "../../../components/Schedule/DashboardStats";
import WeeklyCalendar from "../../../components/Schedule/WeeklyCalendar";
import TodaysAgenda from "../../../components/Schedule/TodaysAgenda";
import AllSchedulesList from "../../../components/Schedule/AllSchedulesList";
import ScheduleDetailsSidebar from "../../../components/Schedule/ScheduleDetailsSidebar";
import ScheduleModal from "../../../components/Schedule/ScheduleModal";

// Native date helpers (to avoid date-fns dependency)
const formatDate = (date, formatStr) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  if (formatStr === "PPP") return `${month}/${day}/${year}`;
  if (formatStr === "EEE d")
    return `${d.toLocaleDateString("en-US", { weekday: "short" })} ${day}`;
  if (formatStr === "MMM do")
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (formatStr === "MMM do, yyyy")
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  if (formatStr === "HH:mm") return `${hours}:${minutes}`;
  return d.toLocaleDateString("en-US");
};

const isToday = (date) => {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Week starts on Monday
  d.setDate(diff);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const eachDayOfInterval = (start, end) => {
  const days = [];
  let current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

const getEventColor = (type) => {
  switch (type) {
    case "workout":
      return "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-200/50";
    case "meeting":
      return "bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-200/50";
    case "measurement":
      return "bg-gradient-to-r from-purple-500 to-purple-600 border-purple-200/50";
    default:
      return "bg-gradient-to-r from-gray-500 to-gray-600 border-gray-200/50";
  }
};

const getEventIcon = (type) => {
  switch (type) {
    case "workout":
      return Dumbbell;
    case "meeting":
      return Users;
    case "measurement":
      return Ruler;
    default:
      return Clock;
  }
};

const getDefaultTimes = (schedule) => {
  return {
    startTime: schedule.startTime || "09:00",
    endTime: schedule.endTime || "10:00",
  };
};

const getMemberDisplayName = (member) =>
  member?.userId?.username || member?.name || member?._id || "Unknown Member";
const getPlanDisplayName = (plan) => plan?.title || plan?._id || "Unknown Plan";
const getTemplateDisplayName = (template) =>
  template?.title || template?._id || "Unknown Template";

const SchedulesPage = () => {
  const [modal, setModal] = useState({
    open: false,
    schedule: null,
    mode: "create",
  });
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useUserStore();
  const trainerId = user?._id;

  const {
    schedules,
    todaySchedules,
    isLoading,
    createSchedule,
    getSchedulesByTrainer,
    getTodaySchedules,
    markScheduleComplete,
    updateSchedule,
    deleteSchedule,
  } = useScheduleStore();

  const { plans: trainerPlans, getPlans } = usePlanStore();
  const { workoutTemplates: allWorkoutTemplates, getWorkoutTemplates } =
    useTemplateStore();
  const { currentTrainer, getTrainerById } = useTrainerStore();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ type: "all", status: "all" });

  // Drag and Drop States
  const [draggedSchedule, setDraggedSchedule] = useState(null);

  useEffect(() => {
    if (trainerId) {
      Promise.all([
        getSchedulesByTrainer(trainerId),
        getTodaySchedules(trainerId),
        getPlans(trainerId),
        getWorkoutTemplates(trainerId),
        getTrainerById(trainerId),
      ]).catch(console.error);
    }
  }, [
    getSchedulesByTrainer,
    getTodaySchedules,
    getPlans,
    getWorkoutTemplates,
    getTrainerById,
    trainerId,
  ]);

  // Refetch function to update data without page reload
  const refetchSchedules = useCallback(() => {
    if (trainerId) {
      getSchedulesByTrainer(trainerId);
      getTodaySchedules(trainerId);
    }
  }, [trainerId, getSchedulesByTrainer, getTodaySchedules]);

  // Assigned members from currentTrainer.students
  const assignedMembers = useMemo(() => {
    return (currentTrainer?.students || []).sort((a, b) =>
      (a.userId?.username || a.name || a._id || "").localeCompare(
        b.userId?.username || b.name || b._id || ""
      )
    );
  }, [currentTrainer]);

  // Member map for quick lookup using assigned members
  const memberMap = useMemo(() => {
    const map = new Map();
    assignedMembers.forEach((member) => {
      map.set(member._id, getMemberDisplayName(member));
    });
    return map;
  }, [assignedMembers]);

  // Enhance schedules with memberName
  const enhancedSchedules = useMemo(() => {
    return schedules.map((schedule) => {
      const memberId = schedule.memberId?._id || schedule.memberId;
      let memberName;
      if (typeof memberId === "object") {
        memberName = getMemberDisplayName(memberId);
      } else {
        memberName = memberMap.get(memberId) || memberId;
      }
      return {
        ...schedule,
        memberName,
      };
    });
  }, [schedules, memberMap]);

  // Enhance todaySchedules with memberName
  const enhancedTodaySchedules = useMemo(() => {
    return todaySchedules.map((schedule) => {
      const memberId = schedule.memberId?._id || schedule.memberId;
      let memberName;
      if (typeof memberId === "object") {
        memberName = getMemberDisplayName(memberId);
      } else {
        memberName = memberMap.get(memberId) || memberId;
      }
      return {
        ...schedule,
        memberName,
      };
    });
  }, [todaySchedules, memberMap]);

  // Filtered Schedules (for lists and calendar)
  const filteredSchedules = useMemo(() => {
    return enhancedSchedules.filter((schedule) => {
      const matchesSearch = (schedule.memberName || schedule.note || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType =
        filters.type === "all" || schedule.type === filters.type;
      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "completed"
          ? schedule.isCompleted
          : !schedule.isCompleted);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [enhancedSchedules, searchQuery, filters]);

  // Filtered schedules for calendar
  const allSchedulesForCalendar = useMemo(
    () => filteredSchedules,
    [filteredSchedules]
  );

  // All plans from store
  const plans = useMemo(() => {
    return trainerPlans.sort((a, b) =>
      (a.title || a._id || "").localeCompare(b.title || b._id || "")
    );
  }, [trainerPlans]);

  // All workout templates from store
  const workoutTemplates = useMemo(() => {
    return allWorkoutTemplates.sort((a, b) =>
      (a.title || a._id || "").localeCompare(b.title || b._id || "")
    );
  }, [allWorkoutTemplates]);

  const [formData, setFormData] = useState({
    memberId: "",
    planId: "",
    date: new Date().toISOString().split("T")[0],
    type: "workout",
    workoutTemplateId: "",
    startTime: "09:00",
    endTime: "10:00",
    note: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type" && value !== "workout") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        planId: "",
        workoutTemplateId: "",
        memberId: "", // Reset member if type changes to non-workout
      }));
    } else if (name === "planId" && formData.type === "workout") {
      const selectedPlan = plans.find((p) => p._id === value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        workoutTemplateId: selectedPlan?.workoutTemplate?._id || "",
        memberId:
          selectedPlan?.memberId?._id ||
          selectedPlan?.memberId ||
          prev.memberId, // Auto-set member from plan, but keep existing if already set
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trainerId) {
      console.error("Trainer ID not available; cannot submit schedule");
      return;
    }
    let dataToSend = { ...formData, trainerId };
    if (formData.type !== "workout") {
      dataToSend = {
        ...dataToSend,
        planId: null,
        workoutTemplateId: null,
      };
    }
    try {
      if (modal.mode === "edit") {
        await updateSchedule(modal.schedule._id, dataToSend);
      } else {
        await createSchedule(dataToSend);
      }
      // Refetch to ensure UI updates without reload
      refetchSchedules();
    } catch (error) {
      console.error("Error in schedule operation:", error);
    }
    closeModal();
    resetForm();
  };

  const openCreateModal = () => {
    setModal({ open: true, schedule: null, mode: "create" });
    resetForm();
  };

  const openEditModal = (schedule) => {
    setModal({ open: true, schedule, mode: "edit" });
    setFormData({
      memberId: schedule.memberId?._id || schedule.memberId || "",
      planId: schedule.planId?._id || schedule.planId || "",
      date: new Date(schedule.date).toISOString().split("T")[0],
      type: schedule.type || "workout",
      workoutTemplateId:
        schedule.workoutTemplateId?._id || schedule.workoutTemplateId || "",
      startTime: schedule.startTime || "09:00",
      endTime: schedule.endTime || "10:00",
      note: schedule.note || "",
    });
  };

  const closeModal = () => {
    setModal({ open: false, schedule: null, mode: "create" });
  };

  const resetForm = () => {
    setFormData({
      memberId: "",
      planId: "",
      date: new Date().toISOString().split("T")[0],
      type: "workout",
      workoutTemplateId: "",
      startTime: "09:00",
      endTime: "10:00",
      note: "",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      try {
        await deleteSchedule(id);
        // Refetch to ensure UI updates without reload
        refetchSchedules();
      } catch (error) {
        console.error("Error deleting schedule:", error);
      }
    }
    setIsSidebarOpen(false);
    setSelectedSchedule(null);
  };

  const handleMarkComplete = async (id) => {
    try {
      await markScheduleComplete(id);
      // Refetch to ensure UI updates without reload
      refetchSchedules();
    } catch (error) {
      console.error("Error marking schedule complete:", error);
    }
    setIsSidebarOpen(false);
    setSelectedSchedule(null);
  };

  const handleScheduleClick = (schedule) => {
    setSelectedSchedule(schedule);
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedSchedule(null);
  };

  // Calendar constants - 6AM to 8PM
  const START_HOUR = 6;
  const END_HOUR = 20;
  const HOUR_HEIGHT = 45;
  const TOTAL_HOURS = END_HOUR - START_HOUR + 1;
  const TOTAL_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;
  const HEADER_HEIGHT = 70;

  // Updated time label format
  const formatTimeLabel = (hour) => {
    let displayHour = hour % 12;
    if (displayHour === 0) displayHour = 12;
    const period = hour >= 12 ? "PM" : "AM";
    return `${displayHour} ${period}`;
  };

  // Native Drag and Drop Handlers
  const handleDragStart = useCallback((e, schedule) => {
    setDraggedSchedule(schedule);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const calculateTop = useCallback(
    (startTime) => {
      const [sh, sm] = (startTime || "09:00").split(":").map(Number);
      const startMinutes = sh * 60 + sm;
      const startHourMinutes = START_HOUR * 60;
      const minutesFromStart = startMinutes - startHourMinutes;
      return HEADER_HEIGHT + (minutesFromStart / 60) * HOUR_HEIGHT;
    },
    [START_HOUR, HOUR_HEIGHT, HEADER_HEIGHT]
  );

  const calculateHeight = useCallback(
    (startTime, endTime) => {
      const [sh, sm] = (startTime || "09:00").split(":").map(Number);
      const [eh, em] = (endTime || "10:00").split(":").map(Number);
      const durationMin = eh * 60 + em - (sh * 60 + sm);
      return Math.max(44, (durationMin / 60) * HOUR_HEIGHT);
    },
    [HOUR_HEIGHT]
  );

  const handleDrop = useCallback(
    async (e, targetDay) => {
      e.preventDefault();
      if (!draggedSchedule || !targetDay) return;

      const newDate = targetDay.toISOString().split("T")[0];

      const updatedData = {
        ...draggedSchedule,
        date: newDate,
      };

      try {
        await updateSchedule(draggedSchedule._id, updatedData);
        // Refetch to ensure UI updates without reload
        refetchSchedules();
      } catch (error) {
        console.error("Error updating schedule:", error);
      }
      setDraggedSchedule(null);
    },
    [draggedSchedule, updateSchedule, refetchSchedules]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  // Weekly Calendar Logic
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date())
  );
  const weekDays = eachDayOfInterval(
    currentWeekStart,
    addDays(currentWeekStart, 6)
  );

  const getSchedulesForDay = useCallback(
    (day) => {
      return allSchedulesForCalendar
        .filter((s) => new Date(s.date).toDateString() === day.toDateString())
        .sort((a, b) => {
          const aTime = a.startTime || "09:00";
          const bTime = b.startTime || "09:00";
          return (
            new Date(`1970/01/01 ${aTime}`) - new Date(`1970/01/01 ${bTime}`)
          );
        });
    },
    [allSchedulesForCalendar]
  );

  const navigateWeek = (direction) => {
    setCurrentWeekStart(
      addDays(currentWeekStart, direction === "next" ? 7 : -7)
    );
  };

  // Dashboard Stats
  const todayCount = enhancedTodaySchedules.length;
  const totalCount = schedules.length;
  const completedToday = enhancedTodaySchedules.filter(
    (s) => s.isCompleted
  ).length;

  // Mobile check (simple, or use useMediaQuery hook)
  const isMobile = window.innerWidth < 768;

  if (!trainerId) {
    return (
      <div
        className="flex justify-center items-center h-screen bg-gray-50"
        role="status"
        aria-live="polite"
      >
        <div className="text-xl text-gray-500 flex items-center space-x-2">
          <FileText className="w-5 h-5" aria-hidden="true" />
          <span>Loading user data...</span>
        </div>
      </div>
    );
  }

  if (isLoading || !currentTrainer) {
    return (
      <div
        className="flex justify-center items-center h-screen bg-gray-50"
        role="status"
        aria-live="polite"
      >
        <div className="text-xl text-gray-600 flex items-center space-x-2">
          <Calendar className="w-5 h-5 animate-spin" aria-hidden="true" />
          <span>Loading schedules...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyan-50 rounded-md">
      <SchedulesHeader onCreateSchedule={openCreateModal} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <DashboardStats
          todayCount={todayCount}
          totalCount={totalCount}
          completedToday={completedToday}
        />
        <SearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={() => {
            setSearchQuery("");
            setFilters({ type: "all", status: "all" });
          }}
        />
        <WeeklyCalendar
          weekDays={weekDays}
          currentWeekStart={currentWeekStart}
          formatDate={formatDate}
          isToday={isToday}
          getSchedulesForDay={getSchedulesForDay}
          onNavigateWeek={navigateWeek}
          isMobile={isMobile}
          START_HOUR={START_HOUR}
          END_HOUR={END_HOUR}
          HOUR_HEIGHT={HOUR_HEIGHT}
          TOTAL_HOURS={TOTAL_HOURS}
          TOTAL_HEIGHT={TOTAL_HEIGHT}
          HEADER_HEIGHT={HEADER_HEIGHT}
          formatTimeLabel={formatTimeLabel}
          calculateTop={calculateTop}
          calculateHeight={calculateHeight}
          getEventColor={getEventColor}
          getEventIcon={getEventIcon}
          getDefaultTimes={getDefaultTimes}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          handleDragStart={handleDragStart}
          onScheduleClick={handleScheduleClick}
          getMemberDisplayName={getMemberDisplayName} // Pass for display in events
        />
        <TodaysAgenda
          todaySchedules={enhancedTodaySchedules}
          formatDate={formatDate}
          getDefaultTimes={getDefaultTimes}
          getEventColor={getEventColor}
          getEventIcon={getEventIcon}
          onScheduleClick={handleScheduleClick}
          onCreateSchedule={openCreateModal}
          getMemberDisplayName={getMemberDisplayName} // Pass for display
        />
        <AllSchedulesList
          filteredSchedules={filteredSchedules}
          formatDate={formatDate}
          getDefaultTimes={getDefaultTimes}
          getEventColor={getEventColor}
          getEventIcon={getEventIcon}
          onScheduleClick={handleScheduleClick}
          onCreateSchedule={openCreateModal}
          getMemberDisplayName={getMemberDisplayName} // Pass for display
        />
      </div>

      {isSidebarOpen && selectedSchedule && (
        <ScheduleDetailsSidebar
          selectedSchedule={selectedSchedule}
          getDefaultTimes={getDefaultTimes}
          formatDate={formatDate}
          getEventColor={getEventColor}
          getEventIcon={getEventIcon}
          onCloseSidebar={closeSidebar}
          onMarkComplete={handleMarkComplete}
          onEditSchedule={openEditModal}
          onDeleteSchedule={handleDelete}
          getMemberDisplayName={getMemberDisplayName} // Ensure passed if needed
        />
      )}

      {modal.open && (
        <ScheduleModal
          modal={modal}
          formData={formData}
          members={assignedMembers}
          plans={plans}
          workoutTemplates={workoutTemplates}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCloseModal={closeModal}
          getMemberDisplayName={getMemberDisplayName}
          getPlanDisplayName={getPlanDisplayName}
          getTemplateDisplayName={getTemplateDisplayName}
        />
      )}
    </div>
  );
};

export default SchedulesPage;
