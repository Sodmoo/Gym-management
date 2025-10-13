// TemplateCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { Clock, Target, Dumbbell, Utensils, Edit, Trash2 } from "lucide-react";

const TemplateCard = ({ t, type, onEdit, onDelete, onView }) => {
  const Icon = type === "workout" ? Dumbbell : Utensils;
  const isWorkout = type === "workout";

  const totalExercises = isWorkout
    ? t.program?.reduce((acc, day) => acc + (day.exercises?.length || 0), 0)
    : 0;
  const totalMeals = !isWorkout ? t.dailyMeals?.length || 0 : 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.18 }}
      className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3 items-start flex-1 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-200 flex-shrink-0">
            <Icon size={20} className="text-cyan-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">
              {t.title}
            </h2>
            {t.goal && (
              <p className="text-sm text-gray-500 mt-1 truncate flex items-center gap-2">
                <Target size={12} className="text-cyan-500" />
                <span className="truncate">{t.goal}</span>
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                {isWorkout
                  ? `${t.durationWeeks ?? "—"}w`
                  : `${t.durationDays ?? "—"}d`}
              </div>
              <div>
                {isWorkout ? `${totalExercises} ex` : `${totalMeals} meals`}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(t)}
            className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full transition"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(t._id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        {isWorkout ? (
          <button
            onClick={() => onView("workout", t)}
            className="flex items-center justify-between px-4 py-2 bg-cyan-50 hover:bg-cyan-100 rounded-xl border border-cyan-200 transition-all"
          >
            <span className="flex items-center gap-2 text-cyan-700 font-semibold">
              <Dumbbell size={16} /> Workout
            </span>
            <span className="text-xs text-gray-500">
              {totalExercises} exercises
            </span>
          </button>
        ) : (
          <button
            onClick={() => onView("diet", t)}
            className="flex items-center justify-between px-4 py-2 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-200 transition-all"
          >
            <span className="flex items-center gap-2 text-teal-700 font-semibold">
              <Utensils size={16} /> Diet
            </span>
            <span className="text-xs text-gray-500">{totalMeals} meals</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default TemplateCard;
