import React, { useMemo } from "react";
import { AttendanceRecord, AttendanceStatus } from "../types";
import Card from "./Card";

interface AttendanceCalendarProps {
  attendance: AttendanceRecord[];
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  attendance,
}) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    attendance.forEach((rec) => {
      const day = parseInt(rec.date.split("-")[2], 10);
      map.set(`${year}-${month}-${day}`, rec.status);
    });
    return map;
  }, [attendance, year, month]);

  const statusColors: Record<AttendanceStatus, string> = {
    PRESENT: "bg-green-400 text-white",
    ABSENT: "bg-red-400 text-white",
    LATE: "bg-yellow-400 text-white",
    HALF_DAY: "bg-orange-400 text-white",
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${month}-${day}`;
      const status = attendanceMap.get(dateKey);
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();
      const dayClass = status
        ? statusColors[status]
        : "bg-white/70 dark:bg-gray-700/50";
      days.push(
        <div
          key={day}
          className={`flex items-center justify-center h-12 rounded-full ${dayClass} ${
            isToday ? "ring-2 ring-rose-400" : ""
          }`}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="p-3">
      <h3 className="text-xl font-bold mb-4">
        Attendance for {today.toLocaleString("default", { month: "long" })}
      </h3>
      <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-500 dark:text-gray-400 mb-2">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">{renderDays()}</div>
    </Card>
  );
};

export default AttendanceCalendar;
