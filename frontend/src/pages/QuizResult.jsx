import React, { useState, useEffect } from "react";
import { useLocation, Link, useParams } from "react-router-dom";
import API from "../utils/api.js";
import Loader from "../components/common/Loader.jsx";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Trophy,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
const QuizResult = () => {
  const { id: quizId } = useParams();
  const location = useLocation();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  // Parse attemptId from url query search parameters
  const queryParams = new URLSearchParams(location.search);
  const attemptId = queryParams.get("attemptId");
  useEffect(() => {
    if (!attemptId) {
      setError("Invalid Attempt ID references.");
      setLoading(false);
      return;
    }
    const fetchAttemptResult = async () => {
      try {
        const response = await API.get(`/attempts/${attemptId}`);
        if (response.data.success) {
          setAttempt(response.data.attempt);
        }
      } catch (err) {
        console.error("Error fetching attempt results:", err);
        setError(
          err.response?.data?.message || "Error loading attempt results.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAttemptResult();
  }, [attemptId]);
  const toggleExpandQuestion = (idx) => {
    setExpandedQuestion(expandedQuestion === idx ? null : idx);
  };
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        {" "}
        <Loader size="lg" />{" "}
      </div>
    );
  }
  if (error || !attempt) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        {" "}
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs font-semibold text-rose-800">
          {" "}
          {error || "Attempt result error."}{" "}
        </div>{" "}
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          {" "}
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard{" "}
        </Link>{" "}
      </div>
    );
  }
  const optionPrefixes = ["A", "B", "C", "D"];
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 transition-colors min-h-screen">
      {" "}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-6"
      >
        {" "}
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard{" "}
      </Link>{" "}
      {/* Result Card Banner */}{" "}
      <div
        className={`rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors text-center ${attempt.passed ? "border-emerald-200 bg-emerald-50/50" : "border-rose-200 bg-rose-50/50"}`}
      >
        {" "}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4">
          {" "}
          {attempt.passed ? (
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          ) : (
            <XCircle className="h-10 w-10 text-rose-500" />
          )}{" "}
        </div>{" "}
        <h1 className="font-display text-2xl font-extrabold text-slate-800">
          {" "}
          {attempt.passed ? "Assessment Passed! 🎉" : "Assessment Failed"}{" "}
        </h1>{" "}
        <p className="text-xs text-slate-500 mt-1"> {attempt.quizTitle} </p>{" "}
        {/* Score metrics bar */}{" "}
        <div className="mt-8 grid gap-4 grid-cols-3 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          {" "}
          <div className="text-center">
            {" "}
            <div className="flex justify-center text-primary mb-1">
              {" "}
              <Trophy className="h-4.5 w-4.5" />{" "}
            </div>{" "}
            <div className="font-display text-base font-bold text-slate-800">
              {" "}
              {attempt.score} / {attempt.totalMarks}{" "}
            </div>{" "}
            <div className="text-[9px] text-slate-400">
              Score ({attempt.percentage}%)
            </div>{" "}
          </div>{" "}
          <div className="text-center border-l border-r border-slate-100">
            {" "}
            <div className="flex justify-center text-primary mb-1">
              {" "}
              <Clock className="h-4.5 w-4.5" />{" "}
            </div>{" "}
            <div className="font-display text-base font-bold text-slate-800">
              {" "}
              {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}
              s{" "}
            </div>{" "}
            <div className="text-[9px] text-slate-400">Time Taken</div>{" "}
          </div>{" "}
          <div className="text-center">
            {" "}
            <div className="flex justify-center text-primary mb-1">
              {" "}
              <Calendar className="h-4.5 w-4.5" />{" "}
            </div>{" "}
            <div className="font-display text-base font-bold text-slate-800">
              {" "}
              {new Date(attempt.submittedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}{" "}
            </div>{" "}
            <div className="text-[9px] text-slate-400">Completed Date</div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Action button */}{" "}
        <div className="mt-6 flex justify-center gap-3">
          {" "}
          <Link
            to={`/leaderboard/${attempt.quizId}`}
            className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition-colors"
          >
            {" "}
            Check Quiz Leaderboard{" "}
          </Link>{" "}
        </div>{" "}
      </div>{" "}
      {/* Solutions & Explanations review */}{" "}
      <div className="mt-10">
        {" "}
        <h2 className="font-display text-lg font-bold text-slate-850 mb-6">
          {" "}
          Questions Review{" "}
        </h2>{" "}
        <div className="space-y-4">
          {" "}
          {attempt.questions.map((q, idx) => {
            const isCorrect = q.isCorrect;
            const isUnanswered = q.userSelection === null;
            const isExpanded = expandedQuestion === idx;
            return (
              <div
                key={q._id}
                className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
              >
                {" "}
                {/* Header collapse strip */}{" "}
                <button
                  onClick={() => toggleExpandQuestion(idx)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/50"
                >
                  {" "}
                  <div className="flex items-start gap-3">
                    {" "}
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${isUnanswered ? "bg-slate-100 text-slate-500" : isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                    >
                      {" "}
                      {idx + 1}{" "}
                    </span>{" "}
                    <div>
                      {" "}
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-850 pr-4">
                        {" "}
                        {q.question}{" "}
                      </h3>{" "}
                      <div className="mt-1.5 flex flex-wrap gap-2 text-[10px]">
                        {" "}
                        {isUnanswered ? (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-500">
                            {" "}
                            Skipped / Unanswered{" "}
                          </span>
                        ) : isCorrect ? (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">
                            {" "}
                            Correct (+{q.marks} Marks){" "}
                          </span>
                        ) : (
                          <span className="rounded bg-rose-50 px-1.5 py-0.5 text-rose-700">
                            {" "}
                            Incorrect (-{q.negativeMark} Marks){" "}
                          </span>
                        )}{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>{" "}
                  {isExpanded ? (
                    <ChevronUp className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  )}{" "}
                </button>{" "}
                {/* Collapsed/Expanded pane details */}{" "}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/30 p-5 space-y-4">
                    {" "}
                    {/* Option grids */}{" "}
                    <div className="space-y-2">
                      {" "}
                      {q.options.map((option, oIdx) => {
                        const isSelectedByCandidate = q.userSelection === oIdx;
                        const isCorrectSolution = q.correctAnswer === oIdx;
                        let cardStyle = "border-slate-200 bg-white";
                        if (isCorrectSolution) {
                          cardStyle = "border-emerald-300 bg-emerald-50/20";
                        } else if (isSelectedByCandidate && !isCorrect) {
                          cardStyle = "border-rose-300 bg-rose-50/20";
                        }
                        return (
                          <div
                            key={oIdx}
                            className={`flex items-center gap-3.5 rounded-xl border p-3.5 text-xs font-medium ${cardStyle}`}
                          >
                            {" "}
                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${isCorrectSolution ? "bg-emerald-500 text-white" : isSelectedByCandidate ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500"}`}
                            >
                              {" "}
                              {optionPrefixes[oIdx]}{" "}
                            </div>{" "}
                            <span
                              className={
                                isCorrectSolution
                                  ? "text-slate-850"
                                  : "text-slate-650"
                              }
                            >
                              {" "}
                              {option}{" "}
                            </span>{" "}
                          </div>
                        );
                      })}{" "}
                    </div>{" "}
                    {/* Explanatory notes */}{" "}
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      {" "}
                      <h4 className="text-xs font-bold text-slate-700">
                        {" "}
                        Explanation{" "}
                      </h4>{" "}
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                        {" "}
                        {q.explanation}{" "}
                      </p>{" "}
                    </div>{" "}
                  </div>
                )}{" "}
              </div>
            );
          })}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default QuizResult;
