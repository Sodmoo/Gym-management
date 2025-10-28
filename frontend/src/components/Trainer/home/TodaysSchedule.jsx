import {
  Clock,
  Check,
  Calendar,
  Plus,
  Users,
  Activity,
  Dumbbell,
  ClipboardList,
  Loader,
  Ruler,
  ClipboardClock,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TodaysSchedule = ({
  enhancedTodaySchedules,
  isLoadingSchedules,
  formatDate,
  getDefaultTimes,
  handleMarkComplete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const maxVisible = 3;
  const visibleSchedules = expanded
    ? enhancedTodaySchedules
    : enhancedTodaySchedules.slice(0, maxVisible);
  const hasMore = enhancedTodaySchedules.length > maxVisible;

  // Translation map for schedule types
  const typeTranslations = {
    workout: "Дасгал",
    meeting: "Уулзалт",
    measurement: "Хэмжилт",
    // Add more types as needed
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const loadingContent = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 h-full flex items-center justify-center">
      <div className="p-12 text-center">
        <motion.div
          animate={{
            rotate: [0, -2, 2, -2, 2, 0],
            scale: [1, 1.02, 1, 1.02, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.2, 0.4, 0.6, 0.8, 1],
          }}
          className="w-12 h-12 mx-auto mb-4 text-blue-600"
        >
          <Calendar className="w-full h-full" />
        </motion.div>
        <p className="text-lg font-medium text-gray-900">
          Өнөөдрийн хуваарийг ачаалж байна...
        </p>
      </div>
    </div>
  );

  const emptyContent = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 h-full flex items-center justify-center">
      <div className="text-center py-16 px-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
          <Calendar className="w-12 h-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Өнөөдөр цаг авахгүй байна
        </h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          Таны хуваарь цэвэр байна. Энэ цагийг ашиглан шинэ сургалт төлөвлөх
          эсвэл загваруудаа шалгах.
        </p>
      </div>
    </div>
  );

  const scheduleContent = (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 flex flex-col">
      {/* Enhanced Header */}
      <div className="bg-cyan-500 px-6 py-4 text-white flex-shrink-0 rounded-t-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <ClipboardClock className="w-6 h-6 text-blue-800" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Өнөөдрийн хуваарь</h2>
              <p className="text-gray-800 text-sm opacity-90">
                {formatDate(new Date(), "EEE, MMM do, yyyy")} •{" "}
                {enhancedTodaySchedules.length}{" "}
                {enhancedTodaySchedules.length === 1 ? "цаг авах" : "цаг авах"}
              </p>
            </div>
          </div>
          <button
            onClick={() => console.log("Бүх хуваарийн хуудас руу шилжих")} // Replace with actual navigation, e.g., useRouter
            className="flex items-center gap-2 px-4 py-2 hover:bg-white/80 rounded-md text-gray-700 transition-all backdrop-blur-sm font-medium text-sm cursor-pointer"
          >
            <Calendar className="w-5 h-5 " /> Бүх хуваарийг харах
          </button>
        </div>
      </div>

      {/* Schedule List */}
      <div className="flex-1 flex flex-col">
        <div
          className={`divide-y divide-gray-100 ${
            !expanded ? "flex-1 overflow-y-auto" : ""
          }`}
        >
          {visibleSchedules.map((schedule, index) => {
            const times = getDefaultTimes(schedule);
            const { startTime, endTime } = times;
            const isCompleted = schedule.isCompleted;
            const statusText = isCompleted ? "Дууссан" : "Хүлээгдэж буй";
            const statusClass = isCompleted
              ? "bg-green-100 text-green-800"
              : "bg-orange-100 text-orange-800";

            const SessionIcon =
              schedule.type === "workout"
                ? Dumbbell
                : schedule.type === "meeting"
                ? Users
                : schedule.type === "measurement"
                ? Ruler
                : Plus;

            const translatedType =
              typeTranslations[schedule.type] ||
              schedule.type?.charAt(0).toUpperCase() + schedule.type?.slice(1);

            return (
              <motion.div
                key={schedule._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="py-3.5 px-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative">
                      <img
                        src={schedule.memberImage}
                        alt={schedule.memberName}
                        className="w-15 h-15 rounded-full flex-shrink-0 object-cover"
                      />
                      {isCompleted && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {schedule.memberName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 truncate">
                        {translatedType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ">
                    <SessionIcon className="w-6 h-6 text-cyan-600 mt-1 flex-shrink-0" />
                    <div className="flex items-center gap-1 text-md font-medium text-gray-900">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{startTime}</span>
                      {endTime && (
                        <span className="text-gray-500">– {endTime}</span>
                      )}
                    </div>
                    <span
                      className={`px-3 py-2 rounded-lg text-xs font-medium ${statusClass}`}
                    >
                      {statusText}
                    </span>
                    {!isCompleted && (
                      <button
                        onClick={() => handleMarkComplete(schedule._id)}
                        className="p-2.5 bg-green-100 hover:bg-green-200 rounded-lg text-green-700 transition-all"
                        title="Дууссан гэж тэмдэглэх"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        {hasMore && (
          <div className="flex-shrink-0 p-4 border-t border-gray-100">
            <button
              onClick={() => setExpanded(!expanded)}
              className={`w-full py-2 rounded-lg font-medium transition-all ${
                expanded
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {expanded
                ? "Багасгах"
                : `Илүү их харах (+${
                    enhancedTodaySchedules.length - maxVisible
                  })`}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {isLoadingSchedules ? (
        <motion.div
          key="loading"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {loadingContent}
        </motion.div>
      ) : enhancedTodaySchedules.length === 0 ? (
        <motion.div
          key="empty"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {emptyContent}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {scheduleContent}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TodaysSchedule;
