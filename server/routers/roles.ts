import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { roles } from "../../drizzle/schema-pg";
import { eq } from "drizzle-orm";

export const rolesRouter = router({
  // Get all roles
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const allRoles = await db.select().from(roles);
    return allRoles;
  }),

  // Get role by ID
  getById: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [role] = await db.select().from(roles).where(eq(roles.id, input.id));
      return role;
    }),

  // Create new role
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const result = await db.insert(roles).values({
        name: input.name,
        description: input.description,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  // Update role
  update: publicProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db
        .update(roles)
        .set(data)
        .where(eq(roles.id, id));
      return { success: true };
    }),

  // Delete role
  delete: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(roles).where(eq(roles.id, input.id));
      return { success: true };
    }),
});
