// components/ScheduleDetailsSidebar.jsx
import React from "react";
import { X, CheckCircle, Edit, Trash2, Clock, ChevronDown } from "lucide-react";

const ScheduleDetailsSidebar = ({
  selectedSchedule,
  getDefaultTimes,
  formatDate,
  getEventColor,
  getEventIcon,
  onCloseSidebar,
  onMarkComplete,
  onEditSchedule,
  onDeleteSchedule,
}) => {
  const { startTime, endTime } = getDefaultTimes(selectedSchedule);
  const EventIcon = getEventIcon(selectedSchedule.type);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onCloseSidebar}
        aria-hidden="true"
      />
      {/* Sidebar */}
      <div
        className="fixed right-0 top-0 h-full w-96 bg-white/90 backdrop-blur-sm shadow-2xl z-50 overflow-y-auto border-l border-white/20"
        role="dialog"
        aria-modal="true"
        aria-label="Schedule details"
      >
        <div className="p-6 border-b border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Schedule Details
            </h2>
            <button
              onClick={onCloseSidebar}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <div
            className={`p-5 rounded-2xl border-2 ${getEventColor(
              selectedSchedule.type
            )} text-white mb-6 shadow-lg`}
          >
            <div className="flex items-center space-x-4">
              <div className="border-2 border-white/30 rounded-xl p-3 bg-white/10">
                <EventIcon className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <div className="font-bold text-lg">
                  {selectedSchedule.memberId?.userId?.username ||
                    selectedSchedule.memberId?.name ||
                    "Member"}
                </div>
                <div className="text-sm opacity-90 capitalize flex items-center space-x-1">
                  <span>{selectedSchedule.type}</span>
                  {selectedSchedule.planId && (
                    <>
                      <ChevronDown className="w-3 h-3" aria-hidden="true" />
                      <span className="text-xs">
                        {selectedSchedule.planId.title}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm opacity-95 flex items-center space-x-3 bg-white/10 rounded-xl p-3">
              <Clock className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="flex items-center space-x-1">
                <span>
                  {startTime} - {endTime}
                </span>
                <span>•</span>
                <span>{formatDate(selectedSchedule.date, "MMM do, yyyy")}</span>
              </span>
            </div>
            {selectedSchedule.note && (
              <div className="mt-4 text-sm opacity-90 bg-white/10 rounded-xl p-3">
                {selectedSchedule.note}
              </div>
            )}
          </div>
          <div className="space-y-3">
            {!selectedSchedule.isCompleted && (
              <button
                onClick={() => onMarkComplete(selectedSchedule._id)}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Mark this schedule as complete"
              >
                <CheckCircle className="w-5 h-5" aria-hidden="true" />
                <span>Mark as Complete</span>
              </button>
            )}
            <button
              onClick={() => {
                onEditSchedule(selectedSchedule);
                onCloseSidebar();
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Edit this schedule"
            >
              <Edit className="w-5 h-5" aria-hidden="true" />
              <span>Edit Schedule</span>
            </button>
            <button
              onClick={() => onDeleteSchedule(selectedSchedule._id)}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Delete this schedule"
            >
              <Trash2 className="w-5 h-5" aria-hidden="true" />
              <span>Delete Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScheduleDetailsSidebar;
