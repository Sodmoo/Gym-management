import React, { useEffect, useState, useRef } from "react";
import { useUserStore } from "../store/userStore.js";
import { useAuthStore } from "../store/authStore.js";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { isLoading, logout } = useAuthStore();
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [dateString, setDateString] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = async () => {
    const islogout = await logout();
    if (islogout) {
      setTimeout(() => {
        navigate("/");
      }, 200);
    }
  };

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setDateString(today.toLocaleDateString("mn-MN", options));
  }, []);

  const onMenuClick = () => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.toggle("-translate-x-full");
    }
  };

  // гадна дархад dropdown хаах
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !(menuRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (isLoading || !user) {
    return (
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="animate-pulse h-6 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse h-8 w-8 rounded-full bg-gray-200"></div>
      </header>
    );
  }

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
          <h2 className="text-xl md:text-2xl font-bold">
            Эргээд тавтай морил {user?.username}
          </h2>
          <p className="text-xs md:text-sm text-gray-500">{dateString}</p>
        </div>
      </div>

      {/* Profile Dropdown */}
      <div className="relative" ref={menuRef}>
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt="avatar"
            className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover cursor-pointer ring-2 ring-gray-200 hover:ring-blue-400 transition"
            onClick={() => setMenuOpen((prev) => !prev)}
          />
        ) : (
          <div
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-300 cursor-pointer flex items-center justify-center text-gray-600 font-semibold"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </div>
        )}

        {menuOpen && (
          <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
            {/* Top user info */}
            <div className="px-4 py-3 bg-gray-50 border-b">
              <p className="text-sm font-semibold text-gray-800">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>

            {/* Menu items */}
            <div className="flex flex-col py-2">
              <button
                onClick={() => navigate("/profile")}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition"
              >
                👤 Профайл
              </button>
              <button
                onClick={() => navigate("/settings")}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition"
              >
                ⚙️ Тохиргоо
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition"
              >
                🚪 Гарах
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
