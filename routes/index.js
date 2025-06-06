const express = require('express');
const authRoutes = require('./auth');
const notesRoutes = require('./notes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Notes App API',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      notes: '/notes',
      health: '/health'
    }
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/notes', notesRoutes);

module.exports = router;