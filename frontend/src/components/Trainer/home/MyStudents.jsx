// components/Trainer/home/MyStudents.jsx
import React, { useState } from "react";
import { Users, Check, Menu } from "lucide-react";

const MyStudents = ({ enhancedStudents, isLoadingTrainer }) => {
  const [expanded, setExpanded] = useState(false);
  const maxVisible = 4;
  const visibleStudents = expanded
    ? enhancedStudents
    : enhancedStudents.slice(0, maxVisible);
  const hasMore = enhancedStudents.length > maxVisible;

  if (isLoadingTrainer) {
    return (
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full flex flex-col justify-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <p className="ml-2 text-sm text-gray-500">Loading students...</p>
        </div>
      </section>
    );
  }

  if (enhancedStudents.length === 0) {
    return (
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full flex flex-col justify-center">
        <div className="text-center text-gray-400">
          <Users className="mx-auto mb-3 opacity-60" size={32} />
          <p className="text-sm font-medium">No students assigned yet.</p>
          <p className="text-xs mt-1">
            Assign students in the Members section!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200  h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0 text-white bg-cyan-500 px-4 py-4 rounded-t-md">
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Users className="text-indigo-600 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mt-2">My Students</h3>
        </div>

        <span className="text-sm text-cyan-600 bg-gray-100 px-3 py-2 rounded-full">
          Total {enhancedStudents.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col">
        <div className={` ${!expanded ? "max-h-64" : ""}`}>
          {visibleStudents.map((student) => (
            <div
              key={student._id}
              className="flex items-center gap-3 px-5 py-3 bg-gray-50 hover:bg-gray-100 divide-y divide-gray-100 transition-colors"
            >
              <img
                src={student.avatar}
                alt={student.displayName}
                className="w-11 h-11 rounded-full object-cover border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-md font-medium text-gray-900 truncate">
                  {student.displayName}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {student.email || student.userId?.email || "No email"}
                </p>
              </div>
              <div className="flex items-center gap-1 cursor-pointer ">
                <Menu className="w-5 h-5 text-gray-500 hover:text-blue-600" />
              </div>
            </div>
          ))}
        </div>
        {hasMore && (
          <div className=" mt-3.5 flex-shrink-0 p-4 border-t border-gray-100">
            <button
              onClick={() => setExpanded(!expanded)}
              className={`w-full py-2 rounded-lg font-medium transition-all ${
                expanded
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {expanded
                ? "Show Less"
                : `View More (+${enhancedStudents.length - maxVisible})`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyStudents;
