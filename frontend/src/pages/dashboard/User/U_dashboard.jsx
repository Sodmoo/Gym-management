import React, { useEffect, useState } from "react";
import { useUserStore } from "../../../store/userStore.js";
import { Check, Trash2, Plus, X } from "lucide-react";
import { useMemberStore } from "../../../store/memberStore.js";

const U_Dashboard = () => {
  const { isLoading, updateSubGoal, deleteSubGoal, addSubGoal } =
    useMemberStore();
  const { user, fetchUser, error } = useUserStore();

  const [adding, setAdding] = useState(false); // modal биш inline form
  const [form, setForm] = useState({ title: "", target: "", unit: "" });

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) return <p className="p-4">Түр хүлээнэ үү...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!user) return <p className="p-4">Түр хүлээнэ үү...</p>;

  const userTasks = user?.subGoals || [];

  const getRandomColor = () => {
    const colors = [
      "#EF4444",
      "#F59E0B",
      "#10B981",
      "#3B82F6",
      "#8B5CF6",
      "#EC4899",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleUpdateProgress = async (subGoal) => {
    if (!user?._id) return;
    const value = prompt("Нэмэх тоо оруул (ж: 1, 2 ...)");
    if (!value || isNaN(value)) return;
    const newProgress = subGoal.progress + parseInt(value, 10);
    await updateSubGoal(user._id, subGoal._id, newProgress);
    await fetchUser();
  };

  const handleDeleteSubGoal = async (subGoalId) => {
    if (!user?._id) return;
    if (!window.confirm("Энэ дэд зорилгыг устгах уу?")) return;
    await deleteSubGoal(user._id, subGoalId);
    await fetchUser();
  };

  const handleAddTask = async () => {
    if (!user?._id) return;
    if (!form.title.trim()) return alert("Task title заавал бөглөнө үү");
    await addSubGoal(user._id, {
      title: form.title,
      target: Number(form.target) || 1,
      unit: form.unit,
    });
    setForm({ title: "", target: "", unit: "" });
    setAdding(false);
    await fetchUser();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[68%_30%] h-full gap-4">
      {/* Зүүн тал - User info */}
      <div className="bg-white shadow-md p-6 h-full overflow-y-auto rounded-md">
        <h2 className="text-2xl font-bold mb-4">Миний мэдээлэл</h2>
        <div className="flex items-center gap-4 mb-4">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
              No Image
            </div>
          )}
          <div>
            <p>
              <strong>Нэр:</strong> {user?.username}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
          </div>
        </div>

        <p>
          <strong>Өндөр:</strong> {user?.height || "—"}
        </p>
        <p>
          <strong>Жин:</strong> {user?.weight || "—"}
        </p>
        <p>
          <strong>Зорилго:</strong> {user?.goal || "—"}
        </p>
      </div>

      {/* Баруун тал - Goals */}
      <div className="bg-orange-400 h-full w-full p-4 overflow-y-auto rounded-md text-white">
        {/* User Info small cards */}
        <div className="grid grid-cols-3 gap-3 mb-6 bg-white rounded-lg p-4 text-center">
          <div>
            <p className="text-xl font-bold text-gray-900">
              {user?.weight || "—"} <span className="text-sm">kg</span>
            </p>
            <p className="text-sm text-gray-900">Weight</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">
              {user?.height || "—"} <span className="text-sm">cm</span>
            </p>
            <p className="text-sm text-gray-900">Height</p>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">
              {user?.age || "—"} <span className="text-sm ">yrs</span>
            </p>
            <p className="text-sm text-gray-900">Age</p>
          </div>
        </div>

        {/* Goals Header */}
        <div className="flex justify-between items-center mb-4 mr-2">
          <h2 className="text-lg font-semibold">Your Goals</h2>
          <button
            onClick={() => setAdding(true)}
            className="p-2 bg-white text-black rounded-full hover:bg-gray-200"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Goals list */}
        <div className="space-y-3">
          {adding && (
            <div className="bg-white text-gray-800 shadow-md rounded-lg p-4">
              <h3 className="text-md font-semibold mb-3">Шинэ Task</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Task Title"
                  className="w-full border p-2 rounded"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Target (тоо)"
                  className="w-full border p-2 rounded"
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Unit (ж: удаа, кг, цаг)"
                  className="w-full border p-2 rounded"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  onClick={() => setAdding(false)}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="px-3 py-1 rounded bg-orange-500 text-white hover:bg-orange-600"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {userTasks.length > 0 ? (
            userTasks.map((sub, index) => {
              const percentage = Math.min(
                (sub.progress / sub.target) * 100,
                100
              );
              const isDone = percentage >= 100;

              return (
                <div
                  key={sub._id || index}
                  className="flex items-center justify-between bg-white text-gray-800 shadow-md rounded-lg px-4 py-2"
                >
                  {/* Goal left */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-100">
                      {isDone ? (
                        <Check className="text-green-600" />
                      ) : (
                        <span className="text-xl">🔥</span>
                      )}
                    </div>
                    <div>
                      <h3
                        className={`font-semibold ${
                          isDone
                            ? "text-green-600 line-through"
                            : "text-gray-800"
                        }`}
                      >
                        {sub.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {sub.progress}
                        {sub.unit}/{sub.target}
                        {sub.unit}
                      </p>
                    </div>
                  </div>

                  {/* Goal right */}
                  <div className="flex items-center gap-2">
                    <div className="relative w-12 h-12">
                      <svg className="w-full h-full" viewBox="0 0 64 64">
                        <circle
                          className="text-gray-200"
                          strokeWidth="3"
                          stroke="currentColor"
                          fill="transparent"
                          r="22"
                          cx="32"
                          cy="32"
                        />
                        <circle
                          strokeWidth="3"
                          strokeDasharray={2 * Math.PI * 28}
                          strokeDashoffset={
                            2 *
                            Math.PI *
                            28 *
                            (1 - Math.min(percentage / 100, 1))
                          }
                          strokeLinecap="round"
                          fill="transparent"
                          r="22"
                          cx="32"
                          cy="32"
                          transform="rotate(-90 32 32)"
                          style={{ stroke: getRandomColor() }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                        {Math.round(percentage)}%
                      </div>
                    </div>

                    {/* Buttons */}
                    {!isDone && (
                      <button
                        onClick={() => handleUpdateProgress(sub)}
                        className="p-2 text-green-600 hover:bg-gray-100 rounded-full"
                      >
                        <Plus size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteSubGoal(sub._id)}
                      className="p-2 text-red-600 hover:bg-gray-100 rounded-full"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-200 text-sm italic">
              Дэд зорилго нэмээгүй байна
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default U_Dashboard;
