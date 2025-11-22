
import {
  User,
  Admission,
  AdmissionApplication,
  Student,
  AttendanceRecord,
  Notice,
  Batch,
  Homework,
  LandingPageConfig,
  AdmissionStatus,
  StudentBatch
} from '../types';


const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }
  return response.json();
};

export const api = {
  // === Auth ===
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  getMe: async (): Promise<User> => {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getAllUsers: async (): Promise<User[]> => {
      // Security: The real API usually doesn't expose all users publicly.
      // We return an empty array to disable the "Demo Accounts" hint box in Login.tsx
      return [];
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, { headers: getHeaders() });
      return handleResponse(response);
    } catch (e) {
      return undefined;
    }
  },

  updateUserCredentials: async (userId: string, email: string, password: string): Promise<User> => {
      const response = await fetch(`${API_URL}/users/${userId}/credentials`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ email, password })
      });
      return handleResponse(response);
  },

  // === Admissions ===
  getAdmissions: async (): Promise<Admission[]> => {
    const response = await fetch(`${API_URL}/admissions`, { headers: getHeaders() });
    return handleResponse(response);
  },

  createAdmission: async (formData: Omit<Admission, 'id' | 'status'>): Promise<Admission> => {
    const response = await fetch(`${API_URL}/admissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return handleResponse(response);
  },

  updateAdmissionStatus: async (id: string, status: AdmissionStatus): Promise<Admission> => {
    const response = await fetch(`${API_URL}/admissions/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  // === Full Applications ===
  getApplications: async (): Promise<AdmissionApplication[]> => {
    const response = await fetch(`${API_URL}/applications`, { headers: getHeaders() });
    return handleResponse(response);
  },

  createApplication: async (appData: Omit<AdmissionApplication, 'id' | 'status' | 'submittedDate'>): Promise<AdmissionApplication> => {
    const response = await fetch(`${API_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData)
    });
    return handleResponse(response);
  },

  updateApplicationStatus: async (id: string, status: AdmissionStatus): Promise<AdmissionApplication> => {
    // Reuse admission status endpoint or create specific one if needed.
    // Assuming mock logic was shared, but backend separated them.
    // Since backend didn't explicitly show updateApplicationStatus route, we skip or implement if added.
    return {} as any;
  },

  // === Enrollment ===
  checkStudentIdExists: async (id: string): Promise<boolean> => {
      const response = await fetch(`${API_URL}/students/check-id/${id}`, { headers: getHeaders() });
      return handleResponse(response);
  },

  enrollStudent: async (admissionId: string, fromType: 'enquiry' | 'application' = 'enquiry'): Promise<{ student: Student, parent: User }> => {
    const response = await fetch(`${API_URL}/enroll`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ admissionId, type: fromType })
    });
    return handleResponse(response);
  },

  // === Students ===
  getStudents: async (): Promise<Student[]> => {
    const response = await fetch(`${API_URL}/students`, { headers: getHeaders() });
    return handleResponse(response);
  },

  updateStudent: async (id: string, updates: Partial<Student>): Promise<Student> => {
    const response = await fetch(`${API_URL}/students/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
    });
    return handleResponse(response);
  },

  deleteStudent: async (id: string): Promise<void> => {
      await fetch(`${API_URL}/students/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
      });
  },

  getStudentsByBatch: async (batch: StudentBatch): Promise<Student[]> => {
    // Frontend filtering or add backend query param
    const students = await api.getStudents();
    return students.filter(s => s.batch === batch);
  },

  // === Teachers ===
  getTeachers: async (): Promise<User[]> => {
    const response = await fetch(`${API_URL}/teachers`, { headers: getHeaders() });
    return handleResponse(response);
  },

  createTeacher: async (name: string, email: string, phone?: string, address?: string): Promise<User> => {
    const response = await fetch(`${API_URL}/teachers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, phone, address })
    });
    return handleResponse(response);
  },

  updateTeacherStatus: async (teacherId: string, isActive: boolean): Promise<User> => {
    const response = await fetch(`${API_URL}/users/${teacherId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ isActive })
    });
    return handleResponse(response);
  },

  // === Attendance ===
  getAttendanceForStudent: async (studentId: string): Promise<AttendanceRecord[]> => {
    const response = await fetch(`${API_URL}/attendance/${studentId}`, { headers: getHeaders() });
    return handleResponse(response);
  },

  markAttendance: async (records: {studentId: string; status: 'PRESENT' | 'ABSENT'}[], date: string): Promise<boolean> => {
    const response = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ records, date })
    });
    const data = await handleResponse(response);
    return data.success;
  },

  // === Notices ===
  getNotices: async (role: string): Promise<Notice[]> => {
    // The backend logic handles visibility filtering based on the user ID in token usually,
    // or we can pass a query param.
    const response = await fetch(`${API_URL}/notices?role=${role}`, { headers: getHeaders() });
    return handleResponse(response);
  },

  createNotice: async (noticeData: Omit<Notice, 'id' | 'date'>): Promise<Notice> => {
    const response = await fetch(`${API_URL}/notices`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(noticeData)
    });
    return handleResponse(response);
  },

  // === Batches ===
  getBatches: async (): Promise<Batch[]> => {
    const response = await fetch(`${API_URL}/batches`, { headers: getHeaders() });
    return handleResponse(response);
  },

  createBatch: async (name: string, capacity: number, feeAmount?: number, description?: string, ageGroup?: string): Promise<Batch> => {
    const payload: any = { name, capacity };
    if (feeAmount !== undefined) payload.feeAmount = feeAmount;
    if (description !== undefined) payload.description = description;
    if (ageGroup !== undefined) payload.ageGroup = ageGroup;
    const response = await fetch(`${API_URL}/batches`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  },
  updateBatch: async (id: string, updates: Partial<Batch>): Promise<Batch> => {
    const response = await fetch(`${API_URL}/batches/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse(response);
  },

  // === Homework ===
  getHomework: async (batch?: string): Promise<Homework[]> => {
    const url = batch ? `${API_URL}/homework?batch=${batch}` : `${API_URL}/homework`;
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
  },

  createHomework: async (data: Omit<Homework, 'id' | 'submittedBy'>): Promise<Homework> => {
    const response = await fetch(`${API_URL}/homework`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  // === Landing Config ===
  getLandingConfig: async (): Promise<LandingPageConfig> => {
    const response = await fetch(`${API_URL}/landing-config`);
    return handleResponse(response);
  },

  updateLandingConfig: async (config: LandingPageConfig): Promise<LandingPageConfig> => {
    const response = await fetch(`${API_URL}/landing-config`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(config)
    });
    return handleResponse(response);
  }
  ,
  // === Fees ===
  getAllFees: async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/fees`, { headers: getHeaders() });
    return handleResponse(response);
  },

  getFeesForStudent: async (studentId: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/fees/student/${studentId}`, { headers: getHeaders() });
    return handleResponse(response);
  },

  createFeeInvoice: async (data: { studentId: string; title: string; amount: number; dueDate: string; type?: string }): Promise<any> => {
    const response = await fetch(`${API_URL}/fees`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  payFee: async (invoiceId: string): Promise<any> => {
    const response = await fetch(`${API_URL}/fees/${invoiceId}/pay`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  updateFeeStatus: async (invoiceId: string, status: string): Promise<any> => {
    const response = await fetch(`${API_URL}/fees/${invoiceId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  deleteFeeInvoice: async (invoiceId: string): Promise<void> => {
    await fetch(`${API_URL}/fees/${invoiceId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  }
};
