import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function useUpdateProfile() {
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await api.put('/auth/profile', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      updateUser(data);
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    }
  });
}
