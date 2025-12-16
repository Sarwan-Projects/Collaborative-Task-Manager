import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { RegisterDto, LoginDto, UpdateProfileDto } from '../dtos/auth.dto';

const router = Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', validate(RegisterDto), (req, res, next) =>
  authController.register(req, res, next)
);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', validate(LoginDto), (req, res, next) =>
  authController.login(req, res, next)
);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authenticate, (req, res) =>
  authController.logout(req, res)
);

/**
 * @route GET /api/v1/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticate, (req, res, next) =>
  authController.getProfile(req, res, next)
);

/**
 * @route PUT /api/v1/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', authenticate, validate(UpdateProfileDto), (req, res, next) =>
  authController.updateProfile(req, res, next)
);

/**
 * @route GET /api/v1/auth/users
 * @desc Get all users for task assignment
 * @access Private
 */
router.get('/users', authenticate, (req, res, next) =>
  authController.getAllUsers(req, res, next)
);

export default router;
