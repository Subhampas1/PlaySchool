import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Student,
  Notice,
  AttendanceState,
  Batch,
  Homework,
} from "../types";
import DashboardLayout from "../components/DashboardLayout";
import { api } from "../services/api";
import {
  ClipboardListIcon,
  BookOpenIcon,
  BellIcon,
  UsersIcon,
} from "../components/icons";
import AttendanceTab from "./teacher/AttendanceTab";
import RosterTab from "./teacher/RosterTab";
import HomeworkTab from "./teacher/HomeworkTab";
import NoticesTab from "./teacher/NoticesTab";

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState("Attendance");
  const [students, setStudents] = useState<Student[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [attendance, setAttendance] = useState<AttendanceState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, this would fetch students assigned to this teacher.
      const [allStudents, allNotices, allBatches, allHomework] =
        await Promise.all([
          api.getStudents(),
          api.getNotices("TEACHER"),
          api.getBatches(),
          api.getHomework(),
        ]);
      setStudents(allStudents);
      setNotices(allNotices);
      setBatches(allBatches);
      setHomeworkList(allHomework);
    } catch (err) {
      setError("Failed to load dashboard data.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkAttendance = (
    studentId: string,
    status: "PRESENT" | "ABSENT"
  ) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    const records = Object.entries(attendance)
      .filter(([, status]) => status !== null)
      .map(([studentId, status]) => ({
        studentId,
        status: status as "PRESENT" | "ABSENT",
      }));

    if (records.length === 0) {
      alert("No attendance marked.");
      return;
    }

    try {
      await api.markAttendance(records, today);
      alert("Attendance submitted successfully!");
    } catch (error) {
      alert("Failed to submit attendance.");
    }
  };

  const handleCreateHomework = async (data: {
    title: string;
    description: string;
    dueDate: string;
    batch: string;
  }) => {
    try {
      await api.createHomework(data);
      alert("Homework assigned successfully!");
      fetchData(); // Refresh data
    } catch (error) {
      alert("Failed to assign homework.");
    }
  };

  const handleMarkNoticeRead = async (noticeId: string) => {
    await api.markNoticeAsRead(noticeId, user.id);
    fetchData();
  };

  const unreadNoticesCount = notices.filter(
    (n) => !n.readBy?.includes(user.id)
  ).length;

  const navItems = [
    { name: "Attendance", icon: ClipboardListIcon },
    { name: "Homework", icon: BookOpenIcon },
    {
      name: "Notices",
      icon: BellIcon,
      hasNotification: unreadNoticesCount > 0 && activeTab !== "Notices",
    },
    { name: "Roster", icon: UsersIcon },
  ];

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-8">Loading dashboard...</div>;
    }
    if (error) {
      return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    switch (activeTab) {
      case "Attendance":
        return (
          <AttendanceTab
            students={students}
            attendance={attendance}
            onMarkAttendance={handleMarkAttendance}
            onSubmitAttendance={submitAttendance}
            today={today}
            batches={batches}
          />
        );
      case "Homework":
        return (
          <HomeworkTab
            batches={batches}
            homeworkList={homeworkList}
            onCreateHomework={handleCreateHomework}
          />
        );
      case "Notices":
        return (
          <NoticesTab
            notices={notices}
            onMarkRead={handleMarkNoticeRead}
            userId={user.id}
          />
        );
      case "Roster":
        return <RosterTab students={students} />;
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
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default TeacherDashboard;
