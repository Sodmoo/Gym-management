import React, { useEffect, useState } from "react";
import TemplateModal from "../../../components/Template/TemplateModal";
import { useUserStore } from "../../../store/userStore";
import { useTemplateStore } from "../../../store/templateStore";
import {
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  Clock,
  List,
  X,
} from "lucide-react";

const IconButton = ({ onClick, icon, color = "gray", label }) => {
  const base =
    "p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200";
  const extra =
    color === "red" ? "text-red-600 hover:bg-red-50" : "text-gray-700";
  return (
    <button aria-label={label} onClick={onClick} className={`${base} ${extra}`}>
      {icon}
    </button>
  );
};

// memoized cards to reduce re-renders
const WorkoutCard = React.memo(
  ({ t, expanded, onEdit, onDelete, onToggle }) => (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 border border-gray-100 relative">
      <div className="flex justify-between items-start gap-3">
        <div>
          <h2 className="font-semibold text-lg text-gray-800">{t.title}</h2>
          <p className="text-sm text-gray-500">{t.goal}</p>
          <p className="text-sm text-gray-400">{t.description}</p>
          <p className="text-sm text-gray-500 mt-1">
            Duration: {t.durationWeeks} weeks
          </p>
        </div>
        <div className="flex gap-2">
          <IconButton
            onClick={() => onEdit(t)}
            icon={<Edit size={16} />}
            label="Edit"
          />
          <IconButton
            onClick={() => onDelete(t._id)}
            icon={<Trash2 size={16} />}
            color="red"
            label="Delete"
          />
          <IconButton
            onClick={() => onToggle(t._id)}
            icon={
              expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            }
            label="Toggle"
          />
        </div>
      </div>
      {expanded && (
        <div className="mt-4 border-t pt-3 space-y-2">
          {t.exercises?.length ? (
            t.exercises.map((ex, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-xl p-3 flex justify-between items-center hover:bg-gray-100"
              >
                <div>
                  <div className="font-medium">{ex.name}</div>
                  <div className="text-xs text-gray-500">{ex.category}</div>
                </div>
                <div className="text-sm text-gray-600 flex flex-col items-end">
                  <span className="flex gap-1 items-center">
                    <List size={12} /> {ex.sets}x{ex.reps}
                  </span>
                  <span className="flex gap-1 items-center">
                    <Clock size={12} /> {ex.rest}s
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">No exercises listed.</p>
          )}
        </div>
      )}
    </div>
  )
);

const DietCard = React.memo(({ t, expanded, onEdit, onDelete, onToggle }) => (
  <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 border border-gray-100 relative">
    <div className="flex justify-between items-start gap-3">
      <div>
        <h2 className="font-semibold text-lg text-gray-800">{t.title}</h2>
        <p className="text-sm text-gray-500">{t.goal}</p>
        <p className="text-sm text-gray-400">Duration: {t.durationDays} days</p>
      </div>
      <div className="flex gap-2">
        <IconButton
          onClick={() => onEdit(t)}
          icon={<Edit size={16} />}
          label="Edit"
        />
        <IconButton
          onClick={() => onDelete(t._id)}
          icon={<Trash2 size={16} />}
          color="red"
          label="Delete"
        />
        <IconButton
          onClick={() => onToggle(t._id)}
          icon={expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          label="Toggle"
        />
      </div>
    </div>
    {expanded && (
      <div className="mt-4 border-t pt-3 space-y-2">
        {t.dailyMeals?.length ? (
          t.dailyMeals.map((m, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-xl p-3 flex justify-between items-center hover:bg-gray-100"
            >
              <div>
                <div className="font-medium">{m.name}</div>
                {m.description && (
                  <div className="text-xs text-gray-500">{m.description}</div>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {m.calories ?? "—"} kcal
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">No meals listed.</p>
        )}
      </div>
    )}
  </div>
));

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
  const [expanded, setExpanded] = useState({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?._id) {
      getWorkoutTemplates(user._id);
      getDietTemplates(user._id);
    }
  }, [user?._id, getWorkoutTemplates, getDietTemplates]);

  const trainerId = user?._id;
  useEffect(() => {
    if (!trainerId) return; // guard: avoid calling API with undefined id
    getWorkoutTemplates(trainerId);
    getDietTemplates(trainerId);
  }, [trainerId, getWorkoutTemplates, getDietTemplates]);

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

  const toggleExpand = (id) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  /** ------------------------
   *  Template Cards (Workout / Diet)
   * ------------------------ */
  const templates = activeTab === "workout" ? workoutTemplates : dietTemplates;
  const isLoading = activeTab === "workout" ? isLoadingWorkout : isLoadingDiet;

  return (
    <div className="p-6">
      {/* Tabs + Add */}
      <div className="flex items-center gap-3 mb-6">
        {["workout", "diet"].map((tab) => (
          <button
            key={tab}
            className={`px-5 py-2 rounded-full transition-all ${
              activeTab === tab
                ? "bg-orange-500 text-white shadow"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "workout" ? "Workout" : "Diet"}
          </button>
        ))}
        <button
          onClick={() => {
            setFormData({});
            setEditingId(null);
            setShowModal(true);
          }}
          className="ml-auto flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all"
        >
          <Plus size={16} /> Add Template
        </button>
      </div>

      {/* Cards */}
      {isLoading ? (
        <p>Loading templates...</p>
      ) : templates?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t) =>
            activeTab === "workout" ? (
              <WorkoutCard
                key={t._id || t.id}
                t={t}
                expanded={!!expanded[t._id]}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={toggleExpand}
              />
            ) : (
              <DietCard
                key={t._id || t.id}
                t={t}
                expanded={!!expanded[t._id]}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={toggleExpand}
              />
            )
          )}
        </div>
      ) : (
        <p className="text-gray-500 italic">No templates found.</p>
      )}

      {showModal && (
        <TemplateModal
          type={activeTab}
          editingTemplate={editingId ? formData : null}
          onClose={() => setShowModal(false)}
          onSave={(updatedData) => {
            setFormData(updatedData); // parent-д state шинэчлэх
            handleSave(updatedData); // API call хийх
          }}
        />
      )}
    </div>
  );
};

export default TemplateManager;
