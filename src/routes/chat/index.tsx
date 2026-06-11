import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useChat } from "../../hooks/useChat";
import { useSocket } from "../../hooks/useSocket";
import { useAuth } from "../../hooks/useAuth";
import { Hash, Lock, Send, Paperclip, Smile, MoreHorizontal, User } from "lucide-react";

export const Route = createFileRoute("/chat/")({
  component: ChatPage,
});

function ChatPage() {
  const { user } = useAuth();
  const { channels, isLoadingChannels, getMessages, sendMessage, createChannel } = useChat();
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: initialMessages } = getMessages(activeChannelId || "");
  const { isConnected, messages: socketMessages, typingUsers, onlineUsers, emitTyping, setMessages } = useSocket(activeChannelId || undefined);

  // Merge initial REST messages and real-time Socket messages
  const [allMessages, setAllMessages] = useState<any[]>([]);

  useEffect(() => {
    if (initialMessages) {
      setAllMessages([...initialMessages].reverse());
    }
  }, [initialMessages]);

  useEffect(() => {
    if (socketMessages.length > 0) {
      // Append only new messages not in initial to prevent dupes, for MVP simplicity we just push
      const newMsgs = socketMessages.filter(sm => !allMessages.some(am => am.id === sm.id));
      if (newMsgs.length > 0) {
        setAllMessages(prev => [...prev, ...newMsgs]);
      }
    }
  }, [socketMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMessages, typingUsers]);

  const activeChannel = channels.find((c: any) => c.id === activeChannelId);
  const typingInChannel = typingUsers[activeChannelId || ""] || [];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChannelId) return;
    
    emitTyping(activeChannelId, false);
    
    // Parse Mentions natively here, for now just simple save
    try {
      await sendMessage({ channelId: activeChannelId, content: input });
      setInput("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (activeChannelId) {
      emitTyping(activeChannelId, e.target.value.length > 0);
    }
  };

  // Set default channel
  useEffect(() => {
    if (!activeChannelId && channels.length > 0) {
      setActiveChannelId(channels[0].id);
    }
  }, [channels, activeChannelId]);

  return (
    <div className="min-h-screen bg-white text-navy flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[1400px] mx-auto w-full flex pt-24 pb-8 px-6 gap-6 h-[90vh]">
        
        {/* Sidebar */}
        <div className="w-64 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 font-bold tracking-tight">Team Chat</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Channels */}
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Channels</div>
              <div className="space-y-1">
                {channels.filter((c: any) => !c.isPrivate).map((c: any) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveChannelId(c.id)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeChannelId === c.id ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-200 text-slate-700'}`}
                  >
                    <Hash className="w-4 h-4 opacity-50" /> {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Messages */}
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                <span>Direct Messages</span>
              </div>
              <div className="space-y-1">
                {channels.filter((c: any) => c.isPrivate).map((c: any) => {
                  const otherMember = c.members?.find((m: any) => m.userId !== user?.id)?.user;
                  const isOnline = otherMember ? onlineUsers.has(otherMember.id) : false;
                  
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveChannelId(c.id)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeChannelId === c.id ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-200 text-slate-700'}`}
                    >
                      <div className="relative">
                        <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center overflow-hidden">
                          {otherMember?.avatarUrl ? <img src={otherMember.avatarUrl} alt="" className="w-full h-full object-cover"/> : <User className="w-3 h-3 text-slate-600" />}
                        </div>
                        {isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></div>}
                      </div>
                      <span className="truncate">{otherMember?.name || "Unknown User"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          {activeChannel ? (
            <>
              {/* Header */}
              <div className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2 font-bold text-lg">
                  {activeChannel.isPrivate ? <Lock className="w-5 h-5 text-slate-400" /> : <Hash className="w-5 h-5 text-slate-400" />}
                  {activeChannel.isPrivate ? 
                    activeChannel.members?.find((m: any) => m.userId !== user?.id)?.user?.name 
                    : activeChannel.name}
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    {isConnected ? 'Real-time Active' : 'Connecting...'}
                  </span>
                </div>
              </div>

              {/* Message Scroll Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                {allMessages.map((msg: any) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-sm">{msg.sender?.name || 'User'}</span>
                        <span className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className={`px-4 py-2.5 rounded-2xl max-w-xl text-[15px] leading-relaxed shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 text-navy rounded-bl-none'}`}>
                        {msg.content}
                        
                        {/* Attachments rendering */}
                        {msg.attachments?.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {msg.attachments.map((att: any) => (
                              <div key={att.id} className={`flex items-center gap-2 p-2 rounded-lg border ${isMe ? 'border-indigo-500 bg-indigo-700' : 'border-slate-200 bg-white'}`}>
                                <Paperclip className="w-4 h-4 opacity-70" />
                                <a href={att.url} target="_blank" className="text-sm underline font-medium truncate max-w-[200px]">{att.filename}</a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {typingInChannel.length > 0 && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm italic">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                    </div>
                    Someone is typing...
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSend} className="relative flex items-center">
                  <button type="button" className="absolute left-3 text-slate-400 hover:text-indigo-600 transition">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={handleTyping}
                    onBlur={() => emitTyping(activeChannelId, false)}
                    placeholder={`Message ${activeChannel.name}...`}
                    className="w-full pl-11 pr-12 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-navy"
                  />
                  <button 
                    type="submit" 
                    disabled={!input.trim()}
                    className="absolute right-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              Select a channel or DM to start chatting
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
