import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx"; // Common Components
import Navbar from "./components/common/Navbar.jsx";
import Footer from "./components/common/Footer.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx"; // Auth Components
import LoginForm from "./components/auth/LoginForm.jsx";
import RegisterForm from "./components/auth/RegisterForm.jsx"; // Page Views
import LandingPage from "./pages/LandingPage.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import QuizDetail from "./pages/QuizDetail.jsx";
import QuizAttempt from "./pages/QuizAttempt.jsx";
import QuizResult from "./pages/QuizResult.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx"; // Auth layout wrapper for center alignments (login/register)
const AuthLayout = ({ children }) => (
  <div className="flex min-h-[calc(100vh-128px)] items-center justify-center px-4 py-12 transition-colors">
    {" "}
    {children}{" "}
  </div>
);
function App() {
  return (
    <AuthProvider>
      {" "}
      <SocketProvider>
        {" "}
        <Router>
          {" "}
          <div className="flex flex-col min-h-screen transition-colors">
            {" "}
            <Navbar /> {/* Main scrollable body */}{" "}
            <main className="flex-grow">
              {" "}
              <Routes>
                {" "}
                {/* Public guest routes */}{" "}
                <Route path="/" element={<LandingPage />} />{" "}
                <Route
                  path="/login"
                  element={
                    <AuthLayout>
                      {" "}
                      <LoginForm />{" "}
                    </AuthLayout>
                  }
                />{" "}
                <Route
                  path="/register"
                  element={
                    <AuthLayout>
                      {" "}
                      <RegisterForm />{" "}
                    </AuthLayout>
                  }
                />{" "}
                {/* Candidate protected routes */}{" "}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      {" "}
                      <UserDashboard />{" "}
                    </ProtectedRoute>
                  }
                />{" "}
                <Route
                  path="/quizzes/:id"
                  element={
                    <ProtectedRoute>
                      {" "}
                      <QuizDetail />{" "}
                    </ProtectedRoute>
                  }
                />{" "}
                <Route
                  path="/quiz/:id/attempt"
                  element={
                    <ProtectedRoute>
                      {" "}
                      <QuizAttempt />{" "}
                    </ProtectedRoute>
                  }
                />{" "}
                <Route
                  path="/quiz/:id/result"
                  element={
                    <ProtectedRoute>
                      {" "}
                      <QuizResult />{" "}
                    </ProtectedRoute>
                  }
                />{" "}
                {/* Leaderboard routes */}{" "}
                <Route
                  path="/leaderboard"
                  element={
                    <ProtectedRoute>
                      {" "}
                      <LeaderboardPage />{" "}
                    </ProtectedRoute>
                  }
                />{" "}
                <Route
                  path="/leaderboard/:quizId"
                  element={
                    <ProtectedRoute>
                      {" "}
                      <LeaderboardPage />{" "}
                    </ProtectedRoute>
                  }
                />{" "}
                {/* Admin protected routes */}{" "}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      {" "}
                      <AdminDashboard />{" "}
                    </ProtectedRoute>
                  }
                />{" "}
                {/* Catch-all redirect */}{" "}
                <Route path="*" element={<Navigate to="/" replace />} />{" "}
              </Routes>{" "}
            </main>{" "}
            <Footer />{" "}
            <Toaster
              position="bottom-right"
              toastOptions={{
                className:
                  "border border-slate-200 shadow-xl rounded-xl text-sm font-medium",
                duration: 4000,
              }}
            />{" "}
          </div>{" "}
        </Router>{" "}
      </SocketProvider>{" "}
    </AuthProvider>
  );
}
export default App;
