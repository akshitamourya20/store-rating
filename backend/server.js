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
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection middleware:
// If MONGODB_URI is provided, connects to MongoDB Atlas.
// If MONGODB_URI is not configured, seamlessly runs with built-in memory database.
app.use(async (req, res, next) => {
  if (process.env.MONGODB_URI) {
    try {
      if (mongoose.connection.readyState !== 1) {
        await connectDB();
        const userCount = await User.countDocuments();
        if (userCount === 0) {
          console.log('[Server] Database is empty. Seeding initial demo dataset...');
          await seedDatabase();
        }
      }
    } catch (err) {
      console.warn('[DB] MongoDB Atlas connection failed. Falling back to built-in memory database:', err.message);
    }
  }
  next();
});

// Routes (supports both /api/auth and /auth for serverless flexibility)
app.use(['/api/auth', '/auth'], require('./routes/authRoutes'));
app.use(['/api/admin', '/admin'], require('./routes/adminRoutes'));
app.use(['/api/stores', '/stores'], require('./routes/storeRoutes'));
app.use(['/api/ratings', '/ratings'], require('./routes/ratingRoutes'));

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    message: 'Store Rating System API is running smoothly',
    mode: mongoose.connection.readyState === 1 ? 'MongoDB Atlas' : 'Built-in Memory Database (Zero-Config)',
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

// Local startup
if (!process.env.VERCEL) {
  const startServer = async () => {
    try {
      if (process.env.MONGODB_URI) {
        await connectDB();
        const userCount = await User.countDocuments();
        if (userCount === 0) {
          console.log('[Server] Database is empty. Auto-seeding initial dataset...');
          await seedDatabase();
        }
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
