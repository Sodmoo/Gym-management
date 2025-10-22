import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useScheduleStore } from "../../../store/useScheduleStore"; // Adjust path to your store file
import { useUserStore } from "../../../store/userStore";
import {
  Calendar,
  Clock,
  Users,
  Dumbbell,
  Ruler,
  User,
  CheckCircle,
  Edit,
  Trash2,
  X,
  Plus,
  ArrowLeft,
  ArrowRight,
  FileText,
  ChevronDown,
  Search,
  Filter,
} from "lucide-react";

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

const getDurationMinutes = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return 60; // Default to 1 hour if missing
  }
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return Math.max(30, eh * 60 + em - (sh * 60 + sm)); // Min 30 min
};

const getDefaultTimes = (schedule) => {
  return {
    startTime: schedule.startTime || "09:00",
    endTime: schedule.endTime || "10:00",
  };
};

const getMemberInitials = (member) => {
  const name = member?.userId?.username || member?.name || "M";
  return name.charAt(0).toUpperCase();
};

const SchedulesPage = () => {
  const [modal, setModal] = useState({
    open: false,
    schedule: null,
    mode: "create",
  });
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useUserStore();
  console.log(user?._id);

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

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ type: "all", status: "all" });

  // Drag and Drop States
  const [draggedSchedule, setDraggedSchedule] = useState(null);

  useEffect(() => {
    if (trainerId) {
      getSchedulesByTrainer(trainerId);
      getTodaySchedules(trainerId);
    }
  }, [getSchedulesByTrainer, getTodaySchedules, trainerId]);

  // Filtered Schedules (for lists and calendar)
  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const matchesSearch = (
        schedule.memberId?.userId?.username ||
        schedule.note ||
        ""
      )
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
  }, [schedules, searchQuery, filters]);

  // Filtered schedules for calendar
  const allSchedulesForCalendar = useMemo(
    () => filteredSchedules,
    [filteredSchedules]
  );

  // Derive members, plans, and workoutTemplates from populated schedules
  const members = useMemo(() => {
    const map = new Map();
    schedules.forEach((schedule) => {
      const member = schedule.memberId;
      if (member && !map.has(member._id)) {
        map.set(member._id, member);
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      (a.userId?.username || a.name || a._id || "").localeCompare(
        b.userId?.username || b.name || b._id || ""
      )
    );
  }, [schedules]);

  const plans = useMemo(() => {
    const map = new Map();
    schedules.forEach((schedule) => {
      const plan = schedule.planId;
      if (plan && !map.has(plan._id)) {
        map.set(plan._id, plan);
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      (a.title || a._id || "").localeCompare(b.title || b._id || "")
    );
  }, [schedules]);

  const workoutTemplates = useMemo(() => {
    const map = new Map();
    schedules.forEach((schedule) => {
      const template = schedule.workoutTemplateId;
      if (template && !map.has(template._id)) {
        map.set(template._id, template);
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      (a.title || a._id || "").localeCompare(b.title || b._id || "")
    );
  }, [schedules]);

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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trainerId) {
      console.error("Trainer ID not available; cannot submit schedule");
      return;
    }
    const dataToSend = { ...formData, trainerId };
    if (modal.mode === "edit") {
      await updateSchedule(modal.schedule._id, dataToSend);
    } else {
      await createSchedule(dataToSend);
    }
    getSchedulesByTrainer(trainerId);
    getTodaySchedules(trainerId);
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
      await deleteSchedule(id);
      if (trainerId) {
        getSchedulesByTrainer(trainerId);
        getTodaySchedules(trainerId);
      }
    }
    setIsSidebarOpen(false);
    setSelectedSchedule(null);
  };

  const handleMarkComplete = async (id) => {
    await markScheduleComplete(id);
    if (trainerId) {
      getSchedulesByTrainer(trainerId);
      getTodaySchedules(trainerId);
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

  // Get display names for selects
  const getMemberDisplayName = (member) =>
    member?.userId?.username || member?.name || member?._id || "Unknown Member";
  const getPlanDisplayName = (plan) =>
    plan?.title || plan?._id || "Unknown Plan";
  const getTemplateDisplayName = (template) =>
    template?.title || template?._id || "Unknown Template";

  // Calendar constants - 6AM to 8PM
  const START_HOUR = 6;
  const END_HOUR = 20;
  const HOUR_HEIGHT = 70; // Increased for more spacious, full feel
  const TOTAL_HOURS = END_HOUR - START_HOUR + 1;
  const TOTAL_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;
  const HEADER_HEIGHT = 64; // Adjusted for better alignment

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

      await updateSchedule(draggedSchedule._id, updatedData);
      getSchedulesByTrainer(trainerId);
      setDraggedSchedule(null);
    },
    [draggedSchedule, updateSchedule, getSchedulesByTrainer, trainerId]
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
  const todayCount = todaySchedules.length;
  const totalCount = schedules.length;
  const completedToday = todaySchedules.filter((s) => s.isCompleted).length;

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

  if (isLoading) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header - Modern with subtle gradient */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
                  <Calendar className="w-6 h-6" aria-hidden="true" />
                </div>
                <span>Schedule</span>
              </h1>
              <p className="text-gray-600">
                Manage your weekly appointments with ease
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Create new schedule"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>New Schedule</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search by member or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
              aria-label="Search schedules"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
              aria-label="Filter by type"
            >
              <option value="all">All Types</option>
              <option value="workout">Workouts</option>
              <option value="meeting">Meetings</option>
              <option value="measurement">Measurements</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilters({ type: "all", status: "all" });
              }}
              className="px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Clear filters"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Dashboard Stats - Modern Glassmorphism Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              label: "Today's",
              value: todayCount,
              color: "blue",
              icon: Calendar,
            },
            {
              label: "Total",
              value: totalCount,
              color: "emerald",
              icon: Users,
            },
            {
              label: "Completed Today",
              value: completedToday,
              color: "purple",
              icon: CheckCircle,
            },
          ].map(({ label, value, color, icon: Icon }, i) => (
            <div
              key={i}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
              role="figure"
              aria-label={`${label}: ${value}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {value}
                  </p>
                </div>
                <div
                  className={`p-3 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-xl text-white shadow-lg`}
                >
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Calendar - Full Clean Professional Structure Without Divisions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-blue-50/30">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Calendar
                  className="w-5 h-5 text-blue-600"
                  aria-hidden="true"
                />
                <span>
                  Week of {formatDate(currentWeekStart, "MMM do, yyyy")}
                </span>
              </h2>
              <div className="flex items-center space-x-1 bg-white/60 rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => navigateWeek("prev")}
                  className="p-2 rounded-md hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Previous week"
                >
                  <ArrowLeft
                    className="w-4 h-4 text-gray-600"
                    aria-hidden="true"
                  />
                </button>
                <button
                  onClick={() => navigateWeek("next")}
                  className="p-2 rounded-md hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Next week"
                >
                  <ArrowRight
                    className="w-4 h-4 text-gray-600"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-hidden md:overflow-x-auto max-h-[800px] overflow-y-auto">
            {!isMobile ? (
              // Desktop Full Clean Grid View
              <div
                className="w-full min-w-[1100px]"
                style={{ height: `${TOTAL_HEIGHT + HEADER_HEIGHT}px` }}
              >
                <div className="flex">
                  {/* Time Column - Clean Sticky Without Borders */}
                  <div
                    className="w-[72px] flex-shrink-0 bg-white border-r border-gray-100 sticky left-0 z-30"
                    style={{ height: `${TOTAL_HEIGHT + HEADER_HEIGHT}px` }}
                  >
                    {/* Time Header */}
                    <div
                      className="h-[64px] flex items-center justify-center font-semibold text-gray-700 text-sm border-b border-gray-100 bg-white"
                      style={{ height: `${HEADER_HEIGHT}px` }}
                    >
                      Time
                    </div>
                    {/* Hour Labels - No Borders, No :00 */}
                    {Array.from({ length: TOTAL_HOURS }, (_, hourIndex) => {
                      const hour = START_HOUR + hourIndex;
                      return (
                        <div
                          key={hour}
                          className="flex items-start justify-end pr-1.5 text-sm text-gray-500 relative border-b border-gray-100"
                          style={{ height: `${HOUR_HEIGHT}px` }}
                        >
                          <span className="pt-1.5 leading-tight">
                            <div className="font-medium">
                              {formatTimeLabel(hour)}
                            </div>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Days Container */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="grid grid-cols-7 gap-0"
                      style={{ height: `${TOTAL_HEIGHT + HEADER_HEIGHT}px` }}
                    >
                      {weekDays.map((day) => (
                        <div
                          key={day.toDateString()}
                          className={`relative bg-white hover:bg-gray-50/50 transition-colors duration-200 border-r border-gray-100 last:border-r-0 ${
                            isToday(day)
                              ? "border-l-4 border-blue-400 bg-blue-50/30"
                              : ""
                          }`}
                          style={{ height: "100%" }}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, day)}
                        >
                          {/* Day Header - Clean Sticky */}
                          <div
                            className={`sticky top-0 z-20 bg-white border-b border-gray-100 py-3 px-2 text-center ${
                              isToday(day)
                                ? "bg-blue-50/50 border-blue-100"
                                : ""
                            }`}
                            style={{ height: `${HEADER_HEIGHT}px` }}
                          >
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              {formatDate(day, "EEE")}
                            </div>
                            <div
                              className={`text-base font-bold mt-0.5 ${
                                isToday(day) ? "text-blue-600" : "text-gray-900"
                              }`}
                            >
                              {day.getDate()}
                            </div>
                            {isToday(day) && (
                              <div className="text-xs text-blue-500 font-medium mt-0.5">
                                Today
                              </div>
                            )}
                          </div>
                          {/* Subtle Grid Lines for Hourly Divisions */}
                          {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
                            <div
                              key={`line-${i}`}
                              className="absolute inset-x-0 h-px bg-gray-100 z-0"
                              style={{
                                top: `${HEADER_HEIGHT + i * HOUR_HEIGHT}px`,
                              }}
                            />
                          ))}
                          {/* Events - Clean Absolute */}
                          {getSchedulesForDay(day).map((schedule) => {
                            const { startTime, endTime } =
                              getDefaultTimes(schedule);
                            const topPx = calculateTop(startTime);
                            const heightPx = calculateHeight(
                              startTime,
                              endTime
                            );
                            const EventIcon = getEventIcon(schedule.type);
                            return (
                              <div
                                key={schedule._id}
                                draggable={!isMobile}
                                onDragStart={(e) =>
                                  handleDragStart(e, schedule)
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleScheduleClick(schedule);
                                }}
                                className={`absolute left-2 right-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01] rounded-xl p-3 flex flex-col justify-between text-white text-xs z-10 ${getEventColor(
                                  schedule.type
                                )} shadow-sm border-white/20`}
                                style={{
                                  top: `${topPx}px`,
                                  height: `${heightPx}px`,
                                  minHeight: "48px",
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label={`Schedule for ${
                                  schedule.memberId?.userId?.username ||
                                  "Client"
                                } on ${formatDate(
                                  schedule.date,
                                  "PPP"
                                )} at ${startTime}`}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ")
                                    handleScheduleClick(schedule);
                                }}
                              >
                                <div className="flex items-center space-x-1.5 mb-0.5">
                                  <EventIcon
                                    className="w-3.5 h-3.5 flex-shrink-0 opacity-100"
                                    aria-hidden="true"
                                  />
                                  <div className="font-medium truncate flex-1 text-[11px] leading-tight">
                                    {schedule.memberId?.userId?.username ||
                                      schedule.memberId?.name ||
                                      "Client"}
                                  </div>
                                </div>
                                <div className="text-[10px] opacity-95 truncate leading-tight">
                                  {startTime} - {endTime}
                                </div>
                                {schedule.isCompleted && (
                                  <div className="absolute inset-0 bg-green-400/20 rounded-xl flex items-center justify-center z-0">
                                    <CheckCircle
                                      className="w-3.5 h-3.5 text-green-100"
                                      aria-hidden="true"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Mobile List View (No DnD)
              <div className="md:hidden space-y-4 p-4" role="list">
                {weekDays.map((day) => (
                  <div
                    key={day.toDateString()}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                    role="listitem"
                  >
                    <h3
                      className="font-bold text-gray-900 mb-2 flex items-center space-x-2"
                      aria-label={`Schedules for ${formatDate(
                        day,
                        "EEE, MMM do"
                      )}`}
                    >
                      <Calendar
                        className="w-4 h-4 text-blue-600"
                        aria-hidden="true"
                      />
                      <span>{formatDate(day, "EEE, MMM do")}</span>
                      {isToday(day) && (
                        <span className="text-blue-500 text-sm font-medium">
                          Today
                        </span>
                      )}
                    </h3>
                    <div className="space-y-2">
                      {getSchedulesForDay(day).map((schedule) => {
                        const EventIcon = getEventIcon(schedule.type);
                        return (
                          <div
                            key={schedule._id}
                            className={`p-3 rounded-lg border ${getEventColor(
                              schedule.type
                            ).replace("border-", "border-")} hover:shadow-md`}
                            role="button"
                            tabIndex={0}
                            aria-label={`Schedule for ${
                              schedule.memberId?.userId?.username || "Client"
                            } at ${getDefaultTimes(schedule).startTime}`}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ")
                                handleScheduleClick(schedule);
                            }}
                            onClick={() => handleScheduleClick(schedule)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getEventColor(
                                    schedule.type
                                  )
                                    .replace("border-", " ")
                                    .replace(
                                      "gradient-to-r",
                                      "bg-gradient-to-r"
                                    )}`}
                                >
                                  <EventIcon
                                    className="w-3 h-3"
                                    aria-hidden="true"
                                  />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 text-sm">
                                    {schedule.memberId?.userId?.username ||
                                      schedule.memberId?.name ||
                                      "Client"}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {getDefaultTimes(schedule).startTime} -{" "}
                                    {getDefaultTimes(schedule).endTime}
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  schedule.isCompleted
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {schedule.isCompleted ? "Completed" : "Pending"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today's Agenda - Modern List with Subtle Animations */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <span>Today's Agenda</span>
          </h2>
          {todaySchedules.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Calendar
                  className="w-8 h-8 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <p className="text-lg font-medium">No schedules for today.</p>
              <button
                onClick={openCreateModal}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 mx-auto transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Add a schedule for today"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Add one now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4" role="list">
              {todaySchedules.map((sch, i) => {
                const { startTime, endTime } = getDefaultTimes(sch);
                const EventIcon = getEventIcon(sch.type);
                return (
                  <div
                    key={sch._id}
                    className="group flex items-center justify-between p-5 bg-gradient-to-r from-white to-slate-50 rounded-xl border border-white/20 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => handleScheduleClick(sch)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for ${
                      sch.memberId?.userId?.username || "Client"
                    }'s ${sch.type} at ${startTime}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handleScheduleClick(sch);
                    }}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div
                        className={`rounded-xl w-12 h-12 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg ${getEventColor(
                          sch.type
                        )
                          .replace("border-", " ")
                          .replace("gradient-to-r", "bg-gradient-to-r")}`}
                      >
                        <EventIcon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate text-base">
                          {sch.memberId?.userId?.username ||
                            sch.memberId?.name ||
                            "N/A"}
                        </div>
                        <div className="text-sm text-gray-600 truncate flex items-center space-x-4 mt-0.5">
                          <span>{formatDate(new Date(), "PPP")}</span>
                          <span>•</span>
                          <span className="font-medium">
                            {startTime} - {endTime}
                          </span>
                          <span>•</span>
                          <span className="text-gray-500 capitalize">
                            {sch.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ml-4 transition-colors duration-200 ${
                        sch.isCompleted
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {sch.isCompleted ? "Completed" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* All Schedules - Modern Compact List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-600" aria-hidden="true" />
            <span>All Schedules ({filteredSchedules.length})</span>
          </h2>
          {filteredSchedules.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Calendar
                  className="w-8 h-8 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <p className="text-lg font-medium">
                No schedules match your filters.
              </p>
              <button
                onClick={openCreateModal}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 mx-auto transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Create first schedule"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Create your first schedule</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto" role="list">
              {filteredSchedules.map((schedule, i) => {
                const { startTime, endTime } = getDefaultTimes(schedule);
                const EventIcon = getEventIcon(schedule.type);
                return (
                  <div
                    key={schedule._id}
                    className="group flex items-center justify-between p-4 bg-gradient-to-r from-white to-slate-50 rounded-xl border border-white/20 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => handleScheduleClick(schedule)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for ${
                      schedule.memberId?.userId?.username || "Client"
                    }'s ${schedule.type} on ${formatDate(
                      schedule.date,
                      "MMM do"
                    )}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handleScheduleClick(schedule);
                    }}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className={`rounded-lg w-10 h-10 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md ${getEventColor(
                          schedule.type
                        )
                          .replace("border-", " ")
                          .replace("gradient-to-r", "bg-gradient-to-r")}`}
                      >
                        <EventIcon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {schedule.memberId?.userId?.username ||
                            schedule.memberId?.name ||
                            "N/A"}
                        </div>
                        <div className="text-sm text-gray-600 truncate flex items-center space-x-3 mt-0.5">
                          <span>{formatDate(schedule.date, "MMM do")}</span>
                          <span>•</span>
                          <span>
                            {startTime} - {endTime}
                          </span>
                          <span>•</span>
                          <span className="text-gray-500 capitalize">
                            {schedule.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ml-3 transition-colors duration-200 ${
                        schedule.isCompleted
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {schedule.isCompleted ? "Completed" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Detail Card - Modern Glassmorphism */}
      {isSidebarOpen &&
        selectedSchedule &&
        (() => {
          const { startTime, endTime } = getDefaultTimes(selectedSchedule);
          const EventIcon = getEventIcon(selectedSchedule.type);
          return (
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={closeSidebar}
                aria-hidden="true"
              />
              {/* Sidebar */}
              <div
                className="fixed right-0 top-0 h-full w-96 bg-white/90 backdrop-blur-sm shadow-2xl z-50 overflow-y-auto border-l border-white/20"
                role="dialog"
                aria-modal="true"
                aria-label="Schedule details"
              >
                <div className="p-6 border-b border-white/20">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Schedule Details
                    </h2>
                    <button
                      onClick={closeSidebar}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      aria-label="Close sidebar"
                    >
                      <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                  <div
                    className={`p-5 rounded-2xl border-2 ${getEventColor(
                      selectedSchedule.type
                    )} text-white mb-6 shadow-lg`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="border-2 border-white/30 rounded-xl p-3 bg-white/10">
                        <EventIcon className="w-6 h-6" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">
                          {selectedSchedule.memberId?.userId?.username ||
                            selectedSchedule.memberId?.name ||
                            "Member"}
                        </div>
                        <div className="text-sm opacity-90 capitalize flex items-center space-x-1">
                          <span>{selectedSchedule.type}</span>
                          {selectedSchedule.planId && (
                            <>
                              <ChevronDown
                                className="w-3 h-3"
                                aria-hidden="true"
                              />
                              <span className="text-xs">
                                {selectedSchedule.planId.title}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-sm opacity-95 flex items-center space-x-3 bg-white/10 rounded-xl p-3">
                      <Clock
                        className="w-4 h-4 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="flex items-center space-x-1">
                        <span>
                          {startTime} - {endTime}
                        </span>
                        <span>•</span>
                        <span>
                          {formatDate(selectedSchedule.date, "MMM do, yyyy")}
                        </span>
                      </span>
                    </div>
                    {selectedSchedule.note && (
                      <div className="mt-4 text-sm opacity-90 bg-white/10 rounded-xl p-3">
                        {selectedSchedule.note}
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {!selectedSchedule.isCompleted && (
                      <button
                        onClick={() => handleMarkComplete(selectedSchedule._id)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        aria-label="Mark this schedule as complete"
                      >
                        <CheckCircle className="w-5 h-5" aria-hidden="true" />
                        <span>Mark as Complete</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        openEditModal(selectedSchedule);
                        closeSidebar();
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Edit this schedule"
                    >
                      <Edit className="w-5 h-5" aria-hidden="true" />
                      <span>Edit Schedule</span>
                    </button>
                    <button
                      onClick={() => handleDelete(selectedSchedule._id)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="Delete this schedule"
                    >
                      <Trash2 className="w-5 h-5" aria-hidden="true" />
                      <span>Delete Schedule</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          );
        })()}

      {/* Create/Edit Schedule Modal - Modern Form with Glassmorphism */}
      {modal.open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={
            modal.mode === "edit" ? "Edit schedule" : "Create new schedule"
          }
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {modal.mode === "edit" ? "Edit Schedule" : "Create New Schedule"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {modal.mode === "create" && (
                <div className="space-y-5">
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="memberId"
                    >
                      Member *
                    </label>
                    <select
                      id="memberId"
                      name="memberId"
                      value={formData.memberId}
                      onChange={handleChange}
                      required
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="">Select Member</option>
                      {members.map((member) => (
                        <option key={member._id} value={member._id}>
                          {getMemberDisplayName(member)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="planId"
                    >
                      Plan *
                    </label>
                    <select
                      id="planId"
                      name="planId"
                      value={formData.planId}
                      onChange={handleChange}
                      required
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="">Select Plan</option>
                      {plans.map((plan) => (
                        <option key={plan._id} value={plan._id}>
                          {getPlanDisplayName(plan)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="date"
                    >
                      Date *
                    </label>
                    <input
                      id="date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="workoutTemplateId"
                    >
                      Workout Template
                    </label>
                    <select
                      id="workoutTemplateId"
                      name="workoutTemplateId"
                      value={formData.workoutTemplateId}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="">Select Template</option>
                      {workoutTemplates.map((template) => (
                        <option key={template._id} value={template._id}>
                          {getTemplateDisplayName(template)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div className="space-y-5">
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    htmlFor="type"
                  >
                    Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                  >
                    <option value="workout">Workout</option>
                    <option value="meeting">Meeting</option>
                    <option value="measurement">Measurement</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="startTime"
                    >
                      Start Time *
                    </label>
                    <input
                      id="startTime"
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-semibold text-gray-700 mb-2"
                      htmlFor="endTime"
                    >
                      End Time *
                    </label>
                    <input
                      id="endTime"
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    htmlFor="note"
                  >
                    Note
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm resize-none transition-all duration-200"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-500"
                  aria-label="Cancel changes"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center space-x-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                  <span>{modal.mode === "edit" ? "Update" : "Create"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulesPage;
