import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Plug } from "lucide-react";

export const Route = createFileRoute("/dashboard/integrations")({
  component: IntegrationsPage,
});

function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-navy flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-6 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">CMS Integrations</h1>
          <p className="text-slate-500 mt-2">Connect Nexus Swarm to your CMS to enable one-click automatic publishing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-start">
            <div className="w-12 h-12 bg-[#21759b] rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">W</span>
            </div>
            <h3 className="text-lg font-bold mb-1">WordPress</h3>
            <p className="text-sm text-slate-500 mb-6">Automatically push finished article drafts to your WordPress blog with Yoast SEO metadata injected.</p>
            <button className="mt-auto bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition w-full">
              Connect WordPress
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-start opacity-60">
            <div className="w-12 h-12 bg-[#4353ff] rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">Wf</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Webflow</h3>
            <p className="text-sm text-slate-500 mb-6">Push directly to Webflow CMS collections. (Coming Soon)</p>
            <button disabled className="mt-auto bg-slate-100 text-slate-400 px-4 py-2 rounded-lg text-sm font-semibold w-full cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
