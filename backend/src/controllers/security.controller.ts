import { Response, Request } from 'express';
import { AuthRequest } from '../middlewares/auth.guard';
import { AuditLogService } from '../services/audit.service';
import { SsoService } from '../services/sso.service';

export class SecurityController {
  private auditLogService = new AuditLogService();
  private ssoService = new SsoService();

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
