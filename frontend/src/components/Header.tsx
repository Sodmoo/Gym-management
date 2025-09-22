import React from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => {
    const islogout = await logout();
    if (islogout) {
      setTimeout(() => {
        navigate("/");
      }, 200);
    }
  };
  const title = "Sales Report",
    subtitle = "Friday, December 15th, 2023";
  const onMenuClick = () => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.toggle("-translate-x-full");
    }
  };

  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={onMenuClick}
        >
          ☰
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          <p className="text-xs md:text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <input
            className="w-40 md:w-64 rounded-xl border border-gray-200 bg-white px-3 md:px-4 py-2 text-sm focus:outline-none"
            placeholder="Search..."
          />
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200"></div>
          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium">Ferra Alexandra</div>
            <div className="text-xs text-gray-400">Admin store</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
