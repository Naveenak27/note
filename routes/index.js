const express = require('express');
const authRoutes = require('./auth');
const notesRoutes = require('./notes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/notes', notesRoutes);

module.exports = router;