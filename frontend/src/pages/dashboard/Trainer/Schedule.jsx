// pages/SchedulesPage.jsx (Main container)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useScheduleStore } from "../../../store/useScheduleStore";
import { useUserStore } from "../../../store/userStore";
import { usePlanStore } from "../../../store/planStore";
import { useTemplateStore } from "../../../store/TemplateStore";
import { useTrainerStore } from "../../../store/trainerStore";
import { useMemberStore } from "../../../store/memberStore"; // Import member store
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
import ScheduleDetailsModal from "../../../components/Schedule/ScheduleDetailsModal";
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
      return "bg-gradient-to-r from-cyan-400 to-cyan-500 border-cyan-200/50";
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

const formatTime = (time) => {
  if (!time) return null;
  if (typeof time === "string") return time;
  const d = new Date(time);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const getDefaultTimes = (schedule) => {
  const start = schedule.formattedStartTime;
  const end = schedule.formattedEndTime;
  if (!start || !end) {
    return { startTime: "Unscheduled", endTime: "" };
  }
  return { startTime: start, endTime: end };
};

// Enhanced display name for little profile (prioritize member.username, prefer name only)
const getMemberDisplayName = (member) => {
  return (
    member?.username ||
    member?.name ||
    member?.userId?.username ||
    member?._id ||
    "Unknown"
  );
};

const getPlanDisplayName = (plan) => plan?.title || plan?._id || "Unknown Plan";
const getTemplateDisplayName = (template) =>
  template?.title || template?._id || "Unknown Template";

const hasTimeOverlap = (newStartStr, newEndStr, existingSchedules) => {
  const [newSH, newSM] = newStartStr.split(":").map(Number);
  const [newEH, newEM] = newEndStr.split(":").map(Number);
  const newStart = new Date(1970, 0, 1, newSH, newSM);
  const newEnd = new Date(1970, 0, 1, newEH, newEM);

  for (let ex of existingSchedules) {
    const exStartStr = ex.formattedStartTime;
    const exEndStr = ex.formattedEndTime;
    if (!exStartStr || !exEndStr) continue;

    const [exSH, exSM] = exStartStr.split(":").map(Number);
    const [exEH, exEM] = exEndStr.split(":").map(Number);
    const exStart = new Date(1970, 0, 1, exSH, exSM);
    const exEnd = new Date(1970, 0, 1, exEH, exEM);

    // Overlap if not (newEnd <= exStart || newStart >= exEnd)
    if (!(newEnd <= exStart || newStart >= exEnd)) {
      return true;
    }
  }
  return false;
};

const SchedulesPage = () => {
  // All states first
  const [modal, setModal] = useState({
    open: false,
    schedule: null,
    mode: "create",
  });
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ type: "all", status: "all" });
  const [draggedSchedule, setDraggedSchedule] = useState(null);
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

  // Use Member Store for all members
  const { members: allMembers, getAllMembers } = useMemberStore();

  // Effects
  useEffect(() => {
    if (trainerId) {
      Promise.all([
        getSchedulesByTrainer(trainerId),
        getTodaySchedules(trainerId),
        getPlans(trainerId),
        getWorkoutTemplates(trainerId),
        getTrainerById(trainerId),
        getAllMembers(), // Fetch all members
      ]).catch(console.error);
    }
  }, [
    getSchedulesByTrainer,
    getTodaySchedules,
    getPlans,
    getWorkoutTemplates,
    getTrainerById,
    getAllMembers,
    trainerId,
  ]);

  // Fetch member details if memberId is a string ID (Member ID)
  useEffect(() => {
    const fetchMemberIfNeeded = async () => {
      if (
        selectedSchedule &&
        typeof selectedSchedule.memberId === "string" &&
        selectedSchedule.memberId.length > 10
      ) {
        try {
          const response = await fetch(
            `/api/members/${selectedSchedule.memberId}`
          );
          if (response.ok) {
            const member = await response.json();
            setSelectedSchedule((prev) => ({
              ...prev,
              memberId: member,
            }));
          }
        } catch (error) {
          console.error("Error fetching member:", error);
        }
      }
    };

    fetchMemberIfNeeded();
  }, [selectedSchedule]);

  // Refetch function to update data without page reload
  const refetchSchedules = useCallback(() => {
    if (trainerId) {
      getSchedulesByTrainer(trainerId);
      getTodaySchedules(trainerId);
      getAllMembers(); // Refetch members too
    }
  }, [trainerId, getSchedulesByTrainer, getTodaySchedules, getAllMembers]);

  // All memos
  // Assigned members from allMembers (full list from store)
  const assignedMembers = useMemo(() => {
    return allMembers.sort((a, b) =>
      getMemberDisplayName(a).localeCompare(getMemberDisplayName(b))
    );
  }, [allMembers]);

  // Member map for quick lookup using Member IDs as keys
  const memberMap = useMemo(() => {
    const map = new Map();
    assignedMembers.forEach((member) => {
      map.set(member._id, getMemberDisplayName(member));
    });
    return map;
  }, [assignedMembers]);

  // Enhance schedules with memberName and formatted times (memberId is Member ID string or Member object)
  const enhancedSchedules = useMemo(() => {
    return schedules.map((schedule) => {
      let memberId = schedule.memberId;
      let memberName;
      if (memberId && typeof memberId === "object") {
        // If populated as Member object
        memberName = getMemberDisplayName(memberId);
        memberId = memberId._id; // For consistency
      } else {
        // String Member ID or null
        memberName = memberMap.get(memberId) || memberId || "Unknown";
      }
      return {
        ...schedule,
        memberId, // Ensure it's the Member ID string
        memberName,
        formattedStartTime: formatTime(schedule.startTime),
        formattedEndTime: formatTime(schedule.endTime),
      };
    });
  }, [schedules, memberMap]);

  // Enhance todaySchedules with memberName and formatted times
  const enhancedTodaySchedules = useMemo(() => {
    return todaySchedules.map((schedule) => {
      let memberId = schedule.memberId;
      let memberName;
      if (memberId && typeof memberId === "object") {
        memberName = getMemberDisplayName(memberId);
        memberId = memberId._id;
      } else {
        memberName = memberMap.get(memberId) || memberId || "Unknown";
      }
      return {
        ...schedule,
        memberId,
        memberName,
        formattedStartTime: formatTime(schedule.startTime),
        formattedEndTime: formatTime(schedule.endTime),
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

  // Students from currentTrainer
  const students = useMemo(() => {
    if (!currentTrainer?.students) return [];
    return currentTrainer.students
      .map((member) =>
        typeof member === "object"
          ? {
              ...member,
              // Ensure memberId is available for form value (use memberId if present, fallback to _id)
              valueId: member.memberId || member._id,
            }
          : {
              _id: member,
              name: member,
              username: "",
              email: "",
              valueId: member,
            }
      )
      .sort((a, b) =>
        getMemberDisplayName(a).localeCompare(getMemberDisplayName(b))
      );
  }, [currentTrainer]);

  // Filtered members for modal based on type
  const filteredMembersForModal = useMemo(() => {
    if (formData.type === "workout") {
      return assignedMembers;
    } else {
      return students;
    }
  }, [formData.type, assignedMembers, students]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type" && value !== "workout") {
      const studentIds = new Set(students.map((s) => s.valueId));
      setFormData((prev) => {
        let updated = {
          ...prev,
          [name]: value,
          planId: "",
          workoutTemplateId: "",
        };
        if (prev.memberId && !studentIds.has(prev.memberId)) {
          updated.memberId = "";
        }
        return updated;
      });
    } else if (name === "planId" && formData.type === "workout") {
      const selectedPlan = plans.find((p) => p._id === value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        workoutTemplateId: selectedPlan?.workoutTemplate?._id || "",
        memberId:
          selectedPlan?.memberId?._id ||
          selectedPlan?.memberId ||
          prev.memberId, // Auto-set Member ID from plan, but keep existing if already set
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

    // Normalize memberId -> ensure we send Member _id to backend
    const normalizeMemberId = (raw) => {
      if (!raw) return null;
      // If object, prefer member._id, fallback to valueId or memberId fields
      if (typeof raw === "object") {
        return raw._id || raw.memberId || raw.valueId || null;
      }
      // If string, first check if it's already a member._id
      const byMemberId = allMembers.find((m) => String(m._id) === String(raw));
      if (byMemberId) return byMemberId._id;
      // Check if it's a userId stored on member.userId
      const byUserId =
        allMembers.find(
          (m) => String(m.userId?._id || m.userId || "") === String(raw)
        ) ||
        (currentTrainer?.students || []).find(
          (s) =>
            String(s.userId?._id || s.userId || "") === String(raw) ||
            String(s._id) === String(raw)
        );
      if (byUserId) return byUserId._id;
      // fallback: return raw (may be member id)
      return raw;
    };

    const normalizedMemberId = normalizeMemberId(formData.memberId);
    if (!normalizedMemberId) {
      alert("Please select a valid member for this schedule.");
      return;
    }

    // Validate memberId (Member ID) for all types
    if (!normalizedMemberId) {
      alert("Please select a member for this schedule.");
      return;
    }

    // Check for time overlaps using local data (trainer-wide for UX; backend validates too)
    const proposedDateStr = new Date(formData.date).toDateString();
    const existing = enhancedSchedules.filter((s) => {
      const sDateStr = new Date(s.date).toDateString();
      const isCurrent = modal.mode === "edit" && s._id === modal.schedule?._id;
      return sDateStr === proposedDateStr && !isCurrent;
    });

    if (hasTimeOverlap(formData.startTime, formData.endTime, existing)) {
      alert(
        "Time slot overlaps with an existing trainer schedule on this date. Please choose different times."
      );
      return;
    }

    let dataToSend = {
      ...formData,
      trainerId,
      memberId: normalizedMemberId, // ensure memberId field is correct
      // Send times as strings (assume backend stores as strings for timezone safety)
    };

    if (formData.type !== "workout") {
      dataToSend = {
        ...dataToSend,
        planId: null,
        workoutTemplateId: null,
      };
    }
    console.log("Data to send:", dataToSend); // Enhanced log to debug memberId

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
    // Ensure we populate formData.memberId with the Member _id (not a user id)
    const selectedMemberId =
      schedule.memberId && typeof schedule.memberId === "object"
        ? schedule.memberId._id || schedule.memberId.memberId || ""
        : schedule.memberId || "";
    setFormData({
      memberId: selectedMemberId, // Member ID
      planId: schedule.planId?._id || schedule.planId || "",
      date: new Date(schedule.date).toISOString().split("T")[0],
      type: schedule.type || "workout",
      workoutTemplateId:
        schedule.workoutTemplateId?._id || schedule.workoutTemplateId || "",
      startTime: formatTime(schedule.startTime) || "09:00",
      endTime: formatTime(schedule.endTime) || "10:00",
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
      startTime: "08:00",
      endTime: "09:00",
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
    // Enhance selectedSchedule with full member data for consistent display (memberId is Member ID or Member object)
    let fullMember = schedule.memberId;
    if (fullMember && typeof fullMember === "string") {
      // Find full member by Member ID
      fullMember = assignedMembers.find((m) => m._id === fullMember) || {
        _id: fullMember,
        name: fullMember,
      };
    }
    const enhancedSchedule = {
      ...schedule,
      memberId: fullMember,
    };
    setSelectedSchedule(enhancedSchedule);
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedSchedule(null);
  };

  // Calendar constants - 6AM to 8PM
  const START_HOUR = 6;
  const END_HOUR = 20;
  const HOUR_HEIGHT = 50;
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
      const formattedStart = formatTime(startTime) || "09:00";
      const [sh, sm] = formattedStart.split(":").map(Number);
      const startMinutes = sh * 60 + sm;
      const startHourMinutes = START_HOUR * 60;
      const minutesFromStart = startMinutes - startHourMinutes;
      return HEADER_HEIGHT + (minutesFromStart / 60) * HOUR_HEIGHT;
    },
    [START_HOUR, HOUR_HEIGHT, HEADER_HEIGHT]
  );

  const calculateHeight = useCallback(
    (startTime, endTime) => {
      const formattedStart = formatTime(startTime) || "09:00";
      const formattedEnd = formatTime(endTime) || "10:00";
      const [sh, sm] = formattedStart.split(":").map(Number);
      const [eh, em] = formattedEnd.split(":").map(Number);
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

      // Check overlap on new date (trainer-wide)
      const proposedDateStr = targetDay.toDateString();
      const existing = enhancedSchedules.filter((s) => {
        const sDateStr = new Date(s.date).toDateString();
        const isCurrent = s._id === draggedSchedule._id;
        return sDateStr === proposedDateStr && !isCurrent;
      });

      const draggedStartStr = formatTime(draggedSchedule.startTime) || "09:00";
      const draggedEndStr = formatTime(draggedSchedule.endTime) || "10:00";

      if (hasTimeOverlap(draggedStartStr, draggedEndStr, existing)) {
        alert(
          "Cannot drop here: Time slot overlaps with an existing trainer schedule."
        );
        setDraggedSchedule(null);
        return;
      }

      const updatedData = {
        ...draggedSchedule,
        date: newDate,
        // Times remain as strings
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
    [draggedSchedule, updateSchedule, refetchSchedules, enhancedSchedules]
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
          const aTime = a.formattedStartTime || "09:00";
          const bTime = b.formattedStartTime || "09:00";
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
        <ScheduleDetailsModal
          selectedSchedule={selectedSchedule}
          getDefaultTimes={getDefaultTimes}
          formatDate={formatDate}
          getEventColor={getEventColor}
          getEventIcon={getEventIcon}
          onCloseSidebar={closeSidebar}
          onMarkComplete={handleMarkComplete}
          onEditSchedule={openEditModal}
          onDeleteSchedule={handleDelete}
          getMemberDisplayName={getMemberDisplayName}
          getPlanDisplayName={getPlanDisplayName}
        />
      )}

      {modal.open && (
        <ScheduleModal
          modal={modal}
          formData={formData}
          members={filteredMembersForModal}
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
