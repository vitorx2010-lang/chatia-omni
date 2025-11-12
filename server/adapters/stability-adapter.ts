/**
 * Stability AI Adapter
 * Supports image generation using Stable Diffusion
 * Doc: https://platform.stability.ai/docs/api-reference
 * Last checked: 2025-01-12
 */

import { ProviderResponse } from "@shared/adapter-types";
import { BaseAdapter } from "./base-adapter";

export class StabilityAdapter extends BaseAdapter {
  name = "stability";
  supports = {
    text: false,
    image: true,
    video: false,
    audio: false,
    midi: false,
  };

  private apiKey: string;
  private baseUrl: string;

  constructor() {
    super();
    this.apiKey = process.env.STABILITY_API_KEY || "";
    this.baseUrl = "https://api.stability.ai/v1";
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
        type: "image",
        error: "Stability AI API key not configured",
        timestamp: new Date(),
      };
    }

    try {
      const response = await this.callWithTimeout(
        async () => {
          const formData = new FormData();
          formData.append("text_prompts[0][text]", opts.prompt);
          formData.append("text_prompts[0][weight]", "1");
          formData.append("cfg_scale", String(opts.options?.cfgScale || 7));
          formData.append("height", String(opts.options?.height || 1024));
          formData.append("width", String(opts.options?.width || 1024));
          formData.append("samples", String(opts.options?.samples || 1));
          formData.append("steps", String(opts.options?.steps || 30));

          const res = await fetch(
            `${this.baseUrl}/generation/stable-diffusion-xl-1024-v1-0/text-to-image`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${this.apiKey}`,
                Accept: "application/json",
              },
              body: formData,
            }
          );

          if (!res.ok) {
            const error = await res.text();
            throw new Error(`Stability AI error: ${res.status} - ${error}`);
          }

          return res.json();
        },
        20000 // 20s timeout for image generation
      );

      // In a real implementation, you would upload the base64 images to S3
      const files = response.artifacts?.map((artifact: any, index: number) => ({
        name: `generated-image-${index}.png`,
        url: "placeholder-url", // Would be S3 URL after upload
        metadata: {
          seed: artifact.seed,
          finishReason: artifact.finishReason,
        },
      })) || [];

      return {
        provider: this.name,
        type: "image",
        text: `Generated ${files.length} image(s) for: ${opts.prompt}`,
        files,
        raw: response,
        timestamp: new Date(),
        sources: ["https://stability.ai"],
      };
    } catch (error: any) {
      return {
        provider: this.name,
        type: "image",
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const res = await fetch(`${this.baseUrl}/user/account`, {
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
    // Rough estimate: $0.002 per image for SDXL
    const samples = opts.samples || 1;
    return samples * 0.002;
  }
}
