import { Router, RequestHandler } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as TaskController from '../controllers/task.controller';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

router.use(authMiddleware as RequestHandler);

const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    dueDate: z.string().datetime().optional().nullable(),
  })
});

const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title cannot be empty").optional(),
    completed: z.boolean().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    dueDate: z.string().datetime().optional().nullable(),
  }).refine(data => Object.keys(data).length > 0, {
    message: "At least one field is required to update"
  })
});

router.get('/', TaskController.getTasks as RequestHandler);
router.post('/', validate(createTaskSchema) as RequestHandler, TaskController.createTask as RequestHandler);
router.patch('/:id', validate(updateTaskSchema) as RequestHandler, TaskController.updateTask as RequestHandler);
router.delete('/:id', TaskController.deleteTask as RequestHandler);

export default router;