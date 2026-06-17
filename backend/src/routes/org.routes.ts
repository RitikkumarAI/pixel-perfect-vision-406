import { Router } from "express";
import { OrgController } from "../controllers/org.controller";
import { validateRequest } from "../middlewares/validate";
import {
  createOrgSchema,
  createTeamSchema,
  createWorkspaceSchema,
  inviteMemberSchema,
} from "../dtos/org.dto";
import { authGuard } from "../middlewares/auth.guard";

const router = Router();
const orgController = new OrgController();

router.use(authGuard);

router.get("/", orgController.getUserOrganizations);
router.post("/", validateRequest(createOrgSchema), orgController.createOrganization);
router.post("/:id/teams", validateRequest(createTeamSchema), orgController.createTeam);
router.post(
  "/teams/:teamId/workspaces",
  validateRequest(createWorkspaceSchema),
  orgController.createWorkspace,
);
router.post("/:id/invite", validateRequest(inviteMemberSchema), orgController.inviteMember);

export default router;
