import { createFileRoute } from "@tanstack/react-router";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useDoc, useDocs } from "../../hooks/useDocs";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useEffect, useState } from "react";
import { useAI } from "../../hooks/useAI";
import { Sparkles } from "lucide-react";
import DOMPurify from "dompurify";

export const Route = createFileRoute("/docs/$docId")({
  component: DocumentEditorPage,
});

function DocumentEditorPage() {
  const { docId } = Route.useParams();
  const { doc, isLoading: isDocLoading } = useDoc(docId);
  const { updateDoc } = useDocs();
  const { assistWriting, isLoading: isAILoading } = useAI();
  const [saveStatus, setSaveStatus] = useState("Saved");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start typing or use AI assistant...' }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setSaveStatus("Saving...");
      const timer = setTimeout(async () => {
        try {
          await updateDoc({ id: docId, content: editor.getJSON() });
          setSaveStatus("Saved");
        } catch (e) {
          setSaveStatus("Error saving");
        }
      }, 1000);
      return () => clearTimeout(timer);
    },
  });

  useEffect(() => {
    if (doc && editor && editor.isEmpty) {
      if (typeof doc.content === 'string') {
        editor.commands.setContent(DOMPurify.sanitize(doc.content));
      } else {
        editor.commands.setContent(doc.content);
      }
    }
  }, [doc, editor]);

  const handleAIComplete = async () => {
    if (!editor) return;
    const currentText = editor.getText();
    const cursor = editor.state.selection.$head.pos;
    
    try {
      setSaveStatus("AI is thinking...");
      const res = await assistWriting("Continue the thought in a professional tone.", currentText);
      if (res.text) {
        editor.chain().focus().insertContentAt(cursor, ` ${res.text}`).run();
      }
      setSaveStatus("Saved");
    } catch (e) {
      setSaveStatus("AI Error");
    }
  };

  return (
    <div className="min-h-screen bg-white text-navy flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-6 max-w-[900px] mx-auto w-full flex flex-col">
        {isDocLoading ? (
          <div className="flex items-center justify-center h-full">Loading Document...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 min-h-[600px] flex flex-col overflow-hidden">
            <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h1 className="text-xl font-bold tracking-tight text-navy">{doc?.title || "Untitled Document"}</h1>
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-slate-400">{saveStatus}</span>
                <button 
                  onClick={handleAIComplete}
                  disabled={isAILoading}
                  className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-full text-xs font-semibold transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isAILoading ? "Writing..." : "AI Write"}
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-8 prose max-w-none focus:outline-none">
              <EditorContent editor={editor} className="min-h-[400px] outline-none" />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
