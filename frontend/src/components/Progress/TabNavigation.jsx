// TabNavigation.jsx
import React from "react";
import { BarChart3, Ruler, Target } from "lucide-react";

const TabNavigation = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div className="flex border-b border-gray-200">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 px-6 text-center flex items-center justify-center space-x-2 transition-all ${
              activeTab === tab.id
                ? "bg-blue-50 border-b-2 border-blue-500 text-blue-600 font-semibold"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Icon size={18} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
