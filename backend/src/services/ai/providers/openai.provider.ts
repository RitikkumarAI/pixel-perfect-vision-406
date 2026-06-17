import OpenAI from "openai";

export interface AIProvider {
  generateText(prompt: string, systemContext?: string): Promise<string>;
  generateJSON(prompt: string): Promise<any>;
  chatWithTools?(messages: any[], tools?: any[]): Promise<any>;
  generateEmbedding(text: string): Promise<number[]>;
  name: string;
}

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  public name = "OpenAI";

  constructor() {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is not configured");
    this.client = new OpenAI({ apiKey: key });
  }

  async generateText(prompt: string, systemContext?: string): Promise<string> {
    const messages: any[] = [];
    if (systemContext) {
      messages.push({ role: "system", content: systemContext });
    }
    messages.push({ role: "user", content: prompt });

    const completion = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages,
    });

    return completion.choices[0]?.message?.content || "";
  }

  async generateJSON(prompt: string): Promise<any> {
    const completion = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || "{}";
    try {
      return JSON.parse(content);
    } catch (e) {
      throw new Error(`Failed to parse OpenAI JSON response: ${content}`);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  }

  async chatWithTools(messages: any[], tools?: any[]): Promise<any> {
    const params: any = {
      model: "gpt-4o",
      messages,
    };

    if (tools && tools.length > 0) {
      params.tools = tools;
      params.tool_choice = "auto";
    }

    const completion = await this.client.chat.completions.create(params);
    return completion.choices[0]?.message;
  }
}
