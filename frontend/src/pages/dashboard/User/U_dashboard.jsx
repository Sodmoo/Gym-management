import React from "react";

const Dashboard = () => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Goals section (left side) */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Goal 1 */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h3 className="font-semibold text-lg mb-3">Weight Loss</h3>
          <p className="text-sm text-gray-600 mb-2">Target: 70kg / 100kg</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full w-3/5"></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Progress: 60%</p>
        </div>

        {/* Goal 2 */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h3 className="font-semibold text-lg mb-3">Running</h3>
          <p className="text-sm text-gray-600 mb-2">70km / 80km</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Progress: 79%</p>
        </div>

        {/* Goal 3 */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h3 className="font-semibold text-lg mb-3">Sleeping</h3>
          <p className="text-sm text-gray-600 mb-2">50hrs / 60hrs</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full w-3/5"></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Progress: 60%</p>
        </div>
      </div>

      {/* Right side widgets */}
      <aside className="flex flex-col gap-4">
        {/* Membership */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl shadow p-5">
          <h3 className="font-semibold text-lg">Membership</h3>
          <p className="mt-2 text-sm">
            Plan: <span className="font-bold">Premium</span>
          </p>
          <p className="text-sm">Start: 2025-09-01</p>
          <p className="text-sm">End: 2025-12-01</p>
          <div className="mt-4">
            <div className="w-full bg-white/30 rounded-full h-2">
              <div className="bg-white h-2 rounded-full w-2/3"></div>
            </div>
            <p className="text-xs mt-1">60 days remaining</p>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h3 className="font-semibold text-lg mb-3">Status</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center justify-between">
              <span>Weight</span>
              <span className="font-medium">75kg</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Height</span>
              <span className="font-medium">165cm</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Age</span>
              <span className="font-medium">25yrs</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Attendance</span>
              <span className="font-medium">18 days / month</span>
            </li>
          </ul>
        </div>
      </aside>
    </section>
  );
};

export default Dashboard;
