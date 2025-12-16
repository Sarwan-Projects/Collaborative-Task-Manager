import { Request } from 'express';

/** Task priority levels */
export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent'
}

/** Task status options */
export enum Status {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  COMPLETED = 'Completed'
}

/** User interface for type safety */
export interface IUser {
  _id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Task interface matching our schema */
export interface ITask {
  _id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  status: Status;
  creatorId: string;
  assignedToId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Notification interface */
export interface INotification {
  _id: string;
  userId: string;
  message: string;
  taskId?: string;
  read: boolean;
  createdAt: Date;
}

/** Audit log for tracking changes */
export interface IAuditLog {
  _id: string;
  taskId: string;
  userId: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  createdAt: Date;
}

/** Extended request with user info */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/** JWT payload structure */
export interface JwtPayload {
  id: string;
  email: string;
}

/** API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
