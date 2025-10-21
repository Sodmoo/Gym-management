// MeasurementsTabContent.jsx
import React, { useState } from "react";
import {
  Ruler,
  Plus,
  Download,
  Image,
  LineChart,
  Trash2,
  Loader2,
  ChevronDown, // Added for "Show More" icon
} from "lucide-react";

const MeasurementsTabContent = ({
  isLoading,
  measurements,
  displayData,
  formatValue,
  formatDelta,
  getColorClass,
  handleAddMeasurement,
  handleDeleteMeasurement,
  handleExportData,
  handleViewPhotoGallery,
  handleViewTrends,
}) => {
  const [visibleCount, setVisibleCount] = useState(10); // Initial 10 rows

  const visibleData = displayData.slice(0, visibleCount);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
          <span className="text-gray-500">Хэмжилтүүдийг ачаалж байна...</span>
        </div>
      ) : measurements.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Ruler size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Хэмжилтийн өгөгдөл байхгүй байна.</p>
          <button
            onClick={handleAddMeasurement}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2 mx-auto"
          >
            <Plus size={16} />
            <span>Анхны хэмжилт нэмэх</span>
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Сүүлийн хэмжилтүүд
            </h3>
            <button
              onClick={handleAddMeasurement}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={16} />
              <span>Хэмжилт нэмэх</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Огноо
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Жин (lbs)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Өөхлөлт (%)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Булчингийн масс (lbs)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Бүсэлхий (инч)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Хүзүү (инч)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Гар (инч)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Гуя (инч)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Үйлдэл
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visibleData.map((row, index) => (
                  <tr key={row.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatValue(row.weight, "weight")}
                      </div>
                      {row.weightDelta !== undefined && (
                        <div
                          className={`text-xs ${getColorClass(
                            "weight",
                            row.weightDelta
                          )}`}
                        >
                          {formatDelta(row.weightDelta, "weight")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatValue(row.bodyFat, "bodyFat")}
                      </div>
                      {row.bodyFatDelta !== undefined && (
                        <div
                          className={`text-xs ${getColorClass(
                            "bodyFat",
                            row.bodyFatDelta
                          )}`}
                        >
                          {formatDelta(row.bodyFatDelta, "bodyFat")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatValue(row.muscleMass, "muscleMass")}
                      </div>
                      {row.muscleMassDelta !== undefined && (
                        <div
                          className={`text-xs ${getColorClass(
                            "muscleMass",
                            row.muscleMassDelta
                          )}`}
                        >
                          {formatDelta(row.muscleMassDelta, "muscleMass")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatValue(row.waist, "waist")}
                      </div>
                      {row.waistDelta !== undefined && (
                        <div
                          className={`text-xs ${getColorClass(
                            "waist",
                            row.waistDelta
                          )}`}
                        >
                          {formatDelta(row.waistDelta, "waist")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatValue(row.chest, "chest")}
                      </div>
                      {row.chestDelta !== undefined && (
                        <div
                          className={`text-xs ${getColorClass(
                            "chest",
                            row.chestDelta
                          )}`}
                        >
                          {formatDelta(row.chestDelta, "chest")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatValue(row.arms, "arms")}
                      </div>
                      {row.armsDelta !== undefined && (
                        <div
                          className={`text-xs ${getColorClass(
                            "arms",
                            row.armsDelta
                          )}`}
                        >
                          {formatDelta(row.armsDelta, "arms")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatValue(row.thighs, "thighs")}
                      </div>
                      {row.thighsDelta !== undefined && (
                        <div
                          className={`text-xs ${getColorClass(
                            "thighs",
                            row.thighsDelta
                          )}`}
                        >
                          {formatDelta(row.thighsDelta, "thighs")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteMeasurement(row.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                        title="Хэмжилтийг устгах"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Show More Button */}
          {visibleCount < displayData.length && (
            <div className="text-center py-4">
              <button
                onClick={handleShowMore}
                className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors mx-auto"
              >
                <ChevronDown size={16} />
                <span className="text-sm font-medium">
                  Цааш ({displayData.length - visibleCount} үлдсэн)
                </span>
              </button>
            </div>
          )}

          <div className="flex space-x-4 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleExportData}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Download size={16} />
              <span className="text-sm">Өгөгдөл татах</span>
            </button>
            <button
              onClick={handleViewPhotoGallery}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Image size={16} />
              <span className="text-sm">Зураг галерея</span>
            </button>
            <button
              onClick={handleViewTrends}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors ml-auto"
            >
              <LineChart size={16} />
              <span className="text-sm">Хандалт үзэх</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MeasurementsTabContent;
