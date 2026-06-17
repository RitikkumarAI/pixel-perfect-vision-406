import { Router } from "express";
import { WebhookController } from "../controllers/webhook.controller";
import { authGuard } from "../middlewares/auth.guard";

const router = Router();
const webhookController = new WebhookController();

router.use(authGuard);

router.post("/", webhookController.createWebhook);
router.get("/workspaces/:workspaceId", webhookController.getWebhooks);
router.delete("/:id", webhookController.deleteWebhook);

export default router;
