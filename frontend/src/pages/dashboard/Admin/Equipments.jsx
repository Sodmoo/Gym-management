import React, { useEffect, useState } from "react";
import { useEquipmentStore } from "../../../store/equipmentStore";
import { Pencil, Trash2, Eye, PlusCircle } from "lucide-react";
import Modal from "../../../components/Modal/Modal.jsx";
import CreateEquipmentForm from "../../../components/Equipment-forms/CreateEquipmentForm.jsx";
import EditEquipmentForm from "../../../components/Equipment-forms/EditEquipmentForm.jsx";
import DeleteEquipmentForm from "../../../components/Equipment-forms/DeleteEquipmentForm.jsx";
import ShowEquipmentForm from "../../../components/Equipment-forms/ShowEquipmentForm.jsx";

const Equipment = () => {
  const { equipment, getAllEquipment } = useEquipmentStore();
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isShowModalOpen, setShowModalOpen] = useState(false);

  useEffect(() => {
    getAllEquipment();
  }, [getAllEquipment]);

  const handleCreate = () => setCreateModalOpen(true);
  const handleEdit = (item) => {
    setSelectedEquipment(item);
    setEditModalOpen(true);
  };
  const handleDelete = (item) => {
    setSelectedEquipment(item);
    setDeleteModalOpen(true);
  };
  const handleShow = (item) => {
    setSelectedEquipment(item);
    setShowModalOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Equipment</h2>
          <p className="text-sm text-gray-500">
            Бүх тоног төхөөрөмж болон үйлдлүүд
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-md bg-green-400 text-white text-sm font-medium hover:bg-green-500 transition flex items-center gap-1"
          onClick={handleCreate}
        >
          <PlusCircle className="w-4 h-4" /> Add Equipment
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead className="bg-gray-100">
            <tr className="text-gray-700 text-sm">
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Quantity</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Condition</th>
              <th className="px-4 py-2 font-medium">Purchase Date</th>
              <th className="px-4 py-2 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {equipment.length > 0 ? (
              equipment.map((item, index) => (
                <tr
                  key={item._id}
                  className="bg-white hover:bg-gray-50 rounded-lg shadow-sm"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.type || "-"}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.status === "available"
                          ? "bg-green-100 text-green-700"
                          : item.status === "in use"
                          ? "bg-blue-100 text-blue-700"
                          : item.status === "maintenance"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.condition}</td>
                  <td className="px-4 py-3">{formatDate(item.purchaseDate)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                        title="Show"
                        onClick={() => handleShow(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition"
                        title="Edit"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                        title="Delete"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="text-center text-gray-500 py-6 text-sm"
                >
                  Equipment not found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Modal for Create --- */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      >
        <CreateEquipmentForm onClose={() => setCreateModalOpen(false)} />
      </Modal>

      {/* --- Modal for Edit --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
        {selectedEquipment && (
          <EditEquipmentForm
            equipment={selectedEquipment}
            onClose={() => setEditModalOpen(false)}
          />
        )}
      </Modal>

      {/* --- Modal for Delete --- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      >
        {selectedEquipment && (
          <DeleteEquipmentForm
            equipment={selectedEquipment}
            onClose={() => setDeleteModalOpen(false)}
          />
        )}
      </Modal>

      {/* --- Modal for Show --- */}
      <Modal isOpen={isShowModalOpen} onClose={() => setShowModalOpen(false)}>
        {selectedEquipment && (
          <ShowEquipmentForm
            equipment={selectedEquipment}
            onClose={() => setShowModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Equipment;
