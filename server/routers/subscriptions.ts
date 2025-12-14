import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { subscriptions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const subscriptionsRouter = router({
  // Get all subscriptions
  list: publicProcedure.query(async () => {
    const db = getDb();
    const allSubscriptions = await db.select().from(subscriptions);
    return allSubscriptions;
  }),

  // Get role by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [role] = await db.select().from(subscriptions).where(eq(subscriptions.id, input.id));
      return role;
    }),

  // Create new role
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        permissions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [newRole] = await db.insert(subscriptions).values({
        name: input.name,
        description: input.description,
        permissions: input.permissions ? JSON.stringify(input.permissions) : null,
      }).returning();
      return newRole;
    }),

  // Update role
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        permissions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [updatedRole] = await db
        .update(subscriptions)
        .set({
          name: input.name,
          description: input.description,
          permissions: input.permissions ? JSON.stringify(input.permissions) : undefined,
        })
        .where(eq(subscriptions.id, input.id))
        .returning();
      return updatedRole;
    }),

  // Delete role
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(subscriptions).where(eq(subscriptions.id, input.id));
      return { success: true };
    }),
});
