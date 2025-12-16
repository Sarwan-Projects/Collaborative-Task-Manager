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

      // Emit real-time event
      getIO().emit('task:created', task);

      res.status(201).json({
        success: true,
        data: task,
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

      res.status(200).json({
        success: true,
        data: tasks,
        count: tasks.length
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

      res.status(200).json({
        success: true,
        data: task
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

      // Emit real-time event with change details
      getIO().emit('task:updated', { task, changes });

      // If assignee changed, emit specific notification event
      if (changes.includes('assignee') && task.assignedToId) {
        getIO().to(`user:${task.assignedToId}`).emit('notification:new', {
          message: `You have been assigned to task: "${task.title}"`,
          taskId: task._id
        });
      }

      res.status(200).json({
        success: true,
        data: task,
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

      res.status(200).json({
        success: true,
        data
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
