import * as TaskRepo from '../repositories/task.repository';

export const getTasks = (userId: number) => TaskRepo.getTasksByUser(userId);
export const createTask = (title: string, userId: number) => TaskRepo.createTask(title, userId);
export const updateTask = (id: number, data: { title?: string; completed?: boolean }) => TaskRepo.updateTask(id, data);
export const deleteTask = (id: number) => TaskRepo.deleteTask(id);