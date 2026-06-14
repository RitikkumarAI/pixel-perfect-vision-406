import prisma from '../utils/prisma';
import * as geoip from 'geoip-lite';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export class SecurityService {
  public async checkSuspiciousLogin(userId: string, ip: string | undefined, userAgent: string | undefined) {
    if (!ip) return null;

    try {
      const geo = geoip.lookup(ip);
      const lat = geo?.ll?.[0];
      const lon = geo?.ll?.[1];

      // 1. True Impossible Travel
      const lastSession = await prisma.session.findFirst({
        where: { userId, latitude: { not: null }, longitude: { not: null } },
        orderBy: { createdAt: 'desc' }
      });
      
      if (lat && lon && lastSession?.latitude && lastSession?.longitude) {
        const distKm = calculateDistance(lastSession.latitude, lastSession.longitude, lat, lon);
        const timeDiffHours = (Date.now() - lastSession.createdAt.getTime()) / (1000 * 60 * 60);
        
        if (timeDiffHours > 0) {
          const speedKmh = distKm / timeDiffHours;
          if (speedKmh > 1000 && distKm > 200) { // >1000km/h over 200km implies impossible travel
            await prisma.securityAlert.create({
              data: {
                userId,
                type: 'IMPOSSIBLE_TRAVEL',
                severity: 'HIGH',
                description: `Impossible travel detected: ${distKm.toFixed(0)}km in ${timeDiffHours.toFixed(1)} hours (Speed: ${speedKmh.toFixed(0)} km/h).`
              }
            });
          }
        }
      }

      // 2. Excessive Failed Logins
      const failedLogins = await prisma.auditLog.count({
        where: {
          userId,
          action: 'LOGIN_FAILED',
          createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) }
        }
      });

      if (failedLogins > 5) {
        await prisma.securityAlert.create({
          data: {
            userId,
            type: 'BRUTE_FORCE_ATTEMPT',
            severity: 'CRITICAL',
            description: `More than 5 failed login attempts in the last 15 minutes.`
          }
        });
      }

      return { lat, lon, country: geo?.country };
    } catch (err) {
      console.error("[SecurityService] Failed to check suspicious login:", err);
      return null;
    }
  }
}
