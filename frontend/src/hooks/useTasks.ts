import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Task, TaskFilters, DashboardData, ApiResponse } from '../types';
import toast from 'react-hot-toast';

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      const response = await api.get<ApiResponse<Task[]>>(`/tasks?${params}`);
      return response.data.data || [];
    }
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
      return response.data.data;
    },
    enabled: !!id
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardData>>('/tasks/dashboard');
      return response.data.data;
    }
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const response = await api.post('/tasks', data);
      return response.data.data;
    },
    onMutate: async (newTask) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });

      // Get previous data
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);
      const previousDashboard = queryClient.getQueryData<DashboardData>(['dashboard']);

      // Optimistically update
      if (previousTasks) {
        const optimisticTask: Task = {
          ...(newTask as Task),
          _id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        queryClient.setQueryData(['tasks'], [optimisticTask, ...previousTasks]);
      }

      return { previousTasks, previousDashboard };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('✓ Task created successfully');
    },
    onError: (error: any, _, context: any) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      if (context?.previousDashboard) {
        queryClient.setQueryData(['dashboard'], context.previousDashboard);
      }
      toast.error(error.response?.data?.error || 'Failed to create task');
    }
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      const response = await api.put(`/tasks/${id}`, data);
      return response.data.data;
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });
      await queryClient.cancelQueries({ queryKey: ['task', id] });

      // Get previous data
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);
      const previousTask = queryClient.getQueryData<Task>(['task', id]);
      const previousDashboard = queryClient.getQueryData<DashboardData>(['dashboard']);

      // Optimistically update
      if (previousTasks) {
        queryClient.setQueryData(
          ['tasks'],
          previousTasks.map((task) => (task._id === id ? { ...task, ...data } : task))
        );
      }
      if (previousTask) {
        queryClient.setQueryData(['task', id], { ...previousTask, ...data });
      }

      return { previousTasks, previousTask, previousDashboard };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      toast.success('✓ Task updated successfully');
    },
    onError: (error: any, _, context: any) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(['task', context.id], context.previousTask);
      }
      if (context?.previousDashboard) {
        queryClient.setQueryData(['dashboard'], context.previousDashboard);
      }
      toast.error(error.response?.data?.error || 'Failed to update task');
    }
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onMutate: async (id) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      await queryClient.cancelQueries({ queryKey: ['dashboard'] });

      // Get previous data
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);
      const previousDashboard = queryClient.getQueryData<DashboardData>(['dashboard']);

      // Optimistically update
      if (previousTasks) {
        queryClient.setQueryData(
          ['tasks'],
          previousTasks.filter((task) => task._id !== id)
        );
      }

      return { previousTasks, previousDashboard };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('✓ Task deleted successfully');
    },
    onError: (error: any, _, context: any) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      if (context?.previousDashboard) {
        queryClient.setQueryData(['dashboard'], context.previousDashboard);
      }
      toast.error(error.response?.data?.error || 'Failed to delete task');
    }
  });
}

export function useTaskAuditLogs(taskId: string) {
  return useQuery({
    queryKey: ['task-audit', taskId],
    queryFn: async () => {
      const response = await api.get(`/tasks/${taskId}/audit`);
      return response.data.data;
    },
    enabled: !!taskId
  });
}
