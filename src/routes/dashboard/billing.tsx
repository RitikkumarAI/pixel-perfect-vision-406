import { createFileRoute } from "@tanstack/react-router";
import { useBilling } from "../../hooks/useBilling";
import { useWorkspaces } from "../../hooks/useWorkspace";
import { Check, CreditCard, Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/billing")({
  component: BillingRoute,
});

function BillingRoute() {
  const { createCheckoutSession, isLoading } = useBilling();
  const { activeWorkspace } = useWorkspaces();

  const handleSubscribe = async (plan: string) => {
    if (!activeWorkspace) return;
    await createCheckoutSession(activeWorkspace.id, plan);
  };

  return (
    <div className="h-full bg-slate-50 overflow-auto p-8 rounded-xl border border-slate-200">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-indigo-600" /> Workspace Billing
          </h1>
          <p className="text-slate-500 mt-2">Manage your subscription, payment methods, and billing history.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">Current Plan: Free Tier</h3>
            <p className="text-sm text-slate-500">You are currently on the free workspace plan.</p>
          </div>
          <div className="px-4 py-1.5 bg-slate-100 text-slate-600 font-semibold rounded-lg text-sm uppercase tracking-wider border border-slate-200">
            Active
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-6">Upgrade Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="bg-white border border-indigo-100 rounded-2xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
              <h3 className="text-xl font-bold mb-2">Pro Workspace</h3>
              <p className="text-slate-500 text-sm mb-6">Perfect for growing teams.</p>
              <div className="text-4xl font-bold mb-6">$29<span className="text-lg text-slate-400 font-normal">/mo</span></div>
              
              <ul className="space-y-3 mb-8">
                {['Unlimited active tasks', 'Unlimited video recordings', '10 AI Agents', 'Priority support'].map(feature => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleSubscribe('pro')}
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Upgrade to Pro
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <p className="text-slate-500 text-sm mb-6">For large scale operations.</p>
              <div className="text-4xl font-bold mb-6">$99<span className="text-lg text-slate-400 font-normal">/mo</span></div>
              
              <ul className="space-y-3 mb-8">
                {['Custom AI Agents', 'Advanced analytics', 'SSO & SCIM provisioning', 'Dedicated account manager'].map(feature => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleSubscribe('enterprise')}
                disabled={isLoading}
                className="w-full py-3 bg-white border-2 border-slate-900 text-slate-900 rounded-xl font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Upgrade to Enterprise
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
