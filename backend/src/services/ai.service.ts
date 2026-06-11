import prisma from '../utils/prisma';
import OpenAI from 'openai';

export class AIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('[AIService] WARNING: OPENAI_API_KEY is not set. Real AI calls will fail.');
    }
    this.openai = new OpenAI({ apiKey: apiKey || 'missing-key' });
  }

  /**
   * Calls OpenAI to generate subtasks for a given task description.
   */
  public async generateSubtasks(taskId: string, context: string) {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY environment variable is missing.');
    
    console.log(`[AIService] Generating real subtasks via OpenAI for: ${context}`);
    
    const parentTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (!parentTask) throw new Error('Parent task not found');

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a project manager AI. Given a task context, generate exactly 3 logical subtasks in JSON array format: [{ \"title\": \"string\", \"priority\": \"HIGH|MEDIUM|LOW\" }]" },
        { role: "user", content: context }
      ],
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) throw new Error('Failed to generate response from OpenAI');

    const parsedResponse = JSON.parse(responseContent);
    const subtasks = parsedResponse.subtasks || parsedResponse; // Handle varying JSON wrapper
    const generatedTasks = Array.isArray(subtasks) ? subtasks : [];

    const createdTasks = await Promise.all(
      generatedTasks.slice(0, 3).map((sub: any) => 
        prisma.task.create({
          data: {
            workspaceId: parentTask.workspaceId,
            parentId: taskId,
            title: sub.title || 'Untitled Subtask',
            priority: sub.priority || 'MEDIUM',
            status: 'TODO'
          }
        })
      )
    );

    return createdTasks;
  }

  /**
   * Uses OpenAI to summarize a meeting transcript.
   */
  public async summarizeMeeting(meetingId: string, transcriptText: string = "Meeting transcript placeholder") {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY environment variable is missing.');
    console.log(`[AIService] Summarizing meeting ${meetingId} via OpenAI`);
    
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) throw new Error('Meeting not found');

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an executive assistant. Summarize the following meeting transcript into a concise paragraph with action items." },
        { role: "user", content: transcriptText }
      ]
    });

    const summaryText = completion.choices[0]?.message?.content || "Summary could not be generated.";

    const summaryContent = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: `Summary: ${meeting.title}` }] },
        { type: "paragraph", content: [{ type: "text", text: summaryText }] }
      ]
    };

    return summaryContent;
  }

  /**
   * Completes text using OpenAI for the document editor.
   */
  public async assistWriting(prompt: string, context: string) {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY environment variable is missing.');
    console.log(`[AIService] Assisting writing via OpenAI with prompt: ${prompt}`);
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a writing assistant. Continue the user's text based on their context." },
        { role: "user", content: `Context: ${context}\n\nPrompt: ${prompt}` }
      ]
    });

    return { text: completion.choices[0]?.message?.content || "" };
  }
}
