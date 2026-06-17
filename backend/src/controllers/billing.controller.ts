import { Response, Request } from 'express';
import { AuthRequest } from '../middlewares/auth.guard';
import { BillingService } from '../services/billing.service';

export class BillingController {
  private billingService = new BillingService();

  public createCheckout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { orgId, plan } = req.body;
      const session = await this.billingService.createCheckoutSession(orgId, plan);
      res.status(200).json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      // Use rawBody buffer (from Express JSON parser hook in server.ts) or fall back to body
      const payload = req.rawBody || Buffer.from(JSON.stringify(req.body));
      
      await this.billingService.handleWebhook(signature, payload);
      res.status(200).send('Webhook received');
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public cancelSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { orgId } = req.body;
      if (!orgId) {
        res.status(400).json({ error: 'orgId is required' });
        return;
      }

      const subscription = await this.billingService.cancelSubscription(orgId);
      res.status(200).json(subscription);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { orgId } = req.params;
      const status = await this.billingService.getSubscriptionStatus(orgId as string);
      res.status(200).json(status);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
