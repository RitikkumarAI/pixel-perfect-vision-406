import { Router } from "express";
import { BillingController } from "../controllers/billing.controller";
import { authGuard } from "../middlewares/auth.guard";

const router = Router();
const billingController = new BillingController();

// Public webhook endpoint for Stripe
router.post("/webhook", billingController.handleWebhook);

// Protected endpoints for the frontend application
router.use(authGuard);
router.post("/checkout", billingController.createCheckout);
router.post("/cancel", billingController.cancelSubscription);
router.get("/status/:orgId", billingController.getStatus);

export default router;
