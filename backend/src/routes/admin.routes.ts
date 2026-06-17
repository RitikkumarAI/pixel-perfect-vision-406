import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authGuard } from "../middlewares/auth.guard";

const router = Router();
const adminController = new AdminController();

router.use(authGuard);

router.get("/stats", adminController.getStats);
router.post("/track", adminController.trackEvent);
router.post("/webhooks/replay/:id", adminController.replayWebhook);

export default router;
