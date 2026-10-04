const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const { seedDatabase } = require('./seed/seedData');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serverless DB connection middleware (ensures DB is connected on each Vercel request)
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
      // Auto-seed if first time running on a fresh MongoDB Atlas database
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Server] Database is empty. Seeding initial demo dataset...');
        await seedDatabase();
      }
    }
    next();
  } catch (err) {
    console.error('[DB Middleware Error]', err.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGODB_URI is configured.',
      error: err.message,
    });
  }
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/stores', require('./routes/storeRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Store Rating System API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Local startup (when not running inside Vercel serverless functions)
if (!process.env.VERCEL) {
  const startServer = async () => {
    try {
      await connectDB();
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Server] Database is empty. Auto-seeding initial dataset...');
        await seedDatabase();
      }
      app.listen(PORT, () => {
        console.log(`[Server] Running on http://localhost:${PORT}`);
      });
    } catch (err) {
      console.error('[Server] Startup failed:', err);
    }
  };

  startServer();
}

module.exports = app;
