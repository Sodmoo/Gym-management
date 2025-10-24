// components/DashboardStats.jsx
import React from "react";
import { Calendar, Users, CheckCircle } from "lucide-react";

const DashboardStats = ({ todayCount, totalCount, completedToday }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
      {[
        {
          label: "Өнөөдөр",
          value: todayCount,
          color: "blue",
          icon: Calendar,
        },
        {
          label: "Бүгд",
          value: totalCount,
          color: "cyan",
          icon: Users,
        },
        {
          label: "Өнөөдөр дууссан",
          value: completedToday,
          color: "purple",
          icon: CheckCircle,
        },
      ].map(({ label, value, color, icon }, i) => (
        <div
          key={i}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-md transition-all duration-300 h-30 hover:bg-blue-200"
          role="figure"
          aria-label={`${label}: ${value}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                {label}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div
              className={`p-3 bg-${color}-500  rounded-xl text-white shadow-lg mt-2`}
            >
              {React.createElement(icon, {
                className: "w-9 h-9",
                "aria-hidden": "true",
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
