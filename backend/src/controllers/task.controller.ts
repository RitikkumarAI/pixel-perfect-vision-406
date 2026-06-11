import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.guard';
import { TaskService } from '../services/task.service';

export class TaskController {
  private taskService = new TaskService();

  public createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.params;
      const { title, description, status, priority, parentId, assigneeId, dueDate } = req.body;
      const task = await this.taskService.createTask(workspaceId, title, description, status, priority, parentId, assigneeId, dueDate ? new Date(dueDate) : undefined);
      res.status(201).json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getWorkspaceTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { workspaceId } = req.params;
      const { status } = req.query;
      const tasks = await this.taskService.getWorkspaceTasks(workspaceId, status as string);
      res.status(200).json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body;
      if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);
      const task = await this.taskService.updateTask(id, updates);
      res.status(200).json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.taskService.deleteTask(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
