// components/TodaysAgenda.jsx
import React from "react";
import { Clock, Calendar, Plus } from "lucide-react";

const TodaysAgenda = ({
  todaySchedules,
  formatDate,
  getDefaultTimes,
  getEventColor,
  getEventIcon,
  onScheduleClick,
  onCreateSchedule,
  getMemberDisplayName, // <-- new prop
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Clock className="w-10 h-10 text-blue-600" aria-hidden="true" />
        <span>Өнөөдрийн хэлэлцэх асуудал</span>
      </h2>
      {todaySchedules.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Calendar className="w-8 h-8 text-gray-400" aria-hidden="true" />
          </div>
          <p className="text-lg font-medium">No schedules for today.</p>
          <button
            onClick={onCreateSchedule}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 mx-auto transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Add a schedule for today"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add one now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4" role="list">
          {todaySchedules.map((sch, i) => {
            const { startTime, endTime } = getDefaultTimes(sch);
            const EventIcon = getEventIcon(sch.type);
            return (
              <div
                key={sch._id}
                className="group flex items-center justify-between p-2 bg-white rounded-md border-1 border-blue-600 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => onScheduleClick(sch)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${
                  sch.memberName ||
                  getMemberDisplayName?.(sch.memberId) ||
                  "Client"
                }'s ${sch.type} at ${startTime}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onScheduleClick(sch);
                }}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center space-x-4 flex-1 ">
                  <div
                    className={`rounded-md w-12 h-12 flex items-center justify-center bg-cyan-100  text-blue-500 text-sm font-bold flex-shrink-0 shadow-lg ${getEventColor(
                      sch.type
                    )
                      .replace("border-", " ")
                      .replace("gradient-to-r", "bg-gradient-to-r")}`}
                  >
                    <EventIcon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate text-base">
                      {sch.memberName ||
                        getMemberDisplayName?.(sch.memberId) ||
                        "N/A"}
                    </div>
                    <div className="text-sm text-gray-600 truncate flex items-center space-x-4 mt-0.5">
                      <span>{formatDate(new Date(), "PPP")}</span>
                      <span>|</span>
                      <span className="font-medium">
                        {startTime} - {endTime}
                      </span>
                      <span>|</span>
                      <span className="text-gray-500 capitalize">
                        {sch.type}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold ml-4 transition-colors duration-200 ${
                    sch.isCompleted
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {sch.isCompleted ? "Дууссан" : "Хүлээгдэж буй"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TodaysAgenda;
