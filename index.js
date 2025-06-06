const express = require('express');
const cors = require('cors');
const app = express();

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://notes-frontend.vercel.app',
    'https://notes-n60jx6mrq-ramkrish82033-3083s-projects.vercel.app',"https://notepad-three-woad.vercel.app/"
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Special preflight handler for /auth/register
app.options('/auth/register', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Registration endpoint
app.post('/auth/register', (req, res) => {
  console.log('Registration attempt:', req.body);
  
  // Your registration logic here
  res.json({ 
    success: true,
    message: 'Registration successful' 
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
