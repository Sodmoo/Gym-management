// Updated TrainerMainContent.jsx with performance optimizations
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
  lazy,
} from "react";
import { useUserStore } from "../../../store/userStore";
import { useTemplateStore } from "../../../store/TemplateStore";
import { useScheduleStore } from "../../../store/useScheduleStore";
import { useMemberStore } from "../../../store/memberStore";
import { usePlanStore } from "../../../store/planStore";
import { useTrainerStore } from "../../../store/trainerStore";
import { useGoalsMeasurementsStore } from "../../../store/useGoalsMeasurementsStore";
import DetailModal from "../../../components/Template/DetailModal";
import { AnimatePresence } from "framer-motion";
import { RefreshCw, AlertCircle } from "lucide-react";

// Lazy load heavy components to improve initial load time
const StatusCards = lazy(() =>
  import("../../../components/Trainer/home/StatusCards")
);
const TodaysSchedule = lazy(() =>
  import("../../../components/Trainer/home/TodaysSchedule")
);
const MyStudents = lazy(() =>
  import("../../../components/Trainer/home/MyStudents")
);
const MyTemplates = lazy(() =>
  import("../../../components/Trainer/home/MyTemplates")
);
const MyPlans = lazy(() => import("../../../components/Trainer/home/MyPlans"));
const OverallProgressChart = lazy(() =>
  import("../../../components/Trainer/home/OverallProgressChart")
);

// Error boundary wrapper
const ErrorFallback = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
    <p className="text-red-600 mb-4 text-center">
      {error.message || "Алдаа гарлаа"}
    </p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
    >
      Дахин ачаалах
    </button>
  </div>
);

