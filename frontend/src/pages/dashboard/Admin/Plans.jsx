import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Loader } from "lucide-react";
import Modal from "../../../components/Modal/Modal.jsx";
import { useMembershipTypeStore } from "../../../store/membershipTypeStore.js";
import CreateMembershipTypeForm from "../../../components/Membership/CreateMembershipTypeForm.jsx";
import EditMembershipTypeForm from "../../../components/Membership/EditMembershipTypeForm.jsx";

const Plans = () => {
  const { types, isLoading, getAllTypes, deleteType } =
    useMembershipTypeStore();

  const [selectedType, setSelectedType] = useState(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    getAllTypes();
  }, [getAllTypes]);

  const handleCreate = () => setCreateModalOpen(true);

  const handleEdit = (type) => {
    setSelectedType(type);
    setEditModalOpen(true);
  };

  const handleDelete = async (typeId) => {
    if (!window.confirm("Энэ төрлийг устгахдаа итгэлтэй байна уу?")) return;
    setDeletingId(typeId);
    await deleteType(typeId); // store-аас delete API дуудах
    await getAllTypes();
    setDeletingId(null);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Membership төрлүүд
          </h2>
          <p className="text-sm text-gray-500">
            Гишүүнчлэлийн төрөл удирдах хэсэг
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-md bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition flex items-center gap-2"
          onClick={handleCreate}
        >
          <Plus size={16} /> Төрөл нэмэх
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead className="bg-green-300">
            <tr className="text-blue-700 text-sm">
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Нэр</th>
              <th className="px-4 py-2 font-medium">Value</th>
              <th className="px-4 py-2 font-medium">Өдөр</th>
              <th className="px-4 py-2 font-medium text-center">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-500">
                  <Loader className="animate-spin inline-block w-5 h-5 text-blue-600" />
                </td>
              </tr>
            ) : Array.isArray(types) && types.length > 0 ? ( // ✅ шалгалт хийлээ
              types.map((type, index) => (
                <tr
                  key={type._id}
                  className="bg-white hover:bg-gray-50 rounded-lg shadow-sm"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{type.label}</td>
                  <td className="px-4 py-3">{type.value}</td>
                  <td className="px-4 py-3">{type.days}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition"
                        title="Засах"
                        onClick={() => handleEdit(type)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition flex items-center justify-center"
                        title="Устгах"
                        onClick={() => handleDelete(type._id)}
                        disabled={deletingId === type._id}
                      >
                        {deletingId === type._id ? (
                          <Loader className="animate-spin w-4 h-4" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center text-gray-500 py-6 text-sm"
                >
                  Төрөл олдсонгүй
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      >
        <CreateMembershipTypeForm onClose={() => setCreateModalOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
        {selectedType && (
          <EditMembershipTypeForm
            type={selectedType}
            onClose={() => setEditModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Plans;
