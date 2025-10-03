import { useEffect, useState } from "react";
import { useTrainerStore } from "../../store/trainerStore";
import { useMemberStore } from "../../store/memberStore";
import { useUserStore } from "../../store/userStore";

const TrainerList = () => {
  const { trainers, isLoading, Trainers } = useTrainerStore();
  const { joinTrainer } = useMemberStore();
  const { user, fetchUser } = useUserStore();
  const [memberTrainers, setMemberTrainers] = useState([]);

  // Load trainers & user
  useEffect(() => {
    Trainers();
    fetchUser();
  }, [Trainers, fetchUser]);

  // Member-ийн trainers мэдээллийг авах
  useEffect(() => {
    if (user && user.member) {
      setMemberTrainers(user.trainers || []);
    }
  }, [user]);

  if (isLoading || !user) return <p>Түр хүлээнэ үү...</p>;

  // Join request handler
  const handleJoinTrainer = async (trainerId) => {
    try {
      await joinTrainer(trainerId, user._id); // API call
      // Pending статусыг frontend-д түр хадгалах
      setMemberTrainers((prev) => [
        ...prev,
        { _id: trainerId, confirmed: false },
      ]);
    } catch (error) {
      console.error("Failed to join trainer:", error);
    }
  };

  // Trainer-д зориулсан статусыг тодорхойлох
  const getStatus = (trainerId) => {
    const trainerInfo = memberTrainers.find(
      (t) => t._id.toString() === trainerId.toString()
    );
    if (!trainerInfo) return null; // Join товч харагдана
    return trainerInfo.confirmed ? "accepted" : "pending";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {trainers.map((trainer) => {
        const status = getStatus(trainer._id);

        return (
          <div
            key={trainer._id}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 flex items-center p-4 gap-4"
          >
            {/* Profile Image Left */}
            <div className="w-20 h-20 flex-shrink-0 rounded-full border-4 border-white shadow-lg overflow-hidden">
              <img
                src={trainer.profileImage || "/default-profile.png"}
                alt={trainer.user.username || "Trainer"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info & Stats */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">
                {trainer.user.username}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                {trainer.specialization}
              </p>

              <div className="flex gap-4 mt-2 text-gray-600 text-sm">
                <div className="flex items-center gap-1">
                  <span>🏆</span> 25
                </div>
                <div className="flex items-center gap-1">
                  <span>⭐</span> 104
                </div>
              </div>

              {/* Button */}
              <div className="mt-3">
                {status === "accepted" ? (
                  <button className="bg-green-500 text-white px-4 py-1 rounded-full">
                    Accepted
                  </button>
                ) : status === "pending" ? (
                  <button className="bg-yellow-400 text-white px-4 py-1 rounded-full">
                    Pending
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinTrainer(trainer._id)}
                    className="bg-blue-500 text-white px-4 py-1 rounded-full hover:bg-blue-600 transition"
                  >
                    Join
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TrainerList;
