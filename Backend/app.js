const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./db/db');

// Initialize Firebase Admin globally so middleware can use it
require('./config/firebase');

// Import all routes
const userRoutes = require('./routes/user.route');
const authRoutes = require('./routes/auth.route');
const cvRoutes = require('./routes/cv.route');
const cvHistoryRoutes = require('./routes/cvHistory.route');
const coverLetterRoutes = require('./routes/coverLetter.route');
const learningRoutes = require('./routes/learning.route');
const roleRoutes = require('./routes/role.route');
const pdfRoutes = require('./routes/pdf.route');

const app = express();

// Allowed origins for CORS (local Vite ports and production frontend)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CLIENT_URL,
  process.env.BASE_URL
].filter(Boolean);

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o)) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev/staging to avoid blocking
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Set Cross-Origin-Opener-Policy so popups (Firebase Google Auth) don't get blocked
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});

// Serverless DB connection middleware: ensures MongoDB is connected before handling any route
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (dbError) {
    console.error('❌ Serverless MongoDB connection error in app middleware:', dbError.message);
    // Allow request to proceed; individual route handlers will catch or use graceful fallbacks
    next();
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Resume Builder API is operational',
    aiProvider: 'Google Gemini (@google/genai)',
    timestamp: new Date()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// Route Mounts
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/cv-history', cvHistoryRoutes);
app.use('/api/cover-letter', coverLetterRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/pdf', pdfRoutes);

// Top-level aliases to handle direct calls without prefix
app.use('/sync', (req, res, next) => {
  userRoutes(req, res, next);
});
app.use('/login', (req, res, next) => {
  req.url = '/login';
  authRoutes(req, res, next);
});
app.use('/register', (req, res, next) => {
  req.url = '/register';
  authRoutes(req, res, next);
});

// Global 404 handler for API routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
