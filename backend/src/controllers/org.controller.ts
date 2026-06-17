import { Response } from "express";
import { OrgService } from "../services/org.service";
import { AuthRequest } from "../middlewares/auth.guard";

export class OrgController {
  private orgService = new OrgService();

  public createOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, domain } = req.body;
      const org = await this.orgService.createOrganization(req.user!.userId, name, domain);
      res.status(201).json(org);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  public getUserOrganizations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const orgs = await this.orgService.getUserOrganizations(req.user!.userId);
      res.status(200).json(orgs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public createTeam = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id: orgId } = req.params;
      const { name, description } = req.body;
      const team = await this.orgService.createTeam(
        req.user!.userId,
        orgId as string,
        name,
        description,
      );
      res.status(201).json(team);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  };

  public createWorkspace = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { teamId } = req.params;
      const { name } = req.body;
      const workspace = await this.orgService.createWorkspace(
        req.user!.userId,
        teamId as string,
        name,
      );
      res.status(201).json(workspace);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  };

  public inviteMember = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id: orgId } = req.params;
      const { email, role, teamId } = req.body;
      const membership = await this.orgService.inviteMember(
        req.user!.userId,
        orgId as string,
        email,
        role,
        teamId as string,
      );
      res.status(201).json({ message: "User invited successfully", membership });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
