import prisma from '../../utils/prisma';
import { AIGateway } from '../ai/ai.gateway';
import { AgentRegistry } from './registry';
import { AgentPrompts } from './prompts';
import { AgentTools, AgentToolSchemas } from './tools';

export class AgentExecutionEngine {
  private gateway: AIGateway;

  constructor() {
    this.gateway = new AIGateway();
  }

  public async run(runId: string, agentRecordId: string, input: string, userId: string) {
    const run = await prisma.agentRun.findUnique({
      where: { id: runId },
      include: { agent: true }
    });

    if (!run) throw new Error('Run not found');
    const agentRecord = run.agent;

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'AGENT_EXECUTION_STARTED',
        resourceId: agentRecord.name,
        metadata: { workspaceId: agentRecord.workspaceId, runId: run.id }
      }
    });

    await this.logStep(run.id, "INFO", `Starting execution for ${agentRecord.name}`);

    try {
      const provider = this.gateway.getProvider();
      
      await this.logStep(run.id, "THOUGHT", "Analyzing input and determining tool usage...");

      // Fetch Memory Context
      const memories = await this.retrieveMemory(agentRecord.id, userId);
      const memoryContext = memories.length > 0 ? `\n\nPast Memory Context:\n${memories.join("\n")}` : "";

      // Semantic Cache Simulation
      const cacheHit = await prisma.agentMemory.findFirst({
        where: { agentId: agentRecord.id, userId, key: `cache:${input}` }
      });

      if (cacheHit) {
        await this.logStep(run.id, "INFO", "Semantic Cache hit! Returning cached result instantly.");
        const cachedResult = cacheHit.value;
        await prisma.agentRun.update({
          where: { id: run.id },
          data: { status: "COMPLETED", result: cachedResult }
        });

        const io = (global as any).io;
        if (io && agentRecord.workspaceId) {
          io.to(`workspace:${agentRecord.workspaceId}`).emit('agent.completed', { runId: run.id, result: cachedResult });
        }
        return cachedResult;
      }

      const systemPrompt = `${agentRecord.systemPrompt}${memoryContext}`;

      let messages: any[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input }
      ];

      await this.logStep(run.id, "THOUGHT", "Analyzing input and initiating reasoning loop...");

      let result = "";
      let iterations = 0;
      const MAX_ITERATIONS = 5;
      let totalTokensUsed = 0;
      const MAX_TOKEN_BUDGET = 8000; // Circuit breaker limit

      while (iterations < MAX_ITERATIONS) {
        iterations++;
        // Use OpenAI provider directly to leverage function calling
        const provider = this.gateway.getProvider('OpenAI') as any; // Cast to access chatWithTools
        
        if (!provider.chatWithTools) {
          throw new Error("Provider does not support chatWithTools");
        }

        const responseMessage = await provider.chatWithTools(messages, AgentToolSchemas);
        
        if (!responseMessage) {
          throw new Error("Empty response from AI");
        }

        // Simulate token consumption based on response length for budget tracking
        const estimatedTokens = JSON.stringify(responseMessage).length / 4;
        totalTokensUsed += estimatedTokens;

        if (totalTokensUsed > MAX_TOKEN_BUDGET) {
          await this.logStep(run.id, "ERROR", `CIRCUIT BREAKER: Token budget exceeded (${totalTokensUsed}/${MAX_TOKEN_BUDGET}). Halting execution.`);
          throw new Error("Token budget exceeded");
        }

        messages.push(responseMessage);

        if (responseMessage.tool_calls) {
          for (const toolCall of responseMessage.tool_calls) {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);
            
            await this.logStep(run.id, "ACTION", `Executing tool: ${functionName} with args: ${JSON.stringify(functionArgs)}`);
            
            let toolResult = "";
            try {
              if (functionName === 'createTask') {
                toolResult = await AgentTools.createTask(workspaceId, functionArgs.title, functionArgs.description);
              } else if (functionName === 'searchDocuments') {
                toolResult = await AgentTools.searchDocuments(workspaceId, functionArgs.query);
              } else if (functionName === 'getTasks') {
                toolResult = await AgentTools.getTasks(workspaceId);
              } else if (functionName === 'getMeetingNotes') {
                toolResult = await AgentTools.getMeetingNotes(functionArgs.meetingId);
              } else if (functionName === 'summarizeMeeting') {
                toolResult = await AgentTools.summarizeMeeting(functionArgs.meetingId);
              } else if (functionName === 'findAvailability') {
                toolResult = await AgentTools.findAvailability(functionArgs.hostId);
              } else if (functionName === 'scheduleMeeting') {
                toolResult = await AgentTools.scheduleMeeting(functionArgs.hostId, functionArgs.eventTypeId, functionArgs.guestName, functionArgs.guestEmail, functionArgs.startTime, functionArgs.endTime);
              } else if (functionName === 'rescheduleMeeting') {
                toolResult = await AgentTools.rescheduleMeeting(functionArgs.bookingId, functionArgs.newStartTime, functionArgs.newEndTime);
              } else if (functionName === 'createFollowUp') {
                toolResult = await AgentTools.createFollowUp(workspaceId, functionArgs.hostId, functionArgs.title, functionArgs.description);
              } else if (functionName === 'searchVideos') {
                toolResult = await AgentTools.searchVideos(functionArgs.query);
              } else {
                toolResult = JSON.stringify({ error: "Unknown tool" });
              }
            } catch (err: any) {
              toolResult = JSON.stringify({ error: err.message });
            }

            await this.logStep(run.id, "THOUGHT", `Observation from ${functionName}: Executed successfully`);

            messages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: functionName,
              content: toolResult
            });
          }
        } else {
          // No more tools, we have our final answer
          result = responseMessage.content || "";
          break;
        }
      }

      if (iterations >= MAX_ITERATIONS) {
        await this.logStep(run.id, "WARN", "Max iterations reached, halting early.");
        result = messages[messages.length - 1].content || "I reached my computational limit.";
      }

      // Save a memory snapshot if significant tasks were done
      if (iterations > 1) {
        await this.saveMemory(agentRecord.id, userId, `Run Context ${run.id}`, `User asked: ${input}. I performed actions and returned: ${result.substring(0, 50)}...`);
      }

      await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: "COMPLETED",
          result,
          completedAt: new Date()
        }
      });

      await this.logStep(run.id, "INFO", "Execution completed successfully");

      const io = (global as any).io;
      if (io && agentRecord.workspaceId) {
        io.to(`workspace:${agentRecord.workspaceId}`).emit('agent.completed', { runId: run.id, result });
      }

      return { runId: run.id, result };
    } catch (error: any) {
      await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: "FAILED",
          error: error.message,
          completedAt: new Date()
        }
      });
      await this.logStep(run.id, "ERROR", `Execution failed: ${error.message}`);
      throw error;
    }
  }

  public async getHistory(runId: string) {
    return prisma.agentRun.findUnique({
      where: { id: runId },
      include: { logs: { orderBy: { createdAt: 'asc' } } }
    });
  }

  private async retrieveMemory(agentId: string, userId: string): Promise<string[]> {
    const memories = await prisma.agentMemory.findMany({
      where: { agentId, userId },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });
    return memories.map(m => `- ${m.key}: ${m.value}`);
  }

  private async saveMemory(agentId: string, userId: string, key: string, value: string) {
    await prisma.agentMemory.upsert({
      where: { agentId_userId_key: { agentId, userId, key } },
      create: { agentId, userId, key, value },
      update: { value, updatedAt: new Date() }
    });
  }

  private async logStep(runId: string, level: string, message: string) {
    const log = await prisma.agentLog.create({
      data: { runId, level, message }
    });
    
    const io = (global as any).io;
    if (io) {
      // Find the workspace for this run to broadcast to the correct channel
      const run = await prisma.agentRun.findUnique({
        where: { id: runId },
        include: { agent: true }
      });
      if (run && run.agent.workspaceId) {
        io.to(`workspace:${run.agent.workspaceId}`).emit('agent_updates', log);
      }
    }
  }
}
