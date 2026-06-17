import { createFileRoute, Link } from "@tanstack/react-router";
import { useWorkspaces } from "../../hooks/useWorkspace";
import { useTasks } from "../../hooks/useTasks";
import { useScheduling } from "../../hooks/useScheduling";
import { useAgents } from "../../hooks/useAgents";
import { useState, useEffect } from "react";
import { 
  Bot, Calendar, CheckSquare, MessageSquare, Play, Video, 
  ArrowRight, Loader2, Sparkles, Activity, ShieldCheck, 
  Cpu, HardDrive, Zap, TrendingUp, HelpCircle, AlertCircle
} from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

// Mock details for high-fidelity AI OS look
const MOCK_AGENT_LOGS = [
  { id: 1, agent: "Project Manager Agent", action: "analyzed workspace tasks", time: "2m ago", status: "success", detail: "Scanned 8 open tasks and identified 3 blocking items" },
  { id: 2, agent: "Meeting Summarizer", action: "indexed meeting transcript", time: "12m ago", status: "success", detail: "Parsed transcript from 'Omega.3 Alignment' & extracted 4 action items" },
  { id: 3, agent: "Autonomous Task Generator", action: "created task autonomously", time: "25m ago", status: "success", detail: "Generated task 'Fix Stripe webhook verification' with HIGH priority" },
  { id: 4, agent: "Scheduling Agent", action: "resolved calendar conflict", time: "1h ago", status: "info", detail: "Rescheduled meeting for 'Audit User' to next Tuesday" },
  { id: 5, agent: "Security Watchdog", action: "scanned credentials", time: "2h ago", status: "success", detail: "Verified MFA configurations. 0 vulnerabilities found." },
];

const MOCK_MEETING_OUTCOMES = [
  { 
    id: "m1", 
    title: "Phase Omega.3 Release Blockers", 
    date: "Today, 4:15 PM", 
    duration: "24m", 
    sentiment: "POSITIVE", 
    summary: "The team resolved the infinite redirect loop in LiveKit room, implemented rawBody Stripe verification, and added a semantic search endpoint using OpenAI embeddings API.",
    outcomes: ["LiveKit redirect loop fixed", "OpenAI mock key fallbacks active", "Webhook verify fixed"]
  },
  { 
    id: "m2", 
    title: "Billing & Subscriptions Sync", 
    date: "Yesterday", 
    duration: "15m", 
    sentiment: "NEUTRAL", 
    summary: "Aligned on providing fallback checkouts for the Free Tier, verified Stripe cancel subscription endpoint behavior, and confirmed DB state synchronization.",
    outcomes: ["Stripe webhook tested successfully", "Exposed billing cancel button in UI"]
  }
];

