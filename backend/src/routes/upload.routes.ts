import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller';
import { authGuard } from '../middlewares/auth.guard';

const router = Router();
const uploadController = new UploadController();

// Configure multer for memory storage (direct buffer access)
// Max size 10MB for direct proxy. For larger files, the frontend should use the presigned URL endpoint.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.use(authGuard);

router.post('/', upload.single('file'), uploadController.uploadFile);
router.get('/presigned', uploadController.getPresignedUrl);

export default router;
