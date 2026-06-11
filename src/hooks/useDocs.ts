import { useState } from 'react';
import { useAuth } from './useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Document {
  id: string;
  title: string;
  content: any;
  workspaceId: string;
}

export function useDocs(workspaceId?: string) {
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['docs', workspaceId],
    queryFn: async (): Promise<Document[]> => {
      if (!workspaceId) return [];
      const res = await fetch(`/api/v1/documents/workspaces/${workspaceId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch documents');
      return res.json();
    },
    enabled: isAuthenticated && !!workspaceId,
  });

  const createDoc = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch('/api/v1/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, workspaceId, content: { type: "doc", content: [] } })
      });
      if (!res.ok) throw new Error('Failed to create document');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docs', workspaceId] });
    }
  });

  const updateDoc = useMutation({
    mutationFn: async ({ id, content }: { id: string, content: any }) => {
      const res = await fetch(`/api/v1/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error('Failed to update document');
      return res.json();
    }
  });

  return {
    docs: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createDoc: createDoc.mutateAsync,
    updateDoc: updateDoc.mutateAsync
  };
}

export function useDoc(docId: string) {
  const { token, isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: ['doc', docId],
    queryFn: async (): Promise<Document> => {
      const res = await fetch(`/api/v1/documents/${docId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch document');
      return res.json();
    },
    enabled: isAuthenticated && !!docId,
  });

  return {
    doc: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
