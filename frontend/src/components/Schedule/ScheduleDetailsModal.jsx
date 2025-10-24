// components/ScheduleDetailsModal.jsx
import React, { useState, useMemo } from "react";
import {
  X,
  CheckCircle,
  Edit,
  Trash2,
  Clock,
  ChevronDown,
  Dumbbell,
  User,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  FileText,
} from "lucide-react";

const ScheduleDetailsModal = ({
  selectedSchedule,
  getDefaultTimes,
  formatDate,
  getEventColor,
  getEventIcon,
  onCloseSidebar,
  onMarkComplete,
  onEditSchedule,
  onDeleteSchedule,
  getMemberDisplayName,
  getPlanDisplayName,
}) => {
  const [activeTab, setActiveTab] = useState("member-info-time");
  const { startTime, endTime } = getDefaultTimes(selectedSchedule);
  const EventIcon = getEventIcon(selectedSchedule.type);

  console.log(selectedSchedule);

  // Compute programDay for the selected date (if full program is available)
  const programDay = useMemo(() => {
    if (
      selectedSchedule.type !== "workout" ||
      !selectedSchedule.workoutTemplateId?.program ||
      !selectedSchedule.date
    ) {
      return null;
    }

    // Weekday mapping
    const weekDayMap = {
      0: "Sunday",
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    };

    const dayOfWeek = new Date(selectedSchedule.date).getDay();
    const dayName = weekDayMap[dayOfWeek];

    // Find matching program day
    const matchingDay = selectedSchedule.workoutTemplateId.program.find(
      (day) => day.dayName === dayName
    );

    // Return if not rest day
    return matchingDay && !matchingDay.isRestDay ? matchingDay : null;
  }, [selectedSchedule]);

  // If programDay attached (from backend), use it; else compute
  const currentProgramDay = selectedSchedule.programDay || programDay;

  const memberName = getMemberDisplayName(selectedSchedule.memberId);
  const memberEmail =
    selectedSchedule.memberId?.email ||
    selectedSchedule.memberId?.userId?.email;

  const tabs = [
    { id: "member-info-time", label: "Гишүүн & Цаг", icon: User },
    { id: "workout", label: "Дасгалууд", icon: Dumbbell },
    {
      id: "trainer-notes",
      label: "Дасгалжуулагчийн Тэмдэглэл",
      icon: FileText,
    },
  ];

  const TabIcon = ({ tabId }) => {
    const tab = tabs.find((t) => t.id === tabId);
    const IconComponent = tab?.icon;
    return IconComponent ? (
      <IconComponent className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
    ) : null;
  };

  const renderSectionHeader = (icon, title) => (
    <div className="flex items-center space-x-3 mb-1">
      <div className="p-2 bg-blue-600 rounded-lg">
        {React.createElement(icon, { className: "w-6 h-6 text-white" })}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-200"
        onClick={onCloseSidebar}
        aria-hidden="true"
      />
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 md:p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
          {/* Header */}
          <div className="p-4 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 ${getEventColor(
                    selectedSchedule.type
                  )} rounded-lg`}
                >
                  {React.createElement(EventIcon, {
                    className: "w-5 h-5 text-white",
                  })}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Хуваарийн Дэлгэрэнгүй
                  </h2>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!selectedSchedule.isCompleted && (
                  <button
                    onClick={() => onMarkComplete(selectedSchedule._id)}
                    className="flex items-center space-x-2 py-1 px-4 bg-green-200 hover:bg-green-400 text-gray-800 hover:text-white  rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    aria-label="Дуусгасан гэж тэмдэглэх"
                    title="Дуусгасан гэж тэмдэглэх"
                  >
                    <CheckCircle className="w-5 h-5" aria-hidden="true" />
                    <span>Done</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onEditSchedule(selectedSchedule);
                    onCloseSidebar();
                  }}
                  className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Хуваарийг засах"
                  title="Хуваарийг засах"
                >
                  <Edit className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  onClick={() => onDeleteSchedule(selectedSchedule._id)}
                  className="p-2.5 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label="Хуваарийг устгах"
                  title="Хуваарийг устгах"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  onClick={onCloseSidebar}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Хаах"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Tab Bar */}
            <div className="border-b border-gray-200 px-0 py-0 flex-shrink-0">
              <nav
                className="flex -mx-px overflow-x-auto scrollbar-hide"
                role="tablist"
              >
                {tabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors duration-200  border-b-2 ${
                      activeTab === tab.id
                        ? "text-blue-600 border-blue-500 bg-blue-50"
                        : "text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300"
                    }`}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                  >
                    <TabIcon tabId={tab.id} />
                    <span>{tab.label}</span>
                    {index < tabs.length - 1 && (
                      <div className="absolute right-0 top-0 h-full w-px bg-gray-200" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4  scrollbar-hide">
            {activeTab === "member-info-time" && (
              <div role="tabpanel" className="space-y-2">
                {/* Member Info Card */}
                <section className="bg-cyan-50 rounded-md p-4 md:p-6 border border-gray-200">
                  {renderSectionHeader(User, "Гишүүний Мэдээлэл")}
                  <dl className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex gap-3 ">
                      <dt className="text-gray-500 font-medium">Нэр:</dt>
                      <dd className="text-gray-900 truncate">{memberName}</dd>
                    </div>
                    {memberEmail && (
                      <div className="flex gap-5">
                        <dt className="text-gray-500 font-medium">И-мэйл</dt>
                        <dd className="text-gray-900 truncate break-all">
                          {memberEmail}
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>

                {/* Time & Date Info Card */}
                <section className="bg-cyan-50 rounded-md p-4 md:p-6 border border-gray-200">
                  {renderSectionHeader(CalendarIcon, "Огноо & Цаг")}
                  <dl className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between py-2">
                      <dt className="text-gray-500 font-medium">Огноо:</dt>
                      <dd className="text-gray-900">
                        {formatDate(selectedSchedule.date, "MMM do, yyyy")}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-gray-500 font-medium">Цаг:</dt>
                      <dd className="text-gray-900">
                        {startTime} - {endTime}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-gray-500 font-medium">Төрөл:</dt>
                      <dd className="text-gray-900 capitalize">
                        {selectedSchedule.type}
                      </dd>
                    </div>
                    {selectedSchedule.planId && (
                      <div className="flex justify-between py-2">
                        <dt className="text-gray-500 font-medium">
                          Төлөвлөгөө:
                        </dt>
                        <dd className="text-gray-900 truncate">
                          {selectedSchedule.planId.title ||
                            getPlanDisplayName(selectedSchedule.planId)}
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>
              </div>
            )}

            {activeTab === "workout" && (
              <div role="tabpanel" className="space-y-6">
                {selectedSchedule.type === "workout" &&
                currentProgramDay &&
                currentProgramDay.exercises &&
                currentProgramDay.exercises.length > 0 ? (
                  <>
                    <div className="flex items-center ml-2 space-x-3 ">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Dumbbell className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {currentProgramDay.dayName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Дасгалын Програмын Өдөр
                        </p>
                      </div>
                    </div>

                    <div className="rounded-md border m-2 border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-cyan-100 text-blue-700">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                                Дасгал
                              </th>
                              <th className="px-4 py-3  text-xs font-medium  uppercase tracking-wider text-center w-25">
                                Сет
                              </th>
                              <th className="px-4 py-3  text-xs font-medium uppercase tracking-wider text-center w-25">
                                Дахилт
                              </th>
                              <th className="px-4 py-3  text-xs font-medium  uppercase tracking-wider text-center w-25">
                                Амралт(сек)
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider w-32">
                                Ангилал
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {currentProgramDay.exercises.map(
                              (exercise, idx) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-gray-50 transition-colors duration-150"
                                >
                                  <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                                    {exercise.name}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm  text-center">
                                    {exercise.sets}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm  text-center">
                                    {exercise.reps}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm  text-center">
                                    {exercise.rest || "60"}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-800">
                                      {exercise.category || "Ерөнхий"}
                                    </span>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <Dumbbell className="w-12 h-12 mx-auto text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Дасгалын Дэлгэрэнгүй Байхгүй
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                      Энэ хуваарид холбоотой дасгалын мэдээлэл байхгүй.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "trainer-notes" && (
              <div role="tabpanel" className="space-y-6">
                {/* Trainer Notes Card */}
                <section className="bg-gray-50 rounded-lg p-4 md:p-6 border border-gray-200">
                  {renderSectionHeader(FileText, "Дасгалжуулагчийн Тэмдэглэл")}
                  {selectedSchedule.note ? (
                    <div className="bg-white rounded-md p-4 py-6 border border-gray-200 overflow-auto max-h-48 scrollbar-hide prose prose-sm">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedSchedule.note}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-3">
                      <FileText className="w-8 h-8 mx-auto text-gray-300" />
                      <p className="text-sm text-gray-500">
                        Энэ хуваарид тэмдэглэл нэмэгдээгүй.
                      </p>
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Hide CSS */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};

export default ScheduleDetailsModal;
