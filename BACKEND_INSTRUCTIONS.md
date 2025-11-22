
# Tiny Toddlers Playschool - Backend Setup Guide

This project includes a fully functional Node.js/Express/MongoDB backend designed to power the Tiny Toddlers application in production or local development, replacing the frontend mock API.

## Features
- **Authentication**: JWT-based auth for Admins, Teachers, and Parents.
- **Role-Based Access**: Protected routes for specific roles.
- **Fee Management**: Create invoices, process payments, and manage status (Paid/Processing/Pending).
- **Admission System**: Handle quick enquiries and full applications.
- **Attendance & Homework**: Daily tracking and assignment management.
- **Dynamic Configuration**: CMS-like capability for the Landing Page.

## Prerequisites

1.  **Node.js**: Ensure you have Node.js installed (v16 or higher).
2.  **MongoDB**: You need a MongoDB instance. You can:
    *   Install MongoDB Community Edition locally.
    *   Or use a free cloud database like [MongoDB Atlas](https://www.mongodb.com/atlas).

## Folder Structure

The backend code is located in the `server/` directory:

- `server/index.js`: The main entry point. Connects to DB and starts server.
- `server/models.js`: Defines the Mongoose schemas (Users, Students, Fees, Batches, Notices, etc.).
- `server/routes.js`: Defines all API endpoints.
- `server/package.json`: List of dependencies.

## Installation & Running

1.  **Navigate to the server folder:**
    Open your terminal and move into the server directory.
    ```bash
    cd server
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configuration (.env):**
    Create a `.env` file in the `server/` folder with the following content:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/tinytoddlers
    JWT_SECRET=change_this_to_a_secure_random_string
    ```
    *Note: Replace `mongodb://localhost:27017/tinytoddlers` with your MongoDB Atlas connection string if using a cloud database.*

4.  **Start the Server:**
    ```bash
    npm start
    ```
    You should see: 
    > `Server running on port 5000`
    > `Connected to MongoDB`
    > `Seeded default Admin: admin@test.com / password123` (First run only)

## Connecting Frontend to Backend

By default, the frontend uses `src/services/mockApi.ts` (in-memory mock data). To use your running local backend:

1.  **Modify `src/services/api.ts`:**
    Open `src/services/api.ts` and switch the export:
    ```typescript
    // export { api } from './mockApi';
    export { api } from './realApi'; // Uncomment this line
    ```

2.  **Verify `realApi.ts`:**
    Ensure `src/services/realApi.ts` points to your server URL:
    ```typescript
    const API_URL = 'http://localhost:5000/api';
    ```

3.  **Restart Frontend:**
    Restart your Vite development server. You can now log in using the seeded admin credentials (`admin@test.com` / `password123`).

## API Endpoints Overview

### Auth
- `POST /api/auth/login`: Returns JWT + User info.
- `GET /api/auth/me`: Get current user details.

### Core Data
- `GET /api/students`: List all students.
- `GET /api/teachers`: List all teachers.
- `GET /api/batches`: List all programs/batches (with fees).

### Fees (New)
- `GET /api/fees`: List all invoices (Admin).
- `GET /api/fees/student/:id`: List invoices for a specific student.
- `POST /api/fees`: Create a new invoice.
- `PUT /api/fees/:id/pay`: Simulate parent payment (sets status to PROCESSING).
- `PUT /api/fees/:id/status`: Admin update status (PENDING <-> PAID).

### Operations
- `POST /api/enroll`: Convert enquiry/application to active Student.
- `POST /api/attendance`: Bulk mark attendance.
- `POST /api/notices`: Create notice.
- `PUT /api/notices/:id/read`: Mark notice as read by user.
