// components/WeeklyCalendar.jsx
import React from "react";
import { ArrowLeft, ArrowRight, Calendar, CheckCircle } from "lucide-react";

const WeeklyCalendar = ({
  weekDays,
  currentWeekStart,
  formatDate,
  isToday,
  getSchedulesForDay,
  onNavigateWeek,
  isMobile,
  START_HOUR,
  HOUR_HEIGHT,
  TOTAL_HOURS,
  TOTAL_HEIGHT,
  HEADER_HEIGHT,
  formatTimeLabel,
  calculateTop,
  calculateHeight,
  getEventColor,
  getEventIcon,
  getDefaultTimes,
  handleDragOver,
  handleDrop,
  handleDragStart,
  onScheduleClick,
}) => {
  // Resolve member display name from various possible shapes returned by backend
  const getMemberName = (schedule) => {
    if (!schedule) return "Гишүүн";
    console.log(schedule);

    // Prefer precomputed memberName (SchedulesPage creates this)
    if (schedule.memberName && typeof schedule.memberName === "string") {
      return schedule.memberName;
    }

    const m = schedule.member || schedule.memberId || schedule.client || null;
    if (!m) return "Гишүүн";

    // If member is a populated user object or contains a userId ref/object
    const userObj = m.userId || m.user || null;
    const candidates = [
      userObj?.username,
      userObj?.name,
      m.username,
      m.name,
      m.fullName,
      m.displayName,
      // some APIs may return nested user name fields
      userObj?.profile?.username,
      userObj?.profile?.name,
    ];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim()) return c.trim();
    }

    // final fallbacks: if m is an id string return a short id, otherwise generic label
    if (typeof m === "string") return m.slice(0, 6);
    return "Гишүүн";
  };

  return (
    <div className="bg-cyan-300 backdrop-blur-sm rounded-xl shadow-md border border-blue-500 overflow-hidden mb-5">
      <div className="px-4 py-3 border-b border-gray-100  ">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-1.5">
            <Calendar className="w-8 h-8 text-blue-600" aria-hidden="true" />
            <span>7 хоног {formatDate(currentWeekStart, "MMM do")}</span>
          </h2>
          <div className="flex items-center space-x-0.5 gap-2 bg-white rounded-md  shadow-sm">
            <button
              onClick={() => onNavigateWeek("prev")}
              className="p-3 rounded hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Өмнөх долоо хоног"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" aria-hidden="true" />
            </button>
            <button
              onClick={() => onNavigateWeek("next")}
              className="p-3 rounded hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Дараагийн долоо хоног"
            >
              <ArrowRight
                className="w-5 h-5 text-gray-600"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-hidden md:overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
        {!isMobile ? (
          // Desktop Compact Grid View
          <div
            className="w-full min-w-[950px]"
            style={{ height: `${TOTAL_HEIGHT + HEADER_HEIGHT}px` }}
          >
            <div className="flex">
              {/* Compact Time Column */}
              <div
                className="w-[70px] flex-shrink-0 bg-white border-r border-gray-100 sticky left-0 z-30"
                style={{ height: `${TOTAL_HEIGHT + HEADER_HEIGHT}px` }}
              >
                {/* Compact Time Header */}
                <div
                  className=" flex items-center justify-center font-semibold text-gray-700 text-xs border-b border-gray-100 bg-white"
                  style={{ height: `${HEADER_HEIGHT}px` }}
                >
                  Цаг
                </div>
                {/* Compact Hour Labels */}
                {Array.from({ length: TOTAL_HOURS }, (_, hourIndex) => {
                  const hour = START_HOUR + hourIndex;
                  return (
                    <div
                      key={hour}
                      className="flex items-start justify-center text-xs text-gray-500 relative border-b border-gray-100"
                      style={{ height: `${HOUR_HEIGHT}px` }}
                    >
                      <span className="leading-tight">
                        <div className="font-medium">
                          {formatTimeLabel(hour)}
                        </div>
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Days Container */}
              <div className="flex-1 min-w-0">
                <div
                  className="grid grid-cols-7 "
                  style={{ height: `${TOTAL_HEIGHT + HEADER_HEIGHT}px` }}
                >
                  {weekDays.map((day) => (
                    <div
                      key={day.toDateString()}
                      className={`relative bg-white hover:bg-gray-50/50 transition-colors duration-200 border-r border-gray-100 last:border-r-0 ${
                        isToday(day) ? " border-blue-400 bg-blue-50/30" : ""
                      }`}
                      style={{ height: "100%" }}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day)}
                    >
                      {/* Compact Day Header */}
                      <div
                        className={`sticky top-0 z-20 bg-white border-b border-gray-100 py-2 px-1.5 text-center ${
                          isToday(day) ? "bg-blue-50/50 border-blue-100" : ""
                        }`}
                        style={{ height: `${HEADER_HEIGHT}px` }}
                      >
                        <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                          {formatDate(day, "EEE")}
                        </div>
                        <div
                          className={`text-sm font-bold mt-0.5 ${
                            isToday(day) ? "text-blue-600" : "text-gray-900"
                          }`}
                        >
                          {day.getDate()}
                        </div>
                        {isToday(day) && (
                          <div className="text-[10px] text-blue-500 font-medium mt-0.5">
                            Өнөөдөр
                          </div>
                        )}
                      </div>
                      {/* Subtle Grid Lines for Hourly Divisions */}
                      {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
                        <div
                          key={`line-${i}`}
                          className="absolute inset-x-0 h-px bg-gray-200 z-0"
                          style={{
                            top: `${HEADER_HEIGHT + i * HOUR_HEIGHT}px`,
                          }}
                        />
                      ))}
                      {/* Compact Events */}
                      {getSchedulesForDay(day).map((schedule) => {
                        const { startTime, endTime } =
                          getDefaultTimes(schedule);
                        const topPx = calculateTop(startTime);
                        const heightPx = calculateHeight(startTime, endTime);
                        const EventIcon = getEventIcon(schedule.type);
                        const eventColorBase = getEventColor(
                          schedule.type
                        ).replace("bg-", "");
                        return (
                          <div
                            key={schedule._id}
                            draggable={!isMobile}
                            onDragStart={(e) => handleDragStart(e, schedule)}
                            onClick={(e) => {
                              e.stopPropagation();
                              onScheduleClick(schedule);
                            }}
                            className={`
        absolute left-1 right-1 cursor-pointer 
        transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.5 
        rounded-md p-2 flex flex-row  space-y-0.5 text-white text-xs z-10 
        bg-gradient-to-br from-${eventColorBase}-500 via-${eventColorBase}-600 to-${eventColorBase}-700
        shadow-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/50
        ${schedule.isCompleted ? "opacity-60" : ""}
      `}
                            style={{
                              top: `${topPx}px`,
                              height: `${heightPx}px`,
                              minHeight: "50px",
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={`Хуваарь: ${getMemberName(schedule)} (${
                              schedule.type
                            }) ${formatDate(
                              schedule.date,
                              "PPP"
                            )} өдөр ${startTime} - ${endTime} хүртэл${
                              schedule.isCompleted ? " (Дууссан)" : ""
                            }`}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onScheduleClick(schedule);
                              }
                            }}
                          >
                            {/* Header: Icon + Name – tightened for 50px height */}
                            <div className="flex items-center space-x-1.5 flex-shrink-0">
                              <EventIcon
                                className="w-6 h-6 flex-shrink-0 opacity-90"
                                aria-hidden="true"
                              />
                              <div className="pl-1">
                                <div className="font-semibold truncate flex-1 leading-tight text-[12px]">
                                  {getMemberName(schedule)}
                                </div>
                                {/* Time – compact for space */}
                                <div className="font-normal opacity-90 truncate leading-tight text-[10px] flex-shrink-0">
                                  {startTime} – {endTime}
                                </div>
                              </div>
                            </div>

                            {/* Full Completed Overlay – scaled for 50px */}
                            {schedule.isCompleted && (
                              <div className="absolute inset-0 bg-green-400 backdrop-blur-sm rounded-md flex flex-row gap-2 items-center justify-center z-20 ">
                                <CheckCircle
                                  className="w-7 h-7 text-green-100 "
                                  aria-hidden="true"
                                />
                                <div className="text-white text-[12px] font-bold tracking-wide uppercase">
                                  Дууссан
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Compact Mobile List View
          <div className="md:hidden space-y-3 p-3" role="list">
            {weekDays.map((day) => (
              <div
                key={day.toDateString()}
                className="bg-white rounded-lg p-3 shadow-sm border border-gray-100"
                role="listitem"
              >
                <h3
                  className="font-bold text-gray-900 mb-1.5 flex items-center space-x-1.5"
                  aria-label={`Долоо хоногийн хуваариуд ${formatDate(
                    day,
                    "EEE, MMM do"
                  )}`}
                >
                  <Calendar
                    className="w-3.5 h-3.5 text-blue-600"
                    aria-hidden="true"
                  />
                  <span>{formatDate(day, "EEE, MMM do")}</span>
                  {isToday(day) && (
                    <span className="text-blue-500 text-xs font-medium">
                      Өнөөдөр
                    </span>
                  )}
                </h3>
                <div className="space-y-1.5">
                  {getSchedulesForDay(day).map((schedule) => {
                    const EventIcon = getEventIcon(schedule.type);
                    return (
                      <div
                        key={schedule._id}
                        className={`p-2.5 rounded-md border ${getEventColor(
                          schedule.type
                        ).replace("border-", "border-")} hover:shadow-sm`}
                        role="button"
                        tabIndex={0}
                        aria-label={`Гишүүн ${getMemberName(
                          schedule
                        )} -ийн хуваарь ${
                          getDefaultTimes(schedule).startTime
                        } цагт`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            onScheduleClick(schedule);
                        }}
                        onClick={() => onScheduleClick(schedule)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${getEventColor(
                                schedule.type
                              )
                                .replace("border-", " ")
                                .replace("gradient-to-r", "bg-gradient-to-r")}`}
                            >
                              <EventIcon
                                className="w-2.5 h-2.5"
                                aria-hidden="true"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-xs">
                                {getMemberName(schedule)}
                              </div>
                              <div className="text-[10px] text-gray-600">
                                {getDefaultTimes(schedule).startTime} -{" "}
                                {getDefaultTimes(schedule).endTime}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              schedule.isCompleted
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {schedule.isCompleted ? "Дууссан" : "Хүлээгдэж буй"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
