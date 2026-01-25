import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

/**
 * Global error handling middleware
 * Catches all errors and returns consistent error responses
 */
export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging (but don't expose to client)
  logger.error('Error:', { name: err.name, message: err.message, stack: err.stack });

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
    return;
  }

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Validation error. Please check your input.'
    });
    return;
  }

  // Handle mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: 'Invalid ID format'
    });
    return;
  }

  // Handle duplicate key errors
  if ((err as any).code === 11000) {
    res.status(409).json({
      success: false,
      error: 'Duplicate entry. This record already exists.'
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Authentication token expired'
    });
    return;
  }

  // Default server error - don't expose internal details
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response
): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`
  });
};
