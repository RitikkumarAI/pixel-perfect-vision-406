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

  public async runAgent(agentId: string, userId: string, workspaceId: string, input: string) {
    const definition = AgentRegistry.find(a => a.id === agentId);
    if (!definition) throw new Error('Agent not found in registry');

    // Make sure user has an Agent record for this workspace to link to
    let agentRecord = await prisma.agent.findFirst({
      where: { workspaceId, name: definition.name }
    });

    if (!agentRecord) {
      agentRecord = await prisma.agent.create({
        data: {
          workspaceId,
          name: definition.name,
          systemPrompt: AgentPrompts[agentId] || "You are an AI assistant."
        }
      });
    }

    const run = await prisma.agentRun.create({
      data: {
        agentId: agentRecord.id,
        userId,
        input,
        status: "RUNNING"
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'AGENT_EXECUTION_STARTED',
        resourceType: 'Agent',
        resourceId: agentId,
        metadata: { workspaceId, runId: run.id }
      }
    });

    await this.logStep(run.id, "INFO", `Starting execution for ${definition.name}`);

    try {
      const provider = this.gateway.getProvider();
      
      await this.logStep(run.id, "THOUGHT", "Analyzing input and determining tool usage...");

      // Fetch Memory Context
      const memories = await this.retrieveMemory(agentRecord.id, userId);
      const memoryContext = memories.length > 0 ? `\n\nPast Memory Context:\n${memories.join("\n")}` : "";

      const systemPrompt = `${AgentPrompts[agentId] || "You are an AI assistant."}${memoryContext}`;

      let messages: any[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input }
      ];

      await this.logStep(run.id, "THOUGHT", "Analyzing input and initiating reasoning loop...");

      let result = "";
      let iterations = 0;
      const MAX_ITERATIONS = 5;

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
    await prisma.agentLog.create({
      data: { runId, level, message }
    });
  }
}
