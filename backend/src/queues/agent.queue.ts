import { Queue, Worker, Job } from "bullmq";
import { pubClient, subClient } from "../utils/redis";
import { AgentExecutionEngine } from "../services/agents/engine";
import { WordpressService } from "../services/cms/wordpress.service";
import prisma from "../utils/prisma";

export const researchQueue = new Queue("swarm:research", { connection: pubClient });
export const outlineQueue = new Queue("swarm:outline", { connection: pubClient });
export const writerQueue = new Queue("swarm:writer", { connection: pubClient });
export const editorQueue = new Queue("swarm:editor", { connection: pubClient });
export const publisherQueue = new Queue("swarm:publisher", { connection: pubClient });

const engine = new AgentExecutionEngine();
const wpService = new WordpressService();

new Worker(
  "swarm:research",
  async (job: Job) => {
    const { keywordBatchId, keyword, workspaceId, userId } = job.data;
    console.log(`[Swarm:Research] Fetching SERP for ${keyword}`);
    const result = await engine.run(keyword, "research-agent", workspaceId, userId);
    await outlineQueue.add("outline", {
      keywordBatchId,
      keyword,
      workspaceId,
      userId,
      researchData: result,
    });
  },
  { connection: pubClient },
);

new Worker(
  "swarm:outline",
  async (job: Job) => {
    const { keywordBatchId, keyword, workspaceId, userId, researchData } = job.data;
    console.log(`[Swarm:Outline] Generating outline for ${keyword}`);
    const outline = await engine.run(
      `Based on ${researchData}, create an outline for ${keyword}`,
      "outline-agent",
      workspaceId,
      userId,
    );
    await writerQueue.add("write", { keywordBatchId, keyword, workspaceId, userId, outline });
  },
  { connection: pubClient },
);

new Worker(
  "swarm:writer",
  async (job: Job) => {
    const { keywordBatchId, keyword, workspaceId, userId, outline } = job.data;
    console.log(`[Swarm:Writer] Writing draft for ${keyword}`);
    const draft = await engine.run(
      `Write an article following this outline: ${outline}`,
      "writer-agent",
      workspaceId,
      userId,
    );
    await editorQueue.add("edit", { keywordBatchId, keyword, workspaceId, userId, draft });
  },
  { connection: pubClient },
);

new Worker(
  "swarm:editor",
  async (job: Job) => {
    const { keywordBatchId, keyword, workspaceId, userId, draft } = job.data;
    console.log(`[Swarm:Editor] Editing draft for ${keyword}`);

    // Upsert the draft into the database for human review
    await prisma.articleDraft.upsert({
      where: { keywordBatchId },
      update: { content: draft, title: keyword },
      create: { keywordBatchId, content: draft, title: keyword },
    });

    await prisma.keywordBatch.update({
      where: { id: keywordBatchId },
      data: { status: "REVIEW" },
    });
  },
  { connection: pubClient },
);

new Worker(
  "swarm:publisher",
  async (job: Job) => {
    const { keywordBatchId, workspaceId } = job.data;
    console.log(`[Swarm:Publisher] Pushing ${keywordBatchId} to WordPress`);
    try {
      const url = await wpService.publishPost(keywordBatchId, workspaceId);
      console.log(`[Swarm:Publisher] Successfully published: ${url}`);
    } catch (error) {
      console.error(`[Swarm:Publisher] Failed to publish`, error);
    }
  },
  { connection: pubClient },
);
