import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { TOTP } from "otplib";
import prisma from "../utils/prisma";
import crypto from "crypto";

const authenticator = {
  generateSecret: () => new TOTP().generateSecret(),
  keyuri: (email: string, issuer: string, secret: string) =>
    new TOTP().toURI({ label: email, issuer, secret }),
  verify: ({ token, secret }: { token: string; secret: string }) =>
    new TOTP().verify({ token, secret } as any),
};
import QRCode from "qrcode";
import { EncryptionService } from "./encryption.service";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";

const rpName = "Nexus AI Workspace";
const rpID = process.env.CLIENT_URL ? new URL(process.env.CLIENT_URL).hostname : "localhost";
const expectedOrigin = process.env.CLIENT_URL || `http://${rpID}:5173`;

export class AuthService {
  private JWT_SECRET = process.env.JWT_SECRET || "nexus_super_secret_key";
  private REFRESH_SECRET = process.env.REFRESH_SECRET || "nexus_refresh_secret_key";
  private encryptionService = new EncryptionService();

  public async register(email: string, passwordRaw: string, name?: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("Email already in use");
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
      throw new Error("Invalid credentials");
    }

    const isValid = await argon2.verify(user.passwordHash, passwordRaw);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    return this.generateTokensAndSession(user.id);
  }

  public async refresh(refreshTokenRaw: string) {
    const decoded = jwt.verify(refreshTokenRaw, this.REFRESH_SECRET) as { sessionId: string };
    const session = await prisma.session.findUnique({ where: { id: decoded.sessionId } });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt < new Date() ||
      session.refreshToken !== refreshTokenRaw
    ) {
      throw new Error("Invalid refresh token");
    }

    // Refresh rotation: invalidate old session, create new
    await prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokensAndSession(session.userId);
  }

  public async logout(sessionId: string) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  // --- MFA (TOTP) ---

  public async mfaSetup(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, "Nexus AI Workspace", secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Save encrypted secret temporarily (wait for verify to enable)
    const encryptedSecret = this.encryptionService.encrypt(secret);

    await prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: encryptedSecret }, // Not enabled yet, just stored
    });

    return { secret, qrCodeDataUrl };
  }

  public async mfaVerify(userId: string, token: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) throw new Error("MFA not setup");

    const secret = this.encryptionService.decrypt(user.mfaSecret);
    const isValid = authenticator.verify({ token, secret });

    if (!isValid) throw new Error("Invalid MFA token");

    // Generate backup codes
    const rawBackupCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString("hex"));
    const encryptedBackupCodes = rawBackupCodes.map((code) => this.encryptionService.encrypt(code));

    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: true,
        backupCodes: encryptedBackupCodes,
      },
    });

    return { backupCodes: rawBackupCodes };
  }

  public async mfaDisable(userId: string, token: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret || !user.mfaEnabled) throw new Error("MFA not enabled");

    const secret = this.encryptionService.decrypt(user.mfaSecret);
    const isValid = authenticator.verify({ token, secret });

    if (!isValid) throw new Error("Invalid MFA token");

    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        backupCodes: undefined,
      },
    });

    return { success: true };
  }

  // --- PASSKEYS ---

  public async passkeyRegisterOptions(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { webAuthnCredentials: true },
    });
    if (!user) throw new Error("User not found");

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: Buffer.from(user.id) as any,
      userName: user.email,
      excludeCredentials: user.webAuthnCredentials.map((cred) => ({
        id: cred.credentialID,
        type: "public-key",
      })),
      authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { webAuthnChallenge: options.challenge },
    });

    return options;
  }

  public async passkeyRegisterVerify(userId: string, response: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.webAuthnChallenge) throw new Error("Challenge not found");

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: user.webAuthnChallenge,
      expectedOrigin,
      expectedRPID: rpID,
    } as any);

    if (verification.verified && verification.registrationInfo) {
      const regInfo = verification.registrationInfo as any;
      const credentialID = regInfo.credentialID || regInfo.credential?.id;
      const credentialPublicKey = regInfo.credentialPublicKey || regInfo.credential?.publicKey;
      const counter = regInfo.counter || 0;

      await prisma.webAuthnCredential.create({
        data: {
          userId,
          credentialID: Buffer.from(credentialID).toString("base64"),
          publicKey: Buffer.from(credentialPublicKey).toString("base64"),
          counter: BigInt(counter),
          transports: response.response.transports || [],
        },
      });
      return { verified: true };
    }
    throw new Error("Verification failed");
  }

  public async passkeyLoginOptions(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { webAuthnCredentials: true },
    });
    if (!user) throw new Error("User not found");

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: user.webAuthnCredentials.map((cred) => ({
        id: cred.credentialID,
        type: "public-key",
        transports: cred.transports as any,
      })),
      userVerification: "preferred",
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { webAuthnChallenge: options.challenge },
    });

    return options;
  }

  public async passkeyLoginVerify(email: string, response: any) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { webAuthnCredentials: true },
    });
    if (!user || !user.webAuthnChallenge) throw new Error("Invalid login attempt");

    const credential = user.webAuthnCredentials.find((c) => c.credentialID === response.id);
    if (!credential) throw new Error("Credential not found");

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: user.webAuthnChallenge,
      expectedOrigin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: credential.credentialID,
        credentialPublicKey: Buffer.from(credential.publicKey, "base64"),
        counter: Number(credential.counter),
      } as any,
    } as any);

    if (verification.verified) {
      await prisma.webAuthnCredential.update({
        where: { id: credential.id },
        data: { counter: BigInt((verification.authenticationInfo as any).newCounter) },
      });
      return this.generateTokensAndSession(user.id);
    }
    throw new Error("Authentication failed");
  }

  private async generateTokensAndSession(userId: string) {
    const accessToken = jwt.sign({ userId }, this.JWT_SECRET, { expiresIn: "15m" });

    // Generate a secure random string for refresh token body
    const refreshTokenBody = crypto.randomBytes(40).toString("hex");

    // Create DB session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const session = await prisma.session.create({
      data: {
        userId,
        refreshToken: refreshTokenBody,
        expiresAt,
      },
    });

    // Embed sessionId inside JWT to tie the JWT to the DB session easily
    const refreshToken = jwt.sign(
      { sessionId: session.id, token: refreshTokenBody },
      this.REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    // Update the DB session to store the signed token so we can exact-match if needed, though strictly we only need to verify JWT
    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
      }),
    };
  }
}
