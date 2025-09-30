import React, { useState } from "react";
import { useMembershipTypeStore } from "../../store/membershipTypeStore";
import { Loader2 } from "lucide-react";

const CreateMembershipTypeForm = ({ onClose }) => {
  const { addType, isLoading } = useMembershipTypeStore();
  const [form, setForm] = useState({ label: "", value: "", days: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addType(form);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <h3 className="text-lg font-bold text-gray-800">Төрөл нэмэх</h3>
      <input
        name="label"
        placeholder="Label"
        value={form.label}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />
      <input
        name="value"
        placeholder="Value"
        value={form.value}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="number"
        name="days"
        placeholder="Өдөр"
        value={form.days}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="px-4 py-2 border rounded"
          onClick={onClose}
        >
          Болих
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            "Хадгалах"
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateMembershipTypeForm;
