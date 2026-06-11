import { useState } from 'react';
import { useAuth } from './useAuth';

export function useMeeting() {
  const { token, isAuthenticated } = useAuth();
  const [meetingToken, setMeetingToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinMeeting = async (meetingId: string) => {
    if (!isAuthenticated) {
      setError('Must be logged in to join a meeting');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/meetings/token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ meetingId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get meeting token');

      setMeetingToken(data.token);
      window.location.href = `/meet/${meetingId}`; // Navigate to the meeting room
      return data.token;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const leaveMeeting = () => {
    setMeetingToken(null);
  };

  const createMeeting = async (title: string) => {
    if (!isAuthenticated) {
      window.location.href = "/signin";
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/meetings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create meeting');
      
      // Automatically join the meeting after creation
      await joinMeeting(data.meeting.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { meetingToken, isLoading, error, joinMeeting, leaveMeeting, createMeeting };
}
