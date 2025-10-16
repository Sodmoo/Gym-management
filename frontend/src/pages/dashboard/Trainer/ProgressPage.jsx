import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { Scale, Activity, Dumbbell, TrendingUp } from "lucide-react";

const ProgressPage = () => {
  const [selectedMetric, setSelectedMetric] = useState("weight");
  const [range, setRange] = useState("3M");

  const progressData = [
    { date: "Jul", weight: 180, fat: 25, muscle: 65, strength: 70 },
    { date: "Aug", weight: 178, fat: 23, muscle: 67, strength: 73 },
    { date: "Sep", weight: 176, fat: 21, muscle: 68, strength: 75 },
  ];

  const COLORS = ["#22c55e", "#facc15", "#ef4444"];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Tabs */}
      <div className="flex gap-8 border-b">
        {["Overview", "Measurements", "Goals", "Timeline"].map((tab) => (
          <button
            key={tab}
            className={`pb-3 text-sm font-medium ${
              tab === "Overview"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">
            Progress Analytics
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Track member’s fitness journey over time
          </p>

          {/* Metric Selector */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setSelectedMetric("weight")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                selectedMetric === "weight"
                  ? "bg-blue-100 border-blue-500 text-blue-600"
                  : "border-gray-200"
              }`}
            >
              <Scale size={16} /> Weight
            </button>
            <button
              onClick={() => setSelectedMetric("fat")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200"
            >
              <Activity size={16} /> Body Fat %
            </button>
            <button
              onClick={() => setSelectedMetric("muscle")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200"
            >
              <Dumbbell size={16} /> Muscle Mass
            </button>
            <button
              onClick={() => setSelectedMetric("strength")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200"
            >
              <TrendingUp size={16} /> Strength
            </button>
          </div>

          {/* Range Filter */}
          <div className="flex gap-3 mb-4">
            {["1M", "3M", "6M", "1Y"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-sm rounded ${
                  range === r
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {r === "1M"
                  ? "1 Month"
                  : r === "3M"
                  ? "3 Months"
                  : r === "6M"
                  ? "6 Months"
                  : "1 Year"}
              </button>
            ))}
          </div>

          {/* Line Chart */}
          <div className="mt-4">
            <h3 className="text-gray-700 font-medium mb-2">Weight Progress</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Goal Completion Chart */}
          <div className="mt-8">
            <h3 className="text-gray-700 font-medium mb-3">Goal Completion</h3>
            <div className="flex justify-center">
              <PieChart width={200} height={200}>
                <Pie
                  data={[
                    { name: "Completed", value: 70 },
                    { name: "In Progress", value: 20 },
                    { name: "Missed", value: 10 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={index} fill={color} />
                  ))}
                </Pie>
              </PieChart>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800">Goals & Targets</h2>
            <button className="bg-blue-600 text-white text-sm px-3 py-1 rounded">
              + Add Goal
            </button>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-700">
                    Reach Target Weight
                  </h4>
                  <p className="text-sm text-gray-500">
                    Lose 6 pounds to reach optimal weight
                  </p>
                </div>
                <span className="text-blue-600 text-xs">On Track</span>
              </div>
              <div className="mt-3 text-sm text-gray-500">
                Current: 174 lbs • Target: 175 lbs
              </div>
              <div className="w-full bg-gray-200 h-2 rounded mt-2">
                <div
                  className="bg-green-500 h-2 rounded"
                  style={{ width: "83%" }}
                ></div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-700">
                    Increase Bench Press
                  </h4>
                  <p className="text-sm text-gray-500">
                    Improve upper body strength
                  </p>
                </div>
                <span className="text-green-600 text-xs">Ahead</span>
              </div>
              <div className="mt-3 text-sm text-gray-500">
                Current: 265 lbs • Target: 275 lbs
              </div>
              <div className="w-full bg-gray-200 h-2 rounded mt-2">
                <div
                  className="bg-green-400 h-2 rounded"
                  style={{ width: "90%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
