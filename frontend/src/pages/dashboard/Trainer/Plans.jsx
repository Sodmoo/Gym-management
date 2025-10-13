import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Target,
  Clock,
  Check,
  Dumbbell,
  Utensils,
  User,
  X,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { usePlanStore } from "../../../store/planStore";
import { useUserStore } from "../../../store/userStore";
import { useTemplateStore } from "../../../store/TemplateStore";
import { useMemberStore } from "../../../store/memberStore";
import { useTrainerStore } from "../../../store/trainerStore";

// ✅ User Detail Modal
const UserDetailModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

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
        className="bg-white/90 rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full mx-6 p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="text-blue-600" />
            User Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 text-sm text-gray-700">
          <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <User size={16} className="text-blue-500" />
              Username
            </h3>
            <p className="text-gray-900">{user.username}</p>
          </div>
          {user.email && (
            <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Mail size={16} className="text-blue-500" />
                Email
              </h3>
              <p className="text-gray-900">{user.email}</p>
            </div>
          )}
          {user.phone && (
            <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Phone size={16} className="text-blue-500" />
                Phone
              </h3>
              <p className="text-gray-900">{user.phone}</p>
            </div>
          )}
          {user.location && (
            <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" />
                Location
              </h3>
              <p className="text-gray-900">{user.location}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ✅ Create Plan Modal
const CreatePlanModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active");
  const [workoutTemplate, setWorkoutTemplate] = useState("");
  const [dietTemplate, setDietTemplate] = useState("");
  const [memberId, setMemberId] = useState("");

  const { user } = useUserStore();
  const { members, getAllMembers } = useMemberStore();
  const {
    workoutTemplates,
    dietTemplates,
    getWorkoutTemplates,
    getDietTemplates,
  } = useTemplateStore();

  // use trainer store to get full trainer with populated students
  const { currentTrainer, getTrainerById } = useTrainerStore();

  useEffect(() => {
    // load templates, members and trainer record
    if (user?._id) {
      getWorkoutTemplates(user._id);
      getDietTemplates(user._id);
      if (typeof getTrainerById === "function") {
        // fetch trainer document that includes populated students
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

  // Prefer students from currentTrainer if present (getTrainerById returns populated students)
  const eligibleMembers =
    currentTrainer?.students && currentTrainer.students.length
      ? // normalize student objects to expected member shape
        currentTrainer.students.map((s) => {
          // some student objects may already be member documents or user docs
          return {
            _id: s.memberId || s._id,
            username:
              s.userId?.username ||
              s.username ||
              s.name ||
              s.surname ||
              `Member ${s._id.slice(-4)}`,
            user: s.userId || s, // full user object for details
            raw: s,
          };
        })
      : // fallback to members list filtered by trainer relation
        (members || [])
          .filter((m) => {
            if (!m) return false;
            // direct trainerId on member
            if (m.trainerId && String(m.trainerId) === String(user?._id))
              return true;
            // nested userId.trainerId
            if (
              m.userId?.trainerId &&
              String(m.userId.trainerId) === String(user?._id)
            )
              return true;
            return false;
          })
          .map((m) => ({
            _id: m._id,
            username:
              m.userId?.username ||
              m.username ||
              m.surname ||
              `Member ${m._id.slice(-4)}`,
            user: m.userId || m,
            raw: m,
          }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPlan = {
      title,
      goal,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status,
      trainerId: user._id,
      memberId,
      workoutTemplate,
      dietTemplate,
    };
    onSave(newPlan);
    onClose();
  };

  if (!isOpen) return null;

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
        className="bg-white/90 rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full mx-6 p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Plus className="text-green-600" />
            Create Plan
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned Member
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Member</option>
              {eligibleMembers.length === 0 && (
                <option value="">No assigned members</option>
              )}
              {eligibleMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.username}
                </option>
              ))}
            </select>
          </div>
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
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Create
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ✅ Edit Plan Modal
const EditPlanModal = ({ isOpen, onClose, plan, onSave }) => {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active");
  const [workoutTemplate, setWorkoutTemplate] = useState("");
  const [dietTemplate, setDietTemplate] = useState("");

  const { user } = useUserStore();
  const {
    workoutTemplates,
    dietTemplates,
    getWorkoutTemplates,
    getDietTemplates,
  } = useTemplateStore();

  useEffect(() => {
    if (user?._id) {
      getWorkoutTemplates(user._id);
      getDietTemplates(user._id);
    }
  }, [user?._id, getWorkoutTemplates, getDietTemplates]);

  useEffect(() => {
    if (plan) {
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
    }
  }, [plan]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedPlan = {
      ...plan,
      title,
      goal,
      startDate: startDate ? new Date(startDate).toISOString() : plan.startDate,
      endDate: endDate ? new Date(endDate).toISOString() : plan.endDate,
      status,
      trainerId: plan.trainerId,
      memberId: plan.memberId,
      workoutTemplate,
      dietTemplate,
    };
    onSave(updatedPlan);
    onClose();
  };

  if (!isOpen) return null;

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
        className="bg-white/90 rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full mx-6 p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Edit className="text-yellow-600" />
            Edit Plan
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ✅ Modal Component (Reusable)
const DetailModal = ({ isOpen, onClose, title, type, data }) => {
  if (!isOpen) return null;

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
        className="bg-white/90 rounded-2xl shadow-2xl border border-gray-100 max-w-6xl w-full mx-6 p-6 overflow-y-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {type === "workout" ? (
              <Dumbbell className="text-cyan-600" />
            ) : (
              <Utensils className="text-teal-600" />
            )}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 text-sm text-gray-700">
          {type === "workout" && data?.program?.length ? (
            <>
              {/* Goal and Description */}
              <div className="bg-cyan-100 rounded-xl p-4 mb-4 flex flex-row gap-4">
                {data.goal && (
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Target size={16} className="text-cyan-500" />
                      Goal
                    </h3>
                    <p className="text-gray-900">{data.goal}</p>
                  </div>
                )}
                {data.description && (
                  <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2 ">
                      <Clock size={16} className="text-cyan-500" />
                      Description
                    </h3>
                    <p className="text-gray-900">{data.description}</p>
                  </div>
                )}
              </div>

              {/* 5-Day Workout Table */}
              <div className="overflow-x-auto">
                <table className="w-full bg-white border border-cyan-200 rounded-xl shadow-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-cyan-50 to-cyan-100">
                      <th className="px-4 py-3 text-left font-semibold text-gray-800 border-b border-cyan-200">
                        <span className="flex items-center gap-2">
                          <Dumbbell className="text-cyan-600" size={16} />
                          Weekly
                        </span>
                      </th>
                      {data.program.slice(0, 5).map((day, i) => {
                        const hasExercises = day.exercises?.length > 0;
                        const hasRest =
                          day.exercises?.some((ex) => ex.rest && ex.rest > 0) ||
                          false;
                        const wideWidth =
                          hasExercises && hasRest ? "w-50" : "w-30";
                        const color =
                          hasExercises && hasRest
                            ? "bg-blue-200"
                            : "bg-blue-400 text-white";
                        return (
                          <th
                            key={i}
                            className={`px-4 py-3 text-center font-semibold text-gray-800 border-b border-cyan-200 ${wideWidth} ${color}`}
                          >
                            {day.dayName}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border-r border-cyan-200 font-medium text-gray-700 bg-cyan-50">
                        Exercises
                      </td>
                      {data.program.slice(0, 5).map((day, i) => {
                        const hasExercises = day.exercises?.length > 0;
                        const hasRest =
                          day.exercises?.some((ex) => ex.rest && ex.rest > 0) ||
                          false;
                        const wideWidth =
                          hasExercises && hasRest ? "w-48" : "w-32";

                        return (
                          <td
                            key={i}
                            className={`px-4 py-2 border-l border-cyan-200 ${wideWidth}`}
                          >
                            <ul className="space-y-2 text-xs mt-3">
                              {day.exercises?.map((ex, idx) => (
                                <li
                                  key={idx}
                                  className="pb-2 border-b border-black last:pb-0 last:border-b-0"
                                >
                                  <span className="font-medium text-gray-800 mb-1 block">
                                    {ex.category
                                      ? `${ex.category}: ${ex.name}`
                                      : ex.name}
                                  </span>
                                  <span className="text-gray-600 block">
                                    {!ex.rest || ex.rest <= 0
                                      ? ""
                                      : `${ex.sets}set *  ${ex.reps}rep * ${ex.rest}sec`}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : type === "diet" && data?.dailyMeals?.length ? (
            <>
              {/* Diet Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {data.goal && (
                  <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                    <h3 className="font-semibold text-teal-800 flex items-center gap-2 mb-1">
                      <Target size={16} className="text-teal-500" />
                      Goal
                    </h3>
                    <p className="text-teal-700 text-sm">{data.goal}</p>
                  </div>
                )}
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                  <h3 className="font-semibold text-teal-800 flex items-center gap-2 mb-1">
                    <Clock size={16} className="text-teal-500" />
                    Duration
                  </h3>
                  <p className="text-teal-700 text-sm">
                    {data.durationDays || 7} days
                  </p>
                </div>
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                  <h3 className="font-semibold text-teal-800 flex items-center gap-2 mb-1">
                    <Check size={16} className="text-teal-500" />
                    Total Calories
                  </h3>
                  <p className="text-teal-700 text-sm">
                    {data.totalCalories || 0} kcal
                  </p>
                </div>
                {data.notes && (
                  <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                    <h3 className="font-semibold text-teal-800 flex items-center gap-2 mb-1">
                      <Edit size={16} className="text-teal-500" />
                      Notes
                    </h3>
                    <p className="text-teal-700 text-sm">{data.notes}</p>
                  </div>
                )}
              </div>

              {/* Diet Meals Table */}
              <div className="overflow-x-auto">
                <table className="w-full bg-white border border-teal-200 rounded-xl shadow-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-teal-50 to-teal-100">
                      <th className="px-4 py-3 text-left font-semibold text-gray-800 border-b border-teal-200">
                        Meal
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-800 border-b border-teal-200">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-800 border-b border-teal-200">
                        Calories (kcal)
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-800 border-b border-teal-200">
                        Protein (g)
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-800 border-b border-teal-200">
                        Carbs (g)
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-800 border-b border-teal-200">
                        Fat (g)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.dailyMeals.map((meal, i) => (
                      <tr
                        key={i}
                        className="border-b border-teal-100 hover:bg-teal-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {meal.name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {meal.description || "No description"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-teal-600">
                          {meal.calories || 0}
                        </td>
                        <td className="px-4 py-3 text-right text-teal-600">
                          {meal.protein || 0}
                        </td>
                        <td className="px-4 py-3 text-right text-teal-600">
                          {meal.carbs || 0}
                        </td>
                        <td className="px-4 py-3 text-right text-teal-600">
                          {meal.fat || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400 italic py-6">
              No {type} data available.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ✅ Card
const PlanCard = ({
  p,
  onView,
  onViewUser,
  onEdit,
  onDelete,
  currentTrainer,
}) => {
  const isActive = p.status === "active";
  const statusClass = isActive ? "bg-green-500" : "bg-red-500";

  // Find member details from currentTrainer.students
  const memberDetails = p.memberId
    ? currentTrainer?.students?.find(
        (s) => (s.memberId || s._id) === p.memberId
      )
    : null;
  const memberUsername = memberDetails
    ? memberDetails.userId?.username ||
      memberDetails.username ||
      memberDetails.surname ||
      `Member ${p.memberId?.slice(-4)}`
    : p.memberId?.userId?.username || "No member";
  const memberUserObj = memberDetails
    ? memberDetails.userId || memberDetails
    : p.memberId?.userId || null;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{p.title}</h2>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Target size={14} className="text-cyan-500" />
            {p.goal}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 text-xs text-white font-semibold rounded-full shadow ${statusClass}`}
          >
            {isActive ? "Active" : "Completed"}
          </span>
          <button
            onClick={() => onEdit(p)}
            className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full transition"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(p._id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3 text-gray-600">
        <Clock size={14} />
        <span className="text-sm">
          {new Date(p.startDate).toLocaleDateString()} →{" "}
          {new Date(p.endDate).toLocaleDateString()}
        </span>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <button
          onClick={() => onView("workout", p.workoutTemplate)}
          className="flex items-center justify-between px-4 py-2 bg-cyan-50 hover:bg-cyan-100 rounded-xl border border-cyan-200 transition-all"
        >
          <span className="flex items-center gap-2 text-cyan-700 font-semibold">
            <Dumbbell size={16} /> Workout Plan
          </span>
          <span className="text-xs text-gray-500">
            {p.workoutTemplate?.program?.length || 0} days
          </span>
        </button>
        <button
          onClick={() => onView("diet", p.dietTemplate)}
          className="flex items-center justify-between px-4 py-2 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-200 transition-all"
        >
          <span className="flex items-center gap-2 text-teal-700 font-semibold">
            <Utensils size={16} /> Diet Plan
          </span>
          <span className="text-xs text-gray-500">
            {p.dietTemplate?.dailyMeals?.length || 0} meals
          </span>
        </button>
        <button
          onClick={() => onViewUser(memberUserObj)}
          className="flex items-center justify-between px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2 text-blue-700 font-semibold">
            <User size={16} /> Assigned Member
          </span>
          <span className="text-xs text-gray-500">{memberUsername}</span>
        </button>
      </div>
    </motion.div>
  );
};

// ✅ Main Page
const PlanT = () => {
  const { user, fetchUser } = useUserStore();
  const { plans, getPlans, isLoading, deletePlan, updatePlan, createPlan } =
    usePlanStore();
  const {
    workoutTemplates,
    dietTemplates,
    getWorkoutTemplates,
    getDietTemplates,
  } = useTemplateStore();
  const { getAllMembers } = useMemberStore();

  // add trainer store function here so trainer record is fetched once
  const { currentTrainer, getTrainerById } = useTrainerStore();

  const [localPlans, setLocalPlans] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 6; // Increased to 9 cards per page for more than 6 on screen

  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?._id) {
      getPlans(user._id);
      getWorkoutTemplates(user._id);
      getDietTemplates(user._id);
      getAllMembers();
      getTrainerById(user._id);
    }
  }, [
    user?._id,
    getPlans,
    getWorkoutTemplates,
    getDietTemplates,
    getAllMembers,
    getTrainerById,
  ]);

  useEffect(() => {
    setLocalPlans(plans);
  }, [plans]);

  // Pagination reset logic: Reset to page 1 if current page exceeds available pages after list length changes
  useEffect(() => {
    const totalPages = Math.ceil(localPlans.length / cardsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [localPlans.length, currentPage, cardsPerPage]);

  // pagination logic
  const totalPages = Math.ceil(localPlans.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const currentPlans = localPlans.slice(startIndex, startIndex + cardsPerPage);

  useEffect(() => {
    const checkAndUpdatePlans = async () => {
      const now = new Date();
      const toUpdate = localPlans.filter(
        (p) => p.status === "active" && new Date(p.endDate) < now
      );
      if (toUpdate.length > 0) {
        try {
          await Promise.all(
            toUpdate.map((p) =>
              updatePlan(p._id, { ...p, status: "completed" })
            )
          );
          setLocalPlans(
            localPlans.map((p) =>
              toUpdate.some((t) => t._id === p._id)
                ? { ...p, status: "completed" }
                : p
            )
          );
        } catch (error) {
          console.error("Error updating plan statuses:", error);
        }
      }
    };

    if (localPlans.length > 0) {
      checkAndUpdatePlans();
    }
  }, [localPlans, updatePlan]);

  const handleView = (type, data) => {
    setModalType(type);
    setSelected(data);
    setIsModalOpen(true);
  };

  const handleViewUser = (userData) => {
    setSelectedUser(userData);
    setIsUserModalOpen(true);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await deletePlan(id);
        setLocalPlans(localPlans.filter((p) => p._id !== id));
      } catch (error) {
        console.error("Error deleting plan:", error);
      }
    }
  };

  const handleSaveEdit = async (updatedPlan) => {
    try {
      await updatePlan(updatedPlan._id, updatedPlan);
      const fullWorkout = workoutTemplates.find(
        (t) => t._id === updatedPlan.workoutTemplate
      );
      const fullDiet = dietTemplates.find(
        (t) => t._id === updatedPlan.dietTemplate
      );
      const updatedWithTemplates = {
        ...updatedPlan,
        workoutTemplate: fullWorkout || updatedPlan.workoutTemplate,
        dietTemplate: fullDiet || updatedPlan.dietTemplate,
      };
      setLocalPlans(
        localPlans.map((p) =>
          p._id === updatedPlan._id ? updatedWithTemplates : p
        )
      );
    } catch (error) {
      console.error("Error updating plan:", error);
    }
    setIsEditModalOpen(false);
  };

  const handleCreate = async (newPlan) => {
    try {
      await createPlan(newPlan);
      await getPlans(user._id);
    } catch (error) {
      console.error("Error creating plan:", error);
    }
    setIsCreateModalOpen(false);
  };

  return (
    <div className="p-8  h-full bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg   shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Calendar size={28} className="text-cyan-600" />
          <h1 className="text-3xl font-bold text-gray-900">Training Plans</h1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <Plus size={20} />
          Add Plan
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 py-12 animate-pulse">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Calendar className="mx-auto mb-3 opacity-60" size={32} />
          </motion.div>
          <p className="text-sm">Loading Plans...</p>
        </div>
      ) : currentPlans.length ? (
        <>
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentPlans.map((p) => (
              <PlanCard
                key={p._id}
                p={p}
                onView={handleView}
                onViewUser={handleViewUser}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currentTrainer={currentTrainer}
              />
            ))}
          </motion.div>

          {/* Pagination Controls */}
          {localPlans.length > cardsPerPage && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:bg-gray-300"
              >
                Prev
              </button>
              <span className="text-gray-700 font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <Calendar className="mx-auto mb-3 opacity-60" size={32} />
          <p className="text-sm font-medium">No plans yet.</p>
          <p className="text-xs mt-1">Create one to get started!</p>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && selected && (
          <DetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={selected?.title}
            type={modalType}
            data={selected}
          />
        )}
        {isUserModalOpen && selectedUser && (
          <UserDetailModal
            isOpen={isUserModalOpen}
            onClose={() => setIsUserModalOpen(false)}
            user={selectedUser}
          />
        )}
        {isEditModalOpen && editingPlan && (
          <EditPlanModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            plan={editingPlan}
            onSave={handleSaveEdit}
          />
        )}
        {isCreateModalOpen && (
          <CreatePlanModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlanT;
