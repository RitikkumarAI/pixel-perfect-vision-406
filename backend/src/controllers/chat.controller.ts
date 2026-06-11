import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.guard';
import { ChatService } from '../services/chat.service';

export const createChatController = (chatService: ChatService) => {
  return {
    createChannel: async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { workspaceId } = req.params;
        const { name, isPrivate } = req.body;
        const channel = await chatService.createChannel(workspaceId, name, isPrivate);
        res.status(201).json(channel);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },

    getChannels: async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { workspaceId } = req.params;
        const channels = await chatService.getWorkspaceChannels(workspaceId);
        res.status(200).json(channels);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },

    getMessages: async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { channelId } = req.params;
        const { limit, cursor } = req.query;
        const messages = await chatService.getChannelMessages(channelId, Number(limit) || 50, cursor as string);
        res.status(200).json(messages);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },

    sendMessage: async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { channelId } = req.params;
        const { content, parentId } = req.body;
        const message = await chatService.sendMessage(channelId, req.user!.userId, content, parentId);
        res.status(201).json(message);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    },

    toggleReaction: async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const result = await chatService.toggleReaction(messageId, req.user!.userId, emoji);
        res.status(200).json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  };
};
