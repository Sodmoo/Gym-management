// DetailModal.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Target, X, ChevronDown, Utensils } from "lucide-react";

const DetailModal = ({ isOpen, onClose, title, type, data }) => {
  const [expandedDays, setExpandedDays] = useState(new Set());
  const [expandedMeals, setExpandedMeals] = useState(new Set());

  const toggleDay = (dayIndex) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayIndex)) {
      newExpanded.delete(dayIndex);
    } else {
      newExpanded.add(dayIndex);
    }
    setExpandedDays(newExpanded);
  };

  const toggleMeal = (mealIndex) => {
    const newExpanded = new Set(expandedMeals);
    if (newExpanded.has(mealIndex)) {
      newExpanded.delete(mealIndex);
    } else {
      newExpanded.add(mealIndex);
    }
    setExpandedMeals(newExpanded);
  };

  if (!isOpen) return null;

  // Derive fields for workout
  const derivedWorkoutData = {
    ...data,
    totalDays: data.program?.length || 0,
    totalExercises:
      data.program?.reduce(
        (sum, day) => sum + (day.isRestDay ? 0 : day.exercises?.length || 0),
        0
      ) || 0,
    duration: `${data.durationWeeks || 4} weeks`,
    created: data.createdAt
      ? new Date(data.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Unknown",
  };

  // Derive fields for diet
  const derivedDietData = {
    ...data,
    totalCalories:
      data.totalCalories ||
      data.dailyMeals?.reduce((sum, meal) => sum + (meal.calories || 0), 0) ||
      0,
    duration: `${data.durationDays || 7} days`,
    created: data.createdAt
      ? new Date(data.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Unknown",
  };

  const isDayExpanded = (dayIndex) => expandedDays.has(dayIndex);
  const isMealExpanded = (mealIndex) => expandedMeals.has(mealIndex);

  const currentData = type === "workout" ? derivedWorkoutData : derivedDietData;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center  p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white rounded-lg shadow-2xl max-w-250 w-full max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200 relative">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 0.95 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-md  hover:bg-cyan-200 hover:text-blue-600 transition-colors "
            >
              <X size={24} />
            </motion.button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {type === "workout" ? (
            // Workout: Grid layout for Description and Template Details
            <>
              {/* Description and Template Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Description */}
                {currentData?.description && (
                  <div className="bg-cyan-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-2 text-lg flex items-center gap-2">
                      <Dumbbell size={18} className="text-blue-600" />
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {currentData.description}
                    </p>
                  </div>
                )}

                {/* Template Details */}
                <div className="bg-cyan-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">
                    Template Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium text-gray-900">
                        {currentData.duration}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-gray-600 flex items-center gap-1">
                        Target Goal
                      </span>
                      <span className="font-medium text-gray-900">
                        {currentData.goal || "General Fitness"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-gray-600">Total Days</span>
                      <span className="font-medium text-gray-900">
                        {currentData.totalDays}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-gray-600">Total Exercises</span>
                      <span className="font-medium text-gray-900">
                        {currentData.totalExercises}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-gray-600">Created</span>
                      <span className="font-medium text-gray-900">
                        {currentData.created}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workout Program */}
              {currentData?.program?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 text-xl mb-2 flex items-center gap-2">
                    <Dumbbell size={20} className="text-blue-600" />
                    Workout Program
                  </h3>
                  <div className="space-y-2">
                    {currentData.program.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                      >
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => !day.isRestDay && toggleDay(dayIndex)}
                        >
                          <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-3 flex-1">
                            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {dayIndex + 1}
                            </span>
                            {day.dayName}
                            {day.isRestDay && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                Rest Day
                              </span>
                            )}
                          </h4>
                          {!day.isRestDay && (
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600 font-medium text-sm">
                                {day.exercises?.length || 0} exercises
                              </span>
                              <motion.div
                                animate={{
                                  rotate: isDayExpanded(dayIndex) ? 180 : 0,
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown
                                  size={20}
                                  className="text-gray-500"
                                />
                              </motion.div>
                            </div>
                          )}
                        </div>
                        <>
                          {day.notes && (
                            <p className="text-gray-700 mb-3 text-sm italic mt-3">
                              {day.notes}
                            </p>
                          )}
                          {isDayExpanded(dayIndex) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {/* Improved Compact Exercises Table */}
                              <div className="overflow-x-auto rounded-lg border border-gray-200 mt-2 shadow-sm">
                                <table className="w-full bg-white divide-y divide-gray-200">
                                  <thead className="bg-cyan-100 sticky top-0">
                                    <tr>
                                      <th className="px-4 py-3  text-xs text-center font-bold text-gray-700 uppercase tracking-wider w-15">
                                        #
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider ">
                                        Exercise
                                      </th>
                                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-25">
                                        Sets
                                      </th>
                                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-25">
                                        Reps
                                      </th>
                                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-25">
                                        Rest
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {day.exercises?.map((ex, exIndex) => (
                                      <tr
                                        key={exIndex}
                                        className="hover:bg-gray-50 transition-colors"
                                      >
                                        <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900 text-center">
                                          {exIndex + 1}
                                        </td>
                                        <td className="px-4 py-2">
                                          <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8">
                                              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Dumbbell
                                                  size={15}
                                                  className="text-blue-600"
                                                />
                                              </div>
                                            </div>
                                            <div className="ml-3">
                                              <div className=" font-semibold text-gray-900">
                                                {ex.name}
                                              </div>
                                              {ex.category && (
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                                  {ex.category}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center ">
                                          {ex.sets}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                                          {ex.reps}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                                          <span
                                            className={`inline-flex px-1.5 py-0.5 text-sm font-medium rounded-full ${
                                              ex.rest <= 30
                                                ? "bg-green-100 text-green-600"
                                                : ex.rest <= 60
                                                ? "bg-yellow-100 text-yellow-600"
                                                : "bg-red-100 text-red-600"
                                            }`}
                                          >
                                            {ex.rest}s
                                          </span>
                                        </td>
                                      </tr>
                                    )) || (
                                      <tr>
                                        <td
                                          colSpan={5}
                                          className="px-4 py-8 text-center text-gray-500 italic text-sm"
                                        >
                                          No exercises
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </motion.div>
                          )}
                        </>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Diet: Full width layout
            <>
              {/* Template Details (full width) */}
              <div className="bg-green-50 rounded-lg p-4 border border-gray-200 w-full">
                <h3 className="font-semibold text-gray-800 mb-2 text-lg">
                  Template Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium text-gray-900">
                      {currentData.duration}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-gray-600 flex items-center gap-1">
                      Target Goal
                    </span>
                    <span className="font-medium text-gray-900">
                      {currentData.goal || "General Nutrition"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-gray-600">Total Calories</span>
                    <span className="font-medium text-gray-900">
                      {currentData.totalCalories} kcal
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium text-gray-900">
                      {currentData.created}
                    </span>
                  </div>
                  {currentData?.notes && (
                    <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-gray-600">Notes</span>
                      <span className="font-medium text-gray-900">
                        {currentData.notes}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Daily Meal Plan */}
              {currentData?.dailyMeals?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 text-xl mb-2 flex items-center gap-2">
                    <Utensils size={20} className="text-teal-600" />
                    Daily Meal Plan
                  </h3>
                  <div className="space-y-2">
                    {currentData.dailyMeals.map((meal, mealIndex) => (
                      <div
                        key={mealIndex}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                      >
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleMeal(mealIndex)}
                        >
                          <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-3 flex-1">
                            <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {mealIndex + 1}
                            </span>
                            {meal.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-teal-600 font-medium text-sm">
                              {meal.calories || 0} kcal
                            </span>
                            <motion.div
                              animate={{
                                rotate: isMealExpanded(mealIndex) ? 180 : 0,
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown
                                size={20}
                                className="text-gray-500"
                              />
                            </motion.div>
                          </div>
                        </div>
                        {isMealExpanded(mealIndex) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="mt-3 space-y-2">
                              <p className="text-gray-700 text-sm italic">
                                {meal.description || "No description"}
                              </p>
                              <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full bg-white divide-y divide-gray-200">
                                  <thead className="bg-teal-50">
                                    <tr>
                                      <th className="px-4 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Calories
                                      </th>
                                      <th className="px-4 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Protein
                                      </th>
                                      <th className="px-4 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Carbs
                                      </th>
                                      <th className="px-4 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Fat
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    <tr>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-teal-600 text-center">
                                        {meal.calories || 0} kcal
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                                        {meal.protein || 0}g
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                                        {meal.carbs || 0}g
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                                        {meal.fat || 0}g
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Fallback */}
          {type !== "workout" && type !== "diet" && (
            <p className="text-center text-gray-400 italic py-12">
              No {type} data available.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DetailModal;
