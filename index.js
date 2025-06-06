const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CRITICAL: Set headers BEFORE any other middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // List of allowed origins
  const allowedOrigins = [
    'http://localhost:3000',
    'https://notepad-three-woad.vercel.app',
    'https://notes-frontend.vercel.app',
    'https://notes-n60jx6mrq-ramkrish82033-3083s-projects.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  // Check if origin is allowed
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Preflight request from:', origin);
    return res.status(200).end();
  }
  
  console.log(`${req.method} ${req.url} from origin: ${origin}`);
  next();
});

// CORS middleware as backup
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://notepad-three-woad.vercel.app',
      'https://notes-frontend.vercel.app',
      'https://notes-n60jx6mrq-ramkrish82033-3083s-projects.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all origins in production for now
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    message: 'Notes App API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    message: 'Notes App API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for CORS
app.get('/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS test successful',
    origin: req.headers.origin,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

app.post('/test-cors', (req, res) => {
  res.json({ 
    message: 'POST CORS test successful',
    origin: req.headers.origin,
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Initialize dependencies lazily
let prisma;
let routes;

async function initializeDependencies() {
  if (!prisma) {
    try {
      // Set Prisma engine path for Vercel
      if (process.env.VERCEL) {
        process.env.PRISMA_QUERY_ENGINE_LIBRARY = './node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node';
      }
      
      prisma = require('./lib/prisma');
      routes = require('./routes');
      
      // Test database connection
      await prisma.$connect();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Failed to initialize dependencies:', error);
      // Don't throw error, let the app continue without DB for now
    }
  }
  return { prisma, routes };
}

// Routes middleware
app.use(async (req, res, next) => {
  try {
    if (!routes && req.path !== '/' && req.path !== '/health' && req.path !== '/test-cors') {
      await initializeDependencies();
    }
    next();
  } catch (error) {
    console.error('Initialization error:', error);
    next(); // Continue anyway
  }
});

// Apply routes
app.use('/', (req, res, next) => {
  if (routes) {
    routes(req, res, next);
  } else {
    next();
  }
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// For local development
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;