import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useWorkspaces } from './useWorkspace';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  assigneeId?: string;
}

export function useTasks() {
  const { token, isAuthenticated } = useAuth();
  const { activeWorkspace } = useWorkspaces();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tasks', activeWorkspace?.id],
    queryFn: async (): Promise<Task[]> => {
      if (!activeWorkspace) return [];
      const res = await fetch(`/api/v1/tasks/workspaces/${activeWorkspace.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
    enabled: isAuthenticated && !!activeWorkspace,
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const res = await fetch(`/api/v1/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeWorkspace?.id] });
    }
  });

  const createTask = useMutation({
    mutationFn: async ({ title, description }: { title: string; description?: string }) => {
      if (!activeWorkspace) throw new Error('No active workspace');
      const res = await fetch(`/api/v1/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, description, status: 'TODO', workspaceId: activeWorkspace.id })
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', activeWorkspace?.id] });
    }
  });

  return {
    tasks: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    updateTaskStatus: updateTaskStatus.mutate,
    createTask: createTask.mutateAsync
  };
}
