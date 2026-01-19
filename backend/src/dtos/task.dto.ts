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
    .transform(val => val === '' ? null : val)
    .nullable()
    .optional()
});

/**
 * DTO for updating an existing task
 * All fields are optional for partial updates
 * Lenient validation to allow status-only updates
 */
export const UpdateTaskDto = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(Status).optional(),
  assignedToId: z
    .union([z.string(), z.null()])
    .optional()
    .transform(val => val === '' ? null : val)
}).passthrough();

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
