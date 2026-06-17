import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Webhook, Plus, Trash2, Link } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/webhooks")({
  component: WebhooksRoute,
});

function WebhooksRoute() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [newSecret, setNewSecret] = useState("");

  const fetchWebhooks = async () => {
    try {
      const res = await fetch("/api/v1/webhooks", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("nexus_token")}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setWebhooks(data);
      }
    } catch (e) {
      console.error("Failed to fetch webhooks", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    try {
      const res = await fetch("/api/v1/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("nexus_token")}`,
        },
        body: JSON.stringify({ url: newUrl, secret: newSecret }),
      });
      if (res.ok) {
        toast.success("Webhook endpoint added successfully");
        setNewUrl("");
        setNewSecret("");
        fetchWebhooks();
      } else {
        toast.error("Failed to add webhook");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/webhooks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("nexus_token")}`,
        },
      });
      if (res.ok) {
        toast.success("Webhook removed");
        fetchWebhooks();
      } else {
        toast.error("Failed to remove webhook");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-navy flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Outbound Webhooks</h1>
            <p className="mt-2 text-navy/70">
              Configure endpoints to receive live events from Nexus.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-slate-800">Add Endpoint</h2>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Payload URL
                  </label>
                  <input
                    type="url"
                    required
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://your-domain.com/webhook"
                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Secret (Optional)
                  </label>
                  <input
                    type="password"
                    value={newSecret}
                    onChange={(e) => setNewSecret(e.target.value)}
                    placeholder="Signature secret"
                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-medium py-2 rounded-md hover:bg-indigo-700 transition"
                >
                  Save Webhook
                </button>
              </form>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
              <div className="p-6 border-b border-slate-200 flex items-center gap-2">
                <Webhook className="w-5 h-5 text-slate-500" />
                <h2 className="text-xl font-bold text-slate-800">Configured Endpoints</h2>
              </div>
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading webhooks...</div>
              ) : webhooks.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <Link className="w-12 h-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-700">No webhooks configured</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Add your first endpoint to start receiving events.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {webhooks.map((webhook) => (
                    <li
                      key={webhook.id}
                      className="p-6 flex items-center justify-between hover:bg-slate-50 transition"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{webhook.url}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Added on {new Date(webhook.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(webhook.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-md transition"
                        title="Delete Webhook"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
