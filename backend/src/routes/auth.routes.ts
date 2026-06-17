import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateRequest } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../dtos/auth.dto";
import { authLimiter } from "../middlewares/rateLimiter";
import { authGuard } from "../middlewares/auth.guard";

const router = Router();
const authController = new AuthController();

router.post("/register", authLimiter, validateRequest(registerSchema), authController.register);
router.post("/login", authLimiter, validateRequest(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authGuard, authController.logout);

// MFA
router.post("/mfa/setup", authGuard, authController.mfaSetup);
router.post("/mfa/verify", authGuard, authController.mfaVerify);
router.post("/mfa/disable", authGuard, authController.mfaDisable);

// Passkeys
router.post("/passkey/register/options", authGuard, authController.passkeyRegisterOptions);
router.post("/passkey/register/verify", authGuard, authController.passkeyRegisterVerify);
router.post("/passkey/login/options", authLimiter, authController.passkeyLoginOptions);
router.post("/passkey/login/verify", authLimiter, authController.passkeyLoginVerify);

export default router;
