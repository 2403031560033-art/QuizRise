import express from 'express';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import Attempt from '../models/Attempt.js';
import { protect, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/admin/analytics
// @desc    Get dashboard metrics and trends
// @access  Private/Admin
router.get('/analytics', protect, verifyAdmin, async (req, res) => {
  try {
    // 1. Total users (excluding admin check if needed)
    const totalUsers = await User.countDocuments({ role: 'user' });

    // 2. Total attempts
    const totalAttempts = await Attempt.countDocuments({});

    // 3. Average score & overall pass rate
    const aggregateMetrics = await Attempt.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$score' },
          passedCount: { $sum: { $cond: [{ $eq: ['$passed', true] }, 1, 0] } },
        },
      },
    ]);

    const avgScore = aggregateMetrics.length > 0 ? Math.round(aggregateMetrics[0].avgScore * 100) / 100 : 0;
    const passedCount = aggregateMetrics.length > 0 ? aggregateMetrics[0].passedCount : 0;
    const overallPassRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100 * 100) / 100 : 0;

    // 4. Per-quiz analytics
    const quizStats = await Attempt.aggregate([
      {
        $group: {
          _id: '$quiz',
          avgScore: { $avg: '$score' },
          maxScore: { $max: '$score' },
          attemptsCount: { $sum: 1 },
          passedCount: { $sum: { $cond: [{ $eq: ['$passed', true] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: 'quizzes',
          localField: '_id',
          foreignField: '_id',
          as: 'quizDetails',
        },
      },
      {
        $unwind: '$quizDetails',
      },
      {
        $project: {
          quizId: '$_id',
          title: '$quizDetails.title',
          category: '$quizDetails.category',
          avgScore: { $round: ['$avgScore', 2] },
          maxScore: 1,
          attemptsCount: 1,
          passRate: {
            $round: [
              { $multiply: [{ $divide: ['$passedCount', '$attemptsCount'] }, 100] },
              2,
            ],
          },
        },
      },
    ]);

    // 5. Recent attempts feed (last 10)
    const recentActivity = await Attempt.find({})
      .populate('user', 'name email')
      .populate('quiz', 'title category')
      .sort({ createdAt: -1 })
      .limit(10);

    // 6. Attempts Trend (Grouped by Date for last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const attemptsTrend = await Attempt.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          attempts: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      success: true,
      metrics: {
        totalUsers,
        totalAttempts,
        averageScore: avgScore,
        passRate: overallPassRate,
      },
      quizStats,
      recentActivity,
      attemptsTrend: attemptsTrend.map(item => ({
        date: item._id,
        attempts: item.attempts
      })),
    });
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users on the platform
// @access  Private/Admin
router.get('/users', protect, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PATCH /api/admin/users/:id
// @desc    Update user status / role
// @access  Private/Admin
router.patch('/users/:id', protect, verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Please specify a valid role (user or admin)' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent admin from demoting themselves accidental lockouts
    if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Admins cannot change their own roles' });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated successfully to ${role}`,
      user,
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
