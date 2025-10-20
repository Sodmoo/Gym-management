// OverviewTabContent.jsx

import { motion } from "framer-motion";
import { Line, Doughnut } from "react-chartjs-2";
import { Scale, Target } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const OverviewTabContent = ({
  isLoading,
  selectedPeriod,
  setSelectedPeriod,
  selectedMetric,
  setSelectedMetric,
  getLineChartData,
  getDoughnutChartData,
  lineOptions,
  doughnutOptions,
  metrics,
}) => {
  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-2"></div>
          <span className="text-gray-500">Loading analytics...</span>
        </div>
      ) : (
        <>
          <div className="flex flex-col space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">
              Progress Analytics
            </h2>
            <p className="text-gray-600">
              Track member's fitness journey over time
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex space-x-2">
            {["1 Month", "3 Months", "6 Months", "1 Year"].map((period) => (
              <button
                key={period}
                onClick={() =>
                  setSelectedPeriod(period.toLowerCase().replace(" ", ""))
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPeriod === period.toLowerCase().replace(" ", "")
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              const isSelected = selectedMetric === metric.key;
              return (
                <motion.div
                  key={metric.key}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-white rounded-lg p-4 shadow-md border border-gray-200 cursor-pointer ${
                    isSelected ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedMetric(metric.key)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? "bg-blue-500" : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        size={20}
                        className={isSelected ? "text-white" : "text-gray-600"}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {metric.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isSelected ? metric.selectedLabel : "View data"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <Scale size={20} className="text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedMetric.charAt(0).toUpperCase() +
                    selectedMetric.slice(1)}{" "}
                  Progress
                </h3>
              </div>
              <div className="h-64">
                <Line data={getLineChartData()} options={lineOptions} />
              </div>
            </div>

            {/* Doughnut Chart */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <Target size={20} className="text-green-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Goal Completion
                </h3>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="h-48 w-48 relative">
                  <Doughnut
                    data={getDoughnutChartData()}
                    options={doughnutOptions}
                  />
                  {getDoughnutChartData().datasets[0].data[0] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">
                          {getDoughnutChartData().datasets[0].data[0]}%
                        </p>
                        <p className="text-sm text-gray-500">Progress</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OverviewTabContent;
