const express = require('express');
const cors = require('cors');
require('dotenv').config();
// Add this at the very top of your main server file
process.env.PRISMA_QUERY_ENGINE_LIBRARY = './node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node';

// Your existing code...

const prisma = require('./lib/prisma');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://shiny-baklava-46049e.netlify.app',
  // Add your Vercel frontend domain here
  process.env.FRONTEND_URL,
  // Add any other domains you need
].filter(Boolean);

// Single CORS middleware configuration
// Update your CORS middleware to this:
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://notes-frontend.vercel.app', // Replace with your actual frontend URL
    'https://notes-n60jx6mrq-ramkrish82033-3083s-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Add this before your routes
app.options('*', cors()); // Enable preflight for all routes
// Log requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Gracefully shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Gracefully shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

// Initialize database connection and start server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connection established successfully');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// For Vercel serverless functions
if (process.env.VERCEL) {
  module.exports = app;
} else {
  startServer();
}