// ProgressHeader.jsx
import { TrendingUp } from "lucide-react";

const ProgressHeader = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-1 flex items-center space-x-2">
          <TrendingUp className="text-blue-500" size={32} />
          <span>Member Progress Tracking</span>
        </h1>
        <p className="text-gray-600 text-base">
          Monitor and analyze member fitness journeys with detailed analytics
          and progress insights
        </p>
      </div>
    </div>
  );
};

export default ProgressHeader;
