import React from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";


const Header = () => {
  const { authUser , logout  } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => {
    const islogout = await logout();
    if (islogout) {
      setTimeout(() => {
        navigate("/");
      }, 200);
    }
  };

  return (
    <header className="bg-white shadow-md h-16 flex items-center justify-between px-6">
      <h1 className="text-xl font-bold text-gray-800">My Dashboard</h1>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600 capitalize">{authUser.role}</span>
        <button onClick={handleLogout}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
