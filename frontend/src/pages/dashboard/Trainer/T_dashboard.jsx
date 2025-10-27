// Updated TrainerMainContent.jsx (import StatusCards and use it instead of inline cards)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useUserStore } from "../../../store/userStore"; // Adjust path as needed
import { useTemplateStore } from "../../../store/TemplateStore"; // Adjust path as needed
import { useScheduleStore } from "../../../store/useScheduleStore";
import { useMemberStore } from "../../../store/memberStore";
import { usePlanStore } from "../../../store/planStore";
import { useTrainerStore } from "../../../store/trainerStore";
import OverviewTemplateCard from "../../../components/Trainer/home/OverviewTemplateCard"; // Updated import for the new overview card
import DetailModal from "../../../components/Template/DetailModal"; // Import DetailModal for view details
import { AnimatePresence, motion } from "framer-motion"; // For animations like in TemplateManager
import TodaysSchedule from "../../../components/Trainer/home/TodaysSchedule"; // New import for separated component
import MyStudents from "../../../components/Trainer/home/MyStudents"; // New import for separated students component
import MyTemplates from "../../../components/Trainer/home/MyTemplates"; // New import for separated templates component
import MyPlans from "../../../components/Trainer/home/MyPlans"; // New import for separated plans component
import StatusCards from "../../../components/Trainer/home/StatusCards"; // New import for separated status cards component

export default function TrainerMainContent() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  // Removed: currentTemplateIndex, sliderRef, containerRef (now in MyTemplates)

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
  const { workoutTemplates, dietTemplates } = useTemplateStore();
  console.log("Current Trainer Data:", currentTrainer);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?._id) {
      // Keep fetching templates here so data is available for MyTemplates
      useTemplateStore.getState().getWorkoutTemplates(user._id);
      useTemplateStore.getState().getDietTemplates(user._id);
      getTodaySchedules(user._id);
      getAllMembers();
      getPlans(user._id);
      getTrainerById(user._id);
    }
  }, [
    user?._id,
    // Removed template fetches; use store.getState() for direct call if needed, but better to import actions
    getTodaySchedules,
    getAllMembers,
    getPlans,
    getTrainerById,
  ]);

  // Removed: templates, isLoadingTemplates, useEffect for reset index, translateX logic, navigation handlers (now in MyTemplates)

  const handleViewTemplate = (type, data) => {
    setPreviewType(type);
    setPreviewData(data);
    setPreviewOpen(true);
  };

  // Schedule helpers (unchanged)
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

  // Enhanced students list from currentTrainer (assuming currentTrainer.students is an array of student objects)
  const enhancedStudents = useMemo(() => {
    if (!currentTrainer?.students || currentTrainer.students.length === 0)
      return [];
    return currentTrainer.students.map((student) => ({
      ...student,
      displayName: getMemberDisplayName(student),
      avatar:
        toAvatarUrl(
          student.profileImage || student.avatar || student.userId?.profileImage
        ) || "/default-avatar.png",
    }));
  }, [currentTrainer, toAvatarUrl]);

  // Status card data (passed to separate component)
  const totalStudents = enhancedStudents.length;
  const totalTemplates =
    (workoutTemplates || []).length + (dietTemplates || []).length;
  const todaySchedulesCount = enhancedTodaySchedules.length;
  const activePlansCount = useMemo(() => {
    // Assuming plans have a 'status' field where 'active' indicates active plans.
    // Adjust the filter logic based on your plan schema (e.g., !plan.isCompleted || plan.status === 'active').
    return (_trainerPlans || []).filter(
      (plan) => plan.status === "active" || !plan.isCompleted
    ).length;
  }, [_trainerPlans]);

  return (
    <main className="p-4 md:p-6 lg:p-8 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 min-h-screen">
      {/* Status Cards Section - Using separate component */}
      <StatusCards
        totalStudents={totalStudents}
        activePlansCount={activePlansCount}
        totalTemplates={totalTemplates}
        todaySchedulesCount={todaySchedulesCount}
      />

      {/* Today's Schedule and Students Section - Grid layout for equal height */}
      <div className="mb-8 grid grid-cols-1 min-h-90 lg:grid-cols-[1fr_355px] gap-6">
        {/* Today's Schedule - Left side */}
        <div className="lg:col-span-1 h-full">
          <TodaysSchedule
            enhancedTodaySchedules={enhancedTodaySchedules}
            isLoadingSchedules={isLoadingSchedules}
            formatDate={formatDate}
            getDefaultTimes={getDefaultTimes}
            handleMarkComplete={handleMarkComplete}
            user={user}
          />
        </div>

        {/* Students Section - Right side */}
        <div className="lg:col-span-1 h-full">
          <MyStudents
            enhancedStudents={enhancedStudents}
            isLoadingTrainer={isLoadingTrainer}
          />
        </div>
      </div>

      {/* Separated Templates Overview */}
      <MyTemplates onViewTemplate={handleViewTemplate} />

      {/* Separated Plans Overview - New section */}
      <MyPlans
        plans={_trainerPlans}
        currentTrainer={currentTrainer}
        toAvatarUrl={toAvatarUrl}
        onViewTemplate={handleViewTemplate} // delegate preview to parent modal
      />

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
