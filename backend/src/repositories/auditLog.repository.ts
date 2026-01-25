import { AuditLog, IAuditLogDocument } from '../models/AuditLog';

/**
 * Audit Log Repository - Data access layer for tracking task changes
 */
export class AuditLogRepository {
  /**
   * Create a new audit log entry
   */
  async create(data: {
    taskId: string;
    userId: string;
    action: string;
    previousValue?: string;
    newValue?: string;
  }): Promise<IAuditLogDocument> {
    const log = new AuditLog(data);
    return log.save();
  }

  /**
   * Get audit logs for a specific task
   */
  async findByTask(taskId: string): Promise<IAuditLogDocument[]> {
    return AuditLog.find({ taskId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
  }

  /**
   * Delete all audit logs for a specific task
   * Used for cleanup when task is deleted or completed
   */
  async deleteByTask(taskId: string): Promise<void> {
    await AuditLog.deleteMany({ taskId });
  }
}

export const auditLogRepository = new AuditLogRepository();
