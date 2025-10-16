// PlanT.jsx
import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Target,
  Clock,
  Dumbbell,
  Utensils,
  User,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { usePlanStore } from "../../../store/planStore";
import { useUserStore } from "../../../store/userStore";
import { useTemplateStore } from "../../../store/TemplateStore";
import { useMemberStore } from "../../../store/memberStore";
import { useTrainerStore } from "../../../store/trainerStore";
import DetailModal from "../../../components/Template/DetailModal";
import TabbedPlanModal from "../../../components/Plan/TabbedPlanModal";
import UserDetailModal from "../../../components/Plan/UserDetailModal";

// ✅ Memoized Card
const PlanCard = memo(
  ({ p, onView, onViewUser, onEdit, onDelete, currentTrainer }) => {
    const isActive = p.status === "active";
    const statusClass = isActive ? "bg-green-500" : "bg-red-500";

    // ✅ Use useMemo for expensive computations
    const memberId = React.useMemo(() => p.memberId?._id, [p.memberId]);
    const memberDetails = React.useMemo(
      () =>
        currentTrainer?.students?.find(
          (s) => String(s._id) === String(memberId)
        ),
      [currentTrainer?.students, memberId]
    );

    // ✅ Fully populated object for UserDetailModal - fallback to p.memberId if needed
    const memberUserObj = React.useMemo(
      () =>
        memberDetails
          ? {
              _id: memberDetails._id,
              surname: memberDetails.surname,
              username: memberDetails.username,
              email: memberDetails.email,
              phone: memberDetails.phone,
              age: memberDetails.age,
              height: memberDetails.height,
              weight: memberDetails.weight,
              gender: memberDetails.gender,
              address: memberDetails.address,
              goal: memberDetails.goal,
              profileImage: memberDetails.profileImage,
              membership: memberDetails.membership,
              subGoals: memberDetails.subGoals,
            }
          : p.memberId
          ? {
              _id: p.memberId._id,
              surname: p.memberId.surname || p.memberId.userId?.surname,
              username: p.memberId.username || p.memberId.userId?.username,
              email: p.memberId.email || p.memberId.userId?.email,
              phone: p.memberId.phone || p.memberId.userId?.phone,
              age: p.memberId.age || p.memberId.userId?.age,
              height: p.memberId.height || p.memberId.userId?.height,
              weight: p.memberId.weight || p.memberId.userId?.weight,
              gender: p.memberId.gender || p.memberId.userId?.gender,
              address: p.memberId.address || p.memberId.userId?.address,
              goal: p.memberId.goal || p.memberId.userId?.goal,
              profileImage:
                p.memberId.profileImage || p.memberId.userId?.profileImage,
              membership: p.memberId.membership,
              subGoals: p.memberId.subGoals,
            }
          : null,
      [memberDetails, p.memberId]
    );

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
            className="flex items-center justify-between px-4 py-2 bg-cyan-50 hover:bg-cyan-100 rounded-xl border border-cyan-200 transition-all cursor-pointer"
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
            className="flex items-center justify-between px-4 py-2 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-200 transition-all cursor-pointer"
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
            <span className="text-xs text-gray-500">
              {memberDetails?.username ||
                p.memberId?.username ||
                p.memberId?.userId?.username ||
                "No member"}
            </span>
          </button>
        </div>
      </motion.div>
    );
  }
);

// ✅ Main Page
const PlanT = () => {
  const { user, fetchUser } = useUserStore();
  const { plans, getPlans, isLoading, deletePlan, updatePlan, createPlan } =
    usePlanStore();
  const { getWorkoutTemplates, getDietTemplates } = useTemplateStore();
  const { getAllMembers } = useMemberStore();
  const { currentTrainer, getTrainerById } = useTrainerStore();

  const [localPlans, setLocalPlans] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 6;

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
      // Parallel fetching for speed
      Promise.all([
        getPlans(user._id),
        getWorkoutTemplates(user._id),
        getDietTemplates(user._id),
        getAllMembers(),
        getTrainerById(user._id),
      ]).catch(console.error);
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

  const totalPages = Math.ceil(localPlans.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const currentPlans = localPlans.slice(startIndex, startIndex + cardsPerPage);

  const handleView = (type, data) => {
    setModalType(type);
    setSelected(data);
    setIsModalOpen(true);
  };

  // ✅ New simplified: no fetch, use full object
  const handleViewUser = (userData) => {
    if (!userData) return;
    setSelectedUser(userData);
    setIsUserModalOpen(true);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    await deletePlan(id);
    setLocalPlans(localPlans.filter((p) => p._id !== id));
  };

  const handleSaveEdit = async (updatedPlan) => {
    // Optimistic update for immediate feedback
    setLocalPlans((prev) =>
      prev.map((p) =>
        String(p._id) === String(updatedPlan._id) ? { ...p, ...updatedPlan } : p
      )
    );
    // Close modal immediately
    setIsEditModalOpen(false);

    // Background refetch
    try {
      await updatePlan(updatedPlan._id, updatedPlan);
      if (user?._id) {
        Promise.all([
          getPlans(user._id),
          getWorkoutTemplates(user._id),
          getDietTemplates(user._id),
          getTrainerById(user._id),
        ]);
      }
    } catch (err) {
      console.error("Update failed:", err);
      // Revert on error
      if (user?._id) {
        await getPlans(user._id);
      }
      alert("Update failed, changes reverted.");
    }
  };

  const handleCreate = async (newPlan) => {
    // Close modal immediately
    setIsCreateModalOpen(false);

    // Background create
    try {
      await createPlan(newPlan);
      if (user?._id) {
        Promise.all([
          getPlans(user._id),
          getWorkoutTemplates(user._id),
          getDietTemplates(user._id),
          getTrainerById(user._id),
        ]);
      }
    } catch (err) {
      console.error("Create failed:", err);
      alert("Create failed, please try again.");
    }
  };

  return (
    <div className="p-8 h-full bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg shadow-lg">
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

      {isLoading || !currentTrainer ? (
        <div className="text-center text-gray-500 py-12">
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
            <AnimatePresence>
              {currentPlans.map((p, idx) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  layout
                >
                  <PlanCard
                    p={p}
                    onView={handleView}
                    onViewUser={handleViewUser}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    currentTrainer={currentTrainer}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

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
          <TabbedPlanModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            plan={editingPlan}
            onSave={handleSaveEdit}
            isEdit={true}
          />
        )}
        {isCreateModalOpen && (
          <TabbedPlanModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreate}
            isEdit={false}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlanT;
