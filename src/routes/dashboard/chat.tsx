import { createFileRoute } from "@tanstack/react-router";
import { useSocket } from "../../hooks/useSocket";
import { useChat } from "../../hooks/useChat";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/dashboard/chat")({
  component: ChatRoute,
});

function ChatRoute() {
  const { channels, isLoadingChannels, createChannel, sendMessage, getMessages } = useChat();
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  // Set default channel
  useEffect(() => {
    if (channels.length > 0 && !activeChannelId) {
      setActiveChannelId(channels[0].id);
    }
  }, [channels, activeChannelId]);

  const { isConnected, messages: liveMessages } = useSocket(activeChannelId || "general");
  const { data: historicalMessages, isLoading: messagesLoading } = getMessages(
    activeChannelId || "",
  );

  const [input, setInput] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);

  // Combine and deduplicate messages
  const allMessages = [...(historicalMessages || []), ...liveMessages]
    .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
    .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const activeChannel = channels.find((c: any) => c.id === activeChannelId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && activeChannelId) {
      await sendMessage({ channelId: activeChannelId, content: input });
      setInput("");
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newChannelName.trim()) {
      const channel = await createChannel({ name: newChannelName, isPrivate: false });
      setActiveChannelId(channel.id);
      setNewChannelName("");
      setIsCreatingChannel(false);
    }
  };

  return (
    <div className="flex h-full gap-6">
      {/* Channels Sidebar */}
      <div className="w-64 bg-slate-50 border border-slate-200 rounded-xl flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <h2 className="font-semibold text-slate-800">Channels</h2>
          <button
            onClick={() => setIsCreatingChannel(!isCreatingChannel)}
            className="text-xl text-slate-500 hover:text-slate-800"
          >
            +
          </button>
        </div>

        {isCreatingChannel && (
          <form onSubmit={handleCreateChannel} className="p-3 border-b border-slate-200 bg-white">
            <Input
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="Channel name"
              className="mb-2 text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingChannel(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="flex-1">
                Create
              </Button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingChannels ? (
            <div className="p-4 text-center text-slate-500 text-sm">Loading...</div>
          ) : channels.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">No channels</div>
          ) : (
            channels.map((channel: any) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannelId(channel.id)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition truncate font-medium ${activeChannelId === channel.id ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-100 text-slate-700"}`}
              >
                # {channel.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">
            # {activeChannel?.name || "Select a channel"}
          </h2>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"}`}
            ></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {!activeChannelId ? (
              <div className="text-center text-slate-500 mt-20">
                Select a channel to start chatting.
              </div>
            ) : messagesLoading ? (
              <div className="text-center text-slate-500 mt-20">Loading messages...</div>
            ) : allMessages.length === 0 ? (
              <div className="text-center text-slate-500 mt-20">No messages yet. Be the first!</div>
            ) : (
              allMessages.map((msg: any) => (
                <div key={msg.id} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-800">
                        {msg.senderId || "User"}
                      </span>
                      {msg.createdAt && (
                        <span className="text-xs text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-sm text-slate-800 inline-block border border-slate-100 shadow-sm text-sm">
                      <p>{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <form
          onSubmit={handleSend}
          className="p-4 border-t border-slate-200 flex gap-3 bg-slate-50"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={activeChannel ? `Message # ${activeChannel.name}` : "Select a channel..."}
            disabled={!activeChannelId}
            className="flex-1 bg-white"
          />
          <Button
            type="submit"
            disabled={!isConnected || !activeChannelId || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
