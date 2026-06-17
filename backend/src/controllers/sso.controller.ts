import { Request, Response } from "express";
import { SSOService } from "../services/sso.service";
import passport from "passport";
import { AuthService } from "../services/auth.service";
import prisma from "../utils/prisma";

export class SSOController {
  private ssoService = new SSOService();
  private authService = new AuthService();

  public configure = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orgId, xmlString } = req.body;
      const result = await this.ssoService.importMetadata(orgId, xmlString);

      // Audit
      await prisma.auditLog.create({
        data: {
          userId: req.user ? (req as any).user.userId : "system",
          action: "SSO_CONFIGURED",
          resourceType: "SSO",
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  public login = (req: Request, res: Response, next: any) => {
    passport.authenticate("saml", { failureRedirect: "/login", failureFlash: true })(
      req,
      res,
      next,
    );
  };

  public callback = async (req: Request, res: Response): Promise<void> => {
    // passport.authenticate will have populated req.user if successful
    if (!req.user) {
      res.redirect("/login?error=sso_failed");
      return;
    }

    try {
      // req.user has been fetched/created by SSOService
      const user: any = req.user;

      // We manually issue JWTs here instead of redirecting yet
      // To mimic the frontend session flow
      // A real implementation would redirect with a short-lived token to exchange
      res.redirect(`/?sso_success=true&userId=${user.id}`);
    } catch (err) {
      res.redirect("/login?error=sso_internal_error");
    }
  };

  public slo = (req: Request, res: Response, next: any) => {
    // SLO logic triggers passport to reach out to the IdP logoutUrl
    passport.authenticate("saml", { samlFallback: "logout-request" } as any)(req, res, next);
  };

  public sloCallback = async (req: Request, res: Response) => {
    // Audit logout
    if (req.user) {
      const user: any = req.user;
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "SSO_LOGOUT",
          resourceType: "SSO",
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });
      req.logout(() => {});
    }
    res.redirect("/login?logged_out=true");
  };
}
