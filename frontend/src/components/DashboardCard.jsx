import React from "react";
import { Users, DollarSign, Dumbbell } from "lucide-react"; // икон

const stats = [
  {
    title: "Total Users",
    value: "1,245",
    icon: <Users className="w-6 h-6 text-blue-500" />,
  },
  {
    title: "Transfers",
    value: "$23,540",
    icon: <DollarSign className="w-6 h-6 text-green-500" />,
  },
  {
    title: "Trainers",
    value: "45",
    icon: <Dumbbell className="w-6 h-6 text-purple-500" />,
  },
  {
    title: "Trainers",
    value: "45",
    icon: <Dumbbell className="w-6 h-6 text-purple-500" />,
  },
];

const DashboardCards = () => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`rounded-2xl bg-white shadow-md hover:bg-green-300 transition flex items-center justify-between h-32 p-5`}
        >
          <div>
            <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">{stat.icon}</div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
