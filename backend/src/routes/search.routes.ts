import { Router } from "express";
import { SearchController } from "../controllers/search.controller";
import { authGuard } from "../middlewares/auth.guard";

const router = Router();
const searchController = new SearchController();

router.use(authGuard);
router.get("/workspaces/:workspaceId", searchController.globalSearch);
router.get("/semantic/workspaces/:workspaceId", searchController.semanticSearch);

export default router;
