import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTasks } from "../../hooks/useTasks";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/kanban")({
  component: KanbanRoute,
});

function KanbanRoute() {
  const { tasks, isLoading, error, createTask, updateTaskStatus } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setIsCreating(true);
    try {
      await createTask({ title: newTaskTitle });
      setNewTaskTitle("");
    } catch (e) {
      console.error("Failed to create task", e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus({ taskId, status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error loading tasks</div>;

  const columns = ["TODO", "IN_PROGRESS", "DONE"];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Task Board</h1>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="px-3 py-1.5 border rounded-md text-sm min-w-[250px]"
            disabled={isCreating}
          />
          <Button type="submit" disabled={isCreating || !newTaskTitle.trim()}>
            {isCreating ? "Adding..." : "Add Task"}
          </Button>
        </form>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
        {columns.map((status) => (
          <div
            key={status}
            className="bg-slate-50 rounded-lg p-4 flex flex-col h-full border border-slate-200"
          >
            <h2 className="font-semibold mb-4 text-slate-700">{status.replace("_", " ")}</h2>
            <div className="flex-1 overflow-auto space-y-3">
              {tasks
                .filter((t: any) => t.status === status)
                .map((task: any) => (
                  <div
                    key={task.id}
                    className="bg-white p-4 rounded-md shadow-sm border border-slate-200 cursor-pointer hover:border-blue-400 transition group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-medium text-sm">{task.title}</h3>
                      <select
                        className="text-xs border rounded p-1 opacity-0 group-hover:opacity-100 transition"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        {columns.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
