import React from "react";

const ShowEquipmentForm = ({ equipment, onClose }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 space-y-4">
      <h3 className="text-2xl font-bold text-gray-800 text-center">
        Equipment Details
      </h3>
      <div>
        <p>
          <strong>Name:</strong> {equipment.name}
        </p>
        <p>
          <strong>Type:</strong> {equipment.type}
        </p>
        <p>
          <strong>Quantity:</strong> {equipment.quantity}
        </p>
        <p>
          <strong>Status:</strong> {equipment.status}
        </p>
        <p>
          <strong>Condition:</strong> {equipment.condition}
        </p>
        <p>
          <strong>Purchase Date:</strong> {formatDate(equipment.purchaseDate)}
        </p>
        <p>
          <strong>Description:</strong> {equipment.description || "-"}
        </p>
      </div>
      <div className="flex justify-center">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ShowEquipmentForm;
