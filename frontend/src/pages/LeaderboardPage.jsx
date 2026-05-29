import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../utils/api.js";
import Loader from "../components/common/Loader.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import { Trophy, Clock, ArrowLeft, Flame, Eye, Users } from "lucide-react";

const LeaderboardPage = () => {
  const { quizId } = useParams();
  const socket = useSocket();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizDetails, setQuizDetails] = useState(null);
  const [activeCount, setActiveCount] = useState(0);

  // Fetch initial leaderboard rankings
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const url = quizId ? `/leaderboard/${quizId}` : '/leaderboard';
        const response = await API.get(url);
        if (response.data.success) {
          setLeaderboard(response.data.leaderboard);
        }
        // Fetch quiz details if quizId is defined
        if (quizId) {
          const quizRes = await API.get(`/quizzes/${quizId}`);
          if (quizRes.data.success) {
            setQuizDetails(quizRes.data.quiz);
          }
        }
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [quizId]);

  // Socket.IO real-time event handlers
  useEffect(() => {
    if (!socket) return;
    if (quizId) {
      // 1. Join room for the specific quiz
      socket.emit('joinQuizLeaderboard', { quizId });

      // 2. Listen for live updates when submissions complete
      socket.on('leaderboardUpdate', (data) => {
        if (data.quizId.toString() === quizId.toString()) {
          console.log('Live leaderboard update received:', data.leaderboard);
          setLeaderboard(data.leaderboard);
        }
      });

      // 3. Listen for active participant increments/decrements
      socket.on('activeParticipants', (data) => {
        setActiveCount(data.count);
      });
    } else {
      // Listen for global leaderboard updates
      socket.on('globalLeaderboardUpdate', (data) => {
        console.log('Live global leaderboard update received:', data.globalLeaderboard);
        setLeaderboard(data.globalLeaderboard);
      });
    }

    // Cleanup on unmount or URL switch
    return () => {
      if (quizId) {
        socket.emit('leaveQuizLeaderboard');
        socket.off('leaderboardUpdate');
        socket.off('activeParticipants');
      } else {
        socket.off('globalLeaderboardUpdate');
      }
    };
  }, [socket, quizId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader size="lg"/>
      </div>
    );
  }

  const isQuizScope = !!quizId;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 transition-colors min-h-screen">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft className="h-4 w-4"/> Back to Dashboard
      </Link>
      {/* Header card area */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <Trophy className="h-6 w-6"/>
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold text-slate-800">
                {isQuizScope ? `${quizDetails?.title ||'Quiz'} Leaderboard` :'Global Leaderboard'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {isQuizScope ?'Ranked by highest score, then by minimal execution duration':'Ranked by cumulative developer scores across all run attempts'}
              </p>
            </div>
          </div>
          {isQuizScope && (
            <div className="flex items-center gap-2 rounded-xl bg-orange-50 border border-orange-200 px-4 py-2">
              <Flame className="h-4.5 w-4.5 text-orange-500 animate-pulse"/>
              <div className="text-left">
                <span className="block text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                  Active Candidates
                </span>
                <span className="font-mono text-xs font-bold text-orange-700">
                  {activeCount} Live Testing
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Leaderboard Table list */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500">
              <th className="px-6 py-4 text-center w-20">Rank</th>
              <th className="px-6 py-4">Developer</th>
              {isQuizScope ? (
                <>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4 text-center">Time Taken</th>
                  <th className="px-6 py-4">Submission Date</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4 text-center">Cumulative Score</th>
                  <th className="px-6 py-4 text-center">Attempts</th>
                  <th className="px-6 py-4 text-center">Passes</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-655">
            {leaderboard.length > 0 ? (
              leaderboard.map((row) => {
                const rankStyles = {
                  1:'bg-amber-100 text-amber-800 border-amber-300',
                  2:'bg-slate-100 text-slate-850 border-slate-300',
                  3:'bg-orange-100 text-orange-800 border-orange-300',
                };
                const rankClass = rankStyles[row.rank] ||'bg-slate-50 text-slate-500 border-slate-100';
                return (
                  <tr key={row.rank} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-center font-bold">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md border text-[10px] font-bold ${rankClass}`}>
                        {row.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {row.name}
                    </td>
                    {isQuizScope ? (
                      <>
                        <td className="px-6 py-4 text-center font-mono font-bold text-primary">
                          {row.score} / {row.totalMarks}
                        </td>
                        <td className="px-6 py-4 text-center font-mono">
                          {Math.floor(row.timeTaken / 60)}m {row.timeTaken % 60}s
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(row.submittedAt).toLocaleDateString(undefined, {
                            month:'short',
                            day:'numeric',
                            hour:'2-digit',
                            minute:'2-digit',
                          })}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-center font-mono font-bold text-primary">
                          {row.totalScore} pts
                        </td>
                        <td className="px-6 py-4 text-center">{row.quizzesAttempted}</td>
                        <td className="px-6 py-4 text-center text-emerald-600">
                          {row.quizzesPassed}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isQuizScope ? 5 : 5} className="px-6 py-10 text-center text-slate-400">
                  No ranking records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPage;
