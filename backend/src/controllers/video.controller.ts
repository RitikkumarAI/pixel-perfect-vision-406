import { Response, Request } from 'express';
import { AuthRequest } from '../middlewares/auth.guard';
import { VideoService } from '../services/video.service';

export const createVideoController = (videoService: VideoService) => {
  return {
    processVideo: async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { recordingId, rawFileUrl } = req.body;
        const recording = await videoService.processVideo(recordingId, req.user!.userId, rawFileUrl);
        res.status(202).json({ message: 'Video processing started', recording });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },

    // Public endpoint for third-party transcoder webhooks
    handleWebhook: async (req: Request, res: Response): Promise<void> => {
      try {
        const { recordingId, hlsUrl, status } = req.body;
        await videoService.handleWebhook(recordingId, hlsUrl, status);
        res.status(200).send('Webhook received');
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },

    getRecording: async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { id } = req.params;
        const recording = await videoService.getRecording(id);
        res.status(200).json(recording);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  };
};
