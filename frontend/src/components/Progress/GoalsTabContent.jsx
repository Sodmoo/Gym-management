// GoalsTabContent.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  Target,
  Plus,
  Loader2,
  Scale,
  Percent,
  Award,
  TrendingUp,
  Edit2,
  MessageCircle,
} from "lucide-react";

const GoalsTabContent = ({
  isLoading,
  goals,
  handleAddGoal,
  handleEditGoal,
  handleUpdateProgress,
  handleAddNote,
  getGoalIcon,
  getGoalColor,
  getPriorityColor,
  getUnit,
}) => {
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
          <span className="text-gray-500">Loading goals...</span>
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Target size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 mb-4">No goals set yet.</p>
          <button
            onClick={handleAddGoal}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2 mx-auto"
          >
            <Plus size={16} />
            <span>Add First Goal</span>
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Goals</h3>
            <button
              onClick={handleAddGoal}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={16} />
              <span>Add Goal</span>
            </button>
          </div>
          {/* Staggered container with reduced stagger for smoother flow */}
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05, // Reduced stagger for quicker, smoother reveal
                  delayChildren: 0.1,
                },
              },
            }}
          >
            {goals.map((goal) => {
              const unit = getUnit(goal.goalType);
              const priorityBadge = getPriorityColor(goal.priority);
              return (
                <motion.div
                  key={goal._id}
                  variants={{
                    hidden: {
                      opacity: 0,
                      y: 20,
                      scale: 0.98,
                    },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        duration: 0.6, // Slightly longer for smoother feel
                        ease: "easeOut", // Smooth deceleration
                        type: "tween", // Switch to tween for less bounce, more fluid motion
                      },
                    },
                  }}
                  whileHover={{
                    scale: 1.01, // Subtler scale for smoother hover
                    y: -1, // Reduced lift
                    transition: {
                      duration: 0.15, // Faster hover response
                      ease: "easeInOut",
                    },
                  }}
                  className="relative overflow-hidden rounded-md border border-gray-200 shadow-md hover:shadow-xl transition-all bg-white"
                >
                  {/* Top Border Accent */}
                  <div
                    className={`absolute top-0 left-0 w-full h-1.5 ${getGoalColor(
                      goal.goalType
                    )}`}
                  ></div>

                  {/* Card Content */}
                  <div className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${getGoalColor(
                          goal.goalType
                        )}`}
                      >
                        {/* Dynamic goal icon based on goalType */}
                        {getGoalIcon(goal.goalType)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {goal.title}
                          </h3>
                          <span className={priorityBadge}>{goal.priority}</span>
                        </div>

                        {goal.description && (
                          <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-sm font-medium text-gray-800">
                      <div>
                        Current:&nbsp;
                        <span className="text-gray-500 font-normal">
                          {goal.currentValue} {unit}
                        </span>
                      </div>
                      <div>
                        Target:&nbsp;
                        <span className="text-gray-500 font-normal">
                          {goal.targetValue} {unit}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar with smoother animation */}
                    {goal.progress !== undefined && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-600">
                            Progress
                          </span>
                          <span className="text-xs font-semibold text-gray-900">
                            {goal.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${goal.progress}%` }}
                            transition={{
                              duration: 1.2, // Slightly longer for elegant sweep
                              ease: [0.25, 0.46, 0.45, 0.94], // Custom ease for ultra-smooth cubic-bezier
                            }}
                            className={`h-full rounded-full transition-colors duration-300 ${
                              goal.status === "On Track"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          ></motion.div>
                        </div>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <motion.button
                        whileHover={{ scale: 1.02 }} // Subtler hover
                        whileTap={{ scale: 0.98 }} // Gentler tap
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        }}
                        onClick={() => handleEditGoal(goal._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-200 text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-400 transition"
                      >
                        <Edit2 size={14} />
                        Edit
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        }}
                        onClick={() => handleUpdateProgress(goal._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 transition"
                      >
                        <TrendingUp size={14} />
                        Update
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17,
                        }}
                        onClick={() => handleAddNote(goal._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-400 transition"
                      >
                        <MessageCircle size={14} />
                        Note
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default GoalsTabContent;
