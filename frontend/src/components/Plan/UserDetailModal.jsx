// components/UserDetailModal.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  User,
  X,
  Mail,
  Phone,
  MapPin,
  User as UserIcon,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const UserDetailModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;
  console.log("UserDetailModal user:", user);

  console.log(user);

  const API_BASE =
    (import.meta.env.VITE_API_URL &&
      import.meta.env.VITE_API_URL.replace(/\/$/, "")) ||
    "http://localhost:3000";

  const toAvatarUrl = (raw) => {
    if (!raw) return null;
    if (typeof raw !== "string") return null;
    if (raw.startsWith("http")) return raw;
    return `${API_BASE}/uploads/${raw.replace(/^\//, "")}`;
  };

  const avatarRaw =
    user.profileImage ||
    user.avatar ||
    (user.userId && user.userId.profileImage) ||
    null;
  const avatarUrl = toAvatarUrl(avatarRaw);

  const fullName =
    `${user.surname || ""} ${user.username || ""}`.trim() || "Unknown User";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ duration: 0.25 }}
        className="bg-white/90 rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4 px-6 pt-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="text-blue-600" />
            Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <span
                    className="absolute uppercase"
                    style={{ display: avatarUrl ? "none" : "flex" }}
                  >
                    {fullName.charAt(0) || "U"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {fullName}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <UserIcon size={14} className="text-gray-400" />
                {user.role || "Member"}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            {user.email && (
              <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">
                      Email
                    </h4>
                    <p className="text-gray-900 text-sm">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
            {user.phone && (
              <div className="bg-gradient-to-r from-green-50 to-white border border-green-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Phone size={16} className="text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">
                      Phone
                    </h4>
                    <p className="text-gray-900 text-sm">{user.phone}</p>
                  </div>
                </div>
              </div>
            )}
            {user.location && (
              <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MapPin size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">
                      Location
                    </h4>
                    <p className="text-gray-900 text-sm">{user.location}</p>
                  </div>
                </div>
              </div>
            )}
            {user.gender && (
              <div className="bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <UserIcon size={16} className="text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">
                      Gender
                    </h4>
                    <p className="text-gray-900 text-sm capitalize">
                      {user.gender}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">
                    Member Since
                  </h4>
                  <p className="text-gray-900 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div
                  className={`p-1 rounded-full ${
                    user.profileCompleted ? "bg-green-100" : "bg-yellow-100"
                  }`}
                >
                  {user.profileCompleted ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <AlertCircle size={16} className="text-yellow-600" />
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-11">
                Profile {user.profileCompleted ? "Completed" : "Incomplete"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserDetailModal;
