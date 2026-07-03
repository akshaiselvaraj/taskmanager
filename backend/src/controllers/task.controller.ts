import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as TaskService from '../services/task.service';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tasks = await TaskService.getTasks(req.userId!);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, priority, dueDate } = req.body;
    const task = await TaskService.createTask(title, req.userId!, priority, dueDate);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error creating task" });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await TaskService.updateTask(Number(req.params.id), req.body, req.userId!);
    if (!task) {
      res.status(404).json({ message: "Task not found or unauthorized" });
      return;
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const success = await TaskService.deleteTask(Number(req.params.id), req.userId!);
    if (!success) {
      res.status(404).json({ message: "Task not found or unauthorized" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
};