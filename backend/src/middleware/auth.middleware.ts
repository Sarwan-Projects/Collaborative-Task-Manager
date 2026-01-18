import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest, JwtPayload } from '../types';
import { userRepository } from '../repositories/user.repository';

/**
 * Authentication middleware
 * Verifies JWT token from cookies or Authorization header
 * Also validates that the user still exists in the database
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check for token in cookies first, then Authorization header
    let token = req.cookies?.token;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.'
      });
      return;
    }

    // Verify the token
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    
    // Check if user still exists in database
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User account no longer exists. Please log in again.'
      });
      return;
    }
    
    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired. Please log in again.'
      });
      return;
    }
    
    res.status(401).json({
      success: false,
      error: 'Invalid token. Please log in again.'
    });
  }
};
