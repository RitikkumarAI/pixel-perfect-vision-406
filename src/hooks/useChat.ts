import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useWorkspaces } from './useWorkspace';

export function useChat() {
  const { token, isAuthenticated } = useAuth();
  const { activeWorkspace } = useWorkspaces();
  const queryClient = useQueryClient();

  const channelsQuery = useQuery({
    queryKey: ['channels', activeWorkspace?.id],
    queryFn: async () => {
      if (!activeWorkspace) return [];
      const res = await fetch(`/api/v1/chat/workspaces/${activeWorkspace.id}/channels`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch channels');
      return res.json();
    },
    enabled: isAuthenticated && !!activeWorkspace,
  });

  const getMessages = (channelId: string) => useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      if (!channelId) return [];
      const res = await fetch(`/api/v1/chat/channels/${channelId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: isAuthenticated && !!channelId,
  });

  const sendMessage = useMutation({
    mutationFn: async ({ channelId, content, parentId, attachments }: any) => {
      const res = await fetch(`/api/v1/chat/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content, parentId, attachments })
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    }
  });

  const createChannel = useMutation({
    mutationFn: async ({ name, isPrivate }: any) => {
      const res = await fetch(`/api/v1/chat/workspaces/${activeWorkspace?.id}/channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, isPrivate })
      });
      if (!res.ok) throw new Error('Failed to create channel');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['channels'] })
  });

  const toggleReaction = useMutation({
    mutationFn: async ({ messageId, emoji }: any) => {
      const res = await fetch(`/api/v1/chat/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emoji })
      });
      return res.json();
    }
  });

  return {
    channels: channelsQuery.data || [],
    isLoadingChannels: channelsQuery.isLoading,
    getMessages,
    sendMessage: sendMessage.mutateAsync,
    createChannel: createChannel.mutateAsync,
    toggleReaction: toggleReaction.mutateAsync
  };
}
