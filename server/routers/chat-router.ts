/**
 * Chat Router
 * Handles chat orchestration and message management
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { orchestrator } from "../services/orchestrator";
import {
  createConversation,
  getConversation,
  getUserConversations,
  createMessage,
  getConversationMessages,
  deleteConversation,
} from "../db-helpers";

export const chatRouter = router({
  /**
   * Main chat endpoint - orchestrates multiple providers
   */
  chat: protectedProcedure
    .input(
      z.object({
        conversationId: z.number().optional(),
        message: z.string(),
        options: z
          .object({
            providers: z.array(z.string()).optional(),
            includeMemory: z.boolean().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      // Create conversation if not exists
      let conversationId = input.conversationId;
      if (!conversationId) {
        await createConversation({
          userId,
          title: input.message.substring(0, 100),
          memoryEnabled: 0,
        });
        
        // Get the created conversation
        const conversations = await getUserConversations(userId);
        conversationId = conversations[0]?.id;
      }

      // Save user message
      await createMessage({
        conversationId: conversationId!,
        userId,
        role: "user",
        content: input.message,
      });

      // Orchestrate providers
      const result = await orchestrator.orchestrate(
        input.message,
        String(userId),
        input.options || {}
      );

      // Save assistant response
      await createMessage({
        conversationId: conversationId!,
        userId: null,
        role: "assistant",
        content: result.combined,
        providerResponses: JSON.stringify(result.providerResponses),
        combinerMeta: JSON.stringify(result.combinerMeta),
      });

      return {
        conversationId,
        combined: result.combined,
        providerResponses: result.providerResponses,
        combinerMeta: result.combinerMeta,
      };
    }),

  /**
   * Get conversation by ID
   */
  getConversation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const conversation = await getConversation(input.id);
      
      if (!conversation || conversation.userId !== ctx.user.id) {
        throw new Error("Conversation not found");
      }

      const messages = await getConversationMessages(input.id);

      return {
        conversation,
        messages: messages.map((m) => ({
          ...m,
          providerResponses: m.providerResponses
            ? JSON.parse(m.providerResponses)
            : null,
          combinerMeta: m.combinerMeta ? JSON.parse(m.combinerMeta) : null,
        })),
      };
    }),

  /**
   * List user conversations
   */
  listConversations: protectedProcedure.query(async ({ ctx }) => {
    return getUserConversations(ctx.user.id);
  }),

  /**
   * Delete conversation
   */
  deleteConversation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const conversation = await getConversation(input.id);
      
      if (!conversation || conversation.userId !== ctx.user.id) {
        throw new Error("Conversation not found");
      }

      await deleteConversation(input.id);
      
      return { success: true };
    }),
});
