import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { workOrders } from "../../drizzle/schema-pg";
import { eq } from "drizzle-orm";

export const workOrdersRouter = router({
  // Get all work orders
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const allWorkOrders = await db.select().from(workOrders);
    return allWorkOrders;
  }),

  // Get work order by ID
  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [workOrder] = await db.select().from(workOrders).where(eq(workOrders.id, input.id));
      return workOrder;
    }),

  // Create new work order
  create: publicProcedure
    .input(
      z.object({
        orderNumber: z.string(),
        customerId: z.number().int().positive().optional(),
        meterId: z.number().int().positive().optional(),
        orderType: z.enum(["installation", "maintenance", "repair", "reading", "disconnection"]),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        assignedTo: z.number().int().positive().optional(),
        description: z.string().optional(),
        scheduledDate: z.date().optional(),
        status: z.enum(["pending", "assigned", "in_progress", "completed", "cancelled"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(workOrders).values({
        orderNumber: input.orderNumber,
        customerId: input.customerId,
        meterId: input.meterId,
        orderType: input.orderType,
        priority: input.priority || "medium",
        assignedTo: input.assignedTo,
        description: input.description,
        scheduledDate: input.scheduledDate,
        status: input.status || "pending",
        notes: input.notes,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  // Update work order
  update: publicProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        orderNumber: z.string().optional(),
        customerId: z.number().int().positive().optional(),
        meterId: z.number().int().positive().optional(),
        orderType: z.enum(["installation", "maintenance", "repair", "reading", "disconnection"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        assignedTo: z.number().int().positive().optional(),
        description: z.string().optional(),
        scheduledDate: z.date().optional(),
        completedDate: z.date().optional(),
        status: z.enum(["pending", "assigned", "in_progress", "completed", "cancelled"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db
        .update(workOrders)
        .set(data)
        .where(eq(workOrders.id, id));
      return { success: true };
    }),

  // Delete work order
  delete: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(workOrders).where(eq(workOrders.id, input.id));
      return { success: true };
    }),
});
