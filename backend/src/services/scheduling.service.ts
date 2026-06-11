import prisma from '../utils/prisma';

export class SchedulingService {
  /**
   * Defines or updates availability rules for a user for a specific day of the week (0-6).
   */
  public async setAvailabilityRule(userId: string, dayOfWeek: number, startTime: string, endTime: string, timezone: string = 'UTC') {
    const existing = await prisma.availabilityRule.findFirst({
      where: { userId, dayOfWeek }
    });

    if (existing) {
      return prisma.availabilityRule.update({
        where: { id: existing.id },
        data: { startTime, endTime, timezone }
      });
    }

    return prisma.availabilityRule.create({
      data: { userId, dayOfWeek, startTime, endTime, timezone }
    });
  }

  /**
   * Get public availability rules for a specific user (the booking page host).
   */
  public async getAvailability(hostId: string) {
    return prisma.availabilityRule.findMany({
      where: { userId: hostId }
    });
  }

  /**
   * Creates a new booking. For MVP we assume times are pre-validated by the frontend against the availability rules.
   */
  public async createBooking(hostId: string, guestName: string, guestEmail: string, startTime: Date, endTime: Date) {
    // In a fully robust system, check for overlapping bookings here:
    const overlapping = await prisma.booking.findFirst({
      where: {
        hostId,
        status: 'CONFIRMED',
        OR: [
          { startTime: { lt: endTime }, endTime: { gt: startTime } }
        ]
      }
    });

    if (overlapping) throw new Error('Time slot is already booked.');

    // Create booking and mock a generated meeting URL
    return prisma.booking.create({
      data: {
        hostId,
        guestName,
        guestEmail,
        startTime,
        endTime,
        meetingUrl: `https://nexus.local/m/book-${Date.now()}`
      }
    });
  }

  /**
   * Retrieves all upcoming bookings for a host.
   */
  public async getHostUpcomingBookings(hostId: string) {
    return prisma.booking.findMany({
      where: { 
        hostId, 
        startTime: { gte: new Date() }
      },
      orderBy: { startTime: 'asc' }
    });
  }
}
