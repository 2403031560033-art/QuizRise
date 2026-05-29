import React from "react";
const QuestionBlock = ({
  question,
  selectedOption,
  onSelectOption,
  questionNumber,
}) => {
  const optionPrefixes = ["A", "B", "C", "D"];
  return (
    <div className="fade-in rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {" "}
      {/* Title Header with Mark Details */}{" "}
      <div className="flex items-start justify-between gap-4">
        {" "}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
          {" "}
          {questionNumber}{" "}
        </span>{" "}
        <h2 className="flex-1 text-base font-semibold leading-relaxed text-slate-800">
          {" "}
          {question.question}{" "}
        </h2>{" "}
        <div className="flex flex-col items-end gap-1">
          {" "}
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
            {" "}
            +{question.marks || 4} Marks{" "}
          </span>{" "}
          {question.negativeMark > 0 && (
            <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-500">
              {" "}
              -{question.negativeMark || 1} Neg{" "}
            </span>
          )}{" "}
        </div>{" "}
      </div>{" "}
      {/* Options Selection Grid */}{" "}
      <div className="mt-8 space-y-3.5">
        {" "}
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          return (
            <button
              key={idx}
              onClick={() => onSelectOption(idx)}
              className={`flex w-full items-center gap-3.5 rounded-xl border p-4 text-left text-sm font-medium transition-all ${isSelected ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"}`}
            >
              {" "}
              {/* Option label prefix bubble */}{" "}
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold transition-all ${isSelected ? "bg-primary text-white" : "bg-white text-slate-500 border border-slate-200"}`}
              >
                {" "}
                {optionPrefixes[idx]}{" "}
              </div>{" "}
              <span className={isSelected ? "text-primary" : "text-slate-700"}>
                {" "}
                {option}{" "}
              </span>{" "}
            </button>
          );
        })}{" "}
      </div>{" "}
    </div>
  );
};
export default QuestionBlock;
