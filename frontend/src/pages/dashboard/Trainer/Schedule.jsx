import React, { useState, useEffect } from "react";
import { useScheduleStore } from "../../../store/useScheduleStore"; // Adjust path to your store file

const SchedulesPage = () => {
  const [editModal, setEditModal] = useState({ open: false, schedule: null });
  const [trainerId] = useState("68e374e8b9de1ec5b3210e73"); // Replace with dynamic value from auth/context

  const {
    schedules,
    todaySchedules,
    isLoading,
    createSchedule,
    getAllSchedules,
    getSchedulesByTrainer,
    getTodaySchedules,
    markScheduleComplete,
    updateSchedule,
    deleteSchedule,
  } = useScheduleStore();

  useEffect(() => {
    getAllSchedules(); // Fetch all schedules
    getSchedulesByTrainer(trainerId); // Fetch trainer-specific (overrides all if needed)
    getTodaySchedules(trainerId); // Fetch today's
  }, [getAllSchedules, getSchedulesByTrainer, getTodaySchedules, trainerId]);

  const [formData, setFormData] = useState({
    memberId: "",
    planId: "",
    date: "",
    type: "meeting",
    workoutTemplateId: "",
    startTime: "09:00",
    endTime: "10:00",
    note: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = { ...formData, trainerId };
    await createSchedule(dataToSend);
    setFormData({
      memberId: "",
      planId: "",
      date: "",
      type: "meeting",
      workoutTemplateId: "",
      startTime: "09:00",
      endTime: "10:00",
      note: "",
    });
  };

  const openEditModal = (schedule) => {
    setEditModal({ open: true, schedule });
    setFormData(schedule); // Pre-fill form for edit
  };

  const [editFormData, setEditFormData] = useState({});

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    await updateSchedule(editModal.schedule._id, editFormData);
    setEditModal({ open: false, schedule: null });
    setEditFormData({});
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      await deleteSchedule(id);
    }
  };

  const handleMarkComplete = async (id) => {
    await markScheduleComplete(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading schedules...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Schedule Management</h1>

      {/* Create Schedule Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Schedule</h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Member ID</label>
            <input
              type="text"
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Plan ID</label>
            <input
              type="text"
              name="planId"
              value={formData.planId}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="meeting">Meeting</option>
              <option value="measurement">Measurement</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Note</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="md:col-span-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Schedule
          </button>
        </form>
      </div>

      {/* All Schedules Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">All Schedules</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Date
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Member
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Type
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Start Time
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Status
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(schedule.date).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {schedule.memberId?.name || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {schedule.type}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {schedule.startTime}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        schedule.isCompleted
                          ? "bg-green-200 text-green-800"
                          : "bg-yellow-200 text-yellow-800"
                      }`}
                    >
                      {schedule.isCompleted ? "Completed" : "Pending"}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 space-x-2">
                    {!schedule.isCompleted && (
                      <button
                        onClick={() => handleMarkComplete(schedule._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(schedule)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(schedule._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {schedules.length === 0 && (
          <p className="text-gray-500 mt-4">No schedules found.</p>
        )}
      </div>

      {/* Today's Schedules Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Today's Schedules</h2>
        <ul className="space-y-2">
          {todaySchedules.map((sch) => (
            <li
              key={sch._id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded"
            >
              <span>
                {sch.memberId?.name || "N/A"} - {sch.type} at {sch.startTime}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  sch.isCompleted
                    ? "bg-green-200 text-green-800"
                    : "bg-yellow-200 text-yellow-800"
                }`}
              >
                {sch.isCompleted ? "Completed" : "Pending"}
              </span>
            </li>
          ))}
        </ul>
        {todaySchedules.length === 0 && (
          <p className="text-gray-500 mt-4">No schedules for today.</p>
        )}
      </div>

      {/* Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Edit Schedule</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  name="type"
                  value={editFormData.type || editModal.schedule?.type}
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="meeting">Meeting</option>
                  <option value="measurement">Measurement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={
                    editFormData.startTime || editModal.schedule?.startTime
                  }
                  onChange={handleEditChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note</label>
                <textarea
                  name="note"
                  value={editFormData.note || editModal.schedule?.note}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={handleUpdate}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Update
              </button>
              <button
                onClick={() => handleDelete(editModal.schedule._id)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setEditModal({ open: false, schedule: null })}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulesPage;
