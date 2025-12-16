import { TaskService } from './task.service';
import { taskRepository } from '../repositories/task.repository';
import { userRepository } from '../repositories/user.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { auditLogRepository } from '../repositories/auditLog.repository';
import { ApiError } from '../middleware/error.middleware';
import { Priority, Status } from '../types';

// Mock all repositories
jest.mock('../repositories/task.repository');
jest.mock('../repositories/user.repository');
jest.mock('../repositories/notification.repository');
jest.mock('../repositories/auditLog.repository');

describe('TaskService', () => {
  let taskService: TaskService;

  beforeEach(() => {
    taskService = new TaskService();
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    const mockTaskInput = {
      title: 'Test Task',
      description: 'Test Description',
      dueDate: '2024-12-31',
      priority: Priority.HIGH,
      status: Status.TODO,
      assignedToId: 'user123'
    };

    const mockCreatedTask = {
      _id: 'task123',
      ...mockTaskInput,
      creatorId: 'creator123',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should create a task successfully', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue({ _id: 'user123', name: 'Test User' });
      (taskRepository.create as jest.Mock).mockResolvedValue(mockCreatedTask);
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockCreatedTask);
      (notificationRepository.create as jest.Mock).mockResolvedValue({});
      (auditLogRepository.create as jest.Mock).mockResolvedValue({});

      const result = await taskService.createTask(mockTaskInput, 'creator123');

      expect(taskRepository.create).toHaveBeenCalledWith({
        ...mockTaskInput,
        creatorId: 'creator123'
      });
      expect(result).toEqual(mockCreatedTask);
    });

    it('should throw error if assigned user does not exist', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(taskService.createTask(mockTaskInput, 'creator123'))
        .rejects
        .toThrow(new ApiError('Assigned user not found', 404));
    });

    it('should create notification when task is assigned to another user', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue({ _id: 'user123' });
      (taskRepository.create as jest.Mock).mockResolvedValue(mockCreatedTask);
      (taskRepository.findById as jest.Mock).mockResolvedValue(mockCreatedTask);
      (notificationRepository.create as jest.Mock).mockResolvedValue({});
      (auditLogRepository.create as jest.Mock).mockResolvedValue({});

      await taskService.createTask(mockTaskInput, 'creator123');

      expect(notificationRepository.create).toHaveBeenCalledWith({
        userId: 'user123',
        message: `You have been assigned a new task: "${mockTaskInput.title}"`,
        taskId: 'task123'
      });
    });

    it('should not create notification when creator assigns to themselves', async () => {
      const selfAssignInput = { ...mockTaskInput, assignedToId: 'creator123' };
      const selfAssignTask = { ...mockCreatedTask, assignedToId: 'creator123' };

      (userRepository.findById as jest.Mock).mockResolvedValue({ _id: 'creator123' });
      (taskRepository.create as jest.Mock).mockResolvedValue(selfAssignTask);
      (taskRepository.findById as jest.Mock).mockResolvedValue(selfAssignTask);
      (auditLogRepository.create as jest.Mock).mockResolvedValue({});

      await taskService.createTask(selfAssignInput, 'creator123');

      expect(notificationRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateTask', () => {
    const existingTask = {
      _id: 'task123',
      title: 'Existing Task',
      status: Status.TODO,
      priority: Priority.MEDIUM,
      assignedToId: { toString: () => 'user1' },
      creatorId: { toString: () => 'creator1' }
    };

    it('should update task status and log the change', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(existingTask);
      (taskRepository.update as jest.Mock).mockResolvedValue({
        ...existingTask,
        status: Status.IN_PROGRESS
      });
      (auditLogRepository.create as jest.Mock).mockResolvedValue({});

      const result = await taskService.updateTask(
        'task123',
        { status: Status.IN_PROGRESS },
        'user1'
      );

      expect(result.changes).toContain('status');
      expect(auditLogRepository.create).toHaveBeenCalledWith({
        taskId: 'task123',
        userId: 'user1',
        action: 'STATUS_CHANGED',
        previousValue: Status.TODO,
        newValue: Status.IN_PROGRESS
      });
    });

    it('should throw error if task not found', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(taskService.updateTask('nonexistent', { status: Status.COMPLETED }, 'user1'))
        .rejects
        .toThrow(new ApiError('Task not found', 404));
    });

    it('should notify new assignee when assignment changes', async () => {
      (taskRepository.findById as jest.Mock).mockResolvedValue(existingTask);
      (userRepository.findById as jest.Mock).mockResolvedValue({ _id: 'user2' });
      (taskRepository.update as jest.Mock).mockResolvedValue({
        ...existingTask,
        assignedToId: 'user2'
      });
      (notificationRepository.create as jest.Mock).mockResolvedValue({});
      (auditLogRepository.create as jest.Mock).mockResolvedValue({});

      const result = await taskService.updateTask(
        'task123',
        { assignedToId: 'user2' },
        'user1'
      );

      expect(result.changes).toContain('assignee');
      expect(notificationRepository.create).toHaveBeenCalledWith({
        userId: 'user2',
        message: `You have been assigned to task: "${existingTask.title}"`,
        taskId: 'task123'
      });
    });
  });

  describe('deleteTask', () => {
    it('should delete task when user is the creator', async () => {
      const task = {
        _id: 'task123',
        title: 'Task to delete',
        creatorId: { toString: () => 'creator1' }
      };

      (taskRepository.findById as jest.Mock).mockResolvedValue(task);
      (taskRepository.delete as jest.Mock).mockResolvedValue(task);
      (auditLogRepository.create as jest.Mock).mockResolvedValue({});

      await taskService.deleteTask('task123', 'creator1');

      expect(taskRepository.delete).toHaveBeenCalledWith('task123');
    });

    it('should throw error when non-creator tries to delete', async () => {
      const task = {
        _id: 'task123',
        creatorId: { toString: () => 'creator1' }
      };

      (taskRepository.findById as jest.Mock).mockResolvedValue(task);

      await expect(taskService.deleteTask('task123', 'otherUser'))
        .rejects
        .toThrow(new ApiError('Only the task creator can delete this task', 403));
    });
  });
});
