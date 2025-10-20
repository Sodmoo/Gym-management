// AddGoalModal.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  X,
  Users,
  Ruler,
  MessageCircle,
  Target,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

const AddGoalModal = ({ isOpen, onClose, onSubmit, selectedMember }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goalType: "",
    targetValue: "",
    currentValue: "",
    priority: "Medium",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        goalType: "",
        targetValue: "",
        currentValue: "",
        priority: "Medium",
        notes: "",
      });
      setActiveTab("basic");
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMember?.memberId) {
      console.error("No member selected");
      return;
    }
    const payload = {
      title: formData.title,
      description: formData.description,
      goalType: formData.goalType,
      targetValue: parseFloat(formData.targetValue) || 0,
      currentValue: parseFloat(formData.currentValue) || 0,
      priority: formData.priority,
      notes: formData.notes,
    };
    onSubmit(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ duration: 0.25 }}
        className="bg-white/90 rounded-lg shadow-xl border border-gray-100 max-w-170 w-full mx-2 p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Plus size={20} className="text-blue-500" />
            <span>Add New Goal</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 px-6">
            {[
              { id: "basic", label: "Basic Info", icon: Users },
              { id: "details", label: "Details", icon: Ruler },
              { id: "notes", label: "Notes", icon: MessageCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 text-sm font-medium flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Reach Target Weight of 150 lbs"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Brief description of this goal..."
                />
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800">
                Goal Details
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Type *
                </label>
                <div className="relative">
                  <select
                    name="goalType"
                    value={formData.goalType}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    required
                  >
                    <option value="">Select a type</option>
                    <option value="weight">Weight Loss/Gain</option>
                    <option value="bodyFat">Body Fat Reduction</option>
                    <option value="muscleMass">Muscle Mass Gain</option>
                    <option value="strength">Strength Improvement</option>
                  </select>
                  <Target
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Value *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="targetValue"
                    value={formData.targetValue}
                    onChange={handleInputChange}
                    placeholder="e.g., 150"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.1"
                    required
                  />
                  <span className="px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
                    lbs/%
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Value
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="currentValue"
                    value={formData.currentValue}
                    onChange={handleInputChange}
                    placeholder="e.g., 165"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.1"
                  />
                  <span className="px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg">
                    lbs/%
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <div className="relative">
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    required
                  >
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Low">Low</option>
                  </select>
                  <TrendingUp
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800">
                Additional Notes
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Add any additional notes or reminders for this goal..."
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <CheckCircle size={16} />
              <span>Add Goal</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AddGoalModal;
