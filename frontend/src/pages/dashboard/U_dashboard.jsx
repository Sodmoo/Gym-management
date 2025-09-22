import React from "react";

const dashboard = () => {
  return (
    <>
      <section className="grid grid-cols-1 lg:grid-cols-6 gap-4 md:gap-6">
        <div className="sm:col-span-2 bg-white rounded-2xl shadow p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Customer Habits</h3>
            <select className="text-sm text-gray-500 bg-transparent">
              <option>This year</option>
            </select>
          </div>
          <div className="h-40 md:h-44 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            Chart placeholder
          </div>
        </div>

        <aside className="lg:col-span-4 flex flex-col gap-4 md:gap-6">
          <div className="bg-white rounded-2xl shadow p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Product Statistic</h3>
              <select className="text-sm text-gray-500 bg-transparent">
                <option>Today</option>
              </select>
            </div>
            <div className="h-28 md:h-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
              Radial chart
            </div>

            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span>Electronic</span>
                <span>2,487</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Games</span>
                <span>1,828</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Furniture</span>
                <span>1,463</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 md:p-5">
            <h3 className="font-semibold mb-3">Customer Growth</h3>
            <div className="h-24 md:h-28 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
              Bubble chart
            </div>
            <ul className="mt-3 text-xs md:text-sm text-gray-600 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-400 rounded-full"></span>{" "}
                United States <span className="ml-auto">2,417</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-400 rounded-full"></span>{" "}
                Germany <span className="ml-auto">812</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow p-4 md:p-5">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="py-2 rounded-lg border border-gray-200 text-xs md:text-sm">
                Add product
              </button>
              <button className="py-2 rounded-lg border border-gray-200 text-xs md:text-sm">
                New report
              </button>
              <button className="py-2 rounded-lg border border-gray-200 text-xs md:text-sm">
                Settings
              </button>
              <button className="py-2 rounded-lg border border-gray-200 text-xs md:text-sm">
                Help
              </button>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl shadow p-4 md:p-5">
          <h4 className="font-semibold mb-2">Detailed Report</h4>
          <div className="h-32 md:h-36 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            Table / Chart
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 md:p-5">
          <h4 className="font-semibold mb-2">Activity</h4>
          <div className="h-32 md:h-36 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            Activity list
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4 md:p-5">
          <h4 className="font-semibold mb-2">Notifications</h4>
          <div className="h-32 md:h-36 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            Notifications
          </div>
        </div>
      </section>
    </>
  );
};

export default dashboard;
