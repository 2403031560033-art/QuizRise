import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import API from "../utils/api.js";
import Loader from "../components/common/Loader.jsx";
import {
  ArrowLeft,
  Clock,
  Award,
  BookOpen,
  AlertTriangle,
  Play,
  HelpCircle,
} from "lucide-react";
const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const response = await API.get(`/quizzes/${id}`);
        if (response.data.success) {
          setQuiz(response.data.quiz);
        }
      } catch (err) {
        console.error("Error fetching quiz details:", err);
        setError(err.response?.data?.message || "Error loading quiz details.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizDetails();
  }, [id]);
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        {" "}
        <Loader size="lg" />{" "}
      </div>
    );
  }
  if (error || !quiz) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        {" "}
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs font-semibold text-rose-800">
          {" "}
          {error || "Quiz not found."}{" "}
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
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 bg-slate-50 transition-colors min-h-screen">
      {" "}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-6"
      >
        {" "}
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard{" "}
      </Link>{" "}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
        {" "}
        {/* Category & Title */}{" "}
        <span className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          {" "}
          {quiz.category}{" "}
        </span>{" "}
        <h1 className="mt-4 font-display text-2xl sm:text-3xl font-extrabold text-slate-800">
          {" "}
          {quiz.title}{" "}
        </h1>{" "}
        <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-500">
          {" "}
          {quiz.description}{" "}
        </p>{" "}
        {/* Highlight details box */}{" "}
        <div className="mt-8 grid gap-4 grid-cols-3 border-t border-b border-slate-100 py-6">
          {" "}
          <div className="text-center">
            {" "}
            <div className="flex justify-center text-primary mb-1">
              {" "}
              <Clock className="h-5 w-5" />{" "}
            </div>{" "}
            <div className="font-display text-base font-bold text-slate-800">
              {" "}
              {quiz.duration} Mins{" "}
            </div>{" "}
            <div className="text-[10px] text-slate-400">Time Limit</div>{" "}
          </div>{" "}
          <div className="text-center border-l border-r border-slate-100">
            {" "}
            <div className="flex justify-center text-primary mb-1">
              {" "}
              <BookOpen className="h-5 w-5" />{" "}
            </div>{" "}
            <div className="font-display text-base font-bold text-slate-800">
              {" "}
              {quiz.questions?.length || 0}{" "}
            </div>{" "}
            <div className="text-[10px] text-slate-400">Questions</div>{" "}
          </div>{" "}
          <div className="text-center">
            {" "}
            <div className="flex justify-center text-primary mb-1">
              {" "}
              <Award className="h-5 w-5" />{" "}
            </div>{" "}
            <div className="font-display text-base font-bold text-slate-800">
              {" "}
              {quiz.totalMarks} Marks{" "}
            </div>{" "}
            <div className="text-[10px] text-slate-400">Total Score</div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Warning Disclaimers */}{" "}
        <div className="mt-8 space-y-4">
          {" "}
          <h3 className="font-display text-xs font-bold text-slate-700 uppercase tracking-wider">
            {" "}
            Rules & Instructions{" "}
          </h3>{" "}
          <div className="space-y-3.5">
            {" "}
            <div className="flex items-start gap-2 text-xs text-slate-500">
              {" "}
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-500">
                {" "}
                1{" "}
              </div>{" "}
              <span>
                The timer starts the moment you click"Begin Assessment". It runs
                continuously and will auto-submit when remaining time reaches
                zero.
              </span>{" "}
            </div>{" "}
            {quiz.negativeMarking ? (
              <div className="flex items-start gap-2 text-xs text-slate-500">
                {" "}
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-rose-50 text-rose-500">
                  {" "}
                  <AlertTriangle className="h-3.5 w-3.5" />{" "}
                </div>{" "}
                <span>
                  {" "}
                  <strong>Negative Marking Enabled:</strong> Each incorrect
                  answer deducts 1 point (or the question's set negative mark
                  value) from your score. Skipped questions score 0 points.{" "}
                </span>{" "}
              </div>
            ) : (
              <div className="flex items-start gap-2 text-xs text-slate-500">
                {" "}
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-500">
                  {" "}
                  2{" "}
                </div>{" "}
                <span>
                  No negative marking is enabled for this assessment.
                  Unanswered/Incorrect options score 0.
                </span>{" "}
              </div>
            )}{" "}
            <div className="flex items-start gap-2 text-xs text-slate-500">
              {" "}
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-rose-50 text-rose-500">
                {" "}
                <AlertTriangle className="h-3.5 w-3.5" />{" "}
              </div>{" "}
              <span>
                {" "}
                <strong>Anti-Cheating Trigger:</strong> Do not leave the active
                window or switch browser tabs. Swapping tabs triggers warning
                popups. Leaving more than 3 times will trigger immediate
                automatic submission.{" "}
              </span>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Buttons Action */}{" "}
        <div className="mt-10 flex gap-3">
          {" "}
          <Link
            to="/dashboard"
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            {" "}
            Cancel{" "}
          </Link>{" "}
          <button
            onClick={() => navigate(`/quiz/${quiz._id}/attempt`)}
            className="flex-[2] rounded-xl bg-primary py-3.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-1.5"
          >
            {" "}
            <Play className="h-4 w-4" /> Begin Assessment{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default QuizDetail;
