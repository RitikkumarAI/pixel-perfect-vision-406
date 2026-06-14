import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export function useVideo() {
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const getRecordings = useQuery({
    queryKey: ['recordings'],
    queryFn: async () => {
      const res = await fetch(`/api/v1/recordings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch recordings');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const getRecording = (id: string) => useQuery({
    queryKey: ['recordings', id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/recordings/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch recording');
      return res.json();
    },
    enabled: isAuthenticated && !!id,
  });

  const startRecording = useMutation({
    mutationFn: async (data: { title: string, description: string }) => {
      const res = await fetch(`/api/v1/recordings/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to initialize recording');
      return res.json();
    }
  });

  const uploadComplete = useMutation({
    mutationFn: async (recordingId: string) => {
      const res = await fetch(`/api/v1/recordings/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recordingId })
      });
      if (!res.ok) throw new Error('Failed to complete upload');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recordings'] })
  });

  const addComment = useMutation({
    mutationFn: async ({ id, content, timestamp }: { id: string, content: string, timestamp: number }) => {
      const res = await fetch(`/api/v1/recordings/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, timestamp })
      });
      if (!res.ok) throw new Error('Failed to add comment');
      return res.json();
    },
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['recordings', variables.id] })
  });

  return {
    recordings: getRecordings.data || [],
    isLoadingRecordings: getRecordings.isLoading,
    getRecording,
    startRecording: startRecording.mutateAsync,
    uploadComplete: uploadComplete.mutateAsync,
    addComment: addComment.mutateAsync
  };
}
