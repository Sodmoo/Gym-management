import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Sidebar = () => {
  const { authUser } = useAuthStore();
  const user = authUser;
  const location = useLocation();

  type Role = "admin" | "trainer" | "user";

  const menus: Record<Role, { path: string; label: string }[]> = {
    admin: [
      { path: "/admin", label: "Dashboard" },
      { path: "/admin/users", label: "Manage Users" },
      { path: "/admin/trainers", label: "Manage Trainers" },
      { path: "/admin/equipments", label: "Manage Equipments" },
      { path: "/admin/plans", label: "Manage Plans" },
      { path: "/admin/settings", label: "Settings" },
    ],
    trainer: [
      { path: "/trainer", label: "Dashboard" },
      { path: "/trainer/classes", label: "My Classes" },
      { path: "/trainer/materials", label: "Upload Materials" },
    ],
    user: [
      { path: "/user", label: "Dashboard" },
      { path: "/user/classes", label: "My Classes" },
      { path: "/user/homework", label: "Homework" },
    ],
  };

  const roleMenus =
    user &&
    (user.role === "admin" || user.role === "trainer" || user.role === "user")
      ? menus[user.role as Role]
      : [];

  return (
    <nav className="w-72 bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-6 h-full min-h-[90vh]">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow">
          <span>GM</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">GymManage</h1>
          <p className="text-xs text-gray-400">Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <ul className="flex-1 space-y-2 text-base">
        {roleMenus.map(({ path, label }, idx) => (
          <li key={idx}>
            <Link
              to={path}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition font-medium ${
                location.pathname === path
                  ? "bg-indigo-100 text-indigo-700 shadow"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Upgrade Button */}
      <div className="mt-auto hidden md:block">
        <button className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition">
          Upgrade $30
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
