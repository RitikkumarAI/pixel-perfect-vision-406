import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

let socketInstance: Socket | null = null;

export function useSocket(channelId?: string) {
  const { token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    if (!socketInstance) {
      socketInstance = io("http://localhost:3000", {
        auth: { token },
        transports: ["websocket"],
      });

      socketInstance.on("connect", () => setIsConnected(true));
      socketInstance.on("disconnect", () => setIsConnected(false));
    }

    const socket = socketInstance;

    // Presence handlers
    const handleOnline = ({ userId }: { userId: string }) =>
      setOnlineUsers((prev) => new Set(prev).add(userId));
    const handleOffline = ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    socket.on("presence:online", handleOnline);
    socket.on("presence:offline", handleOffline);

    // Global typing handlers
    const handleTypingStart = ({ userId, channelId }: { userId: string; channelId: string }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [channelId]: Array.from(new Set([...(prev[channelId] || []), userId])),
      }));
    };

    const handleTypingStop = ({ userId, channelId }: { userId: string; channelId: string }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [channelId]: (prev[channelId] || []).filter((id) => id !== userId),
      }));
    };

    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    if (channelId) {
      socket.emit("joinChannel", channelId);

      const handleMessage = (msg: any) => {
        if (msg.channelId === channelId) {
          setMessages((prev) => [...prev, msg]);
        }
      };

      const handleReply = (msg: any) => {
        // If we want to show replies globally or in a thread view
        if (msg.channelId === channelId) {
          // Just broadcast it into the global state, the UI will filter by parentId
          setMessages((prev) => [...prev, msg]);
        }
      };

      socket.on("message:new", handleMessage);
      socket.on("message:reply", handleReply);

      return () => {
        socket.emit("leaveChannel", channelId);
        socket.off("message:new", handleMessage);
        socket.off("message:reply", handleReply);
        socket.off("presence:online", handleOnline);
        socket.off("presence:offline", handleOffline);
        socket.off("typing:start", handleTypingStart);
        socket.off("typing:stop", handleTypingStop);
      };
    }

    return () => {
      socket.off("presence:online", handleOnline);
      socket.off("presence:offline", handleOffline);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [token, isAuthenticated, channelId]);

  const sendMessage = (content: string, cId: string, parentId?: string, attachments?: any[]) => {
    // Rely on REST for sending complex messages with attachments to ensure DB persistence
  };

  const emitTyping = (cId: string, isTyping: boolean) => {
    if (socketInstance && isConnected) {
      socketInstance.emit(isTyping ? "typing:start" : "typing:stop", cId);
    }
  };

  return { isConnected, messages, typingUsers, onlineUsers, emitTyping, setMessages };
}
