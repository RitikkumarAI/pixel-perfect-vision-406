import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Main redis client for generic caching/data
export const redisClient = new Redis(REDIS_URL);

// Redis clients for Socket.IO adapter (requires pub/sub separate connections)
export const pubClient = new Redis(REDIS_URL);
export const subClient = pubClient.duplicate();

redisClient.on("error", (err) => console.error("Redis Client Error", err));
pubClient.on("error", (err) => console.error("Redis PubClient Error", err));
subClient.on("error", (err) => console.error("Redis SubClient Error", err));
