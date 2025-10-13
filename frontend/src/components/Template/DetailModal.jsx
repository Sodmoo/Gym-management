// DetailModal.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Utensils,
  Target,
  Clock,
  Check,
  Edit,
  X,
} from "lucide-react";

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

        <div className="space-y-4 text-sm text-gray-700">
          {type === "workout" && data?.program?.length ? (
            <>
              <div className="bg-cyan-100 rounded-xl p-4 mb-4 flex flex-row gap-4">
                {data.goal && (
                  <div>
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

              <div className="overflow-x-auto">
                <table className="w-full bg-white border border-cyan-200 rounded-xl shadow-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-cyan-50 to-cyan-100">
                      <th className="px-4 py-3 text-left font-semibold text-gray-800 border-b border-cyan-200">
                        Weekly
                      </th>
                      {data.program.slice(0, 5).map((day, i) => (
                        <th
                          key={i}
                          className="px-4 py-3 text-center font-semibold text-gray-800 border-b border-cyan-200"
                        >
                          {day.dayName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border-r border-cyan-200 font-medium text-gray-700 bg-cyan-50">
                        Exercises
                      </td>
                      {data.program.slice(0, 5).map((day, i) => (
                        <td
                          key={i}
                          className="px-4 py-2 border-l border-cyan-200"
                        >
                          <ul className="space-y-2 text-xs mt-3">
                            {day.exercises?.map((ex, idx) => (
                              <li
                                key={idx}
                                className="pb-2 border-b border-black last:pb-0 last:border-b-0"
                              >
                                <span className="font-medium text-gray-800 mb-1 block">
                                  {ex.name}
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
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : type === "diet" && data?.dailyMeals?.length ? (
            <>
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

export default DetailModal;
