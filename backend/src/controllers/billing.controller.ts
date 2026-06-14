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
      const eventType = req.body.type;
      const data = req.body.data?.object;
      
      // Note: In prod, verify the Stripe signature header here before trusting the payload!
      await this.billingService.handleWebhook(eventType, data);
      
      res.status(200).send('Webhook received');
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
