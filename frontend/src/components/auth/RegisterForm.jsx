import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { User, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import Loader from "../common/Loader.jsx";
const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
{/* Redirect if user is already logged in */}if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("Please provide all details.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    const result = await register(name, email, password);
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
          Create Account{" "}
        </h2>{" "}
        <p className="mt-2 text-xs text-slate-500">
          {" "}
          Sign up to test your knowledge on developer topics.{" "}
        </p>{" "}
      </div>{" "}
      {error && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
          {" "}
          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500" />{" "}
          <span>{error}</span>{" "}
        </div>
      )}{" "}
      {/* Removed Special Admin Trigger Notice for Production */}{" "}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {" "}
        {/* Name */}{" "}
        <div>
          {" "}
          <label className="block text-xs font-bold text-slate-700">
            {" "}
            Full Name{" "}
          </label>{" "}
          <div className="relative mt-1.5 flex items-center">
            {" "}
            <User className="absolute left-3.5 h-4 w-4 text-slate-400" />{" "}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Alex Dev"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs focus:border-primary focus:bg-white"
            />{" "}
          </div>{" "}
        </div>{" "}
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
          <label className="block text-xs font-bold text-slate-700">
            {" "}
            Password{" "}
          </label>{" "}
          <div className="relative mt-1.5 flex items-center">
            {" "}
            <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />{" "}
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="At least 6 characters"
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
          {loading ? <Loader size="sm" color="white" /> : "Create Account"}{" "}
        </button>{" "}
      </form>{" "}
      <div className="mt-6 text-center text-xs text-slate-500">
        {" "}
        Already have an account?{""}{" "}
        <Link to="/login" className="font-bold text-primary hover:underline">
          {" "}
          Sign In{" "}
        </Link>{" "}
      </div>{" "}
    </div>
  );
};
export default RegisterForm;
