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
  FileText,
} from "lucide-react";

// ---------- Reusable button ----------
const IconButton = ({ onClick, icon, color = "gray", label }) => {
  const base =
    "p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-300";
  const extra =
    color === "red"
      ? "text-red-600 hover:bg-red-50"
      : "text-gray-600 hover:bg-gray-100";
  return (
    <button aria-label={label} onClick={onClick} className={`${base} ${extra}`}>
      {icon}
    </button>
  );
};

// ---------- Workout Card ----------
const WorkoutCard = React.memo(
  ({ t, expanded, onEdit, onDelete, onToggle }) => (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-1 relative">
      <div className="p-5 flex justify-between items-start gap-3">
        <div>
          <h2 className="font-semibold text-lg text-gray-800">{t.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{t.goal}</p>
          {t.description && (
            <p className="text-sm text-gray-400 mt-1">{t.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            <Clock className="inline w-4 h-4 mr-1 text-blue-500" />
            {t.durationWeeks} weeks
          </p>
        </div>
        <div className="flex gap-2">
          <IconButton onClick={() => onEdit(t)} icon={<Edit size={16} />} />
          <IconButton
            onClick={() => onDelete(t._id)}
            icon={<Trash2 size={16} />}
            color="red"
          />
          <IconButton
            onClick={() => onToggle(t._id)}
            icon={
              expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
            }
          />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 rounded-b-2xl transition-all duration-300 space-y-2">
          {t.exercises?.length ? (
            t.exercises.map((ex, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-white rounded-xl p-3 shadow-sm hover:shadow transition"
              >
                <div>
                  <div className="font-medium text-gray-700">{ex.name}</div>
                  <div className="text-xs text-gray-400">{ex.category}</div>
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
            <p className="text-sm text-gray-400 italic text-center">
              No exercises listed.
            </p>
          )}
        </div>
      )}
    </div>
  )
);

// ---------- Diet Card ----------
const DietCard = React.memo(({ t, expanded, onEdit, onDelete, onToggle }) => (
  <div className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 transition-all duration-300 hover:-translate-y-1 relative">
    <div className="p-5 flex justify-between items-start gap-3">
      <div>
        <h2 className="font-semibold text-lg text-gray-800">{t.title}</h2>
        <p className="text-sm text-gray-500 mt-1">{t.goal}</p>
        <p className="text-sm text-gray-500 mt-2">
          Duration: {t.durationDays} days
        </p>
      </div>
      <div className="flex gap-2">
        <IconButton onClick={() => onEdit(t)} icon={<Edit size={16} />} />
        <IconButton
          onClick={() => onDelete(t._id)}
          icon={<Trash2 size={16} />}
          color="red"
        />
        <IconButton
          onClick={() => onToggle(t._id)}
          icon={expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        />
      </div>
    </div>

    {expanded && (
      <div className="border-t border-gray-100 bg-gray-50 p-4 rounded-b-2xl space-y-2">
        {t.dailyMeals?.length ? (
          t.dailyMeals.map((m, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-white rounded-xl p-3 shadow-sm hover:shadow transition"
            >
              <div>
                <div className="font-medium text-gray-700">{m.name}</div>
                {m.description && (
                  <div className="text-xs text-gray-500">{m.description}</div>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {m.calories ?? "—"} kcal / {m.protein ?? "—"}g P
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 italic text-center">
            No meals listed.
          </p>
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

  const templates = activeTab === "workout" ? workoutTemplates : dietTemplates;
  const isLoading = activeTab === "workout" ? isLoadingWorkout : isLoadingDiet;

  return (
    <div className="p-6 h-full space-y-6">
      {/* Tabs */}
      <div className="flex items-center justify-between bg-white p-3 rounded-full shadow-sm border border-gray-100">
        <div className="flex bg-gray-100 rounded-full p-1">
          {["workout", "diet"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab === "workout" ? "Workout Templates" : "Diet Templates"}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setFormData({});
            setEditingId(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-full hover:opacity-90 transition-all"
        >
          <Plus size={16} /> Add Template
        </button>
      </div>

      {/* Templates grid */}
      {isLoading ? (
        <div className="text-center text-gray-500 py-10 animate-pulse">
          <FileText className="mx-auto mb-2" />
          Loading templates...
        </div>
      ) : templates?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t) =>
            activeTab === "workout" ? (
              <WorkoutCard
                key={t._id}
                t={t}
                expanded={!!expanded[t._id]}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={toggleExpand}
              />
            ) : (
              <DietCard
                key={t._id}
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
        <div className="text-center py-12 text-gray-400">
          <FileText className="mx-auto mb-3 opacity-60" size={32} />
          No templates found.
        </div>
      )}

      {showModal && (
        <TemplateModal
          type={activeTab}
          editingTemplate={editingId ? formData : null}
          onClose={() => setShowModal(false)}
          onSave={(updatedData) => {
            setFormData(updatedData);
            handleSave(updatedData);
          }}
        />
      )}
    </div>
  );
};

export default TemplateManager;
