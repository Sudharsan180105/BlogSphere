
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import blogRoutes from './routes/blogRoutes.js';

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 5001;

const CLIENT_URL =
  process.env.CLIENT_URL || 'http://localhost:5173';

// Security middleware
app.use(helmet());

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// Request parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Development request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

app.use('/api', apiLimiter);

// Additional authentication rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to BlogSphere API',
    version: '1.0.0',
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    application: 'BlogSphere',
    status: 'Running',
    database:
      mongoose.connection.readyState === 1
        ? 'Connected'
        : 'Disconnected',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes
app.use('/api/auth', authLimiter, authRoutes);

// User profile routes
app.use('/api/users', userRoutes);

// Blog management routes
app.use('/api/blogs', blogRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
});

// Start server only after MongoDB connects
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log('');
      console.log('================================');
      console.log('       BLOGSPHERE API');
      console.log('================================');
      console.log(`Server: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
      console.log(`Client: ${CLIENT_URL}`);
      console.log('Database: Connected');
      console.log('Blog API: /api/blogs');
      console.log('Status: Running');
      console.log('================================');
      console.log('');
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`${signal} received. Closing server...`);

      server.close(async () => {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
        console.log('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start BlogSphere:', error.message);
    process.exit(1);
  }
};

startServer();
