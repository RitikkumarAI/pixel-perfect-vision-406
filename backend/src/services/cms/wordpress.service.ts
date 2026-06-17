import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class WordpressService {
  /**
   * Publishes an ArticleDraft to WordPress using the CMSIntegration credentials.
   */
  public async publishPost(keywordBatchId: string, workspaceId: string): Promise<string> {
    const job = await prisma.publishingJob.findUnique({
      where: { keywordBatchId },
      include: { keywordBatch: { include: { draft: true } } },
    });

    if (!job || !job.keywordBatch?.draft) {
      throw new Error("Draft not found for publishing.");
    }

    const draft = job.keywordBatch.draft;
    const integration = await prisma.cMSIntegration.findUnique({
      where: { workspaceId_platform: { workspaceId, platform: "WORDPRESS" } },
    });

    if (!integration) {
      throw new Error("WordPress integration not configured for this workspace.");
    }

    try {
      const authHeader = `Basic ${Buffer.from(`${integration.username}:${integration.apiToken}`).toString("base64")}`;

      const payload = {
        title: draft.title || job.keywordBatch.keyword,
        content: draft.content || "",
        status: "publish",
      };

      const response = await axios.post(`${integration.siteUrl}/wp-json/wp/v2/posts`, payload, {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });

      // Update job success
      await prisma.publishingJob.update({
        where: { id: job.id },
        data: {
          status: "SUCCESS",
          remotePostId: response.data.id.toString(),
          publishedAt: new Date(),
        },
      });

      return response.data.link;
    } catch (error: any) {
      await prisma.publishingJob.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          errorLog: error.message || "Unknown WordPress error",
        },
      });
      throw error;
    }
  }
}
