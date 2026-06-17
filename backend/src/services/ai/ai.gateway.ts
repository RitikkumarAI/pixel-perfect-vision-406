import { AIProvider } from "./providers/openai.provider";
import { OpenAIProvider } from "./providers/openai.provider";
import { GeminiProvider } from "./providers/gemini.provider";

export class AIGateway {
  private providers: Map<string, AIProvider> = new Map();
  private primaryProviderName: string = "OpenAI";

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    try {
      if (process.env.OPENAI_API_KEY) {
        this.providers.set("OpenAI", new OpenAIProvider());
      }
    } catch (e) {
      console.warn("[AIGateway] Failed to initialize OpenAI provider", e);
    }

    try {
      if (process.env.GEMINI_API_KEY) {
        this.providers.set("Gemini", new GeminiProvider());
      }
    } catch (e) {
      console.warn("[AIGateway] Failed to initialize Gemini provider", e);
    }

    if (this.providers.size === 0) {
      console.warn(
        "[AIGateway] CRITICAL: No AI providers initialized. Set OPENAI_API_KEY or GEMINI_API_KEY.",
      );
    }
  }

  /**
   * Automatically routes to the primary provider or fallback if primary is missing.
   */
  public getProvider(preferred?: string): AIProvider {
    if (preferred && this.providers.has(preferred)) {
      return this.providers.get(preferred)!;
    }

    if (this.providers.has(this.primaryProviderName)) {
      return this.providers.get(this.primaryProviderName)!;
    }

    // Fallback to whatever is available
    for (const provider of this.providers.values()) {
      return provider;
    }

    throw new Error("No AI providers available. Missing API keys.");
  }
}
