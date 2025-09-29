import React from "react";
import { useEquipmentStore } from "../../store/equipmentStore";

const DeleteEquipmentForm = ({ equipment, onClose }) => {
  const { deleteEquipment } = useEquipmentStore();

  const handleDelete = async () => {
    const success = await deleteEquipment(equipment._id);
    if (success) onClose();
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 text-center">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Delete</h3>
      <p className="mb-6 text-gray-600">
        Are you sure you want to delete <strong>{equipment.name}</strong>?
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteEquipmentForm;
