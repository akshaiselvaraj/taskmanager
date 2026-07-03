import prisma from '../config/prisma';
import { Priority } from '@prisma/client';

export const getTasksByUser = (userId: number) =>
  prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });

export const getTaskById = (id: number) =>
  prisma.task.findUnique({ where: { id } });

export const createTask = (title: string, userId: number, priority?: Priority, dueDate?: Date) =>
  prisma.task.create({ data: { title, userId, priority, dueDate } });

export const updateTask = (id: number, data: any) =>
  prisma.task.update({ where: { id }, data });

export const deleteTask = (id: number) =>
  prisma.task.delete({ where: { id } });