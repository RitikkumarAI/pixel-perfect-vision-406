import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { FileText, Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard/brand-voice")({
  component: BrandVoicePage,
});

function BrandVoicePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-navy flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-6 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Brand Voice Memory</h1>
          <p className="text-slate-500 mt-2">Upload your past top-performing articles and SOPs. Our Swarm Agents will embed and clone your exact writing style.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center border-dashed">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload SOPs & Articles</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">Upload PDF, DOCX, or TXT files. We will automatically vectorize them into your Brand Memory Bank.</p>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-semibold transition inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Upload File
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
