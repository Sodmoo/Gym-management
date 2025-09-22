import React, { useEffect, useState } from "react";
import { useUserStore } from "../store/userStore.js";
import { useAuthStore } from "../store/authStore.js";
import { useNavigate } from "react-router-dom";
import { upload } from "../../../backend/middleware/upload.js";

const Header = () => {
  const { isLoading, logout } = useAuthStore();
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [dateString, setDateString] = useState("");

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

  // 🔹 isLoading эсвэл authUser байхгүй үед
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

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <input
            className="w-40 md:w-64 rounded-xl border border-gray-200 bg-white px-3 md:px-4 py-2 text-sm focus:outline-none"
            placeholder="Search..."
          />
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2 md:gap-3">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="avatar"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
              />
            ) : (
              // Хэрвээ зураг байхгүй бол default placeholder
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200"></div>
            )}
          </div>

          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium">{user?.username}</div>
            <div className="text-xs text-gray-400">{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline"
          >
            Гарах
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
