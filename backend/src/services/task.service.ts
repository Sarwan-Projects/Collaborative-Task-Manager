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

    // If user assigns to themselves, create task with assignment
    // Otherwise, create task without assignee and send invitation
    if (data.assignedToId && data.assignedToId === creatorId) {
      // Self-assignment - no invitation needed
      const task = await taskRepository.create({ 
        ...data, 
        creatorId,
        assignedToId: data.assignedToId
      });

      await auditLogRepository.create({
        taskId: task._id.toString(),
        userId: creatorId,
        action: 'CREATED',
        newValue: task.title
      });

      return taskRepository.findById(task._id.toString()) as Promise<ITaskDocument>;
    }

    // Create task without assignee initially
    const task = await taskRepository.create({ 
      ...data, 
      creatorId,
      assignedToId: undefined // Don't assign yet
    });
    
    // If assignee provided (and not self), create invitation (no notification - invitation is enough)
    if (data.assignedToId) {
      await taskInvitationRepository.create({
        taskId: task._id.toString(),
        fromUserId: creatorId,
        toUserId: data.assignedToId
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
   * Enforces permissions: creator can edit all, assignee can only edit status
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

    // Check permissions
    const creatorIdString = typeof existingTask.creatorId === 'string'
      ? existingTask.creatorId
      : existingTask.creatorId._id.toString();
    
    const assigneeIdString = existingTask.assignedToId
      ? (typeof existingTask.assignedToId === 'string'
        ? existingTask.assignedToId
        : existingTask.assignedToId._id.toString())
      : null;

    const isCreator = creatorIdString === userId;
    const isAssignee = assigneeIdString === userId;

    // If not creator or assignee, no permission to update
    if (!isCreator && !isAssignee) {
      throw new ApiError('You do not have permission to update this task', 403);
    }

    // If assignee but not creator, only allow status updates
    if (isAssignee && !isCreator) {
      const allowedFields = ['status'];
      const requestedFields = Object.keys(data);
      const unauthorizedFields = requestedFields.filter(f => !allowedFields.includes(f));
      
      if (unauthorizedFields.length > 0) {
        throw new ApiError('You can only update the status of this task', 403);
      }
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

      // Handle status change notifications
      if (data.status === 'Completed') {
        // Only creator can mark as completed
        if (!isCreator) {
          throw new ApiError('Only the task creator can mark the task as completed', 403);
        }

        // Notify assignee that task is completed
        if (existingTask.assignedToId && existingTask.assignedToId.toString() !== userId) {
          const creator = await userRepository.findById(userId);
          await notificationRepository.create({
            userId: existingTask.assignedToId.toString(),
            message: `✅ Your task "${existingTask.title}" has been marked as completed by ${creator?.name}!`,
            taskId
          });
        }
        
        // Delete the task after marking as completed (cleanup)
        await taskRepository.delete(taskId);
        await notificationRepository.deleteByTask(taskId);
        await taskInvitationRepository.deleteByTask(taskId);
        
        // Return the task before deletion for the response
        const deletedTask = { ...existingTask.toObject(), status: 'Completed' };
        return { task: deletedTask as any, changes };
      } else if (data.status === 'Review') {
        // Assignee moved to review, notify creator
        if (isAssignee && !isCreator && existingTask.creatorId.toString() !== userId) {
          const assignee = await userRepository.findById(userId);
          await notificationRepository.create({
            userId: existingTask.creatorId.toString(),
            message: `👀 ${assignee?.name} has submitted "${existingTask.title}" for your review`,
            taskId
          });
        }
      } else if (isCreator && existingTask.assignedToId && existingTask.assignedToId.toString() !== userId) {
        // Creator changed status back (not completed), notify assignee
        const creator = await userRepository.findById(userId);
        const statusMessages: Record<string, string> = {
          'To Do': `📝 ${creator?.name} moved "${existingTask.title}" back to To Do. Please review the requirements.`,
          'In Progress': `🔄 ${creator?.name} moved "${existingTask.title}" to In Progress. Keep working on it!`,
          'Review': `👀 ${creator?.name} moved "${existingTask.title}" to Review. Please check the feedback.`
        };
        
        await notificationRepository.create({
          userId: existingTask.assignedToId.toString(),
          message: statusMessages[data.status] || `🔔 Task "${existingTask.title}" status updated to ${data.status}`,
          taskId
        });
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

        // If reassigning to self, update directly
        if (newAssignee === userId) {
          // Delete any pending invitations for this task
          await taskInvitationRepository.deleteByTask(taskId);
          
          await auditLogRepository.create({
            taskId,
            userId,
            action: 'ASSIGNEE_CHANGED',
            previousValue: oldAssignee || 'Unassigned',
            newValue: 'Self'
          });
        } else {
          // Check if there's already a pending invitation for this task
          const existingInvitation = await taskInvitationRepository.findByTask(taskId);
          
          if (existingInvitation) {
            // If invitation exists and is for the same user, don't create a new one
            const existingToUserId = typeof existingInvitation.toUserId === 'string'
              ? existingInvitation.toUserId
              : existingInvitation.toUserId._id.toString();
            
            if (existingToUserId === newAssignee) {
              // Same user, just keep the existing invitation
              delete data.assignedToId;
            } else {
              // Different user, delete old invitation and create new one
              await taskInvitationRepository.deleteByTask(taskId);
              await taskInvitationRepository.create({
                taskId,
                fromUserId: userId,
                toUserId: newAssignee
              });
              delete data.assignedToId;
            }
          } else {
            // No existing invitation, create new one
            await taskInvitationRepository.create({
              taskId,
              fromUserId: userId,
              toUserId: newAssignee
            });
            delete data.assignedToId;
          }

          await auditLogRepository.create({
            taskId,
            userId,
            action: 'ASSIGNEE_CHANGED',
            previousValue: oldAssignee || 'Unassigned',
            newValue: 'Pending acceptance'
          });
        }
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
