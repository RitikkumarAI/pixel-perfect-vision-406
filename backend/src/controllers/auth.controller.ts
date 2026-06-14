import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { SecurityService } from '../services/security.service';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

export class AuthController {
  private authService = new AuthService();
  private securityService = new SecurityService();

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name } = req.body;
      const result = await this.authService.register(email, password, name);
      this.setCookies(res, result.accessToken, result.refreshToken);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const ip = req.ip || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      this.setCookies(res, result.accessToken, result.refreshToken);

      // Security Checks & Audit Log
      const geoInfo = await this.securityService.checkSuspiciousLogin(result.user!.id, ip, ua);
      
      if (geoInfo) {
        const decoded = jwt.decode(result.refreshToken) as { sessionId?: string };
        if (decoded?.sessionId) {
          await prisma.session.update({
            where: { id: decoded.sessionId },
            data: { latitude: geoInfo.lat, longitude: geoInfo.lon, country: geoInfo.country, ipAddress: ip, userAgent: ua }
          });
        }
      }

      await prisma.auditLog.create({
        data: {
          userId: result.user!.id,
          action: 'LOGIN_SUCCESS',
          resourceType: 'AUTH',
          ipAddress: ip,
          userAgent: ua
        }
      });

      res.status(200).json(result);
    } catch (error: any) {
      // Find user if possible to log failure
      const user = await prisma.user.findUnique({ where: { email: req.body.email } });
      if (user) {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN_FAILED',
            resourceType: 'AUTH',
            ipAddress: ip,
            userAgent: ua,
            metadata: { error: error.message }
          }
        });
      }
      res.status(401).json({ error: error.message });
    }
  };

  public refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) throw new Error('No refresh token provided');
      const result = await this.authService.refresh(refreshToken);
      this.setCookies(res, result.accessToken, result.refreshToken);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  };

  public logout = async (req: any, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        const decoded = jwt.decode(refreshToken) as { sessionId?: string, userId?: string };
        if (decoded?.sessionId) {
          await this.authService.logout(decoded.sessionId);
        }
        if (req.user?.userId) {
          await prisma.auditLog.create({
            data: {
              userId: req.user.userId,
              action: 'LOGOUT',
              resourceType: 'AUTH',
              ipAddress: req.ip || req.socket.remoteAddress,
              userAgent: req.headers['user-agent']
            }
          });
        }
      }
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public mfaSetup = async (req: any, res: Response): Promise<void> => {
    try {
      const result = await this.authService.mfaSetup(req.user.userId);
      await prisma.auditLog.create({
        data: { userId: req.user.userId, action: 'MFA_SETUP_INITIATED', resourceType: 'AUTH', ipAddress: req.ip, userAgent: req.headers['user-agent'] }
      });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  public mfaVerify = async (req: any, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      const result = await this.authService.mfaVerify(req.user.userId, token);
      await prisma.auditLog.create({
        data: { userId: req.user.userId, action: 'MFA_ENABLED', resourceType: 'AUTH', ipAddress: req.ip, userAgent: req.headers['user-agent'] }
      });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public mfaDisable = async (req: any, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      const result = await this.authService.mfaDisable(req.user.userId, token);
      await prisma.auditLog.create({
        data: { userId: req.user.userId, action: 'MFA_DISABLED', resourceType: 'AUTH', ipAddress: req.ip, userAgent: req.headers['user-agent'] }
      });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public passkeyRegisterOptions = async (req: any, res: Response): Promise<void> => {
    try {
      const options = await this.authService.passkeyRegisterOptions(req.user.userId);
      res.status(200).json(options);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public passkeyRegisterVerify = async (req: any, res: Response): Promise<void> => {
    try {
      const result = await this.authService.passkeyRegisterVerify(req.user.userId, req.body);
      await prisma.auditLog.create({
        data: { userId: req.user.userId, action: 'PASSKEY_REGISTERED', resourceType: 'AUTH', ipAddress: req.ip, userAgent: req.headers['user-agent'] }
      });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public passkeyLoginOptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      const options = await this.authService.passkeyLoginOptions(email);
      res.status(200).json(options);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public passkeyLoginVerify = async (req: Request, res: Response): Promise<void> => {
    const ip = req.ip || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];
    try {
      const { email, response } = req.body;
      const result = await this.authService.passkeyLoginVerify(email, response);
      this.setCookies(res, result.accessToken, result.refreshToken);

      await prisma.auditLog.create({
        data: { userId: result.user!.id, action: 'PASSKEY_LOGIN', resourceType: 'AUTH', ipAddress: ip, userAgent: ua }
      });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}
