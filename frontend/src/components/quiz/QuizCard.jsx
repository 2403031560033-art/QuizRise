import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, Award, ChevronRight, BarChart } from "lucide-react";
const QuizCard = ({ quiz }) => {
  const difficultyColors = {
    Easy: "bg-emerald-50 text-emerald-700",
    Medium: "bg-amber-50 text-amber-700",
    Hard: "bg-rose-50 text-rose-700",
  };
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      {" "}
      <div>
        {" "}
        {/* Header Badges */}{" "}
        <div className="flex items-center justify-between gap-2">
          {" "}
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {" "}
            {quiz.category}{" "}
          </span>{" "}
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${difficultyColors[quiz.difficulty] || "bg-slate-100"}`}
          >
            {" "}
            {quiz.difficulty}{" "}
          </span>{" "}
        </div>{" "}
        {/* Title & Description */}{" "}
        <h3 className="mt-4 font-display text-lg font-bold text-slate-800">
          {" "}
          {quiz.title}{" "}
        </h3>{" "}
        <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-2">
          {" "}
          {quiz.description}{" "}
        </p>{" "}
      </div>{" "}
      {/* Meta Infos Row */}{" "}
      <div className="mt-6 border-t border-slate-100 pt-4">
        {" "}
        <div className="flex items-center justify-between text-xs text-slate-500">
          {" "}
          <div className="flex items-center gap-1">
            {" "}
            <BookOpen className="h-4 w-4 text-slate-400" />{" "}
            <span>{quiz.totalMarks} Marks</span>{" "}
          </div>{" "}
          <div className="flex items-center gap-1">
            {" "}
            <Clock className="h-4 w-4 text-slate-400" />{" "}
            <span>{quiz.duration} Mins</span>{" "}
          </div>{" "}
          <div className="flex items-center gap-1">
            {" "}
            <BarChart className="h-4 w-4 text-slate-400" />{" "}
            <span>{quiz.attemptsCount || 0} Runs</span>{" "}
          </div>{" "}
        </div>{" "}
        {/* Action Link Button */}{" "}
        <Link
          to={`/quizzes/${quiz._id}`}
          className="mt-5 flex w-full items-center justify-center gap-1 rounded-xl bg-slate-50 border border-slate-200 py-2.5 text-xs font-bold text-slate-700 transition-all hover:border-primary hover:bg-primary hover:text-white"
        >
          {" "}
          View Assessment <ChevronRight className="h-4 w-4" />{" "}
        </Link>{" "}
      </div>{" "}
    </div>
  );
};
export default QuizCard;
