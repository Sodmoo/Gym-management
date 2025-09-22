import React from "react";
import { Link, To } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Sidebar = () => {
  const { authUser } = useAuthStore();
  const user = authUser;

  type Role = "admin" | "trainer" | "user";

  const menus: Record<Role, { path: string; label: string }[]> = {
    admin: [
      { path: "/admin", label: "Dashboard" },
      { path: "/admin/users", label: "Manage Users" },
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
    <aside className="hidden lg:flex lg:w-72 bg-white rounded-2xl shadow-lg p-6 flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">
          SD
        </div>
        <div>
          <h1 className="text-lg font-semibold">DealDeck</h1>
          <p className="text-xs text-gray-400">Analytics</p>
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2 text-sm">
          <li className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-medium">
            Dashboard
          </li>
          {roleMenus.map(({ path, label }, idx) => (
            <li key={idx}>
              <Link
                to={path}
                className="px-3 py-2 rounded-lg hover:bg-gray-100 block"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
        <button className="w-full py-2 rounded-xl bg-indigo-600 text-white font-medium">
          Upgrade $30
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
