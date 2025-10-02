import React from "react";

const GoalCard = ({ member }) => {
  return (
    <div className="bg-white shadow rounded-xl p-4 border">
      {/* Үндсэн зорилго */}
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        {member.goal || "Зорилго тодорхойлоогүй"}
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        {member.username} - {member.age} нас
      </p>

      {/* SubGoals */}
      <div className="space-y-3">
        {member.subGoals.length > 0 ? (
          member.subGoals.map((sub, index) => {
            const percentage = Math.min((sub.progress / sub.target) * 100, 100);
            return (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{sub.title}</span>
                  <span className="text-gray-500">
                    {sub.progress}/{sub.target} {sub.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded-full">
                  <div
                    className="h-3 bg-green-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 text-sm italic">
            Дэд зорилго нэмээгүй байна
          </p>
        )}
      </div>
    </div>
  );
};

export default GoalCard;
