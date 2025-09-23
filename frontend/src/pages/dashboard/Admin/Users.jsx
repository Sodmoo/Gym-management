import React, { useEffect } from "react";
import { useUserStore } from "../../../store/userStore";
import { Pencil, Trash2, Eye, Loader } from "lucide-react";

const Users = () => {
  const { users, isLoading, getAllUsers } = useUserStore();

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center align-center h-130">
        <Loader className="animate-spin w-15 h-15 text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Хэрэглэгчдийн жагсаалт</h2>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full border-collapse text-sm text-left">
          <thead className="bg-green-300 text-gray-700">
            <tr>
              <th className="p-3 border-b">#</th>
              <th className="p-3 border-b">Овог</th>
              <th className="p-3 border-b">Нэр</th>
              <th className="p-3 border-b">Имэйл</th>
              <th className="p-3 border-b">Үүрэг</th>
              <th className="p-3 border-b">Хүйс</th>
              <th className="p-3 border-b">Бүртгэсэн огноо</th>
              <th className="p-3 border-b">Баталгаажсан</th>
              <th className="p-3 border-b text-center">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 bg-white">
                  <td className="p-3 border-b">{index + 1}</td>
                  <td className="p-3 border-b">{user.surname}</td>
                  <td className="p-3 border-b">{user.username}</td>
                  <td className="p-3 border-b">{user.email}</td>
                  <td className="p-3 border-b capitalize">{user.role}</td>
                  <td className="p-3 border-b capitalize">{user.gender}</td>
                  <td className="p-3 border-b">
                    {new Date(user.createdAt).toLocaleDateString("mn-MN")}
                  </td>
                  <td className="p-3 border-b capitalize">
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
                  {/* --- Үйлдлийн товчнууд --- */}
                  <td className="p-3 border-b text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                        title="Харах"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition"
                        title="Засах"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                        title="Устгах"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="p-3 text-center text-gray-500">
                  Хэрэглэгч олдсонгүй
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
