import prisma from "../utils/prisma";
import * as admin from "firebase-admin";

// Initialize Firebase Admin (Assuming credentials are in ENV)
if (!admin.apps.length && process.env.FIREBASE_CREDENTIALS) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    console.error("Failed to initialize Firebase Admin");
  }
}

export class PushNotificationService {
  /**
   * Registers a device token for a user.
   */
  public async registerDevice(userId: string, token: string, platform: "ios" | "android") {
    await prisma.device.upsert({
      where: { token },
      create: { userId, token, platform },
      update: { userId, lastActive: new Date() },
    });
  }

  /**
   * Dispatches a push notification to all devices owned by the user.
   */
  public async sendNotification(userId: string, title: string, body: string, dataPayload?: any) {
    const devices = await prisma.device.findMany({ where: { userId } });
    const tokens = devices.map((d) => d.token);

    if (tokens.length === 0) return;

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: dataPayload,
        apns: {
          payload: { aps: { sound: "default", badge: 1 } },
        },
      });

      console.log(`[Push] Sent to ${response.successCount} devices for user ${userId}`);
    } catch (err: any) {
      console.error(`[Push Error] ${err.message}`);
    }
  }
}
