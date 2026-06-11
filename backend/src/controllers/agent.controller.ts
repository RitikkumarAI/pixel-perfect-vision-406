import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.guard';
import { AgentExecutionEngine } from '../services/agents/engine';
import { AgentRegistry } from '../services/agents/registry';

export class AgentController {
  private engine: AgentExecutionEngine;

  constructor() {
    this.engine = new AgentExecutionEngine();
  }

  public getAgents = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      res.status(200).json(AgentRegistry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public runAgent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { agentId, workspaceId, input } = req.body;
      if (!agentId || !workspaceId || !input) {
        res.status(400).json({ error: "Missing required fields: agentId, workspaceId, input" });
        return;
      }

      const result = await this.engine.runAgent(agentId, req.user!.userId, workspaceId, input);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { runId } = req.params;
      const history = await this.engine.getHistory(runId);
      
      if (!history || history.userId !== req.user!.userId) {
        res.status(404).json({ error: "Run not found" });
        return;
      }

      res.status(200).json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
