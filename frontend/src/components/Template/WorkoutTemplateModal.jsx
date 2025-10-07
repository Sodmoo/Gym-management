import React, { useState } from "react";
import { Trash2, X } from "lucide-react";

const WorkoutTemplateModal = ({ onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [description, setDescription] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("");
  const [exercises, setExercises] = useState([]);

  const handleAddExercise = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "", rest: "" }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const handleDelete = (index) => {
    const updated = exercises.filter((_, i) => i !== index);
    setExercises(updated);
  };

  const handleSubmit = () => {
    if (!title || exercises.length === 0) {
      alert("Please fill in all fields!");
      return;
    }
    const newTemplate = {
      title,
      goal,
      description,
      durationWeeks,
      exercises,
    };
    onSave(newTemplate);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 space-y-4 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-xl font-bold">
          <span>🏋️</span>
          <h2>Create Workout Template</h2>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-semibold">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Upper Body 3-Day Split"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Goal */}
        <div>
          <label className="text-sm font-semibold">Goal</label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Upper Body Strength"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Description & Duration */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A three-day workout plan focused on upper body strength."
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            ></textarea>
          </div>
          <div>
            <label className="text-sm font-semibold">Duration (weeks)</label>
            <input
              type="number"
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(e.target.value)}
              placeholder="3"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Exercises</h3>
            <button
              onClick={handleAddExercise}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              + Add Exercise
            </button>
          </div>

          <div className="overflow-y-auto max-h-32 rounded-lg border border-gray-200">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-900 sticky top-0">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold">
                    Exercise
                  </th>
                  <th className="py-2 px-3 font-semibold">Sets</th>
                  <th className="py-2 px-3 font-semibold">Reps</th>
                  <th className="py-2 px-3 font-semibold">Rest</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {exercises.map((ex, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 px-3">
                      <input
                        className="border rounded w-full px-2 py-1"
                        value={ex.name}
                        onChange={(e) =>
                          handleChange(i, "name", e.target.value)
                        }
                        placeholder="Name"
                      />
                    </td>
                    <td className="text-center">
                      <input
                        className="border rounded w-12 text-center"
                        value={ex.sets}
                        onChange={(e) =>
                          handleChange(i, "sets", e.target.value)
                        }
                        placeholder="4"
                      />
                    </td>
                    <td className="text-center">
                      <input
                        className="border rounded w-12 text-center"
                        value={ex.reps}
                        onChange={(e) =>
                          handleChange(i, "reps", e.target.value)
                        }
                        placeholder="10"
                      />
                    </td>
                    <td className="text-center">
                      <input
                        className="border rounded w-12 text-center"
                        value={ex.rest}
                        onChange={(e) =>
                          handleChange(i, "rest", e.target.value)
                        }
                        placeholder="60"
                      />
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleDelete(i)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
        >
          Create Template
        </button>
      </div>
    </div>
  );
};

export default WorkoutTemplateModal;
