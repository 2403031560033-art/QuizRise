import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api.js";
import Loader from "../components/common/Loader.jsx";
import Timer from "../components/quiz/Timer.jsx";
import QuestionBlock from "../components/quiz/QuestionBlock.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

const QuizAttempt = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quiz Attempt state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  // { questionIndex: optionIndex }
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Modals & Anti-cheating
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showCheatingWarning, setShowCheatingWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // LocalStorage Key names
  const endTimeKey = `quiz_end_time_${quizId}`;
  const answersKey = `quiz_answers_${quizId}`;

  // 1. Fetch Quiz on mount
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await API.get(`/quizzes/${quizId}`);
        if (response.data.success) {
          setQuiz(response.data.quiz);
          initializeTimer(response.data.quiz.duration);
          restoreAnswers();
        }
      } catch (err) {
        console.error('Error fetching quiz details:', err);
        setError(err.response?.data?.message || 'Error loading quiz details.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  // 2. Initialize or restore timer sync with localStorage
  const initializeTimer = (durationMins) => {
    let endTime = localStorage.getItem(endTimeKey);
    if (!endTime) {
      endTime = Date.now() + durationMins * 60 * 1000;
      localStorage.setItem(endTimeKey, endTime);
    } else {
      endTime = parseInt(endTime, 10);
    }
    const calcRemaining = () => {
      const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setSecondsRemaining(diff);
      if (diff <= 0) {
        clearInterval(timerRef.current);
        if (!isSubmittingRef.current) {
          console.log('Timer hit 0. Auto-submitting quiz...');
          handleSubmitQuiz(true); // force auto-submit
        }
      }
    };
    calcRemaining();
    timerRef.current = setInterval(calcRemaining, 1000);
  };

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 3. Restore cached answers from localStorage
  const restoreAnswers = () => {
    const cached = localStorage.getItem(answersKey);
    if (cached) {
      try {
        setSelectedAnswers(JSON.parse(cached));
      } catch (e) {
        console.error('Error parsing cached answers:', e);
      }
    }
  };

  // Cache answers on change
  const handleSelectOption = (optionIndex) => {
    const updated = {
      ...selectedAnswers,
      [currentIndex]: optionIndex,
    };
    setSelectedAnswers(updated);
    localStorage.setItem(answersKey, JSON.stringify(updated));
  };

  // 4. Keyboard Navigation Controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showSubmitModal || showCheatingWarning || loading) return;
      if (e.key === 'ArrowRight' || e.key === 'd') {
        // Next Question
        if (quiz && currentIndex < quiz.questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        // Prev Question
        if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        }
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        // Select Option (A=1, B=2, C=3, D=4)
        const idx = parseInt(e.key, 10) - 1;
        handleSelectOption(idx);
      } else if (e.key === 'm') {
        // Toggle Mark for review
        toggleMarkForReview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, quiz, selectedAnswers, showSubmitModal, showCheatingWarning, loading]);

  // 5. Anti-Cheating tab visibility listener
  useEffect(() => {
    if (loading || submitting || !quiz) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTabSwitches((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            // Auto submit immediately on 3 switches
            handleSubmitQuiz(true); // force submit
          } else {
            setShowCheatingWarning(true);
          }
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loading, submitting, quiz]);

  const toggleMarkForReview = () => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) {
        next.delete(currentIndex);
      } else {
        next.add(currentIndex);
      }
      return next;
    });
  };

  // 6. Submit Quiz API Pipe
  const handleSubmitQuiz = async (force = false) => {
    if (submitting || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setSubmitting(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Format selected options into API format { questionId, selectedOption }
    const answersPayload = quiz.questions.map((q, idx) => ({
      questionId: q._id,
      selectedOption: selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : null,
    }));
    // Calculate time taken
    const initialDuration = quiz.duration * 60;
    const timeTaken = Math.min(initialDuration, initialDuration - secondsRemaining);
    try {
      const response = await API.post('/attempts', {
        quizId,
        answers: answersPayload,
        timeTaken,
      });
      if (response.data.success) {
        localStorage.removeItem(answersKey);
        localStorage.removeItem(endTimeKey);
        navigate(`/quiz/${quizId}/result?attemptId=${response.data.attemptId}`);
      }
    } catch (err) {
      console.error('Quiz submission failure:', err);
      setError('Error submitting quiz attempt. Please check your network connection.');
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs font-semibold text-rose-800">
          {error || 'Quiz session error.'}
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];

  return (
    <div className="mx-auto max-w-[800px] px-4 py-8 sm:px-6 lg:px-8 transition-colors min-h-screen">
      {/* Header bar with Timer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 mb-8">
        <div>
          <h1 className="font-display text-xl font-extrabold text-slate-850">
            {quiz.title}
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">
            Standard Examination Mode • Candidates evaluated on accuracy and elapsed duration
          </p>
        </div>
        <Timer secondsRemaining={secondsRemaining} />
      </div>
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left pane: Question Block details */}
        <div className="md:col-span-8 space-y-6">
          <QuestionBlock
            question={currentQuestion}
            selectedOption={selectedAnswers[currentIndex]}
            onSelectOption={handleSelectOption}
            questionNumber={currentIndex + 1}
          />
          {/* Navigational buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex(prev => prev - 1)}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button
              onClick={toggleMarkForReview}
              className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                markedForReview.has(currentIndex)
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {markedForReview.has(currentIndex) ? (
                <>
                  <BookmarkCheck className="h-4 w-4 text-amber-500" /> Marked
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" /> Mark for Review
                </>
              )}
            </button>
            {currentIndex === quiz.questions.length - 1 ? (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-1 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-dark"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="flex items-center gap-1 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-900"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        {/* Right Sidebar: Navigation Grid */}
        <div className="md:col-span-4 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-display text-xs font-bold text-slate-800 uppercase tracking-wider">
              Assessment Map
            </h3>
            {/* Bubble list */}
            <div className="mt-6 grid grid-cols-5 gap-2.5">
              {quiz.questions.map((_, idx) => {
                const isSelected = selectedAnswers[idx] !== undefined;
                const isCurrent = currentIndex === idx;
                const isMarked = markedForReview.has(idx);
                let bubbleStyle = 'border-slate-200 hover:border-slate-400 text-slate-600';
                if (isCurrent) {
                  bubbleStyle = 'border-primary bg-primary text-white shadow-sm shadow-primary/20';
                } else if (isMarked) {
                  bubbleStyle = 'border-amber-300 bg-amber-50 text-amber-700';
                } else if (isSelected) {
                  bubbleStyle = 'border-slate-600 bg-slate-800 text-white';
                }
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xs font-bold transition-all ${bubbleStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            {/* Legends */}
            <div className="mt-8 border-t border-slate-100 pt-4 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <div className="h-3 w-3 rounded bg-primary" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <div className="h-3 w-3 rounded bg-slate-800" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <div className="h-3 w-3 rounded border border-amber-300 bg-amber-50" />
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <div className="h-3 w-3 rounded border border-slate-200" />
                <span>Not Visited / Skipped</span>
              </div>
            </div>
            {/* Quick Actions Submit shortcut */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="mt-6 w-full rounded-xl bg-slate-150 py-3 text-center text-xs font-bold text-slate-800 hover:bg-slate-200 transition-colors"
            >
              Finish Assessment
            </button>
          </div>
        </div>
      </div>
      {/* Modal 1: Confirmation submit */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-100 animate-slide">
            <h3 className="font-display text-lg font-bold text-slate-850">
              Submit Assessment?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Are you sure you want to finish and submit your attempt? Answers will be scored instantly and leaderboard metrics will sync.
            </p>
            {/* Answered summary */}
            <div className="mt-4 rounded-xl bg-slate-50 p-3.5 text-[11px] text-slate-500">
              Answers registered: <strong className="text-slate-850">{Object.keys(selectedAnswers).length}</strong> / {quiz.questions.length}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs font-semibold text-slate-650 hover:bg-slate-50 disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleSubmitQuiz(false);
                }}
                disabled={submitting}
                className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition-all disabled:opacity-50"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal 2: Cheating/Focus warning alert overlay */}
      {showCheatingWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-rose-100 text-center animate-slide">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-slate-850">
              Anti-Cheating Trigger Warning!
            </h3>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-500">
              Our evaluation engine detected that you switched tabs or left the active browser window.
            </p>
            <div className="mt-4 rounded-xl bg-rose-50/50 p-4 text-xs font-semibold text-rose-700">
              Warn Count: <strong className="text-sm">{tabSwitches}</strong> / 3.
              <span className="block font-normal text-[10px] text-slate-400 mt-1">
                Leaving the screen one more time will trigger automatic submission of your current progress.
              </span>
            </div>
            <button
              onClick={() => setShowCheatingWarning(false)}
              className="mt-6 w-full rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-md hover:bg-primary-dark transition-all"
            >
              Resume Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAttempt;
