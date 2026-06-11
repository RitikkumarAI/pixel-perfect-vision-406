import { useCallback } from 'react';
import { useAuth } from './useAuth';

export function useAnalytics() {
  const { token, isAuthenticated } = useAuth();

  const trackEvent = useCallback(async (eventName: string, properties: Record<string, any> = {}) => {
    if (!isAuthenticated) return; // Only track authenticated users
    
    try {
      await fetch('/api/v1/analytics/track', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ event: eventName, properties })
      });
    } catch (err) {
      console.error('Failed to track event:', err);
    }
  }, [token, isAuthenticated]);

  return { trackEvent };
}
