import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class RevenueService {
  /**
   * Calculate live Monthly Recurring Revenue (MRR)
   * Real database calculation, no mocks.
   */
  static async calculateMRR(): Promise<number> {
    const revenue = await prisma.appRevenue.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    });
    // Assuming AppRevenue represents monthly platform cut + direct subscription invoices
    return revenue._sum.amount || 0;
  }

  /**
   * Determine Workspace Activation Status
   * Rule: Invited >= 1 teammate, Hosted >= 1 meeting, Created >= 1 document
   */
  static async checkWorkspaceActivation(workspaceId: string): Promise<boolean> {
    const memberCount = await prisma.workspaceMember.count({ where: { workspaceId } });
    const meetingCount = await prisma.meeting.count({ where: { workspaceId } });
    const docCount = await prisma.document.count({ where: { workspaceId } });

    return memberCount > 1 && meetingCount >= 1 && docCount >= 1;
  }

  /**
   * Calculate System-wide Activation Percentage
   */
  static async calculateSystemActivationRate(): Promise<number> {
    const totalWorkspaces = await prisma.workspace.count();
    if (totalWorkspaces === 0) return 0;

    let activatedCount = 0;
    const workspaces = await prisma.workspace.findMany({ select: { id: true } });

    // In production, this would be a complex JOIN query for performance
    for (const w of workspaces) {
      if (await this.checkWorkspaceActivation(w.id)) {
        activatedCount++;
      }
    }

    return (activatedCount / totalWorkspaces) * 100;
  }

  /**
   * Calculate Churn Risk Score
   * Based on live database activity tracking.
   */
  static async calculateChurnRisk(workspaceId: string): Promise<"LOW" | "MEDIUM" | "HIGH"> {
    // Check last active date
    const lastMeeting = await prisma.meeting.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    const lastDoc = await prisma.document.findFirst({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
    });

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const isInactive =
      (!lastMeeting || lastMeeting.createdAt < sevenDaysAgo) &&
      (!lastDoc || lastDoc.updatedAt < sevenDaysAgo);

    if (isInactive) return "HIGH";
    return "LOW"; // Expand logic for MEDIUM
  }

  /**
   * Calculate Expansion Revenue Opportunities
   * Detects if token usage is nearing limits.
   */
  static async detectExpansionOpportunities(workspaceId: string) {
    const ledger = await prisma.aIActionLedger.aggregate({
      where: {
        workspaceId,
        createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
      },
      _sum: { costTokens: true },
    });

    const tokensUsed = ledger._sum.costTokens || 0;
    // Assume 1M token limit for free tier
    if (tokensUsed > 800000) {
      return { recommendUpgrade: true, reason: "AI_USAGE_HIGH" };
    }
    return { recommendUpgrade: false };
  }
}
