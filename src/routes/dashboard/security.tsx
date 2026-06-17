import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Shield, Key, FileText, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/dashboard/security")({
  component: SecurityRoute,
});

function SecurityRoute() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/v1/security/audit-logs", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("nexus_token")}`,
          },
        });
        const data = await res.json();
        if (data.logs) {
          setLogs(data.logs);
        }
      } catch (e) {
        toast.error("Failed to fetch audit logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-navy flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Security & Governance</h1>
            <p className="mt-2 text-navy/70">Enterprise audit logs, MFA, and access control.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">MFA Status</h3>
              <p className="text-sm text-slate-500 mt-1">
                Passkeys are not configured for your account.
              </p>
              <button className="mt-3 text-sm text-indigo-600 font-medium">
                Configure Passkeys &rarr;
              </button>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">SSO & SCIM</h3>
              <p className="text-sm text-slate-500 mt-1">
                Enterprise identity provisioning is inactive.
              </p>
              <button className="mt-3 text-sm text-blue-600 font-medium">
                Setup Okta/SAML &rarr;
              </button>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Risk Center</h3>
              <p className="text-sm text-slate-500 mt-1">No anomalous access detected.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-500" />
            <h2 className="text-xl font-bold text-slate-800">Audit Logs</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading audit trail...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No audit logs found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Timestamp</th>
                    <th className="px-6 py-3 font-semibold">Action</th>
                    <th className="px-6 py-3 font-semibold">Resource</th>
                    <th className="px-6 py-3 font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{log.action}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {log.resourceType} ({log.resourceId})
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        {JSON.stringify(log.metadata)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
