import { Response, Request } from "express";
import { AuthRequest } from "../middlewares/auth.guard";
import { AuditLogService } from "../services/audit.service";
import { SSOService } from "../services/sso.service";
import prisma from "../utils/prisma";

export class SecurityController {
  private auditLogService = new AuditLogService();
  private ssoService = new SSOService();

  public getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // In production, ensure user has 'ADMIN' or 'OWNER' role
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const logs = await this.auditLogService.getLogs(limit, offset);
      res.status(200).json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      const recentEvents = await prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      const activeAlerts = await prisma.securityAlert.findMany({
        where: { userId, resolvedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      let riskScore = 100 - activeAlerts.length * 20;
      if (riskScore < 0) riskScore = 0;

      res.status(200).json({ recentEvents, activeAlerts, riskScore });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public ssoLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const result = await this.ssoService.initiateSsoLogin(email);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
