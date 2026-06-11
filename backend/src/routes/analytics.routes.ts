import { Router } from 'express';
import { trackEvent } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protected tracking route to proxy to PostHog
router.post('/track', authenticate, trackEvent);

export default router;
