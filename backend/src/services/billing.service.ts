import prisma from '../utils/prisma';

export class BillingService {
  /**
   * Mocks a Stripe Checkout Session generation.
   */
  public async createCheckoutSession(orgId: string, plan: string) {
    // Check if organization exists
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new Error('Organization not found');

    // In a real application, we would call stripe.checkout.sessions.create()
    console.log(`[BillingService] Creating mock Stripe checkout for org ${orgId} to plan ${plan}`);

    // Mock response URL
    return {
      url: `https://checkout.stripe.com/pay/mock_${orgId}_${Date.now()}`
    };
  }

  /**
   * Handles webhook lifecycle events sent by Stripe.
   */
  public async handleWebhook(eventType: string, data: any) {
    // Ensure we handle basic lifecycle events securely
    switch (eventType) {
      case 'checkout.session.completed':
        const orgId = data.client_reference_id; // Passed when creating the session
        const stripeSubId = data.subscription;
        
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
        break;

      case 'customer.subscription.deleted':
        const canceledSubId = data.id;
        await prisma.subscription.update({
          // In a real app we'd search by stripeSubId, assuming it's uniquely indexed
          where: { organizationId: orgId }, // Simplified for mock
          data: { status: 'CANCELED' }
        });
        break;
      
      default:
        console.log(`[BillingService] Unhandled event type: ${eventType}`);
    }
  }

  public async getSubscriptionStatus(orgId: string) {
    return prisma.subscription.findUnique({
      where: { organizationId: orgId }
    });
  }
}
