/**
 * Memory Router
 * Handles conversation memory management
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import {
  getConversation,
  updateConversation,
  getConversationMessages,
} from "../db-helpers";
import { invokeLLM } from "../_core/llm";

export const memoryRouter = router({
  /**
   * Enable memory for a conversation
   */
  enableMemory: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const conversation = await getConversation(input.conversationId);

      if (!conversation || conversation.userId !== ctx.user.id) {
        throw new Error("Conversation not found");
      }

      await updateConversation(input.conversationId, {
        memoryEnabled: 1,
      });

      return { success: true };
    }),

  /**
   * Disable memory for a conversation
   */
  disableMemory: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const conversation = await getConversation(input.conversationId);

      if (!conversation || conversation.userId !== ctx.user.id) {
        throw new Error("Conversation not found");
      }

      await updateConversation(input.conversationId, {
        memoryEnabled: 0,
        memorySummary: null,
      });

      return { success: true };
    }),

  /**
   * Get memory summary for a conversation
   */
  getMemory: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input, ctx }) => {
      const conversation = await getConversation(input.conversationId);

      if (!conversation || conversation.userId !== ctx.user.id) {
        throw new Error("Conversation not found");
      }

      return {
        enabled: conversation.memoryEnabled === 1,
        summary: conversation.memorySummary,
      };
    }),

  /**
   * Generate memory summary from conversation messages
   */
  generateSummary: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const conversation = await getConversation(input.conversationId);

      if (!conversation || conversation.userId !== ctx.user.id) {
        throw new Error("Conversation not found");
      }

      const messages = await getConversationMessages(input.conversationId);

      if (messages.length === 0) {
        return { summary: "" };
      }

      // Build conversation text
      const conversationText = messages
        .map(
          (m) =>
            `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.content}`
        )
        .join("\n\n");

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "Você é um assistente que cria resumos concisos de conversas. Resuma os pontos principais em no máximo 400 tokens.",
            },
            {
              role: "user",
              content: `Por favor, resuma esta conversa:\n\n${conversationText}`,
            },
          ],
        });

        const summary =
          typeof response.choices?.[0]?.message?.content === "string"
            ? response.choices[0].message.content
            : "";

        await updateConversation(input.conversationId, {
          memorySummary: summary,
        });

        return { summary };
      } catch (error) {
        console.error("Error generating summary:", error);
        return { summary: "" };
      }
    }),

  /**
   * Delete memory (clear summary)
   */
  deleteMemory: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const conversation = await getConversation(input.conversationId);

      if (!conversation || conversation.userId !== ctx.user.id) {
        throw new Error("Conversation not found");
      }

      await updateConversation(input.conversationId, {
        memorySummary: null,
        memoryEnabled: 0,
      });

      return { success: true };
    }),
});
