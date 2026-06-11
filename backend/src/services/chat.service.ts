import prisma from '../utils/prisma';
import { Server } from 'socket.io';

export class ChatService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public async createChannel(workspaceId: string, name: string, isPrivate: boolean = false) {
    return prisma.channel.create({
      data: { workspaceId, name, isPrivate }
    });
  }

  public async getWorkspaceChannels(workspaceId: string) {
    return prisma.channel.findMany({
      where: { workspaceId, deletedAt: null }
    });
  }

  public async getChannelMessages(channelId: string, limit: number = 50, cursor?: string) {
    return prisma.message.findMany({
      where: { channelId, isThread: false, deletedAt: null },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        reactions: true,
        replies: { select: { id: true }, take: 1 } // To indicate if it has a thread
      }
    });
  }

  public async sendMessage(channelId: string, senderId: string, content: string, parentId?: string) {
    const isThread = !!parentId;

    const message = await prisma.message.create({
      data: {
        channelId,
        senderId,
        content,
        isThread,
        parentId,
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      }
    });

    // Real-time broadcast to the channel's room
    const eventName = isThread ? 'message:reply' : 'message:new';
    this.io.to(`channel:${channelId}`).emit(eventName, message);

    return message;
  }

  public async toggleReaction(messageId: string, userId: string, emoji: string) {
    const existing = await prisma.reaction.findUnique({
      where: { messageId_userId_emoji: { messageId, userId, emoji } }
    });

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      this.io.to(`message:${messageId}`).emit('reaction:removed', { messageId, userId, emoji });
      return { action: 'removed', emoji };
    }

    const reaction = await prisma.reaction.create({
      data: { messageId, userId, emoji }
    });
    
    this.io.to(`message:${messageId}`).emit('reaction:added', reaction);
    return { action: 'added', reaction };
  }
}
