
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes');
const { User } = require('./models');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for profile pictures

// Routes
app.use('/api', routes);

// MongoDB Connection & Seed
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tinytoddlers')
    .then(async () => {
        console.log('Connected to MongoDB');

        // Seed Admin User if none exists
        const adminCount = await User.countDocuments({ role: 'ADMIN' });
        if (adminCount === 0) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                name: 'Admin User',
                email: 'admin@test.com',
                password: hashedPassword,
                role: 'ADMIN'
            });
            console.log('Seeded default Admin: admin@test.com / password123');
        }

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => console.error('Could not connect to MongoDB', err));

// Extra diagnostics
mongoose.connection.on('error', err => console.error('Mongoose connection error:', err));
mongoose.connection.on('disconnected', () => console.warn('Mongoose disconnected'));

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
