import React, { useEffect, useState, useRef } from "react";
import { useUserStore } from "../store/userStore.js";
import { useAuthStore } from "../store/authStore.js";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, LogOut, Inbox, Wallet } from "lucide-react";

const Header = (props) => {
  const { isLoading, logout, authUser } = useAuthStore();
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

  // Өнөөдрийн огноо
  useEffect(() => {
    const today = new Date();
    const weekdays = [
      "Ням",
      "Даваа",
      "Мягмар",
      "Лхагва",
      "Пүрэв",
      "Баасан",
      "Бямба",
    ];
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const weekday = weekdays[today.getDay()];
    const formattedMonth = month < 10 ? `0${month}` : `${month}`;
    setDateString(`${year} : ${formattedMonth} : ${day} ${weekday} гариг`);
  }, []);

  // гадна дархад dropdown хаах
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Role based theme
  const roleThemes = {
    admin: {
      bg: "bg-blue-950 ",
      text: "text-white",
      accent: "text-purple-300",
      menuBg: "bg-white",
      menuText: "text-blue-900",
      menuHover: "hover:bg-gray-800",
      menuBtn: "bg-purple-600 hover:bg-purple-700 text-white",
      hoverImage: "hover:ring-2 hover:ring-purple-300",
    },
    trainer: {
      bg: "bg-gradient-to-r from-teal-600 to-cyan-700",
      text: "text-white",
      accent: "text-yellow-200",
      menuBg: "bg-white",
      menuText: "text-gray-800",
      menuHover: "hover:bg-blue-100",
      menuBtn: "bg-teal-600 hover:bg-teal-700 text-white",
      hoverImage: "hover:ring-2 hover:ring-cyan-300",
    },
    user: {
      bg: "bg-orange-400",
      text: "text-white",
      accent: "text-black",
      menuBg: "bg-white",
      menuText: "text-gray-800",
      menuHover: "hover:bg-orange-100",
      menuBtn: "bg-orange-500 hover:bg-orange-600 text-white",
      hoverImage: "hover:ring-2 hover:ring-green-300",
    },
  };

  const theme = roleThemes[user?.role] || roleThemes.user;

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
    <header
      className={`flex items-center justify-between pl-1 pr-3 m-6 mb-0 rounded-xl shadow ${theme.bg} ${theme.text}`}
    >
      <div className="flex items-center gap-2">
        <button
          className="lg:hidden ml-4 rounded-md hover:bg-black/20 p-2 transition"
          onClick={props.onMenuClick}
        >
          ☰
        </button>

        <div className="ml-2 hidden sm:block mt-2 mb-2">
          <h2 className="text-xl md:text-2xl font-bold">
            Эргээд тавтай морил{" "}
            <span className={`${theme.accent}`}>{user?.username}</span>
          </h2>
          <p className="text-xs md:text-lg opacity-80 mt-2">{dateString}</p>
        </div>
      </div>

      {/* Avatar + Dropdown */}
      <div className="flex items-center gap-2 relative pr-1" ref={menuRef}>
        <div className="hidden sm:block text-right">
          <div className="text-sm font-medium">{user?.username}</div>
          <div className="text-xs opacity-80">{user?.role}</div>
        </div>

        <div
          className={`flex items-center cursor-pointer p-0.5 ${theme.hoverImage} rounded-full transition`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt="avatar"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-white/50"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <UserIcon className="w-7 h-7 text-gray-600" />
            </div>
          )}
        </div>

        {menuOpen && (
          <div
            className={`absolute top-14 right-0 w-60 shadow-lg rounded border border-gray-200 py-2 z-50 ${theme.menuBg} ${theme.menuText}`}
          >
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="avatar"
                    className="w-14 h-14 rounded-lg object-cover border border-gray-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{user?.username}</p>
                  <p className="text-xs opacity-80">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className={`mt-3 w-full text-sm font-medium py-2 rounded-lg transition ${theme.menuBtn}`}
              >
                View Profile
              </button>
            </div>

            <div className="flex flex-col text-sm gap-1 m-2">
              {authUser.role === "user" ? (
                <>
                  <button
                    onClick={() => alert("Balance clicked")}
                    className={`flex items-center gap-3 px-4 py-2 text-left rounded-md transition ${theme.menuHover}`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span>My Balance</span>
                  </button>
                  <button
                    onClick={() => alert("Inbox clicked")}
                    className={`flex items-center gap-3 px-4 py-2 text-left rounded-md transition ${theme.menuHover}`}
                  >
                    <Inbox className="w-5 h-5" />
                    <span>Inbox</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => alert("Inbox clicked")}
                  className={`flex items-center gap-3 px-4 py-2 text-left rounded-md transition ${theme.menuHover}`}
                >
                  <Inbox className="w-5 h-5" />
                  <span>Inbox</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 text-left rounded-md text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
