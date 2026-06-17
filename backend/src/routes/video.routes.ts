import { Router } from "express";
import { VideoController } from "../controllers/video.controller";
import { authGuard } from "../middlewares/auth.guard";

const router = Router();

// Note: In production, io would be injected from server.ts, but we map standard REST here
const videoController = new VideoController();

// Webhook endpoint (unprotected)
router.post("/webhook/mux", videoController.handleMuxWebhook as any);

router.use(authGuard);

router.post("/start", videoController.startRecording);
router.post("/upload", videoController.uploadComplete);
router.get("/", videoController.getRecordings);
router.get("/:id", videoController.getRecordingDetails);
router.post("/:id/comments", videoController.addComment);

// Existing/Legacy video socket routes
export function createVideoRoutes(io: any) {
  const socketRouter = Router();
  // Legacy socket bindings or similar
  return socketRouter;
}

export default router;
