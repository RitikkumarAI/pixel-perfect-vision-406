import prisma from '../utils/prisma';
import { redisClient } from '../utils/redis';

export class SearchService {
  /**
   * Performs a global workspace search across Tasks, Messages, and Documents.
   * Utilizes Redis to aggressively cache results for rapid UX feeling.
   */
  public async globalSearch(workspaceId: string, query: string) {
    if (!query || query.trim() === '') return { tasks: [], messages: [], documents: [] };

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
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10
      }),
      prisma.message.findMany({
        where: {
          channel: { workspaceId },
          deletedAt: null,
          content: { contains: query, mode: 'insensitive' }
        },
        include: { sender: { select: { name: true, avatarUrl: true } } },
        take: 10
      }),
      prisma.document.findMany({
        where: {
          workspaceId,
          deletedAt: null,
          title: { contains: query, mode: 'insensitive' }
        },
        take: 10
      })
    ]);

    const results = { tasks, messages, documents };

    // Cache the results for 60 seconds
    await redisClient.setex(cacheKey, 60, JSON.stringify(results));

    return results;
  }
}
