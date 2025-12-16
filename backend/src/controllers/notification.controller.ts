import { Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service';
import { AuthRequest } from '../types';

/**
 * Notification Controller
 * Handles HTTP requests for notification endpoints
 */
export class NotificationController {
  /**
   * GET /api/v1/notifications
   * Get all notifications for current user
   */
  async getNotifications(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const notifications = await notificationService.getUserNotifications(req.user!.id);
      const unreadCount = await notificationService.getUnreadCount(req.user!.id);

      res.status(200).json({
        success: true,
        data: {
          notifications,
          unreadCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/notifications/:id/read
   * Mark a notification as read
   */
  async markAsRead(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const notification = await notificationService.markAsRead(
        req.params.id,
        req.user!.id
      );

      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/notifications/read-all
   * Mark all notifications as read
   */
  async markAllAsRead(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await notificationService.markAllAsRead(req.user!.id);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
