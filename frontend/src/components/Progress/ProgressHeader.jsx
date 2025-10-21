// ProgressHeader.jsx
import { TrendingUp } from "lucide-react";

const ProgressHeader = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-1 gap-2 flex items-center space-x-3">
          <TrendingUp className="text-blue-500" size={32} />
          <span>Гишүүдийн явцыг хянах</span>
        </h1>
        <p className="text-gray-600 text-base">
          Нарийвчилсан аналитик ашиглан гишүүдийн фитнессийн аялалыг хянаж, дүн
          шинжилгээ хийх болон ахиц дэвшлийн талаарх ойлголт
        </p>
      </div>
    </div>
  );
};

export default ProgressHeader;
