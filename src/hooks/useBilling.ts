import { useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5005/api/v1";

export function useBilling() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  const fetchSubscriptionStatus = useCallback(async (orgId: string) => {
    if (!orgId) return null;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/billing/status/${orgId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch subscription status");
      const data = await response.json();
      setSubscription(data);
      return data;
    } catch (err: any) {
      setError(err.message || "Error fetching status");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCheckoutSession = async (orgId: string, plan: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/billing/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ orgId, plan }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout or Mock success URL
      } else {
        throw new Error("Stripe URL not returned");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during checkout");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (orgId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/billing/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ orgId }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      const data = await response.json();
      setSubscription(data);
      return data;
    } catch (err: any) {
      setError(err.message || "An error occurred during cancellation");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckoutSession,
    cancelSubscription,
    fetchSubscriptionStatus,
    subscription,
    isLoading,
    error,
  };
}
