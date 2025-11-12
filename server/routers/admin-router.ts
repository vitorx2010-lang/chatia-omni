/**
 * Admin Router
 * Handles provider management and system administration
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { adapterManager } from "../adapters/adapter-manager";
import { getAuditLogs } from "../db-helpers";

export const adminRouter = router({
  /**
   * Get all providers status
   */
  getProviders: protectedProcedure.query(async () => {
    const providers = adapterManager.getAdapterInfo();
    const healthStatus = await adapterManager.healthCheckAll();

    return providers.map((p) => ({
      ...p,
      healthy: healthStatus.get(p.name) || false,
    }));
  }),

  /**
   * Enable provider
   */
  enableProvider: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      const success = adapterManager.enableAdapter(input.name);
      return { success };
    }),

  /**
   * Disable provider
   */
  disableProvider: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      const success = adapterManager.disableAdapter(input.name);
      return { success };
    }),

  /**
   * Get audit logs
   */
  getLogs: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      return getAuditLogs(input.limit || 100);
    }),
});
