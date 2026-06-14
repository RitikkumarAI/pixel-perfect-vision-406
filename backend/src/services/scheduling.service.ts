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
  /**
   * Event Types
   */
  public async getEventTypes(userId: string) {
    return prisma.eventType.findMany({ where: { userId } });
  }

  public async createEventType(userId: string, title: string, description: string, durationMin: number, slug: string) {
    return prisma.eventType.create({
      data: { userId, title, description, durationMin, slug }
    });
  }

  /**
   * Bookings & Meetings
   */
  public async createBooking(hostId: string, eventTypeId: string, guestName: string, guestEmail: string, startTime: Date, endTime: Date) {
    // Basic overlap check
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

    // 1. Create the database booking & attendees
    const booking = await prisma.booking.create({
      data: {
        hostId,
        eventTypeId,
        guestName,
        guestEmail,
        startTime,
        endTime,
        attendees: {
          create: [{ name: guestName, email: guestEmail }]
        }
      }
    });

    // 2. Generate the LiveKit Meeting explicitly via MeetingService logic
    const meetingTitle = `Meeting with ${guestName}`;
    const meeting = await prisma.meeting.create({
      data: {
        hostId,
        title: meetingTitle,
        startTime,
        endTime,
        status: 'SCHEDULED'
      }
    });

    // Mock LiveKit room allocation and Meeting update
    const livekitRoomName = `booking-${booking.id}`;
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { livekitRoom: livekitRoomName }
    });

    // 3. Associate URL to the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { meetingUrl: `https://nexus.local/meet/${livekitRoomName}` }
    });

    return updatedBooking;
  }

  public async getHostBookings(hostId: string) {
    return prisma.booking.findMany({
      where: { hostId },
      orderBy: { startTime: 'asc' },
      include: { attendees: true, eventType: true }
    });
  }

  /**
   * Calendar Integrations
   */
  public async connectCalendar(userId: string, provider: string, accessToken: string, refreshToken: string) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Mock 1h expiry

    return prisma.calendarAccount.upsert({
      where: { userId_provider: { userId, provider } },
      update: { accessToken, refreshToken, expiresAt, syncStatus: "ACTIVE" },
      create: { userId, provider, accessToken, refreshToken, expiresAt }
    });
  }


}
