import { Router } from "express";
import { DocumentController } from "../controllers/document.controller";
import { authGuard } from "../middlewares/auth.guard";

const router = Router();
const documentController = new DocumentController();

router.use(authGuard);

router.get("/workspaces/:workspaceId", documentController.getWorkspaceDocuments);
router.post("/workspaces/:workspaceId", documentController.createDocument);

router.get("/:id", documentController.getDocument);
router.put("/:id", documentController.updateDocument);
router.delete("/:id", documentController.deleteDocument);

export default router;
