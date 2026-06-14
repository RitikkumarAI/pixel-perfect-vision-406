import prisma from '../utils/prisma';

export class RetentionService {
  /**
   * Generates a weekly digest for a specific user.
   * In a production cron environment, this runs every Friday at 5PM.
   */
  public async generateWeeklyDigest(userId: string) {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const meetings = await prisma.meeting.count({
      where: { hostId: userId, createdAt: { gte: lastWeek } }
    });

    const aiAgentRuns = await prisma.agentRun.count({
      where: { userId, createdAt: { gte: lastWeek } }
    });

    const documentsCreated = await prisma.document.count({
      where: { authorId: userId, createdAt: { gte: lastWeek } }
    });

    // TODO: Send via SendGrid or Postmark
    const emailPayload = {
      subject: 'Your Nexus Weekly Productivity Report',
      html: `
        <h2>You crushed it this week!</h2>
        <ul>
          <li>Meetings Hosted: ${meetings}</li>
          <li>AI Tasks Automated: ${aiAgentRuns}</li>
          <li>Documents Created: ${documentsCreated}</li>
        </ul>
        <a href="https://nexus-workspace.com/dashboard">View Insights</a>
      `
    };

    return emailPayload;
  }

  /**
   * Identifies Churn-Risk Users (No activity in 14 days)
   */
  public async getChurnRiskUsers() {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    return prisma.session.findMany({
      where: { updatedAt: { lt: twoWeeksAgo } },
      select: { userId: true },
      distinct: ['userId']
    });
  }
}
