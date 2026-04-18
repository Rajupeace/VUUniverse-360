# 🎓 Vu UniVerse360

**Vignan University Smart Campus Management System**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![NestJS](https://img.shields.io/badge/Backend-NestJS-e0234e.svg)](https://nestjs.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018-61dafb.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479a1.svg)](https://www.mysql.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47a248.svg)](https://www.mongodb.com/)

> A comprehensive, AI-powered educational management platform with real-time dashboards, secure authentication, and smart campus features.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Dashboard Features](#-dashboard-features)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication for Students, Faculty & Administrators
- **Password Reset via Email** — OTP sent from `vuuniverse360@gmail.com`
- Bcrypt password hashing
- Role-based access control (RBAC)

### 📊 Three Role-Based Dashboards
- **Admin Dashboard** — System telemetry, user management, analytics
- **Faculty Dashboard** — Attendance marking, marks entry, curriculum management
- **Student Dashboard** — Academic performance, attendance tracking, materials

### 🎯 Core Modules
- **Attendance Management** — Mark, track, and analyze attendance
- **Marks & Grades** — Enter and view academic results
- **Course Management** — Create and assign courses
- **Broadcast Messages** — Admin announcements to students & faculty
- **Todo/Task Management** — Personal task tracking
- **Material Management** — Cloud-based resource sharing
- **Smart Paint Board** — Digital whiteboard for lectures
- **Real-Time Updates** — Server-Sent Events (SSE) for live data

### 🤖 AI Features (Optional)
- RAG-based AI Chatbot for student assistance
- Learning analytics and insights

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Framer Motion, React Router, React Icons |
| **Backend** | NestJS (TypeScript), TypeORM, Mongoose |
| **Database** | MySQL 8.0 (primary) + MongoDB (secondary) |
| **Auth** | JWT, Bcryptjs |
| **Email** | Nodemailer (Gmail SMTP) |
| **Real-Time** | Server-Sent Events (SSE) |
| **API Client** | Axios |

---

## 🏗️ Architecture

```
┌──────────────────────────┐
│     React Frontend       │  ← Port 3000
│  (Admin/Faculty/Student) │
└───────────┬──────────────┘
            │ HTTP / SSE
            ▼
┌──────────────────────────┐
│   NestJS Backend API     │  ← Port 5000
│   (TypeORM + Mongoose)   │
└──────┬──────────┬────────┘
       │          │
       ▼          ▼
┌────────────┐ ┌────────────┐
│   MySQL    │ │  MongoDB   │
│ (Primary)  │ │ (Secondary)│
│ Port 3307  │ │ Port 27017 │
└────────────┘ └────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **MySQL** 8.0 (running on port 3307)
- **MongoDB** (local or Atlas)
- **npm** v9+

### 1. Clone the Repository

```bash
git clone https://github.com/vuuniverse360-ai/VuUniverse360.git
cd VuUniverse360
```

### 2. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend-nest
npm install
cd ..
```

### 3. Configure Environment

Create `.env` in `backend-nest/`:

```env
# Database
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_NAME=universe360_db

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/fbn_xai_system

# Auth
JWT_SECRET=your_jwt_secret_key

# Email (Password Reset)
EMAIL_PASS=your_google_app_password
```

### 4. Start the Application

**Terminal 1 — Backend:**
```bash
cd backend-nest
npm run start:dev
```

**Terminal 2 — Frontend:**
```bash
npm start
```

### 5. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |

---

## 📁 Project Structure

```
VuUniverse360/
├── src/                              # React Frontend
│   ├── Components/
│   │   ├── LoginRegister/            # Auth pages + Forgot Password
│   │   ├── AdminDashboard/           # Admin portal
│   │   ├── FacultyDashboard/         # Faculty portal
│   │   ├── StudentDashboard/         # Student portal
│   │   │   └── Sections/            # Student sub-sections
│   │   ├── CommandPalette/           # Quick search
│   │   └── Whiteboard/              # Digital whiteboard
│   ├── utils/
│   │   ├── apiClient.js             # API request utilities
│   │   └── sseClient.js             # Real-time SSE client
│   ├── App.jsx                       # Router & layout
│   └── index.js                      # Entry point
│
├── backend-nest/                     # NestJS Backend
│   ├── src/
│   │   ├── auth/                     # JWT auth + password reset
│   │   ├── students/                 # Student CRUD + overview
│   │   ├── faculty/                  # Faculty CRUD
│   │   ├── admin/                    # Admin logic
│   │   ├── attendance/               # Attendance management
│   │   ├── marks/                    # Marks/grades
│   │   ├── courses/                  # Course management
│   │   ├── admin-messages/           # Broadcast messages
│   │   ├── todos/                    # Task management
│   │   ├── student-data/             # Student dashboard data
│   │   ├── faculty-data/             # Faculty dashboard data
│   │   ├── sse/                      # Server-Sent Events
│   │   ├── entities/                 # TypeORM entities (MySQL)
│   │   ├── schemas/                  # Mongoose schemas (MongoDB)
│   │   ├── guards/                   # JWT & Role guards
│   │   └── main.ts                   # Server bootstrap
│   ├── .env                          # Environment config
│   └── package.json
│
├── LICENSE                           # MIT License
├── README.md                         # This file
└── package.json                      # Frontend config
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/students/login` | Student login |
| POST | `/api/faculty/login` | Faculty login |
| POST | `/api/admin/login` | Admin login |
| POST | `/api/forgot-password` | Request OTP for password reset |
| POST | `/api/reset-password` | Reset password with OTP |

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | Get all students |
| GET | `/api/students/:sid` | Get student by ID |
| PUT | `/api/students/:sid` | Update student profile |
| GET | `/api/students/:sid/overview` | Get student overview stats |
| GET | `/api/student-data/:sid/dashboard` | Full student dashboard data |

### Faculty

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/faculty` | Get all faculty |
| GET | `/api/faculty/:id` | Get faculty by ID |
| PUT | `/api/faculty/:id` | Update faculty profile |
| GET | `/api/faculty-data/:id/dashboard` | Full faculty dashboard data |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard-status` | Admin dashboard stats |
| GET | `/api/analytics/dashboard` | Analytics overview |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | Get attendance records |
| POST | `/api/attendance` | Mark attendance |

### Courses, Messages, Todos

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses |
| GET | `/api/messages` | Get broadcast messages |
| GET | `/api/todos` | Get tasks |
| POST | `/api/todos` | Create task |

---

## 📊 Dashboard Features

### 🛡️ Admin Dashboard
- System telemetry & health monitoring
- Student & Faculty management (CRUD)
- Course & schedule management
- Broadcast messaging system
- Performance analytics & insights
- Database sync controls

### 👩‍🏫 Faculty Dashboard
- Class overview & statistics
- Mark attendance (session-based)
- Enter marks & grades
- Upload learning materials
- Digital whiteboard
- Weekly schedule view

### 👨‍🎓 Student Dashboard
- Personal profile & academic info
- Attendance tracking with percentages
- Subject-wise grades & results
- Learning materials access
- Class schedule view
- AI chatbot assistance
- Task management

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_HOST` | ✅ | MySQL host (default: 127.0.0.1) |
| `DB_PORT` | ✅ | MySQL port (default: 3307) |
| `DB_USERNAME` | ✅ | MySQL username |
| `DB_PASSWORD` | ✅ | MySQL password |
| `DB_NAME` | ✅ | MySQL database name |
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | JWT signing secret |
| `EMAIL_PASS` | ⚡ | Google App Password for email |

---

## 🔐 Password Reset System

The system supports email-based password reset for all user roles:

1. User clicks **"Forgot Password?"** on the login page
2. Selects account type (Student/Faculty/Admin)
3. Enters their ID or email
4. Receives a **6-digit OTP** via email from `vuuniverse360@gmail.com`
5. Enters OTP + new password
6. Password is updated in both MySQL & MongoDB

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Rajupeace** — Vu UniVerse360

🌐 [GitHub](https://github.com/vuuniverse360-ai) | 📧 vuuniverse360@gmail.com

---

<div align="center">

**Built with ❤️ for Vignan University**

🎓 Vu UniVerse360 • Smart Campus Management System

</div>
