import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/notifications
 * @desc Get all notifications for current user
 * @access Private
 */
router.get('/', (req, res, next) =>
  notificationController.getNotifications(req, res, next)
);

/**
 * @route PUT /api/v1/notifications/read-all
 * @desc Mark all notifications as read
 * @access Private
 */
router.put('/read-all', (req, res, next) =>
  notificationController.markAllAsRead(req, res, next)
);

/**
 * @route PUT /api/v1/notifications/:id/read
 * @desc Mark a notification as read
 * @access Private
 */
router.put('/:id/read', (req, res, next) =>
  notificationController.markAsRead(req, res, next)
);

export default router;
