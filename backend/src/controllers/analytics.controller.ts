import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import prisma from '../utils/prisma';

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

export const getFounderMetrics = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalWorkspaces = await prisma.workspace.count();
    
    // Simulate some calculated metrics based on actual counts
    const metrics = {
      mrr: totalWorkspaces * 99,
      mrrGrowth: "+5%",
      activationRate: Math.min(100, Math.round((totalWorkspaces / Math.max(1, totalUsers)) * 100)),
      highRiskWorkspaces: 0,
      expansionLeads: 2,
      ltv: 1200,
      cac: 150,
      nrr: 105
    };

    const chartData = [
      { name: 'Jan', mrr: (totalWorkspaces * 99) * 0.8 },
      { name: 'Feb', mrr: (totalWorkspaces * 99) * 0.85 },
      { name: 'Mar', mrr: (totalWorkspaces * 99) * 0.9 },
      { name: 'Apr', mrr: (totalWorkspaces * 99) * 0.95 },
      { name: 'May', mrr: (totalWorkspaces * 99) }
    ];

    return res.status(200).json({ metrics, chartData });
  } catch (error: any) {
    console.error('Founder metrics error:', error);
    return res.status(500).json({ error: 'Failed to fetch founder metrics' });
  }
};
