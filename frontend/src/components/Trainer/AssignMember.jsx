import { useState, useEffect } from "react";
import { useTrainerStore } from "../../store/trainerStore";
import { useMemberStore } from "../../store/memberStore";

const AssignStudentModal = ({ trainer, onClose }) => {
  const { assignStudent, removeStudent, trainers, setTrainers } =
    useTrainerStore();
  const { members, getAllMembers, isLoading } = useMemberStore();
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    getAllMembers();
  }, [getAllMembers]);

  const filteredMembers = members.filter(
    (m) =>
      m.username?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const normalizeId = (id) => (id ? String(id) : null);

  const latestTrainer =
    trainers.find((t) => t.trainerId === trainer.trainerId) || trainer;

  const studentIds = latestTrainer.students?.map(normalizeId) || [];

  const assignedMembers = filteredMembers.filter((m) =>
    studentIds.includes(normalizeId(m._id))
  );

  const unassignedMembers = filteredMembers.filter(
    (m) => !studentIds.includes(normalizeId(m._id))
  );

  const handleAssign = async (member) => {
    setActionLoading(true);
    try {
      const success = await assignStudent(latestTrainer.trainerId, member._id);
      if (success) {
        // 🟢 UI-г шууд шинэчлэх
        setTrainers(
          trainers.map((t) =>
            t.trainerId === latestTrainer.trainerId
              ? { ...t, students: [...(t.students || []), member._id] }
              : t
          )
        );
      }
    } catch (error) {
      console.error("Assign failed:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (member) => {
    setRemovingId(member._id);
    try {
      const success = await removeStudent(latestTrainer.trainerId, member._id);
      if (success) {
        // 🟢 UI-г шууд шинэчлэх
        setTrainers(
          trainers.map((t) =>
            t.trainerId === latestTrainer.trainerId
              ? {
                  ...t,
                  students: t.students.filter(
                    (id) => normalizeId(id) !== normalizeId(member._id)
                  ),
                }
              : t
          )
        );
      }
    } catch (error) {
      console.error("Remove failed:", error);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="p-4">
      <h2 className="font-semibold mb-2">
        {trainer.username} -д үйлчлүүлэгч нэмэх/хасах
      </h2>

      <p className="text-sm text-gray-500 mb-2">
        Хуваарилагдсан: {assignedMembers.length} | Боломжтой:{" "}
        {unassignedMembers.length}
      </p>

      <input
        type="text"
        placeholder="Хэрэглэгч хайх..."
        className="border rounded px-3 py-2 w-full mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ul className="max-h-40 overflow-y-auto border rounded p-2 mb-3">
        {isLoading ? (
          <li className="text-center text-gray-400">Ачааллаж байна...</li>
        ) : (
          <>
            {assignedMembers.length > 0 ? (
              <>
                <li className="font-bold text-green-700 mb-1">
                  Хуваарилагдсан үйлчлүүлэгчид:
                </li>
                {assignedMembers.map((member) => (
                  <li
                    key={member._id}
                    className="px-2 py-1 rounded flex items-center justify-between mb-1 bg-green-100 text-green-700"
                  >
                    <span>
                      {member.username} ({member.email})
                      <span className="text-xs ml-2">(already assigned)</span>
                    </span>
                    <button
                      className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition disabled:opacity-50"
                      onClick={() => handleRemove(member)}
                      disabled={removingId === member._id}
                    >
                      {removingId === member._id ? "Устгаж байна..." : "Устгах"}
                    </button>
                  </li>
                ))}
              </>
            ) : (
              unassignedMembers.length > 0 && (
                <li className="text-center text-gray-400 italic mb-2">
                  Одоо хуваарилагдсан үйлчлүүлэгч байхгүй
                </li>
              )
            )}

            {unassignedMembers.length > 0 && (
              <>
                <li className="font-bold text-red-700 mb-1">
                  Хуваарилагдаагүй үйлчлүүлэгчид:
                </li>
                {unassignedMembers.map((member) => (
                  <li
                    key={member._id}
                    className="px-2 py-1 rounded flex items-center justify-between mb-1 bg-red-100 text-red-700"
                  >
                    <span>
                      {member.username} ({member.email})
                    </span>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition disabled:opacity-50"
                      onClick={() => handleAssign(member)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Нэмэж байна..." : "Нэмэх"}
                    </button>
                  </li>
                ))}
              </>
            )}

            {assignedMembers.length === 0 &&
              unassignedMembers.length === 0 &&
              !isLoading && (
                <li className="text-center text-gray-400">
                  Хэрэглэгч олдсонгүй
                </li>
              )}
          </>
        )}
      </ul>

      <div className="flex justify-end gap-2">
        <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
          Хаах
        </button>
      </div>
    </div>
  );
};

export default AssignStudentModal;
