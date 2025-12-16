import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { User, ApiResponse } from '../types';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<User[]>>('/auth/users');
      return response.data.data || [];
    }
  });
}
