import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authGuard } from '../middlewares/auth.guard';

const router = Router();
const aiController = new AIController();

router.use(authGuard);

router.post('/generate-tasks', aiController.generateTasks);
router.post('/summarize-meeting', aiController.summarizeMeeting);
router.post('/assist-writing', aiController.assistWriting);

export default router;
