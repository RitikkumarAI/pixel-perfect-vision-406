import { Router } from 'express';
import { SecurityController } from '../controllers/security.controller';
import { authGuard } from '../middlewares/auth.guard';

const router = Router();
const securityController = new SecurityController();

// Public route for initiating SSO via SAML/Okta
router.post('/sso/login', securityController.ssoLogin);

// Protected routes for Enterprise Auditing
router.use(authGuard);
router.get('/dashboard', securityController.getDashboard);
router.get('/audit-logs', securityController.getAuditLogs);

export default router;
