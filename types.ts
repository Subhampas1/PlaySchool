
export type Role = 'ADMIN' | 'TEACHER' | 'PARENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  password?: string; // In a real app, never store plain text passwords on the frontend!
  phone?: string;
  address?: string;
}

export type StudentBatch = string;

export type FeePlan = 'ANNUAL' | 'QUARTERLY' | 'MONTHLY';

export interface Student {
  id: string;
  name: string;
  batch: StudentBatch;
  parentId: string;
  enrollmentDate: string;
  fatherName?: string;
  motherName?: string;
  contactNumber?: string;
  address?: string;
  profilePicture?: string;
  feePlan?: FeePlan; // The selected payment schedule
}

export type AdmissionStatus = 'new' | 'contacted' | 'scheduled_visit' | 'accepted' | 'enrolled' | 'rejected';

// This represents a quick enquiry
export interface Admission {
  id: string;
  childName: string;
  parentName: string;
  parentEmail: string;
  status: AdmissionStatus;
  notes: string;
}

// This represents a full admission application
export interface AdmissionApplication {
  id: string;
  childName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  fatherName: string;
  motherName: string;
  fatherPhone: string;
  motherPhone: string;
  email: string;
  address: string;
  status: AdmissionStatus;
  submittedDate: string;
  assignedStudentId?: string; // Optional manual ID assignment
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';

export interface AttendanceRecord {
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
}

export type AttendanceState = Record<string, 'PRESENT' | 'ABSENT' | null>;

export interface Homework {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  batch: StudentBatch;
  submittedBy: string[]; // array of student IDs
}

export type NoticeVisibility = 'public' | 'parents' | 'teachers';
export type NoticePriority = 'normal' | 'high' | 'urgent';
export type NoticeCategory = 'General' | 'Academic' | 'Holiday' | 'Event' | 'Emergency' | 'Fee Reminder';

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  visibility: NoticeVisibility;
  priority: NoticePriority;
  category: NoticeCategory;
  readBy: string[]; // Array of User IDs who have read this notice
}

export interface Batch {
  id: string;
  name: string;
  capacity: number;
  feeAmount: number;
  description?: string;
  ageGroup?: string;
}

export interface LandingPageConfig {
  schoolName: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

export type FeeStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'PROCESSING';

export interface FeeInvoice {
  id: string;
  studentId: string;
  title: string;
  amount: number;
  dueDate: string;
  status: FeeStatus;
  paymentDate?: string;
  transactionId?: string;
  type?: FeePlan | 'OTHER';
}
