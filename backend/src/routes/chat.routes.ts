import { Router } from 'express';
import { Server } from 'socket.io';
import { createChatController } from '../controllers/chat.controller';
import { ChatService } from '../services/chat.service';
import { authGuard } from '../middlewares/auth.guard';

export const createChatRoutes = (io: Server) => {
  const router = Router();
  const chatService = new ChatService(io);
  const chatController = createChatController(chatService);

  router.use(authGuard);

  // Workspace channels
  router.get('/workspaces/:workspaceId/channels', chatController.getChannels);
  router.post('/workspaces/:workspaceId/channels', chatController.createChannel);

  // Channel messages
  router.get('/channels/:channelId/messages', chatController.getMessages);
  router.post('/channels/:channelId/messages', chatController.sendMessage);

  // Message interactions
  router.post('/messages/:messageId/reactions', chatController.toggleReaction);

  return router;
};
