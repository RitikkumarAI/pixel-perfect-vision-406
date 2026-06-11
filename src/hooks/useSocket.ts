import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

let socketInstance: Socket | null = null;

export function useSocket(channelId?: string) {
  const { token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    if (!socketInstance) {
      socketInstance = io('http://localhost:3000', {
        auth: { token },
        transports: ['websocket'],
      });

      socketInstance.on('connect', () => setIsConnected(true));
      socketInstance.on('disconnect', () => setIsConnected(false));
    }

    const socket = socketInstance;

    if (channelId) {
      socket.emit('joinChannel', channelId);
      
      const handleMessage = (msg: any) => {
        if (msg.channelId === channelId) {
          setMessages(prev => [...prev, msg]);
        }
      };

      socket.on('receiveMessage', handleMessage);

      return () => {
        socket.emit('leaveChannel', channelId);
        socket.off('receiveMessage', handleMessage);
      };
    }
  }, [token, isAuthenticated, channelId]);

  const sendMessage = (content: string, cId: string) => {
    if (socketInstance && isConnected) {
      socketInstance.emit('sendMessage', { channelId: cId, content });
    }
  };

  return { isConnected, messages, sendMessage };
}
