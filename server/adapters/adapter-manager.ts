/**
 * Adapter Manager
 * Manages all provider adapters and provides unified access
 */

import { IAAdapter } from "@shared/adapter-types";
import { OpenAIAdapter } from "./openai-adapter";
import { HuggingFaceAdapter } from "./huggingface-adapter";
import { StabilityAdapter } from "./stability-adapter";
import { RunwayAdapter, PikaAdapter, ReplicateVideoAdapter } from "./video-adapters-placeholder";

export class AdapterManager {
  private adapters: Map<string, IAAdapter> = new Map();
  private enabledAdapters: Set<string> = new Set();

  constructor() {
    this.registerAdapters();
    this.loadEnabledAdapters();
  }

  /**
   * Register all available adapters
   */
  private registerAdapters() {
    const adapters: IAAdapter[] = [
      // Text adapters
      new OpenAIAdapter(),
      new HuggingFaceAdapter(),
      
      // Image adapters
      new StabilityAdapter(),
      
      // Video adapters (placeholders)
      new RunwayAdapter(),
      new PikaAdapter(),
      new ReplicateVideoAdapter(),
    ];

    adapters.forEach((adapter) => {
      this.adapters.set(adapter.name, adapter);
    });
  }

  /**
   * Load enabled adapters from environment or database
   */
  private loadEnabledAdapters() {
    // By default, enable all adapters that have API keys configured
    const enabledList = process.env.ENABLED_PROVIDERS?.split(",") || [];
    
    if (enabledList.length > 0) {
      enabledList.forEach((name) => this.enabledAdapters.add(name.trim()));
    } else {
      // Auto-enable adapters with configured keys
      if (process.env.OPENAI_API_KEY) this.enabledAdapters.add("openai");
      if (process.env.HF_API_KEY) this.enabledAdapters.add("huggingface");
      if (process.env.STABILITY_API_KEY) this.enabledAdapters.add("stability");
      if (process.env.REPLICATE_API_TOKEN) this.enabledAdapters.add("replicate-video");
    }
  }

  /**
   * Get adapter by name
   */
  getAdapter(name: string): IAAdapter | undefined {
    return this.adapters.get(name);
  }

  /**
   * Get all enabled adapters
   */
  getEnabledAdapters(): IAAdapter[] {
    return Array.from(this.enabledAdapters)
      .map((name) => this.adapters.get(name))
      .filter((adapter): adapter is IAAdapter => adapter !== undefined);
  }

  /**
   * Get adapters by type
   */
  getAdaptersByType(type: "text" | "image" | "video" | "audio" | "midi"): IAAdapter[] {
    return this.getEnabledAdapters().filter(
      (adapter) => adapter.supports?.[type] === true
    );
  }

  /**
   * Enable adapter
   */
  enableAdapter(name: string): boolean {
    if (this.adapters.has(name)) {
      this.enabledAdapters.add(name);
      return true;
    }
    return false;
  }

  /**
   * Disable adapter
   */
  disableAdapter(name: string): boolean {
    return this.enabledAdapters.delete(name);
  }

  /**
   * Check if adapter is enabled
   */
  isEnabled(name: string): boolean {
    return this.enabledAdapters.has(name);
  }

  /**
   * Get all adapters (enabled and disabled)
   */
  getAllAdapters(): IAAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Health check for all enabled adapters
   */
  async healthCheckAll(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    const adapters = this.getEnabledAdapters();

    await Promise.all(
      adapters.map(async (adapter) => {
        try {
          const healthy = await adapter.healthCheck?.();
          results.set(adapter.name, healthy || false);
        } catch {
          results.set(adapter.name, false);
        }
      })
    );

    return results;
  }

  /**
   * Get adapter info for admin panel
   */
  getAdapterInfo() {
    return Array.from(this.adapters.values()).map((adapter) => ({
      name: adapter.name,
      enabled: this.enabledAdapters.has(adapter.name),
      supports: adapter.supports || {},
    }));
  }
}

// Singleton instance
export const adapterManager = new AdapterManager();
