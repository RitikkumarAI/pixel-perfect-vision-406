import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.guard";
import { SchedulingService } from "../services/scheduling.service";
import { Request } from "express";

export class SchedulingController {
  private schedulingService = new SchedulingService();

  // Public endpoint for the booking page (no auth required for guest)
  public getAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { hostId } = req.params;
      const rules = await this.schedulingService.getAvailability(hostId as string);
      res.status(200).json(rules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Event Types
  public getEventTypes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const types = await this.schedulingService.getEventTypes(req.user!.userId);
      res.status(200).json(types);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public createEventType = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, description, durationMin, slug } = req.body;
      const type = await this.schedulingService.createEventType(
        req.user!.userId,
        title,
        description,
        durationMin,
        slug,
      );
      res.status(201).json(type);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // Public endpoint for guests to book a time
  public createBooking = async (req: Request, res: Response): Promise<void> => {
    try {
      const { hostId } = req.params;
      const { eventTypeId, guestName, guestEmail, startTime, endTime } = req.body;
      const booking = await this.schedulingService.createBooking(
        hostId as string,
        eventTypeId,
        guestName,
        guestEmail,
        new Date(startTime),
        new Date(endTime),
      );
      res.status(201).json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  // Protected endpoint for hosts to manage rules
  public setAvailabilityRule = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { dayOfWeek, startTime, endTime, timezone } = req.body;
      const rule = await this.schedulingService.setAvailabilityRule(
        req.user!.userId,
        Number(dayOfWeek),
        startTime,
        endTime,
        timezone,
      );
      res.status(201).json(rule);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Protected endpoint for hosts to view their upcoming schedule
  public getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const bookings = await this.schedulingService.getHostBookings(req.user!.userId);
      res.status(200).json(bookings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Calendar Auth
  public connectGoogle = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { accessToken, refreshToken } = req.body;
      const account = await this.schedulingService.connectCalendar(
        req.user!.userId,
        "google",
        accessToken,
        refreshToken || "mock-refresh",
      );
      res.status(200).json(account);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public connectOutlook = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { accessToken, refreshToken } = req.body;
      const account = await this.schedulingService.connectCalendar(
        req.user!.userId,
        "outlook",
        accessToken,
        refreshToken || "mock-refresh",
      );
      res.status(200).json(account);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
