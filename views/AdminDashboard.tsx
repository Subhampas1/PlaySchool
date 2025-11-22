import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  Admission,
  Student,
  AdmissionStatus,
  Batch,
  Notice,
  NoticePriority,
  NoticeVisibility,
  FeeInvoice,
  FeeStatus,
  NoticeCategory,
} from "../types";
import DashboardLayout from "../components/DashboardLayout";
import { api } from "../services/api";
import {
  AdmissionIcon,
  UsersIcon,
  ChartIcon,
  ClipboardListIcon,
  CollectionIcon,
  MegaphoneIcon,
  GlobeIcon,
  BanknotesIcon,
} from "../components/icons";
import StatsTab from "./admin/StatsTab";
import AdmissionsTab from "./admin/AdmissionsTab";
import StudentsTab from "./admin/StudentsTab";
import TeachersTab from "./admin/TeachersTab";
import BatchesTab from "./admin/BatchesTab";
import NoticesTab from "./admin/NoticesTab";
import LandingTab from "./admin/LandingTab";
import FeesTab from "./admin/FeesTab";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("Stats");
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [fees, setFees] = useState<FeeInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [adms, studs, teachs, bchs, notifs, allFees] = await Promise.all([
        api.getAdmissions(),
        api.getStudents(),
        api.getTeachers(),
        api.getBatches(),
        api.getNotices("ADMIN"),
        api.getAllFees(),
      ]);
      setAdmissions(adms);
      setStudents(studs);
      setTeachers(teachs);
      setBatches(bchs);
      setNotices(notifs);
      setFees(allFees);
    } catch (err) {
      setError(
        "Failed to load dashboard data. Please check your connection or contact support."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (id: string, status: AdmissionStatus) => {
    try {
      await api.updateAdmissionStatus(id, status);
      fetchData(); // Refresh data after update
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const handleEnroll = async (id: string) => {
    try {
      await api.enrollStudent(id);
      fetchData(); // Refresh data after enrolling
    } catch (error) {
      alert("Failed to enroll student.");
    }
  };

  const handleCreateTeacher = async (
    name: string,
    email: string,
    phone?: string,
    address?: string
  ) => {
    try {
      const newTeacher = await api.createTeacher(name, email, phone, address);
      alert("Teacher added successfully!");
      fetchData(); // Refresh data
      return newTeacher;
    } catch (error) {
      alert("Error: Could not create teacher. The email might already exist.");
      throw error;
    }
  };

  const handleUpdateTeacherStatus = async (
    teacherId: string,
    isActive: boolean
  ) => {
    try {
      await api.updateTeacherStatus(teacherId, isActive);
      fetchData();
    } catch (error) {
      alert("Failed to update teacher status.");
    }
  };

  const handleCreateBatch = async (
    name: string,
    capacity: number,
    feeAmount: number,
    description: string,
    ageGroup: string
  ) => {
    try {
      await api.createBatch(name, capacity, feeAmount, description, ageGroup);
      alert("Batch created successfully!");
      fetchData(); // Refresh data
    } catch (error) {
      alert("Error: Could not create batch. The name might already exist.");
    }
  };

  const handleUpdateBatch = async (id: string, updates: Partial<Batch>) => {
    try {
      await api.updateBatch(id, updates);
      alert("Batch updated successfully!");
      fetchData();
    } catch (error) {
      alert("Failed to update batch.");
    }
  };

  const handleCreateNotice = async (noticeData: {
    title: string;
    content: string;
    visibility: NoticeVisibility;
    priority: NoticePriority;
    category: NoticeCategory;
  }) => {
    try {
      await api.createNotice(noticeData);
      alert("Notice created successfully!");
      fetchData();
    } catch (error) {
      alert("Error: Could not create notice.");
    }
  };

  // Fee handlers
  const handleCreateInvoice = async (data: {
    studentId: string;
    title: string;
    amount: number;
    dueDate: string;
  }) => {
    await api.createFeeInvoice(data);
    fetchData();
  };

  const handleMarkFeePaid = async (id: string) => {
    await api.payFee(id);
    fetchData();
  };

  const handleUpdateFeeStatus = async (id: string, status: FeeStatus) => {
    await api.updateFeeStatus(id, status);
    fetchData();
  };

  const navItems = [
    { name: "Stats", icon: ChartIcon },
    { name: "Admissions", icon: AdmissionIcon },
    { name: "Students", icon: UsersIcon },
    { name: "Teachers", icon: ClipboardListIcon },
    { name: "Batches", icon: CollectionIcon },
    { name: "Fees", icon: BanknotesIcon },
    { name: "Notices", icon: MegaphoneIcon },
    { name: "Landing", icon: GlobeIcon },
  ];

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-8">Loading dashboard...</div>;
    }
    if (error) {
      return <div className="text-center p-8 text-red-500">{error}</div>;
    }
    switch (activeTab) {
      case "Stats":
        return (
          <StatsTab
            students={students}
            admissions={admissions}
            teachers={teachers}
            fees={fees}
            onNavigate={setActiveTab}
          />
        );
      case "Admissions":
        return (
          <AdmissionsTab
            admissions={admissions}
            onUpdateStatus={handleUpdateStatus}
            onEnroll={handleEnroll}
          />
        );
      case "Students":
        return (
          <StudentsTab
            students={students}
            batches={batches}
            onStudentUpdated={fetchData}
          />
        );
      case "Teachers":
        return (
          <TeachersTab
            teachers={teachers}
            onCreateTeacher={handleCreateTeacher}
            onUpdateStatus={handleUpdateTeacherStatus}
          />
        );
      case "Batches":
        return (
          <BatchesTab
            batches={batches}
            onCreateBatch={handleCreateBatch}
            onUpdateBatch={handleUpdateBatch}
          />
        );
      case "Fees":
        return (
          <FeesTab
            fees={fees}
            students={students}
            onCreateInvoice={handleCreateInvoice}
            onMarkPaid={handleMarkFeePaid}
            onUpdateStatus={handleUpdateFeeStatus}
          />
        );
      case "Notices":
        return (
          <NoticesTab notices={notices} onCreateNotice={handleCreateNotice} />
        );
      case "Landing":
        return <LandingTab />;
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

export default AdminDashboard;
