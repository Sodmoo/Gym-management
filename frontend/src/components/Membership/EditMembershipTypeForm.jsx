import React, { useState, useEffect } from "react";
import { useMembershipTypeStore } from "../../store/membershipTypeStore";
import { Loader2 } from "lucide-react";

const EditMembershipTypeForm = ({ type, onClose }) => {
  const { updateType, isLoading, getAllTypes } = useMembershipTypeStore();
  const [form, setForm] = useState({
    label: "",
    value: "",
    days: "",
  });

  useEffect(() => {
    if (type) {
      setForm({
        label: type.label || "",
        value: type.value || "",
        days: type.days || "",
      });
    }
  }, [type]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateType(type._id, {
      ...form,
      days: Number(form.days),
    });
    if (success) {
      await getAllTypes();
      onClose();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Membership төрөл засах
        </h3>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Нэр
          </label>
          <input
            type="text"
            name="label"
            value={form.label}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Value
          </label>
          <input
            type="text"
            name="value"
            value={form.value}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Өдөр
          </label>
          <input
            type="number"
            name="days"
            value={form.days}
            onChange={handleChange}
            min={1}
            required
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
          />
        </div>
        <div className="flex gap-4 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
          >
            Болих
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Хадгалж байна...
              </>
            ) : (
              "Хадгалах"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMembershipTypeForm;
