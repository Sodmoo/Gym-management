// components/AssignStudentModal.jsx
import { useState, useEffect } from "react";
import { useTrainerStore } from "../../store/trainerStore";
import { useMemberStore } from "../../store/memberStore";

const AssignStudentModal = ({ trainer, onClose }) => {
  const { assignStudent, removeStudent } = useTrainerStore();
  const { members, getAllMembers, isLoading } = useMemberStore();
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState(null);

  let siggned = [trainer.students?.map(String) || []];

  useEffect(() => {
    getAllMembers();
  }, [getAllMembers]);

  // Filter members by search
  const filteredMembers = members.filter(
    (m) =>
      m.username?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Split members into assigned and unassigned
  const assignedMembers = filteredMembers.filter((m) =>
    trainer.students?.map(String).includes(m._id.toString())
  );

  const unassignedMembers = filteredMembers.filter(
    (m) => !trainer.students?.map(String).includes(m._id.toString())
  );

  const handleAssign = async (member) => {
    await assignStudent(trainer.userId, member.userId); // use member.userId for API
    onClose();
  };

  const handleRemove = async (member) => {
    setRemovingId(member._id);
    await removeStudent(trainer.userId, member.userId); // use member.userId for API
    setRemovingId(null);
    onClose();
  };

  return (
    <div className="p-4">
      <h2 className="font-semibold mb-2">
        {trainer.username} -д үйлчлүүлэгч нэмэх/хасах
      </h2>

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
            {/* Assigned members (green, with delete button) */}
            {assignedMembers.length > 0 && (
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
                      className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition"
                      onClick={() => handleRemove(member)}
                      disabled={removingId === member._id}
                    >
                      {removingId === member._id ? "Устгаж байна..." : "Устгах"}
                    </button>
                  </li>
                ))}
              </>
            )}

            {/* Unassigned members (red, with add button) */}
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
                      className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                      onClick={() => handleAssign(member)}
                    >
                      Нэмэх
                    </button>
                  </li>
                ))}
              </>
            )}

            {/* If no members found */}
            {assignedMembers.length === 0 && unassignedMembers.length === 0 && (
              <li className="text-center text-gray-400">Хэрэглэгч олдсонгүй</li>
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
