import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { connectDatabase } from './config/database';
import { initializeSocket } from './socket';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';
import logger from './utils/logger';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initializeSocket(httpServer);

// Middleware
const allowedOrigins = config.isProduction 
  ? ['https://collaborative-task-manager-indol.vercel.app']
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Security: Limit request body size to prevent DoS attacks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security: Disable X-Powered-By header
app.disable('x-powered-by');

// Security: Rate limiting - 100 requests per 15 minutes per IP
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100
}));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    
    httpServer.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📡 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, httpServer };
