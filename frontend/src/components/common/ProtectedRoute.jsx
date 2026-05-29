import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader size="lg" />
      </div>
    );
  }

  if (!user) {
{/* Redirect to login page and save attempt URL location */}return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== "admin") {
{/* Standard user attempting to view admin routes redirects to home dashboard */}return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
