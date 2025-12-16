import { taskRepository } from '../repositories/task.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { auditLogRepository } from '../repositories/auditLog.repository';
import { userRepository } from '../repositories/user.repository';
import { CreateTaskInput, UpdateTaskInput, TaskFilterInput } from '../dtos/task.dto';
import { ApiError } from '../middleware/error.middleware';
import { ITaskDocument } from '../models/Task';

/**
 * Task Service
 * Business logic for task management operations
 */
export class TaskService {
  /**
   * Create a new task
   * Validates input and creates task with creator reference
   */
  async createTask(
    data: CreateTaskInput,
    creatorId: string
  ): Promise<ITaskDocument> {
    // Validate assignee exists if provided
    if (data.assignedToId) {
      const assignee = await userRepository.findById(data.assignedToId);
      if (!assignee) {
        throw new ApiError('Assigned user not found', 404);
      }
    }

    const task = await taskRepository.create({ ...data, creatorId });
    
    // Create notification if task is assigned to someone
    if (data.assignedToId && data.assignedToId !== creatorId) {
      await notificationRepository.create({
        userId: data.assignedToId,
        message: `You have been assigned a new task: "${task.title}"`,
        taskId: task._id.toString()
      });
    }

    // Log task creation
    await auditLogRepository.create({
      taskId: task._id.toString(),
      userId: creatorId,
      action: 'CREATED',
      newValue: task.title
    });

    // Return populated task
    return taskRepository.findById(task._id.toString()) as Promise<ITaskDocument>;
  }

  /**
   * Get a single task by ID
   */
  async getTask(taskId: string): Promise<ITaskDocument> {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new ApiError('Task not found', 404);
    }
    return task;
  }

  /**
   * Update an existing task
   * Handles notifications and audit logging
   */
  async updateTask(
    taskId: string,
    data: UpdateTaskInput,
    userId: string
  ): Promise<{ task: ITaskDocument; changes: string[] }> {
    const existingTask = await taskRepository.findById(taskId);
    if (!existingTask) {
      throw new ApiError('Task not found', 404);
    }

    // Track changes for audit log and real-time updates
    const changes: string[] = [];

    // Check for status change
    if (data.status && data.status !== existingTask.status) {
      changes.push('status');
      await auditLogRepository.create({
        taskId,
        userId,
        action: 'STATUS_CHANGED',
        previousValue: existingTask.status,
        newValue: data.status
      });
    }

    // Check for priority change
    if (data.priority && data.priority !== existingTask.priority) {
      changes.push('priority');
      await auditLogRepository.create({
        taskId,
        userId,
        action: 'PRIORITY_CHANGED',
        previousValue: existingTask.priority,
        newValue: data.priority
      });
    }

    // Check for assignee change
    if (data.assignedToId !== undefined) {
      const oldAssignee = existingTask.assignedToId?.toString() || null;
      const newAssignee = data.assignedToId || null;

      if (oldAssignee !== newAssignee) {
        changes.push('assignee');

        // Validate new assignee exists
        if (newAssignee) {
          const assignee = await userRepository.findById(newAssignee);
          if (!assignee) {
            throw new ApiError('Assigned user not found', 404);
          }

          // Notify new assignee
          await notificationRepository.create({
            userId: newAssignee,
            message: `You have been assigned to task: "${existingTask.title}"`,
            taskId
          });
        }

        await auditLogRepository.create({
          taskId,
          userId,
          action: 'ASSIGNEE_CHANGED',
          previousValue: oldAssignee || 'Unassigned',
          newValue: newAssignee || 'Unassigned'
        });
      }
    }

    const task = await taskRepository.update(taskId, data);
    if (!task) {
      throw new ApiError('Failed to update task', 500);
    }

    return { task, changes };
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new ApiError('Task not found', 404);
    }

    // Only creator can delete the task
    if (task.creatorId.toString() !== userId) {
      throw new ApiError('Only the task creator can delete this task', 403);
    }

    await taskRepository.delete(taskId);

    await auditLogRepository.create({
      taskId,
      userId,
      action: 'DELETED',
      previousValue: task.title
    });
  }

  /**
   * Get all tasks with optional filters
   */
  async getTasks(filters: TaskFilterInput, userId?: string): Promise<ITaskDocument[]> {
    return taskRepository.findAll(filters, userId);
  }

  /**
   * Get dashboard data for a user
   */
  async getDashboardData(userId: string): Promise<{
    assignedToMe: ITaskDocument[];
    createdByMe: ITaskDocument[];
    overdue: ITaskDocument[];
  }> {
    const [assignedToMe, createdByMe, overdue] = await Promise.all([
      taskRepository.findByAssignee(userId),
      taskRepository.findByCreator(userId),
      taskRepository.findOverdue(userId)
    ]);

    return { assignedToMe, createdByMe, overdue };
  }

  /**
   * Get audit logs for a task
   */
  async getTaskAuditLogs(taskId: string) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new ApiError('Task not found', 404);
    }
    return auditLogRepository.findByTask(taskId);
  }
}

export const taskService = new TaskService();
