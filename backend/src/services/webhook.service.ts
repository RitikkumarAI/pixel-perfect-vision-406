import prisma from '../utils/prisma';
import crypto from 'crypto';

export class WebhookService {
  /**
   * Register a new webhook for a workspace.
   */
  public async createWebhook(workspaceId: string, url: string, events: string[] = ['all']) {
    // Generate a secure signing secret
    const secret = crypto.randomBytes(32).toString('hex');

    return prisma.webhook.create({
      data: {
        workspaceId,
        url,
        events: JSON.stringify(events),
        secret
      }
    });
  }

  /**
   * List all webhooks for a workspace.
   */
  public async getWebhooks(workspaceId: string) {
    return prisma.webhook.findMany({
      where: { workspaceId }
    });
  }

  /**
   * Remove a webhook.
   */
  public async deleteWebhook(webhookId: string) {
    return prisma.webhook.delete({
      where: { id: webhookId }
    });
  }

  /**
   * Dispatches a webhook payload to registered endpoints.
   * This is an internal method called when events happen (e.g. task created).
   */
  public async dispatchEvent(workspaceId: string, eventName: string, payload: any) {
    const webhooks = await prisma.webhook.findMany({
      where: { workspaceId, isActive: true }
    });

    for (const hook of webhooks) {
      let events: string[] = [];
      try { events = JSON.parse(hook.events as string); } catch (e) {}

      if (events.includes('all') || events.includes(eventName)) {
        console.log(`[WebhookService] ⚡️ Dispatching ${eventName} to ${hook.url}`);
        this.sendPayload(hook.url, hook.secret, eventName, payload);
      }
    }
  }

  private async sendPayload(url: string, secret: string, eventName: string, payload: any) {
    const timestamp = Date.now().toString();
    const body = JSON.stringify({ event: eventName, payload });
    
    // Create HMAC signature using the secret
    const signature = crypto.createHmac('sha256', secret)
                            .update(`${timestamp}.${body}`)
                            .digest('hex');

    // In a real application, we'd use fetch() or axios here, wrapped in a retry-queue.
    // For this MVP backend, we log the success.
    console.log(`[WebhookService] ✅ Payload signed with signature: ${signature}`);
  }
}
