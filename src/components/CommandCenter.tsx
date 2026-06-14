import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, Sparkles, Calendar, CheckSquare, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CommandCenter() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

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
    setIsProcessing(true);
    // Simulate AI Semantic Router parsing intent
    // e.g., "Schedule meeting with sales team" -> AI returns structured JSON tool call
    setTimeout(() => {
      setIsProcessing(false);
      setAiResponse(`Executed: Action dispatched to Autonomous Engine. Working on: "${text}"`);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {open && (
        <Command.Dialog
          open={open}
          onOpenChange={setOpen}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center px-4 border-b border-zinc-800">
              <Sparkles className="w-5 h-5 text-indigo-400 mr-3" />
              <Command.Input 
                autoFocus 
                value={query}
                onValueChange={setQuery}
                placeholder="Ask Nexus to do anything..." 
                className="w-full py-5 bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-500 text-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCommandExecution(query);
                  }
                }}
              />
            </div>

            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-zinc-500">
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200" />
                  </div>
                ) : (
                  aiResponse ? (
                    <div className="text-emerald-400 font-medium px-4">{aiResponse}</div>
                  ) : (
                    "Press enter to execute via AI..."
                  )
                )}
              </Command.Empty>

              {!query && (
                <Command.Group heading="Suggested Actions" className="text-xs font-medium text-zinc-500 px-2 py-3">
                  <Command.Item className="flex items-center px-3 py-3 rounded-lg hover:bg-zinc-800 cursor-pointer text-zinc-200" onSelect={() => setQuery('Schedule meeting with sales team')}>
                    <Calendar className="w-4 h-4 mr-3 text-blue-400" /> Schedule meeting with sales team
                  </Command.Item>
                  <Command.Item className="flex items-center px-3 py-3 rounded-lg hover:bg-zinc-800 cursor-pointer text-zinc-200" onSelect={() => setQuery('Find all overdue tasks')}>
                    <CheckSquare className="w-4 h-4 mr-3 text-rose-400" /> Find all overdue tasks
                  </Command.Item>
                  <Command.Item className="flex items-center px-3 py-3 rounded-lg hover:bg-zinc-800 cursor-pointer text-zinc-200" onSelect={() => setQuery('Summarize last month\'s meetings')}>
                    <FileText className="w-4 h-4 mr-3 text-amber-400" /> Summarize last month's meetings
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
