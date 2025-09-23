import React from "react";
import Sidebar from "./Sidebar";

export function MobileSidebar({ open, onClose }) {
  return (
    <div
      className={`fixed inset-0 z-40 lg:hidden transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-opacity-40" onClick={onClose}></div>
      {/* Sidebar */}
      <div className="relative w-78 bg-white h-full p-6 flex flex-col">
        <button
          className="mb-4 self-end text-gray-500 text-2xl"
          onClick={onClose}
        >
          ✕
        </button>
        <Sidebar />
      </div>
    </div>
  );
}
