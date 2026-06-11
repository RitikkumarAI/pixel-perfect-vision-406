import { Router } from 'express';
import { SchedulingController } from '../controllers/scheduling.controller';
import { authGuard } from '../middlewares/auth.guard';

const router = Router();
const schedulingController = new SchedulingController();

// Public routes for guests booking a time
router.get('/public/:hostId/availability', schedulingController.getAvailability);
router.post('/public/:hostId/book', schedulingController.createBooking);

// Protected routes for hosts managing their schedules
router.use(authGuard);
router.get('/bookings/upcoming', schedulingController.getUpcomingBookings);
router.post('/rules', schedulingController.setAvailabilityRule);

export default router;
