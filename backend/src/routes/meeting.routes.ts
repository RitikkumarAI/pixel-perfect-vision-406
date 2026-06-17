import { Router } from "express";
import { MeetingController } from "../controllers/meeting.controller";
import { authGuard } from "../middlewares/auth.guard";

const router = Router();
const meetingController = new MeetingController();

router.use(authGuard);

router.post("/", meetingController.createMeeting);
router.get("/:id/token", meetingController.getJoinToken);
router.post("/:id/end", meetingController.endMeeting);

export default router;
