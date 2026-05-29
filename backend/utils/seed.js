import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import Attempt from '../models/Attempt.js';

dotenv.config();

const usersData = [
  {
    name: 'QuizRise Admin',
    email: 'admin@quizrise.com',
    password: 'admin123', // Will be hashed by UserSchema pre-save hook
    role: 'admin',
  },
  {
    name: 'Alex Developer',
    email: 'student@quizrise.com',
    password: 'student123', // Will be hashed by UserSchema pre-save hook
    role: 'user',
  },
];

const quizzesData = (adminId) => [
  {
    title: 'React.js Core Concepts',
    description: 'Assess your understanding of React functional components, hooks, virtual DOM, and state management lifecycle.',
    category: 'Frontend Development',
    difficulty: 'Medium',
    duration: 10, // 10 minutes
    passingScore: 12, // 3 out of 5 correct
    isPublished: true,
    createdBy: adminId,
    tags: ['React', 'JavaScript', 'Frontend', 'Hooks'],
    questions: [
      {
        question: 'Which Hook is used to perform side effects in functional React components?',
        options: ['useSideEffect', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 1,
        explanation: 'The useEffect hook lets you perform side effects in functional components, similar to componentDidMount and componentDidUpdate in class components.',
        marks: 4,
        negativeMark: 1,
      },
      {
        question: 'What is the purpose of React.memo?',
        options: [
          'To cache asynchronous network requests',
          'To trigger manual re-rendering of children',
          'To memoize functional components to prevent unnecessary re-renders',
          'To store persistent references that do not trigger renders',
        ],
        correctAnswer: 2,
        explanation: 'React.memo is a higher-order component that shallowly compares props and memoizes the output, preventing re-renders if props have not changed.',
        marks: 4,
        negativeMark: 1,
      },
      {
        question: 'How do you create a custom Hook in React?',
        options: [
          'Define a function whose name starts with "use"',
          'Inherit from React.Component class',
          'Call React.createCustomHook() API',
          'Create a class component with use prefix',
        ],
        correctAnswer: 0,
        explanation: 'By convention, a custom hook is a Javascript function whose name starts with the word "use" and that can call other hooks.',
        marks: 4,
        negativeMark: 1,
      },
      {
        question: 'What is the correct syntax to define a state variable with useState?',
        options: [
          'const [state, setState] = useState(initialVal)',
          'const state = useState(initialVal)',
          'const {state, setState} = useState(initialVal)',
          'let state = React.useState(initialVal)',
        ],
        correctAnswer: 0,
        explanation: 'useState returns a pair: the current state value and a function that lets you update it. We use array destructuring const [state, setState] = useState(initialValue).',
        marks: 4,
        negativeMark: 1,
      },
      {
        question: 'In React, what are "keys" used for?',
        options: [
          'To set keyboard shortcut events on input fields',
          'To encrypt state data securely',
          'To help React identify which items in a list have changed, been added, or been removed',
          'To establish authentication routing links',
        ],
        correctAnswer: 2,
        explanation: 'Keys help React identify which items have changed, are added, or are removed. They should be given to the elements inside an array to give them a stable identity.',
        marks: 4,
        negativeMark: 1,
      },
    ],
  },
  {
    title: 'Node.js & Express Fundamentals',
    description: 'Test your understanding of asynchronous runtime processing, middle-tier architecture, middleware routing, and headers.',
    category: 'Backend Development',
    difficulty: 'Easy',
    duration: 8,
    passingScore: 8, // 2 out of 4 correct
    isPublished: true,
    createdBy: adminId,
    tags: ['NodeJS', 'Express', 'Backend', 'API'],
    questions: [
      {
        question: 'Which core module in Node.js handles file operations?',
        options: ['file', 'fs', 'path', 'os'],
        correctAnswer: 1,
        explanation: 'The "fs" (File System) module in Node.js provides an API for interacting with the file system in both synchronous and asynchronous forms.',
        marks: 4,
        negativeMark: 1,
      },
      {
        question: 'What is Express middleware?',
        options: [
          'A wrapper database helper script',
          'Functions that have access to the request object (req), response object (res), and the next middleware function',
          'A user interface widget library',
          'A web socket connection server',
        ],
        correctAnswer: 1,
        explanation: 'Express middleware functions are functions that execute during the lifecycle of a request to the Express server. Each function has access to req, res, and the next() function to pass control.',
        marks: 4,
        negativeMark: 1,
      },
      {
        question: 'What does the status code 403 represent?',
        options: ['Unauthorized login attempt', 'Forbidden / Access Denied', 'Internal Server Error', 'Resource Not Found'],
        correctAnswer: 1,
        explanation: '403 Forbidden indicates that the server understands the request but refuses to authorize it. It differs from 401 Unauthorized in that the client identity is known but access is disallowed.',
        marks: 4,
        negativeMark: 1,
      },
      {
        question: 'Which function call in Express routes requests to the next matching middleware?',
        options: ['req.next()', 'next()', 'response.continue()', 'app.next()'],
        correctAnswer: 1,
        explanation: 'Calling next() passes control to the next middleware function. If not called, the request will hang.',
        marks: 4,
        negativeMark: 1,
      },
    ],
  },
];

export const seedDataOnly = async () => {
  try {
    // Clear existing data to avoid duplications
    await User.deleteMany({});
    await Quiz.deleteMany({});
    await Attempt.deleteMany({});
    console.log('Collections cleared for seeding.');

    // Seed users
    const insertedUsers = await User.create(usersData);
    console.log(`Auto-seeded ${insertedUsers.length} users.`);

    const adminUser = insertedUsers.find((u) => u.role === 'admin');

    // Seed quizzes
    const quizzes = quizzesData(adminUser._id);
    const insertedQuizzes = await Quiz.create(quizzes);
    console.log(`Auto-seeded ${insertedQuizzes.length} quizzes.`);

    console.log('Database auto-seeding finished successfully! 🎉');
  } catch (error) {
    console.error('Data auto-seeding failed:', error);
  }
};

const seedDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quizrise';
    console.log('Connecting to database for seeding...');
    await mongoose.connect(dbUri);
    console.log('Connected.');

    await seedDataOnly();

    console.log('Database Seeding Complete! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failure:', error);
    process.exit(1);
  }
};

// If file run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('seed.js')) {
  seedDB();
}
export default seedDB;
