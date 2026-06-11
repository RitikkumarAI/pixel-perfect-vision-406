import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authGuard } from '../middlewares/auth.guard';

const router = Router();
const taskController = new TaskController();

router.use(authGuard);

router.get('/workspaces/:workspaceId', taskController.getWorkspaceTasks);
router.post('/workspaces/:workspaceId', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;
