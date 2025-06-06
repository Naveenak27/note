const express = require('express');
const cors = require('cors');
const app = express();

// Critical CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://notes-frontend.vercel.app',
    /\.vercel\.app$/ // Allow all Vercel deployment URLs
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Explicit preflight handler
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes
app.post('/auth/register', (req, res) => {
  console.log('Register request received');
  res.json({ success: true, message: 'Registration successful' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;