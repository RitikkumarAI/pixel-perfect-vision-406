import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "./openai.provider";

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  public name = "Gemini";

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not configured");
    this.client = new GoogleGenerativeAI(key);
  }

  async generateText(prompt: string, systemContext?: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: "gemini-1.5-pro" });
    const fullPrompt = systemContext ? `${systemContext}\n\n${prompt}` : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  }

  async generateJSON(prompt: string): Promise<any> {
    const model = this.client.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    try {
      return JSON.parse(content);
    } catch (e) {
      throw new Error(`Failed to parse Gemini JSON response: ${content}`);
    }
  }
}
