import prisma from '../utils/prisma';

export class AuditLogService {
  /**
   * Logs a critical action to the immutable Postgres AuditLog table for SOC2 compliance.
   */
  public async logAction(userId: string, action: string, resourceType: string, resourceId?: string, metadata: any = {}, ipAddress?: string) {
    return prisma.auditLog.create({
      data: {
        userId,
        action,
        resourceType,
        resourceId,
        metadata: JSON.stringify(metadata),
        ipAddress,
        userAgent: 'system'
      }
    });
  }

  /**
   * Retrieves paginated audit logs for a specific organization/resource.
   */
  public async getLogs(limit: number = 50, offset: number = 0) {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: { select: { name: true, email: true } }
      }
    });
  }
}
