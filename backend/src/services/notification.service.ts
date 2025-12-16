import { notificationRepository } from '../repositories/notification.repository';
import { INotificationDocument } from '../models/Notification';

/**
 * Notification Service
 * Handles notification business logic
 */
export class NotificationService {
  /**
   * Get all notifications for a user
   */
  async getUserNotifications(userId: string): Promise<INotificationDocument[]> {
    return notificationRepository.findByUser(userId);
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return notificationRepository.countUnread(userId);
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<INotificationDocument | null> {
    return notificationRepository.markAsRead(notificationId, userId);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    await notificationRepository.markAllAsRead(userId);
  }

  /**
   * Create a notification (used by other services)
   */
  async createNotification(data: {
    userId: string;
    message: string;
    taskId?: string;
  }): Promise<INotificationDocument> {
    return notificationRepository.create(data);
  }
}

export const notificationService = new NotificationService();
