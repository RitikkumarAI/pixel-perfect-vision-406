import { redisClient } from '../../utils/redis';

export class MemoryService {
  private static readonly TTL_SECONDS = 60 * 60 * 24; // 24 hours

  /**
   * Retrieves conversation history for a given context ID
   */
  public async getHistory(contextId: string, limit: number = 10): Promise<{role: string, content: string}[]> {
    try {
      const data = await redisClient.lrange(`memory:${contextId}`, 0, limit - 1);
      return data.map((str: string) => JSON.parse(str)).reverse();
    } catch (e) {
      console.error('[MemoryService] Failed to retrieve history:', e);
      return [];
    }
  }

  /**
   * Adds a message to the conversation history
   */
  public async addMessage(contextId: string, role: 'user' | 'assistant' | 'system', content: string) {
    try {
      const key = `memory:${contextId}`;
      await redisClient.lpush(key, JSON.stringify({ role, content }));
      await redisClient.ltrim(key, 0, 49); // Keep last 50 messages
      await redisClient.expire(key, MemoryService.TTL_SECONDS);
    } catch (e) {
      console.error('[MemoryService] Failed to save memory:', e);
    }
  }

  /**
   * Clears the memory for a specific context
   */
  public async clearMemory(contextId: string) {
    try {
      await redisClient.del(`memory:${contextId}`);
    } catch (e) {
      console.error('[MemoryService] Failed to clear memory:', e);
    }
  }
}
