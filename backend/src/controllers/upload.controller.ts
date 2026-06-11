import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.guard';
import { UploadService } from '../services/upload.service';

export class UploadController {
  private uploadService = new UploadService();

  // Endpoint for direct multipart/form-data upload (via multer)
  public uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const folder = req.query.folder as string || 'attachments';
      const fileUrl = await this.uploadService.uploadBuffer(
        req.file.buffer, 
        req.file.mimetype, 
        req.file.originalname,
        folder
      );

      res.status(201).json({ url: fileUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Endpoint for requesting a pre-signed URL
  public getPresignedUrl = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { filename, contentType, folder } = req.query;
      
      if (!filename || !contentType) {
        res.status(400).json({ error: 'filename and contentType are required query parameters' });
        return;
      }

      const payload = await this.uploadService.generatePresignedUrl(
        filename as string, 
        contentType as string, 
        folder as string || 'uploads'
      );

      res.status(200).json(payload);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
