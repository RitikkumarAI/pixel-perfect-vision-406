import prisma from "../utils/prisma";
import { AIGateway } from "./ai/ai.gateway";
import { MemoryService } from "./ai/memory.service";
import { PromptTemplates } from "./ai/templates";

export class AIService {
  private gateway: AIGateway;
  private memory: MemoryService;

  constructor() {
    this.gateway = new AIGateway();
    this.memory = new MemoryService();
  }

  /**
   * Calls AI to generate subtasks using the JSON Gateway method.
   */
  public async generateSubtasks(taskId: string, context: string, providerName?: string) {
    console.log(`[AIService] Generating subtasks for: ${context}`);
    const provider = this.gateway.getProvider(providerName);

    const parentTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (!parentTask) throw new Error("Parent task not found");

    const prompt = PromptTemplates.GENERATE_SUBTASKS(context);
    const parsedResponse = await provider.generateJSON(prompt);

    const subtasks = parsedResponse.subtasks || parsedResponse;
    const generatedTasks = Array.isArray(subtasks) ? subtasks : [];

    const createdTasks = await Promise.all(
      generatedTasks.slice(0, 3).map((sub: any) =>
        prisma.task.create({
          data: {
            workspaceId: parentTask.workspaceId,
            parentId: taskId,
            title: sub.title || "Untitled Subtask",
            priority: sub.priority || "MEDIUM",
            status: "TODO",
          },
        }),
      ),
    );

    return createdTasks;
  }

  /**
   * Summarizes meeting transcript via the standard text completion Gateway method.
   */
  public async summarizeMeeting(
    meetingId: string,
    transcriptText: string = "Meeting transcript placeholder",
    providerName?: string,
  ) {
    console.log(`[AIService] Summarizing meeting ${meetingId}`);
    const provider = this.gateway.getProvider(providerName);

    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) throw new Error("Meeting not found");

    const prompt = PromptTemplates.SUMMARIZE_MEETING(transcriptText);
    const summaryText = await provider.generateText(prompt);

    const summaryContent = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: `Summary: ${meeting.title}` }],
        },
        { type: "paragraph", content: [{ type: "text", text: summaryText }] },
      ],
    };

    return summaryContent;
  }

  /**
   * Completes text using the gateway with conversation memory awareness.
   */
  public async assistWriting(
    userId: string,
    prompt: string,
    context: string,
    providerName?: string,
  ) {
    console.log(`[AIService] Assisting writing with prompt: ${prompt}`);
    const provider = this.gateway.getProvider(providerName);

    // Retrieve past conversation memory for this specific user/doc context
    const memoryContextId = `assist_${userId}`;
    const history = await this.memory.getHistory(memoryContextId);

    // Inject history into system context
    let systemContext =
      "You are an AI writing assistant. Continue or rewrite the user's text. Do not include pleasantries.";
    if (history.length > 0) {
      systemContext +=
        "\n\nPrevious Conversation History:\n" +
        history.map((h) => `${h.role}: ${h.content}`).join("\n");
    }

    const fullPrompt = PromptTemplates.ASSIST_WRITING(context, prompt);
    const responseText = await provider.generateText(fullPrompt, systemContext);

    // Store new memory
    await this.memory.addMessage(memoryContextId, "user", prompt);
    await this.memory.addMessage(memoryContextId, "assistant", responseText);

    return { text: responseText };
  }
}
