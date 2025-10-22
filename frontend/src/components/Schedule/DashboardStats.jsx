// components/DashboardStats.jsx
import React from "react";
import { Calendar, Users, CheckCircle } from "lucide-react";

const DashboardStats = ({ todayCount, totalCount, completedToday }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
      ].map(({ label, value, color, icon: Icon }, i) => (
        <div
          key={i}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 h-35 hover:bg-cyan-200"
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
              className={`p-3 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-xl text-white shadow-lg mt-2`}
            >
              <Icon className="w-10 h-10" aria-hidden="true" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
