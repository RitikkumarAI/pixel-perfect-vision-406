import { Router } from 'express';
import { SCIMController } from '../controllers/scim.controller';

const router = Router();
const scimController = new SCIMController();

router.post('/Users', scimController.createUser);
router.patch('/Users/:id', scimController.updateUser);
router.delete('/Users/:id', scimController.deleteUser);

export default router;
