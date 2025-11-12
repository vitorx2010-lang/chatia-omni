/**
 * Files Router
 * Handles file uploads and RAG
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { createFile, getFile, getUserFiles, deleteFile } from "../db-helpers";
import { storagePut, storageGet } from "../storage";

export const filesRouter = router({
  /**
   * Upload a file
   * Note: In a real implementation, the file would be uploaded from the client
   * For now, we'll accept a file URL and metadata
   */
  uploadFile: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        fileUrl: z.string(),
        mimeType: z.string(),
        conversationId: z.number().optional(),
        extractedText: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const fileKey = `${ctx.user.id}-files/${Date.now()}-${input.filename}`;

      try {
        // Store metadata in database
        await createFile({
          userId: ctx.user.id,
          conversationId: input.conversationId,
          filename: input.filename,
          fileKey,
          url: input.fileUrl,
          mimeType: input.mimeType,
          extractedText: input.extractedText,
          indexed: input.extractedText ? 1 : 0,
        });

        return {
          success: true,
          fileKey,
          message: "Arquivo enviado com sucesso",
        };
      } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error("Erro ao fazer upload do arquivo");
      }
    }),

  /**
   * Get file by ID
   */
  getFile: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const file = await getFile(input.id);

      if (!file || file.userId !== ctx.user.id) {
        throw new Error("Arquivo não encontrado");
      }

      // Get signed URL if needed
      const signedUrl = await storageGet(file.fileKey);

      return {
        ...file,
        signedUrl: signedUrl.url,
      };
    }),

  /**
   * List user files
   */
  listFiles: protectedProcedure.query(async ({ ctx }) => {
    return getUserFiles(ctx.user.id);
  }),

  /**
   * Delete file
   */
  deleteFile: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const file = await getFile(input.id);

      if (!file || file.userId !== ctx.user.id) {
        throw new Error("Arquivo não encontrado");
      }

      await deleteFile(input.id);

      return { success: true };
    }),

  /**
   * Search files by text content (RAG)
   */
  searchFiles: protectedProcedure
    .input(z.object({ query: z.string(), conversationId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const files = await getUserFiles(ctx.user.id);

      // Simple text search in extracted content
      const results = files
        .filter((file) => {
          if (input.conversationId && file.conversationId !== input.conversationId) {
            return false;
          }
          if (!file.extractedText) return false;
          return file.extractedText
            .toLowerCase()
            .includes(input.query.toLowerCase());
        })
        .map((file) => ({
          ...file,
          relevance: file.extractedText
            ? (file.extractedText.match(
                new RegExp(input.query, "gi")
              ) || []).length
            : 0,
        }))
        .sort((a, b) => b.relevance - a.relevance);

      return results;
    }),
});
