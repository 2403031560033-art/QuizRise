# QuizRise - Online Quiz & Assessment Engine

**Live Demo:** [https://quiz-rise.vercel.app/](https://quiz-rise.vercel.app/)

QuizRise is a full-stack, high-fidelity online assessment platform. It provides a real-time, dynamic, and fully functional environment for conducting quizzes and exams, equipped with anti-cheating mechanisms, live leaderboards, and comprehensive analytics.

## 🚀 Features

### For Candidates (Frontend)
- **Dynamic Assessments:** Take quizzes with a highly polished, modern UI (Smart Assessment Hub design).
- **Anti-Cheating Engine:** Detects when candidates switch tabs or leave the active window, warning them and auto-submitting after multiple violations.
- **Real-Time Leaderboards:** Live updates via Socket.IO for both global rankings and per-quiz leaderboards.
- **User Dashboard:** Track performance trends with interactive charts, view attempt history, and earn dynamic badges (e.g., First Blood, Century Club, High Flyer).
- **Assessment Map & Review:** Mark questions for review, jump between questions via an interactive bubble map, and see instant feedback with explanations upon submission.

### For Administrators (Backend & Admin Dashboard)
- **Analytics & Reporting:** View real-time aggregated metrics, pass rates, and recent submission streams.
- **Quiz Management:** Create, edit, and publish/unpublish quizzes.
- **Bulk CSV Upload:** Quickly populate assessment questions via CSV imports.
- **User Management:** Manage developer access, assign admin roles, and track candidate scores.
- **Robust API:** Fully secured RESTful API built with Express and MongoDB, protected by JWT authentication.

---

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework:** React.js powered by Vite
- **Styling:** Tailwind CSS v4 (with custom design system tokens)
- **Routing:** React Router DOM
- **Charts:** Recharts for dynamic visual analytics
- **Real-time:** Socket.IO Client
- **Icons:** Lucide React

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with `mongodb-memory-server` fallback for easy local testing)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Real-time:** Socket.IO Server

---

## 📂 Project Structure

The repository is divided into two main workspaces:

```text
QuizRise/
├── frontend/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI elements (auth, common, quiz, admin)
│   │   ├── context/        # React Context providers (Auth, Socket)
│   │   ├── pages/          # Full page views (Dashboards, Quiz Attempt, Leaderboard)
│   │   ├── utils/          # API interceptors and helper functions
│   │   └── App.jsx         # Main router and layout wrapper
│   └── package.json
│
└── backend/                 # Backend Node.js Application
    ├── controllers/        # Route logic and handlers
    ├── middleware/         # Auth protection and error handling
    ├── models/             # Mongoose schemas (User, Quiz, Attempt)
    ├── routes/             # Express API routes
    ├── sockets/            # Socket.IO event handlers
    └── index.js            # Server entry point
```

---

## ⚙️ Installation & Setup

### 1. Backend Setup (`/server`)
Navigate to the server directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```
*Note: If `MONGO_URI` is omitted or fails to connect, the server will automatically fall back to an in-memory MongoDB instance and auto-seed dummy data so you can test the app immediately!*

Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup (`/frontend`)
Open a new terminal, navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

---

## 🎮 Usage Guide

1. Open your browser and navigate to `http://localhost:5173`.
2. Register a new user account.
3. **To access the Admin Dashboard:**
   - The first registered user may need to be manually elevated to an admin via the database, or you can use the auto-seeded admin account if relying on the in-memory database fallback.
   - Auto-seeded Admin credentials: `admin@quizrise.com` / `password123`
4. Create a quiz, add questions (or upload a CSV), and publish it.
5. Take the quiz from the User Dashboard to see real-time grading, anti-cheat detection, and leaderboard updates in action.

## 📄 License
Confidential — Certified for internal evaluations and academic examinations. All rights reserved.
