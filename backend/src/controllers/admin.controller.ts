import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.guard';
import { AnalyticsService } from '../services/analytics.service';

export class AdminController {
  private analyticsService = new AnalyticsService();

  public getStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // In production, ensure req.user has a 'SUPERADMIN' role
      const stats = await this.analyticsService.getSystemStats();
      res.status(200).json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public trackEvent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { event, properties } = req.body;
      await this.analyticsService.trackEvent(req.user!.userId, event, properties);
      res.status(202).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
