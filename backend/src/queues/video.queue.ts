import { Queue, Worker, QueueEvents, Job } from "bullmq";
import Redis from "ioredis";
import prisma from "../utils/prisma";
import { VideoService } from "../services/video.service";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null } as any);

export const videoQueue = new Queue("video_ai_processing", {
  connection: connection as any,
});

export const initVideoWorker = () => {
  const videoService = new (VideoService as any)();

  const worker = new Worker(
    "video_ai_processing",
    async (job: Job) => {
      if (job.name === "process_ai") {
        const { recordingId, playbackId, muxEventId, isReplay } = job.data;

        console.log(`[BullMQ] Starting process_ai for ${recordingId}`);
        // await videoService.processRecording(recordingId, playbackId);

        return { success: true };
      }
    },
    {
      connection: connection as any,
      concurrency: 2,
    },
  );

  worker.on("completed", (job) => {
    console.log(`[BullMQ] Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[BullMQ] Job ${job?.id} failed:`, err);
  });

  const queueEvents = new QueueEvents("video_ai_processing", { connection: connection as any });
  queueEvents.on("completed", ({ jobId }) => {
    console.log(`[QueueEvents] ${jobId} completed`);
  });
};
