import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, Sparkles, Calendar, CheckSquare, FileText, Bot, Loader2, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useWorkspaces } from '../hooks/useWorkspace';
import { useAgents } from '../hooks/useAgents';

export function CommandCenter() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const { token, isAuthenticated } = useAuth();
  const { activeWorkspace } = useWorkspaces();
  const { runAgent } = useAgents();

  // Toggle Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleCommandExecution = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setAiResponse(null);
    setSearchResults([]);

    try {
      // If it looks like an action, trigger Agent Execution
      const isAction = text.toLowerCase().includes('schedule') || 
                       text.toLowerCase().includes('create') || 
                       text.toLowerCase().includes('run') || 
                       text.toLowerCase().includes('pm') ||
                       text.toLowerCase().includes('agent');

      if (isAction && activeWorkspace) {
        setAiResponse(`Invoking AI Agent in workspace "${activeWorkspace.name}"...`);
        const res = await runAgent({ 
          agentId: 'project-manager', 
          input: text 
        });
        setAiResponse(`Agent completed run. Result: ${res.result}`);
      } else if (activeWorkspace) {
        // Query Semantic Vector Search
        const res = await fetch(`/api/v1/search/semantic/workspaces/${activeWorkspace.id}?q=${encodeURIComponent(text)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          if (data.length === 0) {
            setAiResponse("No semantic search results found.");
          }
        } else {
          setAiResponse("Semantic search request failed.");
        }
      }
    } catch (err: any) {
      setAiResponse(`Error: ${err.message || 'Failed to execute command'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Command.Dialog
          open={open}
          onOpenChange={setOpen}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/75 backdrop-blur-md"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-zinc-900 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden shadow-indigo-500/10"
          >
            <div className="flex items-center px-4 border-b border-zinc-850 bg-zinc-950/50">
              <Sparkles className="w-5 h-5 text-indigo-400 mr-3 animate-pulse" />
              <Command.Input 
                autoFocus 
                value={query}
                onValueChange={setQuery}
                placeholder="Ask AI agent to schedule, create task or do semantic search..." 
                className="w-full py-5 bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-500 text-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCommandExecution(query);
                  }
                }}
              />
            </div>

            <Command.List className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
              <Command.Empty className="py-6 text-center text-zinc-500">
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    <span className="text-zinc-400 text-sm">Processing request through AI gateway...</span>
                  </div>
                ) : (
                  aiResponse ? (
                    <div className="bg-zinc-850 p-4 rounded-xl border border-zinc-800 text-indigo-300 text-sm text-left font-mono whitespace-pre-wrap">
                      {aiResponse}
                    </div>
                  ) : (
                    <span className="text-sm">Press <kbd className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs text-zinc-300">Enter</kbd> to run query or execute command</span>
                  )
                )}
              </Command.Empty>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider px-2">Semantic Search Matches</h3>
                  <div className="space-y-2">
                    {searchResults.map((item) => (
                      <div key={item.id} className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl hover:border-indigo-500/20 transition flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-950/50 text-indigo-400 flex items-center justify-center shrink-0">
                          {item.sourceType === 'Document' ? <FileText className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{item.sourceType} • Match {Math.round(item.similarity * 100)}%</span>
                          <p className="text-sm text-zinc-200 mt-0.5">{item.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!query && !isProcessing && !aiResponse && (
                <Command.Group heading="AI Agent Actions" className="text-xs font-bold text-indigo-400 uppercase tracking-wider px-2">
                  <Command.Item className="flex items-center px-3 py-3 rounded-xl hover:bg-zinc-850 cursor-pointer text-zinc-300 mt-2" onSelect={() => setQuery('Create task "Audit security tokens" with description "Verify keys"')}>
                    <CheckSquare className="w-4 h-4 mr-3 text-rose-400" /> Create task "Audit security tokens"
                  </Command.Item>
                  <Command.Item className="flex items-center px-3 py-3 rounded-xl hover:bg-zinc-850 cursor-pointer text-zinc-300" onSelect={() => setQuery('Find availability for scheduler')}>
                    <Calendar className="w-4 h-4 mr-3 text-emerald-400" /> Find availability for scheduler
                  </Command.Item>
                  <Command.Item className="flex items-center px-3 py-3 rounded-xl hover:bg-zinc-850 cursor-pointer text-zinc-300" onSelect={() => setQuery('Search workspace messages for database config')}>
                    <Search className="w-4 h-4 mr-3 text-amber-400" /> Search messages for database config
                  </Command.Item>
                </Command.Group>
              )}
            </Command.List>
          </motion.div>
        </Command.Dialog>
      )}
    </AnimatePresence>
  );
}
