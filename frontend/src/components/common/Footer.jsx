import React from "react";
const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 transition-colors">
      {" "}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {" "}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {" "}
          {/* Logo & Tagline */}{" "}
          <div className="flex flex-col items-center gap-1 sm:items-start">
            {" "}
            <span className="font-display text-lg font-bold text-slate-800">
              {" "}
              Quiz<span className="text-primary">Rise</span>{" "}
            </span>{" "}
            <span className="text-xs text-slate-500">
              {" "}
              High-fidelity online quiz & assessment engine.{" "}
            </span>{" "}
          </div>{" "}
          {/* Copyright info */}{" "}
          <div className="text-center sm:text-right">
            {" "}
            <p className="text-xs text-slate-400">
              {" "}
              &copy; {new Date().getFullYear()} QuizRise Platform. All rights
              reserved.{" "}
            </p>{" "}
            <p className="mt-1 text-[10px] text-slate-300">
              {" "}
              Confidential — Certified for internal evaluations and academic
              examinations.{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </footer>
  );
};
export default Footer;
