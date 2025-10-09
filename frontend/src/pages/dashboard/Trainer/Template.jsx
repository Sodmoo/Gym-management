import React, { useState, useEffect } from "react";
import TemplateModal from "../../../components/Template/TemplateModal";
import { useUserStore } from "../../../store/userStore";
import { useTemplateStore } from "../../../store/templateStore";
import {
  Plus,
  Trash2,
  Edit,
  Clock,
  List,
  FileText,
  Utensils,
  Dumbbell,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";

/* ----------------------------------------------
   🔹 1. Reusable Icon Button
------------------------------------------------*/
const IconButton = ({ onClick, icon, color = "gray", label }) => {
  const base =
    "p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-cyan-300 shadow-sm";
  const extra =
    color === "red"
      ? "text-red-500 hover:bg-red-50 hover:shadow-md"
      : "text-cyan-700 hover:bg-cyan-50 hover:shadow-md";
  return (
    <button aria-label={label} onClick={onClick} className={`${base} ${extra}`}>
      {icon}
    </button>
  );
};

/* ----------------------------------------------
   🔹 2. Compact Template Card
------------------------------------------------*/
const TemplateCard = ({ t, type, onEdit, onDelete }) => {
  const Icon = type === "workout" ? Dumbbell : Utensils;
  const isWorkout = type === "workout";

  const totalExercises = isWorkout
    ? t.program?.reduce((acc, day) => acc + (day.exercises?.length || 0), 0)
    : 0;
  const totalMeals = !isWorkout ? t.dailyMeals?.length || 0 : 0;

  return (
    <motion.div
      layout
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group bg-white rounded-2xl border border-cyan-100 shadow-md hover:shadow-xl transition-all overflow-hidden relative flex-shrink-0"
    >
      {/* Header */}
      <div className="p-5 flex justify-between items-start gap-4 relative">
        <div className="flex gap-3 items-start flex-1">
          <motion.div
            className="p-2 rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-200"
            whileHover={{ scale: 1.05 }}
          >
            <Icon size={20} className="text-cyan-700" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg text-gray-800 group-hover:text-cyan-600 transition-colors truncate">
              {t.title}
            </h2>
            {t.goal && (
              <div className="flex items-center gap-2 mt-1">
                <Target size={14} className="text-cyan-500 flex-shrink-0" />
                <p className="text-sm text-gray-600 truncate">{t.goal}</p>
              </div>
            )}
            {isWorkout && t.description && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                {t.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                {isWorkout
                  ? `${t.durationWeeks ?? "—"}w`
                  : `${t.durationDays ?? "—"}d`}
              </div>
              <div className="text-xs text-gray-500">
                {isWorkout ? `${totalExercises} ex` : `${totalMeals} meals`}
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 absolute top-2 right-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <IconButton onClick={() => onEdit(t)} icon={<Edit size={14} />} />
          <IconButton
            onClick={() => onDelete(t._id)}
            icon={<Trash2 size={14} />}
            color="red"
          />
        </motion.div>
      </div>

      {/* Preview */}
      <div className="p-4 max-h-60 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-cyan-50/30">
        {isWorkout ? (
          t.program?.length ? (
            t.program.map((day, dayIdx) => (
              <div key={dayIdx} className="mb-3">
                <div className="flex items-center gap-2 mb-2 pt-1">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  <h4 className="font-semibold text-sm text-cyan-700 truncate">
                    {day.dayName}
                  </h4>
                </div>
                {day.exercises?.map((ex, exIdx) => (
                  <motion.div
                    key={exIdx}
                    className="flex justify-between items-center p-2.5 bg-white/70 rounded-lg border border-cyan-100/40 text-xs hover:bg-cyan-50/50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dayIdx * 0.1 + exIdx * 0.05 }}
                  >
                    <div className="min-w-0">
                      <span className="truncate font-medium text-gray-800 block">
                        {ex.name}
                      </span>
                      {ex.category && (
                        <span className="text-gray-500 block text-[10px]">
                          {ex.category}
                        </span>
                      )}
                    </div>
                    <span className="text-cyan-600 font-semibold flex items-center gap-1">
                      <List size={10} /> {ex.sets}x{ex.reps}
                    </span>
                  </motion.div>
                ))}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-xs text-gray-400 italic">
              No program yet
            </div>
          )
        ) : t.dailyMeals?.length ? (
          t.dailyMeals.map((m, i) => (
            <motion.div
              key={i}
              className="flex justify-between items-center p-2.5 bg-white/70 rounded-lg border border-teal-100/40 text-xs mb-1 hover:bg-teal-50/50 transition-colors"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="min-w-0">
                <span className="truncate font-medium text-gray-800 block">
                  {m.name}
                </span>
                {m.description && (
                  <span className="text-gray-500 block text-[10px] truncate">
                    {m.description}
                  </span>
                )}
              </div>
              <span className="text-teal-600 font-semibold">
                {m.calories ?? "—"}kcal
              </span>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-4 text-xs text-gray-400 italic">
            No meals yet
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ----------------------------------------------
   🔹 3. Template Manager (Pagination)
------------------------------------------------*/
const TemplateManager = () => {
  const { user, fetchUser } = useUserStore();
  const {
    workoutTemplates,
    dietTemplates,
    getWorkoutTemplates,
    getDietTemplates,
    createWorkoutTemplate,
    updateWorkoutTemplate,
    deleteWorkoutTemplate,
    createDietTemplate,
    updateDietTemplate,
    deleteDietTemplate,
    isLoadingWorkout,
    isLoadingDiet,
  } = useTemplateStore();

  const [activeTab, setActiveTab] = useState("workout");
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 3;

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?._id) {
      getWorkoutTemplates(user._id);
      getDietTemplates(user._id);
    }
  }, [user?._id, getWorkoutTemplates, getDietTemplates]);

  const handleSave = async (data) => {
    if (activeTab === "workout") {
      if (editingId) await updateWorkoutTemplate(editingId, data);
      else await createWorkoutTemplate({ ...data, trainerId: user._id });
      await getWorkoutTemplates(user._id);
    } else {
      if (editingId) await updateDietTemplate(editingId, data);
      else await createDietTemplate({ ...data, trainerId: user._id });
      await getDietTemplates(user._id);
    }
    setShowModal(false);
    setEditingId(null);
    setFormData({});
  };

  const handleEdit = (t) => {
    setFormData(t);
    setEditingId(t._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?"))
      return;
    if (activeTab === "workout") {
      await deleteWorkoutTemplate(id);
      await getWorkoutTemplates(user._id);
    } else {
      await deleteDietTemplate(id);
      await getDietTemplates(user._id);
    }
  };

  const templates = activeTab === "workout" ? workoutTemplates : dietTemplates;
  const isLoading = activeTab === "workout" ? isLoadingWorkout : isLoadingDiet;

  // Pagination reset logic: Reset to page 1 if current page exceeds available pages after list length changes
  useEffect(() => {
    const totalPages = Math.ceil(templates.length / cardsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [templates.length, currentPage, cardsPerPage]);

  // pagination logic
  const totalPages = Math.ceil(templates.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const currentTemplates = templates.slice(
    startIndex,
    startIndex + cardsPerPage
  );

  return (
    <div className="p-6 h-full w-full max-w-full bg-cyan-50 rounded-2xl space-y-6 border border-cyan-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black pb-4">
        <div className="flex bg-white/80 backdrop-blur rounded-lg border border-cyan-100 overflow-hidden shadow-sm">
          {["workout", "diet"].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              whileHover={{ scale: 1.05 }}
              className={`px-5 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-cyan-600 text-white shadow-inner"
                  : "text-gray-600 hover:text-cyan-600"
              }`}
            >
              {tab === "workout" ? "Workouts" : "Diets"}
            </motion.button>
          ))}
        </div>
        <motion.button
          onClick={() => {
            setFormData({});
            setEditingId(null);
            setShowModal(true);
          }}
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md"
        >
          <Plus size={16} /> New
        </motion.button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center text-gray-500 py-12 animate-pulse">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FileText className="mx-auto mb-3 opacity-60" size={32} />
          </motion.div>
          <p className="text-sm">Loading...</p>
        </div>
      ) : currentTemplates.length ? (
        <>
          {/* Cards Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            {currentTemplates.map((t, idx) => (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <TemplateCard
                  t={t}
                  type={activeTab}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination Controls */}
          {templates.length > cardsPerPage && (
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
          <FileText className="mx-auto mb-3 opacity-60" size={32} />
          <p className="text-sm font-medium">No templates yet.</p>
          <p className="text-xs mt-1">Create one to get started!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TemplateModal
          type={activeTab}
          editingTemplate={editingId ? formData : null}
          onClose={() => setShowModal(false)}
          onSave={(updatedData) => handleSave(updatedData)}
        />
      )}
    </div>
  );
};

export default TemplateManager;
