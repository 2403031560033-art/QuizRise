import express from 'express';
import Attempt from '../models/Attempt.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to broadcast leaderboard updates
const triggerLeaderboardUpdate = async (io, quizId) => {
  try {
    // Fetch top 10 attempts for this quiz
    const quizAttempts = await Attempt.find({ quiz: quizId })
      .populate('user', 'name email')
      .sort({ score: -1, timeTaken: 1, createdAt: 1 })
      .limit(10);

    // Format attempts
    const leaderboard = quizAttempts.map((attempt, index) => ({
      rank: index + 1,
      name: attempt.user.name,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      timeTaken: attempt.timeTaken,
      submittedAt: attempt.submittedAt || attempt.createdAt,
    }));

    // Broadcast to room of this quiz
    io.to(quizId.toString()).emit('leaderboardUpdate', { quizId, leaderboard });

    // Also update global leaderboard
    const users = await User.find({})
      .sort({ totalScore: -1, quizzesPassed: -1, quizzesAttempted: 1 })
      .limit(10)
      .select('name totalScore quizzesAttempted quizzesPassed');

    const globalLeaderboard = users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      totalScore: user.totalScore,
      quizzesAttempted: user.quizzesAttempted,
      quizzesPassed: user.quizzesPassed,
    }));

    io.emit('globalLeaderboardUpdate', { globalLeaderboard });
  } catch (error) {
    console.error('Error broadcasting leaderboard update:', error);
  }
};

// @route   POST /api/attempts
// @desc    Submit a quiz attempt and calculate score
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { quizId, answers, timeTaken } = req.body; // answers is array of { questionId, selectedOption }

    if (!quizId || !answers || timeTaken === undefined) {
      return res.status(400).json({ success: false, message: 'Please specify quizId, answers, and timeTaken' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let calculatedScore = 0;
    const scoredAnswers = [];

    // Map through questions to score answers
    for (const question of quiz.questions) {
      // Find user response for this question
      const userAns = answers.find(
        (ans) => ans.questionId.toString() === question._id.toString()
      );

      const selectedOption = userAns ? userAns.selectedOption : null;
      let isCorrect = false;

      if (selectedOption !== null && selectedOption !== undefined) {
        if (selectedOption === question.correctAnswer) {
          isCorrect = true;
          calculatedScore += question.marks || 4;
        } else {
          // Subtract negative mark if enabled
          if (quiz.negativeMarking) {
            calculatedScore -= question.negativeMark || 1;
          }
        }
      }

      scoredAnswers.push({
        questionId: question._id,
        selectedOption,
        isCorrect,
      });
    }

    const percentage = quiz.totalMarks > 0 ? (calculatedScore / quiz.totalMarks) * 100 : 0;
    const passed = calculatedScore >= quiz.passingScore;

    // Create attempt
    const attempt = new Attempt({
      user: req.user._id,
      quiz: quizId,
      answers: scoredAnswers,
      score: calculatedScore,
      totalMarks: quiz.totalMarks,
      percentage: Math.round(percentage * 100) / 100, // round to 2 decimals
      passed,
      timeTaken,
    });

    await attempt.save();

    // Increment user stats
    const user = await User.findById(req.user._id);
    if (user) {
      user.quizzesAttempted += 1;
      user.totalScore += calculatedScore;
      if (passed) {
        user.quizzesPassed += 1;
      }
      await user.save();
    }

    // Increment attempt count on Quiz
    quiz.attemptsCount += 1;
    await quiz.save();

    // Trigger real-time leaderboard update using Socket.IO
    const io = req.app.get('io');
    if (io) {
      // Run asynchronously
      triggerLeaderboardUpdate(io, quizId);
    }

    // Return detailed result containing questions with solutions & explanation
    // We fetch attempt details and attach correct solutions for candidate review
    const enrichedQuestions = quiz.questions.map((q) => {
      const userAns = scoredAnswers.find(
        (ans) => ans.questionId.toString() === q._id.toString()
      );
      return {
        _id: q._id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer, // include correct answer for display
        explanation: q.explanation, // include explanation
        marks: q.marks,
        negativeMark: q.negativeMark,
        userSelection: userAns ? userAns.selectedOption : null,
        isCorrect: userAns ? userAns.isCorrect : false,
      };
    });

    res.status(201).json({
      success: true,
      attemptId: attempt._id,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      passed: attempt.passed,
      timeTaken: attempt.timeTaken,
      questions: enrichedQuestions,
    });
  } catch (error) {
    console.error('Submit attempt error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/attempts/my
// @desc    Get user's quiz attempt history
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id })
      .populate('quiz', 'title category difficulty totalMarks')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: attempts.length, attempts });
  } catch (error) {
    console.error('Fetch user history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/attempts/:id
// @desc    Get details of a specific quiz attempt
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('quiz')
      .populate('user', 'name email');

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    // Verify requesting user is the owner of the attempt, or an admin
    if (attempt.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Format output with explanations
    const quiz = attempt.quiz;
    const enrichedQuestions = quiz.questions.map((q) => {
      const userAns = attempt.answers.find(
        (ans) => ans.questionId.toString() === q._id.toString()
      );
      return {
        _id: q._id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        marks: q.marks,
        negativeMark: q.negativeMark,
        userSelection: userAns ? userAns.selectedOption : null,
        isCorrect: userAns ? userAns.isCorrect : false,
      };
    });

    res.json({
      success: true,
      attempt: {
        _id: attempt._id,
        quizTitle: quiz.title,
        quizId: quiz._id,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        passed: attempt.passed,
        timeTaken: attempt.timeTaken,
        submittedAt: attempt.createdAt,
        questions: enrichedQuestions,
      },
    });
  } catch (error) {
    console.error('Fetch single attempt error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
