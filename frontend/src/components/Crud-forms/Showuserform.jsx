import React, { useEffect } from "react";
import { useUserStore } from "../../store/userStore";
import { User as UserIcon } from "lucide-react";

const Showuserform = ({ user = {} }) => {
  const { getAllUsers } = useUserStore();

  useEffect(() => {
    if (getAllUsers) getAllUsers();
  }, [getAllUsers]);

  return (
    <div className="max-w-5xl w-full mx-auto p-10">
      {/* Top section: Profile + basic info */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start sm:text-left text-center gap-6">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shadow">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon className="w-16 h-16 text-gray-400" />
          )}
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            {user.surname || ""} {user.username || "Your name"}
          </h2>
          <p className="text-sm text-gray-500">
            {user.email || "yourname@gmail.com"}
          </p>
        </div>
      </div>

      {/* Bottom section: Details */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Detail label="Phone" value={user.phone} />
        <Detail label="Gender" value={user.gender} />
        <Detail label="Age" value={user.age} />
        <Detail label="Role" value={user.role} />
        <Detail label="Address" value={user.address} />
        <Detail label="Goal" value={user.goal} />
      </div>
    </div>
  );
};

// Reusable detail component
const Detail = ({ label, value }) => (
  <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium text-gray-800 break-words">
      {value || "-"}
    </p>
  </div>
);

export default Showuserform;
