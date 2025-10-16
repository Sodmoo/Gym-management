// TabbedPlanModal.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Target, Dumbbell, User, Edit, Plus, X } from "lucide-react";
import { useUserStore } from "../../store/userStore";
import { useMemberStore } from "../../store/memberStore";
import { useTemplateStore } from "../../store/TemplateStore";
import { useTrainerStore } from "../../store/trainerStore";

const TabbedPlanModal = ({
  isOpen,
  onClose,
  onSave,
  plan = null,
  isEdit = false,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active");
  const [workoutTemplate, setWorkoutTemplate] = useState("");
  const [dietTemplate, setDietTemplate] = useState("");
  const [memberId, setMemberId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  const { user } = useUserStore();
  const { members, getAllMembers } = useMemberStore();
  const {
    workoutTemplates,
    dietTemplates,
    getWorkoutTemplates,
    getDietTemplates,
  } = useTemplateStore();
  const { currentTrainer, getTrainerById } = useTrainerStore();

  useEffect(() => {
    if (user?._id) {
      getWorkoutTemplates(user._id);
      getDietTemplates(user._id);
      if (typeof getTrainerById === "function") {
        getTrainerById(user._id).catch(() => {});
      }
    }
    getAllMembers?.();
  }, [
    user?._id,
    getWorkoutTemplates,
    getDietTemplates,
    getAllMembers,
    getTrainerById,
  ]);

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

  const eligibleMembers = useMemo(() => {
    const trainerStudents = (currentTrainer?.students || [])
      .map((s) => {
        const id = s.memberId || s._id || (s.userId && s.userId._id) || null;
        const username =
          s.userId?.username ||
          s.username ||
          s.surname ||
          (id ? `Member ${String(id).slice(-4)}` : "Member");
        const email = s.userId?.email || s.email || "";
        const avatarRaw =
          s.profileImage || s.avatar || s.userId?.profileImage || null;
        return {
          _id: id ? String(id) : null,
          username,
          email,
          avatar: toAvatarUrl(avatarRaw),
          user: s.userId || s,
        };
      })
      .filter((m) => m && m._id);

    if (trainerStudents.length) return trainerStudents;

    return (members || [])
      .filter((m) => {
        if (!m) return false;
        if (m.trainerId && String(m.trainerId) === String(user?._id))
          return true;
        if (
          m.userId?.trainerId &&
          String(m.userId.trainerId) === String(user?._id)
        )
          return true;
        return false;
      })
      .map((m) => {
        const id = m._id || (m.userId && m.userId._id) || null;
        const username =
          m.userId?.username ||
          m.username ||
          m.surname ||
          (id ? `Member ${String(id).slice(-4)}` : "Member");
        const email = m.userId?.email || m.email || "";
        const avatarRaw =
          m.profileImage || m.avatar || m.userId?.profileImage || null;
        return {
          _id: id ? String(id) : null,
          username,
          email,
          avatar: toAvatarUrl(avatarRaw),
          user: m.userId || m,
        };
      })
      .filter((m) => m && m._id);
  }, [currentTrainer?.students, members, user?._id, toAvatarUrl]);

  const filteredMembers = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return eligibleMembers;
    return eligibleMembers.filter((member) => {
      return (
        (member.username || "").toLowerCase().includes(q) ||
        (member.email || "").toLowerCase().includes(q)
      );
    });
  }, [eligibleMembers, searchQuery]);

  useEffect(() => {
    if (plan && isEdit) {
      setTitle(plan.title || "");
      setGoal(plan.goal || "");
      setStartDate(
        plan.startDate
          ? new Date(plan.startDate).toISOString().split("T")[0]
          : ""
      );
      setEndDate(
        plan.endDate ? new Date(plan.endDate).toISOString().split("T")[0] : ""
      );
      setStatus(plan.status || "active");
      setWorkoutTemplate(
        plan.workoutTemplate?._id || plan.workoutTemplate || ""
      );
      setDietTemplate(plan.dietTemplate?._id || plan.dietTemplate || "");
      // robust member matching: plan.memberId can be id-string or populated object
      let selected =
        eligibleMembers.find((m) => String(m._id) === String(plan.memberId)) ||
        eligibleMembers.find(
          (m) => String(m._id) === String(plan.memberId?._id)
        );
      if (!selected && plan.memberId && typeof plan.memberId === "object") {
        const id = plan.memberId._id || plan.memberId.memberId || null;
        selected = {
          _id: id ? String(id) : null,
          username:
            plan.memberId.username ||
            plan.memberId.surname ||
            plan.memberId.userId?.username ||
            `Member ${String(id || "").slice(-4)}`,
          email: plan.memberId.email || plan.memberId.userId?.email || "",
          avatar: toAvatarUrl(
            plan.memberId.profileImage || plan.memberId.avatar
          ),
          user: plan.memberId.userId || plan.memberId,
          raw: plan.memberId,
        };
      }
      setMemberId(
        selected?._id ||
          (typeof plan.memberId === "string" ? plan.memberId : "")
      );
      setSelectedMember(selected || null);
    } else {
      // Reset for create
      setTitle("");
      setGoal("");
      setStartDate("");
      setEndDate("");
      setStatus("active");
      setWorkoutTemplate("");
      setDietTemplate("");
      setMemberId("");
      setSelectedMember(null);
    }
  }, [plan, isEdit, eligibleMembers, toAvatarUrl]);

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setMemberId(member._id);
    setSearchQuery("");
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const safeDate = (d) => {
      if (!d) return undefined;
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? undefined : dt.toISOString();
    };

    // normalize trainer id (could be object or id)
    const normalizedTrainerId =
      isEdit && plan
        ? plan.trainerId?._id || plan.trainerId || user._id
        : user._id;

    const payload = {
      title: title?.trim(),
      goal: goal?.trim() || undefined,
      startDate: safeDate(startDate),
      endDate: safeDate(endDate),
      status,
      workoutTemplate: workoutTemplate || undefined,
      dietTemplate: dietTemplate || undefined,
      trainerId: normalizedTrainerId,
      memberId: memberId || undefined,
      ...(isEdit && plan?._id ? { _id: plan._id } : {}),
    };

    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error("Plan save failed:", err);
      alert(
        err?.message ||
          (err?.response?.data?.message
            ? err.response.data.message
            : "Save failed")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 0, label: "Basic Info" },
    { id: 1, label: "Assign Templates" },
    { id: 2, label: "Assign Member" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ duration: 0.25 }}
        className="bg-white/90 rounded-lg shadow-xl border border-gray-100 max-w-170 w-full mx-2 p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {isEdit ? (
              <Edit className="text-yellow-600" />
            ) : (
              <Plus className="text-green-600" />
            )}
            {isEdit ? "Edit Plan" : "Create Plan"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-cyan-300 text-black hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-4 border-b-2 font-medium text-sm text-center transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="mt-4 space-y-4">
            {activeTab === 0 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal
                  </label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </>
            )}
            {activeTab === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workout Template
                  </label>
                  <select
                    value={workoutTemplate}
                    onChange={(e) => setWorkoutTemplate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Workout Template</option>
                    {workoutTemplates?.map((template) => (
                      <option key={template._id} value={template._id}>
                        {template.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diet Template
                  </label>
                  <select
                    value={dietTemplate}
                    onChange={(e) => setDietTemplate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Diet Template</option>
                    {dietTemplates?.map((template) => (
                      <option key={template._id} value={template._id}>
                        {template.title}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {activeTab === 2 && (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search members by name or email..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                {selectedMember && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800">
                      Selected: {selectedMember.username}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMember(null);
                        setMemberId("");
                      }}
                      className="text-xs text-blue-600 hover:underline mt-1"
                    >
                      Change Member
                    </button>
                  </div>
                )}
                {!selectedMember && (
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredMembers.length === 0 ? (
                      <p className="text-gray-500 text-sm p-4 text-center">
                        No members found
                      </p>
                    ) : (
                      filteredMembers.map((member) => (
                        <div
                          key={member._id}
                          onClick={() => handleMemberSelect(member)}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 overflow-hidden">
                              {member.avatar ? (
                                // avatar already normalized to full URL by eligibleMembers
                                <img
                                  src={member.avatar}
                                  alt={member.username}
                                  className="w-full h-full rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = ""; // fallback will show initial
                                  }}
                                />
                              ) : (
                                <span className="uppercase">
                                  {(member.username || "U").charAt(0)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 ml-3">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {member.username}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {eligibleMembers.length === 0 && !selectedMember && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No assigned members
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-60 ${
                isEdit
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {submitting
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                ? "Save"
                : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default TabbedPlanModal;
