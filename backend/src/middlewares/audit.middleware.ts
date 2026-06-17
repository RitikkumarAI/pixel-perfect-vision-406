import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";

export const auditMiddleware = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // We capture the initial response end to log it post-request
    const originalSend = res.send;

    res.send = function (body) {
      res.send = originalSend;

      const user = (req as any).user;
      if (user) {
        prisma.auditLog
          .create({
            data: {
              userId: user.userId,
              action,
              resource: req.originalUrl,
              details: `Status: ${res.statusCode}`,
              ipAddress: req.ip || req.socket.remoteAddress,
              userAgent: req.headers["user-agent"],
              metadata: { method: req.method, body: req.body },
            },
          })
          .catch((err) => console.error("Audit Log Error:", err));
      }

      return res.send(body);
    };
    next();
  };
};
