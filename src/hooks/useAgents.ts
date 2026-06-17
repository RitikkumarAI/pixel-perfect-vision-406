import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useWorkspaces } from "./useWorkspace";

export function useAgents() {
  const { token, isAuthenticated } = useAuth();
  const { activeWorkspace } = useWorkspaces();
  const queryClient = useQueryClient();

  const getAgents = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await fetch(`/api/v1/agents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch agents");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const getHistory = (runId: string) =>
    useQuery({
      queryKey: ["agentHistory", runId],
      queryFn: async () => {
        if (!runId) return null;
        const res = await fetch(`/api/v1/agents/${runId}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch agent history");
        return res.json();
      },
      enabled: isAuthenticated && !!runId,
      refetchInterval: (data: any) =>
        ["QUEUED", "IN_PROGRESS", "RUNNING"].includes(data?.status) ? 2000 : false,
    });

  const runAgent = useMutation({
    mutationFn: async ({ agentId, input }: { agentId: string; input: string }) => {
      if (!activeWorkspace) throw new Error("No active workspace");
      const res = await fetch(`/api/v1/agents/run`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agentId, workspaceId: activeWorkspace.id, input }),
      });
      if (!res.ok) throw new Error("Failed to run agent");
      return res.json();
    },
  });

  return {
    agents: getAgents.data || [],
    isLoadingAgents: getAgents.isLoading,
    getHistory,
    runAgent: runAgent.mutateAsync,
    isRunning: runAgent.isPending,
  };
}
