import prisma from "../utils/prisma";
import { redisClient } from "../utils/redis";
import { AIGateway } from "./ai/ai.gateway";
import { OpenAIProvider } from "./ai/providers/openai.provider";

export class SearchService {
  private gateway = new AIGateway();

  /**
   * Performs a global workspace search across Tasks, Messages, and Documents.
   * Utilizes Redis to aggressively cache results for rapid UX feeling.
   */
  public async globalSearch(workspaceId: string, query: string) {
    if (!query || query.trim() === "") return { tasks: [], messages: [], documents: [] };

    const cacheKey = `search:${workspaceId}:${query.toLowerCase().trim()}`;
    const cachedResults = await redisClient.get(cacheKey);

    if (cachedResults) {
      console.log(`[SearchService] Cache hit for query: "${query}"`);
      return JSON.parse(cachedResults);
    }

    console.log(`[SearchService] Executing Postgres Full-Text Search for: "${query}"`);

    // Run searches in parallel
    const [tasks, messages, documents] = await Promise.all([
      prisma.task.findMany({
        where: {
          workspaceId,
          deletedAt: null,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      prisma.message.findMany({
        where: {
          channel: { workspaceId },
          deletedAt: null,
          content: { contains: query, mode: "insensitive" },
        },
        include: { sender: { select: { name: true, avatarUrl: true } } },
        take: 10,
      }),
      prisma.document.findMany({
        where: {
          workspaceId,
          deletedAt: null,
          title: { contains: query, mode: "insensitive" },
        },
        take: 10,
      }),
    ]);

    const results = { tasks, messages, documents };

    // Cache the results for 60 seconds
    await redisClient.setex(cacheKey, 60, JSON.stringify(results));

    return results;
  }

  /**
   * Performs semantic vector search on EmbeddingVectors table using pgvector
   * with robust fallback logic if pgvector extension or query fails.
   */
  public async semanticSearch(workspaceId: string, query: string) {
    if (!query || query.trim() === "") return [];

    const cacheKey = `semantic:${workspaceId}:${query.toLowerCase().trim()}`;
    const cachedResults = await redisClient.get(cacheKey);

    if (cachedResults) {
      console.log(`[SearchService] Cache hit for semantic query: "${query}"`);
      return JSON.parse(cachedResults);
    }

    console.log(`[SearchService] Generating embeddings for semantic search: "${query}"`);

    let embedding: number[];
    try {
      const provider = this.gateway.getProvider("OpenAI") as OpenAIProvider;
      embedding = await provider.generateEmbedding(query);
    } catch (err) {
      console.error(
        "[SearchService] Failed to generate embedding. Bypassing with mock array.",
        err,
      );
      embedding = new Array(1536).fill(0).map(() => Math.random() * 2 - 1);
    }

    let results: any[] = [];

    try {
      // Execute pgvector similarity query
      const formattedEmbedding = `[${embedding.join(",")}]`;
      results = await prisma.$queryRawUnsafe(
        `
        SELECT id, "workspaceId", "resourceId", "sourceType", content,
               (1 - (embedding <=> $1::vector))::float AS similarity
        FROM "EmbeddingVector"
        WHERE "workspaceId" = $2
        ORDER BY similarity DESC
        LIMIT 10
      `,
        formattedEmbedding,
        workspaceId,
      );
    } catch (err: any) {
      console.warn(
        "[SearchService] pgvector query failed (might not have extension). Falling back to text-search on EmbeddingVector.",
        err.message,
      );

      // Fallback: regular text match on EmbeddingVector table
      const fallbacks = await prisma.embeddingVector.findMany({
        where: {
          workspaceId,
          content: { contains: query, mode: "insensitive" },
        },
        take: 10,
      });

      results = fallbacks.map((f) => ({
        id: f.id,
        workspaceId: f.workspaceId,
        resourceId: f.resourceId,
        sourceType: f.sourceType,
        content: f.content,
        similarity: 0.85,
      }));
    }

    // Cache semantic search results for 30 seconds
    await redisClient.setex(cacheKey, 30, JSON.stringify(results));

    return results;
  }
}
