import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.guard";
import { AgentExecutionEngine } from "../services/agents/engine";
import { AgentRegistry } from "../services/agents/registry";
import { enqueueAgentRun } from "../queues/agent.queue";
import prisma from "../utils/prisma";

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

      const definition = AgentRegistry.find((a) => a.id === agentId);
      if (!definition) {
        res.status(400).json({ error: "Agent not found in registry" });
        return;
      }

      let agentRecord = await prisma.agent.findFirst({
        where: { workspaceId, name: definition.name },
      });

      if (!agentRecord) {
        agentRecord = await prisma.agent.create({
          data: {
            workspaceId,
            name: definition.name,
            systemPrompt: "You are an AI assistant.",
          },
        });
      }

      // Enqueue the job asynchronously
      const run = await enqueueAgentRun(agentRecord.id, input, req.user!.userId, "PRO");

      // Instantly return the queued runId to the frontend
      res
        .status(200)
        .json({ runId: run.id, status: "queued", message: "Agent execution queued successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { runId } = req.params;
      const history = await this.engine.getHistory(runId as string);

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
