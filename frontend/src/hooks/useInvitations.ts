import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { TaskInvitation, ApiResponse } from '../types';
import toast from 'react-hot-toast';

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<TaskInvitation[]>>('/invitations');
      return response.data.data || [];
    }
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await api.post(`/invitations/${invitationId}/accept`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('✓ Task invitation accepted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to accept invitation');
    }
  });
}

export function useRejectInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await api.post(`/invitations/${invitationId}/reject`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('✓ Task invitation rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to reject invitation');
    }
  });
}
