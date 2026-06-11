import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import crypto from 'crypto';

export class AuthService {
  private JWT_SECRET = process.env.JWT_SECRET || 'nexus_super_secret_key';
  private REFRESH_SECRET = process.env.REFRESH_SECRET || 'nexus_refresh_secret_key';

  public async register(email: string, passwordRaw: string, name?: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const passwordHash = await argon2.hash(passwordRaw);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });

    return this.generateTokensAndSession(user.id);
  }

  public async login(email: string, passwordRaw: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    const isValid = await argon2.verify(user.passwordHash, passwordRaw);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    return this.generateTokensAndSession(user.id);
  }

  public async refresh(refreshTokenRaw: string) {
    const decoded = jwt.verify(refreshTokenRaw, this.REFRESH_SECRET) as { sessionId: string };
    const session = await prisma.session.findUnique({ where: { id: decoded.sessionId } });

    if (!session || session.revokedAt || session.expiresAt < new Date() || session.refreshToken !== refreshTokenRaw) {
      throw new Error('Invalid refresh token');
    }

    // Refresh rotation: invalidate old session, create new
    await prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() }
    });

    return this.generateTokensAndSession(session.userId);
  }

  public async logout(sessionId: string) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    });
  }

  private async generateTokensAndSession(userId: string) {
    const accessToken = jwt.sign({ userId }, this.JWT_SECRET, { expiresIn: '15m' });
    
    // Generate a secure random string for refresh token body
    const refreshTokenBody = crypto.randomBytes(40).toString('hex');
    
    // Create DB session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const session = await prisma.session.create({
      data: {
        userId,
        refreshToken: refreshTokenBody,
        expiresAt
      }
    });

    // Embed sessionId inside JWT to tie the JWT to the DB session easily
    const refreshToken = jwt.sign({ sessionId: session.id, token: refreshTokenBody }, this.REFRESH_SECRET, { expiresIn: '7d' });
    
    // Update the DB session to store the signed token so we can exact-match if needed, though strictly we only need to verify JWT
    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken }
    });

    return { 
      accessToken, 
      refreshToken,
      user: await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true } })
    };
  }
}
