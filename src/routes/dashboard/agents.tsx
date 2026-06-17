import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";

import { useAgents } from "../../hooks/useAgents";
import { Bot, Terminal, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/dashboard/agents")({
  component: AgentsPage,
});

function AgentsPage() {
  const { agents, runAgent, isRunning, getHistory } = useAgents();
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: runHistory } = getHistory(activeRunId || "");

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [runHistory]);

  // Set default agent
  useEffect(() => {
    if (!activeAgentId && agents.length > 0) {
      setActiveAgentId(agents[0].id);
    }
  }, [agents, activeAgentId]);

  const activeAgent = agents.find((a: any) => a.id === activeAgentId);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeAgentId) return;

    try {
      const result = await runAgent({ agentId: activeAgentId, input });
      setActiveRunId(result.runId);
      setInput("");
    } catch (e) {
      toast.error("Failed to run agent");
    }
  };

  return (
    <div className="flex h-full gap-6">
        
        {/* Sidebar: Agent Registry */}
        <div className="w-80 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm shrink-0">
          <div className="p-5 border-b border-slate-200 font-bold tracking-tight text-lg flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            AI Agents Platform
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {agents.map((agent: any) => (
              <button
                key={agent.id}
                onClick={() => {
                  setActiveAgentId(agent.id);
                  setActiveRunId(null);
                }}
                className={`w-full text-left p-4 rounded-xl transition border ${activeAgentId === agent.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
              >
                <div className="font-semibold text-slate-800 mb-1">{agent.name}</div>
                <div className="text-xs text-slate-500 line-clamp-2 mb-3">{agent.description}</div>
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.slice(0, 2).map((cap: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-[10px] font-medium text-slate-600 rounded-full">
                      {cap}
                    </span>
                  ))}
                  {agent.capabilities.length > 2 && <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-medium text-slate-600 rounded-full">+{agent.capabilities.length - 2}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Console Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          {activeAgent ? (
            <>
              {/* Header */}
              <div className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 leading-tight">{activeAgent.name}</h2>
                    <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Standing By</p>
                  </div>
                </div>
              </div>

              {/* Console Output */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                {!activeRunId ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 max-w-md mx-auto text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-2">
                      <Terminal className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700">Ready for commands</h3>
                    <p className="text-sm">Describe what you need the <strong>{activeAgent.name}</strong> to do, and it will execute autonomously using your workspace tools.</p>
                  </div>
                ) : (
                  <div className="space-y-6 max-w-3xl mx-auto w-full">
                    {runHistory?.logs?.map((log: any) => (
                      <div key={log.id} className="flex gap-4">
                        <div className="mt-1">
                          {log.level === 'INFO' && <Terminal className="w-4 h-4 text-slate-400" />}
                          {log.level === 'THOUGHT' && <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
                          {log.level === 'ACTION' && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                          {log.level === 'ERROR' && <AlertCircle className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-sm">
                          <span className="font-semibold text-xs tracking-wider uppercase text-slate-400 mb-1 block">{log.level}</span>
                          <span className="text-slate-700 font-mono leading-relaxed">{log.message}</span>
                        </div>
                      </div>
                    ))}

                    {runHistory?.status === 'COMPLETED' && (
                      <div className="flex gap-4">
                        <div className="mt-1">
                          <Bot className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-5 shadow-sm">
                          <h4 className="font-semibold text-green-800 mb-2">Final Output</h4>
                          <div className="prose prose-sm prose-green max-w-none text-green-900">
                            {runHistory.result}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {runHistory?.status === 'FAILED' && (
                      <div className="flex gap-4">
                        <div className="mt-1">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm text-red-900">
                          <h4 className="font-semibold text-red-800 mb-2">Execution Failed</h4>
                          {runHistory.error}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* Command Input Area */}
              <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleRun} className="relative flex items-center">
                  <div className="absolute left-4 w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isRunning || (runHistory && runHistory.status === 'RUNNING')}
                    placeholder={`Instruct the ${activeAgent.name}...`}
                    className="w-full pl-10 pr-14 py-4 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-navy font-medium placeholder:font-normal transition disabled:opacity-60"
                  />
                  <button 
                    type="submit" 
                    disabled={!input.trim() || isRunning || (runHistory && runHistory.status === 'RUNNING')}
                    className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                  >
                    {isRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              </div>
            </>
          ) : null}
        </div>
    </div>
  );
}
