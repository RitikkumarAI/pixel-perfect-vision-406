import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/docs")({
  component: DocsRoute,
});

function DocsRoute() {
  return (
    <div className="h-full bg-white rounded-lg border border-slate-200 p-8">
      <h1 className="text-3xl font-bold mb-8 outline-none" contentEditable suppressContentEditableWarning>
        Untitled Document
      </h1>
      <div className="prose max-w-none outline-none min-h-[500px]" contentEditable suppressContentEditableWarning>
        <p className="text-slate-400">Start typing here...</p>
      </div>
    </div>
  );
}
