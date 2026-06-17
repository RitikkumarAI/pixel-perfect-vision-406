import { Router } from "express";
import { trackEvent, getFounderMetrics } from "../controllers/analytics.controller";
import { authGuard } from "../middlewares/auth.guard";

const router = Router();

// Protected tracking route to proxy to PostHog
router.post("/track", authGuard, trackEvent);
router.get("/founder", authGuard, getFounderMetrics);

export default router;
