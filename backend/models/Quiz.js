import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please add a question text'],
    trim: true,
  },
  options: {
    type: [String],
    required: [true, 'Please add options'],
    validate: [
      (val) => val.length === 4,
      'A question must have exactly 4 options',
    ],
  },
  correctAnswer: {
    type: Number,
    required: [true, 'Please specify the index of the correct answer (0-3)'],
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    required: [true, 'Please add an explanation for the correct answer'],
    trim: true,
  },
  marks: {
    type: Number,
    default: 4,
  },
  negativeMark: {
    type: Number,
    default: 1, // Deduct 1 mark by default if enabled
  },
});

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a quiz title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a quiz description'],
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Please set difficulty level'],
      enum: ['Easy', 'Medium', 'Hard'],
    },
    duration: {
      type: Number,
      required: [true, 'Please specify duration in minutes'],
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 0,
    },
    passingScore: {
      type: Number,
      required: [true, 'Please set a passing score threshold'],
    },
    questions: [QuestionSchema],
    negativeMarking: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attemptsCount: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate total marks from individual questions
QuizSchema.pre('save', function (next) {
  if (this.questions && this.questions.length > 0) {
    this.totalMarks = this.questions.reduce((total, q) => total + (q.marks || 4), 0);
  } else {
    this.totalMarks = 0;
  }
  next();
});

const Quiz = mongoose.model('Quiz', QuizSchema);
export default Quiz;
