import React, { useEffect } from "react";
import { useUserStore } from "../store/userStore";

const Showuserform = ({ user, onClose }) => {
  const { getAllUsers } = useUserStore();

  useEffect(() => {
    // Fetch immediately
    getAllUsers();
    // Fetch every second
    const interval = setInterval(() => {
      getAllUsers();
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [getAllUsers]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Зураг ба үндсэн мэдээлэл */}
      <div className="col-span-1 flex flex-col items-center text-center border-r border-gray-100 pr-6">
        <img
          src={user.profileImage || "https://via.placeholder.com/150"}
          alt="Profile"
          className="w-36 h-36 rounded-full object-cover shadow-md"
        />
        <h2 className="mt-4 text-xl font-semibold text-gray-800">
          {user.surname} {user.username}
        </h2>
        <p className="text-sm text-gray-500">{user.role}</p>
      </div>

      {/* Бусад мэдээлэл */}
      <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium text-gray-800">{user.email}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-sm text-gray-500">Phone</p>
          <p className="font-medium text-gray-800">{user.phone}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-sm text-gray-500">Gender</p>
          <p className="font-medium text-gray-800 capitalize">{user.gender}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-sm text-gray-500">Age</p>
          <p className="font-medium text-gray-800">{user.age}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-sm text-gray-500">Address</p>
          <p className="font-medium text-gray-800">{user.address}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="text-sm text-gray-500">Goal</p>
          <p className="font-medium text-gray-800">{user.goal}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
      >
        Cancel
      </button>
    </div>
  );
};

export default Showuserform;
