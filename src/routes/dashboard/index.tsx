import { createFileRoute } from "@tanstack/react-router";
import { useWorkspaces } from "../../hooks/useWorkspace";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { activeWorkspace, isLoading } = useWorkspaces();

  if (isLoading) {
    return <div>Loading workspace...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Welcome to {activeWorkspace?.name || 'Your Workspace'}</h1>
      <p className="text-muted-foreground">Select an app from the sidebar to get started.</p>
    </div>
  );
}
