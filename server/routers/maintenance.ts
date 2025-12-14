import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { maintenanceSchedules } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const maintenanceRouter = router({
  // Get all maintenance schedules
  list: publicProcedure.query(async () => {
    const db = getDb();
    const allSchedules = await db.select().from(maintenanceSchedules);
    return allSchedules;
  }),

  // Get maintenance schedule by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [schedule] = await db.select().from(maintenanceSchedules).where(eq(maintenanceSchedules.id, input.id));
      return schedule;
    }),

  // Create new maintenance schedule
  create: publicProcedure
    .input(
      z.object({
        assetId: z.string(),
        type: z.string(),
        description: z.string().optional(),
        scheduledDate: z.string(),
        status: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [newSchedule] = await db.insert(maintenanceSchedules).values({
        assetId: input.assetId,
        type: input.type,
        description: input.description,
        scheduledDate: input.scheduledDate,
        status: input.status,
      }).returning();
      return newSchedule;
    }),

  // Update maintenance schedule
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.string().optional(),
        completedDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [updatedSchedule] = await db
        .update(maintenanceSchedules)
        .set({
          status: input.status,
          completedDate: input.completedDate,
        })
        .where(eq(maintenanceSchedules.id, input.id))
        .returning();
      return updatedSchedule;
    }),

  // Delete maintenance schedule
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(maintenanceSchedules).where(eq(maintenanceSchedules.id, input.id));
      return { success: true };
    }),
});
