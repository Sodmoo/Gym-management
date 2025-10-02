import React, { useEffect } from "react";
import { Users, Dumbbell, ClipboardList, GraduationCap } from "lucide-react";
import { useUserStore } from "../store/userStore.js";
import { useTrainerStore } from "../store/trainerStore.js";
import { useEquipmentStore } from "../store/equipmentStore.js";
import { useMembershipTypeStore } from "../store/membershipTypeStore.js";

const DashboardCards = () => {
  const users = useUserStore((state) => state.users || []);
  const getAllUsers = useUserStore((state) => state.getAllUsers);

  const trainers = useTrainerStore((state) => state.trainers || []);
  const getAllTrainers = useTrainerStore((state) => state.getAllTrainers);

  const equipments = useEquipmentStore((state) => state.equipment || []);
  const getAllEquipment = useEquipmentStore((state) => state.getAllEquipment);

  const types = useMembershipTypeStore((state) => state.types || []);
  const getAllTypes = useMembershipTypeStore((state) => state.getAllTypes);

  useEffect(() => {
    getAllUsers();
    getAllTrainers();
    getAllEquipment();
    getAllTypes();
  }, [getAllUsers, getAllTrainers, getAllEquipment, getAllTypes]);

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: <Users className="w-6 h-6 text-blue-600" />,
    },
    {
      title: "Equipments",
      value: equipments.length,
      icon: <Dumbbell className="w-6 h-6 text-green-600" />,
    },
    {
      title: "Trainers",
      value: trainers.length,
      icon: <GraduationCap className="w-6 h-6 text-orange-600" />,
    },
    {
      title: "Plans",
      value: types.length,
      icon: <ClipboardList className="w-6 h-6 text-purple-600" />,
    },
  ];

  const bgColors = [
    "bg-blue-300",
    "bg-green-300",
    "bg-orange-300",
    "bg-purple-300",
  ];

  const hoverColors = [
    "hover:bg-blue-100",
    "hover:bg-green-100",
    "hover:bg-orange-100",
    "hover:bg-purple-100",
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`rounded-2xl shadow-md transition flex items-center justify-between h-32 p-5 ${bgColors[index]} ${hoverColors[index]}`}
        >
          <div>
            <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">{stat.icon}</div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
