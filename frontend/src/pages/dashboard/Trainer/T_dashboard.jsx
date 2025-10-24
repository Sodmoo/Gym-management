import React, { useState, useEffect } from "react";
import {
  Users,
  Activity,
  Dumbbell,
  Calendar,
  ClipboardList,
  TrendingUp,
  Bell,
  Search,
  Plus,
  MessageCircle,
  FileText,
  Heart,
  Zap,
  Target,
  Edit3,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { useUserStore } from "../../../store/userStore"; // Adjust path as needed
import { useTemplateStore } from "../../../store/TemplateStore"; // Adjust path as needed
import OverviewTemplateCard from "../../../components/Trainer/home/OverviewTemplateCard"; // Updated import for the new overview card
import DetailModal from "../../../components/Template/DetailModal"; // Import DetailModal for view details
import { AnimatePresence, motion } from "framer-motion"; // For animations like in TemplateManager

export default function TrainerMainContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState("All");
  const [activeTab, setActiveTab] = useState("schedule"); // For schedule control tabs
  const [activeTemplateTab, setActiveTemplateTab] = useState("workout");
  const [expandedTemplateId, setExpandedTemplateId] = useState(null); // Optional: Keep if you want inline expand, but we'll use modals instead
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const { user, fetchUser } = useUserStore();
  const {
    workoutTemplates,
    dietTemplates,
    getWorkoutTemplates,
    getDietTemplates,
    // Remove CRUD hooks since not needed
    isLoadingWorkout,
    isLoadingDiet,
  } = useTemplateStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?._id) {
      getWorkoutTemplates(user._id);
      getDietTemplates(user._id);
    }
  }, [user?._id, getWorkoutTemplates, getDietTemplates]);

  // ... (keep all static data like stats, notifications, etc. unchanged)

  const templates =
    activeTemplateTab === "workout" ? workoutTemplates : dietTemplates;
  const isLoadingTemplates =
    activeTemplateTab === "workout" ? isLoadingWorkout : isLoadingDiet;

  // Remove handleQuickAction if not needed, or keep as is
  const quickActions = [
    // ... keep as is, but perhaps remove template creation ones if no CRUD
    { icon: FileText, label: "Create New Plan", action: "createPlan" },
    { icon: Target, label: "Assign Plan to Member", action: "assignPlan" },
    { icon: Calendar, label: "Book Session", action: "schedule" },
    { icon: MessageCircle, label: "Quick Message", action: "message" },
  ];

  const handleQuickAction = (action) => {
    console.log(`Action triggered: ${action}`);
    // Implement modals or routing here
  };

  // Remove all CRUD handlers: handleAddTemplate, handleEditTemplate, handleSaveTemplate, handleAssignTemplate, toggleExpanded

  const handleViewTemplate = (type, data) => {
    setPreviewType(type);
    setPreviewData(data);
    setPreviewOpen(true);
  };

  // ... (keep radarData, handleScheduleTab, scheduleActions unchanged)

  return (
    <main className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Quick Actions Grid - Updated to remove template creation */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {" "}
          {/* Adjusted cols since fewer actions */}
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleQuickAction(action.action)}
              className="group bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-gray-200 flex flex-col items-center gap-2 text-center h-full"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Simplified Templates Overview - Like TemplateManager but read-only */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="text-indigo-600" /> My Templates
            </h2>
            <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
              {["workout", "diet"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTemplateTab(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    activeTemplateTab === tab
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:text-indigo-600"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}s
                </button>
              ))}
            </div>
          </div>
          {/* Add "View All" link instead of Add button */}
          <button
            onClick={() => console.log("Navigate to full TemplateManager")} // Replace with actual navigation, e.g., useRouter
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all shadow-md"
          >
            <FileText size={16} /> View All
          </button>
        </div>
        {isLoadingTemplates ? (
          <div className="text-center text-gray-500 py-12 animate-pulse">
            <FileText className="mx-auto mb-3 opacity-60" size={32} />
            <p className="text-sm">Loading Templates...</p>
          </div>
        ) : templates.length > 0 ? (
          <>
            {/* Cards Grid - Using OverviewTemplateCard for homepage display */}
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" // Kept 4 cols for overview
            >
              <AnimatePresence>
                {templates.map((t, idx) => (
                  <motion.div
                    key={t._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    layout
                  >
                    <OverviewTemplateCard
                      t={t}
                      type={activeTemplateTab}
                      onView={(templateType, templateData) =>
                        handleViewTemplate(activeTemplateTab, templateData)
                      } // Adjusted to ignore passed type and use activeTemplateTab
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <FileText className="mx-auto mb-3 opacity-60" size={32} />
            <p className="text-sm font-medium">No templates yet.</p>
            <p className="text-xs mt-1">
              Create some in the Templates section!
            </p>
          </div>
        )}
      </section>

      {/* Rest of the sections unchanged: Stats, Notifications/Clients, Radar, Schedule, Pie, Notes/Recent */}
      {/* ... (paste the rest of the return JSX here, unchanged) */}

      {/* Detail Modal for viewing template details */}
      <AnimatePresence>
        {previewOpen && previewData && (
          <DetailModal
            isOpen={previewOpen}
            onClose={() => {
              setPreviewOpen(false);
              setPreviewData(null);
              setPreviewType(null);
            }}
            title={previewData.title || previewData.name}
            type={previewType}
            data={previewData}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
