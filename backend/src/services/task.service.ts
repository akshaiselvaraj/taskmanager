import * as TaskRepo from '../repositories/task.repository';
import { Priority } from '@prisma/client';

export const getTasks = (userId: number) => TaskRepo.getTasksByUser(userId);

export const createTask = (title: string, userId: number, priority?: Priority, dueDate?: string) => 
  TaskRepo.createTask(title, userId, priority, dueDate ? new Date(dueDate) : undefined);

export const updateTask = async (id: number, data: any, userId: number) => {
  const task = await TaskRepo.getTaskById(id);
  if (!task || task.userId !== userId) return null;

  const formattedUpdates = { ...data };
  if (data.dueDate !== undefined) {
    formattedUpdates.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  }
  return TaskRepo.updateTask(id, formattedUpdates);
};

export const deleteTask = async (id: number, userId: number) => {
  const task = await TaskRepo.getTaskById(id);
  if (!task || task.userId !== userId) return false;
  
  await TaskRepo.deleteTask(id);
  return true;
};