import React from "react";
import { Student, Admission, User, FeeInvoice } from "../../types";
import Card from "../../components/Card";

interface StatsTabProps {
  students: Student[];
  admissions: Admission[];
  teachers: User[];
  fees: FeeInvoice[];
  onNavigate: (tab: string) => void;
}

const StatsTab: React.FC<StatsTabProps> = ({
  students,
  admissions,
  teachers,
  fees,
  onNavigate,
}) => {
  // Count payments that are PROCESSING (waiting for approval)
  const pendingApprovals = fees.filter((f) => f.status === "PROCESSING").length;
  const newAdmissionsCount = admissions.filter(
    (a) => a.status === "new"
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div onClick={() => onNavigate("Students")} className="cursor-pointer">
        <Card className="p-3 hover:shadow-xl transition-all hover:-translate-y-1 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
            Total Students
          </h3>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {students.length}
          </p>
          <p className="text-xs text-gray-400 mt-2">Click to view roster</p>
        </Card>
      </div>

      <div onClick={() => onNavigate("Admissions")} className="cursor-pointer">
        <Card className="p-3 hover:shadow-xl transition-all hover:-translate-y-1 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
            New Admissions
          </h3>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400">
            {newAdmissionsCount}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Click to review applications
          </p>
        </Card>
      </div>

      <div onClick={() => onNavigate("Fees")} className="cursor-pointer">
        <Card className="p-3 hover:shadow-xl transition-all hover:-translate-y-1 border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
            Pending Approvals
          </h3>
          <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
            {pendingApprovals}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Payments waiting for approval
          </p>
        </Card>
      </div>

      <div onClick={() => onNavigate("Teachers")} className="cursor-pointer">
        <Card className="p-3 hover:shadow-xl transition-all hover:-translate-y-1 border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
            Teachers
          </h3>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
            {teachers.length}
          </p>
          <p className="text-xs text-gray-400 mt-2">Click to manage staff</p>
        </Card>
      </div>
    </div>
  );
};

export default StatsTab;
