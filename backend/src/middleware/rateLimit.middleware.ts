import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Simple rate limiting middleware
 * Limits requests per IP address
 */
export const rateLimiter = (options: {
  windowMs: number;
  maxRequests: number;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean up old entries
    if (Math.random() < 0.01) { // 1% chance to clean up
      Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
          delete store[key];
        }
      });
    }
    
    // Initialize or get existing record
    if (!store[ip] || store[ip].resetTime < now) {
      store[ip] = {
        count: 1,
        resetTime: now + options.windowMs
      };
      return next();
    }
    
    // Increment count
    store[ip].count++;
    
    // Check if limit exceeded
    if (store[ip].count > options.maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later'
      });
    }
    
    next();
  };
};
