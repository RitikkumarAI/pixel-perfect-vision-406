import { Router } from 'express';
import { AgentController } from '../controllers/agent.controller';
import { authGuard } from '../middlewares/auth.guard';

const router = Router();
const agentController = new AgentController();

router.use(authGuard);

router.get('/', agentController.getAgents);
router.post('/run', agentController.runAgent);
router.get('/:runId/history', agentController.getHistory);

export default router;
