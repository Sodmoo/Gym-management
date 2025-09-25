import React, { useState, useEffect } from "react";
import { useUserStore } from "../../store/userStore";
import { Loader2 } from "lucide-react";

const EditUserForm = ({ user, onClose }) => {
  const { updateUser, isLoading, getAllUsers } = useUserStore();
  const [form, setForm] = useState({
    surname: "",
    username: "",
    email: "",
    role: "",
    gender: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        surname: user.surname,
        username: user.username,
        email: user.email,
        role: user.role,
        gender: user.gender,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUser(user._id, form);
    getAllUsers();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white  p-6 space-y-6">
      <h3 className="text-2xl font-semibold text-gray-800">Update User</h3>

      {/* Name fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Surname
          </label>
          <input
            type="text"
            name="surname"
            value={form.surname}
            onChange={handleChange}
            className="w-full mt-1 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full mt-1 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full mt-1 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Role & Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full mt-1 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="user">User</option>
            <option value="trainer">Trainer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Gender
          </label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full mt-1 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
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
          disabled={isLoading}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Updating...
            </>
          ) : (
            "Update User"
          )}
        </button>
      </div>
    </form>
  );
};

export default EditUserForm;
