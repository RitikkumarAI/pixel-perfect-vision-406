import { useState } from 'react';
import { useAuth } from './useAuth';

export function useAI() {
  const { token, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSubtasks = async (taskId: string, context: string, providerName?: string) => {
    if (!isAuthenticated) throw new Error('Must be authenticated');
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/ai/generate-subtasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskId, context, providerName })
      });
      if (!res.ok) throw new Error('Failed to generate subtasks');
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const assistWriting = async (prompt: string, context: string, providerName?: string) => {
    if (!isAuthenticated) throw new Error('Must be authenticated');
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/ai/assist-writing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, context, providerName })
      });
      if (!res.ok) throw new Error('Failed to run AI assistance');
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { generateSubtasks, assistWriting, isLoading, error };
}
