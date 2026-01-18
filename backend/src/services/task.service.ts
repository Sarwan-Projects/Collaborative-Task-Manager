import { taskRepository } from '../repositories/task.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { auditLogRepository } from '../repositories/auditLog.repository';
import { userRepository } from '../repositories/user.repository';
import { taskInvitationRepository } from '../repositories/taskInvitation.repository';
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
   * Creates invitation instead of directly assigning
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

    // Create task without assignee initially
    const task = await taskRepository.create({ 
      ...data, 
      creatorId,
      assignedToId: undefined // Don't assign yet
    });
    
    // If assignee provided, create invitation
    if (data.assignedToId && data.assignedToId !== creatorId) {
      await taskInvitationRepository.create({
        taskId: task._id.toString(),
        fromUserId: creatorId,
        toUserId: data.assignedToId
      });

      await notificationRepository.create({
        userId: data.assignedToId,
        message: `${(await userRepository.findById(creatorId))?.name} wants to assign you a task: "${task.title}". Please accept or reject.`,
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
   * Handles notifications only for completion and reassignment
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

    // Track changes for audit log
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

      // Notify creator when task is completed and delete task notifications
      if (data.status === 'Completed') {
        if (existingTask.creatorId.toString() !== userId) {
          await notificationRepository.create({
            userId: existingTask.creatorId.toString(),
            message: `Task "${existingTask.title}" has been completed`,
            taskId
          });
        }
        
        // Delete all notifications for this task
        await notificationRepository.deleteByTask(taskId);
      }
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

    // Check for assignee change - create invitation for new assignee
    if (data.assignedToId !== undefined) {
      const oldAssignee = existingTask.assignedToId?.toString() || null;
      const newAssignee = data.assignedToId || null;

      if (oldAssignee !== newAssignee && newAssignee) {
        changes.push('assignee');

        // Validate new assignee exists
        const assignee = await userRepository.findById(newAssignee);
        if (!assignee) {
          throw new ApiError('Assigned user not found', 404);
        }

        // Create invitation for new assignee
        await taskInvitationRepository.create({
          taskId,
          fromUserId: userId,
          toUserId: newAssignee
        });

        const creator = await userRepository.findById(userId);
        await notificationRepository.create({
          userId: newAssignee,
          message: `${creator?.name} wants to assign you a task: "${existingTask.title}". Please accept or reject.`,
          taskId
        });

        // Don't update assignedToId yet - wait for acceptance
        delete data.assignedToId;

        await auditLogRepository.create({
          taskId,
          userId,
          action: 'ASSIGNEE_CHANGED',
          previousValue: oldAssignee || 'Unassigned',
          newValue: 'Pending acceptance'
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
   * Only the creator can delete their own tasks
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new ApiError('Task not found', 404);
    }

    // Handle both populated and non-populated creatorId
    const creatorIdString = typeof task.creatorId === 'string' 
      ? task.creatorId 
      : task.creatorId._id.toString();

    // Only creator can delete the task
    if (creatorIdString !== userId) {
      throw new ApiError('Only the task creator can delete this task', 403);
    }

    await taskRepository.delete(taskId);

    // Delete associated notifications and invitations
    await notificationRepository.deleteByTask(taskId);
    await taskInvitationRepository.deleteByTask(taskId);

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
