import React, { useEffect, useState } from "react";
import WorkoutTemplateModal from "../../../components/Template/WorkoutTemplateModal";
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

  const handleSave = async () => {
    if (activeTab === "workout") {
      if (editingId) await updateWorkoutTemplate(editingId, formData);
      else await createWorkoutTemplate({ ...formData, trainerId: user._id });
      await getWorkoutTemplates(user._id);
    } else {
      if (editingId) await updateDietTemplate(editingId, formData);
      else await createDietTemplate({ ...formData, trainerId: user._id });
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
  const WorkoutCard = ({ t }) => (
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
          <IconButton onClick={() => handleEdit(t)} icon={<Edit size={16} />} />
          <IconButton
            onClick={() => handleDelete(t._id)}
            icon={<Trash2 size={16} />}
            color="red"
          />
          <IconButton
            onClick={() => toggleExpand(t._id)}
            icon={
              expanded[t._id] ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )
            }
          />
        </div>
      </div>

      {expanded[t._id] && (
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
                  {ex.notes && (
                    <div className="text-xs text-gray-400 mt-1">{ex.notes}</div>
                  )}
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
  );

  const DietCard = ({ t }) => (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 border border-gray-100 relative">
      <div className="flex justify-between items-start gap-3">
        <div>
          <h2 className="font-semibold text-lg text-gray-800">{t.title}</h2>
          <p className="text-sm text-gray-500">{t.goal}</p>
          <p className="text-sm text-gray-400">
            Duration: {t.durationDays} days
          </p>
        </div>
        <div className="flex gap-2">
          <IconButton onClick={() => handleEdit(t)} icon={<Edit size={16} />} />
          <IconButton
            onClick={() => handleDelete(t._id)}
            icon={<Trash2 size={16} />}
            color="red"
          />
          <IconButton
            onClick={() => toggleExpand(t._id)}
            icon={
              expanded[t._id] ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )
            }
          />
        </div>
      </div>

      {expanded[t._id] && (
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
  );

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
              <WorkoutCard key={t._id} t={t} />
            ) : (
              <DietCard key={t._id} t={t} />
            )
          )}
        </div>
      ) : (
        <p className="text-gray-500 italic">No templates found.</p>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 space-y-4 relative">
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-800"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 text-xl font-bold">
              <span>🏋️</span>
              <h2>
                {editingId
                  ? "Edit Workout Template"
                  : "Create Workout Template"}
              </h2>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-semibold">Title</label>
              <input
                type="text"
                placeholder="Upper Body 3-Day Split"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Goal */}
            <div>
              <label className="text-sm font-semibold">Goal</label>
              <input
                type="text"
                placeholder="Upper Body Strength"
                value={formData.goal || ""}
                onChange={(e) =>
                  setFormData({ ...formData, goal: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Description & Duration */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-semibold">Description</label>
                <textarea
                  rows="4"
                  placeholder="A three-day workout plan focused on upper body strength."
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                ></textarea>
              </div>
              <div>
                <label className="text-sm font-semibold">
                  Duration (weeks)
                </label>
                <input
                  type="number"
                  placeholder="3"
                  value={formData.durationWeeks || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, durationWeeks: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Exercises */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Exercises</h3>
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      exercises: [
                        ...(formData.exercises || []),
                        { name: "", sets: "", reps: "", rest: "" },
                      ],
                    })
                  }
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  + Add Exercise
                </button>
              </div>

              {/* Exercise Table */}
              <div className="overflow-y-auto max-h-32 rounded-lg border border-gray-200">
                <table className="min-w-full text-sm text-gray-700">
                  <thead className="bg-gray-100 text-gray-900 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold">
                        Exercise name
                      </th>
                      <th className="py-2 px-3 font-semibold">Sets</th>
                      <th className="py-2 px-3 font-semibold">Reps</th>
                      <th className="py-2 px-3 font-semibold">Rest</th>
                      <th className="py-2 px-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {(formData.exercises || []).map((ex, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-2 px-3">
                          <input
                            className="w-full border rounded px-2"
                            placeholder="Name"
                            value={ex.name}
                            onChange={(e) => {
                              const updated = [...formData.exercises];
                              updated[i].name = e.target.value;
                              setFormData({ ...formData, exercises: updated });
                            }}
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="number"
                            className="w-12 border rounded text-center"
                            value={ex.sets}
                            onChange={(e) => {
                              const updated = [...formData.exercises];
                              updated[i].sets = e.target.value;
                              setFormData({ ...formData, exercises: updated });
                            }}
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="number"
                            className="w-12 border rounded text-center"
                            value={ex.reps}
                            onChange={(e) => {
                              const updated = [...formData.exercises];
                              updated[i].reps = e.target.value;
                              setFormData({ ...formData, exercises: updated });
                            }}
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="text"
                            className="w-16 border rounded text-center"
                            value={ex.rest}
                            onChange={(e) => {
                              const updated = [...formData.exercises];
                              updated[i].rest = e.target.value;
                              setFormData({ ...formData, exercises: updated });
                            }}
                          />
                        </td>
                        <td
                          className="text-center text-gray-400 cursor-pointer"
                          onClick={() => {
                            const filtered = formData.exercises.filter(
                              (_, idx) => idx !== i
                            );
                            setFormData({ ...formData, exercises: filtered });
                          }}
                        >
                          🗑️
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={handleSave}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              {editingId ? "Save Changes" : "Create Template"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------- Helper Subcomponents -------------------- */
const IconButton = ({ onClick, icon, color = "gray" }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-full hover:bg-${
      color === "red" ? "red-50" : "gray-100"
    } ${color === "red" ? "text-red-500" : "text-gray-700"}`}
  >
    {icon}
  </button>
);

const WorkoutFormSection = ({ formData, setFormData }) => (
  <div className="mt-5">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-semibold text-gray-700">Exercises</h3>
      <button
        onClick={() =>
          setFormData({
            ...formData,
            exercises: [
              ...(formData.exercises || []),
              {
                name: "",
                category: "",
                sets: "",
                reps: "",
                rest: "",
                notes: "",
              },
            ],
          })
        }
        className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 flex items-center gap-1"
      >
        <Plus size={14} /> Add
      </button>
    </div>
    <div className="space-y-3">
      {formData.exercises?.length ? (
        formData.exercises.map((ex, i) => (
          <div
            key={i}
            className="border rounded-lg p-3 grid md:grid-cols-3 gap-2 relative"
          >
            {["name", "category", "sets", "reps", "rest"].map((field) => (
              <input
                key={field}
                className="border rounded p-2 text-sm"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={ex[field]}
                type={
                  ["sets", "reps", "rest"].includes(field) ? "number" : "text"
                }
                onChange={(e) => {
                  const updated = [...formData.exercises];
                  updated[i][field] = e.target.value;
                  setFormData({ ...formData, exercises: updated });
                }}
              />
            ))}
            <textarea
              className="border rounded p-2 text-sm col-span-full"
              placeholder="Notes"
              value={ex.notes}
              onChange={(e) => {
                const updated = [...formData.exercises];
                updated[i].notes = e.target.value;
                setFormData({ ...formData, exercises: updated });
              }}
            />
            <button
              onClick={() => {
                const filtered = formData.exercises.filter(
                  (_, idx) => idx !== i
                );
                setFormData({ ...formData, exercises: filtered });
              }}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">No exercises yet.</p>
      )}
    </div>
  </div>
);

const DietFormSection = ({ formData, setFormData }) => (
  <div className="mt-5">
    <div className="flex justify-between items-center mb-2">
      <h3 className="font-semibold text-gray-700">Daily Meals</h3>
      <button
        onClick={() =>
          setFormData({
            ...formData,
            dailyMeals: [
              ...(formData.dailyMeals || []),
              { name: "", description: "", calories: "" },
            ],
          })
        }
        className="text-sm bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 flex items-center gap-1"
      >
        <Plus size={14} /> Add
      </button>
    </div>
    <div className="space-y-3">
      {formData.dailyMeals?.length ? (
        formData.dailyMeals.map((m, i) => (
          <div
            key={i}
            className="border rounded-lg p-3 grid md:grid-cols-2 gap-2 relative"
          >
            <input
              className="border rounded p-2 text-sm"
              placeholder="Meal name"
              value={m.name}
              onChange={(e) => {
                const updated = [...formData.dailyMeals];
                updated[i].name = e.target.value;
                setFormData({ ...formData, dailyMeals: updated });
              }}
            />
            <input
              className="border rounded p-2 text-sm"
              placeholder="Calories"
              type="number"
              value={m.calories}
              onChange={(e) => {
                const updated = [...formData.dailyMeals];
                updated[i].calories = e.target.value;
                setFormData({ ...formData, dailyMeals: updated });
              }}
            />
            <textarea
              className="border rounded p-2 text-sm col-span-full"
              placeholder="Description"
              value={m.description}
              onChange={(e) => {
                const updated = [...formData.dailyMeals];
                updated[i].description = e.target.value;
                setFormData({ ...formData, dailyMeals: updated });
              }}
            />
            <button
              onClick={() => {
                const filtered = formData.dailyMeals.filter(
                  (_, idx) => idx !== i
                );
                setFormData({ ...formData, dailyMeals: filtered });
              }}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">No meals yet.</p>
      )}
    </div>
  </div>
);

export default TemplateManager;
