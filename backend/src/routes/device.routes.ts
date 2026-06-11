import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';
import { authGuard } from '../middlewares/auth.guard';

const router = Router();
const deviceController = new DeviceController();

router.use(authGuard);

router.post('/register', deviceController.register);
router.post('/unregister', deviceController.unregister);

export default router;
