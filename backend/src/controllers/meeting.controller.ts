import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.guard';
import { MeetingService } from '../services/meeting.service';
import prisma from '../utils/prisma';

export class MeetingController {
  private meetingService = new MeetingService();

  public createMeeting = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title } = req.body;
      const meeting = await this.meetingService.createMeeting(req.user!.userId, title || 'Instant Meeting');
      res.status(201).json(meeting);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getJoinToken = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }});
      const userName = user?.name || user?.email || 'Guest';

      const tokenData = await this.meetingService.generateJoinToken(id as string, req.user!.userId, userName);
      res.status(200).json(tokenData);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  };

  public endMeeting = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const meeting = await this.meetingService.endMeeting(id as string, req.user!.userId);
      res.status(200).json(meeting);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  };
}
