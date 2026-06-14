import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export class SCIMController {
  
  public createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userName, name, emails } = req.body;
      const email = emails?.[0]?.value || userName;

      if (!email) {
        res.status(400).json({ error: "Email is required for SCIM Provisioning" });
        return;
      }

      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: name?.formatted || name?.givenName || email.split('@')[0],
            ssoProvider: 'scim',
          }
        });
        await prisma.auditLog.create({
          data: { userId: user.id, action: 'SCIM_PROVISION', resourceType: 'User', ipAddress: req.ip, userAgent: req.headers['user-agent'] }
        });
      }

      res.status(201).json({
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
        id: user.id,
        userName: user.email,
        active: true
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { Operations } = req.body;

      // Handle SCIM Patch operations (e.g., active = false)
      let isActive = true;
      if (Operations && Array.isArray(Operations)) {
        for (const op of Operations) {
          if (op.op === 'replace' && op.value && typeof op.value.active === 'boolean') {
            isActive = op.value.active;
          }
        }
      }

      if (!isActive) {
        await prisma.user.update({
          where: { id },
          data: { deletedAt: new Date() } // Soft delete for deprovisioning
        });
        await prisma.auditLog.create({
          data: { userId: id, action: 'SCIM_DEPROVISION', resourceType: 'User', ipAddress: req.ip, userAgent: req.headers['user-agent'] }
        });
      }

      const user = await prisma.user.findUnique({ where: { id } });

      res.status(200).json({
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
        id: user?.id,
        userName: user?.email,
        active: isActive
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
