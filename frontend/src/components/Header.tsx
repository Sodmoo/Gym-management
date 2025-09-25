import React, { useEffect, useState, useRef } from "react";
import { useUserStore } from "../store/userStore.js";
import { useAuthStore } from "../store/authStore.js";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, LogOut, Inbox, Wallet } from "lucide-react";

const Header = (props: {
  onMenuClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
}) => {
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

    // Монгол гарагийн нэрс
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

    // "2025 9 сарын 23, Мягмар гариг"
    setDateString(`${year} : ${formattedMonth} : ${day} ${weekday} гариг`);
  }, []);

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

  // Loading үе
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
    <header className="flex items-center justify-between mt-6 pl-4 pr-6">
      <div className="flex items-center gap-2 ">
        <button
          className="lg:hidden ml-4  rounded-md hover:bg-gray-100 p-2 transition"
          onClick={props.onMenuClick}
        >
          ☰
        </button>

        <div className=" ml-2 hidden sm:block mt-2 mb-2">
          <h2 className="text-xl md:text-2xl font-bold">
            Эргээд тавтай морил{" "}
            <span className="text-green-400">{user?.username}</span>
          </h2>
          <p className="text-xs md:text-lg text-black mt-2">{dateString}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 relative " ref={menuRef}>
        {/* Username + Role */}
        <div className="hidden sm:block text-right">
          <div className="text-sm font-medium">{user?.username}</div>
          <div className="text-xs text-gray-400">{user?.role}</div>
        </div>

        {/* Avatar */}
        <div
          className="flex items-center cursor-pointer p-0.5 hover:bg-green-300 rounded-full transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt="avatar"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-gray-300"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <UserIcon className="w-7 h-7 text-gray-500" />
            </div>
          )}
        </div>

        {/* Dropdown */}
        {menuOpen && (
          <div className="absolute top-15 right-0 w-60 bg-white shadow-lg rounded border-1 border-green-300 py-2 z-50">
            {/* Top user info */}
            <div className="p-3 border-b">
              <div className="flex items-center gap-2">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="avatar"
                    className="w-15 h-15 md:w-18 md:h-18 rounded-lg object-cover border border-gray-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role || "hello@example.com"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="mt-3 w-full bg-purple-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-purple-700 transition"
              >
                View Profile
              </button>
            </div>
            {/* Menu items */}
            <div className="flex flex-col text-sm gap-1 m-2">
              <button
                onClick={() => alert("Balance clicked")}
                className="flex items-center gap-3 px-4 py-2 text-left rounded-md hover:bg-gray-100 transition"
              >
                <Wallet className="w-5 h-5 text-gray-600" />
                <span>My Balance</span>
              </button>

              <button
                onClick={() => alert("Inbox clicked")}
                className="flex items-center gap-3 px-4 py-2 text-left rounded-md hover:bg-gray-100 transition"
              >
                <Inbox className="w-5 h-5 text-gray-600" />
                <span>Inbox</span>
              </button>

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
