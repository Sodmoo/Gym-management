import React, { useState } from "react";
import { useUserStore } from "../../store/userStore";
import { Loader2, Trash2 } from "lucide-react";
import { useTrainerStore } from "../../store/trainerStore";

const DeleteUserForm = ({ user, onClose }) => {
  const { deleteUser, isLoading, getAllUsers } = useUserStore();
  const { getAllTrainers } = useTrainerStore();
  const [confirmEmail, setConfirmEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (confirmEmail !== user.email) {
      alert("⚠️ Email таарахгүй байна!");
      return;
    }
    await deleteUser(user._id);
    if (user.role === "trainer") {
      await getAllTrainers();
    } else if (user.role === "user") {
      await getAllUsers();
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 space-y-6">
      <h3 className="text-2xl font-semibold text-red-600 flex items-center gap-2">
        <Trash2 size={22} /> Delete User
      </h3>

      <p className="text-gray-700">
        Та <span className="font-semibold">{user.username}</span> хэрэглэгчийг
        устгах гэж байна. Энэ үйлдэл нь{" "}
        <strong className="text-red-500">буцаах боломжгүй</strong>.
      </p>

      {/* Confirmation field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Баталгаажуулахын тулд хэрэглэгчийн имэйл оруулна уу
        </label>
        <input
          type="email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          placeholder={user.email}
          className="w-full mt-1 rounded-md border border-gray-300 p-2 focus:border-red-500 focus:ring-1 focus:ring-red-500"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading || confirmEmail !== user.email}
          className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Deleting...
            </>
          ) : (
            "Delete User"
          )}
        </button>
      </div>
    </form>
  );
};

export default DeleteUserForm;
