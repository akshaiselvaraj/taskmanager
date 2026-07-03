import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as TaskService from '../services/task.service';

export const getTasks = async (req: AuthRequest, res: Response) => {
  const tasks = await TaskService.getTasks(req.userId!);
  res.json(tasks);
};

export const createTask = async (req: AuthRequest, res: Response) => {
  const { title } = req.body;
  const task = await TaskService.createTask(title, req.userId!);
  res.status(201).json(task);
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const task = await TaskService.updateTask(Number(req.params.id), req.body);
  res.json(task);
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  await TaskService.deleteTask(Number(req.params.id));
  res.status(204).send();
};