// ProgressPage.jsx (Updated with jspdf-autotable import for PDF tables)

import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf"; // Import jsPDF for PDF export (npm install jspdf)
import "jspdf-autotable"; // Import autotable plugin (npm install jspdf-autotable)
import {
  Users,
  TrendingUp,
  Target,
  Award,
  Ruler,
  BarChart3,
  Scale, // For weight icon
  Percent, // For body fat
  FileBarChart, // For muscle mass or similar
} from "lucide-react";
import { motion } from "framer-motion";
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

import { useUserStore } from "../../../store/userStore";
import { useTrainerStore } from "../../../store/trainerStore";
import { useGoalsMeasurementsStore } from "../../../store/useGoalsMeasurementsStore"; // Use the combined store
import AddMeasurementModal from "../../../components/Progress/AddMeasurementModal"; // Adjust path as needed
import AddGoalModal from "../../../components/Progress/AddGoalModal"; // New import for AddGoalModal

// New imports for extracted components
import ProgressHeader from "../../../components/Progress/ProgressHeader";
import MemberSelector from "../../../components/Progress/MemberSelector";
import MemberProfile from "../../../components/Progress/MemberProfile";
import TabNavigation from "../../../components/Progress/TabNavigation";
import OverviewTabContent from "../../../components/Progress/OverviewTabContent";
import MeasurementsTabContent from "../../../components/Progress/MeasurementsTabContent";
import GoalsTabContent from "../../../components/Progress/GoalsTabContent";

// Register Chart.js components
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

