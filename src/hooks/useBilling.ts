import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export function useBilling() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (orgId: string, plan: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ orgId, plan }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to genuine Stripe Checkout
      } else {
        throw new Error('Stripe URL not returned');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { createCheckoutSession, isLoading, error };
}
