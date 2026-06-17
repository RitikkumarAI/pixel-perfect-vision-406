import { createFileRoute } from "@tanstack/react-router";
import { useBilling } from "../../hooks/useBilling";
import { useWorkspaces } from "../../hooks/useWorkspace";
import { useEffect } from "react";
import { Check, CreditCard, Loader2, AlertCircle, XCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/billing")({
  component: BillingRoute,
});

function BillingRoute() {
  const {
    createCheckoutSession,
    cancelSubscription,
    fetchSubscriptionStatus,
    subscription,
    isLoading,
    error,
  } = useBilling();
  const { activeWorkspace } = useWorkspaces();

  useEffect(() => {
    if (activeWorkspace) {
      fetchSubscriptionStatus(activeWorkspace.id);
    }
  }, [activeWorkspace, fetchSubscriptionStatus]);

  const handleSubscribe = async (plan: string) => {
    if (!activeWorkspace) return;
    await createCheckoutSession(activeWorkspace.id, plan);
  };

  const handleCancel = async () => {
    if (
      !activeWorkspace ||
      !window.confirm(
        "Are you sure you want to cancel your subscription? Your access will terminate at the end of the billing cycle.",
      )
    )
      return;
    await cancelSubscription(activeWorkspace.id);
  };

  const hasActiveSub =
    subscription && subscription.status === "ACTIVE" && subscription.planTier !== "FREE";
  const displayPlan = hasActiveSub ? subscription.planTier : "FREE";

  return (
    <div className="h-full bg-slate-50 overflow-auto p-8 rounded-xl border border-slate-200">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-indigo-600" /> Workspace Billing
          </h1>
          <p className="text-slate-500 mt-2">
            Manage your subscription, payment methods, and billing history.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {/* Current Plan Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">
              Current Plan: {displayPlan === "FREE" ? "Free Tier" : `${displayPlan} Workspace`}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {displayPlan === "FREE"
                ? "You are currently on the free workspace plan."
                : `Your subscription is active. Renews/ends on: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {hasActiveSub ? (
              <>
                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 font-semibold rounded-lg text-sm uppercase tracking-wider border border-emerald-100">
                  Active
                </span>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 border border-rose-200 text-rose-600 font-medium rounded-lg text-sm hover:bg-rose-50 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}{" "}
                  Cancel Subscription
                </button>
              </>
            ) : subscription?.status === "CANCELED" ? (
              <>
                <span className="px-4 py-1.5 bg-rose-50 text-rose-700 font-semibold rounded-lg text-sm uppercase tracking-wider border border-rose-100">
                  Canceled
                </span>
              </>
            ) : (
              <span className="px-4 py-1.5 bg-slate-100 text-slate-600 font-semibold rounded-lg text-sm uppercase tracking-wider border border-slate-200">
                Active
              </span>
            )}
          </div>
        </div>

        {/* Upgrade Cards (Hidden if they have a real subscription active) */}
        {!hasActiveSub && (
          <div>
            <h2 className="text-xl font-bold mb-6">Upgrade Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-indigo-100 rounded-2xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
                <h3 className="text-xl font-bold mb-2">Pro Workspace</h3>
                <p className="text-slate-500 text-sm mb-6">Perfect for growing teams.</p>
                <div className="text-4xl font-bold mb-6">
                  $29<span className="text-lg text-slate-400 font-normal">/mo</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited active tasks",
                    "Unlimited video recordings",
                    "10 AI Agents",
                    "Priority support",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe("pro")}
                  disabled={isLoading}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 animate-pulse-subtle"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Upgrade to Pro
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                <p className="text-slate-500 text-sm mb-6">For large scale operations.</p>
                <div className="text-4xl font-bold mb-6">
                  $99<span className="text-lg text-slate-400 font-normal">/mo</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    "Custom AI Agents",
                    "Advanced analytics",
                    "SSO & SCIM provisioning",
                    "Dedicated account manager",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe("enterprise")}
                  disabled={isLoading}
                  className="w-full py-3 bg-white border-2 border-slate-900 text-slate-900 rounded-xl font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Upgrade to
                  Enterprise
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
