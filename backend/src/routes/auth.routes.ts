import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate';
import { registerSchema, loginSchema } from '../dtos/auth.dto';
import { authLimiter } from '../middlewares/rateLimiter';
import { authGuard } from '../middlewares/auth.guard';

const router = Router();
const authController = new AuthController();

router.post('/register', authLimiter, validateRequest(registerSchema), authController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authGuard, authController.logout);

export default router;
