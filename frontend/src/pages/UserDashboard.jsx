import React, { useState, useEffect } from "react";
import API from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import QuizCard from "../components/quiz/QuizCard.jsx";
import Loader from "../components/common/Loader.jsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Award,
  BookOpen,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

const UserDashboard = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await API.get('/quizzes');
        if (response.data.success) {
          setQuizzes(response.data.quizzes);
        }
      } catch (err) {
        console.error('Error fetching quizzes:', err);
      } finally {
        setLoadingQuizzes(false);
      }
    };

    const fetchAttempts = async () => {
      try {
        const response = await API.get('/attempts/my');
        if (response.data.success) {
          setAttempts(response.data.attempts);
        }
      } catch (err) {
        console.error('Error fetching attempts:', err);
      } finally {
        setLoadingAttempts(false);
      }
    };

    fetchQuizzes();
    fetchAttempts();
  }, []);

  // Filter quizzes based on user inputs
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(search.toLowerCase()) || quiz.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesDifficulty = difficultyFilter === 'All' || quiz.difficulty === difficultyFilter;
    const matchesCategory = categoryFilter === 'All' || quiz.category === categoryFilter;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  // Extract unique categories for filtering
  const categories = ['All', ...new Set(quizzes.map((q) => q.category))];

  // Dynamic Badges algorithm based on actual attempt history
  const getBadges = () => {
    const badges = [];
    if (attempts.length > 0) {
      badges.push({
        name: 'First Blood',
        desc: 'Completed your first assessment',
        icon: '🔥',
        color: 'bg-orange-50 text-orange-700',
      });
    }

    const hasPerfectScore = attempts.some(a => a.score === a.totalMarks && a.totalMarks > 0);
    if (hasPerfectScore) {
      badges.push({
        name: 'Century Club',
        desc: 'Scored 100% on an assessment',
        icon: '💯',
        color: 'bg-emerald-50 text-emerald-700',
      });
    }

    const passedCount = attempts.filter(a => a.passed).length;
    if (passedCount >= 3) {
      badges.push({
        name: 'Scholar Streak',
        desc: 'Passed 3 or more assessments',
        icon: '🎓',
        color: 'bg-blue-50 text-blue-700',
      });
    }

    if (user?.totalScore > 50) {
      badges.push({
        name: 'High Flyer',
        desc: 'Accumulated over 50 total points',
        icon: '🚀',
        color: 'bg-indigo-50 text-indigo-700',
      });
    }

    return badges;
  };

  const earnedBadges = getBadges();

  // Prepare chart data chronologically (oldest to newest)
  const chartData = [...attempts]
    .reverse()
    .map((attempt) => ({
      date: new Date(attempt.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: attempt.percentage,
      title: attempt.quiz?.title || 'Quiz',
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 transition-colors min-h-screen">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-800">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your performance progress and start new skill assessments.
          </p>
        </div>
      </div>

      {/* Overview stats grids */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-xl font-bold text-slate-800">
              {attempts.length}
            </div>
            <div className="text-xs text-slate-400">Assessments Run</div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/5 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-xl font-bold text-slate-800">
              {attempts.filter((a) => a.passed).length}
            </div>
            <div className="text-xs text-slate-400">Passed Marks</div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/5 text-amber-600">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-xl font-bold text-slate-800">
              {attempts.reduce((sum, a) => sum + a.score, 0)}
            </div>
            <div className="text-xs text-slate-400">Cumulative Score</div>
          </div>
        </div>
      </div>

      {/* Row containing Chart & Badges */}
      <div className="grid gap-6 lg:grid-cols-12 mb-10">
        {/* Performance Chart */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-display text-sm font-bold text-slate-800 mb-4">
            Score Percentage Trend (%)
          </h3>
          <div className="h-64 w-full">
            {loadingAttempts ? (
              <div className="flex h-full items-center justify-center">
                <Loader />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#FFF', fontSize: '11px' }}
                    formatter={(value) => [`${value}%`, 'Score']}
                  />
                  <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ strokeWidth: 2, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-xs text-slate-400">
                Attempt assessments to populate score progression trends.
              </div>
            )}
          </div>
        </div>
        {/* Badges Panel */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-display text-sm font-bold text-slate-800 mb-4">
            Earned Badges ({earnedBadges.length})
          </h3>
          <div className="space-y-3.5 max-h-[256px] overflow-y-auto pr-1">
            {earnedBadges.length > 0 ? (
              earnedBadges.map((badge, idx) => (
                <div key={idx} className={`flex items-center gap-3 rounded-xl p-3 border border-slate-150/40 ${badge.color}`}>
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <div className="text-xs font-bold">{badge.name}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{badge.desc}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-48 flex-col items-center justify-center text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                🎖️
                <span className="mt-1">No badges unlocked yet.</span>
                <span className="text-[10px] text-slate-400/80 mt-0.5">Submit your first passing test to unlock.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available assessments section */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="font-display text-xl font-bold text-slate-800">
            Available Assessments
          </h2>
          {/* Filters area */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search assessments..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs focus:border-primary" />
            </div>
            {/* Difficulty select */}
            <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
        {loadingQuizzes ? (
          <div className="flex h-36 items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : filteredQuizzes.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => (
              <QuizCard key={quiz._id} quiz={quiz} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-xs text-slate-400">
            No matching published assessments found.
          </div>
        )}
      </div>

      {/* Attempt History Section */}
      <div className="mb-10">
        <h2 className="font-display text-xl font-bold text-slate-800 mb-6">
          Your Attempt History
        </h2>
        {loadingAttempts ? (
          <div className="flex h-24 items-center justify-center">
            <Loader />
          </div>
        ) : attempts.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500">
                  <th className="px-6 py-4">Assessment Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4 text-center">Result</th>
                  <th className="px-6 py-4 text-center">Time Spent</th>
                  <th className="px-6 py-4">Date Submitted</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {attempts.map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {attempt.quiz?.title || 'Deleted Quiz'}
                    </td>
                    <td className="px-6 py-4">{attempt.quiz?.category || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        {attempt.quiz?.difficulty || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold">
                      {attempt.score}/{attempt.totalMarks}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        ({attempt.percentage}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          attempt.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {attempt.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono">
                      {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(attempt.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/quiz/${attempt.quiz?._id || attempt.quiz}/result?attemptId=${attempt._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" /> Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
            You have not attempted any assessments yet. Click on an available card to begin!
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
