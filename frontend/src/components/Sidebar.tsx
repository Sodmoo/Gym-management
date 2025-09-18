import React from "react";
import { Link, To } from "react-router-dom";
import { useAuthStore } from "../store/authStore";


const Sidebar = () => {
  const { authUser } = useAuthStore();
  const user = authUser;

  type Role = "admin" | "teacher" | "student";

  const menus: Record<Role, { path: string; label: string }[]> = {
    admin: [
      { path: "/admin", label: "Dashboard" },
      { path: "/admin/users", label: "Manage Users" },
      { path: "/admin/settings", label: "Settings" },
    ],
    teacher: [
      { path: "/teacher", label: "Dashboard" },
      { path: "/teacher/classes", label: "My Classes" },
      { path: "/teacher/materials", label: "Upload Materials" },
    ],
    student: [
      { path: "/student", label: "Dashboard" },
      { path: "/student/classes", label: "My Classes" },
      { path: "/student/homework", label: "Homework" },
    ],
  };

  const roleMenus =
    user && (user.role === "admin" || user.role === "teacher" || user.role === "student")
      ? menus[user.role as Role]
      : [];

  return (
    <aside className="w-64 bg-gray-900 text-white h-full p-4">
      <h2 className="text-xl font-bold mb-4 capitalize">{user?.role} Panel</h2>
      <ul className="space-y-2">
        {roleMenus.map((item: { path: To; label: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, idx: React.Key | null | undefined) => (
          <li key={idx}>
            <Link
              to={item.path}
              className="block px-3 py-2 rounded hover:bg-gray-700 transition"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
