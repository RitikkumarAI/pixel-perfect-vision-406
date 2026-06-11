import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useDocs } from "../../hooks/useDocs";
import { useWorkspaces } from "../../hooks/useWorkspace";

export const Route = createFileRoute("/docs/new")({
  component: NewDocPage,
});

function NewDocPage() {
  const { createDoc } = useDocs();
  const { activeWorkspace } = useWorkspaces();
  const navigate = useNavigate();

  useEffect(() => {
    async function init() {
      if (!activeWorkspace) {
        navigate({ to: "/signin" });
        return;
      }
      try {
        const doc = await createDoc("Untitled Document");
        navigate({ to: `/docs/${doc.id}`, replace: true });
      } catch (e) {
        console.error("Failed to create doc", e);
      }
    }
    init();
  }, [activeWorkspace]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse text-slate-500 font-medium">Creating new document...</div>
    </div>
  );
}
