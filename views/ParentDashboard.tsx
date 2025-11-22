import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Student,
  AttendanceRecord,
  Notice,
  Homework,
  FeeInvoice,
  Batch,
} from "../types";
import DashboardLayout from "../components/DashboardLayout";
import Card from "../components/Card";
import { api } from "../services/api";
import {
  HomeIcon,
  CalendarIcon,
  BellIcon,
  BookOpenIcon,
  UserCircleIcon,
  BanknotesIcon,
} from "../components/icons";
import AttendanceCalendar from "../components/AttendanceCalendar";
import OverviewTab from "./parent/OverviewTab";
import HomeworkTab from "./parent/HomeworkTab";
import NoticesTab from "./parent/NoticesTab";
import FeesTab from "./parent/FeesTab";

interface ParentDashboardProps {
  user: User;
  onLogout: () => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({
  user,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState("Home");
  const [child, setChild] = useState<Student | null>(null);
  const [childBatchConfig, setChildBatchConfig] = useState<Batch | null>(null);
  const [parentInfo, setParentInfo] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [fees, setFees] = useState<FeeInvoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allStudents, allNotices, allBatches] = await Promise.all([
        api.getStudents(),
        api.getNotices("PARENT"),
        api.getBatches(),
      ]);
      // A real API would have a dedicated endpoint like /api/my-children
      const foundChild =
        allStudents.find((s) => s.parentId === user.id) || null;
      setChild(foundChild);

      let finalNotices = [...allNotices];

      if (foundChild) {
        // Load parent details for the child
        try {
          const parent = await api.getUserById(foundChild.parentId as any);
          setParentInfo(parent || null);
        } catch (e) {
          setParentInfo(null);
        }
        // Find batch config to get fee amount
        const batchConfig =
          allBatches.find((b) => b.name === foundChild.batch) || null;
        setChildBatchConfig(batchConfig);

        const [attendanceData, homeworkData, feesData] = await Promise.all([
          api.getAttendanceForStudent(foundChild.id),
          api.getHomework(foundChild.batch),
          api.getFeesForStudent(foundChild.id),
        ]);
        setAttendance(attendanceData);
        setHomeworkList(homeworkData);
        setFees(feesData);

        // Check for outstanding fees and inject a virtual notice
        const pendingFees = feesData.filter(
          (f) => f.status === "PENDING" || f.status === "OVERDUE"
        );
        if (pendingFees.length > 0) {
          const totalPending = pendingFees.reduce(
            (sum, f) => sum + f.amount,
            0
          );
          const reminderNotice: Notice = {
            id: "virtual-fee-reminder",
            title: "Monthly Fee Payment Reminder",
            content: `Dear Parent, please note that there are outstanding fees totaling ₹${totalPending.toLocaleString()}. Kindly make the payment at your earliest convenience to ensure uninterrupted services. Click 'Pay Now' to view details.`,
            date: new Date().toISOString().split("T")[0],
            visibility: "parents",
            priority: "urgent",
            category: "Fee Reminder",
            readBy: [], // Virtual notices are never marked as 'read' in DB, they disappear when paid
          };
          // Prepend to notices
          finalNotices.unshift(reminderNotice);
        }
      }
      setNotices(finalNotices);
    } catch (err) {
      setError("Failed to load dashboard data.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkNoticeRead = async (noticeId: string) => {
    // Virtual notices cannot be marked as read via API
    if (noticeId === "virtual-fee-reminder") return;
    await api.markNoticeAsRead(noticeId, user.id);
    fetchData(); // Refresh to update the unread notification counts
  };

  // Count unread notices for notification badge
  const unreadNoticesCount =
    notices.filter(
      (n) => !n.readBy?.includes(user.id) && n.id !== "virtual-fee-reminder"
    ).length + (notices.some((n) => n.id === "virtual-fee-reminder") ? 1 : 0);

  const navItems = [
    { name: "Home", icon: HomeIcon },
    { name: "Attendance", icon: CalendarIcon },
    { name: "Homework", icon: BookOpenIcon },
    { name: "Fees", icon: BanknotesIcon },
    {
      name: "Notices",
      icon: BellIcon,
      hasNotification: unreadNoticesCount > 0 && activeTab !== "Notices",
    },
  ];

  // Create the profile content to show inside the User Modal
  // Changed to useCallback that returns a function accepting 'closeModal'
  const getChildProfileContent = useCallback(
    (closeModal: () => void) => {
      if (!child)
        return (
          <div className="text-sm text-gray-500">
            No student linked to this account.
          </div>
        );

      // Calculate Attendance %
      const totalDays = attendance.length;
      const presentDays = attendance.filter(
        (a) => a.status === "PRESENT"
      ).length;
      const attendancePct =
        totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

      return (
        <div className="space-y-4 max-w-full">
          <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Student Details
          </h4>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm w-full">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
                  {child.name}
                </p>
                <p className="text-xs text-gray-500">ID: {child.id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                <span className="block text-xs text-gray-400">Batch</span>
                <span className="font-medium">{child.batch}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                <span className="block text-xs text-gray-400">Enrolled</span>
                <span className="font-medium">{child.enrollmentDate}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded col-span-2">
                <span className="block text-xs text-gray-400">Address</span>
                <span className="font-medium">{child.address || "—"}</span>
              </div>
            </div>
          </div>

          {/* Parent Details */}
          <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Parent Details
          </h4>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm w-full">
            {parentInfo ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs text-gray-400">Name</span>
                  <span className="font-medium">{parentInfo.name}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400">Email</span>
                  <span className="font-medium">{parentInfo.email}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400">Phone</span>
                  <span className="font-medium">{parentInfo.phone || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400">Address</span>
                  <span className="font-medium">
                    {parentInfo.address || "—"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Parent details not available.
              </div>
            )}
          </div>
          {/* Academic Progress */}
          <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Academic Progress
          </h4>
          <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-lg p-4 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-gray-600 dark:text-gray-300">
                  Attendance
                </span>
                <span className="font-bold text-sky-700 dark:text-sky-300">
                  {attendancePct}%
                </span>
              </div>
              <div className="w-full bg-white dark:bg-gray-700 rounded-full h-2 border border-sky-100 dark:border-sky-900">
                <div
                  className="bg-sky-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${attendancePct}%` }}
                ></div>
              </div>
            </div>

            {/* Mock Data for Assignments & Grade since full grading system isn't implemented yet */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-gray-600 dark:text-gray-300">
                  Assignments
                </span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  85%
                </span>
              </div>
              <div className="w-full bg-white dark:bg-gray-700 rounded-full h-2 border border-green-100 dark:border-green-900">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "85%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-gray-600 dark:text-gray-300">
                  Overall Grade
                </span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  A-
                </span>
              </div>
              <div className="w-full bg-white dark:bg-gray-700 rounded-full h-2 border border-purple-100 dark:border-purple-900">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: "90%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      );
    },
    [child, attendance]
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card className="p-3">
          <p>Loading dashboard...</p>
        </Card>
      );
    }
    if (error) {
      return (
        <Card className="p-3">
          <p className="text-red-500">{error}</p>
        </Card>
      );
    }

    switch (activeTab) {
      case "Home":
        return <OverviewTab fees={fees} />;
      case "Attendance":
        return <AttendanceCalendar attendance={attendance} />;
      case "Homework":
        return <HomeworkTab homeworkList={homeworkList} />;
      case "Fees":
        return (
          <FeesTab
            invoices={fees}
            onPaymentSuccess={fetchData}
            student={child}
            batchConfig={childBatchConfig}
          />
        );
      case "Notices":
        return (
          <NoticesTab
            notices={notices}
            onMarkRead={handleMarkNoticeRead}
            userId={user.id}
            onNavigateToFees={() => setActiveTab("Fees")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      navItems={navItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      profileContent={getChildProfileContent}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default ParentDashboard;
