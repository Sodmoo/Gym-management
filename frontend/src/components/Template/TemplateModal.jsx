import React, { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, X, Minus, Plus } from "lucide-react";

const TemplateModal = ({
  onClose,
  onSave,
  editingTemplate, // null or object
  type = "workout", // "workout" or "diet"
  trainerId, // NEW: Add this prop (required for create)
}) => {
  const firstInputRef = useRef(null);
  const themeColor = type === "workout" ? "cyan" : "green";

  // -----------------------
  // Common fields (match backend schemas)
  // -----------------------
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [totalCalories, setTotalCalories] = useState(""); // For diet total calories
  const [notes, setNotes] = useState(""); // For diet notes

  // For workout: program structure
  const [program, setProgram] = useState([]);
  // For workout: selected day index
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // For diet: flat array of dailyMeals
  const [dailyMeals, setDailyMeals] = useState([]);

  // For diet: selected meal for description editing
  const [selectedMealIdx, setSelectedMealIdx] = useState(null);

  const [activeTab, setActiveTab] = useState("basic");
  const [errors, setErrors] = useState({});

  // Day names for workout
  const dayNames = React.useMemo(
    () => [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    []
  );

  // Options for workout
  const targetGoalOptions = [
    "Weight Loss",
    "Muscle Gain",
    "Strength Building",
    "Endurance",
    "Flexibility",
    "Maintenance",
  ];
  const workoutCategoryOptions = ["Full Body", "Upper Body", "Lower Body"];

  // FIXED: Default category based on type (hardcoded first option)
  const defaultCategory = "Full Body";

  // -----------------------
  // Initialize editingTemplate -> map to state according to schema
  // -----------------------
  useEffect(() => {
    if (!editingTemplate) {
      setTitle("");
      setGoal("");
      setDescription("");
      setCategory(type === "workout" ? defaultCategory : "");
      setDifficulty("");
      setDurationWeeks("");
      setDurationDays("");
      setTotalCalories("");
      setNotes("");
      if (type === "workout") {
        setProgram(
          dayNames.map((name, i) => ({
            name,
            dayName: name,
            isRest: i === 2 || i === 6, // Wednesday and Sunday as rest
            isRestDay: i === 2 || i === 6,
            exercises: [],
          }))
        );
        setSelectedDayIdx(0);
      } else {
        setDailyMeals([]);
        setSelectedMealIdx(null);
      }
    } else {
      setTitle(editingTemplate.title || "");
      setGoal(editingTemplate.goal || "");
      setDescription(editingTemplate.description || "");
      setCategory(
        type === "workout" ? editingTemplate.category || defaultCategory : ""
      );
      setDifficulty(editingTemplate.difficulty || "");
      setDurationWeeks(
        editingTemplate.durationWeeks != null
          ? String(editingTemplate.durationWeeks)
          : ""
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
      setNotes(editingTemplate.notes || "");

      if (type === "workout") {
        const existingDays = editingTemplate.program || [];
        setProgram(
          dayNames.map((name, i) => {
            const exDay = existingDays[i] || { exercises: [], dayName: name };
            return {
              dayName: exDay.dayName || name,
              name: exDay.dayName || name,
              isRest: (exDay.exercises || []).length === 0,
              isRestDay: (exDay.exercises || []).length === 0,
              exercises: (exDay.exercises || []).map((e) => ({
                type: e.type || "exercise",
                name: e.name || (e.type === "rest" ? "Rest" : ""),
                category: e.category || "",
                sets: e.sets != null ? String(e.sets) : "3",
                reps: e.reps != null ? String(e.reps) : "10",
                rest: e.rest != null ? String(e.rest) : "60",
              })),
            };
          })
        );
        setSelectedDayIdx(0);
      } else {
        // For diet, load dailyMeals directly
        setDailyMeals(editingTemplate.dailyMeals || []);
        setSelectedMealIdx(null);
      }
    }

    // autofocus first input when modal opens
    setTimeout(() => firstInputRef.current?.focus(), 0);
  }, [editingTemplate, type, defaultCategory, dayNames]);

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
  // Handlers for workout program
  // -----------------------
  const handleToggleRest = useCallback((dayIdx, isRest) => {
    setProgram((prev) =>
      prev.map((day, i) =>
        i === dayIdx
          ? {
              ...day,
              isRest,
              isRestDay: isRest,
              exercises: isRest ? [] : day.exercises,
            }
          : day
      )
    );
  }, []);

  const handleAddItem = useCallback((dayIdx) => {
    setProgram((prev) => {
      const newItem = {
        type: "exercise",
        name: "",
        category: "",
        sets: "3",
        reps: "10",
        rest: "60",
      };
      return prev.map((day, idx) =>
        idx === dayIdx
          ? { ...day, exercises: [...day.exercises, newItem] }
          : day
      );
    });
  }, []);

  const handleItemChange = useCallback((dayIdx, itemIdx, field, value) => {
    setProgram((prev) => {
      return prev.map((day, dIdx) =>
        dIdx === dayIdx
          ? {
              ...day,
              exercises: day.exercises.map((item, iIdx) =>
                iIdx === itemIdx ? { ...item, [field]: value } : item
              ),
            }
          : day
      );
    });
  }, []);

  const handleDeleteItem = useCallback((dayIdx, itemIdx) => {
    setProgram((prev) => {
      return prev.map((day, idx) =>
        idx === dayIdx
          ? {
              ...day,
              exercises: day.exercises.filter((_, j) => j !== itemIdx),
            }
          : day
      );
    });
  }, []);

  // -----------------------
  // Handlers for diet meals
  // -----------------------
  const handleAddMeal = useCallback(() => {
    const newMeal = {
      name: "",
      description: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
    };
    setDailyMeals((prev) => [...prev, newMeal]);
  }, []);

  const handleMealChange = useCallback((mealIdx, field, value) => {
    setDailyMeals((prev) => {
      return prev.map((meal, idx) =>
        idx === mealIdx ? { ...meal, [field]: value } : meal
      );
    });
  }, []);

  const handleDeleteMeal = useCallback(
    (mealIdx) => {
      setDailyMeals((prev) => prev.filter((_, idx) => idx !== mealIdx));
      if (selectedMealIdx === mealIdx) {
        setSelectedMealIdx(null);
      }
    },
    [selectedMealIdx]
  );

  const calculateTotalCalories = useCallback(() => {
    return dailyMeals.reduce((sum, meal) => {
      const cal = parseFloat(meal.calories) || 0;
      return sum + cal;
    }, 0);
  }, [dailyMeals]);

  // -----------------------
  // Validation: ensure required schema fields present
  // -----------------------
  const validate = useCallback(() => {
    const e = {};
    if (!title || !title.trim()) e.title = "Title is required";

    if (type === "workout") {
      if (!category || !category.trim()) e.category = "Category is required";

      program.forEach((day, dayIdx) => {
        if (day.isRest) return;
        const items = day.exercises;
        items.forEach((item, itemIdx) => {
          const prefix = `prog_${dayIdx}_ex_${itemIdx}_`;
          if (!item.name || !item.name.trim())
            e[prefix + "name"] = "Item name required";
          if (item.type !== "rest") {
            if (item.sets == null || isNaN(Number(item.sets)))
              e[prefix + "sets"] = "Sets must be a number";
            if (item.reps == null || isNaN(Number(item.reps)))
              e[prefix + "reps"] = "Reps must be a number";
          }
        });
      });
    } else {
      // For diet
      dailyMeals.forEach((meal, mealIdx) => {
        const prefix = `meal_${mealIdx}_`;
        if (!meal.name || !meal.name.trim())
          e[prefix + "name"] = "Meal name required";
        if (meal.calories !== "" && isNaN(Number(meal.calories)))
          e[prefix + "calories"] = "Calories must be a number";
      });
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [title, category, program, dailyMeals, type]);

  // -----------------------
  // Submit: normalize to backend schema types
  // -----------------------
  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      goal: goal.trim() || undefined,
      trainerId,
    };

    if (type === "workout") {
      payload.description = description.trim() || undefined;
      payload.category = category.trim() || undefined;
      payload.difficulty = difficulty.trim() || undefined;
      const dw = durationWeeks !== "" ? parseInt(durationWeeks, 10) : undefined;
      if (dw) payload.durationWeeks = dw;
      payload.program = program.map((day) => ({
        dayName: (day.dayName || day.name || "").trim(),
        isRestDay: day.isRestDay || false,
        exercises: (day.exercises || []).map((ex) => {
          if (ex.type === "rest") {
            return { type: "rest", name: ex.name?.trim() || "Rest" };
          }
          return {
            type: "exercise",
            name: ex.name.trim(),
            category: ex.category.trim() || undefined,
            sets: parseInt(ex.sets, 10),
            reps: parseInt(ex.reps, 10),
            rest: ex.rest !== "" ? parseInt(ex.rest, 10) : undefined,
          };
        }),
      }));
    } else {
      // For diet
      const dd = durationDays !== "" ? parseInt(durationDays, 10) : 7; // default 7
      payload.durationDays = dd;
      const tc = calculateTotalCalories();
      if (tc > 0) payload.totalCalories = tc;
      payload.dailyMeals = dailyMeals.map((m) => ({
        name: m.name.trim(),
        description: m.description.trim() || undefined,
        calories: m.calories !== "" ? parseInt(m.calories, 10) : undefined,
        protein: m.protein !== "" ? parseFloat(m.protein) : undefined,
        carbs: m.carbs !== "" ? parseFloat(m.carbs) : undefined,
        fat: m.fat !== "" ? parseFloat(m.fat) : undefined,
      }));
      payload.notes = notes.trim() || undefined;
    }

    // include _id when editing so parent knows update vs create
    if (editingTemplate?._id) payload._id = editingTemplate._id;

    onSave(payload);
  };

  const canSubmit = !!(
    title &&
    title.trim().length &&
    (type === "workout" ? category : true)
  );

  // -----------------------
  // Render
  // -----------------------
  const focusRingClass = `focus:ring-2 focus:ring-${themeColor}-500 focus:border-${themeColor}-500`;

  // Conditional tabs
  const tabs =
    type === "workout"
      ? [
          { key: "basic", label: "Basic Info" },
          { key: "daybuilder", label: "Day Builder" },
          { key: "preview", label: "Preview" },
        ]
      : [
          { key: "basic", label: "Basic Info" },
          { key: "meals", label: "Meals" },
          { key: "notes", label: "Notes" },
          { key: "preview", label: "Preview" },
        ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 z-50"
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] p-5 relative space-y-6 border border-${themeColor}-100/50 overflow-y-auto custom-scrollbar`}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-md hover:bg-cyan-300 text-black hover:text-white transition-colors cursor-pointer"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br from-${themeColor}-100 to-${themeColor}-200`}
          >
            <span className="text-2xl">{type === "workout" ? "🏋️" : "🥗"}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {editingTemplate
              ? `Edit ${type === "workout" ? "Workout" : "Diet"} Template`
              : `Create ${type === "workout" ? "Workout" : "Diet"} Template`}
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4 gap-2 ">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-shrink-0 px-6 py-3 -mb-px font-medium transition-colors whitespace-nowrap ${
                activeTab === key
                  ? `border-b-2 border-${themeColor}-500 text-${themeColor}-600`
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {type === "workout" ? (
          // Workout content
          <>
            {activeTab === "basic" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Template Name *
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full border border-gray-300 rounded-xl p-3 focus:outline-none ${focusRingClass} transition-all shadow-sm ${
                      errors.title ? "border-red-400 focus:ring-red-500" : ""
                    }`}
                    placeholder="Upper Body Split"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full border border-gray-300 rounded-xl p-3 focus:outline-none ${focusRingClass} transition-all shadow-sm resize-none`}
                    rows={3}
                    placeholder="Describe the template purpose and benefits"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Target Goal
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className={`w-full border border-gray-300 rounded-xl p-3 focus:outline-none ${focusRingClass} transition-all shadow-sm`}
                  >
                    <option value="">Select an option</option>
                    {targetGoalOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`w-full border border-gray-300 rounded-xl p-3 focus:outline-none ${focusRingClass} transition-all shadow-sm ${
                        errors.category
                          ? "border-red-400 focus:ring-red-500"
                          : ""
                      }`}
                    >
                      <option value="">Select an option</option>
                      {workoutCategoryOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Duration (weeks)
                    </label>
                    <input
                      type="number"
                      value={durationWeeks}
                      onChange={(e) => setDurationWeeks(e.target.value)}
                      className={`w-full border border-gray-300 rounded-xl p-3 focus:outline-none ${focusRingClass} transition-all shadow-sm`}
                      placeholder="e.g., 4"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "daybuilder" && (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <div className="flex gap-2">
                    {program.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedDayIdx(idx)}
                        className={`flex-shrink-0 px-6 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                          idx === selectedDayIdx
                            ? "bg-blue-500 text-white shadow-md"
                            : day.isRest
                            ? "bg-cyan-100 text-blue-500 border border-gray-200"
                            : "bg-white border border-gray-200 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {day.isRest ? "Rest Day" : day.name}
                      </button>
                    ))}
                  </div>
                </div>
                {(() => {
                  const selectedDay = program[selectedDayIdx];
                  return (
                    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {selectedDay.name}
                        </h4>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer text-center">
                            <input
                              type="checkbox"
                              checked={selectedDay.isRest}
                              onChange={(e) =>
                                handleToggleRest(
                                  selectedDayIdx,
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">
                              Rest Day
                            </span>
                          </label>
                          {!selectedDay.isRest && (
                            <button
                              onClick={() => handleAddItem(selectedDayIdx)}
                              className={`flex items-center gap-2 px-3 py-2 text-white text-sm rounded-lg transition-all  bg-${themeColor}-600 hover:bg-${themeColor}-700`}
                            >
                              <Plus size={16} />
                              Add Exercise
                            </button>
                          )}
                        </div>
                      </div>

                      {selectedDay.isRest ? (
                        <div className="text-center py-8 text-gray-500">
                          Rest day. No exercises scheduled.
                        </div>
                      ) : selectedDay.exercises.length === 0 ? (
                        <div className="text-center py-5">
                          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <span className="text-3xl">🏋️</span>
                          </div>
                          <h5 className="text-lg font-medium text-gray-900 mb-2">
                            No Exercises Added
                          </h5>
                          <p className="text-gray-500 mb-6">
                            Start building your workout by adding exercises
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
                            <table className="min-w-full text-sm text-gray-700">
                              <thead className="bg-gradient-to-r from-cyan-200 to-cyan-300 text-gray-700 uppercase text-xs tracking-wide">
                                <tr>
                                  <th className="px-4 py-3 text-left font-semibold">
                                    Exercise
                                  </th>
                                  <th className="px-4 py-3 text-left font-semibold">
                                    Category
                                  </th>
                                  <th className="px-4 py-3 text-center font-semibold">
                                    Sets
                                  </th>
                                  <th className="px-4 py-3 text-center font-semibold">
                                    Reps
                                  </th>
                                  <th className="px-4 py-3 text-center font-semibold">
                                    Rest (s)
                                  </th>
                                  <th className="px-4 py-3 text-center font-semibold">
                                    Actions
                                  </th>
                                </tr>
                              </thead>

                              <tbody className="divide-y divide-gray-100">
                                {selectedDay.exercises.map((item, itemIdx) => {
                                  const prefix = `prog_${selectedDayIdx}_ex_${itemIdx}_`;
                                  return (
                                    <tr
                                      key={itemIdx}
                                      className="hover:bg-cyan-50 transition-all duration-150"
                                    >
                                      <td className="px-4 py-3">
                                        <input
                                          className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all ${
                                            errors[prefix + "name"]
                                              ? "border-red-400 focus:ring-red-400"
                                              : ""
                                          }`}
                                          value={item.name}
                                          onChange={(e) =>
                                            handleItemChange(
                                              selectedDayIdx,
                                              itemIdx,
                                              "name",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Exercise name"
                                        />
                                        {errors[prefix + "name"] && (
                                          <p className="text-xs text-red-500 mt-1">
                                            {errors[prefix + "name"]}
                                          </p>
                                        )}
                                      </td>

                                      <td className="px-4 py-3">
                                        <input
                                          className="w-36 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                                          value={item.category}
                                          onChange={(e) =>
                                            handleItemChange(
                                              selectedDayIdx,
                                              itemIdx,
                                              "category",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Category"
                                        />
                                      </td>

                                      <td className="px-4 py-3 text-center">
                                        <input
                                          className={`w-16 text-center border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all ${
                                            errors[prefix + "sets"]
                                              ? "border-red-400 focus:ring-red-400"
                                              : ""
                                          }`}
                                          value={item.sets}
                                          onChange={(e) =>
                                            handleItemChange(
                                              selectedDayIdx,
                                              itemIdx,
                                              "sets",
                                              e.target.value
                                            )
                                          }
                                          placeholder="3"
                                        />
                                        {errors[prefix + "sets"] && (
                                          <p className="text-xs text-red-500 mt-1">
                                            {errors[prefix + "sets"]}
                                          </p>
                                        )}
                                      </td>

                                      <td className="px-4 py-3 text-center">
                                        <input
                                          className={`w-16 text-center border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all ${
                                            errors[prefix + "reps"]
                                              ? "border-red-400 focus:ring-red-400"
                                              : ""
                                          }`}
                                          value={item.reps}
                                          onChange={(e) =>
                                            handleItemChange(
                                              selectedDayIdx,
                                              itemIdx,
                                              "reps",
                                              e.target.value
                                            )
                                          }
                                          placeholder="10"
                                        />
                                        {errors[prefix + "reps"] && (
                                          <p className="text-xs text-red-500 mt-1">
                                            {errors[prefix + "reps"]}
                                          </p>
                                        )}
                                      </td>

                                      <td className="px-4 py-3 text-center">
                                        <input
                                          className="w-16 text-center border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                                          value={item.rest}
                                          onChange={(e) =>
                                            handleItemChange(
                                              selectedDayIdx,
                                              itemIdx,
                                              "rest",
                                              e.target.value
                                            )
                                          }
                                          placeholder="60"
                                        />
                                      </td>

                                      <td className="px-4 py-3 text-center">
                                        <button
                                          onClick={() =>
                                            handleDeleteItem(
                                              selectedDayIdx,
                                              itemIdx
                                            )
                                          }
                                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-all"
                                          title="Delete exercise"
                                        >
                                          <Trash2 size={18} />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </section>
                  );
                })()}
              </div>
            )}

            {activeTab === "preview" && (
              <div className="space-y-4">
                <div className="space-y-4 bg-cyan-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800">
                    {title || "Untitled Template"}
                  </h3>
                  {description && (
                    <p className="text-gray-600">{description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Category:</span>{" "}
                      {category || "Not set"}
                    </div>
                    <div>
                      <span className="font-medium">Difficulty:</span>{" "}
                      {difficulty || "Not set"}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>{" "}
                      {durationWeeks || "Not set"} weeks
                    </div>
                    <div>
                      <span className="font-medium">Target Goal:</span>{" "}
                      {goal || "Not set"}
                    </div>
                  </div>
                </div>

                {program.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Plan
                    </h4>
                    {program.map((day, dayIdx) => (
                      <div
                        key={dayIdx}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                      >
                        <h5 className="font-medium text-gray-900 mb-3">
                          {day.name} {day.isRest ? "(Rest)" : ""}
                        </h5>
                        <div className="ml-4 space-y-3">
                          {day.exercises.length > 0 ? (
                            day.exercises.map((item, itemIdx) => (
                              <div key={itemIdx}>
                                <div className="font-medium">
                                  {item.name} ({item.category})
                                </div>
                                <div className="text-sm text-gray-600">
                                  {item.sets} sets x {item.reps} reps,{" "}
                                  {item.rest}s rest
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No exercises added
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No days added to the plan.
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          // Diet content
          <>
            {activeTab === "basic" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Template Name *
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full border border-gray-300 rounded-xl p-3 focus:outline-none ${focusRingClass} transition-all shadow-sm ${
                      errors.title ? "border-red-400 focus:ring-red-500" : ""
                    }`}
                    placeholder="7-Day Meal Plan"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Target Goal
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className={`w-full border border-gray-300 rounded-xl p-3 focus:outline-none ${focusRingClass} transition-all shadow-sm`}
                  >
                    <option value="">Select an option</option>
                    {targetGoalOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      className={`w-full border border-gray-300 rounded-xl p-3 focus:outline-none ${focusRingClass} transition-all shadow-sm`}
                      placeholder="e.g., 7"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Total Calories
                    </label>
                    <input
                      type="number"
                      value={calculateTotalCalories()}
                      readOnly
                      className={`w-full border border-gray-300 rounded-xl p-3 focus:outline-none ${focusRingClass} transition-all shadow-sm bg-gray-50`}
                      placeholder="Calculated from meals"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "meals" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-800">
                    Daily Meals
                  </h3>
                  <button
                    onClick={handleAddMeal}
                    className={`flex items-center gap-2 px-4 py-2 text-white text-sm rounded-xl hover:shadow-md transition-all shadow-sm bg-${themeColor}-600 hover:bg-${themeColor}-700`}
                  >
                    <Plus size={16} /> Add Meal
                  </button>
                </div>

                {dailyMeals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No meals added yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[250px]">
                            Meal
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                            Calories
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                            Protein (g)
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                            Carbs (g)
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                            Fat (g)
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dailyMeals.map((meal, mealIdx) => {
                          const prefix = `meal_${mealIdx}_`;
                          return (
                            <tr
                              key={mealIdx}
                              className={`hover:bg-gray-50 transition-colors ${
                                selectedMealIdx === mealIdx ? "bg-blue-50" : ""
                              }`}
                              onClick={(e) => {
                                if (
                                  !e.target.closest("input") &&
                                  !e.target.closest("button")
                                ) {
                                  setSelectedMealIdx(mealIdx);
                                }
                              }}
                            >
                              <td className="px-6 py-4">
                                <input
                                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none ${focusRingClass} transition-all ${
                                    errors[prefix + "name"]
                                      ? "border-red-400 focus:ring-red-500"
                                      : ""
                                  }`}
                                  value={meal.name}
                                  onChange={(e) =>
                                    handleMealChange(
                                      mealIdx,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter meal name"
                                />
                                {errors[prefix + "name"] && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {errors[prefix + "name"]}
                                  </p>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <input
                                  className={`w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none ${focusRingClass} transition-all ${
                                    errors[prefix + "calories"]
                                      ? "border-red-400 focus:ring-red-500"
                                      : ""
                                  }`}
                                  value={meal.calories}
                                  onChange={(e) =>
                                    handleMealChange(
                                      mealIdx,
                                      "calories",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                />
                                {errors[prefix + "calories"] && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {errors[prefix + "calories"]}
                                  </p>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <input
                                  className={`w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none ${focusRingClass} transition-all`}
                                  value={meal.protein}
                                  onChange={(e) =>
                                    handleMealChange(
                                      mealIdx,
                                      "protein",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                />
                              </td>
                              <td className="px-6 py-4 text-center">
                                <input
                                  className={`w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none ${focusRingClass} transition-all`}
                                  value={meal.carbs}
                                  onChange={(e) =>
                                    handleMealChange(
                                      mealIdx,
                                      "carbs",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                />
                              </td>
                              <td className="px-6 py-4 text-center">
                                <input
                                  className={`w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none ${focusRingClass} transition-all`}
                                  value={meal.fat}
                                  onChange={(e) =>
                                    handleMealChange(
                                      mealIdx,
                                      "fat",
                                      e.target.value
                                    )
                                  }
                                  placeholder="0"
                                />
                              </td>
                              <td className="px-4 py-4 text-center">
                                <button
                                  onClick={() => handleDeleteMeal(mealIdx)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Selected meal description */}
                {selectedMealIdx !== null && (
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Selected Meal Description
                    </label>
                    <textarea
                      className={`w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none ${focusRingClass} transition-all shadow-sm resize-none`}
                      value={dailyMeals[selectedMealIdx]?.description || ""}
                      onChange={(e) =>
                        handleMealChange(
                          selectedMealIdx,
                          "description",
                          e.target.value
                        )
                      }
                      rows={4}
                      placeholder="Describe ingredients, preparation, or notes for this meal..."
                    />
                  </div>
                )}

                {/* Total Calories */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Total Calories:
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                      {calculateTotalCalories()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full border border-gray-300 rounded-xl p-3 focus:outline-none ${focusRingClass} transition-all shadow-sm resize-none`}
                  rows={6}
                  placeholder="Any additional notes or instructions..."
                />
              </div>
            )}

            {activeTab === "preview" && (
              <div className="space-y-4">
                <div className="space-y-4 bg-green-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800">
                    {title || "Untitled Template"}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Duration:</span>{" "}
                      {durationDays || "7"} days
                    </div>
                    <div>
                      <span className="font-medium">Target Goal:</span>{" "}
                      {goal || "Not set"}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Total Calories:</span>{" "}
                      {calculateTotalCalories()}
                    </div>
                  </div>
                </div>

                {dailyMeals.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Daily Meals
                    </h4>
                    {dailyMeals.map((meal, mealIdx) => (
                      <div
                        key={mealIdx}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                      >
                        <div className="font-medium">{meal.name}:</div>
                        <div className="text-sm text-gray-600">
                          {meal.calories} cal | P: {meal.protein}g | C:{" "}
                          {meal.carbs}g | F: {meal.fat}g
                        </div>
                        {meal.description && (
                          <p className="text-gray-600 text-xs mt-1 italic">
                            {meal.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No meals added.
                  </div>
                )}
                {notes && (
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <h5 className="font-medium text-yellow-800 mb-2">Notes</h5>
                    <p className="text-sm text-yellow-700">{notes}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-3 font-semibold rounded-md transition-all shadow-lg ${
            canSubmit
              ? `bg-gradient-to-r from-${themeColor}-600 to-blue-600 text-white hover:from-${themeColor}-700 focus:ring-2 focus:ring-${themeColor}-500`
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
