import React, { useState } from "react";
import { useUserStore } from "../../store/userStore";
import { useTrainerStore } from "../../store/trainerStore";
import { Loader2 } from "lucide-react";

const CreateUserForm = ({ onClose }) => {
  const { createUser, isLoading, getAllUsers } = useUserStore();
  const { getAllTrainers } = useTrainerStore();
  const [form, setForm] = useState({
    surname: "",
    username: "",
    email: "",
    role: "user",
    gender: "male",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createUser(form);
    if (form.role === "user") {
      await getAllUsers();
    } else if (form.role === "trainer") {
      await getAllTrainers();
    }
    onClose();
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Шинэ хэрэглэгч бүртгэх
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="surname"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Овог
            </label>
            <input
              type="text"
              name="surname"
              id="surname"
              value={form.surname}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              placeholder="Овог"
              required
            />
          </div>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Нэр
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={form.username}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              placeholder="Нэр"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Имэйл
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            placeholder="Имэйл"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Нууц үг
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Үүрэг
            </label>
            <select
              name="role"
              id="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-base text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            >
              <option value="user">User</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Хүйс
            </label>
            <select
              name="gender"
              id="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-base text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            >
              <option value="male">Эр</option>
              <option value="female">Эм</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Creating...
              </>
            ) : (
              "Create User"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserForm;
