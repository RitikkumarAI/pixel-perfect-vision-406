import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.guard";
import { DocumentService } from "../services/document.service";

export class DocumentController {
  private documentService = new DocumentService();

  public createDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.params;
      const { title, content, isPublic } = req.body;
      const doc = await this.documentService.createDocument(
        workspaceId as string,
        title,
        content,
        isPublic,
      );
      res.status(201).json(doc);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getWorkspaceDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.params;
      const docs = await this.documentService.getWorkspaceDocuments(workspaceId as string);
      res.status(200).json(docs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const doc = await this.documentService.getDocument(id as string);
      res.status(200).json(doc);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  public updateDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, content, isPublic } = req.body;
      const doc = await this.documentService.updateDocument(id as string, title, content, isPublic);
      res.status(200).json(doc);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.documentService.deleteDocument(id as string);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
