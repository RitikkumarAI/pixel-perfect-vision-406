import prisma from '../utils/prisma';
import Stripe from 'stripe';

export class BillingService {
  private stripe: any;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      console.warn('[BillingService] WARNING: STRIPE_SECRET_KEY is not set. Real billing calls will fail.');
    }
    this.stripe = new Stripe(secretKey || 'sk_test_missing_key');
  }

  /**
   * Ensures a Stripe Customer exists for the Organization
   */
  public async getOrCreateCustomer(orgId: string): Promise<string> {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY missing.');

    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new Error('Organization not found');

    if (org.stripeCustId) {
      return org.stripeCustId;
    }

    // Create a new customer in Stripe
    console.log(`[BillingService] Creating new Stripe Customer for Org ${orgId}`);
    const customer = await this.stripe.customers.create({
      name: org.name,
      metadata: { organizationId: org.id }
    });

    // Save back to DB
    await prisma.organization.update({
      where: { id: orgId },
      data: { stripeCustId: customer.id }
    });

    return customer.id;
  }

  /**
   * Generates a real Stripe Checkout Session URL for subscription purchase.
   */
  public async createCheckoutSession(orgId: string, plan: string) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY missing.');
    
    console.log(`[BillingService] Initializing real checkout session for org ${orgId}`);
    const customerId = await this.getOrCreateCustomer(orgId);

    const priceIdMap: Record<string, string> = {
      'PRO': process.env.STRIPE_PRICE_PRO || 'price_mock_pro',
      'ENTERPRISE': process.env.STRIPE_PRICE_ENTERPRISE || 'price_mock_enterprise'
    };

    const priceId = priceIdMap[plan.toUpperCase()];
    if (!priceId) throw new Error(`Invalid plan: ${plan}`);

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/billing/cancel`,
      client_reference_id: orgId, // Linking back to Organization for webhook safety
    });

    await prisma.auditLog.create({
      data: {
        userId: 'system',
        action: 'BILLING_CHECKOUT_INITIATED',
        resourceType: 'Organization',
        resourceId: orgId,
        metadata: { plan }
      }
    });

    return { url: session.url };
  }

  /**
   * Handles webhook lifecycle events sent by Stripe with cryptographic verification.
   */
  public async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET missing.');

    let event: any;

    try {
      // Cryptographically verify payload
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error(`[BillingService] Webhook Signature Error: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
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
              userId: 'system',
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
        const subscription = event.data.object as any;
        console.log(`[BillingService] Subscription ${subscription.id} canceled. Syncing DB.`);
        await prisma.subscription.updateMany({
          where: { stripeSubId: subscription.id },
          data: { status: 'CANCELED' }
        });
        await prisma.auditLog.create({
          data: {
            userId: 'system',
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

  public async getSubscriptionStatus(orgId: string) {
    return prisma.subscription.findUnique({
      where: { organizationId: orgId }
    });
  }
}
