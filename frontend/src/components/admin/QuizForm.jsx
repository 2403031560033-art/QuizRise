import React, { useState, useEffect } from "react";
import API from "../../utils/api.js";
import Loader from "../common/Loader.jsx";
import { Save, ArrowLeft, Plus, Trash2, Edit3, X } from "lucide-react";
import BulkUpload from "./BulkUpload.jsx";

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
    questions: [],
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  // Question Modal State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [questionData, setQuestionData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    marks: 4,
    negativeMark: 1,
  });

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
            questions: quiz.questions || [],
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

  const handleOpenQuestionModal = (index = null) => {
    if (index !== null) {
      setEditingQuestionIndex(index);
      setQuestionData({ ...formData.questions[index] });
    } else {
      setEditingQuestionIndex(null);
      setQuestionData({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
        marks: 4,
        negativeMark: 1,
      });
    }
    setShowQuestionModal(true);
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setQuestionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionData.options];
    newOptions[index] = value;
    setQuestionData((prev) => ({ ...prev, options: newOptions }));
  };

  const handleSaveQuestion = () => {
    if (!questionData.question || questionData.options.some((o) => !o) || !questionData.explanation) {
      setError("Please fill out all question fields and options.");
      return;
    }
    setError(null);
    const newQuestions = [...formData.questions];
    if (editingQuestionIndex !== null) {
      newQuestions[editingQuestionIndex] = questionData;
    } else {
      newQuestions.push(questionData);
    }
    setFormData({ ...formData, questions: newQuestions });
    setShowQuestionModal(false);
  };

  const handleDeleteQuestion = (index) => {
    if (!window.confirm("Delete this question?")) return;
    const newQuestions = [...formData.questions];
    newQuestions.splice(index, 1);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const parsedTags = formData.tags
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
        response = await API.put(`/quizzes/${quizId}`, payload);
      } else {
        response = await API.post("/quizzes", payload);
      }
      if (response.data.success) {
        onSaveSuccess(response.data.quiz);
      }
    } catch (err) {
      console.error("Submit quiz form error:", err);
      setError(
        err.response?.data?.message || "Error saving quiz configurations."
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg font-bold text-slate-800">
          {quizId ? "Edit Quiz Config & Questions" : "Create New Assessment"}
        </h3>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>
      
      {error && (
        <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700">Quiz Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g. JavaScript Core ES6+"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-primary focus:bg-white"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            placeholder="Provide a detailed overview of what topics this assessment covers..."
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-primary focus:bg-white"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="e.g. Backend Development"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-primary focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700">Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-primary focus:bg-white"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700">Duration (Minutes)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              min={1}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-primary focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700">Passing Score Threshold</label>
            <input
              type="number"
              name="passingScore"
              value={formData.passingScore}
              onChange={handleChange}
              required
              min={0}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-primary focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700">Tags (comma-separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. JavaScript, ES6, OOP"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-primary focus:bg-white"
          />
        </div>

        <div className="flex flex-col gap-3 py-2 border-t border-slate-100">
          <label className="flex items-center gap-3.5 cursor-pointer">
            <input
              type="checkbox"
              name="negativeMarking"
              checked={formData.negativeMarking}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700">Enable Negative Marking</span>
              <span className="text-[10px] text-slate-400">Deduct -1 point for incorrect options. Skipped questions score 0.</span>
            </div>
          </label>
          
          <label className="flex items-center gap-3.5 cursor-pointer mt-2">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700">Publish quiz immediately</span>
              <span className="text-[10px] text-slate-400">If published, students will see this quiz in their feed instantly.</span>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-3.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-dark transition-all disabled:opacity-55"
        >
          {loading ? <Loader size="sm" color="white" /> : <><Save className="h-4.5 w-4.5" /> Save Configuration & Questions</>}
        </button>
      </form>

      {/* Manual Questions Management UI */}
      <div className="mt-8 border-t border-slate-100 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-display text-base font-bold text-slate-800">Manual Questions ({formData.questions.length})</h4>
          <button
            type="button"
            onClick={() => handleOpenQuestionModal()}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Question
          </button>
        </div>

        {formData.questions.length > 0 ? (
          <div className="space-y-3">
            {formData.questions.map((q, idx) => (
              <div key={idx} className="flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50/30 p-4">
                <div className="w-full pr-4">
                  <h5 className="text-xs font-bold text-slate-800 leading-relaxed">{idx + 1}. {q.question}</h5>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className={`text-[10px] p-2 rounded-lg ${Number(q.correctAnswer) === oIdx ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold' : 'bg-white border border-slate-100 text-slate-600'}`}>
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => handleOpenQuestionModal(idx)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Edit Question">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => handleDeleteQuestion(idx)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-destructive" title="Delete Question">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
            No questions added manually. Add a question or upload a CSV below.
          </div>
        )}
      </div>

      {/* CSV Bulk Upload Integrated */}
      {quizId && (
        <div className="mt-8 border-t border-slate-100 pt-6">
          <BulkUpload 
            quizId={quizId} 
            onUploadSuccess={(quizObj) => {
              // Update questions state if CSV uploaded successfully
              setFormData((prev) => ({ ...prev, questions: quizObj.questions }));
            }} 
          />
        </div>
      )}

      {/* Manual Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-bold text-slate-800">
                {editingQuestionIndex !== null ? "Edit Question" : "Add New Question"}
              </h3>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Question Text</label>
                <textarea
                  name="question"
                  value={questionData.question}
                  onChange={handleQuestionChange}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-primary focus:bg-white"
                  placeholder="Enter the question here..."
                />
              </div>

              {/* Options */}
              <div className="grid gap-3 sm:grid-cols-2">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index}>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Option {String.fromCharCode(65 + index)}</label>
                    <input
                      type="text"
                      value={questionData.options[index]}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className={`w-full rounded-xl border px-3 py-2 text-xs focus:border-primary focus:bg-white ${Number(questionData.correctAnswer) === index ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50'}`}
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                ))}
              </div>

              {/* Correct Answer & Marks */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Correct Option</label>
                  <select
                    name="correctAnswer"
                    value={questionData.correctAnswer}
                    onChange={handleQuestionChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs focus:border-primary focus:bg-white"
                  >
                    <option value={0}>Option A</option>
                    <option value={1}>Option B</option>
                    <option value={2}>Option C</option>
                    <option value={3}>Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Marks</label>
                  <input
                    type="number"
                    name="marks"
                    value={questionData.marks}
                    onChange={handleQuestionChange}
                    min={1}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs focus:border-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Negative Mark</label>
                  <input
                    type="number"
                    name="negativeMark"
                    value={questionData.negativeMark}
                    onChange={handleQuestionChange}
                    min={0}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs focus:border-primary focus:bg-white"
                  />
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Explanation</label>
                <textarea
                  name="explanation"
                  value={questionData.explanation}
                  onChange={handleQuestionChange}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs focus:border-primary focus:bg-white"
                  placeholder="Explain why the answer is correct..."
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setShowQuestionModal(false)}
                className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuestion}
                className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition-all"
              >
                {editingQuestionIndex !== null ? "Update Question" : "Add Question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizForm;
