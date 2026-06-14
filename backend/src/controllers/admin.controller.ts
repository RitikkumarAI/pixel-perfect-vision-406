import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.guard';
import { AnalyticsService } from '../services/analytics.service';
import prisma from '../utils/prisma';
import { videoQueue } from '../queues/video.queue';

export class AdminController {
  private analyticsService = new AnalyticsService();

  public getStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // In production, ensure req.user has a 'SUPERADMIN' role
      const stats = await this.analyticsService.getSystemStats();
      res.status(200).json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public trackEvent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { event, properties } = req.body;
      await this.analyticsService.trackEvent(req.user!.userId, event, properties);
      res.status(202).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public replayWebhook = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;

      const log = await prisma.webhookLog.findUnique({ where: { id } });
      if (!log || log.provider !== 'mux') {
        res.status(404).json({ error: "Webhook not found or not replayable" });
        return;
      }

      const payload = log.payload as any;
      const playbackId = payload.data?.playback_ids?.[0]?.id;
      const passthrough = payload.data?.passthrough;

      if (!playbackId || !passthrough) {
        res.status(400).json({ error: "Webhook payload is missing required replay attributes" });
        return;
      }

      // Re-queue the job and flag as retry
      await videoQueue.add('process_ai', {
        recordingId: passthrough,
        playbackId,
        muxEventId: log.muxEventId,
        isReplay: true
      }, {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 }
      });

      // Update metric
      await prisma.webhookMetric.upsert({
        where: { name: 'replayed_webhooks' },
        update: { value: { increment: 1 } },
        create: { name: 'replayed_webhooks', value: 1 }
      });

      res.status(200).json({ success: true, message: "Webhook re-queued for processing" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
