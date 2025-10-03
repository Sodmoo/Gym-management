import React from "react";
import TrainerList from "../../../components/Trainer/TrainerList";
import { useUserStore } from "../../../store/userStore";
import { useEffect } from "react";

const Trainer = () => {
  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  if (!user) return <p>Түр хүлээнэ үү...</p>;
  return (
    <div>
      <TrainerList memberId={user._id} />
    </div>
  );
};

export default Trainer;
