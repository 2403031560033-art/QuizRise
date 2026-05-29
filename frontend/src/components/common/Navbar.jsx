import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Trophy,
  Shield,
  User,
} from "lucide-react";
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };
  const isActive = (path) => location.pathname === path;
  const navLinks = user
    ? [
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
        ...(user.role === "admin"
          ? [{ name: "Admin panel", path: "/admin", icon: Shield }]
          : []),
      ]
    : [];
  return (
    <nav className="sticky top-0 z-40 w-full bg-surface-container-lowest border border-outline-variant shadow-sm transition-colors">
      {" "}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {" "}
        <div className="flex h-16 items-center justify-between">
          {" "}
          {/* Logo */}{" "}
          <div className="flex items-center">
            {" "}
            <Link
              to={user ? "/dashboard" : "/"}
              className="flex items-center gap-2"
            >
              {" "}
              <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shadow-md shadow-primary/20">
                <img src="/logo.png" alt="QuizRise Logo" className="h-full w-full object-cover" />
              </div>{" "}
              <span className="font-display text-xl font-bold tracking-tight text-slate-800">
                {" "}
                Quiz<span className="text-primary">Rise</span>{" "}
              </span>{" "}
            </Link>{" "}
          </div>{" "}
          {/* Desktop Nav Items */}{" "}
          <div className="hidden md:flex items-center gap-6">
            {" "}
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isActive(link.path) ? "text-primary" : "text-slate-600 hover:text-slate-900"}`}
                >
                  {" "}
                  <Icon className="h-4 w-4" /> {link.name}{" "}
                </Link>
              );
            })}{" "}
            {user ? (
              <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
                {" "}
                <div className="flex items-center gap-2">
                  {" "}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                    {" "}
                    <User className="h-4 w-4" />{" "}
                  </div>{" "}
                  <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                    {" "}
                    {user.name}{" "}
                  </span>{" "}
                </div>{" "}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-xs font-medium text-destructive hover:opacity-80"
                >
                  {" "}
                  <LogOut className="h-4 w-4" /> Sign Out{" "}
                </button>{" "}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {" "}
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  {" "}
                  Login{" "}
                </Link>{" "}
                <Link
                  to="/register"
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-dark transition-all"
                >
                  {" "}
                  Get Started{" "}
                </Link>{" "}
              </div>
            )}{" "}
          </div>{" "}
          {/* Mobile hamburger menu trigger */}{" "}
          <div className="flex items-center gap-2 md:hidden">
            {" "}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            >
              {" "}
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      {/* Mobile Drawer */}{" "}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3 animate-slide">
          {" "}
          <div className="flex flex-col gap-3">
            {" "}
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive(link.path) ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  {" "}
                  <Icon className="h-4 w-4" /> {link.name}{" "}
                </Link>
              );
            })}{" "}
            {user ? (
              <div className="border-t border-slate-100 pt-3">
                {" "}
                <div className="mb-2 px-3 text-xs text-slate-400">
                  Signed in as:
                </div>{" "}
                <div className="flex items-center gap-2 px-3 mb-3">
                  {" "}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                    {" "}
                    <User className="h-4 w-4" />{" "}
                  </div>{" "}
                  <span className="text-sm font-semibold text-slate-700">
                    {" "}
                    {user.name}{" "}
                  </span>{" "}
                </div>{" "}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-rose-50"
                >
                  {" "}
                  <LogOut className="h-4 w-4" /> Sign Out{" "}
                </button>{" "}
              </div>
            ) : (
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                {" "}
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center rounded-lg px-3 py-2 text-center text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  {" "}
                  Login{" "}
                </Link>{" "}
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center rounded-lg bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-sm"
                >
                  {" "}
                  Register{" "}
                </Link>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>
      )}{" "}
    </nav>
  );
};
export default Navbar;
