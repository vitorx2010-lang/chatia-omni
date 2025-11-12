/**
 * Orchestrator Service
 * Orchestrates multiple AI providers in parallel and combines responses
 */

import {
  ProviderResponse,
  OrchestratorOptions,
  CombinedResponse,
  CombinerContext,
} from "@shared/adapter-types";
import { adapterManager } from "../adapters/adapter-manager";
import { invokeLLM } from "../_core/llm";

export class Orchestrator {
  private timeout: number;
  private maxProviders: number;

  constructor() {
    this.timeout = parseInt(process.env.PROVIDER_TIMEOUT_MS || "8000");
    this.maxProviders = parseInt(process.env.MAX_PROVIDERS || "5");
  }

  /**
   * Main orchestration method
   * Calls multiple providers in parallel and combines responses
   */
  async orchestrate(
    prompt: string,
    userId: string,
    options: OrchestratorOptions = {}
  ): Promise<CombinedResponse> {
    // 1. Resolve providers to use
    const providers = this.resolveProviders(options.providers);

    // 2. Call adapters in parallel with timeout
    const providerResponses = await this.callProvidersInParallel(
      providers,
      prompt,
      userId,
      options
    );

    // 3. Filter out errors and normalize
    const validResponses = providerResponses.filter(
      (response) => !response.error && response.text
    );

    if (validResponses.length === 0) {
      // No valid responses - return error
      return {
        combined: "Desculpe, não foi possível obter respostas dos provedores de IA no momento.",
        providerResponses,
        combinerMeta: {
          provider: "none",
          timestamp: new Date(),
          trace: [],
        },
      };
    }

    // 4. Build combiner context
    const combinerContext: CombinerContext = {
      userMessage: prompt,
      memoryContext: options.includeMemory ? await this.getMemoryContext(userId) : undefined,
      providerResponses: validResponses,
      language: "pt-BR",
    };

    // 5. Call combiner LLM
    const combined = await this.combineResponses(combinerContext);

    return {
      combined: combined.text,
      providerResponses,
      combinerMeta: {
        provider: "openai-combiner",
        timestamp: new Date(),
        trace: combined.trace,
      },
    };
  }

  /**
   * Resolve which providers to use
   */
  private resolveProviders(requestedProviders?: string[]): string[] {
    if (requestedProviders && requestedProviders.length > 0) {
      return requestedProviders.slice(0, this.maxProviders);
    }

    // Default: use all enabled text providers
    const textAdapters = adapterManager.getAdaptersByType("text");
    return textAdapters.slice(0, this.maxProviders).map((a) => a.name);
  }

  /**
   * Call providers in parallel with Promise.allSettled
   */
  private async callProvidersInParallel(
    providerNames: string[],
    prompt: string,
    userId: string,
    options: OrchestratorOptions
  ): Promise<ProviderResponse[]> {
    const timeout = options.timeout || this.timeout;

    const calls = providerNames.map(async (name) => {
      const adapter = adapterManager.getAdapter(name);
      if (!adapter) {
        return {
          provider: name,
          type: "text" as const,
          error: "Adapter not found",
          timestamp: new Date(),
        };
      }

      try {
        // Call with timeout
        const response = await Promise.race([
          adapter.call({ prompt, userId, options }),
          new Promise<ProviderResponse>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), timeout)
          ),
        ]);

        return response;
      } catch (error: any) {
        return {
          provider: name,
          type: "text" as const,
          error: error.message || "Unknown error",
          timestamp: new Date(),
        };
      }
    });

    const results = await Promise.allSettled(calls);

    return results.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          provider: "unknown",
          type: "text" as const,
          error: result.reason?.message || "Promise rejected",
          timestamp: new Date(),
        };
      }
    });
  }

  /**
   * Combine responses using Combiner LLM
   */
  private async combineResponses(context: CombinerContext): Promise<{
    text: string;
    trace: { fragment: string; providers: string[] }[];
  }> {
    const combinerPrompt = this.buildCombinerPrompt(context);

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Você é um consolidador de respostas de IA. Combine as respostas de múltiplos provedores em uma resposta única, concisa e útil.",
          },
          {
            role: "user",
            content: combinerPrompt,
          },
        ],
      });

      const combinedText = typeof response.choices?.[0]?.message?.content === 'string' 
        ? response.choices[0].message.content 
        : "";

      // Extract trace (simple implementation - could be improved)
      const trace = context.providerResponses.map((pr) => ({
        fragment: pr.text?.substring(0, 100) || "",
        providers: [pr.provider],
      }));

      return {
        text: combinedText,
        trace,
      };
    } catch (error) {
      // Fallback: just concatenate responses
      const fallbackText = context.providerResponses
        .map((pr) => `**${pr.provider}**: ${pr.text}`)
        .join("\n\n");

      return {
        text: fallbackText,
        trace: [],
      };
    }
  }

  /**
   * Build combiner prompt following the spec template
   */
  private buildCombinerPrompt(context: CombinerContext) {
    const responsesText = context.providerResponses
      .map(
        (pr) => `[PROVIDER: ${pr.provider}]\n${pr.text}\n---`
      )
      .join("\n\n");

    return `VOCÊ É UM CONSOLIDATOR LLM (RESPONDA EM PT-BR).
Tarefa: com base na pergunta do usuário e nas respostas das várias fontes abaixo (cada resposta prefixada com [PROVIDER]), faça:
1) Avalie a factualidade e a utilidade de cada resposta.
2) Extraia os melhores trechos (máx 2 por provider) e combine-os em UMA resposta final concisa e prática.
3) Cite, ao final, a seção "FONTES" com links/identificadores de provedor usados.
4) Se houver contradições, destaque-as e dê um veredito breve.
5) Se a informação parecer sensível ou incerta, indique claramente as limitações.

Pergunta do usuário:
"${context.userMessage}"

${context.memoryContext ? `Contexto de memória (se houver):\n"${context.memoryContext}"\n` : ""}

Respostas recebidas:
${responsesText}

Instruções: responda em PT-BR; seja direto; inclua seção "FONTES" e "TRACE" que mapeie trechos para providers.`;
  }

  /**
   * Get memory context for user (placeholder)
   */
  private async getMemoryContext(userId: string): Promise<string | undefined> {
    // TODO: Implement memory retrieval from vector DB
    return undefined;
  }
}

// Singleton instance
export const orchestrator = new Orchestrator();
