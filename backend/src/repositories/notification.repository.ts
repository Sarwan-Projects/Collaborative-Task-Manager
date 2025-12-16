import { Notification, INotificationDocument } from '../models/Notification';

/**
 * Notification Repository - Data access layer for Notification model
 */
export class NotificationRepository {
  /**
   * Create a new notification
   */
  async create(data: {
    userId: string;
    message: string;
    taskId?: string;
  }): Promise<INotificationDocument> {
    const notification = new Notification(data);
    return notification.save();
  }

  /**
   * Get all notifications for a user
   */
  async findByUser(userId: string): Promise<INotificationDocument[]> {
    return Notification.find({ userId })
      .populate('taskId', 'title')
      .sort({ createdAt: -1 })
      .limit(50);
  }

  /**
   * Get unread notifications count
   */
  async countUnread(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, read: false });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string, userId: string): Promise<INotificationDocument | null> {
    return Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany({ userId, read: false }, { read: true });
  }
}

export const notificationRepository = new NotificationRepository();
