/**
 * HuggingFace Adapter
 * Supports text generation and music generation via Inference API
 * Doc: https://huggingface.co/docs/api-inference
 * Last checked: 2025-01-12
 */

import { ProviderResponse } from "@shared/adapter-types";
import { BaseAdapter } from "./base-adapter";

export class HuggingFaceAdapter extends BaseAdapter {
  name = "huggingface";
  supports = {
    text: true,
    image: false,
    video: false,
    audio: true,
    midi: false,
  };

  private apiKey: string;
  private baseUrl: string;

  constructor() {
    super();
    this.apiKey = process.env.HF_API_KEY || "";
    this.baseUrl = "https://api-inference.huggingface.co/models";
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
        error: "HuggingFace API key not configured",
        timestamp: new Date(),
      };
    }

    const model = opts.options?.model || "meta-llama/Llama-3.2-3B-Instruct";

    try {
      const response = await this.callWithTimeout(async () => {
        const res = await fetch(`${this.baseUrl}/${model}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            inputs: opts.prompt,
            parameters: {
              max_new_tokens: opts.options?.maxTokens || 500,
              temperature: opts.options?.temperature || 0.7,
              return_full_text: false,
            },
          }),
        });

        if (!res.ok) {
          const error = await res.text();
          throw new Error(`HuggingFace API error: ${res.status} - ${error}`);
        }

        return res.json();
      });

      const text = Array.isArray(response)
        ? response[0]?.generated_text || ""
        : response.generated_text || "";
      
      const sanitized = this.sanitizePII(text);

      return {
        provider: this.name,
        type: "text",
        text: sanitized,
        raw: response,
        timestamp: new Date(),
        sources: ["https://huggingface.co"],
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

  /**
   * Generate music using MusicGen model
   */
  async generateMusic(opts: {
    prompt: string;
    duration?: number;
  }): Promise<ProviderResponse> {
    if (!this.apiKey) {
      return {
        provider: this.name,
        type: "audio",
        error: "HuggingFace API key not configured",
        timestamp: new Date(),
      };
    }

    try {
      const response = await this.callWithTimeout(
        async () => {
          const res = await fetch(
            `${this.baseUrl}/facebook/musicgen-small`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
              },
              body: JSON.stringify({
                inputs: opts.prompt,
                parameters: {
                  duration: opts.duration || 30,
                },
              }),
            }
          );

          if (!res.ok) {
            const error = await res.text();
            throw new Error(`HuggingFace MusicGen error: ${res.status} - ${error}`);
          }

          // Response is audio blob
          const blob = await res.blob();
          return blob;
        },
        30000 // 30s timeout for music generation
      );

      // In a real implementation, you would upload this blob to S3
      // For now, we'll return a placeholder
      return {
        provider: this.name,
        type: "audio",
        text: `Generated music for: ${opts.prompt}`,
        files: [
          {
            name: "generated-music.wav",
            url: "placeholder-url", // Would be S3 URL after upload
            metadata: { duration: opts.duration || 30 },
          },
        ],
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        provider: this.name,
        type: "audio",
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      // Simple health check - try to access API
      const res = await fetch(`${this.baseUrl}/meta-llama/Llama-3.2-1B`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: "test" }),
      });
      return res.status !== 401 && res.status !== 403;
    } catch {
      return false;
    }
  }
}
