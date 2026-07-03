import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as TaskController from '../controllers/task.controller';

const router = Router();
router.use(authMiddleware);
router.get('/', TaskController.getTasks);
router.post('/', TaskController.createTask);
router.patch('/:id', TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

export default router;