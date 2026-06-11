import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useTasks, Task } from "../../hooks/useTasks";
import { useAI } from "../../hooks/useAI";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Sparkles, Plus, Loader2 } from "lucide-react";

export const Route = createFileRoute("/tasks/")({
  component: TasksPage,
});

const COLUMNS = ["TODO", "IN_PROGRESS", "DONE"];

function TasksPage() {
  const { tasks, isLoading, createTask, updateTaskStatus } = useTasks();
  const { generateSubtasks, isLoading: isAILoading } = useAI();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeAI, setActiveAI] = useState<string | null>(null);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    const task = tasks.find(t => t.id === draggableId);
    if (task && task.status !== newStatus) {
      updateTaskStatus({ taskId: draggableId, status: newStatus });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await createTask({ title: newTaskTitle });
      setNewTaskTitle("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAI = async (taskId: string, title: string) => {
    setActiveAI(taskId);
    try {
      const result = await generateSubtasks(taskId, title);
      // Backend automatically saves them, we might need to invalidate/refetch
      // but for MVP, we just let the hook handle it if we wired it to refetch.
      // We can also just display a success alert.
      alert(`AI generated subtasks: ${JSON.stringify(result.subtasks)}`);
    } catch (e) {
      console.error(e);
      alert("AI Generation failed.");
    } finally {
      setActiveAI(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-navy flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-6 max-w-7xl mx-auto w-full">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Project Tasks</h1>
            <p className="mt-2 text-navy/70">Manage your workspace tasks with drag-and-drop and AI subtask generation.</p>
          </div>
          <form onSubmit={handleCreateTask} className="flex gap-2">
            <input
              type="text"
              placeholder="New task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-zoom-blue/20 focus:border-zoom-blue w-64"
            />
            <button type="submit" className="bg-zoom-blue text-white px-4 py-2 rounded-lg font-semibold hover:bg-zoom-blue-hover transition flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </form>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-slate-500">Loading tasks...</div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {COLUMNS.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col);
                return (
                  <Droppable key={col} droppableId={col}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="bg-slate-100 rounded-2xl p-4 min-h-[500px]"
                      >
                        <h2 className="font-bold mb-4 text-slate-700">{col.replace("_", " ")} ({colTasks.length})</h2>
                        <div className="space-y-3">
                          {colTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 group transition-shadow ${snapshot.isDragging ? 'shadow-xl ring-2 ring-zoom-blue/50' : 'hover:shadow-md'}`}
                                >
                                  <div className="font-semibold text-[15px]">{task.title}</div>
                                  <div className="text-xs text-slate-500 mt-1">{task.id.split('-')[0]}</div>
                                  <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleAI(task.id, task.title)}
                                      disabled={activeAI === task.id}
                                      className="text-xs flex items-center gap-1 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md font-medium disabled:opacity-50"
                                    >
                                      {activeAI === task.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                      AI Break Down
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </main>
      <Footer />
    </div>
  );
}
