import React, { useState } from "react";
import { useEquipmentStore } from "../../store/equipmentStore.js";
import { Loader2 } from "lucide-react";

const CreateEquipmentForm = ({ onClose }) => {
  const { addEquipment, isLoading, getAllEquipment } = useEquipmentStore();
  const [form, setForm] = useState({
    name: "",
    type: "cardio",
    quantity: 1,
    condition: "good",
    status: "available",
    purchaseDate: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await addEquipment({
      ...form,
      quantity: Number(form.quantity),
      purchaseDate: form.purchaseDate || null,
    });
    if (success) {
      await getAllEquipment();
      onClose();
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Шинэ Equipment нэмэх
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Treadmill"
              required
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Type
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            >
              <option value="cardio">Cardio</option>
              <option value="strength">Strength</option>
              <option value="flexibility">Flexibility</option>
              <option value="balance">Balance</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              min={1}
              required
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Condition
            </label>
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            >
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            >
              <option value="available">Available</option>
              <option value="in use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="out of order">Out of Order</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={form.purchaseDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional notes"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
          />
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
              "Add Equipment"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEquipmentForm;
