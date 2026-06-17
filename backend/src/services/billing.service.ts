import prisma from '../utils/prisma';
import Stripe from 'stripe';

export class BillingService {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is required in production.');
    }
    this.stripe = new Stripe(secretKey);
  }

  public async getOrCreateCustomer(orgId: string): Promise<string> {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new Error('Organization not found');

    if (org.stripeCustId) {
      return org.stripeCustId;
    }

    console.log(`[BillingService] Creating new Stripe Customer for Org ${orgId}`);
    const customer = await this.stripe.customers.create({
      name: org.name,
      metadata: { organizationId: org.id }
    });

    await prisma.organization.update({
      where: { id: orgId },
      data: { stripeCustId: customer.id }
    });

    return customer.id;
  }

  public async createCheckoutSession(orgId: string, plan: string = 'PRO') {
    console.log(`[BillingService] Initializing checkout session for org ${orgId}`);
    const customerId = await this.getOrCreateCustomer(orgId);

    const safePlan = (plan || 'PRO').toUpperCase();
    const priceIdMap: Record<string, string> = {
      'PRO': process.env.STRIPE_PRICE_PRO || 'price_123',
      'ENTERPRISE': process.env.STRIPE_PRICE_ENTERPRISE || 'price_456'
    };

    const priceId = priceIdMap[safePlan] || priceIdMap['PRO'];

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/billing`,
      client_reference_id: orgId,
    });

    await prisma.auditLog.create({
      data: {
        userId: null,
        action: 'BILLING_CHECKOUT_INITIATED',
        resourceType: 'Organization',
        resourceId: orgId,
        metadata: { plan: safePlan }
      }
    });

    return { url: session.url };
  }

  public async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is required');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error(`[BillingService] Webhook Signature Error: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    console.log(`[BillingService] Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.client_reference_id;
        const stripeSubId = session.subscription as string;

        if (orgId && stripeSubId) {
          console.log(`[BillingService] Session completed for org ${orgId}. Activating subscription.`);
          await prisma.subscription.upsert({
            where: { organizationId: orgId },
            create: {
              organizationId: orgId,
              stripeSubId,
              planTier: 'PRO',
              status: 'ACTIVE',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            update: {
              stripeSubId,
              planTier: 'PRO',
              status: 'ACTIVE',
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          });
          
          await prisma.auditLog.create({
            data: {
              userId: null,
              action: 'BILLING_SUBSCRIPTION_ACTIVATED',
              resourceType: 'Organization',
              resourceId: orgId,
              metadata: { stripeSubId }
            }
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[BillingService] Subscription ${subscription.id} canceled. Syncing DB.`);
        await prisma.subscription.updateMany({
          where: { stripeSubId: subscription.id },
          data: { status: 'CANCELED' }
        });
        await prisma.auditLog.create({
          data: {
            userId: null,
            action: 'BILLING_SUBSCRIPTION_CANCELED',
            resourceType: 'Subscription',
            metadata: { stripeSubId: subscription.id }
          }
        });
        break;
      }
      default:
        console.log(`[BillingService] Ignored event type: ${event.type}`);
    }
  }

  public async cancelSubscription(orgId: string) {
    const sub = await prisma.subscription.findUnique({
      where: { organizationId: orgId }
    });
    if (!sub || !sub.stripeSubId) throw new Error('No active subscription found');

    await this.stripe.subscriptions.cancel(sub.stripeSubId);

    const updatedSub = await prisma.subscription.update({
      where: { organizationId: orgId },
      data: { status: 'CANCELED' }
    });

    await prisma.auditLog.create({
      data: {
        userId: null,
        action: 'BILLING_SUBSCRIPTION_CANCELED',
        resourceType: 'Subscription',
        metadata: { stripeSubId: sub.stripeSubId }
      }
    });

    return updatedSub;
  }

  public async getSubscriptionStatus(orgId: string) {
    return prisma.subscription.findUnique({
      where: { organizationId: orgId }
    });
  }
}
