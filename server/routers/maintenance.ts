import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { maintenanceSchedules } from "../../drizzle/schema-pg";
import { eq } from "drizzle-orm";

export const maintenanceRouter = router({
  // Get all maintenance schedules
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const allSchedules = await db.select().from(maintenanceSchedules);
    return allSchedules;
  }),

  // Get maintenance schedule by ID
  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [schedule] = await db.select().from(maintenanceSchedules).where(eq(maintenanceSchedules.id, input.id));
      return schedule;
    }),

  // Create new maintenance schedule
  create: publicProcedure
    .input(
      z.object({
        assetId: z.number().int().positive(),
        maintenanceType: z.enum(["preventive", "corrective", "predictive"]),
        frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]),
        lastMaintenanceDate: z.date().optional(),
        nextMaintenanceDate: z.date(),
        assignedTo: z.number().int().positive().optional(),
        estimatedCost: z.string().optional(),
        actualCost: z.string().optional(),
        status: z.enum(["scheduled", "in_progress", "completed", "overdue", "cancelled"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(maintenanceSchedules).values({
        assetId: input.assetId,
        maintenanceType: input.maintenanceType,
        frequency: input.frequency,
        lastMaintenanceDate: input.lastMaintenanceDate,
        nextMaintenanceDate: input.nextMaintenanceDate,
        assignedTo: input.assignedTo,
        estimatedCost: input.estimatedCost,
        actualCost: input.actualCost,
        status: input.status || "scheduled",
        notes: input.notes,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  // Update maintenance schedule
  update: publicProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        maintenanceType: z.enum(["preventive", "corrective", "predictive"]).optional(),
        frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]).optional(),
        lastMaintenanceDate: z.date().optional(),
        nextMaintenanceDate: z.date().optional(),
        assignedTo: z.number().int().positive().optional(),
        estimatedCost: z.string().optional(),
        actualCost: z.string().optional(),
        status: z.enum(["scheduled", "in_progress", "completed", "overdue", "cancelled"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db
        .update(maintenanceSchedules)
        .set(data)
        .where(eq(maintenanceSchedules.id, id));
      return { success: true };
    }),

  // Delete maintenance schedule
  delete: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(maintenanceSchedules).where(eq(maintenanceSchedules.id, input.id));
      return { success: true };
    }),
});
