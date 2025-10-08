import React, { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, X, Minus, Plus } from "lucide-react";

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
  // workout schema: durationWeeks (Number), program: [{ dayName, exercises: [{ name, category, sets, reps, rest }] }]
  const [durationWeeks, setDurationWeeks] = useState("");
  const [program, setProgram] = useState([]);
  // diet schema: durationDays (Number), totalCalories (Number), dailyMeals: [{ name, description, calories, protein, carbs, fat }]
  const [durationDays, setDurationDays] = useState("");
  const [totalCalories, setTotalCalories] = useState("");
  const [dailyMeals, setDailyMeals] = useState([]);
  // индексээр тухайн мөрийг сонгож description-ийг доорх textarea-нд энэ индексээр засна
  const [selectedMealIndex, setSelectedMealIndex] = useState(null);

  const [errors, setErrors] = useState({});

  // -----------------------
  // Initialize editingTemplate -> map to state according to schema
  // -----------------------
  useEffect(() => {
    if (!editingTemplate) {
      setTitle("");
      setGoal("");
      setDescription("");
      setDurationWeeks("4");
      setProgram([{ dayName: "Day 1", exercises: [] }]);
      setDurationDays("");
      setTotalCalories("");
      setDailyMeals([]);
    } else {
      setTitle(editingTemplate.title || "");
      setGoal(editingTemplate.goal || "");
      setDescription(editingTemplate.description || "");
      setDurationWeeks(
        editingTemplate.durationWeeks != null
          ? String(editingTemplate.durationWeeks)
          : "4"
      );
      setProgram(
        Array.isArray(editingTemplate.program)
          ? editingTemplate.program.map((day) => ({
              dayName: day.dayName || "",
              exercises: Array.isArray(day.exercises)
                ? day.exercises.map((e) => ({
                    name: e.name || "",
                    category: e.category || "",
                    sets: e.sets != null ? String(e.sets) : "3",
                    reps: e.reps != null ? String(e.reps) : "10",
                    rest: e.rest != null ? String(e.rest) : "60",
                  }))
                : [],
            }))
          : [{ dayName: "Day 1", exercises: [] }]
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
  // Handlers for program (workout)
  // -----------------------
  const handleAddDay = useCallback(() => {
    setProgram((prev) => [
      ...prev,
      { dayName: `Day ${prev.length + 1}`, exercises: [] },
    ]);
  }, []);

  const handleDayNameChange = useCallback((dayIdx, value) => {
    setProgram((prev) => {
      const newProgram = [...prev];
      newProgram[dayIdx] = { ...newProgram[dayIdx], dayName: value };
      return newProgram;
    });
  }, []);

  const handleDeleteDay = useCallback((dayIdx) => {
    setProgram((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, d) => d !== dayIdx);
    });
  }, []);

  const handleAddExercise = useCallback((dayIdx) => {
    setProgram((prev) => {
      const newProgram = [...prev];
      newProgram[dayIdx] = {
        ...newProgram[dayIdx],
        exercises: [
          ...newProgram[dayIdx].exercises,
          { name: "", category: "", sets: "3", reps: "10", rest: "60" },
        ],
      };
      return newProgram;
    });
  }, []);

  const handleExerciseChange = useCallback((dayIdx, exIdx, field, value) => {
    setProgram((prev) => {
      const newProgram = [...prev];
      newProgram[dayIdx] = {
        ...newProgram[dayIdx],
        exercises: newProgram[dayIdx].exercises.map((ex, e) =>
          e === exIdx ? { ...ex, [field]: value } : ex
        ),
      };
      return newProgram;
    });
  }, []);

  const handleDeleteExercise = useCallback((dayIdx, exIdx) => {
    setProgram((prev) => {
      const newProgram = [...prev];
      newProgram[dayIdx] = {
        ...newProgram[dayIdx],
        exercises: newProgram[dayIdx].exercises.filter((_, e) => e !== exIdx),
      };
      return newProgram;
    });
  }, []);

  // -----------------------
  // Handlers for meals (diet)
  // -----------------------
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
      program.forEach((day, dayIdx) => {
        if (!day.dayName || !day.dayName.trim())
          e[`day_${dayIdx}_name`] = "Day name required";
        day.exercises.forEach((ex, exIdx) => {
          const prefix = `prog_${dayIdx}_ex_${exIdx}_`;
          if (!ex.name || !ex.name.trim())
            e[prefix + "name"] = "Exercise name required";
          if (!ex.sets || isNaN(Number(ex.sets)))
            e[prefix + "sets"] = "Sets must be a number";
          if (!ex.reps || isNaN(Number(ex.reps)))
            e[prefix + "reps"] = "Reps must be a number";
        });
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
  }, [title, program, dailyMeals, type]);

  // -----------------------
  // Submit: normalize to backend schema types
  // -----------------------
  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      goal: (goal || "").trim(),
      description: (description || "").trim(),
    };

    if (type === "workout") {
      const dw = durationWeeks !== "" ? parseInt(durationWeeks, 10) : 4;
      payload.durationWeeks = dw;
      payload.program = program.map((day) => ({
        dayName: (day.dayName || "").trim(),
        exercises: day.exercises.map((ex) => ({
          name: (ex.name || "").trim(),
          category: (ex.category || "").trim(),
          sets: parseInt(ex.sets, 10),
          reps: parseInt(ex.reps, 10),
          rest: ex.rest !== "" ? parseInt(ex.rest, 10) : 60,
        })),
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
  // Render (modern cyan design with white background and more padding)
  // -----------------------
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 z-50"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] p-8 relative space-y-8 border border-cyan-100/50 overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-cyan-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-200">
            <span className="text-2xl">{type === "workout" ? "🏋️" : "🥗"}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {editingTemplate
              ? `Edit ${type === "workout" ? "Workout" : "Diet"} Template`
              : `Create ${type === "workout" ? "Workout" : "Diet"} Template`}
          </h2>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700">Title</label>
          <input
            ref={firstInputRef}
            type="text"
            aria-required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full border border-gray-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all shadow-sm ${
              errors.title ? "border-red-400 focus:ring-red-500" : ""
            }`}
            placeholder={
              type === "workout" ? "Upper Body Split" : "7-Day Meal Plan"
            }
          />
          {errors.title && (
            <div className="text-xs text-red-500 mt-2">{errors.title}</div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-3">
          <div>
            <label className="text-sm font-semibold text-gray-700">Goal</label>
            <input
              type="text"
              placeholder={
                type === "workout"
                  ? "Upper Body Strength"
                  : "Weight loss / Muscle gain"
              }
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all shadow-sm"
            />
          </div>
          {type === "workout" ? (
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Duration (weeks)
              </label>
              <input
                type="number"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all shadow-sm"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Total Calories
                </label>
                <input
                  type="number"
                  value={totalCalories}
                  onChange={(e) => setTotalCalories(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all shadow-sm"
                />
              </div>
            </>
          )}
        </div>

        {type === "workout" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-gray-800">Program</h3>
              <button
                onClick={handleAddDay}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white text-sm rounded-xl hover:bg-cyan-800 transition-all shadow-md"
              >
                <Plus /> Add Day
              </button>
            </div>

            <div className="space-y-3">
              {program.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className="bg-white border border-cyan-100/50 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={day.dayName}
                      onChange={(e) =>
                        handleDayNameChange(dayIdx, e.target.value)
                      }
                      className={`flex-1 p-2 border bg-gray-200 border-black rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm ${
                        errors[`day_${dayIdx}_name`]
                          ? "border-red-400 focus:ring-red-500"
                          : ""
                      }`}
                      placeholder="e.g. Monday"
                    />
                    <button
                      onClick={() => handleAddExercise(dayIdx)}
                      className="p-2.5 bg-green-400 hover:bg-green-600 text-white text-xs rounded-xl  transition-all shadow-sm"
                    >
                      <Plus size={16} />
                    </button>
                    {program.length > 1 && (
                      <button
                        onClick={() => handleDeleteDay(dayIdx)}
                        className="p-2.5 bg-red-400 hover:bg-red-600 text-white text-xs rounded-xl  transition-all shadow-sm"
                      >
                        <Minus size={16} />
                      </button>
                    )}
                  </div>
                  {errors[`day_${dayIdx}_name`] && (
                    <div className="text-xs text-red-500 pl-1 mb-4">
                      {errors[`day_${dayIdx}_name`]}
                    </div>
                  )}

                  <div className="space-y-1">
                    {/* Header row for exercise columns */}
                    <div className="flex items-center justify-between gap-3 p-2 bg-cyan-50 rounded-lg border border-cyan-100/40">
                      <div className="flex-1 text-sm font-medium text-gray-600 px-2">
                        Name
                      </div>
                      <div className="w-25 text-sm font-medium text-gray-600 px-2">
                        Description
                      </div>
                      <div className="w-15 text-center text-sm font-medium text-gray-600">
                        Sets
                      </div>
                      <div className="w-15 text-center text-sm font-medium text-gray-600">
                        Reps
                      </div>
                      <div className="w-15 text-center text-sm font-medium text-gray-600">
                        Rest
                      </div>
                      <div className="w-12" />
                    </div>
                    {day.exercises.map((ex, i) => {
                      const prefix = `prog_${dayIdx}_ex_${i}_`;
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-3 p-1 bg-white rounded-xl border border-cyan-100/50"
                        >
                          <input
                            className={`w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm ${
                              errors[prefix + "name"]
                                ? "border-red-400 focus:ring-red-500"
                                : ""
                            }`}
                            value={ex.name}
                            onChange={(e) =>
                              handleExerciseChange(
                                dayIdx,
                                i,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Exercise name"
                          />
                          {errors[prefix + "name"] && (
                            <div className="text-xs text-red-500">
                              {errors[prefix + "name"]}
                            </div>
                          )}

                          {/* description column (keeps same width as header) */}
                          <input
                            className="w-25 p-2 text-left border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm"
                            value={ex.category}
                            onChange={(e) =>
                              handleExerciseChange(
                                dayIdx,
                                i,
                                "category",
                                e.target.value
                              )
                            }
                            placeholder="Description"
                          />
                          <input
                            className={`w-15 text-center p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm ${
                              errors[prefix + "sets"]
                                ? "border-red-400 focus:ring-red-500"
                                : ""
                            }`}
                            value={ex.sets}
                            onChange={(e) =>
                              handleExerciseChange(
                                dayIdx,
                                i,
                                "sets",
                                e.target.value
                              )
                            }
                            placeholder="Sets"
                          />
                          {errors[prefix + "sets"] && (
                            <div className="text-xs text-red-500">
                              {errors[prefix + "sets"]}
                            </div>
                          )}
                          <input
                            className={`w-15 text-center p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm ${
                              errors[prefix + "reps"]
                                ? "border-red-400 focus:ring-red-500"
                                : ""
                            }`}
                            value={ex.reps}
                            onChange={(e) =>
                              handleExerciseChange(
                                dayIdx,
                                i,
                                "reps",
                                e.target.value
                              )
                            }
                            placeholder="Reps"
                          />
                          {errors[prefix + "reps"] && (
                            <div className="text-xs text-red-500">
                              {errors[prefix + "reps"]}
                            </div>
                          )}
                          <input
                            className="w-15 text-center p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm"
                            value={ex.rest}
                            onChange={(e) =>
                              handleExerciseChange(
                                dayIdx,
                                i,
                                "rest",
                                e.target.value
                              )
                            }
                            placeholder="Rest (s)"
                          />
                          <button
                            onClick={() => handleDeleteExercise(dayIdx, i)}
                            className="text-red-600 hover:text-red-800 p-2.5 rounded-xl transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Description editor outside table */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Workout description
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-xl px-4 py-3  focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all shadow-sm resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Program notes, progression, equipment, tips..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center ">
              <h3 className="font-semibold text-lg text-gray-800">
                Daily Meals
              </h3>
              <button
                onClick={handleAddMeal}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white text-sm rounded-xl hover:bg-cyan-800 transition-all shadow-md"
              >
                <Plus /> Add Meal
              </button>
            </div>

            <div className="rounded-xl border border-teal-100/50 overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700 table-fixed">
                <thead className="bg-teal-100 text-gray-900 sticky top-0 rounded-t-xl">
                  <tr>
                    <th className="py-4 px-6 text-left font-semibold w-[200px]">
                      Name
                    </th>
                    <th className="py-4 px-6 text-left font-semibold w-20">
                      Calories
                    </th>
                    <th className="py-4 px-6 text-left font-semibold w-20">
                      Protein
                    </th>
                    <th className="py-4 px-6 text-left font-semibold w-20">
                      Carbs
                    </th>
                    <th className="py-4 px-6 text-left font-semibold w-20">
                      Fat
                    </th>
                    <th className="py-4 px-6 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-100/50">
                  {dailyMeals.map((meal, i) => (
                    <tr
                      key={i}
                      className={`hover:bg-teal-50/50 transition-colors cursor-pointer ${
                        selectedMealIndex === i ? "bg-teal-50/30" : ""
                      }`}
                      onClick={() => setSelectedMealIndex(i)}
                    >
                      <td className="py-1 px-3 align-top">
                        <input
                          className={`px-4 py-2.5 w-full border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-sm ${
                            errors[`meal_${i}_name`]
                              ? "border-red-400 focus:ring-red-500"
                              : ""
                          }`}
                          value={meal.name}
                          onChange={(e) =>
                            handleMealChange(i, "name", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        {errors[`meal_${i}_name`] && (
                          <div className="text-xs text-red-500 mt-1">
                            {errors[`meal_${i}_name`]}
                          </div>
                        )}
                      </td>
                      <td className="py-1 px-3 align-top">
                        <input
                          className={`px-3 py-2.5 w-15 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-sm text-center ${
                            errors[`meal_${i}_calories`]
                              ? "border-red-400 focus:ring-red-500"
                              : ""
                          }`}
                          value={meal.calories}
                          onChange={(e) =>
                            handleMealChange(i, "calories", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        {errors[`meal_${i}_calories`] && (
                          <div className="text-xs text-red-500 mt-1">
                            {errors[`meal_${i}_calories`]}
                          </div>
                        )}
                      </td>
                      <td className="py-1 px-3 align-top">
                        <input
                          className="px-3 py-2.5 w-15 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-sm text-center"
                          value={meal.protein}
                          onChange={(e) =>
                            handleMealChange(i, "protein", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="py-1 px-3 align-top">
                        <input
                          className="px-3 py-2.5 w-15 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-sm text-center"
                          value={meal.carbs}
                          onChange={(e) =>
                            handleMealChange(i, "carbs", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="py-1 px-3 align-top">
                        <input
                          className="px-3 py-2.5 w-15 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-sm text-center"
                          value={meal.fat}
                          onChange={(e) =>
                            handleMealChange(i, "fat", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="py-1 px-3 text-center align-middle">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeal(i);
                          }}
                          className="text-red-600 hover:text-red-800 p-2.5 rounded-xl transition-colors"
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
            <div className="mt-6">
              <label className="text-sm font-semibold text-gray-700">
                Selected meal description
              </label>
              {selectedMealIndex === null ? (
                <div className="text-sm text-gray-500 mt-2 p-4 bg-gray-50 rounded-xl">
                  Select a meal row to add/edit its description.
                </div>
              ) : (
                <textarea
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 mt-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all shadow-sm resize-none"
                  value={dailyMeals[selectedMealIndex]?.description || ""}
                  onChange={(e) =>
                    handleMealChange(
                      selectedMealIndex,
                      "description",
                      e.target.value
                    )
                  }
                  rows={4}
                />
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-3 font-semibold rounded-xl transition-all shadow-lg ${
            canSubmit
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700 focus:ring-2 focus:ring-cyan-500"
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