const ProgressPage = () => {
  const { user } = useUserStore();
  const { currentTrainer, getTrainerById } = useTrainerStore();
  const {
    getMeasurements,
    measurements,
    getGoals,
    goals,
    isLoading, // Shared loading for both measurements and goals
    addMeasurement,
    deleteMeasurement,
    addGoal,
    editGoal,
  } = useGoalsMeasurementsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false); // New for goals

  // New states for overview analytics
  const [selectedPeriod, setSelectedPeriod] = useState("3months"); // Updated default to match key
  const [selectedMetric, setSelectedMetric] = useState("weight");

  const searchRef = useRef(null);

  useEffect(() => {
    if (user && user._id) {
      getTrainerById(user._id);
    }
  }, [user, getTrainerById]);

  useEffect(() => {
    if (selectedMember?._id) {
      getMeasurements(selectedMember._id); // Fixed: use _id consistently
      getGoals(selectedMember._id); // Fixed: use _id consistently
    }
  }, [selectedMember, getMeasurements, getGoals]);

  const members = currentTrainer?.students || [];

  const filteredMembers = members.filter(
    (member) =>
      member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setSearchTerm("");
    setShowDropdown(false);
  };

  const handleBrowseAll = () => {
    setSearchTerm("");
    setShowDropdown(true);
  };

  const handleViewAll = () => {
    setSearchTerm("");
    setShowDropdown(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "measurements", label: "Measurements", icon: Ruler },
    { id: "goals", label: "Goals", icon: Target },
  ];

  const isMembershipActive = selectedMember?.membership?.isActive;

  // Fixed helper to filter measurements by period (handles "alltime" explicitly)
  const getPeriodStartDate = (period) => {
    const now = new Date();

    // Handle "alltime" explicitly before normalization
    if (period === "alltime") {
      return new Date(0); // Epoch start for all time
    }

    // Normalize period key (e.g., "1month" -> "1 month")
    const normalizedPeriod = period.replace(/(month|months|year)/g, " $1");
    const monthsMap = {
      "1 month": 1,
      "3 months": 3,
      "6 months": 6,
      "1 year": 12,
    };
    const months = monthsMap[normalizedPeriod];

    if (months) {
      return new Date(now.getFullYear(), now.getMonth() - months, 1);
    }

    // Fallback to 3 months if invalid
    return new Date(now.getFullYear(), now.getMonth() - 3, 1);
  };

  const filterMeasurementsByPeriod = (measurements, period) => {
    if (!measurements.length) return [];
    const now = new Date();
    const startDate = getPeriodStartDate(period);
    return measurements
      .filter((meas) => {
        const measDate = new Date(meas.date);
        return measDate >= startDate && measDate <= now; // Added upper bound: <= current date
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Get chart data for selected metric
  const getLineChartData = () => {
    const filtered = filterMeasurementsByPeriod(measurements, selectedPeriod);
    const labels = filtered.map((meas) => {
      const date = new Date(meas.date);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    });
    const dataPoints = filtered.map((meas) => meas[selectedMetric] || 0);

    return {
      labels,
      datasets: [
        {
          label:
            selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1),
          data: dataPoints,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  // Goal completion pie data
  const getDoughnutChartData = () => {
    const completed = goals.filter((g) => g.progress >= 100).length;
    const inProgress = goals.filter(
      (g) => g.progress > 0 && g.progress < 100
    ).length;
    const total = goals.length || 1; // Avoid division by zero
    const completedPct = Math.round((completed / total) * 100);
    const inProgressPct = Math.round((inProgress / total) * 100);
    const pendingPct = Math.max(0, 100 - completedPct - inProgressPct);

    return {
      labels: ["Completed", "In Progress", "Pending"],
      datasets: [
        {
          data: [completedPct, inProgressPct, pendingPct],
          backgroundColor: [
            "rgb(34, 197, 94)",
            "rgb(251, 191, 36)",
            "rgb(239, 68, 68)",
          ],
          borderWidth: 0,
        },
      ],
    };
  };

  // Helper function to get metric data for KPIs
  const getMetricData = (metric) => {
    const filtered = filterMeasurementsByPeriod(measurements, selectedPeriod);
    if (filtered.length === 0) {
      return {
        currentValue: 0,
        unit: metric === "bodyFat" ? "%" : "lbs",
        trend: 0,
      };
    }
    const first = filtered[0];
    const last = filtered[filtered.length - 1];
    const change = last[metric] - first[metric];
    const percentChange =
      first[metric] !== 0 ? (change / first[metric]) * 100 : 0;
    const unit = metric === "bodyFat" ? "%" : "lbs";
    return {
      currentValue: last[metric] || 0,
      unit,
      trend: Math.round(percentChange * 10) / 10, // One decimal place
    };
  };

  // Functional Export Data - Generate PDF Report
  const handleExportData = () => {
    if (!selectedMember) {
      alert("Гишүүн сонгоно уу!"); // Mongolian alert
      return;
    }

    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString("mn-MN"); // Mongolian date format
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.text(
      `Ахицын тайлан: ${selectedMember.username || selectedMember.surname}`,
      20,
      yPos
    );
    yPos += 15;

    doc.setFontSize(12);
    doc.text(
      `Гишүүн: ${selectedMember.username} ${selectedMember.surname}`,
      20,
      yPos
    );
    yPos += 10;
    doc.text(
      `Хугацаа: ${selectedPeriod.replace(/([A-Z])/g, " $1").trim()}`,
      20,
      yPos
    );
    yPos += 10;
    doc.text(
      `Үзүүлэлт: ${
        selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)
      }`,
      20,
      yPos
    );
    yPos += 20;

    // KPIs Table
    doc.text("Гол үзүүлэлтүүд:", 20, yPos);
    yPos += 10;
    const tableData = [
      ["Үзүүлэлт", "Утга", "Өөрчлөлт (%)"],
      ...metrics.slice(0, 3).map((m) => {
        const data = getMetricData(m.key);
        return [
          m.label,
          `${data.currentValue} ${data.unit}`,
          `${data.trend > 0 ? "+" : ""}${data.trend}%`,
        ];
      }),
      [
        "Зорилго биелэх",
        `${getDoughnutChartData().datasets[0].data[0]}%`,
        "+5%",
      ], // Example for goals
    ];
    doc.autoTable({
      startY: yPos,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    yPos = doc.lastAutoTable.finalY + 10;

    // Measurements Summary
    const filteredMeas = filterMeasurementsByPeriod(
      measurements,
      selectedPeriod
    );
    if (filteredMeas.length > 0) {
      doc.text("Сүүлийн хэмжилтүүд:", 20, yPos);
      yPos += 10;
      const measTable = [
        ["Огноо", "Жин (lbs)", "Өөх %", "Булчин (lbs)"],
        ...filteredMeas
          .slice(-5)
          .reverse()
          .map((m) => [
            // Last 5 measurements
            new Date(m.date).toLocaleDateString("mn-MN"),
            m.weight || "-",
            m.bodyFat || "-",
            m.muscleMass || "-",
          ]),
      ];
      doc.autoTable({
        startY: yPos,
        head: [measTable[0]],
        body: measTable.slice(1),
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [34, 197, 94] },
      });
      yPos = doc.lastAutoTable.finalY + 10;
    } else {
      doc.text("Хэмжилт байхгүй—шинээр нэмнэ үү.", 20, yPos);
      yPos += 10;
    }

    // Footer
    doc.setFontSize(10);
    doc.text(
      `Тайлан гаргасан огноо: ${currentDate}`,
      20,
      doc.internal.pageSize.height - 20
    );

    // Save PDF
    doc.save(
      `ахицын-тайлан-${selectedMember.username || "гишүүн"}-${currentDate}.pdf` // Fixed filename typo
    );
  };

  // Measurements tab logic (unchanged)
  const goodDirectionPage = {
    weight: "<", // decrease good
    bodyFat: "<", // decrease good
    muscleMass: ">", // increase good
    waist: "<", // decrease good
    chest: ">", // increase good
    arms: ">", // increase good
    thighs: ">", // increase good
  };

  const getColorClass = (metric, change) => {
    if (change === 0 || change === undefined || change === null)
      return "text-gray-500";
    const dir = goodDirectionPage[metric];
    const isGood = (dir === "<" && change < 0) || (dir === ">" && change > 0);
    return isGood ? "text-green-600 font-medium" : "text-red-600 font-medium";
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatValue = (value, metric = "") => {
    if (value === undefined || value === null) return "-";
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    const decimals = ["bodyFat", "waist", "chest", "arms", "thighs"].includes(
      metric
    )
      ? 1
      : 0;
    return (
      decimals === 0 ? Math.round(num) : num.toFixed(decimals)
    ).toString();
  };

  const formatDelta = (value, metric = "") => {
    if (value === undefined || value === null || value === 0) return "0";
    const num = parseFloat(value);
    if (isNaN(num)) return "0";
    const sign = num > 0 ? "+" : "-";
    const decimals = ["bodyFat", "waist", "chest", "arms", "thighs"].includes(
      metric
    )
      ? 1
      : 0;
    const absNum = Math.abs(num);
    return `${sign}${
      decimals === 0 ? Math.round(absNum) : absNum.toFixed(decimals)
    }`;
  };

  let displayData = [];
  if (measurements.length > 0 && !isLoading) {
    const sorted = [...measurements].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const allMeasurements = sorted; // Use all measurements instead of last 3
    let previous = null;
    displayData = allMeasurements
      .map((meas) => {
        const row = {
          id: meas._id, // Add ID for delete
          date: formatDate(meas.date),
          weight: meas.weight,
          bodyFat: meas.bodyFat,
          muscleMass: meas.muscleMass,
          waist: meas.waist,
          chest: meas.chest,
          arms: meas.arms,
          thighs: meas.thighs,
        };
        if (previous) {
          row.weightDelta = meas.weight - previous.weight;
          row.bodyFatDelta = meas.bodyFat - previous.bodyFat;
          row.muscleMassDelta = meas.muscleMass - previous.muscleMass;
          row.waistDelta = meas.waist - previous.waist;
          row.chestDelta = meas.chest - previous.chest;
          row.armsDelta = meas.arms - previous.arms;
          row.thighsDelta = meas.thighs - previous.thighs;
        }
        previous = meas;
        return row;
      })
      .reverse(); // Display most recent first
  }

  const handleAddMeasurement = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleSubmitMeasurement = async (payload) => {
    try {
      // Store's addMeasurement already refetches measurements and goals
      await addMeasurement({ ...payload, member: selectedMember._id }); // Fixed: use _id consistently
      // No need for extra getMeasurements/getGoals calls
    } catch (error) {
      console.error("Error adding measurement:", error);
      // Handle error (e.g., show toast)
    }
  };

  const handleDeleteMeasurement = async (measurementId) => {
    if (!confirm("Are you sure you want to delete this measurement?")) return;
    try {
      await deleteMeasurement(measurementId);
      // Store handles refetch if member known
    } catch (error) {
      console.error("Error deleting measurement:", error);
      // Handle error (e.g., show toast)
    }
  };

  const handleViewPhotoGallery = () => {
    // TODO: Open photo gallery
    console.log("View photo gallery");
  };

  const handleViewTrends = () => {
    // TODO: Open trends view/chart
    console.log("View trends");
  };

  // Goals handlers
  const handleAddGoal = () => {
    setShowAddGoalModal(true);
  };

  const handleCloseAddGoalModal = () => {
    setShowAddGoalModal(false);
  };

  const handleSubmitGoal = async (goalData) => {
    try {
      const payload = {
        ...goalData,
        member: selectedMember._id, // Fixed: use _id consistently
      };
      // Store's addGoal already refetches goals
      await addGoal(payload);
      // No need for extra getGoals call
    } catch (error) {
      console.error("Error adding goal:", error);
      // Handle error (e.g., show toast)
    }
  };

  const handleEditGoal = (goalId) => {
    // TODO: Open edit modal or navigate to edit form
    // For now, use store's editGoal
    const newTarget = prompt("Enter new target value:");
    if (newTarget !== null) {
      editGoal(goalId, { targetValue: parseFloat(newTarget) });
    }
    console.log("Edit goal:", goalId);
  };

  const handleUpdateProgress = (goalId) => {
    // TODO: Prompt for new currentValue and update via store's editGoal
    const newValue = prompt("Enter new current value:");
    if (newValue !== null) {
      editGoal(goalId, { currentValue: parseFloat(newValue) });
    }
  };

  const handleAddNote = (goalId) => {
    // TODO: Use store's editGoal to add note (assuming notes field in model)
    const note = prompt("Enter note:");
    if (note) {
      // Append to notes array or similar
      console.log("Add note to goal:", goalId, ":", note);
      // editGoal(goalId, { notes: [...existing, { text: note }] });
    }
  };

  const getGoalIcon = (goalType) => {
    switch (goalType) {
      case "weight":
        return <Scale size={20} className="text-white" />;
      case "bodyFat":
        return <Percent size={20} className="text-white" />;
      case "muscleMass":
        return <Award size={20} className="text-white" />;
      case "strength":
        return <TrendingUp size={20} className="text-white" />;
      default:
        return <Target size={20} className="text-white" />;
    }
  };

  const getGoalColor = (goalType) => {
    switch (goalType) {
      case "weight":
        return "bg-green-500";
      case "bodyFat":
        return "bg-orange-500";
      case "muscleMass":
        return "bg-purple-500";
      case "strength":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-medium";
      case "Medium":
        return "text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium";
      case "Low":
        return "text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-medium";
      default:
        return "text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium";
    }
  };

  const getUnitPage = (goalType) => {
    if (goalType === "weight" || goalType === "muscleMass") {
      return "lbs";
    }
    return "%";
  };

  // Metric cards config
  const metrics = [
    { key: "weight", label: "Weight", icon: Scale, selectedLabel: "Selected" },
    {
      key: "bodyFat",
      label: "Body Fat %",
      icon: Percent,
      selectedLabel: "View data",
    },
    {
      key: "muscleMass",
      label: "Muscle Mass",
      icon: FileBarChart,
      selectedLabel: "View data",
    },
  ];

  // Line chart options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.1)" },
      },
      x: {
        grid: { display: false },
      },
    },
    elements: {
      point: { radius: 4, hoverRadius: 6 },
    },
  };

  // Doughnut options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { padding: 20, usePointStyle: true },
      },
      tooltip: {
        callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` },
      },
    },
    cutout: "60%",
  };

  return (
    <div className="p-6 h-full w-full max-w-full bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg space-y-6 border border-cyan-100 shadow-lg">
      {/* Header Section */}
      <ProgressHeader />

      {/* Select Member Section */}
      <MemberSelector
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        filteredMembers={filteredMembers}
        handleSelectMember={handleSelectMember}
        handleBrowseAll={handleBrowseAll}
        searchRef={searchRef}
      />

      {/* Selected Member Dashboard */}
      {selectedMember ? (
        <div className="space-y-6">
          {/* Profile Header at Top */}
          <MemberProfile
            selectedMember={selectedMember}
            isMembershipActive={isMembershipActive}
          />

          {/* Tabs Section Split from Profile */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <TabNavigation
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabs={tabs}
            />

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "overview" && (
                <OverviewTabContent
                  isLoading={isLoading}
                  selectedPeriod={selectedPeriod}
                  setSelectedPeriod={setSelectedPeriod}
                  selectedMetric={selectedMetric}
                  setSelectedMetric={setSelectedMetric}
                  measurements={measurements}
                  goals={goals}
                  getLineChartData={getLineChartData}
                  getDoughnutChartData={getDoughnutChartData}
                  lineOptions={lineOptions}
                  doughnutOptions={doughnutOptions}
                  metrics={metrics}
                  getPeriodStartDate={getPeriodStartDate}
                  filterMeasurementsByPeriod={filterMeasurementsByPeriod}
                  onExportData={handleExportData}
                  onAddMeasurement={handleAddMeasurement}
                />
              )}
              {activeTab === "measurements" && (
                <MeasurementsTabContent
                  isLoading={isLoading}
                  measurements={measurements}
                  displayData={displayData}
                  formatValue={formatValue}
                  formatDelta={formatDelta}
                  getColorClass={getColorClass}
                  handleAddMeasurement={handleAddMeasurement}
                  handleDeleteMeasurement={handleDeleteMeasurement}
                  handleExportData={handleExportData}
                  handleViewPhotoGallery={handleViewPhotoGallery}
                  handleViewTrends={handleViewTrends}
                />
              )}
              {activeTab === "goals" && (
                <GoalsTabContent
                  isLoading={isLoading}
                  goals={goals}
                  handleAddGoal={handleAddGoal}
                  handleEditGoal={handleEditGoal}
                  handleUpdateProgress={handleUpdateProgress}
                  handleAddNote={handleAddNote}
                  getGoalIcon={getGoalIcon}
                  getGoalColor={getGoalColor}
                  getPriorityColor={getPriorityColor}
                  getUnit={getUnitPage}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="z-0 text-center p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/50">
          <Users size={80} className="mx-auto mb-6 opacity-50 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-5">
            Select a Member to Track Progress
          </h3>
          <p className="text-gray-600 text-sm max-w-md mx-auto mb-8">
            Choose a member from the selector above to view their detailed
            progress analytics, measurements, goals, and timeline.
          </p>
          <button
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg flex items-center space-x-2 hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all mx-auto"
            onClick={handleViewAll}
          >
            <Users size={20} />
            <span>View All Members</span>
          </button>
        </div>
      )}

      {/* Add Measurement Modal */}
      <AddMeasurementModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        onSubmit={handleSubmitMeasurement}
        selectedMember={selectedMember}
      />

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={showAddGoalModal}
        onClose={handleCloseAddGoalModal}
        onSubmit={handleSubmitGoal}
        selectedMember={selectedMember}
      />
    </div>
  );
};

export default ProgressPage;
