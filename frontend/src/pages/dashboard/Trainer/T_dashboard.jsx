import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Users,
  Activity,
  Dumbbell,
  Calendar,
  ClipboardList,
  TrendingUp,
  Bell,
  Search,
  Plus,
  MessageCircle,
  FileText,
  Heart,
  Zap,
  Target,
  Edit3,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Clock,
  Ruler,
  Check,
  MapPin,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { useUserStore } from "../../../store/userStore"; // Adjust path as needed
import { useTemplateStore } from "../../../store/TemplateStore"; // Adjust path as needed
import { useScheduleStore } from "../../../store/useScheduleStore";
import { useMemberStore } from "../../../store/memberStore";
import { usePlanStore } from "../../../store/planStore";
import OverviewTemplateCard from "../../../components/Trainer/home/OverviewTemplateCard"; // Updated import for the new overview card
import DetailModal from "../../../components/Template/DetailModal"; // Import DetailModal for view details
import { AnimatePresence, motion } from "framer-motion"; // For animations like in TemplateManager
import TodaysSchedule from "../../../components/Trainer/home/TodaysSchedule"; // New import for separated component

export default function TrainerMainContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState("All");
  const [activeTab, setActiveTab] = useState("schedule"); // For schedule control tabs
  const [activeTemplateTab, setActiveTemplateTab] = useState("workout");
  const [expandedTemplateId, setExpandedTemplateId] = useState(null); // Optional: Keep if you want inline expand, but we'll use modals instead
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);

  const sliderRef = useRef(null);
  const containerRef = useRef(null);

  const { user, fetchUser } = useUserStore();
  const {
    workoutTemplates,
    dietTemplates,
    getWorkoutTemplates,
    getDietTemplates,
    // Remove CRUD hooks since not needed
    isLoadingWorkout,
    isLoadingDiet,
  } = useTemplateStore();
  const {
    todaySchedules,
    getTodaySchedules,
    markScheduleComplete,
    isLoading: isLoadingSchedules,
  } = useScheduleStore();
  const { members: allMembers, getAllMembers } = useMemberStore();
  const { plans: trainerPlans, getPlans } = usePlanStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?._id) {
      getWorkoutTemplates(user._id);
      getDietTemplates(user._id);
      getTodaySchedules(user._id);
      getAllMembers();
      getPlans(user._id);
    }
  }, [
    user?._id,
    getWorkoutTemplates,
    getDietTemplates,
    getTodaySchedules,
    getAllMembers,
    getPlans,
  ]);

  // Define templates early to avoid initialization errors
  const templates =
    activeTemplateTab === "workout" ? workoutTemplates : dietTemplates;
  const isLoadingTemplates =
    activeTemplateTab === "workout" ? isLoadingWorkout : isLoadingDiet;

  // Reset slider index when templates change
  useEffect(() => {
    setCurrentTemplateIndex(0);
  }, [workoutTemplates, dietTemplates]);

  // Compute translateX based on container width
  const cardsPerView = 3;
  const gapSize = 16; // px for gap-4
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    const updateTranslate = () => {
      if (!containerRef.current || templates.length <= cardsPerView) {
        setTranslateX(0);
        return;
      }
      const containerWidth = containerRef.current.offsetWidth;
      const totalGap = (cardsPerView - 1) * gapSize;
      const cardWidth = (containerWidth - totalGap) / cardsPerView;
      const step = cardWidth + gapSize;
      setTranslateX(-currentTemplateIndex * step);
    };

    updateTranslate();
    window.addEventListener("resize", updateTranslate);
    return () => window.removeEventListener("resize", updateTranslate);
  }, [currentTemplateIndex, templates, gapSize, cardsPerView]);

  const maxIndex = Math.max(0, templates.length - cardsPerView);

  const handleNextTemplate = () => {
    setCurrentTemplateIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const handlePrevTemplate = () => {
    setCurrentTemplateIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToIndex = (index) => {
    setCurrentTemplateIndex(index);
  };

  const handleViewTemplate = (type, data) => {
    setPreviewType(type);
    setPreviewData(data);
    setPreviewOpen(true);
  };

  // Schedule helpers (copied/adapted from SchedulesPage for clean integration)
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

  const formatTime = useCallback((time) => {
    if (!time) return null;
    if (typeof time === "string") return time;
    const d = new Date(time);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }, []);

  const getDefaultTimes = (schedule) => {
    const start = schedule.formattedStartTime;
    const end = schedule.formattedEndTime;
    if (!start || !end) {
      return { startTime: "Unscheduled", endTime: "" };
    }
    return { startTime: start, endTime: end };
  };

  const getMemberDisplayName = (member) => {
    return (
      member?.username ||
      member?.name ||
      member?.userId?.username ||
      member?._id ||
      "Unknown"
    );
  };

  // Member map for quick lookup
  const memberMap = useMemo(() => {
    const map = new Map();
    allMembers.forEach((member) => {
      map.set(member._id, getMemberDisplayName(member));
    });
    return map;
  }, [allMembers]);

  const API_BASE =
    (import.meta.env.VITE_API_URL &&
      import.meta.env.VITE_API_URL.replace(/\/$/, "")) ||
    "http://localhost:3000";

  const toAvatarUrl = useCallback(
    (raw) => {
      if (!raw) return null;
      if (typeof raw !== "string") return null;
      if (raw.startsWith("http")) return raw;
      return `${API_BASE}/uploads/${raw.replace(/^\//, "")}`;
    },
    [API_BASE]
  );

  // Enhance todaySchedules with memberName, formatted times, member image, and status
  const enhancedTodaySchedules = useMemo(() => {
    return todaySchedules
      .map((schedule) => {
        const rawMember = schedule.memberId;
        let memberId = null;
        let memberName = "Unknown";
        let fullMemberObj = null;

        if (rawMember && typeof rawMember === "object") {
          // schedule already contains populated member object
          fullMemberObj = rawMember;
          memberId = rawMember._id || rawMember.memberId || null;
          memberName = getMemberDisplayName(fullMemberObj);
        } else {
          memberId = rawMember;
          fullMemberObj =
            allMembers.find((m) => String(m._id) === String(memberId)) || null;
          if (fullMemberObj) {
            memberName = getMemberDisplayName(fullMemberObj);
          } else {
            memberName =
              memberMap.get(memberId) ||
              (memberId ? String(memberId) : "Unknown");
            fullMemberObj = { _id: memberId, profileImage: null };
          }
        }

        const avatarRaw =
          fullMemberObj?.profileImage ||
          fullMemberObj?.avatar ||
          fullMemberObj?.userId?.profileImage ||
          null;

        // Determine status based on schedule properties (assuming isCompleted or status field)
        const status = schedule.isCompleted
          ? "completed"
          : schedule.status === "confirmed"
          ? "confirmed"
          : "pending";

        return {
          ...schedule,
          memberId,
          memberName,
          memberImage: toAvatarUrl(avatarRaw) || "/default-avatar.png",
          formattedStartTime: formatTime(schedule.startTime),
          formattedEndTime: formatTime(schedule.endTime),
          status,
          // Calculate duration for display
          duration:
            schedule.endTime && schedule.startTime
              ? Math.round(
                  (new Date(schedule.endTime) - new Date(schedule.startTime)) /
                    (1000 * 60)
                )
              : null,
        };
      })
      .sort((a, b) => {
        const aTime = a.formattedStartTime || "23:59";
        const bTime = b.formattedStartTime || "23:59";
        return (
          new Date(`1970/01/01 ${aTime}`) - new Date(`1970/01/01 ${bTime}`)
        );
      });
  }, [todaySchedules, memberMap, allMembers, formatTime, toAvatarUrl]);

  const handleMarkComplete = async (scheduleId) => {
    try {
      await markScheduleComplete(scheduleId);
      // Refetch to ensure UI updates without reload
      getTodaySchedules(user?._id);
    } catch (error) {
      console.error("Error marking schedule complete:", error);
    }
  };

  // ... (keep radarData, handleScheduleTab, scheduleActions unchanged)

  return (
    <main className="p-4 md:p-6 lg:p-8 rounded-lg bg-cyan-50 min-h-screen">
      {/* Today's Schedule Section - Now using separate component */}
      <TodaysSchedule
        enhancedTodaySchedules={enhancedTodaySchedules}
        isLoadingSchedules={isLoadingSchedules}
        formatDate={formatDate}
        getDefaultTimes={getDefaultTimes}
        handleMarkComplete={handleMarkComplete}
        user={user}
      />

      {/* Simplified Templates Overview - Like TemplateManager but read-only with slider */}
      <section className="mb-8 ">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="text-indigo-600" /> My Templates
            </h2>
          </div>
          <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
            {["workout", "diet"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTemplateTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  activeTemplateTab === tab
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:text-indigo-600"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}s
              </button>
            ))}
          </div>
        </div>

        {isLoadingTemplates ? (
          <div className="text-center text-gray-500 py-12 animate-pulse">
            <FileText className="mx-auto mb-3 opacity-60" size={32} />
            <p className="text-sm">Loading Templates...</p>
          </div>
        ) : templates.length > 0 ? (
          <>
            {/* Slider Container */}
            <div
              ref={containerRef}
              className="relative overflow-hidden rounded-lg"
            >
              <motion.div
                ref={sliderRef}
                className="flex gap-4"
                animate={{ x: translateX }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {templates.map((t) => (
                  <div
                    key={t._id}
                    className="flex-shrink-0 w-[calc((100%-32px)/3)]"
                  >
                    <OverviewTemplateCard
                      t={t}
                      type={activeTemplateTab}
                      onView={(templateType, templateData) =>
                        handleViewTemplate(activeTemplateTab, templateData)
                      } // Adjusted to ignore passed type and use activeTemplateTab
                    />
                  </div>
                ))}
              </motion.div>

              {/* Navigation Buttons */}
              {currentTemplateIndex > 0 && (
                <button
                  onClick={handlePrevTemplate}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md rounded-full p-2 transition-all z-10 border border-gray-200"
                  aria-label="Previous templates"
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
              )}
              {currentTemplateIndex < maxIndex && (
                <button
                  onClick={handleNextTemplate}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md rounded-full p-2 transition-all z-10 border border-gray-200"
                  aria-label="Next templates"
                >
                  <ChevronRight size={20} className="text-gray-600" />
                </button>
              )}
            </div>

            {/* Indicator (optional) */}
            {templates.length > cardsPerView && (
              <div className="flex justify-center mt-4 gap-1">
                {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentTemplateIndex === i
                        ? "bg-indigo-600"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <FileText className="mx-auto mb-3 opacity-60" size={32} />
            <p className="text-sm font-medium">No templates yet.</p>
            <p className="text-xs mt-1">
              Create some in the Templates section!
            </p>
          </div>
        )}
      </section>

      {/* Detail Modal for viewing template details */}
      <AnimatePresence>
        {previewOpen && previewData && (
          <DetailModal
            isOpen={previewOpen}
            onClose={() => {
              setPreviewOpen(false);
              setPreviewData(null);
              setPreviewType(null);
            }}
            title={previewData.title || previewData.name}
            type={previewType}
            data={previewData}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
