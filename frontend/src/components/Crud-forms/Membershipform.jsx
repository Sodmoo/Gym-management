import React, { useState, useEffect } from "react";
import { useUserStore } from "../../store/userStore";
import { useMembershipTypeStore } from "../../store/membershipTypeStore";
import { Loader2 } from "lucide-react";

const Membershipform = ({ user, onClose }) => {
  const { membershipassign, isLoading, getAllUsers } = useUserStore();
  const { types, getAllTypes } = useMembershipTypeStore();

  useEffect(() => {
    getAllTypes();
  }, [getAllTypes]);

  const initialEndDate = user?.membership?.endDate
    ? new Date(user.membership.endDate).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const [type, setType] = useState("");
  const [days, setDays] = useState("");
  const [endDate, setEndDate] = useState(initialEndDate);

  useEffect(() => {
    if (user?.membership?.type && types.length > 0) {
      setType(user.membership.type);
      const found = types.find((t) => t.label === user.membership.type);
      if (found) {
        setDays(found.days);
        calculateEndDate(initialEndDate, found.days);
      }
    } else {
      setType(""); // Always reset to empty for new assignment
      setDays("");
      setEndDate(initialEndDate);
    }
  }, [user, types]);

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
    const selectedLabel = e.target.value;
    setType(selectedLabel);
    const found = types.find((t) => t.label === selectedLabel);
    if (found) {
      setDays(found.days);
      calculateEndDate(initialEndDate, found.days);
    } else {
      setDays("");
      setEndDate(initialEndDate);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await membershipassign(user._id, {
      type, // now this is the label, e.g. "VIP"
      duration: days, // number of days
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
      className="bg-white p-8 space-y-6 max-w-md mx-auto"
    >
      <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">
        Гишүүнчлэл сунгах / шинэчлэх
      </h3>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Гишүүнчлэлийн төрөл
        </label>
        <select name="type" value={type} onChange={handleTypeChange} required>
          <option value="">Сонгох</option>
          {types.map((t) => (
            <option key={t._id} value={t.label}>
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
          readOnly
          className="w-full rounded-md border border-gray-300 p-2"
          required
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
          disabled={isLoading || !type}
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
