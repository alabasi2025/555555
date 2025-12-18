import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { subscriptions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const subscriptionsRouter = router({
  // Get all subscriptions
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const allSubscriptions = await db.select().from(subscriptions);
    return allSubscriptions;
  }),

  // Get subscription by ID
  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, input.id));
      return subscription;
    }),

  // Create new subscription
  create: publicProcedure
    .input(
      z.object({
        customerId: z.number().int().positive(),
        planName: z.string(),
        startDate: z.date(),
        endDate: z.date().optional(),
        billingCycle: z.enum(["monthly", "quarterly", "yearly"]),
        amount: z.string(),
        status: z.enum(["active", "suspended", "cancelled", "expired"]).optional(),
        autoRenew: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(subscriptions).values({
        customerId: input.customerId,
        planName: input.planName,
        startDate: input.startDate,
        endDate: input.endDate,
        billingCycle: input.billingCycle,
        amount: input.amount,
        status: input.status || "active",
        autoRenew: input.autoRenew ?? true,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  // Update subscription
  update: publicProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        planName: z.string().optional(),
        endDate: z.date().optional(),
        billingCycle: z.enum(["monthly", "quarterly", "yearly"]).optional(),
        amount: z.string().optional(),
        status: z.enum(["active", "suspended", "cancelled", "expired"]).optional(),
        autoRenew: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db
        .update(subscriptions)
        .set(data)
        .where(eq(subscriptions.id, id));
      return { success: true };
    }),

  // Delete subscription
  delete: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(subscriptions).where(eq(subscriptions.id, input.id));
      return { success: true };
    }),
});
