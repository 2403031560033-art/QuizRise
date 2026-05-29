import express from 'express';
import User from '../models/User.js';
import Attempt from '../models/Attempt.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/leaderboard
// @desc    Get global leaderboard rankings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ totalScore: -1, quizzesPassed: -1, quizzesAttempted: 1 })
      .limit(20)
      .select('name totalScore quizzesAttempted quizzesPassed role');

    const formattedLeaderboard = users
      .filter(user => user.role !== 'admin') // exclude admins from leaderboard rankings
      .map((user, index) => ({
        rank: index + 1,
        id: user._id,
        name: user.name,
        totalScore: user.totalScore,
        quizzesAttempted: user.quizzesAttempted,
        quizzesPassed: user.quizzesPassed,
      }));

    res.json({ success: true, leaderboard: formattedLeaderboard });
  } catch (error) {
    console.error('Fetch global leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/leaderboard/:quizId
// @desc    Get leaderboard rankings for a specific quiz
// @access  Private
router.get('/:quizId', protect, async (req, res) => {
  try {
    const attempts = await Attempt.find({ quiz: req.params.quizId })
      .populate('user', 'name email role')
      .sort({ score: -1, timeTaken: 1, createdAt: 1 }) // higher score, then lesser time, then earlier attempt
      .limit(50);

    const formattedLeaderboard = attempts
      .filter(attempt => attempt.user && attempt.user.role !== 'admin') // exclude admin test attempts
      .map((attempt, index) => ({
        rank: index + 1,
        attemptId: attempt._id,
        name: attempt.user.name,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        timeTaken: attempt.timeTaken,
        submittedAt: attempt.createdAt,
      }));

    res.json({ success: true, leaderboard: formattedLeaderboard });
  } catch (error) {
    console.error('Fetch quiz leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
