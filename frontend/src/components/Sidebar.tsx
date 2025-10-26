import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Lucide icons
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Settings,
  ClipboardList,
  BookOpen,
  GraduationCap,
  TrendingUp,
  SquareChartGantt,
  CalendarSync,
  CalendarDays,
  ClipboardClock,
} from "lucide-react";

const Sidebar = () => {
  const { authUser } = useAuthStore();
  const user = authUser;
  const location = useLocation();

  type Role = "admin" | "trainer" | "user";

  const menus: Record<
    Role,
    { path: string; label: string; icon: React.ReactNode }[]
  > = {
    admin: [
      {
        path: "/admin",
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
      },
      {
        path: "/admin/users",
        label: "Manage Users",
        icon: <Users size={18} />,
      },
      {
        path: "/admin/trainers",
        label: "Manage Trainers",
        icon: <GraduationCap size={18} />,
      },
      {
        path: "/admin/equipments",
        label: "Manage Equipments",
        icon: <Dumbbell size={18} />,
      },
      {
        path: "/admin/plans",
        label: "Manage Plans",
        icon: <ClipboardList size={18} />,
      },
      {
        path: "/admin/settings",
        label: "Settings",
        icon: <Settings size={18} />,
      },
    ],
    trainer: [
      {
        path: "/trainer",
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
      },
      {
        path: "/trainer/test",
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
      },
      {
        path: "/trainer/template",
        label: "Templates",
        icon: <CalendarSync size={18} />,
      },
      {
        path: "/trainer/plans",
        label: "Plans",
        icon: <SquareChartGantt size={18} />,
      },
      {
        path: "/trainer/progress",
        label: "Progress Members",
        icon: <TrendingUp size={18} />,
      },
      {
        path: "/trainer/schedule",
        label: "Schedule",
        icon: <ClipboardClock size={18} />,
      },
    ],
    user: [
      {
        path: "/user",
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
      },
      {
        path: "/user/trainer",
        label: "Trainer",
        icon: <BookOpen size={18} />,
      },
      {
        path: "/user/homework",
        label: "Homework",
        icon: <ClipboardList size={18} />,
      },
    ],
  };

  // Role-based theme colors
  const roleColors: Record<
    Role,
    {
      bg: string;
      accent: string;
      text: string;
      gradient: string;
      active: string;
    }
  > = {
    admin: {
      bg: "bg-blue-950", // Navy Blue
      accent: "bg-blue-700",
      text: "text-white",
      gradient: "from-blue-800 to-blue-600",
      active: "bg-blue-700 text-white shadow",
    },
    trainer: {
      bg: "bg-cyan-50", // light cyan background
      accent: "bg-blue-100",
      text: "text-cyan-800",
      gradient: "from-cyan-500 to-teal-600",
      active: "bg-cyan-200 text-cyan-900 shadow",
    },
    user: {
      bg: "bg-white", // Orange
      accent: "bg-orange-100",
      text: "text-orange-800",
      gradient: "from-orange-500 to-amber-600",
      active: "bg-orange-200 text-orange-900 shadow",
    },
  };

  const role = user?.role as Role | undefined;
  const theme = role ? roleColors[role] : roleColors.user;

  const roleMenus = role ? menus[role] : [];

  return (
    <nav
      className={`w-72 rounded-2xl shadow-2xl p-6 flex flex-col gap-6 h-full min-h-[90vh] ${theme.bg}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow bg-gradient-to-r ${theme.gradient}`}
        >
          <span>GM</span>
        </div>
        <div>
          <h1 className={`text-xl font-semibold tracking-tight ${theme.text}`}>
            GymManage
          </h1>
          <p className="text-xs text-gray-400">Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <ul className="flex-1 space-y-2 text-base">
        {roleMenus.map(({ path, label, icon }, idx) => (
          <li key={idx}>
            <Link
              to={path}
              className={`px-4 py-2 rounded-lg flex items-center gap-3 transition font-medium ${
                location.pathname === path
                  ? theme.active
                  : `${theme.text} hover:${theme.accent}`
              }`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Upgrade Button */}
      {role === "user" && (
        <div className="mt-auto hidden md:block">
          <button
            className={`w-full py-2 rounded-xl text-white font-semibold bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition`}
          >
            Upgrade $30
          </button>
        </div>
      )}
    </nav>
  );
};

export default Sidebar;
