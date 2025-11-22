
import { 
  User, 
  Role, 
  Student, 
  Admission, 
  AdmissionApplication,
  AttendanceRecord,
  Homework, 
  Notice,
  AdmissionStatus,
  StudentBatch,
  Batch,
  NoticeVisibility,
  NoticePriority,
  NoticeCategory,
  LandingPageConfig,
  FeeInvoice,
  FeeStatus,
  FeePlan
} from '../types';

// --- MOCK DATABASE ---

// Helper to generate random passwords
const generatePassword = () => {
  return Math.random().toString(36).slice(-8);
};

const today = new Date();
const currentYear = today.getFullYear();
// If we are in Jan, Feb, Mar, the session started in the previous year
const startYear = today.getMonth() < 3 ? currentYear - 1 : currentYear;
const nextYear = startYear + 1;

let users: User[] = [
  { id: 'admin1', name: 'Admin User', email: 'admin@test.com', role: 'ADMIN', isActive: true, password: 'password123' },
  { id: 'teacher1', name: 'Alice Smith', email: 'teacher@test.com', role: 'TEACHER', isActive: true, password: 'password123', phone: '9876543210', address: '123 Teacher Lane' },
  { id: 'parent1', name: 'Bob Johnson', email: 'parent@test.com', role: 'PARENT', isActive: true, password: 'password123', phone: '9123456789', address: '456 Parent Street' },
  { id: 'teacher2', name: 'Charles Davis', email: 'teacher2@test.com', role: 'TEACHER', isActive: false, password: 'password123', phone: '9876543211', address: '789 Education Blvd' },
];

let students: Student[] = [
  { 
      id: 'stud1', 
      name: 'Johnson Jr.', 
      batch: 'Playgroup', 
      parentId: 'parent1', 
      enrollmentDate: '2023-04-01',
      fatherName: 'Bob Johnson',
      motherName: 'Mary Johnson',
      contactNumber: '9123456789',
      address: '456 Parent Street',
      feePlan: 'QUARTERLY' // Example of pre-selected plan
  },
  { 
      id: 'stud2', 
      name: 'Emily White', 
      batch: 'LKG', 
      parentId: 'parent2', 
      enrollmentDate: '2023-04-02',
      fatherName: 'John White',
      motherName: 'Sarah White',
      contactNumber: '9988776655',
      address: '321 Elm St'
  },
];

let admissions: Admission[] = [
  { id: 'adm1', childName: 'New Kid', parentName: 'New Parent', parentEmail: 'new@parent.com', status: 'new', notes: 'Eager to join.' },
  { id: 'adm2', childName: 'Another Kid', parentName: 'Another Parent', parentEmail: 'another@parent.com', status: 'accepted', notes: 'Called them, they are very interested.' },
];

let applications: AdmissionApplication[] = [
  { 
    id: 'app1', 
    childName: 'Sarah Connor', 
    dob: '2020-05-12',
    gender: 'Female',
    fatherName: 'Kyle Reese',
    motherName: 'Sarah Connor Sr',
    fatherPhone: '9876543210',
    motherPhone: '9876543211',
    email: 'sarah@sky.net',
    address: '123 Terminator Lane, Future City',
    status: 'new',
    submittedDate: '2024-07-25'
  }
];

let attendance: AttendanceRecord[] = [
    { studentId: 'stud1', date: '2024-07-20', status: 'PRESENT' },
    { studentId: 'stud1', date: '2024-07-21', status: 'ABSENT' },
];

let notices: Notice[] = [
    { id: 'n1', title: 'Summer Vacation Announcement', content: 'The school will be closed for summer vacation from August 1st to August 15th.', date: '2024-07-15', visibility: 'public', priority: 'high', category: 'Holiday', readBy: [] },
    { id: 'n2', title: 'Parent-Teacher Meeting', content: 'A parent-teacher meeting is scheduled for July 30th. Please attend.', date: '2024-07-18', visibility: 'parents', priority: 'urgent', category: 'Event', readBy: [] },
    { id: 'n3', title: 'Staff Meeting', content: 'All teachers are requested to attend a staff meeting on July 25th.', date: '2024-07-20', visibility: 'teachers', priority: 'normal', category: 'Academic', readBy: [] }
];

