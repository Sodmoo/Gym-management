import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, Target, Dumbbell, Utensils, Eye } from "lucide-react";

const OverviewTemplateCard = ({ t, type, onView }) => {
  const Icon = type === "workout" ? Dumbbell : Utensils;
  const isWorkout = type === "workout";

  // Professional Unsplash images - workout: gym scene, diet: balanced meal
  const getImageUrl = () => {
    if (isWorkout) {
      // Strength training image
      return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=350&q=80";
    }
    // Diet: healthy plate
    return "https://images.unsplash.com/photo-1521138124411-957f47d8b49d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=350&q=80";
  };

  const imageUrl = getImageUrl();

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
      {/* Image and Icon Overlay - Wider image aspect */}
      <div className="relative h-40 bg-cover bg-center overflow-hidden">
        <img
          src={imageUrl}
          alt={t.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
        />
        <div className="absolute top-3 right-3 bg-cyan-100 backdrop-blur-sm rounded-full p-2 shadow-lg">
          <Icon
            size={20}
            className={isWorkout ? "text-blue-600" : "text-green-600"}
          />
        </div>
        <div className="absolute bottom-3 left-3  ">
          <span className="text-sm font-semibold text-cyan-700 capitalize">
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
                ? "py-2.5 px-22 bg-blue-400 hover:bg-blue-100 rounded-lg transition-colors group-hover:text-blue-600"
                : "py-2.5 px-22 bg-green-400 hover:bg-green-100 rounded-lg transition-colors group-hover:text-blue-600"
            }
            aria-label="View template details"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OverviewTemplateCard;
