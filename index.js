const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Set Prisma engine path
process.env.PRISMA_QUERY_ENGINE_LIBRARY = './node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node';

const prisma = require('./lib/prisma');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
const allowedOrigins = [
  'https://notepad-three-woad.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS Origin check:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200 // Legacy browsers
};

// Apply CORS middleware FIRST
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  console.log('Preflight request from:', req.get('Origin'));
  res.header('Access-Control-Allow-Origin', req.get('Origin'));
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.status(200).end();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    message: 'Notes App API',
    version: '1.0.0',
    allowedOrigins: allowedOrigins
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy blocked this request' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Graceful shutdown handlers
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Database connection and server startup
async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Vercel serverless compatibility
if (process.env.VERCEL) {
  module.exports = app;
} else {
  startServer();
}