let batches: Batch[] = [
    { 
        id: 'b1', 
        name: 'Playgroup', 
        capacity: 20, 
        feeAmount: 15000, 
        ageGroup: '1.5 - 2.5 years',
        description: 'Focus on sensory development, motor skills, and social interaction through guided play.' 
    },
    { 
        id: 'b2', 
        name: 'LKG', 
        capacity: 25, 
        feeAmount: 18000, 
        ageGroup: '2.5 - 3.5 years',
        description: 'Introduction to alphabets, numbers, and creative arts in a structured yet fun environment.' 
    },
    { 
        id: 'b3', 
        name: 'UKG', 
        capacity: 25, 
        feeAmount: 20000, 
        ageGroup: '3.5 - 4.5 years',
        description: 'Preparing for formal schooling with foundational literacy, numeracy, and confidence building.' 
    },
];

let homeworks: Homework[] = [
    { id: 'hw1', title: 'Draw a Family Tree', description: 'Draw your family tree and color it.', dueDate: '2024-08-01', batch: 'Playgroup', submittedBy: [] },
    { id: 'hw2', title: 'Alphabet Practice', description: 'Write A-Z in capital letters.', dueDate: '2024-08-02', batch: 'LKG', submittedBy: [] },
];

// Dynamic dates for mock data to ensure they appear in the current session logic
let feeInvoices: FeeInvoice[] = [
    { id: 'inv001', studentId: 'stud1', title: 'Tuition Fee - Q1', amount: 3750, dueDate: `${startYear}-04-15`, status: 'PAID', paymentDate: `${startYear}-04-10`, transactionId: 'TXN123456', type: 'QUARTERLY' },
    { id: 'inv002', studentId: 'stud1', title: 'Tuition Fee - Q2', amount: 3750, dueDate: `${startYear}-07-01`, status: 'PAID', paymentDate: `${startYear}-06-28`, transactionId: 'TXN123457', type: 'QUARTERLY' },
    { id: 'inv003', studentId: 'stud1', title: 'Tuition Fee - Q3', amount: 3750, dueDate: `${startYear}-10-01`, status: 'OVERDUE', type: 'QUARTERLY' },
    { id: 'inv004', studentId: 'stud1', title: 'Tuition Fee - Q4', amount: 3750, dueDate: `${nextYear}-01-01`, status: 'PENDING', type: 'QUARTERLY' },
];

let landingConfig: LandingPageConfig = {
  schoolName: 'Tiny Toddlers Playschool',
  heroTitle: 'A Playful Start for \n a Bright Future',
  heroSubtitle: 'Welcome to Tiny Toddlers Playschool, where learning is an adventure! We provide a nurturing and fun environment for your little ones to grow and shine.',
  aboutTitle: 'About Our School',
  aboutText: 'Tiny Toddlers Playschool is dedicated to fostering a love for learning in a safe, nurturing, and fun environment. We believe every child is unique and deserves the best start in life.',
  contactEmail: 'admin@tinytoddlers.com',
  contactPhone: '+91 98765 43210',
  address: 'Ashram Rd, near Sri R K Mahila College, New Barganda, Giridih, Jharkhand 815302'
};


