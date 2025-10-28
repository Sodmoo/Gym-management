// components/Trainer/home/OverallProgressChart.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Users, Activity, Target } from "lucide-react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Scale, Percent, FileBarChart, Download, Grid } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Metric configuration
const metrics = [
  { key: "all", label: "All", title: "Бүгд", icon: Grid },
  { key: "weight", label: "Weight", title: "Жин", icon: Scale, unit: "lbs" },
  {
    key: "bodyFat",
    label: "Body Fat",
    title: "Биеийн өөхний хувь",
    icon: Percent,
    unit: "%",
  },
  {
    key: "muscleMass",
    label: "Muscle Mass",
    title: "Булчингийн масс",
    icon: FileBarChart,
    unit: "lbs",
  },
];

// Dataset index mapping (assuming base.datasets order: [weight:0, bodyFat:1, muscleMass:2])
const datasetIndexMap = {
  weight: 0,
  bodyFat: 1,
  muscleMass: 2,
};

// Modern palette (FULL rgba — prevents black fallback)
const chartColors = {
  weight: "rgba(20,184,166,1)", // teal
  bodyFat: "rgba(6,182,212,1)", // cyan
  muscleMass: "rgba(30,237,24,1)", // green
};

export default function OverallProgressChart({
  aggregateData = {},
  selectedPeriod,
  onPeriodChange,
}) {
  const [activeChartType, setActiveChartType] = useState("line");
  const [selectedMetric, setSelectedMetric] = useState(null); // null means show all

  // Reset selected metric when period changes to avoid stale/incomplete data
  useEffect(() => {
    setSelectedMetric(null);
  }, [selectedPeriod]);

  // Line chart dataset formatting
  const lineChartData = useMemo(() => {
    const base = aggregateData.chartData || { labels: [], datasets: [] };
    let datasets = [];

    if (selectedMetric && selectedMetric !== "all") {
      const index = datasetIndexMap[selectedMetric];
      if (index !== undefined && base.datasets[index]) {
        const color = chartColors[selectedMetric];
        const ds = base.datasets[index];
        datasets = [
          {
            ...ds,
            tension: 0.4,
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 4,
            borderColor: color,
            fill: true,
            backgroundColor: color.replace(",1)", ",0.20)"), // Soft fill
          },
        ];
      }
    } else {
      datasets = (base.datasets || []).map((ds, idx) => {
        const keys = Object.keys(chartColors);
        const key = keys[idx % keys.length];
        const color = chartColors[key];
        return {
          ...ds,
          tension: 0.4,
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 4,
          borderColor: color,
          fill: true,
          backgroundColor: color.replace(",1)", ",0.20)"), // Soft fill
        };
      });
    }

    return { labels: base.labels || [], datasets };
  }, [aggregateData, selectedMetric]);

  // Bar chart dataset formatting
  const barChartData = useMemo(() => {
    const base = aggregateData.chartData || { labels: [], datasets: [] };
    let datasets = [];

    if (selectedMetric && selectedMetric !== "all") {
      const index = datasetIndexMap[selectedMetric];
      if (index !== undefined && base.datasets[index]) {
        const color = chartColors[selectedMetric];
        const ds = base.datasets[index];
        datasets = [
          {
            ...ds,
            borderRadius: 6,
            barPercentage: 0.7,
            backgroundColor: color.replace(",1)", ",0.85)"),
          },
        ];
      }
    } else {
      datasets = (base.datasets || []).map((ds, idx) => {
        const keys = Object.keys(chartColors);
        const key = keys[idx % keys.length];
        const color = chartColors[key];
        return {
          ...ds,
          borderRadius: 6,
          barPercentage: 0.7,
          backgroundColor: color.replace(",1)", ",0.85)"),
        };
      });
    }

    return { labels: base.labels || [], datasets };
  }, [aggregateData, selectedMetric]);

  // Doughnut Data (Goals)
  const getDoughnutChartData = () => {
    if (!aggregateData.goalStats) return null;
    const {
      completed = 0,
      inProgress = 0,
      pending = 0,
    } = aggregateData.goalStats;
    return {
      labels: ["Completed", "In Progress", "Pending"],
      datasets: [
        {
          data: [completed, inProgress, pending],
          backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
          borderColor: "#fff",
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };
  };

  // Chart options
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          color: "#4b5563",
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: "#fff",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        titleColor: "#111827",
        bodyColor: "#374151",
        padding: 10,
      },
    },
    scales: {
      x: {
        ticks: { color: "#6b7280" },
        grid: { display: false },
      },
      y: {
        ticks: { color: "#6b7280" },
        grid: { color: "rgba(0,0,0,0.04)" },
      },
    },
  };

  const selectedMetricLabel = selectedMetric
    ? metrics.find((m) => m.key === selectedMetric)?.label
    : "Members Measurement";

  // Check if chart data is available
  const hasChartData =
    aggregateData.chartData &&
    aggregateData.chartData.datasets &&
    aggregateData.chartData.datasets.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <h3 className="text-xl font-semibold text-gray-900">
          Нийт ахицын шинжилгээ
        </h3>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="1month">1 сар</option>
            <option value="3months">3 сар</option>
            <option value="6months">6 сар</option>
            <option value="1year">1 жил</option>
            <option value="alltime">Бүгд</option>
          </select>
          <div className="bg-gray-100 rounded-full flex p-1">
            <button
              onClick={() => setActiveChartType("line")}
              className={`px-3 py-1 rounded-full text-sm ${
                activeChartType === "line"
                  ? "bg-teal-600 text-white"
                  : "text-gray-600"
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setActiveChartType("bar")}
              className={`px-3 py-1 rounded-full text-sm ${
                activeChartType === "bar"
                  ? "bg-teal-600 text-white"
                  : "text-gray-600"
              }`}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS - Selectable buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          const isSelected =
            m.key === "all" ? !selectedMetric : selectedMetric === m.key;
          const data = aggregateData.avgMetrics?.[m.key] || {
            current: 0,
            trend: 0,
          };
          return (
            <div
              key={m.key}
              onClick={() => {
                if (m.key === "all") {
                  setSelectedMetric(null);
                } else {
                  setSelectedMetric(m.key);
                }
              }}
              className={`relative p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 hover:shadow-sm ${
                isSelected
                  ? "bg-blue-50 border-blue-300 shadow-sm"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              {/* Icon */}
              <div
                className={`p-2 rounded-lg transition-colors ${
                  isSelected ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                <Icon
                  size={18}
                  className={`${
                    isSelected ? "text-blue-600" : "text-gray-600"
                  }`}
                />
              </div>

              {/* Title and Value */}
              <div className="flex-1 mx-3 text-left">
                <div
                  className={`transition-colors ${
                    isSelected ? "text-blue-700" : "text-gray-700"
                  } ${
                    m.key === "all"
                      ? "text-sm font-semibold"
                      : "text-xs font-medium"
                  }`}
                >
                  {m.title}
                </div>
                {m.key !== "all" && (
                  <div
                    className={`text-lg font-bold transition-colors ${
                      isSelected ? "text-blue-900" : "text-gray-900"
                    }`}
                  >
                    {data.current ?? 0}
                    <span className={`text-sm font-normal ml-1 opacity-70`}>
                      {" "}
                      {m.unit}
                    </span>
                  </div>
                )}
              </div>

              {/* Trend/Percentage Indicator */}
              {m.key !== "all" && (
                <div
                  className={`flex items-center text-xs font-semibold opacity-60 ${
                    m.key !== "bodyFat" &&
                    (data.trend > 0 ? "text-green-600" : "text-red-600")
                  }`}
                >
                  {m.key === "bodyFat" ? (
                    <Percent size={12} className="text-gray-500" />
                  ) : (
                    <span>
                      {data.trend > 0 ? "+" : ""}
                      {data.trend ?? 0}
                    </span>
                  )}
                </div>
              )}

              {/* Download Button */}
              {m.key !== "all" && (
                <button className="ml-2 p-1 opacity-50 hover:opacity-80 transition-opacity">
                  <Download size={14} className="text-gray-500" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* UPPER: Progress Chart - Full width, long/tall */}
      <div className="p-4 border border-gray-100 rounded-lg h-[400px] w-full">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          {selectedMetric
            ? `${selectedMetricLabel} `
            : "Гишүүдийн хэмжилтийн чиг хандлага"}
        </h4>
        {hasChartData ? (
          activeChartType === "line" ? (
            <Line data={lineChartData} options={baseOptions} />
          ) : (
            <Bar data={barChartData} options={baseOptions} />
          )
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading chart data...
          </div>
        )}
      </div>

      {/* BOTTOM: Grid with Cards on left (stacked 1 col 3 rows), Goals Chart on right */}
      <div className="grid grid-cols-1 lg:grid-cols-[42%_50%] gap-10 ml-5">
        {/* Left: Summary Cards - Stacked vertically (1 column, 3 rows) */}
        <div className="grid grid-cols-1 gap-4 items-center">
          {/* Total Members */}
          <div className="bg-teal-50 p-5 rounded-xl shadow-sm border border-teal-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <Users className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Нийт гишүүд</p>
              <p className="text-3xl font-bold text-gray-900">
                {aggregateData.totalStudents ?? 0}
              </p>
            </div>
          </div>

          {/* Total Measurements */}
          <div className="bg-cyan-50 p-5 rounded-xl shadow-sm border border-cyan-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <Activity className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Нийт хэмжилт</p>
              <p className="text-3xl font-bold text-gray-900">
                {aggregateData.totalMeasurements ?? 0}
              </p>
            </div>
          </div>

          {/* Completed Goals */}
          <div className="bg-gray-100 p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:shadow-md transition">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <Target className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Дууссан зорилго
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {aggregateData.goalStats?.completed ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Goal Completion Overview */}
        <div className="p-4 border border-gray-100 bg-cyan-50 rounded-lg h-80 flex flex-col">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Goal Completion Overview
          </h4>
          <div className="flex-1 flex justify-center items-center">
            {getDoughnutChartData() ? (
              <div className="w-55 h-55">
                <Doughnut
                  data={getDoughnutChartData()}
                  options={{
                    plugins: {
                      legend: { display: false },
                    },
                    cutout: "70%",
                    responsive: true,
                  }}
                />
              </div>
            ) : (
              <span className="text-gray-500">No goal data available</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
