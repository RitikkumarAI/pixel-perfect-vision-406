import { redisClient } from '../utils/redis';

export class PresenceService {
  /**
   * Tracks a user's socket connection in Redis. 
   * Uses a Redis SET to store multiple socket IDs if a user is logged in from multiple devices.
   */
  public async setUserOnline(userId: string, socketId: string): Promise<void> {
    const key = `presence:${userId}`;
    await redisClient.sadd(key, socketId);
    // Auto-expire presence after 24 hours just in case of disconnect bugs
    await redisClient.expire(key, 24 * 60 * 60); 
  }

  /**
   * Removes a socket connection. Returns true if the user is still online via other sockets, false if fully offline.
   */
  public async setUserOffline(userId: string, socketId: string): Promise<boolean> {
    const key = `presence:${userId}`;
    await redisClient.srem(key, socketId);
    
    const remainingConnections = await redisClient.scard(key);
    if (remainingConnections === 0) {
      await redisClient.del(key);
      return false; // fully offline
    }
    
    return true; // still online
  }

  /**
   * Check if a specific user is currently online.
   */
  public async isUserOnline(userId: string): Promise<boolean> {
    const count = await redisClient.scard(`presence:${userId}`);
    return count > 0;
  }

  /**
   * Get all active socket IDs for a given user.
   */
  public async getUserSockets(userId: string): Promise<string[]> {
    return redisClient.smembers(`presence:${userId}`);
  }
}
