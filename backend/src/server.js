require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const diaryRoutes = require('./routes/diaryRoutes');
const weightRoutes = require('./routes/weightRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

// Connect to database
connectDB();

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'NutriTrack API is running 🚀', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/favorites', favoriteRoutes);

// Temporary seed endpoint for Cloud deployments
app.get('/api/seed', async (req, res) => {
  try {
    const { seed } = require('../scripts/seedFoods');
    const result = await seed();
    res.json({ success: true, message: `Successfully seeded ${result.count} foods!` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Base route
app.get('/', (req, res) => {
  res.send('NutriTrack API is running');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 NutriTrack Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = app;
