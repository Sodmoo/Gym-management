// components/ScheduleModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  CheckCircle,
  Calendar,
  User,
  Clock,
  FileText,
  Dumbbell,
} from "lucide-react";

const ScheduleModal = ({
  modal,
  formData = { type: "workout" }, // Default prop to prevent undefined
  members,
  plans,
  onChange,
  onSubmit,
  onCloseModal,
  getMemberDisplayName,
  getPlanDisplayName,
}) => {
  const [activeTab, setActiveTab] = useState("basic");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const tabs = useMemo(() => {
    const type = formData.type || "workout"; // Fallback for safety
    const baseTabs = [
      { id: "basic", label: "Үндсэн Мэдээлэл", icon: Calendar },
    ];
    if (type === "workout") {
      return [...baseTabs, { id: "plan", label: "Төлөвлөгөө", icon: Dumbbell }];
    } else {
      return [...baseTabs, { id: "member", label: "Гишүүн", icon: User }];
    }
  }, [formData?.type]); // Depend on formData.type safely

  // Reset activeTab to "basic" if current tab is no longer available (e.g., type change)
  useEffect(() => {
    if (!tabs.find((t) => t.id === activeTab)) {
      setActiveTab("basic");
    }
  }, [tabs, activeTab]);

  // Helper to get Member _id (for saving as memberId) - ALWAYS use member._id
  const getMemberIdFromMember = (member) => {
    return member?._id || "";
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={
        modal.mode === "edit" ? "Хуваарийг засах" : "Шинэ хуваарь үүсгэх"
      }
    >
      <div className="bg-white rounded-lg p-4 w-full max-w-2xl max-h-[95vh] overflow-y-auto border-2 border-gray-200/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl pl-2 pt-2 font-bold text-blue-400">
              {modal.mode === "edit" ? "Хуваарийг засах" : "+ Хуваарь үүсгэх"}
            </h2>
          </div>
          <button
            onClick={onCloseModal}
            className="p-2 hover:text-white hover:bg-cyan-400 rounded-md transition-colors"
            aria-label="Хаах"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 -mb-px font-medium transition-colors ${
                    isActive
                      ? "text-blue-600 border-b-2 border-blue-400"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Төрөл
                    </label>
                    <select
                      name="type"
                      value={formData.type || "workout"}
                      onChange={onChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 transition-all duration-200"
                    >
                      <option value="workout">Дасгал</option>
                      <option value="meeting">Уулзалт</option>
                      <option value="measurement">Хэмжилт</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span>Огноо</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date || ""}
                      onChange={onChange}
                      required={modal.mode !== "edit"}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 transition-all duration-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>Эхлэх Цаг</span>
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime || ""}
                        onChange={onChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>Дуусах Цаг</span>
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime || ""}
                        onChange={onChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>Тэмдэглэл</span>
                    </label>
                    <textarea
                      name="note"
                      value={formData.note || ""}
                      onChange={onChange}
                      rows="3"
                      placeholder="Нэмэлт тэмдэглэл нэмэх..."
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 resize-none transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Assign Member Tab (for meeting/measurement) */}
            {activeTab === "member" && (
              <div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <User className="w-6 h-6 text-blue-400" />
                    <span>Гишүүн</span>
                  </label>
                  <select
                    id="memberId"
                    name="memberId"
                    value={formData.memberId || ""}
                    onChange={onChange}
                    required={modal.mode !== "edit"}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 transition-all duration-200"
                  >
                    <option value="">Гишүүн сонгох</option>
                    {members.map((member) => {
                      const memberId = getMemberIdFromMember(member); // Use Member _id
                      return (
                        <option key={member._id} value={memberId}>
                          {getMemberDisplayName(member)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            )}

            {/* Assign Plan Tab (only for workout) */}
            {activeTab === "plan" &&
              (formData.type || "workout") === "workout" && (
                <div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <Dumbbell className="w-6 h-6 text-blue-400" />
                      <span>Төлөвлөгөө</span>
                    </label>
                    <select
                      id="planId"
                      name="planId"
                      value={formData.planId || ""}
                      onChange={onChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 transition-all duration-200"
                    >
                      <option value="">Төлөвлөгөө сонгох</option>
                      {plans.map((plan) => (
                        <option key={plan._id} value={plan._id}>
                          {getPlanDisplayName(plan)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

            {activeTab === "plan" &&
              (formData.type || "workout") !== "workout" && (
                <div className="text-center py-8 text-gray-500">
                  <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>
                    Төлөвлөгөөг зөвхөн Дасгалын хуваариудад хуваарилж болно.
                  </p>
                </div>
              )}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCloseModal}
              className="px-6 py-3.5 border border-gray-300 rounded-md bg-red-600 hover:bg-red-500 text-white transition-all duration-200 flex items-center space-x-2 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Өөрчлөлтийг цуцлах"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-all duration-200 flex items-center space-x-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md hover:shadow-lg"
            >
              <CheckCircle className="w-4 h-4" aria-hidden="true" />
              <span>{modal.mode === "edit" ? "Update" : "Create"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
