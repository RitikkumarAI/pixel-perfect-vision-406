import { Router } from 'express';
import { Server } from 'socket.io';
import { createVideoController } from '../controllers/video.controller';
import { VideoService } from '../services/video.service';
import { authGuard } from '../middlewares/auth.guard';

export const createVideoRoutes = (io: Server) => {
  const router = Router();
  const videoService = new VideoService(io);
  const videoController = createVideoController(videoService);

  // Webhook is public (in prod, use signature verification)
  router.post('/webhook', videoController.handleWebhook);

  // Protected routes
  router.use(authGuard);
  router.post('/process', videoController.processVideo);
  router.get('/:id', videoController.getRecording);

  return router;
};
