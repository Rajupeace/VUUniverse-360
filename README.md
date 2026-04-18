# Vu UniVerse360 - Premium Integrated Institution Management System

**Vu UniVerse360** is a high-fidelity, high-performance web ecosystem designed for modern educational institutions. It provides a unified portal for Students, Faculty, and Administrators, featuring premium aesthetics, real-time synchronization, and advanced AI-driven tools.

## 🚀 System Architecture

The project is built on a high-performance integrated stack:
*   **Frontend**: React.js with Framer Motion (Glassmorphism & Micro-animations)
*   **Backend**: NestJS (Enterprise-grade Node.js framework)
*   **Databases**: 
    *   **MongoDB**: Primary store for high-volume student data, logs, and activity.
    *   **MySQL/SQLite**: Transactional storage for identities and academic records.
*   **Real-time Core**: Server-Sent Events (SSE) for instant dashboard updates.

## 🌟 Key Features

### 🎓 Student Ecosystem
*   **Identity Dashboard**: Personalized bento-grid overview with academic vitality tracking.
*   **Study Streak System**: Automated login rewards and daily vitality tracking.
*   **Academic Hub**: Centralized access to semester notes, results, and attendance.
*   **Instant Profile Sync**: Real-time profile picture uploads and identity management.
*   **VU AI Agent**: Integrated assistant for academic document analysis.

### 🍎 Faculty Portal
*   **Student Registry**: Comprehensive management of student performance and attendance.
*   **Resource Manager**: Immediate broadcasting of study materials and announcements.
*   **Real-time Monitoring**: Live tracking of student engagement and academic focus.

### 🛡️ Administrative Suite
*   **Operation Nodes**: Specialized dashboards for Finance, Hostel, Library, Transport, and Placement Managers.
*   **Global Access Control**: Granular RBAC (Role-Based Access Control) for all institutional data.
*   **System Analytics**: Deep-dive metrics on institution-wide performance.

## 🛠️ Quick Start

### 1. Installation
Install dependencies for both frontend and backend:
```bash
# Frontend
npm install

# Backend
cd backend-nest
npm install
```

### 2. Configuration
Create a `.env` file in the root and `backend-nest` directory with:
```env
# Backend
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5001

# Frontend
REACT_APP_API_URL=http://localhost:5001
```

### 3. Launching
Use the integrated controller to start all services simultaneously:
```bash
node run-all.js
```

## 📂 Project Structure
*   `/src`: Core React application and dashboard components.
*   `/backend-nest`: NestJS API services and business logic.
*   `/uploads`: Centralized asset storage for profile pictures and materials.
*   `.github/workflows`: Continuous Integration and Deployment pipelines.
*   `run-all.js`: Automated process manager for the full stack.

## 💾 Database Architecture

The system utilizes a **Hybrid Database Strategy** to balance speed, scalability, and transaction integrity:

1.  **MongoDB (Primary Activity Cluster)**:
    *   **Scope**: High-volume data including student stats, activity logs, roadmap progress, and messages.
    *   **Benefit**: Flexible schema allows for rapid scaling of AI-driven features and real-time dashboard updates.
    *   **Collections**: `students`, `studentData`, `messages`, `tasks`, `announcements`.

2.  **MySQL / SQLite (Transactional Ledger)**:
    *   **Scope**: Core identity management, enrollment records, and academic results.
    *   **Benefit**: Ensures ACID compliance for critical academic and financial records.
    *   **Entities**: `Student`, `Faculty`, `Course`, `Mark`, `Attendance`.

## 🔄 Automated Workflow

We have implemented a **GitHub Actions CI/CD Pipeline**:

*   **Continuous Integration**: On every push to `main`, the system automatically:
    1.  Validates and installs dependencies for both Frontend and Backend.
    2.  Performs build checks for the NestJS distribution and React production bundle.
    3.  Runs a "Smoke Test" integration launch to ensure all services (5001, 8000, 3000) are compatible.
*   **Asset Management**: Automated resolution of image paths ensuring zero-downtime asset availability during deployments.

## 🔒 Security & Performance
*   **JWT Authentication**: Secure stateless session management.
*   **Asset Persistence**: Optimized image resolution logic (resolveImageUrl) to eliminate 404 resource errors.
*   **SSE Resilience**: Highly available real-time event bus.

---
*Developed with focus on visual excellence and institutional efficiency.*
