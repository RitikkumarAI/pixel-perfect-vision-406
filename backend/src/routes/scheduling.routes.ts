import { Router } from 'express';
import { SchedulingController } from '../controllers/scheduling.controller';
import { authGuard } from '../middlewares/auth.guard';

const router = Router();
const schedulingController = new SchedulingController();

// Public routes for guests booking a time
router.get('/public/:hostId/availability', schedulingController.getAvailability);
router.post('/bookings', schedulingController.createBooking);

// Protected routes for hosts managing their schedules
router.use(authGuard);

router.get('/event-types', schedulingController.getEventTypes as any);
router.post('/event-types', schedulingController.createEventType as any);

router.get('/bookings', schedulingController.getBookings as any);

router.post('/calendar/connect/google', schedulingController.connectGoogle as any);
router.post('/calendar/connect/outlook', schedulingController.connectOutlook as any);

router.post('/rules', schedulingController.setAvailabilityRule as any);

export default router;
