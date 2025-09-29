import React, { useState } from "react";
import { useUserStore } from "../../store/userStore";
import { Loader2 } from "lucide-react";

const MEMBERSHIP_TYPES = [
  { value: "weekly", label: "Энгийн", days: 7 },
  { value: "monthly", label: "Premium", days: 30 },
  { value: "yearly", label: "VIP", days: 365 },
];

const Membershipform = ({ user, onClose }) => {
  const { membershipassign, isLoading, getAllUsers } = useUserStore();
  const initialEndDate = user?.membership?.endDate
    ? new Date(user.membership.endDate).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const [type, setType] = useState(user?.membership?.type || "");
  const [days, setDays] = useState("");
  const [endDate, setEndDate] = useState(initialEndDate);

  // Calculate new end date from current end date
  const calculateEndDate = (baseDate, numDays) => {
    if (!baseDate || !numDays) {
      setEndDate(initialEndDate);
      return;
    }
    const base = new Date(baseDate);
    base.setDate(base.getDate() + Number(numDays));
    setEndDate(base.toISOString().slice(0, 10));
  };

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setType(selectedType);
    const found = MEMBERSHIP_TYPES.find((t) => t.value === selectedType);
    if (found) {
      setDays(found.days);
      calculateEndDate(initialEndDate, found.days);
    }
  };

  const handleDaysChange = (e) => {
    setDays(e.target.value);
    calculateEndDate(initialEndDate, e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await membershipassign(user._id, {
      type,
      endDate,
      days: Number(days),
    });
    await getAllUsers();
    onClose();
  };

  // Format a JS date as YYYY:MM:DD
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}:${month}:${day}`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8  space-y-6 max-w-md mx-auto"
    >
      <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">
        Гишүүнчлэл сунгах / шинэчлэх
      </h3>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Гишүүнчлэлийн төрөл
        </label>
        <select name="type" value={type} onChange={handleTypeChange}>
          <option value="">Сонгох</option>
          {MEMBERSHIP_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Хугацаа (өдөр)
        </label>
        <input
          type="number"
          name="days"
          min={1}
          value={days}
          onChange={handleDaysChange}
          className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          required
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Дуусах огноо
        </label>
        <input
          type="date"
          name="endDate"
          value={endDate}
          readOnly
          className="w-full rounded-md border border-gray-300 p-2 bg-gray-100"
        />
        <p className="text-xs text-gray-400 mt-1">
          Одоогийн дуусах огноо: {formatDate(initialEndDate)}
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
        >
          Болих
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
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
  );
};

export default Membershipform;
