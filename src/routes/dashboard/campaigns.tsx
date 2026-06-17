import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Play, CheckCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard/campaigns")({
  component: CampaignsPage,
});

function CampaignsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-navy flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Content Campaigns</h1>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-semibold transition flex items-center gap-2">
            <Play className="w-4 h-4" />
            New Campaign
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Campaign Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Keywords</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-medium">B2B SaaS Growth 2026</td>
                <td className="px-6 py-4 text-slate-600">150 Keywords</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                    <Clock className="w-3.5 h-3.5" />
                    Running Swarm
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">12 / 150</td>
              </tr>
              <tr className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-medium">Dental Clinic SEO Hub</td>
                <td className="px-6 py-4 text-slate-600">45 Keywords</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Completed
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">45 / 45</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
}
