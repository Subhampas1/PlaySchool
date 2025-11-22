
const mongoose = require('mongoose');

// --- User Schema (Admins, Teachers, Parents) ---
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'TEACHER', 'PARENT'], required: true },
    phone: String,
    address: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

// --- Student Schema ---
const studentSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // Manual ID like 'STUD001'
    name: { type: String, required: true },
    batch: { type: String, required: true }, 
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    enrollmentDate: { type: String, required: true }, // YYYY-MM-DD
    fatherName: String,
    motherName: String,
    contactNumber: String,
    address: String,
    profilePicture: String,
    feePlan: { type: String, enum: ['ANNUAL', 'QUARTERLY', 'MONTHLY'] } // Added Fee Plan
});

// --- Fee Invoice Schema ---
const feeInvoiceSchema = new mongoose.Schema({
    studentId: { type: String, ref: 'Student', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['PAID', 'PENDING', 'OVERDUE', 'PROCESSING'], 
        default: 'PENDING' 
    },
    paymentDate: String,
    transactionId: String,
    type: { 
        type: String, 
        enum: ['ANNUAL', 'QUARTERLY', 'MONTHLY', 'OTHER'], 
        default: 'OTHER' 
    }
});

// --- Admission Enquiry Schema ---
const admissionEnquirySchema = new mongoose.Schema({
    childName: { type: String, required: true },
    parentName: { type: String, required: true },
    parentEmail: { type: String, required: true },
    notes: String,
    status: { 
        type: String, 
        enum: ['new', 'contacted', 'scheduled_visit', 'accepted', 'enrolled', 'rejected'],
        default: 'new' 
    },
    createdAt: { type: Date, default: Date.now }
});

// --- Full Admission Application Schema ---
const admissionAppSchema = new mongoose.Schema({
    childName: { type: String, required: true },
    dob: { type: String, required: true },
    gender: String,
    fatherName: String,
    motherName: String,
    fatherPhone: String,
    motherPhone: String,
    email: { type: String, required: true },
    address: String,
    status: { 
        type: String, 
        enum: ['new', 'contacted', 'scheduled_visit', 'accepted', 'enrolled', 'rejected'],
        default: 'new' 
    },
    assignedStudentId: String,
    submittedDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
});

// --- Attendance Schema ---
const attendanceSchema = new mongoose.Schema({
    studentId: { type: String, ref: 'Student', required: true },
    date: { type: String, required: true }, 
    status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'], required: true },
    remarks: String
});
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

// --- Notice Schema ---
const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: String, required: true },
    visibility: { type: String, enum: ['public', 'parents', 'teachers'], default: 'public' },
    priority: { type: String, enum: ['normal', 'high', 'urgent'], default: 'normal' },
    category: { 
        type: String, 
        enum: ['General', 'Academic', 'Holiday', 'Event', 'Emergency', 'Fee Reminder'], 
        default: 'General' 
    },
    readBy: [{ type: String, ref: 'User' }] // Array of User IDs
});

// --- Batch Schema ---
const batchSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    capacity: { type: Number, default: 20 },
    feeAmount: { type: Number, default: 0 },
    description: String,
    ageGroup: String
});

// --- Homework Schema ---
const homeworkSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    dueDate: { type: String, required: true },
    batch: { type: String, required: true },
    submittedBy: [{ type: String, ref: 'Student' }]
});

// --- Landing Page Config Schema ---
const landingConfigSchema = new mongoose.Schema({
    schoolName: { type: String, default: 'Tiny Toddlers Playschool' },
    heroTitle: String,
    heroSubtitle: String,
    aboutTitle: String,
    aboutText: String,
    contactEmail: String,
    contactPhone: String,
    address: String
});

module.exports = {
    User: mongoose.model('User', userSchema),
    Student: mongoose.model('Student', studentSchema),
    FeeInvoice: mongoose.model('FeeInvoice', feeInvoiceSchema),
    AdmissionEnquiry: mongoose.model('AdmissionEnquiry', admissionEnquirySchema),
    AdmissionApplication: mongoose.model('AdmissionApplication', admissionAppSchema),
    Attendance: mongoose.model('Attendance', attendanceSchema),
    Notice: mongoose.model('Notice', noticeSchema),
    Batch: mongoose.model('Batch', batchSchema),
    Homework: mongoose.model('Homework', homeworkSchema),
    LandingConfig: mongoose.model('LandingConfig', landingConfigSchema)
};
