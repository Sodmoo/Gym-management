import React, { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, X } from "lucide-react";

const TemplateModal = ({
  onClose,
  onSave,
  editingTemplate, // null буюу object
  type = "workout", // "workout" эсвэл "diet"
}) => {
  const firstInputRef = useRef(null);

  // -----------------------
  // Common fields (match backend schemas)
  // -----------------------
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [description, setDescription] = useState("");
  // workout schema: durationWeeks (Number), exercises: [{ name, category, sets, reps, rest }]
  const [durationWeeks, setDurationWeeks] = useState("");
  const [exercises, setExercises] = useState([]);
  // diet schema: durationDays (Number), totalCalories (Number), dailyMeals: [{ name, description, calories, protein, carbs, fat }]
  const [durationDays, setDurationDays] = useState("");
  const [totalCalories, setTotalCalories] = useState("");
  const [dailyMeals, setDailyMeals] = useState([]);
  // индексээр тухайн мөрийг сонгож description-ийг доорх textarea-нд энэ индексээр засна
  const [selectedMealIndex, setSelectedMealIndex] = useState(null);
  const [notes, setNotes] = useState(""); // diet.notes or general notes

  const [errors, setErrors] = useState({});

  // -----------------------
  // Initialize editingTemplate -> map to state according to schema
  // -----------------------
  useEffect(() => {
    if (!editingTemplate) {
      setTitle("");
      setGoal("");
      setDescription("");
      setDurationWeeks("");
      setExercises([]);
      setDurationDays("");
      setTotalCalories("");
      setDailyMeals([]);
      setNotes("");
    } else {
      setTitle(editingTemplate.title || "");
      setGoal(editingTemplate.goal || "");
      setDescription(editingTemplate.description || "");
      setDurationWeeks(
        editingTemplate.durationWeeks != null
          ? String(editingTemplate.durationWeeks)
          : ""
      );
      setExercises(
        Array.isArray(editingTemplate.exercises)
          ? editingTemplate.exercises.map((e) => ({
              name: e.name || "",
              category: e.category || "",
              sets: e.sets != null ? String(e.sets) : "",
              reps: e.reps != null ? String(e.reps) : "",
              rest: e.rest != null ? String(e.rest) : "60",
              notes: e.notes || "",
            }))
          : []
      );

      setDurationDays(
        editingTemplate.durationDays != null
          ? String(editingTemplate.durationDays)
          : ""
      );
      setTotalCalories(
        editingTemplate.totalCalories != null
          ? String(editingTemplate.totalCalories)
          : ""
      );
      setDailyMeals(
        Array.isArray(editingTemplate.dailyMeals)
          ? editingTemplate.dailyMeals.map((m) => ({
              name: m.name || "",
              description: m.description || "",
              calories: m.calories != null ? String(m.calories) : "",
              protein: m.protein != null ? String(m.protein) : "",
              carbs: m.carbs != null ? String(m.carbs) : "",
              fat: m.fat != null ? String(m.fat) : "",
            }))
          : []
      );
      setNotes(editingTemplate.notes || "");
    }

    // autofocus first input when modal opens
    setTimeout(() => firstInputRef.current?.focus(), 0);
  }, [editingTemplate]);

  // close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // prevent background scroll while modal open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, []);

  // -----------------------
  // Handlers for exercises/meals
  // -----------------------
  const handleAddExercise = () =>
    setExercises((s) => [
      ...s,
      { name: "", category: "", sets: "3", reps: "10", rest: "60", notes: "" },
    ]);

  const handleExerciseChange = (i, field, value) => {
    setExercises((s) => {
      const copy = [...s];
      copy[i] = { ...copy[i], [field]: value };
      return copy;
    });
  };

  const handleDeleteExercise = (i) =>
    setExercises((s) => s.filter((_, idx) => idx !== i));

  const handleAddMeal = () =>
    setDailyMeals((s) => [
      ...s,
      {
        name: "",
        description: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
      },
    ]);

  const handleMealChange = (i, field, value) => {
    setDailyMeals((s) => {
      const copy = [...s];
      copy[i] = { ...copy[i], [field]: value };
      return copy;
    });
  };

  const handleDeleteMeal = (i) =>
    setDailyMeals((s) => s.filter((_, idx) => idx !== i));

  // -----------------------
  // Validation: ensure required schema fields present
  // -----------------------
  const validate = useCallback(() => {
    const e = {};
    if (!title || !title.trim()) e.title = "Title is required";

    if (type === "workout") {
      exercises.forEach((ex, idx) => {
        if (!ex.name || !ex.name.trim())
          e[`ex_${idx}_name`] = "Exercise name required";
        if (!ex.sets || isNaN(Number(ex.sets)))
          e[`ex_${idx}_sets`] = "Sets must be a number";
        if (!ex.reps || isNaN(Number(ex.reps)))
          e[`ex_${idx}_reps`] = "Reps must be a number";
      });
    } else {
      dailyMeals.forEach((m, idx) => {
        if (!m.name || !m.name.trim())
          e[`meal_${idx}_name`] = "Meal name required";
        if (m.calories && isNaN(Number(m.calories)))
          e[`meal_${idx}_calories`] = "Calories must be a number";
      });
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [title, exercises, dailyMeals, type]);

  // -----------------------
  // Submit: normalize to backend schema types
  // -----------------------
  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      goal: (goal || "").trim(),
      description: (description || "").trim(),
      notes: (notes || "").trim(),
    };

    if (type === "workout") {
      if (durationWeeks !== "")
        payload.durationWeeks = parseInt(durationWeeks, 10);
      payload.exercises = exercises.map((ex) => ({
        name: (ex.name || "").trim(),
        category: (ex.category || "").trim(),
        sets: ex.sets !== "" ? parseInt(ex.sets, 10) : undefined,
        reps: ex.reps !== "" ? parseInt(ex.reps, 10) : undefined,
        rest: ex.rest !== "" ? parseInt(ex.rest, 10) : undefined,
        notes: ex.notes || "",
      }));
    } else {
      if (durationDays !== "")
        payload.durationDays = parseInt(durationDays, 10);
      if (totalCalories !== "")
        payload.totalCalories = parseInt(totalCalories, 10);
      payload.dailyMeals = dailyMeals.map((m) => ({
        name: (m.name || "").trim(),
        description: (m.description || "").trim(),
        calories: m.calories !== "" ? parseInt(m.calories, 10) : undefined,
        protein: m.protein !== "" ? parseFloat(m.protein) : undefined,
        carbs: m.carbs !== "" ? parseFloat(m.carbs) : undefined,
        fat: m.fat !== "" ? parseFloat(m.fat) : undefined,
      }));
    }

    // include _id when editing so parent knows update vs create
    if (editingTemplate?._id) payload._id = editingTemplate._id;

    onSave(payload);
  };

  const canSubmit = !!(title && title.trim().length);

  // -----------------------
  // Render (keep design)
  // -----------------------
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 z-50"
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative space-y-4">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{type === "workout" ? "🏋️" : "🥗"}</span>
          <h2 className="text-xl font-semibold">
            {editingTemplate
              ? `Edit ${type === "workout" ? "Workout" : "Diet"} Template`
              : `Create ${type === "workout" ? "Workout" : "Diet"} Template`}
          </h2>
        </div>

        <div>
          <label className="text-sm font-semibold">Title</label>
          <input
            ref={firstInputRef}
            type="text"
            aria-required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none ${
              errors.title ? "border-red-400" : ""
            }`}
            placeholder={
              type === "workout" ? "Upper Body Split" : "7-Day Meal Plan"
            }
          />
          {errors.title && (
            <div className="text-xs text-red-500 mt-1">{errors.title}</div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-sm font-semibold">Goal</label>
            <input
              type="text"
              placeholder={
                type === "workout"
                  ? "Upper Body Strength"
                  : "Weight loss / Muscle gain"
              }
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          {type === "workout" ? (
            <div>
              <label className="text-sm font-semibold">Duration (weeks)</label>
              <input
                type="number"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-semibold">Duration (days)</label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Total Calories</label>
                <input
                  type="number"
                  value={totalCalories}
                  onChange={(e) => setTotalCalories(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </>
          )}
        </div>

        {type === "workout" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Exercises</h3>
              <button
                onClick={handleAddExercise}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                + Add Exercise
              </button>
            </div>

            <div className="overflow-y-auto max-h-32 rounded-lg border border-gray-200">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-900 sticky top-0">
                  <tr>
                    <th className="text-left py-2 px-3 font-semibold">
                      Exercise
                    </th>
                    <th className="py-2 px-3 font-semibold">Sets</th>
                    <th className="py-2 px-3 font-semibold">Reps</th>
                    <th className="py-2 px-3 font-semibold">Rest</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {exercises.map((ex, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-2 px-3">
                        <input
                          className={`border rounded w-full px-2 py-1 ${
                            errors[`ex_${i}_name`] ? "border-red-400" : ""
                          }`}
                          value={ex.name}
                          onChange={(e) =>
                            handleExerciseChange(i, "name", e.target.value)
                          }
                        />
                        {errors[`ex_${i}_name`] && (
                          <div className="text-xs text-red-500">
                            {errors[`ex_${i}_name`]}
                          </div>
                        )}
                      </td>
                      <td className="text-center">
                        <input
                          className={`border rounded w-12 text-center ${
                            errors[`ex_${i}_sets`] ? "border-red-400" : ""
                          }`}
                          value={ex.sets}
                          onChange={(e) =>
                            handleExerciseChange(i, "sets", e.target.value)
                          }
                        />
                        {errors[`ex_${i}_sets`] && (
                          <div className="text-xs text-red-500">
                            {errors[`ex_${i}_sets`]}
                          </div>
                        )}
                      </td>
                      <td className="text-center">
                        <input
                          className={`border rounded w-12 text-center ${
                            errors[`ex_${i}_reps`] ? "border-red-400" : ""
                          }`}
                          value={ex.reps}
                          onChange={(e) =>
                            handleExerciseChange(i, "reps", e.target.value)
                          }
                        />
                        {errors[`ex_${i}_reps`] && (
                          <div className="text-xs text-red-500">
                            {errors[`ex_${i}_reps`]}
                          </div>
                        )}
                      </td>
                      <td className="text-center">
                        <input
                          className="border rounded w-12 text-center"
                          value={ex.rest}
                          onChange={(e) =>
                            handleExerciseChange(i, "rest", e.target.value)
                          }
                        />
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => handleDeleteExercise(i)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Description editor outside table */}
            <div className="mt-3">
              <label className="text-sm font-semibold">
                Workout description
              </label>
              <textarea
                className="w-full border rounded px-3 py-2 mt-1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Program notes, progression, equipment, tips..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">Daily Meals</h3>
              <button
                onClick={handleAddMeal}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                + Add Meal
              </button>
            </div>

            <div className="overflow-y-auto max-h-44 rounded-lg border border-gray-200">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-900">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold">Name</th>
                    <th className="py-2 px-3 text-left font-semibold">
                      Calories
                    </th>
                    <th className="py-2 px-3 text-left font-semibold">
                      Protein
                    </th>
                    <th className="py-2 px-3 text-left font-semibold">Carbs</th>
                    <th className="py-2 px-3 text-left font-semibold">Fat</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {dailyMeals.map((meal, i) => (
                    <tr
                      key={i}
                      className={`border-t hover:bg-gray-50 cursor-pointer ${
                        selectedMealIndex === i ? "bg-gray-50" : ""
                      }`}
                      onClick={() => setSelectedMealIndex(i)}
                    >
                      <td className="py-2 px-3">
                        <input
                          className={`border rounded px-2 py-1 w-full ${
                            errors[`meal_${i}_name`] ? "border-red-400" : ""
                          }`}
                          value={meal.name}
                          onChange={(e) =>
                            handleMealChange(i, "name", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        {errors[`meal_${i}_name`] && (
                          <div className="text-xs text-red-500">
                            {errors[`meal_${i}_name`]}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          className={`border rounded px-2 py-1 w-20 ${
                            errors[`meal_${i}_calories`] ? "border-red-400" : ""
                          }`}
                          value={meal.calories}
                          onChange={(e) =>
                            handleMealChange(i, "calories", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        {errors[`meal_${i}_calories`] && (
                          <div className="text-xs text-red-500">
                            {errors[`meal_${i}_calories`]}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          className="border rounded px-2 py-1 w-20"
                          value={meal.protein}
                          onChange={(e) =>
                            handleMealChange(i, "protein", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          className="border rounded px-2 py-1 w-20"
                          value={meal.carbs}
                          onChange={(e) =>
                            handleMealChange(i, "carbs", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          className="border rounded px-2 py-1 w-20"
                          value={meal.fat}
                          onChange={(e) =>
                            handleMealChange(i, "fat", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeal(i);
                          }}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Delete meal"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Description editor outside table */}
            <div className="mt-3">
              <label className="text-sm font-semibold">
                Selected meal description
              </label>
              {selectedMealIndex === null ? (
                <div className="text-sm text-gray-500 mt-1">
                  Select a meal row to add/edit its description.
                </div>
              ) : (
                <textarea
                  className="w-full border rounded px-3 py-2 mt-1"
                  value={dailyMeals[selectedMealIndex]?.description || ""}
                  onChange={(e) =>
                    handleMealChange(
                      selectedMealIndex,
                      "description",
                      e.target.value
                    )
                  }
                  rows={3}
                />
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-3 font-semibold rounded-lg ${
            canSubmit
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {editingTemplate ? "Save Changes" : "Create Template"}
        </button>
      </div>
    </div>
  );
};

export default TemplateModal;
