import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.guard';
import { VideoService } from '../services/video.service';
import { UploadService } from '../services/upload.service';
import { Server } from 'socket.io';
import prisma from '../utils/prisma';
import Mux from '@mux/mux-node';
import { videoQueue } from '../queues/video.queue';

export class VideoController {
  private videoService: VideoService;
  private uploadService: UploadService;

  constructor(io?: Server) {
    // io will be passed from routes or server, fallback to dummy if not needed for some methods
    this.videoService = new VideoService(io as any);
    this.uploadService = new UploadService();
  }

  public setSocketIo(io: Server) {
    this.videoService = new VideoService(io);
  }

  // 1. Get presigned URL and create DB record
  public startRecording = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, description } = req.body;
      const { presignedUrl, fileUrl, key } = await this.uploadService.generatePresignedUrl(`video-${Date.now()}.mp4`, 'video/mp4');

      const recording = await prisma.recording.create({
        data: {
          uploaderId: req.user!.userId,
          title: title || 'Untitled Recording',
          description,
          status: 'UPLOADING',
          s3Key: key,
          url: fileUrl,
        }
      });

      res.status(200).json({ presignedUrl, recordingId: recording.id, fileUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // 2. Mark upload complete and trigger AI/Processing
  public uploadComplete = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { recordingId } = req.body;
      const recording = await prisma.recording.findUnique({ where: { id: recordingId } });
      if (!recording || recording.uploaderId !== req.user!.userId) {
        res.status(404).json({ error: "Recording not found" });
        return;
      }

      // Process video (mocks transcode + Whisper AI)
      const updated = await this.videoService.processVideo(recording.id, req.user!.userId, recording.url!);

      res.status(200).json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getRecordings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const recordings = await prisma.recording.findMany({
        where: { uploaderId: req.user!.userId, deletedAt: null },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json(recordings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getRecordingDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const recording = await prisma.recording.findUnique({
        where: { id: id as string },
        include: {
          comments: { include: { user: { select: { id: true, name: true, avatarUrl: true } } }, orderBy: { timestamp: 'asc' } },
          transcripts: true,
          uploader: { select: { id: true, name: true, avatarUrl: true } }
        }
      });

      if (!recording) {
        res.status(404).json({ error: "Recording not found" });
        return;
      }

      res.status(200).json(recording);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public addComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { content, timestamp } = req.body;

      const comment = await prisma.recordingComment.create({
        data: {
          recordingId: id as string,
          userId: req.user!.userId,
          content,
          timestamp: timestamp || 0
        },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } }
      });

      res.status(201).json(comment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // 6. Mux Webhook
  public handleMuxWebhook = async (req: Request | any, res: Response): Promise<void> => {
    try {
      const secret = process.env.MUX_WEBHOOK_SECRET || 'mock_secret';
      let event;

      // 1. Signature Verification & Replay Protection
      if (process.env.MUX_TOKEN_ID === undefined) {
        // Mock Bypass for local tests
        event = req.body;
      } else {
        try {
          // req.rawBody was injected by express middleware in server.ts
          event = (Mux.Webhooks as any).verifySignature(req.rawBody, req.headers as any, secret);
        } catch (err: any) {
          console.error("[VideoController] Invalid Mux Signature");
          res.status(401).json({ error: "Invalid signature" });
          return;
        }
      }

      console.log(`[VideoController] Received Mux Webhook: ${event.type}`);

      // 2. Event Validation
      if (event.type === 'video.asset.ready') {
        const playbackId = event.data?.playback_ids?.[0]?.id;
        const durationSec = event.data?.duration;
        const passthrough = event.data?.passthrough; // Recording ID
        const muxEventId = event.id;

        if (passthrough && playbackId) {
          // 3. Idempotency Check using muxEventId and ProcessingStatus
          const logCheck = await prisma.webhookLog.findUnique({ where: { muxEventId }});
          
          if (!logCheck) {
             // 4. Update status to QUEUED and save log
             await prisma.recording.update({
               where: { id: passthrough },
               data: { processingStatus: 'QUEUED' }
             });

             await prisma.webhookLog.create({
               data: {
                 muxEventId,
                 provider: 'mux',
                 event: event.type,
                 payload: event as any,
                 status: 'SUCCESS' // Initial log is success to prevent re-runs
               }
             });

             // 5. Fire background worker job
             try {
                await this.videoService.handleWebhook(passthrough, playbackId, 'ready', durationSec);
                
                await videoQueue.add('process_ai', {
                  recordingId: passthrough,
                  playbackId,
                  muxEventId
                }, { 
                  jobId: muxEventId,
                  attempts: 5,
                  backoff: { type: 'exponential', delay: 2000 }
                });

             } catch (aiError: any) {
                console.error("[VideoController] Queueing failed:", aiError);
             }
          } else {
             console.log(`[VideoController] Ignored Duplicate Webhook: ${muxEventId}`);
          }
        }
      }

      res.status(200).send('OK');
    } catch (error: any) {
      console.error("[VideoController] Webhook error:", error);
      res.status(500).json({ error: error.message });
    }
  };
}
