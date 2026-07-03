import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  userId: number;
  createdAt: string;
}

interface ApiErrorResponse {
  message?: string;
  errors?: { message: string }[];
}

export const useTasks = () =>
  useQuery<Task[]>({ queryKey: ['tasks'], queryFn: () => api.get('/tasks').then(r => r.data) });

export const useCreateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; priority?: string; dueDate?: string | null }) => 
      api.post('/tasks', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.message || axiosError.response?.data?.errors?.[0]?.message || 'Failed to create task';
      toast.error(message);
    }
  });
};

export const useUpdateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: number; title?: string; completed?: boolean; priority?: string; dueDate?: string | null }) =>
      api.patch(`/tasks/${id}`, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.message || axiosError.response?.data?.errors?.[0]?.message || 'Failed to update task';
      toast.error(message);
    }
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.message || 'Failed to delete task';
      toast.error(message);
    }
  });
};