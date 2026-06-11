import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export function useWorkspaces() {
  const { token, isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: ['workspaces'],
    queryFn: async (): Promise<Workspace[]> => {
      const res = await fetch('/api/v1/workspaces', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch workspaces');
      return res.json();
    },
    enabled: isAuthenticated, // Only fetch if user is logged in
  });

  return {
    workspaces: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    activeWorkspace: query.data?.[0] || null // Default to first for MVP
  };
}