// --- MOCK API IMPLEMENTATION ---

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  // === Auth ===
  login: async (email: string, password_param: string): Promise<{ user: User; token: string }> => {
    await delay(500);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('User not found.');
    }
    // Inactive teachers cannot log in
    if (user.role === 'TEACHER' && !user.isActive) {
      throw new Error('Your account is inactive. Please contact the administrator.');
    }
    // Check password
    if (user.password !== password_param) {
        throw new Error('Invalid email or password.');
    }
    // In a real app, the token would be a JWT
    const token = `mock-token-for-${user.id}`;
    return { user, token };
  },
  
  getMe: async (): Promise<User> => {
    await delay(100);
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error("No session found");
    const userId = token.replace('mock-token-for-', '');
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error("Invalid session token");
    return user;
  },

  getUserById: async (id: string): Promise<User | undefined> => {
    await delay(50);
    return users.find(u => u.id === id);
  },
  
  updateUserCredentials: async (userId: string, email: string, password: string): Promise<User> => {
      await delay(400);
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error('User not found');

      // Check if email is taken by another user
      const emailExists = users.some(u => u.id !== userId && u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) throw new Error('Email is already in use by another account');

      users[userIndex] = {
          ...users[userIndex],
          email,
          password
      };

      return { ...users[userIndex] };
  },

  // === Data Fetching & Mutations ===
  getAllUsers: async (): Promise<User[]> => {
    await delay(200);
    return users;
  },
  
  // --- Enquiries ---
  getAdmissions: async (): Promise<Admission[]> => {
    await delay(300);
    return [...admissions];
  },
  createAdmission: async (formData: Omit<Admission, 'id' | 'status'>): Promise<Admission> => {
    await delay(500);
    const newAdmission: Admission = {
        ...formData,
        id: `adm${Date.now()}`,
        status: 'new'
    };
    admissions.push(newAdmission);
    return newAdmission;
  },
  updateAdmissionStatus: async (id: string, status: AdmissionStatus): Promise<Admission> => {
    await delay(200);
    const admission = admissions.find(a => a.id === id);
    if (!admission) throw new Error('Admission not found');
    admission.status = status;
    return { ...admission };
  },

  // --- Full Applications ---
  getApplications: async (): Promise<AdmissionApplication[]> => {
    await delay(300);
    return [...applications];
  },
  createApplication: async (appData: Omit<AdmissionApplication, 'id' | 'status' | 'submittedDate'>): Promise<AdmissionApplication> => {
    await delay(600);
    const newApp: AdmissionApplication = {
      ...appData,
      id: `app${Date.now()}`,
      status: 'new',
      submittedDate: new Date().toISOString().split('T')[0]
    };
    applications.push(newApp);
    return newApp;
  },
  updateApplicationStatus: async (id: string, status: AdmissionStatus): Promise<AdmissionApplication> => {
    await delay(200);
    const app = applications.find(a => a.id === id);
    if (!app) throw new Error('Application not found');
    app.status = status;
    return { ...app };
  },

  checkStudentIdExists: async (id: string): Promise<boolean> => {
    await delay(300); // Simulating network latency
    return students.some(s => s.id.toLowerCase() === id.toLowerCase());
  },

  enrollStudent: async (admissionId: string, fromType: 'enquiry' | 'application' = 'enquiry'): Promise<{ student: Student, parent: User }> => {
    await delay(700);
    
    let childName = '';
    let parentName = '';
    let parentEmail = '';
    let itemToUpdate: any = null;
    let manualId: string | undefined;
    
    // Extra details
    let fatherName = '';
    let motherName = '';
    let contactNumber = '';
    let address = '';

    if (fromType === 'enquiry') {
        const admission = admissions.find(a => a.id === admissionId);
        if (!admission) throw new Error('Admission enquiry not found');
        childName = admission.childName;
        parentName = admission.parentName;
        parentEmail = admission.parentEmail;
        itemToUpdate = admission;
        // Enquiries have limited info
        fatherName = admission.parentName;
    } else {
        const app = applications.find(a => a.id === admissionId);
        if (!app) throw new Error('Application not found');
        childName = app.childName;
        parentName = app.fatherName || app.motherName;
        parentEmail = app.email;
        itemToUpdate = app;
        manualId = app.assignedStudentId ? app.assignedStudentId.trim() : undefined;
        
        // Full details from application
        fatherName = app.fatherName;
        motherName = app.motherName;
        contactNumber = app.fatherPhone || app.motherPhone;
        address = app.address;
    }

    // Check Manual ID Uniqueness (Case Insensitive)
    if (manualId && students.some(s => s.id.toLowerCase() === manualId!.toLowerCase())) {
        throw new Error(`Student ID '${manualId}' is already assigned to another student.`);
    }

    // Create parent account if it doesn't exist
    let parent = users.find(u => u.email === parentEmail);
    if (!parent) {
        parent = {
            id: `user${Date.now()}`,
            name: parentName,
            email: parentEmail,
            role: 'PARENT',
            isActive: true,
            password: generatePassword(), // Generate password for new parent
            phone: contactNumber,
            address: address
        };
        users.push(parent);
    }
    
    // Assign Batch - For now defaulting to Playgroup, can be logic based on age
    const defaultBatchName = 'Playgroup';
    
    // Create student
    const newStudent: Student = {
        id: manualId || `stud${Date.now()}`,
        name: childName,
        batch: defaultBatchName, 
        parentId: parent.id,
        enrollmentDate: new Date().toISOString().split('T')[0],
        fatherName,
        motherName,
        contactNumber,
        address,
        // feePlan: undefined // Starts undefined, parent selects it in dashboard
    };
    students.push(newStudent);
    
    if (itemToUpdate) itemToUpdate.status = 'enrolled';

    // NOTE: We no longer auto-create an "Annual Fee" invoice here.
    // The parent must select a payment plan (Annual, Quarterly, Monthly) in the dashboard first.
    
    return { student: newStudent, parent };
  },
  getStudents: async (): Promise<Student[]> => {
    await delay(300);
    return [...students];
  },
  updateStudent: async (id: string, updates: Partial<Student>): Promise<Student> => {
    await delay(400);
    const index = students.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Student not found');
    
    students[index] = { ...students[index], ...updates };
    return { ...students[index] };
  },
  deleteStudent: async (id: string): Promise<void> => {
    await delay(400);
    const index = students.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Student not found');
    students.splice(index, 1);
  },
  getStudentsByBatch: async (batch: StudentBatch): Promise<Student[]> => {
    await delay(200);
    return students.filter(s => s.batch === batch);
  },
  getTeachers: async (): Promise<User[]> => {
    await delay(200);
    return users.filter(u => u.role === 'TEACHER');
  },
  createTeacher: async (name: string, email: string, phone?: string, address?: string): Promise<User> => {
    await delay(500);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email already exists');
    }
    const newTeacher: User = {
        id: `user${Date.now()}`,
        name,
        email,
        role: 'TEACHER',
        isActive: true, // Teachers are active by default
        password: generatePassword(), // Generate password for new teacher
        phone,
        address
    };
    users.push(newTeacher);
    return newTeacher;
  },
  updateTeacherStatus: async (teacherId: string, isActive: boolean): Promise<User> => {
    await delay(300);
    const teacher = users.find(u => u.id === teacherId && u.role === 'TEACHER');
    if (!teacher) throw new Error('Teacher not found');
    teacher.isActive = isActive;
    return { ...teacher };
  },
  getAttendanceForStudent: async (studentId: string): Promise<AttendanceRecord[]> => {
    await delay(400);
    return attendance.filter(a => a.studentId === studentId);
  },
  markAttendance: async (records: {studentId: string; status: 'PRESENT' | 'ABSENT'}[], date: string): Promise<boolean> => {
    await delay(600);
    records.forEach(record => {
        // Remove any existing record for this student on this date
        const existingIndex = attendance.findIndex(a => a.studentId === record.studentId && a.date === date);
        if (existingIndex > -1) {
            attendance.splice(existingIndex, 1);
        }
        // Add the new record
        attendance.push({ ...record, date });
    });
    return true;
  },
  getNotices: async (role: Role): Promise<Notice[]> => {
    await delay(300);
    return notices.filter(n => {
        if (n.visibility === 'public') return true;
        if (role === 'ADMIN') return true;
        if (role === 'PARENT' && n.visibility === 'parents') return true;
        if (role === 'TEACHER' && (n.visibility === 'teachers' || n.visibility === 'parents')) return true;
        return false;
    });
  },
  createNotice: async (noticeData: Omit<Notice, 'id' | 'date' | 'readBy'>): Promise<Notice> => {
    await delay(500);
    const newNotice: Notice = {
        ...noticeData,
        id: `n${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        readBy: []
    };
    notices.push(newNotice);
    return newNotice;
  },
  markNoticeAsRead: async (noticeId: string, userId: string): Promise<void> => {
    await delay(300);
    const notice = notices.find(n => n.id === noticeId);
    if (!notice) throw new Error('Notice not found');
    
    if (!notice.readBy.includes(userId)) {
        notice.readBy.push(userId);
    }
  },
  getBatches: async (): Promise<Batch[]> => {
    await delay(100);
    return [...batches];
  },
  createBatch: async (name: string, capacity: number, feeAmount: number, description: string, ageGroup: string): Promise<Batch> => {
    await delay(400);
    if (batches.some(b => b.name.toLowerCase() === name.toLowerCase())) {
        throw new Error('Batch name already exists');
    }
    const newBatch: Batch = {
        id: `b${Date.now()}`,
        name,
        capacity,
        feeAmount,
        description,
        ageGroup
    };
    batches.push(newBatch);
    return newBatch;
  },
  updateBatch: async (id: string, updates: Partial<Batch>): Promise<Batch> => {
      await delay(400);
      const index = batches.findIndex(b => b.id === id);
      if (index === -1) throw new Error('Batch not found');
      batches[index] = { ...batches[index], ...updates };
      return { ...batches[index] };
  },
  getHomework: async (batch?: string): Promise<Homework[]> => {
      await delay(300);
      if (batch) {
          return homeworks.filter(h => h.batch === batch);
      }
      return [...homeworks];
  },
  createHomework: async (data: Omit<Homework, 'id' | 'submittedBy'>): Promise<Homework> => {
      await delay(500);
      const newHomework: Homework = {
          ...data,
          id: `hw${Date.now()}`,
          submittedBy: []
      };
      homeworks.push(newHomework);
      return newHomework;
  },
  // --- Fees ---
  getAllFees: async (): Promise<FeeInvoice[]> => {
      await delay(300);
      return [...feeInvoices];
  },
  getFeesForStudent: async (studentId: string): Promise<FeeInvoice[]> => {
      await delay(300);
      return feeInvoices.filter(inv => inv.studentId === studentId);
  },
  createFeeInvoice: async (data: Omit<FeeInvoice, 'id' | 'status' | 'paymentDate' | 'transactionId'>): Promise<FeeInvoice> => {
      await delay(500);
      const newInvoice: FeeInvoice = {
          ...data,
          id: `inv${Date.now()}`,
          status: 'PENDING',
          type: data.type || 'OTHER'
      };
      feeInvoices.push(newInvoice);
      return newInvoice;
  },
  payFee: async (invoiceId: string): Promise<FeeInvoice> => {
      await delay(1500); // Simulate transaction processing time
      const invoice = feeInvoices.find(inv => inv.id === invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      
      // Changed to PROCESSING to support approval workflow
      invoice.status = 'PROCESSING';
      invoice.paymentDate = new Date().toISOString().split('T')[0];
      invoice.transactionId = `TXN${Date.now()}`;
      
      return { ...invoice };
  },
  updateFeeStatus: async (invoiceId: string, status: FeeStatus): Promise<FeeInvoice> => {
      await delay(400);
      const invoice = feeInvoices.find(inv => inv.id === invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      
      invoice.status = status;
      
      // If moving back to PENDING or OVERDUE, clear payment details
      if (status === 'PENDING' || status === 'OVERDUE') {
          invoice.paymentDate = undefined;
          invoice.transactionId = undefined;
      } 
      // If moving to PAID or PROCESSING and no date exists, add one
      else if ((status === 'PAID' || status === 'PROCESSING') && !invoice.paymentDate) {
          invoice.paymentDate = new Date().toISOString().split('T')[0];
          invoice.transactionId = invoice.transactionId || `MANUAL-${Date.now()}`;
      }
      
      return { ...invoice };
  },
  deleteFeeInvoice: async (invoiceId: string): Promise<void> => {
      await delay(400);
      const index = feeInvoices.findIndex(inv => inv.id === invoiceId);
      if (index === -1) throw new Error('Invoice not found');
      feeInvoices.splice(index, 1);
  },
  // setFeePlan: async (studentId: string, plan: FeePlan): Promise<FeeInvoice[]> => {
  //    // Deprecated: We now allow selecting plan at payment time dynamically in UI
  //    return [];
  // },

  // --- Landing Page Config ---
  getLandingConfig: async (): Promise<LandingPageConfig> => {
      await delay(100);
      return { ...landingConfig };
  },
  updateLandingConfig: async (config: LandingPageConfig): Promise<LandingPageConfig> => {
      await delay(500);
      landingConfig = { ...config };
      return { ...landingConfig };
  }
};
