export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent'
}

export enum Status {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  COMPLETED = 'Completed'
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  status: Status;
  creatorId: User | string;
  assignedToId?: User | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  message: string;
  taskId?: { _id: string; title: string };
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  taskId: string;
  userId: User;
  action: string;
  previousValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

export interface DashboardData {
  assignedToMe: Task[];
  createdByMe: Task[];
  overdue: Task[];
}

export interface TaskFilters {
  status?: Status;
  priority?: Priority;
  sortBy?: 'dueDate' | 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
  assignedToMe?: string;
  createdByMe?: string;
  overdue?: string;
}
