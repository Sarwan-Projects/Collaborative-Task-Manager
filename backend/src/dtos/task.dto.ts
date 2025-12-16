import { z } from 'zod';
import { Priority, Status } from '../types';

/**
 * DTO for creating a new task
 * Enforces all required fields and validates constraints
 */
export const CreateTaskDto = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required'),
  dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  priority: z
    .nativeEnum(Priority)
    .default(Priority.MEDIUM),
  status: z
    .nativeEnum(Status)
    .default(Status.TODO),
  assignedToId: z
    .string()
    .optional()
    .nullable()
});

/**
 * DTO for updating an existing task
 * All fields are optional for partial updates
 */
export const UpdateTaskDto = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title cannot exceed 100 characters')
    .optional(),
  description: z
    .string()
    .min(1, 'Description cannot be empty')
    .optional(),
  dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
    .optional(),
  priority: z
    .nativeEnum(Priority)
    .optional(),
  status: z
    .nativeEnum(Status)
    .optional(),
  assignedToId: z
    .string()
    .optional()
    .nullable()
});

/**
 * DTO for filtering tasks
 */
export const TaskFilterDto = z.object({
  status: z.nativeEnum(Status).optional(),
  priority: z.nativeEnum(Priority).optional(),
  sortBy: z.enum(['dueDate', 'createdAt', 'priority']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  assignedToMe: z.string().optional(),
  createdByMe: z.string().optional(),
  overdue: z.string().optional()
});

export type CreateTaskInput = z.infer<typeof CreateTaskDto>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskDto>;
export type TaskFilterInput = z.infer<typeof TaskFilterDto>;