export default function TrainerMainContent() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("3months");
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user, fetchUser } = useUserStore();

  const {
    todaySchedules,
    getTodaySchedules,
    markScheduleComplete,
    isLoading: isLoadingSchedules,
  } = useScheduleStore();
  const { members: allMembers, getAllMembers } = useMemberStore();
  const { plans: _trainerPlans, getPlans } = usePlanStore();
  const {
    currentTrainer,
    getTrainerById,
    isLoading: isLoadingTrainer,
  } = useTrainerStore();
  const {
    workoutTemplates,
    dietTemplates,
    getWorkoutTemplates,
    getDietTemplates,
  } = useTemplateStore();
  const {
    aggregateMeasurement,
    getAggregateMeasurement,
    isLoading: isLoadingAggregate,
  } = useGoalsMeasurementsStore();

  // Consolidated fetch with timeout and better error handling
  const fetchAllData = useCallback(
    async (trainerId, period) => {
      setIsRefreshing(true);
      setError(null);
      const timeoutPromise = new Promise(
        (_, reject) =>
          setTimeout(
            () => reject(new Error("Ачаалал удаан байна. Холбоо шалгаарай.")),
            10000
          ) // 10s timeout
      );
      try {
        await Promise.race([
          Promise.allSettled([
            getWorkoutTemplates(trainerId),
            getDietTemplates(trainerId),
            getTodaySchedules(trainerId),
            getAllMembers(),
            getPlans(trainerId),
            getTrainerById(trainerId),
            getAggregateMeasurement(trainerId, period),
          ]),
          timeoutPromise,
        ]);
      } catch (err) {
        setError(err);
        console.error("Error fetching data:", err);
      } finally {
        setIsRefreshing(false);
      }
    },
    [
      getWorkoutTemplates,
      getDietTemplates,
      getTodaySchedules,
      getAllMembers,
      getPlans,
      getTrainerById,
      getAggregateMeasurement,
    ]
  );

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?._id) {
      const timer = setTimeout(
        () => fetchAllData(user._id, selectedPeriod),
        100
      ); // Slight delay to batch
      return () => clearTimeout(timer);
    }
  }, [user?._id, selectedPeriod, fetchAllData]);

  const handlePeriodChange = useCallback((period) => {
    setSelectedPeriod(period);
  }, []);

  const handleViewTemplate = useCallback((type, data) => {
    setPreviewType(type);
    setPreviewData(data);
    setPreviewOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    if (user?._id) {
      fetchAllData(user?._id, selectedPeriod);
    }
  }, [user?._id, selectedPeriod, fetchAllData]);

  // Optimized format functions (stable)
  const formatDate = useCallback((date, formatStr) => {
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
  }, []);

  const formatTime = useCallback((time) => {
    if (!time) return null;
    if (typeof time === "string") return time;
    const d = new Date(time);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }, []);

  const getDefaultTimes = useCallback((schedule) => {
    const start = schedule.formattedStartTime;
    const end = schedule.formattedEndTime;
    if (!start || !end) {
      return { startTime: "Unscheduled", endTime: "" };
    }
    return { startTime: start, endTime: end };
  }, []);

  const getMemberDisplayName = useCallback((member) => {
    return (
      member?.username ||
      member?.name ||
      member?.userId?.username ||
      member?._id ||
      "Unknown"
    );
  }, []);

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

  // Optimized memberMap (only recreate if allMembers changes)
  const memberMap = useMemo(() => {
    const map = new Map();
    allMembers.forEach((member) => {
      map.set(member._id, getMemberDisplayName(member));
    });
    return map;
  }, [allMembers]);

  // Enhanced todaySchedules (limit processing if too many)
  const enhancedTodaySchedules = useMemo(() => {
    // Limit to first 50 for performance if too many
    const limitedSchedules = todaySchedules.slice(0, 50);
    return limitedSchedules
      .map((schedule) => {
        const rawMember = schedule.memberId;
        let memberId = null;
        let memberName = "Unknown";
        let fullMemberObj = null;

        if (rawMember && typeof rawMember === "object") {
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
  }, [
    todaySchedules,
    allMembers,
    memberMap,
    formatTime,
    toAvatarUrl,
    getMemberDisplayName,
  ]);

  const handleMarkComplete = useCallback(
    async (scheduleId) => {
      try {
        await markScheduleComplete(scheduleId);
        await getTodaySchedules(user?._id);
      } catch (error) {
        setError(error);
        console.error("Error marking schedule complete:", error);
      }
    },
    [markScheduleComplete, getTodaySchedules, user?._id]
  );

  // Enhanced students (limit if too many)
  const enhancedStudents = useMemo(() => {
    if (!currentTrainer?.students || currentTrainer.students.length === 0)
      return [];
    // Limit to 50 for performance
    const limitedStudents = currentTrainer.students.slice(0, 50);
    return limitedStudents.map((student) => ({
      ...student,
      displayName: getMemberDisplayName(student),
      avatar:
        toAvatarUrl(
          student.profileImage || student.avatar || student.userId?.profileImage
        ) || "/default-avatar.png",
    }));
  }, [currentTrainer, toAvatarUrl, getMemberDisplayName]);

  // Status data
  const statusData = useMemo(
    () => ({
      totalStudents: enhancedStudents.length,
      totalTemplates:
        (workoutTemplates || []).length + (dietTemplates || []).length,
      todaySchedulesCount: enhancedTodaySchedules.length,
      activePlansCount: (_trainerPlans || []).filter(
        (plan) => plan.status === "active" || !plan.isCompleted
      ).length,
    }),
    [
      enhancedStudents.length,
      workoutTemplates,
      dietTemplates,
      enhancedTodaySchedules.length,
      _trainerPlans,
    ]
  );

  // Global loading
  const isGlobalLoading = useMemo(
    () => isLoadingSchedules || isLoadingTrainer || isRefreshing || !user?._id,
    [isLoadingSchedules, isLoadingTrainer, isRefreshing, user?._id]
  );

  if (error && !isGlobalLoading) {
    return <ErrorFallback error={error} onRetry={handleRefresh} />;
  }

  return (
    <main className="p-4 md:p-6 lg:p-8 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 min-h-screen relative">
      {/* Refresh Button */}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="fixed top-4 right-4 z-10 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        aria-label="Дахин ачаалах"
      >
        {isRefreshing ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <RefreshCw className="w-5 h-5" />
        )}
      </button>

      {/* Loading Overlay */}
      {isGlobalLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Ачаалж байна...</p>
          </div>
        </div>
      )}

      {/* Status Cards */}
      <Suspense
        fallback={<div className="h-24 bg-white rounded-lg animate-pulse" />}
      >
        <StatusCards {...statusData} />
      </Suspense>

      {/* Schedule and Students */}
      <div className="mb-8 grid grid-cols-1 min-h-90 lg:grid-cols-[1fr_355px] gap-6">
        <div className="lg:col-span-1 h-full">
          <Suspense
            fallback={
              <div className="h-64 bg-white rounded-lg animate-pulse" />
            }
          >
            <TodaysSchedule
              enhancedTodaySchedules={enhancedTodaySchedules}
              isLoadingSchedules={isLoadingSchedules}
              formatDate={formatDate}
              getDefaultTimes={getDefaultTimes}
              handleMarkComplete={handleMarkComplete}
              user={user}
            />
          </Suspense>
        </div>

        <div className="lg:col-span-1 h-full">
          <Suspense
            fallback={
              <div className="h-64 bg-white rounded-lg animate-pulse" />
            }
          >
            <MyStudents
              enhancedStudents={enhancedStudents}
              isLoadingTrainer={isLoadingTrainer}
            />
          </Suspense>
        </div>
      </div>

      {/* Aggregate Progress */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center justify-between">
          Нийт хэрэглэгчдийн ахиц
          {isLoadingAggregate && (
            <span className="text-sm text-gray-500">Шинэчлэгдэж байна...</span>
          )}
        </h2>
        <Suspense
          fallback={<div className="h-64 bg-white rounded-lg animate-pulse" />}
        >
          {isLoadingAggregate ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
              <p className="text-gray-500">Ачаалж байна...</p>
            </div>
          ) : aggregateMeasurement ? (
            <OverallProgressChart
              aggregateData={aggregateMeasurement}
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
            />
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Өгөгдөл байхгүй. Хэмжилт нэмнэ үү.
            </div>
          )}
        </Suspense>
      </div>

      {/* Templates and Plans */}
      <Suspense
        fallback={
          <div className="h-64 bg-white rounded-lg animate-pulse mb-8" />
        }
      >
        <MyTemplates onViewTemplate={handleViewTemplate} />
      </Suspense>
      <Suspense
        fallback={
          <div className="h-64 bg-white rounded-lg animate-pulse mb-8" />
        }
      >
        <MyPlans
          plans={_trainerPlans}
          currentTrainer={currentTrainer}
          toAvatarUrl={toAvatarUrl}
          onViewTemplate={handleViewTemplate}
        />
      </Suspense>

      {/* Detail Modal */}
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
