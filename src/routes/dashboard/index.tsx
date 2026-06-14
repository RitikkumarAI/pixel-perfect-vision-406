import { createFileRoute, Link } from "@tanstack/react-router";
import { useWorkspaces } from "../../hooks/useWorkspace";
import { useTasks } from "../../hooks/useTasks";
import { useScheduling } from "../../hooks/useScheduling";
import { useAgents } from "../../hooks/useAgents";
import { Bot, Calendar, CheckSquare, MessageSquare, Play, Video, ArrowRight, Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { activeWorkspace, isLoading: wsLoading } = useWorkspaces();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { bookings, isLoading: bookingsLoading } = useScheduling();
  const { agents } = useAgents();

  if (wsLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  const activeTasks = tasks?.filter((t: any) => t.status !== 'DONE').slice(0, 5) || [];
  const upcomingBookings = bookings?.slice(0, 3) || [];

  return (
    <div className="h-full bg-slate-50 overflow-auto p-8 rounded-xl border border-slate-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Good morning, Team {activeWorkspace?.name || 'Workspace'}</h1>
            <p className="text-slate-500 mt-2">Here is what's happening in your workspace today.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/dashboard/meetings" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 transition font-medium">
              <Video className="w-4 h-4" /> Start Meeting
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-bold mb-4 text-slate-800">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/dashboard/kanban" className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow transition flex flex-col items-center text-center group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><CheckSquare className="w-5 h-5" /></div>
                  <span className="font-medium text-slate-700 text-sm">New Task</span>
                </Link>
                <Link to="/dashboard/docs" className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow transition flex flex-col items-center text-center group">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><MessageSquare className="w-5 h-5" /></div>
                  <span className="font-medium text-slate-700 text-sm">Write Doc</span>
                </Link>
                <Link to="/dashboard/scheduling" className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow transition flex flex-col items-center text-center group">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Calendar className="w-5 h-5" /></div>
                  <span className="font-medium text-slate-700 text-sm">Schedule</span>
                </Link>
                <Link to="/dashboard/agents" className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow transition flex flex-col items-center text-center group">
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Bot className="w-5 h-5" /></div>
                  <span className="font-medium text-slate-700 text-sm">Run Agent</span>
                </Link>
              </div>
            </div>

            {/* Active Tasks */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><CheckSquare className="w-5 h-5 text-indigo-500" /> Active Tasks</h2>
                <Link to="/dashboard/kanban" className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1">View All <ArrowRight className="w-4 h-4" /></Link>
              </div>
              <div className="divide-y divide-slate-100">
                {tasksLoading ? <div className="p-6 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto" /></div> : 
                 activeTasks.length === 0 ? <div className="p-6 text-center text-slate-500 text-sm">No active tasks. You're all caught up!</div> :
                 activeTasks.map((task: any) => (
                  <div key={task.id} className="p-4 hover:bg-slate-50 transition flex items-start gap-4">
                    <div className="mt-1 w-4 h-4 rounded border border-slate-300 shrink-0"></div>
                    <div>
                      <h3 className="font-medium text-slate-800 text-sm">{task.title}</h3>
                      {task.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Upcoming Meetings */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Calendar className="w-5 h-5 text-emerald-500" /> Upcoming</h2>
              </div>
              <div className="p-5 space-y-4">
                {bookingsLoading ? <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin text-slate-300 mx-auto" /></div> :
                 upcomingBookings.length === 0 ? <div className="text-center py-4 text-slate-500 text-sm">No upcoming meetings.</div> :
                 upcomingBookings.map((booking: any) => (
                  <div key={booking.id} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex flex-col items-center justify-center shrink-0 border border-emerald-100">
                      <span className="text-xs font-bold uppercase">{new Date(booking.startTime).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className="text-lg font-black leading-none">{new Date(booking.startTime).getDate()}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{booking.title || 'Meeting with ' + booking.guestName}</h4>
                      <p className="text-xs text-slate-500 mt-1">{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Agents Available */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Bot className="w-5 h-5 text-orange-500" /> AI Assistants</h2>
              </div>
              <div className="p-5 space-y-3">
                {agents?.slice(0, 3).map((agent: any) => (
                  <Link key={agent.id} to="/dashboard/agents" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm"><Bot className="w-4 h-4 text-slate-600 group-hover:text-orange-600" /></div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">{agent.name}</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Standing By</p>
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-slate-300 group-hover:text-orange-500" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
