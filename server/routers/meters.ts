import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { meters } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const metersRouter = router({
  // Get all meters
  list: publicProcedure.query(async () => {
    const db = getDb();
    const allMeters = await db.select().from(meters);
    return allMeters;
  }),

  // Get role by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [role] = await db.select().from(meters).where(eq(meters.id, input.id));
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
      const [newRole] = await db.insert(meters).values({
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
        .update(meters)
        .set({
          name: input.name,
          description: input.description,
          permissions: input.permissions ? JSON.stringify(input.permissions) : undefined,
        })
        .where(eq(meters.id, input.id))
        .returning();
      return updatedRole;
    }),

  // Delete role
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(meters).where(eq(meters.id, input.id));
      return { success: true };
    }),
});
