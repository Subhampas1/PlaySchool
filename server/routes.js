
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const {
    User, Student, AdmissionEnquiry, AdmissionApplication,
    Attendance, Notice, Batch, Homework, LandingConfig, FeeInvoice
} = require('./models');

// --- Middleware ---
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

const generateId = () => Math.random().toString(36).slice(-8);

// --- AUTH ROUTES ---

router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Debug: log login attempts (mask password length only)
        try { console.log(`[AUTH] Login attempt for email=${email} passwordLength=${password ? password.length : 0}`); } catch (e) {}
        const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });

        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        const isSeedMatch = password === user.password;

        if (!isMatch && !isSeedMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (user.role === 'TEACHER' && !user.isActive) {
            return res.status(403).json({ message: 'Account inactive' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const userObj = user.toObject();
        delete userObj.password;

        res.json({ token, user: { ...userObj, id: userObj._id } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Debug: list users (no passwords) - local dev only
router.get('/_debug/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, isActive: u.isActive })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/auth/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ ...user.toObject(), id: user._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- USERS ---

router.get('/teachers', auth, async (req, res) => {
    const teachers = await User.find({ role: 'TEACHER' }).select('-password');
    res.json(teachers.map(t => ({ ...t.toObject(), id: t._id })));
});

router.post('/teachers', auth, async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email exists' });

        const passwordRaw = generateId();
        const hashedPassword = await bcrypt.hash(passwordRaw, 10);

        const teacher = new User({
            name, email, password: hashedPassword, role: 'TEACHER', phone, address, isActive: true
        });
        await teacher.save();

        const response = teacher.toObject();
        response.password = passwordRaw;
        res.json({ ...response, id: response._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/users/:id/status', auth, async (req, res) => {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    res.json(user);
});

router.put('/users/:id/credentials', auth, async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, { email, password: hashedPassword }, { new: true });
    const resObj = user.toObject();
    resObj.password = password;
    res.json({ ...resObj, id: resObj._id });
});

router.get('/users/:id', auth, async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if(!user) return res.status(404).json({message: "User not found"});
    res.json({ ...user.toObject(), id: user._id });
});

// --- STUDENTS ---

router.get('/students', auth, async (req, res) => {
    const students = await Student.find();
    res.json(students.map(s => ({ ...s.toObject(), id: s._id })));
});

router.put('/students/:id', auth, async (req, res) => {
    try {
        const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ ...updated.toObject(), id: updated._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/students/:id', auth, async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

router.get('/students/check-id/:id', async (req, res) => {
    const exists = await Student.exists({ _id: req.params.id });
    res.json(!!exists);
});

// --- FEES ---

router.get('/fees', auth, async (req, res) => {
    const fees = await FeeInvoice.find();
    res.json(fees.map(f => ({ ...f.toObject(), id: f._id })));
});

router.get('/fees/student/:studentId', auth, async (req, res) => {
    const fees = await FeeInvoice.find({ studentId: req.params.studentId });
    res.json(fees.map(f => ({ ...f.toObject(), id: f._id })));
});

router.post('/fees', auth, async (req, res) => {
    try {
        const invoice = new FeeInvoice({
            ...req.body,
            status: 'PENDING',
            type: req.body.type || 'OTHER'
        });
        await invoice.save();
        res.json({ ...invoice.toObject(), id: invoice._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/fees/:id/pay', auth, async (req, res) => {
    try {
        // Payment simulation: Move status to PROCESSING
        const invoice = await FeeInvoice.findByIdAndUpdate(req.params.id, {
            status: 'PROCESSING',
            paymentDate: new Date().toISOString().split('T')[0],
            transactionId: `TXN${Date.now()}`
        }, { new: true });

        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json({ ...invoice.toObject(), id: invoice._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/fees/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        let update = { status };

        // Logic to handle date/txn clearing or setting
        if (status === 'PENDING' || status === 'OVERDUE') {
            update = { ...update, paymentDate: null, transactionId: null };
        } else if ((status === 'PAID' || status === 'PROCESSING')) {
             // Only set date if not already set
             const current = await FeeInvoice.findById(req.params.id);
             if(current && !current.paymentDate) {
                 update = { ...update, paymentDate: new Date().toISOString().split('T')[0], transactionId: `MANUAL-${Date.now()}` };
             }
        }

        const invoice = await FeeInvoice.findByIdAndUpdate(req.params.id, update, { new: true });
        res.json({ ...invoice.toObject(), id: invoice._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/fees/:id', auth, async (req, res) => {
    await FeeInvoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

// --- ADMISSIONS ---

router.get('/admissions', auth, async (req, res) => {
    const admissions = await AdmissionEnquiry.find();
    res.json(admissions.map(a => ({ ...a.toObject(), id: a._id })));
});

router.post('/admissions', async (req, res) => {
    const admission = new AdmissionEnquiry(req.body);
    await admission.save();
    res.json({ ...admission.toObject(), id: admission._id });
});

router.put('/admissions/:id/status', auth, async (req, res) => {
    const { status } = req.body;
    const adm = await AdmissionEnquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(adm);
});

// --- FULL APPLICATIONS & ENROLLMENT ---

router.get('/applications', auth, async (req, res) => {
    const apps = await AdmissionApplication.find();
    res.json(apps.map(a => ({ ...a.toObject(), id: a._id })));
});

router.post('/applications', async (req, res) => {
    const app = new AdmissionApplication(req.body);
    await app.save();
    res.json({ ...app.toObject(), id: app._id });
});

router.post('/enroll', auth, async (req, res) => {
    try {
        const { admissionId, type } = req.body; // type: 'enquiry' or 'application'

        let childName, parentName, parentEmail, fatherName, motherName, phone, address, assignedId;

        if (type === 'enquiry') {
            const source = await AdmissionEnquiry.findById(admissionId);
            if (!source) throw new Error('Enquiry not found');
            childName = source.childName;
            parentName = source.parentName;
            parentEmail = source.parentEmail;
            source.status = 'enrolled';
            await source.save();
        } else {
            const source = await AdmissionApplication.findById(admissionId);
            if (!source) throw new Error('Application not found');
            childName = source.childName;
            parentName = source.fatherName || source.motherName;
            parentEmail = source.email;
            fatherName = source.fatherName;
            motherName = source.motherName;
            phone = source.fatherPhone || source.motherPhone;
            address = source.address;
            assignedId = source.assignedStudentId;
            source.status = 'enrolled';
            await source.save();
        }

        let parent = await User.findOne({ email: parentEmail });
        let parentPassword = null;

        if (!parent) {
            parentPassword = generateId();
            const hashedPassword = await bcrypt.hash(parentPassword, 10);
            parent = new User({
                name: parentName,
                email: parentEmail,
                password: hashedPassword,
                role: 'PARENT',
                phone,
                address
            });
            await parent.save();
        }

        const studentId = assignedId || `STUD${Date.now().toString().slice(-6)}`;
        const student = new Student({
            _id: studentId,
            name: childName,
            batch: 'Playgroup',
            parentId: parent._id,
            enrollmentDate: new Date().toISOString().split('T')[0],
            fatherName,
            motherName,
            contactNumber: phone,
            address
        });
        await student.save();

        const parentObj = parent.toObject();
        if (parentPassword) parentObj.password = parentPassword;
        else parentObj.password = "******";

        res.json({ student: { ...student.toObject(), id: student._id }, parent: parentObj });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- ATTENDANCE ---

router.get('/attendance/:studentId', auth, async (req, res) => {
    const records = await Attendance.find({ studentId: req.params.studentId });
    res.json(records);
});

router.post('/attendance', auth, async (req, res) => {
    const { records, date } = req.body;
    for (let record of records) {
        await Attendance.findOneAndUpdate(
            { studentId: record.studentId, date: date },
            { status: record.status },
            { upsert: true }
        );
    }
    res.json({ success: true });
});

// --- MISC ---

router.get('/notices', async (req, res) => {
    const notices = await Notice.find();
    res.json(notices.map(n => ({ ...n.toObject(), id: n._id })));
});

router.post('/notices', auth, async (req, res) => {
    const notice = new Notice({
        ...req.body,
        date: new Date().toISOString().split('T')[0],
        readBy: []
    });
    await notice.save();
    res.json({ ...notice.toObject(), id: notice._id });
});

router.put('/notices/:id/read', auth, async (req, res) => {
    const { userId } = req.body;
    const notice = await Notice.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { readBy: userId } },
        { new: true }
    );
    res.json(notice);
});

router.get('/batches', async (req, res) => {
    const batches = await Batch.find();
    res.json(batches.map(b => ({ ...b.toObject(), id: b._id })));
});

router.post('/batches', auth, async (req, res) => {
    const batch = new Batch(req.body);
    await batch.save();
    res.json({ ...batch.toObject(), id: batch._id });
});

router.put('/batches/:id', auth, async (req, res) => {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...batch.toObject(), id: batch._id });
});

router.get('/homework', async (req, res) => {
    const { batch } = req.query;
    const query = batch ? { batch } : {};
    const hw = await Homework.find(query);
    res.json(hw.map(h => ({ ...h.toObject(), id: h._id })));
});

router.post('/homework', auth, async (req, res) => {
    const hw = new Homework(req.body);
    await hw.save();
    res.json({ ...hw.toObject(), id: hw._id });
});

router.get('/landing-config', async (req, res) => {
    let config = await LandingConfig.findOne();
    if (!config) {
        config = new LandingConfig({});
        await config.save();
    }
    res.json(config);
});

router.put('/landing-config', auth, async (req, res) => {
    const config = await LandingConfig.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(config);
});

module.exports = router;

// Debug endpoint: attempt a write to the DB to verify permissions/connectivity
// GET /api/_debug/db-test
router.get('/_debug/db-test', async (req, res) => {
    try {
        const result = await mongoose.connection.db.collection('debug_tests').insertOne({ createdAt: new Date() });
        // clean up the inserted doc to avoid clutter
        await mongoose.connection.db.collection('debug_tests').deleteOne({ _id: result.insertedId });
        res.json({ ok: true, insertedId: result.insertedId });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});
