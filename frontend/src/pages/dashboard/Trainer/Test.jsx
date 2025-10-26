import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Activity,
  Dumbbell,
  Calendar,
  ClipboardList,
  TrendingUp,
  FileText,
  LayoutDashboard,
  Settings,
  BookOpen,
  File,
  Clock,
  MessageCircle,
  DollarSign,
  Bell,
  Menu,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function TrainerDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showModal, setShowModal] = useState({ open: false, type: null });

  const stats = [
    {
      title: "Total Members",
      value: 28,
      change: "+12%",
      icon: <Users className="text-blue-600" />,
      color: "blue",
    },
    {
      title: "Active Plans",
      value: 14,
      change: "+5%",
      icon: <Activity className="text-green-600" />,
      color: "green",
    },
    {
      title: "Sessions Today",
      value: 6,
      change: "-1",
      icon: <Dumbbell className="text-orange-500" />,
      color: "orange",
    },
    {
      title: "Monthly Revenue",
      value: "$2,450",
      change: "+18%",
      icon: <DollarSign className="text-purple-600" />,
      color: "purple",
    },
  ];

  const schedule = [
    {
      time: "08:00 AM",
      name: "John Smith",
      type: "Workout",
      status: "confirmed",
    },
    {
      time: "10:00 AM",
      name: "Sarah Lee",
      type: "Measurement",
      status: "pending",
    },
    {
      time: "01:30 PM",
      name: "Mike Brown",
      type: "Workout",
      status: "confirmed",
    },
    {
      time: "03:00 PM",
      name: "Anna Kim",
      type: "Meeting",
      status: "cancelled",
    },
  ];

  const progressData = [
    { day: "Mon", weight: 82, adherence: 95 },
    { day: "Tue", weight: 81.8, adherence: 92 },
    { day: "Wed", weight: 81.6, adherence: 88 },
    { day: "Thu", weight: 81.4, adherence: 90 },
    { day: "Fri", weight: 81.1, adherence: 96 },
    { day: "Sat", weight: 80.9, adherence: 85 },
    { day: "Sun", weight: 80.7, adherence: 91 },
  ];

  const members = [
    {
      name: "John Smith",
      plan: "Fat Loss",
      progress: 92,
      next: "Tomorrow",
      compliance: 95,
    },
    {
      name: "Sarah Lee",
      plan: "Muscle Gain",
      progress: 78,
      next: "Today 10AM",
      compliance: 82,
    },
    {
      name: "Mike Brown",
      plan: "Strength",
      progress: 85,
      next: "Tomorrow",
      compliance: 88,
    },
  ];

  const messages = [
    {
      from: "John Smith",
      preview: "Hey coach, crushed my workout today!",
      time: "2 min ago",
      unread: true,
    },
    {
      from: "Sarah Lee",
      preview: "Need advice on meal prep.",
      time: "1 hr ago",
      unread: false,
    },
    {
      from: "Mike Brown",
      preview: "Updated my measurements.",
      time: "3 hrs ago",
      unread: false,
    },
  ];

  const notes = [
    { title: "Check Sarah’s form", date: "Today 9AM", priority: "high" },
    { title: "Update Mike’s plan", date: "Yesterday", priority: "medium" },
    { title: "Add John’s progress photo", date: "2 days ago", priority: "low" },
  ];

  const quickActions = [
    {
      title: "Template Manage",
      description: "Create & Edit Templates",
      icon: <FileText className="text-indigo-600" />,
      link: "/templates",
    },
    {
      title: "Plan Manage",
      description: "Assign & Track Plans",
      icon: <LayoutDashboard className="text-emerald-600" />,
      link: "/plans",
    },
    {
      title: "Schedule",
      description: "View & Book Sessions",
      icon: <Calendar className="text-amber-600" />,
      link: "/schedule",
    },
    {
      title: "Member Progress",
      description: "Log & Visualize Data",
      icon: <TrendingUp className="text-rose-600" />,
      link: "/progress",
    },
  ];

  const templates = [
    {
      id: 1,
      title: "Beginner Strength",
      goal: "Build foundational strength",
      duration: "8 weeks",
      workouts: 24,
      diets: 56,
      assigned: 5,
    },
    {
      id: 2,
      title: "Fat Loss Accelerator",
      goal: "Rapid weight reduction",
      duration: "6 weeks",
      workouts: 18,
      diets: 42,
      assigned: 3,
    },
    {
      id: 3,
      title: "Endurance Builder",
      goal: "Improve cardio stamina",
      duration: "10 weeks",
      workouts: 30,
      diets: 70,
      assigned: 2,
    },
  ];

  const plans = [
    {
      id: 1,
      member: "John Smith",
      template: "Beginner Strength",
      startDate: "Oct 1, 2025",
      progress: 75,
      status: "Active",
    },
    {
      id: 2,
      member: "Sarah Lee",
      template: "Fat Loss Accelerator",
      startDate: "Sep 15, 2025",
      progress: 45,
      status: "Active",
    },
    {
      id: 3,
      member: "Mike Brown",
      template: "Muscle Gain Pro",
      startDate: "Oct 10, 2025",
      progress: 20,
      status: "New",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getPlanStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const openModal = (type) => setShowModal({ open: true, type });
  const closeModal = () => setShowModal({ open: false, type: null });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : -64 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">GymPro</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <nav className="mt-6 px-4">
          <a
            href="#"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg mb-2 transition-colors ${
              activeSection === "dashboard"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveSection("dashboard")}
          >
            <LayoutDashboard className="mr-3 h-4 w-4" /> Dashboard
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 mb-2"
          >
            <FileText className="mr-3 h-4 w-4" /> Templates
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 mb-2"
          >
            <Activity className="mr-3 h-4 w-4" /> Plans
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 mb-2"
          >
            <Calendar className="mr-3 h-4 w-4" /> Schedule
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 mb-2"
          >
            <Users className="mr-3 h-4 w-4" /> Members
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 mb-2"
          >
            <TrendingUp className="mr-3 h-4 w-4" /> Progress
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 mb-2"
          >
            <MessageCircle className="mr-3 h-4 w-4" /> Messages
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Settings className="mr-3 h-4 w-4" /> Settings
          </a>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h2 className="ml-4 text-xl font-semibold text-gray-900">
                Dashboard
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Coach Alex</span>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  A
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Welcome Hero */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg">
              <h1 className="text-2xl font-bold mb-2">
                Welcome Back, Coach Alex!
              </h1>
              <p className="text-blue-100 mb-4">
                October 26, 2025 | "Strength starts with consistency."
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                onClick={() => openModal("session")}
              >
                Start New Session
              </motion.button>
            </div>
          </motion.section>

          {/* Overview Stats Cards */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{
                  y: -4,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                className="bg-white rounded-2xl p-5 shadow hover:shadow-md transition flex items-center justify-between overflow-hidden"
              >
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </h3>
                  <p
                    className={`text-sm ${
                      stat.change.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
                <div
                  className={`bg-${stat.color}-100 p-3 rounded-xl flex-shrink-0`}
                >
                  {stat.icon}
                </div>
              </motion.div>
            ))}
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Today's Schedule */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow p-6 col-span-1"
            >
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Calendar className="text-blue-600" /> Today's Schedule
              </h2>
              <ul className="divide-y">
                {schedule.map((s, i) => (
                  <motion.li
                    key={i}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    className="py-3 flex justify-between items-center px-2 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{s.name}</p>
                      <p className="text-sm text-gray-500">{s.type}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-700 block">
                        {s.time}
                      </span>
                      <span className={`text-xs ${getStatusColor(s.status)}`}>
                        {s.status}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => openModal("calendar")}
              >
                View Full Calendar
              </motion.button>
            </motion.section>

            {/* Progress Chart */}
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow p-6 col-span-1 lg:col-span-2"
            >
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <TrendingUp className="text-green-600" /> Client Progress
              </h2>
              <div className="w-full h-64">
                <ResponsiveContainer>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      name="Weight (kg)"
                    />
                    <Line
                      type="monotone"
                      dataKey="adherence"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      name="Adherence %"
                      yAxisId="right"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.section>
          </div>

          {/* Messages & Members */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Messages */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow p-6"
            >
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <MessageCircle className="text-indigo-600" /> Recent Messages
              </h2>
              <ul className="divide-y">
                {messages.map((msg, i) => (
                  <motion.li
                    key={i}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    className="py-3 flex justify-between items-center px-2 rounded-lg cursor-pointer"
                    onClick={() => openModal("message")}
                  >
                    <div>
                      <p
                        className={`font-medium ${
                          msg.unread ? "text-gray-900" : "text-gray-600"
                        }`}
                      >
                        {msg.from}
                      </p>
                      <p className="text-sm text-gray-500">{msg.preview}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">
                        {msg.time}
                      </span>
                      {msg.unread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                View All Messages
              </motion.button>
            </motion.section>

            {/* Active Members */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow p-6"
            >
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Users className="text-blue-600" /> Active Members
              </h2>
              <ul className="divide-y">
                {members.map((m, i) => (
                  <motion.li
                    key={i}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    className="py-3 flex justify-between items-center px-2 rounded-lg cursor-pointer"
                    onClick={() => openModal("member")}
                  >
                    <div>
                      <p className="font-medium text-gray-800">{m.name}</p>
                      <p className="text-sm text-gray-500">{m.plan}</p>
                      <div className="w-16 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                        {m.progress}%
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      {m.next} <Clock className="w-3 h-3" />
                    </span>
                  </motion.li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                View All Members
              </motion.button>
            </motion.section>
          </div>

          {/* Recent Templates */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
              <BookOpen className="text-indigo-600" /> Recent Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates.map((template, i) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  whileHover={{
                    y: -4,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                  }}
                  className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition cursor-pointer overflow-hidden"
                  onClick={() => openModal("template")}
                >
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {template.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Goal: {template.goal}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Duration: {template.duration}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <Dumbbell className="w-4 h-4 text-orange-500" />
                      {template.workouts} Workouts
                    </div>
                    <div className="flex items-center gap-1">
                      <File className="w-4 h-4 text-green-500" />
                      {template.diets} Diets
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {template.assigned} Assigned
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="text-indigo-600 hover:underline text-sm font-medium"
                    >
                      Edit Template
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Active Plans Table */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
              <LayoutDashboard className="text-emerald-600" /> Active Plans
            </h2>
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {plans.map((plan, i) => (
                    <motion.tr
                      key={plan.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                      whileHover={{ backgroundColor: "#f9fafb" }}
                      className="cursor-pointer"
                      onClick={() => openModal("plan")}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {plan.member}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {plan.template}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {plan.startDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {plan.progress}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanStatusColor(
                            plan.status
                          )}`}
                        >
                          {plan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-emerald-600 hover:text-emerald-500 mr-2 transition-colors">
                          View
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-500 transition-colors">
                          Update
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
                onClick={() => openModal("assign")}
              >
                Assign New Plan
              </motion.button>
            </div>
          </motion.section>

          {/* Quick Actions Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {quickActions.map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                whileHover={{
                  y: -4,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                className="bg-white rounded-2xl p-6 shadow hover:shadow-md transition cursor-pointer group overflow-hidden"
                onClick={() => (window.location.href = action.link)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    className="bg-indigo-100 p-3 rounded-xl group-hover:bg-indigo-200 transition"
                    whileHover={{ rotate: 5 }}
                  >
                    {action.icon}
                  </motion.div>
                  <h3 className="font-semibold text-gray-800">
                    {action.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {action.description}
                </p>
                <a className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1">
                  Manage <Settings className="w-4 h-4" />
                </a>
              </motion.div>
            ))}
          </motion.section>
        </main>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        />
      )}

      {/* Modals */}
      <AnimatePresence>
        {showModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">
                {showModal.type === "session" && "Start New Session"}
                {showModal.type === "calendar" && "Full Calendar"}
                {showModal.type === "message" && "Message Details"}
                {showModal.type === "member" && "Member Profile"}
                {showModal.type === "template" && "Template Details"}
                {showModal.type === "plan" && "Plan Details"}
                {showModal.type === "assign" && "Assign New Plan"}
              </h3>
              <p className="text-gray-600 mb-4">
                This is a demo modal for {showModal.type}. Add your content
                here!
              </p>
              <button
                onClick={closeModal}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
