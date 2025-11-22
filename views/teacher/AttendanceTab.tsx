import React, { useState, useMemo } from "react";
import { Student, Batch, AttendanceState } from "../../types";
import Card from "../../components/Card";
import { CheckCircleIcon, XCircleIcon } from "../../components/icons";

interface AttendanceTabProps {
  students: Student[];
  attendance: AttendanceState;
  onMarkAttendance: (studentId: string, status: "PRESENT" | "ABSENT") => void;
  onSubmitAttendance: () => void;
  today: string;
  batches: Batch[];
}

const AttendanceTab: React.FC<AttendanceTabProps> = ({
  students,
  attendance,
  onMarkAttendance,
  onSubmitAttendance,
  today,
  batches,
}) => {
  const [selectedBatch, setSelectedBatch] = useState<string>("All");

  const filteredStudents = useMemo(() => {
    if (selectedBatch === "All") return students;
    return students.filter((s) => s.batch === selectedBatch);
  }, [students, selectedBatch]);

  // Calculate stats for the current view
  const presentCount = filteredStudents.filter(
    (s) => attendance[s.id] === "PRESENT"
  ).length;
  const absentCount = filteredStudents.filter(
    (s) => attendance[s.id] === "ABSENT"
  ).length;
  const totalStudents = filteredStudents.length;

  return (
    <Card className="p-3">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Daily Attendance
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{today}</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="flex-1 md:flex-none min-w-[150px] px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="All">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>

          <button
            onClick={onSubmitAttendance}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-md transition-colors whitespace-nowrap"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Progress/Stats Bar */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg border border-green-200 dark:border-green-800">
          <span className="block text-lg font-bold text-green-700 dark:text-green-400">
            {presentCount}
          </span>
          Present
        </div>
        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg border border-red-200 dark:border-red-800">
          <span className="block text-lg font-bold text-red-700 dark:text-red-400">
            {absentCount}
          </span>
          Absent
        </div>
        <div className="bg-gray-100 dark:bg-gray-700/30 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <span className="block text-lg font-bold text-gray-700 dark:text-gray-300">
            {totalStudents - presentCount - absentCount}
          </span>
          Pending
        </div>
      </div>

      <div className="overflow-y-auto max-h-[65vh] pr-2 -mr-2">
        <ul className="space-y-3">
          {filteredStudents.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    attendance[s.id] === "PRESENT"
                      ? "bg-green-100 text-green-700"
                      : attendance[s.id] === "ABSENT"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {s.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {s.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {s.batch}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onMarkAttendance(s.id, "PRESENT")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    attendance[s.id] === "PRESENT"
                      ? "bg-green-500 text-white shadow-green-200 dark:shadow-none ring-2 ring-green-300 dark:ring-green-700"
                      : "bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500 dark:bg-gray-700 dark:text-gray-500"
                  }`}
                  title="Mark Present"
                >
                  <CheckCircleIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={() => onMarkAttendance(s.id, "ABSENT")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    attendance[s.id] === "ABSENT"
                      ? "bg-red-500 text-white shadow-red-200 dark:shadow-none ring-2 ring-red-300 dark:ring-red-700"
                      : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:bg-gray-700 dark:text-gray-500"
                  }`}
                  title="Mark Absent"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 dark:text-gray-500">
              No students found for this selection.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AttendanceTab;
