import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import Loader from "../common/Loader.jsx";
const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [expiredMsg, setExpiredMsg] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from?.pathname || "/dashboard";
  useEffect(() => {
{/* If already logged in, redirect away */}if (user) {
      navigate(redirectPath, { replace: true });
    }{/* Check if redirect contains session expired token parameters */}if (
      location.search.includes("expired=true")
    ) {
      setExpiredMsg(true);
    }
  }, [user, navigate, redirectPath, location]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExpiredMsg(false);
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.message);
    }
  };
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-md transition-colors">
      {" "}
      <div className="text-center">
        {" "}
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-800">
          {" "}
          Welcome Back{" "}
        </h2>{" "}
        <p className="mt-2 text-xs text-slate-500">
          {" "}
          Sign in to your account to resume assessments.{" "}
        </p>{" "}
      </div>{" "}
      {expiredMsg && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800">
          {" "}
          Your login session has expired. Please log in again to continue.{" "}
        </div>
      )}{" "}
      {error && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
          {" "}
          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500" />{" "}
          <span>{error}</span>{" "}
        </div>
      )}{" "}
      {/* Removed Demo Credentials Notice for Production */}{" "}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {" "}
        {/* Email */}{" "}
        <div>
          {" "}
          <label className="block text-xs font-bold text-slate-700">
            {" "}
            Email Address{" "}
          </label>{" "}
          <div className="relative mt-1.5 flex items-center">
            {" "}
            <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />{" "}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@email.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs focus:border-primary focus:bg-white"
            />{" "}
          </div>{" "}
        </div>{" "}
        {/* Password */}{" "}
        <div>
          {" "}
          <div className="flex items-center justify-between">
            {" "}
            <label className="block text-xs font-bold text-slate-700">
              {" "}
              Password{" "}
            </label>{" "}
          </div>{" "}
          <div className="relative mt-1.5 flex items-center">
            {" "}
            <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />{" "}
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-10 text-xs focus:border-primary focus:bg-white"
            />{" "}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600"
            >
              {" "}
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-3.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-dark transition-all disabled:opacity-60"
        >
          {" "}
          {loading ? <Loader size="sm" color="white" /> : "Sign In"}{" "}
        </button>{" "}
      </form>{" "}
      <div className="mt-6 text-center text-xs text-slate-500">
        {" "}
        Don't have an account?{""}{" "}
        <Link to="/register" className="font-bold text-primary hover:underline">
          {" "}
          Create Account{" "}
        </Link>{" "}
      </div>{" "}
    </div>
  );
};
export default LoginForm;
