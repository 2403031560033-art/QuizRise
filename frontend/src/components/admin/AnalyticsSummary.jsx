import React from "react";
import { Users, BookOpen, Percent, Award } from "lucide-react";
const AnalyticsSummary = ({ metrics }) => {
  const cards = [
    {
      title: "Total Active Users",
      value: metrics.totalUsers || 0,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
      description: "Standard student registrations",
    },
    {
      title: "Total Quiz Runs",
      value: metrics.totalAttempts || 0,
      icon: BookOpen,
      color: "text-indigo-600 bg-indigo-50",
      description: "Completed exam submissions",
    },
    {
      title: "Platform Pass Rate",
      value: `${metrics.passRate || 0}%`,
      icon: Percent,
      color: "text-emerald-600 bg-emerald-50",
      description: "Scores exceeding passing limits",
    },
    {
      title: "Avg Submission Score",
      value: metrics.averageScore || 0,
      icon: Award,
      color: "text-amber-600 bg-amber-50",
      description: "Weighted score average",
    },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {" "}
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors"
          >
            {" "}
            <div className="flex items-center justify-between">
              {" "}
              <span className="text-xs font-semibold text-slate-500">
                {" "}
                {card.title}{" "}
              </span>{" "}
              <div className={`rounded-xl p-2.5 ${card.color}`}>
                {" "}
                <Icon className="h-5 w-5" />{" "}
              </div>{" "}
            </div>{" "}
            <div className="mt-4">
              {" "}
              <span className="font-display text-2xl font-bold tracking-tight text-slate-800">
                {" "}
                {card.value}{" "}
              </span>{" "}
              <p className="mt-1 text-[10px] text-slate-400">
                {" "}
                {card.description}{" "}
              </p>{" "}
            </div>{" "}
          </div>
        );
      })}{" "}
    </div>
  );
};
export default AnalyticsSummary;
