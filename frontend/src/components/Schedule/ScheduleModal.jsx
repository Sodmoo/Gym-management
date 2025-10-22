// components/ScheduleModal.jsx
import React, { useState } from "react";
import {
  X,
  CheckCircle,
  Calendar,
  User,
  Clock,
  FileText,
  Users,
  Dumbbell,
} from "lucide-react";

const ScheduleModal = ({
  modal,
  formData,
  members,
  plans,
  onChange,
  onSubmit,
  onCloseModal,
  getMemberDisplayName,
  getPlanDisplayName,
}) => {
  const [activeTab, setActiveTab] = useState("basic"); // Default to basic info tab
  const [scheduleType, setScheduleType] = useState("workout"); // Type dropdown within basic

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setScheduleType(value);
    onChange({ target: { name: "type", value } });
    if (value !== "workout") {
      onChange({ target: { name: "planId", value: "" } });
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Calendar },
    { id: "member", label: "Assign Member", icon: User },
    { id: "plan", label: "Assign Plan", icon: Dumbbell },
  ];

  return (
    <div
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={
        modal.mode === "edit" ? "Edit schedule" : "Create new schedule"
      }
    >
      <div className="bg-white rounded-lg  p-4 w-full max-w-2xl max-h-[95vh] overflow-y-auto border-2 border-gray-200/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl pl-2 pt-2 font-bold text-blue-400">
              {modal.mode === "edit" ? "Edit Schedule" : "+ Create Schedule"}
            </h2>
          </div>
          <button
            onClick={onCloseModal}
            className="p-2  hover:text-white hover:bg-cyan-400 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 " />
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
                      Type
                    </label>
                    <select
                      name="type"
                      value={scheduleType}
                      onChange={handleTypeChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 transition-all duration-200"
                    >
                      <option value="workout">Workout</option>
                      <option value="meeting">Meeting</option>
                      <option value="measurement">Measurement</option>
                    </select>
                  </div>
                  <div>
                    <label className=" text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span>Date</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={onChange}
                      required={modal.mode !== "edit"}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 transition-all duration-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>Start Time</span>
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={onChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className=" text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>End Time</span>
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={onChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className=" text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>Note</span>
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={onChange}
                      rows="3"
                      placeholder="Add any additional notes..."
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 resize-none transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Assign Member Tab */}
            {activeTab === "member" && (
              <div>
                <div>
                  <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <User className="w-6 h-6 text-blue-400" />
                    <span>Member</span>
                  </label>
                  <select
                    id="memberId"
                    name="memberId"
                    value={formData.memberId}
                    onChange={onChange}
                    required={modal.mode !== "edit"}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 transition-all duration-200"
                  >
                    <option value="">Select Member</option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {getMemberDisplayName(member)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Assign Plan Tab (only for workout) */}
            {activeTab === "plan" && scheduleType === "workout" && (
              <div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <Dumbbell className="w-6 h-6 text-blue-400" />
                    <span>Plan</span>
                  </label>
                  <select
                    id="planId"
                    name="planId"
                    value={formData.planId}
                    onChange={onChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/80 transition-all duration-200"
                  >
                    <option value="">Select Plan</option>
                    {plans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {getPlanDisplayName(plan)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === "plan" && scheduleType !== "workout" && (
              <div className="text-center py-8 text-gray-500">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Plans are only assignable for Workout schedules.</p>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCloseModal}
              className="px-6 py-3.5 border border-gray-300 text-white rounded-md bg-red-600 hover:bg-red-300 transition-all duration-200 flex items-center space-x-2 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Cancel changes"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-300 text-white rounded-md transition-all duration-200 flex items-center space-x-2 font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-md hover:shadow-lg"
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
