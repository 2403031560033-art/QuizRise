import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { handleSockets } from './sockets/socketHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import quizRoutes from './routes/quizzes.js';
import attemptRoutes from './routes/attempts.js';
import leaderboardRoutes from './routes/leaderboards.js';
import adminRoutes from './routes/admin.js';

import { seedDataOnly } from './utils/seed.js';
import Quiz from './models/Quiz.js';

dotenv.config();

// Connect to MongoDB Database and auto-seed if empty
connectDB().then(async () => {
  try {
    const quizCount = await Quiz.countDocuments({});
    if (quizCount === 0) {
      console.log('No quizzes found in database. Running auto-seeder...');
      await seedDataOnly();
    } else {
      console.log(`Database has ${quizCount} quizzes. Skipping auto-seed.`);
    }
  } catch (err) {
    console.error('Error checking database for seeding:', err);
  }
});

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: function (origin, callback) {
    // Temporarily allow all origins to prevent Render/Vercel connection issues
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Socket.IO Server
const io = new Server(server, {
  cors: corsOptions,
});

// Bind io to app settings to access in other routes controllers
app.set('io', io);

// Handle WebSockets events
handleSockets(io);

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'QuizRise API is up and running' });
});

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
