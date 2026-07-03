import prisma from '../config/prisma';

export const getTasksByUser = (userId: number) =>
  prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });

export const createTask = (title: string, userId: number) =>
  prisma.task.create({ data: { title, userId } });

export const updateTask = (id: number, data: { title?: string; completed?: boolean }) =>
  prisma.task.update({ where: { id }, data });

export const deleteTask = (id: number) =>
  prisma.task.delete({ where: { id } });