import { Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { AuthRequest } from '../types';
import { getIO } from '../socket';

/**
 * Task Controller
 * Handles HTTP requests for task endpoints
 */
export class TaskController {
  /**
   * POST /api/v1/tasks
   * Create a new task
   */
  async createTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.createTask(req.body, req.user!.id);

      // Transform task to ensure consistent ID format
      const transformedTask = {
        ...task.toObject(),
        creatorId: task.creatorId ? {
          id: (task.creatorId as any)._id.toString(),
          name: (task.creatorId as any).name,
          email: (task.creatorId as any).email
        } : task.creatorId,
        assignedToId: task.assignedToId ? {
          id: (task.assignedToId as any)._id.toString(),
          name: (task.assignedToId as any).name,
          email: (task.assignedToId as any).email
        } : task.assignedToId
      };

      // Emit real-time event
      getIO().emit('task:created', transformedTask);

      res.status(201).json({
        success: true,
        data: transformedTask,
        message: 'Task created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/tasks
   * Get all tasks with filters
   */
  async getTasks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await taskService.getTasks(req.query as any, req.user!.id);

      // Transform tasks to ensure consistent ID format
      const transformedTasks = tasks.map(task => ({
        ...task.toObject(),
        creatorId: task.creatorId ? {
          id: (task.creatorId as any)._id.toString(),
          name: (task.creatorId as any).name,
          email: (task.creatorId as any).email
        } : task.creatorId,
        assignedToId: task.assignedToId ? {
          id: (task.assignedToId as any)._id.toString(),
          name: (task.assignedToId as any).name,
          email: (task.assignedToId as any).email
        } : task.assignedToId
      }));

      res.status(200).json({
        success: true,
        data: transformedTasks,
        count: transformedTasks.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/tasks/:id
   * Get a single task
   */
  async getTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await taskService.getTask(req.params.id);

      // Transform task to ensure consistent ID format
      const transformedTask = {
        ...task.toObject(),
        creatorId: task.creatorId ? {
          id: (task.creatorId as any)._id.toString(),
          name: (task.creatorId as any).name,
          email: (task.creatorId as any).email
        } : task.creatorId,
        assignedToId: task.assignedToId ? {
          id: (task.assignedToId as any)._id.toString(),
          name: (task.assignedToId as any).name,
          email: (task.assignedToId as any).email
        } : task.assignedToId
      };

      res.status(200).json({
        success: true,
        data: transformedTask
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/tasks/:id
   * Update a task
   */
  async updateTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { task, changes } = await taskService.updateTask(
        req.params.id,
        req.body,
        req.user!.id
      );

      // Transform task to ensure consistent ID format
      const transformedTask = {
        ...task.toObject(),
        creatorId: task.creatorId ? {
          id: (task.creatorId as any)._id.toString(),
          name: (task.creatorId as any).name,
          email: (task.creatorId as any).email
        } : task.creatorId,
        assignedToId: task.assignedToId ? {
          id: (task.assignedToId as any)._id.toString(),
          name: (task.assignedToId as any).name,
          email: (task.assignedToId as any).email
        } : task.assignedToId
      };

      // Emit real-time event with change details
      getIO().emit('task:updated', { task: transformedTask, changes });

      // If assignee changed, emit specific notification event
      if (changes.includes('assignee') && task.assignedToId) {
        getIO().to(`user:${task.assignedToId}`).emit('notification:new', {
          message: `You have been assigned to task: "${task.title}"`,
          taskId: task._id
        });
      }

      res.status(200).json({
        success: true,
        data: transformedTask,
        message: 'Task updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/tasks/:id
   * Delete a task
   */
  async deleteTask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await taskService.deleteTask(req.params.id, req.user!.id);

      // Emit real-time event
      getIO().emit('task:deleted', { taskId: req.params.id });

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/tasks/dashboard
   * Get dashboard data
   */
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await taskService.getDashboardData(req.user!.id);

      // Transform tasks to ensure consistent ID format
      const transformTask = (task: any) => ({
        ...task.toObject(),
        creatorId: task.creatorId ? {
          id: task.creatorId._id.toString(),
          name: task.creatorId.name,
          email: task.creatorId.email
        } : task.creatorId,
        assignedToId: task.assignedToId ? {
          id: task.assignedToId._id.toString(),
          name: task.assignedToId.name,
          email: task.assignedToId.email
        } : task.assignedToId
      });

      res.status(200).json({
        success: true,
        data: {
          assignedToMe: data.assignedToMe.map(transformTask),
          createdByMe: data.createdByMe.map(transformTask),
          overdue: data.overdue.map(transformTask)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/tasks/:id/audit
   * Get audit logs for a task
   */
  async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await taskService.getTaskAuditLogs(req.params.id);

      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
