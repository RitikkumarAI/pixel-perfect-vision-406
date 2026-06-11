import { Server } from 'socket.io';
import { PresenceService } from './presence.service';

export class NotificationService {
  private io: Server;
  private presenceService: PresenceService;

  constructor(io: Server) {
    this.io = io;
    this.presenceService = new PresenceService();
  }

  /**
   * Send a real-time notification to a specific user if they are online.
   * If the user is connected via multiple devices, all devices will receive the notification.
   */
  public async notifyUser(userId: string, event: string, payload: any): Promise<void> {
    const socketIds = await this.presenceService.getUserSockets(userId);
    
    if (socketIds.length === 0) {
      // User is offline. Optionally, you could trigger a push notification or email here.
      return;
    }

    // Emit the event to all active socket connections for this user
    for (const socketId of socketIds) {
      this.io.to(socketId).emit(event, payload);
    }
  }

  /**
   * Broadcast a message to an entire workspace/team/channel.
   * Note: This assumes users join a socket.io room corresponding to the channelId/workspaceId.
   */
  public broadcastToRoom(roomId: string, event: string, payload: any): void {
    this.io.to(roomId).emit(event, payload);
  }
}
