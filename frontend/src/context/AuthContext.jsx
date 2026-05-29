import React, { createContext, useState, useEffect, useContext } from "react";
import API from "../utils/api.js";
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await API.get("/auth/me");
        if (response.data.success) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);
  const login = async (email, password) => {
    try {
      const response = await API.post("/auth/login", { email, password });
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      console.error("Login request error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      };
    }
  };
  const register = async (name, email, password) => {
    try {
      const response = await API.post("/auth/register", {
        name,
        email,
        password,
      });
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      console.error("Register request error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  };
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };
  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, setUser }}
    >
      {" "}
      {children}{" "}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
