// OverviewTabContent.jsx

import { motion } from "framer-motion";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Scale,
  Target,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Download,
  Award,
} from "lucide-react";
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
  measurements,
  goals,
  getLineChartData,
  getDoughnutChartData,
  lineOptions,
  doughnutOptions,
  metrics,
  filterMeasurementsByPeriod,
  onExportData, // New prop: callback for exporting data
  onAddMeasurement, // New prop: trigger add modal
}) => {
  // Good direction for trends (decrease good for weight/bodyFat, increase for muscle/goals)
  const goodDirection = {
    weight: "<", // Жин буурах сайн
    bodyFat: "<", // Өөхний хувь буурах сайн
    muscleMass: ">", // Булчингийн масс өсөх сайн
    goals: ">", // Зорилго биелэх өсөх сайн
  };

  // Helper to get unit for metric
  const getUnit = (key) => {
    if (key === "bodyFat" || key === "goals") return "%";
    if (key === "weight" || key === "muscleMass") return "lbs";
    return "";
  };

  // Helper to get goal target for metric
  const getGoalTarget = (key) => {
    const goal = goals.find((g) => g.type === key);
    return goal ? goal.targetValue : "N/A";
  };

  // Enhanced line options with tooltip
  const enhancedLineOptions = {
    ...lineOptions,
    plugins: {
      ...lineOptions?.plugins,
      tooltip: {
        ...lineOptions?.plugins?.tooltip,
        mode: "index",
        intersect: false,
        callbacks: {
          ...lineOptions?.plugins?.tooltip?.callbacks,
          title: (ctx) => `Огноо: ${ctx[0].label}`,
          label: (ctx) => {
            const unit = getUnit(selectedMetric);
            const goalTarget = getGoalTarget(selectedMetric);
            return `${ctx.dataset.label}: ${ctx.parsed.y}${unit} (Зорилго: ${goalTarget})`;
          },
        },
      },
    },
  };

  // Enhanced doughnut options with tooltip
  const enhancedDoughnutOptions = {
    ...doughnutOptions,
    plugins: {
      ...doughnutOptions?.plugins,
      tooltip: {
        ...doughnutOptions?.plugins?.tooltip,
        callbacks: {
          ...doughnutOptions?.plugins?.tooltip?.callbacks,
          label: (ctx) =>
            `${ctx.label}: ${ctx.parsed}% (${goals.length} нийт зорилго)`,
        },
      },
    },
  };

  // Helper to get metric data (currentValue and trend) dynamically from measurements
  const getMetricData = (key) => {
    if (key === "goals") {
      const data = getDoughnutChartData();
      const current = data.datasets?.[0]?.data?.[0] || 0;
      // Example trend: +5% (compute dynamically if historical goals data available)
      const trend = 5;
      return { currentValue: current, trend, unit: "%" };
    }

    const filtered = filterMeasurementsByPeriod(measurements, selectedPeriod);
    if (!filtered.length) return { currentValue: 0, trend: 0, unit: "" };

    const latest = filtered[filtered.length - 1];
    const first = filtered[0];
    const current = parseFloat(latest[key]) || 0;
    const initial = parseFloat(first[key]) || current;
    const change = current - initial;
    const trend = initial !== 0 ? Math.round((change / initial) * 100) : 0;

    // Unit based on metric
    const unit =
      key === "bodyFat"
        ? "%"
        : key === "weight" || key === "muscleMass"
        ? "lbs"
        : "";

    return { currentValue: current, trend, unit };
  };

  // Helper to format trend indicator
  const getTrendIndicator = (trend) => {
    if (trend > 0) {
      return <ArrowUp className="w-3 h-3 text-green-500" />;
    } else if (trend < 0) {
      return <ArrowDown className="w-3 h-3 text-red-500" />;
    }
    return null;
  };

  // Helper to get trend color (with good direction logic)
  const getTrendColor = (trend, key) => {
    if (trend === 0) return "text-gray-500";

    const dir = goodDirection[key] || ">";
    const isGood = (dir === "<" && trend < 0) || (dir === ">" && trend > 0);

    return isGood ? "text-green-600" : "text-red-600";
  };

  // Helper to get progress bar color class
  const getProgressBarColor = (trend, key) => {
    const colorClass = getTrendColor(trend, key);
    return colorClass === "text-green-600"
      ? "bg-green-500"
      : colorClass === "text-red-600"
      ? "bg-red-500"
      : "bg-gray-500";
  };

  // All metrics including goals (with Mongolian labels)
  const allMetrics = [
    ...metrics.map((m) => ({
      ...m,
      label:
        m.key === "weight"
          ? "Жин"
          : m.key === "bodyFat"
          ? "Биеийн өөхний %"
          : m.key === "muscleMass"
          ? "Булчингийн масс"
          : m.label,
    })),
    {
      key: "goals",
      label: "Зорилго биелэх",
      icon: Award,
      selectedLabel: "Дэлгэрэнгүй харах",
    },
  ];

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-2"></div>
          <span className="text-gray-500">Аналитик ачаалж байна...</span>
        </div>
      ) : (
        <>
          {/* Enhanced Header with Export */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2">
            <div className="flex flex-col space-y-1">
              <h2 className="text-2xl font-bold text-gray-800">
                Ахицын аналитик
              </h2>
              <p className="text-gray-600">
                Үйлчлүүлэгчийн фитнессийн явцыг гол үзүүлэлт, чиг хандлагатай
                хамт хянаарай
              </p>
            </div>
            {onExportData && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExportData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
              >
                <Download size={16} />
                <span className="text-sm font-medium">Тайлан татах</span>
              </motion.button>
            )}
          </div>

          {/* KPI Summary Cards with Progress Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {allMetrics.slice(0, 4).map((metric) => {
              // Show top 4 KPIs (3 measurements + goals)
              const { currentValue, trend, unit } = getMetricData(metric.key);
              const Icon = metric.icon;
              const progressWidth = Math.min(Math.abs(trend), 100); // Cap at 100%
              const barColor = getProgressBarColor(trend, metric.key);
              return (
                <motion.div
                  key={metric.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * allMetrics.indexOf(metric) }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <Icon size={20} className="text-blue-600" />
                    </div>
                    <div
                      className={`text-xs font-medium ${getTrendColor(
                        trend,
                        metric.key
                      )} flex items-center space-x-1`}
                    >
                      {getTrendIndicator(trend)}
                      <span>
                        {trend > 0 ? "+" : ""}
                        {trend}%
                      </span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {currentValue}
                    {unit ? ` ${unit}` : ""}
                  </p>
                  <p className="text-sm text-gray-500 capitalize mb-2">
                    {metric.label}
                  </p>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressWidth}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-2 rounded-full ${barColor}`}
                      aria-label={`Өөрчлөлт: ${trend > 0 ? "+" : ""}${trend}%`}
                    />
                  </div>
                  <p className="text-xs text-gray-400">Өөрчлөлт</p>
                </motion.div>
              );
            })}
          </div>

          {/* Period Selector */}
          <div className="flex flex-wrap gap-2">
            {["1 сар", "3 сар", "6 сар", "1 жил", "Бүгд"].map((period) => {
              const periodKey =
                period === "Бүгд"
                  ? "alltime"
                  : period
                      .replace(" сар", "month")
                      .replace(" сар", "months")
                      .replace(" жил", "year")
                      .toLowerCase()
                      .replace(" ", "");
              return (
                <motion.button
                  key={period}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPeriod(periodKey)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                    selectedPeriod === periodKey
                      ? "bg-blue-500 text-white border-blue-500 shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {period}
                </motion.button>
              );
            })}
          </div>

          {/* Metric Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allMetrics.map((metric) => {
              const Icon = metric.icon;
              const isSelected = selectedMetric === metric.key;
              const { currentValue, unit } = getMetricData(metric.key);
              return (
                <motion.div
                  key={metric.key}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer transition-all ${
                    isSelected
                      ? "ring-2 ring-blue-500 ring-opacity-50 shadow-md bg-blue-50"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedMetric(metric.key)}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${
                        isSelected ? "bg-blue-500" : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        size={20}
                        className={isSelected ? "text-white" : "text-gray-600"}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {metric.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {isSelected
                          ? `${currentValue}${unit ? ` ${unit}` : ""}`
                          : "Харах сонгох"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Single Dynamic Chart Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {selectedMetric === "goals" ? (
                  <Target size={20} className="text-green-500" />
                ) : (
                  <Scale size={20} className="text-blue-500" />
                )}
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedMetric === "goals"
                    ? "Зорилго биелэх дэлгэрэнгүй"
                    : `${
                        selectedMetric.charAt(0).toUpperCase() +
                        selectedMetric.slice(1)
                      } ахиц`}
                </h3>
              </div>
              <span className="text-sm text-gray-500">
                {selectedPeriod.replace(/([A-Z])/g, " $1").trim()}
              </span>
            </div>
            <div className="h-96 relative">
              {selectedMetric === "goals" ? (
                <Doughnut
                  key={`doughnut-${selectedPeriod}`} // Force re-render on period change
                  data={getDoughnutChartData()}
                  options={enhancedDoughnutOptions} // Use enhanced options
                />
              ) : (
                (() => {
                  const filtered = filterMeasurementsByPeriod(
                    measurements,
                    selectedPeriod
                  );
                  if (filtered.length < 2) {
                    return (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-full flex flex-col items-center justify-center text-center p-4"
                      >
                        <Scale size={48} className="text-gray-300 mb-4" />
                        <h4 className="text-lg font-medium text-gray-600 mb-2">
                          Өгөгдөл байхгүй
                        </h4>
                        <p className="text-sm text-gray-500 mb-6">
                          {selectedMetric} ахицыг {selectedPeriod} харахын тулд
                          хэмжилт нэмнэ үү.
                        </p>
                        {onAddMeasurement && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                            onClick={onAddMeasurement}
                          >
                            Хэмжилт нэмэх
                          </motion.button>
                        )}
                      </motion.div>
                    );
                  }
                  return (
                    <Line
                      key={`${selectedMetric}-${selectedPeriod}`} // Force re-render on metric/period change
                      data={getLineChartData()}
                      options={enhancedLineOptions} // Use enhanced options
                    />
                  );
                })()
              )}
              {selectedMetric === "goals" &&
                getDoughnutChartData().datasets?.[0]?.data?.[0] !==
                  undefined && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-800">
                        {getDoughnutChartData().datasets[0].data[0]}%
                      </p>
                      <p className="text-sm text-gray-500">Ерөнхий</p>
                    </div>
                  </div>
                )}
            </div>
          </motion.div>

          {/* Insights Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <TrendingUp size={20} className="text-blue-500" />
              <span>Түргэн мэдээлэл</span>
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                •{" "}
                {selectedMetric === "goals"
                  ? `Зорилго ${
                      getDoughnutChartData().datasets?.[0]?.data?.[0] || 0
                    }% биелсэн – амжилттай ${
                      getDoughnutChartData().labels?.filter(
                        (_, i) => getDoughnutChartData().datasets[0].data[i] > 0
                      ).length || 0
                    } зорилго!`
                  : `Сүүлийн ${selectedPeriod} хугацаанд тогтмол дасгал хийснээр ${selectedMetric}  ${
                      getMetricData(selectedMetric).trend
                    }% сайжирсан байна.`}
              </li>
              <li>
                • Сүүлийн үеийн чиг хандлагад тулгуурлан илүү хурдан үр дүнд
                хүрэхийн тулд {allMetrics[0]?.label || "дахин тогтворжуулах"}
                анхаарлаа хандуулаарай.
              </li>
              <li>
                • Дараагийн зорилго: Долоо хоногт 3 удаагийн хичээлээр ахиц
                дэвшлийг хадгалах.
              </li>
            </ul>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default OverviewTabContent;
