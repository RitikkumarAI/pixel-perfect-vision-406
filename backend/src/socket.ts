import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import jwt from 'jsonwebtoken';
import { pubClient, subClient } from './utils/redis';
import { PresenceService } from './services/presence.service';

const JWT_SECRET = process.env.JWT_SECRET || 'nexus_super_secret_key';
const presenceService = new PresenceService();

export function setupSocketIO(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
    adapter: createAdapter(pubClient, subClient),
  });

  // JWT Authentication Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
      if (!token) return next(new Error('Authentication error'));
      
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      socket.data.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId} (socket: ${socket.id})`);

    // Track presence
    await presenceService.setUserOnline(userId, socket.id);
    
    // Broadcast globally to all instances that this user is online
    io.emit('presence:online', { userId });

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId} (socket: ${socket.id})`);
      const isStillOnline = await presenceService.setUserOffline(userId, socket.id);
      
      if (!isStillOnline) {
        io.emit('presence:offline', { userId });
      }
    });
  });

  return io;
}
