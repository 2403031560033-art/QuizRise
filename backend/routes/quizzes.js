import express from 'express';
import Quiz from '../models/Quiz.js';
import { protect, verifyAdmin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import csv from 'csv-parser';
import fs from 'fs';

const router = express.Router();

// @route   GET /api/quizzes
// @desc    Get all published quizzes (admins get all quizzes)
// @access  Public/Private
router.get('/', async (req, res) => {
  try {
    let query = { isPublished: true };

    // If request includes a token, check if they are admin to show unpublished ones
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev_only');
        const user = await User.findById(decoded.id);
        if (user && user.role === 'admin') {
          query = {}; // Admins see all
        }
      } catch (err) {
        // Suppress and default to only published
      }
    }

    const quizzes = await Quiz.find(query)
      .select('-questions') // Exclude full questions array in listing for network optimization
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: quizzes.length, quizzes });
  } catch (error) {
    console.error('Fetch quizzes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Get single quiz details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.id || req.params.id).populate('createdBy', 'name');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check if user is admin
    const isAdmin = req.user.role === 'admin';

    // If user is standard user, strip correct answer and explanation keys from questions to prevent cheating
    if (!isAdmin) {
      if (!quiz.isPublished) {
        return res.status(403).json({ success: false, message: 'This quiz is not published yet' });
      }

      const strippedQuestions = quiz.questions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        marks: q.marks,
        negativeMark: q.negativeMark,
      }));

      // Create a shallow copy and override questions
      const quizObject = quiz.toObject();
      quizObject.questions = strippedQuestions;

      return res.json({ success: true, quiz: quizObject });
    }

    res.json({ success: true, quiz });
  } catch (error) {
    console.error('Fetch single quiz error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/quizzes
// @desc    Create a new quiz
// @access  Private/Admin
router.post('/', protect, verifyAdmin, async (req, res) => {
  try {
    const { title, description, category, difficulty, duration, passingScore, negativeMarking, tags, questions } = req.body;

    if (!title || !description || !category || !difficulty || !duration || !passingScore) {
      return res.status(400).json({ success: false, message: 'Please add all required fields' });
    }

    const quiz = new Quiz({
      title,
      description,
      category,
      difficulty,
      duration,
      passingScore,
      negativeMarking,
      createdBy: req.user._id,
      tags: tags || [],
      questions: questions || [], // accept initial questions or start empty
    });

    await quiz.save();
    res.status(201).json({ success: true, quiz });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/quizzes/:id
// @desc    Update quiz details and/or questions list
// @access  Private/Admin
router.put('/:id', protect, verifyAdmin, async (req, res) => {
  try {
    const { title, description, category, difficulty, duration, passingScore, negativeMarking, questions, isPublished, tags } = req.body;

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (title !== undefined) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (category !== undefined) quiz.category = category;
    if (difficulty !== undefined) quiz.difficulty = difficulty;
    if (duration !== undefined) quiz.duration = duration;
    if (passingScore !== undefined) quiz.passingScore = passingScore;
    if (negativeMarking !== undefined) quiz.negativeMarking = negativeMarking;
    if (isPublished !== undefined) quiz.isPublished = isPublished;
    if (tags !== undefined) quiz.tags = tags;
    if (questions !== undefined) quiz.questions = questions; // direct questions array updates

    await quiz.save();
    res.json({ success: true, quiz });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/quizzes/:id
// @desc    Delete quiz
// @access  Private/Admin
router.delete('/:id', protect, verifyAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    await quiz.deleteOne();
    res.json({ success: true, message: 'Quiz removed successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/quizzes/:id/bulk-upload
// @desc    Bulk CSV upload questions into a quiz
// @access  Private/Admin
router.post('/:id/bulk-upload', protect, verifyAdmin, upload.single('file'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
    }

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        // Parse CSV fields
        const questionText = data.question || data.Question;
        const optionA = data.optionA || data.OptionA || data.A;
        const optionB = data.optionB || data.OptionB || data.B;
        const optionC = data.optionC || data.OptionC || data.C;
        const optionD = data.optionD || data.OptionD || data.D;
        const correctIndex = parseInt(data.correctOptionIndex || data.correctAnswer || data.CorrectOptionIndex || data.Answer, 10);
        const explanationText = data.explanation || data.Explanation || 'No explanation provided.';
        const marksVal = parseInt(data.marks || data.Marks || '4', 10);
        const negMarkVal = parseInt(data.negativeMark || data.NegativeMark || '1', 10);

        if (questionText && optionA && optionB && optionC && optionD && !isNaN(correctIndex)) {
          results.push({
            question: questionText.trim(),
            options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
            correctAnswer: correctIndex,
            explanation: explanationText.trim(),
            marks: isNaN(marksVal) ? 4 : marksVal,
            negativeMark: isNaN(negMarkVal) ? 1 : negMarkVal,
          });
        }
      })
      .on('end', async () => {
        try {
          if (results.length === 0) {
            // Delete temp file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'No valid questions found in CSV file. Check column headers.' });
          }

          // Add questions to quiz
          quiz.questions.push(...results);
          await quiz.save();

          // Delete temp file
          fs.unlinkSync(req.file.path);

          res.json({
            success: true,
            message: `Successfully uploaded ${results.length} questions`,
            questionsUploadedCount: results.length,
            quiz,
          });
        } catch (saveErr) {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          console.error('Error saving parsed questions:', saveErr);
          res.status(400).json({ success: false, message: 'Validation error: ' + saveErr.message });
        }
      })
      .on('error', (err) => {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        console.error('CSV Parsing Error:', err);
        res.status(500).json({ success: false, message: 'Error parsing CSV file' });
      });
  } catch (error) {
    console.error('CSV upload endpoint error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
