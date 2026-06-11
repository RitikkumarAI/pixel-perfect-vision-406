import prisma from '../utils/prisma';

export class AnalyticsService {
  /**
   * Proxies a frontend tracking event into the backend data warehouse (Mixpanel/PostHog mock).
   */
  public async trackEvent(userId: string, eventName: string, properties: any = {}) {
    console.log(`[AnalyticsService] 📊 Tracking [${eventName}] for user ${userId}`, properties);
    // In production:
    // posthogClient.capture({ distinctId: userId, event: eventName, properties })
  }

  /**
   * Pulls heavy aggregation stats for the "Super Admin" dashboard.
   */
  public async getSystemStats() {
    console.log(`[AnalyticsService] Fetching global system stats...`);
    
    const [totalUsers, totalOrgs, totalWorkspaces, activeTasks] = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.workspace.count(),
      prisma.task.count({ where: { status: { not: 'DONE' }, deletedAt: null } })
    ]);

    return {
      totalUsers,
      totalOrgs,
      totalWorkspaces,
      activeTasks,
      systemHealth: 'OPERATIONAL',
      timestamp: new Date().toISOString()
    };
  }
}
