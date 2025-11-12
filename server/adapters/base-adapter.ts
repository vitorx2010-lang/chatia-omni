/**
 * Base adapter with retry logic, timeout, and error handling
 */

import { IAAdapter, ProviderResponse } from "@shared/adapter-types";

export abstract class BaseAdapter implements IAAdapter {
  abstract name: string;
  abstract supports?: {
    text?: boolean;
    image?: boolean;
    video?: boolean;
    audio?: boolean;
    midi?: boolean;
  };

  protected timeout: number = parseInt(process.env.PROVIDER_TIMEOUT_MS || "8000");
  protected maxRetries: number = 2;
  protected retryDelay: number = 1000;

  abstract call(opts: {
    prompt: string;
    userId?: string;
    conversationId?: string;
    options?: any;
  }): Promise<ProviderResponse>;

  /**
   * Call with timeout wrapper
   */
  protected async callWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs?: number
  ): Promise<T> {
    const timeout = timeoutMs || this.timeout;
    
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)
      ),
    ]);
  }

  /**
   * Retry logic with exponential backoff
   */
  protected async retry<T>(
    fn: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await this.sleep(this.retryDelay * (this.maxRetries - retries + 1));
        return this.retry(fn, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Sleep helper
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Normalize response to standard format
   */
  protected normalizeResponse(
    data: any,
    type: ProviderResponse["type"] = "text"
  ): ProviderResponse {
    return {
      provider: this.name,
      type,
      text: data.text || data.content || data.response || "",
      files: data.files || [],
      sources: data.sources || [],
      raw: data,
      timestamp: new Date(),
    };
  }

  /**
   * Health check - override in subclasses
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Basic health check - try a simple call
      const result = await this.callWithTimeout(
        async () => this.call({ prompt: "test" }),
        5000
      );
      return !result.error;
    } catch {
      return false;
    }
  }

  /**
   * Cost estimate - override in subclasses
   */
  async costEstimate(opts: any): Promise<number> {
    // Default: free tier
    return 0;
  }

  /**
   * Sanitize PII from text
   */
  protected sanitizePII(text: string): string {
    // Basic PII sanitization
    let sanitized = text;
    
    // Email addresses
    sanitized = sanitized.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      "[EMAIL]"
    );
    
    // Phone numbers (simple pattern)
    sanitized = sanitized.replace(
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      "[PHONE]"
    );
    
    // Credit card numbers (simple pattern)
    sanitized = sanitized.replace(
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
      "[CARD]"
    );
    
    return sanitized;
  }
}
