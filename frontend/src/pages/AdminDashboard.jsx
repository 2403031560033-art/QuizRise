import React, { useState, useEffect } from "react";
import API from "../utils/api.js";
import Loader from "../components/common/Loader.jsx";
import AnalyticsSummary from "../components/admin/AnalyticsSummary.jsx";
import QuizForm from "../components/admin/QuizForm.jsx";
import BulkUpload from "../components/admin/BulkUpload.jsx";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  FileText,
  Users,
  Plus,
  Trash2,
  Edit3,
  Upload,
  ShieldAlert,
  Award,
  Calendar,
  Check,
  X,
  Shield,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // overview, quizzes, users
  const [analytics, setAnalytics] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Forms / Modal states
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [bulkUploadQuizId, setBulkUploadQuizId] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch analytics
      const analyticsRes = await API.get('/admin/analytics');
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data);
      }

      // 2. Fetch quizzes (including unpublished)
      const quizzesRes = await API.get('/quizzes');
      if (quizzesRes.data.success) {
        setQuizzes(quizzesRes.data.quizzes);
      }

      // 3. Fetch users list
      const usersRes = await API.get('/admin/users');
      if (usersRes.data.success) {
        setUsersList(usersRes.data.users);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Error loading administration data panels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handlePublishToggle = async (quizId, currentStatus) => {
    try {
      const response = await API.put(`/quizzes/${quizId}`, {
        isPublished: !currentStatus,
      });
      if (response.data.success) {
        // Reload local list
        setQuizzes(quizzes.map((q) => (q._id === quizId ? { ...q, isPublished: !currentStatus } : q)));
        toast.success(`Assessment ${!currentStatus ? 'published' : 'unpublished'}`);
      }
    } catch (err) {
      console.error('Error toggling publish status:', err);
      toast.error('Failed to update assessment status');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to permanently delete this quiz assessment?')) return;
    try {
      const response = await API.delete(`/quizzes/${quizId}`);
      if (response.data.success) {
        setQuizzes(quizzes.filter((q) => q._id !== quizId));
        toast.success('Assessment deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting quiz:', err);
      toast.error('Failed to delete assessment');
    }
  };

  const handleUserRoleChange = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to update this user role to ${nextRole}?`)) return;
    try {
      const response = await API.patch(`/admin/users/${userId}`, {
        role: nextRole,
      });
      if (response.data.success) {
        setUsersList(usersList.map((u) => (u._id === userId ? { ...u, role: nextRole } : u)));
        toast.success('User role updated successfully');
      }
    } catch (err) {
      console.error('Error changing user role:', err);
      toast.error(err.response?.data?.message || 'Error updating user role.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs font-semibold text-rose-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 transition-colors min-h-screen">
      {/* Header title */}
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-800">
          Platform Administration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor global candidate runs, compile assessments, and sync question banks.
        </p>
      </div>

      {/* Tabs list bar */}
      <div className="mb-8 flex border-b border-slate-200">
        {[
          { id: 'overview', name: 'Overview Summary', icon: LayoutDashboard },
          { id: 'quizzes', name: 'Manage Quizzes', icon: FileText },
          { id: 'users', name: 'User Management', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setShowQuizForm(false);
                setEditingQuizId(null);
                setBulkUploadQuizId(null);
              }}
              className={`flex items-center gap-1.5 border-b-2 px-6 py-3.5 text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* RENDER TAB CONTENTS */}

      {/* 1. OVERVIEW SUMMARY TAB */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-8 fade-in">
          {/* Metrics summary grid */}
          <AnalyticsSummary metrics={analytics.metrics} />

          {/* Aggregation Charts rows */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Chart A: Attempts trends */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-display text-xs font-bold text-slate-800 mb-4 uppercase tracking-wider">
                Exam Attempts Trend (Last 7 Days)
              </h3>
              <div className="h-64 w-full text-xs">
                {analytics.attemptsTrend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.attemptsTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="date" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip />
                      <Line type="monotone" dataKey="attempts" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    No attempt trends registered in the last 7 days.
                  </div>
                )}
              </div>
            </div>

            {/* Chart B: Quiz Pass Rates */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-display text-xs font-bold text-slate-800 mb-4 uppercase tracking-wider">
                Success Pass Rate (%) per Quiz
              </h3>
              <div className="h-64 w-full text-xs">
                {analytics.quizStats?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.quizStats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="title" stroke="#94A3B8" />
                      <YAxis domain={[0, 100]} stroke="#94A3B8" />
                      <Tooltip formatter={(value) => [`${value}%`, 'Pass Rate']} />
                      <Bar dataKey="passRate" fill="#10B981" radius={[8, 8, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    Run attempts needed to compile individual quiz statistics.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Feed table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-display text-xs font-bold text-slate-800 mb-4 uppercase tracking-wider">
              Recent Submission Streams
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold">
                    <th className="pb-3 pr-4">Candidate</th>
                    <th className="pb-3 pr-4">Assessment Title</th>
                    <th className="pb-3 text-center">Score</th>
                    <th className="pb-3 text-center">Result</th>
                    <th className="pb-3 text-right">Elapsed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {analytics.recentActivity?.length > 0 ? (
                    analytics.recentActivity.map((act) => (
                      <tr key={act._id} className="hover:bg-slate-50/40">
                        <td className="py-3 pr-4 font-semibold text-slate-850">
                          {act.user?.name || 'Deleted Candidate'}
                        </td>
                        <td className="py-3 pr-4">{act.quiz?.title || 'Deleted Quiz'}</td>
                        <td className="py-3 text-center font-mono font-bold">{act.score}/{act.totalMarks}</td>
                        <td className="py-3 text-center">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                              act.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {act.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono">
                          {Math.floor(act.timeTaken / 60)}m {act.timeTaken % 60}s
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No activity logs recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. MANAGE QUIZZES TAB */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6 fade-in">
          {/* Toggle Form Creator */}
          {showQuizForm ? (
            <QuizForm
              quizId={editingQuizId}
              onSaveSuccess={() => {
                setShowQuizForm(false);
                setEditingQuizId(null);
                fetchAdminData();
              }}
              onCancel={() => {
                setShowQuizForm(false);
                setEditingQuizId(null);
              }}
            />
          ) : bulkUploadQuizId ? (
            <div>
              <button
                onClick={() => setBulkUploadQuizId(null)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-4"
              >
                <ArrowLeft className="h-4 w-4" /> Back to List
              </button>
              <BulkUpload
                quizId={bulkUploadQuizId}
                onUploadSuccess={() => {
                  setBulkUploadQuizId(null);
                  fetchAdminData();
                }}
              />
            </div>
          ) : (
            <>
              {/* Trigger button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowQuizForm(true)}
                  className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition-all flex items-center gap-1.5"
                >
                  <Plus className="h-4.5 w-4.5" /> Add Assessment
                </button>
              </div>

              {/* Quiz list table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
                      <th className="px-6 py-4">Assessment Title</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Difficulty</th>
                      <th className="px-6 py-4 text-center">Questions</th>
                      <th className="px-6 py-4 text-center">Duration</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-center w-52">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-655">
                    {quizzes.length > 0 ? (
                      quizzes.map((quiz) => (
                        <tr key={quiz._id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-semibold text-slate-850">
                            {quiz.title}
                          </td>
                          <td className="px-6 py-4">{quiz.category}</td>
                          <td className="px-6 py-4">
                            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">
                              {quiz.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-bold">{quiz.questions?.length || 0}</td>
                          <td className="px-6 py-4 text-center">{quiz.duration} mins</td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handlePublishToggle(quiz._id, quiz.isPublished)}
                              className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wider ${
                                quiz.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {quiz.isPublished ? 'PUBLISHED' : 'DRAFT'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              {/* Edit details */}
                              <button
                                onClick={() => {
                                  setEditingQuizId(quiz._id);
                                  setShowQuizForm(true);
                                }}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                title="Edit properties"
                              >
                                <Edit3 className="h-4.5 w-4.5" />
                              </button>
                              {/* CSV Import questions */}
                              <button
                                onClick={() => setBulkUploadQuizId(quiz._id)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                title="Import CSV questions"
                              >
                                <Upload className="h-4.5 w-4.5" />
                              </button>
                              {/* Delete quiz */}
                              <button
                                onClick={() => handleDeleteQuiz(quiz._id)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-destructive"
                                title="Delete assessment"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                          No quiz assessments created. Click "Add Assessment" to start.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* 3. USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="space-y-6 fade-in">
          {/* User list table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
                  <th className="px-6 py-4">Developer</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-center">Score Accumulated</th>
                  <th className="px-6 py-4 text-center">Attempts count</th>
                  <th className="px-6 py-4 text-center">Passed Count</th>
                  <th className="px-6 py-4 text-center">Status Role</th>
                  <th className="px-6 py-4 text-center w-40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-655">
                {usersList.map((usr) => (
                  <tr key={usr._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-850 flex items-center gap-1.5">
                      {usr.name}
                      {usr.role === 'admin' && (
                        <Shield className="h-3.5 w-3.5 text-primary" title="Admin User" />
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono">{usr.email}</td>
                    <td className="px-6 py-4 text-center font-mono font-bold">{usr.totalScore || 0}</td>
                    <td className="px-6 py-4 text-center">{usr.quizzesAttempted || 0}</td>
                    <td className="px-6 py-4 text-center text-emerald-650">
                      {usr.quizzesPassed || 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          usr.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {usr.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* Demote / Promote action toggle */}
                      <button
                        onClick={() => handleUserRoleChange(usr._id, usr.role)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        {usr.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
