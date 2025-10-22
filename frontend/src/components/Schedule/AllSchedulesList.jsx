// components/AllSchedulesList.jsx
import React from "react";
import { FileText, Calendar, Plus } from "lucide-react";

const AllSchedulesList = ({
  filteredSchedules,
  formatDate,
  getDefaultTimes,
  getEventColor,
  getEventIcon,
  onScheduleClick,
  onCreateSchedule,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-md shadow-lg border border-white/20 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center space-x-2">
        <FileText className="w-10 h-10 text-cyan-300" aria-hidden="true" />
        <span>Бүх хуваарь ({filteredSchedules.length})</span>
      </h2>
      {filteredSchedules.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Calendar className="w-8 h-8 text-gray-400" aria-hidden="true" />
          </div>
          <p className="text-lg font-medium">
            No schedules match your filters.
          </p>
          <button
            onClick={onCreateSchedule}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 mx-auto transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Create first schedule"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Create your first schedule</span>
          </button>
        </div>
      ) : (
        <div
          className="space-y-2 max-h-101 overflow-y-auto custom-scrollbar p-1.5"
          role="list"
        >
          {filteredSchedules.map((schedule, i) => {
            const { startTime, endTime } = getDefaultTimes(schedule);
            const EventIcon = getEventIcon(schedule.type);
            return (
              <div
                key={schedule._id}
                className="group flex items-center justify-between p-3 bg-gradient-to-r from-white to-slate-50 rounded-md border-2 border-blue-600 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => onScheduleClick(schedule)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${
                  schedule.memberId?.userId?.username || "Client"
                }'s ${schedule.type} on ${formatDate(schedule.date, "MMM do")}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    onScheduleClick(schedule);
                }}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div
                    className={`rounded-md w-10 h-10 flex items-center justify-center bg-blue-600 text-white text-sm font-bold flex-shrink-0 shadow-md ${getEventColor(
                      schedule.type
                    )
                      .replace("border-", " ")
                      .replace("gradient-to-r", "bg-gradient-to-r")}`}
                  >
                    <EventIcon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {schedule.memberId?.userId?.username ||
                        schedule.memberId?.name ||
                        "N/A"}
                    </div>
                    <div className="text-sm text-gray-600 truncate flex items-center space-x-3 mt-0.5">
                      <span>{formatDate(schedule.date, "MMM do")}</span>
                      <span>|</span>
                      <span>
                        {startTime} - {endTime}
                      </span>
                      <span>|</span>
                      <span className="text-gray-500 capitalize">
                        {schedule.type}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-2 rounded-md text-xs font-semibold ml-3 transition-colors duration-200 ${
                    schedule.isCompleted
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {schedule.isCompleted ? "Completed" : "Pending"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllSchedulesList;
