import { createFileRoute } from "@tanstack/react-router";
import { useSocket } from "../../hooks/useSocket";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/dashboard/chat")({
  component: ChatRoute,
});

function ChatRoute() {
  const { isConnected, messages, sendMessage } = useSocket("general");
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input, "general");
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold">General Channel</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-slate-500">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">No messages yet.</div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="bg-slate-100 p-3 rounded-lg max-w-md">
                <p>{msg.content}</p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-200 flex gap-2">
        <Input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type a message..." 
          className="flex-1"
        />
        <Button type="submit" disabled={!isConnected}>Send</Button>
      </form>
    </div>
  );
}
