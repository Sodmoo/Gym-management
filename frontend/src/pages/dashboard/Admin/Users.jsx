import React, { useEffect, useState } from "react";
import { useUserStore } from "../../../store/userStore";
import { Pencil, Trash2, Eye } from "lucide-react";
import Modal from "../../../components/Modal";
import EditUserForm from "../../../components/Edituserform";
import DeleteUserForm from "../../../components/Deleteuserform";
import CreateUserForm from "../../../components/Createuserform";
import Showuserform from "../../../components/Showuserform";

const Users = () => {
  const { users, getAllUsers } = useUserStore();
  const [selectedUser, setSelectedUser] = useState(null);
  const [iseditModalOpen, seteditModalOpen] = useState(false);
  const [isdeleteModalOpen, setdeleteModalOpen] = useState(false);
  const [iscreateModalOpen, setcreateModalOpen] = useState(false);
  const [isshowModalOpen, setshowModalOpen] = useState(false);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    seteditModalOpen(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setdeleteModalOpen(true);
  };

  const handleCreate = () => {
    setcreateModalOpen(true);
  };

  const handleShow = (user) => {
    setSelectedUser(user);
    setshowModalOpen(true);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Хэрэглэгчид</h2>
          <p className="text-sm text-gray-500">
            Бүх хэрэглэгчдийн мэдээлэл болон үйлдлүүд.
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-md bg-green-400 text-white text-sm font-medium hover:bg-green-500 transition"
          onClick={handleCreate}
        >
          Add user
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead className="bg-green-300 ">
            <tr className="text-blue-700 text-sm">
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Овог</th>
              <th className="px-4 py-2 font-medium">Нэр</th>
              <th className="px-4 py-2 font-medium">Имэйл</th>
              <th className="px-4 py-2 font-medium">Үүрэг</th>
              <th className="px-4 py-2 font-medium">Хүйс</th>
              <th className="px-4 py-2 font-medium">Бүртгэсэн огноо</th>
              <th className="px-4 py-2 font-medium">Баталгаажсан</th>
              <th className="px-4 py-2 font-medium text-center">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr
                  key={user._id}
                  className="bg-white hover:bg-gray-50 rounded-lg shadow-sm"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{user.surname}</td>
                  <td className="px-4 py-3">{user.username}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 capitalize">{user.role}</td>
                  <td className="px-4 py-3 capitalize">{user.gender}</td>
                  <td className="px-4 py-3">
                    {new Date(user.createdAt).toLocaleDateString("mn-MN")}
                  </td>
                  <td className="px-4 py-3">
                    {user.profileCompleted ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                        title="Харах"
                        onClick={() => handleShow(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition"
                        title="Засах"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                        title="Устгах"
                        onClick={() => handleDelete(user)}
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
                  colSpan="9"
                  className="text-center text-gray-500 py-6 text-sm"
                >
                  Хэрэглэгч олдсонгүй
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Modal for Edit --- */}
      <Modal isOpen={iseditModalOpen} onClose={() => seteditModalOpen(false)}>
        {selectedUser && (
          <EditUserForm
            user={selectedUser}
            onClose={() => seteditModalOpen(false)}
          />
        )}
      </Modal>

      {/* --- Modal for Delete --- */}
      <Modal
        isOpen={isdeleteModalOpen}
        onClose={() => setdeleteModalOpen(false)}
      >
        {selectedUser && (
          <DeleteUserForm
            user={selectedUser}
            onClose={() => setdeleteModalOpen(false)}
          />
        )}
      </Modal>

      {/* --- Modal for Create --- */}
      <Modal
        isOpen={iscreateModalOpen}
        onClose={() => setcreateModalOpen(false)}
      >
        <CreateUserForm onClose={() => setcreateModalOpen(false)} />
      </Modal>

      {/* --- Modal for Show --- */}
      <Modal isOpen={isshowModalOpen} onClose={() => setshowModalOpen(false)}>
        {selectedUser && (
          <Showuserform
            user={selectedUser}
            onClose={() => setshowModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Users;
