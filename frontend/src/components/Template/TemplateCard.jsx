import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Target,
  Dumbbell,
  Utensils,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

const TemplateCard = ({ t, type, onEdit, onDelete, onView }) => {
  const Icon = type === "workout" ? Dumbbell : Utensils;
  const isWorkout = type === "workout";

  const iconBgClass = isWorkout
    ? "from-cyan-100 to-cyan-200"
    : "from-green-100 to-green-200";
  const iconTextClass = isWorkout ? "text-cyan-700" : "text-green-700";
  const goalIconClass = isWorkout ? "text-cyan-500" : "text-green-500";
  const viewBgClass = isWorkout ? "bg-cyan-200" : "bg-green-200";
  const viewTextClass = isWorkout ? "text-blue-500" : "text-green-500";
  const viewHoverBgClass = isWorkout
    ? "hover:bg-blue-600"
    : "hover:bg-green-600";
  const viewHoverTextClass = "hover:text-white";

  const totalExercises = isWorkout
    ? t.program?.reduce((acc, day) => acc + (day.exercises?.length || 0), 0)
    : 0;
  const totalMeals = !isWorkout ? t.dailyMeals?.length || 0 : 0;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      className="bg-white/80 backdrop-blur-lg border h-65 border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl bg-gradient-to-br ${iconBgClass} flex-shrink-0`}
          >
            <Icon size={45} className={iconTextClass} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 truncate w-48">
              {t.title}
            </h2>
            {t.goal && (
              <p className="text-base text-gray-500 mt-0.5 truncate flex items-center gap-2">
                <Target size={12} className={goalIconClass} />
                <span>{t.goal}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center text-xs text-gray-500 gap-1 bg-gray-100 p-2 rounded-md">
          <Clock size={12} />
          {isWorkout
            ? `${t.durationWeeks ?? "—"}w`
            : `${t.durationDays ?? "—"}d`}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-3 flex-1 mb-4 w-full">
        {t.description ||
          "A balanced program designed to help achieve your fitness goals effectively."}
      </p>

      {/* Stats */}
      <div className="flex justify-between text-sm text-gray-500 mb-4">
        <span>
          {isWorkout ? `${totalExercises} exercises` : `${totalMeals} meals`}
        </span>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-1.5 mt-auto">
        <button
          onClick={() => onView(type, t)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 ${viewBgClass} ${viewHoverBgClass} ${viewTextClass} ${viewHoverTextClass} rounded-lg transition-all font-medium cursor-pointer`}
        >
          <Eye size={16} />
          View
        </button>
        <button
          onClick={() => onEdit(t)}
          className="p-3 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-100 rounded-md transition cursor-pointer"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => onDelete(t._id)}
          className="p-3 text-red-500 hover:text-red-600 hover:bg-red-100 rounded-md transition cursor-pointer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default TemplateCard;
