// components/SchedulesHeader.jsx
import React from "react";
import { Calendar, Plus } from "lucide-react";

const SchedulesHeader = ({ onCreateSchedule }) => {
  return (
    <header className=" rounded-md">
      <div className="max-w-7xl mx-auto px-5 py-5">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <div className="p-2 bg-cyan-500 rounded-xl text-white shadow-lg">
                <Calendar className="w-6 h-6" aria-hidden="true" />
              </div>
              <span>Хуваарь</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Долоо хоног бүрийн уулзалтаа хялбархан удирдаарай
            </p>
          </div>
          <button
            onClick={onCreateSchedule}
            className="bg-cyan-500 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Create new schedule"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Шинэ хуваарь</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default SchedulesHeader;
