import { Task, ITaskDocument } from '../models/Task';
import { CreateTaskInput, UpdateTaskInput, TaskFilterInput } from '../dtos/task.dto';
import { SortOrder } from 'mongoose';

/**
 * Task Repository - Data access layer for Task model
 * Handles all database operations for tasks
 */
export class TaskRepository {
  /**
   * Create a new task
   */
  async create(data: CreateTaskInput & { creatorId: string }): Promise<ITaskDocument> {
    const task = new Task({
      ...data,
      dueDate: new Date(data.dueDate)
    });
    return task.save();
  }

  /**
   * Find task by ID with populated user references
   */
  async findById(id: string): Promise<ITaskDocument | null> {
    return Task.findById(id)
      .populate('creatorId', 'name email')
      .populate('assignedToId', 'name email');
  }

  /**
   * Update a task
   */
  async update(id: string, data: UpdateTaskInput): Promise<ITaskDocument | null> {
    const updateData: any = { ...data };
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }
    return Task.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('creatorId', 'name email')
      .populate('assignedToId', 'name email');
  }

  /**
   * Delete a task
   */
  async delete(id: string): Promise<ITaskDocument | null> {
    return Task.findByIdAndDelete(id);
  }

  /**
   * Find all tasks with filters and sorting
   */
  async findAll(filters: TaskFilterInput, userId?: string): Promise<ITaskDocument[]> {
    const query: any = {};

    // Apply status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Apply priority filter
    if (filters.priority) {
      query.priority = filters.priority;
    }

    // Filter tasks assigned to current user
    if (filters.assignedToMe === 'true' && userId) {
      query.assignedToId = userId;
    }

    // Filter tasks created by current user
    if (filters.createdByMe === 'true' && userId) {
      query.creatorId = userId;
    }

    // Filter overdue tasks
    if (filters.overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'Completed' };
    }

    // Build sort options
    const sortField = filters.sortBy || 'createdAt';
    const sortOrder: SortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    const sort: { [key: string]: SortOrder } = { [sortField]: sortOrder };

    return Task.find(query)
      .populate('creatorId', 'name email')
      .populate('assignedToId', 'name email')
      .sort(sort);
  }

  /**
   * Get tasks assigned to a specific user
   */
  async findByAssignee(userId: string): Promise<ITaskDocument[]> {
    return Task.find({ assignedToId: userId })
      .populate('creatorId', 'name email')
      .populate('assignedToId', 'name email')
      .sort({ dueDate: 1 });
  }

  /**
   * Get tasks created by a specific user
   */
  async findByCreator(userId: string): Promise<ITaskDocument[]> {
    return Task.find({ creatorId: userId })
      .populate('creatorId', 'name email')
      .populate('assignedToId', 'name email')
      .sort({ createdAt: -1 });
  }

  /**
   * Get overdue tasks for a user
   */
  async findOverdue(userId: string): Promise<ITaskDocument[]> {
    return Task.find({
      $or: [{ assignedToId: userId }, { creatorId: userId }],
      dueDate: { $lt: new Date() },
      status: { $ne: 'Completed' }
    })
      .populate('creatorId', 'name email')
      .populate('assignedToId', 'name email')
      .sort({ dueDate: 1 });
  }
}

export const taskRepository = new TaskRepository();
