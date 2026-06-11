import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.guard';
import { SchedulingService } from '../services/scheduling.service';
import { Request } from 'express';

export class SchedulingController {
  private schedulingService = new SchedulingService();

  // Public endpoint for the booking page (no auth required for guest)
  public getAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { hostId } = req.params;
      const rules = await this.schedulingService.getAvailability(hostId);
      res.status(200).json(rules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Public endpoint for guests to book a time
  public createBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { hostId } = req.params;
      const { guestName, guestEmail, startTime, endTime } = req.body;
      const booking = await this.schedulingService.createBooking(hostId, guestName, guestEmail, new Date(startTime), new Date(endTime));
      res.status(201).json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // Protected endpoint for hosts to manage rules
  public setAvailabilityRule = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { dayOfWeek, startTime, endTime, timezone } = req.body;
      const rule = await this.schedulingService.setAvailabilityRule(req.user!.userId, Number(dayOfWeek), startTime, endTime, timezone);
      res.status(201).json(rule);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Protected endpoint for hosts to view their upcoming schedule
  public getUpcomingBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const bookings = await this.schedulingService.getHostUpcomingBookings(req.user!.userId);
      res.status(200).json(bookings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
