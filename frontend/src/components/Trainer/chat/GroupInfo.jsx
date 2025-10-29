// components/Trainer/chat/GroupInfo.jsx (New: Right panel with tabs like screenshot)
import React, { useState } from "react";
import { X, Image, Video, File, Link, Mic, Users } from "lucide-react";

const GroupInfo = ({ room, onClose }) => {
  const [activeTab, setActiveTab] = useState("photos");

  const tabs = [
    { id: "photos", label: "Photos", icon: Image, count: 265 },
    { id: "videos", label: "Videos", icon: Video, count: 13 },
    { id: "files", label: "Files", icon: File, count: 378 },
    { id: "links", label: "Links", icon: Link, count: 45 },
    { id: "voice", label: "Voice Messages", icon: Mic, count: 258 },
    { id: "members", label: "Members", icon: Users, count: 23 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "photos":
        return (
          <div className="grid grid-cols-3 gap-2 p-4">
            {" "}
            {/* Mock grid of images */}
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded" />
            ))}
          </div>
        );
      case "members":
        return (
          <div className="p-4 space-y-2">
            {" "}
            {/* Mock member list */}
            {[
              "Tanisha Combs (admin)",
              "Alex Hunt",
              "Jasmine Lowery",
              "Jessie Rollins",
              "Max Padilla",
              "Lukas McGowan",
            ].map((name) => (
              <div
                key={name}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
              >
                <div className="w-8 h-8 bg-purple-500 rounded-full" />
                <span className="text-sm">{name}</span>
              </div>
            ))}
          </div>
        );
      default:
        return <div className="p-4 text-gray-500">Coming soon...</div>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 bg-white flex justify-between items-center">
        <h3 className="text-lg font-semibold">Group Info</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="p-2 border-b border-gray-200 bg-white">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-2 text-sm rounded-full transition-colors ${
                activeTab === tab.id
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="text-xs bg-white rounded-full px-1.5 py-0.5">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">{renderTabContent()}</div>
    </div>
  );
};

export default GroupInfo;
