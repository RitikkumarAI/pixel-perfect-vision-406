import { Router } from 'express';
import { trackEvent } from '../controllers/analytics.controller';
import { authGuard } from '../middlewares/auth.guard';

const router = Router();

// Protected tracking route to proxy to PostHog
router.post('/track', authGuard, trackEvent);

export default router;
