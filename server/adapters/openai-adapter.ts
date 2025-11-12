/**
 * OpenAI Adapter
 * Supports text generation using GPT models
 * Doc: https://platform.openai.com/docs/api-reference
 * Last checked: 2025-01-12
 */

import { ProviderResponse } from "@shared/adapter-types";
import { BaseAdapter } from "./base-adapter";

export class OpenAIAdapter extends BaseAdapter {
  name = "openai";
  supports = {
    text: true,
    image: false,
    video: false,
    audio: false,
    midi: false,
  };

  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor() {
    super();
    this.apiKey = process.env.OPENAI_API_KEY || "";
    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    this.baseUrl = "https://api.openai.com/v1";
  }

  async call(opts: {
    prompt: string;
    userId?: string;
    conversationId?: string;
    options?: any;
  }): Promise<ProviderResponse> {
    if (!this.apiKey) {
      return {
        provider: this.name,
        type: "text",
        error: "OpenAI API key not configured",
        timestamp: new Date(),
      };
    }

    try {
      const response = await this.callWithTimeout(async () => {
        const res = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: opts.options?.model || this.model,
            messages: [
              {
                role: "user",
                content: opts.prompt,
              },
            ],
            temperature: opts.options?.temperature || 0.7,
            max_tokens: opts.options?.maxTokens || 1000,
          }),
        });

        if (!res.ok) {
          const error = await res.text();
          throw new Error(`OpenAI API error: ${res.status} - ${error}`);
        }

        return res.json();
      });

      const text = response.choices?.[0]?.message?.content || "";
      const sanitized = this.sanitizePII(text);

      return {
        provider: this.name,
        type: "text",
        text: sanitized,
        raw: response,
        timestamp: new Date(),
        sources: ["https://platform.openai.com"],
      };
    } catch (error: any) {
      return {
        provider: this.name,
        type: "text",
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async costEstimate(opts: any): Promise<number> {
    // Rough estimate: $0.15 per 1M input tokens, $0.60 per 1M output tokens for gpt-4o-mini
    const inputTokens = Math.ceil((opts.prompt?.length || 0) / 4);
    const outputTokens = opts.maxTokens || 1000;
    return (inputTokens * 0.15 + outputTokens * 0.60) / 1000000;
  }
}
