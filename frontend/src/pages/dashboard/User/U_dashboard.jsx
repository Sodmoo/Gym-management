import React, { useEffect, useState } from "react";
import { useMemberStore } from "../../../store/memberStore";
import { Check, Trash2, Plus } from "lucide-react";

const Dashboard = () => {
  const {
    members,
    getAllMembers,
    isLoading,
    updateSubGoal,
    deleteSubGoal,
    addSubGoal,
  } = useMemberStore();

  const [newTask, setNewTask] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newUnit, setNewUnit] = useState("");

  useEffect(() => {
    getAllMembers();
  }, [getAllMembers]);

  if (isLoading) return <p className="p-4">Түр хүлээнэ үү...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[68%_30%] h-full gap-4">
      {/* Зүүн тал */}
      <div className="bg-white shadow-md p-6 h-full overflow-y-auto rounded-md">
        <h2 className="text-2xl font-bold mb-4">Зүүн талын блок</h2>
        <p className="text-gray-600">Статистик, график г.м байж болно.</p>
      </div>

      {/* Баруун тал */}
      <div className="bg-orange-400 h-full w-full p-4 overflow-y-auto rounded-md">
        <h2 className="pt-3 pb-3 text-white text-xl font-semibold">
          My To-Do Tasks
        </h2>
        <div className="space-y-4 w-full">
          {members.map((member) => (
            <div key={member._id} className="space-y-3 w-full">
              {member.subGoals?.length > 0 ? (
                member.subGoals.map((sub, index) => {
                  const percentage = Math.min(
                    (sub.progress / sub.target) * 100,
                    100
                  );
                  const isDone = percentage >= 100;

                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between bg-white shadow-md rounded-lg p-3 w-full ${
                        isDone ? "opacity-70" : ""
                      }`}
                    >
                      {/* Title */}
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
                                : "text-gray-700"
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

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!isDone && (
                          <button
                            onClick={() => {
                              const value = prompt(
                                "Нэмэх тоо оруул (ж: 1, 2 ...)"
                              );
                              if (value) {
                                updateSubGoal(
                                  member._id,
                                  sub._id,
                                  sub.progress + parseInt(value)
                                );
                              }
                            }}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-1"
                          >
                            <Plus size={14} /> Add
                          </button>
                        )}

                        {/* Устгах */}
                        <button
                          onClick={() => deleteSubGoal(member._id, sub._id)}
                          className="p-1.5 bg-red-100 hover:bg-red-200 rounded-full"
                        >
                          <Trash2 size={14} className="text-red-600" />
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

              {/* Create New Task Form */}
              <div className="bg-white p-3 rounded-md shadow-md mt-4">
                <h4 className="font-semibold mb-2">Шинэ Task нэмэх</h4>
                <input
                  type="text"
                  placeholder="Жишээ: Өдөрт 2л ус уух"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="w-full border p-2 rounded mb-2"
                />
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Target"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="flex-1 border p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Unit (л, цаг, удаа)"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="flex-1 border p-2 rounded"
                  />
                </div>
                <button
                  onClick={() => {
                    if (newTask && newTarget) {
                      addSubGoal(member._id, {
                        title: newTask,
                        target: newTarget,
                        unit: newUnit,
                      });
                      setNewTask("");
                      setNewTarget("");
                      setNewUnit("");
                    }
                  }}
                  className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                >
                  Create Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
