import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';

const analyticsService = new AnalyticsService();

export const trackEvent = async (req: Request, res: Response) => {
  try {
    const { event, properties } = req.body;
    const userId = (req as any).user?.userId || (req as any).user?.id; // from authenticate middleware

    if (!userId || !event) {
      return res.status(400).json({ error: 'Missing userId or event name' });
    }

    await analyticsService.trackEvent(userId, event, properties);

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Analytics tracking error:', error);
    return res.status(500).json({ error: 'Internal server error during tracking' });
  }
};
