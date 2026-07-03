import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useTasks = () =>
  useQuery({ queryKey: ['tasks'], queryFn: () => api.get('/tasks').then(r => r.data) });

export const useCreateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => api.post('/tasks', { title }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
  });
};

export const useToggleTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      api.patch(`/tasks/${id}`, { completed }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
  });
};