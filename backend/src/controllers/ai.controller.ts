import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.guard';
import { AIService } from '../services/ai.service';

export class AIController {
  private aiService = new AIService();

  public generateTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { taskId, context } = req.body;
      const tasks = await this.aiService.generateSubtasks(taskId, context);
      res.status(200).json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public summarizeMeeting = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { meetingId } = req.body;
      const summary = await this.aiService.summarizeMeeting(meetingId);
      res.status(200).json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public assistWriting = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { prompt, context } = req.body;
      const completion = await this.aiService.assistWriting(req.user!.id, prompt, context);
      res.status(200).json(completion);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
