import React, { useEffect } from "react";
import { useTrainerStore } from "../../../store/trainerStore";

const T_dashboard = () => {
  const getMyTrainer = useTrainerStore((s) => s.getMyTrainer);
  const getDashboardData = useTrainerStore((s) => s.getDashboardData);

  const currentTrainer = useTrainerStore((s) => s.currentTrainer);
  const dashboardData = useTrainerStore((s) => s.dashboardData);
  const isLoading = useTrainerStore((s) => s.isLoading);

  // load trainer once on mount
  useEffect(() => {
    getMyTrainer();
  }, [getMyTrainer]);

  // when trainer is loaded, fetch dashboard numbers
  useEffect(() => {
    const trainerId =
      currentTrainer?.trainerId || currentTrainer?._id || currentTrainer?.id;
    console.log("trainerId", trainerId);
    if (trainerId) {
      getDashboardData(trainerId);
    }
  }, [currentTrainer, getDashboardData]);

  if (isLoading) return <div>Ачааллаж байна...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Trainer Dashboard</h1>

      {currentTrainer ? (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-medium">{currentTrainer.username}</h2>
          <p className="text-sm text-gray-600">
            И-мэйл: {currentTrainer.email}
          </p>
          <p className="text-sm text-gray-600">
            Үйлчлүүлэгчдийн тоо: {currentTrainer.students?.length || 0}
          </p>
          {/* show any other trainer fields */}
        </div>
      ) : (
        <div className="text-gray-500 mb-6">Тренерийн мэдээлэл олдсонгүй</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Total Members</div>
          <div className="text-2xl font-bold">
            {dashboardData?.totalMembers ?? 0}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Workouts</div>
          <div className="text-2xl font-bold">
            {dashboardData?.totalWorkouts ?? 0}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Diets</div>
          <div className="text-2xl font-bold">
            {dashboardData?.totalDiets ?? 0}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Today's Sessions</div>
          <div className="text-2xl font-bold">
            {dashboardData?.todaySessions ?? 0}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Raw response</h3>
        <pre className="bg-white p-4 rounded shadow text-sm">
          {JSON.stringify({ currentTrainer, dashboardData }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default T_dashboard;
