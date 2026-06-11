import { PostHog } from 'posthog-node';

export class AnalyticsService {
  private posthog: PostHog | null = null;

  constructor() {
    const apiKey = process.env.POSTHOG_API_KEY;
    if (apiKey) {
      this.posthog = new PostHog(apiKey, {
        host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
      });
    } else {
      console.warn('[AnalyticsService] WARNING: POSTHOG_API_KEY is not set. Analytics are disabled.');
    }
  }

  /**
   * Proxies a frontend tracking event into the backend data warehouse.
   */
  public async trackEvent(userId: string, eventName: string, properties: Record<string, any> = {}) {
    if (!this.posthog) {
      console.log(`[AnalyticsService - DISABLED] 📊 Tracking [${eventName}] for user ${userId}`, properties);
      return;
    }

    try {
      this.posthog.capture({
        distinctId: userId,
        event: eventName,
        properties: {
          ...properties,
          $source: 'backend-proxy'
        }
      });
    } catch (error) {
      console.error(`[AnalyticsService] Failed to track event:`, error);
    }
  }

  /**
   * Tracks organization-level events (group analytics)
   */
  public async trackGroupEvent(orgId: string, eventName: string, properties: Record<string, any> = {}) {
    if (!this.posthog) return;
    
    try {
      this.posthog.capture({
        distinctId: `org_${orgId}`,
        event: eventName,
        properties: {
          ...properties,
          $groups: { company: orgId }
        }
      });
    } catch (error) {
      console.error(`[AnalyticsService] Failed to track group event:`, error);
    }
  }

  // Graceful shutdown
  public async flush() {
    if (this.posthog) {
      await this.posthog.shutdown();
    }
  }
}
