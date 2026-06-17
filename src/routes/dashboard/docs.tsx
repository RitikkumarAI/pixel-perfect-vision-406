import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useWorkspaces } from "../../hooks/useWorkspace";
import { useDocs } from "../../hooks/useDocs";
import { FileText, Plus, Loader2, Save } from "lucide-react";

export const Route = createFileRoute("/dashboard/docs")({
  component: DocsRoute,
});

function DocsRoute() {
  const { activeWorkspace } = useWorkspaces();
  const { docs, isLoading, createDoc, updateDoc } = useDocs(activeWorkspace?.id);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [docContent, setDocContent] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const activeDoc = docs?.find((d) => d.id === activeDocId);

  useEffect(() => {
    if (activeDoc) {
      setDocTitle(activeDoc.title || "Untitled Document");
      setDocContent(activeDoc.content?.text || "");
    } else {
      setDocTitle("");
      setDocContent("");
    }
  }, [activeDocId, activeDoc]);

  const handleCreate = async () => {
    try {
      const newDoc = await createDoc("Untitled Document");
      setActiveDocId(newDoc.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!activeDocId) return;
    setIsSaving(true);
    try {
      await updateDoc({
        id: activeDocId,
        content: { text: docContent, type: "doc" },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full gap-6">
      {/* Docs Sidebar */}
      <div className="w-64 bg-slate-50 border border-slate-200 rounded-xl flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <h2 className="font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" /> Documents
          </h2>
          <button onClick={handleCreate} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          ) : docs.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">No documents yet.</div>
          ) : (
            docs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition truncate ${activeDocId === doc.id ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-slate-100 text-slate-700"}`}
              >
                {doc.title || "Untitled Document"}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
        {activeDocId ? (
          <>
            <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50">
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="font-bold text-lg bg-transparent border-none focus:outline-none focus:ring-0 w-1/2"
                placeholder="Document Title"
              />
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto">
              <textarea
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                placeholder="Start typing your document..."
                className="w-full h-full resize-none border-none focus:outline-none focus:ring-0 prose max-w-none text-slate-700 leading-relaxed"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <FileText className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a document or create a new one to start writing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
