import React, { useState, useEffect } from "react";
import API from "../../utils/api.js";
import Loader from "../common/Loader.jsx";
import { Save, ArrowLeft, ToggleLeft, ToggleRight } from "lucide-react";
const QuizForm = ({ quizId, onSaveSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "Easy",
    duration: 10,
    passingScore: 10,
    negativeMarking: true,
    isPublished: false,
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!quizId) return;
    const fetchQuizDetails = async () => {
      setFetching(true);
      try {
        const response = await API.get(`/quizzes/${quizId}`);
        if (response.data.success) {
          const quiz = response.data.quiz;
          setFormData({
            title: quiz.title,
            description: quiz.description,
            category: quiz.category,
            difficulty: quiz.difficulty,
            duration: quiz.duration,
            passingScore: quiz.passingScore,
            negativeMarking: quiz.negativeMarking,
            isPublished: quiz.isPublished,
            tags: quiz.tags ? quiz.tags.join(",") : "",
          });
        }
      } catch (err) {
        console.error("Fetch quiz form error:", err);
        setError("Error fetching quiz details.");
      } finally {
        setFetching(false);
      }
    };
    fetchQuizDetails();
  }, [quizId]);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);{/* Format tags from comma-separated string to array */}const parsedTags =
      formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    const payload = {
      ...formData,
      duration: parseInt(formData.duration, 10),
      passingScore: parseInt(formData.passingScore, 10),
      tags: parsedTags,
    };
    try {
      let response;
      if (quizId) {
{/* Edit Mode */}response = await API.put(`/quizzes/${quizId}`, payload);
      } else {
{/* Create Mode */}response = await API.post("/quizzes", payload);
      }
      if (response.data.success) {
        onSaveSuccess(response.data.quiz);
      }
    } catch (err) {
      console.error("Submit quiz form error:", err);
      setError(
        err.response?.data?.message || "Error saving quiz configurations.",
      );
    } finally {
      setLoading(false);
    }
  };
  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        {" "}
        <Loader size="lg" />{" "}
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      {" "}
      <div className="flex items-center justify-between mb-6">
        {" "}
        <h3 className="font-display text-lg font-bold text-slate-800">
          {" "}
          {quizId ? "Edit Quiz Config" : "Create New Assessment"}{" "}
        </h3>{" "}
        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          {" "}
          <ArrowLeft className="h-4 w-4" /> Back{" "}
        </button>{" "}
      </div>{" "}
      {error && (
        <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800">
          {" "}
          {error}{" "}
        </div>
      )}{" "}
      <form onSubmit={handleSubmit} className="space-y-4">
        {" "}
        {/* Title */}{" "}
        <div>
          {" "}
          <label className="block text-xs font-bold text-slate-700">
            {" "}
            Quiz Title{" "}
          </label>{" "}
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g. JavaScript Core ES6+"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-primary focus:bg-white"
          />{" "}
        </div>{" "}
        {/* Description */}{" "}
        <div>
          {" "}
          <label className="block text-xs font-bold text-slate-700">
            {" "}
            Description{" "}
          </label>{" "}
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Provide a detailed overview of what topics this assessment covers..."
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-primary focus:bg-white"
          />{" "}
        </div>{" "}
        {/* Grid for parameters */}{" "}
        <div className="grid gap-4 sm:grid-cols-2">
          {" "}
          {/* Category */}{" "}
          <div>
            {" "}
            <label className="block text-xs font-bold text-slate-700">
              {" "}
              Category{" "}
            </label>{" "}
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="e.g. Backend Development"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-primary focus:bg-white"
            />{" "}
          </div>{" "}
          {/* Difficulty */}{" "}
          <div>
            {" "}
            <label className="block text-xs font-bold text-slate-700">
              {" "}
              Difficulty{" "}
            </label>{" "}
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-primary focus:bg-white"
            >
              {" "}
              <option value="Easy">Easy</option>{" "}
              <option value="Medium">Medium</option>{" "}
              <option value="Hard">Hard</option>{" "}
            </select>{" "}
          </div>{" "}
          {/* Duration (mins) */}{" "}
          <div>
            {" "}
            <label className="block text-xs font-bold text-slate-700">
              {" "}
              Duration (Minutes){" "}
            </label>{" "}
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              min={1}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-primary focus:bg-white"
            />{" "}
          </div>{" "}
          {/* Passing Score */}{" "}
          <div>
            {" "}
            <label className="block text-xs font-bold text-slate-700">
              {" "}
              Passing Score Threshold{" "}
            </label>{" "}
            <input
              type="number"
              name="passingScore"
              value={formData.passingScore}
              onChange={handleChange}
              required
              min={0}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-primary focus:bg-white"
            />{" "}
          </div>{" "}
        </div>{" "}
        {/* Tags */}{" "}
        <div>
          {" "}
          <label className="block text-xs font-bold text-slate-700">
            {" "}
            Tags (comma-separated){" "}
          </label>{" "}
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. JavaScript, ES6, OOP"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-primary focus:bg-white"
          />{" "}
        </div>{" "}
        {/* Checkbox Options */}{" "}
        <div className="flex flex-col gap-3 py-2 border-t border-slate-100">
          {" "}
          {/* Negative Marking */}{" "}
          <label className="flex items-center gap-3.5 cursor-pointer">
            {" "}
            <input
              type="checkbox"
              name="negativeMarking"
              checked={formData.negativeMarking}
              onChange={handleChange}
              className="sr-only peer"
            />{" "}
            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />{" "}
            <div className="flex flex-col">
              {" "}
              <span className="text-xs font-bold text-slate-700">
                {" "}
                Enable Negative Marking{" "}
              </span>{" "}
              <span className="text-[10px] text-slate-400">
                {" "}
                Deduct -1 point for incorrect options. Skipped questions score
                0.{" "}
              </span>{" "}
            </div>{" "}
          </label>{" "}
          {/* Publish Quiz */}{" "}
          <label className="flex items-center gap-3.5 cursor-pointer mt-2">
            {" "}
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="sr-only peer"
            />{" "}
            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success" />{" "}
            <div className="flex flex-col">
              {" "}
              <span className="text-xs font-bold text-slate-700">
                {" "}
                Publish quiz immediately{" "}
              </span>{" "}
              <span className="text-[10px] text-slate-400">
                {" "}
                If published, students will see this quiz in their feed
                instantly.{" "}
              </span>{" "}
            </div>{" "}
          </label>{" "}
        </div>{" "}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-3.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-dark transition-all disabled:opacity-55"
        >
          {" "}
          {loading ? (
            <Loader size="sm" color="white" />
          ) : (
            <>
              {" "}
              <Save className="h-4.5 w-4.5" /> Save Configuration{" "}
            </>
          )}{" "}
        </button>{" "}
      </form>{" "}
    </div>
  );
};
export default QuizForm;
