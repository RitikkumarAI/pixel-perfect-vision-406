import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import prisma from '../utils/prisma';

export class MeetingService {
  private livekitHost = process.env.LIVEKIT_API_URL || 'ws://localhost:7880';
  private livekitApiKey = process.env.LIVEKIT_API_KEY || 'devkey';
  private livekitApiSecret = process.env.LIVEKIT_API_SECRET || 'secret';
  private roomService: RoomServiceClient;

  constructor() {
    this.roomService = new RoomServiceClient(this.livekitHost, this.livekitApiKey, this.livekitApiSecret);
  }

  public async createMeeting(hostId: string, title: string) {
    const meeting = await prisma.meeting.create({
      data: {
        hostId,
        title,
        startTime: new Date(),
        status: 'SCHEDULED'
      }
    });

    const livekitRoomName = `meeting-${meeting.id}`;

    // Create the room on the LiveKit server
    await this.roomService.createRoom({
      name: livekitRoomName,
      emptyTimeout: 10 * 60, // 10 minutes
      maxParticipants: 100,
    });

    // Update meeting with the room name
    return prisma.meeting.update({
      where: { id: meeting.id },
      data: { livekitRoom: livekitRoomName, status: 'LIVE' }
    });
  }

  public async generateJoinToken(meetingId: string, userId: string, userName: string) {
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting || !meeting.livekitRoom) throw new Error('Meeting not found or not active');

    const at = new AccessToken(this.livekitApiKey, this.livekitApiSecret, {
      identity: userId,
      name: userName,
    });

    const isHost = meeting.hostId === userId;

    at.addGrant({ 
      roomJoin: true, 
      room: meeting.livekitRoom,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: isHost // The host gets admin controls to mute/kick
    });

    return { token: await at.toJwt(), roomUrl: this.livekitHost };
  }

  public async endMeeting(meetingId: string, userId: string) {
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) throw new Error('Meeting not found');
    if (meeting.hostId !== userId) throw new Error('Only the host can end the meeting');

    if (meeting.livekitRoom) {
      await this.roomService.deleteRoom(meeting.livekitRoom);
    }

    return prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'ENDED', endTime: new Date() }
    });
  }
}
