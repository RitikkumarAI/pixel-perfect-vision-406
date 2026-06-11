import { createFileRoute } from "@tanstack/react-router";
import { useTasks } from "../../hooks/useTasks";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/kanban")({
  component: KanbanRoute,
});

function KanbanRoute() {
  const { tasks, isLoading, error } = useTasks();

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error loading tasks</div>;

  const columns = ['TODO', 'IN_PROGRESS', 'DONE'];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Task Board</h1>
        <Button>New Task</Button>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
        {columns.map(status => (
          <div key={status} className="bg-slate-50 rounded-lg p-4 flex flex-col h-full border border-slate-200">
            <h2 className="font-semibold mb-4 text-slate-700">{status.replace('_', ' ')}</h2>
            <div className="flex-1 overflow-auto space-y-3">
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task.id} className="bg-white p-4 rounded-md shadow-sm border border-slate-200 cursor-pointer hover:border-blue-400 transition">
                  <h3 className="font-medium">{task.title}</h3>
                  {task.description && <p className="text-sm text-slate-500 mt-2 line-clamp-2">{task.description}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
