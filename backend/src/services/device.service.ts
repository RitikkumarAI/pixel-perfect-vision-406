import prisma from '../utils/prisma';

export class DeviceService {
  /**
   * Registers a new device token (APNS/FCM) for a user to receive Push Notifications.
   */
  public async registerDevice(userId: string, pushToken: string, platform: string, deviceModel?: string, appVersion?: string) {
    console.log(`[DeviceService] Registering ${platform} device for user ${userId}`);

    return prisma.device.upsert({
      where: { pushToken },
      create: {
        userId,
        pushToken,
        platform,
        deviceModel,
        appVersion
      },
      update: {
        userId, // update ownership just in case
        platform,
        deviceModel,
        appVersion,
        lastActive: new Date()
      }
    });
  }

  /**
   * Removes a device token (e.g. upon user logout from the mobile app).
   */
  public async unregisterDevice(userId: string, pushToken: string) {
    // Delete only if it belongs to the user
    return prisma.device.deleteMany({
      where: {
        userId,
        pushToken
      }
    });
  }

  /**
   * Mocks sending a push notification via APNS/FCM.
   */
  public async sendPushNotification(userId: string, title: string, body: string, data: any = {}) {
    const devices = await prisma.device.findMany({
      where: { userId }
    });

    if (devices.length === 0) return;

    devices.forEach(device => {
      console.log(`[DeviceService] 📲 Sending Push to ${device.platform} (${device.pushToken}): ${title}`);
      // In production:
      // if (device.platform === 'ios') apnsProvider.send(...)
      // else if (device.platform === 'android') fcmProvider.send(...)
    });
  }
}