function DashboardHome() {
  const { activeWorkspace, isLoading: wsLoading } = useWorkspaces();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { bookings, isLoading: bookingsLoading } = useScheduling();
  const { agents } = useAgents();

  const [simulatedLoad, setSimulatedLoad] = useState(78);
  const [latency, setLatency] = useState(14);
  const [pulseState, setPulseState] = useState("Idle");

  // Telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedLoad(Math.floor(Math.random() * 15) + 70); // 70-85%
      setLatency(Math.floor(Math.random() * 5) + 12); // 12-17ms
      
      const states = ["Scanning", "Processing", "Thinking", "Idle"];
      setPulseState(states[Math.floor(Math.random() * states.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (wsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
          <span className="text-zinc-400 font-mono text-sm tracking-widest">BOOTING NEXUS OS...</span>
        </div>
      </div>
    );
  }

  const activeTasks = tasks?.filter((t: any) => t.status !== 'DONE').slice(0, 4) || [];
  const upcomingBookings = bookings?.slice(0, 3) || [];

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-100 p-8 rounded-2xl border border-zinc-900 overflow-y-auto selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Futuristic Dashboard Header */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase font-mono">NEXUS OPERATING SYSTEM ONLINE</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white font-display">
                Welcome back, Agent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">Team {activeWorkspace?.name || 'Workspace'}</span>
              </h1>
              <p className="text-zinc-400 mt-2 text-sm max-w-xl">
                The Autonomous AI Work Engine has been running active telemetry, scanning transcripts, and optimizing productivity tasks in the background.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Link to="/dashboard/meetings" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600/90 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 hover:scale-[1.02] active:scale-[0.98] transition font-medium border border-indigo-400/20">
                <Video className="w-4 h-4" /> Start Instant Session
              </Link>
            </div>
          </div>
        </div>

        {/* Workspace Intelligence Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 hover:border-indigo-500/20 transition-all group">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold font-mono tracking-widest text-zinc-500 uppercase">AI ENGINE STATE</span>
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">{pulseState}</span>
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">Active thread: ProjectManager.engine</p>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 hover:border-emerald-500/20 transition-all group">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold font-mono tracking-widest text-zinc-500 uppercase">AUTONOMOUS RATIO</span>
              <Cpu className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">{simulatedLoad}%</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">+{Math.floor(Math.random() * 3) + 1}%</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">Tasks generated by AI agents autonomously</p>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 hover:border-purple-500/20 transition-all group">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold font-mono tracking-widest text-zinc-500 uppercase">SYS METRIC / ROUNDTRIP</span>
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">{latency} ms</span>
              <span className="text-[10px] text-zinc-400 font-mono">100% SLA</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">LiveKit & API socket link latency</p>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-5 hover:border-amber-500/20 transition-all group">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold font-mono tracking-widest text-zinc-500 uppercase">ROI VALUE GENERATED</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">$412.50</span>
              <span className="text-xs font-mono font-bold text-amber-400">12,500 tokens</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">Token savings vs manual data ingestion</p>
          </div>

        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Col 1 & 2: Main Activity & Feed */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Autonomous Task Generation Visibility */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400 animate-pulse" /> Autonomous Task Generation
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">Live visualization of tasks generated autonomously via digital employee swarm parsing events.</p>
                </div>
                <div className="px-3 py-1 bg-zinc-800 rounded-lg text-xs font-mono font-bold text-emerald-400">
                  PIPELINE ENGAGED
                </div>
              </div>

              {/* Progress bar pipeline */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
                    <span>Task Distribution (AI vs Human)</span>
                    <span>{simulatedLoad}% AI Autonomous</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${simulatedLoad}%` }} className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-1000" />
                    <div style={{ width: `${100 - simulatedLoad}%` }} className="h-full bg-zinc-700" />
                  </div>
                </div>
              </div>

              {/* Active Pipeline Feed */}
              <div className="space-y-3">
                <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-900 flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-zinc-300 font-bold">Event Ingested:</span>
                    <span className="text-zinc-400">MeetingEnded (m1)</span>
                  </div>
                  <span className="text-indigo-400">Extracting subtasks...</span>
                </div>
                <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-900 flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                    <span className="text-zinc-300 font-bold">Parsing Reasoning:</span>
                    <span className="text-zinc-400">"Verify oauth redirect URIs on register verify"</span>
                  </div>
                  <span className="text-zinc-500">350ms ago</span>
                </div>
              </div>
            </div>

            {/* Agent Activity Feed */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-zinc-900 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-400" /> Digital Employee Swarm Feed
                </h2>
                <span className="text-xs font-mono text-zinc-500">Live logs</span>
              </div>
              <div className="divide-y divide-zinc-900">
                {MOCK_AGENT_LOGS.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-zinc-900/20 transition flex items-start gap-4">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${log.status === 'success' ? 'bg-indigo-500' : 'bg-zinc-600'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm text-zinc-200">{log.agent}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{log.time}</span>
                      </div>
                      <p className="text-xs font-mono text-indigo-300 mt-1">{log.action}</p>
                      <p className="text-xs text-zinc-400 mt-1.5 font-sans">{log.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meeting Outcome Cards */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-400" /> Recent Meeting Outcomes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_MEETING_OUTCOMES.map((meeting) => (
                  <div key={meeting.id} className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-5 hover:border-zinc-800 transition flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm text-white">{meeting.title}</h3>
                          <span className="text-[10px] text-zinc-500 font-mono">{meeting.date} • {meeting.duration}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          meeting.sentiment === 'POSITIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {meeting.sentiment}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-3 line-clamp-3 leading-relaxed">{meeting.summary}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-900">
                      <span className="text-[10px] font-mono text-zinc-500 block mb-2">AUTONOMOUS ACTIONS GENERATED:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {meeting.outcomes.map((o, idx) => (
                          <span key={idx} className="text-[9px] px-2 py-0.5 bg-zinc-800/80 border border-zinc-800 rounded font-mono text-zinc-300">{o}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Col 3: Side actions & telemetry info */}
          <div className="space-y-8">
            
            {/* Quick Actions (AI Commands) */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl p-5">
              <h2 className="text-sm font-bold tracking-widest text-zinc-400 uppercase font-mono mb-4">Command Terminal</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/dashboard/kanban" className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl hover:border-indigo-500/20 text-center flex flex-col items-center group transition">
                  <CheckSquare className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform mb-2" />
                  <span className="text-xs font-semibold text-zinc-200">Tasks</span>
                </Link>
                <Link to="/dashboard/docs" className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl hover:border-indigo-500/20 text-center flex flex-col items-center group transition">
                  <MessageSquare className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform mb-2" />
                  <span className="text-xs font-semibold text-zinc-200">Documents</span>
                </Link>
                <Link to="/dashboard/scheduling" className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl hover:border-indigo-500/20 text-center flex flex-col items-center group transition">
                  <Calendar className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform mb-2" />
                  <span className="text-xs font-semibold text-zinc-200">Schedule</span>
                </Link>
                <Link to="/dashboard/agents" className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl hover:border-indigo-500/20 text-center flex flex-col items-center group transition">
                  <Bot className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform mb-2" />
                  <span className="text-xs font-semibold text-zinc-200">Agents</span>
                </Link>
              </div>
            </div>

            {/* Active Task Watchlist */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-zinc-900 flex justify-between items-center">
                <h2 className="text-sm font-bold text-white flex items-center gap-2"><CheckSquare className="w-4 h-4 text-indigo-400" /> Active Watchlist</h2>
                <Link to="/dashboard/kanban" className="text-xs text-indigo-400 font-medium hover:text-indigo-300 flex items-center gap-1">View board <ArrowRight className="w-3.5 h-3.5" /></Link>
              </div>
              <div className="divide-y divide-zinc-900">
                {tasksLoading ? (
                  <div className="p-6 text-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-700 mx-auto" /></div>
                ) : activeTasks.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500 text-xs font-mono">No active tasks. Swarm has resolved all blockers.</div>
                ) : (
                  activeTasks.map((task: any) => (
                    <div key={task.id} className="p-4 hover:bg-zinc-900/10 transition flex items-start gap-3">
                      <div className="mt-1 h-3.5 w-3.5 rounded border border-zinc-800 flex items-center justify-center shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500/20" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-zinc-200 text-xs truncate">{task.title}</h3>
                        {task.description && <p className="text-[10px] text-zinc-500 mt-1 truncate">{task.description}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-zinc-900">
                <h2 className="text-sm font-bold text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-400" /> Upcoming Schedules</h2>
              </div>
              <div className="p-5 space-y-4">
                {bookingsLoading ? (
                  <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin text-zinc-700 mx-auto" /></div>
                ) : upcomingBookings.length === 0 ? (
                  <div className="text-center py-4 text-zinc-500 text-xs font-mono">No bookings scheduled in workspace.</div>
                ) : (
                  upcomingBookings.map((booking: any) => (
                    <div key={booking.id} className="flex gap-4">
                      <div className="w-11 h-11 rounded-lg bg-zinc-950/80 text-zinc-300 flex flex-col items-center justify-center shrink-0 border border-zinc-900">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{new Date(booking.startTime).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-sm font-black leading-none text-zinc-200">{new Date(booking.startTime).getDate()}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-zinc-200 text-xs">{booking.title || 'Meeting with ' + booking.guestName}</h4>
                        <p className="text-[10px] text-zinc-500 mt-1">{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
