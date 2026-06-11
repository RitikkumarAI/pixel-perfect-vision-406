import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.guard';
import { WebhookService } from '../services/webhook.service';

export class WebhookController {
  private webhookService = new WebhookService();

  public createWebhook = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { workspaceId, url, events } = req.body;
      const webhook = await this.webhookService.createWebhook(workspaceId, url, events);
      res.status(201).json(webhook);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getWebhooks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.params;
      const webhooks = await this.webhookService.getWebhooks(workspaceId);
      res.status(200).json(webhooks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public deleteWebhook = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.webhookService.deleteWebhook(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
