import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, Target, Dumbbell, Utensils, Eye } from "lucide-react";

const OverviewTemplateCard = ({ t, type, onView }) => {
  const Icon = type === "workout" ? Dumbbell : Utensils;
  const isWorkout = type === "workout";

  // Remove image URL and replace with gradient backgrounds
  const getBackgroundStyle = () => {
    if (isWorkout) {
      // Energetic gradient for workout
      return "bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600";
    }
    // Fresh gradient for diet
    return "bg-gradient-to-br from-green-400 via-green-500 to-emerald-600";
  };

  const backgroundStyle = getBackgroundStyle();

  // Calculate total exercises or meals based on model
  const totalExercises = isWorkout
    ? t.program?.reduce((acc, day) => acc + (day.exercises?.length || 0), 0)
    : 0;
  const totalMeals = !isWorkout ? t.dailyMeals?.length || 0 : 0; // Assuming diet has dailyMeals
  const total = isWorkout ? totalExercises : totalMeals;
  const totalLabel = isWorkout ? "Exercises" : "Meals";

  // Duration
  const duration = isWorkout
    ? `${t.durationWeeks ?? 4} weeks`
    : `${t.durationDays ?? 30} days`;

  // Updated days ago
  const updatedDate = t.updatedAt || t.createdAt;
  const daysAgo = useMemo(() => {
    if (!updatedDate) return "Recently updated";
    const now = new Date();
    const updated = new Date(updatedDate);
    const diff = now.getTime() - updated.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days === 0 ? "Today" : `${days} days ago`;
  }, [updatedDate]);

  return (
    <motion.div
      whileHover={{
        scale: 1.005,
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-sm shadow-md border border-gray-200 hover:border-gray-300 transition-all flex flex-col h-full min-h-[17rem] overflow-hidden group"
    >
      {/* Header with Gradient Background and Large Icon - Replaces image */}
      <div
        className={`relative h-40 ${backgroundStyle} flex items-center justify-center overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/10" />{" "}
        {/* Subtle overlay for depth */}
        <Icon
          size={64} // Larger icon to fill the space
          className="relative z-10 drop-shadow-lg"
          strokeWidth={1}
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
          <Icon
            size={20}
            className={isWorkout ? "text-blue-600" : "text-green-600"}
          />
        </div>
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded px-2 py-1">
          <span className="text-sm font-semibold text-gray-800 capitalize">
            {type}
          </span>
        </div>
      </div>

      {/* Content Body - Increased padding for wider feel */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        {/* Title, Duration, Goal */}
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1 pr-2">
              {t.title}
            </h3>
            <div className="bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap">
              <Clock size={12} className="inline mr-1" />
              {duration}
            </div>
          </div>
          {t.goal && (
            <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-600">
              <Target
                size={12}
                className={isWorkout ? "text-blue-500" : "text-green-500"}
              />
              <span className="truncate">{t.goal}</span>
            </div>
          )}
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {t.description ||
              "A comprehensive program tailored to your fitness and wellness goals."}
          </p>
        </div>

        {/* Stats Row */}
        <div className="mb-1">
          <div
            className={
              isWorkout
                ? "flex justify-between items-center text-sm text-blue-700"
                : "flex justify-between items-center text-sm text-green-700"
            }
          >
            <span className="capitalize">{totalLabel}</span>
            <span className="font-semibold text-gray-700">{total || 0}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span>updated {daysAgo}</span>
          <button
            onClick={() => onView(type, t)}
            className={
              isWorkout
                ? "py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1 group-hover:shadow-md" // Fixed px-22 to px-4 and added text-white
                : "py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-1 group-hover:shadow-md" // Fixed px-22 to px-4 and added text-white
            }
            aria-label="View template details"
          >
            <Eye size={16} />
            <span className="hidden sm:inline">View</span>{" "}
            {/* Optional: Add text label on larger screens */}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OverviewTemplateCard;
